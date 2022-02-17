<template>
	<div ref="infiniteScrollPlaceHolder">
		<slot>
			loading...
		</slot>
	</div>
</template>
<script>

export default {
	components: {
	},
	data() {
		return {
			observer: null
		}
	},
	props: {
		options: {
			type: Object,
			default: () => ({})
		},
	},
	mounted() {
		this.observer = new IntersectionObserver(([entry]) => {
			if (entry.isIntersecting) this.$emit('handleCross')
    }, this.options)
		console.log(this.$refs);
    this.observer.observe(this.$refs.infiniteScrollPlaceHolder);
	}
}
</script>
