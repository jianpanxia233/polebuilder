<template>
	<div class="listview-dark">
		<div class="form-vcontainer gap">
			<div class="form-container">
				<div class="title-dark noleftmargin" style="text-align: left; flex: 1;">{{title}}</div>
			</div>
			<div class="form-container hbuttonlist">
				<div v-for="(item, index) in itemvalue.list"
					:class="{'button-dark': true, 'selected': item===selected}"
					style="flex: 1; min-width: fit-content;" @click="update(item)" :key="item+index">
					<a class="button-text">{{item}}</a>
				</div>
			</div>
		</div>
	</div>
</template>
<script>
	export default {//不仅要传tittle
		name: 'IC_Select',
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
						list: [],
						selectitem: ''
					}
				}
			},
			action: {
				type: String,
				default: "未定"
			},
		},
		data() {
			return {
				selected: ''
			}
		},
		watch: {
			itemvalue(val, oldval) {
				this.init(val)
			}
		},
		methods: {
			init(val) {
				this.selected = val.selectitem
			},
			update(item) {
				if (this.selected !== item){
					this.selected = item
					this.$emit('datachange', this.action, item)
					}
				// this.$EventBus.$emit(this.uid + "_inspectorUpdate", this.action, item)
			}
		},
		mounted() {
			this.init(this.itemvalue)
		}
	}
</script>
<style>
</style>