# Getting Started

## Environment setup

1. Create your local env file from the template:
   - `cp .env.example .env`
2. Fill in credentials in `.env`.
3. Ensure `DATABASE_URL` uses `sslmode=verify-full`.

Example:

```env
DATABASE_URL="postgres://<user>:<password>@<host>:5432/<database>?sslmode=verify-full"
```
