<template>
	<div class="listview-dark">
		<div class="form-vcontainer gap">
			<div class="form-container">
				<div class="title-dark noleftmargin" style="text-align: left; flex: 1;">{{title}}</div>
			</div>
			<div class="form-container gap">
				<input class="lineedit-dark"
					style="flex: 1; background-color: var(--ElementColorRed); min-width: 50px; color: var(--FontColorReverse);"
					type="number" :min="itemvalue.min" :max="itemvalue.max" :step="itemvalue.step" v-model="inputx"
					placeholder="0" @change="update()" @dblclick="resetX()" />
				<input class="lineedit-dark" id="y"
					style="flex: 1; background-color: var(--ElementColorGreen); min-width: 50px; color: var(--FontColorReverse);"
					type="number" :min="itemvalue.min" :max="itemvalue.max" :step="itemvalue.step" v-model="inputy"
					placeholder="0" @change="update()" @dblclick="resetY()" />
			</div>
		</div>
	</div>
</template>
<script>
	export default {//不仅要传tittle
		name: 'IC_Vector2',
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
						x: 0, y: 0, min: -100000, max: 100000, step: 1
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
				inputx: 0,
				inputy: 0
			}
		},
		computed: {

		},
		watch: {
			itemvalue(val, oldval) {
				this.init(val)
			}
		},
		methods: {
			init(val) {
				this.inputx = val.x
				this.inputy = val.y
			},
			update() {
				let x, y, z
				if (this.inputx === '') x = 0
				else x = parseFloat(this.inputx)
				if (this.inputy === '') y = 0
				else y = parseFloat(this.inputy)
				let msg = { x: x, y: y }
				this.$emit('datachange', this.action, msg)
				// this.$EventBus.$emit(this.uid + "_inspectorUpdate", this.action, msg)
			},
			resetX() {
				this.inputx = this.itemvalue.x
				this.update()
			},
			resetY() {
				this.inputy = this.itemvalue.y
				this.update()
			}
		},
		mounted() {
			this.init(this.itemvalue)
		}
	}
</script>
<style>
</style>