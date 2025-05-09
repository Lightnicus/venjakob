"use client";

import React, { useState } from 'react';
import SplitPanelLayout from '../project_components/split-panel-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const SplitPanelDemo = () => {
  const [customContent, setCustomContent] = useState<boolean>(false);
  const [contentType, setContentType] = useState<'text' | 'chart' | 'form'>('text');

  // Sample custom content for the right panel
  const getCustomContent = () => {
    switch (contentType) {
      case 'chart':
        return (
          <div className="p-6 h-full">
            <h2 className="text-xl font-medium mb-6">Diagramm Ansicht</h2>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md h-[400px] flex items-center justify-center">
              <div className="w-full h-[300px] bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 rounded-md relative">
                <div className="absolute bottom-0 left-0 w-1/4 h-[60%] bg-blue-500 rounded-t-md ml-[10%]"></div>
                <div className="absolute bottom-0 left-[30%] w-1/4 h-[40%] bg-green-500 rounded-t-md ml-[5%]"></div>
                <div className="absolute bottom-0 left-[60%] w-1/4 h-[80%] bg-purple-500 rounded-t-md ml-[0%]"></div>
                <div className="absolute top-5 left-0 w-full text-center text-gray-700 dark:text-gray-200 font-medium">
                  Beispiel-Diagramm
                </div>
              </div>
            </div>
          </div>
        );
      case 'form':
        return (
          <div className="p-6 h-full">
            <h2 className="text-xl font-medium mb-6">Formular Ansicht</h2>
            <Card>
              <CardHeader>
                <CardTitle>Einstellungen</CardTitle>
                <CardDescription>
                  Konfigurieren Sie die Parameter für den ausgewählten Knoten.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Name</label>
                    <input 
                      type="text" 
                      className="w-full p-2 border rounded-md" 
                      placeholder="Knotenname"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Beschreibung</label>
                    <textarea 
                      className="w-full p-2 border rounded-md" 
                      rows={3}
                      placeholder="Beschreibung des Knotens"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Kategorie</label>
                    <select className="w-full p-2 border rounded-md">
                      <option>Allgemein</option>
                      <option>Spezial</option>
                      <option>Andere</option>
                    </select>
                  </div>
                  <div className="pt-4">
                    <Button type="button">Speichern</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        );
      default:
        return (
          <div className="p-6 h-full">
            <h2 className="text-xl font-medium mb-6">Text Ansicht</h2>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
              <h3 className="text-lg font-medium mb-3">Ausgewählter Knoten: Beispiel</h3>
              <p className="mb-4">
                Dies ist ein Beispieltext für einen ausgewählten Knoten aus dem Baum auf der linken Seite.
                In einer realen Anwendung würden hier detaillierte Informationen über den ausgewählten Eintrag angezeigt.
              </p>
              <p className="mb-4">
                Jeder Knoten im Baum kann verschiedene Eigenschaften haben, die in diesem Panel angezeigt werden können.
                Sie könnten beispielsweise die Struktur des Knotens, zugehörige Metadaten oder andere relevante Informationen sehen.
              </p>
              <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-md">
                <pre className="text-sm">
                  {`{
  "id": "beispiel-id",
  "name": "Beispielknoten",
  "type": "leaf",
  "metadata": {
    "created": "2023-01-15",
    "modified": "2023-06-22",
    "version": "1.0.4"
  }
}`}
                </pre>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Split Panel Demo</h1>
        <div className="space-x-2">
          <Button 
            variant={customContent ? "default" : "outline"} 
            onClick={() => setCustomContent(!customContent)}
          >
            {customContent ? "Benutzerdefinierter Inhalt" : "Standard Platzhalter"}
          </Button>
        </div>
      </div>

      {customContent && (
        <div className="flex space-x-2 mb-4">
          <Button 
            variant={contentType === 'text' ? "default" : "outline"} 
            onClick={() => setContentType('text')}
          >
            Text
          </Button>
          <Button 
            variant={contentType === 'chart' ? "default" : "outline"} 
            onClick={() => setContentType('chart')}
          >
            Diagramm
          </Button>
          <Button 
            variant={contentType === 'form' ? "default" : "outline"} 
            onClick={() => setContentType('form')}
          >
            Formular
          </Button>
        </div>
      )}

      <div className="h-[800px] border rounded">
        <SplitPanelLayout 
          rightPanelContent={customContent ? getCustomContent() : undefined} 
        />
      </div>
    </div>
  );
};

export default SplitPanelDemo; 