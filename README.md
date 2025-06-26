# 🌿 WaterYouDoing? – Mobile App (React Native)

This is the **mobile frontend** for **WaterYouDoing?**, a smart greenhouse control and monitoring application developed for an **embedded system**. It allows users to control and monitor environmental conditions in real time via a clean mobile interface.  
The backend repository is available at: [Ahsabar/Water-You-Doing](https://github.com/Ahsabar/Water-You-Doing)

---

## 📱 Features

### ✅ Climate and Irrigation Control
- Set thresholds for:
  - **Soil Moisture**
  - **Temperature**
- Toggle **automation** for:
  - 🌡️ Heating / Cooling system
  - 💧 Watering system
- Manual control for:
  - Fan, Heater, and Water Pump  
  _(Manual control disables automation for that specific device)_

### 📊 Real-Time Monitoring
- Live **temperature** and **soil moisture** values
- Values update in **real-time via WebSocket**
- Notifications:
  - **WebSocket-based** alerts when app is open
  - **Firebase Push Notifications** when app is closed

### 📷 Camera Integration
- View **live stream** from the greenhouse
- Take **snapshots** and **download** them
- Change **camera resolution** dynamically

---

## 🔌 Technologies Used

- **React Native** (Mobile App Framework)
- **WebSocket** (Real-time communication)
- **Firebase Cloud Messaging (FCM)** (Push notifications)
- **Embedded System Backend** ([See here](https://github.com/Ahsabar/Water-You-Doing))

---

## 🚀 Getting Started

🎥 Demo

Watch a short video demonstration of the WaterYouDoing? embedded system + mobile app:

🔗 https://www.youtube.com/shorts/G_noetGeP6k

    ⚠️ Note:
    This video shows an earlier version of the mobile app where toggles did not always reflect the automation state correctly. These issues have been fully resolved in the current version.

### Prerequisites
- Node.js ≥ 16.x
- React Native CLI
- Android Studio or Xcode
- Firebase project credentials (`google-services.json` for Android)

### Installation

```bash
git clone https://github.com/TuralK/WaterYouDoing.git
cd WaterYouDoing
npm install

Run on Android
npx react-native run-android

📂 Project Structure
WaterYouDoing-Mobile/
│
├── src/
│   ├── api/           # API request logic
│   ├── components/    # Reusable UI components
│   ├── context/       # Global state (e.g., controls, websocket)
│   ├── events/        # EventEmitter config
│   ├── navigation/    # Navigation configuration (e.g., stack, tab)
│   ├── screens/       # App screens (Home, Camera, Settings, etc.)
│   ├── services/      # notification service
│   ├── types/         # Type definitions (TypeScript interfaces/types)
│   └── websocket/     # WebSocket setup and messaging logic
│
├── android/           # Android-specific configuration
├── package.json
└── README.md
```

🔗 Backend Info

This mobile app communicates with the backend at:

➡️ https://github.com/Ahsabar/Water-You-Doing

Backend handles:

    Environmental logic

    WebSocket updates

    Firebase push notifications

    Camera streaming

🔔 Notes

    Manual toggles override automation for the selected device.

    App must be on same local network as the embedded device for live camera stream.

    Notifications are sent automatically when automated decisions are made.
