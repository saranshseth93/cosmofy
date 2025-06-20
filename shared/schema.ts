import { pgTable, text, serial, integer, boolean, timestamp, real, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const apodImages = pgTable("apod_images", {
  id: serial("id").primaryKey(),
  date: text("date").notNull().unique(),
  title: text("title").notNull(),
  explanation: text("explanation").notNull(),
  url: text("url").notNull(),
  hdurl: text("hdurl"),
  mediaType: text("media_type").notNull(),
  copyright: text("copyright"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const issPositions = pgTable("iss_positions", {
  id: serial("id").primaryKey(),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  altitude: real("altitude").notNull(),
  velocity: real("velocity").notNull(),
  timestamp: timestamp("timestamp").notNull(),
});

export const issPasses = pgTable("iss_passes", {
  id: serial("id").primaryKey(),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  risetime: timestamp("risetime").notNull(),
  duration: integer("duration").notNull(),
  maxElevation: real("max_elevation"),
});

export const issCrew = pgTable("iss_crew", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  craft: text("craft").notNull(),
  role: text("role"),
  country: text("country"),
  launchDate: timestamp("launch_date"),
  daysInSpace: integer("days_in_space"),
});

export const auroraForecasts = pgTable("aurora_forecasts", {
  id: serial("id").primaryKey(),
  kpIndex: real("kp_index").notNull(),
  forecast: text("forecast").notNull(),
  timestamp: timestamp("timestamp").notNull(),
  latitude: real("latitude"),
  longitude: real("longitude"), 
  visibility: integer("visibility"),
});

export const asteroids = pgTable("asteroids", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  neoReferenceId: text("neo_reference_id").notNull().unique(),
  absoluteMagnitude: real("absolute_magnitude"),
  estimatedDiameter: jsonb("estimated_diameter"),
  isPotentiallyHazardous: boolean("is_potentially_hazardous").notNull(),
  closeApproachDate: timestamp("close_approach_date").notNull(),
  relativeVelocity: real("relative_velocity"),
  missDistance: real("miss_distance"),
  orbitingBody: text("orbiting_body"),
});

export const spaceMissions = pgTable("space_missions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull(),
  launchDate: timestamp("launch_date"),
  endDate: timestamp("end_date"),
  agency: text("agency"),
  missionType: text("mission_type"),
  destination: text("destination"),
  imageUrl: text("image_url"),
  websiteUrl: text("website_url"),
});

export const spaceWeatherAlerts = pgTable("space_weather_alerts", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // 'solar_flare', 'geomagnetic_storm', 'radio_blackout', 'radiation_storm'
  severity: text("severity").notNull(), // 'minor', 'moderate', 'strong', 'severe', 'extreme'
  title: text("title").notNull(),
  description: text("description").notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  peakTime: timestamp("peak_time"),
  scale: text("scale"), // G-scale for geomagnetic, S-scale for solar radiation, R-scale for radio blackouts
  scaleValue: integer("scale_value"), // 1-5 numeric value
  regions: text("regions").array(), // Affected geographical regions
  impacts: text("impacts").array(), // Potential impacts
  isActive: boolean("is_active").notNull().default(true),
  sourceRegion: text("source_region"), // Solar region for flares
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const spaceWeatherData = pgTable("space_weather_data", {
  id: serial("id").primaryKey(),
  timestamp: timestamp("timestamp").notNull(),
  solarWindSpeed: real("solar_wind_speed"), // km/s
  solarWindDensity: real("solar_wind_density"), // particles/cm³
  interplanetaryMagneticField: real("interplanetary_magnetic_field"), // nT
  kpIndex: real("kp_index").notNull(), // 0-9
  apIndex: real("ap_index"), // Daily equivalent of Kp
  dstIndex: real("dst_index"), // Disturbance storm time index
  f107Index: real("f10_7_index"), // Solar radio flux
  xrayFluxClass: text("xray_flux_class"), // A, B, C, M, X class
  protonFlux: real("proton_flux"), // particles/cm²/s
  electronFlux: real("electron_flux"), // particles/cm²/s
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertApodImageSchema = createInsertSchema(apodImages).omit({ id: true, createdAt: true });
export const insertIssPositionSchema = createInsertSchema(issPositions).omit({ id: true });
export const insertIssPassSchema = createInsertSchema(issPasses).omit({ id: true });
export const insertIssCrewSchema = createInsertSchema(issCrew).omit({ id: true });
export const insertAuroraForecastSchema = createInsertSchema(auroraForecasts).omit({ id: true });
export const insertAsteroidSchema = createInsertSchema(asteroids).omit({ id: true });
export const insertSpaceMissionSchema = createInsertSchema(spaceMissions).omit({ id: true });
export const insertSpaceWeatherAlertSchema = createInsertSchema(spaceWeatherAlerts).omit({ id: true, createdAt: true });
export const insertSpaceWeatherDataSchema = createInsertSchema(spaceWeatherData).omit({ id: true, createdAt: true });

export type ApodImage = typeof apodImages.$inferSelect;
export type InsertApodImage = z.infer<typeof insertApodImageSchema>;
export type IssPosition = typeof issPositions.$inferSelect;
export type InsertIssPosition = z.infer<typeof insertIssPositionSchema>;
export type IssPass = typeof issPasses.$inferSelect;
export type InsertIssPass = z.infer<typeof insertIssPassSchema>;
export type IssCrew = typeof issCrew.$inferSelect;
export type InsertIssCrew = z.infer<typeof insertIssCrewSchema>;
export type AuroraForecast = typeof auroraForecasts.$inferSelect;
export type InsertAuroraForecast = z.infer<typeof insertAuroraForecastSchema>;
export type Asteroid = typeof asteroids.$inferSelect;
export type InsertAsteroid = z.infer<typeof insertAsteroidSchema>;
export type SpaceMission = typeof spaceMissions.$inferSelect;
export type InsertSpaceMission = z.infer<typeof insertSpaceMissionSchema>;
export type SpaceWeatherAlert = typeof spaceWeatherAlerts.$inferSelect;
export type InsertSpaceWeatherAlert = z.infer<typeof insertSpaceWeatherAlertSchema>;
export type SpaceWeatherData = typeof spaceWeatherData.$inferSelect;
export type InsertSpaceWeatherData = z.infer<typeof insertSpaceWeatherDataSchema>;
