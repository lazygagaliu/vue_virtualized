<template>
  <div id="app">
    <div class="box">
      <Virtualized 
        ref="virtualized"
        :data="posts"
        :direction="scrollDirection"
        useInfiniteScroll
        @handleCross="loadMore"
      >
        <template v-slot:child="{ item }">
          <Child :item="item" @click.native="expandItem(item.id)"/>
        </template>
      </Virtualized>
    </div>
    <button @click="addItem">Add</button>
    <button @click="addItems">Add Bunch</button>
  </div>
</template>

<script>
import Virtualized from './components/Virtualized.vue'
import Child from './components/Child.vue'
import data, { moreData, content2, getRandomContent, contents } from './helper/data';

export default {
  name: 'App',
  components: {
    Virtualized,
    Child
  },
  data() {
    return {
      posts: data,
      scrollDirection: 'to_bottom',
      n: 30,
    }
  },
  methods: {
    loadMore(prevHeight) {
      console.log('entered');
      setTimeout(() => {
        this.posts = [...this.posts, ...moreData(this.n)]
        this.n = this.posts.length;
        // workaround for fetching more data while the direction is toTop, scroll position will jump to the very top without this workaround
        this.$nextTick(() => {
          // debugger
          if (this.scrollDirection === 'to_top' && this.$refs.virtualized.$el.scrollTop === 0) this.$refs.virtualized.$el.scrollTo({
            top: this.$refs.virtualized.$el.scrollHeight - prevHeight,
            behavior: 'auto',
          });
        })
      }, 800)
    },
    addItem() {
      this.posts = [{
        id: Math.random(),
        // content: contents[`content${getRandomContent()}`]
        content: content2
      }, ...this.posts];
      this.$nextTick(() => {
        if (this.scrollDirection === 'to_top') this.$refs.virtualized.$el.scrollTo({
          top: this.$refs.virtualized.$el.scrollHeight,
          behavior: 'smooth',
        });
      });
    },
    addItems() {
      const scrollPosition = this.$refs.virtualized.$el.scrollTop;
      const more = Array.from({ length: 10 }, () => ({
        id: Math.random(),
        content: contents[`content${getRandomContent()}`],
      }))
      this.posts = [...more, ...this.posts];
      this.$nextTick(() => {
        if (this.scrollDirection === 'to_top') this.$refs.virtualized.$el.scrollTo({
          top: scrollPosition,
          behavior: 'auto',
        });
      });
    },
    expandItem(id) {
      console.log('expand', id);
      const updatedItem = this.posts.find(item => item.id === id);
      updatedItem.content += updatedItem.content;
      this.$refs.virtualized.handleChangeItem(id, updatedItem);
    },
    deleteItem(id) {
      console.log('delete', id);
      this.posts = this.posts.filter(item => item.id !== id);
      this.$refs.virtualized.handleDeleteItem(id);
    },
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
  height: 400px;
}
.box {
  height: 400px;
}
</style>
