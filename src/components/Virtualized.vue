<template>
  <div class="container">
    <div class='float' :style="{ paddingTop: `${paddingTop}px`, paddingBottom: `${paddingBottom}px` }">
      <div  v-for="item in displayedData" :key="item.id">
        <Item @setHeight="(height) => cacheHeights(item.id, height)">
            <div>{{ item.id }}</div>
            <div>{{ item.content }}</div>
        </Item>
      </div>
    </div>
  </div>
</template>

<script>
import Item from './Item.vue';

export default {
  name: 'Virtualized',
  components: {
    Item
  },
  data() {
    return {
      heightsMap: new Map(),
      pageArray: [],
      displayedData: [],
      paddingTop: 0,
      paddingBottom: 0
    }
  },
  props: {
    data: {
      type: Array,
      default: () => ([])
    },
  },
   methods: {
    cacheHeights(id, height) {
      if (this.heightsMap.has(id)) return;
      if (id === 0) this.heightsMap.set(id, height);
      else {
        const totalHeight = height + this.heightsMap.get(id - 1)
        const rootHeight = this.$parent.$el.clientHeight
        this.heightsMap.set(id, totalHeight);
        if (Math.floor(totalHeight / rootHeight) > this.pageArray.length) this.pageArray.push(id);
      }

      if (this.heightsMap.size === this.data.length) {
        console.log('finished store heights map');
        // setRenderedDataToGetHeight(prev => prev.map((item, i) => {
        //   const pageKey = pageArray.current.findIndex(key => key === item.id)
        //   if (pageKey !== -1) return {...item, pageKey};
        //   else return item;
        // }))
      }
    },
    handleScroll(e) {
      console.log(e.target.scrollTop);
      const offset = e.target.scrollTop;
      if (offset < this.$parent.$el.clientHeight * 3) return
      const currentPage = this.pageArray.findIndex(page => this.heightsMap.get(page) > offset)
      const lastItemOfCurrentPage = this.pageArray[currentPage];
      console.log({ currentPage, lastItemOfCurrentPage });
      this.displayedData = this.data.slice(this.pageArray[currentPage - 1], this.pageArray[currentPage + 2])

      const pageIndexBeforePage = this.pageArray[currentPage - 1];
      const pageIndexAfterPage = this.pageArray[currentPage + 2];
      this.paddingTop = this.heightsMap.get(pageIndexBeforePage - 1);
      this.paddingBottom = this.heightsMap.get(this.heightsMap.size - 1) - this.heightsMap.get(pageIndexAfterPage - 1);
    },
  },
  created() {
    this.displayedData = this.data;
  },
  mounted() {
    document.querySelector('.container').addEventListener('scroll', this.handleScroll)
  },
  updated() {
  },
}
</script>

<style scoped>
.container {
  width: 100%;
  height: 100vh;
  overflow: auto;
  position: relative;
}

.float {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
}
</style>
