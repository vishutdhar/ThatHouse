# Supabase Setup Guide

## Creating Your First Test User

1. **Go to your Supabase Dashboard**
   - Visit: https://app.supabase.com
   - Select your project (dtazuyrkfcuwteducwaw)

2. **Create a Test User**
   - Navigate to: Authentication > Users
   - Click "Add user" button
   - Enter:
     - Email: test@example.com (or any email you prefer)
     - Password: Choose a secure password
   - Click "Create user"

3. **Verify User Creation**
   - In the SQL Editor, run:
     ```sql
     SELECT * FROM auth.users;
     SELECT * FROM public.users;
     ```
   - You should see your new user in both tables

4. **Login to the App**
   - Start the app: `npm run ios` or `npm run android`
   - Use the email and password you just created
   - The app will now use real Supabase data!

## Troubleshooting

### User profile not created automatically
If the user exists in auth.users but not in public.users, run this SQL:
```sql
INSERT INTO public.users (id, email, first_name, last_name, user_type)
SELECT 
  id,
  email,
  'Test',
  'User',
  'BUYER'
FROM auth.users
WHERE email = 'test@example.com';
```

### Can't save/reject properties
Make sure you're logged in - the app needs authentication to save properties.

## Database Structure
- **properties**: 8 Nashville properties with images
- **users**: User profiles linked to Supabase Auth
- **saved_properties**: Tracks which properties users have saved
- **rejected_properties**: Tracks which properties users have rejected

## Next Steps
- The app now uses Supabase for:
  - Authentication
  - Property data
  - Saving/rejecting properties
  - User profiles
- All mock API functionality has been replaced with Supabase