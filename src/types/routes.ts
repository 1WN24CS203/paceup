import { LatLngPoint } from './activity';

export interface RouteElevationPoint {
  distanceKm: number;
  elevationM: number;
}

export interface JoggingRoute {
  id: string;
  title: string;
  description: string;
  locationName: string;
  distanceKm: number;
  estimatedDurationMin: number;
  elevationGainM: number;
  difficulty: 'easy' | 'moderate' | 'hard' | 'challenging';
  surface: 'paved' | 'trail' | 'track' | 'mixed';
  rating: number;
  runCount: number;
  creatorName: string;
  isCurated: boolean;
  isFavorite: boolean;
  personalBestSec?: number;
  waypoints: LatLngPoint[];
  elevationProfile: RouteElevationPoint[];
  highlights: string[];
}

