process.env.DATABASE_URL =
  process.env.E2E_DATABASE_URL ||
  'postgresql://depois:depois@127.0.0.1:5432/depois_test?schema=public';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-test-secret-test-secret';
process.env.COOKIE_SECURE = 'false';
process.env.NODE_ENV = 'test';
