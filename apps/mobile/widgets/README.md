# GO Transit Live Widgets

This directory contains the native widget implementations for iOS and Android.

## Features

- Display arrivals and departures for a selected favorite station
- Auto-refresh every 15 minutes
- Deep link to open the app when tapped
- Theme support (light/dark mode)

## iOS Widget

The iOS widget is implemented using SwiftUI and WidgetKit.

### Setup

1. Open the project in Xcode
2. Add a Widget Extension target:
   - File → New → Target → Widget Extension
   - Name: GOTransitWidget
   - Include Configuration Intent: Yes

3. Copy the contents of `ios/GOTransitWidget/` to your widget extension

4. Update `app.json` to include the widget plugin:
```json
{
  "expo": {
    "plugins": [
      [
        "expo-build-properties",
        {
          "ios": {
            "deploymentTarget": "14.0"
          }
        }
      ]
    ]
  }
}
```

### Widget Sizes

- Small: Shows next arrival for selected station
- Medium: Shows next 3 arrivals
- Large: Shows next 5 arrivals with additional details

## Android Widget

The Android widget is implemented using Jetpack Glance.

### Setup

1. Add widget receiver to `AndroidManifest.xml`
2. Copy widget files from `android/widget/`
3. Update `app.json`:

```json
{
  "expo": {
    "android": {
      "permissions": [
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION",
        "INTERNET"
      ]
    }
  }
}
```

### Widget Sizes

- Small (2x2): Next arrival
- Medium (4x2): Next 3 arrivals
- Large (4x4): Next 5 arrivals with details

## Data Sharing

The widget shares data with the main app using:
- **iOS**: App Groups (shared UserDefaults)
- **Android**: SharedPreferences

### Data Structure

```json
{
  "selectedStationId": "string",
  "stationName": "string",
  "arrivals": [
    {
      "routeName": "string",
      "destination": "string",
      "arrivalTime": "string",
      "platform": "string",
      "status": "string"
    }
  ],
  "lastUpdated": "timestamp"
}
```

## Widget Configuration

Users can configure the widget to display a specific favorite station:
1. Long-press the widget
2. Tap "Edit Widget"
3. Select a favorite station from the list

## Development

### Testing

- **iOS**: Use the Widget simulator in Xcode
- **Android**: Use the Widget preview tool in Android Studio

### Refresh

Widgets automatically refresh:
- Every 15 minutes (background refresh)
- When the user opens the app
- When arrivals data is updated

## Building

### iOS
```bash
eas build --platform ios
```

### Android
```bash
eas build --platform android
```

## Notes

- Widgets require native code and cannot be fully implemented in JavaScript
- This implementation requires a development build (not Expo Go)
- API calls from widgets should be optimized for battery life
- Consider implementing a background task for data fetching
