import "./globals.css";
import { Providers } from "./providers";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Task + Time Tracker",
  description: "Track your tasks, habits, and time efficiently",
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}

/**
 * FILE: app/layout.tsx
 * 
 * PURPOSE:
 * Root layout component for the entire Next.js application. Defines the HTML structure,
 * metadata, and client-side providers that wrap all pages.
 * 
 * WHAT IT DOES:
 * - Defines application-wide metadata (title, description)
 * - Sets viewport configuration for responsive design
 * - Provides HTML structure (html, body tags)
 * - Wraps all pages with TRPC and React Query providers
 * - Imports global CSS styles
 * - Enables server-side rendering (no "use client" directive)
 * 
 * DEPENDENCIES (imports from):
 * - ./globals.css: Application-wide styles
 * - ./providers: Client component wrapper for TRPC and React Query
 * - next: Metadata type for TypeScript
 * 
 * DEPENDENTS (files that use this):
 * - All pages in the app directory (Next.js automatically applies this layout)
 * - app/page.tsx: Main page wrapped by this layout
 * 
 * RELATED FILES:
 * - app/providers.tsx: Client-side provider setup
 * - app/globals.css: Global styles
 * 
 * NOTES:
 * - This is a server component (no "use client")
 * - Metadata export is used for SEO and browser configuration
 * - Viewport moved to separate export (Next.js 16 requirement)
 * - Providers component handles all client-side setup (TRPC, React Query)
 */
