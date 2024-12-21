import React from "react";
import { cn } from "@/lib/utils"; 
import Link from "next/link";
import FlickeringGrid from "@/components/ui/flickering-grid"

const Footer = () => {
    const items = [
        {
            title: "Home",
            href: "/",
        },
        {
            title: "About",
            href: "/about",
        },
        {
            title: "Privacy Policy",
            href: "/privacy-policy",
        },
        {
            title: "Terms of Service",
            href: "/terms-of-service",
        },
        {
            title: "Questions",
            href: "/questions",
        },
    ];

    return (
        <footer className="relative block overflow-hidden border-t border-solid border-white/30 py-20">
        <div className="container mx-auto px-4">
            <ul className="flex flex-wrap items-center justify-center gap-3">
                {items.map(item => (
                    <li key={item.href}>
                        <Link href={item.href}>{item.title}</Link>
                    </li>
                ))}
            </ul>
            <div className="mt-4 text-center">&copy; {new Date().getFullYear()} Riverpod</div>
        </div>
        <FlickeringGrid
        className="z-0 relative inset-0 [mask-image:radial-gradient(450px_circle_at_center,white,transparent)]"
        squareSize={4}
        gridGap={6}
        color="#60A5FA"
        maxOpacity={0.5}
        flickerChance={0.1}
        height={800}
        width={800}
      />
    </footer>
    )
}

export default Footer;