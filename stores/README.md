# OneJob Authentication Setup

This document explains how to set up and use the authentication system in the OneJob React Native application.

## Configuration Required

1. **Supabase Configuration**:
   - Open `stores/supabase.ts`
   - Replace `YOUR_SUPABASE_URL` with your actual Supabase URL
   - Replace `YOUR_SUPABASE_ANON_KEY` with your actual Supabase anonymous key

2. **Google Authentication Configuration**:
   - Open `stores/authStore.ts`
   - Replace `YOUR_GOOGLE_WEB_CLIENT_ID` with your actual Google Web Client ID
   - Make sure your Google project is properly configured in the Google Cloud Console
   - Ensure you've added the SHA-1 certificate fingerprint to your Firebase project for Android

## Set Up Google Sign-In

Follow these steps to properly set up Google Sign-In:

1. **Create a project in the Google Cloud Console:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable the Google Identity API

2. **Configure OAuth Credentials:**
   - Create OAuth client ID credentials
   - For Android: Add your app's package name and SHA-1 signing certificate
   - For iOS: Add your app's bundle identifier
   - For Web: Add your web domain

3. **Add the credentials to your app:**
   - Use the Web Client ID in the `GoogleSignin.configure` method in `stores/authStore.ts`

4. **Configure Supabase for Google authentication:**
   - Go to your Supabase dashboard
   - Navigate to Authentication > Providers > Google
   - Enable the Google provider
   - Add your Google Client ID and Secret
   - Add the redirect URL provided by Supabase to your Google OAuth configuration

## Usage

To use the authentication in your components:

```typescript
import { useAuthStore } from '../stores';

const YourComponent = () => {
  const { 
    user,
    loading,
    error,
    signInWithGoogle,
    signOut
  } = useAuthStore();

  // Check if user is logged in
  if (user) {
    return <Text>Welcome, {user.email}</Text>;
  }

  // Show login button
  return (
    <Button 
      title="Sign In with Google" 
      onPress={signInWithGoogle} 
      disabled={loading}
    />
  );
};
```

You can also import the pre-made `AuthButtons` component:

```typescript
import { AuthButtons } from '../components/AuthButtons';

const YourScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to OneJob</Text>
      <AuthButtons />
    </View>
  );
};
```

## Troubleshooting

1. **Google Sign-In Issues:**
   - Make sure Google Play Services are installed on the device
   - Verify the SHA-1 fingerprint is correct in Firebase console
   - Check that your Client ID is correct

2. **Supabase Connection Issues:**
   - Verify your Supabase URL and anon key
   - Check that the Google provider is properly configured in Supabase

3. **Session Persistence:**
   - The app uses MMKV for session storage
   - If sessions aren't persisting, check the MMKV implementation
