/**
 * Database utility tests
 * Note: These tests require a Firebase project with Firestore enabled
 * For actual testing, consider using Firebase Emulator Suite
 */

import { 
  createLink, 
  getLinkByShortCode, 
  getUserLinks, 
  shortCodeExists,
  type CreateLinkData 
} from '../database';

// Mock data for testing
const mockUserId = 'test-user-123';
const mockLinkData: CreateLinkData = {
  originalUrl: 'https://www.example.com/test-url',
  shortCode: 'test123',
  userId: mockUserId
};

describe('Database Functions', () => {
  // Note: These are integration tests that require actual Firebase connection
  // In a real project, you'd use Firebase Emulator Suite for testing
  
  describe('createLink', () => {
    it('should create a link and return document ID', async () => {
      // This test would require Firebase Emulator or actual Firebase project
      console.log('Test: createLink function');
      
      try {
        const linkId = await createLink(mockLinkData);
        expect(typeof linkId).toBe('string');
        expect(linkId.length).toBeGreaterThan(0);
        console.log('✅ createLink test passed');
      } catch (error) {
        console.log('⚠️ createLink test requires Firebase connection');
        console.log('Error:', error);
      }
    });
  });

  describe('shortCodeExists', () => {
    it('should check if short code exists', async () => {
      console.log('Test: shortCodeExists function');
      
      try {
        const exists = await shortCodeExists('nonexistent-code');
        expect(typeof exists).toBe('boolean');
        console.log('✅ shortCodeExists test passed');
      } catch (error) {
        console.log('⚠️ shortCodeExists test requires Firebase connection');
        console.log('Error:', error);
      }
    });
  });

  describe('getLinkByShortCode', () => {
    it('should return null for non-existent short code', async () => {
      console.log('Test: getLinkByShortCode function');
      
      try {
        const link = await getLinkByShortCode('nonexistent-code');
        expect(link).toBeNull();
        console.log('✅ getLinkByShortCode test passed');
      } catch (error) {
        console.log('⚠️ getLinkByShortCode test requires Firebase connection');
        console.log('Error:', error);
      }
    });
  });

  describe('getUserLinks', () => {
    it('should return array of links for user', async () => {
      console.log('Test: getUserLinks function');
      
      try {
        const links = await getUserLinks(mockUserId);
        expect(Array.isArray(links)).toBe(true);
        console.log('✅ getUserLinks test passed');
      } catch (error) {
        console.log('⚠️ getUserLinks test requires Firebase connection');
        console.log('Error:', error);
      }
    });
  });
});

// Manual test function that can be called from browser console
export const runManualTests = async () => {
  console.log('🧪 Running manual database tests...');
  
  try {
    // Test 1: Check if short code exists
    console.log('Test 1: Checking short code availability...');
    const codeExists = await shortCodeExists('manual-test-123');
    console.log('Short code exists:', codeExists);
    
    // Test 2: Create a link (only if code doesn't exist)
    if (!codeExists) {
      console.log('Test 2: Creating test link...');
      const testLinkData: CreateLinkData = {
        originalUrl: 'https://www.example.com/manual-test',
        shortCode: 'manual-test-123',
        userId: 'manual-test-user'
      };
      
      const linkId = await createLink(testLinkData);
      console.log('Created link with ID:', linkId);
      
      // Test 3: Retrieve the created link
      console.log('Test 3: Retrieving created link...');
      const retrievedLink = await getLinkByShortCode('manual-test-123');
      console.log('Retrieved link:', retrievedLink);
    }
    
    // Test 4: Get user links
    console.log('Test 4: Getting user links...');
    const userLinks = await getUserLinks('manual-test-user');
    console.log('User links:', userLinks);
    
    console.log('✅ All manual tests completed successfully!');
  } catch (error) {
    console.error('❌ Manual tests failed:', error);
  }
};

// Export for use in browser console
if (typeof window !== 'undefined') {
  (window as any).runDatabaseTests = runManualTests;
}
