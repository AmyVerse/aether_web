import { SessionProvider as CachedSessionProvider } from "@/hooks/useSessionCache";
import { ToastProvider } from "@/hooks/useToast";
import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import { Inter, Manrope, Poppins } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const funnel = localFont({
  src: "../../public/font/FunnelSans[wght].woff2",
  variable: "--font-funnel",
  weight: "300 800", // Define weight range
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
  style: ["normal"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Aether: IIITN's Integrated Portal",
  description: "An integrated portal for IIIT Nagpur",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${funnel.variable} ${poppins.variable} ${inter.variable} ${manrope.variable} antialiased`}
      >
        <SessionProvider>
          <CachedSessionProvider>
            <ToastProvider>{children}</ToastProvider>
          </CachedSessionProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
