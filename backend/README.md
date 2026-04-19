#  Backend (Node.js & Express)

This is the server-side application for **Aspira**, providing the necessary infrastructure for user authentication, data persistence, and WebRTC signaling.

---

## 🛠 Core Technologies

- **Node.js**: The runtime environment.
- **Express.js**: The web framework for handling REST APIs.
- **Socket.io**: Powers the real-time signaling server and chat.
- **MongoDB & Mongoose**: Used for storing user data and meeting logs.
- **JSON Web Tokens (JWT)**: For secure user authentication.
- **Bcrypt.js**: For hashing and securing passwords.

---

## 📂 Backend Structure

- **`app.js`**: The main entry point. Sets up Express, connects to MongoDB, and initializes the Socket.io server.
- **`/controllers`**: Contains the business logic.
  - `user.controller.js`: Handles login, registration, and activity history.
  - `socketManager.js`: The heart of the real-time system; manages all socket events.
- **`/models`**: Database schemas.
  - `user.model.js`: User profile data.
  - `meeting.model.js`: Log of meetings joined by users.
- **`/routes`**: Express routers that map URLs to controller functions.
- **`.env`**: Stores sensitive configuration like the MongoDB URI and Port.

---

## 🚀 How the Backend Works

### 1. The Signaling Server (Socket.io)
WebRTC peers cannot connect directly without knowing each other's network info. The backend solves this:
- **`join-call`**: When a user joins a URL, the server adds their `socket.id` to a "room" mapped to that URL.
- **`signal`**: This is a relay event. When User A sends an "Offer" or "ICE Candidate", the server simply forwards it to User B.
- **`chat-message`**: Relays messages to all users in a specific room.
- **`whiteboardData`**: Relays drawing coordinates to everyone in the meeting EXCEPT the sender.

### 2. User Authentication
1.  **Registration**: Receives user details, hashes the password using **Bcrypt**, and saves it to MongoDB.
2.  **Login**: Verifies credentials and generates a **JWT**.
3.  **Security**: The token is sent back to the client to authorize future requests (like fetching history).

### 3. Database Persistence
- When a user joins a meeting, the frontend calls the `/add_to_activity` API.
- The backend saves the `meetingCode` and `timestamp` to the `meetings` collection in **MongoDB**.
- Users can later request their full history via the `/get_all_activity` API.

---

## 📡 API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| POST | `/api/v1/users/register` | Create a new user account |
| POST | `/api/v1/users/login` | Authenticate user and get token |
| POST | `/api/v1/users/add_to_activity` | Log a meeting session |
| GET | `/api/v1/users/get_all_activity` | Retrieve user's meeting history |

---

## 🔌 Socket Events Summary

- `connection`: Triggered when a client connects.
- `join-call`: Adds a user to a meeting path.
- `signal`: Relays WebRTC metadata (SDP/ICE) between clients.
- `chat-message`: Broadcasts chat messages to the room.
- `whiteboardData`: Synchronizes drawing across participants.
- `disconnect`: Cleans up the room list when a user leaves.

---

## 🚦 Getting Started

1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Configure Environment Variables:
    Create a `.env` file in the `backend` folder:
    ```env
    PORT=8000
    MONGO_URI=your_mongodb_connection_string
    ```
4.  Start the server:
    ```bash
    npm run dev
    ```
    The server will run on `http://localhost:8000`.

---

## 📜 Metadata
- **Version**: 1.0.0
- **Author**: Aspira Dev Team
