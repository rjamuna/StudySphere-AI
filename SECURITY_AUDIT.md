# StudySphere AI — Pre-GitHub Security Audit

## Status: NEEDS ATTENTION (before push — see actions below)

---

## Secrets Found: 3

| # | File | Type | Status |
|---|------|------|--------|
| 1 | `backend/.env` | MongoDB URI (includes username + password) | Protected by root .gitignore ✅ |
| 2 | `backend/.env` | JWT_SECRET | Protected by root .gitignore ✅ |
| 3 | `ai-service/.env` | GROQ_API_KEY | Protected by root .gitignore ✅ |

No secrets were found hardcoded in any .js, .ts, .tsx, or .py source file.
All secrets are correctly loaded via `process.env` / `os.getenv()`.

---

## Sensitive Files — Must NOT be pushed

| File | Reason |
|------|--------|
| `backend/.env` | Contains real MongoDB credentials and JWT secret |
| `ai-service/.env` | Contains real Groq API key |
| `backend/server.log` | Contains local system paths and runtime errors |
| `backend/uploads/` | Contains user-uploaded files |

---

## .gitignore

- Root `.gitignore` **created** — covers `.env`, `node_modules/`, `dist/`, `__pycache__/`, `*.log`, `backend/uploads/`, `venv/`, `.vscode/`, `.DS_Store`, and more.
- `frontend/.gitignore` **updated** — `.env` / `.env.*` protection was missing; now added.

---

## MongoDB

Credentials exist only in `backend/.env`. No MongoDB URI was found in any source file. The `.env` file is now protected by `.gitignore`. ✅

---

## AI API (Groq)

`GROQ_API_KEY` exists only in `ai-service/.env`. It is loaded via `os.getenv()` in `main.py`. No key is hardcoded or exposed to the frontend. The `.env` file is now protected by `.gitignore`. ✅

---

## Frontend Secret Exposure

No private secrets found in any React/TSX/Vite file. The frontend uses a Vite proxy (`/api` → backend, `/tutor/chat` → ai-service), so no API URLs or keys need to be in frontend environment variables. ✅

---

## Large / Unnecessary Files

| Path | Action |
|------|--------|
| `backend/uploads/` | Added to `.gitignore` — do not commit user uploads |
| `backend/server.log` | Covered by `*.log` in `.gitignore` — do not commit |
| `node_modules/` (if installed) | Covered by `.gitignore` |
| `__pycache__/` (if generated) | Covered by `.gitignore` |
| `.venv/` / `venv/` (if created) | Covered by `.gitignore` |

---

## Git Tracking Risk

No `.git` directory was detected at the root. If you run `git init` and then `git add .`, the root `.gitignore` will protect all sensitive files listed above **before** any commit is made.

If Git was previously initialized and `backend/.env` or `ai-service/.env` were ever staged/committed, run:

```bash
git rm --cached backend/.env
git rm --cached ai-service/.env
```

---

## .env.example Files Created

| File | Purpose |
|------|---------|
| `backend/.env.example` | Template for backend environment variables (no real values) |
| `ai-service/.env.example` | Template for AI service environment variables (no real values) |
| `frontend/.env.example` | Template for frontend environment variables (no real values) |

---

## Remaining Manual Actions Required

1. **Rotate your JWT_SECRET** — the current value is weak and pattern-guessable. Replace it with a long random string (32+ chars).
2. **Rotate your Groq API key** — if this repository was ever pushed or shared before this audit, the key in `ai-service/.env` must be regenerated at console.groq.com.
3. **Consider rotating your MongoDB password** — if the repo was ever pushed before, rotate at MongoDB Atlas.
4. **Verify Git history** — if Git was already initialized, run `git log --all --full-history -- "**/.env"` to confirm `.env` files were never committed.
