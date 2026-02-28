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

async function ultimateExpansion() {
    try {
        console.log('Injecting Elite Curriculum: Tawhid P4, Sira P2, Fiqh P1...');

        // Clean target phases to avoid duplicates during re-runs
        await dbRun('DELETE FROM questions WHERE (categoryId = 1 AND phase = 4) OR (categoryId = 3 AND phase = 2) OR (categoryId = 2 AND phase = 1)');

        const tawhidP4 = [
            {
                q: "Que signifie le Tawhid des Noms et Attributs ?",
                opts: ["Donner des noms aux anges", "Affirmer ce qu'Allah a affirmé pour Lui-même sans ressemblance", "Changer les noms d'Allah", "Ignorer les attributs"],
                ans: 1,
                expl: "🔹 Verset (Arabe): لَيْسَ كَمِثْلِهِ شَيْءٌ وَهُوَ السَّمِيعُ الْبَصِيرُ\n🔹 Traduction: \"Rien ne Lui ressemble ; et c'est Lui l'Audient, le Clairvoyant.\" — Sourate Ash-Shura, verset 11.\n🔹 Explication: Nous affirmons les noms et attributs d'Allah tels qu'ils sont dans le Coran, sans Lui donner de forme humaine et sans nier leur sens."
            },
            {
                q: "Combien de noms d'Allah sont mentionnés dans le célèbre Hadith comme ouvrant l'accès au Paradis ?",
                opts: ["7", "33", "99", "Unlimited"],
                ans: 2,
                expl: "🔹 Hadith: Le Prophète (SWS) a dit: \"Certes, Allah a quatre-vingt-dix-neuf noms, cent moins un. Quiconque les mémorise entrera au Paradis.\" (Sahih Al-Bukhari).\n🔹 Explication: 'Mémoriser' signifie ici les connaître, les comprendre et agir selon leur sens."
            },
            {
                q: "Quelle est la différence entre Ar-Rahman et Ar-Rahim ?",
                opts: ["Aucune", "Ar-Rahman est Sa nature, Ar-Rahim est Son action envers les créatures", "L'un est pour les anges, l'autre pour les hommes", "Ce sont des noms d'anges"],
                ans: 1,
                expl: "🔹 Explication: Ar-Rahman désigne la Miséricorde vaste qui englobe tout. Ar-Rahim désigne la Miséricorde qu'Il accorde spécifiquement à Ses serviteurs."
            },
            {
                q: "Que signifie le nom d'Allah 'Al-'Alim' ?",
                opts: ["Le Puissant", "L'Omniscient (Celui qui sait tout)", "Le Créateur", "Le Juge"],
                ans: 1,
                expl: "🔹 Verset (Arabe): وَهُوَ بِكُلِّ شَيْءٍ عَلِيمٌ\n🔹 Traduction: \"Et Il est l'Omniscient de toute chose.\" — Sourate Al-Baqarah, verset 29.\n🔹 Explication: Allah connaît le passé, le présent, le futur et ce qui n'a pas eu lieu."
            },
            {
                q: "Peut-on comparer les attributs d'Allah à ceux des humains ?",
                opts: ["Oui, pour mieux comprendre", "Non, car Allah est Unique dans Sa perfection", "Seulement pour la force", "Seulement pour la vue"],
                ans: 1,
                expl: "🔹 Verset (Arabe): فَلَا تَضْرِبُوا لِلَّهِ الْأَمْثَالَ\n🔹 Traduction: \"N'attribuez donc pas de semblables à Allah.\" — Sourate An-Nahl, verset 74.\n🔹 Explication: La main, la vue ou l'ouïe d'Allah ne ressemblent en rien à celles des créatures."
            },
            {
                q: "Que signifie le nom 'Al-Hayy' ?",
                opts: ["Le Donneur", "Le Vivant qui ne meurt jamais", "Le Fort", "Le Sage"],
                ans: 1,
                expl: "🔹 Verset (Arabe): وَتَوَكَّلْ عَلَى الْحَيِّ الَّذِي لَا يَمُوتُ\n🔹 Traduction: \"Et place ta confiance en le Vivant qui ne meurt jamais.\" — Sourate Al-Furqan, verset 58."
            },
            {
                q: "Allah est-Il partout par Son essence ou par Sa science ?",
                opts: ["Par Son essence", "Par Sa science et Sa vue", "Il n'est nulle part", "Partout physiquement"],
                ans: 1,
                expl: "🔹 Verset (Arabe): أَمَنْ هُوَ قَائِمٌ عَلَىٰ كُلِّ نَفْسٍ بِمَا كَسَبَتْ\n🔹 Explication: Allah est établi sur Son Trône au-dessus des cieux, mais Il est avec nous par Sa connaissance, Sa vue et Son ouïe."
            },
            {
                q: "Comment doit-on appeler Allah ?",
                opts: ["Par des surnoms inventés", "Par les noms qu'Il S'est donnés Lui-même", "Par les noms des prophètes", "Juste 'Le destin'"],
                ans: 1,
                expl: "🔹 Verset (Arabe): وَلِلَّهِ الْأَسْمَاءُ الْحُسْنَىٰ فَادْعُوهُ بِهَا\n🔹 Traduction: \"C'est à Allah qu'appartiennent les noms les plus beaux. Invoquez-Le par ces noms.\" — Sourate Al-A'raf, verset 180."
            },
            {
                q: "Que signifie 'Al-Quddus' ?",
                opts: ["Le Très Saint (Pur de tout défaut)", "Le Roi", "Le Premier", "Le Gardien"],
                ans: 0,
                expl: "🔹 Verset (Arabe): الْمَلِكُ الْقُدُّوسُ\n🔹 Explication: Allah est exempt de toute imperfection, de toute ressemblance et de tout ce qui ne convient pas à Sa Majesté."
            },
            {
                q: "La connaissance des noms d'Allah augmente :",
                opts: ["La richesse", "La foi et l'amour pour Lui", "La fatigue", "L'orgueil"],
                ans: 1,
                expl: "🔹 Explication: Plus on connaît Allah, plus on L'aime, plus on Le craint et plus on se rapproche de Lui avec sincérité."
            }
        ];

        const siraP2 = [
            {
                q: "Dans quelle grotte le Prophète (SWS) se retirait-il pour méditer ?",
                opts: ["Grotte de Thawr", "Grotte de Hira", "Grotte d'Uhud", "Grotte de Badr"],
                ans: 1,
                expl: "🔹 Fait: Il s'y retirait plusieurs jours pour méditer sur la création et fuir l'idolâtrie de son peuple."
            },
            {
                q: "Quel âge avait le Prophète (SWS) lors de la première révélation ?",
                opts: ["25 ans", "40 ans", "33 ans", "63 ans"],
                ans: 1,
                expl: "🔹 Fait: C'est à l'âge de la maturité complète, 40 ans, qu'Allah l'a choisi comme Messager."
            },
            {
                q: "Quel fut le premier mot révélé par l'ange Jibril (AS) ?",
                opts: ["Islam", "Iqra (Lis !)", "Allah", "Salat"],
                ans: 1,
                expl: "🔹 Verset: « Lis, au nom de ton Seigneur qui a créé... » — Sourate Al-'Alaq, verset 1."
            },
            {
                q: "Quelle fut la réaction du Prophète (SWS) après sa première rencontre avec Jibril ?",
                opts: ["Il était fier", "Il était terrifié et tremblait", "Il s'est endormi", "Il a chanté"],
                ans: 1,
                expl: "🔹 Fait: Il est rentré chez Khadija (RA) en disant : « Couvrez-moi ! Couvrez-moi ! »"
            },
            {
                q: "Qui a rassuré le Prophète (SWS) en premier ?",
                opts: ["Abu Bakr", "Khadija bint Khuwaylid", "Ali", "Abu Talib"],
                ans: 1,
                expl: "🔹 Citation: Khadija lui dit : « Jamais Allah ne t'abandonnera, car tu es généreux, tu aides les pauvres et tu dis la vérité. »"
            },
            {
                q: "Quel savant chrétien a confirmé la mission prophétique de Muhammad (SWS) ?",
                opts: ["Héraclius", "Waraqa ibn Nawfal", "Le moine Bahira", "Négus"],
                ans: 1,
                expl: "🔹 Fait: Waraqa, cousin de Khadija, a reconnu qu'il s'agissait du même Ange (Namus) qui était venu à Moïse (AS)."
            },
            {
                q: "Pendant combien de temps l'appel à l'Islam est-il resté secret ?",
                opts: ["1 an", "3 ans", "10 ans", "5 ans"],
                ans: 1,
                expl: "🔹 Fait: Pour protéger la petite communauté naissante des agressions de Quraysh au début."
            },
            {
                q: "Où les premiers musulmans se réunissaient-ils en secret ?",
                opts: ["À la Kaaba", "Dans la maison d'Al-Arqam", "Chez Abu Bakr", "Dans une grotte"],
                ans: 1,
                expl: "🔹 Fait: La maison de Dar Al-Arqam est devenue le premier centre d'enseignement de l'Islam."
            },
            {
                q: "Quelle sourate a marqué la fin de la pause de la révélation ?",
                opts: ["Al-Fatiha", "Al-Muddathir", "Al-Ikhlas", "Yasin"],
                ans: 1,
                expl: "🔹 Verset: « Ô toi, le revêtu d'un manteau ! Lève-toi et avertis ! » — Sourate Al-Muddathir, versets 1-2."
            },
            {
                q: "Qui fut le premier homme libre à embrasser l'Islam ?",
                opts: ["Umar", "Abu Bakr As-Siddiq", "Uthman", "Ali"],
                ans: 1,
                expl: "🔹 Fait: Abu Bakr a cru immédiatement sans aucune hésitation."
            }
        ];

        const fiqhP1 = [
            {
                q: "Quel est le sens de 'At-Taharah' en Islam ?",
                opts: ["Le sport", "La purification (physique et spirituelle)", "Le pèlerinage", "Le jeûne"],
                ans: 1,
                expl: "🔹 Verset: « Certes, Allah aime ceux qui se repentent et Il aime ceux qui se purifient. » — Sourate Al-Baqarah, verset 222."
            },
            {
                q: "Quelle est la condition obligatoire pour la validité de la prière ?",
                opts: ["Avoir mangé", "Être en état de pureté (Wudu/Ghusl)", "Porter du blanc", "Être à la mosquée"],
                ans: 1,
                expl: "🔹 Hadith: « Allah n'accepte pas de prière sans purification. » (Sahih Muslim)."
            },
            {
                q: "Combien y a-t-il d'actes obligatoires (piliers) dans les ablutions (Wudu) ?",
                opts: ["4", "6", "10", "3"],
                ans: 1,
                expl: "🔹 Verset: « Ô vous qui croyez ! Lorsque vous vous levez pour la Salat, lavez vos visages, vos mains jusqu'aux coudes, passez les mains mouillées sur vos têtes et lavez vos pieds jusqu'aux chevilles. » — Sourate Al-Ma'idah, verset 6."
            },
            {
                q: "Qu'est-ce qui annule le Wudu ?",
                opts: ["Boire de l'eau", "Sortir un gaz ou dormir profondément", "Rire", "Parler"],
                ans: 1,
                expl: "🔹 Explication: Tout ce qui sort par les deux orifices naturels, ainsi que la perte de conscience, annule les ablutions."
            },
            {
                q: "Quel instrument le Prophète (SWS) recommandait-il pour la pureté de la bouche ?",
                opts: ["Un fil", "Le Siwak", "Du sel", "De l'eau chaude"],
                ans: 1,
                expl: "🔹 Hadith: « Si je ne craignais pas de surcharger ma communauté, je leur ordonnerais le Siwak avant chaque prière. » (Bukhari & Muslim)."
            },
            {
                q: "Peut-on faire le Wudu avec de l'eau de mer ?",
                opts: ["Non, c'est trop salé", "Oui, son eau est pure", "Seulement si on est sur un bateau", "Uniquement pour le Ghusl"],
                ans: 1,
                expl: "🔹 Hadith: Interrogé sur l'eau de mer, le Prophète (SWS) a dit: « Son eau est purifiante et ses bêtes mortes sont licites. » (At-Tirmidhi)."
            },
            {
                q: "Que doit-on faire si on ne trouve pas d'eau pour se purifier ?",
                opts: ["Prier quand même", "Faire le Tayammum (avec de la terre pure)", "Attendre le lendemain", "Ne pas prier"],
                ans: 1,
                expl: "🔹 Verset: « ... et que vous ne trouviez pas d'eau, alors recourez à une terre propre et passez-en sur vos visages et vos mains. » — Sourate Al-Ma'idah, verset 6."
            },
            {
                q: "Dans quel ordre doit-on faire les membres du Wudu ?",
                opts: ["N'importe lequel", "L'ordre mentionné dans le Coran (At-Tartib)", "D'abord les pieds", "D'abord la tête"],
                ans: 1,
                expl: "🔹 Explication: L'ordre est un pilier du Wudu selon la majorité des savants."
            },
            {
                q: "Est-il obligatoire de laver chaque membre 3 fois ?",
                opts: ["Oui, c'est un pilier", "Non, une seule fois est obligatoire, trois fois est une Sounnah", "Non, deux fois est le minimum", "Oui, sinon c'est nul"],
                ans: 1,
                expl: "🔹 Fait: Le Prophète (SWS) a parfois fait le Wudu en lavant chaque membre une seule fois."
            },
            {
                q: "L'intention (Niyyah) est-elle nécessaire avant de commencer le Wudu ?",
                opts: ["Optionnelle", "Obligatoire dans le cœur", "Doit être dite à voix haute", "Seulement pour le vendredi"],
                ans: 1,
                expl: "🔹 Hadith: « Les actions ne valent que par les intentions. » (Bukhari). L'intention doit être présente avant l'adoration."
            }
        ];

        const insertQ = async (catId, phase, data) => {
            for (const item of data) {
                await dbRun(
                    'INSERT INTO questions (difficulty, phase, type, question, options, correct, categoryId, explanation) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                    [1, phase, 'mcq', item.q, JSON.stringify(item.opts), item.ans, catId, item.expl]
                );
            }
        };

        await insertQ(1, 4, tawhidP4);
        await insertQ(3, 2, siraP2);
        await insertQ(2, 1, fiqhP1);

        console.log('Ultimate Expansion successful.');

    } catch (err) {
        console.error('Expansion failed:', err);
    } finally {
        db.close();
    }
}

ultimateExpansion();
