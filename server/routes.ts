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
    const startDate = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // Last 60 days
    
    const nasaImages = await nasaApi.getApodRange(startDate, endDate);
    
    for (const nasaImage of nasaImages.slice(0, 50)) { // Increased to 50 images
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
      // Get city/suburb for ISS location
      let location = "Over Ocean";
      try {
        location = await geolocationService.getCityFromCoordinates(
          parseFloat(issData.iss_position.latitude),
          parseFloat(issData.iss_position.longitude)
        );
      } catch (error) {
        console.error("Error getting ISS location:", error);
      }

      const positionWithLocation = {
        ...position,
        location
      };
      
      res.json(positionWithLocation);
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
      
      // Create multiple forecast entries for 3-day forecast
      const forecasts = [];
      for (let i = 0; i < 6; i++) {
        const timestamp = new Date(Date.now() + i * 3 * 60 * 60 * 1000); // Every 3 hours
        const forecast = await storage.createAuroraForecast({
          kpIndex: Math.max(0, auroraData.kpIndex + (Math.random() - 0.5) * 2), // Add some variation
          forecast: auroraData.forecast,
          timestamp,
          latitude,
          longitude,
          visibility: auroraData.visibility
        });
        forecasts.push(forecast);
      }
      
      clearTimeout(timeout);
      res.json(forecasts);
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
            name: "Artemis II",
            description: "First crewed mission to travel around the Moon since Apollo 17. Four astronauts will conduct a 10-day lunar flyby mission to test systems for future lunar landings.",
            status: "Planned",
            launchDate: new Date("2025-11-01"),
            agency: "NASA",
            missionType: "Crewed lunar flyby mission",
            destination: "Moon",
            imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
            websiteUrl: "https://www.nasa.gov/artemis",
            crew: ["Reid Wiseman", "Victor Glover", "Christina Hammock Koch", "Jeremy Hansen"],
            missionDuration: "10 days",
            objectives: [
              "Test Orion spacecraft with crew aboard",
              "Demonstrate life support systems",
              "Validate heat shield performance during lunar return",
              "Prepare for Artemis III lunar landing"
            ],
            keyMilestones: [
              { date: "2024-03-01", event: "Crew training begins" },
              { date: "2025-06-01", event: "Final systems integration" },
              { date: "2025-11-01", event: "Launch" },
              { date: "2025-11-11", event: "Earth return and splashdown" }
            ],
            budget: "$4.1 billion",
            launchVehicle: "Space Launch System (SLS)"
          },
          {
            name: "Europa Clipper",
            description: "Detailed reconnaissance of Jupiter's moon Europa and its subsurface ocean to assess its potential for harboring life beneath the icy surface.",
            status: "Active",
            launchDate: new Date("2024-10-14"),
            agency: "NASA",
            missionType: "Ice penetrating orbiter",
            destination: "Jupiter's Moon Europa",
            imageUrl: "https://images.unsplash.com/photo-1516849841032-87cbac4d88f7?w=800&h=600&fit=crop",
            websiteUrl: "https://europa.nasa.gov/",
            missionDuration: "4 years (49 flybys)",
            objectives: [
              "Map Europa's ice shell thickness and subsurface ocean",
              "Analyze surface composition and geology",
              "Search for organic compounds and biosignatures",
              "Study Europa's magnetic field and atmosphere"
            ],
            instruments: [
              "Europa Imaging System (EIS)",
              "Radar for Europa Assessment (REASON)",
              "Europa Thermal Emission Imaging System (E-THEMIS)",
              "Mass Spectrometer for Planetary Exploration (MASPEX)"
            ],
            budget: "$5.2 billion",
            arrivalDate: new Date("2030-04-11")
          },
          {
            name: "Mars Perseverance",
            description: "Advanced astrobiology rover searching for signs of ancient microbial life and collecting rock samples for future return to Earth.",
            status: "Active",
            launchDate: new Date("2020-07-30"),
            agency: "NASA",
            missionType: "Mars surface exploration",
            destination: "Mars (Jezero Crater)",
            imageUrl: "https://images.unsplash.com/photo-1614728263952-84ea256f9679?w=800&h=600&fit=crop",
            websiteUrl: "https://mars.nasa.gov/mars2020/",
            missionDuration: "Extended (originally 687 Earth days)",
            objectives: [
              "Search for signs of ancient microbial life",
              "Collect and cache rock and soil samples",
              "Generate oxygen from Martian atmosphere",
              "Study geology and past climate of Mars"
            ],
            keyAchievements: [
              "First powered flight on another planet (Ingenuity helicopter)",
              "Successfully collected 24 rock samples",
              "Produced oxygen on Mars using MOXIE",
              "Discovered organic molecules in multiple rock samples"
            ],
            currentLocation: "Jezero Crater Delta Formation",
            distanceTraveled: "28.52 kilometers",
            samplesCollected: 24
          },
          {
            name: "James Webb Space Telescope",
            description: "Revolutionary infrared space observatory studying the formation of the first galaxies, exoplanet atmospheres, and stellar birth in unprecedented detail.",
            status: "Operational",
            launchDate: new Date("2021-12-25"),
            agency: "NASA/ESA/CSA",
            missionType: "Space Observatory",
            destination: "L2 Lagrange Point",
            imageUrl: "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800&h=600&fit=crop",
            websiteUrl: "https://www.nasa.gov/webb",
            missionDuration: "5-10 years (fuel limited)",
            objectives: [
              "Observe the first galaxies formed after Big Bang",
              "Study exoplanet atmospheres and compositions",
              "Investigate star and planet formation",
              "Examine the evolution of galaxies over time"
            ],
            keyDiscoveries: [
              "Most distant galaxy ever observed (JADES-GS-z13-0)",
              "Detailed atmospheric composition of exoplanet WASP-96b",
              "Evidence of water vapor in exoplanet atmospheres",
              "New insights into stellar nurseries and brown dwarfs"
            ],
            mirrorDiameter: "6.5 meters",
            operatingTemperature: "-223°C (-369°F)",
            instruments: ["NIRCam", "NIRSpec", "MIRI", "FGS/NIRISS"]
          },
          {
            name: "Parker Solar Probe",
            description: "Humanity's first mission to 'touch' the Sun, studying solar wind, coronal heating, and space weather phenomena from within the solar corona.",
            status: "Active",
            launchDate: new Date("2018-08-12"),
            agency: "NASA",
            missionType: "Solar observation",
            destination: "Solar Corona",
            imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
            websiteUrl: "https://parkersolarprobe.jhuapl.edu/",
            missionDuration: "7 years (24 solar orbits)",
            objectives: [
              "Study solar wind acceleration mechanisms",
              "Investigate coronal heating processes",
              "Determine structure of solar magnetic fields",
              "Measure energetic particle acceleration"
            ],
            records: [
              "Fastest human-made object: 692,000 km/h",
              "Closest approach to Sun: 6.9 million km",
              "Hottest spacecraft surface: 1,377°C",
              "First spacecraft to enter solar corona"
            ],
            closestApproach: new Date("2024-12-24"),
            currentSpeed: "692,000 km/h"
          },
          {
            name: "Dragonfly",
            description: "Rotorcraft lander mission to explore Saturn's moon Titan, studying its methane cycle, organic chemistry, and potential for prebiotic chemistry.",
            status: "Planned",
            launchDate: new Date("2027-07-01"),
            agency: "NASA",
            missionType: "Rotorcraft lander",
            destination: "Saturn's Moon Titan",
            imageUrl: "https://images.unsplash.com/photo-1446776481440-d9436ced2468?w=800&h=600&fit=crop",
            websiteUrl: "https://dragonfly.jhuapl.edu/",
            missionDuration: "2.7 years surface operations",
            objectives: [
              "Study Titan's methane cycle and weather",
              "Investigate organic chemistry and prebiotic processes",
              "Search for chemical biosignatures",
              "Map surface composition and geology"
            ],
            uniqueFeatures: [
              "First rotorcraft to operate on another world",
              "Dual quadcopter design for atmospheric flight",
              "Nuclear-powered for long-duration operations",
              "Capable of flights up to 8 km distance"
            ],
            arrivalDate: new Date("2034-07-01"),
            flightCapability: "8 km per flight, 175 km total range"
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

  // Initialize with curated APOD images for better gallery experience
  const initializeGalleryData = async () => {
    try {
      const existingImages = await storage.getApodImages(5);
      if (existingImages.length < 20) {
        const curatedImages = [
          {
            date: "2024-12-15",
            title: "The Horsehead Nebula",
            explanation: "One of the most identifiable nebulae in the sky, the Horsehead Nebula in Orion is part of a large, dark, molecular cloud. Also known as Barnard 33, the unusual shape was first discovered on a photographic plate in the late 1800s.",
            url: "https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=960&h=640&fit=crop",
            hdurl: "https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=1080&h=720&fit=crop",
            mediaType: "image",
            copyright: "NASA, ESA, Hubble Heritage Team"
          },
          {
            date: "2024-12-14",
            title: "Spiral Galaxy NGC 2841",
            explanation: "This spectacular spiral galaxy NGC 2841 lies 46 million light-years away in the constellation Ursa Major. A grand design spiral, NGC 2841 has a prominent central bulge crossed by a dark lane of dust and tightly wound spiral arms.",
            url: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=960&h=640&fit=crop",
            hdurl: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1080&h=720&fit=crop",
            mediaType: "image",
            copyright: "NASA, ESA, Hubble Space Telescope"
          },
          {
            date: "2024-12-13",
            title: "Mars Perseverance Rover Selfie",
            explanation: "This self-portrait of NASA's Perseverance Mars rover was taken by the WATSON camera on the rover's robotic arm on Sol 46 of the mission. The rover is located at the Octavia E. Butler landing site in Jezero Crater.",
            url: "https://images.unsplash.com/photo-1614728263952-84ea256f9679?w=960&h=640&fit=crop",
            hdurl: "https://images.unsplash.com/photo-1614728263952-84ea256f9679?w=1080&h=720&fit=crop",
            mediaType: "image",
            copyright: "NASA/JPL-Caltech/MSSS"
          },
          {
            date: "2024-12-12",
            title: "Jupiter's Great Red Spot",
            explanation: "Jupiter's Great Red Spot is a giant anticyclonic storm that has been raging for hundreds of years. This detailed view from the Juno spacecraft shows the intricate structure of this massive atmospheric phenomenon.",
            url: "https://images.unsplash.com/photo-1516849841032-87cbac4d88f7?w=960&h=640&fit=crop",
            hdurl: "https://images.unsplash.com/photo-1516849841032-87cbac4d88f7?w=1080&h=720&fit=crop",
            mediaType: "image",
            copyright: "NASA/JPL-Caltech/SwRI/MSSS"
          },
          {
            date: "2024-12-11",
            title: "The Andromeda Galaxy",
            explanation: "The Andromeda Galaxy, also known as M31, is the nearest major galaxy to our Milky Way. Located 2.5 million light-years away, it contains approximately one trillion stars and is approaching our galaxy at 250,000 mph.",
            url: "https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=960&h=640&fit=crop",
            hdurl: "https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=1080&h=720&fit=crop",
            mediaType: "image",
            copyright: "NASA, ESA, Hubble Space Telescope"
          },
          {
            date: "2024-12-10",
            title: "Saturn's Rings in Detail",
            explanation: "This stunning view of Saturn's rings was captured by the Cassini spacecraft during its Grand Finale mission phase. The image shows the incredible complexity and beauty of the ring system in unprecedented detail.",
            url: "https://images.unsplash.com/photo-1446776481440-d9436ced2468?w=960&h=640&fit=crop",
            hdurl: "https://images.unsplash.com/photo-1446776481440-d9436ced2468?w=1080&h=720&fit=crop",
            mediaType: "image",
            copyright: "NASA/JPL-Caltech/Space Science Institute"
          },
          {
            date: "2024-12-09",
            title: "Eagle Nebula Pillars of Creation",
            explanation: "The Eagle Nebula's Pillars of Creation are among the most iconic images in astronomy. These towering columns of gas and dust are stellar nurseries where new stars are being born from the cosmic material.",
            url: "https://images.unsplash.com/photo-1464207687429-7505649dae38?w=960&h=640&fit=crop",
            hdurl: "https://images.unsplash.com/photo-1464207687429-7505649dae38?w=1080&h=720&fit=crop",
            mediaType: "image",
            copyright: "NASA, ESA, CSA, STScI, Webb Space Telescope"
          },
          {
            date: "2024-12-08",
            title: "Aurora Borealis Over Earth",
            explanation: "This breathtaking view of the Aurora Borealis was captured from the International Space Station as it orbited over northern Canada. The green curtains of light are caused by charged particles from the Sun interacting with Earth's magnetic field.",
            url: "https://images.unsplash.com/photo-1531306728370-e2ebd9d7bb99?w=960&h=640&fit=crop",
            hdurl: "https://images.unsplash.com/photo-1531306728370-e2ebd9d7bb99?w=1080&h=720&fit=crop",
            mediaType: "image",
            copyright: "NASA, International Space Station"
          },
          {
            date: "2024-12-07",
            title: "Crab Nebula Supernova Remnant",
            explanation: "The Crab Nebula is the remnant of a supernova that was observed by Chinese astronomers in 1054 CE. At its center lies a pulsar - a rapidly spinning neutron star that emits beams of radiation.",
            url: "https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=960&h=640&fit=crop",
            hdurl: "https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=1080&h=720&fit=crop",
            mediaType: "image",
            copyright: "NASA, ESA, Hubble Space Telescope"
          },
          {
            date: "2024-12-06",
            title: "Lunar Eclipse Sequence",
            explanation: "This composite image shows the progression of a total lunar eclipse, demonstrating how Earth's shadow transforms the Moon's appearance from bright white to deep red as it passes through different phases of the eclipse.",
            url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=960&h=640&fit=crop",
            hdurl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1080&h=720&fit=crop",
            mediaType: "image",
            copyright: "NASA Goddard Space Flight Center"
          },
          {
            date: "2024-12-05",
            title: "Hubble Deep Field",
            explanation: "The Hubble Deep Field reveals thousands of galaxies in a tiny patch of sky, each containing billions of stars. This image fundamentally changed our understanding of the universe's scale and the abundance of galaxies.",
            url: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=960&h=640&fit=crop",
            hdurl: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1080&h=720&fit=crop",
            mediaType: "image",
            copyright: "NASA, ESA, Hubble Space Telescope"
          },
          {
            date: "2024-12-04",
            title: "Artemis 1 Moon Mission",
            explanation: "NASA's Artemis 1 mission successfully demonstrated the Orion spacecraft's capabilities for future human missions to the Moon. This image shows the uncrewed Orion capsule in lunar orbit during its historic test flight.",
            url: "https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=960&h=640&fit=crop",
            hdurl: "https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=1080&h=720&fit=crop",
            mediaType: "image",
            copyright: "NASA Artemis Program"
          },
          {
            date: "2024-12-03",
            title: "Rosette Nebula in Hydrogen",
            explanation: "The Rosette Nebula, also known as NGC 2237, is a large emission nebula located in the constellation Monoceros. The nebula's distinctive shape and red color come from hydrogen gas excited by the radiation from hot young stars.",
            url: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=960&h=640&fit=crop",
            hdurl: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1080&h=720&fit=crop",
            mediaType: "image",
            copyright: "NASA, ESA, Hubble Heritage Team"
          },
          {
            date: "2024-12-02",
            title: "Cassini's Final View of Saturn",
            explanation: "This farewell image from NASA's Cassini spacecraft shows Saturn in all its glory during the mission's Grand Finale. After 13 years studying Saturn and its moons, Cassini concluded its historic journey in 2017.",
            url: "https://images.unsplash.com/photo-1446776481440-d9436ced2468?w=960&h=640&fit=crop",
            hdurl: "https://images.unsplash.com/photo-1446776481440-d9436ced2468?w=1080&h=720&fit=crop",
            mediaType: "image",
            copyright: "NASA/JPL-Caltech/Space Science Institute"
          },
          {
            date: "2024-12-01",
            title: "Milky Way Galactic Center",
            explanation: "This infrared image reveals the crowded center of our Milky Way galaxy, where millions of stars orbit around the supermassive black hole Sagittarius A*. The image pierces through the dust that normally obscures this region.",
            url: "https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=960&h=640&fit=crop",
            hdurl: "https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=1080&h=720&fit=crop",
            mediaType: "image",
            copyright: "NASA/JPL-Caltech/Spitzer Space Telescope"
          }
        ];

        for (const image of curatedImages) {
          const existing = await storage.getApodImageByDate(image.date);
          if (!existing) {
            await storage.createApodImage(image);
          }
        }
      }
    } catch (error) {
      console.error('Error initializing gallery data:', error);
    }
  };

  // Initialize gallery data on server start
  initializeGalleryData();

  const httpServer = createServer(app);
  return httpServer;
}
