"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { loginUser, registerUser, requestPasswordReset } from "@/app/_actions/auth"

export function LoginForm() {
  const router = useRouter()
  const [loginData, setLoginData] = useState({ email: "", password: "" })
  const [registerData, setRegisterData] = useState({ name: "", email: "", password: "", confirmPassword: "" })
  const [loginError, setLoginError] = useState("")
  const [registerError, setRegisterError] = useState("")
  const [registerSuccess, setRegisterSuccess] = useState(false)
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("")
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState(false)
  const [forgotPasswordError, setForgotPasswordError] = useState("")
  const [forgotPasswordDialogOpen, setForgotPasswordDialogOpen] = useState(false)

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setLoginData((prev) => ({ ...prev, [name]: value }))
  }

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setRegisterData((prev) => ({ ...prev, [name]: value }))
  }

  const clearErrors = () => {
    setLoginError("")
    setRegisterError("")
    setForgotPasswordError("")
  }

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearErrors()

    if (!loginData.email || !loginData.password) {
      setLoginError("Bitte geben Sie E-Mail und Passwort ein")
      return
    }

    const result = await loginUser(loginData.email, loginData.password)
    
    if (result.success) {
      router.push("/dashboard")
    } else {
      setLoginError(result.error || "Ungültige E-Mail oder Passwort")
    }
  }

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearErrors()
    setRegisterSuccess(false)

    if (!registerData.name || !registerData.email || !registerData.password || !registerData.confirmPassword) {
      setRegisterError("Bitte füllen Sie alle Felder aus")
      return
    }

    if (registerData.password !== registerData.confirmPassword) {
      setRegisterError("Die Passwörter stimmen nicht überein")
      return
    }

    const result = await registerUser(
      registerData.name, 
      registerData.email, 
      registerData.password
    )
    
    if (result.success) {
      setRegisterSuccess(true)
      setRegisterData({ name: "", email: "", password: "", confirmPassword: "" })
    } else {
      setRegisterError(result.error || "Registrierung fehlgeschlagen")
    }
  }

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearErrors()
    setForgotPasswordSuccess(false)

    if (!forgotPasswordEmail) {
      setForgotPasswordError("Bitte geben Sie Ihre E-Mail-Adresse ein")
      return
    }

    const result = await requestPasswordReset(forgotPasswordEmail)
    
    if (result.success) {
      setForgotPasswordSuccess(true)
      
      // Clear the form after 3 seconds and close the dialog
      setTimeout(() => {
        setForgotPasswordEmail("")
        setForgotPasswordSuccess(false)
        setForgotPasswordDialogOpen(false)
      }, 3000)
    } else {
      setForgotPasswordError(result.error || "Anfrage zum Zurücksetzen des Passworts fehlgeschlagen")
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-4">
        <Card className="w-full">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">B2B Angebotsportal</CardTitle>
            <CardDescription className="text-center">Geben Sie Ihre Anmeldedaten ein, sich einzuloggen</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Anmelden</TabsTrigger>
                <TabsTrigger value="register">Registrieren</TabsTrigger>
              </TabsList>
              <TabsContent value="login">
                <form onSubmit={handleLoginSubmit} className="space-y-4 mt-4">
                  {loginError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Fehler</AlertTitle>
                      <AlertDescription>{loginError}</AlertDescription>
                    </Alert>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="email">E-Mail</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="m.mustermann@beispiel.de"
                      value={loginData.email}
                      onChange={handleLoginChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Passwort</Label>
                      <Dialog open={forgotPasswordDialogOpen} onOpenChange={setForgotPasswordDialogOpen}>
                        <DialogTrigger asChild>
                          <Button variant="link" className="px-0 text-sm font-medium text-primary">
                            Passwort vergessen?
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>Passwort zurücksetzen</DialogTitle>
                            <DialogDescription>
                              Geben Sie Ihre E-Mail-Adresse ein und wir senden Ihnen einen Link zum Zurücksetzen Ihres Passworts.
                            </DialogDescription>
                          </DialogHeader>
                          <form onSubmit={handleForgotPasswordSubmit} className="space-y-4 py-4">
                            {forgotPasswordError && (
                              <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Fehler</AlertTitle>
                                <AlertDescription>{forgotPasswordError}</AlertDescription>
                              </Alert>
                            )}
                            {forgotPasswordSuccess && (
                              <Alert className="border-green-500 text-green-700">
                                <CheckCircle2 className="h-4 w-4" />
                                <AlertTitle>Erfolg</AlertTitle>
                                <AlertDescription>
                                  Anweisungen zum Zurücksetzen des Passworts wurden an Ihre E-Mail gesendet.
                                </AlertDescription>
                              </Alert>
                            )}
                            <div className="space-y-2">
                              <Label htmlFor="reset-email">E-Mail</Label>
                              <Input
                                id="reset-email"
                                type="email"
                                placeholder="m.mustermann@beispiel.de"
                                value={forgotPasswordEmail}
                                onChange={(e) => setForgotPasswordEmail(e.target.value)}
                                required
                              />
                            </div>
                            <DialogFooter className="sm:justify-between mt-4">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => setForgotPasswordDialogOpen(false)}
                              >
                                Abbrechen
                              </Button>
                              <Button type="submit">Link senden</Button>
                            </DialogFooter>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </div>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={loginData.password}
                      onChange={handleLoginChange}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Anmelden
                  </Button>
                </form>
              </TabsContent>
              <TabsContent value="register">
                <form onSubmit={handleRegisterSubmit} className="space-y-4 mt-4">
                  {registerError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Fehler</AlertTitle>
                      <AlertDescription>{registerError}</AlertDescription>
                    </Alert>
                  )}
                  {registerSuccess && (
                    <Alert className="border-green-500 text-green-700">
                      <CheckCircle2 className="h-4 w-4" />
                      <AlertTitle>Erfolg</AlertTitle>
                      <AlertDescription>
                        Registrierung erfolgreich! Sie können sich jetzt mit Ihren Anmeldedaten einloggen.
                      </AlertDescription>
                    </Alert>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="name">Vollständiger Name</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Max Mustermann"
                      value={registerData.name}
                      onChange={handleRegisterChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-email">E-Mail</Label>
                    <Input
                      id="register-email"
                      name="email"
                      type="email"
                      placeholder="m.mustermann@beispiel.de"
                      value={registerData.email}
                      onChange={handleRegisterChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Passwort</Label>
                    <Input
                      id="register-password"
                      name="password"
                      type="password"
                      value={registerData.password}
                      onChange={handleRegisterChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Passwort bestätigen</Label>
                    <Input
                      id="confirm-password"
                      name="confirmPassword"
                      type="password"
                      value={registerData.confirmPassword}
                      onChange={handleRegisterChange}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Registrieren
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <div className="text-xs text-center text-gray-500">
              © {new Date().getFullYear()} B2B Angebotsportal. Alle Rechte vorbehalten.
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
