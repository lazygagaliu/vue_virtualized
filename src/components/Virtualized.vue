<template>
  <div class="container" ref="container" @scroll="handleScroll">
    <div :class="['float', { reverse: isToTop }]" :style="{ paddingTop: `${paddingTop}px`, paddingBottom: `${paddingBottom}px` }">
        <div v-for="item in displayedData" :key="item.id">
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

const SCROLL_DIRECTION = {
	TO_TOP: 'to_top',
	TO_BOTTOM: 'to_bottom'
};

export default {
  name: 'Virtualized',
  components: {
    Item,
  },
  data() {
    return {
      heightsMap: new Map(),
      pageArray: [],
      displayedData: [],
      paddingTop: 0,
      paddingBottom: 0,
    }
  },
  props: {
    data: {
      type: Array,
      default: () => ([])
    },
    direction: {
      type: String,
      default: SCROLL_DIRECTION.TO_BOTTOM
    },
  },
  computed: {
    isToTop() {
      return this.direction === SCROLL_DIRECTION.TO_TOP;
    },
    isToBottom() {
      return this.direction === SCROLL_DIRECTION.TO_BOTTOM;
    }
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
      }
    },
    handleScroll(e) {
      const offset = this.getOffset(e);

      const isGoForward = offset > this.offset;
      if (isGoForward && (offset < this.$parent.$el.clientHeight)) return;
      const currentPage = this.pageArray.findIndex(page => this.heightsMap.get(page) > offset)
      console.log({ currentPage });
      this.displayedData = this.data.slice(this.pageArray[currentPage - 1], this.pageArray[currentPage + 2])
      const itemIndexBeforePage = this.pageArray[currentPage - 1];
      const itemIndexAfterPage = this.pageArray[currentPage + 2];

      this.calculatePadding(itemIndexBeforePage, itemIndexAfterPage);
      console.log({ itemIndexBeforePage, itemIndexAfterPage });
    },
    getOffset(e) {
      return this.isToTop ? e.target.scrollHeight - e.target.scrollTop - e.target.clientHeight : e.target.scrollTop;
    },
    calculatePadding(itemIndexBeforePage, itemIndexAfterPage) {
      if (this.isToTop) {
        this.paddingBottom = itemIndexBeforePage ? this.heightsMap.get(itemIndexBeforePage - 1) : 0;
        this.paddingTop = itemIndexAfterPage ? this.heightsMap.get(this.heightsMap.size - 1) - this.heightsMap.get(itemIndexAfterPage - 1) : 0;
      } else {
        this.paddingTop = itemIndexBeforePage ? this.heightsMap.get(itemIndexBeforePage - 1) : 0;
        this.paddingBottom = itemIndexAfterPage ? this.heightsMap.get(this.heightsMap.size - 1) - this.heightsMap.get(itemIndexAfterPage - 1) : 0;
      }
    },
    handleCross() {
      // this.$emit('handleCross')
    },
    concatDisplayDataAndNewData(firstIndexInNewData) {
      this.displayedData = [...this.displayedData, ...this.data.slice(firstIndexInNewData, this.data.length)];
    }
  },
  watch: {
    data(newData, prevData) {
      if (newData.length !== prevData) {
        console.log('get more', newData);
        this.concatDisplayDataAndNewData(prevData.length);
      }
    },
  },
  created() {
    this.displayedData = this.data;
  },
  mounted() {
    this.isToTop && (this.$refs.container.scrollTop = this.$refs.container.scrollHeight);
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
  min-height: 100vh;
}

.reverse {
  display: flex;
  flex-direction: column-reverse;
}
</style>
