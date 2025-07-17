# Contributor Guide

Welcome to the CRM AI demo project! This repository contains a small Next.js
application written in TypeScript. The goal of this guide is to explain how to
contribute effectively and keep the project healthy.

## Key Directories and Files

- **`app/`** – Source of the Next.js pages, API routes and layout components.
- **`components/`** – Reusable UI elements. New components belong here.
- **`lib/`** – Utility functions. `lib/utils.ts` contains the `cn` helper used by
  many components.
- **`test-utils/`** and **`__mocks__/`** – Simplified testing helpers used by
  Jest.
- **Root configuration** – `package.json`, `tsconfig.json`, `jest.config.js` and
  other files in the repository root configure tooling for linting, tests and
  building the application.

The old `crm-ai/` directory is no longer maintained. All new work should go in
`app/` or the folders listed above.

## Local Development

1. Install dependencies with `npm install`.
2. Start the development server using `npm run dev` and open
   `http://localhost:3000` in your browser.
3. Use TypeScript for all code. Format files with 2 spaces and double quotes,
   matching the existing style.

## Testing Your Changes

Run the following checks before submitting a pull request:

```bash
npm run lint   # check code style (docs are exempt)
npm test       # run unit tests
npm run build  # ensure the Next.js build succeeds
```

Tests are written with Jest using files that end in `*.test.ts` or
`*.test.tsx`. You can find examples under `app/`. When adding features, include
appropriate tests to cover your changes.

## Commit and PR Standards

- Keep commits focused and descriptive. Prefix the message with a short tag such
  as `fix:`, `feat:`, or `docs:` as seen in the existing history.
- Use the main branch (`main`) as the base for feature branches.
- Open a pull request with a clear description of the change and reference any
  related issues. Run the checks above before opening the PR.

## Non‑Code Quality Checks

- Update documentation in `README.md` or other relevant files when behavior or
  APIs change.
- Verify that newly added assets are necessary and that large files are avoided.
- Ensure the project still builds and tests pass after your changes.

Following this guide will help keep the project consistent and easy for everyone
to maintain. Happy contributing!
