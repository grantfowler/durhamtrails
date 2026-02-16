import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

const dataDir = path.join(process.cwd(), 'data');

export interface Area {
  name: string;
  slug: string;
  description: string;
  bounds: [number, number][];
  center: [number, number];
  defaultZoom: number;
  operator: string;
  subareas?: Subarea[];
}

export interface Subarea {
  name: string;
  slug: string;
  description: string;
  bounds?: [number, number][];
  trailheads?: Trailhead[];
}

export interface Trailhead {
  name: string;
  lat: number;
  lng: number;
  parking: boolean;
  notes?: string;
}

export interface Trail {
  name: string;
  slug: string;
  area: string;
  subarea?: string;
  type: 'official' | 'unofficial' | 'greenway' | 'fire-road' | 'connector';
  difficulty?: 'easy' | 'moderate' | 'difficult';
  blaze?: string;
  distance_miles: number;
  elevation_gain_ft?: number;
  loop: boolean;
  description: string;
  history?: string;
  notes?: string;
  connections?: { trail: string; at: string }[];
  gpx?: string;
  osmRelationId?: number;
  osmWayIds?: number[];
}

export interface POI {
  name: string;
  slug: string;
  area: string;
  subarea?: string;
  lat: number;
  lng: number;
  type: 'trailhead' | 'historic' | 'natural' | 'bridge' | 'campsite' | 'overlook' | 'ruins';
  description: string;
  history?: string;
  trails?: string[];
}

function loadYamlDir<T>(subdir: string): T[] {
  const dir = path.join(dataDir, subdir);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.yaml') || f.endsWith('.yml'))
    .map(f => yaml.load(fs.readFileSync(path.join(dir, f), 'utf-8')) as T);
}

export function getAreas(): Area[] {
  return loadYamlDir<Area>('areas');
}

export function getTrails(): Trail[] {
  return loadYamlDir<Trail>('trails');
}

export function getPOIs(): POI[] {
  return loadYamlDir<POI>('pois');
}

export function getArea(slug: string): Area | undefined {
  return getAreas().find(a => a.slug === slug);
}

export function getTrailsForArea(areaSlug: string): Trail[] {
  return getTrails().filter(t => t.area === areaSlug);
}

export function getPOIsForArea(areaSlug: string): POI[] {
  return getPOIs().filter(p => p.area === areaSlug);
}

export function getTrail(slug: string): Trail | undefined {
  return getTrails().find(t => t.slug === slug);
}
