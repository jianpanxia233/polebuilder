<template>
	<div class="listview-dark">
		<div class="form-container gap">
			<div v-if="title !== ''" class="form-container" style="min-width: 90px; max-width: 90px;">
				<div class="title-dark" style="text-align: left; word-break: break-all;">{{ title }}
				</div>
			</div>
			<div class="form-container gap">
				<div v-for="(item, index) in itemvalue.list" class="button-dark"
					style="flex: 1; justify-content: center; min-width: fit-content;" @click="update(item)"
					:key="item+index">
					<a class="button-text">{{item}}</a>
				</div>
			</div>
		</div>
	</div>
</template>
<script>
	export default {//不仅要传tittle
		name: 'IC_Button',
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
						list: []
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
			}
		},
		watch: {
		},
		methods: {
			init(val) {

			},
			update(item) {
				this.$emit('datachange', this.action, item)
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