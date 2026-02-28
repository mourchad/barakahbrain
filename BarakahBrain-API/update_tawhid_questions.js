const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.win32.resolve(__dirname, 'database.sqlite'); // Use win32 for Windows paths
const db = new sqlite3.Database(dbPath);

const dbRun = (sql, params = []) => new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve(this);
    });
});

async function updateTawhidContent() {
    try {
        console.log('Cleaning existing Phase 1 & 2 Tawhid questions...');
        // Category 1 is usually Tawhid based on server.js seeding
        await dbRun('DELETE FROM questions WHERE categoryId = 1 AND phase IN (1, 2)');

        const phase1 = [
            {
                q: "Qui est le Créateur des cieux et de la terre ?",
                opts: ["Les anges", "Le Prophète ﷺ", "Allah", "Le soleil"],
                ans: 2,
                expl: "🔹 Verset (Arabe): اللَّهُ خَالِقُ كُلِّ شَيْءٍ\n🔹 Traduction: \"Allah est le Créateur de toute chose.\" — Sourate Az-Zumar, verset 62\n🔹 Explication Simple: Allah seul a créé l’univers. Personne ne partage ce pouvoir avec Lui. C’est cela le Tawhid."
            },
            {
                q: "Peut-on adorer quelqu’un d’autre qu’Allah ?",
                opts: ["Oui, si c’est une bonne personne", "Oui, si c’est un prophète", "Non, seul Allah mérite l’adoration", "Oui, si c’est un ange"],
                ans: 2,
                expl: "🔹 Verset (Arabe): وَاعْبُدُوا اللَّهَ وَلَا تُشْرِكُوا بِهِ شَيْئًا\n🔹 Traduction: \"Adorez Allah et ne Lui associez rien.\" — Sourate An-Nisa, verset 36\n🔹 Explication: L’adoration doit être dirigée uniquement vers Allah. Adorer autre qu’Allah s’appelle le shirk."
            },
            {
                q: "Que signifie la phrase 'La ilaha illa Allah' ?",
                opts: ["Il n’y a pas de religion", "Il n’y a pas de dieu sauf Allah", "Muhammad est Dieu", "Les anges sont divins"],
                ans: 1,
                expl: "🔹 Verset (Arabe): فَاعْلَمْ أَنَّهُ لَا إِلَٰهَ إِلَّا اللَّهُ\n🔹 Traduction: \"Sache qu’il n’y a point de divinité digne d’adoration en dehors d’Allah.\" — Sourate Muhammad, verset 19\n🔹 Explication: Cette phrase est la base de l’Islam. Elle signifie qu’Allah seul mérite notre adoration."
            },
            {
                q: "Allah ressemble-t-Il à Sa création ?",
                opts: ["Oui", "Non", "Parfois", "Seulement aux anges"],
                ans: 1,
                expl: "🔹 Verset (Arabe): لَيْسَ كَمِثْلِهِ شَيْءٌ\n🔹 Traduction: \"Rien ne Lui ressemble.\" — Sourate Ash-Shura, verset 11\n🔹 Explication: Allah n’est pas un être humain, ni une créature. Il est unique dans Son essence et Ses attributs."
            },
            {
                q: "Qui donne la vie et la mort ?",
                opts: ["Les médecins", "Les anges", "Allah", "La nature"],
                ans: 2,
                expl: "🔹 Verset (Arabe): اللَّهُ يُحْيِي وَيُمِيتُ\n🔹 Traduction: \"Allah donne la vie et donne la mort.\" — Sourate Yunus, verset 56\n🔹 Explication: Les causes existent, mais le pouvoir appartient uniquement à Allah."
            },
            {
                q: "Combien y a-t-il de divinités dignes d’adoration ?",
                opts: ["Une seule", "Deux", "Trois", "Plusieurs"],
                ans: 0,
                expl: "🔹 Verset (Arabe): وَإِلَٰهُكُمْ إِلَٰهٌ وَاحِدٌ\n🔹 Traduction: \"Votre Dieu est un Dieu unique.\" — Sourate Al-Baqara, verset 163\n🔹 Explication: L’Islam rejette le polythéisme. Allah est Unique sans associé."
            },
            {
                q: "Tous les prophètes ont appelé à :",
                opts: ["L’adoration des étoiles", "L’adoration d’Allah seul", "L’adoration des anges", "L’adoration des rois"],
                ans: 1,
                expl: "🔹 Verset (Arabe): وَلَقَدْ بَعَثْنَا فِي كُلِّ أُمَّةٍ رَسُولًا أَنِ اعْبُدُوا اللَّهَ وَاجْتَنِبُوا الطَّاغُوتَ\n🔹 Traduction: \"Nous avons envoyé dans chaque communauté un Messager [pour dire] : Adorez Allah et écartez-vous du faux dieu.\" — Sourate An-Nahl, verset 36\n🔹 Explication: Le message de tous les prophètes était le Tawhid."
            },
            {
                q: "Associer quelqu’un à Allah s’appelle :",
                opts: ["Iman", "Tawhid", "Shirk", "Ihsan"],
                ans: 2,
                expl: "🔹 Verset (Arabe): إِنَّ الشِّرْكَ لَظُلْمٌ عَظِيمٌ\n🔹 Traduction: \"L’association (shirk) est une énorme injustice.\" — Sourate Luqman, verset 13\n🔹 Explication: Le shirk est le plus grand péché car il nie l’unicité d’Allah."
            },
            {
                q: "Allah entend et voit :",
                opts: ["Seulement certaines choses", "Tout", "Rien", "Seulement les croyants"],
                ans: 1,
                expl: "🔹 Verset (Arabe): إِنَّ اللَّهَ سَمِيعٌ بَصِيرٌ\n🔹 Traduction: \"Allah est Audient et Clairvoyant.\" — Sourate Al-Hajj, verset 61\n🔹 Explication: Allah entend toutes les voix et voit toutes les actions."
            },
            {
                q: "Le Tawhid signifie :",
                opts: ["Croire en plusieurs dieux", "Croire en Allah seul", "Croire seulement aux anges", "Ne pas croire au destin"],
                ans: 1,
                expl: "🔹 Verset (Arabe): قُلْ هُوَ اللَّهُ أَحَدٌ\n🔹 Traduction: \"Dis : Il est Allah, Unique.\" — Sourate Al-Ikhlas, verset 1\n🔹 Explication: Le Tawhid est la base de la foi islamique. Il signifie reconnaître l’unicité absolue d’Allah."
            }
        ];

        const phase2 = [
            {
                q: "Que signifie croire en la Seigneurie d’Allah (Rububiyyah) ?",
                opts: ["Croire qu’Il a des associés", "Croire qu’Il est le Créateur et le Maître de toute chose", "Croire seulement aux anges", "Croire aux étoiles"],
                ans: 1,
                expl: "🔹 Verset (Arabe): الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ\n🔹 Traduction: \"Louange à Allah, Seigneur des mondes.\" — Sourate Al-Fatiha, verset 2\n🔹 Explication: Le mot “Rabb” signifie Seigneur, Maître, Celui qui gère et prend soin de toute la création."
            },
            {
                q: "Qui pourvoit à la subsistance (rizq) des créatures ?",
                opts: ["Les gouvernements", "Les parents", "Allah", "Les commerçants"],
                ans: 2,
                expl: "🔹 Verset (Arabe): إِنَّ اللَّهَ هُوَ الرَّZَّاقُ ذُو الْقُوَّةِ الْمَتِينُ\n🔹 Traduction: \"Certes, Allah est Le Grand Pourvoyeur, Le Détenteur de la force.\" — Sourate Adh-Dhariyat, verset 58\n🔹 Explication: Les moyens existent, mais la subsistance vient réellement d’Allah."
            },
            {
                q: "Qui contrôle la pluie ?",
                opts: ["Les nuages seuls", "Les anges indépendamment", "Allah", "Le vent uniquement"],
                ans: 2,
                expl: "🔹 Verset (Arabe): وَهُوَ الَّذِي يُنَZِّلُ الْغَيْثَ\n🔹 Traduction: \"C’est Lui qui fait descendre la pluie.\" — Sourate Ash-Shura, verset 28\n🔹 Explication: Les phénomènes naturels sont sous le contrôle d’Allah."
            },
            {
                q: "Qui a créé les cieux et la terre ?",
                opts: ["Le hasard", "Les anges", "Allah", "L’homme"],
                ans: 2,
                expl: "🔹 Verset (Arabe): اللَّهُ خَالِقُ السَّمَاوَاتِ وَالْأَرْضِ\n🔹 Traduction: \"Allah est le Créateur des cieux et de la terre.\" — Sourate Az-Zumar, verset 62\n🔹 Explication: Rien n’existe sans la création d’Allah."
            },
            {
                q: "Qui dirige l’univers ?",
                opts: ["Plusieurs divinités", "Allah seul", "Les planètes", "Les rois"],
                ans: 1,
                expl: "🔹 Verset (Arabe): يُدَبِّرُ الْأَمْرَ مِنَ السَّمَاءِ إِلَى الْأَرْضِ\n🔹 Traduction: \"Il administre toute chose du ciel à la terre.\" — Sourate As-Sajda, verset 5\n🔹 Explication: Allah organise et contrôle tout ce qui se passe."
            },
            {
                q: "Peut-il y avoir deux Seigneurs créateurs en même temps ?",
                opts: ["Oui", "Non", "Peut-être", "Seulement trois"],
                ans: 1,
                expl: "🔹 Verset (Arabe): لَوْ كَانَ فِيهِمَا آلِهَةٌ إِلَّا اللَّهُ لَفَسَدَتَا\n🔹 Traduction: \"S’il y avait dans les cieux et la terre d’autres divinités qu’Allah, ils seraient corrompus.\" — Sourate Al-Anbiya, verset 22\n🔹 Explication: Deux dieux créateurs provoqueraient un désordre. L’unicité garantit l’ordre parfait."
            },
            {
                q: "Qui guérit réellement les maladies ?",
                opts: ["Les médecins uniquement", "Les médicaments seuls", "Allah", "Les herbes"],
                ans: 2,
                expl: "🔹 Verset (Arabe): وَإِذَا مَرِضْتُ فَهُوَ يَشْفِينِ\n🔹 Traduction: \"Et quand je suis malade, c’est Lui qui me guérit.\" — Sourate Ash-Shu'ara, verset 80\n🔹 Explication: Les traitements sont des causes, mais la guérison vient d’Allah."
            },
            {
                q: "Qui possède tout ce qui est dans les cieux et sur la terre ?",
                opts: ["Les humains", "Les rois", "Allah", "Les anges"],
                ans: 2,
                expl: "🔹 Verset (Arabe): لِلَّهِ مُلْكُ السَّمَاوَاتِ وَالْأَرْضِ\n🔹 Traduction: \"À Allah appartient la royauté des cieux et de la terre.\" — Sourate Al-Imran, verset 189\n🔹 Explication: Tout appartient à Allah. Nous ne sommes que des dépositaires."
            },
            {
                q: "Allah dort-Il ?",
                opts: ["Oui", "Parfois", "Non", "Seulement la nuit"],
                ans: 2,
                expl: "🔹 Verset (Arabe): لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ\n🔹 Traduction: \"Ni somnolence ni sommeil ne Le saisissent.\" — Sourate Al-Baqara, verset 255\n🔹 Explication: Allah est parfait. Il ne fatigue pas et ne dort pas."
            },
            {
                q: "Croire qu’Allah est le seul Créateur fait partie de :",
                opts: ["La Rububiyyah", "Le Shirk", "L’Ihsan", "Le Fiqh"],
                ans: 0,
                expl: "🔹 Verset (Arabe): ذَٰلِكُمُ اللَّهُ رَبُّكُمْ خَالِقُ كُلِّ شَيْءٍ\n🔹 Traduction: \"Voilà Allah, votre Seigneur, Créateur de toute chose.\" — Sourate Ghafir, verset 62\n🔹 Explication: La Rububiyyah signifie reconnaître qu’Allah est le Créateur, le Maître et le Gestionnaire de tout."
            }
        ];

        const insertQ = async (phase, data) => {
            for (const item of data) {
                await dbRun(
                    'INSERT INTO questions (difficulty, phase, type, question, options, correct, categoryId, explanation) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                    [1, phase, 'mcq', item.q, JSON.stringify(item.opts), item.ans, 1, item.expl]
                );
            }
        };

        await insertQ(1, phase1);
        await insertQ(2, phase2);

        console.log('Tawhid Phase 1 & 2 academic content injected successfully.');

    } catch (err) {
        console.error('Update failed:', err);
    } finally {
        db.close();
    }
}

updateTawhidContent();
