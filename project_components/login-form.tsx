'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { useSearchParams } from 'next/navigation';
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
import { useLoading } from './loading-provider';

function SubmitButton() {
  const { pending } = useFormStatus();
  
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Anmeldung läuft...
        </>
      ) : (
        'Anmelden'
      )}
    </Button>
  );
}

export function LoginForm() {
  const searchParams = useSearchParams();
  const { setLoading, isLoading } = useLoading();
  const [error, setError] = useState<string | null>(null);

  // Check for error in URL parameters
  useEffect(() => {
    const urlError = searchParams.get('error');
    if (urlError) {
      setError(decodeURIComponent(urlError));
    }
  }, [searchParams]);

  async function handleMicrosoftLogin() {
    try {
      setLoading('microsoft-oauth', true);
      setError(null);
      
      const result = await signInWithProvider('azure');
      if (result?.error) {
        setError('Microsoft-Anmeldung fehlgeschlagen. Bitte versuchen Sie es erneut.');
      }
    } catch (err) {
      setError('Microsoft-Anmeldung fehlgeschlagen. Bitte versuchen Sie es erneut.');
    } finally {
      setLoading('microsoft-oauth', false);
    }
  }

  const isMicrosoftLoading = isLoading('microsoft-oauth');

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
        <form action={signIn} className="space-y-4">
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
          <SubmitButton />
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
              disabled={isMicrosoftLoading}
            >
              {isMicrosoftLoading ? (
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
