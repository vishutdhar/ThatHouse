# Environment Variables Setup

## iOS Configuration

1. **Run pod install**:
```bash
cd ios && pod install
```

2. **Add to iOS build settings**:
- Open `ios/ThatHouse.xcworkspace` in Xcode
- Select your project in the navigator
- Go to Build Settings
- Add a new User-Defined setting: `ENVFILE` = `.env`

## Android Configuration

1. **Update android/app/build.gradle**:
Add this to the top:
```gradle
apply from: project(':react-native-config').projectDir.getPath() + "/dotenv.gradle"
```

## Usage

1. **Development**:
```bash
npm start
```

2. **Production Build**:
```bash
# iOS
ENVFILE=.env.production react-native run-ios --configuration Release

# Android
cd android && ENVFILE=.env.production ./gradlew assembleRelease
```

## Security Notes

- Never commit `.env` files with real credentials
- Use `.env.example` as a template
- Store production secrets in CI/CD environment variables
- The anon key is safe to expose (it's public)
- Never expose service keys or JWT secrets