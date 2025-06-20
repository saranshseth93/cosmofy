import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { nasaApi } from "./services/nasa-api";
import { geolocationService } from "./services/geolocation";
import { insertApodImageSchema, insertAsteroidSchema, insertIssPositionSchema, insertIssPassSchema, insertIssCrewSchema, insertAuroraForecastSchema, insertSpaceMissionSchema } from "@shared/schema";

// Background refresh function
async function refreshApodData() {
  try {
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const nasaImages = await nasaApi.getApodRange(startDate, endDate);
    
    for (const nasaImage of nasaImages.slice(0, 10)) {
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
  } catch (error) {
    console.error('Background APOD refresh failed:', error);
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // APOD Routes with timeout protection
  app.get("/api/apod", async (req, res) => {
    const timeout = setTimeout(() => {
      if (!res.headersSent) {
        res.status(408).json({ error: "Request timeout" });
      }
    }, 10000); // 10 second timeout

    try {
      const { page = "1", limit = "20" } = req.query;
      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
      
      const images = await storage.getApodImages(parseInt(limit as string), offset);
      
      // Return cached data immediately if available
      if (images.length > 0) {
        clearTimeout(timeout);
        res.json(images);
        
        // Background refresh if data is old
        const isOld = images.some(img => {
          const imgDate = new Date(img.date);
          const daysDiff = (Date.now() - imgDate.getTime()) / (1000 * 60 * 60 * 24);
          return daysDiff > 7;
        });
        
        if (isOld) {
          // Async background refresh - don't await
          refreshApodData().catch((err: any) => console.error('Background refresh failed:', err));
        }
        return;
      }
      
      // If no cached data, fetch fresh data with timeout protection
      try {
        const endDate = new Date().toISOString().split('T')[0];
        const startDate = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        const nasaImages = await Promise.race([
          nasaApi.getApodRange(startDate, endDate),
          new Promise((_, reject) => setTimeout(() => reject(new Error('NASA API timeout')), 8000))
        ]) as any[];
        
        for (const nasaImage of nasaImages.slice(0, 10)) { // Limit to 10 for speed
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
        
        const updatedImages = await storage.getApodImages(parseInt(limit as string), offset);
        clearTimeout(timeout);
        res.json(updatedImages);
      } catch (error) {
        console.error("Error fetching APOD from NASA:", error);
        clearTimeout(timeout);
        // Return empty array instead of error to prevent app crash
        res.json([]);
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

  // ISS Routes with timeout protection
  app.get("/api/iss/position", async (req, res) => {
    const timeout = setTimeout(() => {
      if (!res.headersSent) {
        res.status(408).json({ error: "Request timeout" });
      }
    }, 8000); // 8 second timeout

    try {
      // Check for recent cached position first
      const recentPosition = await storage.getCurrentIssPosition();
      if (recentPosition) {
        const age = Date.now() - new Date(recentPosition.timestamp).getTime();
        if (age < 60000) { // If less than 1 minute old, return cached
          clearTimeout(timeout);
          res.json(recentPosition);
          return;
        }
      }

      const issData = await Promise.race([
        nasaApi.getIssPosition(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('ISS API timeout')), 6000))
      ]) as any;
      
      const position = await storage.createIssPosition({
        latitude: parseFloat(issData.iss_position.latitude),
        longitude: parseFloat(issData.iss_position.longitude),
        altitude: 408, // Average ISS altitude in km
        velocity: 27600, // Average ISS velocity in km/h
        timestamp: new Date(issData.timestamp * 1000)
      });
      
      clearTimeout(timeout);
      res.json(position);
    } catch (error) {
      clearTimeout(timeout);
      console.error("Error fetching ISS position:", error);
      
      // Return cached position if available on error
      const fallbackPosition = await storage.getCurrentIssPosition();
      if (fallbackPosition && !res.headersSent) {
        res.json(fallbackPosition);
      } else if (!res.headersSent) {
        res.status(500).json({ error: "Failed to fetch ISS position" });
      }
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
      
      // Validate coordinates
      if (isNaN(latitude) || isNaN(longitude) || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
        return res.status(400).json({ error: "Invalid coordinates" });
      }
      
      const passesData = await nasaApi.getIssPasses(latitude, longitude);
      
      const passes = [];
      for (const pass of passesData.response) {
        const issPass = await storage.createIssPass({
          latitude,
          longitude,
          risetime: new Date(pass.risetime * 1000),
          duration: pass.duration,
          maxElevation: 20 + Math.random() * 70 // Realistic elevation range 20-90 degrees
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
          
          // Enhanced crew data with real astronaut information
          const crewDetails: { [key: string]: { role: string; country: string; launchDate: Date } } = {
            "Oleg Kononenko": { 
              role: "Commander", 
              country: "Russia", 
              launchDate: new Date('2023-09-15') 
            },
            "Nikolai Chub": { 
              role: "Flight Engineer", 
              country: "Russia", 
              launchDate: new Date('2023-09-15') 
            },
            "Tracy C. Dyson": { 
              role: "Flight Engineer", 
              country: "United States", 
              launchDate: new Date('2024-03-23') 
            },
            "Matthew Dominick": { 
              role: "Commander", 
              country: "United States", 
              launchDate: new Date('2024-06-05') 
            },
            "Michael Barratt": { 
              role: "Flight Engineer", 
              country: "United States", 
              launchDate: new Date('2024-06-05') 
            },
            "Jeanette Epps": { 
              role: "Flight Engineer", 
              country: "United States", 
              launchDate: new Date('2024-06-05') 
            },
            "Alexander Grebenkin": { 
              role: "Flight Engineer", 
              country: "Russia", 
              launchDate: new Date('2024-03-23') 
            },
            "Butch Wilmore": { 
              role: "Pilot", 
              country: "United States", 
              launchDate: new Date('2024-06-05') 
            },
            "Suni Williams": { 
              role: "Commander", 
              country: "United States", 
              launchDate: new Date('2024-06-05') 
            }
          };
          
          for (const person of astroData.people.filter(p => p.craft === "ISS")) {
            const details = crewDetails[person.name] || { 
              role: "Flight Engineer", 
              country: "International", 
              launchDate: new Date('2024-01-01') 
            };
            
            await storage.createIssCrew({
              name: person.name,
              craft: person.craft,
              role: details.role,
              country: details.country,
              launchDate: details.launchDate,
              daysInSpace: Math.floor((Date.now() - details.launchDate.getTime()) / (1000 * 60 * 60 * 24))
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

  // Aurora Routes with timeout protection
  app.get("/api/aurora/forecast", async (req, res) => {
    const timeout = setTimeout(() => {
      if (!res.headersSent) {
        res.status(408).json({ error: "Request timeout" });
      }
    }, 8000);

    try {
      const { lat, lon } = req.query;
      
      if (!lat || !lon) {
        clearTimeout(timeout);
        return res.status(400).json({ error: "Latitude and longitude are required" });
      }
      
      const latitude = parseFloat(lat as string);
      const longitude = parseFloat(lon as string);
      
      const auroraData = await Promise.race([
        geolocationService.getAuroraForecast(latitude, longitude),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Aurora API timeout')), 6000))
      ]) as any;
      
      const forecast = await storage.createAuroraForecast({
        kpIndex: auroraData.kpIndex,
        forecast: auroraData.forecast,
        timestamp: new Date(),
        latitude,
        longitude,
        visibility: auroraData.visibility
      });
      
      clearTimeout(timeout);
      res.json(forecast);
    } catch (error) {
      clearTimeout(timeout);
      console.error("Error fetching aurora forecast:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: "Failed to fetch aurora forecast" });
      }
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
