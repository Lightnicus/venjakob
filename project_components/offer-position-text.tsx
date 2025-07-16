"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PlateRichTextEditor from "./plate-rich-text-editor";
import { NodeApi } from 'react-arborist';
import { MyTreeNodeData } from './custom-node';

interface OfferPositionTextProps {
  selectedNode: NodeApi<MyTreeNodeData> | null;
  formDescriptionHtml: string | undefined;
  onDescriptionChange: (html: string | undefined) => void;
  isEditing: boolean;
}

const OfferPositionText: React.FC<OfferPositionTextProps> = ({ selectedNode, formDescriptionHtml, onDescriptionChange, isEditing }) => {
  const [title, setTitle] = useState(selectedNode?.data?.title || "");

  // Update state when selectedNode changes
  React.useEffect(() => {
    if (selectedNode) {
      setTitle(selectedNode.data.title || "");
    }
  }, [selectedNode]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value);
  const handleDescriptionChange = (_: any, editor: any) => {
    if (editor && editor.root && onDescriptionChange) {
      const html = editor.root.innerHTML;
      const cleanHtml = html === "<p><br></p>" ? "" : html;
      onDescriptionChange(cleanHtml);
    }
  };

  return (
    <div className="p-6 h-full">
      <Tabs defaultValue="eingabe" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="eingabe">Eingabe</TabsTrigger>
          <TabsTrigger value="vorschau">Vorschau</TabsTrigger>
        </TabsList>
        <TabsContent value="eingabe" className="mt-6">
          <form className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="input-ueberschrift" className="text-sm font-medium">Überschrift</label>
              <Input
                id="input-ueberschrift"
                type="text"
                placeholder="Überschrift eingeben"
                value={title}
                onChange={handleTitleChange}
                className="w-full"
                aria-label="Überschrift"
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="editor-beschreibung" className="text-sm font-medium">Beschreibung</label>
              <PlateRichTextEditor
                id="editor-beschreibung"
                defaultValue={formDescriptionHtml || ''}
                onTextChange={handleDescriptionChange}
                placeholder="Geben Sie hier eine detaillierte Beschreibung ein..."
                className="min-h-[200px]"
                readOnly={!isEditing}
              />
            </div>
          </form>
        </TabsContent>
        <TabsContent value="vorschau" className="mt-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">{title || "(Keine Überschrift)"}</h2>
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: formDescriptionHtml || "<em>(Keine Beschreibung)</em>" }} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OfferPositionText; 