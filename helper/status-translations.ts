export const salesOpportunityStatusTranslations: Record<string, string> = {
  'open': 'Offen',
  'in_progress': 'In Bearbeitung',
  'won': 'Gewonnen',
  'lost': 'Verloren',
  'cancelled': 'Storniert',
};

export const translateSalesOpportunityStatus = (status: string): string => {
  return salesOpportunityStatusTranslations[status] || status;
}; 