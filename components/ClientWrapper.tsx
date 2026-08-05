"use client";
import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import IgnitionVeil from "@/components/ui/ignition-veil";

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
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
            {!isAdmin && <IgnitionVeil />}
            {!isAdmin && <Header />}
            {isAdmin ? (
                children
            ) : (
                <main className="page-transition">{children}</main>
            )}
            {!isAdmin && <Footer />}
        </>
    );
}
