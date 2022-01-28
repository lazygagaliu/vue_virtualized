<template>
	<div>
		<!-- <div ref="top">loading...</div> -->
		<slot></slot>
		<div ref="bottom">loading...</div>
	</div>
</template>
<script>
// import Fragment from './Fragment.vue';

export default {
	components: {
		// Fragment
	},
	data() {
		return {
			observer: null
		}
	},
	props: {
		direction: {
			type: String,
			default: 'to_bottom'
		},
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
    this.observer.observe(this.$refs.bottom);
	}
}
</script>
