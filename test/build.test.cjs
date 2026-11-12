const assert = require('node:assert/strict');
const { spawn, spawnSync } = require('node:child_process');
const { cpSync, mkdtempSync, readFileSync, writeFileSync } = require('node:fs');
const { createServer } = require('node:http');
const { tmpdir } = require('node:os');
const path = require('node:path');
const test = require('node:test');

test('Wrangler configuration opts into branch previews', () => {
    const config = JSON.parse(readFileSync(path.resolve(__dirname, '../wrangler.json'), 'utf8'));
    assert.ok(config.previews && typeof config.previews === 'object' && !Array.isArray(config.previews),
        'Wrangler requires a top-level previews object for the preview command');
});

test('npm run build exits successfully and Wrangler packages its static assets', async () => {
    const fixture = mkdtempSync(path.join(tmpdir(), 'aviator-build-test-'));
    const output = path.join(fixture, 'dist');
    const root = path.resolve(__dirname, '..');
    // A clean checkout supplies the tracked HTML and static files; webpack replaces its bundle.
    cpSync(path.join(root, 'dist'), output, { recursive: true });
    const result = await new Promise((resolve, reject) => {
        const child = spawn('npm', ['run', 'build', '--', '--output-path', output], {
            cwd: path.resolve(__dirname, '..'),
            detached: true,
            stdio: ['ignore', 'pipe', 'pipe']
        });
        let logs = '';
        let timedOut = false;
        child.stdout.on('data', chunk => { logs += chunk; });
        child.stderr.on('data', chunk => { logs += chunk; });
        const timer = setTimeout(() => {
            timedOut = true;
            process.kill(-child.pid, 'SIGKILL');
        }, 30000);
        child.on('error', error => {
            clearTimeout(timer);
            reject(error);
        });
        child.on('close', (code, signal) => {
            clearTimeout(timer);
            resolve({ code, signal, logs, timedOut });
        });
    });

    assert.equal(result.timedOut, false, `Build did not exit within 30 seconds:\n${result.logs}`);
    assert.equal(result.signal, null, result.logs);
    assert.equal(result.code, 0, result.logs);
    assert.ok(readFileSync(path.join(output, 'bundle.js')).length > 0, 'Build must emit bundle.js');

    const html = readFileSync(path.join(output, 'index.html'), 'utf8');
    assert.match(html, /<script\s+src="bundle\.js"/);
    const config = JSON.parse(readFileSync(path.join(root, 'wrangler.json'), 'utf8'));
    if (config.assets) {
        assert.equal(path.resolve(root, config.assets.directory), require('../webpack.config.js').output.path,
            'Wrangler must serve webpack output');
        config.assets.directory = output;
    }
    const configPath = path.join(fixture, 'wrangler.json');
    writeFileSync(configPath, JSON.stringify(config));
    // Real CLI validation and asset packaging, without authentication or publication.
    const packaging = spawnSync(process.execPath, [path.join(root, 'node_modules/wrangler/bin/wrangler.js'),
        'deploy', '--config', configPath, '--dry-run', '--outdir', path.join(fixture, 'worker')], {
        cwd: root, encoding: 'utf8', timeout: 30000,
        env: { ...process.env, CI: 'true', WRANGLER_SEND_METRICS: 'false',
            WRANGLER_SEND_ERROR_REPORTS: 'false', WRANGLER_LOG_PATH: path.join(fixture, 'wrangler.log') }
    });
    assert.equal(packaging.error, undefined, String(packaging.error));
    assert.equal(packaging.status, 0, packaging.stdout + packaging.stderr);
    assert.match(packaging.stdout, /dry-run.*exiting now/);
});

test('Wrangler preview validates the config before making only a mocked lookup', { timeout: 30000 }, async () => {
    const root = path.resolve(__dirname, '..');
    const requests = [];
    const marker = 'LOCAL_PREVIEW_CONFIG_ACCEPTED';
    const api = createServer((request, response) => {
        requests.push({ method: request.method, url: request.url });
        // Reject the initial read, before Wrangler can create or upload anything.
        response.writeHead(400, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ success: false, errors: [{ code: 99999, message: marker }] }));
    });
    await new Promise(resolve => api.listen(0, '127.0.0.1', resolve));
    try {
        const child = spawn(process.execPath, [path.join(root, 'node_modules/wrangler/bin/wrangler.js'),
            'preview', '--config', path.join(root, 'wrangler.json'), '--name', 'config-regression',
            '--json', '--ignore-base-config'], {
            cwd: root, stdio: ['ignore', 'pipe', 'pipe'], timeout: 20000,
            env: { ...process.env, CI: 'true', WRANGLER_SEND_METRICS: 'false',
                WRANGLER_SEND_ERROR_REPORTS: 'false', CLOUDFLARE_API_TOKEN: 'local-test-token',
                CLOUDFLARE_ACCOUNT_ID: 'local-test-account',
                CLOUDFLARE_API_BASE_URL: `http://127.0.0.1:${api.address().port}/client/v4` }
        });
        let logs = '';
        child.stdout.on('data', chunk => { logs += chunk; });
        child.stderr.on('data', chunk => { logs += chunk; });
        const code = await new Promise((resolve, reject) => {
            child.on('error', reject);
            child.on('close', resolve);
        });
        assert.equal(code, 1, 'the local fake API intentionally rejects the request');
        assert.match(logs, new RegExp(marker), logs);
        assert.deepEqual(requests, [{ method: 'GET',
            url: '/client/v4/accounts/local-test-account/workers/workers/aviator/previews/config-regression' }]);
    } finally {
        api.closeAllConnections();
        await new Promise(resolve => api.close(resolve));
    }
});
