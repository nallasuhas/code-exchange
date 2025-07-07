import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ModeToggle } from "@/components/modetoggle";
import Header from "./components/Header";
import { cn } from "@/lib/utils";
import Footer from "./components/Footer";
import AppInitializer from "./AppInitializer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CodeXchange",
  description: "A platform for developers to share and exchange code snippets",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body 
        className={cn(
          "min-h-screen bg-background font-sans antialiased relative dark:bg-black dark:text-white",
          inter.className
        )}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
          storageKey="theme-preference"
        >
          <AppInitializer />
          <Header />
          
          <span className="fixed top-4 right-4 z-50 ">
               <ModeToggle />
            </span>
            {children}
        
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}