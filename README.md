# IoT Device Manager

An end-to-end IoT platform to register, control, and monitor Arduino-powered devices through a FastAPI backend, React frontend, and MQTT-based communication.

## Project Structure

```
IoT-Device-Manager
├── Frontend/       # React web app for UI/UX
├── Backend/        # FastAPI backend with MongoDB and MQTT
└── Arduino codes/  # Arduino sketch to generate QR and publish state
```

---

## Features

* **User Authentication** (Register/Login with JWT)
* **Add New Devices** by scanning QR codes generated on Arduino
* **Real-time Device State Toggle** via MQTT
* **WebSocket-based Live Status Updates**
* **MongoDB Atlas Integration** to persist users and devices

---

## Tech Stack

| Layer            | Technology               |
| ---------------- | ------------------------ |
| Frontend         | React + Vite             |
| Backend          | FastAPI + MongoDB        |
| Realtime         | MQTT (broker.hivemq.com) |
| Auth             | JWT (via `jose`)         |
| Password Hashing | `passlib[bcrypt]`        |
| QR Code Gen      | `qrcode` (Python)        |
| Device           | Arduino (C++) + QR Lib   |

---

## Setup Guide

### Backend Setup

1. Navigate to `backend/`:

   ```bash
   cd backend
   ```

2. Create `.env` file:

   ```env
   MONGO_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/?retryWrites=true&w=majority
   SECRET_KEY=your_secret_key
   ```

3. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

4. Run server:

   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```

---

### Frontend Setup

1. Navigate to `frontend/`:

   ```bash
   cd frontend
   ```

2. In src/services/api.ts, update the base URL to your backend server.

3. Install dependencies:

   ```bash
   npm install
   ```

4. Start development server:

   ```bash
   npm run dev
   ```

> Frontend is configured to connect with `http://localhost:8000` by default.

---

### Arduino Setup

* Upload the appropriate sketch from `arduino codes/` to your Arduino.
* Device generates a **code containing its unique MQTT topic**.
* Scan this QR on the frontend to register it to your user account.

---

## Authentication Flow

* User logs in → receives JWT token.
* Token is sent as `Authorization: Bearer <token>` in headers.
* Backend verifies token before allowing any device operations.

---

## Real-Time Flow

1. Arduino publishes status updates to `home/devices/<device_id>/status`.
2. FastAPI backend listens and stores state changes.
3. Frontend connects via WebSocket to `/ws/<device_id>` to receive live updates.
4. User toggles device from UI → API publishes to `home/devices/<device_id>/set`.

---

## Testing

* You can test MQTT messages manually using tools like MQTT Explorer.
* WebSocket responses can be tested using browser tools or Postman (newer versions).

---

## License

MIT License. Feel free to contribute or fork!

