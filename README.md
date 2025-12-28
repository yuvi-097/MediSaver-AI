# MediSaver-AI

A Vite + React + TypeScript UI for analyzing health bills with a Supabase backend and edge function.

## Tech stack
- Frontend: React 18 + TypeScript (Vite)
- UI: Tailwind CSS, Radix UI, shadcn-style components
- State & Data: @tanstack/react-query, react-hook-form, zod
- Backend / Integrations: Supabase (`@supabase/supabase-js`) with an Edge Function in `supabase/functions/analyze-bill`
- Tooling: Vite, TypeScript, ESLint, PostCSS, Autoprefixer

## Features
- Upload and analyze medical bills
- Client-side UI components using Radix and shadcn
- Server-side / Edge analysis function (Supabase)

## Prerequisites
- Node.js v18+ (or your preferred Node runtime)
- npm, pnpm, or bun
- (Optional) Supabase project and credentials if you want to run the backend function

## Quick start
1. Clone the repo (if not already):

```bash
git clone https://github.com/yuvi-097/MediSaver-AI.git
cd MediSaver-AI
```

2. Install dependencies:

```bash
npm install
# or
pnpm install
# or
bun install
```

3. Run the dev server:

```bash
npm run dev
# or
pnpm dev
# or
bun run dev
```

4. Open http://localhost:5173 in your browser.

## Environment variables
Create a `.env` file (or set environment variables) for any Supabase keys used by the app. Typical variables:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

(The app reads Vite-prefixed env vars at build time. Check `src/integrations/supabase/client.ts` for exact names.)

## Supabase Edge Function
The repository includes a Supabase Edge Function at `supabase/functions/analyze-bill`. To deploy or run it locally, use the Supabase CLI or dashboard:

```bash
# login (if needed)
supabase login
# deploy function
supabase functions deploy analyze-bill --project-ref your-project-ref
```

## Build

```bash
npm run build
```

## Contributing
PRs welcome. For quick changes, open an issue first to discuss larger work.

## License
Specify your license here (e.g., MIT) or remove this section if not applicable.

---
If you'd like, I can: update the README with screenshots, add CI, or add deployment instructions for Vercel/Netlify. Which would you like next?
# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## How can I edit this code?

There are several ways of editing your application.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS



