import PageHero from '@/components/ui/page-hero';
import SectionOverlay from '@/components/ui/section-overlay';
import LocationCard from '@/components/ui/location-card';

export default function Locations() {
    return (
        <>
        <PageHero 
            overline="The Spaces"
            title="Our Locations."
            description="Three distinct destinations in Dhaka. One uncompromising Thai dining experience."
            align="center"
        />

        {/* Locations Grid Spread */}
        <SectionOverlay backgroundImage="/assets/Background-20260709T183540Z-2-001/Background/Landing Page Section/Lotus background.webp" overlayOpacity={0.6} padding="0 0 var(--space-macro) 0" blend>
            
            <div style={{position: 'relative', zIndex: 2, width: '100%', margin: 0, padding: 0}}>
                <div style={{display: 'flex', flexDirection: 'column', gap: 0}}>
                    <LocationCard
                        className="reveal-stagger"
                        type="Flagship"
                        name="Gulshan 1"
                        address="Level 1, Progress Tower, House 1, Road 23, Gulshan 1, Dhaka 1212"
                        phone="+88 01600-068193"
                        hours={["Sat–Thu: 12:00 PM – 11:00 PM", "Friday: 2:00 PM – 11:00 PM"]}
                        imageSrc="/assets/Location_Image_1_1/Gulshan_Outlet_2.webp"
                        mapQuery="Level 1, Progress Tower, House 1, Road 23, Gulshan 1, Dhaka"
                        blendTop={true}
                    />

                    <LocationCard
                        className="reveal-stagger"
                        type="Original"
                        name="Dhanmondi"
                        address="Ahmad & Kazi Tower, Level-5, House-35, Road-2, Dhanmondi, Dhaka"
                        phone="+88 01603-523731"
                        hours={["Sat–Thu: 12:00 PM – 11:00 PM", "Friday: 2:00 PM – 11:00 PM"]}
                        imageSrc="/assets/Location_Image_1_1/Dhanmondi_Outlet_1.webp"
                        mapQuery="Ahmad & Kazi Tower, Level-5, House-35, Road-2, Dhanmondi, Dhaka"
                        reverse={true}
                    />

                    <LocationCard
                        className="reveal-stagger"
                        type="Sanctuary"
                        name="Uttara"
                        address="House 30, Tropical Sormi Center, Sector 13, Garib-E-Newaz Ave, Uttara, Dhaka"
                        phone="+88 01627-167758"
                        hours={["Sat–Thu: 12:00 PM – 11:00 PM", "Friday: 2:00 PM – 11:00 PM"]}
                        imageSrc="/assets/Location_Image_1_1/Uttara_Outlet_3.webp"
                        mapQuery="House 30, Tropical Sormi Center, Sector 13, Garib-E-Newaz Ave, Uttara, Dhaka"
                        blendBottom={true}
                    />
                    
                </div>
            </div>
        </SectionOverlay>
        </>
    );
}
