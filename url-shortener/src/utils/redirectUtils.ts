import { getLinkByShortCode, incrementLinkClicks } from './database';

export interface RedirectResult {
  success: boolean;
  originalUrl?: string;
  error?: string;
  linkData?: {
    id: string;
    originalUrl: string;
    shortCode: string;
    clicks: number;
    createdAt: Date;
  };
}

/**
 * Handles the complete redirect process for a short code
 * @param shortCode - The short code to redirect
 * @returns Promise<RedirectResult> - The result of the redirect operation
 */
export const handleRedirect = async (shortCode: string): Promise<RedirectResult> => {
  try {
    // Validate short code
    if (!shortCode || shortCode.trim().length === 0) {
      return {
        success: false,
        error: 'Invalid short code'
      };
    }

    // Query the database for the short code
    const link = await getLinkByShortCode(shortCode.trim());

    if (!link) {
      return {
        success: false,
        error: 'Link not found'
      };
    }

    try {
      await incrementLinkClicks(link.id!);
    } catch (clickError) {
      console.warn('Failed to increment click count:', clickError);
    }

    return {
      success: true,
      originalUrl: link.originalUrl,
      linkData: {
        id: link.id!,
        originalUrl: link.originalUrl,
        shortCode: link.shortCode,
        clicks: link.clicks + 1,
        createdAt: link.createdAt.toDate()
      }
    };

  } catch (error) {
    console.error('Error in handleRedirect:', error);
    return {
      success: false,
      error: 'An error occurred while processing the redirect'
    };
  }
};

/**
 * Performs the actual browser redirect
 * @param url - The URL to redirect to
 * @param delay - Optional delay in milliseconds before redirect (default: 0)
 */
export const performRedirect = (url: string, delay: number = 0): void => {
  if (delay > 0) {
    setTimeout(() => {
      window.location.href = url;
    }, delay);
  } else {
    window.location.href = url;
  }
};

/**
 * Validates if a string could be a valid short code
 * @param shortCode - The string to validate
 * @returns boolean - True if it could be a valid short code
 */
export const isValidShortCodeFormat = (shortCode: string): boolean => {
  if (!shortCode || shortCode.trim().length === 0) {
    return false;
  }

  // Check length (should be reasonable)
  if (shortCode.length < 1 || shortCode.length > 50) {
    return false;
  }

  // Check for valid characters (alphanumeric, hyphens, underscores)
  const validPattern = /^[A-Za-z0-9_-]+$/;
  return validPattern.test(shortCode);
};

/**
 * Extracts short code from various URL formats
 * @param url - The URL to extract from
 * @returns string | null - The extracted short code or null
 */
export const extractShortCodeFromUrl = (url: string): string | null => {
  try {
    const urlObj = new URL(url);
    const pathSegments = urlObj.pathname.split('/').filter(segment => segment.length > 0);
    
    if (pathSegments.length > 0) {
      const potentialShortCode = pathSegments[0];
      return isValidShortCodeFormat(potentialShortCode) ? potentialShortCode : null;
    }
    
    return null;
  } catch {
    // If URL parsing fails, try to extract from string directly
    const segments = url.split('/').filter(segment => segment.length > 0);
    if (segments.length > 0) {
      const lastSegment = segments[segments.length - 1];
      return isValidShortCodeFormat(lastSegment) ? lastSegment : null;
    }
    return null;
  }
};

/**
 * Creates a redirect analytics object for tracking
 * @param shortCode - The short code being accessed
 * @param userAgent - The user agent string
 * @param referrer - The referrer URL
 * @returns object - Analytics data
 */
export const createRedirectAnalytics = (
  shortCode: string,
  userAgent?: string,
  referrer?: string
) => {
  return {
    shortCode,
    timestamp: new Date().toISOString(),
    userAgent: userAgent || navigator.userAgent,
    referrer: referrer || document.referrer,
    // Add more analytics data as needed
    screenResolution: `${screen.width}x${screen.height}`,
    language: navigator.language,
    platform: navigator.platform
  };
};

/**
 * Handles redirect with analytics tracking
 * @param shortCode - The short code to redirect
 * @param trackAnalytics - Whether to track analytics (default: true)
 * @returns Promise<RedirectResult> - The result of the redirect operation
 */
export const handleRedirectWithAnalytics = async (
  shortCode: string,
  trackAnalytics: boolean = true
): Promise<RedirectResult> => {
  // Track analytics if enabled
  if (trackAnalytics) {
    try {
      const analytics = createRedirectAnalytics(shortCode);
      console.log('Redirect analytics:', analytics);
      // Here you could send analytics to your tracking service
    } catch (error) {
      console.warn('Failed to track analytics:', error);
    }
  }

  // Perform the redirect
  return handleRedirect(shortCode);
};

/**
 * Checks if the current environment supports redirects
 * @returns boolean - True if redirects are supported
 */
export const supportsRedirect = (): boolean => {
  return typeof window !== 'undefined' && typeof window.location !== 'undefined';
};

/**
 * Safe redirect that checks environment support
 * @param url - The URL to redirect to
 * @param delay - Optional delay in milliseconds
 * @returns boolean - True if redirect was attempted
 */
export const safeRedirect = (url: string, delay: number = 0): boolean => {
  if (!supportsRedirect()) {
    console.warn('Redirect not supported in current environment');
    return false;
  }

  try {
    performRedirect(url, delay);
    return true;
  } catch (error) {
    console.error('Failed to perform redirect:', error);
    return false;
  }
};
