import React, { useEffect } from "react";
import {
	StyleSheet,
	Image,
	Text,
	View,
	TouchableOpacity,
	ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/stores";
import Colors from "@/constants/Colors";
import { useColorScheme } from "@/components/useColorScheme";

export default function AuthScreen() {
	const colorScheme = useColorScheme();
	const router = useRouter();

	const { user, loading, error, initialized, initialize, signInWithGoogle } =
		useAuthStore();

	useEffect(() => {
		// Initialize auth when component mounts
		initialize();
	}, [initialize]);

	const handleGoogleSignIn = async () => {
		try {
			await signInWithGoogle();
		} catch (error) {
			// console.error('Google sign in failed:', error);
		}
	};

	if (!initialized) {
		return (
			<View style={styles.loadingContainer}>
				<ActivityIndicator size="large" color={Colors[colorScheme].tint} />
				<Text style={[styles.loadingText, { color: Colors[colorScheme].text }]}>
					Initializing...
				</Text>
			</View>
		);
	}

	return (
		<View
			style={[
				styles.container,
				{ backgroundColor: Colors[colorScheme].background },
			]}
		>
			<View style={styles.logoContainer}>
				<Image
					source={require("@/assets/images/icon.png")}
					style={styles.logo}
				/>
				<Text style={[styles.title, { color: Colors[colorScheme].text }]}>
					OneJob
				</Text>
				<Text style={[styles.subtitle, { color: Colors[colorScheme].text }]}>
					Find your perfect job match
				</Text>
			</View>

			<View style={styles.authContainer}>
				<TouchableOpacity
					style={styles.googleButton}
					onPress={handleGoogleSignIn}
					disabled={loading}
				>
					{loading ? (
						<ActivityIndicator size="small" color="#fff" />
					) : (
						<>
							<Image
								source={{
									uri: "https://cdn-icons-png.flaticon.com/512/2991/2991148.png",
								}}
								style={styles.googleIcon}
							/>
							<Text style={styles.googleButtonText}>Login with Google</Text>
						</>
					)}
				</TouchableOpacity>

				{error && <Text style={styles.errorText}>{error}</Text>}
			</View>

			<View style={styles.footer}>
				<Text style={[styles.footerText, { color: Colors[colorScheme].text }]}>
					By continuing, you agree to our Terms of Service and Privacy Policy
				</Text>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 20,
	},
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	loadingText: {
		marginTop: 15,
		fontSize: 16,
	},
	logoContainer: {
		flex: 2,
		justifyContent: "center",
		alignItems: "center",
		marginBottom: 30,
	},
	logo: {
		width: 120,
		height: 120,
		resizeMode: "contain",
		marginBottom: 20,
	},
	title: {
		fontSize: 32,
		fontWeight: "bold",
		marginBottom: 10,
	},
	subtitle: {
		fontSize: 18,
		textAlign: "center",
		opacity: 0.8,
	},
	authContainer: {
		flex: 1,
		width: "100%",
		alignItems: "center",
		justifyContent: "center",
	},
	googleButton: {
		flexDirection: "row",
		backgroundColor: "#4285F4",
		borderRadius: 4,
		width: "100%",
		height: 50,
		alignItems: "center",
		justifyContent: "center",
		paddingHorizontal: 20,
		marginBottom: 15,
	},
	googleIcon: {
		width: 24,
		height: 24,
		marginRight: 10,
	},
	googleButtonText: {
		color: "white",
		fontSize: 16,
		fontWeight: "600",
	},
	errorText: {
		color: "red",
		marginTop: 10,
		textAlign: "center",
	},
	footer: {
		marginTop: 20,
		paddingBottom: 20,
	},
	footerText: {
		textAlign: "center",
		fontSize: 12,
		opacity: 0.7,
	},
});
