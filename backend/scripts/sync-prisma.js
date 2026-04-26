// Regenerates the Prisma client and triggers a Nest restart.
//
// On Windows, the running Nest process can hold `query_engine-windows.dll.node`
// open. `prisma generate` then fails to rename the temp file, but the JS/TS
// shim files are still refreshed — which is what matters for typings.
// We swallow that specific EPERM error and always touch `src/main.ts` so the
// Nest watcher restarts and picks up the regenerated client.

const { spawn } = require('node:child_process');
const { utimes } = require('node:fs/promises');
const path = require('node:path');

const cwd = path.resolve(__dirname, '..');
const mainTs = path.resolve(cwd, 'src', 'main.ts');

function runPrismaGenerate() {
  return new Promise((resolve) => {
    // Use `shell: true` so this works with the Windows .cmd shim for npx.
    const child = spawn('npx prisma generate', {
      cwd,
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: true,
    });

    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => (stdout += chunk.toString()));
    child.stderr.on('data', (chunk) => (stderr += chunk.toString()));

    child.on('close', (code) => {
      const combined = stdout + stderr;
      const isBenignDllLock =
        /EPERM|operation not permitted/.test(combined) &&
        /query_engine-windows\.dll/.test(combined);

      if (code === 0) {
        console.log('[prisma:sync] Prisma client regenerated.');
        resolve(true);
      } else if (isBenignDllLock) {
        console.log(
          '[prisma:sync] Prisma client TS shims regenerated (DLL was locked by the running server — that is fine on Windows).',
        );
        resolve(true);
      } else {
        console.error('[prisma:sync] prisma generate failed:\n' + combined);
        resolve(false);
      }
    });
  });
}

async function touchMain() {
  const now = new Date();
  try {
    await utimes(mainTs, now, now);
    console.log('[prisma:sync] Touched src/main.ts — Nest will restart.');
  } catch (err) {
    console.error('[prisma:sync] failed to touch src/main.ts:', err);
  }
}

(async () => {
  await runPrismaGenerate();
  await touchMain();
})();
