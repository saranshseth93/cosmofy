import { 
  ApodImage, InsertApodImage, IssPosition, InsertIssPosition, 
  IssPass, InsertIssPass, IssCrew, InsertIssCrew,
  AuroraForecast, InsertAuroraForecast, Asteroid, InsertAsteroid,
  SpaceMission, InsertSpaceMission, SpaceWeatherAlert, InsertSpaceWeatherAlert,
  SpaceWeatherData, InsertSpaceWeatherData
} from "@shared/schema";

export interface IStorage {
  // APOD methods
  getApodImages(limit?: number, offset?: number): Promise<ApodImage[]>;
  getApodImageByDate(date: string): Promise<ApodImage | undefined>;
  createApodImage(image: InsertApodImage): Promise<ApodImage>;
  
  // ISS methods
  getCurrentIssPosition(): Promise<IssPosition | undefined>;
  createIssPosition(position: InsertIssPosition): Promise<IssPosition>;
  getIssPasses(lat: number, lon: number): Promise<IssPass[]>;
  createIssPass(pass: InsertIssPass): Promise<IssPass>;
  getIssCrew(): Promise<IssCrew[]>;
  createIssCrew(crew: InsertIssCrew): Promise<IssCrew>;
  
  // Aurora methods
  getAuroraForecast(lat?: number, lon?: number): Promise<AuroraForecast[]>;
  createAuroraForecast(forecast: InsertAuroraForecast): Promise<AuroraForecast>;
  
  // Asteroid methods
  getUpcomingAsteroids(limit?: number): Promise<Asteroid[]>;
  createAsteroid(asteroid: InsertAsteroid): Promise<Asteroid>;
  
  // Space Mission methods
  getActiveMissions(): Promise<SpaceMission[]>;
  createSpaceMission(mission: InsertSpaceMission): Promise<SpaceMission>;
  
  // Space Weather methods
  getActiveSpaceWeatherAlerts(): Promise<SpaceWeatherAlert[]>;
  createSpaceWeatherAlert(alert: InsertSpaceWeatherAlert): Promise<SpaceWeatherAlert>;
  updateSpaceWeatherAlert(id: number, alert: Partial<SpaceWeatherAlert>): Promise<SpaceWeatherAlert>;
  getCurrentSpaceWeatherData(): Promise<SpaceWeatherData | undefined>;
  createSpaceWeatherData(data: InsertSpaceWeatherData): Promise<SpaceWeatherData>;
  getSpaceWeatherHistory(hours: number): Promise<SpaceWeatherData[]>;
}

export class MemStorage implements IStorage {
  private apodImages: Map<number, ApodImage> = new Map();
  private issPositions: Map<number, IssPosition> = new Map();
  private issPasses: Map<number, IssPass> = new Map();
  private issCrew: Map<number, IssCrew> = new Map();
  private auroraForecasts: Map<number, AuroraForecast> = new Map();
  private asteroids: Map<number, Asteroid> = new Map();
  private spaceMissions: Map<number, SpaceMission> = new Map();
  private spaceWeatherAlerts: Map<number, SpaceWeatherAlert> = new Map();
  private spaceWeatherData: Map<number, SpaceWeatherData> = new Map();
  private currentId: number = 1;

  // APOD methods
  async getApodImages(limit = 20, offset = 0): Promise<ApodImage[]> {
    const images = Array.from(this.apodImages.values())
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(offset, offset + limit);
    return images;
  }

  async getApodImageByDate(date: string): Promise<ApodImage | undefined> {
    return Array.from(this.apodImages.values()).find(img => img.date === date);
  }

  async createApodImage(insertImage: InsertApodImage): Promise<ApodImage> {
    const id = this.currentId++;
    const image: ApodImage = { 
      ...insertImage, 
      id, 
      createdAt: new Date() 
    };
    this.apodImages.set(id, image);
    return image;
  }

  // ISS methods
  async getCurrentIssPosition(): Promise<IssPosition | undefined> {
    const positions = Array.from(this.issPositions.values());
    return positions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];
  }

  async createIssPosition(insertPosition: InsertIssPosition): Promise<IssPosition> {
    const id = this.currentId++;
    const position: IssPosition = { ...insertPosition, id };
    this.issPositions.set(id, position);
    return position;
  }

  async getIssPasses(lat: number, lon: number): Promise<IssPass[]> {
    return Array.from(this.issPasses.values())
      .filter(pass => Math.abs(pass.latitude - lat) < 10 && Math.abs(pass.longitude - lon) < 10)
      .sort((a, b) => a.risetime.getTime() - b.risetime.getTime());
  }

  async createIssPass(insertPass: InsertIssPass): Promise<IssPass> {
    const id = this.currentId++;
    const pass: IssPass = { ...insertPass, id };
    this.issPasses.set(id, pass);
    return pass;
  }

  async getIssCrew(): Promise<IssCrew[]> {
    return Array.from(this.issCrew.values());
  }

  async createIssCrew(insertCrew: InsertIssCrew): Promise<IssCrew> {
    const id = this.currentId++;
    const crew: IssCrew = { ...insertCrew, id };
    this.issCrew.set(id, crew);
    return crew;
  }

  // Aurora methods
  async getAuroraForecast(lat?: number, lon?: number): Promise<AuroraForecast[]> {
    let forecasts = Array.from(this.auroraForecasts.values());
    if (lat !== undefined && lon !== undefined) {
      forecasts = forecasts.filter(forecast => 
        forecast.latitude && forecast.longitude &&
        Math.abs(forecast.latitude - lat) < 20 && 
        Math.abs(forecast.longitude - lon) < 20
      );
    }
    return forecasts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async createAuroraForecast(insertForecast: InsertAuroraForecast): Promise<AuroraForecast> {
    const id = this.currentId++;
    const forecast: AuroraForecast = { ...insertForecast, id };
    this.auroraForecasts.set(id, forecast);
    return forecast;
  }

  // Asteroid methods
  async getUpcomingAsteroids(limit = 10): Promise<Asteroid[]> {
    return Array.from(this.asteroids.values())
      .filter(asteroid => asteroid.closeApproachDate > new Date())
      .sort((a, b) => a.closeApproachDate.getTime() - b.closeApproachDate.getTime())
      .slice(0, limit);
  }

  async createAsteroid(insertAsteroid: InsertAsteroid): Promise<Asteroid> {
    const id = this.currentId++;
    const asteroid: Asteroid = { ...insertAsteroid, id };
    this.asteroids.set(id, asteroid);
    return asteroid;
  }

  // Space Mission methods
  async getActiveMissions(): Promise<SpaceMission[]> {
    return Array.from(this.spaceMissions.values())
      .filter(mission => !mission.endDate || mission.endDate > new Date())
      .sort((a, b) => (a.launchDate?.getTime() || 0) - (b.launchDate?.getTime() || 0));
  }

  async createSpaceMission(insertMission: InsertSpaceMission): Promise<SpaceMission> {
    const id = this.currentId++;
    const mission: SpaceMission = { ...insertMission, id };
    this.spaceMissions.set(id, mission);
    return mission;
  }

  // Space Weather Alert methods
  async getActiveSpaceWeatherAlerts(): Promise<SpaceWeatherAlert[]> {
    const activeAlerts = Array.from(this.spaceWeatherAlerts.values())
      .filter(alert => alert.isActive && (alert.endTime ? new Date(alert.endTime) > new Date() : true))
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
    return activeAlerts;
  }

  async createSpaceWeatherAlert(insertAlert: InsertSpaceWeatherAlert): Promise<SpaceWeatherAlert> {
    const id = this.currentId++;
    const alert: SpaceWeatherAlert = { 
      ...insertAlert, 
      id,
      createdAt: new Date()
    };
    this.spaceWeatherAlerts.set(id, alert);
    return alert;
  }

  async updateSpaceWeatherAlert(id: number, updates: Partial<SpaceWeatherAlert>): Promise<SpaceWeatherAlert> {
    const existingAlert = this.spaceWeatherAlerts.get(id);
    if (!existingAlert) {
      throw new Error(`Space weather alert with id ${id} not found`);
    }
    const updatedAlert = { ...existingAlert, ...updates };
    this.spaceWeatherAlerts.set(id, updatedAlert);
    return updatedAlert;
  }

  // Space Weather Data methods
  async getCurrentSpaceWeatherData(): Promise<SpaceWeatherData | undefined> {
    const allData = Array.from(this.spaceWeatherData.values())
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return allData[0];
  }

  async createSpaceWeatherData(insertData: InsertSpaceWeatherData): Promise<SpaceWeatherData> {
    const id = this.currentId++;
    const data: SpaceWeatherData = { 
      ...insertData, 
      id,
      createdAt: new Date()
    };
    this.spaceWeatherData.set(id, data);
    return data;
  }

  async getSpaceWeatherHistory(hours: number): Promise<SpaceWeatherData[]> {
    const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
    return Array.from(this.spaceWeatherData.values())
      .filter(data => new Date(data.timestamp) >= cutoffTime)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }
}

export const storage = new MemStorage();
