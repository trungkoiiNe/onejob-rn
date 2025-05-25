import { create } from "zustand";
import { supabase } from "./supabase";

// Define job-related types
export type JobSalaryType =
	| "per_hour"
	| "per_shift"
	| "per_day"
	| "fixed"
	| "negotiable";
export type JobType =
	| "part_time"
	| "full_time"
	| "internship"
	| "freelance"
	| "urgent";

// Define company-related types
export interface CompanyDetails {
	id?: string;
	name: string;
	logo_url?: string;
	cover_image_url?: string;
	industry: string;
	location: string;
	contact_email: string;
	contact_phone?: string;
	website?: string;
	description: string;
	created_by_user_id: string;
	created_at?: string;
	updated_at?: string;
}

export interface JobDetails {
	id?: string;
	title: string;
	description: string;
	employerId: string;
	location: string;
	salary: string;
	salaryType: JobSalaryType;
	jobType: JobType;
	startDate: string;
	endDate: string | null;
	requirements: string;
	benefits: string;
	slotsAvailable: number;
	tags: string[];
	is_active?: boolean;
	created_at?: string;
	updated_at?: string;
	is_verified?: boolean;
	views_count?: number;
	slots_filled?: number;
}

interface JobState {
	jobs: JobDetails[];
	isLoading: boolean;
	error: string | null;
	selectedJob: JobDetails | null;

	// Company related state
	companies: CompanyDetails[];
	selectedCompany: CompanyDetails | null;

	// Storage methods

	// Job methods
	fetchJobs: (employerId: string) => Promise<void>;
	addJob: (jobDetails: JobDetails) => Promise<string | null>;
	addJobViaRPC: (jobDetails: JobDetails) => Promise<string | null>;
	updateJob: (id: string, jobDetails: Partial<JobDetails>) => Promise<boolean>;
	deleteJob: (id: string) => Promise<boolean>;
	selectJob: (job: JobDetails) => void;
	clearSelectedJob: () => void;

	// Company methods
	fetchCompanies: (userId: string) => Promise<void>;
	addCompany: (companyDetails: CompanyDetails) => Promise<string | null>;
	addCompanyViaRPC: (companyDetails: CompanyDetails) => Promise<string | null>;
	updateCompany: (
		id: string,
		companyDetails: Partial<CompanyDetails>,
	) => Promise<boolean>;
	deleteCompany: (id: string) => Promise<boolean>;
	selectCompany: (company: CompanyDetails) => void;
	clearSelectedCompany: () => void;

	// Image upload method
	uploadImageToStorage: (
		filePath: string,
		storagePath: string,
	) => Promise<string | null>;
}

export const useJobStore = create<JobState>((set, get) => ({
	jobs: [],
	isLoading: false,
	error: null,
	selectedJob: null,

	// Company state
	companies: [],
	selectedCompany: null,

	// Upload file to Supabase storage with the specified path

	fetchJobs: async (employerId: string) => {
		try {
			set({ isLoading: true, error: null });

			const { data, error } = await supabase
				.from("jobs")
				.select("*")
				.eq("employer_id", employerId)
				.order("created_at", { ascending: false });

			if (error) throw error;

			set({ jobs: data || [], isLoading: false });
		} catch (error: unknown) {
			if (error instanceof Error) {
				console.error("Error fetching jobs:", error.message);
				set({ error: error.message, isLoading: false });
			} else {
				console.error("Error fetching jobs:", error);
				set({ error: String(error), isLoading: false });
			}
		}
	},

	addJob: async (jobDetails: JobDetails) => {
		try {
			set({ isLoading: true, error: null });

			// Insert directly into the jobs table
			const { data, error } = await supabase
				.from("jobs")
				.insert({
					title: jobDetails.title,
					description: jobDetails.description,
					employer_id: jobDetails.employerId,
					location: jobDetails.location,
					salary: jobDetails.salary,
					salary_type: jobDetails.salaryType,
					job_type: jobDetails.jobType,
					start_date: jobDetails.startDate,
					end_date: jobDetails.endDate,
					requirements: jobDetails.requirements,
					benefits: jobDetails.benefits,
					slots_available: jobDetails.slotsAvailable,
					tags: jobDetails.tags,
				})
				.select("id")
				.single();

			set({ isLoading: false });

			if (error) {
				console.error("Error adding job:", error);
				set({ error: error.message });
				return null;
			}

			// Refresh jobs list
			get().fetchJobs(jobDetails.employerId);

			console.log("New job added with ID:", data.id);
			return data.id;
		} catch (error: unknown) {
			if (error instanceof Error) {
				console.error("Error adding job:", error.message);
				set({ error: error.message, isLoading: false });
			} else {
				console.error("Error adding job:", error);
				set({ error: String(error), isLoading: false });
			}
			return null;
		}
	},

	addJobViaRPC: async (jobDetails: JobDetails) => {
		try {
			set({ isLoading: true, error: null });

			// Call the add_new_job RPC function
			const { data, error } = await supabase.rpc("add_new_job", {
				p_title: jobDetails.title,
				p_description: jobDetails.description,
				p_employer_id: jobDetails.employerId,
				p_location: jobDetails.location,
				p_salary: jobDetails.salary,
				p_salary_type: jobDetails.salaryType,
				p_job_type: jobDetails.jobType,
				p_start_date: jobDetails.startDate,
				p_end_date: jobDetails.endDate,
				p_requirements: jobDetails.requirements,
				p_benefits: jobDetails.benefits,
				p_slots_available: jobDetails.slotsAvailable,
				p_tags: jobDetails.tags,
			});

			set({ isLoading: false });

			if (error) {
				console.error("Error adding job via RPC:", error);
				set({ error: error.message });
				return null;
			}

			// Refresh jobs list
			get().fetchJobs(jobDetails.employerId);

			console.log("New job added via RPC with ID:", data);
			return data;
		} catch (error: unknown) {
			if (error instanceof Error) {
				console.error("Error adding job via RPC:", error.message);
				set({ error: error.message, isLoading: false });
			} else {
				console.error("Error adding job via RPC:", error);
				set({ error: String(error), isLoading: false });
			}
			return null;
		}
	},

	updateJob: async (id: string, jobDetails: Partial<JobDetails>) => {
		try {
			set({ isLoading: true, error: null });

			// Convert jobDetails keys to snake_case for the database
			const dbJobDetails: Record<string, unknown> = {};
			for (const [key, value] of Object.entries(jobDetails)) {
				// Convert camelCase to snake_case
				const snakeKey = key.replace(/([A-Z])/g, "_$1").toLowerCase();
				dbJobDetails[snakeKey] = value;
			}

			const { error } = await supabase
				.from("jobs")
				.update(dbJobDetails)
				.eq("id", id);

			set({ isLoading: false });

			if (error) {
				console.error("Error updating job:", error);
				set({ error: error.message });
				return false;
			}

			// Refresh jobs list if we have an employerId
			const jobs = get().jobs;
			const job = jobs.find((j) => j.id === id);
			if (job) {
				get().fetchJobs(job.employerId);
			}

			return true;
		} catch (error: unknown) {
			if (error instanceof Error) {
				console.error("Error updating job:", error.message);
				set({ error: error.message, isLoading: false });
			} else {
				console.error("Error updating job:", error);
				set({ error: String(error), isLoading: false });
			}
			return false;
		}
	},

	deleteJob: async (id: string) => {
		try {
			set({ isLoading: true, error: null });

			const { error } = await supabase.from("jobs").delete().eq("id", id);

			set({ isLoading: false });

			if (error) {
				console.error("Error deleting job:", error);
				set({ error: error.message });
				return false;
			}

			// Update local state by removing the deleted job
			const jobs = get().jobs;
			set({ jobs: jobs.filter((job) => job.id !== id) });

			return true;
		} catch (error: unknown) {
			if (error instanceof Error) {
				console.error("Error deleting job:", error.message);
				set({ error: error.message, isLoading: false });
			} else {
				console.error("Error deleting job:", error);
				set({ error: String(error), isLoading: false });
			}
			return false;
		}
	},

	selectJob: (job: JobDetails) => {
		set({ selectedJob: job });
	},
	clearSelectedJob: () => {
		set({ selectedJob: null });
	},

	// Company methods
	fetchCompanies: async (userId: string) => {
		try {
			set({ isLoading: true, error: null });

			const { data, error } = await supabase
				.from("companies")
				.select("*")
				.eq("created_by_user_id", userId)
				.order("created_at", { ascending: false });

			if (error) throw error;

			set({ companies: data || [], isLoading: false });
		} catch (error: unknown) {
			if (error instanceof Error) {
				console.error("Error fetching companies:", error.message);
				set({ error: error.message, isLoading: false });
			} else {
				console.error("Error fetching companies:", error);
				set({ error: String(error), isLoading: false });
			}
		}
	},

	addCompany: async (companyDetails: CompanyDetails) => {
		try {
			set({ isLoading: true, error: null });

			// Insert directly into the companies table
			const { data, error } = await supabase
				.from("companies")
				.insert({
					name: companyDetails.name,
					logo_url: companyDetails.logo_url,
					cover_image_url: companyDetails.cover_image_url,
					industry: companyDetails.industry,
					location: companyDetails.location,
					contact_email: companyDetails.contact_email,
					contact_phone: companyDetails.contact_phone,
					website: companyDetails.website,
					description: companyDetails.description,
					created_by_user_id: companyDetails.created_by_user_id,
				})
				.select("id")
				.single();

			set({ isLoading: false });

			if (error) {
				console.error("Error adding company:", error);
				set({ error: error.message });
				return null;
			}

			// Refresh companies list
			get().fetchCompanies(companyDetails.created_by_user_id);

			console.log("New company added with ID:", data.id);
			return data.id;
		} catch (error: unknown) {
			if (error instanceof Error) {
				console.error("Error adding company:", error.message);
				set({ error: error.message, isLoading: false });
			} else {
				console.error("Error adding company:", error);
				set({ error: String(error), isLoading: false });
			}
			return null;
		}
	},

	addCompanyViaRPC: async (companyDetails: CompanyDetails) => {
		try {
			set({ isLoading: true, error: null });

			// Call the add_new_company RPC function
			const { data, error } = await supabase.rpc("add_new_company", {
				p_name: companyDetails.name,
				p_logo_url: companyDetails.logo_url || "",
				p_cover_image_url: companyDetails.cover_image_url || "",
				p_industry: companyDetails.industry,
				p_location: companyDetails.location,
				p_contact_email: companyDetails.contact_email,
				p_contact_phone: companyDetails.contact_phone || "",
				p_website: companyDetails.website || "",
				p_description: companyDetails.description,
				p_created_by_user_id: companyDetails.created_by_user_id,
			});

			set({ isLoading: false });

			if (error) {
				console.error("Error adding company via RPC:", error);
				set({ error: error.message });
				return null;
			}

			// Refresh companies list
			get().fetchCompanies(companyDetails.created_by_user_id);

			console.log("New company added via RPC with ID:", data);
			return data;
		} catch (error: unknown) {
			if (error instanceof Error) {
				console.error("Error adding company via RPC:", error.message);
				set({ error: error.message, isLoading: false });
			} else {
				console.error("Error adding company via RPC:", error);
				set({ error: String(error), isLoading: false });
			}
			return null;
		}
	},

	updateCompany: async (
		id: string,
		companyDetails: Partial<CompanyDetails>,
	) => {
		try {
			set({ isLoading: true, error: null });

			// Convert companyDetails keys to snake_case for the database
			const dbCompanyDetails: Record<string, unknown> = {};
			for (const [key, value] of Object.entries(companyDetails)) {
				// Convert camelCase to snake_case
				const snakeKey = key.replace(/([A-Z])/g, "_$1").toLowerCase();
				dbCompanyDetails[snakeKey] = value;
			}

			const { error } = await supabase
				.from("companies")
				.update(dbCompanyDetails)
				.eq("id", id);

			set({ isLoading: false });

			if (error) {
				console.error("Error updating company:", error);
				set({ error: error.message });
				return false;
			}

			// Refresh companies list if we have a userId
			const companies = get().companies;
			const company = companies.find((c) => c.id === id);
			if (company) {
				get().fetchCompanies(company.created_by_user_id);
			}

			return true;
		} catch (error: unknown) {
			if (error instanceof Error) {
				console.error("Error updating company:", error.message);
				set({ error: error.message, isLoading: false });
			} else {
				console.error("Error updating company:", error);
				set({ error: String(error), isLoading: false });
			}
			return false;
		}
	},

	deleteCompany: async (id: string) => {
		try {
			set({ isLoading: true, error: null });

			// First delete the company from the database
			const { error: dbError } = await supabase
				.from("companies")
				.delete()
				.eq("id", id);

			if (dbError) {
				console.error("Error deleting company:", dbError);
				set({ error: dbError.message, isLoading: false });
				return false;
			}

			// Then delete the company's folder from storage
			try {
				// List all files in the company's folder
				const { data: files, error: listError } = await supabase.storage
					.from("images")
					.list(`companies/${id}`, {
						limit: 100,
						offset: 0,
					});

				if (listError) {
					console.warn(
						"Warning: Could not list company files for deletion:",
						listError,
					);
				} else if (files && files.length > 0) {
					// Delete all files in the company's folder
					const filePaths = files.map((file) => `companies/${id}/${file.name}`);
					const { error: deleteError } = await supabase.storage
						.from("images")
						.remove(filePaths);

					if (deleteError) {
						console.warn(
							"Warning: Could not delete some company files:",
							deleteError,
						);
					} else {
						console.log(
							`Successfully deleted ${files.length} files for company ${id}`,
						);
					}
				}
			} catch (storageError) {
				console.warn(
					"Warning: Storage cleanup failed, but company was deleted from database:",
					storageError,
				);
			}

			set({ isLoading: false });

			// Update local state by removing the deleted company
			const companies = get().companies;
			set({ companies: companies.filter((company) => company.id !== id) });

			return true;
		} catch (error: unknown) {
			if (error instanceof Error) {
				console.error("Error deleting company:", error.message);
				set({ error: error.message, isLoading: false });
			} else {
				console.error("Error deleting company:", error);
				set({ error: String(error), isLoading: false });
			}
			return false;
		}
	},

	selectCompany: (company: CompanyDetails) => {
		set({ selectedCompany: company });
	},

	clearSelectedCompany: () => {
		set({ selectedCompany: null });
	}, // Upload file to Supabase storage with the specified path
	uploadImageToStorage: async (
		filePath: string,
		storagePath: string,
	): Promise<string | null> => {
		try {
			set({ isLoading: true, error: null });

			// Import decode function from base64-arraybuffer
			const { decode } = await import("base64-arraybuffer");

			// Extract base64 data from file URI
			// File URI format is typically: 'file:///path/to/file' or 'data:image/type;base64,base64data'
			let base64Data = "";

			if (filePath.startsWith("data:")) {
				// If it's a data URI, extract the base64 part
				base64Data = filePath.split(",")[1];
			} else {
				// If it's a file URI, read it and convert to base64
				// Use FileSystem from expo-file-system to read the file
				const FileSystem = require("expo-file-system");
				base64Data = await FileSystem.readAsStringAsync(filePath, {
					encoding: FileSystem.EncodingType.Base64,
				});
			}

			// Decode base64 string to ArrayBuffer
			const arrayBuffer = decode(base64Data);

			// Upload to Supabase storage using ArrayBuffer
			const { data, error } = await supabase.storage
				.from("images")
				.upload(`companies/${storagePath}`, arrayBuffer, {
					contentType: "image/webp", // Set the content type to WebP
					upsert: true, // Overwrite if file already exists
					cacheControl: "3600", // Cache for 1 hour
				});
			set({ isLoading: false });
			console.log(data);
			if (error) {
				console.error("Error uploading image:", error);
				set({ error: error.message });
				return null;
			} // Return the public URL
			const { data: publicURLData } = supabase.storage
				.from("images")
				.getPublicUrl(`companies/${storagePath}`);

			return publicURLData.publicUrl;
		} catch (error: unknown) {
			if (error instanceof Error) {
				console.error("Error uploading image:", error.message);
				set({ error: error.message, isLoading: false });
			} else {
				console.error("Error uploading image:", error);
				set({ error: String(error), isLoading: false });
			}
			return null;
		}
	},
}));
