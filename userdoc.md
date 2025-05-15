# Projektspezifische Komponenten Dokumentation

Hier ist eine Liste aller projektspezifischen Komponenten, deren Pfade und wie Sie diese als Benutzer sehen können:

### Verwendete Technologien und Module

Dieses Projekt basiert auf modernen Webtechnologien und Modulen:

- **Next.js** (React-Framework für SSR/SSG)
- **React** (UI-Bibliothek)
- **TypeScript** (statische Typisierung)
- **TailwindCSS** (Utility-First CSS Framework)
- **Shadcn/UI** (moderne UI-Komponenten)
- **Radix UI** (zugängliche UI-Primitives, z.B. Navigation, Dialoge, Tabs)
- **Quill** (Rich-Text-Editor)
- **React Arborist** (Baum-Komponenten)
- **React PDF & @react-pdf/renderer** (PDF-Rendering)
- **date-fns** (Datumshandling)
- **Lucide React** (Icons)
- **TanStack React Table** (Tabellen)
- **ESLint, Prettier** (Code-Qualität und Formatierung)
- **PostCSS, Autoprefixer** (CSS-Verarbeitung)

---

**Login-Formular**  
`project_components/login-form.tsx`  
Auf der Startseite (`/`). Zeigt das Login-Formular. Deutet die Möglichkeit and, sich über Microsoft SSO einloggen zu können. Clicken Sie auf den Microsoft button um zu den weiteren Screens zo gelangen.

---

**Artikelliste**  
`project_components/article-list-table.tsx`  
Im Portal unter „Stammdaten > Artikelverwaltung“ im Hauptmenü. Zeigt die Liste aller Artikel.

---

**Artikeldetails**  
`project_components/article-detail.tsx`  
Klicken Sie in der Artikelliste auf einen Artikel, um die Detailansicht in einem neuen Tab zu öffnen.

---

**Artikeleigenschaften**  
`project_components/article-properties.tsx`  
In der Artikel-Detailansicht sichtbar. Zeigt die Eigenschaften des gewählten Artikels.

---

**Blockdetails**  
`project_components/block-detail.tsx`  
Klicken Sie in der Blockliste auf einen Block, um die Detailansicht in einem neuen Tab zu öffnen.

---

**Blockeigenschaften**  
`project_components/block-detail-properties.tsx`  
In der Block-Detailansicht sichtbar. Zeigt die Eigenschaften des gewählten Blocks.

---

**Quill Rich-Text-Editor**  
`project_components/quill-rich-text-editor.tsx`  
Wird in Textfeldern für Artikel, Blöcke und Angebotspositionen angezeigt, z.B. in der Artikel- oder Block-Detailansicht.

---

**Blockliste**  
`project_components/block-list-table.tsx`  
Im Portal unter „Stammdaten > Blockverwaltung“ im Hauptmenü. Zeigt die Liste aller Blöcke.

---

**Verkaufschancen-Tabelle**  
`project_components/sale-opportunities-table.tsx`  
Im Portal unter „Verkaufschancen“ im Hauptmenü. Zeigt die Tabelle aller Verkaufschancen.

---

**Auftragsbestätigungen**  
`project_components/order-confirmations.tsx`  
Im Portal unter „Auftragsbestätigungen“ im Hauptmenü. Zeigt die Liste aller Auftragsbestätigungen.

---

**Angebotstabelle**  
`project_components/offers-table.tsx`  
Im Portal unter „Angebote“ im Hauptmenü. Zeigt die Tabelle aller Angebote.

---

**Angebotsbaum-Tab**  
`project_components/offers-tree-tab.tsx`  
Teil von Angebots-Detailansichten oder Demo-Tabs. Sichtbar, wenn Angebotsbäume angezeigt werden.

---

**Hauptnavigation**  
`project_components/top-navigation.tsx`  
Immer sichtbar im oberen Bereich des Portals als Hauptnavigation.

---

**Interaktives Split-Panel**  
`project_components/interactive-split-panel.tsx`  
Wird in Angebots- und Block-Detailansichten sowie in Demos für Split-Panels verwendet.

---

**Artikel hinzufügen Dialog**  
`project_components/add-article-dialog.tsx`  
Dialog zum Hinzufügen eines neuen Artikels, erreichbar über entsprechende Schaltflächen in der Artikelverwaltung.

---

**Block hinzufügen Dialog**  
`project_components/add-block-dialog.tsx`  
Dialog zum Hinzufügen eines neuen Blocks, erreichbar über entsprechende Schaltflächen in der Blockverwaltung.

---

**Angebotsdetails**  
`project_components/offer-detail.tsx`  
Klicken Sie in der Angebotstabelle auf ein Angebot, um die Detailansicht in einem neuen Tab zu öffnen.

---

**Angebotsversionen-Tabelle**  
`project_components/offer-versions-table.tsx`  
In der Angebots-Detailansicht sichtbar, wenn Versionen eines Angebots angezeigt werden.

---

**PDF-Vorschau**  
`project_components/pdf-preview.tsx`  
In der Angebots-Detailansicht, wenn eine PDF-Vorschau eines Angebots angezeigt wird.

---

**Angebotseigenschaften**  
`project_components/offer-properties.tsx`  
In der Angebots-Detailansicht sichtbar. Zeigt die Eigenschaften des gewählten Angebots.

---

**Kalkulationsformular**  
`project_components/kalkulation-form.tsx`  
In Angebotspositionen sichtbar, wenn Kalkulationsdaten bearbeitet werden.

---

**Angebotsposition (Text)**  
`project_components/offer-position-text.tsx`  
In Angebotspositionen sichtbar, wenn Textpositionen bearbeitet werden.

---

**Angebotsposition (Artikel)**  
`project_components/offer-position-article.tsx`  
In Angebotspositionen sichtbar, wenn Artikelpositionen bearbeitet werden.

---

**Benutzerdefinierter Knoten**  
`project_components/custom-node.tsx`  
Teil von Baumstrukturen, z.B. in Angebotsbäumen oder Blockbäumen.

---

**Split-Panel-Layout**  
`project_components/split-panel-layout.tsx`  
In Demo-Ansichten für Split-Panels sichtbar.

---

**Baumstruktur**  
`project_components/arborist-tree.tsx`  
In Baumansichten, z.B. Angebotsbaum oder Blockbaum, sichtbar.

---

**Angebote**  
`project_components/offers.tsx`  
Im Portal unter „Angebote“ im Hauptmenü. Zeigt die Angebotsübersicht.

---

**Angebotsvarianten-Versionen Dialog**  
`project_components/versions-for-offer-variant-dialog.tsx`  
Dialog zur Auswahl von Angebotsvarianten, erscheint beim Arbeiten mit Varianten.

---

**Überschreiben bestätigen Dialog**  
`project_components/confirm-overwrite-variant-dialog.tsx`  
Bestätigungsdialog beim Überschreiben einer Angebotsvariante.

---

**Angebotsvariante wählen Dialog**  
`project_components/choose-offer-variant-dialog.tsx`  
Dialog zur Auswahl einer Angebotsvariante.

---

**Angebotsvarianten-Tabelle**  
`project_components/offer-variants-table.tsx`  
Tabelle mit Angebotsvarianten, sichtbar in Angebots-Detailansichten.

---

**Angebotssprache wählen Dialog**  
`project_components/choose-offer-language-dialog.tsx`  
Dialog zur Auswahl der Angebotssprache.

---

**Angebot als neue Variante Dialog**  
`project_components/offer-as-new-variant-dialog.tsx`  
Dialog zum Anlegen einer neuen Angebotsvariante.

---

**Angebot wählen Dialog**  
`project_components/choose-offer-dialog.tsx`  
Dialog zur Auswahl eines Angebots.

---

**Verkaufschance wählen Dialog**  
`project_components/choose-sales-opportunity-dialog.tsx`  
Dialog zur Auswahl einer Verkaufschance.

---

**Tabbed-Interface-Provider**  
`project_components/tabbed-interface-provider.tsx`  
Technische Komponente, die das Tab-System im Portal bereitstellt (nicht direkt sichtbar).

---

**Tabbed-Interface**  
`project_components/tabbed-interface.tsx`  
Im Portal unter `/portal` sichtbar. Zeigt die geöffneten Tabs und deren Inhalte.

---

**Einstellungen Platzhalter**  
`project_components/einstellungen-placeholder.tsx`  
Im Portal unter „Einstellungen“ im Hauptmenü sichtbar (Platzhalteransicht).

---

**Stammdaten Platzhalter**  
`project_components/stammdaten-placeholder.tsx`  
Im Portal unter „Stammdaten“ im Hauptmenü sichtbar (Platzhalteransicht).

---

**Neues Angebot aus Vorlage Dialog**  
`project_components/new-offer-from-existing-dialog.tsx`  
Dialog zum Erstellen eines neuen Angebots aus einer bestehenden Vorlage.

---

**Verkaufschancen-Details**  
`project_components/sales-opportunity-detail.tsx`  
Klicken Sie in der Verkaufschancen-Tabelle auf eine Verkaufschance, um die Detailansicht zu öffnen.

---

**Verkaufschancen-Angebote**  
`project_components/sales-opportunity-offers.tsx`  
In der Detailansicht einer Verkaufschance sichtbar. Zeigt die zugehörigen Angebote.

---


Diese Liste beschreibt, wie Sie als Benutzer jede Komponente im UI finden oder sehen können. 