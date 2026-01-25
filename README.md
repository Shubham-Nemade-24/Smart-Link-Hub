# Smart Link Hub Generator

A web-based platform to consolidate digital links into a single smart URL with dynamic rules and analytics.

## Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher)
- VS Code (recommended)

## Setup Instructions

1.  **Open the Project**:
    - Open this folder in VS Code.

2.  **Install Dependencies**:
    - Open a terminal in VS Code (`Ctrl+` `) or `Terminal > New Terminal`.
    - Run the following command:
      ```bash
      npm install
      ```

## Running the Application

You need to run both the backend server and the frontend development server. You can do this in two separate terminal instances.

### 1. Start the Backend Server
In the first terminal:
```bash
npm run server
```
*Expected Output:* `🚀 Server running on http://localhost:3001`

### 2. Start the Frontend Server
Open a **new terminal** (`Ctrl+Shift+` `) and run:
```bash
npm run dev
```
*Expected Output:* `➜ Local: http://localhost:5173/`

## Accessing the App

- **Dashboard & Editor**: Open [http://localhost:5173](http://localhost:5173) in your browser.
- **Public Hubs**: Accessible at `http://localhost:5173/h/<your-slug>`.

## Features

- **Smart Rules**: Show links based on time, device, or location.
- **Analytics**: Track visits and clicks with charts.
- **QR Codes**: Generate custom QR codes for your hubs.
- **Export**: Export analytics data to CSV.

## Project Structure

- `/server`: Node.js + Express backend
- `/src`: React frontend
- `/src/pages`: Application pages (Dashboard, Analytics, etc.)
- `data.db`: SQLite database file (stores all data)
