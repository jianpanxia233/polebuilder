<template>
	<div ref="Tabs" @click="show = !show">
		<slot name="button"></slot>
		<div v-if="show" class="Background" :style="{'z-index': Zindex}" @click.self.stop=" show=false"
			@contextmenu.prevent.stop></div>
		<div ref="ResizeContainer" id="ResizeContainer" class="listview-dark"
			:style="{'z-index': Zindex, 'visibility': show? 'visible': 'hidden', 'max-width': Width + 'px', 'min-width': Width + 'px'}"
			@click.stop>
			<slot name="panel"></slot>
		</div>
	</div>
</template>
<script>
	export default {
		name: 'ButtonDark',
		components: {

		},
		props: {
			Zindex: {
				type: Number,
				default: 1
			},
			TopAdditional: {
				type: Number,
				default: 0
			},
			Margin: {
				type: Number,
				default: 8
			},
			Width: {
				type: Number,
				default: 300
			}
		},
		data() {
			return {
				show: false
			}
		},
		computed: {
		},
		watch: {
			show(newval) {
				if (newval) {
					function getElementToPageTop(el) {
						if (el.offsetParent) {
							return getElementToPageTop(el.offsetParent) + el.offsetTop
						}
						return el.offsetTop
					}
					function getElementToPageLeft(el) {
						if (el.offsetParent) {
							return getElementToPageLeft(el.offsetParent) + el.offsetLeft
						}
						return el.offsetLeft
					}
					let x = getElementToPageLeft(this.$refs.Tabs)
					let tab_width = this.$refs.Tabs.offsetWidth
					let tab_height = this.$refs.Tabs.offsetHeight
					let y = getElementToPageTop(this.$refs.Tabs)
					let width = window.innerWidth
					let height = window.innerHeight
					// //console.log(this.$refs.ResizeContainer)
					let button_width = this.$refs.ResizeContainer.offsetWidth
					let button_height = this.$refs.ResizeContainer.offsetHeight
					let margin = this.Margin
					// //console.log((x + button_width / 2 + margin), width)
					this.$refs.ResizeContainer.style.left = ((x + button_width / 2 + tab_width / 2 + margin) > width ? width - (button_width + margin) : ((x - button_width / 2 - tab_width / 2) < 0 ? margin : x - button_width / 2 + tab_width / 2)) + 'px'
					if ((y + tab_height + this.TopAdditional + button_height + margin) > height) {
						this.$refs.ResizeContainer.style.top = 'unset'
						this.$refs.ResizeContainer.style.bottom = (height - y + this.TopAdditional) + 'px'
					}
					else {
						this.$refs.ResizeContainer.style.top = (y + tab_height + this.TopAdditional) + 'px'
						this.$refs.ResizeContainer.style.bottom = 'unset'
					}
				}
			}
		},
		methods: {

		},
		mounted() {

		},
		destroyed() {

		}
	}
</script>
<style scoped>
	.Background {
		position: fixed;
		left: 0;
		right: 0;
		top: 0;
		bottom: 0;
		background-color: transparent;
		pointer-events: all;
	}

	#ResizeContainer {
		position: fixed;
		left: 0px;
		top: 0px;
		background-color: var(--PanelColor);
		margin: 0px;
		width: max-content;
		z-index: 1;
		padding: 10px;
		box-shadow: 0px 0px 20px 6px rgba(0, 0, 0, 0.15);
		display: flex;
		flex-direction: column;
	}
</style>
