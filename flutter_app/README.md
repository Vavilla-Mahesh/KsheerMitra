# KsheerMitra Flutter App

Production-ready Flutter mobile application for KsheerMitra Milk Delivery Management System.

## Tech Stack

- **Framework**: Flutter (3.0+)
- **State Management**: Riverpod
- **HTTP Client**: Dio with interceptors
- **Secure Storage**: flutter_secure_storage
- **Date/Time**: intl

## Features

### Authentication
- Email/password signup and login
- Secure token storage (flutter_secure_storage)
- Persistent login with auto-refresh
- Automatic token refresh on expiration
- Secure logout with server-side token revocation

### Role-Based Interface

#### Customer
- View and manage subscriptions
- Place one-off orders
- View monthly billing with daily breakdown
- Adjust subscription quantities for specific dates

#### Admin
- Product CRUD operations
- User management
- Delivery tracking and management

#### Delivery Boy
- View assigned deliveries
- Update delivery status
- Track daily routes

### UI/UX
- Material Design 3
- Dark and light theme support
- Responsive layout
- Professional, minimalistic design
- No demo/mock data - all from backend API

## Project Structure

```
lib/
├── config/
│   ├── api_config.dart          # API endpoints
│   └── theme_config.dart        # Light/dark themes
├── models/                      # Data models
│   ├── user_model.dart
│   ├── product_model.dart
│   ├── subscription_model.dart
│   ├── order_model.dart
│   ├── delivery_model.dart
│   └── billing_model.dart
├── services/                    # API services
│   ├── api_service.dart        # Dio client with interceptors
│   └── auth_service.dart       # Authentication
├── providers/                   # Riverpod providers
│   ├── api_provider.dart
│   └── auth_provider.dart
├── screens/                     # UI screens
│   ├── auth/
│   │   ├── login_screen.dart
│   │   └── signup_screen.dart
│   ├── customer/
│   │   ├── customer_home_screen.dart
│   │   ├── subscriptions_screen.dart
│   │   ├── orders_screen.dart
│   │   └── billing_screen.dart
│   ├── admin/
│   │   ├── admin_home_screen.dart
│   │   └── products_screen.dart
│   ├── delivery/
│   │   └── delivery_home_screen.dart
│   └── home_screen.dart
├── widgets/                     # Reusable widgets
└── main.dart                    # App entry point
```

## Setup Instructions

### Prerequisites

- Flutter SDK (3.0 or higher)
- Dart SDK (3.0 or higher)
- Android Studio / Xcode (for mobile development)

### Installation

1. Install dependencies:
```bash
flutter pub get
```

2. Configure API endpoint:
   - Default: `http://localhost:3000`
   - To override, set environment variable:
```bash
flutter run --dart-define=API_BASE_URL=https://your-api-url.com
```

3. Run the app:
```bash
# Development
flutter run

# Build for production
flutter build apk       # Android
flutter build ios       # iOS
```

## Configuration

### API Base URL

The API base URL is configured in `lib/config/api_config.dart`:

```dart
static const String baseUrl = String.fromEnvironment(
  'API_BASE_URL',
  defaultValue: 'http://localhost:3000',
);
```

Override using:
```bash
flutter run --dart-define=API_BASE_URL=https://api.example.com
```

### Secure Storage

Refresh tokens are stored securely using `flutter_secure_storage`:
- Android: EncryptedSharedPreferences
- iOS: Keychain

## Authentication Flow

1. **Login/Signup**: User provides credentials
2. **Token Storage**: Access and refresh tokens stored securely
3. **API Requests**: Access token automatically attached to requests
4. **Token Expiration**: Interceptor detects 401 errors
5. **Auto Refresh**: Refresh token used to get new access token
6. **Retry Request**: Original request retried with new token
7. **Refresh Failure**: User logged out, redirected to login

## State Management

Using Riverpod for:
- Authentication state
- API service access
- Data fetching and caching
- UI state management

## Themes

### Light Theme
- Material Design 3
- Blue primary color
- Clean, professional look

### Dark Theme
- Material Design 3
- Blue primary color (dark variant)
- Eye-friendly for night use

Theme automatically follows system setting or can be manually toggled.

## Security Features

- Secure token storage using platform-specific encryption
- Automatic token refresh
- Server-side token revocation on logout
- HTTPS recommended for production
- No sensitive data in logs

## Error Handling

- Network errors with retry options
- Token expiration handling
- User-friendly error messages
- Graceful degradation

## Future Enhancements

<!-- Integration points for OTP authentication -->
<!-- Integration points for Maps/location services -->

These features are deliberately excluded but can be added later:

### OTP Integration
Add OTP verification after signup/login by:
1. Adding OTP screen in `screens/auth/`
2. Creating OTP service in `services/`
3. Updating auth flow in `providers/auth_provider.dart`

### Maps Integration
Add location picker and delivery routing by:
1. Adding `google_maps_flutter` package
2. Creating map screen in `screens/`
3. Integrating with location services
4. Adding delivery route optimization

## Testing

```bash
# Run tests
flutter test

# Run with coverage
flutter test --coverage
```

## Building for Production

### Android

```bash
# Build APK
flutter build apk --release

# Build App Bundle
flutter build appbundle --release
```

### iOS

```bash
# Build IPA
flutter build ios --release
```

## Common Issues

### Android Build Issues
- Ensure Android SDK is properly configured
- Set minimum SDK version to 21 in `android/app/build.gradle`

### iOS Build Issues
- Run `pod install` in `ios/` directory
- Ensure proper code signing in Xcode

### Network Issues
- Check API_BASE_URL configuration
- Ensure backend is running and accessible
- Check network permissions in AndroidManifest.xml

## Development Tips

1. Use hot reload for faster development
2. Check `flutter doctor` for setup issues
3. Use Flutter DevTools for debugging
4. Test on multiple screen sizes
5. Test both light and dark themes

## Performance

- Optimized image loading
- Efficient state management
- Lazy loading of data
- Minimal rebuilds with Riverpod

## Accessibility

- Semantic labels for screen readers
- Proper contrast ratios
- Keyboard navigation support
- Text scaling support
