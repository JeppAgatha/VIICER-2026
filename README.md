# 🌊 VIICER 2026: i-BIS

A real-time river monitoring dashboard prototype. i-RIS hardware (stationary units) and the i-BUSS mobile unit feed simulated water-quality data into **i-BIS**, the software layer visitors and customers interact with. Built as a full marketing site *plus* a working, tiered (Free / Premium) monitoring dashboard, not just a landing page.

## ✨ Technologies

- HTML5
- CSS3 (vanilla, custom design system)
- JavaScript (vanilla ES6+)
- Leaflet.js (interactive map + live marker simulation)
- Google Fonts (Archivo Black, Work Sans)
- Python `http.server` for local development (no build step, no framework)

## 🚀 Features

- Multi-page marketing site (Home, Product, Premium Plan, About Us, Our Contact) sharing one nav and footer loaded dynamically via `fetch`
- Demo login gate with two hardcoded roles (Free / Premium) stored in `sessionStorage`, no backend needed to try the product
- Live **Monitoring Dashboard** with a Leaflet map showing 3 stationary i-RIS units and 1 mobile i-BUSS unit that patrols with simulated GPS jitter; i-RIS and i-BUSS markers use distinct colors and a dashed stroke on i-BUSS to tell them apart at a glance
- **Station Status** grid classifying every unit as SAFE / CAUTION / UNSAFE across four expandable segments: Water Quality, Metals & Contamination (lead, cadmium, mercury), Fish Population, and a Premium-only Forecast & Trend
- Tiered detail: Free accounts see High/Low badges only; Premium accounts see exact sensor readings, fish counts by species, and a 7/30-day risk forecast
- Upgrade prompt shown only to Free-tier accounts, linking through to the Pricing page
- Fully responsive nav with a hamburger menu on mobile

## 📌 The Process

This started as a competition prototype, so the goal was to make the dashboard feel like a real two-tier SaaS product rather than a static mockup with a "Premium" label slapped on it. The trickiest part was making sure the Free and Premium views never contradicted each other: both tiers read their badges and numbers from the exact same simulated station data, so a "CAUTION" badge on the free view always lines up with the underlying readings a Premium user sees. Building the demo auth layer took some restraint too: it's just `sessionStorage` and two hardcoded emails, and rather than dressing that up as real security, it's documented in the code as exactly what it is: a front-end-only mockup with no backend or database behind it.

## 🔋 Running the Project

### Prerequisites

- A modern browser
- Python 3 (or any static file server of your choice)

### Setup

1. Clone the repo
2. `cd` into the site root (the folder containing `index.html`)
3. Start a local server:
   ```
   python -m http.server 8000
   ```
4. Open `http://localhost:8000/index.html`
5. Click **Log In** and use one of the demo accounts below to reach the dashboard

## 🔑 Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Free | free@i-bis.com | *(any password works)* |
| Premium | premium@i-bis.com | *(any password works)* |

*(Client-side demo only: the role is stored in `sessionStorage` and can be edited via devtools; there's no real backend or authentication behind it.)*
