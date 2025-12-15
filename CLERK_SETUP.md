# Clerk Authentication Setup

This application uses [Clerk](https://clerk.com) for authentication, following the official Next.js App Router integration pattern.

## Setup Instructions

### 1. Get Your Clerk API Keys

1. Sign up for a free account at [Clerk](https://clerk.com)
2. Create a new application in your Clerk Dashboard
3. Navigate to [API Keys](https://dashboard.clerk.com/last-active?path=api-keys)
4. Copy your **Publishable Key** and **Secret Key**

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory and add:

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
CLERK_SECRET_KEY=YOUR_SECRET_KEY

# Your existing database URL
DATABASE_URL="your_database_url_here"
```

**Important:** 
- Replace `YOUR_PUBLISHABLE_KEY` and `YOUR_SECRET_KEY` with your actual keys from Clerk Dashboard
- Never commit `.env.local` to version control (it's already in `.gitignore`)

### 3. Integration Details

The Clerk integration includes:

- **Middleware** (`middleware.ts`): Uses `clerkMiddleware()` to protect routes
- **Provider** (`app/layout.tsx`): Wraps the app with `<ClerkProvider>`
- **Auth UI** (`app/components/Navigation/MainTabs.tsx`): Sign in/up buttons and UserButton in the navigation bar

### 4. Features

- **Sign In/Sign Up**: Modal-based authentication flows
- **User Profile**: Access via the UserButton in the navigation
- **Protected Routes**: Can be configured using Clerk's route protection features

### 5. Next Steps

After setting up your environment variables:

1. Restart your development server
2. Visit the app - you'll see Sign In/Sign Up buttons
3. Create an account or sign in
4. The UserButton will appear when authenticated

## Documentation

For more information, visit:
- [Clerk Next.js Quickstart](https://clerk.com/docs/quickstarts/nextjs)
- [Clerk Documentation](https://clerk.com/docs)





