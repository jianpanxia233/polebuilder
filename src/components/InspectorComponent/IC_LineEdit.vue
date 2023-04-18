<template>
	<div class="listview-dark">
		<div class="form-container gap">
			<div class="form-container" style="min-width: 90px; max-width: 90px;">
				<div class="title-dark" style="text-align: left; word-break: break-all;">{{ title }}
				</div>
			</div>
			<div class="form-container">
				<input class="lineedit-dark" style="flex: 1; min-width: 50px; height: auto;" v-model="tempvalue"
					:placeholder="itemvalue.placeholder" @change="update()" />
			</div>
		</div>
	</div>
</template>
<script>
	export default {
		name: 'IC_LineEdit',
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
						value: '',
						placeholder: ''
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
				tempvalue: this.value,
			}
		},
		watch: {
			itemvalue(val, oldval) {
				this.init(val)
			}
		},
		methods: {
			test() {
				//console.log(">>>>> com")
			},
			init(val) {
				this.tempvalue = val.value
			},
			update() {
				// //console.log(">>>>>", this.action)
				this.$emit('datachange', this.action, this.tempvalue)
				// this.$EventBus.$emit(this.uid + "_inspectorUpdate", this.action, this.tempvalue)
			}
		},
		mounted() {
			this.init(this.itemvalue)
		}
	}
</script>
<style>
</style>
