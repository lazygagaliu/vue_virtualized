<template>
  <div id="app">
    <Virtualized 
      :data="posts"
      :direction="'to_bottom'"
      @handleCross="call"
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
  methods: {
    call() {
      console.log('entered');
    }
  }
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
