import { z } from "zod"

export const LoginFormSchema = z.object({
    email: z.string().email(),
    password: z.string().min(4),
  })
  
export const RegisterFormSchema = z.object({
    name: z.string().min(4),
    email: z.string().email(),
    password: z.string().min(4),
    })