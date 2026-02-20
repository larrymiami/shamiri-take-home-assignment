import type { Metadata } from "next";
import { Raleway } from "next/font/google";
import "./globals.css";
import { MuiThemeProvider } from "@/providers/MuiThemeProvider";
import { AuthSessionProvider } from "@/providers/AuthSessionProvider";
import { Analytics } from "@vercel/analytics/next";

const raleway = Raleway({
  variable: "--font-raleway",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
  style: "normal",
  fallback: ["system-ui", "sans-serif"],
  preload: true,
  adjustFontFallback: true
});

export const metadata: Metadata = {
  title: "Shamiri Supervisor Copilot",
  description: "Tiered Care supervision tools and session safety insights."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={raleway.variable}>
        <MuiThemeProvider>
          <AuthSessionProvider>{children}</AuthSessionProvider>
        </MuiThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
