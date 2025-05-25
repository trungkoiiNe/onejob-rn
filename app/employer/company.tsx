import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	TouchableOpacity,
	TextInput,
	Modal,
	ActivityIndicator,
	FlatList,
	Alert,
	Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useAuthStore, useJobStore } from "@/stores";
import type { CompanyDetails } from "@/stores/jobStore";
import { pickAndConvertImage } from "@/utils/imagePicker";

export default function EmployerCompany() {
	const { user } = useAuthStore();
	const {
		companies,
		isLoading,
		error,
		fetchCompanies,
		addCompany,
		addCompanyViaRPC,
		updateCompany,
		deleteCompany,
	} = useJobStore();

	const [modalVisible, setModalVisible] = useState(false);
	const [refreshing, setRefreshing] = useState(false);
	const [useRPC, setUseRPC] = useState(false); // Whether to use RPC for company creation
	// Form state
	const [companyName, setCompanyName] = useState("test");
	const [companyIndustry, setCompanyIndustry] = useState("test");
	const [companyLocation, setCompanyLocation] = useState("test");
	const [companyDescription, setCompanyDescription] = useState("test");
	const [companyEmail, setCompanyEmail] = useState("test@test.test");
	const [companyPhone, setCompanyPhone] = useState("");
	const [companyWebsite, setCompanyWebsite] = useState("");
	const [companyLogoUrl, setCompanyLogoUrl] = useState("");
	const [companyCoverUrl, setCompanyCoverUrl] = useState("");

	// Add state for selected images
	const [logoImage, setLogoImage] = useState<string | null>(null);
	const [coverImage, setCoverImage] = useState<string | null>(null);

	useEffect(() => {
		if (user?.id) {
			fetchCompanies(user.id);
		}
	}, [user?.id, fetchCompanies]);

	const handleRefresh = async () => {
		if (user?.id) {
			setRefreshing(true);
			await fetchCompanies(user.id);
			setRefreshing(false);
		}
	};

	const handleSelectLogoImage = async () => {
		try {
			const imageUri = await pickAndConvertImage("logo");
			if (imageUri) {
				setLogoImage(imageUri);
			}
		} catch (error) {
			console.error("Error selecting logo image:", error);
			Alert.alert("Error", "Failed to select logo image");
		}
	};

	const handleSelectCoverImage = async () => {
		try {
			const imageUri = await pickAndConvertImage("cover");
			if (imageUri) {
				setCoverImage(imageUri);
			}
		} catch (error) {
			console.error("Error selecting cover image:", error);
			Alert.alert("Error", "Failed to select cover image");
		}
	};

	const resetForm = () => {
		setCompanyName("");
		setCompanyIndustry("");
		setCompanyLocation("");
		setCompanyDescription("");
		setCompanyEmail("");
		setCompanyPhone("");
		setCompanyWebsite("");
		setCompanyLogoUrl("");
		setCompanyCoverUrl("");
		setLogoImage(null);
		setCoverImage(null);
	};
	const handleAddCompany = async () => {
		if (!user?.id) {
			Alert.alert("Error", "You need to be logged in to add a company.");
			return;
		}

		if (!companyName || !companyIndustry || !companyLocation || !companyEmail) {
			Alert.alert("Validation Error", "Please fill in all required fields.");
			return;
		}

		try {
			// First create the company to get an ID
			const newCompany: CompanyDetails = {
				name: companyName,
				industry: companyIndustry,
				location: companyLocation,
				description: companyDescription,
				contact_email: companyEmail,
				contact_phone: companyPhone,
				website: companyWebsite,
				logo_url: companyLogoUrl, // We'll update these after upload
				cover_image_url: companyCoverUrl,
				created_by_user_id: user.id,
			};

			let companyId: string | null;

			if (useRPC) {
				companyId = await addCompanyViaRPC(newCompany);
			} else {
				companyId = await addCompany(newCompany);
			}

			if (companyId) {
				// Upload images if selected
				const updates: Partial<CompanyDetails> = {};

				// Upload logo image if selected
				if (logoImage) {
					const logoPath = `${companyId}/logo.webp`;
					const logoUrl = await useJobStore
						.getState()
						.uploadImageToStorage(logoImage, logoPath);
					if (logoUrl) {
						updates.logo_url = logoUrl;
					}
				}

				// Upload cover image if selected
				if (coverImage) {
					const coverPath = `${companyId}/cover.webp`;
					const coverUrl = await useJobStore
						.getState()
						.uploadImageToStorage(coverImage, coverPath);
					if (coverUrl) {
						updates.cover_image_url = coverUrl;
					}
				}

				// Update company with image URLs if we uploaded any images
				if (Object.keys(updates).length > 0) {
					await updateCompany(companyId, updates);
				}

				resetForm();
				setModalVisible(false);
				Alert.alert("Success", "Company profile created successfully!");
			} else {
				Alert.alert(
					"Error",
					"Failed to create company profile. Please try again.",
				);
			}
		} catch (error) {
			Alert.alert(
				"Error",
				(error as Error)?.message || "An unknown error occurred",
			);
		}
	};

	const handleDeleteCompany = (id: string) => {
		Alert.alert(
			"Confirm Delete",
			"Are you sure you want to delete this company? This action cannot be undone.",
			[
				{ text: "Cancel", style: "cancel" },
				{
					text: "Delete",
					style: "destructive",
					onPress: async () => {
						const success = await deleteCompany(id);
						if (success) {
							Alert.alert("Success", "Company deleted successfully!");
						} else {
							Alert.alert(
								"Error",
								"Failed to delete company. Please try again.",
							);
						}
					},
				},
			],
		);
	};

	const renderCompanyItem = ({ item }: { item: CompanyDetails }) => (
		<View style={styles.companyCard}>
			<View style={styles.companyCardHeader}>
				<Text style={styles.companyTitle}>{item.name}</Text>
				<TouchableOpacity
					onPress={() => {
						if (item.id) {
							handleDeleteCompany(item.id);
						} else {
							Alert.alert("Error", "Company ID is missing.");
						}
					}}
					style={styles.deleteButton}
				>
					<Feather name="trash-2" size={16} color="#ef4444" />
				</TouchableOpacity>
			</View>
			{item.logo_url && (
				<Image
					source={{ uri: item.logo_url }}
					style={styles.companyLogo}
					resizeMode="contain"
				/>
			)}
			{!item.logo_url && (
				<View style={styles.companyLogo}>
					<Text style={{ textAlign: "center", color: "#9ca3af" }}>No Logo</Text>
				</View>
			)}
			<Text style={styles.companyLocation}>
				<Feather name="map-pin" size={14} color="#6b7280" /> {item.location}
			</Text>

			<Text style={styles.companyIndustry}>
				<Feather name="briefcase" size={14} color="#6b7280" /> {item.industry}
			</Text>

			<Text numberOfLines={3} style={styles.companyDescription}>
				{item.description}
			</Text>

			<View style={styles.companyContactInfo}>
				<Text style={styles.contactItem}>
					<Feather name="mail" size={14} color="#6b7280" /> {item.contact_email}
				</Text>
				{item.contact_phone && (
					<Text style={styles.contactItem}>
						<Feather name="phone" size={14} color="#6b7280" />{" "}
						{item.contact_phone}
					</Text>
				)}
				{item.website && (
					<Text style={styles.contactItem}>
						<Feather name="globe" size={14} color="#6b7280" /> {item.website}
					</Text>
				)}
			</View>
		</View>
	);

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.header}>
				<Text style={styles.headerTitle}>Company Profiles</Text>
				<TouchableOpacity
					style={styles.addButton}
					onPress={() => setModalVisible(true)}
				>
					<Feather name="plus" size={20} color="#ffffff" />
					<Text style={styles.addButtonText}>Add Company</Text>
				</TouchableOpacity>
			</View>

			{isLoading && !refreshing ? (
				<View style={styles.loadingContainer}>
					<ActivityIndicator size="large" color="#10b981" />
				</View>
			) : error ? (
				<View style={styles.errorContainer}>
					<Feather name="alert-circle" size={24} color="#ef4444" />
					<Text style={styles.errorText}>{error}</Text>
				</View>
			) : (
				<FlatList
					data={companies}
					keyExtractor={(item) => item.id || Math.random().toString()}
					renderItem={renderCompanyItem}
					contentContainerStyle={styles.listContainer}
					onRefresh={handleRefresh}
					refreshing={refreshing}
					ListEmptyComponent={
						<View style={styles.emptyContainer}>
							<Feather name="briefcase" size={64} color="#d1d5db" />
							<Text style={styles.emptyText}>No company profiles yet</Text>
							<Text style={styles.emptySubText}>
								Add your first company profile to get started
							</Text>
						</View>
					}
				/>
			)}

			<Modal
				animationType="slide"
				transparent={true}
				visible={modalVisible}
				onRequestClose={() => setModalVisible(false)}
			>
				<View style={styles.modalContainer}>
					<View style={styles.modalContent}>
						<View style={styles.modalHeader}>
							<Text style={styles.modalTitle}>Add Company Profile</Text>
							<TouchableOpacity
								style={styles.closeButton}
								onPress={() => {
									resetForm();
									setModalVisible(false);
								}}
							>
								<Feather name="x" size={24} color="#9ca3af" />
							</TouchableOpacity>
						</View>
						<ScrollView style={styles.formContainer}>
							<Text style={styles.inputLabel}>Company Name *</Text>
							<TextInput
								style={styles.input}
								value={companyName}
								onChangeText={setCompanyName}
								placeholder="Enter company name"
								placeholderTextColor="#9ca3af"
							/>
							<Text style={styles.inputLabel}>Industry *</Text>
							<TextInput
								style={styles.input}
								value={companyIndustry}
								onChangeText={setCompanyIndustry}
								placeholder="e.g. Technology, Healthcare, Education"
								placeholderTextColor="#9ca3af"
							/>

							<Text style={styles.inputLabel}>Location *</Text>
							<TextInput
								style={styles.input}
								value={companyLocation}
								onChangeText={setCompanyLocation}
								placeholder="City, Country"
								placeholderTextColor="#9ca3af"
							/>

							<Text style={styles.inputLabel}>Description</Text>
							<TextInput
								style={[styles.input, styles.textArea]}
								value={companyDescription}
								onChangeText={setCompanyDescription}
								placeholder="Describe your company..."
								placeholderTextColor="#9ca3af"
								multiline
								numberOfLines={6}
								textAlignVertical="top"
							/>

							<Text style={styles.inputLabel}>Contact Email *</Text>
							<TextInput
								style={styles.input}
								value={companyEmail}
								onChangeText={setCompanyEmail}
								placeholder="contact@company.com"
								placeholderTextColor="#9ca3af"
								keyboardType="email-address"
							/>

							<Text style={styles.inputLabel}>Contact Phone</Text>
							<TextInput
								style={styles.input}
								value={companyPhone}
								onChangeText={setCompanyPhone}
								placeholder="+1 234 567 8900"
								placeholderTextColor="#9ca3af"
								keyboardType="phone-pad"
							/>
							<Text style={styles.inputLabel}>Website</Text>
							<TextInput
								style={styles.input}
								value={companyWebsite}
								onChangeText={setCompanyWebsite}
								placeholder="https://company.com"
								placeholderTextColor="#9ca3af"
								keyboardType="url"
							/>

							<Text style={styles.inputLabel}>Company Logo</Text>
							<View style={styles.imagePickerContainer}>
								{logoImage ? (
									<View style={styles.selectedImageContainer}>
										<Image
											source={{ uri: logoImage }}
											style={styles.selectedImage}
											resizeMode="cover"
										/>
										<TouchableOpacity
											style={styles.removeImageButton}
											onPress={() => setLogoImage(null)}
										>
											<Feather name="x-circle" size={24} color="#ef4444" />
										</TouchableOpacity>
									</View>
								) : (
									<TouchableOpacity
										style={styles.imagePickerButton}
										onPress={handleSelectLogoImage}
									>
										<Feather name="image" size={24} color="#6b7280" />
										<Text style={styles.imagePickerText}>
											Select Logo Image
										</Text>
									</TouchableOpacity>
								)}
							</View>

							<Text style={styles.inputLabel}>Cover Image</Text>
							<View style={styles.imagePickerContainer}>
								{coverImage ? (
									<View style={styles.selectedImageContainer}>
										<Image
											source={{ uri: coverImage }}
											style={styles.selectedImage}
											resizeMode="cover"
										/>
										<TouchableOpacity
											style={styles.removeImageButton}
											onPress={() => setCoverImage(null)}
										>
											<Feather name="x-circle" size={24} color="#ef4444" />
										</TouchableOpacity>
									</View>
								) : (
									<TouchableOpacity
										style={styles.imagePickerButton}
										onPress={handleSelectCoverImage}
									>
										<Feather name="image" size={24} color="#6b7280" />
										<Text style={styles.imagePickerText}>
											Select Cover Image
										</Text>
									</TouchableOpacity>
								)}
							</View>
							<Text style={styles.inputLabel}>Company Logo URL (Optional)</Text>
							<TextInput
								style={styles.input}
								value={companyLogoUrl}
								onChangeText={setCompanyLogoUrl}
								placeholder="https://example.com/logo.png"
								placeholderTextColor="#9ca3af"
							/>
							<Text style={styles.inputHelp}>
								Direct image selection is preferred over URL
							</Text>

							<Text style={styles.inputLabel}>Cover Image URL (Optional)</Text>
							<TextInput
								style={styles.input}
								value={companyCoverUrl}
								onChangeText={setCompanyCoverUrl}
								placeholder="https://example.com/cover.png"
								placeholderTextColor="#9ca3af"
							/>
							<Text style={styles.inputHelp}>
								Direct image selection is preferred over URL
							</Text>

							<View style={styles.toggleContainer}>
								<Text style={styles.inputLabel}>Use RPC for creation</Text>
								<TouchableOpacity
									style={[
										styles.toggle,
										useRPC ? styles.toggleActive : styles.toggleInactive,
									]}
									onPress={() => setUseRPC(!useRPC)}
								>
									<View
										style={[
											styles.toggleHandle,
											useRPC
												? styles.toggleHandleActive
												: styles.toggleHandleInactive,
										]}
									/>
								</TouchableOpacity>
								<Text style={styles.toggleText}>
									{useRPC
										? "Using RPC function to create company"
										: "Using direct database insert to create company"}
								</Text>
							</View>
							<TouchableOpacity
								style={styles.submitButton}
								onPress={handleAddCompany}
							>
								<Feather name="check" size={20} color="#ffffff" />
								<Text style={styles.submitButtonText}>
									Create Company Profile
								</Text>
							</TouchableOpacity>
						</ScrollView>
					</View>
				</View>
			</Modal>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#f9fafb",
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingHorizontal: 20,
		paddingVertical: 16,
		backgroundColor: "#ffffff",
		borderBottomWidth: 1,
		borderBottomColor: "#e5e7eb",
	},
	headerTitle: {
		fontSize: 20,
		fontWeight: "600",
		color: "#111827",
	},
	addButton: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#10b981",
		paddingHorizontal: 16,
		paddingVertical: 8,
		borderRadius: 8,
	},
	addButtonText: {
		color: "#ffffff",
		fontWeight: "600",
		marginLeft: 6,
	},
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	errorContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 20,
	},
	errorText: {
		color: "#ef4444",
		marginTop: 8,
		textAlign: "center",
	},
	listContainer: {
		padding: 16,
	},
	emptyContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 40,
		minHeight: 300,
	},
	emptyText: {
		fontSize: 18,
		fontWeight: "600",
		color: "#6b7280",
		marginTop: 16,
	},
	emptySubText: {
		fontSize: 14,
		color: "#9ca3af",
		textAlign: "center",
		marginTop: 8,
	},
	companyCard: {
		backgroundColor: "#ffffff",
		borderRadius: 12,
		padding: 16,
		marginBottom: 16,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
	},
	companyCardHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-start",
		marginBottom: 12,
	},
	companyTitle: {
		fontSize: 18,
		fontWeight: "600",
		color: "#111827",
		flex: 1,
	},
	deleteButton: {
		padding: 4,
	},
	companyLogo: {
		width: "100%",
		height: 120,
		marginBottom: 12,
		borderRadius: 8,
		backgroundColor: "#f3f4f6",
	},
	companyLocation: {
		fontSize: 14,
		color: "#6b7280",
		marginBottom: 4,
	},
	companyIndustry: {
		fontSize: 14,
		color: "#6b7280",
		marginBottom: 8,
	},
	companyDescription: {
		fontSize: 14,
		color: "#4b5563",
		marginBottom: 12,
	},
	companyContactInfo: {
		borderTopWidth: 1,
		borderTopColor: "#e5e7eb",
		paddingTop: 12,
	},
	contactItem: {
		fontSize: 14,
		color: "#6b7280",
		marginBottom: 4,
	},
	modalContainer: {
		flex: 1,
		justifyContent: "flex-end",
		backgroundColor: "rgba(0, 0, 0, 0.5)",
	},
	modalContent: {
		backgroundColor: "#ffffff",
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
		height: "90%",
	},
	modalHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		padding: 20,
		borderBottomWidth: 1,
		borderBottomColor: "#e5e7eb",
	},
	modalTitle: {
		fontSize: 20,
		fontWeight: "600",
		color: "#111827",
	},
	closeButton: {
		padding: 4,
	},
	formContainer: {
		padding: 20,
	},
	inputLabel: {
		fontSize: 14,
		fontWeight: "500",
		color: "#4b5563",
		marginBottom: 8,
	},
	input: {
		backgroundColor: "#f9fafb",
		borderWidth: 1,
		borderColor: "#e5e7eb",
		borderRadius: 8,
		padding: 12,
		fontSize: 16,
		marginBottom: 16,
		color: "#111827",
	},
	textArea: {
		minHeight: 100,
		textAlignVertical: "top",
	},
	submitButton: {
		backgroundColor: "#10b981",
		flexDirection: "row",
		justifyContent: "center",
		alignItems: "center",
		paddingVertical: 14,
		borderRadius: 8,
		marginBottom: 40,
	},
	submitButtonText: {
		color: "#ffffff",
		fontSize: 16,
		fontWeight: "600",
		marginLeft: 8,
	},
	toggleContainer: {
		marginBottom: 20,
	},
	toggle: {
		width: 50,
		height: 26,
		borderRadius: 13,
		padding: 3,
		marginVertical: 8,
	},
	toggleActive: {
		backgroundColor: "#10b981",
	},
	toggleInactive: {
		backgroundColor: "#d1d5db",
	},
	toggleHandle: {
		width: 20,
		height: 20,
		borderRadius: 10,
	},
	toggleHandleActive: {
		backgroundColor: "#ffffff",
		transform: [{ translateX: 24 }],
	},
	toggleHandleInactive: {
		backgroundColor: "#ffffff",
		transform: [{ translateX: 0 }],
	},
	toggleText: {
		fontSize: 12,
		color: "#6b7280",
	}, // Image picker styles
	imagePickerContainer: {
		marginBottom: 16,
	},
	imagePickerButton: {
		backgroundColor: "#f9fafb",
		borderWidth: 1,
		borderColor: "#e5e7eb",
		borderRadius: 8,
		padding: 16,
		flexDirection: "row",
		justifyContent: "center",
		alignItems: "center",
	},
	imagePickerText: {
		marginLeft: 8,
		color: "#6b7280",
		fontSize: 16,
	},
	selectedImageContainer: {
		position: "relative",
		marginBottom: 8,
	},
	selectedImage: {
		width: "100%",
		height: 200,
		borderRadius: 8,
	},
	removeImageButton: {
		position: "absolute",
		top: 8,
		right: 8,
		backgroundColor: "rgba(255, 255, 255, 0.8)",
		borderRadius: 20,
		padding: 4,
	},
	inputHelp: {
		fontSize: 12,
		color: "#6b7280",
		marginTop: -12,
		marginBottom: 16,
		fontStyle: "italic",
	},
});
