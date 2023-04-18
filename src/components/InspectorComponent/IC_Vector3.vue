<template>
	<div class="listview-dark">
		<div class="form-vcontainer gap">
			<div class="form-container">
				<div class="title-dark noleftmargin" style="text-align: left; flex: 1;">{{title}}</div>
			</div>
			<div class="form-container gap">
				<div class="form-container gap">
					<input class="lineedit-dark"
						style="flex: 1; background-color: var(--ElementColorRed); min-width: 50px; color: var(--FontColorReverse);"
						type="number" :min="itemvalue.min" :max="itemvalue.max" :step="itemvalue.step" v-model="input_x"
						placeholder="0" @change="update()" @dblclick="resetX()" /><span
						v-if="itemvalue.unit !== undefined" style="align-self: center;">{{itemvalue.unit}}</span>
				</div>
				<div class="form-container gap">
					<input class="lineedit-dark" id="y"
						style="flex: 1; background-color: var(--ElementColorGreen); min-width: 50px; color: var(--FontColorReverse);"
						type="number" :min="itemvalue.min" :max="itemvalue.max" :step="itemvalue.step" v-model="input_y"
						placeholder="0" @change="update()" @dblclick="resetY()" /><span
						v-if="itemvalue.unit !== undefined" style="align-self: center;">{{itemvalue.unit}}</span>
				</div>
				<div class="form-container gap">
					<input class="lineedit-dark" id="z"
						style="flex: 1; background-color: var(--ElementColorBlue); min-width: 50px; color: var(--FontColorReverse);"
						type="number" :min="itemvalue.min" :max="itemvalue.max" :step="itemvalue.step" v-model="input_z"
						placeholder="0" @change="update()" @dblclick="resetZ()" /><span
						v-if="itemvalue.unit !== undefined" style="align-self: center;">{{itemvalue.unit}}</span>
				</div>
			</div>
		</div>
	</div>
</template>
<script>
	export default {//不仅要传tittle
		name: 'IC_Vector3',
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
						x: 0, y: 0, z: 0, min: -100000, max: 100000, step: 1, unit: 'm', multiplier: 0.001, round: true
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
				inputy: 0,
				inputz: 0
			}
		},
		computed: {
			input_x: {
				// getter
				get: function () {
					if (this.itemvalue.round === undefined || this.itemvalue.round) {
						return Math.round(this.inputx / this.itemvalue.multiplier)
					}
					return this.inputx / this.itemvalue.multiplier
				},
				// setter
				set: function (newval) {
					this.inputx = newval * this.itemvalue.multiplier
				}
			},
			input_y: {
				// getter
				get: function () {
					if (this.itemvalue.round === undefined || this.itemvalue.round) {
						return Math.round(this.inputy / this.itemvalue.multiplier)
					}
					return this.inputy / this.itemvalue.multiplier
				},
				// setter
				set: function (newval) {
					this.inputy = newval * this.itemvalue.multiplier
				}
			},
			input_z: {
				// getter
				get: function () {
					if (this.itemvalue.round === undefined || this.itemvalue.round) {
						return Math.round(this.inputz / this.itemvalue.multiplier)
					}
					return this.inputz / this.itemvalue.multiplier
				},
				// setter
				set: function (newval) {
					this.inputz = newval * this.itemvalue.multiplier
				}
			}
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
				this.inputz = val.z
			},
			update() {
				let x, y, z
				if (this.inputx === '') x = 0
				else x = parseFloat(this.inputx)
				if (this.inputy === '') y = 0
				else y = parseFloat(this.inputy)
				if (this.inputz === '') z = 0
				else z = parseFloat(this.inputz)
				let msg = { x: x, y: y, z: z }
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
			},
			resetZ() {
				this.inputz = this.itemvalue.z
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