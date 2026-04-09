# Design System Strategy: The Plasma Void

## 1. Overview & Creative North Star
The Creative North Star for this system is **"The Kinetic Archive."** We are moving away from static, flat interfaces toward a living, breathing cockpit experience. This is not just a game UI; it is a high-performance tactical HUD (Heads-Up Display) floating in the deep vacuum of space.

To break the "template" look, we employ **Intentional Asymmetry.** Layouts should feel like telemetry data—heavy on one side with breathable, "void" space on the other. We leverage overlapping glass panels and holographic perspective grids to create a sense of three-dimensional depth within a 2D space.

## 2. Colors & Surface Architecture
The color palette is built on the contrast between the infinite void (`#050505`) and the violent energy of plasma.

### The "No-Line" Rule
Standard 1px solid borders are strictly prohibited for structural sectioning. They feel "web-like" and fragile. Instead, boundaries are defined by:
- **Tonal Shifts:** Moving from `surface-container-low` to `surface-container-high`.
- **Glow Terminus:** Using outer glows or `primary_container` shadows to define an edge.
- **Background Grids:** Using a holographic perspective grid to imply the floor of a container.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical glass shards floating at different distances from the user.
- **Base Layer:** `surface_dim` (#0e0e0e) – The infinite void.
- **Floating Panels:** `surface_container` with a `backdrop-blur` (20px-40px). 
- **Active Elements:** Use `surface_container_highest` for the most critical interactive nodes.

### The "Glass & Gradient" Rule
To achieve "Deep Space Glassmorphism," use semi-transparent surface colors (60-80% opacity) combined with `backdrop-filter: blur()`. 
**Signature Texture:** Apply a linear gradient to the `outline-variant` of a container, transitioning from `primary` (Neon Cyan) to `secondary` (Electric Purple) at a 45-degree angle. This creates a "light-leak" effect on the edges of the glass.

## 3. Typography: Sci-Fi Editorial
The typography system uses a high-contrast pairing to balance technical precision with aggressive momentum.

*   **Display & Headlines (Space Grotesk):** This is our "Technical Command" font. It must be used in **Bold Italic** for all headline levels to imply forward velocity and high-tech urgency. The wide apertures of Space Grotesk mirror the vastness of the theme.
*   **Body & Utility (Manrope):** This is our "Telemetry" font. It provides high legibility for dense mission data. 
*   **The Signature Scale:** Use `display-lg` (3.5rem) sparingly against `label-sm` (0.6875rem) to create a dramatic, editorial sense of scale—mimicking a radar screen where big numbers matter most.

## 4. Elevation & Depth
In the vacuum of space, there is no single light source. Depth is achieved through **Luminescence.**

*   **The Layering Principle:** Place `surface_container_lowest` (#000000) cards inside `surface_container_low` sections. The "darker-on-lighter" approach creates a "void-hole" effect that feels more premium than standard shadows.
*   **Ambient Glows:** Replace traditional drop shadows with `primary_dim` or `secondary_dim` glows. Set blur values to 30px+ and opacity to 10% to simulate the radiation of plasma.
*   **The "Ghost Border" Fallback:** If a container requires definition, use the `outline_variant` at 15% opacity. This creates a "holographic wireframe" look rather than a physical box.

## 5. Components

### Buttons: Pulsing Nodes
*   **Primary:** Solid `primary_container` (#00ffff) background with `on_primary` text. Apply a CSS animation "pulse" that expands a 0.5pt `primary` border outward.
*   **Secondary:** Ghost style. Transparent background, `secondary` (#d873ff) text, and an angular "clipped corner" border using CSS `clip-path`.
*   **Interaction:** On hover, buttons should "overcharge," increasing the `box-shadow` glow intensity.

### Progress Bars: Plasma Conduits
*   **Style:** No rounded corners (`0px`).
*   **Fill:** A linear gradient from `primary` to `tertiary`. 
*   **Texture:** Add a repeating scanline pattern overlay to the fill to make it look like energy moving through a conduit.

### Cards & Lists
*   **Rule:** Forbid divider lines. Use vertical spacing (32px or 48px) and subtle `surface_variant` backgrounds to separate items. 
*   **Detail:** Every card should have a "Unit ID" in the top-right corner using `label-sm` typography to enhance the sci-fi aesthetic.

### Input Fields: Data Entry
*   **Style:** Bottom-border only (2px `outline`). When focused, the border glows `primary` and the label shifts to `primary_fixed_dim`.

### Additional Component: The "Tactical Overlay"
A decorative component consisting of a thin, 5% opacity `primary` grid that sits behind the main content, providing a sense of coordinate-based alignment.

## 6. Do's and Don'ts

### Do:
*   **Use Angularity:** Every corner must be `0px`. Roundness is the enemy of the cyber-arcade aesthetic.
*   **Embrace the Void:** Let the `#050505` background breathe. High-end design is defined by what you *don't* show.
*   **Color for Intent:** Use `tertiary` (Hot Pink) exclusively for critical warnings or high-energy actions (like "Fire" or "Delete").

### Don't:
*   **Don't use Grey:** Avoid neutral greys. Every "grey" should be tinted with a hint of `primary` (Cyan) or `secondary` (Purple) to keep the palette "charged."
*   **Don't use Standard Shadows:** Never use black `#000000` shadows. They look muddy. Use tinted glows.
*   **Don't Centeralize Everything:** Avoid perfectly centered, symmetrical layouts. Offset your titles or use "heavy" left-hand navigation to maintain the tactical HUD feel.