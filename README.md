##  About

**Prem Shankar Murti Kala Kendra** is a full-stack e-commerce website for a traditional Indian artisan studio & roadside shop founded by **Prem Shankar Prajapati** in 1994. The shop specializes in:


---

## Features

| Feature | Description |
|---|---|
| **Product Catalog** | 19 handcrafted items across 4 categories with real product photography, ratings & reviews |
| **Category Filtering** | Filter by Clay Utensils, God Idols, Flower Pots, or Plants & Utilities |
| **Full-Text Search** | Search products by name, material, or description |
| **Product Detail Pages** | Dedicated detail view with image gallery, specs, and order actions |
| **Shopping Cart** | Add-to-cart with quantity controls, persistent via `localStorage` |
| **Custom Order Studio** | Dynamic price estimator form for custom POP/clay idols with material, size & finish options |
| **WhatsApp Integration** | One-click WhatsApp inquiry for any product |
| **REST API Backend** | Node.js serverless functions for products, shop info, custom quotes & order management |
| **SPA Routing** | Hash-based client-side routing across 6 views |
| **Responsive Design** | Mobile-friendly layout with artisan-themed earth-tone aesthetics |
| **Vercel Deployment** | Production-ready configuration for Vercel serverless hosting |

---



## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Vanilla HTML5, CSS3, JavaScript (ES6+) |
| **Backend** | Node.js (zero-dependency HTTP server) |
| **Serverless** | Vercel Serverless Functions (`@vercel/node`) |
| **Data Store** | JSON flat-file database (`data/*.json`) |
| **Deployment** | Vercel |
| **State Management** | `localStorage` for cart persistence |

---

## Project Structure

```
prem_shankar_murti_kala_kendra/
├── index.html              # Main SPA entry (6 views: Home, Catalog, Detail, Roadside, Custom Order, About)
├── style.css               # Complete design system with earth-tone artisan theme
├── script.js               # Frontend app logic (routing, catalog, cart, search, custom order estimator)
├── server.js               # Zero-dependency Node.js backend server (local development)
├── package.json            # Project metadata
├── vercel.json             # Vercel deployment & route configuration
├── .gitignore
│
├── api/                    # Vercel Serverless API Functions
│   ├── products.js         # GET  /api/products — returns product catalog
│   ├── shop-info.js        # GET  /api/shop-info — returns shop metadata
│   ├── custom-quote.js     # POST /api/custom-quote — logs custom order requests
│   └── orders.js           # POST /api/orders — logs cart checkout orders
│
├── data/                   # JSON flat-file data store
│   ├── products.json       # Product catalog (19 items with images, specs, pricing)
│   ├── shop_info.json      # Shop metadata (name, owner, hours, contact, pricing summary)
│   ├── custom_quotes.json  # Logged custom order quote requests
│   └── orders.json         # Logged cart orders
│
└── assets/
    └── images/             # 18 product & shop photographs (PNG/JPG)
        ├── artisan_hero.png
        ├── god_ram_darbar.jpg
        ├── clay_handi_chulha.png
        ├── pot_mandala_stand.jpg
        └── ... (14 more)
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v14+ (for local development server)
- [Vercel CLI](https://vercel.com/docs/cli) (optional, for deployment)

### Run Locally

```bash
# Clone the repository
git clone https://github.com/Kriti-G14/prem_shankar_murti_kala_kendra.git
cd prem_shankar_murti_kala_kendra

# Start the local development server
node server.js
```

The server starts at **http://localhost:3000** with these API endpoints:

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/products` | Fetch all products |
| `GET` | `/api/shop-info` | Fetch shop metadata |
| `POST` | `/api/custom-quote` | Submit a custom order quote request |
| `POST` | `/api/orders` | Submit a cart checkout order |
| `GET` | `/api/custom-quotes` | View all logged quote requests |
| `GET` | `/api/orders` | View all logged orders |

### Deploy to Vercel

```bash
# Install Vercel CLI (if not already installed)
npm i -g vercel

# Deploy
vercel
```

The project includes a pre-configured [`vercel.json`](vercel.json) that maps serverless functions and static assets automatically.

---

## Design System

The website uses a warm **earth-tone artisan palette** inspired by traditional Indian pottery:

| Token | Color | Usage |
|---|---|---|
| `--primary-terracotta` | `#C85A32` | Primary accent, buttons, badges |
| `--ochre-gold` | `#DAA520` | Gold accents, premium highlights |
| `--leaf-green` | `#2E7D32` | Plant badges, availability indicators |
| `--earth-dark` | `#3E2723` | Headings, primary text |
| `--canvas-bg` | `#FFFDF9` | Page background |
| `--plaster-white` | `#FFF8F0` | Card backgrounds, borders |

Typography uses a serif/sans-serif combination for an artisan-meets-modern feel.

---


## License

This project is open source and available under the [MIT License](LICENSE).

