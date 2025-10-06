<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import type { Entity } from '../types'
  import EntityHeader from './EntityHeader.svelte'
  import EntityManagementControls from './EntityManagementControls.svelte'
  import { navigateTo } from '../utils/navigation'

  export let entity: Entity
  export let children: Entity[] = []

  let mapContainer: HTMLDivElement
  let map: any = null
  let mapReady = false
  let initError: string | null = null

  // Filter children that have location data
  $: locatedChildren = children.filter(child => 
    child.latitude != null && child.longitude != null
  )

  onMount(async () => {
    console.log('=== GroupViewMap: onMount START ===')
    console.log('GroupViewMap: Entity:', entity)
    console.log('GroupViewMap: Children count:', children.length)
    console.log('GroupViewMap: Located children count:', locatedChildren.length)
    console.log('GroupViewMap: Map container element:', mapContainer)

    if (!mapContainer) {
      console.error('GroupViewMap: Map container is not defined!')
      initError = 'Map container not found'
      return
    }

    try {
      // Load Leaflet CSS
      console.log('GroupViewMap: Loading Leaflet CSS...')
      const existingLink = document.querySelector('link[href*="leaflet"]')
      if (!existingLink) {
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
        link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY='
        link.crossOrigin = ''
        document.head.appendChild(link)
        console.log('GroupViewMap: Leaflet CSS link added to head')
        
        // Wait for CSS to load
        await new Promise((resolve) => {
          link.onload = () => {
            console.log('GroupViewMap: Leaflet CSS loaded successfully')
            resolve(true)
          }
          link.onerror = () => {
            console.error('GroupViewMap: Failed to load Leaflet CSS')
            resolve(false)
          }
          setTimeout(() => {
            console.log('GroupViewMap: CSS load timeout (2s)')
            resolve(true)
          }, 2000)
        })
      } else {
        console.log('GroupViewMap: Leaflet CSS already loaded')
      }

      // Import Leaflet library
      console.log('GroupViewMap: Importing Leaflet library...')
      const L = await import('leaflet')
      console.log('GroupViewMap: Leaflet imported:', typeof L, Object.keys(L).slice(0, 10))

      // Fix default marker icons
      console.log('GroupViewMap: Configuring default marker icons...')
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })
      console.log('GroupViewMap: Marker icons configured')

      // Determine center point
      const centerLat = entity.latitude || locatedChildren[0]?.latitude || 45.5152
      const centerLng = entity.longitude || locatedChildren[0]?.longitude || -122.6784
      
      console.log('GroupViewMap: Map center:', { centerLat, centerLng })
      console.log('GroupViewMap: Container dimensions:', {
        offsetWidth: mapContainer.offsetWidth,
        offsetHeight: mapContainer.offsetHeight,
        clientWidth: mapContainer.clientWidth,
        clientHeight: mapContainer.clientHeight,
        scrollWidth: mapContainer.scrollWidth,
        scrollHeight: mapContainer.scrollHeight
      })

      // Initialize map
      console.log('GroupViewMap: Creating Leaflet map instance...')
      map = L.map(mapContainer, {
        center: [centerLat, centerLng],
        zoom: 13,
        zoomControl: true,
        scrollWheelZoom: true
      })
      
      console.log('GroupViewMap: Map instance created:', map)
      console.log('GroupViewMap: Map container after init:', mapContainer.innerHTML.substring(0, 100))

      // Add satellite tile layer
      console.log('GroupViewMap: Adding satellite tile layer...')
      const satelliteLayer = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: 'Tiles &copy; Esri',
          maxZoom: 19
        }
      )
      
      satelliteLayer.on('loading', () => console.log('GroupViewMap: Satellite tiles LOADING'))
      satelliteLayer.on('load', () => console.log('GroupViewMap: Satellite tiles LOADED'))
      satelliteLayer.on('tileerror', (e) => console.error('GroupViewMap: Satellite tile ERROR:', e))
      
      satelliteLayer.addTo(map)
      console.log('GroupViewMap: Satellite layer added to map')

      // Add labels overlay
      console.log('GroupViewMap: Adding labels overlay...')
      const labelsLayer = L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png',
        {
          attribution: '&copy; OpenStreetMap, &copy; CARTO',
          subdomains: 'abcd',
          maxZoom: 19
        }
      )
      
      labelsLayer.on('loading', () => console.log('GroupViewMap: Label tiles LOADING'))
      labelsLayer.on('load', () => console.log('GroupViewMap: Label tiles LOADED'))
      labelsLayer.on('tileerror', (e) => console.error('GroupViewMap: Label tile ERROR:', e))
      
      labelsLayer.addTo(map)
      console.log('GroupViewMap: Labels layer added to map')

      // Force map size recalculation
      console.log('GroupViewMap: Scheduling map size invalidation...')
      setTimeout(() => {
        if (map) {
          console.log('GroupViewMap: Invalidating map size NOW')
          map.invalidateSize()
          console.log('GroupViewMap: Map size invalidated, new size:', map.getSize())
        }
      }, 100)

      // Add markers
      console.log('GroupViewMap: Adding', locatedChildren.length, 'markers...')
      locatedChildren.forEach((child, index) => {
        if (child.latitude == null || child.longitude == null) {
          console.warn(`GroupViewMap: Child ${index} missing coordinates:`, child.id)
          return
        }

        console.log(`GroupViewMap: Creating marker ${index + 1}:`, {
          id: child.id,
          title: child.title,
          lat: child.latitude,
          lng: child.longitude
        })

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
        console.log(`GroupViewMap: Marker ${index + 1} added`)

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
        console.log('GroupViewMap: Fitting bounds to markers...')
        const bounds = L.latLngBounds(
          locatedChildren.map(child => [child.latitude!, child.longitude!])
        )
        map.fitBounds(bounds, { padding: [50, 50] })
        console.log('GroupViewMap: Bounds fitted')
      }

      // Global click handler
      ;(window as any).handleMarkerClick = (slug: string) => {
        console.log('GroupViewMap: Marker clicked:', slug)
        navigateTo(slug)
      }

      mapReady = true
      console.log('GroupViewMap: ✅ Map initialization COMPLETE')
      
      // Final state check
      setTimeout(() => {
        console.log('GroupViewMap: Final state:', {
          mapReady,
          hasMap: !!map,
          mapCenter: map?.getCenter(),
          mapZoom: map?.getZoom(),
          containerChildren: mapContainer.children.length,
          containerHTML: mapContainer.innerHTML.substring(0, 300)
        })
      }, 1000)
      
    } catch (error) {
      console.error('GroupViewMap: ❌ INITIALIZATION FAILED:', error)
      console.error('GroupViewMap: Error details:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : 'No stack'
      })
      initError = error instanceof Error ? error.message : String(error)
    }
  })

  onDestroy(() => {
    console.log('GroupViewMap: onDestroy called')
    if (map) {
      console.log('GroupViewMap: Removing map instance')
      map.remove()
      map = null
    }
    delete (window as any).handleMarkerClick
    console.log('GroupViewMap: Cleanup complete')
  })
</script>

<EntityManagementControls {entity} showNewEntityButton={true}>
  <div slot="content">
    <!-- Empty - EntityHeader handles the display -->
  </div>
  
  <div slot="main">
    <EntityHeader {entity} />

    <div class="mb-4 text-xs text-white/60">
      {#if initError}
        <span class="text-red-400">Map initialization error: {initError}</span>
      {:else if mapReady}
        Showing {locatedChildren.length} location{locatedChildren.length !== 1 ? 's' : ''} on map
      {:else}
        Loading map...
      {/if}
    </div>

    <div 
      bind:this={mapContainer} 
      class="w-full rounded border border-white/20"
      style="height: 600px; background: #1a1a1a; min-height: 600px; position: relative;"
    ></div>

    {#if locatedChildren.length === 0 && mapReady}
      <div class="mt-4 text-xs text-white/60">
        No locations to display. Add posts with latitude and longitude coordinates.
      </div>
    {/if}
  </div>
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
</style>
