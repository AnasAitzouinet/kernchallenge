"use server"
import { LoginFormSchema, RegisterFormSchema } from "@/schemas";
import { z } from "zod";
import { cookies } from 'next/headers';

const getToken = async () => {
    const token = (await cookies()).get('token');
    return token ? token.value : '';
}

const setToken = async (token: string) => {
    const tokenCookies = await cookies();
    if (tokenCookies) {
        tokenCookies.set({
            name: 'token',
            value: token,
            httpOnly: process.env.NODE_ENV === 'production' ? true : false,
            secure: process.env.NODE_ENV === 'production' ? true : false,
            path: '/',
        });
    }
}

export const LoginAction = async (data: z.infer<typeof LoginFormSchema>) => {
    // Validate data using zod
    const ParsedData = LoginFormSchema.safeParse(data);
    if (!ParsedData.success) {
        return {
            error: true,
            message: "Invalid data. Please check your inputs.",
        };
    }

    try {
        // Send login request to the API
        const response = await fetch("http://localhost:8000/api/v1/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify(data),
        });

        // Parse JSON response
        const resData = await response.json();

        // Handle HTTP errors or invalid credentials
        if (!response.ok) {
            return {
                error: true,
                message: resData.detail || "Invalid credentials. Please try again.",
            };
        }

        // Handle success
        await setToken(resData.access_token);
        return {
            error: false,
            message: "Login successful",
        };
    } catch (error) {
        // Handle unexpected errors
        console.error("Error during login:", error);
        return {
            error: true,
            message: "An unexpected error occurred. Please try again later.",
        };
    }
};


export const RegisterAction = async (data: z.infer<typeof RegisterFormSchema>) => {
    // Validate data using zod
    const ParsedData = RegisterFormSchema.safeParse(data);
    if (!ParsedData.success) {
        return {
            error: true,
            message: "Invalid data. Please check your inputs.",
        };
    }

    try {
        // Send register request to the API
        const response = await fetch("http://localhost:8000/api/v1/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify(data),
        });

        // Parse JSON response
        const resData = await response.json();

        // Handle HTTP errors or invalid credentials
        if (!response.ok) {
            return {
                error: true,
                message: resData.detail || "Invalid credentials. Please try again.",
            };
        }

      
        return {
            error: false,
            message: "Registration successful",
        };
    } catch (error) {
        // Handle unexpected errors
        console.error("Error during registration:", error);
        return {
            error: true,
            message: "An unexpected error occurred. Please try again later.",
        };
    }
}