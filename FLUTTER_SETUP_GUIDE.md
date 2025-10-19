# Flutter Environment Setup Guide

This guide provides comprehensive instructions for setting up the Flutter frontend of KsheerMitra.

## Prerequisites

- Flutter SDK >= 3.0.0
- Dart SDK (comes with Flutter)
- Android Studio or Xcode (for building mobile apps)
- A physical device or emulator

## Installation Steps

### 1. Install Flutter SDK

#### macOS/Linux:
```bash
# Download Flutter SDK
git clone https://github.com/flutter/flutter.git -b stable ~/flutter

# Add Flutter to PATH
export PATH="$PATH:$HOME/flutter/bin"

# Verify installation
flutter doctor
```

#### Windows:
1. Download Flutter SDK from https://flutter.dev/docs/get-started/install/windows
2. Extract to a location (e.g., C:\flutter)
3. Add to PATH: `C:\flutter\bin`
4. Run `flutter doctor` in Command Prompt

### 2. Install Dependencies

```bash
cd ksheermitra
flutter pub get
```

### 3. Environment Configuration

The Flutter app requires environment variables for API communication. There are two ways to configure them:

#### Option A: Compile-Time Configuration (Recommended for Development)

Set environment variables when running the app:

```bash
# Development with local backend
flutter run --dart-define=API_BASE_URL=http://localhost:5000

# Development with ngrok/tunnel
flutter run --dart-define=API_BASE_URL=https://your-ngrok-url.ngrok-free.app

# Production
flutter run --dart-define=API_BASE_URL=https://api.ksheermitra.com
```

#### Option B: Using flutter_dotenv (Alternative)

If you want to use a .env file approach:

1. Add `flutter_dotenv` to `pubspec.yaml`:
```yaml
dependencies:
  flutter_dotenv: ^5.1.0
```

2. Create `.env` file in `ksheermitra/` directory:
```env
API_BASE_URL=http://localhost:5000
GOOGLE_MAPS_API_KEY=your_api_key_here
```

3. Add `.env` to `pubspec.yaml` assets:
```yaml
flutter:
  assets:
    - .env
```

4. Load in `main.dart`:
```dart
import 'package:flutter_dotenv/flutter_dotenv.dart';

Future<void> main() async {
  await dotenv.load(fileName: ".env");
  runApp(MyApp());
}
```

5. Update `api_config.dart` to use dotenv:
```dart
import 'package:flutter_dotenv/flutter_dotenv.dart';

class ApiConfig {
  static String get baseUrl => dotenv.env['API_BASE_URL'] ?? 'http://localhost:5000';
  static String get googleMapsApiKey => dotenv.env['GOOGLE_MAPS_API_KEY'] ?? '';
}
```

**Note:** Don't forget to add `.env` to `.gitignore`!

### 4. Google Maps Configuration

#### Android Setup

1. Get Google Maps API Key from [Google Cloud Console](https://console.cloud.google.com/)

2. Add to `android/app/src/main/AndroidManifest.xml`:
```xml
<manifest>
  <application>
    <meta-data
      android:name="com.google.android.geo.API_KEY"
      android:value="YOUR_GOOGLE_MAPS_API_KEY"/>
  </application>
</manifest>
```

3. Update `android/app/build.gradle`:
```gradle
android {
    compileSdkVersion 33
    
    defaultConfig {
        minSdkVersion 21
        targetSdkVersion 33
    }
}
```

#### iOS Setup

1. Add to `ios/Runner/AppDelegate.swift`:
```swift
import GoogleMaps

@UIApplicationMain
@objc class AppDelegate: FlutterAppDelegate {
  override func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
  ) -> Bool {
    GMSServices.provideAPIKey("YOUR_GOOGLE_MAPS_API_KEY")
    GeneratedPluginRegistrant.register(with: self)
    return super.application(application, didFinishLaunchingWithOptions: launchOptions)
  }
}
```

2. Update `ios/Podfile`:
```ruby
platform :ios, '12.0'
```

### 5. Location Permissions

#### Android Permissions

Already configured in `android/app/src/main/AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.INTERNET" />
```

#### iOS Permissions

Add to `ios/Runner/Info.plist`:
```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>This app needs access to your location to show delivery addresses on the map.</string>
<key>NSLocationAlwaysUsageDescription</key>
<string>This app needs access to your location to track deliveries.</string>
```

## Running the App

### Development Mode

```bash
# Check connected devices
flutter devices

# Run on connected device
flutter run

# Run with environment variables
flutter run --dart-define=API_BASE_URL=http://10.0.2.2:5000  # Android emulator
flutter run --dart-define=API_BASE_URL=http://localhost:5000  # iOS simulator

# Run in release mode
flutter run --release
```

### Building for Production

#### Android APK:
```bash
flutter build apk --release --dart-define=API_BASE_URL=https://api.ksheermitra.com
```

#### Android App Bundle (for Play Store):
```bash
flutter build appbundle --release --dart-define=API_BASE_URL=https://api.ksheermitra.com
```

#### iOS:
```bash
flutter build ios --release --dart-define=API_BASE_URL=https://api.ksheermitra.com
```

## Troubleshooting

### Issue: Cannot connect to backend

**Solution:**
- For Android emulator, use `10.0.2.2` instead of `localhost`
- For iOS simulator, use `localhost`
- For physical devices, use your computer's IP address or ngrok tunnel

### Issue: Google Maps not showing

**Solution:**
1. Verify API key is correct
2. Enable Maps SDK for Android/iOS in Google Cloud Console
3. Check billing is enabled in Google Cloud
4. Verify API key has no restrictions or correct restrictions

### Issue: Location permission denied

**Solution:**
1. Verify permissions are in AndroidManifest.xml / Info.plist
2. Check app settings on device and grant location permissions
3. Request permissions at runtime using `geolocator` package

### Issue: Build fails

**Solution:**
1. Run `flutter clean`
2. Run `flutter pub get`
3. Check Flutter and Dart versions: `flutter doctor`
4. Update dependencies: `flutter pub upgrade`

## Verification Checklist

- [ ] Flutter SDK installed and in PATH
- [ ] `flutter doctor` shows no critical issues
- [ ] Dependencies installed: `flutter pub get`
- [ ] API_BASE_URL configured correctly
- [ ] Google Maps API key added (if using maps)
- [ ] Location permissions configured
- [ ] App builds successfully: `flutter build apk --debug`
- [ ] App runs on emulator/device
- [ ] Can connect to backend API
- [ ] Google Maps renders correctly (if applicable)

## Next Steps

After setup:
1. Test login flow with OTP
2. Verify product listing loads
3. Test map features
4. Test subscription creation
5. Run full integration tests

## Additional Resources

- [Flutter Documentation](https://flutter.dev/docs)
- [Google Maps Flutter Plugin](https://pub.dev/packages/google_maps_flutter)
- [Geolocator Plugin](https://pub.dev/packages/geolocator)
- [Flutter Riverpod](https://riverpod.dev/)
