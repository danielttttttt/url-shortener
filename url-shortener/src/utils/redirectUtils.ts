import { getLinkByShortCode, incrementLinkClicks, updateClickStats, type ClickAnalytics } from './database';

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
    lastClickedAt?: Date;
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

    // Update click statistics with basic analytics
    try {
      const clickAnalytics: Partial<ClickAnalytics> = {
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
        referrer: typeof document !== 'undefined' ? document.referrer : undefined,
      };

      await updateClickStats(link.id!, clickAnalytics);
    } catch (clickError) {
      console.warn('Failed to update click statistics:', clickError);
      // Fallback to basic click increment if detailed tracking fails
      try {
        await incrementLinkClicks(link.id!);
      } catch (fallbackError) {
        console.warn('Failed to increment click count (fallback):', fallbackError);
      }
    }

    return {
      success: true,
      originalUrl: link.originalUrl,
      linkData: {
        id: link.id!,
        originalUrl: link.originalUrl,
        shortCode: link.shortCode,
        clicks: link.clicks + 1,
        createdAt: link.createdAt.toDate(),
        lastClickedAt: new Date() // Current timestamp since we just updated it
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
  const analytics = {
    shortCode,
    timestamp: new Date().toISOString(),
    userAgent: userAgent || (typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown'),
    referrer: referrer || (typeof document !== 'undefined' ? document.referrer : ''),
  };

  // Add additional analytics data if available (browser environment)
  if (typeof window !== 'undefined') {
    return {
      ...analytics,
      screenResolution: typeof screen !== 'undefined' ? `${screen.width}x${screen.height}` : 'Unknown',
      language: typeof navigator !== 'undefined' ? navigator.language : 'Unknown',
      platform: typeof navigator !== 'undefined' ? navigator.platform : 'Unknown',
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
  }

  return analytics;
};

/**
 * Handles redirect with enhanced analytics tracking
 * @param shortCode - The short code to redirect
 * @param trackAnalytics - Whether to track analytics (default: true)
 * @returns Promise<RedirectResult> - The result of the redirect operation
 */
export const handleRedirectWithAnalytics = async (
  shortCode: string,
  trackAnalytics: boolean = true
): Promise<RedirectResult> => {
  let analyticsData: any = null;

  // Collect analytics data if enabled
  if (trackAnalytics) {
    try {
      analyticsData = createRedirectAnalytics(shortCode);
      console.log('📊 Redirect analytics collected:', analyticsData);
    } catch (error) {
      console.warn('Failed to collect analytics:', error);
    }
  }

  // Perform the redirect with enhanced tracking
  return handleRedirectWithClickTracking(shortCode, analyticsData);
};

/**
 * Enhanced redirect handler that includes detailed click tracking
 * @param shortCode - The short code to redirect
 * @param analyticsData - Optional analytics data to include
 * @returns Promise<RedirectResult> - The result of the redirect operation
 */
export const handleRedirectWithClickTracking = async (
  shortCode: string,
  analyticsData?: any
): Promise<RedirectResult> => {
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

    // Update click statistics with enhanced analytics
    try {
      const clickAnalytics: Partial<ClickAnalytics> = {
        userAgent: analyticsData?.userAgent,
        referrer: analyticsData?.referrer,
        // Additional analytics fields can be added here
      };

      await updateClickStats(link.id!, clickAnalytics);
      console.log('✅ Click statistics updated successfully');
    } catch (clickError) {
      console.warn('⚠️ Failed to update detailed click statistics:', clickError);
      // Fallback to basic click increment
      try {
        await incrementLinkClicks(link.id!);
        console.log('✅ Basic click count updated (fallback)');
      } catch (fallbackError) {
        console.warn('❌ Failed to update click count (fallback):', fallbackError);
      }
    }

    return {
      success: true,
      originalUrl: link.originalUrl,
      linkData: {
        id: link.id!,
        originalUrl: link.originalUrl,
        shortCode: link.shortCode,
        clicks: link.clicks + 1, // Show incremented count
        createdAt: link.createdAt.toDate(),
        lastClickedAt: new Date() // Current timestamp since we just updated it
      }
    };

  } catch (error) {
    console.error('Error in handleRedirectWithClickTracking:', error);
    return {
      success: false,
      error: 'An error occurred while processing the redirect'
    };
  }
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
