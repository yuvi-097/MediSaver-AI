# MediSaver-AI🏥 

MediSaver-AI is a web tool that helps users quickly understand and verify hospital bills. You upload a medical bill (PDF or image), the system analyzes it using OCR and a pricing database, and then shows if you were potentially overcharged. It also provides a dispute letter template you can send to the hospital.

## 🚨 Why This Matters

Hospital bills are often confusing, and many include unnecessary or incorrect charges. This tool makes the process simple — anyone can upload a bill and instantly see a breakdown.

## 🧭 How It Works (User Flow)

1. Open the site
2. Upload your medical bill
3. System extracts text and codes
4. Compares against reference pricing
5. Shows flagged items (overpriced, duplicates, missing code etc.)
6. Suggests next steps + dispute letter

## 🎯 Key Benefits

* Saves time reviewing medical bills
* Helps avoid unnecessary payments
* Makes medical billing easy to understand
* Automatically points out suspicious items

## 📦 Demo Link

👉(https://youtu.be/001VIZMSkc8)

## Tech stack

* Frontend: React 18 + TypeScript (Vite)
* UI: Tailwind CSS, Radix UI, shadcn-style components
* State & Data: @tanstack/react-query, react-hook-form, zod
* Backend / Integrations: Supabase (`@supabase/supabase-js`) with an Edge Function in `supabase/functions/analyze-bill`
* Tooling: Vite, TypeScript, ESLint, PostCSS, Autoprefixer

## Features

* Upload and analyze medical bills
* Client-side UI components using Radix and shadcn
* Server-side / Edge analysis function (Supabase)

## Prerequisites

* Node.js v18+ (or your preferred Node runtime)
* npm, pnpm, or bun
* (Optional) Supabase project and credentials if you want to run the backend function

## Quick start

1. Clone the repo (if not already):

```bash
git clone https://github.com/yuvi-097/MediSaver-AI.git
cd MediSaver-AI
```

2. Install dependencies:

```bash
npm install
```

3. Run the dev server:

```bash
npm run dev
```

4. Open [http://localhost:5173](http://localhost:5173) in your browser.

## Environment variables

Create a `.env` file (or set environment variables) for any Supabase keys used by the app. Typical variables:

* `VITE_SUPABASE_URL`
* `VITE_SUPABASE_ANON_KEY`

## Supabase Edge Function

Located at `supabase/functions/analyze-bill`.
Deploy:

```bash
supabase functions deploy analyze-bill --project-ref your-project-ref
```

## Build

```bash
npm run build
```

## Contributing

PRs welcome. For quick changes, open an issue first to discuss larger work.

## License

MIT

---
