    import { useState, useEffect } from 'react';

// The size of the small image to generate.
// 10x10 pixels is small enough to be fast and
// large enough to capture the image's "vibe".
const PLAINTEXT_PLACEHOLDER_SIZE = 10;

/**
 * Creates a tiny, Base64-encoded data URL from a full-size image URL.
 * This runs in the browser and is used for client-side blur-up placeholders.
 */
function createBlurDataURL(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    
    // This is CRITICAL for external images.
    // If the image is not from the same origin, you'll get a "tainted canvas" error.
    // This setting tells the browser to request cross-origin access.
    // The server *must* respond with 'Access-Control-Allow-Origin: *'
    image.crossOrigin = 'Anonymous';

    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = PLAINTEXT_PLACEHOLDER_SIZE;
      canvas.height = PLAINTEXT_PLACEHOLDER_SIZE;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return reject(new Error('Could not get canvas context.'));
      }

      // Draw the image scaled down to the tiny canvas
      ctx.drawImage(image, 0, 0, PLAINTEXT_PLACEHOLDER_SIZE, PLAINTEXT_PLACEHOLDER_SIZE);

      // Get the data URL.
      // Use a low-quality JPEG for the smallest possible file size.
      // 0.2 = 20% quality
      const dataUrl = canvas.toDataURL('image/jpeg', 0.2); 
      resolve(dataUrl);
    };

    image.onerror = (err) => {
      reject(err);
    };

    image.src = url;
  });
}

/**
 * React hook to generate a blurDataURL from an image URL on the client-side.
 * Used for dynamic images where the placeholder can't be generated at build time.
 *
 * @param url The full-size image URL to blur.
 * @returns An object with the { blurDataURL, isLoading, error }
 */
export function useDynamicBlurData(url: string | null | undefined) {
  const [blurDataURL, setBlurDataURL] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Flag to prevent state updates on an unmounted component
    let isMounted = true;
    
    async function generate() {
      if (!url) {
        // Reset states if URL is null or undefined
        setIsLoading(false);
        setBlurDataURL(null);
        setError(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const dataUrl = await createBlurDataURL(url);
        if (isMounted) {
          setBlurDataURL(dataUrl);
        }
      } catch (e) {
        if (isMounted) {
          setError(e as Error);
        }
        console.error('Failed to generate blur data URL:', e);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    generate();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [url]); // Re-run whenever the URL changes

  return { blurDataURL, isLoading, error };
}