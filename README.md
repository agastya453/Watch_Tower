# Intelligent Website Change Detection System

A modern, cloud-ready full-stack application that monitors websites for textual changes, designed with an Apple-style interface. 

## Tech Stack
- Frontend: React, Vite, Tailwind CSS, Framer Motion
- Backend: Node.js, Express, Axios, Cheerio, Diff, Node-Cron
- Database: MySQL (using mysql2 promise pool)

## Prerequisites
- Node.js (v18+ recommended)
- MySQL Database server running locally (or adjust `.env`)

---

## 1. Setup MySQL DB
Ensure you have MySQL running. By default, the application will attempt to connect to:
- Host: `localhost`
- User: `root`
- Password: *(empty)*

> To change these, edit the `server/.env` file. The backend will automatically create the `website_tracker` database and all required tables when it starts.

---

## 2. Installation Let's run it!

Open two terminal windows (or use concurrently if you prefer to set it up).

### Backend Setup
1. `cd server`
2. `npm install`
3. `npm run start` (or `node server.js`)

*(The server will run on `http://localhost:5000`)*

### Frontend Setup
1. `cd client`
2. `npm install`
3. `npm run dev`

*(The client will run on `http://localhost:5173`)*

---

## Usage
- Open `http://localhost:5173`
- Enter a valid URL like `https://example.com`
- Head to the dashboard to see tracked sites.
- The cron-job automatically runs every **5 minutes** on the backend.
- View changes in a split-screen diff!
