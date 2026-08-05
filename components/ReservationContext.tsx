"use client";

import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';

interface ReservationContextType {
    isOpen: boolean;
    openDrawer: () => void;
    closeDrawer: () => void;
}

const ReservationContext = createContext<ReservationContextType | undefined>(undefined);

export function useReservation() {
    const context = useContext(ReservationContext);
    if (!context) {
        throw new Error("useReservation must be used within a ReservationProvider");
    }
    return context;
}

type SubmitStatus = 'idle' | 'loading' | 'success' | 'error';

export function ReservationProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [status, setStatus] = useState<SubmitStatus>('idle');
    const [errorMessage, setErrorMessage] = useState('');
    const [confirmationCode, setConfirmationCode] = useState('');
    const drawerRef = useRef<HTMLDivElement>(null);
    const previouslyFocused = useRef<HTMLElement | null>(null);

    const openDrawer = () => {
        setIsOpen(true);
        setStatus('idle');
        setErrorMessage('');
    };

    const closeDrawer = () => setIsOpen(false);

    // Lock body scroll when drawer is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    // Focus management + keyboard support while the drawer is open
    useEffect(() => {
        if (!isOpen) return;

        const panel = drawerRef.current;
        previouslyFocused.current = document.activeElement as HTMLElement;

        // Move focus into the drawer once it opens
        const firstField = panel?.querySelector<HTMLElement>('select, input, textarea, button');
        firstField?.focus();

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                closeDrawer();
                return;
            }
            if (e.key === 'Tab' && panel) {
                const focusable = panel.querySelectorAll<HTMLElement>(
                    'a[href], button:not([disabled]), textarea, input:not([disabled]), select:not([disabled])'
                );
                if (focusable.length === 0) return;
                const first = focusable[0];
                const last = focusable[focusable.length - 1];
                if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            // Restore focus to the trigger when the drawer closes
            previouslyFocused.current?.focus();
        };
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const formData = new FormData(form);
        const payload = {
            branch: String(formData.get('branch') || ''),
            date: String(formData.get('date') || ''),
            time: String(formData.get('time') || ''),
            partySize: String(formData.get('partySize') || ''),
            name: String(formData.get('name') || ''),
            phone: String(formData.get('phone') || ''),
            notes: String(formData.get('notes') || ''),
        };

        setStatus('loading');
        setErrorMessage('');

        try {
            const res = await fetch('/api/reservations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await res.json();

            if (!res.ok) {
                setErrorMessage(data.error || 'Something went wrong. Please try again.');
                setStatus('error');
                return;
            }

            setConfirmationCode(data.confirmationCode);
            setStatus('success');
        } catch {
            setErrorMessage('Unable to reach the reservation service. Please check your connection and try again.');
            setStatus('error');
        }
    };

    return (
        <ReservationContext.Provider value={{ isOpen, openDrawer, closeDrawer }}>
            {children}
            
            {/* The Overlay Backdrop */}
            <div 
                className={`drawer-backdrop ${isOpen ? 'open' : ''}`}
                onClick={closeDrawer}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100vh',
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    backdropFilter: 'blur(8px)',
                    zIndex: 999,
                    opacity: isOpen ? 1 : 0,
                    pointerEvents: isOpen ? 'auto' : 'none',
                    transition: 'opacity 0.4s ease'
                }}
            />

            {/* The Drawer Panel */}
            <div
                ref={drawerRef}
                className={`reservation-drawer ${isOpen ? 'open' : ''}`}
                role="dialog"
                aria-modal="true"
                aria-label="Reserve your table"
                inert={!isOpen}
                style={{
                    position: 'fixed',
                    top: 0,
                    right: 0,
                    width: '100%',
                    maxWidth: '500px',
                    height: '100vh',
                    backgroundColor: 'var(--color-surface-elevated)',
                    zIndex: 1000,
                    // Slide via transform (not `right`) so the closed panel is
                    // never positioned off-screen in layout - that would inflate
                    // the containing block and push other fixed overlays off too.
                    transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
                    transition: 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)',
                    overflowY: 'auto',
                    boxShadow: '-10px 0 30px rgba(0,0,0,0.5)',
                    borderLeft: '1px solid rgba(255,255,255,0.05)',
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                <div style={{ padding: '32px clamp(24px, 5vw, 48px)', flex: '1 0 auto' }}>
                    
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                        <div>
                            <span className="overline" style={{color: 'var(--color-primary)'}}>Experience</span>
                            <h2 className="display-2" style={{fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem, 4vw, 2rem)'}}>Reserve your table.</h2>
                        </div>
                        <button onClick={closeDrawer} aria-label="Close reservation form" style={{ background: 'none', border: 'none', color: '#fdfbf7', fontSize: '2.5rem', cursor: 'pointer', padding: '0 8px', lineHeight: 1 }}>&times;</button>
                    </div>

                    {status === 'success' ? (
                        <div style={{ textAlign: 'center', padding: '64px 0' }}>
                            <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'rgba(240, 139, 67, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px auto', color: 'var(--color-primary)', fontSize: '32px' }}>✓</div>
                            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', marginBottom: '16px' }}>Reservation Confirmed</h3>
                            <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: '8px' }}>We&rsquo;ve received your reservation request. Our team will call to confirm shortly.</p>
                            {confirmationCode && (
                                <p style={{ color: 'var(--color-primary)', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '32px' }}>Confirmation: {confirmationCode}</p>
                            )}
                            <button onClick={closeDrawer} className="btn btn-primary" style={{ display: 'inline-flex', padding: '12px 32px' }}>Return to Website</button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="premium-form" style={{display: 'flex', flexDirection: 'column', gap: '32px'}}>

                            {status === 'error' && (
                                <div role="alert" style={{ backgroundColor: 'rgba(255, 77, 77, 0.1)', border: '1px solid rgba(255, 77, 77, 0.3)', borderRadius: 'var(--radius-sm)', padding: '14px 16px', color: '#ff8080', fontSize: '0.9rem' }}>
                                    {errorMessage}
                                </div>
                            )}

                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>Location</label>
                                <select name="branch" required defaultValue="" className="premium-input" style={{ width: '100%', outline: 'none', color: 'var(--color-text-primary)' }}>
                                    <option value="" disabled style={{backgroundColor: 'var(--color-surface-elevated)', color: 'var(--color-text-secondary)'}}>Select Branch</option>
                                    <option value="gulshan" style={{backgroundColor: 'var(--color-surface-elevated)', color: 'var(--color-text-primary)'}}>Gulshan 1</option>
                                    <option value="dhanmondi" style={{backgroundColor: 'var(--color-surface-elevated)', color: 'var(--color-text-primary)'}}>Dhanmondi</option>
                                    <option value="uttara" style={{backgroundColor: 'var(--color-surface-elevated)', color: 'var(--color-text-primary)'}}>Uttara</option>
                                </select>
                            </div>

                            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                                <div style={{ flex: '1 1 180px' }}>
                                    <label style={{ display: 'block', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>Date</label>
                                    <input name="date" type="date" required min={new Date().toISOString().split('T')[0]} className="premium-input" style={{ width: '100%', outline: 'none', color: 'var(--color-text-primary)' }} />
                                </div>
                                <div style={{ flex: '1 1 180px' }}>
                                    <label style={{ display: 'block', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>Time</label>
                                    <select name="time" required defaultValue="" className="premium-input" style={{ width: '100%', outline: 'none', color: 'var(--color-text-primary)' }}>
                                        <option value="" disabled style={{backgroundColor: 'var(--color-surface-elevated)', color: 'var(--color-text-secondary)'}}>Select Time</option>
                                        <option style={{backgroundColor: 'var(--color-surface-elevated)', color: 'var(--color-text-primary)'}}>12:00 PM</option>
                                        <option style={{backgroundColor: 'var(--color-surface-elevated)', color: 'var(--color-text-primary)'}}>1:00 PM</option>
                                        <option style={{backgroundColor: 'var(--color-surface-elevated)', color: 'var(--color-text-primary)'}}>2:00 PM</option>
                                        <option style={{backgroundColor: 'var(--color-surface-elevated)', color: 'var(--color-text-primary)'}}>7:00 PM</option>
                                        <option style={{backgroundColor: 'var(--color-surface-elevated)', color: 'var(--color-text-primary)'}}>8:00 PM</option>
                                        <option style={{backgroundColor: 'var(--color-surface-elevated)', color: 'var(--color-text-primary)'}}>9:00 PM</option>
                                        <option style={{backgroundColor: 'var(--color-surface-elevated)', color: 'var(--color-text-primary)'}}>9:30 PM</option>
                                        <option style={{backgroundColor: 'var(--color-surface-elevated)', color: 'var(--color-text-primary)'}}>10:00 PM</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-secondary)', marginBottom: '12px' }}>Party Size</label>
                                <div className="party-size-grid">
                                    {['2', '3', '4', '5+'].map(size => (
                                        <label key={size}>
                                            <input type="radio" name="partySize" value={size} required className="sr-only-radio" disabled={status === 'loading'} />
                                            <div style={{
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                borderRadius: 'var(--radius-sm)',
                                                padding: '12px 8px',
                                                textAlign: 'center',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                color: 'var(--color-text-primary)',
                                                fontSize: '0.9rem'
                                            }}
                                            className="party-size-btn"
                                            >
                                                {size} {size === '5+' ? 'Guests' : 'Persons'}
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <style dangerouslySetInnerHTML={{__html: `
                                .sr-only-radio {
                                    position: absolute;
                                    width: 1px;
                                    height: 1px;
                                    padding: 0;
                                    margin: -1px;
                                    overflow: hidden;
                                    clip: rect(0, 0, 0, 0);
                                    white-space: nowrap;
                                    border: 0;
                                }
                                input[type="radio"]:checked + .party-size-btn {
                                    border-color: var(--color-primary) !important;
                                    background-color: rgba(240, 139, 67, 0.1) !important;
                                    color: var(--color-primary) !important;
                                }
                                .party-size-btn:hover {
                                    border-color: rgba(255,255,255,0.3);
                                }
                                input[type="radio"]:focus-visible + .party-size-btn {
                                    outline: 2px solid var(--color-accent);
                                    outline-offset: 2px;
                                }
                            `}} />

                            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                                <div style={{ flex: '1 1 180px' }}>
                                    <label style={{ display: 'block', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>Name</label>
                                    <input name="name" type="text" placeholder="Full Name" required minLength={2} disabled={status === 'loading'} className="premium-input" style={{ width: '100%', outline: 'none', color: 'var(--color-text-primary)' }} />
                                </div>
                                <div style={{ flex: '1 1 180px' }}>
                                    <label style={{ display: 'block', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>Phone</label>
                                    <input name="phone" type="tel" placeholder="Phone Number" required minLength={7} disabled={status === 'loading'} className="premium-input" style={{ width: '100%', outline: 'none', color: 'var(--color-text-primary)' }} />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>Special Requests (Optional)</label>
                                <input name="notes" type="text" placeholder="Dietary restrictions or occasions" disabled={status === 'loading'} className="premium-input" style={{ width: '100%', outline: 'none', color: 'var(--color-text-primary)' }} />
                            </div>

                            <button
                                type="submit"
                                disabled={status === 'loading'}
                                className="btn btn-primary"
                                style={{ width: '100%', justifyContent: 'center', marginTop: '16px', padding: '16px', fontSize: '1rem', opacity: status === 'loading' ? 0.7 : 1, cursor: status === 'loading' ? 'wait' : 'pointer' }}
                            >
                                {status === 'loading' ? (
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
                                        <span className="btn-spinner" aria-hidden="true" />
                                        Confirming…
                                    </span>
                                ) : 'Confirm Reservation'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </ReservationContext.Provider>
    );
}
