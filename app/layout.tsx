import type { Metadata, Viewport } from "next";
import "./globals.css";
import SwRegister from '@/components/shared/SwRegister';

export const metadata: Metadata = {
  title: "MyTracker — Personal Ibadah & Gym Tracker",
  description: "Aplikasi personal untuk tracking ibadah, gym, dan kebiasaan custom. Tersedia offline sebagai PWA.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "MyTracker",
  },
  icons: {
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: dark)",  color: "#0d1117" },
    { media: "(prefers-color-scheme: light)", color: "#f0f4f8" },
  ],
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
      </head>
      <body>
        <ThemeProvider>
          {children}
          <SwRegister />
        </ThemeProvider>
      </body>
    </html>
  );
}

// Inline theme provider to avoid extra file for simple toggle
function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              try {
                var t = localStorage.getItem('mytracker_theme');
                if (t === 'light') document.documentElement.classList.add('light');
              } catch(e) {}
            })();
          `,
        }}
      />
      {children}
    </>
  );
}
