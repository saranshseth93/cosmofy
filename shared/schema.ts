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

export const insertApodImageSchema = createInsertSchema(apodImages).omit({ id: true, createdAt: true });
export const insertIssPositionSchema = createInsertSchema(issPositions).omit({ id: true });
export const insertIssPassSchema = createInsertSchema(issPasses).omit({ id: true });
export const insertIssCrewSchema = createInsertSchema(issCrew).omit({ id: true });
export const insertAuroraForecastSchema = createInsertSchema(auroraForecasts).omit({ id: true });
export const insertAsteroidSchema = createInsertSchema(asteroids).omit({ id: true });
export const insertSpaceMissionSchema = createInsertSchema(spaceMissions).omit({ id: true });

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
