import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Download, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageData {
  id: string;
  url: string;
  title: string;
  caption?: string;
  category: 'crop' | 'variety' | 'pest' | 'disease' | 'cultivation';
  isPrimary?: boolean;
}

interface ImageGalleryProps {
  images: ImageData[];
  title?: string;
  className?: string;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ 
  images, 
  title = "Image Gallery",
  className 
}) => {
  const [selectedImage, setSelectedImage] = useState<number>(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Filter images by category
  const filteredImages = selectedCategory === 'all' 
    ? images 
    : images.filter(img => img.category === selectedCategory);

  // Get unique categories
  const categories = ['all', ...new Set(images.map(img => img.category))];

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % filteredImages.length);
  };

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + filteredImages.length) % filteredImages.length);
  };

  const downloadImage = (imageUrl: string, title: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `${title.replace(/\s+/g, '_').toLowerCase()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (images.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center text-muted-foreground">
            <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No images available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h3 className="text-2xl font-bold">{title}</h3>
        
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setSelectedCategory(category);
                setSelectedImage(0);
              }}
              className="capitalize"
            >
              {category === 'all' ? 'All Images' : category}
              <Badge variant="secondary" className="ml-2">
                {category === 'all' ? images.length : images.filter(img => img.category === category).length}
              </Badge>
            </Button>
          ))}
        </div>
      </div>

      {filteredImages.length > 0 ? (
        <>
          {/* Main Gallery Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredImages.map((image, index) => (
              <Dialog key={image.id}>
                <DialogTrigger asChild>
                  <Card 
                    className="group cursor-pointer hover:shadow-lg transition-all duration-300 overflow-hidden"
                    onClick={() => setSelectedImage(index)}
                  >
                    <CardContent className="p-0 relative">
                      <div className="aspect-square relative overflow-hidden">
                        <img
                          src={image.url}
                          alt={image.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/placeholder.svg';
                          }}
                        />
                        {image.isPrimary && (
                          <Badge className="absolute top-2 left-2 bg-primary">
                            Primary
                          </Badge>
                        )}
                        <Badge 
                          variant="secondary" 
                          className="absolute top-2 right-2 capitalize"
                        >
                          {image.category}
                        </Badge>
                        
                        {/* Overlay on hover */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <Eye className="h-8 w-8 text-white" />
                        </div>
                      </div>
                      
                      <div className="p-3">
                        <h4 className="font-medium text-sm truncate">{image.title}</h4>
                        {image.caption && (
                          <p className="text-xs text-muted-foreground truncate mt-1">
                            {image.caption}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </DialogTrigger>
                
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
                  <div className="space-y-4">
                    {/* Image Navigation */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={prevImage}
                          disabled={filteredImages.length <= 1}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm text-muted-foreground">
                          {selectedImage + 1} of {filteredImages.length}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={nextImage}
                          disabled={filteredImages.length <= 1}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadImage(
                          filteredImages[selectedImage].url,
                          filteredImages[selectedImage].title
                        )}
                        className="flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </Button>
                    </div>
                    
                    {/* Main Image */}
                    <div className="relative">
                      <img
                        src={filteredImages[selectedImage]?.url}
                        alt={filteredImages[selectedImage]?.title}
                        className="w-full max-h-[60vh] object-contain rounded-lg"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder.svg';
                        }}
                      />
                    </div>
                    
                    {/* Image Details */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-semibold">
                          {filteredImages[selectedImage]?.title}
                        </h3>
                        <Badge className="capitalize">
                          {filteredImages[selectedImage]?.category}
                        </Badge>
                        {filteredImages[selectedImage]?.isPrimary && (
                          <Badge variant="secondary">Primary Image</Badge>
                        )}
                      </div>
                      
                      {filteredImages[selectedImage]?.caption && (
                        <p className="text-muted-foreground">
                          {filteredImages[selectedImage].caption}
                        </p>
                      )}
                    </div>
                    
                    {/* Thumbnail Navigation */}
                    {filteredImages.length > 1 && (
                      <div className="grid grid-cols-6 sm:grid-cols-8 lg:grid-cols-10 gap-2 max-h-24 overflow-y-auto">
                        {filteredImages.map((img, idx) => (
                          <button
                            key={img.id}
                            onClick={() => setSelectedImage(idx)}
                            className={cn(
                              "aspect-square rounded-md overflow-hidden border-2 transition-all",
                              selectedImage === idx 
                                ? "border-primary ring-2 ring-primary/20" 
                                : "border-transparent hover:border-muted-foreground"
                            )}
                          >
                            <img
                              src={img.url}
                              alt={img.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = '/placeholder.svg';
                              }}
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            ))}
          </div>
        </>
      ) : (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center text-muted-foreground">
              <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No images found for the selected category</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ImageGallery;