# VoiceTask AI - Backend Service

Node.js, Express, and TypeScript backend server providing AI task extraction powered by Google Gemini (`@google/genai`).

## 🛠 Features
- **Strict Security**: The `GEMINI_API_KEY` is kept strictly on the backend.
- **Dynamic Date & Time Resolution**: Calculates relative dates (e.g., "tomorrow", "next Monday", "in 3 days") based on server/client timestamp.
- **Robust Validation**: Validates incoming natural language text and verifies Gemini's structured output.
- **Centralized Error Handling**: Shields internal errors from exposing keys or stack traces to clients.

## 🚀 Setup & Installation

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   Create a `.env` file based on `.env.example`:
   ```env
   PORT=5000
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   CLIENT_URL=http://localhost:8081
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Build for production:
   ```bash
   npm run build
   npm start
   ```

## 📡 API Endpoints

### 1. Health Check
- **Endpoint**: `GET /api/health`
- **Response**:
  ```json
  {
    "success": true,
    "message": "VoiceTask AI backend is running",
    "timestamp": "2026-08-14T20:45:00.000Z"
  }
  ```

### 2. Extract Task from Voice / Text
- **Endpoint**: `POST /api/tasks/extract`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "text": "Remind me to call John tomorrow at 5 PM."
  }
  ```
- **Response (Success - 200)**:
  ```json
  {
    "success": true,
    "data": {
      "task": "Call John",
      "date": "2026-08-15",
      "time": "17:00"
    }
  }
  ```
- **Response (Error - 400/500)**:
  ```json
  {
    "success": false,
    "error": "Input text cannot be empty."
  }
  ```
