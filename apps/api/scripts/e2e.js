const { spawnSync } = require('node:child_process');

const url =
  process.env.E2E_DATABASE_URL ||
  'postgresql://depois:depois@127.0.0.1:5432/depois_test?schema=public';

const env = {
  ...process.env,
  DATABASE_URL: url,
  E2E_DATABASE_URL: url,
  JWT_SECRET: process.env.JWT_SECRET || 'test-secret-test-secret-test-secret',
  COOKIE_SECURE: 'false',
};

function run(command, args) {
  const result = spawnSync(command, args, { stdio: 'inherit', env });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

run('npx', ['prisma', 'migrate', 'deploy']);
run('npx', ['jest', '--config', './test/jest-e2e.json', '--runInBand', '--forceExit']);
