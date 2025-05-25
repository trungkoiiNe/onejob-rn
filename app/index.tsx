import React, { useRef, useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	Dimensions,
	type FlatList,
	Image,
	type ListRenderItemInfo,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import * as Animatable from "react-native-animatable";
import Animated, {
	useSharedValue,
	useAnimatedScrollHandler,
	useAnimatedStyle,
	interpolate,
} from "react-native-reanimated";

// Get screen dimensions
const { width } = Dimensions.get("window");

type OnboardingItem = {
	id: string;
	title: string;
	description: string;
	image: import("react-native").ImageSourcePropType;
	bgColor: [string, string];
};
// Onboarding data
const onboardingData: OnboardingItem[] = [
	{
		id: "1",
		title: "Find Your Dream Job",
		description:
			"Discover thousands of job opportunities tailored to your skills and preferences.",
		image: require("@/assets/images/icon.png"),
		bgColor: ["#4f46e5", "#7c3aed"],
	},
	{
		id: "2",
		title: "Smart Matching",
		description:
			"Our AI algorithm connects you with the perfect job matches based on your profile.",
		image: require("@/assets/images/icon.png"),
		bgColor: ["#6366f1", "#a855f7"],
	},
	{
		id: "3",
		title: "Easy Application",
		description:
			"Apply to multiple jobs with just one tap and track your applications in real-time.",
		image: require("@/assets/images/icon.png"),
		bgColor: ["#8b5cf6", "#d946ef"],
	},
	{
		id: "4",
		title: "Get Started Now",
		description:
			"Join thousands of professionals who found their dream career with OneJob.",
		image: require("@/assets/images/icon.png"),
		bgColor: ["#a855f7", "#ec4899"],
	},
];

const OnboardingItemComponent = ({
	item,
	index,
	scrollX,
}: {
	item: OnboardingItem;
	index: number;
	scrollX: Animated.SharedValue<number>;
}) => {
	const inputRange = [(index - 1) * width, index * width, (index + 1) * width];

	const animatedImageStyle = useAnimatedStyle(() => {
		const scale = interpolate(scrollX.value, inputRange, [0.8, 1, 0.8]);

		const opacity = interpolate(scrollX.value, inputRange, [0.4, 1, 0.4]);

		return {
			transform: [{ scale }],
			opacity,
		};
	});

	const animatedTextStyle = useAnimatedStyle(() => {
		const translateY = interpolate(scrollX.value, inputRange, [20, 0, 20]);

		const opacity = interpolate(scrollX.value, inputRange, [0, 1, 0]);

		return {
			transform: [{ translateY }],
			opacity,
		};
	});

	return (
		<View style={[styles.slide, { width }]}>
			<LinearGradient colors={item.bgColor} style={styles.gradientBackground}>
				<Animated.View style={[styles.imageContainer, animatedImageStyle]}>
					<Image
						source={item.image}
						style={styles.image}
						resizeMode="contain"
					/>
				</Animated.View>

				<Animated.View style={[styles.textContainer, animatedTextStyle]}>
					<Text style={styles.title}>{item.title}</Text>
					<Text style={styles.description}>{item.description}</Text>
				</Animated.View>
			</LinearGradient>
		</View>
	);
};
export default function OnboardingScreen() {
	const router = useRouter();
	const flatListRef = useRef<FlatList>(null);
	const scrollX = useSharedValue(0);
	const [currentIndex, setCurrentIndex] = useState(0);

	const scrollHandler = useAnimatedScrollHandler((event) => {
		scrollX.value = event.contentOffset.x;
	});

	const navigateToLogin = () => {
		router.push("/auth");
	};

	const handleSkip = () => {
		if (flatListRef.current) {
			flatListRef.current.scrollToIndex({
				index: onboardingData.length - 1,
				animated: true,
			});
		}
	};

	const handleNext = () => {
		if (currentIndex < onboardingData.length - 1) {
			if (flatListRef.current) {
				flatListRef.current.scrollToIndex({
					index: currentIndex + 1,
					animated: true,
				});
			}
		} else {
			navigateToLogin();
		}
	};

	const renderItem = (info: ListRenderItemInfo<OnboardingItem>) => {
		return (
			<OnboardingItemComponent
				item={info.item}
				index={info.index}
				scrollX={scrollX}
			/>
		);
	};

	const Pagination = () => {
		return (
			<View style={styles.paginationContainer}>
				{onboardingData.map((_, index) => {
					const dotStyle = useAnimatedStyle(() => {
						const inputRange = [
							(index - 1) * width,
							index * width,
							(index + 1) * width,
						];

						const dotWidth = interpolate(scrollX.value, inputRange, [8, 20, 8]);

						const opacity = interpolate(
							scrollX.value,
							inputRange,
							[0.5, 1, 0.5],
						);

						return {
							width: dotWidth,
							opacity,
						};
					});

					return (
						<Animated.View
							key={index.toString()}
							style={[styles.dot, dotStyle]}
						/>
					);
				})}
			</View>
		);
	};

	return (
		<SafeAreaView style={styles.container}>
			{/* Skip button */}
			{currentIndex < onboardingData.length - 1 && (
				<TouchableOpacity
					style={styles.skipButton}
					onPress={handleSkip}
					activeOpacity={0.8}
				>
					<Text style={styles.skipButtonText}>Skip</Text>
				</TouchableOpacity>
			)}

			{/* Slides */}
			<Animated.FlatList
				ref={flatListRef}
				data={onboardingData}
				renderItem={renderItem}
				keyExtractor={(item) => item.id}
				horizontal
				pagingEnabled
				showsHorizontalScrollIndicator={false}
				scrollEventThrottle={16}
				onScroll={scrollHandler}
				onMomentumScrollEnd={(event) => {
					const index = Math.round(event.nativeEvent.contentOffset.x / width);
					setCurrentIndex(index);
				}}
			/>

			{/* Bottom controls */}
			<View style={styles.bottomContainer}>
				<Pagination />

				<Animatable.View animation="fadeIn" duration={600} delay={300}>
					<TouchableOpacity
						style={styles.button}
						onPress={handleNext}
						activeOpacity={0.9}
					>
						<LinearGradient
							colors={onboardingData[0].bgColor}
							style={styles.buttonGradient}
						>
							<Text style={styles.buttonText}>
								{currentIndex < onboardingData.length - 1 ? "Next" : "Login"}
							</Text>
						</LinearGradient>
					</TouchableOpacity>
				</Animatable.View>
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#ffffff",
	},
	skipButton: {
		position: "absolute",
		top: 20,
		right: 20,
		zIndex: 10,
		padding: 10,
	},
	skipButtonText: {
		fontSize: 16,
		color: "#ffffff",
		fontWeight: "600",
	},
	slide: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
	},
	gradientBackground: {
		flex: 1,
		width: "100%",
		alignItems: "center",
		justifyContent: "center",
		paddingHorizontal: 20,
	},
	imageContainer: {
		width: width * 0.6,
		height: width * 0.6,
		alignItems: "center",
		justifyContent: "center",
		marginBottom: 40,
	},
	image: {
		width: "80%",
		height: "80%",
	},
	textContainer: {
		alignItems: "center",
		maxWidth: "80%",
	},
	title: {
		fontSize: 28,
		fontWeight: "bold",
		color: "#ffffff",
		textAlign: "center",
		marginBottom: 20,
	},
	description: {
		fontSize: 16,
		color: "#f8fafc",
		textAlign: "center",
		lineHeight: 24,
	},
	bottomContainer: {
		position: "absolute",
		bottom: 50,
		left: 0,
		right: 0,
		alignItems: "center",
	},
	paginationContainer: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		marginBottom: 30,
	},
	dot: {
		height: 8,
		borderRadius: 4,
		backgroundColor: "#ffffff",
		marginHorizontal: 4,
	},
	button: {
		borderRadius: 25,
		overflow: "hidden",
		elevation: 5,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.3,
		shadowRadius: 4,
	},
	buttonGradient: {
		paddingHorizontal: 40,
		paddingVertical: 15,
		borderRadius: 25,
	},
	buttonText: {
		color: "#ffffff",
		fontSize: 18,
		fontWeight: "600",
	},
});
