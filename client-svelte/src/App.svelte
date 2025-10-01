<script lang="ts">
  import { Router, Route } from 'svelte-routing'
  import Layout from './components/Layout.svelte'
  import EntityView from './pages/EntityView.svelte'
  import Login from './pages/Login.svelte'
  import Admin from './pages/Admin.svelte'

  export let url = ""
</script>

<Router {url}>
  <Layout>
    <Route path="/" component={EntityView} />
    <Route path="/login" component={Login} />
    <Route path="/admin" component={Admin} />
    <Route path="/*wildcard" component={EntityView} />
  </Layout>
</Router>
