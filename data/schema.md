# Durham Trails Data Schema

All trail data lives in YAML files under `data/`. No database needed.

## Directory Structure

```
data/
├── schema.md              # This file
├── areas/                 # All areas (flat, with optional parent)
│   ├── eno-river.yaml
│   ├── cox-mountain.yaml       # parent: eno-river
│   ├── cole-mill.yaml          # parent: eno-river
│   ├── duke-forest.yaml
│   ├── korstian.yaml           # parent: duke-forest
│   └── ...
├── trails/                # Individual trail files
│   ├── cox-mountain-trail.yaml
│   └── ...
└── pois/                  # Points of interest
    ├── fews-ford.yaml
    └── ...
```

## Area Schema

Areas are flat — hierarchy comes from the `parent` field. This allows arbitrary depth:
`All > Falls Lake > MST > Red Mill Road Area > ...`

Each area gets its own page, its own history, its own map view.

Areas can also represent **access points** (parking lots, trailheads, boat launches).
An access point is just an area with `type: access` and extra fields for address,
hours, fees, etc. This means "Cole Mill Road Parking" is a child of "Cole Mill"
with its own page, map pin, and linked trails.

```yaml
name: string                    # Display name
slug: string                    # URL-safe identifier (matches filename)
parent: string                  # Optional. Slug of parent area. Null/omitted = top-level.
type: enum                      # region | park | section | access (default: section)
description: string             # Brief overview
bounds:                         # Map bounding box [sw, ne] (not needed for access points)
  - [lat, lng]
  - [lat, lng]
center: [lat, lng]              # Default map center (or location for access points)
defaultZoom: number             # Default zoom level
operator: string                # Managing entity (optional)
history: string                 # Optional deeper history

# Access point fields (only when type: access)
address: string                 # Street address
hours: string                   # Gate hours, e.g. "8am–sunset" or "24/7"
fee: string                     # Parking fee info, e.g. "Free" or "$6/vehicle"
parking_spaces: number          # Approximate capacity (optional)
restrooms: boolean              # Has restrooms?
access_type: enum               # parking | trailhead | boat-launch | roadside
notes: string                   # Seasonal closures, gate codes, overflow tips
```

## Trail Schema

Trails are tagged to one or more areas (not just one). A trail that crosses
area boundaries belongs to all of them.

```yaml
name: string                    # Display name
slug: string                    # URL-safe identifier (matches filename)
areas: [string]                 # Area slugs this trail belongs to (one or more)

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
osmRelationId: number           # OSM relation ID if available
osmWayIds: [number]             # OSM way IDs if no relation exists
```

## POI Schema

POIs are also tagged to one or more areas.

```yaml
name: string
slug: string
areas: [string]                 # Area slugs this POI belongs to (one or more)
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
