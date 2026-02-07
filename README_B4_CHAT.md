# B-4 Chat Setup Guide

## Overview
The "Chat with B-4" chatbot is a branded AI assistant for the Caiden's Courage site, providing SEL support and site navigation help.

## Files Created

### Frontend
- **`src/components/B4Chat.tsx`** - Main chat component with floating button and drawer UI

### Backend
- **`server.js`** - Express server with OpenAI integration for chat API

### Configuration
- **`.env.example`** - Environment variables template

## Setup Instructions

### 1. Install Dependencies

```bash
npm install express openai dotenv
# or
yarn add express openai dotenv
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```env
OPENAI_API_KEY=your_openai_api_key_here
PORT=3001
```

### 3. Update package.json Scripts

Add a script to run the backend server:

```json
"scripts": {
  "start": "DISABLE_ESLINT_PLUGIN=true react-scripts start",
  "server": "node server.js",
  "dev": "concurrently \"npm run start\" \"npm run server\"",
  "build": "react-scripts build",
  "test": "react-scripts test"
}
```

For concurrent execution, install concurrently:
```bash
npm install --save-dev concurrently
```

### 4. Run the Application

**Option A: Run separately (recommended for development)**
- Terminal 1: `npm start` (React app on port 3000)
- Terminal 2: `npm run server` (Express API on port 3001)

**Option B: Run together**
- `npm run dev` (requires concurrently)

### 5. Production Deployment

For production, you'll need to:
1. Build the React app: `npm run build`
2. Deploy the Express server (server.js) to your hosting platform
3. Ensure environment variables are set on your hosting platform
4. Configure your hosting to serve the built React app and handle `/api/*` routes

## Component Details

### B4Chat Component
- **Location**: `src/components/B4Chat.tsx`
- **Global**: Added to `App.tsx` so it appears on all pages
- **Features**:
  - Floating button (bottom-right)
  - Slide-up drawer (mobile: full-screen, desktop: 420px panel)
  - Message bubbles with brand styling
  - Loading states
  - Auto-scroll to newest message
  - Keyboard support (Enter to send)

### API Endpoint
- **Route**: `POST /api/b4-chat`
- **Request**: `{ messages: [{ role: "user"|"assistant", content: string }] }`
- **Response**: `{ reply: string }`

### System Prompt
The B-4 chatbot is configured with a warm, encouraging personality that:
- Uses kid-friendly, non-judgmental language
- Guides users through the B-4 Reset framework
- Suggests resources and tools
- Includes safety protocols for crisis situations

## Styling

Uses Caiden's Courage brand colors:
- **Navy** (`#243E70`) - Primary text and backgrounds
- **Golden** (`#F0CE6E`) - Accents and user messages
- **Rounded corners** - `rounded-full`, `rounded-2xl`
- **Soft shadows** - Brand-appropriate elevation

## Tailwind Classes Used

- `fixed bottom-6 right-6` - Floating button position
- `bg-golden-500`, `bg-navy-500` - Brand colors
- `rounded-full`, `rounded-2xl` - Rounded corners
- `shadow-lg`, `shadow-xl` - Soft shadows
- `transition-all duration-200` - Smooth animations
- `z-50`, `z-40` - Layering
- Responsive: `hidden sm:inline`, `sm:rounded-l-2xl`

## Notes

- The chat component is fully self-contained and doesn't require any page-specific integration
- The API endpoint can be replaced with any backend service that matches the expected format
- Safety features are built into the system prompt to handle crisis situations appropriately
