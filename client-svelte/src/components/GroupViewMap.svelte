<script lang="ts">
  import type { Entity } from '../types'
  import EntityHeader from './EntityHeader.svelte'
  import EntityManagementControls from './EntityManagementControls.svelte'
  import { navigateTo } from '../utils/navigation'
  import { config } from '../stores/appConfig'

  let { entity, children = [] }: { entity: Entity, children: Entity[] } = $props()

  let mapContainer = $state<HTMLDivElement | undefined>()
  let map: any = null
  let mapReady = $state(false)
  let initError = $state<string | null>(null)
  let hasInitialized = $state(false)

  // Filter state
  let activeFilters = $state<Set<string>>(new Set(['post', 'party', 'group', 'place', 'event']))
  
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
    const baseClasses = "px-3 py-2 text-xs font-medium rounded-lg shadow-lg transition-all backdrop-blur-sm"
    
    if (isActive) {
      return `${baseClasses} bg-white/90 text-black hover:bg-white`
    } else {
      return `${baseClasses} bg-black/60 text-white/40 hover:bg-black/80`
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

      // Create popup content with dark theme
      const popupContent = `
        <div style="min-width: 220px; background: #1a1a1a; color: #fff;">
          ${child.depiction ? `
            <img 
              src="${child.depiction}" 
              style="width: 100%; height: 140px; object-fit: cover; margin-bottom: 12px; border-radius: 6px;"
              alt="${child.title || 'Image'}"
            />
          ` : ''}
          <div style="font-weight: bold; margin-bottom: 6px; font-size: 15px; color: #fff;">
            ${child.title || 'Untitled'}
          </div>
          <div style="font-size: 11px; color: #888; margin-bottom: 8px; text-transform: uppercase;">
            ${child.type}${child.type === 'group' && child.radius ? ` • ${child.radius}m radius` : ''}
          </div>
          ${child.content ? `
            <div style="font-size: 13px; color: #aaa; margin-bottom: 12px; line-height: 1.5;">
              ${child.content.substring(0, 120)}${child.content.length > 120 ? '...' : ''}
            </div>
          ` : ''}
          <button 
            onclick="window.handleMarkerClick('${child.slug || `/${child.id}`}')"
            style="
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: #fff;
              border: none;
              padding: 8px 16px;
              font-size: 13px;
              cursor: pointer;
              border-radius: 6px;
              width: 100%;
              font-weight: 600;
              transition: opacity 0.2s;
            "
            onmouseover="this.style.opacity='0.9'"
            onmouseout="this.style.opacity='1'"
          >
            View Details →
          </button>
        </div>
      `

      const popup = new mapboxgl.Popup({ 
        offset: 30,
        className: 'dark-popup',
        maxWidth: '280px'
      }).setHTML(popupContent)

      const marker = new mapboxgl.Marker(el)
        .setLngLat([child.longitude, child.latitude])
        .setPopup(popup)
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
      markers.push(marker)

      const popupContent = `
        <div style="min-width: 200px;">
          ${child.depiction ? `
            <img 
              src="${child.depiction}" 
              style="width: 100%; height: 120px; object-fit: cover; margin-bottom: 8px; border-radius: 4px;"
              alt="${child.title || 'Image'}"
            />
          ` : ''}
          <div style="font-weight: bold; margin-bottom: 4px; font-size: 14px;">
            ${child.title || 'Untitled'}
          </div>
          <div style="font-size: 11px; color: #888; margin-bottom: 8px; text-transform: uppercase;">
            ${child.type}${child.type === 'group' && child.radius ? ` • ${child.radius}m radius` : ''}
          </div>
          ${child.content ? `
            <div style="font-size: 12px; color: #666; margin-bottom: 8px; line-height: 1.4;">
              ${child.content.substring(0, 100)}${child.content.length > 100 ? '...' : ''}
            </div>
          ` : ''}
          <button 
            onclick="window.handleMarkerClick('${child.slug || `/${child.id}`}')"
            style="
              background: #000;
              color: #fff;
              border: 1px solid #333;
              padding: 6px 12px;
              font-size: 12px;
              cursor: pointer;
              border-radius: 4px;
              width: 100%;
            "
          >
            View Details →
          </button>
        </div>
      `

      marker.bindPopup(popupContent, {
        maxWidth: 250,
        className: 'custom-popup'
      })
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

      // Global click handler
      ;(window as any).handleMarkerClick = (slug: string) => {
        navigateTo(slug)
      }
      
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

      // Global click handler
      ;(window as any).handleMarkerClick = (slug: string) => {
        navigateTo(slug)
      }

      mapReady = true
      addMarkers()
      
    } catch (error) {
      console.error('GroupViewMap error:', error)
      initError = error instanceof Error ? error.message : String(error)
    }
  }
</script>

<EntityManagementControls {entity} showNewEntityButton={false}>
  {#snippet content()}
    <!-- Empty - EntityHeader handles the display -->
  {/snippet}
  
  {#snippet main()}
    <EntityHeader {entity} />

    <div class="mb-4 text-xs text-white/60">
      {#if initError}
        <span class="text-red-400">Map initialization error: {initError}</span>
      {:else if mapReady}
        Showing {locatedChildren.length} location{locatedChildren.length !== 1 ? 's' : ''} on map (using {mapProvider})
      {:else}
        Loading {mapProvider} map...
      {/if}
    </div>

    <div class="relative">
      <div 
        bind:this={mapContainer} 
        class="w-full rounded-lg border border-white/20 overflow-hidden"
        style="height: 600px; background: #0a0a0a; min-height: 600px; position: relative;"
      ></div>

      <!-- Floating Filter Buttons -->
      {#if mapReady}
        <div class="absolute top-4 left-4 flex flex-col gap-2 z-10">
          {#each ['post', 'party', 'group', 'place', 'event'] as filterType}
            {@const count = children.filter(c => c.type === filterType && c.latitude != null && c.longitude != null).length}
            {#if count > 0}
              <button
                onclick={() => toggleFilter(filterType)}
                class={getFilterButtonClass(filterType)}
              >
                {filterType} ({count})
              </button>
            {/if}
          {/each}
        </div>
      {/if}
    </div>

    {#if locatedChildren.length === 0 && mapReady}
      <div class="mt-4 text-xs text-white/60">
        No locations to display with current filters. Add posts with latitude and longitude coordinates.
      </div>
    {/if}
  {/snippet}
</EntityManagementControls>

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

  :global(.mapboxgl-popup-content) {
    padding: 0;
    border-radius: 8px;
    background: #1a1a1a;
    box-shadow: 0 8px 32px rgba(0,0,0,0.6);
  }

  :global(.mapboxgl-popup-close-button) {
    font-size: 24px;
    padding: 8px 12px;
    color: #fff;
    opacity: 0.7;
  }

  :global(.mapboxgl-popup-close-button:hover) {
    opacity: 1;
    background: transparent;
  }

  :global(.mapboxgl-popup-tip) {
    border-top-color: #1a1a1a !important;
  }

  :global(.dark-popup .mapboxgl-popup-content) {
    background: #1a1a1a;
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
