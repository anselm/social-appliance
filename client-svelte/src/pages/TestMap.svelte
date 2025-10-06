<script lang="ts">
  import { onMount, onDestroy } from 'svelte'

  let mapContainer: HTMLDivElement
  let map: any = null

  onMount(async () => {
    console.log('TestMap: onMount START')
    console.log('TestMap: mapContainer:', mapContainer)

    if (!mapContainer) {
      console.error('TestMap: No map container!')
      return
    }

    try {
      // Load Leaflet CSS
      console.log('TestMap: Loading Leaflet CSS...')
      const existingLink = document.querySelector('link[href*="leaflet"]')
      if (!existingLink) {
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
        document.head.appendChild(link)
        console.log('TestMap: CSS link added')
        
        await new Promise((resolve) => {
          link.onload = () => {
            console.log('TestMap: CSS loaded')
            resolve(true)
          }
          setTimeout(() => {
            console.log('TestMap: CSS timeout')
            resolve(true)
          }, 2000)
        })
      }

      // Import Leaflet
      console.log('TestMap: Importing Leaflet...')
      const L = await import('leaflet')
      console.log('TestMap: Leaflet imported')

      // Fix marker icons
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      // Create map
      console.log('TestMap: Creating map...')
      map = L.map(mapContainer).setView([45.5152, -122.6784], 13)
      console.log('TestMap: Map created:', map)

      // Add tile layer
      console.log('TestMap: Adding tiles...')
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(map)
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
        }
      }, 100)

      console.log('TestMap: ✅ Initialization complete')
    } catch (error) {
      console.error('TestMap: ❌ Error:', error)
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
