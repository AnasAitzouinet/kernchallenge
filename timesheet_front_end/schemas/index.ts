import { z } from "zod"

export const LoginFormSchema = z.object({
  email: z.string().email({
    message: "Email must be a valid email address."
  }),
  password: z.string().min(4, {
    message: "Password must be at least 4 characters long."
  }),
})

export const RegisterFormSchema = z.object({
  name: z.string().min(4, {
    message: "Name must be at least 4 characters long."
  }),
  email: z.string().email({
    message: "Email must be a valid email address."
  }),
  password: z.string().min(4, {
    message: "Password must be at least 4 characters long."
  }),
})

export const ProjectSchema = z.object({
  name: z.string().min(4, {
    message: "Name must be at least 4 characters long"
  }),
  description: z.string().min(4, {
    message: "Description must be at least 4 characters long"
  }),
})

export const TimeEntrySchema = z.object({
  project_id: z.string({
    message: "Project ID must be a string."
  }),
  start_time: z.date({
    message: "Start time must be a valid date."
  }),
  end_time: z.date({
    message: "End time must be a valid date."
  }),
  status: z.string({
    message: "Status must be a string."
  }),
  price: z.number({
    message: "Price must be a number."
  }),
  start_break_time: z.date({
    message: "Start break time must be a valid date."
  }),
  end_break_time: z.date({
    message: "End break time must be a valid date."
  }),
})