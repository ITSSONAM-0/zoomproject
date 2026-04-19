# Aspira - Frontend (React Application)

This is the client-side application for **Aspira**, a real-time video conferencing platform. It is built using **React 19** and leverages several modern web technologies to provide a smooth, interactive experience.

---

## 🛠 Key Technologies

- **React.js**: The core framework used for building the user interface.
- **Material UI (MUI)**: Provides a professional and responsive design system with components like buttons, text fields, and icons.
- **WebRTC API**: Used for low-latency, peer-to-peer audio and video streaming.
- **Socket.io-client**: Enables real-time communication for signaling (connecting peers), chat messages, and whiteboard synchronization.
- **React Router**: Manages navigation between the Landing, Home, and Meeting pages.

---

## 📂 Project Structure

- **`/pages`**: Contains the main views of the application.
  - `VideoMeet.jsx`: The most complex component, handling WebRTC connections, media streams, and the meeting UI.
  - `authentication.jsx`: Manages user login and registration forms.
  - `home.jsx`: The dashboard where users can join or start new meetings.
  - `landing.jsx`: The entry point for the application.
  - `history.jsx`: Displays the user's meeting history fetched from the backend.
- **`/utils`**: Utility functions for data handling.
- **`/styles`**: Modular CSS files for component-specific styling.

---

## 🚀 How the Frontend Works

### 1. Authentication & State
The app uses local storage and potentially context providers to manage user sessions. On the **Authentication** page, it communicates with the backend to verify credentials and store a JWT token.

### 2. Joining a Meeting
When a user joins a meeting:
1.  The app checks for **Camera and Microphone permissions** using `navigator.mediaDevices.getUserMedia`.
2.  It shows a "Lobby" preview so the user can verify their video and audio before entering.
3.  Once the user clicks "Join," it connects to the **Socket.io** server.

### 3. WebRTC Call Flow (The "Magic")
The `VideoMeet` component manages the peer connections:
- **Signaling**: It listens for "Users Joining" through sockets.
- **Handshake**: It creates an **SDP Offer**, which the backend sends to other participants. Other participants send back an **SDP Answer**.
- **ICE Candidates**: To bypass firewalls and find the best network path, participants exchange ICE candidates via the socket server.
- **Streaming**: Once the handshake is complete, video/audio tracks are added to the `RTCPeerConnection`, and the remote stream is displayed in a video element.

### 4. Interactive Features
- **Chat**: Messages are sent through the socket connection and instantly displayed in the chat sidebar.
- **Screen Share**: Uses the `getDisplayMedia` API to capture the screen and replace the existing video track in the peer connection.
- **Whiteboard**: Captures mouse coordinates on a Canvas and broadcasts them to everyone in the room.

---

## 🚦 Getting Started

1.  Navigate to the frontend directory:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm start
    ```
    The app will be available at `http://localhost:3000`.

---

## 📜 Metadata
- **Version**: 0.1.0
- **Build Tool**: Create React App (react-scripts)
