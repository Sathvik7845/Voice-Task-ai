# VoiceTask AI - Mobile Frontend (React Native & Expo)

The cross-platform React Native frontend for **VoiceTask AI**, built with Expo, Expo Router, TypeScript, and AsyncStorage.

## 📱 Features
- **Voice Recognition**: Interactive VoiceButton with real-time audio pulse animation.
- **Dynamic Task Parsing**: Calls the backend `/api/tasks/extract` endpoint to turn natural voice commands into structured tasks.
- **Task Preview Modal**: Confirms AI extraction (task name, date, time) with editing capabilities before saving.
- **Local Persistence**: Stores tasks persistently using AsyncStorage across application restarts.
- **Task Management**: Mark completed, edit task details, delete tasks, and filter by Today / Upcoming.
- **Manual Task Fallback**: Add tasks manually anytime.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- Expo Go app on iOS/Android or an emulator

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Configure Environment Variables
Create a `.env` file from `.env.example`:
```env
# For local device testing, use your computer's LAN IP (e.g., http://192.168.1.50:5000/api)
# For Android Emulator: http://10.0.2.2:5000/api
# For iOS Simulator / Web: http://localhost:5000/api
EXPO_PUBLIC_API_URL=http://localhost:5000/api
```

### 3. Run the App
```bash
# Start Expo development server
npx expo start

# Run directly on iOS Simulator
npx expo start --ios

# Run directly on Android Emulator
npx expo start --android

# Run in Web Browser
npx expo start --web
```
