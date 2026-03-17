# Cherai Tourism - Signature Experience Portal ❤️

A high-end, professional Full Stack application designed for the Cherai Tourism Project.

## Features
- 🌊 **Signature Activities & Experiences**
- 🏨 **Professional Hotel & Hostel Booking**
- 🛳️ **Coastal Adventures & Sunset Cruises**
- 💳 **Dynamic UPI Payment & QR Scanner Integration**
- 📱 **Fully Responsive Architectural Design**
- 🚀 **Full Stack: React (Vite), Node.js, Express, MySQL**

## Prerequisites
- **Node.js**: [Download here](https://nodejs.org/)
- **MySQL**: [Download here](https://www.mysql.com/downloads/) (Ensure it's running)

## Step-by-Step Installation Guide

### 1. Database Setup
Create a database named `cherai_tourism` in your MySQL server.
```sql
CREATE DATABASE cherai_tourism;
```

### 2. Configure Environment Variables
Open `/backend/.env` and update your database credentials:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=cherai_tourism
JWT_SECRET=cherai_secret_key_123
```

### 3. Install All Dependencies
Open your terminal in the root folder and run:
```bash
npm run install-all
```

### 4. Initialize Database Tables
Run the setup script inside the `backend` folder to create all necessary tables:
```bash
cd backend
npm run setup-db
cd ..
```

### 5. Start the Application
To run both the Frontend and Backend at the same time:
```bash
npm start
```

## Accessing the App
- **Frontend URL:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:5000](http://localhost:5000)

## Project Structure
- `frontend/`: React Frontend (Vite + Vanilla CSS)
- `backend/`: Node.js + Express + MySQL API Layer
