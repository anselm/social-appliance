<script lang="ts">
  import { onDestroy } from 'svelte'

  let mapContainer: HTMLDivElement | undefined = $state()
  let map: any = null
  let logMessages: string[] = $state([])

  function log(message: string) {
    console.log('TestMap:', message)
    logMessages = [...logMessages, `${new Date().toISOString().substr(11, 8)} - ${message}`]
  }

  $effect(() => {
    if (!mapContainer) {
      log('Effect running but no container yet')
      return
    }

    log('Effect running with container')
    log('Map container: found')

    let cleanup: (() => void) | undefined

    async function initMap() {
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
          return
        }

        // @ts-ignore
        const L = window.L
        log('Leaflet version: ' + L.version)

        // Container dimensions
        log('Container dimensions: ' + mapContainer!.offsetWidth + 'x' + mapContainer!.offsetHeight)

        // Create map
        log('Creating map instance...')
        map = L.map(mapContainer!).setView([45.5152, -122.6784], 13)
        log('Map instance created')

        // Add tile layer
        log('Adding tile layer...')
        const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19
        })
        
        tileLayer.on('loading', () => log('Tiles loading...'))
        tileLayer.on('load', () => log('Tiles loaded!'))
        tileLayer.on('tileerror', (e: any) => log('Tile error: ' + JSON.stringify(e)))
        
        tileLayer.addTo(map)
        log('Tile layer added to map')

        // Add a marker
        log('Adding marker...')
        const marker = L.marker([45.5152, -122.6784]).addTo(map)
        marker.bindPopup('<b>Portland, Oregon</b><br>Test marker').openPopup()
        log('Marker added')

        // Force map to recalculate size
        setTimeout(() => {
          if (map) {
            log('Invalidating map size...')
            map.invalidateSize()
            log('Map size invalidated')
          }
        }, 100)

        log('✅ Map initialization complete!')
        
        cleanup = () => {
          log('Cleanup called from effect')
          if (map) {
            map.remove()
            map = null
          }
        }
      } catch (error) {
        log('❌ ERROR: ' + (error instanceof Error ? error.message : String(error)))
        console.error('TestMap error:', error)
      }
    }

    initMap()

    return () => {
      if (cleanup) cleanup()
    }
  })

  onDestroy(() => {
    log('onDestroy called')
    if (map) {
      map.remove()
      map = null
    }
  })
</script>

<div class="space-y-4">
  <h1 class="text-2xl font-bold">Test Map ($effect Version)</h1>
  <p class="text-white/60">Simple Leaflet map test using CDN links with $effect</p>
  
  <div 
    bind:this={mapContainer}
    class="w-full border border-white/20 rounded"
    style="height: 600px; background: #1a1a1a;"
  ></div>

  {#if logMessages.length > 0}
    <div class="mt-4 p-4 bg-black border border-white/20 rounded">
      <h2 class="text-sm font-bold mb-2">Log Messages:</h2>
      <div class="space-y-1 text-xs font-mono max-h-48 overflow-y-auto">
        {#each logMessages as message}
          <div class="text-white/70">{message}</div>
        {/each}
      </div>
    </div>
  {/if}
</div>

<style>
  :global(.leaflet-container) {
    height: 100%;
    width: 100%;
  }
</style>
