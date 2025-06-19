export interface ApodImage {
  id: number;
  date: string;
  title: string;
  explanation: string;
  url: string;
  hdurl?: string;
  mediaType: string;
  copyright?: string;
  createdAt: Date;
}

export interface IssPosition {
  id: number;
  latitude: number;
  longitude: number;
  altitude: number;
  velocity: number;
  timestamp: Date;
}

export interface IssPass {
  id: number;
  latitude: number;
  longitude: number;
  risetime: Date;
  duration: number;
  maxElevation?: number;
}

export interface IssCrew {
  id: number;
  name: string;
  craft: string;
  role?: string;
  country?: string;
  launchDate?: Date;
  daysInSpace?: number;
}

export interface AuroraForecast {
  id: number;
  kpIndex: number;
  forecast: string;
  timestamp: Date;
  latitude?: number;
  longitude?: number;
  visibility?: number;
}

export interface Asteroid {
  id: number;
  name: string;
  neoReferenceId: string;
  absoluteMagnitude?: number;
  estimatedDiameter?: any;
  isPotentiallyHazardous: boolean;
  closeApproachDate: Date;
  relativeVelocity?: number;
  missDistance?: number;
  orbitingBody?: string;
}

export interface SpaceMission {
  id: number;
  name: string;
  description: string;
  status: string;
  launchDate?: Date;
  endDate?: Date;
  agency?: string;
  missionType?: string;
  destination?: string;
  imageUrl?: string;
  websiteUrl?: string;
}

export interface GeolocationCoordinates {
  latitude: number;
  longitude: number;
}
