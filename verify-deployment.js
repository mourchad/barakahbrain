#!/usr/bin/env node

/**
 * Pre-Deployment Verification Script
 * Valide que BarakahBrain est prêt pour le déploiement Render
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const checks = [];
let passed = 0;
let failed = 0;

function log(type, message) {
    const symbols = { '✓': '✓', '✗': '✗', '⚠': '⚠', 'ℹ': 'ℹ' };
    const colors = { 
        pass: '\x1b[32m', 
        fail: '\x1b[31m', 
        warn: '\x1b[33m', 
        info: '\x1b[36m',
        reset: '\x1b[0m'
    };
    
    if (type === 'pass') {
        console.log(`${colors.pass}${symbols['✓']}${colors.reset} ${message}`);
        passed++;
    } else if (type === 'fail') {
        console.log(`${colors.fail}${symbols['✗']}${colors.reset} ${message}`);
        failed++;
    } else if (type === 'warn') {
        console.log(`${colors.warn}${symbols['⚠']}${colors.reset} ${message}`);
    } else if (type === 'info') {
        console.log(`${colors.info}${symbols['ℹ']}${colors.reset} ${message}`);
    } else {
        console.log(message);
    }
}

console.log('\n🔍 BarakahBrain Pre-Deployment Verification\n');

// ── Minified Assets Check ─────────────────────────────────
log('info', 'Checking minified assets...');
const assetFiles = [
    'BarakahBrain/assets/app.min.js',
    'BarakahBrain/assets/styles.min.css',
    'BarakahBrain/assets/layouts.min.js',
    'BarakahBrain/assets/i18n.min.js'
];
assetFiles.forEach(file => {
    if (fs.existsSync(file)) {
        const size = fs.statSync(file).size;
        log('pass', `${file} (${(size / 1024).toFixed(1)}KB)`);
    } else {
        log('fail', `${file} — NOT FOUND`);
    }
});

// ── HTML Pages Check ─────────────────────────────────────
log('info', 'Checking HTML pages...');
const htmlPages = [
    'BarakahBrain/index.html',
    'BarakahBrain/connexion.html',
    'BarakahBrain/inscription.html',
    'BarakahBrain/dashboard.html',
    'BarakahBrain/quiz.html',
    'BarakahBrain/profil.html',
    'BarakahBrain/admin/superadmin1.html'
];
htmlPages.forEach(file => {
    if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');
        if (content.includes('window.API_BASE') || content.includes('meta name="api-base"')) {
            log('pass', `${file} (API_BASE configured)`);
        } else {
            log('warn', `${file} — API_BASE not detected`);
        }
    } else {
        log('fail', `${file} — NOT FOUND`);
    }
});

// ── Backend Files Check ───────────────────────────────────
log('info', 'Checking backend files...');
const backendFiles = [
    'BarakahBrain-API/server.js',
    'BarakahBrain-API/package.json',
    'BarakahBrain-API/.env.example'
];
backendFiles.forEach(file => {
    if (fs.existsSync(file)) {
        log('pass', file);
    } else {
        log('fail', `${file} — NOT FOUND`);
    }
});

// ── package.json Scripts Check ────────────────────────────
log('info', 'Checking npm scripts...');
try {
    const pkgJson = JSON.parse(fs.readFileSync('BarakahBrain-API/package.json', 'utf8'));
    const requiredScripts = ['start', 'dev', 'test', 'lint', 'build:assets'];
    requiredScripts.forEach(script => {
        if (pkgJson.scripts && pkgJson.scripts[script]) {
            log('pass', `npm run ${script}`);
        } else {
            log('warn', `npm run ${script} — not defined`);
        }
    });
} catch (e) {
    log('fail', `package.json parse error: ${e.message}`);
}

// ── Git Status Check ──────────────────────────────────────
log('info', 'Checking git status...');
try {
    const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' }).trim();
    if (gitStatus === '') {
        log('pass', 'All changes committed');
    } else {
        log('warn', `Uncommitted files:\n${gitStatus.split('\n').slice(0, 3).map(l => '  ' + l).join('\n')}${gitStatus.split('\n').length > 3 ? '\n  ...' : ''}`);
    }
} catch (e) {
    log('warn', 'Git not available or not initialized');
}

// ── GitHub Actions Workflows Check ────────────────────────
log('info', 'Checking GitHub Actions workflows...');
const workflows = [
    '.github/workflows/ci-cd.yml',
    '.github/workflows/deploy.yml'
];
workflows.forEach(file => {
    if (fs.existsSync(file)) {
        log('pass', file);
    } else {
        log('warn', `${file} — not found (optional)`);
    }
});

// ── README & Documentation Check ──────────────────────────
log('info', 'Checking documentation...');
const docs = [
    'README.md',
    'GUIDE_DEPLOIEMENT_FINAL_RENDER.md'
];
docs.forEach(file => {
    if (fs.existsSync(file)) {
        log('pass', file);
    } else {
        log('warn', `${file} — not found`);
    }
});

// ── Environment Variables Check ───────────────────────────
log('info', 'Checking environment configuration...');
if (fs.existsSync('BarakahBrain-API/.env')) {
    log('warn', '.env file found locally — ensure to NOT push this to GitHub!');
} else {
    log('pass', '.env file not in repo (good practice)');
}
if (fs.existsSync('BarakahBrain-API/.env.example')) {
    log('pass', '.env.example present');
} else {
    log('fail', '.env.example — NOT FOUND');
}

// ── Summary ──────────────────────────────────────────────
console.log(`\n${'─'.repeat(50)}`);
console.log(`\nResults: ${passed} passed, ${failed} failed\n`);

if (failed === 0) {
    console.log('✅ Your BarakahBrain is ready for Render deployment!');
    console.log('\nNext steps:');
    console.log('1. Create API service on Render (if not done)');
    console.log('2. Set environment variables on Render');
    console.log('3. Create Frontend static site on Render');
    console.log('4. Follow GUIDE_DEPLOIEMENT_FINAL_RENDER.md\n');
    process.exit(0);
} else {
    console.log('⚠️  Please fix the errors above before deploying.\n');
    process.exit(1);
}
