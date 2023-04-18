<template>
	<canvas ref="Canvas" :width="itemvalue.width" :height="itemvalue.height"
		style="width: 100%; background-color: var(--ObjectBGColor); border-radius: var(--ObjectRadius);"
		:style="{'background-color': itemvalue.bgcolor}" @mousemove="mouseMove()" @mouseout="mouseOut()"
		@mouseover="mouseOver()" @mousedown="mouseDown()" @mouseup="mouseUp()"></canvas>
</template>
<script>
	export default {
		name: 'IC_Canvas',
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
						width: 300,
						height: 150,
						bgcolor: 'var(--ObjectBGColor)',
						draw: function (ctx, time, width, height, mouse) {
						},
						alwaysDraw: false
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
				ctx: null,
				animated: false,
				mouseposition: { x: 0, y: 0 },
				mousekeymap: {}
			}
		},
		watch: {
			itemvalue(newval) {
				if (this.itemvalue.alwaysDraw) this.animated = true
				this.animate(0)
			}
		},
		methods: {
			mouseMove() {
				this.mouseposition = { x: event.offsetX / this.$refs.Canvas.offsetWidth * this.$refs.Canvas.width, y: event.offsetY / this.$refs.Canvas.offsetHeight * this.$refs.Canvas.height }
			},
			mouseOut() {
				this.mousekeymap = {}
				if (!this.itemvalue.alwaysDraw) this.animated = false
			},
			mouseOver() {
				if (!this.itemvalue.alwaysDraw && !this.itemvalue.once) {
					this.animated = true
					this.animate()
				}
			},
			mouseDown() {
				if (this.mousekeymap[event.button] === undefined) {
					this.mousekeymap[event.button] = {
						once: true
					}
				}
			},
			mouseUp() {
				if (this.mousekeymap[event.button] !== undefined) {
					delete this.mousekeymap[event.button]
				}
			},
			animate(time) {
				this.itemvalue.draw(this.ctx, time, this.$refs.Canvas.width, this.$refs.Canvas.height, { position: this.mouseposition, keymap: this.mousekeymap })
				for (let key in this.mousekeymap) {
					this.mousekeymap[key].once = false
				}
				if (this.animated && !this.itemvalue.once)
					requestAnimationFrame(this.animate)
			}
		},
		mounted() {
			this.ctx = this.$refs.Canvas.getContext("2d")
			if (this.itemvalue.alwaysDraw) this.animated = true
			this.animate(0)
		}
	}
</script>
<style>
</style>