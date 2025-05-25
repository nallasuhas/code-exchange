import React from "react";
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
        <footer className="relative block overflow-hidden border-t border-solid border-white/30 py-20 mt-4">
        <div className="container mx-auto px-4">
            <ul className="flex flex-wrap items-center justify-center gap-3">
                {items.map(item => (
                    <li key={item.href}>
                        <Link href={item.href}>{item.title}</Link>
                    </li>
                ))}
            </ul>
            <div className="mt-4 text-center">&copy; {new Date().getFullYear()} CodeXchange</div>
        </div>
        <FlickeringGrid
        className="absolute inset-0 size-full pointer-events-none"
        squareSize={4}
        gridGap={6}
        color="#60A5FA"
        maxOpacity={0.5}
        flickerChance={0.05}
        
      />
    </footer>
    )
}

export default Footer;