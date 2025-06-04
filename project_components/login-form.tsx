'use client';

import type React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { signIn, signInWithProvider } from '@/lib/auth/actions';

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn(formData);
      if (result?.error) {
        setError('Ungültige E-Mail oder Passwort. Bitte versuchen Sie es erneut.');
      }
    } catch (err) {
      setError('Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleMicrosoftLogin() {
    setIsLoading(true);
    setError(null);

    try {
      const result = await signInWithProvider('azure');
      if (result?.error) {
        setError('Microsoft-Anmeldung fehlgeschlagen. Bitte versuchen Sie es erneut.');
      }
    } catch (err) {
      setError('Microsoft-Anmeldung fehlgeschlagen. Bitte versuchen Sie es erneut.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Anmelden</CardTitle>
        <CardDescription>
          Geben Sie Ihre Zugangsdaten ein, um sich einzuloggen
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-Mail</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="name@beispiel.de"
              required
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Passwort</Label>
              <a
                href="/forgot-password"
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                Passwort vergessen?
              </a>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Anmeldung läuft...
              </>
            ) : (
              'Anmelden'
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
                Oder fortfahren mit
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
              Mit Microsoft anmelden
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
