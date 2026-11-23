import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "UMBP Canvas Lab — Business Model Canvas & Feasibility Audit",
  description:
    "Interactive Business Model Canvas with a live feasibility score and an AI business-model diagnostic, built for the Utah Moldova Business Partnership.",
};

/** Applies the saved theme before first paint so dark mode doesn't flash. */
const THEME_BOOTSTRAP = `try{var t=localStorage.getItem('umbp-theme');if(t)document.documentElement.setAttribute('data-theme',t);}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // The bootstrap script below sets data-theme before React hydrates, so the
    // server markup deliberately differs from the client's on this one element.
    <html
      lang="en"
      className={`${fraunces.variable} ${manrope.variable} antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP }} />
      </head>
      <body className="font-sans">{children}</body>
    </html>
  );
}
