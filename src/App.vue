<template>
  <div id="app">
    <Virtualized 
      :data="posts"
    />
  </div>
</template>

<script>
import Virtualized from './components/Virtualized.vue'
import data from './helper/data';

export default {
  name: 'App',
  components: {
    Virtualized
  },
  data() {
    return {
      posts: data,
    }
  },
}
</script>

<style>
* {
  box-sizing: border-box;
}

body {
  margin: 0;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
