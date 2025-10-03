'use client';

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from "@/components/(shared)/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/(shared)/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/(shared)/ui/form";
import { Input } from "@/components/(shared)/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/(shared)/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { ComingSoonBadge } from "@/components/(shared)/ui/coming-soon-badge";
import { loginSchema, signupSchema, type LoginFormData, type SignupFormData } from "@/lib/auth/schemas";

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState("login");
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  const redirectTo = searchParams.get('redirect') || '/dashboard';

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const signupForm = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
    },
  });

  const onLoginSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: data.email, password: data.password }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to login');
      }

      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      });
      router.push(redirectTo);
      router.refresh();
    } catch (error: unknown) {
      toast({
        title: "Login failed",
        description: (error instanceof Error ? error.message : "Invalid credentials"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSignupSubmit = async (data: SignupFormData) => {
    try {
      setIsLoading(true);
      const { confirmPassword, ...signupData } = data;
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(signupData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create account');
      }

      toast({
        title: "Account created!",
        description: "Please check your email and click the verification link to activate your account.",
      });
      setActiveTab("login");
      signupForm.reset();
    } catch (error: unknown) {
      toast({
        title: "Signup failed",
        description: (error instanceof Error ? error.message : "Failed to create account"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen hero-gradient flex items-center justify-center pt-16">
      <div className="w-full max-w-md p-4">
        <Card className="shadow-2xl border border-gray-100 rounded-2xl overflow-hidden" style={{ backgroundColor: '#ffffff' }}>
          <CardHeader className="text-center pb-4 pt-8">
            <CardTitle className="text-3xl font-bold mb-1">
              {activeTab === "login" ? (
                <>
                  <span className="hero-gradient-text">Welcome to </span>
                  <span className="bg-gradient-to-br from-[#ff7033] via-orange-500 to-purple-600 bg-clip-text text-transparent inline-block">Strive</span>
                </>
              ) : (
                <>
                  <span className="hero-gradient-text">Ready to </span>
                  <span className="bg-gradient-to-br from-[#ff7033] via-orange-500 to-purple-600 bg-clip-text text-transparent inline-block">Strive</span>
                  <span className="hero-gradient-text">?</span>
                </>
              )}
            </CardTitle>
            <div className="flex justify-center mt-2 mb-2">
              <ComingSoonBadge size="md" variant="hero" />
            </div>
            <CardDescription className="text-gray-600">
              {activeTab === "login"
                ? "Sign in to your account to access your dashboard"
                : "Join us and watch your business thrive"
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger
                  value="login"
                  data-testid="tab-login"
                  className="data-[state=active]:bg-[#ff7033] data-[state=active]:text-white"
                >
                  Login
                </TabsTrigger>
                <TabsTrigger
                  value="signup"
                  data-testid="tab-signup"
                  className="data-[state=active]:bg-[#ff7033] data-[state=active]:text-white"
                >
                  Sign Up
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-4 min-h-[280px]">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel style={{ color: '#1e3a8a' }}>Email</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="Enter your email address"
                              data-testid="input-login-email"
                              style={{ backgroundColor: '#ffffff', color: '#020a1c', borderColor: '#ff7033' }}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel style={{ color: '#1e3a8a' }}>Password</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Enter your password"
                              data-testid="input-login-password"
                              style={{ backgroundColor: '#ffffff', color: '#020a1c', borderColor: '#ff7033' }}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      className="w-full relative overflow-hidden group transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/15 before:to-transparent before:-translate-x-full hover:before:translate-x-full before:transition-transform before:duration-500"
                      disabled={isLoading}
                      data-testid="button-submit-login"
                    >
                      {isLoading ? "Signing in..." : "Sign In"}
                    </Button>
                    <div className="text-center">
                      <a href="#" className="text-sm text-primary hover:underline">
                        Forgot Password?
                      </a>
                    </div>
                  </form>
                </Form>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4 min-h-[450px]">
                <Form {...signupForm}>
                  <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={signupForm.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel style={{ color: '#1e3a8a' }}>First Name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="John"
                                data-testid="input-signup-first-name"
                                style={{ backgroundColor: '#ffffff', color: '#020a1c', borderColor: '#ff7033' }}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={signupForm.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel style={{ color: '#1e3a8a' }}>Last Name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Doe"
                                data-testid="input-signup-last-name"
                                style={{ backgroundColor: '#ffffff', color: '#020a1c', borderColor: '#ff7033' }}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={signupForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel style={{ color: '#1e3a8a' }}>Username</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Choose a username"
                              data-testid="input-signup-username"
                              style={{ backgroundColor: '#ffffff', color: '#020a1c', borderColor: '#ff7033' }}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={signupForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel style={{ color: '#1e3a8a' }}>Email</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="Enter your email address"
                              data-testid="input-signup-email"
                              style={{ backgroundColor: '#ffffff', color: '#020a1c', borderColor: '#ff7033' }}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={signupForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel style={{ color: '#1e3a8a' }}>Password</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Create a password"
                              data-testid="input-signup-password"
                              style={{ backgroundColor: '#ffffff', color: '#020a1c', borderColor: '#ff7033' }}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={signupForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel style={{ color: '#1e3a8a' }}>Confirm Password</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Confirm your password"
                              data-testid="input-signup-confirm-password"
                              style={{ backgroundColor: '#ffffff', color: '#020a1c', borderColor: '#ff7033' }}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      className="w-full relative overflow-hidden group transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/15 before:to-transparent before:-translate-x-full hover:before:translate-x-full before:transition-transform before:duration-500"
                      disabled={isLoading}
                      data-testid="button-submit-signup"
                    >
                      {isLoading ? "Creating account..." : "Create Account"}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}