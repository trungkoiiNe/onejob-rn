import React, { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useAuthStore } from '@/stores';

export default function MainLayout() {
    const { user, session, loading: isLoading, initialize, getSession, fetchUserRole } = useAuthStore();
    const segments = useSegments();
    const router = useRouter();
    const [userRole, setUserRole] = useState<string | null>(null);
    // Check if the user is authenticated
    const isAuthenticated = !!session;    useEffect(() => {
        // Skip if not authenticated
        if (!session || !user) {
            setUserRole(null);
            return;
        }
        // Fetch role only when authenticated
        const fetchRole = async () => {
            try {
                const role = await fetchUserRole();
                setUserRole(role);
            } catch (error) {
                console.error('Error fetching user role:', error);
                setUserRole(null);
            }
        };
        fetchRole();
        
        // Only depend on the essentials to prevent unnecessary re-renders
    }, [user?.id, session, fetchUserRole]);    useEffect(() => {
        // Initialize authentication when component mounts
        initialize();
    }, [initialize]);    useEffect(() => {
        if (isLoading) return;

        const inAuthGroup = segments[0] === 'auth';
        const inRoleGroup = segments[0] === 'admin' || segments[0] === 'employee' || segments[0] === 'employer';

        if (!isAuthenticated) {
            // User is not authenticated, redirect only from role-based routes
            if (inRoleGroup) {
                router.replace('/');
            }
        } else {
            // User is authenticated, handle role-based routing
            if (!inRoleGroup && userRole) {
                // Redirect to appropriate role-based route
                switch (userRole) {
                    case 'admin':
                        router.replace('/admin');
                        break;
                    case 'employee':
                        router.replace('/employee');
                        break;
                    case 'employer':
                        router.replace('/employer');
                        break;
                    default:
                        router.replace('/');
                }
            } else if (inAuthGroup) {
                // User is authenticated but still in auth screens, redirect based on role
                if (userRole) {
                    console.log("User role:", userRole);
                    switch (userRole) {
                        case 'admin':
                            router.replace('/admin');
                            break;
                        case 'employee':
                            router.replace('/employee');
                            break;
                        case 'employer':
                            router.replace('/employer');
                            break;
                        default:
                            router.replace('/');
                    }
                }
            }
        }
    }, [isAuthenticated, userRole, segments, isLoading, router]);

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="auth" />
            <Stack.Screen name="admin" />
            <Stack.Screen name="employee" />
            <Stack.Screen name="employer" />
        </Stack>
    );
}