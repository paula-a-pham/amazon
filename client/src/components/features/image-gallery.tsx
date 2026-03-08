import { useState } from 'react';
import { ImageOff } from 'lucide-react';
import type { ProductImage } from '@amazon-clone/shared/types';
import { useThemeStyles } from '@/stores/theme-store';

type ImageGalleryProps = {
  images: ProductImage[];
  productName: string;
};

export const ImageGallery = ({ images, productName }: ImageGalleryProps) => {
  const ts = useThemeStyles();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedImage = images[selectedIndex] ?? images[0];

  if (images.length === 0) {
    return (
      <div className="flex aspect-square flex-col items-center justify-center gap-2 rounded-lg bg-gray-100 text-gray-400">
        <ImageOff className="h-8 w-8" strokeWidth={1.5} />
        <span className="text-sm">No images available</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-center rounded-lg bg-gradient-to-b from-gray-50 to-gray-100/50 p-10">
        {selectedImage && <img src={selectedImage.url} alt={selectedImage.alt || productName} className="max-h-[420px] w-auto object-contain" />}
      </div>
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto" role="list" aria-label="Product thumbnails">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setSelectedIndex(index)}
              onMouseEnter={() => setSelectedIndex(index)}
              className={`shrink-0 overflow-hidden p-1.5 transition-all ${ts.thumbnail} ${index === selectedIndex ? 'border-amazon-blue' : 'border-transparent hover:border-gray-300'}`}
              aria-label={`View ${image.alt || `image ${index + 1} of ${productName}`}`}
              aria-current={index === selectedIndex ? 'true' : undefined}
              role="listitem"
            >
              <img src={image.url} alt={image.alt} className="h-16 w-16 object-contain sm:h-20 sm:w-20" loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
