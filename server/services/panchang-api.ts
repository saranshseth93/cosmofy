export interface PanchangData {
  date: string;
  tithi: {
    name: string;
    deity: string;
    type: string;
    number: number;
    start: string;
    end: string;
    nextTithi: string;
    meaning: string;
    special: string;
    significance: string;
    endTime: string;
  };
  nakshatra: {
    name: string;
    lord: string;
    deity: string;
    number: number;
    start: string;
    end: string;
    nextNakshatra: string;
    meaning: string;
    special: string;
    summary: string;
    words: string;
    qualities: string;
    endTime: string;
  };
  yoga: {
    name: string;
    number: number;
    start: string;
    end: string;
    meaning: string;
    special: string;
    nextYoga: string;
    endTime: string;
  };
  karana: {
    name: string;
    lord: string;
    deity: string;
    type: string;
    number: number;
    start: string;
    end: string;
    special: string;
    nextKarana: string;
    meaning: string;
    endTime: string;
  };
  rashi: {
    name: string;
    element: string;
    lord: string;
  };
  sunrise: string;
  sunset: string;
  moonrise: string;
  moonset: string;
  shubhMuhurat: {
    abhijitMuhurat: string;
    brahmaRahukaal: string;
    gulikaKaal: string;
    yamaGandaKaal: string;
  };
  advancedDetails: {
    solarNoon: string;
    nextFullMoon: string;
    nextNewMoon: string;
    masa: {
      amantaName: string;
      purnimaName: string;
      adhikMaasa: boolean;
      ayana: string;
      moonPhase: string;
      paksha: string;
      ritu: string;
    };
    vaara: string;
    dishaShool: string;
  };
  auspiciousTimes: Array<{
    name: string;
    time: string;
    description: string;
  }>;
  inauspiciousTimes: Array<{
    name: string;
    time: string;
    description: string;
  }>;
  festivals: string[];
  vratsAndOccasions: string[];
}

export class PanchangApiService {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
  private readonly REQUEST_TIMEOUT = 10000; // 10 seconds

  private async fetchWithRetry(url: string, retries = 3): Promise<Response> {
    for (let i = 0; i < retries; i++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.REQUEST_TIMEOUT);
        
        const response = await fetch(url, { 
          signal: controller.signal,
          headers: {
            'User-Agent': 'CosmofyApp/1.0'
          }
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          return response;
        }
        
        if (i === retries - 1) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      } catch (error) {
        if (i === retries - 1) {
          throw error;
        }
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
    
    throw new Error('Max retries exceeded');
  }

  private getTithiData(): Array<{name: string, deity: string, significance: string}> {
    return [
      { name: 'Pratipada', deity: 'Agni', significance: 'New beginnings, starting ventures' },
      { name: 'Dwitiya', deity: 'Brahma', significance: 'Creation, planning, foundation work' },
      { name: 'Tritiya', deity: 'Vishnu', significance: 'Preservation, maintaining activities' },
      { name: 'Chaturthi', deity: 'Ganesha', significance: 'Removing obstacles, worship' },
      { name: 'Panchami', deity: 'Saraswati', significance: 'Knowledge, learning, arts' },
      { name: 'Shashthi', deity: 'Kartik', significance: 'Health, vitality, courage' },
      { name: 'Saptami', deity: 'Surya', significance: 'Energy, power, leadership' },
      { name: 'Ashtami', deity: 'Durga', significance: 'Strength, protection, overcoming enemies' },
      { name: 'Navami', deity: 'Durga', significance: 'Victory, completion of tasks' },
      { name: 'Dashami', deity: 'Dharmaraj', significance: 'Justice, righteousness, truth' },
      { name: 'Ekadashi', deity: 'Vishnu', significance: 'Spiritual activities, fasting, meditation' },
      { name: 'Dwadashi', deity: 'Vishnu', significance: 'Devotion, breaking fasts' },
      { name: 'Trayodashi', deity: 'Kamadeva', significance: 'Desires, relationships, passion' },
      { name: 'Chaturdashi', deity: 'Shiva', significance: 'Destruction of negativity, transformation' },
      { name: 'Amavasya', deity: 'Pitra', significance: 'Ancestral worship, introspection' },
      { name: 'Purnima', deity: 'Chandra', significance: 'Fulfillment, completion, celebration' }
    ];
  }

  private getNakshatraData(): Array<{name: string, deity: string, qualities: string}> {
    return [
      { name: 'Ashwini', deity: 'Ashwini Kumaras', qualities: 'Quick action, healing, pioneering spirit' },
      { name: 'Bharani', deity: 'Yama', qualities: 'Transformation, responsibility, moral strength' },
      { name: 'Krittika', deity: 'Agni', qualities: 'Purification, sharp intellect, burning away negativity' },
      { name: 'Rohini', deity: 'Brahma', qualities: 'Growth, beauty, material abundance' },
      { name: 'Mrigashira', deity: 'Soma', qualities: 'Searching, curiosity, gentle nature' },
      { name: 'Ardra', deity: 'Rudra', qualities: 'Destruction and renewal, emotional intensity' },
      { name: 'Punarvasu', deity: 'Aditi', qualities: 'Renewal, optimism, return to source' },
      { name: 'Pushya', deity: 'Brihaspati', qualities: 'Nourishment, wisdom, spiritual growth' },
      { name: 'Ashlesha', deity: 'Nagas', qualities: 'Mystical knowledge, intuition, transformation' },
      { name: 'Magha', deity: 'Pitras', qualities: 'Authority, tradition, ancestral power' },
      { name: 'Purva Phalguni', deity: 'Bhaga', qualities: 'Creativity, pleasure, relationships' },
      { name: 'Uttara Phalguni', deity: 'Aryaman', qualities: 'Service, partnership, nobility' },
      { name: 'Hasta', deity: 'Savitar', qualities: 'Skill, craftsmanship, healing hands' },
      { name: 'Chitra', deity: 'Vishvakarma', qualities: 'Creativity, beauty, artistic expression' },
      { name: 'Swati', deity: 'Vayu', qualities: 'Independence, flexibility, movement' },
      { name: 'Vishakha', deity: 'Indra-Agni', qualities: 'Goal-oriented, determination, achievement' },
      { name: 'Anuradha', deity: 'Mitra', qualities: 'Friendship, cooperation, devotion' },
      { name: 'Jyeshtha', deity: 'Indra', qualities: 'Leadership, protection, seniority' },
      { name: 'Mula', deity: 'Nirrti', qualities: 'Investigation, research, getting to the root' },
      { name: 'Purva Ashadha', deity: 'Apas', qualities: 'Invincibility, pride, purification' },
      { name: 'Uttara Ashadha', deity: 'Vishvadevas', qualities: 'Victory, righteousness, final achievement' },
      { name: 'Shravana', deity: 'Vishnu', qualities: 'Learning, listening, knowledge acquisition' },
      { name: 'Dhanishta', deity: 'Vasus', qualities: 'Wealth, music, rhythm, prosperity' },
      { name: 'Shatabhisha', deity: 'Varuna', qualities: 'Healing, mystical knowledge, secrecy' },
      { name: 'Purva Bhadrapada', deity: 'Aja Ekapada', qualities: 'Spirituality, renunciation, intensity' },
      { name: 'Uttara Bhadrapada', deity: 'Ahir Budhnya', qualities: 'Wisdom, depth, cosmic understanding' },
      { name: 'Revati', deity: 'Pushan', qualities: 'Completion, protection, guiding others' }
    ];
  }

  private getYogaData(): Array<{name: string, meaning: string}> {
    return [
      { name: 'Vishkumbha', meaning: 'Obstacles and delays, avoid important tasks' },
      { name: 'Priti', meaning: 'Love and affection, good for relationships' },
      { name: 'Ayushman', meaning: 'Longevity and health, auspicious for healing' },
      { name: 'Saubhagya', meaning: 'Good fortune and prosperity' },
      { name: 'Shobhana', meaning: 'Splendor and beauty, good for celebrations' },
      { name: 'Atiganda', meaning: 'Extreme obstacles, inauspicious for new ventures' },
      { name: 'Sukarma', meaning: 'Good deeds and righteous actions' },
      { name: 'Dhriti', meaning: 'Patience and perseverance' },
      { name: 'Shula', meaning: 'Sharp and piercing, avoid conflicts' },
      { name: 'Ganda', meaning: 'Obstacles and difficulties' },
      { name: 'Vriddhi', meaning: 'Growth and expansion' },
      { name: 'Dhruva', meaning: 'Stability and permanence' },
      { name: 'Vyaghata', meaning: 'Destruction and violence, inauspicious' },
      { name: 'Harshana', meaning: 'Joy and happiness' },
      { name: 'Vajra', meaning: 'Strong like diamond, good for important decisions' },
      { name: 'Siddhi', meaning: 'Success and accomplishment' },
      { name: 'Vyatipata', meaning: 'Calamity and misfortune, avoid important work' },
      { name: 'Variyana', meaning: 'Excellence and superiority' },
      { name: 'Parigha', meaning: 'Obstruction and hindrance' },
      { name: 'Shiva', meaning: 'Auspicious and benevolent' },
      { name: 'Siddha', meaning: 'Perfect and accomplished' },
      { name: 'Sadhya', meaning: 'Achievable and feasible' },
      { name: 'Shubha', meaning: 'Auspicious and beneficial' },
      { name: 'Shukla', meaning: 'Pure and bright' },
      { name: 'Brahma', meaning: 'Divine and sacred' },
      { name: 'Indra', meaning: 'Powerful and majestic' },
      { name: 'Vaidhriti', meaning: 'Sorrow and separation, inauspicious' }
    ];
  }

  private getKaranaData(): Array<{name: string, meaning: string}> {
    return [
      { name: 'Bava', meaning: 'Beneficial for trade and business' },
      { name: 'Balava', meaning: 'Good for strength and courage' },
      { name: 'Kaulava', meaning: 'Auspicious for family matters' },
      { name: 'Taitila', meaning: 'Mixed results, moderate success' },
      { name: 'Gara', meaning: 'Good for agriculture and farming' },
      { name: 'Vanija', meaning: 'Excellent for commerce and trade' },
      { name: 'Vishti (Bhadra)', meaning: 'Inauspicious, avoid important work' },
      { name: 'Shakuni', meaning: 'Cunning and strategy, good for planning' },
      { name: 'Chatushpada', meaning: 'Four-footed, good for animal welfare' },
      { name: 'Naga', meaning: 'Serpent energy, good for spiritual practices' },
      { name: 'Kimstughna', meaning: 'Destroyer of what, mixed results' }
    ];
  }

  private getRashiData(): Array<{name: string, element: string, lord: string}> {
    return [
      { name: 'Mesha (Aries)', element: 'Fire', lord: 'Mars' },
      { name: 'Vrishabha (Taurus)', element: 'Earth', lord: 'Venus' },
      { name: 'Mithuna (Gemini)', element: 'Air', lord: 'Mercury' },
      { name: 'Karka (Cancer)', element: 'Water', lord: 'Moon' },
      { name: 'Simha (Leo)', element: 'Fire', lord: 'Sun' },
      { name: 'Kanya (Virgo)', element: 'Earth', lord: 'Mercury' },
      { name: 'Tula (Libra)', element: 'Air', lord: 'Venus' },
      { name: 'Vrishchika (Scorpio)', element: 'Water', lord: 'Mars' },
      { name: 'Dhanu (Sagittarius)', element: 'Fire', lord: 'Jupiter' },
      { name: 'Makara (Capricorn)', element: 'Earth', lord: 'Saturn' },
      { name: 'Kumbha (Aquarius)', element: 'Air', lord: 'Saturn' },
      { name: 'Meena (Pisces)', element: 'Water', lord: 'Jupiter' }
    ];
  }

  private calculateSunriseSunset(lat: number, lon: number, date: Date): {sunrise: string, sunset: string} {
    // Simplified calculation for demonstration
    // In production, use astronomical libraries for accurate calculations
    const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    const seasonalOffset = Math.sin((dayOfYear / 365.25) * 2 * Math.PI) * 2;
    
    const baseRise = 6 + seasonalOffset;
    const baseSet = 18 - seasonalOffset;
    
    const latOffset = (lat / 90) * 2;
    
    const sunrise = baseRise + latOffset;
    const sunset = baseSet - latOffset;
    
    const formatTime = (hours: number) => {
      const h = Math.floor(Math.abs(hours));
      const m = Math.floor((Math.abs(hours) - h) * 60);
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    };
    
    return {
      sunrise: formatTime(sunrise),
      sunset: formatTime(sunset)
    };
  }

  private calculateMoonriseMoonset(lat: number, lon: number, date: Date): {moonrise: string, moonset: string} {
    // Simplified moon calculation
    const dayOfMonth = date.getDate();
    const moonPhase = (dayOfMonth / 29.5) % 1;
    
    const baseMoonrise = 18 + (moonPhase * 12);
    const baseMoonset = 6 + (moonPhase * 12);
    
    const formatTime = (hours: number) => {
      const h = Math.floor(hours % 24);
      const m = Math.floor((hours % 1) * 60);
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    };
    
    return {
      moonrise: formatTime(baseMoonrise),
      moonset: formatTime(baseMoonset)
    };
  }

  private calculateMuhurat(sunrise: string, sunset: string): any {
    const parseTime = (timeStr: string) => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours + minutes / 60;
    };
    
    const formatTime = (hours: number) => {
      const h = Math.floor(hours);
      const m = Math.floor((hours - h) * 60);
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    };
    
    const sunriseHours = parseTime(sunrise);
    const sunsetHours = parseTime(sunset);
    const dayLength = sunsetHours - sunriseHours;
    
    // Abhijit Muhurat - middle of the day
    const abhijitStart = sunriseHours + (dayLength / 2) - 0.4;
    const abhijitEnd = sunriseHours + (dayLength / 2) + 0.4;
    
    // Rahu Kaal - varies by day of week
    const dayOfWeek = new Date().getDay();
    const rahuKaalStarts = [16.5, 7.5, 15, 12, 10.5, 9, 13.5]; // Hours from sunrise
    const rahuStart = sunriseHours + (dayLength * rahuKaalStarts[dayOfWeek] / 24);
    const rahuEnd = rahuStart + 1.5;
    
    // Gulika Kaal
    const gulikaStart = sunriseHours + (dayLength * 0.625);
    const gulikaEnd = gulikaStart + 1.5;
    
    // Yama Ganda Kaal  
    const yamaStart = sunriseHours + (dayLength * 0.375);
    const yamaEnd = yamaStart + 1.5;
    
    return {
      abhijitMuhurat: `${formatTime(abhijitStart)} - ${formatTime(abhijitEnd)}`,
      brahmaRahukaal: `${formatTime(rahuStart)} - ${formatTime(rahuEnd)}`,
      gulikaKaal: `${formatTime(gulikaStart)} - ${formatTime(gulikaEnd)}`,
      yamaGandaKaal: `${formatTime(yamaStart)} - ${formatTime(yamaEnd)}`
    };
  }

  private getFestivalsAndVrats(date: Date): {festivals: string[], vratsAndOccasions: string[]} {
    const festivals: string[] = [];
    const vratsAndOccasions: string[] = [];
    
    const dayOfWeek = date.getDay();
    const dayOfMonth = date.getDate();
    const month = date.getMonth();
    
    // Weekly vrats
    if (dayOfWeek === 1) vratsAndOccasions.push('Somvar Vrat');
    if (dayOfWeek === 2) vratsAndOccasions.push('Mangalwar Vrat');
    if (dayOfWeek === 3) vratsAndOccasions.push('Budhwar Vrat');
    if (dayOfWeek === 4) vratsAndOccasions.push('Guruvaar Vrat', 'Vishnu Worship');
    if (dayOfWeek === 5) vratsAndOccasions.push('Shukravar Vrat', 'Devi Worship');
    if (dayOfWeek === 6) vratsAndOccasions.push('Shanivar Vrat');
    if (dayOfWeek === 0) vratsAndOccasions.push('Ravivar Vrat', 'Surya Worship');
    
    // Monthly observances
    if (dayOfMonth === 11 || dayOfMonth === 26) {
      vratsAndOccasions.push('Ekadashi Vrat');
    }
    
    if (dayOfMonth === 13 || dayOfMonth === 28) {
      vratsAndOccasions.push('Pradosh Vrat');
    }
    
    // Seasonal festivals (simplified)
    if (month === 2 && dayOfMonth >= 20) festivals.push('Holi Season');
    if (month === 7 && dayOfMonth >= 15) festivals.push('Janmashtami Season');
    if (month === 8 && dayOfMonth >= 15) festivals.push('Ganesh Chaturthi Season');
    if (month === 9 && dayOfMonth >= 1) festivals.push('Navratri Season');
    if (month === 10 && dayOfMonth >= 20) festivals.push('Diwali Season');
    
    return { festivals, vratsAndOccasions };
  }

  async getPanchangData(lat: number, lon: number, date?: Date): Promise<PanchangData> {
    const targetDate = date || new Date();
    const cacheKey = `panchang-${lat}-${lon}-${targetDate.toDateString()}`;
    
    // Check cache
    const cached = this.cache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < this.CACHE_DURATION) {
      return cached.data;
    }

    try {
      // Calculate current panchang elements based on date and location
      const dayOfYear = Math.floor((targetDate.getTime() - new Date(targetDate.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
      
      const tithiData = this.getTithiData();
      const nakshatraData = this.getNakshatraData();
      const yogaData = this.getYogaData();
      const karanaData = this.getKaranaData();
      const rashiData = this.getRashiData();
      
      // Simplified calculations based on lunar calendar approximation
      const lunarDay = Math.floor((dayOfYear * 12.368) % 30); // Approximate lunar day
      const nakshatraIndex = Math.floor((dayOfYear * 13.176) % 27); // Approximate nakshatra
      const yogaIndex = Math.floor((dayOfYear * 27.322) % 27); // Approximate yoga
      const karanaIndex = Math.floor((dayOfYear * 2) % 11); // Approximate karana
      const rashiIndex = Math.floor((dayOfYear * 12.368 / 30) % 12); // Approximate moon rashi
      
      const currentTithi = tithiData[Math.min(lunarDay, tithiData.length - 1)];
      const currentNakshatra = nakshatraData[nakshatraIndex];
      const currentYoga = yogaData[yogaIndex];
      const currentKarana = karanaData[karanaIndex];
      const currentRashi = rashiData[rashiIndex];
      
      // Calculate sun/moon timings
      const sunMoonTimes = this.calculateSunriseSunset(lat, lon, targetDate);
      const moonTimes = this.calculateMoonriseMoonset(lat, lon, targetDate);
      
      // Calculate muhurat
      const muhurat = this.calculateMuhurat(sunMoonTimes.sunrise, sunMoonTimes.sunset);
      
      // Get festivals and vrats
      const festivalsAndVrats = this.getFestivalsAndVrats(targetDate);
      
      // Generate random end times for demonstration
      const generateEndTime = () => {
        const hour = Math.floor(Math.random() * 24);
        const minute = Math.floor(Math.random() * 60);
        return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      };
      
      // Determine tithi type (Krishna/Shukla paksha)
      const tithiType = lunarDay < 15 ? 'Shukla' : 'Krishna';
      const tithiNumber = lunarDay < 15 ? lunarDay + 1 : lunarDay - 14;
      
      // Generate detailed timing data
      const generateDetailedTime = (baseHour: number) => {
        const date = new Date(targetDate);
        date.setHours(Math.floor(baseHour), Math.floor((baseHour % 1) * 60));
        return date.toLocaleString('en-US', { 
          weekday: 'short', 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric', 
          hour: 'numeric', 
          minute: '2-digit', 
          second: '2-digit',
          hour12: true 
        });
      };

      const panchangData: PanchangData = {
        date: targetDate.toISOString().split('T')[0],
        tithi: {
          name: currentTithi.name,
          deity: currentTithi.deity,
          type: tithiType,
          number: tithiNumber,
          start: generateDetailedTime(5 + Math.random() * 2),
          end: generateDetailedTime(16 + Math.random() * 8),
          nextTithi: tithiData[(Math.min(lunarDay + 1, tithiData.length - 1))].name,
          meaning: `${tithiNumber === 1 ? 'First' : tithiNumber === 2 ? 'Second' : 'Nth'} day after ${tithiType === 'Shukla' ? 'Amavasya (new moon)' : 'Purnima (full moon)'}.`,
          special: `${tithiType} tithi, ${currentTithi.significance}`,
          significance: currentTithi.significance,
          endTime: generateEndTime()
        },
        nakshatra: {
          name: currentNakshatra.name,
          lord: currentNakshatra.lord || 'Jupiter',
          deity: currentNakshatra.deity,
          number: nakshatraIndex + 1,
          start: generateDetailedTime(2 + Math.random() * 4),
          end: generateDetailedTime(20 + Math.random() * 4),
          nextNakshatra: nakshatraData[(nakshatraIndex + 1) % 27].name,
          meaning: currentNakshatra.meaning || `Associated with ${currentNakshatra.qualities}`,
          special: currentNakshatra.special || 'Mixed quality nakshatra',
          summary: `This nakshatra is of mixed quality. Good for routine activities and day-to-day duties. ${currentNakshatra.qualities}`,
          words: currentNakshatra.words || 'च छ ज झ',
          qualities: currentNakshatra.qualities,
          endTime: generateEndTime()
        },
        yoga: {
          name: currentYoga.name,
          number: yogaIndex + 1,
          start: generateDetailedTime(8 + Math.random() * 2),
          end: generateDetailedTime(16 + Math.random() * 2),
          meaning: currentYoga.meaning,
          special: `Good for activities that involve ${currentYoga.meaning.toLowerCase()}`,
          nextYoga: yogaData[(yogaIndex + 1) % 27].name,
          endTime: generateEndTime()
        },
        karana: {
          name: currentKarana.name,
          lord: 'Jupiter (Brihaspati)',
          deity: 'Bhumi',
          type: karanaIndex < 4 ? 'Benefic' : 'Mixed',
          number: karanaIndex + 1,
          start: generateDetailedTime(6 + Math.random() * 2),
          end: generateDetailedTime(16 + Math.random() * 2),
          special: currentKarana.meaning,
          nextKarana: karanaData[(karanaIndex + 1) % 11].name,
          meaning: currentKarana.meaning,
          endTime: generateEndTime()
        },
        rashi: {
          name: currentRashi.name,
          element: currentRashi.element,
          lord: currentRashi.lord
        },
        sunrise: sunMoonTimes.sunrise,
        sunset: sunMoonTimes.sunset,
        moonrise: moonTimes.moonrise,
        moonset: moonTimes.moonset,
        shubhMuhurat: muhurat,
        advancedDetails: {
          solarNoon: '12:30:37 PM',
          nextFullMoon: this.getNextFullMoon(targetDate),
          nextNewMoon: this.getNextNewMoon(targetDate),
          masa: {
            amantaName: this.getCurrentMasa(targetDate).amanta,
            purnimaName: this.getCurrentMasa(targetDate).purnima,
            adhikMaasa: false,
            ayana: targetDate.getMonth() < 6 ? 'Uttarayana' : 'Dakshinayana',
            moonPhase: lunarDay === 0 ? 'New Moon' : lunarDay === 15 ? 'Full Moon' : lunarDay < 15 ? 'Waxing' : 'Waning',
            paksha: tithiType,
            ritu: this.getCurrentRitu(targetDate)
          },
          vaara: this.getVaara(targetDate),
          dishaShool: this.getDishaShool(targetDate)
        },
        auspiciousTimes: this.getAuspiciousTimes(sunMoonTimes.sunrise, sunMoonTimes.sunset),
        inauspiciousTimes: this.getInauspiciousTimes(sunMoonTimes.sunrise, sunMoonTimes.sunset),
        festivals: festivalsAndVrats.festivals,
        vratsAndOccasions: festivalsAndVrats.vratsAndOccasions
      };
      
      // Console log all the data for review
      console.log('=== PANCHANG API DATA ===');
      console.log('Date:', panchangData.date);
      console.log('Tithi:', JSON.stringify(panchangData.tithi, null, 2));
      console.log('Nakshatra:', JSON.stringify(panchangData.nakshatra, null, 2));
      console.log('Yoga:', JSON.stringify(panchangData.yoga, null, 2));
      console.log('Karana:', JSON.stringify(panchangData.karana, null, 2));
      console.log('Rashi:', JSON.stringify(panchangData.rashi, null, 2));
      console.log('Sun/Moon Times:', {
        sunrise: panchangData.sunrise,
        sunset: panchangData.sunset,
        moonrise: panchangData.moonrise,
        moonset: panchangData.moonset
      });
      console.log('Shubh Muhurat:', JSON.stringify(panchangData.shubhMuhurat, null, 2));
      console.log('Advanced Details:', JSON.stringify(panchangData.advancedDetails, null, 2));
      console.log('Auspicious Times:', JSON.stringify(panchangData.auspiciousTimes, null, 2));
      console.log('Inauspicious Times:', JSON.stringify(panchangData.inauspiciousTimes, null, 2));
      console.log('Festivals:', panchangData.festivals);
      console.log('Vrats and Occasions:', panchangData.vratsAndOccasions);
      console.log('=== END PANCHANG DATA ===');
      
      // Cache the result
      this.cache.set(cacheKey, { data: panchangData, timestamp: Date.now() });
      
      return panchangData;
    } catch (error) {
      console.error('Error fetching Panchang data:', error);
      throw new Error('Failed to fetch Panchang data');
    }
  }

  private getNextFullMoon(date: Date): string {
    const nextMonth = new Date(date);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    nextMonth.setDate(15); // Approximate full moon
    return nextMonth.toISOString().split('T')[0];
  }

  private getNextNewMoon(date: Date): string {
    const nextMonth = new Date(date);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    nextMonth.setDate(1); // Approximate new moon
    return nextMonth.toISOString().split('T')[0];
  }

  private getCurrentMasa(date: Date): {amanta: string, purnima: string} {
    const masaNames = [
      { amanta: 'Chaitra', purnima: 'Vaisakha' },
      { amanta: 'Vaisakha', purnima: 'Jyeshtha' },
      { amanta: 'Jyeshtha', purnima: 'Ashadha' },
      { amanta: 'Ashadha', purnima: 'Shravana' },
      { amanta: 'Shravana', purnima: 'Bhadrapada' },
      { amanta: 'Bhadrapada', purnima: 'Ashwin' },
      { amanta: 'Ashwin', purnima: 'Kartik' },
      { amanta: 'Kartik', purnima: 'Margashirsha' },
      { amanta: 'Margashirsha', purnima: 'Pausha' },
      { amanta: 'Pausha', purnima: 'Magha' },
      { amanta: 'Magha', purnima: 'Phalguna' },
      { amanta: 'Phalguna', purnima: 'Chaitra' }
    ];
    return masaNames[date.getMonth()];
  }

  private getCurrentRitu(date: Date): string {
    const ritus = ['Shishira', 'Vasanta', 'Grishma', 'Varsha', 'Sharad', 'Hemanta'];
    return ritus[Math.floor(date.getMonth() / 2)];
  }

  private getVaara(date: Date): string {
    const vaaras = ['Ravivar', 'Somvar', 'Mangalvar', 'Budhvar', 'Guruvaar', 'Shukravar', 'Shanivar'];
    return vaaras[date.getDay()];
  }

  private getDishaShool(date: Date): string {
    const directions = ['East', 'South', 'West', 'North'];
    return directions[date.getDay() % 4];
  }

  private getAuspiciousTimes(sunrise: string, sunset: string): Array<{name: string, time: string, description: string}> {
    return [
      {
        name: 'Brahma Muhurat',
        time: '04:30 - 05:30',
        description: 'Most auspicious time for spiritual practices and meditation'
      },
      {
        name: 'Abhijit Muhurat',
        time: '11:30 - 12:30',
        description: 'Victory time, good for starting new ventures'
      }
    ];
  }

  private getInauspiciousTimes(sunrise: string, sunset: string): Array<{name: string, time: string, description: string}> {
    return [
      {
        name: 'Rahu Kaal',
        time: '12:30 - 02:00',
        description: 'Inauspicious time, avoid starting new work'
      },
      {
        name: 'Gulika Kaal',
        time: '10:30 - 12:00',
        description: 'Period of obstacles and difficulties'
      }
    ];
  }
}

export const panchangApi = new PanchangApiService();