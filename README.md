# Sum - Anonymous Employee Pulse Surveys (ETH Belgrade Hackathon)

Sum is a decentralized application for conducting anonymous employee pulse surveys. It leverages iExec for confidential data processing, Civic for authentication, Chainlink Functions for conditional off-chain actions, and OriginTrail for publishing aggregated reports. The frontend and API backend are built with Next.js, styled with Tailwind CSS and shadcn components.

## Structure
- `/apps/frontend`: Next.js application for Employee and HR Admin UIs, and API routes for temporary data storage.
- `/packages/iexec-app`: Code for the iExec confidential computing application.
- `/packages/chainlink-contract`: Smart contract for triggering Chainlink Functions.
- `/scripts/origintrail-publisher`: Scripts for publishing aggregated data to OriginTrail DKG.

## Features (MVP)
- Employee UI: Submit anonymous, encrypted survey responses (3 rating questions, 1 text question)
- Admin UI: View submitted survey data, trigger aggregation (iExec integration in progress)
- API: `/api/submitSurvey` (POST), `/api/getSurveyData` (GET)
- Uses shadcn for UI components and Tailwind CSS for styling

## Getting Started

1. Install dependencies:
   ```bash
   cd apps/frontend
   pnpm install # or npm install or yarn install
   ```
2. Run the development server:
   ```bash
   pnpm dev # or npm run dev or yarn dev
   ```
3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Development Notes
- Employee survey data is encrypted client-side using iExec DataProtector and stored via API.
- Admin UI displays all submitted survey data and will support aggregation via iExec iApp.
- See `.idea/PRD.md` and `.idea/TASKS.md` for requirements and progress.

## Status
- Employee and Admin UIs are functional for demo.
- iExec aggregation, Chainlink, and OriginTrail integrations are in progress.

(More details to be added)