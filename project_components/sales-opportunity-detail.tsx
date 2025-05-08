'use client';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building, FileText, MapPin, Phone, Globe } from 'lucide-react';
import SalesOpportunityOffers, { SalesOpportunityOffer } from './sales-opportunity-offers';
import salesOpportunityOffersData from '../data/sales-opportunity-offers.json';

export type SalesOpportunityDetailData = {
  title: string;
  customer: {
    id: string;
    name: string;
    address: string[];
    phone: string;
    casLink: string;
  };
  orderConfirmation: string | null;
  info: {
    vertriebsverantwortung: string;
    geschaeftsbereich: string;
    casId: string;
    casStichwort: string;
    casKurzbeschreibung: string;
    liefertermin: string;
  };
  recipient: {
    anrede: string;
    name: string;
    nachname: string;
    telefon: string;
    email: string;
  };
};

type Props = {
  data: SalesOpportunityDetailData;
};

export function SalesOpportunityDetail({ data }: Props) {
  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">{data.title}</h1>
        <div className="mt-2">
          <Button variant="outline" className="flex items-center gap-2 text-sm">
            <FileText className="h-4 w-4" />
            Neues Angebot erstellen
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="allgemein">
        <TabsList className="bg-transparent p-0">
          <TabsTrigger
            value="allgemein"
            className="rounded-t-md rounded-b-none border border-b-0 border-gray-300 bg-gray-200 px-4 py-2 data-[state=active]:bg-gray-200 data-[state=inactive]:bg-white"
          >
            Allgemein
          </TabsTrigger>
          <TabsTrigger
            value="angebote"
            className="rounded-t-md rounded-b-none border border-b-0 border-gray-300 bg-white px-4 py-2 data-[state=active]:bg-gray-200"
          >
            Angebote
          </TabsTrigger>
        </TabsList>

        <TabsContent value="allgemein" className="mt-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Customer Panel */}
            <Card className="border border-gray-300 shadow-none">
              <CardHeader className="border-b ">
                <CardTitle className="text-base">Kunde</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <Building className="mt-0.5 h-5 w-5 flex-shrink-0 text-gray-500" />
                    <div>
                      <p className="font-medium">
                        {data.customer.id} - {data.customer.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-5 w-5 flex-shrink-0 text-gray-500" />
                    <div>
                      {data.customer.address.map((line, i) => (
                        <p key={i}>{line}</p>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Phone className="mt-0.5 h-5 w-5 flex-shrink-0 text-gray-500" />
                    <div>
                      <p>Tel.: {data.customer.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Globe className="mt-0.5 h-5 w-5 flex-shrink-0 text-gray-500" />
                    <div>
                      <a
                        href={data.customer.casLink}
                        className="text-blue-600 hover:underline"
                      >
                        CAS-Link
                      </a>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Confirmation Panel */}
            <Card className="border border-gray-300 shadow-none">
              <CardHeader className="border-b ">
                <CardTitle className="text-base">Auftragsbestätigung</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <p>{data.orderConfirmation || 'Keine AB vorhanden'}</p>
              </CardContent>
            </Card>

            {/* Information Panel */}
            <Card className="border border-gray-300 shadow-none">
              <CardHeader className="border-b ">
                <CardTitle className="text-base">Informationen</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full">
                  <tbody>
                    <tr className="border-b">
                      <td className="p-3 font-medium">
                        Vertriebsverantwortung
                      </td>
                      <td className="p-3">
                        {data.info.vertriebsverantwortung}
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-3 font-medium">Geschäftsbereich</td>
                      <td className="p-3">{data.info.geschaeftsbereich}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-3 font-medium">CAS ID</td>
                      <td className="p-3">{data.info.casId}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-3 font-medium">CAS Stichwort</td>
                      <td className="p-3">{data.info.casStichwort}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-3 font-medium">CAS Kurzbeschreibung</td>
                      <td className="p-3">{data.info.casKurzbeschreibung}</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium">Liefertermin</td>
                      <td className="p-3">{data.info.liefertermin}</td>
                    </tr>
                  </tbody>
                </table>
              </CardContent>
            </Card>

            {/* Offer Recipient Panel */}
            <Card className="border border-gray-300 shadow-none">
              <CardHeader className="border-b ">
                <CardTitle className="text-base">Angebotsempfänger</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full">
                  <tbody>
                    <tr className="border-b">
                      <td className="p-3 font-medium">Anrede</td>
                      <td className="p-3">{data.recipient.anrede}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-3 font-medium">Name</td>
                      <td className="p-3">{data.recipient.name}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-3 font-medium">Nachname</td>
                      <td className="p-3">{data.recipient.nachname}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-3 font-medium">Telefon</td>
                      <td className="p-3">{data.recipient.telefon}</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium">E-Mail</td>
                      <td className="p-3">{data.recipient.email}</td>
                    </tr>
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="angebote">
          <div className="mt-4">
            <SalesOpportunityOffers data={salesOpportunityOffersData as SalesOpportunityOffer[]} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
