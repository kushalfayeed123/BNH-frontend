import "./globals.css";
import { Fraunces, Hanken_Grotesk } from "next/font/google";
import { AuthProvider } from "@/lib/auth";
const serif = Fraunces({ subsets: ["latin"], variable: "--serif" });
const sans = Hanken_Grotesk({ subsets: ["latin"], variable: "--sans" });
export const metadata = { title: "BNH Portfolio Manager" };
export default function Root({ children }: { children: React.ReactNode }) {
  return <html lang="en" className={`${serif.variable} ${sans.variable}`}><body><AuthProvider>{children}</AuthProvider></body></html>;
}
