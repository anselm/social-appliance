<script lang="ts">
  import { Router, Route } from 'svelte-routing'
  import Layout from './components/Layout.svelte'
  import Home from './pages/Home.svelte'
  import Group from './pages/Group.svelte'
  import Login from './pages/Login.svelte'
  import Admin from './pages/Admin.svelte'
  import { setContext } from 'svelte'
  import { writable } from 'svelte/store'
  import type { User } from './types'

  // Create auth store
  const user = writable<User | null>(JSON.parse(localStorage.getItem('user') || 'null'))
  
  // Set auth context
  setContext('auth', {
    user,
    login: async (username: string) => {
      const mockUser = {
        id: `user-${username}`,
        slug: username,
        title: username
      }
      user.set(mockUser)
      localStorage.setItem('user', JSON.stringify(mockUser))
    },
    logout: () => {
      user.set(null)
      localStorage.removeItem('user')
    }
  })

  export let url = ""
</script>

<Router {url}>
  <Layout>
    <Route path="/" component={Home} />
    <Route path="/login" component={Login} />
    <Route path="/g/:slug" component={Group} />
    <Route path="/admin" component={Admin} />
  </Layout>
</Router>
