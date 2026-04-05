import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import TabNav from "@/components/TabNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Health Tracker",
  description: "Track blood pressure, calories, and cholesterol",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-gray-50">
        <Header />
        <TabNav />
        <div className="flex-1 flex flex-col">{children}</div>
        <footer className="text-center text-xs text-gray-400 py-4">
          Health Tracker &middot; Data stored locally in your browser
        </footer>
      </body>
    </html>
  );
}
