<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import type { Entity } from '../types'
  import EntityHeader from './EntityHeader.svelte'
  import EntityManagementControls from './EntityManagementControls.svelte'
  import { navigateTo } from '../utils/navigation'

  export let entity: Entity
  export let children: Entity[] = []

  let mapContainer: HTMLDivElement
  let map: any
  let L: any
  let mapReady = false

  // Filter children that have location data
  $: locatedChildren = children.filter(child => 
    child.latitude != null && child.longitude != null
  )

  onMount(async () => {
    try {
      // Import Leaflet CSS first
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY='
      link.crossOrigin = ''
      document.head.appendChild(link)

      // Wait for CSS to load
      await new Promise(resolve => {
        link.onload = resolve
        setTimeout(resolve, 1000) // Fallback timeout
      })

      // Dynamically import Leaflet
      L = await import('leaflet')

      // Fix for default marker icons in Leaflet with bundlers
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      // Initialize map centered on the group's location or first child
      const centerLat = entity.latitude || locatedChildren[0]?.latitude || 45.5152
      const centerLng = entity.longitude || locatedChildren[0]?.longitude || -122.6784
      
      map = L.map(mapContainer, {
        center: [centerLat, centerLng],
        zoom: 13,
        zoomControl: true
      })

      // Add satellite imagery layer (ESRI World Imagery)
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri',
        maxZoom: 19
      }).addTo(map)

      // Add roads/labels overlay (CartoDB Positron Labels)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap, &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(map)

      // Force map to recalculate size
      setTimeout(() => {
        if (map) {
          map.invalidateSize()
        }
      }, 100)

      // Add markers for each located child
      locatedChildren.forEach(child => {
        if (child.latitude == null || child.longitude == null) return

        // Create custom icon with depiction if available
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
                style="
                  width: 100%;
                  height: 100%;
                  object-fit: cover;
                "
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
          // Default marker
          icon = new L.Icon.Default()
        }

        const marker = L.marker([child.latitude, child.longitude], { icon })
          .addTo(map)

        // Create popup content
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

      // Fit bounds to show all markers if there are any
      if (locatedChildren.length > 0) {
        const bounds = L.latLngBounds(
          locatedChildren.map(child => [child.latitude!, child.longitude!])
        )
        map.fitBounds(bounds, { padding: [50, 50] })
      }

      // Add global handler for marker clicks
      ;(window as any).handleMarkerClick = (slug: string) => {
        navigateTo(slug)
      }

      mapReady = true
    } catch (error) {
      console.error('Failed to initialize map:', error)
    }
  })

  onDestroy(() => {
    if (map) {
      map.remove()
      map = null
    }
    // Clean up global handler
    delete (window as any).handleMarkerClick
  })
</script>

<EntityManagementControls {entity} showNewEntityButton={true}>
  <div slot="content">
    <!-- Empty - EntityHeader handles the display -->
  </div>
  
  <div slot="main">
    <EntityHeader {entity} />

    <div class="mb-4 text-xs text-white/60">
      {#if mapReady}
        Showing {locatedChildren.length} location{locatedChildren.length !== 1 ? 's' : ''} on map
      {:else}
        Loading map...
      {/if}
    </div>

    <div 
      bind:this={mapContainer} 
      class="w-full rounded border border-white/20"
      style="height: 600px; background: #1a1a1a; min-height: 600px;"
    ></div>

    {#if locatedChildren.length === 0}
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
  }
</style>
