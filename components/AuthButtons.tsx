import React, { useEffect } from 'react';
import { View, Button, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuthStore } from '@/stores';

export const AuthButtons = () => {
  const { 
    user, 
    loading, 
    error, 
    initialized,
    initialize, 
    signInWithGoogle, 
    signOut 
  } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (!initialized) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Initializing authentication...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : user ? (
        <View>
          <Text style={styles.welcomeText}>Welcome, {user.email}</Text>
          <Button title="Sign Out" onPress={signOut} />
        </View>
      ) : (
        <View>
          <Button 
            title="Sign In with Google" 
            onPress={signInWithGoogle} 
          />
          {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomeText: {
    fontSize: 16,
    marginBottom: 20,
  },
  errorText: {
    color: 'red',
    marginTop: 10,
  },
});
