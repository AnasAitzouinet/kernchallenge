"use client"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { LoginFormSchema, RegisterFormSchema } from "@/schemas"
import { LoginAction, RegisterAction } from "@/server"
import Password from "./ui/PasswordInput"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"


export function AuthPage() {
  return (
    <Tabs defaultValue="signin" className="w-[400px]">
      <TabsList className="w-full">
        <TabsTrigger value="signin"    className="w-full">Sign In</TabsTrigger>
        <TabsTrigger value="signup" className="w-full">Sign Up</TabsTrigger>
      </TabsList>
      <TabsContent defaultValue={"signin"} value="signin" >
        <SignInForm />
      </TabsContent>
      <TabsContent value="signup" >
        <SignUpform />
      </TabsContent>
    </Tabs>
  )
}


function SignUpform() {
  const form = useForm<z.infer<typeof RegisterFormSchema>>({
    resolver: zodResolver(RegisterFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  })


  const onSubmit = async (data: z.infer<typeof RegisterFormSchema>) => {
    try {
      const ParsedData = RegisterFormSchema.safeParse(data)

      if (ParsedData.error) {
        toast.error("Invalid data")
      }
      RegisterAction(data).then((response) => {
        if (response.error) {
          toast.error(response.message)
        } else {
          toast.success(response.message)
        }
      }
      )
    } catch (error) {
      console.error(error)
      toast.error("An error occurred")
    }
  }
  return (
    <Card className="mx-auto w-full max-w-lg">
      <CardHeader>
        <CardTitle className="text-2xl">Register</CardTitle>
        <CardDescription>
          Enter your details below to create an account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            className="grid gap-4"
            onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem
                  className="grid gap-2"
                >
                  <FormLabel htmlFor="name">Name</FormLabel>
                  <FormControl>
                    <Input id="name" type="text"
                      placeholder="John Doe"
                      required {...field} />
                  </FormControl>
                  <FormMessage {...field} />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem
                  className="grid gap-2"
                >
                  <FormLabel htmlFor="email">Email</FormLabel>
                  <FormControl>
                    <Input id="email" type="email"
                      placeholder="Enter your email"
                      required {...field} />
                  </FormControl>
                  <FormDescription>
                    We&apos;ll never share your email with anyone else.
                  </FormDescription>
                  <FormMessage {...field} />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem
                  className="grid gap-2"
                >
                  <Label htmlFor="password">Password</Label>
                  <FormControl>
                    <Password
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">
              Register
            </Button>
          </form>
        </Form>

      </CardContent>
    </Card>
  )
}

function SignInForm() {

  const form = useForm<z.infer<typeof LoginFormSchema>>({
    resolver: zodResolver(LoginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })


  const onSubmit = async (data: z.infer<typeof LoginFormSchema>) => {
    try {
      const ParsedData = LoginFormSchema.safeParse(data)

      if (ParsedData.error) {
        toast.error("Invalid data")
      }
      LoginAction(data).then((response) => {
        if (response.error) {
          toast.error(response.message)
        } else {
          toast.success(response.message)
        }
      }
      )
    } catch (error) {
      console.error(error)
      toast.error("An error occurred")
    }
  }

  return (
    <Card className="mx-auto w-full max-w-lg">
      <CardHeader>
        <CardTitle className="text-2xl">Login</CardTitle>
        <CardDescription>
          Enter your email below to login to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            className="grid gap-4"
            onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem
                  className="grid gap-2"
                >
                  <FormLabel htmlFor="email">Email</FormLabel>
                  <FormControl>
                    <Input id="email" type="email"
                      placeholder="Enter your email"
                      required {...field} />
                  </FormControl>
                  <FormDescription>
                    We&apos;ll never share your email with anyone else.
                  </FormDescription>
                  <FormMessage {...field} />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem
                  className="grid gap-2"
                >
                  <Label htmlFor="password">Password</Label>
                  <FormControl>
                    <Input id="password" type="password" placeholder="******" required {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">
              Login
            </Button>
          </form>
        </Form>

      </CardContent>
    </Card>
  )
}