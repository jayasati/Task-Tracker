This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### Prerequisites

1. **Set up Clerk Authentication:**
   - Create a free account at [Clerk](https://clerk.com)
   - Go to your [Clerk Dashboard API Keys page](https://dashboard.clerk.com/last-active?path=api-keys)
   - Copy your **Publishable Key** and **Secret Key**

2. **Configure Environment Variables:**
   - Create a `.env.local` file in the root directory
   - Add the following variables:

```bash
# Database
DATABASE_URL="your_database_url_here"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
CLERK_SECRET_KEY=YOUR_SECRET_KEY
```

   **Important:** Replace `YOUR_PUBLISHABLE_KEY` and `YOUR_SECRET_KEY` with your actual Clerk keys from the dashboard.

3. **Run Database Migrations:**
   ```bash
   npx prisma migrate dev
   ```

### Running the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

### Authentication

This project uses [Clerk](https://clerk.com) for authentication. Users can:
- Sign up for a new account
- Sign in to existing accounts
- Manage their profile via the UserButton component

The authentication UI is integrated into the main navigation bar.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
