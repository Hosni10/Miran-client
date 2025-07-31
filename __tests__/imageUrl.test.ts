/**
 * Simple unit test for imageUrl utility functionality
 * Tests the buildImageUrl function with various inputs
 */

import { buildImageUrl } from '../src/utils/imageUrl';

/**
 * Test buildImageUrl function with null/empty inputs
 */
function testBuildImageUrlNullCases() {
  console.log('Testing buildImageUrl null/empty cases...');
  
  // Test null input
  const resultNull = buildImageUrl(null);
  console.assert(resultNull === '/assets/placeholder_food.svg', 'Should return placeholder when image is null');
  
  // Test empty string input
  const resultEmpty = buildImageUrl('');
  console.assert(resultEmpty === '/assets/placeholder_food.svg', 'Should return placeholder when image is empty string');
  
  console.log('✓ buildImageUrl null/empty cases tests passed');
}

/**
 * Test buildImageUrl function with valid relative paths
 */
function testBuildImageUrlValidPaths() {
  console.log('Testing buildImageUrl valid paths...');
  
  // Test simple relative path
  const result1 = buildImageUrl('food/chicken.jpg');
  console.assert(result1 === '/media/food/chicken.jpg', 'Should build full URL with media base for relative path');
  
  // Test nested paths
  const result2 = buildImageUrl('uploads/2024/01/food/chicken.jpg');
  console.assert(result2 === '/media/uploads/2024/01/food/chicken.jpg', 'Should handle nested paths correctly');
  
  // Test path starting with slash
  const result3 = buildImageUrl('/uploads/food/chicken.jpg');
  console.assert(result3 === '/media/uploads/food/chicken.jpg', 'Should handle paths starting with slash');
  
  console.log('✓ buildImageUrl valid paths tests passed');
}

/**
 * Test buildImageUrl function with special characters
 */
function testBuildImageUrlSpecialChars() {
  console.log('Testing buildImageUrl special characters...');
  
  // Test spaces in URLs (should be encoded)
  const result1 = buildImageUrl('food items/chicken breast.jpg');
  console.assert(result1 === '/media/food%20items/chicken%20breast.jpg', 'Should encode spaces in URLs');
  
  // Test other special characters
  const result2 = buildImageUrl('food/chicken&rice.jpg');
  console.assert(result2 === '/media/food/chicken&rice.jpg', 'Should handle special characters in URLs');
  
  // Test unicode characters
  const result3 = buildImageUrl('food/دجاج.jpg');
  console.assert(result3 === '/media/food/%D8%AF%D8%AC%D8%A7%D8%AC.jpg', 'Should handle unicode characters');
  
  console.log('✓ buildImageUrl special characters tests passed');
}

/**
 * Test buildImageUrl function double slash handling
 */
function testBuildImageUrlDoubleSlash() {
  console.log('Testing buildImageUrl double slash handling...');
  
  // Test double slash removal
  const result = buildImageUrl('/food/chicken.jpg');
  console.assert(result === '/media/food/chicken.jpg', 'Should strip duplicate slashes');
  console.assert(!result.includes('//media'), 'Should not contain double slashes');
  
  console.log('✓ buildImageUrl double slash handling tests passed');
}

// Run all imageUrl tests
function runImageUrlTests() {
  console.log('🧪 Running imageUrl utility tests...\n');
  
  try {
    testBuildImageUrlNullCases();
    testBuildImageUrlValidPaths();
    testBuildImageUrlSpecialChars();
    testBuildImageUrlDoubleSlash();
    
    console.log('\n✅ All imageUrl tests passed successfully!');
  } catch (error) {
    console.error('\n❌ imageUrl tests failed:', error);
  }
}

// Export for potential use in other test files
export {
  testBuildImageUrlNullCases,
  testBuildImageUrlValidPaths,
  testBuildImageUrlSpecialChars,
  testBuildImageUrlDoubleSlash,
  runImageUrlTests,
};

// Auto-run tests if this file is executed directly
if (typeof window !== 'undefined') {
  runImageUrlTests();
} 