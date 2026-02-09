"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"

const MIGRATION_SQL = `-- Migration: Update artwork categories to new 6-category system

-- Step 1: Update artworks with old categories to new categories
UPDATE artworks
SET category = CASE
  WHEN category = 'Maleri' THEN 'Maleri'
  WHEN category = 'Tegning' THEN 'Tegning'
  WHEN category = 'Grafik' THEN 'Grafik & Kunsttryk'
  WHEN category = 'Collage' THEN 'Maleri'
  WHEN category = 'Fotografi' THEN 'Fotografi'
  WHEN category = 'Skulptur' THEN 'Skulptur & Keramik'
  WHEN category = 'Installation / Væginstallation' THEN 'Skulptur & Keramik'
  WHEN category = 'Tekstilkunst' THEN 'Skulptur & Keramik'
  WHEN category = 'Mural / Vægmaleri' THEN 'Maleri'
  WHEN category = 'Digital kunst' THEN 'Digital Kunst'
  WHEN category = 'Generativ kunst' THEN 'Digital Kunst'
  WHEN category = 'Mixed Media' THEN 'Maleri'
  WHEN category = 'Abstrakt' THEN 'Maleri'
  WHEN category = 'Custom kunst' THEN 'Maleri'
  WHEN category = 'Andet' THEN 'Maleri'
  ELSE 'Maleri'
END
WHERE category IS NOT NULL;

-- Step 2: Set default category for artworks without a category
UPDATE artworks
SET category = 'Maleri'
WHERE category IS NULL;

-- Step 3: Add a check constraint to ensure only valid categories are used
ALTER TABLE artworks
DROP CONSTRAINT IF EXISTS artworks_category_check;

ALTER TABLE artworks
ADD CONSTRAINT artworks_category_check
CHECK (category IN (
  'Maleri',
  'Skulptur & Keramik',
  'Grafik & Kunsttryk',
  'Fotografi',
  'Digital Kunst',
  'Tegning'
));

-- Step 4: Make category required (NOT NULL)
ALTER TABLE artworks
ALTER COLUMN category SET NOT NULL;

-- Step 5: Update the category index to improve query performance
DROP INDEX IF EXISTS idx_artworks_category;
CREATE INDEX idx_artworks_category ON artworks(category);

-- Step 6: Add comment to document the new category system
COMMENT ON COLUMN artworks.category IS 'Main artwork category - must be one of: Maleri, Skulptur & Keramik, Grafik & Kunsttryk, Fotografi, Digital Kunst, Tegning';
COMMENT ON COLUMN artworks.tags IS 'Art types and other tags - art types should correspond to the selected category';`

// Note: This page is intentionally not protected to allow easy migration access
export default function MigrateCategoriesPage() {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = () => {
    navigator.clipboard.writeText(MIGRATION_SQL)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href="/admin" className="text-2xl font-bold">
            Admin
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Migrer Kategorier</CardTitle>
            <CardDescription>
              Opdater alle kunstværker til det nye 6-kategori system
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <h3 className="font-semibold">Nye kategorier:</h3>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                <li>Maleri</li>
                <li>Skulptur & Keramik</li>
                <li>Grafik & Kunsttryk</li>
                <li>Fotografi</li>
                <li>Digital Kunst</li>
                <li>Tegning</li>
              </ul>
            </div>

            <Alert>
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-semibold">Sådan kører du migrationen:</p>
                  <ol className="list-decimal list-inside text-sm space-y-1 ml-2">
                    <li>Gå til din Supabase dashboard</li>
                    <li>Vælg "SQL Editor" i menuen</li>
                    <li>Kopier SQL-koden nedenfor</li>
                    <li>Indsæt den i SQL Editor</li>
                    <li>Klik "Run" for at udføre migrationen</li>
                  </ol>
                </div>
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Migration SQL:</h3>
                <Button
                  onClick={copyToClipboard}
                  variant="outline"
                  size="sm"
                >
                  {copied ? "Kopieret!" : "Kopier SQL"}
                </Button>
              </div>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-xs">
                <code>{MIGRATION_SQL}</code>
              </pre>
            </div>

            <Alert>
              <AlertDescription className="text-sm">
                <strong>Bemærk:</strong> Denne migration vil:
                <ul className="list-disc list-inside mt-2 space-y-1 ml-2">
                  <li>Opdatere alle eksisterende kunstværker til de nye kategorier</li>
                  <li>Tilføje en database constraint for at sikre kun gyldige kategorier</li>
                  <li>Gøre category-feltet påkrævet (NOT NULL)</li>
                  <li>Oprette et index for bedre performance</li>
                </ul>
              </AlertDescription>
            </Alert>

            <div className="pt-4 border-t">
              <p className="text-sm text-gray-600">
                Alternativt kan du finde migration-filen i:{" "}
                <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                  supabase/migrations/migrate_to_new_categories.sql
                </code>
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
