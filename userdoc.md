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

Tabellen sind filterbar, sortierbar, bei Spalten im Datumsformat kann mittels Kalenderwidget gefiltert werden, bei Spalten mit Personen kann nach Person gefiltert werden mittels Auswahl im Dropdown.

---

**Login-Formular**  
`project_components/login-form.tsx`  
Auf der Startseite (`/`). Zeigt das Login-Formular. Deutet die Möglichkeit and, sich über Microsoft SSO einloggen zu können. Clicken Sie auf den Microsoft button um zu den weiteren Screens zo gelangen.

---

**Angebote**  
`project_components/offers.tsx`  
Im Portal unter „Angebote“ im Hauptmenü. Zeigt die Angebotsübersicht.

---

**Angebotstabelle**  
`project_components/offers-table.tsx`  
Zeigt die Tabelle aller Angebote in der obigen Komponente.

---

**Angebotsvarianten-Versionen Dialog**  
`project_components/versions-for-offer-variant-dialog.tsx`  
Dialog zur Anzeige von Angebotsvarianten. In der Angebots-Tabelle sichtbar, wenn auf ein Angebot in der ersten Spalte geklickt wird.

---

**Angebotsversionen-Tabelle**  
`project_components/offer-versions-table.tsx`  
Tabelle mit Versionen im obigen Dialog.

---

**Angebotsdetails**  
`project_components/offer-detail.tsx`  
Klicken Sie in der Angebotstabelle auf ein Angebot in Spalte "Angebot", um die Detailansicht in einem neuen Tab zu öffnen.

---

**Artikel hinzufügen Dialog**  
`project_components/add-article-dialog.tsx`  
Dialog zum Hinzufügen eines neuen Artikels zu einem Angebot, erreichbar über entsprechende Schaltflächen in der Angebot Detailansicht.

---

**Block hinzufügen Dialog**  
`project_components/add-block-dialog.tsx`  
Dialog zum Hinzufügen eines neuen Blocks zu einem Angebot, erreichbar über entsprechende Schaltflächen in der Angebot Detailansicht.

---

**PDF-Vorschau**  
`project_components/pdf-preview.tsx`  
In der Angebots-Detailansicht, wenn eine PDF-Vorschau eines Angebots angezeigt wird.

---

**Angebotseigenschaften**  
`project_components/offer-properties.tsx`  
In der Angebots-Detailansicht sichtbar. Zeigt die Eigenschaften des gewählten Angebots.

---

**Angebotsposition (Text)**  
`project_components/offer-position-text.tsx`  
In Angebotspositionen sichtbar, wenn Textpositionen bearbeitet werden - in der Baumansicht auf eine Textposition klicken.

---

**Angebotsposition (Artikel)**  
`project_components/offer-position-article.tsx`  
In Angebotspositionen sichtbar, wenn Artikelpositionen bearbeitet werden in der Baumansicht auf eine Artikelposition klicken.

---

**Kalkulationsformular**  
`project_components/kalkulation-form.tsx`  
In Angebotspositionen sichtbar, im Tab "Kalkulation".

---

**Neues Angebot aus Vorlage Dialog**  
`project_components/new-offer-from-existing-dialog.tsx`  
Dialog zum Erstellen eines neuen Angebots aus einer bestehenden Vorlage.

---

**Verkaufschance wählen Dialog**  
`project_components/choose-sales-opportunity-dialog.tsx`  
Dialog zur Auswahl einer Verkaufschance. Erscheint wenn man "Nein" im obigen Dialog klickt.

---

**Angebot wählen Dialog**  
`project_components/choose-offer-dialog.tsx`  
Dialog zur Auswahl eines Angebots. Erscheint wenn man "Ja" im "Neues Angebot aus Vorlage Dialog" klickt.

---

**Angebot als neue Variante Dialog**  
`project_components/offer-as-new-variant-dialog.tsx`  
Dialog zum Anlegen eines neuen Angebots basierend auf Variante. Erscheint wenn man "Weiter" im obigen Dialog klickt.

---

**Angebotssprache wählen Dialog**  
`project_components/choose-offer-language-dialog.tsx`  
Dialog zur Auswahl der Angebotssprache. Erscheint wenn man "Ja" im obigen Dialog klickt.

---

**Angebotsvariante wählen Dialog**  
`project_components/choose-offer-variant-dialog.tsx`  
Dialog zur Auswahl einer Angebotsvariante. Erscheint wenn man "Nein" im "Angebot als neue Variante Dialog" Dialog klickt.

---

**Angebotsvarianten-Tabelle**  
`project_components/offer-variants-table.tsx`  
Tabelle mit Angebotsvarianten, sichtbar in Angebots-Detailansichten. Angezeigt im obigen Dialog.

---

**Überschreiben bestätigen Dialog**  
`project_components/confirm-overwrite-variant-dialog.tsx`  
Bestätigungsdialog beim Überschreiben einer Angebotsvariante. Erscheint wenn man "Erstellen" im obigen Dialog klickt.

---

**Verkaufschancen-Tabelle**  
`project_components/sale-opportunities-table.tsx`  
Im Portal unter „Verkaufschancen“ im Hauptmenü. Zeigt die Tabelle aller Verkaufschancen.

---

**Auftragsbestätigungen**  
`project_components/order-confirmations.tsx`  
Im Portal unter „Auftragsbestätigungen“ im Hauptmenü. Zeigt die Liste aller Auftragsbestätigungen.

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

**Angebotsbaum-Tab**  
`project_components/offers-tree-tab.tsx`  
Teil von Angebots-Detailansichten oder Demo-Tabs. Sichtbar, wenn Angebotsbäume angezeigt werden.

---

**Blockliste**  
`project_components/block-list-table.tsx`  
Im Portal unter „Stammdaten > Blockverwaltung“ im Hauptmenü. Zeigt die Liste aller Blöcke.

---

**Blockdetails**  
`project_components/block-detail.tsx`  
Klicken Sie in der Blockliste auf einen Block, um die Detailansicht in einem neuen Tab zu öffnen.

---

**Blockeigenschaften**  
`project_components/block-detail-properties.tsx`  
In der Block-Detailansicht sichtbar. Zeigt die Eigenschaften des gewählten Blocks.

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

**Verkaufschancen-Details**  
`project_components/sales-opportunity-detail.tsx`  
Klicken Sie in der Verkaufschancen-Tabelle auf eine Verkaufschance, um die Detailansicht zu öffnen.

---

**Verkaufschancen-Angebote**  
`project_components/sales-opportunity-offers.tsx`  
In der Detailansicht einer Verkaufschance sichtbar im Tab "Angebote. Zeigt die zugehörigen Angebote.

---

**Quill Rich-Text-Editor**  
`project_components/quill-rich-text-editor.tsx`  
Wird in Textfeldern für Artikel, Blöcke und Angebotspositionen angezeigt, z.B. in der Artikel- oder Block-Detailansicht.

---

**Hauptnavigation**  
`project_components/top-navigation.tsx`  
Immer sichtbar im oberen Bereich des Portals als Hauptnavigation.

---

**Interaktives Split-Panel**  
`project_components/interactive-split-panel.tsx`  
Wird in Angebots- und Block-Detailansichten sowie in Demos für Split-Panels verwendet.

---

**Split-Panel-Layout**  
`project_components/split-panel-layout.tsx`  
In Demo-Ansichten für Split-Panels sichtbar.

---

**Baumstruktur**  
`project_components/arborist-tree.tsx`  
In Baumansichten, z.B. Angebotsbaum oder Blockbaum, sichtbar.


---


Diese Liste beschreibt, wie Sie als Benutzer jede Komponente im UI finden oder sehen können. 
