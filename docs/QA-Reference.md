# Miran Dashboard - QA & Development Reference

*Last Updated: July 17, 2025*

## Table of Contents

- [Overview](#overview)
- [Environment & Authentication](#environment--authentication)
- [Core Data Endpoints](#core-data-endpoints)
- [React Query Caching](#react-query-caching)
- [UI Components & Screens](#ui-components--screens)
- [Mapping Utilities](#mapping-utilities)
- [Error Handling & Toasts](#error-handling--toasts)
- [How to Run Locally](#how-to-run-locally)
- [Current Test Coverage](#current-test-coverage)
- [Open Questions / TODO](#open-questions--todo)

## Overview

The Miran Dashboard is an administrative interface providing comprehensive management tools for the Miran fitness platform. Currently focused on **Nutrition > Food** and **Trainers** management, the dashboard represents an MVP-complete implementation with robust data mapping, search functionality, and modern React architecture.

**Current Status**: MVP Complete
- ✅ Secondary food & unit mapping with localStorage caching
- ✅ Server-side search with pagination
- ✅ CRUD operations for food items with image upload
- ✅ Trainer listing with nationality flags and ratings
- ✅ Responsive UI with dark mode support
- ✅ Comprehensive error handling and toast notifications

**Key Features**:
- Real-time search across food database
- Paginated data views with customizable page sizes
- Image upload and media management
- Token-based authentication with auto-refresh
- Multilingual support (Arabic/English)
- Optimistic UI updates with React Query

## Environment & Authentication

### Domains
- **Backend API**: `https://testing.miranapp.com`
- **Frontend Deployment**: `https://mirandashboard.netlify.app`
- **Local Development**: `http://localhost:3000`

### Axios Configuration
```typescript
// Base configuration
baseURL: 'https://testing.miranapp.com'
headers: {
  'Token': localStorage.getItem('authToken'),
  'Accept': 'application/json'
}
```

### Interceptors
**Request Interceptor**:
- Automatically attaches `Token` header from localStorage
- Ensures `Accept: application/json` for all requests

**Response Interceptor**:
- Detects non-JSON responses (HTML error pages) → triggers "Non-JSON response" toast
- Handles 401 errors → redirects to login
- Preserves error context for React Query error boundaries

💡 **Testing Note**: The interceptor will reject any HTML response with a clear error message, making CORS/server issues immediately visible.

## Core Data Endpoints

### Food Management
```http
GET /api/v1/resources/food_list?limit=12&page=1&search=protein
Authorization: Token {token}
Response: 200 OK
```

```http
GET /api/v1/resources/food/{id}/
Authorization: Token {token}
Response: 200 OK - Full food serializer with nutritional data
```

```http
POST /api/v1/resources/food/
Authorization: Token {token}
Content-Type: multipart/form-data (if image included)
Body: FormData with food fields + optional image file
Response: 201 Created
```

```http
PUT /api/v1/resources/food/{id}/
Authorization: Token {token}
Content-Type: multipart/form-data (if image updated)
Response: 200 OK
```

### Reference Data
```http
GET /api/v1/resources/secondary_food?limit=300
Authorization: Token {token}
Response: 200 OK - Brand/category mappings
```

```http
GET /api/v1/resources/units?limit=300
Authorization: Token {token}
Response: 200 OK - Unit type mappings (g, ml, cup, etc.)
```

### Trainer Management
```http
GET /api/v1/user/trainer-list?page_num=1&page_size=12
Authorization: Token {token}
Response: 200 OK
```

💡 **Known Issue**: Trainer detail endpoints currently blocked by CORS headers. List view fully functional.

## React Query Caching

### Global Configuration
```typescript
// Query client defaults
staleTime: {
  foods: 5000,        // 5 seconds for food lists
  mappings: 3600000,  // 1 hour for secondary_food/units
  trainers: 30000     // 30 seconds for trainer data
}
```

### Query Keys
- **Food List**: `['foods', page, limit, search]`
- **Food Detail**: `['food', id]`
- **Secondary Food Map**: `['secondary-food']`
- **Unit Map**: `['units']`
- **Trainer List**: `['trainers', page, pageSize]`

### Cache Invalidation
- Create/Update food → invalidates `['foods']` and `['food', id]`
- Optimistic updates for immediate UI feedback
- Background refetch maintains data consistency

## UI Components & Screens

### Food Tab

**FoodListScreen**
- Server-side search with 300ms debounce
- Pagination with Previous/Next navigation
- Grid/Table view toggle (responsive: 1-4 columns)
- Real-time stats showing filtered vs total counts
- Beautiful gradient header with integrated search

**FoodCard**
- Displays: Brand name, food title, unit label, macro breakdown
- Secondary food mapping: ID → {title, icon} with fallbacks
- Click handler opens detail modal
- Hover effects and loading states

**FoodDetailModal**
- Complete nutritional information grid
- Macro badges (High Protein, Low Carb, etc.)
- Unit mapping for proper label display
- Single-click close (fixed event bubbling issues)

**AddFoodModal/EditFoodModal**
- Zod validation for all form fields
- Drag-and-drop image upload with preview
- Multipart form submission for images
- Optimistic UI updates

### Trainers Tab

**TrainerListScreen**
- Token-authenticated trainer listing
- Star ratings with half-star precision
- Nationality flags with proper fallbacks
- Pagination with configurable page sizes

## Mapping Utilities

### useSecondaryFoodMap()
```typescript
// Maps secondary_food IDs to readable labels
const { getSecondaryFoodLabel } = useSecondaryFoodMap();
const brandName = getSecondaryFoodLabel(9); // "Processed"
```

**Features**:
- 24-hour localStorage caching
- Automatic fallback to ID string if mapping fails
- React Query integration with 1-hour stale time

### useUnitMap()
```typescript
// Maps unit IDs to unit names
const { getUnitLabel } = useUnitMap();
const unitName = getUnitLabel(12); // "g"
```

**Fallback Behavior**:
- Returns `"Unknown"` for unmapped IDs
- Gracefully handles API failures
- Consistent string return type prevents UI breaks

💡 **QA Note**: These hooks ensure the UI never displays raw numeric IDs to users, maintaining professional appearance even during API issues.

## Error Handling & Toasts

### Toast System
- **Success**: Green toasts for create/update operations
- **Error**: Red toasts for validation/network failures  
- **Info**: Blue toasts for informational messages
- Auto-dismiss after 5 seconds with manual close option

### Error Patterns
```typescript
// Non-JSON responses (HTML error pages)
"Server returned non-JSON response"

// Network/CORS errors
"Failed to load resource" → React Query onError

// Validation errors
Field-specific error messages from Zod schema
```

### Graceful Degradation
- Image loading failures → placeholder images
- Mapping failures → fallback to ID display
- Network errors → cached data shown with stale indicator

## How to Run Locally

### Installation
```bash
npm install
```

### Environment Setup
Create `.env` file:
```env
VITE_TOKEN_KEY=your_token_key_here
VITE_API_BASE_URL=https://testing.miranapp.com
```

### Development
```bash
npm run dev  # Starts Vite dev server on localhost:3000
```

### Testing
```bash
npm test           # Jest + React Testing Library
npm run test:watch # Watch mode for TDD
```

### Netlify Proxy Configuration
```toml
# netlify.toml
[[redirects]]
  from = "/api/*"
  to = "https://testing.miranapp.com/api/:splat"
  status = 200
  force = true
```

💡 **Local Testing**: The Netlify proxy rules are essential for CORS handling during local development.

## Current Test Coverage

### Unit Tests
- **Mapping Hooks**: `useSecondaryFoodMap`, `useUnitMap` with mocked API responses
- **Utility Functions**: `buildImageUrl`, `authStorage` token management
- **Form Validation**: Zod schemas for food creation/editing

### Component Tests
- **FoodCard**: Rendering with various prop combinations
- **FoodDetailModal**: Modal behavior and data display
- **Toast System**: Success/error message display

### Integration Tests
- **Axios Interceptors**: Request/response transformation
- **API Service Functions**: Error handling and data formatting
- **Authentication Flow**: Token storage and retrieval

### Coverage Goals
- Core utilities: 90%+
- UI components: 75%+
- Integration flows: 80%+

## Open Questions / TODO

### Backend Requirements
- **Filter Parameter**: Need `/food_list?secondary_food_id=X` for category filtering
- **CORS Headers**: Trainer detail endpoints need proper CORS configuration
- **Unit Field Consistency**: Clarify if POST/PUT accepts unit ID (number) or unit name (string)

### UX Enhancements
- **Infinite Scroll**: Alternative to pagination for mobile users
- **Bulk Operations**: Multi-select for batch delete/update
- **Advanced Search**: Filters by macros, calories, categories
- **Image Optimization**: WebP support and responsive images

### Technical Debt
- **Type Safety**: Strengthen API response types with runtime validation
- **Error Boundaries**: Implement React error boundaries for graceful failures  
- **Performance**: Virtualization for large food lists
- **Accessibility**: ARIA labels and keyboard navigation

### Monitoring & Analytics
- **Error Tracking**: Integrate Sentry or similar for production error monitoring
- **Performance Metrics**: Core Web Vitals tracking
- **User Analytics**: Track feature usage for product decisions

---

*This document should be updated with each major feature release or API change.* 