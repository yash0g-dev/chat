# VibeChat Application

VibeChat is a modern, real-time communication platform designed for seamless messaging, group collaboration, and video conferencing. Built with a high-performance MERN stack (MongoDB, Express, React, Node.js), it offers a premium chat experience with support for media attachments and status tracking.

---
## 🛠️ Technology Stack

<p align="left">
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/Redux-593D88?style=for-the-badge&logo=redux&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" />
  <br />
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white" />
  <img src="https://img.shields.io/badge/LiveKit-000000?style=for-the-badge&logo=livekit&logoColor=white" />
</p>

---
## 🚀 Key Features

* **Real-time Messaging:** Lightning-fast communication powered by Socket.io.
* **Media Support:** Send images, videos, and files directly in your chats.
* **Video Conferencing:** Integrated LiveKit support for high-quality group video calls.
* **Read Receipts:** Real-time message status (Sent, Delivered, Seen).
* **Modern UI:** A clean, responsive dark-mode interface with smooth gradients.
* **Presence Tracking:** Real-time online/offline status indicators.

---

## 🏗️ Architecture

The platform follows a robust event-driven architecture to ensure low latency and data integrity, utilizing WebSockets for real-time bi-directional communication while handling heavy media via RESTful API calls.



---

## 🛠️ Tech Stack

* **Frontend:** Next.js, Redux Toolkit, Tailwind CSS, Lucide React.
* **Backend:** Node.js, Express, Socket.io, Mongoose (MongoDB), Prisma (Postgres).
* **Auth & Security:** JSON Web Tokens (JWT), bcrypt.
* **Media & Storage:** Cloudinary (for file storage), Multer.
* **RTC:** LiveKit for video/audio streaming.

---

## 🖥️ User Interface Overview

### Chat Dashboard
The main interface allows users to switch between conversations, view unread counts, and see real-time presence.



### Message Interaction
A modern, intuitive bubble-based messaging system with attachment support and Messenger-style gradient aesthetics.



---

## ⚙️ Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/yash0g-dev/chat.git(https://github.com/yash0g-dev/vibechat.git)
    cd vibechat
    ```

2.  **Install dependencies:**
    ```bash
    # Install server dependencies
    cd backend 
    npm install
    
    # Install client dependencies
    cd client && npm install
    ```

3.  **Environment Variables:**
### Backend
    Create a `.env` file in the backend directory and configure the following:
    ```env
    PORT=5000
    MONGO_URI=your_mongodb_connection_string
    DATABASE_URL=your_postgres_connection_string
    CLOUDINARY_CLOUD_NAME=your_name
    CLOUDINARY_API_KEY=your_key
    CLOUDINARY_API_SECRET=your_secret
    LIVEKIT_API_KEY=your_key
    LIVEKIT_API_SECRET=your_secret
    ```
### Frontend
    Create a `.env` file in the frontend directory and configure the following:
    ```env
    NEXT_PUBLIC_API_URL=http://localhost:5000
    ```

4.  **Run the Application:**
    ```bash
    # Start the backend
    cd backend && npm run dev
    
    # Start the frontend
    cd frontend && npm run dev
    ```

---

## 💡 How it Works

The flow of a message attachment is handled through a RESTful POST request to ensure reliability, followed by a WebSocket broadcast to notify participants instantly.



---

## 🤝 Contributing

Contributions are welcome! Please fork the repository and create a pull request for any new features or bug fixes.

## 📄 License
This project is licensed under the MIT License.
