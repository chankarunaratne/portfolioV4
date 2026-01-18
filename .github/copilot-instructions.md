# Copilot Instructions for Chandima's Portfolio

## Project Overview

This is a responsive portfolio website showcasing product design work. It features a Three.js animated sky canvas background, smooth page transitions, and multiple case study sections. The site uses vanilla JavaScript, CSS3 animations, and Google Fonts (Inter, JetBrains Mono, PP Neue Montreal custom fonts).

## Architecture & Key Patterns

### Animation System

- **Sequential fade-blur-up animations**: Elements are assigned `.fade-blur-up` class with delays in `script-clean.js` (see `elementsToAnimate` array). The animation uses `cubic-bezier(0.34, 1.56, 0.64, 1)` spring easing.
- **Stagger delays**: Use `.stagger-delay-1` through `.stagger-delay-5` (100ms increments) for child elements within containers to cascade animations.
- **Page transitions**: `page-transition.js` intercepts HTML navigation links and fades pages using `.page-leave` / `.page-ready` classes (180ms transition).

### Sky Background (Three.js)

- **File**: [sky.js](sky.js) - Procedural animated sky with clouds, grain, and chromatic aberration
- **Configuration**: All parameters in `SKY_CONFIG` object (cloudSpeed, cloudDensity, clearRadius, etc.)
- **Responsive tuning**: `applyResponsiveConfig()` adjusts settings for mobile vs desktop in the `animate()` loop
- **Canvas**: Full-width `#skyCanvas` with z-index -1, masked fade-out at bottom via CSS mask-image

### Responsive Design

- **Viewport meta tag**: Includes `viewport-fit=cover` for iOS notch support
- **CSS safe-area**: `html::before` pseudo-element fills `env(safe-area-inset-top)` with sky gradient on mobile
- **Breakpoint patterns**: Use CSS grid and flexbox; test on mobile Safari first per `.cursor/rules/general.mdc`
- **Height constraints**: Sky canvas capped at `min(148svh, 1070px)` to prevent excessive rendering

### About Page Pattern

- **Current implementation**: About is now an in-page anchor (`#about`) rather than separate file
- **Redirect**: `about.html` redirects to `index.html#about` via meta refresh and JS fallback
- **Panel animation**: `.about-panel` element treated like other sections in `elementsToAnimate` array

### Navbar & Navigation

- **Dynamic height tracking**: `updateNavbarHeightVar()` sets `--navbar-height` CSS variable used for layout calculations
- **Logo link**: Custom click handler prevents navigation when already on home page, instead smooth-scrolls to top
- **Smooth scroll anchors**: Links with `href="#section-id"` trigger `scrollIntoView({ behavior: 'smooth' })`

## Critical Patterns & Conventions

### CSS Organization

- **Font stacks**: Custom fonts loaded via `@font-face` from `fonts/` directory with multiple weights (100, 400, 500, 700)
- **CSS variables**: Navbar height stored as `--navbar-height` for component positioning
- **Gradients**: Background uses multi-stop gradients (e.g., `linear-gradient(180deg, #5ba3d9 0%, #6eb5e5 200px, #ffffff 500px)`)
- **Transitions**: Use cubic-bezier spring timing `(0.34, 1.56, 0.64, 1)` for fluid motion

### JavaScript Patterns

- **DOMContentLoaded safety**: All DOM queries wrapped in event listener or null checks
- **Class-based architecture**: SkyRenderer uses ES6 class with init/animate methods
- **Event delegation**: Navigation links use `.querySelectorAll()` then loop with `forEach()`
- **Smooth scroll helpers**: Custom `scrollIntoView()` calls with `behavior: 'smooth'` and `block: 'start'`

### Content Organization

- **Assets structure**: `assets/` contains case study folders (`docswell-case-study/`, `rememberly-case-study/`), testimonials, work experience, and about content
- **Favicon variants**: Multiple PNG/ICO formats in `assets/favicon/` for cross-platform support
- **Open Graph images**: `assets/open-graph.jpg` used in meta tags

## Developer Workflows

### Testing & Validation

- **Browser compatibility**: Test on both Safari and Chrome; Safari prioritized for mobile per team convention
- **Animation validation**: Verify stagger delays align with CSS transition durations (typically 0.7s–0.9s)
- **Sky canvas performance**: Use DevTools Performance tab; watch for GPU usage on mobile devices

### Common Edits

1. **Adding new animated sections**:
   - Add element to HTML with appropriate class (e.g., `new-section`)
   - Add entry to `elementsToAnimate` array with selector and delay
   - Add initial state to CSS (`.new-section { opacity: 0; transform: translateY(20px); filter: blur(8px); }`)

2. **Adjusting sky effects**: Modify `SKY_CONFIG` object in [sky.js](sky.js) directly—changes apply on page refresh without rebuild

3. **Page transitions**: Link must have `.html` extension or `href="#anchor"` format to be intercepted by [page-transition.js](page-transition.js)

## External Dependencies

- **Three.js** (v0.158.0): Unpkg CDN for sky rendering
- **Google Fonts**: Inter, JetBrains Mono loaded from googleapis.com
- **Microsoft Clarity**: Analytics script for tracking
- **Custom fonts**: PP Neue Montreal OTF files in `fonts/` directory

## Key Files Reference

- [index.html](index.html) - Home page structure
- [script-clean.js](script-clean.js) - Main animation orchestration (1387 lines)
- [sky.js](sky.js) - Three.js sky renderer with procedural effects (498 lines)
- [styles.css](styles.css) - All styling including animations (3124 lines)
- [page-transition.js](page-transition.js) - Cross-page fade transitions (76 lines)

## Important Do's & Don'ts

✅ **Do**:

- Check animation delays in milliseconds match their visual effect on page load
- Test all changes in Safari mobile first, then Chrome desktop
- Use CSS variables for repeated values (colors, sizes, durations)
- Preserve existing navbar/footer animation timing when adding content

❌ **Don't**:

- Break the sky canvas z-index layering or pointer-events rules
- Add new dependencies without discussion (prefer vanilla JS)
- Use `animation` property without matching `transition` in fallbacks
- Remove responsive tuning code in sky.js—mobile performance depends on it
