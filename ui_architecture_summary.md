# QueryNexis Web UI Architecture Summary

This document provides a precise technical and visual specification for the QueryNexis web application, designed for high-fidelity UI generation.

## 1. Core Design System: "Monochrome Noir"

The application follows a futuristic, minimalist aesthetic with high-contrast typography and glassmorphism.

| Token | Value | Description |
| :--- | :--- | :--- |
| **Primary BG** | `#000000` | Deepest black for all backgrounds. |
| **Foreground** | `#FFFFFF` | Pure white for primary text and elements. |
| **Muted** | `#111111` | Secondary backgrounds and subtle dividers. |
| **Border** | `#27272A` | Stark, thin borders for containers. |
| **Radius** | `1.5rem` | Generous rounded corners for a premium feel. |
| **Typography** | Inter, JetBrains Mono | Sans-serif for UI; Monospace for technical data. |
| **Effects** | Glassmorphism | `backdrop-blur-2xl`, `bg-white/[0.02]`, `border-white/[0.05]`. |

---

## 2. Global Layout Components

### Navbar (Fixed Top)
- **Logo**: QueryNexis wordmark/icon (white) on the left.
- **Navigation**: "Shop" link.
- **Cart**: Floating shopping cart icon with a white circular badge and black numerical count.
- **User Hub**: 
    - Logged out: "Login" pill-shaped button (White BG, Black Text).
    - Logged in: Circular avatar with user initial, role-badge (Admin/Driver visible if applicable), and a glassmorphic dropdown menu containing Profile, Orders, and Role-specific Dashboards.

### Proactive AI Components (Global Overlays)
- **AIAgentPulse (Bottom Left)**: A floating circular notification with a glowing white ring animation. Displays tactical alerts (e.g., "Delivery Alpha-1 Delayed") in a glassmorphic bubble.
- **AIChat (Bottom Right)**: A floating "Query" button that opens a vertical chat drawer.
    - **UI**: Role-aware personas (Admin/Driver/Customer).
    - **Features**: Quick-action chips (e.g., "Revenue Summary", "Cancel Order") that trigger autonomous actions.

---

## 3. Page Specifications

### Home / Landing Page (`/`)
- **Hero Section**: Ultra-thick headline ("Where Queries Become Intelligence").
- **Visuals**: Large glassmorphic container in the center with an animated pulse icon. Floating 3D icons (Cart, Truck).
- **CTA**: Large "Browse Products" button with a right arrow icon.
- **Features**: 3-column grid of "Neural Cards" highlighting Speed, Security, and AI Insights.

### Product Catalog (`/products`)
- **Header**: Minimalist "Tactical Inventory" title.
- **Grid**: 4-column responsive grid of product cards.
- **Card UI**: 
    - Square image container with subtle hover scale.
    - Product name in bold Inter.
    - Price in Rupee (₹) using JetBrains Mono.
    - "Deploy to Cart" button (White outline, becomes solid on hover).

### Shopping Cart (`/cart`)
- **Layout**: 2-column layout (Items on left, Summary on right).
- **Item UI**: Horizontal layout with small thumbnail, quantity toggle (+/-), and price.
- **Summary**: Glassmorphic box with subtotal, tax, and a large "Proceed to Checkout" button.

### Checkout (`/checkout`)
- **Layout**: Clean, centered form.
- **Fields**: Shipping address, contact protocols.
- **Payments**: Placeholder for integrated payment systems.

### Customer Order History (`/orders`)
- **Table**: Minimalist row-based layout.
- **Status Pills**: 
    - `PAID`: White BG, Black Text.
    - `SHIPPED`: Border only.
    - `CANCELLED`: Muted text.
- **Tracking**: "Track Mission" button for active deliveries.

### Admin Dashboard (`/admin`)
- **Command Tabs**: [METRICS] [FLEET] [LOGISTICS].
- **Metrics**: High-level revenue cards (Rupee localized).
- **Fleet Manager**: Grid of driver status cards. Active drivers glow white; inactive are muted.
- **Unit Registration**: Modal with name, email, and password (includes "Show Password" toggle).

### Driver Dashboard (`/driver`)
- **Mission HUD**: Current delivery destination, customer contact, and time-to-arrival.
- **Tactical Controls**: Large "Status Update" buttons: [INITIATE DELIVERY] [MISSION COMPLETE].
- **Map**: Dark-themed map visualizer showing current tactical route.

---

## 4. Interactive States
- **Button Hover**: Inversions (White -> Black or increase opacity).
- **Input Focus**: Border turns pure white, slight outer glow.
- **Loading**: Pulse animations on logo and interactive containers.
