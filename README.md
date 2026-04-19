# Aspira - Real-Time Video Conferencing Platform

Aspira is a fully functional video conferencing application (Zoom Clone) built using the **MERN Stack** (MongoDB, Express, React, Node.js) and **WebRTC** for high-quality, peer-to-peer communication.

## 🚀 Key Features

- **P2P Video & Audio Calling**: Direct communication between users with low latency using WebRTC.
- **Screen Sharing**: Live screen broadcasting for presentations and collaborations.
- **Interactive Whiteboard**: A shared canvas where all meeting participants can draw and visualize ideas in real-time.
- **Instant Group Chat**: Integrated chat room for sending messages during the call.
- **Secure Authentication**: Robust user login and signup system using JWT and Bcrypt.
- **Meeting History**: Keep track of previous calls and joined sessions.

---

## 📁 Project Structure

```text
ZOOM PROJECT/
├── backend/                # Server-side application
│   ├── controllers/        # Business logic (Socket & User logic)
│   ├── models/             # Database schemas (User & Meeting)
│   ├── routes/             # API endpoint definitions
│   └── app.js              # Server entry point
├── frontend/               # Client-side application
│   ├── public/             # Static assets
│   └── src/
│       ├── components/     # Reusable UI components
│       ├── contexts/       # State management context
│       ├── pages/          # Main views (VideoMeet, Home, Auth)
│       └── styles/         # CSS modules
├── README.md               # Main documentation
├── SYSTEM_DESIGN.md        # Architectural overview
└── .env                    # Environment variables (Backend)
```

---

## 🛠 Tech Stack

- **Frontend**: React.js, Material UI (MUI), Socket.io-client, WebRTC API.
- **Backend**: Node.js, Express.js, Socket.io, MongoDB, Mongoose.
- **Authentication**: JSON Web Tokens (JWT), Bcrypt.js for password hashing.

---

## 🏗 How It Works (Architecture)

### 1. The Frontend (Client Side)
The frontend is built with React and manages the heavy lifting of media handling.
- **Media Management**: Uses `navigator.mediaDevices.getUserMedia` to access the camera and microphone.
- **WebRTC Implementation**:
  - Each participant creates an `RTCPeerConnection`.
  - The client handles **SDP (Session Description Protocol)** and **ICE Candidates** to establish a direct connection between peers.
- **Socket.io Connection**: Maintains a persistent connection to the backend for signaling and chat.

### 2. The Backend (Server Side)
The backend acts as a **Signaling Server** and a RESTful API.

#### 🟢 Node.js (The Execution Engine)
- **Runtime**: Node.js executes the server-side JavaScript code.
- **Concurrency**: Its non-blocking I/O allows handling multiple socket connections simultaneously, which is critical for real-time video signaling.
- **Server Creation**: Uses the built-in `http` module to bootstrap the application.

#### 🚀 Express.js (The Web Framework)
- **Routing**: Manages API endpoints like `/api/v1/users/login` and `/register`.
- **Middleware**: Uses `cors` for cross-origin resource sharing and `body-parser` (express.json) to handle incoming data.
- **Modular Structure**: Organizes logic into `routes`, `controllers`, and `models` for better maintainability.

#### 🍃 MongoDB & Mongoose (The Database)
- **Persistence**: MongoDB stores user profiles and meeting logs permanently.
- **Data Modeling**: Mongoose defines schemas for:
  - **User**: Name, unique username, and encrypted passwords.
  - **Meeting**: Keeps track of `meetingCode` and participation history.
- **Database Logic**: Handles all CRUD (Create, Read, Update, Delete) operations for the application.

---

## 🔍 Detailed Feature Explanation

### 📽 Video Call & Signaling
1. **Joining**: When a user joins a meeting link, they enter a "Lobby" to check their camera/mic.
2. **Signaling**: The client emits a `join-call` event to the server. The server tracks which `socket.id` belongs to which meeting room.
3. **P2P Connection**: When a new user joins, existing users receive a `user-joined` event. They then exchange 'Offers' and 'Answers' via the server's `signal` event until a direct P2P link is established.

### 💬 Real-time Chat
- Messages are not stored in a database for every second; they are broadcasted via Socket.io to all users sharing the same meeting path.
- The `chat-message` event ensures that only participants in that specific meeting see the text.

### 🎨 Shared Whiteboard
- Uses the HTML5 **Canvas API**.
- When a user draws, the coordinates (x, y) and brush state are sent to the backend via sockets and broadcasted to everyone else, keeping the drawing in sync.

### 🖥 Screen Sharing
- Uses the `getDisplayMedia` API.
- When activated, the app replaces the video track in the `RTCPeerConnection` with the screen's video track, instantly updating the view for all participants.

---

## 🔄 Full Project Workflow

The following steps outline the end-to-end journey of a user on the Aspira platform:

### 1. User Onboarding & Authentication
- **Action**: User signs up or logs in through the **Frontend**.
- **Process**: The **Backend** receives the request, verifies/stores the user in **MongoDB**, and issues a **JWT Token**.
- **Result**: The user is redirected to the **Home Dashboard**.

### 2. Meeting Initialization
- **Action**: User enters a `Meeting Code` and clicks "Join".
- **Process**: The app checks if the user is authenticated and directs them to the **Lobby** view of the `VideoMeet` component.

### 3. Media Permissions & Lobby
- **Action**: The browser requests access to the **Camera and Microphone**.
- **Process**: `navigator.mediaDevices.getUserMedia` captures the local stream. The user sees a preview of themselves.
- **Result**: Once permissions are granted, the "Join Now" button is enabled.

### 4. Establishing the Connection (Signaling)
- **Action**: User clicks "Join Now".
- **Process**:
    - **Step A**: A **Socket.io** connection is established.
    - **Step B**: The user joins a specific "Socket Room" based on the meeting ID.
    - **Step C**: Existing users in the room are notified (`user-joined`).
    - **Step D**: WebRTC Handshake occurs (SDP Offer/Answer exchange via the backend).

### 5. Real-Time Collaboration
- **Video/Audio**: High-quality P2P streams are established.
- **Chat**: Users send messages that are broadcasted by the server to everyone in the room.
- **Whiteboard**: Participant drawings are synchronized across all screens using socket events.

### 6. Ending the Session
- **Action**: User clicks "End Call".
- **Process**: 
    - The local media tracks are stopped.
    - The socket connection is closed, and the backend cleans up the room list.
    - The user is redirected back to the **Home Page**.

---

## 🚦 Getting Started

### Prerequisites
- Node.js installed
- MongoDB URI (Local or Atlas)

### 1. Backend Setup
```bash
cd backend
npm install
# Create a .env file with:
# PORT=8000
# MONGO_URI=your_mongodb_connection_string
npm start
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm start
```

---

## 📜 Metadata
- **Project Name**: Aspira
- **Developer Focus**: Real-time communication, Scalability, and Clean UI/UX.
