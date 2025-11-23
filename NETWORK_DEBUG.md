# Network Connectivity Debugging Guide

## Issue: Stations Not Appearing on Map

### Root Cause
The application cannot reach the Metrolinx API at `api.openmetrolinx.com` due to DNS/network connectivity issues.

### Error Details
```
Error: getaddrinfo EAI_AGAIN api.openmetrolinx.com
Code: EAI_AGAIN
Syscall: getaddrinfo
```

This error indicates the DNS resolver is temporarily unable to resolve the hostname.

## Troubleshooting Steps

### 1. Verify Internet Connectivity
```bash
# Test if you can reach the Metrolinx API
curl -I https://api.openmetrolinx.com/OpenDataAPI/Help

# Test DNS resolution
nslookup api.openmetrolinx.com

# Or use dig
dig api.openmetrolinx.com
```

### 2. Check API Key Configuration
Ensure your `.env.local` file contains:
```bash
NX_EXPO_METROLINX_API_KEY=your_api_key_here
```

To get an API key:
1. Visit https://api.openmetrolinx.com/OpenDataAPI/Help/Registration/en
2. Register for a free API key
3. Add it to `.env.local`

### 3. Test the API Endpoint Directly
```bash
# Replace YOUR_KEY with your actual API key
curl "https://api.openmetrolinx.com/OpenDataAPI/api/V1/stop/all?key=YOUR_KEY"
```

### 4. Check Firewall/Proxy Settings
If you're behind a corporate firewall or proxy:
- Configure proxy settings in your environment
- Check with your network administrator about accessing external APIs

### 5. Alternative: Use Mock Data (Development Only)
If you need to develop without API access, you can add mock data to the stops endpoint.

## Expected API Response
When working correctly, the `/api/stops` endpoint should return:
```json
[
  {
    "LocationCode": "UN",
    "LocationName": "Union Station",
    "LocationType": "Station",
    "PublicStopID": "01234"
  },
  // ... more stops
]
```

## Monitoring
The application now includes enhanced logging:
- Server console will show DNS/network errors with suggestions
- Browser console will warn when no stops are received
- Map will display a user-friendly error message

## Production Deployment
Ensure your production environment:
- ✅ Has outbound internet access to api.openmetrolinx.com
- ✅ Has proper DNS configuration
- ✅ Has the API key configured in environment variables
- ✅ Allows HTTPS connections to external APIs
