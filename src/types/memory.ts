export interface Memory {
    id: string;
    title: string;
    date: string;              // "YYYY-MM-DD"
    description?: string;
    photos: string[];
  
    location?: string;         // ← NEW : libellé libre
    coords?: { lat: number; lng: number };   // ← NEW : géocodé (Nominatim)
  }
  