# GO Transit Live - Mobile App

React Native Expo app for tracking GO Transit trains and buses in real-time.

## Features

- 🗺️ **Live Map**: Real-time tracking of GO Transit vehicles
- 🎨 **Theme System**: Light, dark, and auto themes
- 📱 **Bottom Panel**: Sliding panel for detailed information
- 🚆 **Train Tracking**: View live train positions
- 🚌 **Bus Tracking**: View live bus positions
- 📍 **Station Locations**: View all GO Transit stations

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Run on your device:
- For iOS: `npm run ios`
- For Android: `npm run android`
- For web: `npm run web`

## Requirements

- Node.js 18+
- Expo CLI
- iOS Simulator (for iOS development)
- Android Emulator or device (for Android development)

## Architecture

```
apps/app/
├── app/                    # Expo Router pages
│   ├── _layout.tsx        # Root layout with providers
│   └── index.tsx          # Home screen with map
├── src/
│   ├── components/        # Reusable components
│   │   ├── LiveMap.tsx   # Map component
│   │   └── BottomPanel.tsx # Bottom sheet panel
│   ├── contexts/          # React contexts
│   │   └── ThemeContext.tsx
│   ├── services/          # API and data services
│   │   └── api.ts
│   ├── theme/             # Theme configuration
│   │   ├── colors.ts
│   │   ├── spacing.ts
│   │   └── index.ts
│   └── types/             # TypeScript types
│       └── index.ts
├── app.json              # Expo configuration
├── package.json
└── tsconfig.json
```

## API Integration

The app connects to the Next.js API at `http://localhost:3000/api`. Make sure the API server is running before starting the mobile app.

Endpoints used:
- `/api/stop-details/:id` - Get station details
- `/api/vehicle-positions` - Get live vehicle positions

## Customization

### Theme Colors

Edit `src/theme/colors.ts` to customize the color scheme.

### Map Configuration

Edit the `DEFAULT_CENTER` and `DEFAULT_DELTA` constants in `src/components/LiveMap.tsx` to change the initial map view.

### Update Interval

The map updates every 1 second by default. Change the interval in `src/components/LiveMap.tsx`:

```typescript
const interval = setInterval(() => {
  updateVehiclePositions();
}, 1000); // Change this value (in milliseconds)
```

## Building for Production

### iOS
```bash
eas build --platform ios
```

### Android
```bash
eas build --platform android
```

## License

MIT
