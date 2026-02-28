const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

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

async function migrate() {
    try {
        // Add column if not exists
        await dbRun('ALTER TABLE questions ADD COLUMN explanation TEXT').catch(e => {
            if (!e.message.includes('duplicate column name')) throw e;
        });
        console.log('Column "explanation" ensured.');

        // For demo purposes, we will re-seed the first few questions to have explanations
        const seedExplanations = [
            "Le Tawhid ar-Rububiyya est l'Unicité d'Allah dans Sa Seigneurie (Création, Royauté, Gérance). Preuve : « Louange à Allah, Seigneur de l'univers » (Sourate Al-Fatiha, verset 2).",
            "C'est l'essence même de l'Islam. Preuve : « C'est Toi [Seul] que nous adorons, et c'est Toi [Seul] dont nous implorons secours » (Sourate Al-Fatiha, verset 5).",
            "La Salat est le second pilier et le premier acte sur lequel nous serons interrogés. Le Prophète (SWS) a dit : « L'Islam est bâti sur cinq... la profession de foi... l'accomplissement de la Salat... » (Rapporté par Al-Bukhari).",
            "Les cinq prières ont été prescrites durant l'Ascension Nocturne (Al-Isra wal-Mi'raj). Preuve : Hadith d'Anas b. Malik rapportant la prescription initiale de 50 ramenée à 5 (Sahih Al-Bukhari).",
            "Le Prophète est né à La Mecque dans l'année de l'Éléphant. Preuve : Sourate Al-Fil (v. 1-5) qui relate l'événement marquant cette année.",
            "Khadija bint Khuwaylid fut sa première épouse et la première personne à embrasser l'Islam. Le Prophète (SWS) a dit : « Elle a cru en moi quand les gens m'ont rejeté » (Musnad Ahmad).",
            "La Sourate Al-Baqarah (La Vache) contient 286 versets. Le Prophète (SWS) l'a appelée 'la bosse du Coran'.",
            "Le Coran complet, tel que révélé au Prophète (SWS) et compilé, compte 114 sourates."
        ];

        for (let i = 0; i < seedExplanations.length; i++) {
            await dbRun('UPDATE questions SET explanation = ? WHERE id = ?', [seedExplanations[i], i + 1]);
        }
        console.log('Seed explanations updated.');

    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        db.close();
    }
}

migrate();
