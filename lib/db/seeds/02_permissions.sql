-- Seed initial permissions data
INSERT INTO "permissions" ("name", "description", "resource") VALUES 
  ('admin', 'Vollständige Administratorrechte für das System', 'admin'),
  ('artikelverwaltung', 'Berechtigung zur Verwaltung von Artikeln', 'artikel'),
  ('blockverwaltung', 'Berechtigung zur Verwaltung von Blöcken', 'blocks'),
  ('angebote', 'Berechtigung zur Verwaltung von Angeboten', 'angebote')
ON CONFLICT ("name") DO NOTHING; 