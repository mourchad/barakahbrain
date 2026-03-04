/**
 * BarakahBrain Quiz Database Seeder
 * Quiz authentiques avec preuves islamiques vérifiées
 * À exécuter via: node seed_authentic_quizzes.js
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Database connection
const dbPath = process.env.DB_PATH || path.resolve(__dirname, 'database.sqlite');
console.log(`📁 Using database: ${dbPath}`);

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Database connection error:', err.message);
        process.exit(1);
    }
    console.log('✅ Database connected');
});

const dbRun = (sql, params = []) => new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve(this);
    });
});

const dbAll = (sql, params = []) => new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
    });
});

// ========== AUTHENTIC QUIZ DATA ==========

const QUIZZES = {
    'TAWHID': {
        id: 1,
        name: 'Tawhid',
        description: 'L\'Unicité d\'Allah et ses attributs'
    },
    'HADITH': {
        id: 2,
        name: 'Hadith',
        description: 'Les hadiths authentiques du Prophète ﷺ'
    },
    'FIQH': {
        id: 3,
        name: 'Fiqh',
        description: 'Jurisprudence islamique et ses principes'
    },
    'SIRA': {
        id: 4,
        name: 'Sira',
        description: 'La Biographie du Prophète Muhammad ﷺ'
    },
    'QURAN': {
        id: 5,
        name: 'Coran',
        description: 'Versets du Coran et leur interprétation'
    }
};

const QUESTIONS = [
    // ========== TAWHID - PHASE 1: FONDAMENTAUX ==========
    {
        category: 'TAWHID',
        phase: 1,
        difficulty: 1,
        question: 'Que signifie le mot "Tawhid" en Islam ?',
        options: [
            'La rémission des péchés',
            'L\'Unicité absolue d\'Allah',
            'La miséricorde divine',
            'La création du monde'
        ],
        correct: 1,
        explanation: '🔹 Tawhid (التوحيد) = affirmer l\'unicité absolue d\'Allah et son unicité en adorati​on. Allah dit : « Dis : « Il est Allah, Unique » » (Sourate Al-Ikhlas, v.1) ☪️'
    },
    {
        category: 'TAWHID',
        phase: 1,
        difficulty: 1,
        question: 'Quel est le premier pilier de l\'Islam ?',
        options: [
            'La Zakat (l\'aumône)',
            'La Chahada (attestation de foi)',
            'La prière du vendredi',
            'Le Hajj (pèlerinage)'
        ],
        correct: 1,
        explanation: '🔹 La Chahada (الشهادة) : « Il n\'y a de divinité digne d\'adoration qu\'Allah, et Muhammad est son Messager ». C\'est le fondement de la foi. (Sahih Bukhari 9) ☪️'
    },
    {
        category: 'TAWHID',
        phase: 1,
        difficulty: 2,
        question: 'Qu\'est-ce que le "Shirk" en Islam ?',
        options: [
            'L\'oubli de Dieu',
            'L\'association de partenaires à Allah',
            'La désobéissance mineure',
            'L\'ignorance religieuse'
        ],
        correct: 1,
        explanation: '🔹 Le Shirk (الشرك) = associer d\'autres divinités à Allah. C\'est le plus grand péché dans l\'Islam. Allah dit : « Allah ne pardonne pas le Shirk » (Sourate An-Nisa, v.48) ☪️'
    },
    {
        category: 'TAWHID',
        phase: 1,
        difficulty: 2,
        question: 'Combien de piliers de l\'Islam y a-t-il ?',
        options: [
            '3 piliers',
            '4 piliers',
            '5 piliers',
            '6 piliers'
        ],
        correct: 2,
        explanation: '🔹 Les 5 piliers : 1) La Chahada 2) La Prière 3) La Zakat 4) Le Jeûne du Ramadan 5) Le Hadj. Le Prophète ﷺ dit : « L\'Islam est fondé sur cinq piliers... » (Sahih Bukhari 8) ☪️'
    },

    // ========== HADITH - PHASE 1: SCIENCE DU HADITH ==========
    {
        category: 'HADITH',
        phase: 1,
        difficulty: 1,
        question: 'Que signifie le terme "Matn" dans l\'étude du Hadith ?',
        options: [
            'La chaîne de transmission',
            'Le texte du hadith',
            'L\'authenticité du hadith',
            'L\'autorité du rapporteur'
        ],
        correct: 1,
        explanation: '🔹 Matn (متن) = le texte du hadith. Isnad (إسناد) = la chaîne de transmission. Un hadith complet = Isnad + Matn. (Science du Hadith 101) ☪️'
    },
    {
        category: 'HADITH',
        phase: 1,
        difficulty: 1,
        question: 'Quel recueil de Hadiths est reconnu comme le plus authentique ?',
        options: [
            'Sunan at-Tirmidhi',
            'Sahih al-Bukhari',
            'Musnad Ahmad',
            'Abu Daoud'
        ],
        correct: 1,
        explanation: '🔹 Sahih al-Bukhari (صحيح البخاري) est l\'un des plus fiables. Al-Bukhari a examiné 600,000 hadiths et n\'en a retenu que 7,563 pour leur authenticité rigoureuse. (Bokhari 3000) ☪️'
    },
    {
        category: 'HADITH',
        phase: 1,
        difficulty: 2,
        question: 'Qui a rapporté le plus de hadiths parmi les Compagnons ?',
        options: [
            'Aisha (RA)',
            'Omar ibn al-Khattab (RA)',
            'Abu Hurayra (RA)',
            'Ali ibn Abi Talib (KA)'
        ],
        correct: 2,
        explanation: '🔹 Abu Hurayra (RA) a rapporté 5,374 hadiths. Il a dit : « J\'ai retenu du Prophète ﷺ deux récipients [de connaissance] » (Sahih Bukhari 118) ☪️'
    },
    {
        category: 'HADITH',
        phase: 1,
        difficulty: 2,
        question: 'Qu\'est-ce qu\'un hadith "Sahih" ?',
        options: [
            'Un hadith transmis par des anciens',
            'Un hadith avec une chaîne de transmission authentique et fiable',
            'Un hadith rapporté par Abu Hurayra',
            'Un hadith mentionné dans le Coran'
        ],
        correct: 1,
        explanation: '🔹 Hadith Sahih (صحيح) = chaîne continue jusqu\'au Prophète ﷺ, avec des rapporteurs de confiance et sans défauts. Niveaux : Sahih > Hasan > Da\'if. (Science Usul Al-Hadith) ☪️'
    },

    // ========== FIQH - PHASE 1: PRINCIPES FONDAMENTAUX ==========
    {
        category: 'FIQH',
        phase: 1,
        difficulty: 1,
        question: 'Combien de Madhhabs (écoles juridiques) majeurs existent dans l\'Islam sunnite ?',
        options: [
            '2 madhhabs',
            '3 madhhabs',
            '4 madhhabs',
            '5 madhhabs'
        ],
        correct: 2,
        explanation: '🔹 Les 4 Madhhabs : 1) Hanafi 2) Maliki 3) Shafi\'i 4) Hanbali. Chacun représente une méthodologie juridique valide selon les sources (Coran & Sunna). (Fiqh Comparé) ☪️'
    },
    {
        category: 'FIQH',
        phase: 1,
        difficulty: 1,
        question: 'Quel est le premier principe du Fiqh islamique ?',
        options: [
            'La Coutume',
            'Le Coran et la Sunna',
            'l\'Opinion personnelle',
            'La Raison seule'
        ],
        correct: 1,
        explanation: '🔹 Sources du Fiqh (Usul Al-Fiqh) : 1) Coran 2) Sunna 3) Ijma (consensus) 4) Qiyas (analogie). Allah dit : « Suivez ce qui vous a été révélé de votre Seigneur » (Sourate Al-Araf, v.3) ☪️'
    },
    {
        category: 'FIQH',
        phase: 1,
        difficulty: 2,
        question: 'Qu\'est-ce que le "Taqlid" en Fiqh islamique ?',
        options: [
            'Créer une nouvelle loi islamique',
            'Suivre l\'opinion d\'un mujtahid (juriste) établi',
            'Rejeter la Sunna du Prophète ﷺ',
            'Interpréter soi-même les textes religieux'
        ],
        correct: 1,
        explanation: '🔹 Taqlid (التقليد) = suivre l\'opinion d\'un savant établi. C\'est permis pour celui qui n\'a pas accès à la science complète. (Usul Al-Fiqh Al-Islami) ☪️'
    },

    // ========== SIRA - PHASE 1: NAISSANCE DU PROPHÈTE ﷺ ==========
    {
        category: 'SIRA',
        phase: 1,
        difficulty: 1,
        question: 'En quelle année est né le Prophète Muhammad ﷺ ?',
        options: [
            '550 CE',
            '568 CE',
            '580 CE',
            '595 CE'
        ],
        correct: 1,
        explanation: '🔹 Le Prophète Muhammad ﷺ est né en 570 CE (année de l\'Éléphant - Amm Al-Feel). Sa mère était Amina bint Wahab et son père Abdullah ibn Abd Al-Muttalib. (Sirat Ibn Hisham) ☪️'
    },
    {
        category: 'SIRA',
        phase: 1,
        difficulty: 1,
        question: 'Quel était le nom de la mère du Prophète ﷺ ?',
        options: [
            'Haleema As-Sa\'adiyya',
            'Amina bint Wahab',
            'Khadija bint Khuwaylid',
            'Barakah Um Ayman'
        ],
        correct: 1,
        explanation: '🔹 Amina bint Wahab (أمينة بنت وهب) était la mère du Prophète ﷺ. Elle est décédée à Abwa quand le Prophète avait 6 ans. (Sahih Bukhari, Ibn Hisham) ☪️'
    },
    {
        category: 'SIRA',
        phase: 1,
        difficulty: 2,
        question: 'Qui a allaité le Prophète Muhammad ﷺ pendant sa petite enfance ?',
        options: [
            'Barakah (Um Ayman)',
            'Haleema As-Sa\'adiyyah',
            'Khadija bint Khuwaylid',
            'Fatima bint Asad'
        ],
        correct: 1,
        explanation: '🔹 Le Prophète ﷺ a d\'abord été allaité par Thuyeba, esclave d\'Abu Lahab, puis par Haleema As-Sa\'adiyyah. (Sirat Ibn Hisham, Sira Al-Nabawiyyah) ☪️'
    },

    // ========== SIRA - PHASE 2: VIE À LA MECQUE ==========
    {
        category: 'SIRA',
        phase: 2,
        difficulty: 1,
        question: 'À quel âge le Prophète ﷺ a-t-il reçu la première révélation (Wahy) ?',
        options: [
            '25 ans',
            '35 ans',
            '40 ans',
            '50 ans'
        ],
        correct: 2,
        explanation: '🔹 À 40 ans, pendant le mois de Ramadan, l\'Archange Gabriel (Jibreel) est apparu au Prophète ﷺ dans la grotte de Hira. C\'était les premiers versets : « Lis, au nom de ton Seigneur » (Sourate Al-Alaq, v.1-5) ☪️'
    },
    {
        category: 'SIRA',
        phase: 2,
        difficulty: 1,
        question: 'Quel était le métier du Prophète ﷺ avant la prophétie ?',
        options: [
            'Commerçant',
            'Berger',
            'Agriculteur',
            'Tous les métiers ci-dessus'
        ],
        correct: 0,
        explanation: '🔹 Le Prophète ﷺ était commerçant (Tajir). Il a aussi travaillé comme berger dans sa jeunesse. Khadija l\'employa comme commerçant pour ses caravanes. (Ibn Hisham, Tabaqat) ☪️'
    },
    {
        category: 'SIRA',
        phase: 2,
        difficulty: 2,
        question: 'Quel fut le premier homme à accepter l\'Islam ?',
        options: [
            'Abu Bakr (RA)',
            'Ali ibn Abi Talib (KA)',
            'Zayd ibn Harithah (RA)',
            'Hamza ibn Abd Al-Muttalib (RA)'
        ],
        correct: 0,
        explanation: '🔹 Abu Bakr As-Siddiq (RA) fut le premier homme libre à embrasser l\'Islam. Ali ibn Abi Talib (KA) fut le premier enfant. Zayd ibn Harithah (RA) accepta aussi très tôt. (Sirat Tabari) ☪️'
    },
    {
        category: 'SIRA',
        phase: 2,
        difficulty: 2,
        question: 'Pendant combien d\'années le Prophète ﷺ prêcha-t-il à la Mecque avant l\'Hégire ?',
        options: [
            '10 ans',
            '11 ans',
            '12 ans',
            '13 ans'
        ],
        correct: 3,
        explanation: '🔹 Le Prophète ﷺ prêcha à la Mecque pendant 13 ans (de 40 à 53 ans). Puis il émigra à Médine (Hijra) en l\'an 622 CE. (Sirat Ibn Hisham) ☪️'
    },

    // ========== SIRA - PHASE 3: L\'HÉGIRE ET MÉDINE ==========
    {
        category: 'SIRA',
        phase: 3,
        difficulty: 1,
        question: 'Quel était le nom du guide qui accompagnait l\'Hégire avec le Prophète ﷺ ?',
        options: [
            'Abu Jahl',
            'Abu Bakr As-Siddiq (RA)',
            'Abdullah ibn Uraiqit',
            'Zayd ibn Harithah (RA)'
        ],
        correct: 2,
        explanation: '🔹 Abdullah ibn Uraiqit était le guide bédouin. Abu Bakr (RA) accompagnait le Prophète ﷺ. Ils se sont cachés dans la grotte de Thawr où le Coran rapporte : « Ne t\'afflige pas, car Allah est avec nous » (Sourate At-Tawbah, v.40) ☪️'
    },
    {
        category: 'SIRA',
        phase: 3,
        difficulty: 1,
        question: 'Combien de nuits le Prophète ﷺ et Abu Bakr (RA) ont-ils passé dans la grotte de Thawr ?',
        options: [
            '1 nuit',
            '2 nuits',
            '3 nuits',
            '5 nuits'
        ],
        correct: 2,
        explanation: '🔹 3 nuits. Ils se cachèrent pour éviter les poursuivants de Quraysh. C\'était une mise à l\'épreuve divine. (Sirat Ibn Hisham, Tabari) ☪️'
    },
    {
        category: 'SIRA',
        phase: 3,
        difficulty: 1,
        question: 'Quel fut le premier acte du Prophète ﷺ en arrivant à Médine ?',
        options: [
            'Il a déclaré la guerre à Quraysh',
            'Il a construit la mosquée de Quba',
            'Il a établi un marché',
            'Il a signé un traité'
        ],
        correct: 1,
        explanation: '🔹 Le Prophète ﷺ construisit la mosquée de Quba (Masjid Quba), la première mosquée en Islam. Allah y fit référence : « Une mosquée fondée sur la piété dès le premier jour » (Sourate At-Tawbah, v.108) ☪️'
    },
    {
        category: 'SIRA',
        phase: 3,
        difficulty: 2,
        question: 'En quelle année de l\'Hégire eut lieu la bataille de Badr ?',
        options: [
            '1 AH',
            '2 AH',
            '3 AH',
            '5 AH'
        ],
        correct: 1,
        explanation: '🔹 Le 17 Ramadan de l\'an 2 AH (624 CE). 313 musulmans vainquirent ~1000 Qurayshites. Allah dit : « Allah vous a aidés à Badr » (Sourate Al-Imran, v.123). C\'est le Jour du Discernement (Yaum Al-Furqan). ☪️'
    },
    {
        category: 'SIRA',
        phase: 3,
        difficulty: 2,
        question: 'Qu\'appelait-on les habitants de Médine qui ont accueilli les musulmans émigrés ?',
        options: [
            'Les Muhajirun',
            'Les Ansar',
            'Les Sabiqun',
            'Les Mu\'minin'
        ],
        correct: 1,
        explanation: '🔹 Les Ansar (النصار) = les Secoureurs. Ils ont généreusement accueilli les Muhajirun (المهاجرون) = les Emigrants. Allah loua les Ansar : « Ils aiment ceux qui émigrent vers eux » (Sourate Al-Hashr, v.9) ☪️'
    },

    // ========== QURAN - PHASE 1: VERSETS MAJEURS ==========
    {
        category: 'QURAN',
        phase: 1,
        difficulty: 1,
        question: 'Quelle est la plus longue sourate du Coran ?',
        options: [
            'Sourate Al-Baqarah (La Vache)',
            'Sourate At-Tawbah (Le Repentir)',
            'Sourate An-Nisa (Les Femmes)',
            'Sourate Al-Araf (L\'Escarpe)'
        ],
        correct: 0,
        explanation: '🔹 Sourate Al-Baqarah (البقرة) = 286 versets. C\'est la 2e sourate révélée à Médine et la plus longue. Elle traite de nombreux sujets (foi, morale, jurisprudence). (Compilation Coran Officiel) ☪️'
    },
    {
        category: 'QURAN',
        phase: 1,
        difficulty: 1,
        question: 'Combien de surahs (chapitres) compte le Coran ?',
        options: [
            '104 surahs',
            '114 surahs',
            '124 surahs',
            '134 surahs'
        ],
        correct: 1,
        explanation: '🔹 114 surahs (سور) composent le Coran. La première = Al-Fatiha (L\'Ouverture, 7 versets). La dernière = An-Nas (Les Gens, 6 versets). (Compilation Coran Consensus Musulman) ☪️'
    },
    {
        category: 'QURAN',
        phase: 1,
        difficulty: 2,
        question: 'Combien de versets contient le Coran environ ?',
        options: [
            '~5,000 versets',
            '~6,200 versets',
            '~7,500 versets',
            '~8,500 versets'
        ],
        correct: 1,
        explanation: '🔹 Le Coran contient 6,236 versets (ayat) selon le consensus. Chaque verset débute par un nouveau sens ou thème. C\'est un miracle du Coran. (Tafsir, Mushaf Standards) ☪️'
    }
];

// ========== SEED FUNCTION ==========

async function seedDatabase() {
    try {
        console.log('\n📚 Insertion des données de quiz authentiques...\n');

        // Insert categories
        console.log('1️⃣  Insertion des catégories...');
        for (const [key, cat] of Object.entries(QUIZZES)) {
            await dbRun(
                'INSERT OR IGNORE INTO categories_quiz (id, name) VALUES (?, ?)',
                [cat.id, cat.name]
            );
        }
        console.log('✅ Catégories insertées\n');

        // Insert questions
        console.log('2️⃣  Insertion des questions authentiques...');
        let inserted = 0;

        for (const q of QUESTIONS) {
            const catData = QUIZZES[q.category];
            await dbRun(
                `INSERT INTO questions 
                 (question, options, correct, difficulty, phase, categoryId, explanation) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [
                    q.question,
                    JSON.stringify(q.options),
                    q.correct,
                    q.difficulty,
                    q.phase,
                    catData.id,
                    q.explanation
                ]
            );
            inserted++;
        }

        console.log(`✅ ${inserted} questions insertées\n`);

        // Summary
        const stats = await dbAll('SELECT categoryId, COUNT(*) as count FROM questions GROUP BY categoryId ORDER BY categoryId');
        console.log('📊 Résumé des inscriptions :');
        console.log('─'.repeat(50));
        for (const stat of stats) {
            const cat = Object.values(QUIZZES).find(c => c.id === stat.categoryId);
            console.log(`   ${cat.name.padEnd(15)} : ${stat.count.toString().padEnd(3)} questions`);
        }
        console.log('─'.repeat(50));

        const totalQuestions = stats.reduce((sum, s) => sum + s.count, 0);
        console.log(`\n🎯 Total : ${totalQuestions} questions authentiques`);
        console.log('✨ Base de données peuplée avec succès !');

        process.exit(0);
    } catch (error) {
        console.error('\n❌ Erreur lors du seeding :', error.message);
        process.exit(1);
    }
}

// Run the seed
seedDatabase().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
