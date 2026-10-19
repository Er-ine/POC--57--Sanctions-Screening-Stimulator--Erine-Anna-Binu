import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Infocreon Internship - Sanctions Screening Simulator",
  description:
    "POC-57 sanctions screening simulator developed as part of the Infocreon Internship.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="text-zinc-100 min-h-screen" style={{ backgroundColor: "#030712" }}>
        {children}
      </body>
    </html>
  );
}