<script lang="ts">
  import { Router, Route } from 'svelte-routing'
  import Layout from './components/Layout.svelte'
  import Home from './pages/Home.svelte'
  import Group from './pages/Group.svelte'
  import Login from './pages/Login.svelte'
  import Admin from './pages/Admin.svelte'

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
