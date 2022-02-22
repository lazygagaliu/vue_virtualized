<template>
  <div>
		<div>{{ item.id }}</div>
		<div>{{ item.content }}</div>
	</div>
</template>

<script>
export default {
	name: 'Child',
	props: {
		item: {
      type: Object,
      default: () => ({})
    },
	}
}
</script>