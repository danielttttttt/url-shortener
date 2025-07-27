/**
 * Example usage and testing for redirect functionality
 * This file demonstrates how to test the redirect features
 */

import { 
  handleRedirect, 
  handleRedirectWithAnalytics,
  isValidShortCodeFormat,
  extractShortCodeFromUrl,
  createRedirectAnalytics,
  safeRedirect
} from './redirectUtils';

import { 
  createLink, 
  getLinkByShortCode,
  type CreateLinkData 
} from './database';

// Example: Test redirect functionality
export const testRedirectFunctionality = async () => {
  console.log('🔄 Testing Redirect Functionality');
  
  // First, create a test link
  const testLinkData: CreateLinkData = {
    originalUrl: 'https://www.example.com/test-redirect-page',
    shortCode: 'test-redirect',
    userId: 'test-user-redirect'
  };

  try {
    // Create the test link
    console.log('Creating test link...');
    const linkId = await createLink(testLinkData);
    console.log('✅ Test link created with ID:', linkId);

    // Test the redirect handling
    console.log('Testing redirect handling...');
    const redirectResult = await handleRedirect('test-redirect');
    
    if (redirectResult.success) {
      console.log('✅ Redirect successful!');
      console.log('Original URL:', redirectResult.originalUrl);
      console.log('Link data:', redirectResult.linkData);
    } else {
      console.log('❌ Redirect failed:', redirectResult.error);
    }

    // Test with analytics
    console.log('Testing redirect with analytics...');
    const analyticsResult = await handleRedirectWithAnalytics('test-redirect');
    console.log('Analytics result:', analyticsResult);

    return redirectResult;
  } catch (error) {
    console.error('❌ Test failed:', error);
    return null;
  }
};

// Example: Test invalid short codes
export const testInvalidShortCodes = async () => {
  console.log('🚫 Testing Invalid Short Codes');
  
  const invalidCodes = [
    '',
    'nonexistent-code',
    'invalid@code',
    'very-long-code-that-probably-does-not-exist-in-database'
  ];

  for (const code of invalidCodes) {
    console.log(`Testing code: "${code}"`);
    const result = await handleRedirect(code);
    
    if (result.success) {
      console.log('⚠️ Unexpected success for invalid code');
    } else {
      console.log('✅ Expected failure:', result.error);
    }
  }
};

// Example: Test short code format validation
export const testShortCodeValidation = () => {
  console.log('✅ Testing Short Code Format Validation');
  
  const testCodes = [
    { code: 'abc123', expected: true },
    { code: 'test-link', expected: true },
    { code: 'my_link', expected: true },
    { code: 'ABC123', expected: true },
    { code: '', expected: false },
    { code: 'invalid@code', expected: false },
    { code: 'code with spaces', expected: false },
    { code: 'a'.repeat(100), expected: false }
  ];

  testCodes.forEach(({ code, expected }) => {
    const isValid = isValidShortCodeFormat(code);
    const status = isValid === expected ? '✅' : '❌';
    console.log(`${status} "${code}" → ${isValid} (expected: ${expected})`);
  });
};

// Example: Test URL short code extraction
export const testShortCodeExtraction = () => {
  console.log('🔍 Testing Short Code Extraction');
  
  const testUrls = [
    { url: 'https://yourdomain.com/abc123', expected: 'abc123' },
    { url: 'http://localhost:3000/test-code', expected: 'test-code' },
    { url: 'https://short.ly/xyz789?param=value', expected: 'xyz789' },
    { url: '/my-link', expected: 'my-link' },
    { url: 'abc123', expected: 'abc123' },
    { url: 'https://yourdomain.com/', expected: null },
    { url: 'invalid-url', expected: null }
  ];

  testUrls.forEach(({ url, expected }) => {
    const extracted = extractShortCodeFromUrl(url);
    const status = extracted === expected ? '✅' : '❌';
    console.log(`${status} "${url}" → "${extracted}" (expected: "${expected}")`);
  });
};

// Example: Test analytics creation
export const testAnalyticsCreation = () => {
  console.log('📊 Testing Analytics Creation');
  
  const analytics = createRedirectAnalytics(
    'test-code',
    'Mozilla/5.0 (Test Browser)',
    'https://example.com/referrer'
  );
  
  console.log('Analytics data:', analytics);
  
  // Verify required fields
  const requiredFields = ['shortCode', 'timestamp', 'userAgent'];
  const hasAllFields = requiredFields.every(field => analytics.hasOwnProperty(field));
  
  console.log(hasAllFields ? '✅ All required fields present' : '❌ Missing required fields');
};

// Example: Test safe redirect (without actually redirecting)
export const testSafeRedirect = () => {
  console.log('🔒 Testing Safe Redirect');
  
  // Mock window.location for testing
  const originalLocation = window.location;
  let redirectAttempted = false;
  let redirectUrl = '';
  
  // Create a mock location object
  const mockLocation = {
    ...originalLocation,
    href: ''
  };
  
  Object.defineProperty(mockLocation, 'href', {
    set: (url: string) => {
      redirectAttempted = true;
      redirectUrl = url;
      console.log(`🔄 Redirect attempted to: ${url}`);
    },
    get: () => redirectUrl
  });
  
  // Temporarily replace window.location
  Object.defineProperty(window, 'location', {
    value: mockLocation,
    writable: true
  });
  
  try {
    // Test the safe redirect
    const success = safeRedirect('https://www.example.com/test', 0);
    
    console.log('Redirect function returned:', success);
    console.log('Redirect attempted:', redirectAttempted);
    console.log('Redirect URL:', redirectUrl);
    
    if (success && redirectAttempted && redirectUrl === 'https://www.example.com/test') {
      console.log('✅ Safe redirect test passed');
    } else {
      console.log('❌ Safe redirect test failed');
    }
  } finally {
    // Restore original location
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true
    });
  }
};

// Example: Complete redirect workflow test
export const testCompleteRedirectWorkflow = async () => {
  console.log('🔄 Testing Complete Redirect Workflow');
  
  try {
    // Step 1: Create a test link
    const testLink: CreateLinkData = {
      originalUrl: 'https://github.com/test-project',
      shortCode: 'workflow-test',
      userId: 'workflow-test-user'
    };
    
    console.log('Step 1: Creating test link...');
    const linkId = await createLink(testLink);
    console.log('✅ Link created:', linkId);
    
    // Step 2: Verify link exists
    console.log('Step 2: Verifying link exists...');
    const retrievedLink = await getLinkByShortCode('workflow-test');
    if (retrievedLink) {
      console.log('✅ Link verified:', retrievedLink.shortCode);
    } else {
      console.log('❌ Link not found');
      return;
    }
    
    // Step 3: Test redirect handling
    console.log('Step 3: Testing redirect handling...');
    const redirectResult = await handleRedirectWithAnalytics('workflow-test');
    
    if (redirectResult.success) {
      console.log('✅ Redirect handling successful');
      console.log('Original URL:', redirectResult.originalUrl);
      console.log('Click count updated:', redirectResult.linkData?.clicks);
    } else {
      console.log('❌ Redirect handling failed:', redirectResult.error);
    }
    
    // Step 4: Verify click count was incremented
    console.log('Step 4: Verifying click count...');
    const updatedLink = await getLinkByShortCode('workflow-test');
    if (updatedLink && updatedLink.clicks > retrievedLink.clicks) {
      console.log('✅ Click count incremented:', updatedLink.clicks);
    } else {
      console.log('⚠️ Click count may not have been incremented');
    }
    
    console.log('🎉 Complete workflow test finished');
    return redirectResult;
    
  } catch (error) {
    console.error('❌ Workflow test failed:', error);
    return null;
  }
};

// Run all redirect tests
export const runAllRedirectTests = async () => {
  console.log('🚀 Running All Redirect Tests...\n');
  
  try {
    testShortCodeValidation();
    console.log('\n' + '='.repeat(50) + '\n');
    
    testShortCodeExtraction();
    console.log('\n' + '='.repeat(50) + '\n');
    
    testAnalyticsCreation();
    console.log('\n' + '='.repeat(50) + '\n');
    
    testSafeRedirect();
    console.log('\n' + '='.repeat(50) + '\n');
    
    await testInvalidShortCodes();
    console.log('\n' + '='.repeat(50) + '\n');
    
    await testRedirectFunctionality();
    console.log('\n' + '='.repeat(50) + '\n');
    
    await testCompleteRedirectWorkflow();
    
    console.log('\n✅ All redirect tests completed!');
  } catch (error) {
    console.error('❌ Error running tests:', error);
  }
};

// Export for browser console usage
if (typeof window !== 'undefined') {
  (window as any).runRedirectTests = runAllRedirectTests;
  (window as any).redirectTests = {
    testRedirectFunctionality,
    testInvalidShortCodes,
    testShortCodeValidation,
    testShortCodeExtraction,
    testAnalyticsCreation,
    testSafeRedirect,
    testCompleteRedirectWorkflow
  };
}
