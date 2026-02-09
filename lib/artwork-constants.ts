// New artwork category system with 6 main categories
export const ARTWORK_CATEGORIES = [
  "Maleri",
  "Skulptur & Keramik",
  "Grafik & Kunsttryk",
  "Fotografi",
  "Digital Kunst",
  "Tegning"
] as const

export type ArtworkCategory = typeof ARTWORK_CATEGORIES[number]

// Art types organized by category - these are used as tags
export const CATEGORY_ART_TYPES: Record<ArtworkCategory, readonly string[]> = {
  "Maleri": [
    "Abstrakt maleri",
    "Figurativt maleri",
    "Mixed media",
    "Collage",
    "Akryl",
    "Olie",
    "Moderne maleri",
    "Minimalistisk maleri"
  ],
  "Skulptur & Keramik": [
    "Skulpturer",
    "Keramik",
    "Stentøj",
    "Bronzeskulpturer",
    "Glas",
    "Installationer"
  ],
  "Grafik & Kunsttryk": [
    "Litografi",
    "Serigrafi",
    "Giclée",
    "Kunsttryk",
    "Plakater",
    "Grafiske værker"
  ],
  "Fotografi": [
    "Kunstfotografi",
    "Sort/hvid foto",
    "Farvefoto",
    "Naturfoto",
    "Arkitekturfoto"
  ],
  "Digital Kunst": [
    "Digital illustration",
    "Digitalt maleri",
    "AI-genereret kunst",
    "Grafiske digitale værker"
  ],
  "Tegning": [
    "Blyant",
    "Tusch",
    "Kul",
    "Pastel",
    "Akvarel"
  ]
} as const

// Get all available art types for a specific category
export function getArtTypesForCategory(category: ArtworkCategory): readonly string[] {
  return CATEGORY_ART_TYPES[category] || []
}

// Get all art types across all categories (for migration purposes)
export function getAllArtTypes(): string[] {
  return Object.values(CATEGORY_ART_TYPES).flat()
}

// Style options (kept for backward compatibility, but not used in new system)
export const ARTWORK_STYLES = [
  "Impressionisme",
  "Realisme",
  "Ekspressionisme",
  "Abstrakt",
  "Surrealisme",
  "Kubisme",
  "Minimalisme",
  "Pop art",
  "Moderne",
  "Klassisk"
] as const

export type ArtworkStyle = typeof ARTWORK_STYLES[number]

// Color options
export const ARTWORK_COLORS = [
  { name: "Rød", value: "red" },
  { name: "Blå", value: "blue" },
  { name: "Grøn", value: "green" },
  { name: "Gul", value: "yellow" },
  { name: "Orange", value: "orange" },
  { name: "Lilla", value: "purple" },
  { name: "Pink", value: "pink" },
  { name: "Sort", value: "black" },
  { name: "Hvid", value: "white" },
  { name: "Brun", value: "brown" },
] as const

// Dimension field configurations based on artwork category
export interface DimensionField {
  name: string
  label: string
  type: 'number' | 'text' | 'checkbox'
  unit?: string
  required?: boolean
  placeholder?: string
  min?: number
  step?: number
}

export const DIMENSION_CONFIGS: Record<string, DimensionField[]> = {
  // Maleri - 2D artwork
  "Maleri": [
    { name: "width_cm", label: "Bredde", type: "number", unit: "cm", required: true, min: 0, step: 0.1 },
    { name: "height_cm", label: "Højde", type: "number", unit: "cm", required: true, min: 0, step: 0.1 },
    { name: "depth_cm", label: "Dybde (valgfri)", type: "number", unit: "cm", required: false, min: 0, step: 0.1 }
  ],
  
  // Skulptur & Keramik - 3D artwork
  "Skulptur & Keramik": [
    { name: "height_cm", label: "Højde", type: "number", unit: "cm", required: true, min: 0, step: 0.1 },
    { name: "width_cm", label: "Bredde", type: "number", unit: "cm", required: true, min: 0, step: 0.1 },
    { name: "depth_cm", label: "Dybde", type: "number", unit: "cm", required: true, min: 0, step: 0.1 },
    { name: "weight_kg", label: "Vægt", type: "number", unit: "kg", required: true, min: 0, step: 0.1 }
  ],
  
  // Grafik & Kunsttryk - 2D artwork
  "Grafik & Kunsttryk": [
    { name: "width_cm", label: "Bredde", type: "number", unit: "cm", required: true, min: 0, step: 0.1 },
    { name: "height_cm", label: "Højde", type: "number", unit: "cm", required: true, min: 0, step: 0.1 },
    { name: "depth_cm", label: "Dybde (valgfri)", type: "number", unit: "cm", required: false, min: 0, step: 0.1 }
  ],
  
  // Fotografi - 2D artwork
  "Fotografi": [
    { name: "width_cm", label: "Bredde", type: "number", unit: "cm", required: true, min: 0, step: 0.1 },
    { name: "height_cm", label: "Højde", type: "number", unit: "cm", required: true, min: 0, step: 0.1 },
    { name: "depth_cm", label: "Dybde (valgfri)", type: "number", unit: "cm", required: false, min: 0, step: 0.1 }
  ],
  
  // Digital Kunst - digital dimensions
  "Digital Kunst": [
    { name: "pixel_dimensions", label: "Pixel dimensioner", type: "text", required: true, placeholder: "fx 4000x3000 px" },
    { name: "aspect_ratio", label: "Aspect ratio", type: "text", required: true, placeholder: "fx 16:9 eller 4:3" },
    { name: "file_format", label: "Filformat", type: "text", required: true, placeholder: "fx PNG, JPEG, TIFF" }
  ],
  
  // Tegning - 2D artwork
  "Tegning": [
    { name: "width_cm", label: "Bredde", type: "number", unit: "cm", required: true, min: 0, step: 0.1 },
    { name: "height_cm", label: "Højde", type: "number", unit: "cm", required: true, min: 0, step: 0.1 },
    { name: "depth_cm", label: "Dybde (valgfri)", type: "number", unit: "cm", required: false, min: 0, step: 0.1 }
  ]
}

// Helper function to get dimension fields for a category
export function getDimensionFields(category: string): DimensionField[] {
  return DIMENSION_CONFIGS[category] || []
}

// Map old categories to new categories for migration
export const OLD_TO_NEW_CATEGORY_MAP: Record<string, ArtworkCategory> = {
  // Old categories -> New categories
  "Maleri": "Maleri",
  "Tegning": "Tegning",
  "Grafik": "Grafik & Kunsttryk",
  "Collage": "Maleri",
  "Fotografi": "Fotografi",
  "Skulptur": "Skulptur & Keramik",
  "Installation / Væginstallation": "Skulptur & Keramik",
  "Tekstilkunst": "Skulptur & Keramik",
  "Mural / Vægmaleri": "Maleri",
  "Digital kunst": "Digital Kunst",
  "Generativ kunst": "Digital Kunst",
  "Mixed Media": "Maleri",
  "Abstrakt": "Maleri",
  "Custom kunst": "Maleri",
  "Andet": "Maleri"
}
