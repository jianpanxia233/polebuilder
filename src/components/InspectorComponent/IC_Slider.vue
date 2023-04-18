<template>
	<div class="listview-dark">
		<div class="form-container">
			<div class="title-dark" style="text-align: left; width: 60px;">{{ title }}</div>
			<div class="form-container sub"><input class="slider-dark" type="range" :min="min" :max="max"
					:value="tempvalue" :step="step" style="width: 100%; margin-left: 0px; min-width: 50px;"
					@change="changeValue($event)" /></div>
		</div>
	</div>
</template>
<script>
	export default {
		name: 'IC_Slider',
		props: {
			uid: {
				type: String,
				default: "none"
			},
			title: {
				type: String,
				default: "未命名项"
			},
			value: {
				type: Number,
				default: 0
			},
			min: {
				type: Number,
				default: 0
			},
			max: {
				type: Number,
				default: 10
			},
			step: {
				type: Number,
				default: 1
			},
			action: {
				type: String,
				default: "未定"
			}
		},
		data() {
			return {
				tempvalue: null,
			}
		},
		watch: {
			value(val, oldval) {  //点击不更新是因为没有变，可能要用update实时更新
				this.tempvalue = val
			}
		},
		methods: {
			changeValue(event) {
				this.tempvalue = parseFloat(event.currentTarget.value)
				this.getAll()
			},
			getAll() {
				let msg = { type: this.type, action: this.action, data: { value: this.tempvalue, min: this.min, max: this.max, step: this.step } }
				this.$EventBus.$emit(this.uid + "_inspectorUpdate", msg)
			}
		},
		mounted() {
		}
	}
</script>
<style>
</style>