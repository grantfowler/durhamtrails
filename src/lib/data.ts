import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

const dataDir = path.join(process.cwd(), 'data');

// --- Types ---

export interface Area {
  name: string;
  slug: string;
  parents?: string[];
  type?: 'region' | 'park' | 'section' | 'access';
  description: string;
  bounds?: [number, number][];
  center?: [number, number];
  default_zoom?: number;
  operator?: string;
  history?: string;
  // Access point fields
  address?: string;
  hours?: string;
  fee?: string;
  parking_spaces?: number;
  restrooms?: boolean;
  access_type?: string;
  notes?: string;
}

export interface Segment {
  slug: string;
  name?: string;
  from: string;
  to: string;
  areas: string[];
  distance_ft?: number;
  elevation_gain_ft?: number;
  elevation_loss_ft?: number;
  surface?: string;
  difficulty?: string;
  blaze?: string;
  geometry?: string;
  source?: string;
  osm_way_ids?: number[];
}

export interface Junction {
  slug: string;
  name?: string;
  lat?: number;
  lng?: number;
  areas: string[];
  elevation_ft?: number;
  description?: string;
  visible?: boolean;
}

export interface Trail {
  name: string;
  slug: string;
  areas: string[];
  segments: string[];
  loop: boolean;
  type: 'official' | 'unofficial' | 'greenway' | 'fire-road' | 'connector';
  difficulty?: 'easy' | 'moderate' | 'difficult';
  blaze?: string;
  distance_miles?: number;
  elevation_gain_ft?: number;
  description: string;
  history?: string;
  notes?: string;
  osm_relation_id?: number;
}

export interface POI {
  name: string;
  slug: string;
  areas: string[];
  lat: number;
  lng: number;
  type: string;
  description: string;
  history?: string;
  trails?: string[];
  segment?: string;
}

// --- Loaders ---

function loadYamlDir<T>(subdir: string): T[] {
  const dir = path.join(dataDir, subdir);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.yaml') || f.endsWith('.yml'))
    .map(f => yaml.load(fs.readFileSync(path.join(dir, f), 'utf-8')) as T);
}

// Cached loaders
let _areas: Area[] | null = null;
let _trails: Trail[] | null = null;
let _segments: Segment[] | null = null;
let _junctions: Junction[] | null = null;
let _pois: POI[] | null = null;

export function getAreas(): Area[] {
  if (!_areas) _areas = loadYamlDir<Area>('areas');
  return _areas;
}

export function getTrails(): Trail[] {
  if (!_trails) _trails = loadYamlDir<Trail>('trails');
  return _trails;
}

export function getSegments(): Segment[] {
  if (!_segments) _segments = loadYamlDir<Segment>('segments');
  return _segments;
}

export function getJunctions(): Junction[] {
  if (!_junctions) _junctions = loadYamlDir<Junction>('junctions');
  return _junctions;
}

export function getPOIs(): POI[] {
  if (!_pois) _pois = loadYamlDir<POI>('pois');
  return _pois;
}

// --- Queries ---

export function getArea(slug: string): Area | undefined {
  return getAreas().find(a => a.slug === slug);
}

export function getTrail(slug: string): Trail | undefined {
  return getTrails().find(t => t.slug === slug);
}

/** Get top-level areas (no parents) */
export function getTopLevelAreas(): Area[] {
  return getAreas().filter(a => !a.parents || a.parents.length === 0);
}

/** Get child areas of a given area */
export function getChildAreas(parentSlug: string): Area[] {
  return getAreas().filter(a => a.parents?.includes(parentSlug));
}

/** Get trails belonging to an area (direct or via child areas) */
export function getTrailsForArea(areaSlug: string): Trail[] {
  const childSlugs = getChildAreas(areaSlug).map(a => a.slug);
  const allSlugs = [areaSlug, ...childSlugs];
  return getTrails().filter(t => t.areas?.some(a => allSlugs.includes(a)));
}

/** Get POIs belonging to an area */
export function getPOIsForArea(areaSlug: string): POI[] {
  const childSlugs = getChildAreas(areaSlug).map(a => a.slug);
  const allSlugs = [areaSlug, ...childSlugs];
  return getPOIs().filter(p => p.areas?.some(a => allSlugs.includes(a)));
}

/** Build breadcrumb chain for an area */
export function getBreadcrumbs(area: Area): Area[] {
  const crumbs: Area[] = [];
  let current: Area | undefined = area;
  const seen = new Set<string>();
  while (current?.parents?.[0] && !seen.has(current.parents[0])) {
    seen.add(current.parents[0]);
    current = getArea(current.parents[0]);
    if (current) crumbs.unshift(current);
  }
  return crumbs;
}

/** Get segments for a trail */
export function getSegmentsForTrail(trail: Trail): Segment[] {
  const allSegments = getSegments();
  return (trail.segments || [])
    .map(slug => allSegments.find(s => s.slug === slug))
    .filter((s): s is Segment => !!s);
}

/** Get non-access areas only */
export function getTrailAreas(): Area[] {
  return getAreas().filter(a => a.type !== 'access');
}

/** Get access points for an area */
export function getAccessPoints(areaSlug: string): Area[] {
  return getChildAreas(areaSlug).filter(a => a.type === 'access');
}
