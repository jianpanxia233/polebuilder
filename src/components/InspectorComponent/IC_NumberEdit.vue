<template>
	<div class="listview-dark">
		<div class="form-container gap">
			<div class="form-container" style="min-width: 90px; max-width: 90px;">
				<div class="title-dark" style="text-align: left; word-break: break-all;">
					{{ title }}</div>
			</div>
			<div class="form-container leftpadding">
				<input class="lineedit-dark" style="flex: 1; min-width: 50px; height: auto;" type="number"
					:min="itemvalue.min" :max="itemvalue.max" :step="itemvalue.step" v-model="tempvalue"
					@change="update()" />
			</div>
		</div>
	</div>
</template>
<script>
	export default {
		name: 'IC_NumberEdit',
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
				default: () => {
					return {
						value: 0,
						placeholder: 0,
						min: 0,
						max: 100,
						step: 1,
					}
				}
			},
			action: {
				type: String,
				default: "未定"
			}
		},
		data() {
			return {
				tempvalue: this.itemvalue.value
			}
		},
		watch: {
			itemvalue(val, oldval) {
				this.tempvalue = val.value
			}
		},
		methods: {
			update() {
				this.$emit('datachange', this.action, this.tempvalue)
				// this.$EventBus.$emit(this.uid + "_inspectorUpdate", this.action, this.tempvalue)
			}
		},
		mounted() {
			this.tempvalue = this.itemvalue.value
		}
	}
</script>
<style>
</style>