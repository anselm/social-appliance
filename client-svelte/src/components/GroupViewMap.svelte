<script lang="ts">
  import type { Entity } from '../types'
  import EntityHeader from './EntityHeader.svelte'
  import { navigateTo } from '../utils/navigation'
  import { config } from '../stores/appConfig'
  import { api } from '../services/api'

  let { entity }: { entity: Entity } = $props()

  let mapContainer = $state<HTMLDivElement | undefined>()
  let map: any = null
  let mapReady = $state(false)
  let initError = $state<string | null>(null)
  let hasInitialized = $state(false)
  let children = $state<Entity[]>([])
  let loading = $state(true)

  // Filter state
  let activeFilters = $state<Set<string>>(new Set(['post', 'party', 'group', 'place', 'event']))
  
  // Pull-up drawer state
  type DrawerMode = 'minimized' | 'places' | 'preview'
  let drawerMode = $state<DrawerMode>('minimized')
  let selectedMarker = $state<Entity | null>(null)
  
  // Filter children that have location data
  let locatedChildren = $derived(children.filter(child => 
    child.latitude != null && child.longitude != null && activeFilters.has(child.type)
  ))

  // Get map provider from config
  let mapProvider = $derived($config.map?.provider || 'mapbox')
  let mapboxToken = $derived($config.map?.mapboxAccessToken || import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || '')

  // Track markers and circles for updates
  let markers: any[] = []
  let circles: any[] = []

  // Load children when component mounts
  $effect(() => {
    loadChildren()
  })

  async function loadChildren() {
    loading = true
    try {
      const childrenData = await api.queryEntities({ 
        parentId: entity.id,
        limit: 100 
      })
      
      children = (childrenData || []).sort((a, b) => {
        const dateA = new Date(a.updatedAt).getTime()
        const dateB = new Date(b.updatedAt).getTime()
        return dateB - dateA
      })
    } catch (error) {
      console.error('Failed to load children:', error)
      children = []
    } finally {
      loading = false
    }
  }

  $effect(() => {
    if (!mapContainer || hasInitialized) {
      return
    }

    hasInitialized = true

    if (mapProvider === 'mapbox') {
      initMapbox()
    } else {
      initLeaflet()
    }

    return () => {
      if (map) {
        map.remove()
        map = null
      }
      markers = []
      circles = []
      delete (window as any).handleMarkerClick
    }
  })

  // Update markers when filters change
  $effect(() => {
    if (mapReady && map) {
      updateMarkers()
    }
  })

  function toggleFilter(type: string) {
    if (activeFilters.has(type)) {
      activeFilters.delete(type)
    } else {
      activeFilters.add(type)
    }
    activeFilters = new Set(activeFilters) // Trigger reactivity
  }

  function getFilterButtonClass(filterType: string): string {
    const isActive = activeFilters.has(filterType)
    const baseClasses = "px-2 py-1 text-xs rounded transition-colors"
    
    if (isActive) {
      return `${baseClasses} bg-white/20 text-white`
    } else {
      return `${baseClasses} bg-white/5 text-white/40`
    }
  }

  function updateMarkers() {
    // Remove existing markers and circles
    if (mapProvider === 'mapbox') {
      markers.forEach(marker => marker.remove())
      circles.forEach(circleId => {
        if (map.getLayer(circleId)) {
          map.removeLayer(circleId)
        }
        if (map.getSource(circleId)) {
          map.removeSource(circleId)
        }
      })
    } else {
      markers.forEach(marker => map.removeLayer(marker))
      circles.forEach(circle => map.removeLayer(circle))
    }
    markers = []
    circles = []

    // Add filtered markers
    addMarkers()
  }

  function addMarkers() {
    if (mapProvider === 'mapbox') {
      addMapboxMarkers()
    } else {
      addLeafletMarkers()
    }
  }

  function handleMarkerSelect(child: Entity) {
    selectedMarker = child
    drawerMode = 'preview'
  }

  function handleDrawerBarClick() {
    if (drawerMode === 'minimized') {
      drawerMode = 'places'
    } else if (drawerMode === 'places') {
      drawerMode = 'minimized'
    } else if (drawerMode === 'preview') {
      drawerMode = 'places'
    }
  }

  function handlePlaceCardClick(child: Entity) {
    selectedMarker = child
    drawerMode = 'preview'
  }

  function addMapboxMarkers() {
    // @ts-ignore
    const mapboxgl = window.mapboxgl

    locatedChildren.forEach((child, index) => {
      if (child.latitude == null || child.longitude == null) return

      // Add radius circle for groups
      if (child.type === 'group' && child.radius) {
        const circleId = `circle-${child.id}`
        
        // Create GeoJSON circle
        const center = [child.longitude, child.latitude]
        const radiusInKm = child.radius / 1000 // Convert meters to km
        const points = 64
        const coords = []
        
        for (let i = 0; i < points; i++) {
          const angle = (i / points) * 2 * Math.PI
          const dx = radiusInKm * Math.cos(angle)
          const dy = radiusInKm * Math.sin(angle)
          const lat = child.latitude + (dy / 111.32)
          const lng = child.longitude + (dx / (111.32 * Math.cos(child.latitude * Math.PI / 180)))
          coords.push([lng, lat])
        }
        coords.push(coords[0]) // Close the circle

        map.addSource(circleId, {
          type: 'geojson',
          data: {
            type: 'Feature',
            geometry: {
              type: 'Polygon',
              coordinates: [coords]
            }
          }
        })

        map.addLayer({
          id: circleId,
          type: 'fill',
          source: circleId,
          paint: {
            'fill-color': '#667eea',
            'fill-opacity': 0.2
          }
        })

        map.addLayer({
          id: `${circleId}-outline`,
          type: 'line',
          source: circleId,
          paint: {
            'line-color': '#667eea',
            'line-width': 2,
            'line-opacity': 0.6
          }
        })

        circles.push(circleId, `${circleId}-outline`)
      }

      // Create custom marker element with glow effect
      const el = document.createElement('div')
      el.style.cursor = 'pointer'
      
      if (child.depiction) {
        el.innerHTML = `
          <div style="
            width: 50px;
            height: 50px;
            border-radius: 50%;
            overflow: hidden;
            border: 3px solid #fff;
            box-shadow: 0 0 20px rgba(255,255,255,0.6), 0 4px 12px rgba(0,0,0,0.5);
            background: white;
            transition: transform 0.2s ease;
          " class="marker-hover">
            <img 
              src="${child.depiction}" 
              style="width: 100%; height: 100%; object-fit: cover;"
              alt="${child.title || 'Marker'}"
            />
          </div>
        `
      } else {
        el.innerHTML = `
          <div style="
            width: 36px;
            height: 36px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 0 20px rgba(102, 126, 234, 0.8), 0 4px 12px rgba(0,0,0,0.5);
            transition: transform 0.2s ease;
          " class="marker-hover"></div>
        `
      }

      // Add hover effect
      el.addEventListener('mouseenter', () => {
        const markerEl = el.querySelector('.marker-hover') as HTMLElement
        if (markerEl) {
          markerEl.style.transform = 'scale(1.15)'
        }
      })
      el.addEventListener('mouseleave', () => {
        const markerEl = el.querySelector('.marker-hover') as HTMLElement
        if (markerEl) {
          markerEl.style.transform = 'scale(1)'
        }
      })

      // Add click handler
      el.addEventListener('click', () => {
        handleMarkerSelect(child)
      })

      const marker = new mapboxgl.Marker(el)
        .setLngLat([child.longitude, child.latitude])
        .addTo(map)

      markers.push(marker)
    })

    // Fit bounds if we have markers with padding and animation
    if (locatedChildren.length > 0) {
      const bounds = new mapboxgl.LngLatBounds()
      locatedChildren.forEach(child => {
        bounds.extend([child.longitude!, child.latitude!])
      })
      map.fitBounds(bounds, { 
        padding: 80,
        pitch: 60,
        bearing: -17.6,
        duration: 2000
      })
    }
  }

  function addLeafletMarkers() {
    // @ts-ignore
    const L = window.L

    locatedChildren.forEach((child, index) => {
      if (child.latitude == null || child.longitude == null) return

      // Add radius circle for groups
      if (child.type === 'group' && child.radius) {
        const circle = L.circle([child.latitude, child.longitude], {
          radius: child.radius,
          color: '#667eea',
          fillColor: '#667eea',
          fillOpacity: 0.2,
          weight: 2
        }).addTo(map)
        circles.push(circle)
      }

      let icon
      if (child.depiction) {
        const iconHtml = `
          <div style="
            width: 40px;
            height: 40px;
            border-radius: 50%;
            overflow: hidden;
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            background: white;
            cursor: pointer;
          ">
            <img 
              src="${child.depiction}" 
              style="width: 100%; height: 100%; object-fit: cover;"
              alt="${child.title || 'Marker'}"
            />
          </div>
        `
        icon = L.divIcon({
          html: iconHtml,
          className: 'custom-marker-icon',
          iconSize: [40, 40],
          iconAnchor: [20, 20],
          popupAnchor: [0, -20]
        })
      } else {
        icon = new L.Icon.Default()
      }

      const marker = L.marker([child.latitude, child.longitude], { icon }).addTo(map)
      
      marker.on('click', () => {
        handleMarkerSelect(child)
      })
      
      markers.push(marker)
    })

    // Fit bounds if we have markers
    if (locatedChildren.length > 0) {
      const bounds = L.latLngBounds(
        locatedChildren.map(child => [child.latitude!, child.longitude!])
      )
      map.fitBounds(bounds, { padding: [50, 50] })
    }
  }

  async function initMapbox() {
    try {
      if (!mapboxToken) {
        initError = 'Mapbox access token not configured. Please set VITE_MAPBOX_ACCESS_TOKEN.'
        return
      }

      // Load Mapbox CSS from CDN
      const existingLink = document.querySelector('link[href*="mapbox-gl"]')
      if (!existingLink) {
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = 'https://api.mapbox.com/mapbox-gl-js/v3.0.1/mapbox-gl.css'
        document.head.appendChild(link)
        
        await new Promise((resolve) => {
          link.onload = () => resolve(true)
          link.onerror = () => resolve(false)
          setTimeout(() => resolve(true), 2000)
        })
      }

      // Load Mapbox JS from CDN
      const existingScript = document.querySelector('script[src*="mapbox-gl"]')
      if (!existingScript) {
        const script = document.createElement('script')
        script.src = 'https://api.mapbox.com/mapbox-gl-js/v3.0.1/mapbox-gl.js'
        document.head.appendChild(script)
        
        await new Promise((resolve) => {
          script.onload = () => resolve(true)
          script.onerror = () => resolve(false)
          setTimeout(() => resolve(true), 3000)
        })
      }

      // Check if Mapbox is available
      // @ts-ignore
      if (typeof window.mapboxgl === 'undefined') {
        initError = 'Mapbox GL failed to load'
        return
      }

      // @ts-ignore
      const mapboxgl = window.mapboxgl
      mapboxgl.accessToken = mapboxToken

      // Determine center point
      const centerLat = entity.latitude || locatedChildren[0]?.latitude || 45.5152
      const centerLng = entity.longitude || locatedChildren[0]?.longitude || -122.6784

      // Create map with dark style and angled camera
      map = new mapboxgl.Map({
        container: mapContainer!,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [centerLng, centerLat],
        zoom: 14,
        pitch: 60,
        bearing: -17.6,
        antialias: true
      })

      // Add navigation controls
      map.addControl(new mapboxgl.NavigationControl(), 'top-right')

      map.on('load', () => {
        // Enable 3D buildings for dramatic effect
        const layers = map.getStyle().layers
        const labelLayerId = layers.find(
          (layer: any) => layer.type === 'symbol' && layer.layout['text-field']
        )?.id

        // Add 3D building layer
        if (!map.getLayer('3d-buildings')) {
          map.addLayer(
            {
              id: '3d-buildings',
              source: 'composite',
              'source-layer': 'building',
              filter: ['==', 'extrude', 'true'],
              type: 'fill-extrusion',
              minzoom: 15,
              paint: {
                'fill-extrusion-color': '#1a1a1a',
                'fill-extrusion-height': [
                  'interpolate',
                  ['linear'],
                  ['zoom'],
                  15,
                  0,
                  15.05,
                  ['get', 'height']
                ],
                'fill-extrusion-base': [
                  'interpolate',
                  ['linear'],
                  ['zoom'],
                  15,
                  0,
                  15.05,
                  ['get', 'min_height']
                ],
                'fill-extrusion-opacity': 0.6
              }
            },
            labelLayerId
          )
        }

        mapReady = true
        addMarkers()
      })

      map.on('error', (e: any) => {
        console.error('Mapbox error:', e)
      })
      
    } catch (error) {
      console.error('GroupViewMap Mapbox error:', error)
      initError = error instanceof Error ? error.message : String(error)
    }
  }

  async function initLeaflet() {
    try {
      // Load Leaflet CSS from CDN
      const existingLink = document.querySelector('link[href*="leaflet"]')
      if (!existingLink) {
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
        link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY='
        link.crossOrigin = ''
        document.head.appendChild(link)
        
        await new Promise((resolve) => {
          link.onload = () => resolve(true)
          link.onerror = () => resolve(false)
          setTimeout(() => resolve(true), 2000)
        })
      }

      // Load Leaflet JS from CDN
      const existingScript = document.querySelector('script[src*="leaflet"]')
      if (!existingScript) {
        const script = document.createElement('script')
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
        script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo='
        script.crossOrigin = ''
        document.head.appendChild(script)
        
        await new Promise((resolve) => {
          script.onload = () => resolve(true)
          script.onerror = () => resolve(false)
          setTimeout(() => resolve(true), 3000)
        })
      }

      // Check if Leaflet is available
      // @ts-ignore
      if (typeof window.L === 'undefined') {
        initError = 'Leaflet failed to load'
        return
      }

      // @ts-ignore
      const L = window.L

      // Determine center point
      const centerLat = entity.latitude || locatedChildren[0]?.latitude || 45.5152
      const centerLng = entity.longitude || locatedChildren[0]?.longitude || -122.6784

      // Create map
      map = L.map(mapContainer!).setView([centerLat, centerLng], 13)

      // Add satellite tile layer
      const satelliteLayer = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: 'Tiles &copy; Esri',
          maxZoom: 19
        }
      )
      
      satelliteLayer.addTo(map)

      // Add labels overlay
      const labelsLayer = L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png',
        {
          attribution: '&copy; OpenStreetMap, &copy; CARTO',
          subdomains: 'abcd',
          maxZoom: 19
        }
      )
      
      labelsLayer.addTo(map)

      // Force map to recalculate size
      setTimeout(() => {
        if (map) {
          map.invalidateSize()
        }
      }, 100)

      mapReady = true
      addMarkers()
      
    } catch (error) {
      console.error('GroupViewMap error:', error)
      initError = error instanceof Error ? error.message : String(error)
    }
  }
</script>

<div class="flex flex-col flex-1 min-h-0">
  <div class="flex-shrink-0 px-4 pt-8">
    <EntityHeader {entity} showContent={false} showStats={true} />

    {#if initError}
      <div class="mb-4 text-xs text-red-400">
        Map initialization error: {initError}
      </div>
    {/if}
  </div>

  <div class="flex-1 min-h-[300px] relative px-4 pb-4">
    <div
      bind:this={mapContainer} 
      class="w-full h-full rounded-lg border border-white/20 overflow-hidden"
      style="background: #0a0a0a;"
    ></div>

    <!-- Pull-up Drawer -->
    <div 
      class="absolute bottom-0 left-4 right-4 bg-black/95 backdrop-blur-sm border-t border-white/20 transition-all duration-300 ease-out rounded-t-lg"
      style={drawerMode === 'minimized' ? 'height: 48px;' : drawerMode === 'places' ? 'height: 200px;' : 'height: 400px;'}
    >
      <!-- Drawer Bar -->
      <button
        onclick={handleDrawerBarClick}
        class="w-full h-12 flex items-center justify-center border-b border-white/10 hover:bg-white/5 transition-colors"
        aria-label="Toggle drawer"
      >
        <div class="w-12 h-1 bg-white/40 rounded-full"></div>
      </button>

      <!-- Drawer Content -->
      <div class="overflow-hidden" style="height: calc(100% - 48px);">
        {#if drawerMode === 'places'}
          <!-- Horizontal scrollable places -->
          <div class="p-4">
            <div class="flex items-center gap-2 mb-3">
              <h3 class="text-sm font-semibold">Places ({locatedChildren.length})</h3>
              <div class="flex gap-1 ml-auto">
                {#each ['post', 'party', 'group', 'place', 'event'] as filterType}
                  {@const count = children.filter(c => c.type === filterType && c.latitude != null && c.longitude != null).length}
                  {#if count > 0}
                    <button
                      onclick={() => toggleFilter(filterType)}
                      class={getFilterButtonClass(filterType)}
                      aria-label="Filter by {filterType}"
                    >
                      {filterType}
                    </button>
                  {/if}
                {/each}
              </div>
            </div>
            <div class="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
              {#each locatedChildren as child}
                <button
                  onclick={() => handlePlaceCardClick(child)}
                  class="flex-shrink-0 w-40 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg overflow-hidden transition-colors"
                  aria-label="View {child.title || 'Untitled'}"
                >
                  {#if child.depiction}
                    <img 
                      src={child.depiction} 
                      alt={child.title || 'Place'} 
                      class="w-full h-24 object-cover"
                    />
                  {:else}
                    <div class="w-full h-24 bg-white/5 flex items-center justify-center">
                      <span class="text-2xl">📍</span>
                    </div>
                  {/if}
                  <div class="p-2">
                    <div class="text-xs font-medium truncate">{child.title || 'Untitled'}</div>
                    <div class="text-xs text-white/40 uppercase">{child.type}</div>
                  </div>
                </button>
              {/each}
            </div>
          </div>
        {:else if drawerMode === 'preview' && selectedMarker}
          <!-- Preview of selected marker -->
          <div class="p-4 overflow-y-auto h-full">
            <div class="max-w-2xl mx-auto">
              {#if selectedMarker.depiction}
                <img 
                  src={selectedMarker.depiction} 
                  alt={selectedMarker.title || 'Image'} 
                  class="w-full h-48 object-cover rounded-lg mb-4"
                />
              {/if}
              <div class="flex items-start justify-between mb-3">
                <div>
                  <h3 class="text-lg font-semibold mb-1">{selectedMarker.title || 'Untitled'}</h3>
                  <div class="text-xs text-white/40 uppercase">
                    {selectedMarker.type}
                    {#if selectedMarker.type === 'group' && selectedMarker.radius}
                      • {selectedMarker.radius}m radius
                    {/if}
                  </div>
                </div>
                <button
                  onclick={() => drawerMode = 'places'}
                  class="text-white/60 hover:text-white"
                  aria-label="Close preview"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {#if selectedMarker.content}
                <p class="text-sm text-white/70 mb-4 line-clamp-4">{selectedMarker.content}</p>
              {/if}
              <div class="flex gap-2">
                <button
                  onclick={() => navigateTo(selectedMarker!.slug || `/${selectedMarker!.id}`)}
                  class="flex-1 px-4 py-2 bg-white text-black hover:bg-white/90 transition-colors text-sm font-medium rounded"
                >
                  View Full Details →
                </button>
                <button
                  onclick={() => drawerMode = 'places'}
                  class="px-4 py-2 border border-white/20 hover:bg-white/10 transition-colors text-sm rounded"
                >
                  Back to Places
                </button>
              </div>
            </div>
          </div>
        {/if}
      </div>
    </div>
  </div>

  {#if locatedChildren.length === 0 && mapReady}
    <div class="flex-shrink-0 px-4 pb-4 text-xs text-white/60">
      No locations to display with current filters. Add posts with latitude and longitude coordinates.
    </div>
  {/if}
</div>

<style>
  :global(.custom-marker-icon) {
    background: none !important;
    border: none !important;
  }

  :global(.custom-popup .leaflet-popup-content-wrapper) {
    background: white;
    border-radius: 8px;
    padding: 0;
  }

  :global(.custom-popup .leaflet-popup-content) {
    margin: 12px;
  }

  :global(.custom-popup .leaflet-popup-tip) {
    background: white;
  }

  :global(.leaflet-container) {
    font-family: inherit;
    height: 100%;
    width: 100%;
  }

  :global(.mapboxgl-ctrl-group) {
    background: rgba(0, 0, 0, 0.8) !important;
    border-radius: 8px !important;
    box-shadow: 0 4px 12px rgba(0,0,0,0.5) !important;
  }

  :global(.mapboxgl-ctrl-group button) {
    background: transparent !important;
    border-color: rgba(255,255,255,0.2) !important;
  }

  :global(.mapboxgl-ctrl-group button:hover) {
    background: rgba(255,255,255,0.1) !important;
  }

  :global(.mapboxgl-ctrl-icon) {
    filter: invert(1);
  }
</style>
