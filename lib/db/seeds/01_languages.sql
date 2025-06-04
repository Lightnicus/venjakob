-- Seed initial language data
INSERT INTO "languages" ("value", "label") VALUES 
  ('de', 'Deutsch'),
  ('en', 'Englisch'),
  ('fr', 'Französisch'),
  ('es', 'Spanisch')
ON CONFLICT ("value") DO NOTHING; 