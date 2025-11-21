# GO Transit Live

Real-time tracking of Ontario GO Transit trains and buses with multiple platform support.

## Project Structure

This repository contains three main applications:

### 1. Python/Dash Web App (Original)
Located in the root directory - A Python-based web application using Dash and Plotly.

### 2. Next.js API
Located in `src/` - API endpoints for serving station and vehicle data.

### 3. React Native Mobile App
Located in `apps/app/` - Cross-platform mobile app for iOS and Android.

## Features

- 🚆 **Live Train Tracking**: Real-time train positions
- 🚌 **Bus Tracking**: Live bus locations
- 📍 **Station Information**: Complete station details and locations
- 🗺️ **Interactive Map**: Zoom, pan, and explore the transit system
- 🎨 **Theme Support**: Light, dark, and auto themes (mobile)
- 📱 **Cross-Platform**: Web and mobile support

## Quick Start

### Python/Dash Web App

1. Install Python dependencies:
```bash
pip install dash plotly pandas requests
```

2. Create `config.py` with your API key:
```python
API_KEY = "your_api_key_here"
```

3. Fetch station data:
```bash
python fetch_stations.py
```

4. Run the web app:
```bash
python render_map.py
```

5. Open http://127.0.0.1:8050/

### Next.js API

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. API endpoints will be available at:
- http://localhost:3000/api/stop-details/:id
- http://localhost:3000/api/vehicle-positions

### React Native Mobile App

1. Navigate to the app directory:
```bash
cd apps/app
```

2. Install dependencies:
```bash
npm install
```

3. Start Expo:
```bash
npm start
```

4. Scan the QR code with Expo Go app (iOS/Android)

For more details, see [apps/app/README.md](apps/app/README.md)

## Data Sources

This project uses the Metrolinx Open Data API to fetch real-time GO Transit information.

- **API Documentation**: https://www.metrolinx.com/en/about-us/open-data
- **Station Details**: Cached in `station_details.json`
- **Vehicle Positions**: Real-time GTFS feed

## Development

### Project Layout

```
go-transit-live/
├── apps/
│   └── app/              # React Native mobile app
│       ├── app/          # Expo Router pages
│       ├── src/          # Source code
│       └── assets/       # Images and icons
├── src/
│   └── app/
│       └── api/          # Next.js API routes
├── fetch_stations.py     # Station data fetcher
├── render_map.py         # Dash web application
└── station_details.json  # Cached station data
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT