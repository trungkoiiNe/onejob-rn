import React from "react";
import {
	View,
	Text,
	ScrollView,
	TouchableOpacity,
	StyleSheet,
	Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "@/stores";
import { router } from "expo-router";

const { width } = Dimensions.get("window");

export default function EmployerDashboard() {
	const { user, logout } = useAuthStore();

	const handleLogout = async () => {
		await logout();
	};

	type StatCardProps = {
		title: string;
		value: string;
		icon: keyof typeof Feather.glyphMap;
		color: string;
	};

	const StatCard = ({ title, value, icon, color }: StatCardProps) => (
		<View style={[styles.statCard, { borderLeftColor: color }]}>
			<View style={styles.statHeader}>
				<View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
					<Feather name={icon} size={24} color={color} />
				</View>
				<Text style={styles.statValue}>{value}</Text>
			</View>
			<Text style={styles.statTitle}>{title}</Text>
		</View>
	);

	type QuickActionProps = {
		title: string;
		icon: keyof typeof Feather.glyphMap;
		color: string;
		onPress: () => void;
	};

	const QuickAction = ({ title, icon, color, onPress }: QuickActionProps) => (
		<TouchableOpacity style={styles.quickAction} onPress={onPress}>
			<LinearGradient
				colors={[color, `${color}90`]}
				style={styles.quickActionGradient}
			>
				<Feather name={icon} size={28} color="#ffffff" />
				<Text style={styles.quickActionText}>{title}</Text>
			</LinearGradient>
		</TouchableOpacity>
	);

	type RecentActivityProps = {
		title: string;
		subtitle: string;
		time: string;
		type: string;
	};

	const RecentActivity = ({ title, subtitle, time, type }: RecentActivityProps) => (
		<View style={styles.activityItem}>
			<View
				style={[
					styles.activityIcon,
					{ backgroundColor: getActivityColor(type) },
				]}
			>
				<Feather name={getActivityIcon(type)} size={16} color="#ffffff" />
			</View>
			<View style={styles.activityContent}>
				<Text style={styles.activityTitle}>{title}</Text>
				<Text style={styles.activitySubtitle}>{subtitle}</Text>
			</View>
			<Text style={styles.activityTime}>{time}</Text>
		</View>
	);

	const getActivityColor = (type: string) => {
		switch (type) {
			case "application":
				return "#10b981";
			case "job":
				return "#3b82f6";
			case "interview":
				return "#f59e0b";
			default:
				return "#6b7280";
		}
	};

	const getActivityIcon = (type: string) => {
		switch (type) {
			case "application":
				return "user-plus";
			case "job":
				return "briefcase";
			case "interview":
				return "calendar";
			default:
				return "bell";
		}
	};

	return (
		<SafeAreaView style={styles.container}>
			<ScrollView showsVerticalScrollIndicator={false}>
				{/* Header */}
				<View style={styles.header}>
					<View>
						<Text style={styles.greeting}>Welcome back!</Text>
						<Text style={styles.username}>{user?.email}</Text>
					</View>
					<TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
						<Feather name="log-out" size={20} color="#ef4444" />
					</TouchableOpacity>
				</View>

				{/* Stats Grid */}
				<View style={styles.statsContainer}>
					<Text style={styles.sectionTitle}>Company Overview</Text>
					<View style={styles.statsGrid}>
						<StatCard
							title="Active Jobs"
							value="12"
							icon="briefcase"
							color="#10b981"
						/>
						<StatCard
							title="Applications"
							value="47"
							icon="users"
							color="#3b82f6"
						/>
						<StatCard
							title="Interviews"
							value="8"
							icon="calendar"
							color="#f59e0b"
						/>
						<StatCard
							title="Hired"
							value="3"
							icon="user-check"
							color="#8b5cf6"
						/>
					</View>
				</View>

				{/* Quick Actions */}
				<View style={styles.quickActionsContainer}>
					<Text style={styles.sectionTitle}>Quick Actions</Text>
					<View style={styles.quickActionsGrid}>
						<QuickAction
							title="Post New Job"
							icon="plus-circle"
							color="#10b981"
							onPress={() => {
								router.push("/employer/jobs");
							}}
						/>
						<QuickAction
							title="Review Applications"
							icon="clipboard"
							color="#3b82f6"
							onPress={() => {
								router.push("/employer/applications");
							}}
						/>
						<QuickAction
							title="Schedule Interview"
							icon="calendar"
							color="#f59e0b"
							onPress={() => {
								router.push("/employer/jobs");
							}}
						/>
						<QuickAction
							title="Company Profile"
							icon="settings"
							color="#8b5cf6"
							onPress={() => {
								router.push("/employer/company");
							}}
						/>
					</View>
				</View>

				{/* Recent Activity */}
				<View style={styles.activityContainer}>
					<Text style={styles.sectionTitle}>Recent Activity</Text>
					<View style={styles.activityList}>
						<RecentActivity
							title="New Application Received"
							subtitle="Software Engineer position"
							time="2 hours ago"
							type="application"
						/>
						<RecentActivity
							title="Job Posted Successfully"
							subtitle="UI/UX Designer"
							time="1 day ago"
							type="job"
						/>
						<RecentActivity
							title="Interview Scheduled"
							subtitle="John Doe - Frontend Developer"
							time="2 days ago"
							type="interview"
						/>
						<RecentActivity
							title="New Application Received"
							subtitle="Backend Developer position"
							time="3 days ago"
							type="application"
						/>
					</View>
				</View>

				{/* Company Performance */}
				<View style={styles.performanceContainer}>
					<Text style={styles.sectionTitle}>This Month</Text>
					<View style={styles.performanceCard}>
						<LinearGradient
							colors={["#10b981", "#059669"]}
							style={styles.performanceGradient}
						>
							<View style={styles.performanceHeader}>
								<Ionicons name="trending-up" size={32} color="#ffffff" />
								<Text style={styles.performanceTitle}>Performance</Text>
							</View>
							<View style={styles.performanceStats}>
								<View style={styles.performanceStat}>
									<Text style={styles.performanceStatValue}>156%</Text>
									<Text style={styles.performanceStatLabel}>
										Application Rate
									</Text>
								</View>
								<View style={styles.performanceStat}>
									<Text style={styles.performanceStatValue}>89%</Text>
									<Text style={styles.performanceStatLabel}>
										Interview Rate
									</Text>
								</View>
								<View style={styles.performanceStat}>
									<Text style={styles.performanceStatValue}>67%</Text>
									<Text style={styles.performanceStatLabel}>Hire Rate</Text>
								</View>
							</View>
						</LinearGradient>
					</View>
				</View>
			</ScrollView>
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
		paddingVertical: 20,
		backgroundColor: "#ffffff",
		borderBottomWidth: 1,
		borderBottomColor: "#e5e7eb",
	},
	greeting: {
		fontSize: 16,
		color: "#6b7280",
		marginBottom: 4,
	},
	username: {
		fontSize: 20,
		fontWeight: "600",
		color: "#111827",
	},
	logoutButton: {
		padding: 8,
		borderRadius: 8,
		backgroundColor: "#fef2f2",
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: "600",
		color: "#111827",
		marginBottom: 16,
	},
	statsContainer: {
		padding: 20,
	},
	statsGrid: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 12,
	},
	statCard: {
		backgroundColor: "#ffffff",
		borderRadius: 12,
		padding: 16,
		borderLeftWidth: 4,
		width: (width - 52) / 2,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
	},
	statHeader: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 8,
	},
	iconContainer: {
		width: 40,
		height: 40,
		borderRadius: 20,
		justifyContent: "center",
		alignItems: "center",
		marginRight: 12,
	},
	statValue: {
		fontSize: 24,
		fontWeight: "bold",
		color: "#111827",
	},
	statTitle: {
		fontSize: 14,
		color: "#6b7280",
		fontWeight: "500",
	},
	quickActionsContainer: {
		paddingHorizontal: 20,
		paddingBottom: 20,
	},
	quickActionsGrid: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 12,
	},
	quickAction: {
		width: (width - 52) / 2,
		height: 80,
		borderRadius: 12,
		overflow: "hidden",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
	},
	quickActionGradient: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingHorizontal: 16,
	},
	quickActionText: {
		color: "#ffffff",
		fontSize: 14,
		fontWeight: "600",
		textAlign: "center",
		marginTop: 8,
	},
	activityContainer: {
		paddingHorizontal: 20,
		paddingBottom: 20,
	},
	activityList: {
		backgroundColor: "#ffffff",
		borderRadius: 12,
		padding: 16,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
	},
	activityItem: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 12,
		borderBottomWidth: 1,
		borderBottomColor: "#f3f4f6",
	},
	activityIcon: {
		width: 32,
		height: 32,
		borderRadius: 16,
		justifyContent: "center",
		alignItems: "center",
		marginRight: 12,
	},
	activityContent: {
		flex: 1,
	},
	activityTitle: {
		fontSize: 14,
		fontWeight: "600",
		color: "#111827",
		marginBottom: 2,
	},
	activitySubtitle: {
		fontSize: 12,
		color: "#6b7280",
	},
	activityTime: {
		fontSize: 12,
		color: "#9ca3af",
	},
	performanceContainer: {
		paddingHorizontal: 20,
		paddingBottom: 40,
	},
	performanceCard: {
		borderRadius: 16,
		overflow: "hidden",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.15,
		shadowRadius: 8,
		elevation: 5,
	},
	performanceGradient: {
		padding: 20,
	},
	performanceHeader: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 20,
	},
	performanceTitle: {
		fontSize: 20,
		fontWeight: "bold",
		color: "#ffffff",
		marginLeft: 12,
	},
	performanceStats: {
		flexDirection: "row",
		justifyContent: "space-between",
	},
	performanceStat: {
		alignItems: "center",
	},
	performanceStatValue: {
		fontSize: 24,
		fontWeight: "bold",
		color: "#ffffff",
		marginBottom: 4,
	},
	performanceStatLabel: {
		fontSize: 12,
		color: "#d1fae5",
		textAlign: "center",
	},
});
