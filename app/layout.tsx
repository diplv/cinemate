import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { UnitProvider } from "@/components/unit-provider";
import { Header } from "@/components/header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const APP_NAME = "CineMate";
const APP_TITLE = "CineMate - Cinematographer's Toolkit";
const APP_DESCRIPTION =
  "Offline-first diopter and field of view calculators for cinematographers";

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: APP_TITLE,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: APP_NAME,
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#09090b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <UnitProvider>
            <Header />
            <main className="mx-auto max-w-2xl px-4 py-4">{children}</main>
            <footer className="mx-auto max-w-2xl px-4 py-6 text-center">
              <a
                href="mailto:sorogins.d@gmail.com"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Contact Developer
              </a>
            </footer>
          </UnitProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
