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

## 🚀 Deployment

### Backend

```
cd backend
npm install
npm start
```

### Frontend

```
cd frontend
npm install
npm run dev
```

---

## 👨‍💻 Author

**Santosh**
B.Tech CSE Student
Passionate about Full Stack Development & AI Projects

---

## 🌟 Conclusion

This project demonstrates how AI can be used to improve corporate accountability by monitoring real-world outcomes against public commitments.

---

⭐ If you like this project, feel free to star the repository!
