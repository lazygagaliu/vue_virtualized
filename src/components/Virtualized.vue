<template>
  <div class="container" ref="container" @scroll.passive="handleScroll">
    <div :class="['float', { reverse: isToTop }]" :style="{ paddingTop: `${paddingTop}px`, paddingBottom: `${paddingBottom}px` }">
      <Item 
        v-for="item in displayedData"
        :key="item.id"
        @setHeight="(height) => cacheHeights(item.serialNumber, height)"
        @updateHeight="(height) => updateHeights(item.serialNumber, height)"
        @handleClick="handleClickItem(item)"
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
      currentPage: 0,
      paddingTop: 0,
      paddingBottom: 0,
      unshiftDataLength: 0,
      unshiftDataHeightArray: [],
      itemToBeDeleted: {
        serialNumber: null,
        height: 0,
      },
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
    },
  },
  methods: {
    cacheHeights(id, height) {
      console.log(id, height);
      if (this.unshiftDataLength > 0) {
        const totalHeight = id === 0 ? height : this.unshiftDataHeightArray[this.unshiftDataHeightArray.length - 1] + height;
        this.unshiftDataHeightArray.push(totalHeight);
        if (this.unshiftDataHeightArray.length === this.unshiftDataLength) {
          this.recalculateHeightsMapAndPageArray();
          this.resetUnshiftRelatedData();
        }
      } else {
        if (this.heightsMap.has(id)) return;
        if (id === 0) this.heightsMap.set(id, height);
        else {
          const totalHeight = height + this.heightsMap.get(id - 1);
          const rootHeight = this.$el.parentNode.clientHeight;
          this.heightsMap.set(id, totalHeight);
          if (Math.floor(totalHeight / rootHeight) > this.pageArray.length) this.pageArray.push(id);
        }
      }

      if (this.heightsMap.size === this.data.length) {
        console.log('finished store heights map');
      }
    },
    recalculateHeightsMapAndPageArray() {
      const tempMap = new Map();
      const tempPageArray = [];
      const oldHeightsMapSize = this.heightsMap.size;
      // add new height to the front
      this.unshiftDataHeightArray.forEach((height, index) => {
        console.log(index);
        tempMap.set(index, height);
        if (index !== 0) {
          const rootHeight = this.$el.parentNode.clientHeight;
          if (Math.floor(height / rootHeight) > tempPageArray.length) tempPageArray.push(index);
        }
      })
      for (let i = 0; i < oldHeightsMapSize; i++) {
        const newSerialNumber = i + this.unshiftDataLength;
        const newHeight = this.heightsMap.get(i) + this.unshiftDataHeightArray[this.unshiftDataHeightArray.length - 1];
        tempMap.set(newSerialNumber, newHeight);
        const rootHeight = this.$el.parentNode.clientHeight;
          if (Math.floor(newHeight / rootHeight) > tempPageArray.length) tempPageArray.push(newSerialNumber);
      }
      this.heightsMap = tempMap;
      this.pageArray = tempPageArray;
    },
    recalculatePageArray() {},
    resetUnshiftRelatedData() {
      this.unshiftDataLength = 0;
      this.unshiftDataHeightArray = [];
    },
    updateHeights(id, diffHeight) {
      console.log('update height', { id });
      const resetFromPageArrayIndex = this.pageArray.findIndex(i => i >= id);
      const newPageArray = resetFromPageArrayIndex > -1 ? this.pageArray.slice(0, resetFromPageArrayIndex) : [];
      const rootHeight = this.$el.parentNode.clientHeight;
      for(let i = id; i < this.heightsMap.size; i++) {
        const originTotalHeight = this.heightsMap.get(i);
        const newTotalHeight = originTotalHeight + diffHeight;
        this.heightsMap.set(i, newTotalHeight);
        if (Math.floor(newTotalHeight / rootHeight) > newPageArray.length) newPageArray.push(i);
      }
      this.pageArray = [...newPageArray];
    },
    handleScroll() {
      const offset = this.getOffset();

      const isGoForward = offset > this.offset;
      if (isGoForward && (offset < this.$el.parentNode.clientHeight)) return;
      this.setDisplayedDataAndPadding(offset);
    },
    getOffset() {
      // Todo: computed?!
      return this.isToTop ? this.$refs.container.scrollHeight - this.$refs.container.scrollTop - this.$refs.container.clientHeight : this.$refs.container.scrollTop;
    },
    setDisplayedDataAndPadding(offset) {
      const currentPage = this.pageArray.findIndex(page => this.heightsMap.get(page) > offset)
      // console.log({ currentPage });
      this.displayedData = this.sequenceData.slice(this.pageArray[currentPage - 1], this.pageArray[currentPage + 2])
      const itemIndexBeforePage = this.pageArray[currentPage - 1];
      const itemIndexAfterPage = this.pageArray[currentPage + 2];

      this.calculatePadding(itemIndexBeforePage, itemIndexAfterPage);
      this.currentPage = currentPage;
      // console.log({ itemIndexBeforePage, itemIndexAfterPage });
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
      this.$emit('handleCross', this.heightsMap.get(this.data.length - 1))
    },
    concatOldDataAndNewData(firstIndexInNewData) {
      const newData = this.data.slice(firstIndexInNewData, this.data.length).map((item, i) => ({ ...item, serialNumber: firstIndexInNewData + i }))
      this.displayedData = [...this.displayedData, ...newData];
      this.sequenceData = [...this.sequenceData, ...newData];
    },
    concatNewDataAndOldData(comingData) {
      this.sequenceData = [...comingData, ...this.sequenceData].map((item, i) => ({ ...item, serialNumber: i }));
      this.setDisplayedDataByUnshiftData();
    },
    setDisplayedDataByUnshiftData() {
      const firstDisplay = this.displayedData[0].serialNumber;
      const lastDisplay = this.displayedData[this.displayedData.length - 1].serialNumber;
      const newFirstDisplay = firstDisplay + this.unshiftDataLength;
      const newLastDisplay = lastDisplay + this.unshiftDataLength;
      this.displayedData = this.sequenceData.slice(0, this.unshiftDataLength).concat(this.sequenceData.slice(newFirstDisplay, newLastDisplay + 1));
    },
    // temp
    handleClickItem() {
      // dynamic height
      // item.content = item.content + item.content;
      this.$emit('handleClickItem');
    },
    handleDeleteItem(id) {
      console.log('help me to delete item', id, this.data.length);
      const deleteItem = this.sequenceData.find(item => item.id === id);
      console.log(deleteItem);
      if (deleteItem) {
        const itemSerialNumber = deleteItem.serialNumber;
        this.itemToBeDeleted = {
          serialNumber: itemSerialNumber,
          height: itemSerialNumber === 0 ? this.heightsMap.get(itemSerialNumber) : this.heightsMap.get(itemSerialNumber) - this.heightsMap.get(itemSerialNumber - 1),
        }
      }
    },
    handleChangeItem(id, updatedItem) {
      console.log('help me to change item', id);
      const itemIndex = this.sequenceData.findIndex(item => item.id === id);
      this.sequenceData[itemIndex] = {...updatedItem, serialNumber: itemIndex};
      this.setDisplayedDataAndPadding(this.getOffset());
    }
  },
  watch: {
    data(newData, prevData) {
      // add
      if (newData.length > prevData.length) {
        if (newData[0].id === prevData[0].id) {
          // push
          this.concatOldDataAndNewData(prevData.length)
        } else {
          // unshift
          this.unshiftDataLength = newData.length - prevData.length;
          const comingData = newData.slice(0, newData.length - prevData.length);
          this.concatNewDataAndOldData(comingData);
        }
      } else if (newData.length === prevData.length) {
        // Todo: same length but different content
        console.log('update in watch');
      }
    },
    itemToBeDeleted(value, oldValue) {
      console.log('here', { value, oldValue });
      const { serialNumber, height } = value
      const resetFromPageArrayIndex = this.pageArray.findIndex(i => i >= serialNumber);
      const newPageArray = resetFromPageArrayIndex > -1 ? this.pageArray.slice(0, resetFromPageArrayIndex) : [];
      const rootHeight = this.$el.parentNode.clientHeight;
      const size = this.heightsMap.size;
      for (let i = serialNumber; i < size; i++) {
        if (i === size - 1) {
          this.heightsMap.delete(i)
        } else {
          const updateHeight = this.heightsMap.get(i + 1) - height;
          this.heightsMap.set(i, updateHeight);
          if (Math.floor(updateHeight / rootHeight) > newPageArray.length) newPageArray.push(i);
        }
      }
      this.pageArray = [...newPageArray]
      this.sequenceData = this.sequenceData.filter(item => item.serialNumber !== serialNumber).map((item, i) => ({ ...item, serialNumber: i }));
      this.displayedData = this.sequenceData.slice(this.pageArray[this.currentPage - 1], this.pageArray[this.currentPage + 2]);
      // recalculate page and displayed data after deleting item
      this.setDisplayedDataAndPadding(this.getOffset());
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
