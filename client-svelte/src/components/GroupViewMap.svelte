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
  let logMessages = $state<string[]>([])
  let hasInitialized = $state(false)

  function log(message: string) {
    console.log('GroupViewMap:', message)
    logMessages = [...logMessages, `${new Date().toISOString().substr(11, 8)} - ${message}`]
  }

  // Filter children that have location data
  let locatedChildren = $derived(children.filter(child => 
    child.latitude != null && child.longitude != null
  ))

  // Get map provider from config
  let mapProvider = $derived($config.map?.provider || 'mapbox')
  let mapboxToken = $derived($config.map?.mapboxAccessToken || import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || '')

  $effect(() => {
    if (!mapContainer || hasInitialized) {
      return
    }

    log('Effect running with container')
    log('Map provider: ' + mapProvider)
    hasInitialized = true

    if (mapProvider === 'mapbox') {
      initMapbox()
    } else {
      initLeaflet()
    }

    return () => {
      log('Cleanup called from effect')
      if (map) {
        map.remove()
        map = null
      }
      delete (window as any).handleMarkerClick
    }
  })

  async function initMapbox() {
    try {
      if (!mapboxToken) {
        log('ERROR: Mapbox access token not configured')
        initError = 'Mapbox access token not configured. Please set VITE_MAPBOX_ACCESS_TOKEN.'
        return
      }

      // Load Mapbox CSS from CDN
      log('Loading Mapbox CSS from CDN...')
      const existingLink = document.querySelector('link[href*="mapbox-gl"]')
      if (!existingLink) {
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = 'https://api.mapbox.com/mapbox-gl-js/v3.0.1/mapbox-gl.css'
        document.head.appendChild(link)
        log('CSS link added to head')
        
        await new Promise((resolve) => {
          link.onload = () => {
            log('CSS loaded successfully')
            resolve(true)
          }
          link.onerror = () => {
            log('CSS failed to load')
            resolve(false)
          }
          setTimeout(() => {
            log('CSS load timeout (2s)')
            resolve(true)
          }, 2000)
        })
      } else {
        log('CSS already loaded')
      }

      // Load Mapbox JS from CDN
      log('Loading Mapbox JS from CDN...')
      const existingScript = document.querySelector('script[src*="mapbox-gl"]')
      if (!existingScript) {
        const script = document.createElement('script')
        script.src = 'https://api.mapbox.com/mapbox-gl-js/v3.0.1/mapbox-gl.js'
        document.head.appendChild(script)
        log('JS script added to head')
        
        await new Promise((resolve) => {
          script.onload = () => {
            log('JS loaded successfully')
            resolve(true)
          }
          script.onerror = () => {
            log('JS failed to load')
            resolve(false)
          }
          setTimeout(() => {
            log('JS load timeout (3s)')
            resolve(true)
          }, 3000)
        })
      } else {
        log('JS already loaded')
      }

      // Check if Mapbox is available
      // @ts-ignore
      if (typeof window.mapboxgl === 'undefined') {
        log('ERROR: Mapbox GL is not available on window!')
        initError = 'Mapbox GL failed to load'
        return
      }

      // @ts-ignore
      const mapboxgl = window.mapboxgl
      mapboxgl.accessToken = mapboxToken
      log('Mapbox version: ' + mapboxgl.version)

      // Container dimensions
      log('Container dimensions: ' + mapContainer!.offsetWidth + 'x' + mapContainer!.offsetHeight)

      // Determine center point
      const centerLat = entity.latitude || locatedChildren[0]?.latitude || 45.5152
      const centerLng = entity.longitude || locatedChildren[0]?.longitude || -122.6784
      
      log('Map center: ' + centerLat + ', ' + centerLng)

      // Create map with dark style and angled camera
      log('Creating Mapbox map instance...')
      map = new mapboxgl.Map({
        container: mapContainer!,
        style: 'mapbox://styles/mapbox/dark-v11', // Dark/night mode style
        center: [centerLng, centerLat],
        zoom: 14,
        pitch: 60, // Angled camera view (0-85 degrees)
        bearing: -17.6, // Slight rotation for dynamic look
        antialias: true // Smooth 3D rendering
      })

      // Add navigation controls
      map.addControl(new mapboxgl.NavigationControl(), 'top-right')

      map.on('load', () => {
        log('Mapbox map loaded!')
        
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

        // Add markers
        log('Adding ' + locatedChildren.length + ' markers...')
        locatedChildren.forEach((child, index) => {
          if (child.latitude == null || child.longitude == null) {
            log('Child ' + index + ' missing coordinates')
            return
          }

          log('Creating marker ' + (index + 1) + ': ' + child.title)

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

          new mapboxgl.Marker(el)
            .setLngLat([child.longitude, child.latitude])
            .setPopup(popup)
            .addTo(map)

          log('Marker ' + (index + 1) + ' added')
        })

        // Fit bounds if we have markers with padding and animation
        if (locatedChildren.length > 0) {
          log('Fitting bounds to markers...')
          const bounds = new mapboxgl.LngLatBounds()
          locatedChildren.forEach(child => {
            bounds.extend([child.longitude!, child.latitude!])
          })
          map.fitBounds(bounds, { 
            padding: 80,
            pitch: 60,
            bearing: -17.6,
            duration: 2000 // Smooth 2-second animation
          })
          log('Bounds fitted')
        }
      })

      map.on('error', (e: any) => {
        log('Mapbox error: ' + JSON.stringify(e))
      })

      // Global click handler
      ;(window as any).handleMarkerClick = (slug: string) => {
        log('Marker clicked: ' + slug)
        navigateTo(slug)
      }

      log('✅ Mapbox initialization complete!')
      
    } catch (error) {
      log('❌ ERROR: ' + (error instanceof Error ? error.message : String(error)))
      console.error('GroupViewMap Mapbox error:', error)
      initError = error instanceof Error ? error.message : String(error)
    }
  }

  async function initLeaflet() {
    try {
      // Load Leaflet CSS from CDN
      log('Loading Leaflet CSS from CDN...')
      const existingLink = document.querySelector('link[href*="leaflet"]')
      if (!existingLink) {
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
        link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY='
        link.crossOrigin = ''
        document.head.appendChild(link)
        log('CSS link added to head')
        
        await new Promise((resolve) => {
          link.onload = () => {
            log('CSS loaded successfully')
            resolve(true)
          }
          link.onerror = () => {
            log('CSS failed to load')
            resolve(false)
          }
          setTimeout(() => {
            log('CSS load timeout (2s)')
            resolve(true)
          }, 2000)
        })
      } else {
        log('CSS already loaded')
      }

      // Load Leaflet JS from CDN
      log('Loading Leaflet JS from CDN...')
      const existingScript = document.querySelector('script[src*="leaflet"]')
      if (!existingScript) {
        const script = document.createElement('script')
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
        script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo='
        script.crossOrigin = ''
        document.head.appendChild(script)
        log('JS script added to head')
        
        await new Promise((resolve) => {
          script.onload = () => {
            log('JS loaded successfully')
            resolve(true)
          }
          script.onerror = () => {
            log('JS failed to load')
            resolve(false)
          }
          setTimeout(() => {
            log('JS load timeout (3s)')
            resolve(true)
          }, 3000)
        })
      } else {
        log('JS already loaded')
      }

      // Check if Leaflet is available
      // @ts-ignore
      if (typeof window.L === 'undefined') {
        log('ERROR: Leaflet (L) is not available on window!')
        initError = 'Leaflet failed to load'
        return
      }

      // @ts-ignore
      const L = window.L
      log('Leaflet version: ' + L.version)

      // Container dimensions
      log('Container dimensions: ' + mapContainer!.offsetWidth + 'x' + mapContainer!.offsetHeight)

      // Determine center point
      const centerLat = entity.latitude || locatedChildren[0]?.latitude || 45.5152
      const centerLng = entity.longitude || locatedChildren[0]?.longitude || -122.6784
      
      log('Map center: ' + centerLat + ', ' + centerLng)

      // Create map
      log('Creating map instance...')
      map = L.map(mapContainer!).setView([centerLat, centerLng], 13)
      log('Map instance created')

      // Add satellite tile layer
      log('Adding satellite tile layer...')
      const satelliteLayer = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: 'Tiles &copy; Esri',
          maxZoom: 19
        }
      )
      
      satelliteLayer.on('loading', () => log('Satellite tiles loading...'))
      satelliteLayer.on('load', () => log('Satellite tiles loaded!'))
      satelliteLayer.on('tileerror', (e: any) => log('Satellite tile error: ' + JSON.stringify(e)))
      
      satelliteLayer.addTo(map)
      log('Satellite layer added to map')

      // Add labels overlay
      log('Adding labels overlay...')
      const labelsLayer = L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png',
        {
          attribution: '&copy; OpenStreetMap, &copy; CARTO',
          subdomains: 'abcd',
          maxZoom: 19
        }
      )
      
      labelsLayer.on('loading', () => log('Label tiles loading...'))
      labelsLayer.on('load', () => log('Label tiles loaded!'))
      labelsLayer.on('tileerror', (e: any) => log('Label tile error: ' + JSON.stringify(e)))
      
      labelsLayer.addTo(map)
      log('Labels layer added to map')

      // Force map to recalculate size
      setTimeout(() => {
        if (map) {
          log('Invalidating map size...')
          map.invalidateSize()
          log('Map size invalidated')
        }
      }, 100)

      // Add markers
      log('Adding ' + locatedChildren.length + ' markers...')
      locatedChildren.forEach((child, index) => {
        if (child.latitude == null || child.longitude == null) {
          log('Child ' + index + ' missing coordinates')
          return
        }

        log('Creating marker ' + (index + 1) + ': ' + child.title)

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
        log('Marker ' + (index + 1) + ' added')

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
        log('Fitting bounds to markers...')
        const bounds = L.latLngBounds(
          locatedChildren.map(child => [child.latitude!, child.longitude!])
        )
        map.fitBounds(bounds, { padding: [50, 50] })
        log('Bounds fitted')
      }

      // Global click handler
      ;(window as any).handleMarkerClick = (slug: string) => {
        log('Marker clicked: ' + slug)
        navigateTo(slug)
      }

      mapReady = true
      log('✅ Map initialization complete!')
      
    } catch (error) {
      log('❌ ERROR: ' + (error instanceof Error ? error.message : String(error)))
      console.error('GroupViewMap error:', error)
      initError = error instanceof Error ? error.message : String(error)
    }
  }
</script>

<EntityManagementControls {entity} showNewEntityButton={true}>
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

    <div 
      bind:this={mapContainer} 
      class="w-full rounded-lg border border-white/20 overflow-hidden"
      style="height: 600px; background: #0a0a0a; min-height: 600px; position: relative;"
    ></div>

    {#if locatedChildren.length === 0 && mapReady}
      <div class="mt-4 text-xs text-white/60">
        No locations to display. Add posts with latitude and longitude coordinates.
      </div>
    {/if}

    {#if logMessages.length > 0}
      <div class="mt-4 p-4 bg-black border border-white/20 rounded">
        <h2 class="text-sm font-bold mb-2">Map Initialization Log:</h2>
        <div class="space-y-1 text-xs font-mono max-h-48 overflow-y-auto">
          {#each logMessages as message}
            <div class="text-white/70">{message}</div>
          {/each}
        </div>
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
