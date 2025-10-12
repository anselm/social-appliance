# Design Guidelines: Hyper-Local Social Network Splash Landing Page

## Design Approach
**Reference-Based with Minimalist Constraints**: Drawing inspiration from Linear's geometric precision, GitHub's community-focused layouts, and Notion's information hierarchy, while maintaining strict monochromatic aesthetic.

**Core Principle**: Bold minimalism - maximum impact through typography, contrast, and photography with zero decorative elements.

---

## Color Palette

### Monochromatic Foundation
- **Primary Background**: 0 0% 100% (pure white)
- **Primary Text**: 0 0% 0% (pure black)
- **Secondary Background**: 0 0% 4% (near-black for sections)
- **Secondary Text**: 0 0% 98% (near-white on dark)
- **Borders/Dividers**: 0 0% 90% (subtle gray for separation)
- **Hover States**: 0 0% 95% (light gray) / 0 0% 10% (dark sections)

### No accent colors - pure black and white only.

---

## Typography

### Font Stack
- **Primary**: `'Inter', -apple-system, BlinkMacSystemFont, sans-serif` via Google Fonts
- **Display**: `'Space Grotesk', sans-serif` for headlines (geometric, modern)

### Scale & Hierarchy
- **Hero Headline**: text-7xl md:text-8xl lg:text-9xl, font-bold, tracking-tight
- **Section Headers**: text-4xl md:text-5xl lg:text-6xl, font-bold
- **Subheadings**: text-xl md:text-2xl, font-medium
- **Body**: text-base md:text-lg, leading-relaxed
- **Microcopy**: text-sm, uppercase, tracking-wide (for labels)

---

## Layout System

### Spacing Primitives
Use Tailwind units: **4, 8, 12, 16, 24, 32** for consistent rhythm (p-4, gap-8, my-12, py-16, mb-24, py-32)

### Grid Strategy
- **Container**: max-w-7xl mx-auto px-6 lg:px-8
- **Hero**: Single column, centered, max-w-4xl
- **Features**: 2-column md, 3-column lg grid for feature cards
- **Testimonials**: 2-column layout with large quotes
- **Content sections**: Asymmetric 60/40 splits with image/text alternating

---

## Component Library

### Navigation
- Minimal header: Logo left, sparse navigation center, single CTA right
- Fixed on scroll with subtle border-b on white, inverted on dark sections
- Mobile: Hamburger menu, slide-in panel

### Hero Section
- Full-width black background (bg-black text-white)
- Oversized headline with geometric precision
- Single-line value proposition
- Primary CTA (white bg, black text) + Secondary (outline with blur backdrop)
- Large hero image below fold showing authentic community connection

### Feature Cards
- Square aspect ratio containers
- High-contrast B&W photography
- Overlay text: white text on darkened images (overlay: bg-black/40)
- Hover: subtle scale transform (scale-105)
- No borders, rely on image edges

### Social Proof
- Large pull quotes with attribution
- User count metrics in oversized numbers (text-6xl)
- Grid of community contributions (masonry-style if using imagery)
- Open source stats: GitHub stars, contributors

### CTAs
- **Primary**: Black button, white text, px-8 py-4, rounded-none (square)
- **Secondary**: White button, black text on light / outline on dark with backdrop-blur
- **Form Input**: Border-2 border-black, rounded-none, focus:ring-0 focus:border-gray-600

### Trust & Safety Section
- Icon-free explanations (text-only)
- Structured in numbered list or simple grid
- Emphasis on "decentralized identity" and "social trust graph" as key differentiators

---

## Images

### Placement & Strategy
1. **Hero Image**: Large, impactful photo below hero text - people connecting in real-world setting (coffee shop, park, community space) - B&W photography
2. **Feature Sections**: 3-4 square format images showcasing use cases:
   - People discovering local spots
   - Group gathering at an event
   - Sharing activity recommendations
3. **Community Section**: Mosaic/grid of user-contributed place photos (all B&W)
4. **Social Proof**: Optional: Small circular avatars for testimonials

### Image Treatment
- All images converted to high-contrast B&W
- Sharp, editorial-style photography
- No filters beyond monochrome conversion
- Use grayscale CSS filter: `filter: grayscale(100%) contrast(1.1)`

---

## Page Structure (7 Sections)

1. **Hero**: Bold headline, value prop, dual CTAs, background black
2. **Problem/Solution**: Text-focused section explaining real-world connection gap
3. **Features Grid**: 3-column showcase (hyper-local discovery, group safety, open identity)
4. **Visual Use Cases**: Alternating image/text layout showing platform in action
5. **Social Proof**: Testimonials + community metrics
6. **Trust & Technology**: Decentralized identity + social trust graph explanation
7. **Final CTA + Footer**: Email signup, GitHub link, community resources

---

## Animations
**Minimal Only**: Subtle fade-in on scroll for sections (opacity 0 to 1), scale on card hover. No decorative motion.

---

## Accessibility & Responsiveness
- WCAG AAA contrast (black/white ensures this)
- Form inputs with visible focus states (border weight change)
- Mobile-first: stack all columns to single column below md breakpoint
- Touch targets: min 44px height for all interactive elements