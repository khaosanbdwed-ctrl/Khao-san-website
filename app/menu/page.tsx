"use client";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import MenuCard, { MenuBadge } from '@/components/ui/menu-card';
import SectionBlend from '@/components/ui/section-blend';

interface RawMenuItem {
    number: number;
    title: string;
    imageSrc: string;
    price: string;
    groupPrice?: string;
    portionNote?: string;
    description: string;
    badges?: MenuBadge[];
    addOnNote?: string;
    angled?: boolean;
}

interface AddOn {
    title: string;
    price: string;
}

interface MenuCategory {
    id: string;
    name: string;
    addOns?: AddOn[];
    items: RawMenuItem[];
}

const MENU_DATA: MenuCategory[] = [
    {
        id: 'a-appetizers',
        name: 'Appetizers',
        items: [
            { number: 1, title: 'Crispy Chicken Cabbage Roll with Sweet Chili Sauce', portionNote: '(4pcs)', imageSrc: '/assets/Menu/KS Menu Webp/A. Appetizers/Crispy Chicken Cabbage Roll with Sweet Chili Sauce (4pcs).webp', price: '355', description: 'Minced lemon-grass chicken coated in lightly fried cabbage or Chinese leaves.' },
            { number: 2, title: 'Grilled Chicken Satay with Peanut Sauce', portionNote: '(6pcs)', imageSrc: '/assets/Menu/KS Menu Webp/A. Appetizers/Grilled Chicken Satay with Peanut Sauce (6pcs).webp', price: '355', description: 'Grilled chicken marinated with Thai spices, served with a creamy peanut tamarind sauce.' },
            { number: 3, title: 'Morning Glory with Larb Gai Dip', imageSrc: '/assets/Menu/KS Menu Webp/A. Appetizers/Morning Glory with Larb Gai Dip.webp', price: '365', description: 'Crispy morning glory with spicy chicken salad.' },
            { number: 4, title: 'Thai Fish Cake with Vinaigrette Dip', portionNote: '(6pcs)', imageSrc: '/assets/Menu/KS Menu Webp/A. Appetizers/Thai Fish Cake with Vinaigrette Dip (6pcs).webp', price: '385', description: 'Traditional Siam appetizer with Thai herbs and sesame oil infused dori fish.' },
            { number: 5, title: 'Fried Garlic Calamari', imageSrc: '/assets/Menu/KS Menu Webp/A. Appetizers/Fried Garlic Calamari.webp', price: '415', badges: ['spicy'], description: 'Golden fried calamari tossed in a spicy garlic red chili sauce.' },
            { number: 6, title: 'Thai Prawn Tempura with Sweet Chili Sauce', portionNote: '(5pcs)', imageSrc: '/assets/Menu/KS Menu Webp/A. Appetizers/Thai Prawn Tempura With Sweet Chili Sauce (5pcs).webp', price: '445', description: 'Deep fried golden prawns, marinated with Thai herbs.' },
            { number: 7, title: 'Bangkok Fried Chicken with House Special Dip', imageSrc: '/assets/Menu/KS Menu Webp/A. Appetizers/Bangkok Fried Chicken with House Special Dip.webp', price: '345', portionNote: '(4pcs)', groupPrice: '485 (6pcs)', badges: ['featured'], description: 'Crispy & spicy fried chicken with Thai red sauce.' },
        ]
    },
    {
        id: 'b-soups',
        name: 'Soups',
        items: [
            { number: 8, title: 'Seafood Clear Soup', imageSrc: '/assets/Menu/KS Menu Webp/B. Soups/Seafood Clear Soup.webp', price: '285', groupPrice: '715', badges: ['spicy'], angled: true, description: 'Spicy clear broth of crab, squid and prawn, infused with galangal, lemongrass and kaffir leaves.' },
            { number: 9, title: 'Tom Yum Goong', imageSrc: '/assets/Menu/KS Menu Webp/B. Soups/Tom Yum Goong.webp', price: '295', groupPrice: '735', badges: ['featured'], angled: true, description: 'Classic Thai sweet, sour and spicy broth with prawn, chicken and mushroom.' },
            { number: 10, title: 'Tom Kha Chicken / Seafood', imageSrc: '/assets/Menu/KS Menu Webp/B. Soups/Tom Kha Chicken _ Seafood.webp', price: '295', groupPrice: '735', angled: true, description: 'Coconut infused broth with mushroom and a choice of seafood or chicken.' },
        ]
    },
    {
        id: 'c-dumplings',
        name: 'Dumplings',
        items: [
            { number: 11, title: 'Chicken Lemon Grass Siu Mai', portionNote: '(5pcs)', imageSrc: '/assets/Menu/KS Menu Webp/C. Dumplings/Chicken Lemon Grass Siu Mai.webp', price: '325', description: 'Steamed siu mai filled with lemongrass-scented chicken.' },
            { number: 12, title: 'Chicken and Prawn Siu Mai', portionNote: '(5pcs)', imageSrc: '/assets/Menu/KS Menu Webp/C. Dumplings/Chicken and Prawn Siu Mai.webp', price: '335', badges: ['featured'], description: 'Classic steamed dumplings filled with chicken and prawn.' },
            { number: 13, title: 'Chicken and Basil Potsticker', portionNote: '(5pcs)', imageSrc: '/assets/Menu/KS Menu Webp/C. Dumplings/Chicken and Basil Potsticker.webp', price: '335', description: 'Pan-seared potstickers filled with chicken and Thai basil.' },
            { number: 14, title: 'Beef and Basil Potsticker', portionNote: '(5pcs)', imageSrc: '/assets/Menu/KS Menu Webp/C. Dumplings/Beef and Basil Potsticker.webp', price: '355', description: 'Pan-seared potstickers filled with beef and Thai basil.' },
            { number: 15, title: 'Prawn and Cream Cheese Rangoon', portionNote: '(4pcs)', imageSrc: '/assets/Menu/KS Menu Webp/C. Dumplings/Prawn and Cream Cheese Rangoon.webp', price: '375', description: 'Crisp fried wontons filled with prawn and cream cheese.' },
            { number: 16, title: 'Chicken Wonton Soup', portionNote: '(4pcs wontons)', imageSrc: '/assets/Menu/KS Menu Webp/C. Dumplings/Chicken Wonton Soup (4 pcs wontons).webp', price: '445', description: 'Lemongrass flavored chicken dumplings in a peanut soup broth.' },
            { number: 17, title: 'Mini Chicken Assortment', portionNote: '(6pcs)', imageSrc: '/assets/Menu/KS Menu Webp/C. Dumplings/Chicken Lemon Grass Siu Mai.webp', price: '395', badges: ['new'], description: '2pcs chicken lemongrass siu mai, 2pcs chicken & prawn siu mai, 2pcs chicken basil potsticker.' },
            { number: 18, title: 'Jumbo Dim Sum Assortment', portionNote: '(20pcs)', imageSrc: '/assets/Menu/KS Menu Webp/C. Dumplings/Chicken and Prawn Siu Mai.webp', price: '1199', badges: ['new'], description: '4pcs each of chicken lemongrass siu mai, chicken & prawn siu mai, chicken basil potsticker, beef basil potsticker, and prawn & cream cheese rangoon.' },
        ]
    },
    {
        id: 'd-salads',
        name: 'Salads',
        items: [
            { number: 19, title: 'Som Tam (Thai Papaya Salad)', imageSrc: '/assets/Menu/KS Menu Webp/D. Salads/Som Tam (Thai Papaya Salad).webp', price: '365', badges: ['spicy', 'special'], description: 'Thai spicy, sweet and sour papaya salad with prawn, peanuts and fresh herbs.' },
            { number: 20, title: 'Chicken Cashew Nut Salad', imageSrc: '/assets/Menu/KS Menu Webp/D. Salads/Chicken Cashew Nut Salad.webp', price: '375', badges: ['featured'], description: 'Stir-fried chicken salad with bell peppers, shallots, tomatoes and cashew nut.' },
            { number: 21, title: 'Thai Seafood Salad', imageSrc: '/assets/Menu/KS Menu Webp/D. Salads/Thai Seafood Salad.webp', price: '395', badges: ['spicy'], description: 'Sour and spicy salad with prawn, squid, crab and fresh herbs.' },
        ]
    },
    {
        id: 'kids-menu',
        name: 'Kids Menu',
        items: [
            { number: 22, title: 'Chicken Fried Rice with Soy Glazed Honey Chicken', imageSrc: '/assets/Menu/KS Menu Webp/Kids Menu/Chicken Fried Rice with Soy Glazed Honey Chicken.webp', price: '385', badges: ['new'], description: 'Served with an appetizer (2pcs: chicken nuggets or fish fingers) and iced Milo or a fountain drink of choice.' },
        ]
    },
    {
        id: 'e-noodles',
        name: 'Noodles',
        addOns: [ { title: 'Poached Egg', price: '35' }, { title: 'Vegetarian Som Tam', price: '85' } ],
        items: [
            { number: 23, title: 'Thai Chilli Garlic Noodles', imageSrc: '/assets/Menu/KS Menu Webp/E. Noodles/Thai Chilli Garlic Noodles.webp', price: '365', badges: ['spicy', 'new'], description: 'Stir-fried dragon noodles in chili garlic sauce, served with prawn.' },
            { number: 24, title: 'Pad Thai', imageSrc: '/assets/Menu/KS Menu Webp/E. Noodles/Pad Thai.webp', price: '385', badges: ['featured'], description: 'Stir-fried flat rice noodles with prawn & chicken in Tom Yum chilli paste, greens & peanut.' },
            { number: 25, title: 'KS Special Mixed Noodles', imageSrc: '/assets/Menu/KS Menu Webp/E. Noodles/KS Special Mixed Noodles.webp', price: '410', badges: ['special', 'new'], description: 'Stir-fried dragon noodles in a savory, umami sweet soy-based sauce with egg, chicken and seafood.' },
            { number: 26, title: 'Khao Soi Gai', imageSrc: '/assets/Menu/KS Menu Webp/E. Noodles/Khao Soi Gai.webp', price: '455', badges: ['special'], description: 'Coconut red curry based noodle soup with chicken, crispy noodles and chilli oil.' },
            { number: 27, title: 'Khao Soi Neua', imageSrc: '/assets/Menu/KS Menu Webp/E. Noodles/Khao Soi Neua.webp', price: '535', description: 'Coconut red curry based noodle soup with beef, crispy noodles and chilli oil.' },
        ]
    },
    {
        id: 'f-rice',
        name: 'Rice',
        addOns: [ { title: 'Poached Egg', price: '35' }, { title: 'Vegetarian Som Tam', price: '85' }, { title: 'Steamed Rice', price: '100' } ],
        items: [
            { number: 28, title: 'Thai Fried Rice', imageSrc: '/assets/Menu/KS Menu Webp/F. Rice/Thai Fried Rice.webp', price: '215', groupPrice: '325', description: 'Classic Thai fried rice served with greens.' },
            { number: 29, title: 'Pineapple Fried Rice', imageSrc: '/assets/Menu/KS Menu Webp/F. Rice/Pineapple Fried Rice.webp', price: '215', groupPrice: '325', description: 'Stir-fried pineapple rice served with cashew nut, scrambled eggs and greens.' },
            { number: 30, title: 'Tom Yum Rice with Prawn', imageSrc: '/assets/Menu/KS Menu Webp/F. Rice/Tom Yum Rice with Prawn.webp', price: '255', groupPrice: '385', description: "Chef's special fried rice with classic Tom Yum chilli paste, served with prawns." },
            { number: 31, title: 'Khao San Seafood Rice', imageSrc: '/assets/Menu/KS Menu Webp/F. Rice/Khao San Seafood Rice.webp', price: '275', groupPrice: '415', badges: ['special', 'featured'], description: "Chef's special fried rice served with grilled prawn and calamari." },
        ]
    },
    {
        id: 'g-chicken',
        name: 'Chicken',
        items: [
            { number: 32, title: 'Ginger Chicken', imageSrc: '/assets/Menu/KS Menu Webp/G. Chicken/Ginger Chicken.webp', price: '395', badges: ['featured'], description: 'Stir-fried chicken strips in a thick gravy infused with galangal, mushrooms and greens.' },
            { number: 33, title: 'Soy Glazed Honey Chicken', imageSrc: '/assets/Menu/KS Menu Webp/G. Chicken/Soy Glazed Honey Chicken.webp', price: '395', description: 'Thick cuts of chicken tossed in a dense glaze of honey and soya.' },
            { number: 34, title: 'Chicken Red Curry', imageSrc: '/assets/Menu/KS Menu Webp/G. Chicken/Chicken Red Curry.webp', price: '395', badges: ['special'], description: 'Thai red curry with chicken, classic coconut paste, eggplant and bamboo shoot.' },
            { number: 35, title: 'Chicken Green Curry', imageSrc: '/assets/Menu/KS Menu Webp/G. Chicken/Chicken Green Curry.webp', price: '395', description: 'Thai green curry with chicken, classic coconut paste, eggplant and bamboo shoot.' },
            { number: 36, title: 'Chicken in Black Pepper', imageSrc: '/assets/Menu/KS Menu Webp/G. Chicken/Chicken in Black Pepper.webp', price: '395', description: 'Stir-fried chicken tossed in a thick, savory black pepper sauce, with bell peppers, shallots and greens.' },
            { number: 37, title: 'Chicken Penang Curry', imageSrc: '/assets/Menu/KS Menu Webp/G. Chicken/Chicken Penang Curry.webp', price: '395', badges: ['special'], description: 'Chicken curry in a peanut infused thick, red coconut curry paste.' },
            { number: 38, title: 'Chicken in Holy Basil', imageSrc: '/assets/Menu/KS Menu Webp/G. Chicken/Chicken in Holy Basil.webp', price: '395', badges: ['spicy'], description: 'Minced chicken in a thick, spicy gravy with greens, chilli and holy basil.' },
            { number: 39, title: 'Grilled Pineapple Chicken', imageSrc: '/assets/Menu/KS Menu Webp/G. Chicken/Grilled Pineapple Chicken.webp', price: '395', badges: ['new'], description: 'Chicken curry infused in a thick, caramelized pineapple sauce, with chunks of grilled pineapple.' },
        ]
    },
    {
        id: 'h-beef',
        name: 'Beef',
        items: [
            { number: 40, title: 'Beef Basil', imageSrc: '/assets/Menu/KS Menu Webp/H. Beef/Beef Basil.webp', price: '505', badges: ['spicy'], description: 'Thinly sliced boneless beef in a thick, spicy gravy with vegetables, chilli and sweet basil.' },
            { number: 41, title: 'Beef Red Curry', imageSrc: '/assets/Menu/KS Menu Webp/H. Beef/Beef Red Curry.webp', price: '515', badges: ['special'], description: 'Thai red curry with beef, classic coconut paste, eggplant and bamboo shoot.' },
            { number: 42, title: 'Beef in Chilli Paste', imageSrc: '/assets/Menu/KS Menu Webp/H. Beef/Beef in Chilli Paste.webp', price: '525', description: 'Stir-fried boneless beef with tangy chilli paste and vegetables.' },
            { number: 43, title: 'Beef in Black Pepper', imageSrc: '/assets/Menu/KS Menu Webp/H. Beef/Beef in Black Pepper.webp', price: '525', description: 'Stir-fried beef tossed in a thick, savory black pepper sauce with bell pepper, shallots and greens.' },
            { number: 44, title: 'Wok Charred Beef', imageSrc: '/assets/Menu/KS Menu Webp/H. Beef/Wok Charred Beef.webp', price: '545', badges: ['featured'], description: 'Slow marinated dry beef tossed in a thick sweet and spicy sauce.' },
        ]
    },
    {
        id: 'i-seafood',
        name: 'Seafood',
        items: [
            { number: 45, title: 'Seafood Yellow Curry', imageSrc: '/assets/Menu/KS Menu Webp/I. Seafood/Seafood Yellow Curry.webp', price: '455', description: 'Thick yellow curry with prawn and dori fish in classic coconut paste.' },
            { number: 46, title: 'Calamari Stir Fry', imageSrc: '/assets/Menu/KS Menu Webp/I. Seafood/Calamari Stir Fry.webp', price: '455', badges: ['spicy'], description: 'Stir-fried squid in spicy Tom Yum gravy.' },
            { number: 47, title: 'Seafood Garlic Stir Fry', imageSrc: '/assets/Menu/KS Menu Webp/I. Seafood/Seafood Garlic Stir Fry.webp', price: '455', description: 'Stir-fried prawn, squid and fish, infused with garlic and greens.' },
            { number: 48, title: 'Seafood in Tom Yum Paste', imageSrc: '/assets/Menu/KS Menu Webp/I. Seafood/Seafood in Tom Yum Paste.webp', price: '465', description: 'Stir-fried prawn, squid and fish in sweet and sour Tom Yum gravy.' },
            { number: 49, title: 'Oriental Fish in Hot Sauce', imageSrc: '/assets/Menu/KS Menu Webp/I. Seafood/Oriental Fish in Hot Sauce.webp', price: '465', badges: ['spicy'], description: 'Chunks of dori in sweet and spicy gravy with bell pepper, shallots and greens.' },
            { number: 50, title: 'Steamed Whole Fish Infused with Garlic Lime Sauce', imageSrc: '/assets/Menu/KS Menu Webp/I. Seafood/Steamed Whole Fish Infused with Garlic Lime Sauce.webp', price: '925', badges: ['spicy'], description: 'A whole fish, steamed and finished with a bright garlic lime sauce.' },
            { number: 51, title: 'Fried Whole Fish in Spicy Hot Sauce', imageSrc: '/assets/Menu/KS Menu Webp/I. Seafood/Fried Whole Fish in Spicy Hot Sauce.webp', price: '925', badges: ['featured', 'spicy'], description: 'A whole fish, fried crisp and tossed in a bold, spicy hot sauce.' },
        ]
    },
    {
        id: 'j-vegetarian',
        name: 'Vegetarian',
        items: [
            { number: 52, title: 'Thai Red Curry', imageSrc: '/assets/Menu/KS Menu Webp/J. Vegetarian/Thai Red Curry.webp', price: '295', description: 'Coconut-based red curry with black mushroom, eggplant, bamboo shoot, shallots and greens.' },
            { number: 53, title: 'Thai Green Curry', imageSrc: '/assets/Menu/KS Menu Webp/J. Vegetarian/Thai Green Curry.webp', price: '295', description: 'Coconut-based green curry with black mushroom, eggplant, bamboo shoot, shallots and greens.' },
            { number: 54, title: 'Mushroom in Oyster Sauce', imageSrc: '/assets/Menu/KS Menu Webp/J. Vegetarian/Mushroom in Oyster Sauce.webp', price: '295', badges: ['spicy', 'featured'], description: 'Two types of mushroom, shallots, beans and greens in a spicy broth.' },
        ]
    },
    {
        id: 'k-rice-bowls',
        name: 'Rice Bowls',
        addOns: [ { title: 'Poached Egg', price: '35' }, { title: 'Vegetarian Som Tam', price: '85' }, { title: 'Steamed Rice', price: '100' } ],
        items: [
            { number: 55, title: 'Pad Kra Pao Gai', imageSrc: '/assets/Menu/KS Menu Webp/K. Rice Bowls/Pad Kra Pao Gai.webp', price: '515', description: 'Spicy Thai basil chicken served with jasmine rice, topped with a fried egg.' },
            { number: 56, title: 'Thai Chicken Bowl', imageSrc: '/assets/Menu/KS Menu Webp/K. Rice Bowls/Thai Chicken Bowl.webp', price: '565', description: 'Thai fried rice with an appetizer (2pcs: Bangkok fried chicken or chicken satay) and a curry (chicken in black pepper or Penang curry).' },
            { number: 57, title: 'Tom Yum Bowl', imageSrc: '/assets/Menu/KS Menu Webp/K. Rice Bowls/Tom Yum Bowl.webp', price: '595', badges: ['new'], description: 'Tom Yum prawn rice with an appetizer (2pcs: Thai fish cake or prawn tempura) and a curry (seafood in Tom Yum paste or seafood garlic stir fry).' },
            { number: 58, title: 'Thai Seafood Bowl', imageSrc: '/assets/Menu/KS Menu Webp/K. Rice Bowls/Thai Seafood Bowl.webp', price: '615', badges: ['featured'], description: 'Khao San seafood rice with an appetizer (2pcs: prawn tempura or Thai fish cake) and a curry (seafood in Tom Yum paste or oriental fish in hot sauce).' },
        ]
    },
    {
        id: 'l-desserts',
        name: 'Desserts',
        items: [
            { number: 59, title: 'Thai Milk Tea Ice Cream', imageSrc: '/assets/Menu/KS Menu Webp/L. Desserts/Thai Milk Tea Ice Cream.webp', price: '205', badges: ['new', 'special'], description: 'House special ice cream infused with the classic flavor of Thai milk tea.' },
            { number: 60, title: 'Coconut Ice Cream Over Sticky Rice', imageSrc: '/assets/Menu/KS Menu Webp/L. Desserts/Coconut Ice Cream Over Sticky Rice.webp', price: '205', description: 'Creamy coconut ice cream, sprinkled with toasted peanuts & served on Thai sticky rice.' },
            { number: 61, title: 'Pina Colada Sorbet', imageSrc: '/assets/Menu/KS Menu Webp/L. Desserts/Pina Colada Sorbet.webp', price: '215', badges: ['new'], description: 'Pineapple and coconut based fusion sorbet served with fruit chunks.' },
            { number: 62, title: 'Tapioca Mango Pudding', imageSrc: '/assets/Menu/KS Menu Webp/L. Desserts/Tapioca Mango Pudding.webp', price: '315', description: 'Coconut infused mango purée served with tapioca pearls in a jar.' },
            { number: 63, title: 'Mango Sticky Rice', imageSrc: '/assets/Menu/KS Menu Webp/L. Desserts/Mango Sticky Rice.webp', price: '385', badges: ['featured'], description: 'Seasonal mango served with creamy sticky rice infused in coconut milk.', addOnNote: 'Add coconut ice cream - 465 BDT total.' },
        ]
    },
    {
        id: 'm-drinks',
        name: 'Drinks',
        items: [
            { number: 64, title: 'Lemon Tea (Hot)', imageSrc: '/assets/Menu/KS Menu Webp/M. Drinks/Lemon Tea (Hot).webp', price: '95', description: 'A warming, citrus-bright classic.' },
            { number: 65, title: 'Lemongrass Ginger Tea (Hot)', imageSrc: '/assets/Menu/KS Menu Webp/M. Drinks/Lemongrass Ginger Tea (Hot).webp', price: '95', badges: ['new'], description: 'A soothing infusion of lemongrass and ginger.' },
            { number: 66, title: 'Chilled Lemon Tea', imageSrc: '/assets/Menu/KS Menu Webp/M. Drinks/Chilled Lemon Tea.webp', price: '235', description: 'Cold-brewed lemon tea served over ice.' },
            { number: 67, title: 'Iced Milo', imageSrc: '/assets/Menu/KS Menu Webp/M. Drinks/Iced Milo.webp', price: '245', description: 'Chocolate malt classic, served ice cold.' },
            { number: 68, title: 'Tropical Cream Limeade', imageSrc: '/assets/Menu/KS Menu Webp/M. Drinks/Tropical Cream Limeade.webp', price: '245', description: 'A creamy, tart limeade with tropical notes.' },
            { number: 69, title: 'Cold Brewed Tea', imageSrc: '/assets/Menu/KS Menu Webp/M. Drinks/Cold Brewed Tea.webp', price: '245', badges: ['new'], description: 'Flavors: Blueberry / Peach / Apple.' },
            { number: 70, title: 'Fruit Flavored Mojito', imageSrc: '/assets/Menu/KS Menu Webp/M. Drinks/Mixed Berry Mojito.webp', price: '265', badges: ['new'], description: 'Flavors: Blueberry / Peach / Apple.' },
            { number: 71, title: 'Coconut Shake', imageSrc: '/assets/Menu/KS Menu Webp/M. Drinks/Coconut Shake.webp', price: '275', description: 'A rich, chilled coconut shake.' },
            { number: 72, title: 'Thai Iced Milk Tea', imageSrc: '/assets/Menu/KS Menu Webp/M. Drinks/Thai Iced Milk Tea.webp', price: '295', description: 'The signature sweet, creamy Thai tea, served over ice.' },
            { number: 73, title: 'Soft Drinks (Fountain)', imageSrc: '/assets/Menu/KS Menu Webp/M. Drinks/Thai Iced Milk Tea.webp', price: '70', description: 'Fountain soft drinks.' },
            { number: 74, title: 'Soft Drinks (Can/Bottle)', imageSrc: '/assets/Menu/KS Menu Webp/M. Drinks/Thai Iced Milk Tea.webp', price: 'MRP', description: 'Bottled or canned soft drinks at MRP.' },
            { number: 75, title: 'Water', imageSrc: '/assets/Menu/KS Menu Webp/M. Drinks/Thai Iced Milk Tea.webp', price: 'MRP', description: 'Bottled water at MRP.' },
        ]
    },
];


const prefersReducedMotion = () =>
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function Menu() {
    const [activeIndex, setActiveIndex] = useState(0);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
    const [railVisible, setRailVisible] = useState(false);
    useEffect(() => {
        const hero = document.querySelector('.menu-hero');
        if (!hero) return;
        const observer = new IntersectionObserver(
            ([entry]) => setRailVisible(!entry.isIntersecting),
            { threshold: 0 }
        );
        observer.observe(hero);
        return () => observer.disconnect();
    }, []);
    const navRefs = useRef<(HTMLAnchorElement | null)[]>([]);
    const [pillStyle, setPillStyle] = useState({ left: 0, width: 0, opacity: 0 });
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Update the sliding pill position
    useEffect(() => {
        const currentRef = navRefs.current[activeIndex];
        if (currentRef && scrollContainerRef.current) {
            // Calculate left relative to the scroll container's content
            // offsetLeft is relative to the offsetParent (the container if it has position: relative)
            setPillStyle({
                left: currentRef.offsetLeft,
                width: currentRef.offsetWidth,
                opacity: 1
            });

            // Scroll the container to keep the active item in view
            const container = scrollContainerRef.current;
            const scrollLeft = currentRef.offsetLeft - container.offsetWidth / 2 + currentRef.offsetWidth / 2;
            container.scrollTo({ left: scrollLeft, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
        }
    }, [activeIndex]);

    // Intersection Observer for scroll tracking
    useEffect(() => {
        const observers: IntersectionObserver[] = [];

        MENU_DATA.forEach((category, index) => {
            const el = document.getElementById(category.id);
            if (el) {
                const observer = new IntersectionObserver(
                    ([entry]) => {
                        if (entry.isIntersecting) {
                            setActiveIndex(index);
                        }
                    },
                    { rootMargin: '-20% 0px -75% 0px' }
                );
                observer.observe(el);
                observers.push(observer);
            }
        });

        return () => {
            observers.forEach(obs => obs.disconnect());
        };
    }, []);

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, index: number, id: string) => {
        e.preventDefault();
        setActiveIndex(index);
        const el = document.getElementById(id);
        if (el) {
            // smooth scroll to element, accounting for sticky headers
            const y = el.getBoundingClientRect().top + window.scrollY - 140;
            window.scrollTo({ top: y, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
        }
    };

    const railPressed = useRef(false);
    const railRef = useRef<HTMLElement>(null);

    const focusFromPoint = useCallback((clientX: number, clientY: number) => {
        const items = railRef.current?.querySelectorAll('[data-index]');
        if (!items) return;
        let closest: Element | null = null;
        let closestDist = Infinity;
        items.forEach(item => {
            const rect = item.getBoundingClientRect();
            const cy = rect.top + rect.height / 2;
            const dist = Math.abs(clientY - cy);
            if (dist < closestDist) { closestDist = dist; closest = item; }
        });
        if (closest) {
            const idx = parseInt((closest as HTMLElement).getAttribute('data-index') || '', 10);
            if (!isNaN(idx)) setFocusedIndex(idx);
        }
    }, []);

    const jumpTo = useCallback((index: number) => {
        const category = MENU_DATA[index];
        const el = document.getElementById(category.id);
        if (el) {
            const y = el.getBoundingClientRect().top + window.scrollY - 120;
            window.scrollTo({ top: y, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
            setActiveIndex(index);
        }
    }, []);

    const handleRailStart = useCallback((clientX: number, clientY: number) => {
        railPressed.current = true;
        setMobileMenuOpen(true);
        focusFromPoint(clientX, clientY);
    }, [focusFromPoint]);

    const handleRailMove = useCallback((clientY: number) => {
        if (!railPressed.current) return;
        focusFromPoint(0, clientY);
    }, [focusFromPoint]);

    const handleRailEnd = useCallback(() => {
        if (railPressed.current && focusedIndex !== null) {
            jumpTo(focusedIndex);
        }
        railPressed.current = false;
        setMobileMenuOpen(false);
        setFocusedIndex(null);
    }, [focusedIndex, jumpTo]);

    return (
        <>
        {/*  Menu Hero - one dramatic dish under a warm spotlight, immersive  */}
        <section className="menu-hero bg-lattice">
            <div className="menu-hero-glow" aria-hidden="true"></div>
            <div className="menu-hero-inner">
                <div className="reveal-hidden menu-hero-copy">
                    <span className="overline" style={{ color: 'var(--color-primary)', letterSpacing: '4px', display: 'block', marginBottom: '18px' }}>The Menu</span>
                    <h1 className="display-1" style={{ marginBottom: '24px', color: 'var(--color-text-primary)', fontFamily: 'var(--font-display)', fontWeight: 700, lineHeight: 1.02 }}>
                        A journey<br />through fire.
                    </h1>
                    <p className="body-large" style={{ color: 'var(--color-text-secondary)', fontSize: '1.2rem', lineHeight: 1.6, maxWidth: '44ch', marginBottom: '20px' }}>
                        From fiery street-stall classics to whole-fish showpieces - every plate carries the char, spice and balance of Bangkok.
                    </p>
                    <p style={{ color: 'var(--color-primary)', fontWeight: 600, letterSpacing: '0.08em', fontSize: '0.9rem', marginBottom: '40px' }}>
                        75 dishes · 14 chapters
                    </p>
                    <a href="#a-appetizers" className="btn btn-primary" onClick={(e) => handleClick(e, 0, 'a-appetizers')}>Begin with Appetizers</a>
                </div>

                <div className="reveal-hidden menu-hero-stage">
                    <div className="menu-hero-cluster">
                        <div className="dish dish--float mh-dish mh-dish--hero" style={{ aspectRatio: '1 / 1' }}>
                            <Image className="dish-img img-feather" src="/assets/Menu/KS Menu Webp/B. Soups/Tom Yum Goong.webp" alt="Tom Yum Goong" fill sizes="(max-width: 860px) 60vw, 30vw" priority />
                        </div>
                        <div className="dish dish--float mh-dish mh-dish--sat-a" style={{ aspectRatio: '1 / 1' }}>
                            <Image className="dish-img img-feather" src="/assets/Menu/KS Menu Webp/E. Noodles/Pad Thai.webp" alt="Pad Thai" fill sizes="(max-width: 860px) 34vw, 17vw" />
                        </div>
                        <div className="dish dish--float mh-dish mh-dish--sat-b" style={{ aspectRatio: '1 / 1' }}>
                            <Image className="dish-img img-feather" src="/assets/Menu/KS Menu Webp/D. Salads/Som Tam (Thai Papaya Salad).webp" alt="Som Tam papaya salad" fill sizes="(max-width: 860px) 26vw, 13vw" />
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ position: 'absolute', bottom: '24px', left: '50%', transform: 'translateX(-50%)', zIndex: 3, textAlign: 'center', opacity: 0.6 }}>
                <div className="ember-drift-track"><div className="ember-drift-dot"></div></div>
            </div>
            <SectionBlend />
        </section>

        {/*  Category Navigation  */}
        <section
            className="menu-nav-section"
            style={{
                position: 'sticky',
                top: '100px', // Below the main header, with a bit of gap
                zIndex: 50,
                padding: '0 var(--space-component)', // Add padding to avoid touching screen edges
                display: 'flex',
                justifyContent: 'center',
                pointerEvents: 'none', // Let clicks pass through the invisible section wrapper
            }}
        >
            <div
                className="container"
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    pointerEvents: 'auto' // Re-enable clicks for the actual nav
                }}
            >
                <div
                    ref={scrollContainerRef}
                    className="menu-nav"
                    style={{
                        backgroundColor: 'var(--color-surface-elevated)', // elevated brand color
                        border: '1px solid var(--color-border)',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                        borderRadius: '40px',
                        padding: '8px',
                        display: 'flex',
                        position: 'relative',
                        overflowX: 'auto',
                        scrollbarWidth: 'none',
                        WebkitOverflowScrolling: 'touch',
                        gap: '8px',
                        maxWidth: '100%'
                    }}
                >
                    {/* The Sliding Pill */}
                    <div
                        style={{
                            position: 'absolute',
                            top: 0,
                            height: '100%',
                            left: `${pillStyle.left}px`,
                            width: `${pillStyle.width}px`,
                            opacity: pillStyle.opacity,
                            backgroundColor: 'var(--color-primary)', // Solid primary brand color
                            borderRadius: '30px',
                            transition: 'all 0.4s cubic-bezier(0.25, 1, 0.5, 1)',
                            pointerEvents: 'none', // Allow clicking through
                            zIndex: 0,
                            boxShadow: '0 4px 12px rgba(240, 139, 67, 0.4)' // Glow effect matching the primary color
                        }}
                    />

                    {MENU_DATA.map((category, index) => (
                        <a
                            key={category.id}
                            href={`#${category.id}`}
                            className="overline menu-nav-item"
                            ref={el => { navRefs.current[index] = el; }}
                            onClick={(e) => handleClick(e, index, category.id)}
                            style={{
                                position: 'relative',
                                zIndex: 1,
                                whiteSpace: 'nowrap',
                                textDecoration: 'none',
                                padding: '10px 24px',
                                color: activeIndex === index ? '#ffffff' : 'var(--color-text-secondary)',
                                fontWeight: activeIndex === index ? 600 : 400,
                                transition: 'color 0.3s ease, font-weight 0.3s ease',
                                fontSize: '0.8rem',
                                letterSpacing: '0.15em',
                                margin: 0,
                                borderRadius: '30px'
                            }}
                        >
                            {category.name}
                        </a>
                    ))}
                </div>
            </div>
            <style dangerouslySetInnerHTML={{__html: `
                .menu-nav::-webkit-scrollbar { display: none; }
                .mobile-vertical-nav {
                    display: none;
                }
                @media (max-width: 1024px) {
                    .menu-nav-section {
                        top: 80px !important;
                        padding: 0 !important;
                        width: 100vw !important;
                        left: 50% !important;
                        right: 50% !important;
                        margin-left: -50vw !important;
                        margin-right: -50vw !important;
                        background-color: rgba(5, 7, 10, 0.88) !important;
                        backdrop-filter: blur(12px) !important;
                        -webkit-backdrop-filter: blur(12px) !important;
                        border-bottom: 1px solid rgba(255, 255, 255, 0.04) !important;
                    }
                    .menu-nav-section > div {
                        justify-content: flex-start !important;
                        padding: 0 !important;
                        width: 100% !important;
                        max-width: 100% !important;
                    }
                    .menu-nav {
                        max-width: 100% !important;
                        width: 100% !important;
                        border-radius: 0 !important;
                        border: none !important;
                        background-color: transparent !important;
                        box-shadow: none !important;
                        padding: 8px 16px !important;
                        overflow-x: auto !important;
                        -webkit-overflow-scrolling: touch !important;
                    }
                }
                @media (max-width: 768px) {
                    .menu-nav-section {
                        display: none !important;
                    }
                    .menu-category h2 {
                        font-size: 2rem !important;
                        padding-bottom: 16px !important;
                        margin-bottom: 32px !important;
                    }
                }
            `}} />
        </section>

        {/* Phone-only contextual section rail - a document-outline navigator.
            Drag a finger along it and sections magnify under the touch; release
            or tap to jump. The active section stays marked at all times. Hidden
            on desktop, where the horizontal pill nav takes over. Portalled to
            <body> so its position:fixed escapes the transformed page wrapper. */}
        {railVisible && createPortal(
        <>
        {/* Backdrop strip - darkens the rail area on touch so white labels
            never collide with white menu content behind them. */}
        <div
            aria-hidden="true"
            className={`menu-rail-backdrop ${mobileMenuOpen ? 'menu-rail-backdrop--active' : ''}`}
        />
        <nav
            ref={railRef}
            className={`menu-rail ${mobileMenuOpen ? 'menu-rail--active' : ''}`}
            aria-label="Menu sections"
            onTouchStart={(e) => { e.preventDefault(); const t = e.touches[0]; handleRailStart(t.clientX, t.clientY); }}
            onTouchMove={(e) => { e.preventDefault(); const t = e.touches[0]; handleRailMove(t.clientY); }}
            onTouchEnd={() => handleRailEnd()}
            onTouchCancel={() => handleRailEnd()}
            onPointerDown={(e) => { if (e.pointerType === 'mouse') handleRailStart(e.clientX, e.clientY); }}
            onPointerMove={(e) => { if (e.pointerType === 'mouse') handleRailMove(e.clientY); }}
            onPointerUp={(e) => { if (e.pointerType === 'mouse') handleRailEnd(); }}
        >
            {MENU_DATA.map((category, index) => {
                const refIndex = focusedIndex !== null ? focusedIndex : activeIndex;
                const isActive = index === activeIndex;
                const isRef = index === refIndex;
                const distance = Math.abs(index - refIndex);
                const showName = mobileMenuOpen;
                const dashW = distance === 0 ? 30 : distance === 1 ? 18 : distance === 2 ? 11 : 6;
                const nameScale = distance === 0 ? 1 : distance === 1 ? 0.9 : 0.82;
                const nameOpacity = distance === 0 ? 1 : distance === 1 ? 0.72 : distance === 2 ? 0.45 : 0.28;
                const dashOpacity = isActive ? 1 : 0.25 + (1 - Math.min(distance, 3) / 3) * 0.55;
                return (
                    <button
                        key={category.id}
                        type="button"
                        data-index={index}
                        aria-current={isActive ? 'true' : undefined}
                        className="menu-rail-item"
                        onClick={() => jumpTo(index)}
                    >
                        <span
                            className="menu-rail-name"
                            data-index={index}
                            style={{
                                opacity: showName ? nameOpacity : 0,
                                transform: `translateY(-50%) translateX(${showName ? 0 : 12}px) scale(${nameScale})`,
                                color: isRef ? 'var(--color-primary)' : 'var(--color-text-primary)',
                            }}
                        >
                            {category.name}
                        </span>
                        <span
                            className="menu-rail-dash"
                            data-index={index}
                            style={{
                                width: `${dashW}px`,
                                backgroundColor: isActive ? 'var(--color-primary)' : '#fff',
                                opacity: dashOpacity,
                                boxShadow: isActive ? '0 0 10px var(--color-primary)' : 'none',
                            }}
                        />
                    </button>
                );
            })}
        </nav>,
        </>,
        document.body)}

        {/* Menu Sections - continuous scroll */}
        <div className="menu-sections bg-lattice" style={{backgroundColor: 'var(--color-surface-base)', paddingTop: 'clamp(56px, 7vw, 104px)', paddingBottom: '80px'}}>
            {MENU_DATA.map((category) => (
                <section key={category.id} id={category.id} className="menu-category" style={{marginBottom: 'var(--space-macro)'}}>
                    <div className="container">
                        <h2 className="display-2" style={{borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '40px', marginBottom: '80px', fontSize: 'clamp(3rem, 6vw, 4.5rem)'}}>
                            {category.name}
                        </h2>
                        <div className="menu-grid" style={{ columnGap: '8vw' }}>
                            {category.items.map((item, index) => (
                                <MenuCard
                                    key={item.number}
                                    index={index}
                                    number={item.number}
                                    title={item.title}
                                    imageSrc={item.imageSrc}
                                    price={item.price}
                                    groupPrice={item.groupPrice}
                                    portionNote={item.portionNote}
                                    description={item.description}
                                    badges={item.badges}
                                    addOnNote={item.addOnNote}
                                    angled={item.angled}
                                />
                            ))}
                        </div>

                        {category.addOns && (
                            <div style={{ marginTop: '64px', paddingTop: '40px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                <span className="overline" style={{ color: 'var(--color-primary)', display: 'block', marginBottom: '20px' }}>Add Ons</span>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px 40px' }}>
                                    {category.addOns.map((addOn) => (
                                        <div key={addOn.title} style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                                            <span style={{ color: 'var(--color-text-primary)', fontSize: '0.95rem' }}>{addOn.title}</span>
                                            <span style={{ color: 'var(--color-primary)', fontWeight: 600, fontSize: '0.9rem' }}>{addOn.price} BDT</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            ))}
        </div>

        {/* Menu terms & legend - sourced from the printed menu's closing page */}
        <section style={{ backgroundColor: 'var(--color-surface-elevated)', padding: '56px 0', borderTop: '1px solid rgba(255,255,255,0.05)', position: 'relative' }}>
            <SectionBlend />
            <div className="container">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '32px' }}>
                    <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>🌶️ Spicy</span>
                    <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>📕 Special</span>
                    <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>📷 Featured</span>
                    <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>✨ New</span>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, color: 'var(--color-text-secondary)', fontSize: '0.85rem', lineHeight: 2, maxWidth: '640px' }}>
                    <li>All prices are inclusive of 5% VAT and applicable SD.</li>
                    <li>A 5% service charge is applied on the final bill.</li>
                    <li>All meat served is 100% halal.</li>
                    <li>All prices are listed in Bangladeshi Taka (BDT).</li>
                    <li>Please alert your server if you&rsquo;re allergic to any ingredients.</li>
                </ul>
            </div>
        </section>
        </>
    );
}
