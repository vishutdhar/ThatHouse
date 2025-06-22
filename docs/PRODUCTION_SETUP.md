# Production Environment Setup Guide

## ✅ Completed Setup

### 1. Environment Variables
- ✅ Installed `react-native-config`
- ✅ Created `.env` and `.env.production` files
- ✅ Updated `src/config/env.ts` to use environment variables
- ✅ Added env files to `.gitignore`

### 2. API Rate Limiting
- ✅ Created Supabase Edge Function for rate limiting
- ✅ Limits: 100 requests per minute per user
- ✅ Returns proper rate limit headers

### 3. Error Tracking (Sentry)
- ✅ Installed `@sentry/react-native`
- ✅ Created Sentry configuration
- ✅ Added error boundary to App.tsx
- ✅ Custom error capture functions

## 📋 TODO Before Production

### 1. Complete Sentry Setup
1. Create account at https://sentry.io
2. Create a new React Native project
3. Get your DSN
4. Update `src/config/sentry.ts` with your DSN
5. Run setup wizard:
   ```bash
   npx @sentry/wizard@latest -s -i reactNative
   ```

### 2. Configure Native Projects

#### iOS:
```bash
cd ios && pod install
```

Add to `ios/ThatHouse/Info.plist`:
```xml
<key>SENTRY_DSN</key>
<string>$(SENTRY_DSN)</string>
```

#### Android:
Add to `android/app/build.gradle`:
```gradle
apply from: project(':react-native-config').projectDir.getPath() + "/dotenv.gradle"
```

### 3. Deploy Rate Limiter
```bash
supabase functions deploy rate-limiter
```

### 4. Environment Variables for CI/CD
Set these in your CI/CD pipeline:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SENTRY_DSN`
- `SENTRY_AUTH_TOKEN` (for source maps)

## 🔒 Security Checklist

- [ ] Remove hardcoded fallback values from `env.ts`
- [ ] Set up different Supabase projects for dev/staging/prod
- [ ] Enable Sentry only in production
- [ ] Review all API endpoints for authentication
- [ ] Enable SSL pinning for API calls
- [ ] Implement certificate pinning (optional)

## 🚀 Build Commands

### Development
```bash
npm start
```

### Production iOS
```bash
ENVFILE=.env.production npx react-native run-ios --configuration Release
```

### Production Android
```bash
cd android
ENVFILE=.env.production ./gradlew assembleRelease
```

## 📊 Monitoring

1. **Sentry Dashboard**: Monitor errors and performance
2. **Supabase Dashboard**: Monitor API usage and database
3. **Rate Limiting**: Check Edge Function logs

## 🔄 Deployment Process

1. Update version in `package.json`, `ios/ThatHouse/Info.plist`, and `android/app/build.gradle`
2. Run tests
3. Build production bundles
4. Submit to App Store / Play Store
5. Monitor Sentry for any production issues