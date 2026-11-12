const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const { mkdtempSync, readFileSync } = require('node:fs');
const { tmpdir } = require('node:os');
const path = require('node:path');
const test = require('node:test');

test('npm run build emits a bundle and exits successfully without watching', async () => {
    const output = mkdtempSync(path.join(tmpdir(), 'aviator-build-test-'));
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
});
