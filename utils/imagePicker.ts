import * as ImagePicker from "expo-image-picker";
import { SaveFormat, ImageManipulator } from "expo-image-manipulator";
import * as FileSystem from "expo-file-system";
import { Platform } from "react-native";

/**
 * Request permission to access the device's photo library
 * @returns boolean indicating if permission was granted
 */
const requestMediaLibraryPermission = async (): Promise<boolean> => {
	const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
	return status === "granted";
};

/**
 * Pick an image from the device's photo library, convert it to WebP format,
 * and log its size in KB
 * @param purpose Optional parameter to specify the image purpose (e.g., 'logo' or 'cover')
 */
export const pickAndConvertImage = async (
	purpose?: string,
): Promise<string | null> => {
	// Request permission first
	const hasPermission = await requestMediaLibraryPermission();

	if (!hasPermission) {
		console.log(
			`Permission to access media library was denied for ${purpose || "image"}`,
		);
		return null;
	} // Launch the image picker
	const result = await ImagePicker.launchImageLibraryAsync({
		// biome-ignore lint/complexity/useLiteralKeys: <explanation>
		mediaTypes: ImagePicker["images"],
		allowsEditing: true,
		quality: 0.8,
		base64: true, // Add this line to get base64 data
	});

	if (result.canceled || !result.assets || result.assets.length === 0) {
		console.log("Image selection was canceled");
		return null;
	}

	const selectedImage = result.assets[0];
	try {
		// Convert the selected image to WebP format using the ImageManipulator static method
		const context = ImageManipulator.manipulate(selectedImage.uri);

		// Apply transformations: resize to width 800
		context.resize({ width: 800 });

		// Render the transformations
		const imageRef = await context.renderAsync(); // Save the image as WebP
		const manipulatedImage = await imageRef.saveAsync({
			compress: 0.8, // 80% quality
			format: SaveFormat.WEBP,
			base64: true, // Add this to get base64 data
		});

		// Get the file info for the WebP image
		const imageInfo = await getFileInfo(manipulatedImage.uri);

		// Log the size in KB
		const sizeInKB = imageInfo.size / 1024;
		console.log(`WebP image size: ${sizeInKB.toFixed(2)} KB`);
		return manipulatedImage.uri;
	} catch (error) {
		console.error("Error converting image to WebP:", error);
		return null;
	}
};

/**
 * Get file information including size
 */
const getFileInfo = async (fileUri: string): Promise<{ size: number }> => {
	try {
		// Use expo-file-system to get accurate file information
		const fileInfo = await FileSystem.getInfoAsync(fileUri);

		if (fileInfo.exists && fileInfo.size !== undefined) {
			return { size: fileInfo.size };
		}
		console.warn("File does not exist or size information unavailable");
		return { size: 0 };
	} catch (error) {
		console.error("Error getting file info:", error);
		return { size: 0 };
	}
};
