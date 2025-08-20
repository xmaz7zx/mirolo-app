import type { Metadata, Viewport } from "next";
import "./globals.css";
import QueryProvider from '@/components/providers/query-provider'
import { AuthProvider } from '@/components/providers/auth-provider'
import AuthGuard from '@/components/layout/auth-guard'

export const metadata: Metadata = {
  title: "Mirolo - Deine intelligente Koch-App",
  description: "Entdecke, erstelle und teile deine Lieblingsrezepte mit KI-Unterstützung. Mobile-first Koch-App mit personalisierten Empfehlungen.",
  keywords: ["Kochen", "Rezepte", "KI", "Koch-App", "Meal Planning", "Deutsche Küche"],
  authors: [{ name: "Mirolo Team" }],
  creator: "Mirolo",
  publisher: "Mirolo",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Mirolo',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#7a8471' },
    { media: '(prefers-color-scheme: dark)', color: '#7a8471' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className="h-full">
      <body className="h-full antialiased">
        <QueryProvider>
          <AuthProvider>
            <AuthGuard requireAuth={false}>
              {children}
            </AuthGuard>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}