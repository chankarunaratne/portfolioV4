# Homescreen Unification & Hierarchy Changes

The objective is to unify the design pattern of three homepage sections ("My Products", "Work experience", and "Testimonials"). They should all act as "single bordered card components" (instead of multiple separated cards) and share an identical spacing hierarchy (a strict visual "molecule" relationship between the icon, heading, and description).

Please carefully execute the following CSS updates to `styles.css`.

## 1. Unified Heading Styling
We need a unified `.section-heading` class to replace individual custom headings.
Add `.section-heading` to `styles.css` with a `line-height: 1` to strictly cut out any invisible bounding box space (half-leading):
```css
.section-heading {
  font-family:
    'Inter',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    'Helvetica Neue',
    Arial,
    sans-serif;
  font-size: 18px;
  font-weight: 400;
  line-height: 1;
  color: #1a1a1e;
  margin: 0;
  margin-top: 12px;
}
```
*(Make sure this class is appropriately applied inside the HTML for the headings in those three sections instead of plain text tags).*

## 2. Unify Card Containers
Modify `.products-cards-container`, `.experience-list`, and `.testimonials-list`:
- Set `gap: 0;` (they should previously have been flex columns with larger gaps).
- Set `margin-top: 20px;` for the exact gap distance between the description above and the container itself.
- Apply the universal list container styling:
```css
  background-color: #f6f8fa;
  border: 1px solid #eceff3;
  border-radius: 14px;
  overflow: hidden;
```

## 3. Style Individual List Items
Modify `.product-card`, `.experience-item`, and `.testimonial-item`:
- Remove their individual `border`, `border-radius`, and `background-color` definitions.
- Set them to:
```css
  background-color: transparent;
  border-bottom: 1px solid #eceff3;
```
*(Ensure `.product-card` retains `padding: 12px;`; for `.experience-item` and `.testimonial-item` use `padding: 24px;` in desktop mode).*
- Add `:last-child` pseudo-selectors for all three classes to strip the inner border from the bottom element:
```css
.product-card:last-child { border-bottom: none; }
.experience-item:last-child { border-bottom: none; }
.testimonial-item:last-child { border-bottom: none; }
```

## 4. Typography Adjustments on Descriptions
To make our strict 12px spacing visually accurate onto the descriptions, adjust the target headers (`.my-products-title`, `.work-experience-title`, `.testimonials-subtitle`):
- Change `line-height` from `20px` to `1.4` (strips excessive invisible spacing).
- Add `margin: 0; margin-top: 12px;` 

## 5. Remove Flex Gaps from Wrapper Elements
Since we are using direct `margin-top` values to maintain rigid visual molecular spacing (12px between icon/heading, 12px between heading/description, 20px from description to container object), remove ALL `gap: [X]px` styling on their parent containers and replace with `gap: 0;`.
Specifically target:
- `.my-products-content`, `.work-experience-content`, `.testimonials-content`
- `.my-products-text`, `.work-experience-header`, `.testimonials-header`

## 6. Mobile Layout Cleanups
Ensure mobile media queries at the bottom of the document respect these newly structured cards:
- Strip away viewport-width edge padding overrides for `.products-cards-container` (like `width: 100vw; margin-left: calc...`) so the new nice container acts seamlessly like the other components.
- Ensure `.product-card` uses `padding: 12px;` evenly in the media query too (if overridden).
