import { Tabs } from "expo-router";
import { Feather, Ionicons } from "@expo/vector-icons";

export default function EmployerLayout() {
	return (
		<Tabs
			screenOptions={{
				tabBarActiveTintColor: "#10b981", // emerald-500
				tabBarInactiveTintColor: "#6b7280", // gray-500
				tabBarStyle: {
					backgroundColor: "#ffffff",
					borderTopWidth: 1,
					borderTopColor: "#e5e7eb",
					paddingBottom: 8,
					paddingTop: 8,
					height: 88,
				},
				tabBarLabelStyle: {
					fontSize: 12,
					fontWeight: "500",
				},
				headerStyle: {
					backgroundColor: "#ffffff",
					borderBottomWidth: 1,
					borderBottomColor: "#e5e7eb",
				},
				headerTitleStyle: {
					fontWeight: "600",
					fontSize: 18,
					color: "#111827",
				},
				headerShown: false,
			}}
		>
			<Tabs.Screen
				name="index"
				options={{
					title: "Dashboard",
					headerTitle: "Employer Dashboard",
					tabBarIcon: ({ color, size }) => (
						<Feather name="home" size={size} color={color} />
					),
					headerShown: false,
				}}
			/>
			<Tabs.Screen
				name="jobs"
				options={{
					title: "Jobs",
					headerTitle: "Manage Jobs",
					tabBarIcon: ({ color, size }) => (
						<Feather name="briefcase" size={size} color={color} />
					),
					headerShown: false,
				}}
			/>
			<Tabs.Screen
				name="applications"
				options={{
					title: "Applications",
					headerTitle: "Job Applications",
					tabBarIcon: ({ color, size }) => (
						<Feather name="users" size={size} color={color} />
					),
					headerShown: false,
				}}
			/>
			<Tabs.Screen
				name="company"
				options={{
					title: "Company",
					headerTitle: "Company Profile",
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="business-outline" size={size} color={color} />
					),
					headerShown: false,
				}}
			/>
			<Tabs.Screen
				name="profile"
				options={{
					title: "Profile",
					headerTitle: "My Profile",
					tabBarIcon: ({ color, size }) => (
						<Feather name="user" size={size} color={color} />
					),
					headerShown: false,
				}}
			/>
		</Tabs>
	);
}
