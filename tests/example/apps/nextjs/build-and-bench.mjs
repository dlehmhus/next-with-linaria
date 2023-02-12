import { execSync } from 'child_process';
import { promises as fs } from 'fs';
import { join } from 'path';
import prettyMs from 'pretty-ms';
import { fileURLToPath } from 'url';

const CWD = join(fileURLToPath(import.meta.url), '..');

async function buildAndBench() {
  // ignore error
  await fs.rm('.next', { recursive: true, force: true }).catch(() => {});

  execSync(`pnpm run build`, {
    cwd: CWD,
    stdio: 'inherit',
    env: {
      ...process.env,
      TRACE_TARGET: 'jaeger',
    },
  });
  const traceString = await fs.readFile(join(CWD, '.next', 'trace'), 'utf8');
  const traces = traceString
    .split('\n')
    .filter((line) => line)
    .map((line) => JSON.parse(line));
  const { duration } = traces.pop().find(({ name }) => name === 'next-build');
  console.info('next build duration: ', prettyMs(duration / 1000));
}

buildAndBench();
