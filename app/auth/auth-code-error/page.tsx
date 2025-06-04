import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function AuthCodeError() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle>Anmeldung fehlgeschlagen</CardTitle>
            <CardDescription>
              Es gab ein Problem bei der Anmeldung. Bitte versuchen Sie es erneut.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Der Authentifizierungscode ist ungültig oder abgelaufen. Dies kann passieren, wenn:
            </p>
            <ul className="list-disc space-y-1 pl-5 text-sm text-gray-600">
              <li>Der Link zu alt ist</li>
              <li>Der Link bereits verwendet wurde</li>
              <li>Ein Problem mit dem Authentication-Provider aufgetreten ist</li>
            </ul>
            <div className="pt-4">
              <Button asChild className="w-full">
                <Link href="/">Zurück zur Anmeldung</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 