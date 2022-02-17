<template>
<div ref="ref">
	<slot></slot>
</div>
</template>

<script>
export default {
	data() {
		return {
			observer: null,
			height: 0,
		}
	},
	mounted() {
		const elementHeight = this.$el.offsetHeight;
		this.$emit('setHeight', elementHeight);
		this.height = elementHeight;

		this.observer = new ResizeObserver(([entry]) => {
			const newHeight = entry.contentRect.height;
			if (newHeight && this.height !== newHeight) {
				const diffHeight = newHeight - this.height;
				console.log('update height', { diffHeight });
				this.$emit('updateHeight', diffHeight);
				this.height = newHeight;
			}
		});

		this.observer.observe(this.$refs.ref);
	},
}
</script>