# That House App - Testing Checklist

## 1. Authentication Flow
- [ ] **Login Screen**
  - [ ] Can enter email and password
  - [ ] Login button works (accepts any credentials for MVP)
  - [ ] "Don't have an account?" link is visible
  - [ ] No serialization errors in console

## 2. Onboarding (First Time Users)
- [ ] **Onboarding Screens**
  - [ ] Shows 3 swipeable intro screens
  - [ ] Can swipe between screens
  - [ ] Pagination dots update correctly
  - [ ] "Skip" button visible on first 2 screens
  - [ ] "Let's Go!" button on last screen
  - [ ] Successfully navigates to main app

## 3. Main Swipe Screen
- [ ] **Property Cards**
  - [ ] Cards display with property images
  - [ ] Price shows correctly (formatted as currency)
  - [ ] Address and city/state visible
  - [ ] Bedrooms, bathrooms, square feet display with icons
  - [ ] Days on market badge shows
  - [ ] Property type badge displays

- [ ] **Swipe Gestures**
  - [ ] Can swipe RIGHT (like) - green overlay appears
  - [ ] Can swipe LEFT (reject) - red overlay appears
  - [ ] Can swipe UP (super like) - blue overlay appears
  - [ ] Swipe animations are smooth (60fps)
  - [ ] Cards stack properly (3 visible at once)

- [ ] **Action Buttons**
  - [ ] ❌ Reject button triggers left swipe
  - [ ] ⭐ Super like button triggers up swipe
  - [ ] ❤️ Like button triggers right swipe
  - [ ] All buttons show correct icons (not question marks)

- [ ] **Card Interaction**
  - [ ] Tapping a card opens property details
  - [ ] New cards load as you swipe (infinite scroll)
  - [ ] Loading spinner shows when fetching new properties

## 4. Property Details Modal
- [ ] **Navigation**
  - [ ] Opens when tapping a property card
  - [ ] Has back button/gesture to return
  - [ ] Shows "Property Details" header

- [ ] **Content Display**
  - [ ] Image gallery (swipeable if multiple images)
  - [ ] Price prominently displayed
  - [ ] Full address with zip code
  - [ ] All property stats (beds, baths, sqft, year built)
  - [ ] Description text
  - [ ] Features list with checkmarks
  - [ ] Property details (MLS#, days on market, lot size)

- [ ] **Action Buttons**
  - [ ] "Contact Agent" button visible
  - [ ] "Schedule Tour" button visible
  - [ ] Heart/favorite button in header

## 5. Saved Properties Tab
- [ ] **Empty State**
  - [ ] Shows "No saved properties yet" message
  - [ ] Heart outline icon displays
  - [ ] Helpful text about liking properties

- [ ] **With Saved Properties**
  - [ ] Shows count of saved properties
  - [ ] Lists all properties you swiped right on
  - [ ] Each item shows image, price, address, basic stats
  - [ ] Tapping opens property details
  - [ ] Heart icon filled (not outline)

## 6. Messages Tab
- [ ] **Empty State**
  - [ ] Shows "No messages yet" message
  - [ ] Chat bubble icon displays
  - [ ] Explanation text visible

- [ ] **With Conversations** (if implemented)
  - [ ] Shows list of conversations
  - [ ] Agent name and last message preview
  - [ ] Timestamp formatting (Today, Yesterday, etc.)
  - [ ] Unread badge if applicable
  - [ ] Tapping opens conversation

## 7. Conversation Screen
- [ ] **Message Display**
  - [ ] Messages align correctly (own vs other)
  - [ ] Timestamps show
  - [ ] Input field at bottom
  - [ ] Send button active when text entered
  - [ ] Can send messages

## 8. Profile Tab
- [ ] **User Info**
  - [ ] Shows user initials in avatar
  - [ ] Displays name and email
  - [ ] All sections visible

- [ ] **Settings Toggles**
  - [ ] Dark mode switch (currently light only)
  - [ ] Message notifications toggle
  - [ ] Match notifications toggle
  - [ ] Toggles save state

- [ ] **Menu Items**
  - [ ] All menu items display with icons
  - [ ] Chevron arrows on right
  - [ ] Tappable (even if not functional yet)

- [ ] **Logout**
  - [ ] Logout button at bottom
  - [ ] Returns to login screen when tapped

## 9. Navigation
- [ ] **Bottom Tab Bar**
  - [ ] All 4 tabs visible with icons
  - [ ] Active tab highlighted in red
  - [ ] Tab switching is smooth
  - [ ] Correct screens load for each tab

## 10. Performance & Technical
- [ ] **General Performance**
  - [ ] App launches without crashes
  - [ ] No console errors (check Xcode console)
  - [ ] Swipe gestures respond immediately
  - [ ] Images load without delays
  - [ ] No memory warnings

- [ ] **State Management**
  - [ ] Liked properties persist in Saved tab
  - [ ] User stays logged in
  - [ ] Properties don't repeat after swiping
  - [ ] No Redux serialization errors

## Known Issues / Not Implemented
- [ ] Sign up flow (using mock auth)
- [ ] Real MLS data (using mock properties)
- [ ] Actual messaging with agents
- [ ] Search/filter functionality
- [ ] Real geolocation
- [ ] Push notifications
- [ ] Dark mode theme switching
- [ ] Property sharing
- [ ] Virtual tours

## How to Test

1. **Force Quit** the app first (swipe up and remove)
2. **Open** That House app fresh
3. **Login** with any email/password
4. **Complete** onboarding if shown
5. **Test** each section systematically
6. **Note** any crashes, errors, or unexpected behavior

## Useful Testing Tips

- **Check Console**: In Xcode, watch for red error messages
- **Test Orientations**: Rotate device (if rotation enabled)
- **Test Interruptions**: Receive a call, switch apps, etc.
- **Memory Testing**: Swipe through 50+ properties
- **Network Testing**: Turn on Airplane mode (should handle gracefully)

## Report Issues

For each issue found, note:
1. What you were doing
2. What you expected to happen
3. What actually happened
4. Any error messages
5. Steps to reproduce