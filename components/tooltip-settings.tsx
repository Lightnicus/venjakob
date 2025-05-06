"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { tooltipConfig } from "@/config/tooltip"
import { useToast } from "@/lib/hooks/use-toast"

export function TooltipSettings() {
  const { toast } = useToast()
  const [delayDuration, setDelayDuration] = useState(tooltipConfig.delayDuration)
  const [skipDelayDuration, setSkipDelayDuration] = useState(tooltipConfig.skipDelayDuration)

  const handleSave = () => {
    // In einer echten Anwendung würden wir diese Werte in einer Datenbank oder im localStorage speichern
    // Hier simulieren wir nur die Speicherung
    tooltipConfig.delayDuration = delayDuration
    tooltipConfig.skipDelayDuration = skipDelayDuration

    toast({
      title: "Einstellungen gespeichert",
      description: "Die Tooltip-Verzögerungen wurden aktualisiert.",
    })
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Tooltip-Einstellungen</CardTitle>
        <CardDescription>Passen Sie die Verzögerung an, mit der Tooltips angezeigt werden.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="delay-duration">Anzeigeverzögerung</Label>
            <span className="text-sm text-muted-foreground">{delayDuration}ms</span>
          </div>
          <Slider
            id="delay-duration"
            min={0}
            max={1000}
            step={50}
            value={[delayDuration]}
            onValueChange={(value) => setDelayDuration(value[0])}
          />
          <p className="text-xs text-muted-foreground">Die Zeit in Millisekunden, bevor ein Tooltip angezeigt wird.</p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="skip-delay-duration">Wechselverzögerung</Label>
            <span className="text-sm text-muted-foreground">{skipDelayDuration}ms</span>
          </div>
          <Slider
            id="skip-delay-duration"
            min={0}
            max={1000}
            step={50}
            value={[skipDelayDuration]}
            onValueChange={(value) => setSkipDelayDuration(value[0])}
          />
          <p className="text-xs text-muted-foreground">
            Die Zeit in Millisekunden, wenn der Benutzer zwischen Tooltip-Triggern wechselt.
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSave}>Speichern</Button>
      </CardFooter>
    </Card>
  )
}
