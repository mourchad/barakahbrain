// simple migration helper for sqlite schema updates
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

function run(sql, params=[]) {
    return new Promise((res, rej) => {
        db.run(sql, params, function(err) {
            if (err) rej(err);
            else res(this);
        });
    });
}

(async () => {
    try {
        console.log('Applying migrations...');
        await run('ALTER TABLE resultats_quiz ADD COLUMN categoryId INTEGER');
        console.log('Added categoryId to resultats_quiz');
    } catch(e) {
        if (/duplicate column name/.test(e.message)) {
            console.log('categoryId column already present.');
        } else {
            console.error('Migration error:', e.message);
        }
    }
    db.close();
    console.log('Migrations complete.');
})();
