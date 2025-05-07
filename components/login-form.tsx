'use client';

import type React from 'react';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // In a real application, you would call your authentication API here
      // For example: await signIn('credentials', { email, password })

      // Simulate authentication delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Redirect to dashboard after successful login
      router.push('/dashboard');
    } catch (err) {
      setError('Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleMicrosoftLogin() {
    setIsLoading(true);
    setError(null);

    try {
      // In a real application, you would initiate the Microsoft OAuth flow
      // For example: await signIn('azure-ad')

      // Simulate authentication delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Redirect to dashboard after successful login
      router.push('/dashboard');
    } catch (err) {
      setError('Microsoft login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
        <CardDescription>
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <a
                href="/forgot-password"
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                Forgot password?
              </a>
            </div>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign in'
            )}
          </Button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">
                Or continue with
              </span>
            </div>
          </div>

          <div className="mt-6">
            <Button
              variant="outline"
              type="button"
              className="w-full"
              onClick={handleMicrosoftLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <svg
                  className="mr-2 h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M11.4 2H2V11.4H11.4V2Z" fill="#F25022" />
                  <path d="M11.4 12.6H2V22H11.4V12.6Z" fill="#00A4EF" />
                  <path d="M22 2H12.6V11.4H22V2Z" fill="#7FBA00" />
                  <path d="M22 12.6H12.6V22H22V12.6Z" fill="#FFB900" />
                </svg>
              )}
              Sign in with Microsoft
            </Button>
          </div>
        </div>
      </CardContent>
      {/*<CardFooter className="flex justify-center">*/}
      {/*  <p className="text-sm text-gray-600">*/}
      {/*    Don't have an account?{" "}*/}
      {/*    <a href="/register" className="font-medium text-blue-600 hover:text-blue-500">*/}
      {/*      Sign up*/}
      {/*    </a>*/}
      {/*  </p>*/}
      {/*</CardFooter>*/}
    </Card>
  );
}
