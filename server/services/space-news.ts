export interface SpaceNewsArticle {
  id: number;
  title: string;
  url: string;
  imageUrl: string;
  newsSite: string;
  summary: string;
  publishedAt: string;
  updatedAt: string;
  featured: boolean;
  launches: Array<{
    id: string;
    provider: string;
  }>;
  events: Array<{
    id: string;
    provider: string;
  }>;
}

export interface SpaceNewsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: SpaceNewsArticle[];
}

export class SpaceNewsService {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_DURATION = 15 * 60 * 1000; // 15 minutes
  private readonly REQUEST_TIMEOUT = 10000; // 10 seconds
  private readonly BASE_URL = 'https://api.spaceflightnewsapi.net/v4';

  private async fetchWithRetry(url: string, retries = 3): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.REQUEST_TIMEOUT);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Cosmofy-Space-App/1.0',
          'Accept': 'application/json'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        if (retries > 0 && response.status >= 500) {
          console.log(`Space News API error ${response.status}, retrying...`);
          await new Promise(resolve => setTimeout(resolve, 2000));
          return this.fetchWithRetry(url, retries - 1);
        }
        throw new Error(`Space News API error: ${response.status} ${response.statusText}`);
      }
      
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (retries > 0 && error instanceof Error && error.name !== 'AbortError') {
        console.log(`Space News API fetch error, retrying...`, error.message);
        await new Promise(resolve => setTimeout(resolve, 2000));
        return this.fetchWithRetry(url, retries - 1);
      }
      throw error;
    }
  }

  async getLatestNews(limit = 10, offset = 0): Promise<SpaceNewsResponse> {
    const cacheKey = `news-${limit}-${offset}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    const url = `${this.BASE_URL}/articles/?limit=${limit}&offset=${offset}&ordering=-published_at`;
    const response = await this.fetchWithRetry(url);
    const data = await response.json();
    
    this.cache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  }

  async getFeaturedNews(limit = 5): Promise<SpaceNewsResponse> {
    const cacheKey = `featured-news-${limit}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    const url = `${this.BASE_URL}/articles/?limit=${limit}&featured=true&ordering=-published_at`;
    const response = await this.fetchWithRetry(url);
    const data = await response.json();
    
    this.cache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  }

  async searchNews(query: string, limit = 10): Promise<SpaceNewsResponse> {
    const cacheKey = `search-${query}-${limit}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    const encodedQuery = encodeURIComponent(query);
    const url = `${this.BASE_URL}/articles/?search=${encodedQuery}&limit=${limit}&ordering=-published_at`;
    const response = await this.fetchWithRetry(url);
    const data = await response.json();
    
    this.cache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  }

  async getNewsByLaunch(launchId: string, limit = 5): Promise<SpaceNewsResponse> {
    const cacheKey = `launch-news-${launchId}-${limit}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    const url = `${this.BASE_URL}/articles/?launches=${launchId}&limit=${limit}&ordering=-published_at`;
    const response = await this.fetchWithRetry(url);
    const data = await response.json();
    
    this.cache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  }

  formatTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 2592000) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  }
}

export const spaceNewsService = new SpaceNewsService();