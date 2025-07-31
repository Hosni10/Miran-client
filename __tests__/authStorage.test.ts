/**
 * Authentication Storage Tests
 * Tests for token save/get/clear functionality
 */

// Mock localStorage
const mockLocalStorage = {
  store: {} as Record<string, string>,
  getItem: (key: string) => mockLocalStorage.store[key] || null,
  setItem: (key: string, value: string) => {
    mockLocalStorage.store[key] = value;
  },
  removeItem: (key: string) => {
    delete mockLocalStorage.store[key];
  },
  clear: () => {
    mockLocalStorage.store = {};
  }
};

// Replace global localStorage
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

// Mock import.meta.env for tests
Object.defineProperty(import.meta, 'env', {
  value: { DEV: true }
});

// Import functions to test
import { 
  saveToken, 
  getToken, 
  clearToken, 
  saveTokenSync, 
  getTokenSync, 
  clearTokenSync, 
  isAuthenticated 
} from '../src/utils/authStorage';
import { TOKEN_KEY, LEGACY_TOKEN_KEYS } from '../src/constants/auth';

/**
 * Test token save and retrieval
 */
function testTokenSaveAndGet() {
  console.log('Testing token save and get...');
  
  // Clear storage first
  mockLocalStorage.clear();
  
  // Test sync versions
  const testToken = 'test-jwt-token-123';
  saveTokenSync(testToken);
  
  const retrievedToken = getTokenSync();
  console.assert(retrievedToken === testToken, 'Should save and retrieve token correctly');
  
  // Test async versions
  saveToken(testToken).then(() => {
    return getToken();
  }).then((asyncToken) => {
    console.assert(asyncToken === testToken, 'Should save and retrieve token correctly (async)');
  });
  
  console.log('✓ Token save and get tests passed');
}

/**
 * Test legacy token migration
 */
function testLegacyTokenMigration() {
  console.log('Testing legacy token migration...');
  
  // Clear storage first
  mockLocalStorage.clear();
  
  // Set a legacy token
  mockLocalStorage.setItem('access_token', 'legacy-token-456');
  
  // Should migrate when getting token
  const migratedToken = getTokenSync();
  console.assert(migratedToken === 'legacy-token-456', 'Should retrieve legacy token');
  
  // Should now be stored under correct key
  const correctToken = mockLocalStorage.getItem(TOKEN_KEY);
  console.assert(correctToken === 'legacy-token-456', 'Should migrate to correct key');
  
  // Legacy key should be removed
  const legacyToken = mockLocalStorage.getItem('access_token');
  console.assert(legacyToken === null, 'Should remove legacy key after migration');
  
  console.log('✓ Legacy token migration tests passed');
}

/**
 * Test token clearing
 */
function testTokenClear() {
  console.log('Testing token clear...');
  
  // Set up tokens
  mockLocalStorage.setItem(TOKEN_KEY, 'main-token');
  mockLocalStorage.setItem('access_token', 'legacy-token');
  mockLocalStorage.setItem('refresh_token', 'refresh-token');
  
  // Clear tokens
  clearTokenSync();
  
  // All tokens should be cleared
  console.assert(mockLocalStorage.getItem(TOKEN_KEY) === null, 'Should clear main token');
  console.assert(mockLocalStorage.getItem('access_token') === null, 'Should clear legacy token');
  console.assert(mockLocalStorage.getItem('refresh_token') === null, 'Should clear refresh token');
  
  console.log('✓ Token clear tests passed');
}

/**
 * Test authentication check
 */
function testIsAuthenticated() {
  console.log('Testing authentication check...');
  
  // Clear storage first
  mockLocalStorage.clear();
  
  // Should not be authenticated without token
  console.assert(!isAuthenticated(), 'Should not be authenticated without token');
  
  // Should be authenticated with token
  saveTokenSync('test-token');
  console.assert(isAuthenticated(), 'Should be authenticated with token');
  
  // Should not be authenticated with 'undefined' token
  mockLocalStorage.setItem(TOKEN_KEY, 'undefined');
  console.assert(!isAuthenticated(), 'Should not be authenticated with "undefined" token');
  
  console.log('✓ Authentication check tests passed');
}

/**
 * Test undefined token handling
 */
function testUndefinedTokenHandling() {
  console.log('Testing undefined token handling...');
  
  // Clear storage first
  mockLocalStorage.clear();
  
  // Set undefined token
  mockLocalStorage.setItem(TOKEN_KEY, 'undefined');
  
  // Should return null for undefined token
  const token = getTokenSync();
  console.assert(token === null, 'Should return null for "undefined" token');
  
  console.log('✓ Undefined token handling tests passed');
}

// Run all tests
console.log('🧪 Running Auth Storage Tests...');

testTokenSaveAndGet();
testLegacyTokenMigration();
testTokenClear();
testIsAuthenticated();
testUndefinedTokenHandling();

console.log('🧪 All Auth Storage Tests Completed!');

// Export for potential use in other test files
export {
  testTokenSaveAndGet,
  testLegacyTokenMigration,
  testTokenClear,
  testIsAuthenticated,
  testUndefinedTokenHandling
}; 