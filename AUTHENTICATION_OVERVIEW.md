# Authentication Module Overview

## High-Level Flow

The authentication system follows a standard JWT-based flow with React Context for state management:

```
User Input → LoginForm → authService → API (/trainer-login) → JWT Token → localStorage → AuthContext → ProtectedRoute
```

### Primary Authentication Flow
1. User enters credentials in `LoginForm.tsx`
2. Form validates input and calls `authService.login()`
3. Service makes POST request to `/api/user/trainer-login`
4. API returns wrapped response with user data and JWT token
5. Token stored in localStorage with key `auth_token`
6. `AuthContext` updates global auth state
7. `ProtectedRoute` components allow access to dashboard

### Password Reset Flow (Optional)
1. User clicks "Forgot Password" link
2. `ForgotPasswordForm.tsx` captures email input
3. Calls `authService.requestReset()` → POST `/api/user/request-reset-password`
4. Success toast notification displayed
5. User receives reset email (handled by backend)

## API Contract

### Base Configuration
- **Base URL**: `https://testing.miranapp.com` (production)
- **Proxy**: `/api/*` → `https://testing.miranapp.com/api/*` (development)
- **Content-Type**: `application/json`

### Login Endpoint

**POST** `/api/user/trainer-login`

**Request:**
```json
{
  "email": "mohamed.ibrahim@welnes.app",
  "password": "123456789"
}
```

**Response (Success - 200):**
```json
{
  "result": {
    "id": 702103,
    "email": "mohamed.ibrahim@welnes.app",
    "full_name": "mohammed Ibraiam",
    "token": "9ac316d0d39bca384e836b8547ce59446c7645f1",
    "user_role": "trainer"
  },
  "status": true,
  "message": "Data Showed Successfully"
}
```

**Response (Error - 422):**
```json
{
  "status": false,
  "message": "Invalid credentials"
}
```

### Password Reset Endpoint

**POST** `/api/user/request-reset-password`

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "status": true,
  "message": "Reset email sent successfully"
}
```

### Sample cURL Commands

**Login:**
```bash
curl -X POST https://testing.miranapp.com/api/user/trainer-login \
  -H "Content-Type: application/json" \
  -d '{"email":"mohamed.ibrahim@welnes.app","password":"123456789"}'
```

**Password Reset:**
```bash
curl -X POST https://testing.miranapp.com/api/user/request-reset-password \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com"}'
```

## Frontend Implementation

### `src/services/authService.ts`
Core API service layer with error handling and response transformation.

**Key Functions:**
- `login(email, password)` - Authenticates user and returns user data
- `requestReset(email)` - Initiates password reset flow

**Features:**
- Axios-based HTTP client with 10-second timeout
- Automatic response unwrapping from `result` field
- Network error detection and user-friendly messages
- TypeScript interfaces for type safety

```typescript
interface LoginResponse {
  id: number;
  email: string;
  name: string;
  token: string;
  role: string;
}
```

### `src/contexts/AuthContext.tsx`
React Context provider for global authentication state management.

**State Management:**
- `user: User | null` - Current authenticated user
- `token: string | null` - JWT authentication token
- `isLoading: boolean` - Loading state for auth operations

**Key Methods:**
- `login(email, password)` - Handles login flow with error handling
- `logout()` - Clears auth state and localStorage
- `checkAuthStatus()` - Validates stored token on app initialization

**Persistence:**
- Uses `localStorage` with key `auth_token`
- Automatic token restoration on app reload
- Safe localStorage operations via `src/utils/storage.ts`

### `src/components/auth/LoginForm.tsx`
Controlled form component with validation and loading states.

**Form Validation:**
- Email format validation with regex pattern
- Password minimum length (6 characters)
- Real-time error display
- Disabled submit during loading

**UI Features:**
- Loading spinner on submit button
- Error message display
- "Forgot Password" link toggle
- Responsive design with Tailwind CSS

**State Management:**
```typescript
const [formData, setFormData] = useState({
  email: '',
  password: ''
});
const [errors, setErrors] = useState<{[key: string]: string}>({});
const [isLoading, setIsLoading] = useState(false);
```

### `src/components/auth/ForgotPasswordForm.tsx`
Simplified form for password reset requests.

**Features:**
- Single email input with validation
- Toast notifications for success/error feedback
- Back to login navigation
- Consistent styling with login form

### `src/routes/ProtectedRoute.tsx`
Route wrapper component for authentication enforcement.

**Logic:**
- Checks `AuthContext` for authenticated user
- Redirects to `/login` if unauthenticated
- Preserves intended destination in URL state
- Renders children components if authenticated

```typescript
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
```

### Route Integration in `src/App.tsx`
Router configuration with authentication boundaries.

**Route Structure:**
- `/login` - Public login page
- `/` - Protected dashboard (wrapped in `ProtectedRoute`)
- All dashboard subroutes inherit protection

**AuthProvider Placement:**
- Wraps entire Router to provide auth context globally
- Enables auth state access in all components

## Security Considerations

### Token Storage
**Current Implementation:** localStorage
- ✅ Survives browser refresh/restart
- ✅ Simple implementation
- ⚠️ Vulnerable to XSS attacks
- ⚠️ Accessible via JavaScript

**Alternative (Future):** HTTP-only cookies
- ✅ Not accessible via JavaScript (XSS protection)
- ✅ Automatic inclusion in requests
- ⚠️ Requires CSRF protection
- ⚠️ More complex implementation

### HTTPS Enforcement
- Production deployment must use HTTPS
- Prevents token interception during transmission
- Netlify provides automatic HTTPS

### Token Refresh Strategy (Future Work)
Current implementation uses long-lived tokens. Consider implementing:
- Short-lived access tokens (15-30 minutes)
- Refresh token rotation
- Automatic token renewal before expiration

### XSS Protection
- Sanitize all user inputs
- Use Content Security Policy (CSP) headers
- Regular dependency updates for security patches

### CSRF Protection
- Not required for current localStorage approach
- Would be necessary if switching to HTTP-only cookies
- Consider implementing CSRF tokens for sensitive operations

## Styling & UX

### Tailwind CSS Conventions
**Color Scheme:**
- Primary: `blue-600` / `blue-500` for buttons and links
- Success: `green-600` for success states
- Error: `red-600` for error messages
- Background: `gray-50` (light) / `gray-900` (dark)

**Component Patterns:**
- Form inputs: `border border-gray-300 rounded-lg px-3 py-2`
- Buttons: `bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg`
- Error text: `text-red-600 text-sm mt-1`

### Dark Mode Support
- Uses `dark:` prefixes for dark mode variants
- Automatic theme detection via `useThemeStore`
- Consistent color scheme across light/dark modes

**Example:**
```css
bg-white dark:bg-gray-800 text-gray-900 dark:text-white
```

### Keyboard Accessibility
- Tab navigation through form fields
- Enter key submits forms
- Escape key closes modals/forms
- Focus indicators on interactive elements
- Screen reader friendly labels and ARIA attributes

### Loading States
- Button spinners during form submission
- Disabled form fields during loading
- Visual feedback for all async operations

## Extensibility

### Adding Social Login Providers
**Implementation Strategy:**
1. Add provider-specific buttons to `LoginForm.tsx`
2. Create new service methods in `authService.ts`
3. Handle OAuth redirect flows
4. Merge social auth with existing JWT flow

**Example Structure:**
```typescript
// In authService.ts
export const loginWithGoogle = async (token: string): Promise<LoginResponse> => {
  // Handle Google OAuth token exchange
};

// In LoginForm.tsx
const handleGoogleLogin = async (googleToken: string) => {
  const userData = await authService.loginWithGoogle(googleToken);
  await login(userData.email, userData.token);
};
```

### Token Refresh Implementation
**Hook Location:** `src/contexts/AuthContext.tsx`

```typescript
const refreshToken = async () => {
  try {
    const response = await authService.refreshToken();
    setToken(response.token);
    storage.setItem('auth_token', response.token);
  } catch (error) {
    logout(); // Force re-authentication
  }
};

// Auto-refresh before expiration
useEffect(() => {
  const interval = setInterval(refreshToken, 14 * 60 * 1000); // 14 minutes
  return () => clearInterval(interval);
}, []);
```

### Logout API Integration
**Current:** Client-side only (clears localStorage)
**Future:** Server-side token invalidation

```typescript
// In authService.ts
export const logout = async (): Promise<void> => {
  await apiClient.post('/api/user/logout');
};

// In AuthContext.tsx
const logout = async () => {
  try {
    await authService.logout();
  } finally {
    setUser(null);
    setToken(null);
    storage.removeItem('auth_token');
  }
};
```

### Role-Based Access Control (RBAC)
**Current Roles:** Admin, Trainer, Operation
**Implementation:** Add role checks to `ProtectedRoute`

```typescript
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string[];
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { user } = useAuth();
  
  if (!user) return <Navigate to="/login" />;
  
  if (requiredRole && !requiredRole.includes(user.role)) {
    return <Navigate to="/unauthorized" />;
  }
  
  return <>{children}</>;
};
```

## Testing Strategy

### Unit Testing with Vitest
**Test Files:**
- `src/services/__tests__/authService.test.ts`
- `src/contexts/__tests__/AuthContext.test.tsx`
- `src/components/auth/__tests__/LoginForm.test.tsx`

**Mock Strategy:**
```typescript
// Mock API responses
vi.mock('../authService', () => ({
  login: vi.fn(),
  requestReset: vi.fn()
}));

// Test authentication flows
describe('AuthContext', () => {
  it('should login user successfully', async () => {
    const mockUser = { id: 1, email: 'test@example.com' };
    authService.login.mockResolvedValue(mockUser);
    
    // Test implementation
  });
});
```

### Integration Testing with MSW
**Mock Server Setup:**
```typescript
// src/mocks/handlers.ts
export const handlers = [
  rest.post('/api/user/trainer-login', (req, res, ctx) => {
    return res(
      ctx.json({
        result: {
          id: 1,
          email: 'test@example.com',
          full_name: 'Test User',
          token: 'mock-jwt-token',
          user_role: 'trainer'
        },
        status: true,
        message: 'Success'
      })
    );
  })
];
```

### E2E Testing Considerations
- Test complete login/logout flows
- Verify protected route redirects
- Test form validation and error handling
- Verify token persistence across browser sessions

**Recommended Tools:**
- Playwright or Cypress for E2E testing
- Test authentication flows in isolated browser contexts
- Mock external API dependencies for consistent testing 