# ⚡ QuirkAI

QuirkAI is a full-stack platform for creating, customizing, and managing AI personas with custom quirks, tones, and backstories.

---

## 🛠️ Tech Stack

<p align="left">
  <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python" />
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
</p>

- **Backend:** FastAPI, Python, Uvicorn, PyMongo, JWT Auth (python-jose, passlib/bcrypt)
- **Database:** MongoDB (Local or Atlas)
- **Frontend:** React 19, TypeScript, React Router v7, Vite, Vanilla CSS Design System

---

## 🍃 MongoDB Atlas Setup

1. **Log in / Sign Up:** Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and log in.
2. **Create a Project:** Create a new project (e.g., `QuirkAI`).
3. **Deploy a Free Cluster:** Select **M0 Free** cluster and choose your preferred cloud provider and region.
4. **Set Up Database Access & Network Access:**
   - Add a database user with username and password (keep these handy).
   - Under Network Access, allow your IP address (or `0.0.0.0/0` for development).
5. **Get Connection String:**
   - Click **Connect** > **Drivers** (Python).
   - Copy the connection URI: `mongodb+srv://<username>:<password>@<cluster-url>/?retryWrites=true&w=majority`.
6. **Set `.env`:** Copy `backend/.env.example` to `backend/.env` and paste your connection string into `MONGODB_URI`.

---

## 🚀 Installation & Setup

### Prerequisites
- **Python 3.10+**
- **Node.js 18+** & **npm**
- **MongoDB** (Atlas connection URI or local instance)

---

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
# Windows:
python -m venv .venv
.venv\Scripts\activate
# macOS/Linux:
# python3 -m venv venv
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

#### Environment Configuration
Create a `.env` file by copying the template:

```bash
# Windows:
copy .env.example .env
# macOS/Linux:
# cp .env.example .env
```

Update your `.env` with your credentials:

```env
MONGODB_URI="mongodb+srv://<username>:<password>@<cluster-url>"
JWT_SECRET_KEY="your_jwt_secret_key_here"
```

#### Run Backend Server
```bash
uvicorn app.main:app --reload
```
The API will be available at `http://127.0.0.1:8000` (Swagger docs: `http://127.0.0.1:8000/docs`).

---

### 2. Frontend Setup

```bash
# Open a new terminal and navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```
The client app will be available at `http://localhost:5173`.