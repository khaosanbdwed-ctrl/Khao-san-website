"use client";
import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import IgnitionVeil from "@/components/ui/ignition-veil";
import type { HeaderContent, FooterContent } from "@/lib/cms/docs/chrome";
import type { Location } from "@/lib/locations";

type Props = {
    children: React.ReactNode;
    header: HeaderContent;
    footer: FooterContent;
    locations: Location[];
    whatsapp: string;
};

export default function ClientWrapper({ children, header, footer, locations, whatsapp }: Props) {
    const pathname = usePathname();
    const isAdmin = pathname?.startsWith('/admin');
    useEffect(() => {
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.05
        };

        const intersectionObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Apply generic staggered delay relative to parent children
                    if (entry.target.classList.contains('reveal-stagger')) {
                        const parent = entry.target.parentElement;
                        if (parent) {
                            const siblings = Array.from(parent.children).filter(el => el.classList.contains('reveal-stagger'));
                            const index = siblings.indexOf(entry.target);
                            if (index > -1) {
                                (entry.target as HTMLElement).style.transitionDelay = `${index * 120}ms`;
                            }
                        }
                    }
                    entry.target.classList.add('reveal-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        const observeElements = () => {
            const revealElements = document.querySelectorAll('.reveal-hidden, .reveal-clip, .reveal-toss');
            revealElements.forEach(el => {
                if (!el.classList.contains('reveal-visible') && !el.hasAttribute('data-observed')) {
                    el.setAttribute('data-observed', 'true');
                    intersectionObserver.observe(el);
                }
            });
        };

        // Initial observation
        observeElements();

        // Watch for Next.js navigation DOM updates
        const mutationObserver = new MutationObserver(() => {
            observeElements();
        });

        mutationObserver.observe(document.body, {
            childList: true,
            subtree: true
        });

        return () => {
            intersectionObserver.disconnect();
            mutationObserver.disconnect();
        };
    }, []);

    return (
        <>
            {!isAdmin && <a href="#main-content" className="skip-link">Skip to main content</a>}
            {!isAdmin && <IgnitionVeil />}
            {!isAdmin && <Header content={header} whatsapp={whatsapp} />}
            {isAdmin ? (
                children
            ) : (
                <main id="main-content" className="page-transition">{children}</main>
            )}
            {!isAdmin && <Footer content={footer} locations={locations} whatsapp={whatsapp} />}
        </>
    );
}
