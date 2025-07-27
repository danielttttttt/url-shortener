/**
 * Example usage and testing for URL shortening functionality
 * This file demonstrates how to use the URL shortening utilities
 */

import { 
  shortenUrl, 
  shortenUrlAnonymous, 
  isValidUrl, 
  formatUrl,
  getShortUrl,
  extractShortCode,
  type ShortenUrlRequest 
} from './urlShortener';

import { 
  generateRandomShortCode, 
  generateUniqueShortCode, 
  validateShortCode 
} from './database';

// Example: Basic URL shortening with random code
export const exampleRandomShortening = async (userId: string) => {
  console.log('🔗 Example: Random URL Shortening');
  
  const request: ShortenUrlRequest = {
    originalUrl: 'https://www.example.com/very-long-article-title-that-needs-shortening',
    userId: userId
  };

  try {
    const result = await shortenUrl(request);
    
    if (result.success && result.data) {
      console.log('✅ Success!');
      console.log('Original URL:', result.data.originalUrl);
      console.log('Short URL:', result.data.shortUrl);
      console.log('Short Code:', result.data.shortCode);
      return result.data;
    } else {
      console.log('❌ Failed:', result.error);
      return null;
    }
  } catch (error) {
    console.error('❌ Error:', error);
    return null;
  }
};

// Example: Custom short code
export const exampleCustomShortening = async (userId: string) => {
  console.log('🔗 Example: Custom Short Code');
  
  const request: ShortenUrlRequest = {
    originalUrl: 'https://github.com/my-awesome-project',
    customShortCode: 'my-project',
    userId: userId
  };

  try {
    const result = await shortenUrl(request);
    
    if (result.success && result.data) {
      console.log('✅ Success!');
      console.log('Original URL:', result.data.originalUrl);
      console.log('Short URL:', result.data.shortUrl);
      console.log('Custom Code:', result.data.shortCode);
      return result.data;
    } else {
      console.log('❌ Failed:', result.error);
      return null;
    }
  } catch (error) {
    console.error('❌ Error:', error);
    return null;
  }
};

// Example: Anonymous shortening
export const exampleAnonymousShortening = async () => {
  console.log('🔗 Example: Anonymous URL Shortening');
  
  try {
    const result = await shortenUrlAnonymous(
      'https://www.example.com/anonymous-link',
      'anon-link'
    );
    
    if (result.success && result.data) {
      console.log('✅ Success!');
      console.log('Original URL:', result.data.originalUrl);
      console.log('Short URL:', result.data.shortUrl);
      console.log('Short Code:', result.data.shortCode);
      return result.data;
    } else {
      console.log('❌ Failed:', result.error);
      return null;
    }
  } catch (error) {
    console.error('❌ Error:', error);
    return null;
  }
};

// Example: URL validation and formatting
export const exampleUrlValidation = () => {
  console.log('🔍 Example: URL Validation and Formatting');
  
  const testUrls = [
    'https://www.example.com',
    'http://example.com',
    'www.example.com',
    'example.com',
    'invalid-url',
    'ftp://example.com',
    ''
  ];

  testUrls.forEach(url => {
    const formatted = formatUrl(url);
    const isValid = isValidUrl(formatted);
    console.log(`URL: "${url}" → "${formatted}" (Valid: ${isValid})`);
  });
};

// Example: Short code generation and validation
export const exampleShortCodeGeneration = async () => {
  console.log('🎲 Example: Short Code Generation and Validation');
  
  // Generate random codes
  console.log('Random codes:');
  for (let i = 0; i < 5; i++) {
    const randomCode = generateRandomShortCode();
    console.log(`  ${randomCode}`);
  }
  
  // Generate unique codes (requires database connection)
  try {
    console.log('Unique codes:');
    for (let i = 0; i < 3; i++) {
      const uniqueCode = await generateUniqueShortCode();
      console.log(`  ${uniqueCode}`);
    }
  } catch (error) {
    console.log('⚠️ Unique code generation requires database connection');
  }
  
  // Validate custom codes
  console.log('Code validation:');
  const testCodes = [
    'valid-code',
    'abc123',
    'my_link',
    'a',  // too short
    'this-is-a-very-long-code-that-exceeds-limit',  // too long
    'invalid@code',  // invalid characters
    'admin',  // reserved word
    ''  // empty
  ];
  
  testCodes.forEach(code => {
    const validation = validateShortCode(code);
    console.log(`  "${code}": ${validation.isValid ? '✅' : '❌'} ${validation.error || ''}`);
  });
};

// Example: URL utilities
export const exampleUrlUtilities = () => {
  console.log('🛠️ Example: URL Utilities');
  
  const shortCode = 'abc123';
  const shortUrl = getShortUrl(shortCode);
  const extractedCode = extractShortCode(shortUrl);
  
  console.log('Short Code:', shortCode);
  console.log('Generated Short URL:', shortUrl);
  console.log('Extracted Code:', extractedCode);
  
  // Test extraction with various URLs
  const testUrls = [
    'https://yourdomain.com/abc123',
    'http://localhost:3000/test-code',
    'https://short.ly/xyz789?param=value',
    'invalid-url'
  ];
  
  testUrls.forEach(url => {
    const code = extractShortCode(url);
    console.log(`"${url}" → "${code}"`);
  });
};

// Example: Error handling scenarios
export const exampleErrorHandling = async (userId: string) => {
  console.log('⚠️ Example: Error Handling Scenarios');
  
  const errorScenarios = [
    {
      name: 'Invalid URL',
      request: { originalUrl: 'not-a-url', userId }
    },
    {
      name: 'Empty URL',
      request: { originalUrl: '', userId }
    },
    {
      name: 'Invalid custom code',
      request: { originalUrl: 'https://example.com', customShortCode: 'a', userId }
    },
    {
      name: 'Reserved custom code',
      request: { originalUrl: 'https://example.com', customShortCode: 'admin', userId }
    }
  ];

  for (const scenario of errorScenarios) {
    console.log(`\nTesting: ${scenario.name}`);
    try {
      const result = await shortenUrl(scenario.request);
      if (result.success) {
        console.log('✅ Unexpected success:', result.data?.shortUrl);
      } else {
        console.log('❌ Expected error:', result.error);
      }
    } catch (error) {
      console.log('❌ Exception:', error);
    }
  }
};

// Run all examples
export const runAllExamples = async (userId: string = 'example-user-123') => {
  console.log('🚀 Running all URL shortening examples...\n');
  
  try {
    await exampleRandomShortening(userId);
    console.log('\n' + '='.repeat(50) + '\n');
    
    await exampleCustomShortening(userId);
    console.log('\n' + '='.repeat(50) + '\n');
    
    await exampleAnonymousShortening();
    console.log('\n' + '='.repeat(50) + '\n');
    
    exampleUrlValidation();
    console.log('\n' + '='.repeat(50) + '\n');
    
    await exampleShortCodeGeneration();
    console.log('\n' + '='.repeat(50) + '\n');
    
    exampleUrlUtilities();
    console.log('\n' + '='.repeat(50) + '\n');
    
    await exampleErrorHandling(userId);
    
    console.log('\n✅ All examples completed!');
  } catch (error) {
    console.error('❌ Error running examples:', error);
  }
};

// Export for browser console usage
if (typeof window !== 'undefined') {
  (window as any).runUrlShortenerExamples = runAllExamples;
  (window as any).urlShortenerExamples = {
    randomShortening: exampleRandomShortening,
    customShortening: exampleCustomShortening,
    anonymousShortening: exampleAnonymousShortening,
    urlValidation: exampleUrlValidation,
    shortCodeGeneration: exampleShortCodeGeneration,
    urlUtilities: exampleUrlUtilities,
    errorHandling: exampleErrorHandling
  };
}
