# Miran Dashboard

A responsive admin dashboard for the **Miran** health & fitness mobile app. Built with React 18, TypeScript, Vite, and Tailwind CSS with Django REST API integration.

## 🚀 Features

- **Overview Dashboard** - Operational CRUD interface with key metrics
- **User Management** - Role-based access control (Admin, Trainer, Operation)
- **Nutrition Management** - Food products and nutrition data management
- **Workout Library** - Exercise database with S3 video/image storage
- **Program Templates** - Workout program creation and management
- **Trainer Management** - Professional trainer profiles and management
- **Settings** - Comprehensive admin configuration panel
- **Dark Mode** - Toggle between light and dark themes
- **RTL/Arabic Support** - Full internationalization with react-i18next
- **Role-Based Permissions** - Granular access control with HOC components
- **File Upload** - AWS S3 integration with pre-signed URLs
- **Responsive Design** - Mobile-first approach with collapsible sidebar

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Django REST API integration
- **Styling**: Tailwind CSS with custom Miran brand colors
- **Icons**: Lucide React
- **Routing**: React Router DOM v6
- **State Management**: Zustand with persistence
- **API Client**: Axios with interceptors
- **File Storage**: AWS S3 with pre-signed URLs
- **Internationalization**: react-i18next with RTL support
- **Code Quality**: ESLint + Prettier

## 🎨 Design System

### Brand Colors
- **Primary**: `#7F56D9` (Purple)
- **Secondary**: `#EC4899` (Pink) 
- **Accent**: `#1A8973` (Teal)
- **Muted**: `#F3F4F6` (Light Gray)

### Custom Components
- `StatsCard` - Reusable KPI display cards
- `FileDropzone` - S3 file upload with progress tracking
- `WithRole` - HOC for role-based access control
- `DirectionProvider` - RTL/LTR layout switching

## 📁 Project Structure

```
miran-dashboard/
├── public/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── DashboardLayout.tsx
│   │   │   ├── Header.tsx
│   │   │   └── Sidebar.tsx
│   │   ├── ui/
│   │   │   ├── StatsCard.tsx
│   │   │   └── FileDropzone.tsx
│   │   ├── withRole.tsx         # RBAC HOC
│   │   └── DirectionProvider.tsx # RTL support
│   ├── routes/
│   │   ├── Overview.tsx
│   │   ├── Users.tsx
│   │   ├── Food.tsx
│   │   ├── Workouts.tsx
│   │   ├── Programs.tsx
│   │   ├── Trainers.tsx
│   │   └── Settings.tsx
│   ├── store/
│   │   ├── ThemeStore.ts
│   │   └── AuthStore.ts         # RBAC state management
│   ├── lib/
│   │   ├── api.ts               # Django REST API client
│   │   ├── s3.ts                # AWS S3 helpers
│   │   └── i18n.ts              # Internationalization
│   ├── App.tsx
│   └── main.tsx
├── tailwind.config.js
├── vite.config.ts
└── package.json
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Django REST API backend running
- AWS S3 bucket configured

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/mowaleed92/miran-dashboard.git
   cd miran-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:3000
   ```

## 📜 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run format` - Format code with Prettier

## 🔧 Configuration

### Environment Variables

Create a `.env` file based on `env.example`:

```env
# API Configuration
VITE_API_URL=https://api.miran.com/v1

# AWS S3 Configuration
VITE_S3_REGION=me-central-1

# App Configuration
VITE_APP_NAME=Miran Dashboard
VITE_APP_VERSION=1.0.0

# Environment
NODE_ENV=development

# Optional: Feature flags
VITE_ENABLE_MOCK_DATA=true
VITE_ENABLE_DEBUG=true
```

## 👥 User Roles & Permissions

### Admin
- Full access to all features
- User management and role assignment
- System settings and configuration
- Analytics and reporting

### Trainer
- Workout and program management
- View user profiles
- Limited analytics access
- No system settings

### Operation
- Product/nutrition management
- View-only access to users and workouts
- Basic reporting capabilities
- No system settings

## 📋 TODO List

### High Priority
- [x] Django REST API integration with Axios
- [x] Role-based access control (Admin, Trainer, Operation)
- [x] RTL/Arabic support with react-i18next
- [x] AWS S3 file upload integration
- [x] Remove heavy analytics (operational CRUD focus)
- [ ] Complete CRUD operations for all entities
- [ ] Form validation and error handling
- [ ] Authentication integration with Django

### Medium Priority  
- [ ] Real-time notifications
- [ ] Advanced filtering and search
- [ ] Data export functionality (CSV/PDF)
- [ ] Bulk operations
- [ ] Audit logging

### Low Priority
- [ ] Unit tests with Vitest + React Testing Library
- [ ] E2E tests with Playwright
- [ ] PWA support
- [ ] Offline functionality
- [ ] Performance optimization

## 🌐 API Integration

The dashboard integrates with Django REST API endpoints:

### Authentication
- `POST /auth/login/` - User authentication
- `POST /auth/refresh/` - Token refresh
- `POST /auth/logout/` - User logout

### Core Entities
- `GET/POST/PATCH/DELETE /users/` - User management
- `GET/POST/PATCH/DELETE /products/` - Nutrition products
- `GET/POST/PATCH/DELETE /workouts/` - Exercise library
- `GET/POST/PATCH/DELETE /programs/` - Workout programs
- `GET/POST/PATCH/DELETE /trainers/` - Trainer management

### File Upload
- `POST /upload/presigned-url/` - Get S3 pre-signed URL

## 🌍 Internationalization

Supports:
- **English** (LTR layout) - Default
- **Arabic** (RTL layout) - Full support

Language switching automatically adjusts:
- Text direction (LTR/RTL)
- Layout mirroring
- Font selection
- Number formatting

## 🎯 Target Users

- **Miran Admins** - Full system management
- **Fitness Trainers** - Content creation and client management  
- **Operations Team** - Product and content management
- **Future: Nutritionists** - Specialized nutrition management

## 🔒 Security Features

- JWT token-based authentication
- Role-based access control
- Secure file uploads via pre-signed URLs
- API request/response interceptors
- Session timeout handling

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Miran App**: [miranapp.com](https://miranapp.com)
- **Repository**: [github.com/mowaleed92/miran-dashboard](https://github.com/mowaleed92/miran-dashboard)
- **Issues**: [GitHub Issues](https://github.com/mowaleed92/miran-dashboard/issues)

---

Built with ❤️ by the Miran Team 