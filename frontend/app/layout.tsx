import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="text-zinc-100 min-h-screen" style={{ backgroundColor: "#030712" }}>
        {children}
      </body>
    </html>
  );
}