import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Star, Rocket, Globe, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useGSAP } from '@/hooks/use-gsap';
import { ApodImage } from '@/types/space';

interface APODGalleryProps {
  id?: string;
}

export function APODGallery({ id = "gallery" }: APODGalleryProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedFilter, setSelectedFilter] = useState('latest');
  const sectionRef = useGSAP();

  const { data: images, isLoading, error } = useQuery<ApodImage[]>({
    queryKey: ['/api/apod', currentPage],
    queryFn: async () => {
      const response = await fetch(`/api/apod?page=${currentPage}&limit=6`);
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
                  onClick={() => setSelectedFilter(filter.id)}
                  className="glass-effect hover:bg-[hsl(158,76%,36%)] hover:bg-opacity-20 transition-all duration-300"
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {filter.label}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="mb-12">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {images?.map((image) => (
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
        {!isLoading && images && images.length > 0 && (
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
              {[1, 2, 3].map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "secondary"}
                  onClick={() => setCurrentPage(page)}
                  className={currentPage === page ? "bg-[hsl(158,76%,36%)]" : "glass-effect"}
                >
                  {page}
                </Button>
              ))}
            </div>
            
            <Button
              variant="secondary"
              onClick={() => setCurrentPage(prev => prev + 1)}
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
