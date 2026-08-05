"use client";
import Link from 'next/link';
import Image from 'next/image';
import React from 'react';
import { useReservation } from '@/components/ReservationContext';

export default function Footer() {
    const { openDrawer } = useReservation();
    return (
        <footer className="site-footer">
            <div className="container site-footer__inner">
                <div className="footer-top">
                    <div className="footer-brand">
                        <Image
                            className="footer-logo"
                            src="/assets/Logos-20260709T183558Z-2-001/Logos/Khao San Logo.webp"
                            alt="Khao San"
                            width={200}
                            height={174}
                        />
                        <p className="footer-tagline">
                            Bangkok street craft, quietly elevated &mdash; three rooms across Dhaka.
                        </p>
                        <button onClick={openDrawer} className="footer-reserve">Reserve a Table</button>
                        <p className="footer-outlets">Gulshan &middot; Dhanmondi &middot; Uttara</p>
                    </div>

                    <div className="footer-col">
                        <h4>Explore</h4>
                        <ul>
                            <li><Link href="/menu" className="footer-link">Menu</Link></li>
                            <li><Link href="/locations" className="footer-link">Locations</Link></li>
                            <li><Link href="/about" className="footer-link">Our Story</Link></li>
                            <li><Link href="/giftcards" className="footer-link">Gift Cards</Link></li>
                        </ul>
                    </div>

                    <div className="footer-col">
                        <h4>Connect</h4>
                        <ul>
                            <li><a href="https://www.instagram.com/explore/tags/khaosandhaka/" target="_blank" rel="noopener noreferrer" className="footer-link">Instagram</a></li>
                            <li><a href="https://www.facebook.com/KhaoSanDhaka" target="_blank" rel="noopener noreferrer" className="footer-link">Facebook</a></li>
                        </ul>
                    </div>

                    <div className="footer-col">
                        <h4>Visit</h4>
                        <ul>
                            <li><span className="footer-hours">Sat&ndash;Thu &middot; 12&ndash;11 PM</span></li>
                            <li><span className="footer-hours">Friday &middot; 2&ndash;11 PM</span></li>
                            <li><a href="tel:+8801600068193" className="footer-link">+880 1600-068193</a></li>
                        </ul>
                    </div>
                </div>

                <div className="footer-divider" aria-hidden="true"></div>

                <div className="footer-bottom">
                    <p>&copy; {new Date().getFullYear()} Khao San Dhaka. All rights reserved.</p>
                    <div className="footer-legal">
                        <Link href="/legal/privacy">Privacy Policy</Link>
                        <Link href="/legal/terms">Terms</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
