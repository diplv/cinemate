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
              <p className="mb-2 text-sm font-medium text-amber-500/80">
                App is in beta stage and can have some bugs/glitches.
              </p>
              <a
                href="mailto:sorogins.d@gmail.com"
                className="text-sm font-semibold text-muted-foreground transition-colors hover:text-white"
              >
                Report a bug/Contact developer
              </a>
            </footer>
          </UnitProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
