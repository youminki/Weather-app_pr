# Weather App (FSD + Vite + TypeScript)

This is a responsive Weather Application built with React, TypeScript, and Feature-Sliced Design (FSD) architecture.

## 🚀 How to Run

1. **Install Dependencies**

   ```bash
   npm install
   ```

2. **Start Development Server**

   ```bash
   npm run dev
   ```

3. **Open App**
   Visit [http://localhost:5173](http://localhost:5173).

## ✨ Features

- **Geolocation**: Automatically detects current location weather on startup.
- **Location Search**: Search for districts in South Korea (e.g., "Seoul", "Jongno-gu").
- **Favorites**: Add up to 6 locations to favorites. Saved to LocalStorage.
- **Alias Editing**: Customize the name of your favorite locations.
- **Detailed Weather**: View current temperature, highs/lows, and hourly forecast.
- **Responsive Design**: Glassmorphism UI optimized for both desktop and mobile.

## 🛠 Tech Stack

- **Framework**: React 19, Vite, TypeScript
- **Styling**: Tailwind CSS v4
- **State Management**: Tanstack Query (React Query) v5
- **Routing**: React Router DOM v7
- **Architecture**: Feature-Sliced Design (FSD)
- **Icons**: Lucide React

## 💡 Technical Decisions

### Feature-Sliced Design (FSD)

I chose FSD to ensure scalability and maintainability. The project is organized into layers:

- `app/`: Global providers and styles.
- `pages/`: Page composition (Home).
- `widgets/`: Complex standalone UI blocks (WeatherDashboard, FavoritesList).
- `features/`: User interactions (LocationSearch, FavoriteButton).
- `entities/`: Business objects (WeatherCard).
- `shared/`: Generic utilities and UI kit.

### Tanstack Query

Used for reliable server state management. It handles caching, loading states, and refetching logic efficiently.

### Tailwind CSS v4

Used for rapid styling with a modern utility-first approach. I implemented a custom Glassmorphism aesthetic.

### Mock Data Strategy

To ensure the app is testable without an immediate API key, I implemented a robust `weatherApi` that falls back to mock data if no key is provided.
To use real data, create an `.env` file with `VITE_OPENWEATHER_API_KEY`.
