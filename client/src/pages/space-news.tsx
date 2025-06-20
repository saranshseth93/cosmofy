import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, ExternalLink, Clock, Star, Newspaper } from 'lucide-react';
import { Navigation } from '@/components/navigation';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface SpaceNewsArticle {
  id: number;
  title: string;
  url: string;
  image_url: string; // API uses snake_case
  news_site: string; // API uses snake_case
  summary: string;
  published_at: string; // API uses snake_case
  updated_at: string; // API uses snake_case
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

interface SpaceNewsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: SpaceNewsArticle[];
}

export default function SpaceNews() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'latest' | 'featured' | 'search'>('latest');
  const [searchResults, setSearchResults] = useState<SpaceNewsArticle[]>([]);

  const { data: latestNews, isLoading: latestLoading } = useQuery<SpaceNewsResponse>({
    queryKey: ['/api/news'],
    enabled: activeTab === 'latest'
  });

  const { data: featuredNews, isLoading: featuredLoading } = useQuery<SpaceNewsResponse>({
    queryKey: ['/api/news/featured'],
    enabled: activeTab === 'featured'
  });

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      const response = await fetch(`/api/news/search?q=${encodeURIComponent(searchQuery)}&limit=15`);
      const data = await response.json();
      setSearchResults(data.results || []);
      setActiveTab('search');
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    }
  };

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}m ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}h ago`;
    } else if (diffInSeconds < 2592000) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getCurrentArticles = (): SpaceNewsArticle[] => {
    switch (activeTab) {
      case 'latest':
        return latestNews?.results || [];
      case 'featured':
        return featuredNews?.results || [];
      case 'search':
        return searchResults;
      default:
        return [];
    }
  };

  const isLoading = (activeTab === 'latest' && latestLoading) || 
                   (activeTab === 'featured' && featuredLoading);

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-900 via-neutral-800 to-black text-white relative">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Space News</h1>
          <p className="text-xl text-neutral-400 max-w-2xl mx-auto">
            Stay updated with the latest developments in space exploration and astronomy
          </p>
        </div>

        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8 max-w-2xl mx-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
            <Input
              placeholder="Search space news..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10 bg-neutral-800 border-neutral-700 text-white placeholder-neutral-400"
            />
          </div>
          <Button 
            onClick={handleSearch}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Search
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="flex bg-neutral-800 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('latest')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === 'latest' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Newspaper className="w-4 h-4" />
              <span>Latest</span>
            </button>
            <button
              onClick={() => setActiveTab('featured')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === 'featured' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Star className="w-4 h-4" />
              <span>Featured</span>
            </button>
            {searchResults.length > 0 && (
              <button
                onClick={() => setActiveTab('search')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                  activeTab === 'search' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Search className="w-4 h-4" />
                <span>Search Results</span>
              </button>
            )}
          </div>
        </div>

        {/* News Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="bg-neutral-800 border-neutral-700 overflow-hidden">
                <Skeleton className="h-48 w-full bg-neutral-700" />
                <div className="p-6">
                  <Skeleton className="h-4 w-3/4 mb-2 bg-neutral-700" />
                  <Skeleton className="h-6 w-full mb-4 bg-neutral-700" />
                  <Skeleton className="h-16 w-full bg-neutral-700" />
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getCurrentArticles().map((article) => (
              <Card 
                key={article.id} 
                className="bg-neutral-800 border-neutral-700 overflow-hidden hover:bg-neutral-750 transition-colors group"
              >
                <div className="relative">
                  <img 
                    src={article.image_url} 
                    alt={article.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=400&h=200&fit=crop';
                    }}
                  />
                  {article.featured && (
                    <Badge className="absolute top-2 right-2 bg-yellow-500 text-black">
                      <Star className="w-3 h-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                </div>
                
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="text-blue-400 border-blue-400">
                      {article.news_site}
                    </Badge>
                    <div className="flex items-center text-neutral-400 text-sm">
                      <Clock className="w-4 h-4 mr-1" />
                      {formatTimeAgo(article.published_at)}
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-3 line-clamp-2 group-hover:text-blue-400 transition-colors">
                    {article.title}
                  </h3>
                  
                  <p className="text-neutral-400 text-sm mb-4 line-clamp-3">
                    {article.summary}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {article.launches.length > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          Launch Related
                        </Badge>
                      )}
                      {article.events.length > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          Event
                        </Badge>
                      )}
                    </div>
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => window.open(article.url, '_blank')}
                      className="text-blue-400 hover:text-blue-300"
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      Read More
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && getCurrentArticles().length === 0 && (
          <div className="text-center py-12">
            <Newspaper className="w-16 h-16 text-neutral-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-neutral-300 mb-2">
              {activeTab === 'search' ? 'No search results found' : 'No news articles available'}
            </h3>
            <p className="text-neutral-400">
              {activeTab === 'search' 
                ? 'Try searching with different keywords'
                : 'Check back later for the latest space news updates'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}