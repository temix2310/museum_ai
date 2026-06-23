export interface Painting {
  id: string;
  title: string;
  artist: string;
  artist_id: string;
  year: number;
  story: string;
}

export interface ScanResult {
  painting_id: string;
  title: string;
  artist: string;
  artist_id: string;
  year: number;
  story: string;
  audio_url: string;
  artist_photo_url: string;
}

export interface RecentScan {
  painting_id: string;
  title: string;
  artist: string;
  artist_id: string;
  year: number;
  timestamp: number; // Время сканирования
}
