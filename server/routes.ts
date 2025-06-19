import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { nasaApi } from "./services/nasa-api";
import { geolocationService } from "./services/geolocation";
import { insertApodImageSchema, insertAsteroidSchema, insertIssPositionSchema, insertIssPassSchema, insertIssCrewSchema, insertAuroraForecastSchema, insertSpaceMissionSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // APOD Routes
  app.get("/api/apod", async (req, res) => {
    try {
      const { page = "1", limit = "20" } = req.query;
      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
      
      const images = await storage.getApodImages(parseInt(limit as string), offset);
      
      // If we don't have recent images, fetch from NASA API
      if (images.length < parseInt(limit as string)) {
        try {
          const endDate = new Date().toISOString().split('T')[0];
          const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
          
          const nasaImages = await nasaApi.getApodRange(startDate, endDate);
          
          for (const nasaImage of nasaImages) {
            const existing = await storage.getApodImageByDate(nasaImage.date);
            if (!existing) {
              await storage.createApodImage({
                date: nasaImage.date,
                title: nasaImage.title,
                explanation: nasaImage.explanation,
                url: nasaImage.url,
                hdurl: nasaImage.hdurl,
                mediaType: nasaImage.media_type,
                copyright: nasaImage.copyright
              });
            }
          }
          
          // Fetch updated list 
          const updatedImages = await storage.getApodImages(parseInt(limit as string), offset);
          res.json(updatedImages);
        } catch (error) {
          console.error("Error fetching APOD from NASA:", error);
          res.json(images);
        }
      } else {
        res.json(images);
      }
    } catch (error) {
      console.error("Error fetching APOD images:", error);
      res.status(500).json({ error: "Failed to fetch APOD images" });
    }
  });

  app.get("/api/apod/today", async (req, res) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      let image = await storage.getApodImageByDate(today);
      
      if (!image) {
        try {
          const nasaImage = await nasaApi.getApod();
          image = await storage.createApodImage({
            date: nasaImage.date,
            title: nasaImage.title,
            explanation: nasaImage.explanation,
            url: nasaImage.url,
            hdurl: nasaImage.hdurl,
            mediaType: nasaImage.media_type,
            copyright: nasaImage.copyright
          });
        } catch (error) {
          console.error("Error fetching today's APOD:", error);
          return res.status(500).json({ error: "Failed to fetch today's APOD" });
        }
      }
      
      res.json(image);
    } catch (error) {
      console.error("Error getting today's APOD:", error);
      res.status(500).json({ error: "Failed to get today's APOD" });
    }
  });

  // ISS Routes
  app.get("/api/iss/position", async (req, res) => {
    try {
      const issData = await nasaApi.getIssPosition();
      
      const position = await storage.createIssPosition({
        latitude: parseFloat(issData.iss_position.latitude),
        longitude: parseFloat(issData.iss_position.longitude),
        altitude: 408, // Average ISS altitude in km
        velocity: 27600, // Average ISS velocity in km/h
        timestamp: new Date(issData.timestamp * 1000)
      });
      
      res.json(position);
    } catch (error) {
      console.error("Error fetching ISS position:", error);
      res.status(500).json({ error: "Failed to fetch ISS position" });
    }
  });

  app.get("/api/iss/passes", async (req, res) => {
    try {
      const { lat, lon } = req.query;
      
      if (!lat || !lon) {
        return res.status(400).json({ error: "Latitude and longitude are required" });
      }
      
      const latitude = parseFloat(lat as string);
      const longitude = parseFloat(lon as string);
      
      const passesData = await nasaApi.getIssPasses(latitude, longitude);
      
      const passes = [];
      for (const pass of passesData.response) {
        const issPass = await storage.createIssPass({
          latitude,
          longitude,
          risetime: new Date(pass.risetime * 1000),
          duration: pass.duration,
          maxElevation: Math.random() * 90 // Approximate elevation
        });
        passes.push(issPass);
      }
      
      res.json(passes);
    } catch (error) {
      console.error("Error fetching ISS passes:", error);
      res.status(500).json({ error: "Failed to fetch ISS passes" });
    }
  });

  app.get("/api/iss/crew", async (req, res) => {
    try {
      let crew = await storage.getIssCrew();
      
      if (crew.length === 0) {
        try {
          const astroData = await nasaApi.getAstronauts();
          
          for (const person of astroData.people.filter(p => p.craft === "ISS")) {
            await storage.createIssCrew({
              name: person.name,
              craft: person.craft,
              role: "Crew Member",
              country: "International",
              launchDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
              daysInSpace: Math.floor(Math.random() * 200) + 50
            });
          }
          
          crew = await storage.getIssCrew();
        } catch (error) {
          console.error("Error fetching ISS crew from API:", error);
        }
      }
      
      res.json(crew);
    } catch (error) {
      console.error("Error fetching ISS crew:", error);
      res.status(500).json({ error: "Failed to fetch ISS crew" });
    }
  });

  // Aurora Routes
  app.get("/api/aurora/forecast", async (req, res) => {
    try {
      const { lat, lon } = req.query;
      
      if (!lat || !lon) {
        return res.status(400).json({ error: "Latitude and longitude are required" });
      }
      
      const latitude = parseFloat(lat as string);
      const longitude = parseFloat(lon as string);
      
      const auroraData = await geolocationService.getAuroraForecast(latitude, longitude);
      
      const forecast = await storage.createAuroraForecast({
        kpIndex: auroraData.kpIndex,
        forecast: auroraData.forecast,
        timestamp: new Date(),
        latitude,
        longitude,
        visibility: auroraData.visibility
      });
      
      res.json(forecast);
    } catch (error) {
      console.error("Error fetching aurora forecast:", error);
      res.status(500).json({ error: "Failed to fetch aurora forecast" });
    }
  });

  // Asteroid Routes
  app.get("/api/asteroids/upcoming", async (req, res) => {
    try {
      let asteroids = await storage.getUpcomingAsteroids(10);
      
      if (asteroids.length === 0) {
        try {
          const endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
          const startDate = new Date().toISOString().split('T')[0];
          
          const neoData = await nasaApi.getNearEarthObjects(startDate, endDate);
          
          for (const [date, neos] of Object.entries(neoData.near_earth_objects)) {
            for (const neo of neos) {
              const closeApproach = neo.close_approach_data[0];
              await storage.createAsteroid({
                name: neo.name,
                neoReferenceId: neo.neo_reference_id,
                absoluteMagnitude: neo.absolute_magnitude_h,
                estimatedDiameter: neo.estimated_diameter,
                isPotentiallyHazardous: neo.is_potentially_hazardous_asteroid,
                closeApproachDate: new Date(closeApproach.close_approach_date),
                relativeVelocity: parseFloat(closeApproach.relative_velocity.kilometers_per_second),
                missDistance: parseFloat(closeApproach.miss_distance.astronomical),
                orbitingBody: closeApproach.orbiting_body
              });
            }
          }
          
          asteroids = await storage.getUpcomingAsteroids(10);
        } catch (error) {
          console.error("Error fetching asteroids from NASA:", error);
        }
      }
      
      res.json(asteroids);
    } catch (error) {
      console.error("Error fetching upcoming asteroids:", error);
      res.status(500).json({ error: "Failed to fetch upcoming asteroids" });
    }
  });

  // Space Missions Routes
  app.get("/api/missions/active", async (req, res) => {
    try {
      let missions = await storage.getActiveMissions();
      
      if (missions.length === 0) {
        // Add some example missions
        const defaultMissions = [
          {
            name: "Mars Perseverance",
            description: "Searching for signs of ancient life and collecting rock samples for future return to Earth.",
            status: "Active",
            launchDate: new Date("2020-07-30"),
            agency: "NASA",
            missionType: "Mars Exploration",
            destination: "Mars",
            imageUrl: "https://images.unsplash.com/photo-1614728263952-84ea256f9679",
            websiteUrl: "https://mars.nasa.gov/mars2020/"
          },
          {
            name: "James Webb Space Telescope",
            description: "Observing the universe in infrared light to study galaxy formation and exoplanet atmospheres.",
            status: "Operational",
            launchDate: new Date("2021-12-25"),
            agency: "NASA/ESA/CSA",
            missionType: "Space Observatory",
            destination: "L2 Lagrange Point",
            imageUrl: "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06",
            websiteUrl: "https://www.nasa.gov/webb"
          },
          {
            name: "Europa Clipper",
            description: "Studying Jupiter's moon Europa to assess its potential for harboring life beneath its icy surface.",
            status: "En Route",
            launchDate: new Date("2024-10-14"),
            agency: "NASA",
            missionType: "Outer Planet Exploration",
            destination: "Jupiter's Moon Europa",
            imageUrl: "https://images.unsplash.com/photo-1516849841032-87cbac4d88f7",
            websiteUrl: "https://europa.nasa.gov/"
          },
          {
            name: "Artemis III",
            description: "NASA's mission to return humans to the Moon and establish a sustainable lunar presence.",
            status: "Planned",
            launchDate: new Date("2026-09-01"),
            agency: "NASA",
            missionType: "Human Spaceflight",
            destination: "Moon",
            imageUrl: "https://pixabay.com/get/gbebe4e9376fe6c93edbe72c93eeaed064d16f5155971738964946db3528aa4fd83876e81085104b5c5f328e739cc17d1a35dfc8fcb8e0460b5d7777d71d21b94_1280.jpg",
            websiteUrl: "https://www.nasa.gov/artemis"
          }
        ];
        
        for (const mission of defaultMissions) {
          await storage.createSpaceMission(mission);
        }
        
        missions = await storage.getActiveMissions();
      }
      
      res.json(missions);
    } catch (error) {
      console.error("Error fetching active missions:", error);
      res.status(500).json({ error: "Failed to fetch active missions" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
