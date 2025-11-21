
// Metrolinx API Data Types
// Based on the Open API Data Catalogue

export interface Stop {
    LocationCode: string;
    LocationName: string;
    LocationType: string;
    PublicStopID: string;
}

export interface Line {
    Code: string;
    Name: string;
    IsBus: boolean;
    IsTrain: boolean;
}

export interface StopDetails extends Stop {
    ZoneCode: string;
    StreetNumber: string;
    Intersection: string;
    City: string;
    StreetName: string;
    StopName: string;
    StopNameFr: string;
    IsBus: boolean;
    IsTrain: boolean;
    Longitude: string;
    Latitude: string;
    DrivingDirections: string;
    DrivingDirectionsFr: string;
    BoardingInfo: string;
    BoardingInfoFr: string;
    TicketSales: string;
    TicketSalesFr: string;
    Facilities: Facility[];
    Parking: Parking[];
    Places: Place[];
    Stops: Stop[];
}

export interface Facility {
    Code: string;
    Description: string;
    DescriptionFr: string;
}

export interface Parking {
    Name: string;
    NameFr: string;
    ParkSpots: number;
    Type: string;
}

export interface Place {
    Code: string;
    Name: string;
    Longitude: string;
    Latitude: string;
    Radius: number;
}

export interface NextService {
    StopCode: string;
    LineCode: string;
    LineName: string;
    ServiceType: 'T' | 'B';
    DirectionCode: string;
    DirectionName: string;
    TripOrder: number;
    TripNumber: string;
    UpdateTime: string;
    Status: string;
    Latitude: number;
    Longitude: number;
    ScheduledDepartureTime: string;
    ComputedDepartureTime: string;
    DepartureStatus: string;
    ScheduledPlatform: string;
    ActualPlatform: string;
}

export interface NextServiceResponse {
    Lines: NextService[];
}

export interface Journey {
    From: string;
    To: string;
    Time: string;
    Date: string;
    Services: Service[];
}

export interface Service {
    Colour: string;
    Direction: 'N' | 'S' | 'E' | 'W';
    Code: string;
    StartTime: string;
    EndTime: string;
    Duration: string;
    Accessible: 'R' | 'B' | 'RB';
    StartSortTime: string;
    EndSortTime: string;
    TripHash: string;
    TransferCount: number;
    Trips: {
        trip: Trip[];
    };
}

export interface Trip {
    Number: string;
    Display: string;
    Line: string;
    Direction: 'N' | 'S' | 'E' | 'W';
    LineVariant: string;
    Type: 'T' | 'B';
}

export interface UIServiceInfo {
    LineCode: string;
    StartCode: string;
    StartName: string;
    EndCode: string;
    LineName: string;
    EndName: string;
    DepartureTime: string;
    Platform: string;
    Status: string;
    DepartureChanged: boolean;
    PlatformChanged: boolean;
}

// GTFS Real-time Vehicle Position Types
export interface VehiclePosition {
    id: string;
    vehicle: {
        trip?: {
            tripId: string;
            routeId: string;
            directionId?: number;
            startTime?: string;
            startDate?: string;
            scheduleRelationship?: number;
        };
        vehicle?: {
            id: string;
            label?: string;
            licensePlate?: string;
        };
        position?: {
            latitude: number;
            longitude: number;
            bearing?: number;
            odometer?: number;
            speed?: number;
        };
        currentStopSequence?: number;
        stopId?: string;
        currentStatus?: number;
        timestamp?: number;
        congestionLevel?: number;
        occupancyStatus?: number;
    };
}

export interface VehiclePositionResponse {
    header: {
        gtfsRealtimeVersion: string;
        incrementality: number;
        timestamp: number;
    };
    entity: VehiclePosition[];
}
