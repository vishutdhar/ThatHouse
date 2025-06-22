# That House - Tinder-Style Real Estate App

A modern real estate discovery app that combines Zillow's property functionality with Tinder's intuitive swipe interface. Built with React Native and TypeScript for cross-platform mobile development.

## Features

### MVP Features (Implemented)
- **Swipe Interface**: Intuitive swipe right to save, left to pass, up for super likes
- **Property Cards**: Beautiful property cards with key information and images
- **User Authentication**: Simple login/signup flow
- **Saved Properties**: View and manage your liked properties
- **Property Details**: Comprehensive property information pages
- **Messaging System**: Connect with agents about properties
- **User Profile**: Manage preferences and settings

### Architecture
- **Frontend**: React Native with TypeScript
- **State Management**: Redux Toolkit
- **Navigation**: React Navigation
- **UI Components**: Custom components with React Native Vector Icons
- **Gesture Handling**: React Native Gesture Handler for smooth swipes

## Prerequisites

Before running this project, make sure you have:
- Node.js (v16 or later)
- npm or Yarn
- React Native development environment set up:
  - For iOS: Xcode (Mac only)
  - For Android: Android Studio
- CocoaPods (for iOS)

## Installation

1. Clone the repository:
```bash
cd ~/Desktop/That_House/ThatHouse
```

2. Install dependencies:
```bash
npm install
```

3. Install iOS dependencies (Mac only):
```bash
cd ios && pod install && cd ..
```

## Running the App

### iOS (Mac only)
```bash
npx react-native run-ios
```
Or open `ios/ThatHouse.xcworkspace` in Xcode and run from there.

### Android
```bash
npx react-native run-android
```
Make sure you have an Android emulator running or a device connected.

## Project Structure

```
src/
├── components/       # Reusable UI components
│   └── PropertyCard.tsx
├── screens/         # Screen components
│   ├── LoginScreen.tsx
│   ├── OnboardingScreen.tsx
│   ├── SwipeScreen.tsx
│   ├── SavedPropertiesScreen.tsx
│   ├── MessagesScreen.tsx
│   ├── ProfileScreen.tsx
│   ├── PropertyDetailsScreen.tsx
│   └── ConversationScreen.tsx
├── navigation/      # Navigation configuration
│   └── AppNavigator.tsx
├── store/          # Redux store and slices
│   ├── index.ts
│   └── slices/
│       ├── userSlice.ts
│       ├── propertiesSlice.ts
│       ├── messagesSlice.ts
│       └── uiSlice.ts
├── types/          # TypeScript type definitions
│   └── index.ts
├── services/       # API and external services
├── utils/          # Utility functions
└── assets/         # Images and other assets
```

## Development Workflow

### Adding New Features
1. Create types in `src/types/index.ts`
2. Add Redux slice if needed in `src/store/slices/`
3. Create screen component in `src/screens/`
4. Update navigation in `src/navigation/AppNavigator.tsx`

### State Management
The app uses Redux Toolkit for state management with the following slices:
- **user**: User authentication and profile data
- **properties**: Property listings and filters
- **messages**: Conversations and messaging
- **ui**: UI state like theme and active tabs

### Styling
- Uses React Native StyleSheet for performance
- Consistent color scheme with primary color `#FF6B6B`
- Responsive design using Dimensions API

## Next Steps for Development

### Phase 1: MLS Integration (Weeks 3-4)
- Integrate SimplyRETS API for real MLS data
- Implement property search and filtering
- Add geolocation-based search

### Phase 2: Enhanced Features (Weeks 5-6)
- Implement ML-based matching algorithm
- Add virtual tour integration
- Enhance messaging with document sharing
- Add push notifications

### Phase 3: Testing & Polish (Weeks 7-8)
- Comprehensive testing
- Performance optimization
- UI/UX refinements
- Beta testing with real users

### Phase 4: Launch Preparation (Weeks 9-10)
- App Store optimization
- Marketing materials
- Legal compliance review
- Production deployment

## API Integration (Future)

The app is designed to integrate with:
- **SimplyRETS**: MLS data feeds
- **Firebase**: Authentication and real-time messaging
- **Cloudinary**: Image optimization and CDN
- **Matterport**: Virtual tour integration

## Contributing

This is a private project. For any questions or issues, please contact the development team.

## License

Proprietary - All rights reserved

## Support

For support, email: support@thathouse.app