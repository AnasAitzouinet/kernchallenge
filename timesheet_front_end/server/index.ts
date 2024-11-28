"use server";

import { LoginFormSchema, ProjectSchema, RegisterFormSchema } from "@/schemas";
import { z } from "zod";
import { cookies } from "next/headers";
import {
    TimeEntryRead,
    BreakRead,
    TimeEntryCreate,
    TimeEntryStatus,
    ProjectCreate,
    ProjectRead,
    EndBreakData,
    EndEntryData,
} from "@/types/time-tracking";
import { cache } from "react";

const API_BASE_URL = "http://localhost:8000/api/v1"; // Update with your actual API base URL

// Function to get the authentication token
export const getToken = async (): Promise<string | null> => {
    const tokenCookie = (await cookies()).get("token");
    return tokenCookie ? tokenCookie.value : null;
};

// Function to set the authentication token
const setToken = async (token: string) => {
    const tokenCookies = await cookies();
    tokenCookies.set({
        name: "token",
        value: token,
        httpOnly: process.env.NODE_ENV === "production",
        secure: process.env.NODE_ENV === "production",
        path: "/",
    });
};

interface ApiFetchResponse<T> {
    data?: T;
    error?: boolean;
    message?: string;
}

// Helper function to make requests with fetch 
async function apiFetch<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiFetchResponse<T>> {
    try {
      const token = await getToken();
      const headers: HeadersInit = {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      };
      if (token) {
        (headers as Record<string, string>).Authorization = `Bearer ${token}`;
    }  
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
        credentials: "include",
      });
    

      const contentType = response.headers.get("content-type");
      if (!response.ok) {
        const errorMessage =
          contentType?.includes("application/json")
            ? (await response.json()).detail
            : await response.text();
        return {
          error: true,
          message: errorMessage || "An unexpected error occurred.",
        };
      }
  
      const data = contentType?.includes("application/json")
        ? await response.json()
        : undefined;
  
      return { data };
    } catch (error) {
      console.error("API fetch error:", error);
      return {
        error: true,
        message: "An unexpected error occurred. Please try again later.",
      };
    }
  }
  


// Login Action
export const LoginAction = async (data: z.infer<typeof LoginFormSchema>) => {
    // Validate data using zod
    const parsedData = LoginFormSchema.safeParse(data);
    if (!parsedData.success) {
        return {
            error: true,
            message: "Invalid data. Please check your inputs.",
        };
    }

    const response = await apiFetch<{ access_token: string }>("/auth/login", {
        method: "POST",
        body: JSON.stringify(data),
    });

    if (response.error) {
        return response;
    }

    // Handle success
    await setToken(response.data?.access_token!);
    return {
        error: false,
        message: "Login successful",
    };
};

// Register Action
export const RegisterAction = async (data: z.infer<typeof RegisterFormSchema>) => {
    // Validate data using zod
    const parsedData = RegisterFormSchema.safeParse(data);
    if (!parsedData.success) {
        return {
            error: true,
            message: "Invalid data. Please check your inputs.",
        };
    }

    const response = await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify(data),
    });

    if (response.error) {
        return response;
    }

    return {
        error: false,
        message: "Registration successful",
    };
};

// Add New Project
export const AddNewProject = async (data: z.infer<typeof ProjectSchema>): Promise<{
    error: boolean;
    message: string;
    project?: ProjectRead;
}> => {
    // invalidate cache
    

    // Validate data using zod
    const parsedData = ProjectSchema.safeParse(data);
    if (!parsedData.success) {
        return {
            error: true,
            message: "Invalid data. Please check your inputs.",
        };
    }

    const response = await apiFetch<ProjectRead>("/projects/", {
        method: "POST",
        body: JSON.stringify(data),
    });

    if (response.error) {
        return {
            error: true,
            message: response.message || "Failed to add project",
        };
    }

    return {
        error: false,
        message: "Project added successfully",
        project: response.data,
    };
};

// Get Projects
export const GetProjects = async (): Promise<{
    error: boolean;
    message: string;
    projects?: ProjectRead[];
}> => {
    
    const response = await apiFetch<ProjectRead[]>("/projects/", {
        method: "GET",
    });

    if (response.error) {
        return {
            error: true,
            message: response.message || "Failed to fetch projects",
        }
    }

    return {
        error: false,
        message: "Projects fetched successfully",
        projects: response.data,
    };
}

export const GetTimeEntries = async (): Promise<{
    error: boolean;
    message: string;
    entries?: TimeEntryRead[];
}> => {
    const response = await apiFetch<TimeEntryRead[]>("/time_entries/", {
        method: "GET",
    });

    if (response.error) {
        return {
            error: true,
            message: response.message || "Failed to fetch time entries",
        }
    }

 
    return {
        error: false,
        message: "Time entries fetched successfully",
        entries: response.data,
    };
};

// Start Time Entry
export const StartTimeEntry = async (data: TimeEntryCreate): Promise<{
    error: boolean;
    message: string;
    entry?: TimeEntryRead;
}> => {
    // Validate data if necessary
    const response = await apiFetch<TimeEntryRead>("/time_entries/start", {
        method: "POST",
        body: JSON.stringify(data),
    });

    if (response.error) {
        return {
            error: true,
            message: response.message || "Failed to start time entry",
        }
    }

    return {
        error: false,
        message: "Time entry started successfully",
        entry: response.data,
    };
};

// End Time Entry
export const EndTimeEntry = async (data: EndEntryData): Promise<{
    error: boolean;
    message: string;
    entry?: TimeEntryRead;
}> => {
    const response = await apiFetch<TimeEntryRead>(`/time_entries/${data.id}/stop`, {
        method: "POST",
    });

    console.log(response);

    if (response.error) {
        return {
            error: true,
            message: response.message || "Failed to end time entry",
        }
    }

    return {
        error: false,
        message: "Time entry ended successfully",
        entry: response.data,
    };
};

// Start Break
export const StartBreak = async (data: { time_entry_id: number }): Promise<{
    error: boolean;
    message: string;
    break?: BreakRead;
}> => {
    const response = await apiFetch<BreakRead>(
        `/time_entries/${data.time_entry_id}/breaks/start`,
        {
            method: "POST",
        }
    );

    if (response.error) {
        return {
            error: true,
            message: response.message || "Failed to start break",
        }
    }

    return {
        error: false,
        message: "Break started successfully",
        break: response.data,
    };
};

// End Break
export const EndBreak = async (data: EndBreakData): Promise<{
    error: boolean;
    message: string;
    break?: BreakRead;
}> => {
    const response = await apiFetch<BreakRead >(
        `/time_entries/${data.time_entry_id}/breaks/${data.break_id}/end`,
        {
            method: "POST",
        }
    );

    if (response.error) {
        return {
            error: true,
            message: response.message || "Failed to end break",
        }
    }

    return {
        error: false,
        message: "Break ended successfully",
        break: response.data,
    };
};
