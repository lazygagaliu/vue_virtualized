<template>
  <div id="app">
    <Virtualized 
      :data="posts"
      :direction="'to_top'"
      @handleCross="loadMore"
    />
  </div>
</template>

<script>
import Virtualized from './components/Virtualized.vue'
import data, { moreData } from './helper/data';

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
    loadMore() {
      console.log('entered');
      setTimeout(() => {
        this.posts = [...this.posts, ...moreData(this.posts.length)]
      }, 800)
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
