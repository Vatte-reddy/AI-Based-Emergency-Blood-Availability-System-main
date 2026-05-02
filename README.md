# AI-Based Emergency Blood Availability System — Repo Root

This repository contains a nested project folder `AI-Based-Emergency-Blood-Availability-System-main` which holds the actual frontend and backend code.

Quick local run (from the repo root):

```bash
# install deps (for nested project)
npm run install

# run frontend dev server
npm run dev

# or start production server forwarding to nested start
npm run start
```

Render deployment notes
- Render attempted to run `npm run start` from the repository root and failed because the real `package.json` is inside the nested folder.
- This repo includes a `render.yaml` that instructs Render to build and start from the nested folder. You can also set the "Root Directory" in the Render service settings to `AI-Based-Emergency-Blood-Availability-System-main`.

If you'd prefer not to use `render.yaml`, update your Render service build/start commands to:

```bash
cd AI-Based-Emergency-Blood-Availability-System-main && yarn
cd AI-Based-Emergency-Blood-Availability-System-main && npm run start
```

Security note: the root `package.json` forwards commands into the nested project to make CI/CD and hosting providers easier to configure.
