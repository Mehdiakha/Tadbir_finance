# Personal Finance Tracker

A full-stack personal finance application with AI-powered insights.

## Features

- 💰 Expense tracking with categories
- 🎯 Savings goals management
- 📊 Interactive charts and analytics
- 🤖 AI financial assistant
- 🔐 Secure authentication with Google OAuth

## Setup Instructions

1. **Install dependencies:**
   \`\`\`bash
   npm install
   \`\`\`

2. **Set up the database:**
   \`\`\`bash
   npx prisma db push
   npx prisma generate
   \`\`\`

3. **Start the development server:**
   \`\`\`bash
   npm run dev
   \`\`\`

4. **Open your browser:**
   Navigate to `http://localhost:3000`

## Environment Variables

Make sure your `.env.local` file contains:

- `DATABASE_URL` - Your Neon PostgreSQL connection string
- `NEXTAUTH_URL` - Your app URL (http://localhost:3000 for development)
- `NEXTAUTH_SECRET` - A random secret for NextAuth
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `OPENAI_API_KEY` - OpenAI API key for the AI assistant

## Tech Stack

- **Frontend:** Next.js 15, React 18, TailwindCSS
- **Backend:** Next.js API Routes, Prisma ORM
- **Database:** PostgreSQL (Neon)
- **Authentication:** NextAuth.js
- **AI:** OpenAI API with Vercel AI SDK
- **UI Components:** shadcn/ui
- **Charts:** Recharts

## Usage

1. Sign in with your Google account
2. Add your expenses with categories and notes
3. Set up savings goals to track your progress
4. View analytics and charts on the dashboard
5. Chat with the AI assistant for financial insights

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run db:push` - Push schema changes to database
- `npm run db:studio` - Open Prisma Studio
