<template>
	<div class="listview-dark">
		<div class="form-vcontainer gap">
			<div class="form-container">
				<div class="title-dark noleftmargin" style="text-align: left; flex: 1;">{{title}}</div>
			</div>
			<div class="form-container">
				<textarea class="textarea-dark"
					:style="{'flex': '1', 'min-height': '200px', 'resize': 'vertical', 'font-family': itemvalue.code? 'consolas':'dengxian','line-height': itemvalue.code? '1.2':'1'}"
					:disabled="itemvalue.readonly" :placeholder="itemvalue.placeholder" v-model="tempvalue"
					@change="update()" />
				</div>
	</div></div>
</template>
<script>
	export default {
		name: 'IC_Textarea',
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
						placeholder: '',
						readonly: false,
						code: false
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
			init(val) {
				this.tempvalue = val.value
			},
			update() {
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