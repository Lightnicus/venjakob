"use client";

import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import QuillRichTextEditor from './quill-rich-text-editor';
import { NodeApi } from 'react-arborist';
import { MyTreeNodeData } from './custom-node';

interface OfferPositionTextProps {
  selectedNode: NodeApi<MyTreeNodeData> | null;
  formDescriptionHtml: string | null;
  onDescriptionChange: (html: string | null) => void;
}

const OfferPositionText: React.FC<OfferPositionTextProps> = ({ selectedNode, formDescriptionHtml, onDescriptionChange }) => {
  const handleTextChange = (content: any, editor: any) => {
    if (editor && editor.root) {
      const html = editor.root.innerHTML;
      const isEmpty = html === '<p><br></p>' || html === '';
      onDescriptionChange(isEmpty ? null : html);
    }
  };

  return (
    <div className="p-6 h-full">
      <h2 className="text-xl font-medium mb-6">
        {selectedNode ? `Einstellungen für: ${selectedNode.data.name}` : 'Formular Ansicht'}
      </h2>
      <Card>
        <CardHeader>
          <CardTitle>Einstellungen</CardTitle>
          <CardDescription>
            {selectedNode
              ? `Konfigurieren Sie die Parameter für "${selectedNode.data.name}"`
              : 'Konfigurieren Sie die Parameter für den ausgewählten Knoten'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="nodeNameInput" className="text-sm font-medium">Name</label>
              <Input
                id="nodeNameInput"
                type="text"
                placeholder="Knotenname"
                value={selectedNode?.data.name || ''}
                onChange={(e) => {
                  // Name changes are not handled here in this version
                }}
                readOnly
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="nodeDescriptionEditor" className="text-sm font-medium">Beschreibung</label>
              <QuillRichTextEditor
                id="nodeDescriptionEditor"
                defaultValue={formDescriptionHtml || ''}
                onTextChange={handleTextChange}
                placeholder="Geben Sie hier eine detaillierte Beschreibung ein..."
                theme="snow"
                className="min-h-[200px] border rounded-md"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="nodeCategorySelect" className="text-sm font-medium">Kategorie</label>
              <select id="nodeCategorySelect" className="w-full p-2 border rounded-md bg-white dark:bg-gray-700 dark:text-white">
                <option>Allgemein</option>
                <option>Spezial</option>
                <option>Andere</option>
              </select>
            </div>
            <div className="pt-4">
              <Button type="button" onClick={() => alert('Speichern geklickt! Beschreibung:\n' + (formDescriptionHtml || ''))}>
                Speichern
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default OfferPositionText; 