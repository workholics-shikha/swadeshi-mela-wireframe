# Backend (Express + MongoDB)

## Setup

1) Copy env file:

- Create `server/.env` from `server/.env.example`

2) Ensure MongoDB is running, then seed the default admin:

```bash
npm run seed:admin
```

3) Start dev server:

```bash
npm run dev
```

## Endpoints

- `GET /health`
- `POST /api/auth/login` body: `{ "email": "...", "password": "..." }`
- `GET /api/auth/me` header: `Authorization: Bearer <token>`

