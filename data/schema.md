# Durham Trails Data Schema

All trail data lives in YAML files under `data/`. No database needed.

## Core Concepts

The data model has **five object types**, all flat files with cross-references:

- **Areas** — Places (parks, sections, access points). Tree structure via `parents`.
- **Segments** — Atomic path sections between two junctions. The building blocks.
- **Junctions** — Where segments meet. Named intersection points.
- **Trails** — Named routes composed of ordered segments. What hikers know.
- **POIs** — Points of interest along trails.

**The key idea:** Segments are edges, junctions are nodes. Trails are named paths
through the graph. This means:
- Two trails sharing a section reference the **same segments**
- A custom "Trail A + B + C loop" is just a trail composed of existing segments
- Area maps render all segments belonging to trails in that area
- Distances are computed from segment geometry, not hand-entered

## Directory Structure

```
data/
├── schema.md
├── areas/
│   ├── eno-river.yaml
│   ├── cox-mountain.yaml           # parents: [eno-river]
│   ├── cole-mill-parking.yaml      # parents: [cole-mill], type: access
│   └── ...
├── segments/                       # Atomic path sections
│   ├── cox-mtn-ridge-01.yaml
│   └── ...
├── geometry/                       # GeoJSON linestrings (one per segment)
│   ├── cox-mtn-ridge-01.geojson
│   └── ...
├── junctions/                      # Intersection points
│   ├── cox-mtn-buckquarter-jct.yaml
│   └── ...
├── trails/                         # Named routes (ordered segment lists)
│   ├── cox-mountain-trail.yaml
│   └── ...
└── pois/
    ├── holden-mill-ruins.yaml
    └── ...
```

## Area Schema

Areas are flat — hierarchy comes from `parents`. Supports arbitrary depth
and **multiple parent relationships**:

- `All > Eno River > Cox Mountain`
- `All > Falls Lake > MST > Red Mill Road Area`

An area along the Eno that's also part of Falls Lake would have
`parents: [eno-river, falls-lake]`. **First parent = default breadcrumb.**

Areas can also be **access points** (type: access) with address, hours, fees, etc.

```yaml
name: string                    # Display name
slug: string                    # URL-safe identifier (matches filename)
parents: [string]               # Parent area slugs. First = default breadcrumb. Omit for top-level.
type: enum                      # region | park | section | access (default: section)
description: string             # Brief overview
bounds:                         # Map bounding box [sw, ne] (optional)
  - [lat, lng]
  - [lat, lng]
center: [lat, lng]              # Default map center
default_zoom: number            # Default zoom level (optional)
operator: string                # Managing entity (optional)
history: string                 # Optional deeper history

# Access point fields (only when type: access)
address: string                 # Street address
hours: string                   # Gate hours, e.g. "8am–sunset" or "24/7"
fee: string                     # Parking fee info, e.g. "Free" or "$6/vehicle"
parking_spaces: number          # Approximate capacity (optional)
restrooms: boolean              # Has restrooms? (optional)
access_type: enum               # parking | trailhead | boat-launch | roadside
notes: string                   # Seasonal closures, gate codes, overflow tips
```

## Segment Schema

Segments are the **atomic building blocks** of all trail geometry. A segment runs
between exactly two junctions (or a junction and a dead end). Segments have no
inherent direction — trails define the order.

```yaml
slug: string                    # Unique identifier (matches filename)
from: string                    # Junction slug (start node)
to: string                      # Junction slug (end node)
areas: [string]                 # Area slugs (inherited from trails, but explicit for querying)

# Physical properties
distance_ft: number             # Length in feet (computed from geometry, cached)
elevation_gain_ft: number       # Net gain from→to (optional)
elevation_loss_ft: number       # Net loss from→to (optional)
surface: enum                   # singletrack | doubletrack | paved | gravel | boardwalk | rock
difficulty: enum                # easy | moderate | difficult
blaze: string                   # Trail blaze color/shape if any

# Geometry
geometry: string                # Filename in geometry/ dir (GeoJSON LineString)

# Source
osm_way_ids: [number]          # OSM way IDs this segment was derived from (optional)
source: enum                    # osm | gpx | manual (how geometry was obtained)
```

## Junction Schema

Junctions are **named intersection points** where segments meet. They're the nodes
in the trail graph. A junction with only one segment is a trailhead or dead end.

```yaml
slug: string                    # Unique identifier (matches filename)
name: string                    # Human-readable name, e.g. "Cox Mountain / Buckquarter Creek Junction"
lat: number
lng: number
areas: [string]                 # Area slugs
elevation_ft: number            # Elevation at junction (optional)
description: string             # Optional, e.g. "Sign post marks the split. Bear left for Cox Mountain summit."
```

## Trail Schema

Trails are **named routes** — what hikers think of as "a trail." A trail is an
ordered list of segments. The same segment can appear in multiple trails.

A loop combining parts of Trail A, B, and C is itself a trail — just one whose
segments happen to also belong to other trails. It gets its own page and its own map.

```yaml
name: string                    # Display name
slug: string                    # URL-safe identifier (matches filename)
areas: [string]                 # Area slugs this trail belongs to

# Route definition
segments: [string]              # Ordered list of segment slugs
loop: boolean                   # Does the last segment connect back to the first?

# Classification
type: enum                      # official | unofficial | greenway | fire-road | connector
difficulty: enum                # Overall difficulty (may differ from individual segments)
blaze: string                   # Trail blaze color/shape, if any

# Computed stats (cached, derived from segments)
distance_miles: number          # Total distance (sum of segment distances)
elevation_gain_ft: number       # Total elevation gain

# Content
description: string             # What to expect on this trail
history: string                 # Optional deeper history notes
notes: string                   # Optional current conditions, tips

# Legacy / source
osm_relation_id: number         # OSM relation ID if available (optional)
```

## POI Schema

POIs are tagged to areas and optionally to specific trails/segments.

```yaml
name: string
slug: string
areas: [string]                 # Area slugs
lat: number
lng: number

type: enum                      # historic | natural | bridge | campsite | overlook | ruins | water | sign
description: string
history: string                 # Optional

# Location context
trails: [string]                # Trail slugs this POI is on/near (optional)
segment: string                 # Specific segment slug (optional, for precise placement)
```

## Enums

### Trail Types

| Type | Description | Map Style |
|------|-------------|-----------|
| `official` | Maintained, blazed, on park maps | Solid line |
| `unofficial` | Social trails, well-worn but unmaintained | Dashed line |
| `greenway` | Paved multi-use paths | Thick solid line |
| `fire-road` | Wide unpaved roads (Duke Forest) | Dotted line |
| `connector` | Links between trail systems | Thin dashed line |

### Segment Surfaces

| Surface | Description |
|---------|-------------|
| `singletrack` | Narrow dirt path |
| `doubletrack` | Wide dirt/grass path |
| `paved` | Asphalt or concrete |
| `gravel` | Crushed stone |
| `boardwalk` | Wooden boardwalk |
| `rock` | Rocky terrain, scrambles |

### POI Types

| Type | Description | Icon |
|------|-------------|------|
| `historic` | Ruins, old mills, dams, railroad grades | 🏛️ |
| `natural` | Waterfalls, notable trees, geological features | 🌿 |
| `bridge` | River crossings, boardwalks | 🌉 |
| `campsite` | Backcountry campsites | ⛺ |
| `overlook` | Scenic viewpoints | 👁️ |
| `ruins` | Structural remains | 🧱 |
| `water` | Water source, swimming hole | 💧 |
| `sign` | Trail sign, kiosk, information board | 📋 |

### Area Types

| Type | Description |
|------|-------------|
| `region` | Top-level geographic area (e.g. Eno River) |
| `park` | Managed park or preserve |
| `section` | Sub-area within a park (default) |
| `access` | Parking lot, trailhead, boat launch |

## Geometry Files

Segment geometry lives in separate GeoJSON files to keep YAML clean and enable
direct rendering by map libraries.

```json
// geometry/cox-mtn-ridge-01.geojson
{
  "type": "Feature",
  "geometry": {
    "type": "LineString",
    "coordinates": [
      [-79.0034, 36.0612],
      [-79.0031, 36.0615],
      ...
    ]
  },
  "properties": {
    "segment": "cox-mtn-ridge-01"
  }
}
```

**Coordinate order:** GeoJSON standard is `[longitude, latitude]`.

## How Things Connect

```
Area (parents: [area...])
  └── has trails → Trail (areas: [area...])
                     └── composed of → Segment (from/to: junction)
                                         └── geometry → GeoJSON file
                     └── passes through → Junction
  └── has POIs → POI (areas: [area...], trails: [trail...])
  └── has children → Area (parents: [this-area])
```

**Rendering an area map:** Collect all trails in the area → collect all their segments → render all geometry + junctions.

**Building a custom loop:** Pick segments from multiple trails → create a new trail YAML → distances auto-computed.

**Finding connections:** Two trails connect if they share a junction (i.e., they have segments with the same from/to junction slug).
