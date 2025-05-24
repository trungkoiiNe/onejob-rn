# OneJob - Job Search & Recruitment Platform

A comprehensive React Native mobile application built with Expo that connects job seekers with employers in an intuitive and efficient way. The platform supports multiple user roles including employees, employers, and administrators.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [User Roles](#user-roles)
- [Database Schema](#database-schema)
- [Environment Setup](#environment-setup)
- [Development](#development)
- [Screenshots](#screenshots)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

### For Job Seekers (Employees)
- **Smart Job Discovery**: Browse and search through available job listings
- **Application Tracking**: Monitor application status and interview schedules
- **Profile Management**: Maintain professional profiles with resume uploads
- **Personalized Dashboard**: View application statistics and job recommendations
- **Real-time Notifications**: Get updates on application status changes

### For Employers
- **Company Profile Management**: Create and manage company profiles with logos and cover images
- **Job Posting**: Post job listings with detailed requirements and benefits
- **Application Management**: Review and manage candidate applications
- **Interview Scheduling**: Coordinate interviews with potential candidates
- **Analytics Dashboard**: Track hiring performance and application metrics
- **Dual API Methods**: Choose between direct database operations and RPC calls

### For Administrators
- **User Management**: Oversee all users on the platform
- **Job Verification**: Review and approve job postings
- **Platform Analytics**: Monitor platform usage and performance metrics
- **Content Moderation**: Ensure quality and appropriateness of content

### Cross-Platform Features
- **Google Authentication**: Secure sign-in with Google accounts
- **Image Upload & Processing**: Automatic WebP conversion for optimized storage
- **Responsive Design**: Works seamlessly on both iOS and Android
- **Onboarding Experience**: Intuitive introduction for new users
- **Real-time Updates**: Live data synchronization across devices

## 🛠 Tech Stack

### Frontend
- **React Native**: Cross-platform mobile development
- **Expo**: Development platform and tools
- **TypeScript**: Type-safe JavaScript development
- **Expo Router**: File-based navigation system
- **React Native Reanimated**: High-performance animations
- **Zustand**: Lightweight state management

### Backend & Database
- **Supabase**: Backend-as-a-Service platform
- **PostgreSQL**: Relational database
- **Supabase Auth**: Authentication service
- **Supabase Storage**: File storage service
- **Real-time Subscriptions**: Live data updates

### UI & Design
- **React Native Vector Icons**: Icon library (Feather, Ionicons)
- **Expo Linear Gradient**: Beautiful gradient backgrounds
- **React Native Animatable**: Pre-built animations
- **Custom Styling**: Tailored design system

### Additional Libraries
- **React Native Google Sign In**: Google authentication
- **React Native Date Picker**: Date selection components
- **Expo Image Manipulator**: Image processing and optimization
- **React Native MMKV**: High-performance key-value storage
- **React Native Snap Carousel**: Touch-friendly carousels

## 🏗 Architecture

The application follows a modular architecture with clear separation of concerns:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Presentation  │    │    Business     │    │      Data       │
│     Layer       │────│     Logic       │────│     Layer       │
│  (Components)   │    │   (Stores)      │    │   (Supabase)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### State Management
- **Zustand Stores**: Centralized state management for auth, jobs, and companies
- **Type Safety**: Full TypeScript integration for better development experience
- **Persistence**: Automatic state persistence with MMKV

### Navigation
- **File-based Routing**: Expo Router for intuitive navigation structure
- **Role-based Access**: Different navigation stacks for different user types
- **Deep Linking**: Support for deep links and navigation state persistence

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Expo CLI
- Android Studio (for Android development)
- Xcode (for iOS development)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/onejob-rn.git
   cd onejob-rn
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   EXPO_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
   ```

4. **Start the development server**
   ```bash
   npm start
   # or
   expo start
   ```

5. **Run on device/simulator**
   - Press `a` for Android
   - Press `i` for iOS
   - Scan QR code with Expo Go app

## 📁 Project Structure

```
onejob-rn/
├── app/                     # Screen components (Expo Router)
│   ├── admin/              # Admin dashboard and features
│   ├── auth/               # Authentication screens
│   ├── employee/           # Employee dashboard and features
│   ├── employer/           # Employer dashboard and features
│   ├── _layout.tsx         # Root layout component
│   └── index.tsx           # Onboarding screen
├── components/             # Reusable UI components
├── constants/              # App constants and configurations
├── stores/                 # Zustand state management
│   ├── authStore.ts        # Authentication state
│   ├── jobStore.tsx        # Jobs and companies state
│   └── supabase.ts         # Supabase client configuration
├── utils/                  # Utility functions
│   └── imagePicker.ts      # Image handling utilities
├── assets/                 # Static assets (images, fonts)
└── android/                # Android-specific files
```

## 👥 User Roles

### Employee Role
- Default role for new users
- Access to job search and application features
- Personal dashboard with application tracking

### Employer Role
- Assigned to specific email addresses
- Company profile management
- Job posting and application review capabilities
- Hiring analytics and reporting

### Admin Role
- Super user access
- Platform oversight and management
- User and content moderation tools

## 🗄 Database Schema

### Key Tables
- **users_data**: User profiles and role information
- **companies**: Company profiles and details
- **jobs**: Job listings with requirements and benefits
- **applications**: Job applications and status tracking

### Relationships
- Users can create multiple companies (employer role)
- Companies can have multiple job postings
- Jobs can receive multiple applications
- Users can submit applications to multiple jobs

## ⚙️ Environment Setup

### Supabase Configuration
1. Create a new Supabase project
2. Set up authentication providers (Google)
3. Configure database tables and RLS policies
4. Add your Supabase credentials to environment variables

### Google Authentication Setup
1. Create a Google Cloud Project
2. Enable Google Identity API
3. Configure OAuth credentials
4. Add SHA-1 fingerprints for Android
5. Configure redirect URLs in Supabase

Detailed setup instructions are available in `stores/README.md`.

## 💻 Development

### Available Scripts
```bash
npm start          # Start Expo development server
npm run android    # Run on Android device/emulator
npm run ios        # Run on iOS device/simulator
npm run web        # Run on web browser
npm test           # Run test suite
```

### Development Guidelines
- Follow TypeScript best practices
- Use ESLint and Prettier for code formatting
- Implement proper error handling
- Write unit tests for utility functions
- Follow React Native performance best practices

### Key Features Implementation

#### Image Upload & Processing
- Automatic WebP conversion for optimal file sizes
- Image resizing and compression
- Supabase Storage integration
- Error handling and user feedback

#### Dual API Approach
The app supports both direct database operations and RPC calls:
- **Direct Database**: Faster, direct Supabase queries
- **RPC Calls**: Server-side logic execution
- Toggle available in forms for testing both approaches

#### Real-time Updates
- Live job posting updates
- Real-time application status changes
- Instant notifications for important events

## 📱 Screenshots

> Screenshots of the application would be added here showing:
> - Onboarding flow
> - Authentication screens
> - Employee dashboard
> - Employer dashboard
> - Job posting interface
> - Company profile management

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Setup for Contributors
1. Follow the installation steps above
2. Create a new branch for your feature
3. Make your changes following the coding guidelines
4. Test thoroughly on both platforms
5. Submit a pull request with detailed description

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [Supabase Documentation](https://supabase.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

## 📞 Support

For support and questions:
- Create an issue in the GitHub repository
- Contact the development team
- Check the documentation in the `stores/README.md` file

---

**OneJob** - Connecting talent with opportunity, one job at a time. 🚀
