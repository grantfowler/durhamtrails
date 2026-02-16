# Durham Trails Data Schema

All trail data lives in YAML files under `data/`. No database needed.

## Directory Structure

```
data/
├── schema.md          # This file
├── areas/             # Top-level trail areas
│   ├── eno-river.yaml
│   ├── new-hope-creek.yaml
│   ├── duke-forest.yaml
│   ├── durham-greenways.yaml
│   ├── occoneechee.yaml
│   └── falls-lake.yaml
├── trails/            # Individual trail files
│   ├── cox-mountain-trail.yaml
│   ├── buckquarter-creek-trail.yaml
│   └── ...
└── pois/              # Points of interest
    ├── fews-ford.yaml
    └── ...
```

## Area Schema

```yaml
name: string                    # Display name
slug: string                    # URL-safe identifier (matches filename)
description: string             # Brief overview
bounds:                         # Map bounding box [sw, ne]
  - [lat, lng]
  - [lat, lng]
center: [lat, lng]              # Default map center
defaultZoom: number             # Default zoom level
operator: string                # Managing entity (NC State Parks, Duke University, etc.)

subareas:                       # Optional subdivisions
  - name: string
    slug: string
    description: string
    bounds: [[lat, lng], [lat, lng]]  # Optional, for map highlighting
    trailheads:                 # Parking/access points for this sub-area
      - name: string
        lat: number
        lng: number
        parking: boolean
        notes: string           # "End of Cole Mill Rd, loop parking lot"
```

## Trail Schema

```yaml
name: string                    # Display name
slug: string                    # URL-safe identifier (matches filename)
area: string                    # Area slug (e.g., "eno-river")
subarea: string                 # Optional sub-area slug (e.g., "cox-mountain")

# Classification
type: enum                      # official | unofficial | greenway | fire-road | connector
difficulty: enum                # easy | moderate | difficult
blaze: string                   # Trail blaze color/shape, if any

# Stats
distance_miles: number
elevation_gain_ft: number       # Optional
loop: boolean                   # true = loop, false = out-and-back or point-to-point

# Content
description: string             # What to expect on this trail
history: string                 # Optional deeper history notes
notes: string                   # Optional current conditions, tips

# Connections to other trails
connections:
  - trail: string               # Slug of connected trail
    at: string                  # Description of junction point

# Geo data
gpx: string                     # Path to GPX file (optional, for trails not in OSM)
osmRelationId: number           # OSM relation ID if available (for pulling geometry)
osmWayIds: [number]             # OSM way IDs if no relation exists
```

## POI Schema

```yaml
name: string
slug: string
area: string                    # Area slug
subarea: string                 # Optional
lat: number
lng: number

type: enum                      # trailhead | historic | natural | bridge | campsite | overlook | ruins
description: string
history: string                 # Optional

# Which trails this POI is on/near
trails: [string]                # Trail slugs
```

## Trail Types

| Type | Description | Map Style |
|------|-------------|-----------|
| `official` | Maintained, blazed, on park maps | Solid line |
| `unofficial` | Social trails, well-worn but unmaintained | Dashed line |
| `greenway` | Paved multi-use paths | Thick solid line |
| `fire-road` | Wide unpaved roads (Duke Forest) | Dotted line |
| `connector` | Links between trail systems | Thin dashed line |

## POI Types

| Type | Description | Icon |
|------|-------------|------|
| `trailhead` | Parking/access point | 🅿️ |
| `historic` | Ruins, old mills, dams, railroad grades | 🏛️ |
| `natural` | Overlooks, waterfalls, notable features | 🌿 |
| `bridge` | River crossings, boardwalks | 🌉 |
| `campsite` | Backcountry campsites | ⛺ |
| `overlook` | Scenic viewpoints | 👁️ |
| `ruins` | Structural remains | 🧱 |
