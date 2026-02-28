require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const rateLimit = require('express-rate-limit');
const { body, query, validationResult } = require('express-validator');
const helmet = require('helmet');
const nodemailer = require('nodemailer'); // used for sending reset emails
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 3000;

// JWT secret must be provided in production
if (!process.env.JWT_SECRET) {
    console.error('[FATAL] JWT_SECRET environment variable is not set.');
    process.exit(1);
}
const JWT_SECRET = process.env.JWT_SECRET;

// Database setup
// allow overriding database path via environment (for testing or other backups)
const dbPath = process.env.DB_PATH
    ? path.resolve(process.env.DB_PATH)
    : path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// Helper for Promisify SQLite
const dbRun = (sql, params = []) => new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve(this);
    });
});

const dbGet = (sql, params = []) => new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
    });
});

const dbAll = (sql, params = []) => new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
    });
});

// Initialize database tables (and perform simple migrations)
async function initDb() {
    await dbRun(`CREATE TABLE IF NOT EXISTS utilisateurs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        email TEXT UNIQUE,
        password TEXT,
        role TEXT,
        fullName TEXT,
        avatar TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    await dbRun(`CREATE TABLE IF NOT EXISTS categories_quiz (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE
    )`);

    await dbRun(`CREATE TABLE IF NOT EXISTS questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        difficulty INTEGER,
        phase INTEGER,
        type TEXT DEFAULT 'mcq',
        question TEXT,
        options TEXT,
        correct INTEGER,
        categoryId INTEGER,
        explanation TEXT
    )`);

    await dbRun(`CREATE TABLE IF NOT EXISTS resultats_quiz (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER,
        score INTEGER,
        correctAnswers INTEGER,
        totalQuestions INTEGER,
        difficulty INTEGER,
        phase INTEGER,
        categoryId INTEGER,
        temps_passe INTEGER,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    // if the column didn't exist previously, attempt to add it safely
    try {
        await dbRun('ALTER TABLE resultats_quiz ADD COLUMN categoryId INTEGER');
    } catch (e) {
        // ignore error if column already exists
        if (!/duplicate column name/.test(e.message)) console.warn(e);
    }

    await dbRun(`CREATE TABLE IF NOT EXISTS parametres (
        key TEXT PRIMARY KEY,
        value TEXT
    )`);

    await dbRun(`CREATE TABLE IF NOT EXISTS journaux (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT,
        message TEXT,
        user TEXT,
        date DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    await dbRun(`CREATE TABLE IF NOT EXISTS password_resets (
        email TEXT PRIMARY KEY,
        code TEXT,
        expiresAt DATETIME
    )`);

    const userCount = await dbGet('SELECT COUNT(*) as count FROM utilisateurs');
    if (userCount.count === 0) {
        // create an initial superadmin; password should come from env or be generated
        const initialPassword = process.env.INIT_ADMIN_PWD || Math.random().toString(36).slice(-12);
        const salt = bcrypt.genSaltSync(12);
        const passHash = bcrypt.hashSync(initialPassword, salt);
        await dbRun(
            'INSERT INTO utilisateurs (username, email, password, role, fullName) VALUES (?, ?, ?, ?, ?)',
            ['superadmin1', 'superadmin1@barakabrain.com', passHash, 'Superadmin1', 'Super administrateur']
        );
        console.log('[SECURITY] Compte superadmin initial créé. Changez le mot de passe !');
        console.log(`Utilisateur: superadmin1 motdepasse: ${initialPassword}`);
    }
}

// initialize database (returns a promise)
const initDbPromise = initDb();

// setup CORS with strict origin whitelist
const whitelist = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map(u => u.trim()).filter(u => u.length)
    : [];
const corsOptions = {
    origin: (origin, callback) => {
        // allow requests with no origin (e.g. mobile apps, curl)
        if (!origin) return callback(null, true);
        if (whitelist.length === 0) {
            // no whitelist defined; reject until explicitly configured
            return callback(new Error('CORS origin not allowed by configuration'));
        }
        if (whitelist.indexOf(origin) !== -1) {
            return callback(null, true);
        }
        callback(new Error('CORS origin not allowed'));
    }
};
app.use(cors(corsOptions));

// add robust security headers
app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ['\'self\''],
                scriptSrc: ['\'self\'', 'https://fonts.googleapis.com'],
                styleSrc: ['\'self\'', 'https://fonts.googleapis.com'],
                imgSrc: ['\'self\'', 'data:'],
                fontSrc: ['\'self\'', 'https://fonts.googleapis.com', 'https://fonts.gstatic.com'],
                connectSrc: ['\'self\''],
                objectSrc: ['\'none\''],
                upgradeInsecureRequests: []
            }
        },
        hsts: { maxAge: 31536000, includeSubDomains: true },
        referrerPolicy: { policy: 'no-referrer' }
    })
);

// rate-limit sensitive endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: 'Trop de tentatives, réessayez dans 15 minutes'
});
app.use('/api/auth/', authLimiter);

// request logging
app.use(morgan('combined'));
app.use(express.json({ limit: '5mb' }));

// Middleware Auth
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

const authorize = (roles = []) => (req, res, next) => {
    if (!roles.includes(req.user.role)) return res.status(403).json({ message: 'Accès refusé' });
    next();
};

// --- ROUTES AUTH ---

app.post(
    '/api/auth/register',
    [
        body('username').isLength({ min: 3 }).trim().escape(),
        body('email').isEmail().normalizeEmail(),
        body('password').isStrongPassword(),
        body('fullName').notEmpty().trim().escape()
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
        const { username, email, password, fullName } = req.body;
        const hashedPassword = bcrypt.hashSync(password, 12);
        try {
            await dbRun(
                'INSERT INTO utilisateurs (username, email, password, role, fullName) VALUES (?, ?, ?, ?, ?)',
                [username, email, hashedPassword, 'User', fullName]
            );
            res.status(201).json({ message: 'Compte créé' });
        } catch (err) {
            res.status(400).json({ message: 'Identifiant ou email déjà utilisé' });
        }
    }
);

app.post(
    '/api/auth/login',
    [body('username').notEmpty(), body('password').notEmpty()],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
        const { username, password } = req.body;
        const user = await dbGet(
            'SELECT * FROM utilisateurs WHERE LOWER(username) = ? OR LOWER(email) = ?',
            [username.toLowerCase(), username.toLowerCase()]
        );
        if (!user || !bcrypt.compareSync(password, user.password))
            return res.status(401).json({ message: 'Identifiants invalides' });
        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '6h' });
        res.json({ token, user: { id: user.id, username: user.username, role: user.role, fullName: user.fullName } });
    }
);

app.post(
    '/api/auth/change-password',
    authenticateToken,
    [body('currentPassword').notEmpty(), body('newPassword').isStrongPassword()],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
        const { currentPassword, newPassword } = req.body;
        try {
            const user = await dbGet('SELECT password FROM utilisateurs WHERE id = ?', [req.user.id]);
            if (!user || !bcrypt.compareSync(currentPassword, user.password))
                return res.status(401).json({ message: 'Mot de passe actuel incorrect' });
            const hashedPassword = bcrypt.hashSync(newPassword, 12);
            await dbRun('UPDATE utilisateurs SET password = ? WHERE id = ?', [hashedPassword, req.user.id]);
            res.json({ message: 'Mot de passe mis à jour' });
        } catch (err) {
            res.status(500).json({ message: 'Erreur serveur' });
        }
    }
);

app.post(
    '/api/auth/forgot-password',
    [body('email').isEmail().normalizeEmail()],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
        const { email } = req.body;
        const user = await dbGet('SELECT id FROM utilisateurs WHERE LOWER(email) = ?', [email.toLowerCase()]);
        if (!user) return res.status(404).json({ message: 'Email non trouvé' });
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 15 * 60000).toISOString();
        await dbRun(
            'INSERT OR REPLACE INTO password_resets (email, code, expiresAt) VALUES (?, ?, ?)',
            [email.toLowerCase(), code, expiresAt]
        );
        // send email using nodemailer if configuration provided
        if (process.env.SMTP_HOST) {
            try {
                const transporter = nodemailer.createTransport({
                    host: process.env.SMTP_HOST,
                    port: process.env.SMTP_PORT || 587,
                    secure: process.env.SMTP_SECURE === 'true',
                    auth: {
                        user: process.env.SMTP_USER,
                        pass: process.env.SMTP_PASS
                    }
                });
                await transporter.sendMail({
                    from: process.env.SMTP_FROM || 'no-reply@barakabrain.com',
                    to: email,
                    subject: 'Réinitialisation de mot de passe',
                    text: `Votre code de réinitialisation est : ${code}`
                });
            } catch (mailErr) {
                console.warn('Impossible d envoyer l email de reset', mailErr);
            }
        } else {
            console.log(`\n[SECURITY] CODE POUR ${email} : ${code}\n`);
        }
        res.json({ message: 'Code envoyé (vérifiez votre boîte mail)' });
    }
);

app.post(
    '/api/auth/reset-password',
    [
        body('email').isEmail().normalizeEmail(),
        body('code').isLength({ min: 6, max: 6 }),
        body('newPassword').isStrongPassword()
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
        const { email, code, newPassword } = req.body;
        const reset = await dbGet(
            'SELECT * FROM password_resets WHERE email = ? AND code = ?',
            [email.toLowerCase(), code]
        );
        if (!reset || new Date(reset.expiresAt) < new Date())
            return res.status(400).json({ message: 'Code invalide ou expiré' });
        const hashedPassword = bcrypt.hashSync(newPassword, 12);
        await dbRun('UPDATE utilisateurs SET password = ? WHERE email = ?', [hashedPassword, email.toLowerCase()]);
        await dbRun('DELETE FROM password_resets WHERE email = ?', [email.toLowerCase()]);
        res.json({ message: 'Mot de passe réinitialisé' });
    }
);

// --- ROUTES USER ---

app.get('/api/user/profile', authenticateToken, async (req, res) => {
    const user = await dbGet('SELECT id, username, email, role, fullName, avatar FROM utilisateurs WHERE id = ?', [req.user.id]);
    res.json(user);
});

app.put('/api/user/profile', authenticateToken, async (req, res) => {
    const { fullName, avatar } = req.body;
    await dbRun('UPDATE utilisateurs SET fullName = ?, avatar = ? WHERE id = ?', [fullName, avatar, req.user.id]);
    res.json({ message: 'Profil mis à jour' });
});

app.get('/api/user/stats', authenticateToken, async (req, res) => {
    try {
        const stats = await dbGet(`
            SELECT 
                COUNT(*) as quizCount, 
                SUM(score) as totalScore, 
                AVG(CAST(correctAnswers AS FLOAT) / totalQuestions * 100) as accuracy 
            FROM resultats_quiz 
            WHERE userId = ?
        `, [req.user.id]);

        // Get rank
        const rankData = await dbGet(`
            SELECT rank FROM (
                SELECT userId, RANK() OVER (ORDER BY SUM(score) DESC) as rank
                FROM resultats_quiz
                GROUP BY userId
            ) WHERE userId = ?
        `, [req.user.id]);

        // Get recent history (for chart)
        const history = await dbAll(`
            SELECT date(createdAt) as date, SUM(score) as score, AVG(CAST(correctAnswers AS FLOAT) / totalQuestions * 100) as dailyAccuracy
            FROM resultats_quiz
            WHERE userId = ? AND createdAt > date('now', '-7 days')
            GROUP BY date(createdAt)
            ORDER BY date ASC
        `, [req.user.id]);

        // Get last 2 individual results
        const recentQuizzes = await dbAll(`
            SELECT r.*, c.name as categoryName
            FROM resultats_quiz r
            -- We don't have categoryId in resultats_quiz yet, so we'll return a placeholder or mock join for now
            -- to keep it stable until we decide to migrate schema.
            LEFT JOIN questions q ON r.totalQuestions > 0 LIMIT 2
        `, [req.user.id]);

        res.json({
            ...stats,
            accuracy: Math.round(stats.accuracy || 0),
            rank: rankData ? rankData.rank : '-',
            history,
            recentQuizzes
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- ROUTES QUIZ ---

app.get('/api/quiz/sections', authenticateToken, (req, res) => {
    const sections = [
        { id: 1, title: 'Débutant', icon: 'scuba_diving', color: '#10b981', desc: 'Les bases fondamentales pour tout chercheur de vérité.' },
        { id: 2, title: 'Avancé', icon: 'military_tech', color: '#3b82f6', desc: 'Approfondissez vos connaissances avec des preuves scripturaires.' },
        { id: 3, title: 'Expert', icon: 'workspace_premium', color: '#d4af37', desc: 'Maîtrise complète avec analyses académiques et preuves d\'élite.' }
    ];
    res.json(sections);
});

app.get('/api/quiz/categories', authenticateToken, async (req, res) => {
    try {
        const categories = await dbAll('SELECT * FROM categories_quiz');
        res.json(categories);
    } catch (err) {
        res.status(500).json({ message: 'Erreur lors du chargement des catégories' });
    }
});

app.get('/api/quiz/phases', authenticateToken, async (req, res) => {
    const phases = [
        { id: 1, title: 'Phase 1', desc: 'Fondations et Concepts Clés', duration: 180, unlocked: true },
        { id: 2, title: 'Phase 2', desc: 'Applications et Contextes', duration: 180, unlocked: true },
        { id: 3, title: 'Phase 3', desc: 'Analyses et Preuves', duration: 180, unlocked: true },
        { id: 4, title: 'Phase 4', desc: 'Approfondissement Spécialisé', duration: 180, unlocked: true },
        { id: 5, title: 'Phase 5', desc: 'Maîtrise et Synthèse Final', duration: 180, unlocked: true }
    ];
    res.json(phases);
});

app.get(
    '/api/quiz/questions',
    authenticateToken,
    [
        query('difficulty').isInt({ min: 1, max: 5 }).optional(),
        query('phase').isInt({ min: 1, max: 5 }).optional(),
        query('categoryId').isInt().optional(),
        query('category').trim().escape().optional()
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
        let { categoryId, difficulty, phase, category } = req.query;
        try {
            if (category && !categoryId) {
                const cat = await dbGet('SELECT id FROM categories_quiz WHERE name LIKE ?', [`%${category}%`]);
                if (cat) categoryId = cat.id;
            }
            const questions = await dbAll(
                'SELECT * FROM questions WHERE categoryId = ? AND difficulty = ? AND phase = ?',
                [categoryId, difficulty, phase]
            );
            res.json(questions.map(q => ({ ...q, options: JSON.parse(q.options) })));
        } catch (err) {
            res.status(500).json({ message: 'Erreur lors du chargement des questions' });
        }
    }
);

app.get('/api/quiz/leaderboard', async (req, res) => {
    try {
        const topUsers = await dbAll(`
            SELECT u.fullName, SUM(r.score) as score, u.username
            FROM utilisateurs u
            JOIN resultats_quiz r ON u.id = r.userId
            GROUP BY u.id
            ORDER BY score DESC
            LIMIT 50
        `);
        res.json(topUsers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post(
    '/api/quiz/results',
    authenticateToken,
    [
        body('score').isInt({ min: 0 }),
        body('correctAnswers').isInt({ min: 0 }),
        body('totalQuestions').isInt({ min: 1 }),
        body('difficulty').isInt({ min: 1, max: 5 }),
        body('phase').isInt({ min: 1, max: 5 }),
        body('categoryId').isInt().optional(),
        body('temps_passe').isInt({ min: 0 }).optional()
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
        const { score, correctAnswers, totalQuestions, difficulty, phase, categoryId, temps_passe } = req.body;
        await dbRun(
            'INSERT INTO resultats_quiz (userId, score, correctAnswers, totalQuestions, difficulty, phase, categoryId, temps_passe) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [req.user.id, score, correctAnswers, totalQuestions, difficulty, phase, categoryId || null, temps_passe]
        );
        res.status(201).json({ message: 'Résultat enregistré' });
    }
);

// --- ROUTES ADMIN ---

// Compatibility aliases and utility routes for front-end
app.post(
    '/api/quiz/submit',
    authenticateToken,
    [
        body('score').isInt({ min: 0 }),
        body('correctAnswers').isInt({ min: 0 }),
        body('totalQuestions').isInt({ min: 1 }),
        body('difficulty').isInt({ min: 1, max: 5 }),
        body('phase').isInt({ min: 1, max: 5 }),
        body('categoryId').isInt().optional(),
        body('temps_passe').isInt({ min: 0 }).optional()
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
        // legacy name used by static frontend; simply forward to /results
        const { score, correctAnswers, totalQuestions, difficulty, phase, categoryId, temps_passe } = req.body;
        await dbRun(
            'INSERT INTO resultats_quiz (userId, score, correctAnswers, totalQuestions, difficulty, phase, categoryId, temps_passe) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [req.user.id, score, correctAnswers, totalQuestions, difficulty, phase, categoryId || null, temps_passe]
        );
        res.status(201).json({ message: 'Résultat enregistré (legacy)' });
    }
);

// expose same data under a simpler public stats route
app.get('/api/stats/public', async (req, res) => {
    try {
        const totalUsers = await dbGet('SELECT COUNT(*) as count FROM utilisateurs');
        const totalQuizzes = await dbGet('SELECT COUNT(*) as count FROM resultats_quiz');
        const avgAccuracy = await dbGet('SELECT AVG(CAST(correctAnswers AS FLOAT)/totalQuestions*100) as avg FROM resultats_quiz');
        // cheatRate is hardcoded for now since we don't track cheating spots
        res.json({
            totalUsers: totalUsers.count,
            totalQuizzes: totalQuizzes.count,
            avgAccuracy: Math.round(avgAccuracy.avg || 0),
            cheatRate: '0%'
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// admin helpers used by frontend; the 'utilisateurs' path is the canonical one
app.get('/api/admin/users', authenticateToken, authorize(['Admin', 'Superadmin1']), async (req, res) => {
    const users = await dbAll('SELECT id, username, email, role, fullName, createdAt FROM utilisateurs ORDER BY createdAt DESC');
    res.json(users);
});

app.post(
    '/api/admin/users',
    authenticateToken,
    authorize(['Admin', 'Superadmin1']),
    [
        body('username').isLength({ min: 3 }).trim().escape(),
        body('email').isEmail().normalizeEmail(),
        body('fullName').optional().trim().escape(),
        body('role').optional().isIn(['User', 'Admin', 'Superadmin1', 'Superadmin'])
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
        const { username, email, fullName, role } = req.body;
        const hashedPassword = bcrypt.hashSync('ChangeMe123!', 12);
        try {
            await dbRun(
                'INSERT INTO utilisateurs (username, email, password, role, fullName) VALUES (?, ?, ?, ?, ?)',
                [username, email, hashedPassword, role || 'User', fullName || '']
            );
            res.status(201).json({ message: 'Utilisateur créé' });
        } catch (err) {
            res.status(400).json({ message: 'Erreur: identifiant ou email déjà utilisé' });
        }
    }
);

// categories admin management
app.get('/api/admin/categories', authenticateToken, authorize(['Admin', 'Superadmin1']), async (req, res) => {
    const cats = await dbAll('SELECT * FROM categories_quiz');
    res.json(cats);
});

app.post(
    '/api/admin/categories',
    authenticateToken,
    authorize(['Admin', 'Superadmin1']),
    [body('name').notEmpty().trim().escape()],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
        const { name } = req.body;
        try {
            await dbRun('INSERT INTO categories_quiz (name) VALUES (?)', [name]);
            res.status(201).json({ message: 'Catégorie ajoutée' });
        } catch (err) {
            res.status(400).json({ message: 'Erreur lors de l\'ajout de la catégorie' });
        }
    }
);

// simplified stats route used by frontend
app.get('/api/admin/stats', authenticateToken, authorize(['Admin', 'Superadmin1']), async (req, res) => {
    try {
        const totalU = await dbGet('SELECT COUNT(*) as count FROM utilisateurs');
        const adminsCount = await dbGet('SELECT COUNT(*) as count FROM utilisateurs WHERE role IN (\'Admin\',\'Superadmin1\',\'Superadmin\')');
        const incidentsCount = await dbGet('SELECT COUNT(*) as count FROM journaux WHERE type = ?', ['incident']);
        // activeSession is dummy for now
        res.json({
            totalUsers: totalU.count,
            adminsCount: adminsCount.count,
            incidentsCount: incidentsCount.count,
            activeSession: '#04'
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// system reset route used by frontend
app.post('/api/admin/system/reset-data', authenticateToken, authorize(['Admin', 'Superadmin1']), async (req, res) => {
    try {
        // keep current user
        await dbRun('DELETE FROM utilisateurs WHERE id != ?', [req.user.id]);
        await dbRun('DELETE FROM resultats_quiz');
        await dbRun('DELETE FROM journaux');
        res.json({ message: 'Données système réinitialisées' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// continue with existing admin routes

app.get('/api/admin/logs', authenticateToken, authorize(['Admin', 'Superadmin1']), async (req, res) => {
    try {
        const userLogs = await dbAll(`
            SELECT fullName as user, 'Nouvelle inscription' as action, createdAt as time, 'Nouveau' as status
            FROM utilisateurs 
            ORDER BY createdAt DESC LIMIT 10
        `);
        const quizLogs = await dbAll(`
            SELECT u.fullName as user, 'Quiz complété' as action, r.createdAt as time, 'Succès' as status
            FROM resultats_quiz r
            JOIN utilisateurs u ON r.userId = u.id
            ORDER BY r.createdAt DESC LIMIT 10
        `);
        const unified = [...userLogs, ...quizLogs].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 15);
        res.json(unified);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/admin/utilisateurs', authenticateToken, authorize(['Admin', 'Superadmin1']), async (req, res) => {
    const users = await dbAll('SELECT id, username, email, role, fullName, createdAt FROM utilisateurs ORDER BY createdAt DESC');
    res.json(users);
});

app.get('/api/admin/questions', authenticateToken, authorize(['Admin', 'Superadmin1']), async (req, res) => {
    const questions = await dbAll('SELECT q.*, c.name as categoryName FROM questions q LEFT JOIN categories_quiz c ON q.categoryId = c.id');
    res.json(questions.map(q => ({ ...q, options: JSON.parse(q.options) })));
});

app.post(
    '/api/admin/questions',
    authenticateToken,
    authorize(['Admin', 'Superadmin1']),
    [
        body('question').notEmpty().trim().escape(),
        body('options').isArray({ min: 2 }),
        body('correct').isInt({ min: 0 }),
        body('difficulty').isInt({ min: 1, max: 5 }),
        body('phase').isInt({ min: 1, max: 5 }),
        body('categoryId').isInt().optional(),
        body('explanation').optional().trim().escape()
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
        const { question, options, correct, difficulty, phase, categoryId, explanation } = req.body;
        await dbRun(
            'INSERT INTO questions (question, options, correct, difficulty, phase, categoryId, explanation) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [question, JSON.stringify(options), correct, difficulty, phase, categoryId, explanation]
        );
        res.status(201).json({ message: 'Question ajoutée' });
    }
);

app.patch(
    '/api/admin/questions/:id',
    authenticateToken,
    authorize(['Admin', 'Superadmin1']),
    [
        body('question').optional().trim().escape(),
        body('options').optional().isArray({ min: 2 }),
        body('correct').optional().isInt({ min: 0 }),
        body('difficulty').optional().isInt({ min: 1, max: 5 }),
        body('phase').optional().isInt({ min: 1, max: 5 }),
        body('categoryId').optional().isInt(),
        body('explanation').optional().trim().escape()
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
        const { question, options, correct, difficulty, phase, categoryId, explanation } = req.body;
        await dbRun(
            'UPDATE questions SET question=?, options=?, correct=?, difficulty=?, phase=?, categoryId=?, explanation=? WHERE id=?',
            [question, JSON.stringify(options), correct, difficulty, phase, categoryId, explanation, req.params.id]
        );
        res.json({ message: 'Question mise à jour' });
    }
);

app.delete(
    '/api/admin/questions/:id',
    authenticateToken,
    authorize(['Admin', 'Superadmin1']),
    [
        // validate id parameter
    ],
    async (req, res) => {
        await dbRun('DELETE FROM questions WHERE id = ?', [req.params.id]);
        res.json({ message: 'Question supprimée' });
    }
);

app.get('/api/admin/advanced-stats', authenticateToken, authorize(['Admin', 'Superadmin1']), async (req, res) => {
    try {
        const totalU = await dbGet('SELECT COUNT(*) as count FROM utilisateurs');
        const totalQ = await dbGet('SELECT COUNT(*) as count FROM questions');
        const globalAvg = await dbGet('SELECT AVG(score) as avg FROM resultats_quiz');

        // Trend (Last 7 days)
        const trend = await dbAll(`
            SELECT date(createdAt) as date, COUNT(*) as count 
            FROM utilisateurs 
            WHERE createdAt > date('now', '-7 days')
            GROUP BY date(createdAt)
            ORDER BY date ASC
        `);

        // Difficulty Distribution
        const dist = await dbAll(`
            SELECT difficulty, COUNT(*) as count 
            FROM resultats_quiz 
            GROUP BY difficulty
        `);

        // Category Performance
        // Since resultats_quiz doesn't have categoryId, this is tricky.
        // For now, let's fix the query to avoid a Cartesian product.
        const catPerf = await dbAll(`
            SELECT c.name, AVG(r.score) as avgScore
            FROM resultats_quiz r
            JOIN (SELECT DISTINCT id, categoryId FROM questions) q 
            JOIN categories_quiz c ON q.categoryId = c.id
            GROUP BY c.id
            LIMIT 5
        `);

        res.json({
            totalUsers: totalU.count,
            totalQuestions: totalQ.count,
            globalAvgScore: Math.round(globalAvg.avg || 0),
            registrationTrend: trend,
            difficultyDistribution: dist,
            categoryPerformance: catPerf
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/settings', async (req, res) => {
    const rows = await dbAll('SELECT * FROM parametres WHERE key IN ("platformName", "responsibleEmail")');
    const settings = {};
    rows.forEach(r => settings[r.key] = r.value);
    res.json(settings);
});

// global error handler (must be after all routes)
/* eslint-disable no-unused-vars */
app.use((err, req, res, _next) => {
    console.error('Unhandled error', err);
    res.status(500).json({ message: 'Internal server error' });
});
/* eslint-enable no-unused-vars */

// Serve frontend
const frontendPath = path.resolve(__dirname, '..', 'BarakahBrain');
app.use(express.static(frontendPath, { maxAge: '1d', etag: false }));

app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});

// start server only if this file is run directly (not required by tests)
if (require.main === module) {
    initDbPromise.then(() => {
        app.listen(PORT, () => {
            console.log(`[BarakahBrain] Serveur Full API lancé sur http://localhost:${PORT}`);
        });
    });
}

// handle graceful shutdown
process.on('SIGINT', () => {
    console.log('Shutting down...');
    db.close();
    process.exit(0);
});

module.exports = app;
