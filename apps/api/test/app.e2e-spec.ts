import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/configure-app';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Depois API (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();
    prisma = app.get(PrismaService);
  });

  beforeEach(async () => {
    await prisma.item.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await app.close();
  });

  function cookieFrom(response: request.Response) {
    const raw = response.headers['set-cookie'];
    const list = Array.isArray(raw) ? raw : raw ? [raw] : [];
    return list.map((value) => value.split(';')[0]).join('; ');
  }

  it('registers, saves a name without a link, marks it seen, and hides it from another account', async () => {
    const registered = await request(app.getHttpServer()).post('/api/auth/register').send({
      name: 'Ana Lima',
      email: 'Ana@Example.com',
      password: 'senha1234',
    });
    expect(registered.status).toBe(201);
    expect(registered.body.user).toEqual({
      id: expect.any(String),
      name: 'Ana Lima',
      email: 'ana@example.com',
    });
    expect(JSON.stringify(registered.body)).not.toContain('password');
    const cookie = cookieFrom(registered);
    expect(cookie).toContain('depois_token=');

    const unnamedLink = await request(app.getHttpServer())
      .post('/api/items')
      .set('Cookie', cookie)
      .send({ title: 'Past Lives', category: 'movie' });
    expect(unnamedLink.status).toBe(201);
    expect(unnamedLink.body.url).toBeNull();
    expect(unnamedLink.body.seen).toBe(false);

    const article = await request(app.getHttpServer())
      .post('/api/items')
      .set('Cookie', cookie)
      .send({
        title: 'Ensaio de domingo',
        category: 'article',
        url: 'example.com/ensaio',
        notes: 'ler com calma',
      });
    expect(article.status).toBe(201);
    expect(article.body.url).toBe('https://example.com/ensaio');

    const movies = await request(app.getHttpServer())
      .get('/api/items')
      .query({ category: 'movie' })
      .set('Cookie', cookie);
    expect(movies.status).toBe(200);
    expect(movies.body.items).toHaveLength(1);
    expect(movies.body.summary.pending).toBe(2);

    const seen = await request(app.getHttpServer())
      .patch(`/api/items/${unnamedLink.body.id}/seen`)
      .set('Cookie', cookie)
      .send({ seen: true });
    expect(seen.status).toBe(200);
    expect(seen.body.seen).toBe(true);
    expect(seen.body.seenAt).toEqual(expect.any(String));

    const pending = await request(app.getHttpServer())
      .get('/api/items')
      .query({ status: 'pending', q: 'ensaio' })
      .set('Cookie', cookie);
    expect(pending.body.items.map((item: { id: string }) => item.id)).toEqual([article.body.id]);
    expect(pending.body.summary).toMatchObject({ pending: 1, seen: 1 });

    const other = await request(app.getHttpServer()).post('/api/auth/register').send({
      name: 'Bia',
      email: 'bia@example.com',
      password: 'senha1234',
    });
    const otherCookie = cookieFrom(other);
    const hidden = await request(app.getHttpServer()).get('/api/items').set('Cookie', otherCookie);
    expect(hidden.body.items).toEqual([]);
    expect(hidden.body.summary.total).toBe(0);

    const stolen = await request(app.getHttpServer())
      .patch(`/api/items/${unnamedLink.body.id}/seen`)
      .set('Cookie', otherCookie)
      .send({ seen: false });
    expect(stolen.status).toBe(404);
    expect(stolen.body.code).toBe('NOT_FOUND');

    const removed = await request(app.getHttpServer())
      .delete(`/api/items/${article.body.id}`)
      .set('Cookie', cookie);
    expect(removed.status).toBe(200);

    const me = await request(app.getHttpServer()).get('/api/auth/me').set('Cookie', cookie);
    expect(me.body.email).toBe('ana@example.com');

    const loggedOut = await request(app.getHttpServer())
      .post('/api/auth/logout')
      .set('Cookie', cookie);
    expect(loggedOut.status).toBe(200);
  });

  it('rejects duplicate emails, bad passwords and invalid items', async () => {
    await request(app.getHttpServer()).post('/api/auth/register').send({
      name: 'Ana',
      email: 'ana@example.com',
      password: 'senha1234',
    });
    const duplicate = await request(app.getHttpServer()).post('/api/auth/register').send({
      name: 'Ana 2',
      email: 'ana@example.com',
      password: 'senha1234',
    });
    expect(duplicate.status).toBe(409);
    expect(duplicate.body.code).toBe('EMAIL_IN_USE');

    const wrong = await request(app.getHttpServer()).post('/api/auth/login').send({
      email: 'ana@example.com',
      password: 'errada123',
    });
    expect(wrong.status).toBe(401);
    expect(wrong.body.code).toBe('INVALID_CREDENTIALS');

    const anonymous = await request(app.getHttpServer()).get('/api/items');
    expect(anonymous.status).toBe(401);

    const logged = await request(app.getHttpServer()).post('/api/auth/login').send({
      email: 'ana@example.com',
      password: 'senha1234',
    });
    const cookie = cookieFrom(logged);
    const invalid = await request(app.getHttpServer())
      .post('/api/items')
      .set('Cookie', cookie)
      .send({ title: '   ', category: 'movie', url: 'javascript:alert(1)' });
    expect(invalid.status).toBe(400);
    expect(invalid.body.code).toBe('VALIDATION');

    const health = await request(app.getHttpServer()).get('/api/health');
    expect(health.status).toBe(200);
    expect(health.body.status).toBe('ok');
  });
});
