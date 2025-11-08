import type { Metadata } from "next";
import { Geist, Geist_Mono, Montserrat } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist({ variable: "--font-geist-mono", subsets: ["latin"] });
const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "STU",
  description: "STU Platform",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} ${montserrat.variable} antialiased`}>
        <Toaster
          richColors
          position="top-right"
          closeButton
          toastOptions={{
            duration: 3500,
            style: {
              background: "#0f1838",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.08)",
            },
          }}
        />
        {children}
      </body>
    </html>
  );
}
