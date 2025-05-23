import { create } from 'zustand';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { supabase, storage } from './supabase';
import { Session, User } from '@supabase/supabase-js';

// Initialize Google SignIn
// Note: Replace with your actual Google Web Client ID
GoogleSignin.configure({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_WEB_CLIENT_ID',
    offlineAccess: true,
});

interface AuthState {
    user: User | null;
    session: Session | null;
    loading: boolean;
    error: string | null;
    initialized: boolean;

    // Auth methods
    initialize: () => Promise<void>;
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
    logout: () => Promise<void>; // Alias for signOut to maintain compatibility
    getSession: () => Promise<Session | null>;
    fetchUserRole: () => Promise<string | null>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    session: null,
    loading: false,
    error: null,
    initialized: false,

    initialize: async () => {
        try {
            set({ loading: true, error: null });

            // Check if we have an existing session
            const { data, error } = await supabase.auth.getSession();

            if (error) {
                throw error;
            }

            if (data?.session) {
                set({
                    session: data.session,
                    user: data.session.user,
                });
            }

            // Set up auth state listener
            supabase.auth.onAuthStateChange((event, session) => {
                set({
                    session,
                    user: session?.user ?? null
                });
            });

            set({ initialized: true });
        } catch (error) {
            console.error('Auth initialization error:', error);
            set({ error: error instanceof Error ? error.message : 'Unknown error occurred' });
        } finally {
            set({ loading: false });
        }
    },

    signInWithGoogle: async () => {
        try {
            set({ loading: true, error: null });
            // Check if Google Play Services are available
            await GoogleSignin.hasPlayServices();
            // Perform Google Sign-In
            const signInResponse = await GoogleSignin.signIn();

            const idToken = signInResponse.data?.idToken;
            // console.log('idToken:', idToken);
            if (!idToken) {
                throw new Error('Failed to get ID token from Google Sign In');
            }
            // Sign in with Supabase using the Google token
            const { data, error } = await supabase.auth.signInWithIdToken({
                provider: 'google',
                token: idToken,
            });
            // console.log(data.user);
            if (error) {
                // console.log(error);
                throw error;
            }
            set({
                user: data.user,
                session: data.session,
            });
            // Store the user data in supabase database table user_data
            const { error: dbError } = await supabase
                .from('users_data')
                .upsert({
                    id: data.user.id,
                    email: data.user.email,
                    name: data.user.user_metadata.full_name,
                    phone: data.user.user_metadata.phone,
                    picture: data.user.user_metadata.picture,
                    // if email = "trun9ko33@gmail.com" then role = "admin" else if email="trun9ko11@gmail.com" role = "employer" else role = "employee"
                    // Note: This is a simplified example. In a real application, you should handle roles more securely.
                    role: data.user.email === 'trun9ko33@gmail.com'
                        ? 'admin'
                        : data.user.email === 'trun9ko11@gmail.com'
                            ? 'employer'
                            : 'employee',
                });
            if (dbError) {
                console.error('Database error:', dbError);
                throw dbError;
            }
            // Do not return data to match the type Promise<void>
        } catch (error) {
            console.error('Google sign in error:', error);
            if (error.code === statusCodes.SIGN_IN_CANCELLED) {
                set({ error: 'Sign in was cancelled' });
            } else if (error.code === statusCodes.IN_PROGRESS) {
                set({ error: 'Sign in is already in progress' });
            } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
                set({ error: 'Google Play Services are not available' });
            } else {
                set({ error: error instanceof Error ? error.message : 'Unknown error occurred' });
            }
            throw error;
        } finally {
            set({ loading: false });
        }
    }, signOut: async () => {
        try {
            set({ loading: true, error: null });
            // Sign out from Google
            await GoogleSignin.signOut();
            // Sign out from Supabase
            const { error } = await supabase.auth.signOut();
            if (error) {
                throw error;
            }
            // Clear user data
            set({
                user: null,
                session: null,
            });
        } catch (error) {
            console.error('Sign out error:', error);
            set({ error: error instanceof Error ? error.message : 'Unknown error occurred' });
            throw error;
        } finally {
            set({ loading: false });
        }
    },

    // Alias for signOut method for better naming compatibility with other code
    logout: async () => {
        return get().signOut();
    },
    getSession: async () => {
        try {
            const { data, error } = await supabase.auth.getSession();
            if (error) {
                throw error;
            }
            set({
                session: data.session,
                user: data.session?.user ?? null,
            });
            return data.session;
        } catch (error) {
            console.error('Get session error:', error);
            set({ error: error instanceof Error ? error.message : 'Unknown error occurred' });
            return null;
        }
    },
    fetchUserRole: async () => {
        try {
            const { data, error } = await supabase
                .from('users_data')
                .select('role')
                .eq('id', get().user?.id)
                .single();

            if (error) {
                throw error;
            }
            return data.role;
        } catch (error) {
            console.error('Fetch user role error:', error);
            set({ error: error instanceof Error ? error.message : 'Unknown error occurred' });
            return null;
        }
    }
}));
