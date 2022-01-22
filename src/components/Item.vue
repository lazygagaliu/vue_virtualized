<template>
<div>
	<slot></slot>
</div>
</template>

<script>
export default {
	mounted() {
		// console.log(this.$el.offsetHeight);
		this.$emit('setHeight', this.$el.offsetHeight);
	}
}
</script>

<style>

</style>