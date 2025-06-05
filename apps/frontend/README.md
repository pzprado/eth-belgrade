# Sum Frontend (Employee & Admin UI)

This is the Next.js frontend for the Sum anonymous employee pulse survey dApp.

## Features
- Employee Portal: Submit anonymous, encrypted survey responses (11 rating questions, 1 text question; all ratings use a 1–10 scale)
- Admin Portal: View submitted survey data, trigger aggregation, and view anonymized report (iExec integration functional)
- Uses shadcn for UI components and Tailwind CSS for styling
- API routes for survey submission and retrieval

## Getting Started

1. Install dependencies:
   ```bash
   pnpm install # or npm install or yarn install
   ```
2. Run the development server:
   ```bash
   pnpm dev # or npm run dev or yarn dev
   ```
3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure
- `src/app/employee/page.tsx`: Employee survey form
- `src/app/admin/page.tsx`: Admin dashboard
- `src/app/api/submitSurvey/route.ts`: API route for submitting survey data
- `src/app/api/getSurveyData/route.ts`: API route for retrieving survey data
- `src/lib/iexec.ts`: iExec DataProtector integration

## Notes
- Survey data is encrypted client-side and stored via API.
- Admin UI displays all submitted survey data and supports aggregation/reporting via iExec iApp.
- The iApp expects an array of survey responses, each with a `responses` object keyed by `questionId`.
- See root README and `.idea/PRD.md` for more details.
