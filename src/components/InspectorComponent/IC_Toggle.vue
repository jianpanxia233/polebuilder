<template>
	<div class="listview-dark">
		<div class="form-container gap">
			<div class="form-container" style="min-width: 90px; max-width: 90px;">
				<div class="title-dark" style="text-align: left; word-break: break-all;">
					{{ title }}</div>
			</div>
			<div class="form-container leftpadding right">
				<input class="checkbox1-dark" type="checkbox" v-model="toggle" @change="update()" />
			</div>
		</div>
	</div>
</template>
<script>
	export default {
		name: 'IC_Toggle',
		props: {
			uid: {
				type: String,
				default: "none"
			},
			title: {
				type: String,
				default: "未命名项"
			},
			itemvalue: {
				type: Object,
				default: () => { return { value: false } }
			},
			action: {
				type: String,
				default: "未定"
			}
		},
		data() {
			return {
				toggle: false,
			}
		},
		watch: {
			itemvalue(val, oldval) {
				this.init(val)
			}
		},
		methods: {
			init(val) {
				this.toggle = val.value
			},
			update() {
				this.$emit('datachange', this.action, this.toggle)
				// this.$EventBus.$emit(this.uid + "_inspectorUpdate", this.action, this.toggle)
			}
		},
		mounted() {
			this.init(this.itemvalue)
		}
	}
</script>
<style>
</style>