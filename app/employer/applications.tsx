import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { pickAndConvertImage } from '../../utils/imagePicker';

export default function EmployerApplications() {
  const [imageUri, setImageUri] = useState<string | null>(null);

  const handleImagePick = async () => {
    const uri = await pickAndConvertImage();
    if (uri) {
      setImageUri(uri);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Job Applications</Text>
        <Text style={styles.subtitle}>
          Review and manage candidate applications
        </Text>
        
        <TouchableOpacity 
          style={styles.pickButton} 
          onPress={handleImagePick}
        >
          <Text style={styles.buttonText}>Pick Image</Text>
        </TouchableOpacity>

        {imageUri && (
          <View style={styles.imageContainer}>
            <Image source={{ uri: imageUri }} style={styles.image} />
            <Text style={styles.imageText}>Selected Image (WebP)</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 30,
  },
  pickButton: {
    backgroundColor: '#4f46e5',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 20,
    elevation: 2,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  imageContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  image: {
    width: 250,
    height: 250,
    borderRadius: 8,
    marginBottom: 8,
  },
  imageText: {
    fontSize: 14,
    color: '#6b7280',
  },
});
