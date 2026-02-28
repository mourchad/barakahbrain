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

async function seed() {
    console.log("--- EXPANSION ACADÉMIQUE v2 ---");

    try {
        // 1. S'assurer que les catégories existent
        await dbRun("INSERT OR IGNORE INTO categories_quiz (id, name) VALUES (1, 'Tawhid')");
        await dbRun("INSERT OR IGNORE INTO categories_quiz (id, name) VALUES (2, 'Sira')");
        await dbRun("INSERT OR IGNORE INTO categories_quiz (id, name) VALUES (3, 'Fiqh')");
        await dbRun("INSERT OR IGNORE INTO categories_quiz (id, name) VALUES (4, 'Hadith')");

        // --- SIRA PHASE 3 (L'Ère Médinoise) ---
        const siraQuestions = [
            {
                q: "Comment s'appelle l'endroit où le Prophète (SWS) et Abu Bakr se sont cachés pendant l'Hégire ?",
                o: ["La grotte de Hira", "La grotte de Thawr", "La grotte de Uhud", "Le mont Arafat"],
                c: 1, p: 3, diff: 2, cat: 2,
                exp: "🔹 Fait: Ils y restèrent 3 nuits. Le Coran y fait allusion : « ...quand ils étaient dans la grotte et qu'il disait à son compagnon : Ne t'afflige pas, car Allah est avec nous. » (Sourate At-Tawbah, v.40)."
            },
            {
                q: "Quel acte le Prophète (SWS) a-t-il accompli immédiatement en arrivant à Quba ?",
                o: ["Il a déclaré la guerre", "Il a construit une mosquée", "Il a ouvert un marché", "Il est parti vers Médine sans s'arrêter"],
                c: 1, p: 3, diff: 1, cat: 2,
                exp: "🔹 Histoire: La mosquée de Quba est la première mosquée construite en Islam. Allah dit : « ...une Mosquée fondée dès le premier jour sur la piété est plus digne que tu t'y tiennes... » (Sourate At-Tawbah, v.108)."
            },
            {
                q: "Comment appelait-on les habitants de Médine qui ont accueilli les musulmans de la Mecque ?",
                o: ["Les Muhajirun", "Les Ansar", "Les Quraysh", "Les Hawazin"],
                c: 1, p: 3, diff: 1, cat: 2,
                exp: "🔹 Définition: 'Ansar' signifie les Secoureurs. Les Muhajirun sont ceux qui ont émigré (Hijra)."
            },
            {
                q: "En quelle année de l'Hégire a eu lieu la grande bataille de Badr ?",
                o: ["1 AH", "2 AH", "3 AH", "5 AH"],
                c: 1, p: 3, diff: 2, cat: 2,
                exp: "🔹 Histoire: Badr a eu lieu le 17 Ramadan de l'an 2 de l'Hégire. C'est le 'Jour du Discernement' (Yaum al-Furqan)."
            },
            {
                q: "Quel compagnon a accompagné le Prophète (SWS) durant son voyage de l'Hégire ?",
                o: ["Omar ibn al-Khattab", "Abu Bakr as-Siddiq", "Ali ibn Abi Talib", "Uthman ibn Affan"],
                c: 1, p: 3, diff: 1, cat: 2,
                exp: "🔹 Fidélité: Abu Bakr a sacrifié tous ses biens pour cette émigration."
            },
            {
                q: "Quelle était la principale cause de la Bataille de Badr ?",
                o: ["Une dispute sur un puits", "L'interception d'une caravane commerciale de Quraysh", "La conquête de la Mecque", "Une attaque surprise sur Médine"],
                c: 1, p: 3, diff: 2, cat: 2,
                exp: "🔹 Contexte: Les musulmans cherchaient à récupérer une partie de leurs biens saisis à la Mecque en interceptant la caravane d'Abu Sufyan."
            },
            {
                q: "Combien de combattants musulmans y avait-il à Badr ?",
                o: ["~1000", "~313", "~10 000", "~70"],
                c: 1, p: 3, diff: 2, cat: 2,
                exp: "🔹 Miracle: 313 musulmans firent face à environ 1000 Qurayshites. Allah les a aidés avec des milliers d'anges."
            }
        ];

        // --- HADITH PHASE 1 (Introduction) ---
        const hadithQuestions = [
            {
                q: "Que signifie le terme 'Matn' dans l'étude du Hadith ?",
                o: ["La chaîne de transmission", "Le texte même de la parole", "Le nom du rapporteur", "Le lieu de la révélation"],
                c: 1, p: 1, diff: 2, cat: 4,
                exp: "🔹 Science: Un Hadith est composé de l'Isnad (la chaîne) et du Matn (le texte)."
            },
            {
                q: "Quel est le sujet du premier Hadith des '40 Hadiths de l'Imam Nawawi' ?",
                o: ["La prière", "L'intention (An-Niyyah)", "L'aumône", "Le jeûne"],
                c: 1, p: 1, diff: 1, cat: 4,
                exp: "🔹 Hadith: « Les actions ne valent que par les intentions... » (Rapporté par Bukhari et Muslim)."
            },
            {
                q: "Lequel de ces recueils est considéré comme le plus authentique après le Coran ?",
                o: ["Sahih Bukhari", "Sunan at-Tirmidhi", "Al-Muwatta", "Musnad Ahmad"],
                c: 0, p: 1, diff: 1, cat: 4,
                exp: "🔹 Consensus: Sahih al-Bukhari est le livre le plus authentique car les critères de sélection des hadiths y étaient les plus stricts."
            },
            {
                q: "Qui est le compagnon qui a rapporté le plus de Hadiths ?",
                o: ["Abu Bakr", "Abu Hurayra", "Aisha", "Anas ibn Malik"],
                c: 1, p: 1, diff: 1, cat: 4,
                exp: "🔹 Histoire: Abu Hurayra (RA) a rapporté plus de 5000 hadiths grâce à sa mémoire exceptionnelle et sa compagnie constante du Prophète (SWS)."
            },
            {
                q: "Que signifie un Hadith 'Mutawatir' ?",
                o: ["Un hadith inventé", "Un hadith rapporté par un très grand nombre de personnes à chaque niveau", "Un hadith faible", "Un hadith caché"],
                c: 1, p: 1, diff: 3, cat: 4,
                exp: "🔹 Science: Un hadith Mutawatir offre une certitude absolue car il est impossible que tant de personnes se soient accordées sur un mensonge."
            }
        ];

        const allQuestions = [...siraQuestions, ...hadithQuestions];

        for (const q of allQuestions) {
            await dbRun(`INSERT INTO questions (question, options, correct, difficulty, phase, categoryId, explanation) 
                         VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [q.q, JSON.stringify(q.o), q.c, q.diff, q.p, q.cat, q.exp]);
        }

        console.log(`Succès: ${allQuestions.length} nouvelles questions ajoutées.`);

    } catch (err) {
        console.error("Erreur de seeding:", err);
    } finally {
        db.close();
    }
}

seed();
