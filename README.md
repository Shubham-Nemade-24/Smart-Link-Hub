# Smart Link Hub

A full-stack link management platform for creating dynamic, personalized link pages with smart display rules, real-time analytics, profile picture uploads, and QR code generation. Built with React, Express.js, PostgreSQL, and AWS S3.

---

## Table of Contents

- [What is Smart Link Hub?](#what-is-smart-link-hub)
- [Problem Statement](#problem-statement)
- [Solution and Key Features](#solution-and-key-features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Setup and Installation](#setup-and-installation)
- [How to Run Locally](#how-to-run-locally)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Features In Depth](#features-in-depth)
- [Database Schema](#database-schema)
- [AWS Deployment](#aws-deployment)
- [Screenshots](#screenshots)
- [Usage Guide](#usage-guide)
- [Contributing](#contributing)
- [Authors](#authors)

---

## What is Smart Link Hub?

Smart Link Hub is a link-in-bio platform (similar to Linktree) that goes beyond basic link aggregation. It allows users to create professional link pages with advanced features like conditional link visibility based on time or device, detailed analytics, QR code sharing, and profile picture uploads stored on AWS S3.

---

## Problem Statement

Content creators, businesses, and professionals need a single shareable link that consolidates all their online presence. Existing solutions like Linktree are limited:

- No smart targeting — links are static for all visitors
- No device-specific content — same links shown on mobile and desktop
- Limited analytics — basic click counts without insights
- No time-based scheduling — links are always visible

---

## Solution and Key Features

Smart Link Hub solves these problems with:

| Feature | Description |
|---------|-------------|
| **Dynamic Link Pages** | Create beautiful, branded link pages with custom themes |
| **Profile Picture Upload** | Upload profile pictures during registration, stored on AWS S3 |
| **Smart Display Rules** | Show/hide links based on time of day or visitor's device |
| **Real-Time Analytics** | Track page views, link clicks, device types, and daily trends |
| **QR Code Generation** | Generate and download QR codes for offline sharing |
| **CSV Export** | Export analytics data for external analysis |
| **Custom Themes** | Choose from multiple color themes (Default, Midnight Purple, Ocean Teal, Sunset Red) |
| **Responsive Design** | Works on mobile, tablet, and desktop |

### Key Differentiators from Competitors

1. **Smart Rules Engine** — Time-based and device-based conditional link display (no competitor offers this on free tier)
2. **S3 Profile Pictures** — User avatars stored on AWS S3 for reliability and scalability
3. **Complete Analytics** — Views, clicks, device breakdown, daily charts, and CSV export
4. **Modern UI** — Clean, professional design with SVG icons (no emojis)
5. **Fully Open Source** — Self-hostable on AWS with full control

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18 | Component-based UI |
| **Build Tool** | Vite 5 | Fast dev server and production bundler |
| **Routing** | React Router v6 | Client-side navigation |
| **Styling** | Vanilla CSS | Custom design system with CSS variables |
| **Typography** | Google Fonts (Inter) | Professional font rendering |
| **Backend** | Express.js 4 | REST API server |
| **Runtime** | Node.js 20 | JavaScript runtime |
| **Database** | PostgreSQL 16 | Relational database for all data |
| **DB Driver** | pg (node-postgres) | PostgreSQL client with connection pooling |
| **File Storage** | AWS S3 | Profile picture storage |
| **File Upload** | Multer | Multipart form data parsing |
| **AWS SDK** | @aws-sdk/client-s3 | S3 operations (PutObject) |
| **QR Codes** | qrcode | QR code generation (PNG and SVG) |
| **IDs** | uuid v4 | Unique identifier generation |
| **Auth** | Token-based | User authentication via Bearer tokens |
| **Process Manager** | PM2 | Production process management on EC2 |
| **Reverse Proxy** | Nginx | Routes HTTP traffic to Node.js on EC2 |

---

## Architecture

```
                    User's Browser
                         |
                         v
              +-----------------------+
              |   Nginx (port 80)     |  <-- EC2 Instance
              |   Reverse Proxy       |
              +-----------+-----------+
                          |
                          v
              +-----------------------+
              |  Express.js (port 3001)|
              |  Serves React build   |
              |  + REST API           |
              +-----+----------+------+
                    |          |
                    v          v
            +----------+  +--------+
            | RDS      |  | S3     |
            | PostgreSQL|  | Bucket |
            | (data)   |  | (pics) |
            +----------+  +--------+
```

**Request Flow:**
1. User opens the app in their browser
2. Nginx on EC2 receives the request on port 80
3. Nginx forwards it to the Express.js server on port 3001
4. For page loads: Express serves the built React app (static files from `frontend/dist/`)
5. For API calls (`/api/*`): Express handles the request, queries PostgreSQL, and returns JSON
6. For profile picture uploads: Express receives the file via Multer, uploads to S3, stores the S3 URL in PostgreSQL

**In Development:**
- Vite dev server runs on port 5173 and serves React with hot reload
- Vite proxies `/api/*` requests to Express on port 3001
- Both servers must be running simultaneously

---

## Project Structure

```
Smart-Link-Hub/
├── frontend/                    # React + Vite frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Landing.jsx      # Marketing/home page with feature highlights
│   │   │   ├── Login.jsx        # Login + Registration with profile pic upload
│   │   │   ├── Dashboard.jsx    # User dashboard — hub list, stats, sidebar with avatar
│   │   │   ├── HubEditor.jsx    # Create/edit hubs — link editor, icon picker, rules
│   │   │   ├── Analytics.jsx    # Analytics dashboard — charts, device breakdown, insights
│   │   │   └── PublicHub.jsx    # Public-facing link page (what visitors see)
│   │   ├── App.jsx              # Root component — routing, auth context, toast system
│   │   ├── api.js               # API base URL config (empty for same-origin production)
│   │   ├── main.jsx             # React entry point
│   │   └── index.css            # Complete design system — colors, typography, components
│   ├── public/
│   │   └── link-icon.svg        # Favicon
│   ├── index.html               # HTML entry with Google Fonts
│   ├── vite.config.js           # Vite config with API proxy
│   └── package.json             # Frontend dependencies (React, Vite)
│
├── backend/                     # Express.js backend
│   ├── index.js                 # Complete server — all endpoints, DB init, S3, auth
│   └── package.json             # Backend dependencies (Express, pg, AWS SDK, etc.)
│
├── package.json                 # Root scripts (install:all, dev, build, start)
├── .gitignore
├── run_this_project.txt         # Quick-start instructions
└── README.md                    # This file
```

---

## Setup and Installation

### Prerequisites

| Software | Version | Download |
|----------|---------|----------|
| Node.js | 18+ | https://nodejs.org |
| PostgreSQL | 14+ | https://www.postgresql.org/download/ |
| Git | Any | https://git-scm.com |

### Installation Steps

```bash
# 1. Clone the repository
git clone https://github.com/Shubham-Nemade-24/Smart-Link-Hub.git
cd Smart-Link-Hub

# 2. Install frontend dependencies
cd frontend
npm install

# 3. Install backend dependencies
cd ../backend
npm install
cd ..

# 4. Create the PostgreSQL database
createdb smartlinkhub
```

---

## How to Run Locally

You need **two terminals** running simultaneously:

**Terminal 1 — Backend:**
```bash
cd backend
DATABASE_URL=postgresql://postgres@localhost:5432/smartlinkhub node index.js
```
Expected output:
```
Server running on http://localhost:3001
Database tables initialized
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```
Expected output:
```
VITE v5.4.21 ready
Local: http://localhost:5173/
```

**Open in browser:** http://localhost:5173

### Production Build

```bash
cd frontend
npm run build
# Output: frontend/dist/ (served by Express when NODE_ENV=production)
```

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | — | PostgreSQL connection string |
| `NODE_ENV` | No | `development` | Set to `production` on server |
| `PORT` | No | `3001` | Express server port |
| `AWS_S3_BUCKET` | For S3 | `smart-link-hub-uploads` | S3 bucket name |
| `AWS_REGION` | For S3 | `ap-south-1` | AWS region |
| `AWS_ACCESS_KEY_ID` | For S3 | — | IAM access key |
| `AWS_SECRET_ACCESS_KEY` | For S3 | — | IAM secret key |
| `FRONTEND_URL` | No | `*` | Allowed CORS origin |

### Frontend

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_API_URL` | No | `''` (empty) | API base URL. Empty means same-origin (correct for production) |

---

## API Documentation

All endpoints are prefixed with `/api`. Authentication uses `Authorization: Bearer <user_id>` header.

### Authentication Endpoints

| Method | Endpoint | Auth | Body | Description |
|--------|----------|------|------|-------------|
| `POST` | `/api/auth/register` | No | `FormData: email, password, name, profilePic (file)` | Register new user with optional profile pic |
| `POST` | `/api/auth/login` | No | `JSON: { email, password }` | Login and get user object with token |
| `GET` | `/api/auth/profile` | Yes | — | Get current user's profile |
| `POST` | `/api/auth/upload-avatar` | Yes | `FormData: profilePic (file)` | Upload/update profile picture |

**Register request example (FormData):**
```
POST /api/auth/register
Content-Type: multipart/form-data

email: user@example.com
password: mypassword123
name: John Doe
profilePic: (image file, max 5MB)
```

**Register response:**
```json
{
  "user": {
    "id": "uuid-here",
    "email": "user@example.com",
    "name": "John Doe",
    "profilePicUrl": "https://bucket.s3.region.amazonaws.com/profile-pics/uuid.jpg"
  }
}
```

**Login request:**
```json
POST /api/auth/login
{ "email": "user@example.com", "password": "mypassword123" }
```

### Hub Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/hubs` | Yes | List all hubs for current user (with link/click counts) |
| `POST` | `/api/hubs` | Yes | Create new hub with links and rules |
| `GET` | `/api/hubs/:id` | Yes | Get hub details with all links and rules |
| `PUT` | `/api/hubs/:id` | Yes | Update hub (title, slug, links, rules) |
| `DELETE` | `/api/hubs/:id` | Yes | Delete hub and all associated data |
| `GET` | `/api/hubs/:id/qr` | Yes | Generate QR code (PNG data URL or SVG) |

**Create hub request:**
```json
POST /api/hubs
{
  "title": "My Links",
  "slug": "my-links",
  "description": "All my social links",
  "theme": "default",
  "links": [
    {
      "title": "GitHub",
      "url": "https://github.com/username",
      "icon": "link",
      "position": 0,
      "isActive": true,
      "rules": [
        { "type": "device", "config": { "devices": ["desktop"] } },
        { "type": "time", "config": { "startHour": 9, "endHour": 17 } }
      ]
    }
  ]
}
```

### Public Hub Endpoint

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/public/:slug` | No | Get public hub data (filtered by active rules) |

This endpoint applies smart rules: time-based rules filter by current hour, device-based rules filter by the `device` query parameter.

### Analytics Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/analytics/track` | No | Track a visit or click event |
| `GET` | `/api/analytics/:hubId` | Yes | Get analytics with filters (24h, 7d, 30d, all) |
| `GET` | `/api/analytics/:hubId/export` | Yes | Export analytics as CSV or JSON |

**Track event request:**
```json
POST /api/analytics/track
{
  "slug": "my-links",
  "linkId": "uuid-of-clicked-link",
  "eventType": "click",
  "deviceType": "mobile",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

## Features In Depth

### 1. Profile Picture Upload (AWS S3)

- Users can upload a profile picture during registration
- Images are validated (must be image/* mimetype, max 5MB)
- Files are stored in S3 under the key `profile-pics/{userId}.{extension}`
- The S3 URL is stored in the `users.profile_pic_url` column
- Profile pictures are displayed in the dashboard sidebar and on public hub pages
- If S3 upload fails, registration still succeeds (graceful degradation)

### 2. Smart Display Rules

**Time-based rules:**
- Configure start hour and end hour (24-hour format)
- Links are only shown to visitors during the specified time window
- Example: Show "Order Lunch" link only between 11:00–14:00

**Device-based rules:**
- Configure which devices can see the link: mobile, tablet, desktop
- The public hub page detects the visitor's device via viewport width
- Example: Show "Download iOS App" only on mobile devices

Rules are stored in the `rules` table and evaluated server-side when the public hub is requested.

### 3. Analytics System

**Events tracked:**
- `visit` — When someone opens a public hub page
- `click` — When someone clicks a link on a public hub

**Analytics dashboard provides:**
- Total views and clicks with click-through rate
- Bar chart showing daily views vs clicks over time
- Device type breakdown (mobile/tablet/desktop)
- Per-link click performance with visual bars
- Top performing link and most common device insights
- CSV export with complete event history

### 4. QR Code Generation

- QR codes encode the public hub URL
- Available in PNG (data URL) and SVG formats
- Custom styling: green on black theme matching the app design
- Configurable size via query parameter

### 5. Themes

Four built-in themes selected during hub creation:
- **Default** — Black background with green accents
- **Midnight Purple** — Dark with purple/pink gradients
- **Ocean Teal** — Dark with teal/cyan accents
- **Sunset Red** — Dark with orange/red warm tones

---

## Database Schema

The app uses 5 PostgreSQL tables:

```sql
users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT,
    profile_pic_url TEXT,
    created_at TIMESTAMP
)

hubs (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    theme TEXT DEFAULT 'default',
    created_at TIMESTAMP
)

links (
    id TEXT PRIMARY KEY,
    hub_id TEXT REFERENCES hubs(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    icon TEXT DEFAULT 'link',
    position INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP
)

rules (
    id TEXT PRIMARY KEY,
    link_id TEXT REFERENCES links(id) ON DELETE CASCADE,
    rule_type TEXT NOT NULL,        -- 'time' or 'device'
    rule_config TEXT NOT NULL       -- JSON string
)

analytics (
    id TEXT PRIMARY KEY,
    hub_id TEXT REFERENCES hubs(id) ON DELETE CASCADE,
    link_id TEXT,
    event_type TEXT NOT NULL,       -- 'visit' or 'click'
    device_type TEXT,               -- 'mobile', 'tablet', 'desktop'
    location TEXT,
    timestamp TIMESTAMP
)
```

**Relationships:**
- A user has many hubs (one-to-many)
- A hub has many links (one-to-many, cascade delete)
- A link has many rules (one-to-many, cascade delete)
- A hub has many analytics events (one-to-many, cascade delete)

All tables are auto-created on server startup via `initDB()`.

---

## AWS Deployment

This project is designed to deploy on AWS using three services:

| AWS Service | Purpose |
|-------------|---------|
| **EC2** | Application server (runs Node.js, Nginx) |
| **RDS** | Managed PostgreSQL database |
| **S3** | Profile picture file storage |

### High-Level Steps

1. Create S3 bucket with public read policy
2. Create IAM user with S3 upload permissions
3. Create RDS PostgreSQL instance
4. Launch EC2 Ubuntu instance
5. SSH in, install Node.js, Nginx, PM2
6. Clone repo, install deps, build frontend
7. Create `.env` with RDS, S3, and other config
8. Start app with PM2, configure Nginx reverse proxy
9. Test at `http://EC2_PUBLIC_IP`

For the **complete step-by-step deployment guide** with every command and configuration, see the separate deployment documentation.

---

## Screenshots

### Landing Page
![Landing](screenshots/landing.png)

### Dashboard
![Dashboard](screenshots/dashboard.png)

### Hub Created
![Hub](screenshots/hub-created.png)

---

## Usage Guide

### Creating an Account

1. Click "Get Started" on the landing page
2. Switch to the "Sign Up" tab
3. Enter your name, email, and password
4. Optionally upload a profile picture (max 5MB)
5. Click "Create Account"

### Creating a Link Hub

1. On the Dashboard, click "Create New Hub"
2. Enter a title (e.g., "My Social Links")
3. Choose a URL slug (e.g., "my-links" — creates the URL `/h/my-links`)
4. Add a description and choose a theme
5. Click "Add Link" to add links with title and URL
6. Optionally add smart rules (time-based or device-based) to each link
7. Click "Create Hub"

### Sharing Your Hub

- Copy the public URL from the dashboard (e.g., `http://yourserver.com/h/my-links`)
- Click "QR" on any hub card to generate a QR code for easy sharing

### Viewing Analytics

1. Click "Analytics" on any hub card in the dashboard
2. Filter by time range: Last 24 hours, 7 days, 30 days, or All time
3. View total views, clicks, click rate, and active links
4. See daily views/clicks chart, device breakdown, and per-link performance
5. Export data as CSV using the "Export CSV" button

---

## Git Commit Practices

This project follows conventional commit format:

```
<type>: <short description>

Types: feat, fix, docs, style, refactor, test, chore
```

### Commit History Highlights

- `feat: Initial Smart Link Hub implementation`
- `feat: Add smart display rules (time/device-based)`
- `feat: Implement real-time analytics dashboard`
- `feat: Add S3 profile picture upload`
- `refactor: Restructure into frontend/backend directories`
- `refactor: Replace all emojis with SVG icons`
- `refactor: Migrate from SQLite to PostgreSQL`
- `docs: Add comprehensive README and API documentation`

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/NewFeature`)
3. Commit your changes (`git commit -m 'feat: Add NewFeature'`)
4. Push to the branch (`git push origin feature/NewFeature`)
5. Open a Pull Request

---

## Authors

**Uday Patil**, **Shubham Nemade**, **Shivraj Patil**

---

Star this repo if you found it helpful!
