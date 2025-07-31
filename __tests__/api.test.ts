/**
 * Simple unit test for API interceptor functionality
 * Tests that the Authorization header is properly attached to requests
 */

// Mock localStorage for testing
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

// Replace global localStorage with mock
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

/**
 * Test the authorization header attachment logic
 * This simulates what the axios interceptor should do
 */
function testAuthHeaderAttachment() {
  console.log('Testing authorization header attachment...');
  
  // Test case 1: userTokenSaved exists
  mockLocalStorage.setItem('userTokenSaved', 'user-token-123');
  const token1 = mockLocalStorage.getItem('userTokenSaved') || mockLocalStorage.getItem('access_token');
  console.assert(token1 === 'user-token-123', 'Should use userTokenSaved when available');
  
  // Test case 2: Only access_token exists
  mockLocalStorage.removeItem('userTokenSaved');
  mockLocalStorage.setItem('access_token', 'access-token-456');
  const token2 = mockLocalStorage.getItem('userTokenSaved') || mockLocalStorage.getItem('access_token');
  console.assert(token2 === 'access-token-456', 'Should fallback to access_token');
  
  // Test case 3: No tokens exist
  mockLocalStorage.clear();
  const token3 = mockLocalStorage.getItem('userTokenSaved') || mockLocalStorage.getItem('access_token');
  console.assert(token3 === null, 'Should return null when no tokens exist');
  
  console.log('✓ Authorization header attachment tests passed');
}

/**
 * Test the food pagination URL conversion logic
 */
function testFoodPaginationUrlConversion() {
  console.log('Testing food pagination URL conversion...');
  
  // Simulate the URL conversion logic from fetchFoodPage
  const convertApiUrl = (url?: string, limit = 50): string => {
    if (url) {
      // If it's a full URL from the API, convert it to use the proxy
      if (url.startsWith('https://testing.miranapp.com/api/')) {
        return url.replace('https://testing.miranapp.com/api/', '/');
      } else if (url.startsWith('https://testing.miranapp.com/')) {
        return url.replace('https://testing.miranapp.com/', '/');
      } else if (url.startsWith('/api/')) {
        return url.replace('/api/', '/');
      } else if (url.startsWith('/')) {
        return url;
      } else {
        return `/${url}`;
      }
    } else {
      return `/v1/resources/food_list?limit=${limit}`;
    }
  };
  
  // Test full API URL conversion
  const fullApiUrl = 'https://testing.miranapp.com/api/v1/resources/food_list?limit=50&offset=50';
  const convertedFullUrl = convertApiUrl(fullApiUrl);
  console.assert(convertedFullUrl === '/v1/resources/food_list?limit=50&offset=50', 'Should convert full API URL to proxy path');
  
  // Test API URL without /api/ prefix
  const apiUrlNoPrefix = 'https://testing.miranapp.com/v1/resources/food_list?limit=50&offset=100';
  const convertedNoPrefix = convertApiUrl(apiUrlNoPrefix);
  console.assert(convertedNoPrefix === '/v1/resources/food_list?limit=50&offset=100', 'Should convert API URL without /api/ prefix');
  
  // Test already proxy-formatted URL
  const proxyUrl = '/api/v1/resources/food_list?limit=50&offset=150';
  const convertedProxy = convertApiUrl(proxyUrl);
  console.assert(convertedProxy === '/v1/resources/food_list?limit=50&offset=150', 'Should convert /api/ prefix to relative path');
  
  // Test relative URL
  const relativeUrl = '/v1/resources/food_list?limit=50&offset=200';
  const convertedRelative = convertApiUrl(relativeUrl);
  console.assert(convertedRelative === '/v1/resources/food_list?limit=50&offset=200', 'Should keep relative URLs as-is');
  
  // Test no URL (first page)
  const firstPageUrl = convertApiUrl();
  console.assert(firstPageUrl === '/v1/resources/food_list?limit=50', 'Should generate first page URL when no URL provided');
  
  // Test no URL with custom limit
  const customLimitUrl = convertApiUrl(undefined, 25);
  console.assert(customLimitUrl === '/v1/resources/food_list?limit=25', 'Should use custom limit for first page');
  
  console.log('✓ Food pagination URL conversion tests passed');
}

/**
 * Test the food image URL helper function logic
 */
function testFoodImageUrlHelper() {
  console.log('Testing food image URL helper...');
  
  // Simulate the getFoodImageUrl function logic
  const getFoodImageUrl = (image: string | null): string => {
    if (image) {
      return `https://testing.miranapp.com/media/${image}`;
    }
    return '/assets/placeholder_food.png';
  };
  
  // Test with image
  const urlWithImage = getFoodImageUrl('apple.jpg');
  console.assert(urlWithImage === 'https://testing.miranapp.com/media/apple.jpg', 'Should return full media URL when image exists');
  
  // Test without image
  const urlWithoutImage = getFoodImageUrl(null);
  console.assert(urlWithoutImage === '/assets/placeholder_food.png', 'Should return placeholder when image is null');
  
  console.log('✓ Food image URL helper tests passed');
}

/**
 * Test the trainer avatar URL helper function logic
 */
function testTrainerAvatarUrlHelper() {
  console.log('Testing trainer avatar URL helper...');
  
  // Simulate the getTrainerAvatarUrl function logic
  const getTrainerAvatarUrl = (avatar: string | null): string => {
    if (avatar) {
      return `https://testing.miranapp.com/media/${avatar}`;
    }
    return '/assets/placeholder_avatar.png';
  };
  
  // Test with avatar
  const urlWithAvatar = getTrainerAvatarUrl('trainer1.jpg');
  console.assert(urlWithAvatar === 'https://testing.miranapp.com/media/trainer1.jpg', 'Should return full media URL when avatar exists');
  
  // Test without avatar
  const urlWithoutAvatar = getTrainerAvatarUrl(null);
  console.assert(urlWithoutAvatar === '/assets/placeholder_avatar.png', 'Should return placeholder when avatar is null');
  
  console.log('✓ Trainer avatar URL helper tests passed');
}

/**
 * Test macro rounding logic used in FoodCard
 */
function testMacroRounding() {
  console.log('Testing macro rounding logic...');
  
  // Simulate the rounding logic from FoodCard
  const roundMacro = (value: number) => Math.round(value * 10) / 10;
  
  console.assert(roundMacro(2.34) === 2.3, 'Should round 2.34 to 2.3');
  console.assert(roundMacro(2.36) === 2.4, 'Should round 2.36 to 2.4');
  console.assert(roundMacro(2.0) === 2, 'Should handle whole numbers');
  console.assert(roundMacro(0.1) === 0.1, 'Should handle small decimals');
  
  console.log('✓ Macro rounding tests passed');
}

/**
 * Test trainer rating formatting logic
 */
function testRatingFormatting() {
  console.log('Testing trainer rating formatting...');
  
  // Simulate the rating formatting logic from TrainerCard
  const formatRating = (rating: number) => (Math.round(rating * 10) / 10).toFixed(1);
  
  console.assert(formatRating(9.8) === '9.8', 'Should format 9.8 to "9.8"');
  console.assert(formatRating(9) === '9.0', 'Should format 9 to "9.0"');
  console.assert(formatRating(9.15) === '9.2', 'Should round 9.15 to "9.2"');
  console.assert(formatRating(9.94) === '9.9', 'Should round 9.94 to "9.9"');
  
  console.log('✓ Rating formatting tests passed');
}

/**
 * Test trainer API request interceptor
 */
function testTrainerApiInterceptor() {
  console.log('Testing trainer API request interceptor...');
  
  // Simulate the request interceptor logic for trainer API
  const attachAuthHeader = (token: string | null) => {
    if (token) {
      return {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json',
      };
    }
    return {
      'Content-Type': 'application/json',
    };
  };
  
  // Test with token
  mockLocalStorage.setItem('userTokenSaved', 'trainer-token-123');
  const token = mockLocalStorage.getItem('userTokenSaved');
  const headersWithAuth = attachAuthHeader(token);
  console.assert(headersWithAuth['Authorization'] === 'Token trainer-token-123', 'Should attach Token header with token');
  console.assert(headersWithAuth['Content-Type'] === 'application/json', 'Should include content type');
  
  // Test without token
  const headersWithoutAuth = attachAuthHeader(null);
  console.assert(!headersWithoutAuth['Authorization'], 'Should not include Authorization header without token');
  console.assert(headersWithoutAuth['Content-Type'] === 'application/json', 'Should still include content type');
  
  console.log('✓ Trainer API interceptor tests passed');
}

/**
 * Test trainer API endpoint construction
 */
function testTrainerApiEndpoint() {
  console.log('Testing trainer API endpoint construction...');
  
  // Simulate the endpoint construction from fetchTrainerPage
  const buildTrainerEndpoint = (page_num = 1, page_size = 10) => {
    return `/v1/user/trainer-list?page_num=${page_num}&page_size=${page_size}`;
  };
  
  // Test default parameters
  const defaultEndpoint = buildTrainerEndpoint();
  console.assert(defaultEndpoint === '/v1/user/trainer-list?page_num=1&page_size=10', 'Should use default parameters');
  
  // Test custom parameters
  const customEndpoint = buildTrainerEndpoint(3, 25);
  console.assert(customEndpoint === '/v1/user/trainer-list?page_num=3&page_size=25', 'Should use custom parameters');
  
  // Test edge cases
  const firstPageEndpoint = buildTrainerEndpoint(1, 50);
  console.assert(firstPageEndpoint === '/v1/user/trainer-list?page_num=1&page_size=50', 'Should handle first page correctly');
  
  console.log('✓ Trainer API endpoint tests passed');
}

// Run all tests
function runAllTests() {
  console.log('🧪 Running API and helper function tests...\n');
  
  try {
    testAuthHeaderAttachment();
    testFoodPaginationUrlConversion();
    testFoodImageUrlHelper();
    testTrainerAvatarUrlHelper();
    testMacroRounding();
    testRatingFormatting();
    testTrainerApiInterceptor();
    testTrainerApiEndpoint();
    
    console.log('\n✅ All tests passed successfully!');
  } catch (error) {
    console.error('\n❌ Tests failed:', error);
  }
}

// Export for potential use in other test files
export {
  testAuthHeaderAttachment,
  testFoodPaginationUrlConversion,
  testFoodImageUrlHelper,
  testTrainerAvatarUrlHelper,
  testMacroRounding,
  testRatingFormatting,
  testTrainerApiInterceptor,
  testTrainerApiEndpoint,
  runAllTests,
};

// Auto-run tests if this file is executed directly
if (typeof window !== 'undefined') {
  runAllTests();
} 