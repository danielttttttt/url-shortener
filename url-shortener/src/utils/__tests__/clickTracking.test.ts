/**
 * Click Tracking Tests
 * Tests the enhanced click tracking functionality for URL redirects
 */

import { 
  updateClickStats, 
  incrementLinkClicks, 
  type ClickAnalytics 
} from '../database';
import { 
  handleRedirectWithAnalytics, 
  handleRedirectWithClickTracking,
  createRedirectAnalytics 
} from '../redirectUtils';

// Mock Firebase functions
jest.mock('../database', () => ({
  getLinkByShortCode: jest.fn(),
  updateClickStats: jest.fn(),
  incrementLinkClicks: jest.fn(),
}));

// Mock browser APIs
const mockNavigator = {
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  language: 'en-US',
  platform: 'Win32'
};

const mockDocument = {
  referrer: 'https://example.com/referrer'
};

const mockScreen = {
  width: 1920,
  height: 1080
};

const mockWindow = {
  innerWidth: 1366,
  innerHeight: 768
};

// Setup global mocks
Object.defineProperty(global, 'navigator', {
  value: mockNavigator,
  writable: true
});

Object.defineProperty(global, 'document', {
  value: mockDocument,
  writable: true
});

Object.defineProperty(global, 'screen', {
  value: mockScreen,
  writable: true
});

Object.defineProperty(global, 'window', {
  value: mockWindow,
  writable: true
});

// Mock Intl.DateTimeFormat
Object.defineProperty(global, 'Intl', {
  value: {
    DateTimeFormat: () => ({
      resolvedOptions: () => ({ timeZone: 'America/New_York' })
    })
  },
  writable: true
});

describe('Click Tracking Functionality', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('updateClickStats', () => {
    it('should update click statistics with analytics data', async () => {
      const mockUpdateClickStats = updateClickStats as jest.MockedFunction<typeof updateClickStats>;
      mockUpdateClickStats.mockResolvedValue();

      const linkId = 'test-link-id';
      const analytics: Partial<ClickAnalytics> = {
        userAgent: 'Test User Agent',
        referrer: 'https://test-referrer.com'
      };

      await updateClickStats(linkId, analytics);

      expect(mockUpdateClickStats).toHaveBeenCalledWith(linkId, analytics);
      expect(mockUpdateClickStats).toHaveBeenCalledTimes(1);
    });

    it('should handle updateClickStats without analytics data', async () => {
      const mockUpdateClickStats = updateClickStats as jest.MockedFunction<typeof updateClickStats>;
      mockUpdateClickStats.mockResolvedValue();

      const linkId = 'test-link-id';

      await updateClickStats(linkId);

      expect(mockUpdateClickStats).toHaveBeenCalledWith(linkId, undefined);
      expect(mockUpdateClickStats).toHaveBeenCalledTimes(1);
    });
  });

  describe('incrementLinkClicks', () => {
    it('should increment click count for a link', async () => {
      const mockIncrementLinkClicks = incrementLinkClicks as jest.MockedFunction<typeof incrementLinkClicks>;
      mockIncrementLinkClicks.mockResolvedValue();

      const linkId = 'test-link-id';

      await incrementLinkClicks(linkId);

      expect(mockIncrementLinkClicks).toHaveBeenCalledWith(linkId);
      expect(mockIncrementLinkClicks).toHaveBeenCalledTimes(1);
    });
  });

  describe('createRedirectAnalytics', () => {
    it('should create comprehensive analytics data in browser environment', () => {
      const shortCode = 'test123';
      const analytics = createRedirectAnalytics(shortCode);

      expect(analytics).toMatchObject({
        shortCode: 'test123',
        userAgent: mockNavigator.userAgent,
        referrer: mockDocument.referrer,
        screenResolution: '1920x1080',
        language: 'en-US',
        platform: 'Win32',
        viewport: '1366x768',
        timezone: 'America/New_York'
      });

      expect(analytics.timestamp).toBeDefined();
      expect(typeof analytics.timestamp).toBe('string');
    });

    it('should handle custom userAgent and referrer', () => {
      const shortCode = 'test123';
      const customUserAgent = 'Custom User Agent';
      const customReferrer = 'https://custom-referrer.com';

      const analytics = createRedirectAnalytics(shortCode, customUserAgent, customReferrer);

      expect(analytics.userAgent).toBe(customUserAgent);
      expect(analytics.referrer).toBe(customReferrer);
      expect(analytics.shortCode).toBe(shortCode);
    });
  });

  describe('handleRedirectWithAnalytics', () => {
    it('should handle redirect with analytics tracking enabled', async () => {
      const { getLinkByShortCode } = require('../database');
      const mockGetLinkByShortCode = getLinkByShortCode as jest.MockedFunction<typeof getLinkByShortCode>;
      const mockUpdateClickStats = updateClickStats as jest.MockedFunction<typeof updateClickStats>;

      const mockLink = {
        id: 'test-link-id',
        originalUrl: 'https://example.com',
        shortCode: 'test123',
        clicks: 5,
        createdAt: { toDate: () => new Date('2023-01-01') },
        userId: 'test-user'
      };

      mockGetLinkByShortCode.mockResolvedValue(mockLink);
      mockUpdateClickStats.mockResolvedValue();

      const result = await handleRedirectWithAnalytics('test123', true);

      expect(result.success).toBe(true);
      expect(result.originalUrl).toBe('https://example.com');
      expect(result.linkData).toMatchObject({
        id: 'test-link-id',
        originalUrl: 'https://example.com',
        shortCode: 'test123',
        clicks: 6, // Incremented
      });

      expect(mockGetLinkByShortCode).toHaveBeenCalledWith('test123');
      expect(mockUpdateClickStats).toHaveBeenCalled();
    });

    it('should handle redirect with analytics tracking disabled', async () => {
      const { getLinkByShortCode } = require('../database');
      const mockGetLinkByShortCode = getLinkByShortCode as jest.MockedFunction<typeof getLinkByShortCode>;
      const mockUpdateClickStats = updateClickStats as jest.MockedFunction<typeof updateClickStats>;

      const mockLink = {
        id: 'test-link-id',
        originalUrl: 'https://example.com',
        shortCode: 'test123',
        clicks: 5,
        createdAt: { toDate: () => new Date('2023-01-01') },
        userId: 'test-user'
      };

      mockGetLinkByShortCode.mockResolvedValue(mockLink);
      mockUpdateClickStats.mockResolvedValue();

      const result = await handleRedirectWithAnalytics('test123', false);

      expect(result.success).toBe(true);
      expect(mockUpdateClickStats).toHaveBeenCalled(); // Still called for click tracking
    });

    it('should handle non-existent short code', async () => {
      const { getLinkByShortCode } = require('../database');
      const mockGetLinkByShortCode = getLinkByShortCode as jest.MockedFunction<typeof getLinkByShortCode>;

      mockGetLinkByShortCode.mockResolvedValue(null);

      const result = await handleRedirectWithAnalytics('nonexistent');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Link not found');
      expect(result.originalUrl).toBeUndefined();
    });

    it('should handle invalid short code', async () => {
      const result = await handleRedirectWithAnalytics('');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid short code');
    });
  });

  describe('handleRedirectWithClickTracking', () => {
    it('should handle click tracking with fallback on error', async () => {
      const { getLinkByShortCode } = require('../database');
      const mockGetLinkByShortCode = getLinkByShortCode as jest.MockedFunction<typeof getLinkByShortCode>;
      const mockUpdateClickStats = updateClickStats as jest.MockedFunction<typeof updateClickStats>;
      const mockIncrementLinkClicks = incrementLinkClicks as jest.MockedFunction<typeof incrementLinkClicks>;

      const mockLink = {
        id: 'test-link-id',
        originalUrl: 'https://example.com',
        shortCode: 'test123',
        clicks: 5,
        createdAt: { toDate: () => new Date('2023-01-01') },
        userId: 'test-user'
      };

      mockGetLinkByShortCode.mockResolvedValue(mockLink);
      mockUpdateClickStats.mockRejectedValue(new Error('Update failed'));
      mockIncrementLinkClicks.mockResolvedValue();

      const analyticsData = {
        userAgent: 'Test Agent',
        referrer: 'https://test.com'
      };

      const result = await handleRedirectWithClickTracking('test123', analyticsData);

      expect(result.success).toBe(true);
      expect(mockUpdateClickStats).toHaveBeenCalled();
      expect(mockIncrementLinkClicks).toHaveBeenCalled(); // Fallback called
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      const { getLinkByShortCode } = require('../database');
      const mockGetLinkByShortCode = getLinkByShortCode as jest.MockedFunction<typeof getLinkByShortCode>;

      mockGetLinkByShortCode.mockRejectedValue(new Error('Database error'));

      const result = await handleRedirectWithAnalytics('test123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('An error occurred while processing the redirect');
    });
  });
});
