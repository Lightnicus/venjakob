import { TooltipSettings } from "@/components/tooltip-settings"

export default function SettingsPage() {
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Einstellungen</h1>

      <div className="grid gap-8">
        <section>
          <h2 className="text-xl font-semibold mb-4">Benutzeroberfläche</h2>
          <TooltipSettings />
        </section>
      </div>
    </div>
  )
}
