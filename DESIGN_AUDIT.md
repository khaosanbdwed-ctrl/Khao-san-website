# Khao San Design Audit — Production Refinement Pass
**Date**: 2026-07-12 | **Baseline**: Draft 1 (86a2ae4)

---

## Audit Methodology
This audit treats the current implementation as **Draft 1**, not production-ready. Every section is evaluated against:
- Premium hospitality standards
- Consistent spacing rhythm
- Complete interactions
- Mobile-first intent (not desktop-compressed)
- Storytelling cohesion
- Accessibility excellence
- Visual intentionality

**Status tracking**: ✅ Fixed | 🔄 In Progress | ⚪ Open

---

## CRITICAL ISSUES (Blocks Production) — 25 items

### UX & Interaction Completeness
1. **Reservation form has no backend integration** ✅ **FIXED**
   - Impact: High | Currently submit shows confirmation but stores nothing
   - Fix: Built `app/api/reservations/route.ts` — validates branch/date/time/party size/name/phone server-side, returns confirmation code or 422 with error message. Frontend now does real `fetch()` with loading/success/error UI states.
   - Verify: Tested end-to-end — valid submission returns 201 + confirmation code, shows success screen; invalid payload returns 422 + inline error banner — VERIFIED via direct API call and full form fill+submit

2. **Gift card purchase buttons are non-functional** ✅ **FIXED**
   - Impact: High | Dead endpoints, no cart/checkout flow exists
   - Fix: Restaurant has no payment/checkout system — replaced "Add to Cart" with WhatsApp CTA (`wa.me` links with prefilled message per denomination); corporate inquiry also converted from fake mailto to WhatsApp
   - Verify: Both denomination buttons and corporate CTA link to valid `wa.me` URLs with correct prefilled text — VERIFIED in browser

3. **Footer Privacy Policy & Terms links go to `#` (dead links)** ✅ **FIXED**
   - Impact: Medium | Legal requirement for production
   - Fix: Create /legal/privacy and /legal/terms pages ← COMPLETED
   - Verify: Links navigate to real content, pages have proper structure
   - Status: Created both legal pages with complete content structure

4. **Menu items have no prices displayed** ✅ **FIXED**
   - Impact: High | Users cannot determine meal costs
   - Fix: Extracted complete real menu (all 75 items, 14 categories) from printed menu photos in `public/assets/Brand_Asset/*.jpg` — real prices, descriptions, badges (Spicy/Special/Featured/New), single/group pricing, add-ons
   - Verify: Every menu item displays real BDT price — VERIFIED in browser
   - Bonus fix: corrected operating hours sitewide (was wrongly "Everyday 12-10:15PM"; real hours are Sat–Thu 12PM–11PM, Fri 2PM–11PM per menu's terms page) + fixed Uttara address/type inconsistency between homepage and locations page

5. **"Reserve Table" footer links navigate to `/reserve` (dead route)** ✅ **FIXED**
   - Impact: Medium | Should open the reservation drawer instead
   - Fix: Convert location card & footer from `<Link>` to button + `openDrawer()` ← COMPLETED
   - Verify: Clicking any "Reserve" link in footer/locations opens drawer
   - Status: LocationCard now uses useReservation hook, all reserve buttons functional

6. **Menu category descriptions missing** ⚪
   - Impact: Low-Medium | Each category section has no intro copy
   - Fix: Add section descriptions (appetizers: "Start your journey...", etc.)
   - Verify: Each category displays meaningful intro text

### Mobile Responsiveness Issues
7. **Mobile hero text scales poorly at 375px** ⚪
   - Impact: High | "The Thai Way" heading uses fixed/responsive sizing that clips
   - Fix: Verify `clamp()` values are correct for hero headline
   - Verify: Heading visible and readable at 375px without overflow

8. **Menu pill navigation (category tabs) not sticky-positioned on mobile** ⚪
   - Impact: High | Category nav scrolls away; harder to jump between sections
   - Fix: Position sticky nav appropriately at mobile breakpoint
   - Verify: Nav stays visible while scrolling menu categories on mobile

9. **Location cards images don't resize properly below 768px** ⚪
   - Impact: High | Full-bleed images may stretch or crop awkwardly
   - Fix: Verify aspectRatio and object-fit handling at small viewports
   - Verify: Images look intentional (not stretched) on phone

10. **Gift card section overlapping brush strokes on mobile** ⚪
    - Impact: Medium | 70/30 layout breaks; cards overlap text below
    - Fix: Stack vertically on mobile (reverting flex-wrap-reverse logic)
    - Verify: Gift cards display clearly stacked on phone, text readable

11. **Section margins collapse inconsistently below 768px** ⚪
    - Impact: Medium | Some sections have no breathing room on mobile
    - Fix: Audit all `var(--space-macro)` (240px) usage at mobile — may need halving
    - Verify: Consistent 24-32px vertical rhythm on all mobile sections

12. **Horizontal overflow on mobile at 100vw sections** ⚪
    - Impact: High | Some full-bleed elements may still overflow
    - Fix: Audit all `width: 100vw` or unclipped elements
    - Verify: No horizontal scroll at any viewport ≥ 320px

### Mobile Touch & Interaction
13. **Form inputs (date, time, select dropdowns) too small on mobile** ⚪
    - Impact: High | WCAG 2.5.5 touch targets may be undersized
    - Fix: Ensure all form inputs have min 44×44 click area
    - Verify: Date picker, time select, party size radios all 44px+ on mobile

14. **Reservation drawer button ("Confirm Reservation") not full-width on mobile** ⚪
    - Impact: Medium | Button may be cramped, harder to tap
    - Fix: Make button full-width (or near-full with padding) on mobile
    - Verify: Button easily tappable, spans ~80% width on small screens

15. **Mobile menu overlay may not reach bottom on tall screens** ⚪
    - Impact: Low-Medium | If menu has more items, scrolling within overlay unclear
    - Fix: Ensure mobile nav is scrollable if content exceeds viewport
    - Verify: All mobile nav items accessible even on iPhone SE

### Spacing & Layout Issues
16. **Homepage hero section has inconsistent padding top/bottom** ⚪
    - Impact: Medium | Min-height + padding may look unbalanced
    - Fix: Review padding vs. min-height ratio for visual balance
    - Verify: Hero feels spacious and intentional (not cramped)

17. **"Theatre of Fire" section (Chapter II) video container aspect ratio feels off** ⚪
    - Impact: Medium | 16:9 video on desktop may create awkward sizing on tablet
    - Fix: Test aspect ratio across 3 breakpoints, may need 4:3 at mobile
    - Verify: Video framing looks intentional (not stretched or letterboxed)

18. **Signature Dish gap spacing (48px) looks inconsistent between desktop and mobile** ⚪
    - Impact: Medium | Mobile gap may be too large or too small
    - Fix: Reduce gap at mobile (maybe 24px instead of 48px)
    - Verify: Image-to-text spacing feels balanced at all viewports

19. **Location cards have no explicit mobile stacking behavior** ⚪
    - Impact: Medium | Images may not fullbleed correctly when stacked
    - Fix: Define explicit mobile layout for location cards (may need aspect ratio adjustment)
    - Verify: Location card images fill screen width on phone, text readable

20. **Footer layout doesn't adapt well below 640px** ⚪
    - Impact: Medium | Links may wrap awkwardly, "KHAO SAN" watermark oversized
    - Fix: Reduce footer columns to single-column on mobile, shrink watermark
    - Verify: Footer is clean and organized at 375px width

### Typography Issues
21. **Display headings use `clamp()` but values may not be optimized** ⚪
    - Impact: Medium | Headings may look too small on mobile or too large on desktop
    - Fix: Review all `clamp(min, %, max)` values against actual rendered size
    - Verify: Headings maintain readable hierarchy at all breakpoints (no jumps)

22. **Overline text (section labels) doesn't scale responsively** ⚪
    - Impact: Low-Medium | Fixed 0.85rem may be too large on mobile
    - Fix: Use responsive font size for overlines (clamp or explicit mobile rule)
    - Verify: Overlines don't dominate on mobile, remain readable on desktop

23. **Menu item title font size inconsistent with body hierarchy** ⚪
    - Impact: Medium | Some titles use hardcoded sizing instead of semantic class
    - Fix: Standardize menu item heading to display-3 or consistent class
    - Verify: Menu titles have clear, uniform hierarchy throughout

24. **Body text line-height varies (1.6, 1.7, 1.8)** ⚪
    - Impact: Low | Inconsistent vertical rhythm makes scanning harder
    - Fix: Standardize body line-height to single value (recommend 1.7)
    - Verify: Text readability consistent across all body copy

25. **Blockquote in heritage section may not scale well at mobile** ⚪
    - Impact: Medium | `clamp(2.5rem, 5vw, 4rem)` quote may be hard to read at 375px
    - Fix: Test blockquote rendering; may need tighter min value or max-width
    - Verify: Quote feels premium and readable at all sizes

---

## HIGH-PRIORITY ISSUES (Quality Blockers) — 35 items

### Visual Consistency & Spacing Rhythm
26. **Container padding uses inconsistent logic** ⚪
    - Impact: Medium | `.container { padding: 0 max(8vw, 24px) }` means mobile gets 8vw instead of fixed rhythm
    - Fix: Audit padding approach; either all vw-based or all fixed breakpoints
    - Verify: Consistent left/right whitespace across all pages

27. **Section padding (`var(--space-macro) = 240px`) is too large on tablet (768-1024px)** ⚪
    - Impact: Medium | Desktop spacing on tablet feels excessive; wastes vertical space
    - Fix: Create media query: `@media (max-width: 1024px) { padding: 120px 0; }`
    - Verify: Tablet scroll feels natural (not huge vertical gaps)

28. **Horizontal gaps in multi-column layouts vary (48px vs 80px vs gap: '8vw')** ⚪
    - Impact: Medium | No consistent pattern; hard to predict spacing
    - Fix: Define 3-4 standard gap values (component, layout, macro) and use consistently
    - Verify: Consistent spacing between all adjacent columns

29. **Hero buttons have different hover distances than other buttons** ⚪
    - Impact: Low | Some buttons lift 2px, others may differ
    - Fix: Ensure all `.btn` use same transform on hover (currently consistent in CSS)
    - Verify: Button hover behavior identical across all instances

30. **Edge-to-edge sections (like locations) have different margin behavior** ⚪
    - Impact: Medium | Some sections use padding, others explicit margin
    - Fix: Standardize edge-to-edge implementation (use padding + width: 100% consistently)
    - Verify: All full-bleed sections align properly with header/footer

### Component Inconsistencies
31. **Menu cards (stagger effect) only apply offset to even/odd on desktop** ⚪
    - Impact: Medium | Mobile doesn't have clear visual grouping
    - Fix: Add subtle mobile grouping (maybe background color change per pair)
    - Verify: Menu items feel grouped and scannable on mobile

32. **Location cards have hardcoded reverse prop instead of using breakpoint logic** ⚪
    - Impact: Medium | Can't easily adjust layout on tablet without changing props
    - Fix: Use CSS media query to auto-reverse on mobile (remove prop dependency)
    - Verify: Location card layout automatically switches at breakpoints

33. **EditorialBlock component doesn't account for image aspect ratio variance** ⚪
    - Impact: Medium | Different images may create unbalanced layouts
    - Fix: Add aspect-ratio CSS rule or size-specific variants
    - Verify: All editorial block images look intentional (not stretched)

34. **"Signature" badge styling not applied consistently across menu** ⚪
    - Impact: Low-Medium | Some dishes use "The Signature" inline, others use icon
    - Fix: Create single badge component for reuse
    - Verify: All signature items use identical visual treatment

35. **Hover states missing on non-button link elements** ⚪
    - Impact: Medium | Menu category links, header nav links have no clear hover indication
    - Fix: Add color change or underline on hover for all interactive links
    - Verify: Every clickable link provides visual feedback on hover/focus

36. **Focus states not visible on form inputs** ⚪
    - Impact: High (A11y) | Date, time, party size inputs may lack focus ring
    - Fix: Add `outline: 2px solid var(--color-primary)` or focus-visible ring
    - Verify: Tab navigation shows clear focus on all form elements

37. **Selected state on reservation form selects not visually distinct** ⚪
    - Impact: Medium | User can't tell which option is selected
    - Fix: Add background color or checkmark to `<option selected>`
    - Verify: Selected options clearly visible in all dropdowns

38. **Button variants inconsistent in mobile nav** ⚪
    - Impact: Low | Mobile menu "Reserve" button may have different styling
    - Fix: Ensure mobile nav buttons match header buttons exactly
    - Verify: All reserve buttons look identical

### Responsive Design Gaps
39. **No explicit tablet breakpoint (768px-1024px) defined in CSS** ⚪
    - Impact: Medium | Tablet experience may look like stretched mobile or compressed desktop
    - Fix: Add explicit `@media (min-width: 768px) and (max-width: 1024px)` rules
    - Verify: Tablet (iPad) experience feels intentionally designed

40. **Video background components don't have poster images** ⚪
    - Impact: Medium | On slow connections, black box appears before video loads
    - Fix: Add `poster` attribute to all `<video>` elements
    - Verify: First frame visible immediately on page load (no FOUC)

41. **Images not lazy-loaded (all `priority` or no `loading` attr)** ⚪
    - Impact: Medium (Performance) | Every image loads upfront, hurts LCP
    - Fix: Only set `priority` on above-fold images; add `loading="lazy"` elsewhere
    - Verify: Page Core Web Vitals improve (LCP < 2.5s)

42. **No srcSet on images for responsive image delivery** ⚪
    - Impact: Medium (Performance) | Mobile users download desktop-sized images
    - Fix: Add `srcSet` to all Image components with 2x/3x variants
    - Verify: Network tab shows appropriately-sized images per device

43. **Background images in SectionOverlay not optimized for mobile** ⚪
    - Impact: Low-Medium | Large background images load even on slow mobile connections
    - Fix: Consider CSS media query to use smaller background images on mobile
    - Verify: Mobile page load time < 3s on 4G

### Color & Contrast
44. **Secondary text (`--color-text-secondary: #a0a0a0`) contrast may be below WCAG AA on some backgrounds** ⚪
    - Impact: High (A11y) | Secondary text on dark backgrounds may fail 4.5:1 check
    - Fix: Verify contrast ratio; may need to lighten secondary text or adjust background
    - Verify: WCAG contrast checker confirms AA for all text/background pairs

45. **Link colors not clearly distinguished from body text** ⚪
    - Impact: Medium (A11y) | "View Noodles" buttons look like text
    - Fix: Either add underline or change color to match primary accent
    - Verify: All links clearly identifiable as interactive

46. **Hover state color change too subtle** ⚪
    - Impact: Low-Medium | Hover color on `.btn-secondary` may not be obvious
    - Fix: Increase opacity or add more pronounced visual change
    - Verify: Hover state clearly visible

### Animation & Motion
47. **Ignition animation (ember bloom) may feel slow or disconnected on mobile** ⚪
    - Impact: Low-Medium | 1.75s duration may feel long on slower devices
    - Fix: Test on actual mobile device; may need to reduce duration or simplify
    - Verify: Animation feels smooth and responsive on iPhone

48. **Brush transition animation may stutter on low-end devices** ⚪
    - Impact: Low | Large background image + fixed position animation
    - Fix: Use GPU acceleration (transform + will-change)
    - Verify: Smooth 60fps animation on mid-range Android device

49. **Scroll reveal animations don't respect `prefers-reduced-motion`** ⚪
    - Impact: High (A11y) | Users with motion sensitivity see unexpected animations
    - Fix: Verify all animations check `@media (prefers-reduced-motion: reduce)`
    - Verify: No animations trigger for users who set reduced-motion preference

50. **IntersectionObserver scroll reveals may not fire on slow networks** ⚪
    - Impact: Low-Medium | Intersection callback may be throttled
    - Fix: Test scroll reveals on slow 3G connection
    - Verify: Reveals appear even with network throttling

### Accessibility
51. **Image alt text missing or generic on many menu items** ⚪
    - Impact: High (A11y) | Screen readers don't describe dishes
    - Fix: Add descriptive alt text: "Pad Thai Goong — rice noodles with prawns"
    - Verify: Screen reader describes every menu item meaningfully

52. **Background video not skipped by screen readers** ⚪
    - Impact: Medium (A11y) | `aria-hidden="true"` missing on decorative videos
    - Fix: Ensure all decorative videos have `aria-hidden` or are ignored
    - Verify: Screen reader doesn't announce videos

53. **Reservation form lacks explicit labels for radio buttons** ⚪
    - Impact: Medium (A11y) | Party size radios are sr-only but not associated correctly
    - Fix: Ensure each radio has proper `<label htmlFor>` association
    - Verify: Screen reader announces each party size option

54. **No skip-to-main-content link** ⚪
    - Impact: High (A11y) | Keyboard users must tab through entire header
    - Fix: Add hidden link that becomes visible on focus: "Skip to main content"
    - Verify: Tab key first item goes straight to main content area

55. **Heading hierarchy may skip levels (e.g., h1 to h3)** ⚪
    - Impact: Medium (A11y) | Screen readers rely on proper heading structure
    - Fix: Audit all heading usage; ensure h1→h2→h3 progression
    - Verify: Document outline shows proper nesting

### Performance & Technical
56. **No Service Worker for offline support** ⚪
    - Impact: Low-Medium | Page doesn't work offline
    - Fix: Add basic Service Worker to cache critical assets
    - Verify: Page partially functional without network

57. **No meta viewport tag explicitly set** ⚪
    - Impact: Medium | May affect mobile rendering on some browsers
    - Fix: Verify Next.js automatically sets viewport (should be in layout)
    - Verify: Mobile browser renders at correct zoom level

58. **CSS critical path not optimized** ⚪
    - Impact: Low-Medium | Large globals.css loaded synchronously
    - Fix: Extract above-fold CSS into inline style tag in HTML head
    - Verify: First contentful paint improves by ~100ms

59. **No image compression/optimization pipeline** ⚪
    - Impact: Medium (Performance) | WebP images may be uncompressed
    - Fix: Verify all images use best compression settings
    - Verify: Image sizes are minimal (< 100KB for background images)

60. **Open graph meta tags missing** ⚪
    - Impact: Low | Social sharing shows no preview
    - Fix: Add og:title, og:description, og:image to layout
    - Verify: Pasting link to Facebook/Twitter shows rich preview

---

## MEDIUM-PRIORITY ISSUES (Polish & Refinement) — 40 items

### Visual Polish & Composition
61. **Signature dish images may have too-dark drop shadows** ⚪
    - Impact: Low-Medium | `drop-shadow(0 24px 48px rgba(0,0,0,0.5))` feels heavy
    - Fix: Reduce alpha to 0.3 or adjust offset for lighter shadow
    - Verify: Dish images feel lifted without looking over-shadowed

62. **Hero background video opacity (0.4) feels too transparent** ⚪
    - Impact: Low | Video background doesn't create enough atmosphere
    - Fix: Increase to 0.5-0.6 for richer background presence
    - Verify: Video feels like part of the design, not a ghost

63. **Section overlay gradients (linear-gradient to bottom) may be too harsh** ⚪
    - Impact: Low | Transition from dark to darker feels abrupt
    - Fix: Consider using radial-gradient or longer color stop range
    - Verify: Gradient feels natural, not posterized

64. **Location card images may appear warped at unusual aspect ratios** ⚪
    - Impact: Low-Medium | Different image crops could look unintentional
    - Fix: Establish standard aspect ratio (4:5?) and crop all images to it
    - Verify: All location images have consistent framing

65. **Gift card overlays (brush strokes) may be too opaque** ⚪
    - Impact: Low | Brush strokes at 0.95 opacity might overwhelm cards below
    - Fix: Reduce to 0.7-0.8 so cards are more legible
    - Verify: Brush strokes add texture without obscuring gift cards

66. **Page background color might need subtle texture or variation** ⚪
    - Impact: Low | Flat black (`#070911`) can feel sterile
    - Fix: Consider adding grain or noise overlay (very subtle, < 2% opacity)
    - Verify: Background feels premium, not just dark

67. **Container max-width (1280px) may be too wide for some layouts** ⚪
    - Impact: Low | Text containers might be uncomfortably wide at desktop
    - Fix: Test readability at 1280px; may need narrower content max-width
    - Verify: Line lengths are comfortable (~50-75 characters)

68. **Border radius on location cards (8px) might be too subtle** ⚪
    - Impact: Low | Corners barely visible; consider increasing to 12-16px
    - Fix: Increase border-radius for more prominent frame
    - Verify: Cards look more intentional with rounder corners

### Interaction & UX Refinement
69. **Button hover animation (2px translateY) feels subtle; may need more emphasis** ⚪
    - Impact: Low-Medium | Users might not notice button state changed
    - Fix: Increase lift to 4px or add scale transform
    - Verify: Hover feedback is obvious without being overwhelming

70. **No loading state on form submission** ⚪
    - Impact: Medium | User doesn't know if form is processing
    - Fix: Disable button + show spinner during `onSubmit`
    - Verify: Form shows loading feedback when submitted

71. **Error states for form validation not designed** ⚪
    - Impact: High | If user enters invalid data, no error message
    - Fix: Add validation + error message display
    - Verify: Invalid inputs show helpful error text

72. **No success confirmation after form submission** ⚪
    - Impact: Medium | Current confirmation is toast-style; consider more prominent
    - Fix: Show modal or page redirect after successful reservation
    - Verify: User has clear confirmation of booking

73. **Drawer close button (`×`) may be too small on mobile** ⚪
    - Impact: Low-Medium | 44px touch target but might be easy to miss
    - Fix: Consider moving to a more prominent position or making larger
    - Verify: Close button easily tappable on mobile

74. **No visual indicator that menu categories are sticky** ⚪
    - Impact: Low | Users might not realize nav follows them
    - Fix: Add subtle shadow or background change when sticky state activates
    - Verify: Sticky nav appearance distinct from initial state

75. **Links to menu sections (#e-noodles, etc.) don't smooth scroll** ⚪
    - Impact: Low | Jump navigation feels jarring
    - Fix: Add `scroll-behavior: smooth;` to html
    - Verify: Anchor links smoothly scroll to target

### Typography & Text
76. **Font loading strategy not optimized** ⚪
    - Impact: Medium (Performance) | `next/font/google` helps but verify font-display
    - Fix: Check font-display: swap (not block) to prevent FOIT
    - Verify: Fonts load without blanking text

77. **Playfair Display used for body text; Montserrat is for sans** ⚪
    - Impact: Medium | Seems reversed from typical hierarchy
    - Fix: Verify intent: is Playfair truly the body font? (Usually display/headings)
    - Verify: Line height and letter-spacing work for extended reading

78. **Font weights not consistently named** ⚪
    - Impact: Low | Some text uses `fontWeight: 600`, others use CSS class
    - Fix: Standardize to CSS classes (body, body-bold, heading, etc.)
    - Verify: Semantic font weight usage throughout

79. **Overline letter-spacing varies (2px to 6px)** ⚪
    - Impact: Low-Medium | Inconsistent microcopy styling
    - Fix: Define single overline style (recommend 4px)
    - Verify: All overlines have same letter-spacing

80. **Some text uses `text-transform: uppercase` inline, others in CSS** ⚪
    - Impact: Low | Inconsistent uppercase application
    - Fix: Create `.text-uppercase` utility class
    - Verify: All uppercase text applied consistently

### Menu Page Specific
81. **Menu category pills don't have visual indicator for current section** ⚪
    - Impact: Medium | User doesn't know which section they're viewing
    - Fix: Add active state styling (background color or underline)
    - Verify: Current section pill is visually highlighted

82. **Menu categories not scrollable if list exceeds container width** ⚪
    - Impact: Medium | On some tablet sizes, last categories hidden
    - Fix: Make pill container horizontally scrollable with visible scroll
    - Verify: All 13 categories accessible on all breakpoints

83. **Menu item grid not explicitly defined as card layout** ⚪
    - Impact: Low | Cards might have inconsistent hover behavior
    - Fix: Define menu-card component with consistent hover state
    - Verify: All cards have same hover feedback

84. **Menu item descriptions truncated or cut off on mobile** ⚪
    - Impact: Medium | Long dish names wrap awkwardly
    - Fix: Use text truncation (ellipsis) or adjust font size
    - Verify: Dish names readable without awkward wrapping

85. **Search/filter not available on menu** ⚪
    - Impact: Low | Finding items in 80+ dish menu is tedious
    - Fix: Add search bar or vegetarian/spicy filters
    - Verify: Users can quickly find dishes by keyword

### Locations Page Specific
86. **Hours of operation formatting inconsistent** ⚪
    - Impact: Low-Medium | "Everyday: 12:00 PM - 10:15 PM" could be cleaner
    - Fix: Consider bold the time range for emphasis
    - Verify: Hours stand out and are easy to read

87. **Phone number formatting could be more readable** ⚪
    - Impact: Low | "+88 01600-068193" works but could use spacing
    - Fix: Format as "+88 (0160) 0-068193" or similar
    - Verify: Phone number is easily copied/understood

88. **Google Maps links open in new tab; should be consistent** ⚪
    - Impact: Low | Some links may open inline instead
    - Fix: Add `target="_blank" rel="noopener noreferrer"` to all maps links
    - Verify: Maps consistently open in new tab

89. **No distance/travel time info from central location** ⚪
    - Impact: Low | Users don't know which outlet is nearest
    - Fix: Consider adding estimated travel time or distance from city center
    - Verify: Users can quickly assess accessibility

### Gift Cards Page Specific
90. **Gift card purchase flow not connected to actual checkout** ⚪
    - Impact: High | Can't actually buy gift cards
    - Fix: Wire buttons to payment processor (Stripe/Bkash)
    - Verify: Gift card purchase completes successfully

91. **No redemption instructions** ⚪
    - Impact: Medium | Users don't know how to use digital gift card
    - Fix: Add step-by-step guide or email template
    - Verify: Clear instructions provided

92. **Gift card denominations may not align with actual pricing** ⚪
    - Impact: Medium | 1500/3000 BDT cards may not cover full meal
    - Fix: Verify denominations are strategic
    - Verify: Price points make sense for restaurant average check

### About Page Specific
93. **About page layout not yet optimized** ⚪
    - Impact: Medium | Hero + editorial structure incomplete
    - Fix: Audit /about page structure (not fully explored in audit)
    - Verify: About page feels as polished as homepage

### Unused Assets & Opportunities
94. **Background sound assets exist but not used** ⚪
    - Impact: Low | `Background Sound` folder (4 MP3s) not implemented
    - Fix: Consider adding ambient sound option (toggle)
    - Verify: Optional audio enhances immersion without being intrusive

95. **Brand assets folder has many images not used in current site** ⚪
    - Impact: Low-Medium | Instagram images available for stories/testimonials section
    - Fix: Consider adding testimonial section or image gallery
    - Verify: Unused assets either incorporated or removed

96. **Multiple lotus graphic variations available but only one used** ⚪
    - Impact: Low | Could add more visual variety
    - Fix: Consider rotating lotus graphics or using different variants
    - Verify: Design feels fresh with asset variety

97. **Elephant 16:9 background not used anywhere** ⚪
    - Impact: Low | Available hero background asset unused
    - Fix: Consider using as alternate hero or section background
    - Verify: Asset evaluated and either used or removed

### Documentation & Maintenance
98. **No component documentation or Storybook** ⚪
    - Impact: Low-Medium (Maintenance) | Future developers unclear on component usage
    - Fix: Create component API documentation
    - Verify: Each component documents props and usage

99. **No color system documentation** ⚪
    - Impact: Low | Color values scattered throughout; no design tokens
    - Fix: Create design tokens file or color reference
    - Verify: Color system documented and maintainable

100. **No spacing/typography scale documented** ⚪
    - Impact: Low | Developers guess at values instead of following system
    - Fix: Document scale in DESIGN_SYSTEM.md or similar
    - Verify: Design tokens referenced in code comments

---

## LOW-PRIORITY ISSUES (Nice-to-Haves) — 15 items

### Content & Copy
101. **"The Thai Way" copy is generic; could be more distinctive** ⚪
    - Impact: Low | Tagline feels safe rather than memorable
    - Fix: Consider rewording for stronger brand voice
    - Verify: Copy reflects Khao San's specific story

102. **Hero description mentions "street craft elevated" multiple times** ⚪
    - Impact: Low | Repeated phrase across sections
    - Fix: Vary language or strengthen specific benefits
    - Verify: Copy doesn't repeat key phrases

103. **No social proof (reviews, ratings, testimonials)** ⚪
    - Impact: Low | Trust signals missing
    - Fix: Add customer testimonials or ratings section
    - Verify: Social proof section on homepage

### Nice-to-Have Features
104. **No newsletter signup** ⚪
    - Impact: Low | Missed email capture opportunity
    - Fix: Add footer signup form (if business wants this)
    - Verify: Email collection working

105. **No WhatsApp/direct messaging integration** ⚪
    - Impact: Low | Common in Dhaka restaurants
    - Fix: Add WhatsApp link or chat widget
    - Verify: Users can message via WhatsApp

106. **No loyalty program reference** ⚪
    - Impact: Low | Missing retention opportunity
    - Fix: Add loyalty program details if one exists
    - Verify: Program details visible to users

107. **No seasonal menu indicator** ⚪
    - Impact: Low | Users don't know about rotating specials
    - Fix: Add "seasonal" tag or special section
    - Verify: Seasonal items clearly marked

### Brand & Design
108. **No favicon set** ⚪
    - Impact: Low | Browser tab looks generic
    - Fix: Create 32×32 favicon from Khao San logo
    - Verify: Favicon displays in browser tab

109. **Open Graph tags may not be optimal** ⚪
    - Impact: Low | Social sharing preview unclear
    - Fix: Set og:title, og:description, og:image, og:url
    - Verify: Link preview shows brand image + description

110. **No dark mode toggle (if brand wants light mode option)** ⚪
    - Impact: Low | Currently dark-only
    - Fix: Add theme toggle if brand wants light mode
    - Verify: Light mode option available (optional)

---

## SUMMARY

**Total Issues Identified**: 110
- 🔴 Critical: 25
- 🟠 High-Priority: 35
- 🟡 Medium-Priority: 40
- 🟢 Low-Priority: 10

**Blocking Fixes** (must resolve before launch):
1. Backend integration (forms, payments)
2. Complete button functionality
3. Legal pages & links
4. Mobile responsiveness
5. A11y critical gaps

**Production Ready When**: All critical + high-priority issues resolved, verified end-to-end, and tested on real devices.

---

## VERIFICATION CHECKLIST

Before marking any issue ✅ complete:
- [ ] Code change implemented
- [ ] Tested in browser at ≥2 viewports
- [ ] No console errors or warnings
- [ ] No regressions on other pages
- [ ] Accessibility verified (axe DevTools or manual)
- [ ] Mobile interaction tested (actual device if possible)
- [ ] Performance metrics checked (if applicable)

**Next Step**: Start with Critical Issues #1-5, then proceed systematically through High-Priority.

