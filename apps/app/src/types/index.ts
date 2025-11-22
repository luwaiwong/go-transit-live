export type VehicleType = 'station' | 'train' | 'bus';

export interface Position {
  latitude: number;
  longitude: number;
}

export interface Stop {
  ZoneCode: string;
  StreetNumber: string;
  Intersection: string;
  City: string;
  StreetName: string;
  Code: string;
  StopName: string;
  StopNameFr: string;
  IsBus: boolean;
  IsTrain: boolean;
  Longitude: string;
  Latitude: string;
  DrivingDirections: string | null;
  DrivingDirectionsFr: string | null;
  BoardingInfo: string | null;
  BoardingInfoFr: string | null;
  TicketSales: string | null;
  TicketSalesFr: string | null;
  Facilities: Array<{
    Code: string;
    Description: string;
    DescriptionFr: string;
  }>;
  Parkings: any[];
  Place: {
    Code: string;
    Name: string;
    Longitude: string;
    Latitude: string;
    Radius: string;
    Stops: {
      Stop: Array<{
        Code: string;
        Name: string;
        NameFr: string;
      }>;
    };
  };
}

export interface StopDetails {
  Metadata: {
    TimeStamp: string;
    ErrorCode: string;
    ErrorMessage: string;
  };
  Stop: Stop;
}

export interface StationData {
  [key: string]: StopDetails;
}

export interface MapMarker {
  id: string;
  name: string;
  position: Position;
  type: VehicleType;
}

export interface VehiclePosition {
  latitude: number;
  longitude: number;
  bearing?: number;
  speed?: number;
}

export interface Vehicle {
  id: string;
  label: string;
  position: VehiclePosition;
  stopId: string;
  type: VehicleType;
}
