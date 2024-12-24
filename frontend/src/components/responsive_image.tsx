import { useEffect, useState } from "react";
import Image from "next/image";

interface ResponsiveImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string; // Optional fallback image
  onClick?: () => void;
}

const ResponsiveImage = ({
  src,
  alt,
  className = "",
  fallbackSrc = "/placeholder.png",
  onClick,
}: ResponsiveImageProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isValidating, setIsValidating] = useState(true);

  // Pre-validate image url
  const validateImage = async (url: string) => {
    try {
      const img = new window.Image();
      img.src = url;
      await img.decode();

      setIsValidating(false);
      return true;
    } catch {
      setIsValidating(false);
      setHasError(true);
      return false;
    }
  };

  // Validate on mount
  useEffect(() => {
    validateImage(src);
  }, [src]);

  if (isValidating) {
    return (
      <div className="relative w-full h-48 bg-gray-100 animate-pulse rounded-md" />
    );
  }

  if (hasError) {
    return (
      <div className="relative w-full h-48">
        <Image
          src={fallbackSrc}
          alt={`Fallback for ${alt}`}
          fill
          className="object-cover rounded-md"
        />
      </div>
    );
  }

  return (
    <div className={`relative w-full ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse rounded-md" />
      )}

      <Image
        src={src}
        alt={alt}
        fill
        loading="lazy"
        className={`
            object-cover rounded-md
            transition-opacity duration-300
            ${isLoading ? "opacity-0" : "opacity-100"}
          `}
        onLoad={() => setIsLoading(false)}
        onError={() => setHasError(true)}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        onClick={onClick}
      />
    </div>
  );
};

export default ResponsiveImage;
