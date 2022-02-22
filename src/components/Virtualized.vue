<template>
  <div class="container" ref="container" @scroll.passive="handleScroll">
    <div :class="['float', { reverse: isToTop }]" :style="{ paddingTop: `${paddingTop}px`, paddingBottom: `${paddingBottom}px` }">
      <Item 
        v-for="item in displayedData"
        :key="item.id"
        @setHeight="(height) => cacheHeights(item.serialNumber, height)"
        @updateHeight="(height) => updateHeights(item.serialNumber, height)"
      >
        <slot name="child" :item="item"></slot>
      </Item>
      <LoadingComponent v-if="useInfiniteScroll" :options="{ root: $refs.container }" @handleCross="handleCross" />
    </div>
  </div>
</template>

<script>
import Item from './Item.vue';
import LoadingComponent from './LoadingComponent.vue';

const SCROLL_DIRECTION = {
	TO_TOP: 'to_top',
	TO_BOTTOM: 'to_bottom'
};

export default {
  name: 'Virtualized',
  components: {
    Item,
    LoadingComponent,
  },
  data() {
    return {
      sequenceData: [],
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
    useInfiniteScroll: {
      type: Boolean,
      default: false,
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
      console.log(id, height);
      if (this.heightsMap.has(id)) return;

      if (id === 0) this.heightsMap.set(id, height);
      else {
        const totalHeight = height + this.heightsMap.get(id - 1);
        const rootHeight = this.$el.parentNode.clientHeight;
        this.heightsMap.set(id, totalHeight);
        if (Math.floor(totalHeight / rootHeight) > this.pageArray.length) this.pageArray.push(id);
      }

      if (this.heightsMap.size === this.data.length) {
        console.log('finished store heights map');
      }
    },
    updateHeights(id, diffHeight) {
      const resetFromPageArrayIndex = this.pageArray.findIndex(i => i >= id);
      const newPageArray = resetFromPageArrayIndex > -1 ? this.pageArray.slice(0, resetFromPageArrayIndex) : [];
      const rootHeight = this.$el.parentNode.clientHeight;
      // console.log({
      //   id,
      //   resetFromPageArrayIndex,
      //   newPageArray
      // });
      for(let i = id; i < this.heightsMap.size; i++) {
        const originTotalHeight = this.heightsMap.get(i);
        const newTotalHeight = originTotalHeight + diffHeight;
        this.heightsMap.set(i, newTotalHeight);
        // console.log({
        //   newTotalHeight,
        //   rootHeight,
        //   math: Math.floor(newTotalHeight / rootHeight),
        //   newPageArray
        // })
        if (Math.floor(newTotalHeight / rootHeight) > newPageArray.length) newPageArray.push(i);
      }
      this.pageArray = [...newPageArray];
      // console.log(newPageArray)
    },
    handleScroll(e) {
      const offset = this.getOffset(e);

      const isGoForward = offset > this.offset;
      if (isGoForward && (offset < this.$el.parentNode.clientHeight)) return;
      const currentPage = this.pageArray.findIndex(page => this.heightsMap.get(page) > offset)
      // console.log({ currentPage });
      this.displayedData = this.sequenceData.slice(this.pageArray[currentPage - 1], this.pageArray[currentPage + 2])
      const itemIndexBeforePage = this.pageArray[currentPage - 1];
      const itemIndexAfterPage = this.pageArray[currentPage + 2];

      this.calculatePadding(itemIndexBeforePage, itemIndexAfterPage);
      // console.log({ itemIndexBeforePage, itemIndexAfterPage });
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
      // console.log('cross');
      this.$emit('handleCross')
    },
    concatOldDataAndNewData(firstIndexInNewData) {
      const newData = this.data.slice(firstIndexInNewData, this.data.length).map((item, i) => ({ ...item, serialNumber: firstIndexInNewData + i }))
      this.displayedData = [...this.displayedData, ...newData];
      this.sequenceData = [...this.sequenceData, ...newData];
    },
    // temp
    handleClickItem(item) {
      item.content = item.content + item.content;
    },
  },
  watch: {
    data(newData, prevData) {
      if (newData.length !== prevData) {
        this.concatOldDataAndNewData(prevData.length);

        // workaround for fetching more data while the direction is toTop, scroll position will jump to the very top without this workaround
        this.$nextTick(() => {
          if (this.isToTop && this.$refs.container.scrollTop === 0) this.$refs.container.scrollTo({
            top: this.$refs.container.scrollHeight - this.heightsMap.get(prevData.length - 1),
            behavior: 'auto',
          });
        })
      }
    },
  },
  created() {
    const sequenceData = this.data.map((item, i) => ({ ...item, serialNumber: i }));
    this.sequenceData = sequenceData;
    this.displayedData = sequenceData;
  },
  mounted() {
    this.isToTop && (this.$refs.container.scrollTop = this.$refs.container.scrollHeight);
  },
  updated() {
    // console.log(this.$refs.container.scrollTop);
  },
}
</script>

<style scoped>
.container {
  width: 100%;
  height: 100%;
  overflow: auto;
  position: relative;
}

.float {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  min-height: 100%;
}

.reverse {
  display: flex;
  flex-direction: column-reverse;
}
</style>
