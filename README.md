# Depois

Monólito para guardar e categorizar o que você quer ver, ouvir ou ler depois: filmes, séries, animes, músicas, podcasts, artigos e outros. O item pode ter um link ou só o nome. Quando terminar, marque como visto.

A interface é mobile first, com modo escuro, Roboto e os idiomas pt-BR e en-US. O acesso por enquanto é pela web, em um único endereço.

## Stack

- Web: Next.js, React, TypeScript, Tailwind CSS e Zod
- API: NestJS, Prisma e PostgreSQL
- O navegador fala só com o Next (porta 3000). A API fica na rede interna e o Next faz o proxy em `/api`.

## Subir com Docker

```bash
docker compose up --build
```

Abra `http://localhost:3000`.

O `JWT_SECRET` do `docker-compose.yml` é só para desenvolvimento. Troque antes de publicar.

## Desenvolvimento local

Com o Postgres no ar (`docker compose up db` ou um Postgres local em `127.0.0.1:5432`, usuário e senha `depois`, bancos `depois` e `depois_test`):

```bash
cp apps/api/.env.example apps/api/.env
npm install
npm run dev
```

- Web: `http://localhost:3000`
- API interna: `http://127.0.0.1:3001`

## Testes

```bash
npm test
npm run test:e2e
```

`npm test` cobre validação, regras de autenticação e de itens. `npm run test:e2e` sobe a API contra o banco `depois_test` e percorre cadastro, item sem link, marcar como visto e o isolamento entre contas.

## Cor e fonte

A cor primária é `#a83264`. A fonte da interface é Roboto.
