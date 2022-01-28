<template>
  <div class="container" ref="container" @scroll="handleScroll">
    <div class='float' :style="{ paddingTop: `${paddingTop}px`, paddingBottom: `${paddingBottom}px` }">
      <!-- <LoadingComponent v-if="isToTop" :options="{ root: $refs.container }" @handleCross="handleCross" /> -->
      <LoadingComponent v-if="isToBottom" :options="{ root: $refs.container }" @handleCross="handleCross" >
        <div v-for="item in displayedData" :key="item.id">
          <Item @setHeight="(height) => cacheHeights(item.id, height)">
              <div>{{ item.id }}</div>
              <div>{{ item.content }}</div>
          </Item>
        </div>
      </LoadingComponent>
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
    LoadingComponent
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
      console.log(e.target.scrollTop);
      const offset = e.target.scrollTop;
      const scrollDirection = offset > this.offset ? SCROLL_DIRECTION.TO_BOTTOM : SCROLL_DIRECTION.TO_TOP;
      if (scrollDirection === SCROLL_DIRECTION.TO_BOTTOM && (offset < this.$parent.$el.clientHeight)) return
      const currentPage = this.pageArray.findIndex(page => this.heightsMap.get(page) > offset)
      this.displayedData = this.data.slice(this.pageArray[currentPage - 1], this.pageArray[currentPage + 2])

      const itemIndexBeforePage = this.pageArray[currentPage - 1];
      const itemIndexAfterPage = this.pageArray[currentPage + 2];
      this.offset = offset;
      this.paddingTop = itemIndexBeforePage ? this.heightsMap.get(itemIndexBeforePage - 1) : 0;
      this.paddingBottom = itemIndexAfterPage ? this.heightsMap.get(this.heightsMap.size - 1) - this.heightsMap.get(itemIndexAfterPage - 1) : 0;
      console.log({ itemIndexBeforePage, itemIndexAfterPage });
    },
    handleCross() {
      this.$emit('handleCross')
    }
  },
  created() {
    this.displayedData = this.data;
  },
  mounted() {
    this.direction === SCROLL_DIRECTION.TO_TOP && (this.$refs.container.scrollTop = this.$refs.container.scrollHeight);
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
