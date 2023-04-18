<template>
	<div ref="Tabs" :style="{'background-color': 'rgb('+r+','+g+','+b+')'}" @click.self="show = !show">
		<div v-if="show" class="Background" @click.self.stop="show = false" @contextmenu.prevent.stop
			:style="{'z-index': Zindex}"></div>
		<div ref="ResizeContainer" id="ResizeContainer" class="listview-dark"
			:style="{'z-index': Zindex, 'visibility': show? 'visible': 'hidden'}">
			<div class="form-vcontainer">
				<div class="form-container vcenter buttonpanel">

					<div class="button-dark flex noleftmargin nobottommargin"
						:style="{'background-color': 'rgb('+r+','+g+','+b+')', 'height': '40px'}">
						<a class="button-text"
							:style="{'color': get_Light > 130? 'black' : 'white', 'font-size': '16px'}">rgb({{r}},
							{{g}},
							{{b}})</a>
					</div>

				</div>
				<template v-if="type==='hsl'">
					<div class="form-container vcenter buttonpanel">
						<input id="ColorPickerSliderH" class="slider-dark ColorPickerSlider" type="range" min="0"
							max="360" step="1" v-model.number="r" />
						<input class="lineedit-dark" type="number"
							style="width: 60px; margin-bottom: 0px; margin-left: 10px; background-color: var(--ElementColorRed);"
							v-model.number="r" />
					</div>
					<div class="form-container vcenter buttonpanel">
						<input id="ColorPickerSliderS" class="slider-dark ColorPickerSlider" type="range" min="0"
							max="255" step="1" v-model.number="g" />
						<input class="lineedit-dark" type="number"
							style="width: 60px; margin-bottom: 0px; margin-left: 10px; background-color: var(--ElementColorGreen); color: var(--FontColorReverse);"
							v-model.number="g" />
					</div>
					<div class="form-container vcenter buttonpanel">
						<input id="ColorPickerSliderL" class="slider-dark ColorPickerSlider" type="range" min="0"
							max="255" step="1" v-model.number="b" />
						<input class="lineedit-dark" type="number"
							style="width: 60px; margin-bottom: 0px; margin-left: 10px; background-color: var(--ElementColorBlue); color: var(--FontColorReverse);"
							v-model.number="b" />
					</div>
				</template>
				<template v-else-if="type==='rgb'">
					<div class="form-container vcenter buttonpanel">
						<input id="ColorPickerSliderR" :data-color="'rgb(123,123,45)'"
							class="slider-dark ColorPickerSlider" type="range" min="0" max="255" step="1"
							v-model.number="r" />
						<input class="lineedit-dark" type="number"
							style="width: 60px; margin-bottom: 0px; margin-left: 10px; background-color: var(--ElementColorRed); color: var(--FontColorReverse);"
							v-model.number="r" />
					</div>
					<div class="form-container vcenter buttonpanel">
						<input id="ColorPickerSliderG" class="slider-dark ColorPickerSlider" type="range" min="0"
							max="255" step="1" v-model.number="g" />
						<input class="lineedit-dark" type="number"
							style="width: 60px; margin-bottom: 0px; margin-left: 10px; background-color: var(--ElementColorGreen); color: var(--FontColorReverse);"
							v-model.number="g" />
					</div>
					<div class="form-container vcenter">
						<input id="ColorPickerSliderB" class="slider-dark ColorPickerSlider" type="range" min="0"
							max="255" step="1" v-model.number="b" />
						<input class="lineedit-dark" type="number"
							style="width: 60px; margin-bottom: 0px; margin-left: 10px; background-color: var(--ElementColorBlue); color: var(--FontColorReverse);"
							v-model.number="b" />
					</div>
				</template>
			</div>
			<!-- <div id="BoxButton" class="button-dark" @click="show = false">
				<a class="button-text">完成</a>
			</div> -->
			<!-- <div id="BoxButton" class="form-container">
				<div class="title-dark">123</div>
				<input type="checkbox" class="checkbox-dark">
			</div> -->
		</div>
	</div>
</template>
<script>
	export default {
		name: 'colorpicker-dark',
		components: {

		},
		model: {
			prop: 'Color',
			event: 'change'
		},
		props: {
			Zindex: {
				type: Number,
				default: 1
			},
			TopAdditional: {
				type: Number,
				default: 6
			},
			Margin: {
				type: Number,
				default: 8
			},
			Color: {
				type: Object,
				default: () => { return { r: 0, g: 0, b: 0 } }
			}
		},
		data() {
			return {
				r: 255,
				g: 0,
				b: 255,
				show: false,
				type: 'rgb'
			}
		},
		computed: {
			get_Light: function () {
				return 0.3 * this.r + 0.6 * this.g + 0.1 * this.b
			}
		},
		watch: {
			Color(newval) {
				this.r = newval.r
				this.g = newval.g
				this.b = newval.b
			},
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
					this.$refs.ResizeContainer.style.top = ((y + tab_height + this.TopAdditional + button_height + margin) > height ? y - this.TopAdditional - button_height : y + tab_height + this.TopAdditional) + 'px'
				}
			},
			r() {
				this.on_ColorChange()
			},
			g() {
				this.on_ColorChange()
			},
			b() {
				this.on_ColorChange()
			}
		},
		methods: {
			on_ColorChange() {
				this.$refs.ResizeContainer.style.setProperty('--Hue', 'hsl(' + this.r + ',100%, 50%)')
				this.$emit('change', { r: this.r, g: this.g, b: this.b })
			}
		},
		mounted() {
			this.r = this.Color.r
			this.g = this.Color.g
			this.b = this.Color.b
			// window.addEventListener('click', this.click_Handler)
		},
		destroyed() {
			// window.removeEventListener('click', this.click_Handler)
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
		/* padding: 6px; */
		z-index: 1;
		width: max-content;
		/* height: 230px; */
		padding: 10px;
		margin: 0px;
		box-shadow: 0px 0px 20px 6px rgba(0, 0, 0, 0.15);
		display: flex;
		flex-direction: column;
		--Hue: red;
	}

	.ColorPickerSlider {
		margin: 8px 0px;
		flex: 1;
	}

	#ColorPickerSliderR::-webkit-slider-thumb {
		background-color: var(--ElementColorRed);
	}

	#ColorPickerSliderG::-webkit-slider-thumb {
		background-color: var(--ElementColorGreen);
	}

	#ColorPickerSliderB::-webkit-slider-thumb {
		background-color: var(--ElementColorBlue);
	}

	#ColorPickerSliderH {
		margin: 8px 0px;
		flex: 1;
		background-image: linear-gradient(to left, hsl(0, 100%, 50%), hsl(298.8, 100%, 50%), hsl(241.2, 100%, 50%), hsl(180, 100%, 50%), hsl(118.8, 100%, 50%), hsl(61.2, 100%, 50%), hsl(360, 100%, 50%));
	}

	#ColorPickerSliderH::-webkit-slider-thumb {
		background-color: var(--Hue);
	}
</style>
