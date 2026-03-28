# 🚀 Corporate Commitment Monitor

A full-stack web application that tracks sustainability commitments made by companies and monitors real-world progress using AI-based classification of news updates.

---

## 📌 Project Overview

The **Corporate Commitment Monitor** helps track whether companies actually follow through on their public promises (like sustainability goals, emissions reduction, recycling targets, etc.).

The system collects company commitments and analyzes news updates to classify them as:

* ✅ Progress
* ⚠️ Delay
* ❌ Reversal
* 🔍 Unrelated

This helps increase transparency and accountability.

---

## 🎯 Problem Statement

Many companies publicly announce sustainability goals but fail to meet deadlines or quietly change commitments.

This project solves that by:

* Monitoring commitments
* Tracking updates from news sources
* Automatically classifying progress using AI

---

## 🛠️ Tech Stack

### Frontend

* React (Vite)
* CSS (Modern UI)

### Backend

* Node.js
* Express.js

### Database

* MongoDB (Mongoose)

### AI Integration

* OpenAI API (for classification)

---

## 🏗️ Project Structure

```
project/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── App.jsx
│
├── backend/
│   ├── models/
│   ├── routes/
│   ├── controllers/
│   └── server.js
│
└── README.md
```

---

## ⚙️ Features

### 1. Company Management

* Add companies
* Store commitments with deadlines

### 2. News Tracking

* Add news articles manually
* Link news to companies

### 3. AI Classification

Classifies news into:

* Progress
* Delay
* Reversal
* Unrelated

### 4. Dashboard

* Displays companies and commitments
* Shows status with color indicators

### 5. Alerts System

* Highlights delays and reversals
* Helps users take action quickly

---

## 🧠 How AI Classification Works

### Input Example

Company: Britannia
Commitment: "57% renewable electricity by FY2025-26"
News: "Britannia achieved 45% renewable energy in FY2024"

### Output

```
{
  "label": "Progress",
  "confidence": 0.91,
  "reason": "Company is moving toward its target"
}
```

---

## 📊 Example Data

### Companies & Commitments

| Company       | Commitment                | Deadline  |
| ------------- | ------------------------- | --------- |
| Britannia     | 57% renewable electricity | FY2025-26 |
| Nestlé India  | 50% emissions reduction   | 2030      |
| Tata Consumer | 100% recyclable packaging | 2030      |

---

## 🔄 Workflow

1. Add company + commitment
2. Add news article
3. AI analyzes news
4. Classification stored in database
5. Dashboard updates automatically

---

## 🚨 Alert Rules

* 🔴 Delay or Reversal → High priority alert
* 🟡 Near deadline → Reminder
* 🟢 Progress → Logged only

---

## 📡 API Endpoints

### Company

* `POST /api/companies`
* `GET /api/companies`

### Commitments

* `POST /api/commitments`
* `GET /api/commitments`

### News

* `POST /api/news`
* `GET /api/news`

---

## 🧪 Example API Request

### Add Company

```
POST /api/companies
```

```
{
  "name": "Britannia"
}
```

---

### Add Commitment

```
POST /api/commitments
```

```
{
  "companyId": "123",
  "text": "57% renewable electricity by FY2025-26",
  "deadline": "2026"
}
```

---

### Add News

```
POST /api/news
```

```
{
  "companyId": "123",
  "title": "Renewable Energy Growth",
  "content": "Britannia reached 45% renewable energy usage",
  "date": "2024-01-10"
}
```

---

## 🧩 Future Enhancements

* 🔍 Automatic news scraping (RSS feeds)
* 📈 Data visualization charts
* 🔔 Email/Slack notifications
* 🌐 Multi-company tracking at scale
* 📱 Mobile app version

---

## ⚖️ Legal & Ethical Considerations

* Uses publicly available data only
* Avoids copyright violations
* Includes human verification for critical alerts
* Prevents AI hallucination with validation

---

## 🚀 Deployment (cloud)

You need **two** public URLs in production: the **API** (Express) and the **frontend** (static Vite build). **MongoDB Atlas** must allow connections from the internet (`Network Access` → `0.0.0.0/0` for a demo, or your host’s egress IPs).

### 1. Deploy the API (example: [Render](https://render.com))

1. Push this repo to GitHub/GitLab.
2. New **Web Service** → connect the repo.
3. Settings:
   - **Root directory:** `backend`
   - **Build command:** `npm install`
   - **Start command:** `npm start`
   - **Instance type:** Free (cold starts are normal).
4. **Environment variables** (service → Environment):

   | Key | Value |
   |-----|--------|
   | `MONGODB_URI` | Your Atlas connection string |
   | `HUGGINGFACE_API_TOKEN` | Optional; HF inference for classification |
   | `OPENAI_API_KEY` | Optional fallback |
   | `PORT` | Leave unset — Render injects `PORT` |

5. Deploy. Copy the service URL, e.g. `https://corporate-commitment-monitor-api.onrender.com`.
6. Test: `https://YOUR-API.onrender.com/api/health` → `"mongo": "connected"`.
7. Optional: in Render **Shell**, run `node scripts/seedIndianFoodPdf.js` from `backend` to seed demo data (requires `MONGODB_URI` in that environment).

You can also use the repo **`render.yaml`** as a [Blueprint](https://render.com/docs/blueprint-spec) and then add secrets in the dashboard.

### 2. Deploy the frontend (example: [Netlify](https://netlify.com) or [Vercel](https://vercel.com))

1. New site from repo (or drag-and-drop `frontend/dist` after a local build).
2. **Base directory:** `frontend`
3. **Build command:** `npm run build`
4. **Publish directory:** `frontend/dist` (or `dist` if base is `frontend`).
5. **Environment variable:**

   ```env
   VITE_API_URL=https://YOUR-API.onrender.com
   ```

   No trailing slash. Rebuild after changing it.

6. **SPA routing:** this repo includes `frontend/netlify.toml` (Netlify) and `frontend/vercel.json` (Vercel) so React Router paths refresh correctly.

7. Open your Netlify/Vercel URL and use the app. If the UI cannot reach the API, check browser **DevTools → Network** (CORS): the API uses open `cors()` so cross-origin requests from your frontend origin are allowed.

### 3. Local production smoke test

```bash
cd backend && npm install && npm start
cd ../frontend && npm install && npm run build && npx vite preview
```

Set `frontend/.env.production` with `VITE_API_URL=http://localhost:5000` for a local API check (Vite loads `.env.production` for `vite build`).

### 4. GitHub Pages (automated frontend)

After the API is live, you can ship the UI from GitHub Actions:

1. Repo **Settings → Pages → Build and deployment → Source:** **GitHub Actions**.
2. Repo **Settings → Secrets and variables → Actions → New repository secret:**  
   `VITE_API_URL` = your public API URL (same as Netlify, no trailing slash).
3. Push to `main` (or run the workflow manually). The site will be at  
   `https://<user>.github.io/<repo>/` — the workflow sets `VITE_BASE_PATH` for that path.

**Backend in production:** use Render/Railway, or build the **`backend/Dockerfile`** on any container host. Set `MONGODB_URI` and optional HF/OpenAI keys.

---

## 👨‍💻 Author

* Santosh
* B.Tech CSE Student
* Passionate about Full Stack Development & AI Projects

---

## 🌟 Conclusion

This project demonstrates how AI can be used to improve corporate accountability by monitoring real-world outcomes against public commitments.

---

⭐ If you like this project, feel free to star the repository!
