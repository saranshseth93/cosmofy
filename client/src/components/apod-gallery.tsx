import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Star, Rocket, Globe, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { LottieLoader } from '@/components/lottie-loader';
import { useGSAP } from '@/hooks/use-gsap';
import { ApodImage } from '@/types/space';

interface APODGalleryProps {
  id?: string;
}

export function APODGallery({ id = "gallery" }: APODGalleryProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedFilter, setSelectedFilter] = useState('latest');
  const sectionRef = useGSAP();

  const { data: allImages, isLoading, error } = useQuery<ApodImage[]>({
    queryKey: ['/api/apod'],
    queryFn: async () => {
      const response = await fetch('/api/apod');
      if (!response.ok) {
        throw new Error('Failed to fetch APOD images');
      }
      return response.json();
    },
  });

  const filters = [
    { id: 'latest', label: 'Latest', icon: Calendar },
    { id: 'popular', label: 'Most Popular', icon: Star },
    { id: 'missions', label: 'Space Missions', icon: Rocket },
    { id: 'earth', label: 'Earth Views', icon: Globe },
  ];

  // Filter and sort all images based on selected filter
  const getFilteredImages = (images: ApodImage[]) => {
    if (!images) return [];
    
    let filtered = [...images];
    
    switch (selectedFilter) {
      case 'latest':
        filtered = filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        break;
      case 'popular':
        filtered = filtered.filter(img => 
          img.title.toLowerCase().includes('nebula') ||
          img.title.toLowerCase().includes('galaxy') ||
          img.title.toLowerCase().includes('planet') ||
          img.title.toLowerCase().includes('star')
        ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        break;
      case 'missions':
        filtered = filtered.filter(img => 
          img.title.toLowerCase().includes('mission') ||
          img.title.toLowerCase().includes('spacecraft') ||
          img.title.toLowerCase().includes('rover') ||
          img.title.toLowerCase().includes('satellite') ||
          img.title.toLowerCase().includes('probe') ||
          img.title.toLowerCase().includes('telescope') ||
          img.title.toLowerCase().includes('hubble') ||
          img.title.toLowerCase().includes('james webb') ||
          img.title.toLowerCase().includes('perseverance') ||
          img.title.toLowerCase().includes('curiosity')
        ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        break;
      case 'earth':
        filtered = filtered.filter(img => 
          img.title.toLowerCase().includes('earth') ||
          img.title.toLowerCase().includes('aurora') ||
          img.title.toLowerCase().includes('northern lights') ||
          img.title.toLowerCase().includes('southern lights') ||
          img.title.toLowerCase().includes('atmosphere') ||
          img.title.toLowerCase().includes('blue marble')
        ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        break;
      default:
        filtered = filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
    
    return filtered;
  };

  const filteredImages = getFilteredImages(allImages || []);
  const itemsPerPage = 12;
  const totalPages = Math.ceil(filteredImages.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentImages = filteredImages.slice(startIndex, endIndex);

  // Reset to page 1 when filter changes
  const handleFilterChange = (filterId: string) => {
    setSelectedFilter(filterId);
    setCurrentPage(1);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  if (error) {
    return (
      <section id={id} className="py-20 bg-gradient-to-b from-[hsl(222,47%,8%)] to-[hsl(217,91%,29%)]">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <h2 className="text-5xl font-orbitron font-bold mb-6 text-gradient">
              Astronomy Picture of the Day
            </h2>
            <p className="text-red-400">Failed to load images. Please try again later.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section 
      id={id}
      ref={sectionRef}
      className="py-20 bg-gradient-to-b from-[hsl(222,47%,8%)] to-[hsl(217,91%,29%)] section-reveal"
    >
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-orbitron font-bold mb-6 text-gradient">
            Astronomy Picture of the Day
          </h2>
          <p className="text-xl opacity-80 max-w-2xl mx-auto">
            Discover the cosmos through NASA's daily featured astronomical images, carefully curated and explained by professional astronomers.
          </p>
        </div>

        {/* Gallery Controls */}
        <div className="mb-12">
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {filters.map((filter) => {
              const Icon = filter.icon;
              return (
                <Button
                  key={filter.id}
                  variant={selectedFilter === filter.id ? "default" : "secondary"}
                  onClick={() => handleFilterChange(filter.id)}
                  className="glass-effect hover:bg-[hsl(158,76%,36%)] hover:bg-opacity-20 transition-all duration-300"
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {filter.label}
                  <Badge className="ml-2 text-xs" variant="secondary">
                    {getFilteredImages(allImages || []).length}
                  </Badge>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="mb-12">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <LottieLoader size={120} className="mb-6" />
              <p className="text-lg opacity-70 mb-4">Loading cosmic imagery...</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Card key={index} className="glass-effect">
                    <Skeleton className="w-full h-64" />
                    <CardContent className="p-6">
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2 mb-3" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-2/3" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {currentImages?.map((image) => (
                <Card 
                  key={image.id}
                  className="glass-effect rounded-2xl overflow-hidden hover:scale-105 transform transition-all duration-500 group"
                >
                  <div className="relative">
                    <img 
                      src={image.url}
                      alt={image.title}
                      className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                    />
                    {image.copyright && (
                      <Badge className="absolute top-2 right-2 bg-black bg-opacity-50">
                        © {image.copyright}
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-2">{image.title}</h3>
                    <p className="text-sm opacity-80 mb-3">{formatDate(image.date)}</p>
                    <p className="text-sm opacity-70 leading-relaxed">
                      {truncateText(image.explanation, 120)}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {!isLoading && filteredImages && filteredImages.length > 0 && totalPages > 1 && (
          <div className="flex justify-center items-center space-x-4">
            <Button
              variant="secondary"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="glass-effect hover:bg-[hsl(158,76%,36%)] hover:bg-opacity-20"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex space-x-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.max(1, Math.min(totalPages, currentPage - 2 + i));
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "secondary"}
                    onClick={() => setCurrentPage(pageNum)}
                    className={currentPage === pageNum ? "bg-[hsl(158,76%,36%)]" : "glass-effect"}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            
            <Button
              variant="secondary"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="glass-effect hover:bg-[hsl(158,76%,36%)] hover:bg-opacity-20"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
