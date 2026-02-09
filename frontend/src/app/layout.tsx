import type { Metadata } from "next";
import "./globals.css";
import { Press_Start_2P, VT323, Inter } from "next/font/google";
import { AuthProvider } from "@/contexts/AuthContext";
import { CampaignProvider } from "@/contexts/CampaignContext";

const pressStart2P = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-press-start",
  display: "swap",
});

const vt323 = VT323({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-vt323",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Wizard Connect - Mapua Malayan Colleges Laguna Matchmaking",
  description: "Find your perfect Valentine's Day match at Mapua Malayan Colleges Laguna. Smart matchmaking based on personality, values, and interests. Exclusively for Mapua students.",
  keywords: ["Wizard Connect", "Mapua", "Valentine's Day", "Matchmaking", "College Dating", "Student Connections"],
  authors: [{ name: "Wizard Connect Team" }],
  openGraph: {
    title: "Wizard Connect - Find Your Perfect Match",
    description: "Mapua's exclusive Valentine's Day matchmaking platform",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${pressStart2P.variable} ${vt323.variable} ${inter.variable} antialiased`}>
        <AuthProvider>
          <CampaignProvider>
            {children}
          </CampaignProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
