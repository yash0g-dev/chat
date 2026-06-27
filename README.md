# VibeChat Application

VibeChat is a modern, real-time communication platform designed for seamless messaging, group collaboration, and video conferencing. Built with a high-performance MERN stack (MongoDB, Express, React, Node.js), it offers a premium chat experience with support for media attachments and status tracking.

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
    git clone [https://github.com/yourusername/vibechat.git](https://github.com/yourusername/vibechat.git)
    cd vibechat
    ```

2.  **Install dependencies:**
    ```bash
    # Install server dependencies
    npm install
    
    # Install client dependencies
    cd client && npm install
    ```

3.  **Environment Variables:**
    Create a `.env` file in the root directory and configure the following:
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

4.  **Run the Application:**
    ```bash
    # Start the backend
    npm run dev
    
    # Start the frontend
    cd client && npm run dev
    ```

---

## 💡 How it Works

The flow of a message attachment is handled through a RESTful POST request to ensure reliability, followed by a WebSocket broadcast to notify participants instantly.



---

## 🤝 Contributing

Contributions are welcome! Please fork the repository and create a pull request for any new features or bug fixes.

## 📄 License
This project is licensed under the MIT License.
