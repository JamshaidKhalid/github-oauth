# 🛠️ GitHub Integration Backend

This is the backend service for a GitHub OAuth integration system built using **Node.js**, **Express**, and **MongoDB**. It allows a global user to authenticate with GitHub, fetch organization data (repos, commits, pull requests, issues, changelogs, users), and serve it through clean, paginated, and filterable APIs.

---

## 🚀 Features

- 🔐 GitHub OAuth2 authentication via `passport-github2`
- 🧠 Stores access token and user/org metadata in MongoDB
- 🔁 Re-sync API to refresh GitHub data
- ❌ Remove integration API that purges all data
- 🧱 Modular MVC structure (`controllers`, `routes`, `models`, `helpers`)
- 📊 Supports server-side pagination, sorting, filtering, and search
- 🔍 AG Grid compatible responses
- ✅ Built using Node.js v22 & Express

---

## 📁 Folder Structure

```
📦 github-integration-be
├── config/
│   └── passport.js
├── controllers/
│   └── github.controller.js
├── helpers/
│   └── github.sync.js
│   └── github.query.js
├── models/
│   └── githubIntegration.model.js
│   └── githubOrganization.model.js
│   └── orgRepo.model.js
│   └── orgCommit.model.js
│   └── orgPull.model.js
│   └── orgIssue.model.js
│   └── orgChangelog.model.js
│   └── orgUser.model.js
├── routers/
│   └── github.router.js
├── app.js
├── .env
└── package.json
```

---

## 🧑‍💻 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/github-integration-be.git
cd github-integration-be
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create `.env` file

```env
PORT=3000
MONGODB_URI=your_mongo_connection_string
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

> ⚠️ You must register your app with GitHub to obtain a client ID and secret: https://github.com/settings/developers

### 4. Start the server

```bash
npm run dev
```

---

## 📡 API Endpoints

### 🔐 Authentication

- `GET /auth/github`
- `GET /auth/github/callback`

### ⚙️ Integration

- `GET /integration/status`
- `POST /integration/resync`
- `DELETE /integration/remove`

### 📊 Data Access

- `POST /data/:collection`

Example:
```json
{
  "page": 1,
  "pageSize": 10,
  "search": "api",
  "sort": { "field": "date", "order": "desc" },
  "filters": {}
}
```

---

## ⚙️ Technologies

- Node.js v22
- Express.js
- MongoDB (Mongoose)
- Passport.js (`passport-github2`)
- GitHub REST API v3
- Dotenv

---

## 🤝 Author

Made by [@Jamshaid Khalid](https://github.com/jamshaidkhalid)

