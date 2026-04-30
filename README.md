FRONTEND README (React + Vite)

# 🛍️ Sootika Frontend

Frontend of the Sootika e-commerce application built using **React + Vite**.

---

## 🚀 Tech Stack

- React (Vite)
- Axios (API handling)
- Context API (Auth, Cart, Wishlist)
- Tailwind CSS
- React Router

---

## 📁 Project Structure


src/
├── api/ # Axios instance & API services
├── Authentication/ # AuthContext
├── context/ # Cart & Wishlist context
├── Admin/ # Admin dashboard & pages
├── pages/ # User pages
├── components/ # Reusable components
└── App.jsx


---

## ⚙️ Setup Instructions

### 1. Clone the repo

```bash
git clone <your-repo-url>
cd frontend
2. Install dependencies
npm install
3. Run development server
npm run dev

App runs on:

http://localhost:5173
🌐 Environment Variables

Create .env file:

VITE_API_URL=http://localhost:8080
🔐 Authentication Flow
JWT-based authentication
Tokens stored in localStorage
Axios interceptor attaches token automatically
Protected routes for admin & user
🛒 Features
User login & signup
Product browsing
Cart & Wishlist
Admin dashboard
Product management
Razorpay payment integration
💳 Payment (Razorpay)
Uses Test Mode
Test UPI:
success@razorpay
📦 Build
npm run build

Output folder:

dist/
⚠️ Notes
Do not edit dist/ folder manually
Always use api (Axios instance) for API calls
Ensure backend is running before starting frontend