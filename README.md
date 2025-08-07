# Mzunguko - Election Betting Platform

A modern betting platform for election predictions, built with Next.js, TypeScript, and Prisma.

## Features

- 🔐 **Authentication**: NextAuth.js with email/password and Google OAuth
- 💰 **Betting System**: Place bets on election candidates
- 👛 **Wallet Management**: Deposit, withdraw, and track transactions
- 📊 **Admin Dashboard**: Manage users, bets, and platform settings
- 🎨 **Modern UI**: Built with Tailwind CSS and Radix UI components
- 🤖 **AI Integration**: Google AI powered features with Genkit

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS + Radix UI
- **AI**: Google AI with Genkit
- **Deployment**: Cloud Workstations

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database
- Google AI API key (for AI features)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Mzunguko
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp example.env.txt .env
   ```
   
   Update the `.env` file with your configuration:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `NEXTAUTH_SECRET`: A secure random string
   - `NEXTAUTH_URL`: Your application URL
   - `GOOGLE_AI_API_KEY`: Your Google AI API key

4. **Set up the database**
   ```bash
   npm run prisma:generate
   npm run prisma:push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:9002`

## Project Structure

```
src/
├── app/                 # Next.js App Router pages
│   ├── (dashboard)/     # Protected dashboard routes
│   ├── admin/          # Admin panel routes
│   └── api/            # API routes
├── components/          # Reusable UI components
├── lib/                # Utility functions and configurations
├── actions/            # Server actions
├── context/            # React context providers
└── hooks/              # Custom React hooks
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:push` - Push schema to database
- `npm run prisma:studio` - Open Prisma Studio

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `NEXTAUTH_SECRET` | Secret for NextAuth.js | Yes |
| `NEXTAUTH_URL` | Your application URL | Yes |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | No |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret | No |
| `GOOGLE_AI_API_KEY` | Google AI API key | No |

## Google OAuth Setup

To enable Google login functionality:

1. **Go to Google Cloud Console**
   - Visit [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one

2. **Enable Google+ API**
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it

3. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Choose "Web application" as the application type
   - Add authorized redirect URIs:
     - `http://localhost:9002/api/auth/callback/google` (for development)
     - `https://bet2025-2-saau.onrender.com/api/auth/callback/google` (for production)

4. **Update Environment Variables**
   - Copy the Client ID and Client Secret
   - Update your `.env` file:
     ```
     GOOGLE_CLIENT_ID=your_client_id_here
     GOOGLE_CLIENT_SECRET=your_client_secret_here
     ```

5. **Restart the Development Server**
   ```bash
   npm run dev
   ```

## License

This project is licensed under the MIT License.
