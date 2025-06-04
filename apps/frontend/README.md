# Sum Frontend (Employee & Admin UI)

This is the Next.js frontend for the Sum anonymous employee pulse survey dApp.

## Features
- Employee Portal: Submit anonymous, encrypted survey responses (3 rating questions, 1 text question)
- Admin Portal: View submitted survey data, trigger aggregation (iExec integration in progress)
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
- Admin UI displays all submitted survey data and will support aggregation via iExec iApp.
- See root README and `.idea/PRD.md` for more details.
