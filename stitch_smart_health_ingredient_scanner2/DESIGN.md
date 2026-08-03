---
name: Vital Clarity
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#3c4a42'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#6c7a71'
  outline-variant: '#bbcabf'
  surface-tint: '#006c49'
  primary: '#006c49'
  on-primary: '#ffffff'
  primary-container: '#10b981'
  on-primary-container: '#00422b'
  inverse-primary: '#4edea3'
  secondary: '#855300'
  on-secondary: '#ffffff'
  secondary-container: '#fea619'
  on-secondary-container: '#684000'
  tertiary: '#bc0b3b'
  on-tertiary: '#ffffff'
  tertiary-container: '#ff7886'
  on-tertiary-container: '#780021'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#6ffbbe'
  primary-fixed-dim: '#4edea3'
  on-primary-fixed: '#002113'
  on-primary-fixed-variant: '#005236'
  secondary-fixed: '#ffddb8'
  secondary-fixed-dim: '#ffb95f'
  on-secondary-fixed: '#2a1700'
  on-secondary-fixed-variant: '#653e00'
  tertiary-fixed: '#ffdadb'
  tertiary-fixed-dim: '#ffb2b7'
  on-tertiary-fixed: '#40000d'
  on-tertiary-fixed-variant: '#92002a'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-score:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
  ingredient-list:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 22px
    letterSpacing: 0.01em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  container-padding: 20px
  stack-gap: 12px
---

## Brand & Style

The design system focuses on **Clinical Warmth**. It is designed for users who seek immediate, trustworthy health insights while grocery shopping or meal prepping. The brand personality is encouraging, transparent, and authoritative without being cold or overly medical.

The aesthetic utilizes **Modern Minimalism with Tactile elements**. It leverages generous whitespace to reduce cognitive load during complex ingredient analysis. The interface uses high-quality typography and a systematic color language to provide an instant emotional response of "safety" or "caution." The style is characterized by soft, organic shapes that feel friendly to the touch, paired with a sophisticated "glass" treatment for secondary information layers to maintain a sense of depth and modernity.

## Colors

This design system uses a semantic color scale mapped directly to health grades. 

- **Success (Emerald):** Used for Grade A and B products, indicating optimal health choices.
- **Warning Low (Amber):** Used for Grade C, signifying "proceed with caution" or moderate consumption.
- **Warning High (Orange):** Used for Grade D, signifying poor nutritional value.
- **Danger (Rose Red):** Used for Grade E and high-allergen alerts, signifying high risk or "avoid."
- **Neutrals:** A slate-based grey scale is used for secondary text and UI borders to ensure the semantic colors remain the primary focal point. 

The default mode is **Light**, utilizing a crisp white canvas to maximize legibility under grocery store lighting.

## Typography

**Inter** is selected for its exceptional legibility and neutral, modern character. 

- **Visual Hierarchy:** Use `display-score` exclusively for the 0-100 health rating. 
- **Readability:** The `ingredient-list` token is optimized with slightly increased letter spacing and line height to ensure dense text blocks remain accessible.
- **Emphasis:** Use `label-caps` for table headers and category tags to differentiate data points from narrative text.
- **Mobile Adaptation:** Headlines scale down by 15% on small viewport devices (under 360px width) to prevent awkward text wrapping.

## Layout & Spacing

The layout follows a **Fluid Mobile-First** model based on an 8px grid system. 

- **Margins:** Global horizontal padding is set to 20px to allow for comfortable thumb-reach while maximizing screen real estate for data.
- **Vertical Rhythm:** Elements are stacked using a `stack-gap` of 12px for related items and `xl` (32px) for distinct sections.
- **Horizontal Carousels:** Used for "Healthy Alternatives" to allow users to compare products without losing their place on the primary scan result. Carousels should peek the next card by 12px to indicate scrollability.

## Elevation & Depth

Hierarchy is established through **Soft Tonal Layering** and ambient shadows rather than harsh lines.

- **Level 0 (Canvas):** Background color `#FAFAFA`.
- **Level 1 (Cards):** Pure white surfaces with a 1px soft grey border (`#E2E8F0`) and a very diffuse shadow (Y: 4, Blur: 20, Opacity: 0.04).
- **Level 2 (Active Elements):** Floating buttons and active segmented controls use a more pronounced shadow (Y: 8, Blur: 24, Opacity: 0.08) to suggest interactability.
- **Backdrop Blur:** Use a 12px blur on the navigation bar and modal overlays to maintain context of the underlying scan result while focusing user attention.

## Shapes

The shape language is defined by **High-Radius Enclosures**.

- **Standard Cards:** Use a 16px corner radius (`rounded-lg`) to evoke a soft, organic feel.
- **Action Buttons:** Use pill-shaped (full radius) buttons to distinguish them clearly from informational cards.
- **Inputs & Chips:** Use 12px radius to sit comfortably between the standard card and the pill shape.
- **Selection Indicators:** Segmented controls should use a "squircle" or 12px radius for the inner active state indicator.

## Components

- **Score Cards:** Large, centered cards featuring the `display-score` typography. The background should utilize a subtle 5% tint of the semantic color (e.g., light green for Grade A).
- **Segmented Controls:** Used for toggling between "Nutrition," "Ingredients," and "Environment." These are full-width components with a sliding background indicator.
- **Expandable Accordions:** Used for detailed allergen information. Use a simple chevron icon and a subtle divider line. The header should be bolded when expanded.
- **Horizontal Carousels:** Designed for "Similar Products." Cards within carousels should have a fixed width (140px) and display a thumbnail, name, and small health badge.
- **Input Fields:** Search and filter bars must have a minimum touch target height of 48px, utilizing the 12px radius and a soft grey stroke that thickens/darkens on focus.
- **Health Badges:** Small chips using the semantic color palette to label specific dietary attributes (e.g., "Vegan," "Gluten-Free").