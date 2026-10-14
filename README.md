# Commander Match Tracker

Monorepo com backend em NestJS + TypeScript e frontend em Next.js + TypeScript para registrar partidas de Commander (Magic).

## Estrutura

- `backend/`: API REST em NestJS
- `frontend/`: interface web em Next.js
- `docker-compose.yml`: MySQL local
- `infra/mysql/init/01-init.sql`: script inicial do banco

## Requisitos

- Node.js 20+
- npm
- Docker + Docker Compose

## 1) Subir MySQL local

```bash
docker compose up -d
```

Banco criado:

- Database: `commander_tracker`
- User: `commander`
- Password: `commander`
- Port: `3306`

## 2) Configurar backend

```bash
cp backend/.env.example backend/.env
cd backend
npm install
npm run start:dev
```

API disponível em `http://localhost:3000`.

### Arquitetura backend

Fluxo implementado:

- `controller` chama `application`
- `application` chama `domain`
- `domain` usa `model` (TypeORM)

Módulo principal: `backend/src/modules/game`.

## 3) Configurar frontend

```bash
cp frontend/.env.example frontend/.env.local
cd frontend
npm install
npm run dev -- --port 3001
```

App disponível em `http://localhost:3001`.

## Endpoints

Base: `http://localhost:3000/game`

- `POST /players`
- `GET /players`
- `POST /decks`
- `GET /decks`
- `POST /matches`
- `GET /matches`

## Git

Repositório já inicializado na raiz do monorepo.

Próximos passos sugeridos:

1. `git branch -m main`
2. `git add . && git commit -m "chore: bootstrap monorepo commander tracker"`
3. Criar repo privado no GitHub e adicionar `origin`
