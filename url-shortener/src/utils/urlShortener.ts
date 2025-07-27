import { 
  createLink, 
  shortCodeExists, 
  generateUniqueShortCode, 
  validateShortCode,
  type CreateLinkData 
} from './database';

export interface ShortenUrlRequest {
  originalUrl: string;
  customShortCode?: string;
  userId: string;
}

export interface ShortenUrlResponse {
  success: boolean;
  data?: {
    id: string;
    originalUrl: string;
    shortCode: string;
    shortUrl: string;
    createdAt: Date;
  };
  error?: string;
}

// Configuration
const BASE_URL = window.location.origin; // Will be something like https://yourdomain.com

/**
 * Validates a URL format
 * @param url - The URL to validate
 * @returns boolean - True if valid, false otherwise
 */
export const isValidUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
};

/**
 * Formats a URL to ensure it has a protocol
 * @param url - The URL to format
 * @returns string - The formatted URL
 */
export const formatUrl = (url: string): string => {
  if (!url) return '';
  
  // Remove whitespace
  url = url.trim();
  
  // Add https:// if no protocol is present
  if (!url.match(/^https?:\/\//)) {
    url = 'https://' + url;
  }
  
  return url;
};

/**
 * Main function to shorten a URL with either custom or random short code
 * @param request - The shortening request
 * @returns Promise<ShortenUrlResponse> - The result of the shortening operation
 */
export const shortenUrl = async (request: ShortenUrlRequest): Promise<ShortenUrlResponse> => {
  try {
    // Validate and format the original URL
    const formattedUrl = formatUrl(request.originalUrl);
    
    if (!isValidUrl(formattedUrl)) {
      return {
        success: false,
        error: 'Please enter a valid URL (e.g., https://example.com)'
      };
    }

    let shortCode: string;
    
    // Handle custom short code
    if (request.customShortCode && request.customShortCode.trim()) {
      const customCode = request.customShortCode.trim();
      
      // Validate custom short code format
      const validation = validateShortCode(customCode);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.error
        };
      }
      
      // Check if custom short code already exists
      const exists = await shortCodeExists(customCode);
      if (exists) {
        return {
          success: false,
          error: 'This short code is already taken. Please choose a different one.'
        };
      }
      
      shortCode = customCode;
    } else {
      // Generate random short code
      try {
        shortCode = await generateUniqueShortCode();
      } catch (error) {
        return {
          success: false,
          error: 'Failed to generate a unique short code. Please try again.'
        };
      }
    }

    // Create the link in the database
    const linkData: CreateLinkData = {
      originalUrl: formattedUrl,
      shortCode,
      userId: request.userId
    };

    const linkId = await createLink(linkData);

    // Return success response
    return {
      success: true,
      data: {
        id: linkId,
        originalUrl: formattedUrl,
        shortCode,
        shortUrl: `${BASE_URL}/${shortCode}`,
        createdAt: new Date()
      }
    };

  } catch (error) {
    console.error('Error shortening URL:', error);
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.'
    };
  }
};

/**
 * Shortens a URL for anonymous users (without authentication)
 * This creates a link with a temporary user ID
 * @param originalUrl - The URL to shorten
 * @param customShortCode - Optional custom short code
 * @returns Promise<ShortenUrlResponse> - The result of the shortening operation
 */
export const shortenUrlAnonymous = async (
  originalUrl: string, 
  customShortCode?: string
): Promise<ShortenUrlResponse> => {
  // For anonymous users, we'll use a temporary user ID
  // In a real application, you might want to handle this differently
  const anonymousUserId = 'anonymous-' + Date.now();
  
  return shortenUrl({
    originalUrl,
    customShortCode,
    userId: anonymousUserId
  });
};

/**
 * Batch shortening for multiple URLs
 * @param requests - Array of shortening requests
 * @returns Promise<ShortenUrlResponse[]> - Array of results
 */
export const shortenMultipleUrls = async (
  requests: ShortenUrlRequest[]
): Promise<ShortenUrlResponse[]> => {
  const results: ShortenUrlResponse[] = [];
  
  for (const request of requests) {
    try {
      const result = await shortenUrl(request);
      results.push(result);
    } catch (error) {
      results.push({
        success: false,
        error: 'Failed to process this URL'
      });
    }
  }
  
  return results;
};

/**
 * Gets the full short URL from a short code
 * @param shortCode - The short code
 * @returns string - The full short URL
 */
export const getShortUrl = (shortCode: string): string => {
  return `${BASE_URL}/${shortCode}`;
};

/**
 * Extracts short code from a full short URL
 * @param shortUrl - The full short URL
 * @returns string | null - The short code or null if invalid
 */
export const extractShortCode = (shortUrl: string): string | null => {
  try {
    const url = new URL(shortUrl);
    const pathSegments = url.pathname.split('/').filter(segment => segment.length > 0);
    return pathSegments.length > 0 ? pathSegments[0] : null;
  } catch {
    return null;
  }
};
