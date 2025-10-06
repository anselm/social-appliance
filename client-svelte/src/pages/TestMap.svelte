<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import 'leaflet/dist/leaflet.css'
  import L from 'leaflet'

  let mapContainer: HTMLDivElement
  let map: any = null

  onMount(async () => {
    console.log('TestMap: onMount START')
    console.log('TestMap: mapContainer:', mapContainer)
    console.log('TestMap: Leaflet L object:', L)

    if (!mapContainer) {
      console.error('TestMap: No map container!')
      return
    }

    try {
      // Fix marker icons
      console.log('TestMap: Fixing marker icons...')
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })
      console.log('TestMap: Marker icons fixed')

      // Create map
      console.log('TestMap: Creating map...')
      console.log('TestMap: Container dimensions:', {
        offsetWidth: mapContainer.offsetWidth,
        offsetHeight: mapContainer.offsetHeight,
        clientWidth: mapContainer.clientWidth,
        clientHeight: mapContainer.clientHeight
      })
      
      map = L.map(mapContainer).setView([45.5152, -122.6784], 13)
      console.log('TestMap: Map created:', map)
      console.log('TestMap: Map container innerHTML length:', mapContainer.innerHTML.length)

      // Add tile layer
      console.log('TestMap: Adding tiles...')
      const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
      })
      
      tileLayer.on('loading', () => console.log('TestMap: Tiles LOADING'))
      tileLayer.on('load', () => console.log('TestMap: Tiles LOADED'))
      tileLayer.on('tileerror', (e) => console.error('TestMap: Tile ERROR:', e))
      
      tileLayer.addTo(map)
      console.log('TestMap: Tiles added')

      // Add a marker
      console.log('TestMap: Adding marker...')
      L.marker([45.5152, -122.6784]).addTo(map)
        .bindPopup('Test Marker')
        .openPopup()
      console.log('TestMap: Marker added')

      // Force resize
      setTimeout(() => {
        if (map) {
          console.log('TestMap: Invalidating size...')
          map.invalidateSize()
          console.log('TestMap: Size invalidated')
          console.log('TestMap: Final container innerHTML length:', mapContainer.innerHTML.length)
          console.log('TestMap: Final container children count:', mapContainer.children.length)
        }
      }, 100)

      console.log('TestMap: ✅ Initialization complete')
    } catch (error) {
      console.error('TestMap: ❌ Error:', error)
      console.error('TestMap: Error stack:', error instanceof Error ? error.stack : 'No stack')
    }
  })

  onDestroy(() => {
    console.log('TestMap: onDestroy')
    if (map) {
      map.remove()
      map = null
    }
  })
</script>

<div class="space-y-4">
  <h1 class="text-2xl font-bold">Test Map</h1>
  <p class="text-white/60">Simple Leaflet map test</p>
  
  <div 
    bind:this={mapContainer}
    class="w-full border border-white/20 rounded"
    style="height: 600px; background: #1a1a1a;"
  ></div>
</div>

<style>
  :global(.leaflet-container) {
    height: 100%;
    width: 100%;
  }
</style>
