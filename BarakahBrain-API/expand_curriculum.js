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

async function expandCurriculum() {
    try {
        console.log('Cleaning existing Phase 3 Tawhid and Phase 1 Sira questions...');
        await dbRun('DELETE FROM questions WHERE (categoryId = 1 AND phase = 3) OR (categoryId = 3 AND phase = 1)');

        const tawhidP3 = [
            {
                q: "Que signifie le Tawhid al-Uluhiyyah ?",
                opts: ["L’Unicité dans la création", "L’Unicité dans l’adoration", "L’Unicité dans les noms", "L’Unicité des prophètes"],
                ans: 1,
                expl: "🔹 Verset (Arabe): إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ\n🔹 Traduction: \"C'est Toi seul que nous adorons, et c'est de Toi seul que nous cherchons l'aide.\" — Sourate Al-Fatiha, verset 5\n🔹 Explication: Al-Uluhiyyah consiste à vouer tous les actes d'adoration à Allah SEUL sans aucun associé."
            },
            {
                q: "Quel est le but de la création des djinns et des hommes ?",
                opts: ["Le divertissement", "L'adoration d'Allah", "La conquête du monde", "Le sommeil"],
                ans: 1,
                expl: "🔹 Verset (Arabe): وَمَا خَلَقْتُ الْجِنَّ وَالْإِنسَ إِلَّا لِيَعْبُدُونِ\n🔹 Traduction: \"Je n'ai créé les djinns et les hommes que pour qu'ils M'adorent.\" — Sourate Adh-Dhariyat, verset 56\n🔹 Explication: Tout notre existence est centrée sur la reconnaissance et l'adoration du Créateur."
            },
            {
                q: "Quelle est l'adoration la plus importante après les piliers ?",
                opts: ["L'invocation (Du'a)", "Le sport", "Le commerce", "Le voyage"],
                ans: 0,
                expl: "🔹 Hadith: Le Prophète (SWS) a dit: \"L'invocation, c'est cela l'adoration.\" (Rapporté par At-Tirmidhi)\n🔹 Explication: Demander à Allah directement est l'essence même de notre dépendance envers Lui."
            },
            {
                q: "À qui doit-on demander de l'aide pour les choses invisibles (Ghayb) ?",
                opts: ["Aux devins", "Aux anges", "À Allah seul", "Aux étoiles"],
                ans: 2,
                expl: "🔹 Verset (Arabe): وَإِلَيْهِ يُرْجَعُ الْأَمْرُ كُلُّهُ فَاعْبُدْهُ وَتَوَكَّلْ عَلَيْهِ\n🔹 Traduction: \"C'est vers Lui que tout revient. Adore-Le donc et place ta confiance en Lui.\" — Sourate Hud, verset 123.\n🔹 Explication: Seul Allah connaît l'invisible et détient le pouvoir absolu."
            },
            {
                q: "Que signifie 'Al-Ikhlas' dans l'adoration ?",
                opts: ["La rapidité", "La sincérité pure pour Allah", "Le faire devant tout le monde", "La mémorisation"],
                ans: 1,
                expl: "🔹 Verset (Arabe): وَمَا أُمِرُوا إِلَّا لِيَعْبُدُوا اللَّهَ مُخْلِصِينَ لَهُ الدِّينَ\n🔹 Traduction: \"Il ne leur a été ordonné que d'adorer Allah, Lui vouant un culte exclusif.\" — Sourate Al-Bayyinah, verset 5.\n🔹 Explication: L'acte n'est accepté que s'il est fait uniquement pour plaire à Allah."
            },
            {
                q: "Peut-on sacrifier un animal au nom d'un autre qu'Allah ?",
                opts: ["Oui, pour l'honneur", "Seulement pour les rois", "Non, c'est du Shirk", "Oui, si on mentionne aussi Allah"],
                ans: 2,
                expl: "🔹 Verset (Arabe): فَصَلِّ لِرَبِّكَ وَانْحَرْ\n🔹 Traduction: \"Prie donc ton Seigneur et sacrifie.\" — Sourate Al-Kawthar, verset 2.\n🔹 Explication: Le sacrifice est un acte d'adoration qui appartient à Allah seul."
            },
            {
                q: "Quel est le sentiment qui doit accompagner l'adoration ?",
                opts: ["L'ennui", "L'amour, la crainte et l'espoir", "La tristesse", "La colère"],
                ans: 1,
                expl: "🔹 Verset (Arabe): يَدْعُونَ رَبَّهُمْ خَوْفًا وَطَمَعًا\n🔹 Traduction: \"Ils invoquent leur Seigneur par crainte et par espoir.\" — Sourate As-Sajdah, verset 16.\n🔹 Explication: Les trois piliers du cœur : Aimer Allah, Le craindre et espérer en Sa miséricorde."
            },
            {
                q: "Que doit faire un musulman s'il a peur d'autre qu'Allah (peur secrète) ?",
                opts: ["Porter un talisman", "Augmenter son Tawhid", "Fuir le pays", "Consulter un mage"],
                ans: 1,
                expl: "🔹 Verset (Arabe): فَلَا تَخَافُوهُمْ وَخَافُونِ إِن كُنتُم مُّؤْمِنِينَ\n🔹 Traduction: \"Ne les craignez donc pas, mais craignez-Moi, si vous êtes croyants.\" — Sourate Al-Imran, verset 175.\n🔹 Explication: La crainte absolue appartient à Allah seul."
            },
            {
                q: "Quelle est la récompense de celui qui meurt avec le Tawhid pur ?",
                opts: ["La richesse", "Le Paradis éternel", "Le respect des gens", "Une statue"],
                ans: 1,
                expl: "🔹 Hadith: Le Prophète (SWS) a dit: \"Quiconque meurt sans rien associer à Allah entrera au Paradis.\" (Sahih Muslim)\n🔹 Explication: Le Tawhid est la clé du succès ici-bas et dans l'au-delà."
            },
            {
                q: "L'Islam est fondé sur :",
                opts: ["Le doute", "La soumission à Allah seul", "Les traditions des ancêtres", "La philosophie"],
                ans: 1,
                expl: "🔹 Verset (Arabe): وَمَن يُسْلِمْ وَجْهَهُ إِلَى اللَّهِ وَهُوَ مُحْسِنٌ فَقَدِ اسْتَمْسَكَ بِالْعُرْوَةِ الْوُثْقَىٰ\n🔹 Traduction: \"Et quiconque soumet son visage à Allah tout en étant bienfaisant s'est certes accroché à l'anse la plus solide.\" — Sourate Luqman, verset 22."
            }
        ];

        const siraP1 = [
            {
                q: "Dans quelle ville est né le Prophète Muhammad (SWS) ?",
                opts: ["Médine", "La Mecque", "Jérusalem", "Taïf"],
                ans: 1,
                expl: "🔹 Fait: Le Prophète est né à La Mecque dans l'année de l'Éléphant (570 ap. J.-C.).\n🔹 Explication: Cette ville abritait la Kaaba, construite par Ibrahim (AS)."
            },
            {
                q: "Comment s'appelait le père du Prophète (SWS) ?",
                opts: ["Abu Talib", "Abdullah", "Abdul-Muttalib", "Hamza"],
                ans: 1,
                expl: "🔹 Fait: Abdullah b. Abdul-Muttalib est décédé avant la naissance du Prophète (SWS).\n🔹 Explication: Le Prophète (SWS) est né orphelin de père."
            },
            {
                q: "Qui était la nourrice du Prophète (SWS) dans le désert ?",
                opts: ["Khadija", "Halima As-Sa'diyya", "Amina", "Baraka"],
                ans: 1,
                expl: "🔹 Fait: Halima l'a emmené chez les Banu Sa'd pour qu'il grandisse avec la langue arabe pure et la force du désert."
            },
            {
                q: "Comment s'appelait le grand-père qui a pris soin de lui après sa mère ?",
                opts: ["Abu Lahab", "Hamza", "Abdul-Muttalib", "Abu Sufyan"],
                ans: 2,
                expl: "🔹 Fait: Abdul-Muttalib, chef des Quraysh, l'aimait énormément et le plaçait sur son propre tapis près de la Kaaba."
            },
            {
                q: "Quel métier le Prophète (SWS) a-t-il exercé durant sa jeunesse ?",
                opts: ["Forgeron", "Berger", "Architecte", "Marin"],
                ans: 1,
                expl: "🔹 Fait: Comme tous les prophètes, Muhammad (SWS) a gardé les moutons, ce qui lui a appris la patience et la gérance."
            },
            {
                q: "Quel surnom les habitants de la Mecque lui donneraient-ils ?",
                opts: ["Le Roi", "Al-Amin (L'honnête / Le digne de confiance)", "Le Magicien", "Le Chef"],
                ans: 1,
                expl: "🔹 Fait: Même avant la révélation, il était respecté pour son intégrité absolue dans les paroles et les actes."
            },
            {
                q: "Quel événement marquant a eu lieu lorsqu'il avait 4 ans chez Halima ?",
                opts: ["Un voyage à Rome", "L'ouverture de sa poitrine par deux anges", "La perte de ses moutons", "Une grande fête"],
                ans: 1,
                expl: "🔹 Fait: Deux hommes vêtus de blanc (anges) lui ont ouvert la poitrine pour en retirer la part de Shaytan et purifier son cœur."
            },
            {
                q: "Qui était l'oncle qui l'a protégé jusqu'à sa mort ?",
                opts: ["Abu Lahab", "Al-Abbas", "Abu Talib", "Hamza"],
                ans: 2,
                expl: "🔹 Fait: Abu Talib a pris le relais après la mort du grand-père et l'a protégé avec tout son pouvoir contre les ennemis."
            },
            {
                q: "À quel âge le Prophète (SWS) a-t-il perdu sa mère, Amina ?",
                opts: ["2 ans", "6 ans", "10 ans", "15 ans"],
                ans: 1,
                expl: "🔹 Fait: Elle est décédée à Abwa alors qu'ils revenaient de Médine. Baraka l'a ramené à la Mecque."
            },
            {
                q: "Quel était le nom de son voyage commercial où un moine a reconnu ses signes ?",
                opts: ["Voyage à Bassora", "Voyage en Syrie (Sham)", "Voyage au Yémen", "Voyage en Égypte"],
                ans: 1,
                expl: "🔹 Fait: Le moine Bahira a vu les nuages l'ombrager et a conseillé à Abu Talib de le ramener pour le protéger."
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

        await insertQ(1, 3, tawhidP3);
        await insertQ(3, 1, siraP1);

        console.log('Expansion successful.');

    } catch (err) {
        console.error('Expansion failed:', err);
        process.exit(1);
    } finally {
        db.close();
    }
}

expandCurriculum();
