<template>
	<div class="listview-dark">
		<div class="form-container gap">
			<div class="form-container" style="min-width: 90px; max-width: 90px;">
				<div class="title-dark" style="text-align: left; word-break: break-all;">{{ title }}
				</div>
			</div>
			<div class="form-container">
				<div ref="Tabs" style="flex: 1; min-height: 30px;">
					<div class="form-container gap right">
						<div v-if="itemvalue.showselected && itemvalue.showselected" class="button-dark"
											style="flex: 1;" @click="show = true">
							<a class="button-text" style="word-break: break-all;">{{selected === ''?
								"无选中项":selected}}</a>
						</div>
						<div class="button-dark" @click="show = true">
							<svg class="button-icon-svg" viewBox="0 0 1024 1024" version="1.1"
												xmlns="http://www.w3.org/2000/svg">
								<path
									d="M140.16 332.16a40.96 40.96 0 0 0 0 58.24l343.04 338.56a40.96 40.96 0 0 0 58.24 0l342.4-338.56a40.96 40.96 0 1 0-58.24-58.24L512 640 197.76 332.16a40.96 40.96 0 0 0-57.6 0z">
								</path>
							</svg>
						</div>

					</div>

					<div v-if="show" class="Background" style="z-index: 1;" @click.self.stop=" show=false"
										@contextmenu.prevent.stop></div>
					<div ref="ResizeContainer" id="ResizeContainer" class="listview-dark"
										:style="{'z-index': 1, 'visibility': show? 'visible': 'hidden'}" @click.stop>
						<div :class="{'ContextMenu-Container': true, 'selected': selected===''}"
											@click="selected = ''; show = false; update()">
							<div v-if="itemvalue.default && itemvalue.default" class="form-container"
												style="padding: 5px 12px 5px 10px; min-height: 30px;">
								<!-- <div class="form-container icon" style="padding: 0px;">
								<div v-html="get_Icon(item.icon)" style="height: 18px; width: 18px;">

								</div>
							</div> -->
								<!-- <div class="form-container" style="padding-left: 10px; overflow: hidden;"> -->
								<div class="title-dark"
													style="margin: 0px; font-size: 14px; text-overflow: ellipsis; word-break: break-all; white-space: nowrap; overflow: hidden;">
									无选中项
								</div>
								<!-- </div> -->
							</div>
						</div>
						<template v-for="item, index in itemvalue.list">
							<div :class="{'ContextMenu-Container': true, 'selected': (itemvalue.hold===undefined || itemvalue.hold) && selected===get_Text(item)}"
												@click="selected = get_Text(item); show = false; update()">
								<div class="form-container" style="padding: 5px 12px 5px 10px; min-height: 30px;">
									<div v-if="typeof(item) !== 'string'" class="form-container icon"
														style="padding: 0px;">
										<div v-html="get_Icon(item.icon)" style="height: 18px; width: 18px;">

										</div>
									</div>
									<div class="form-container" style="overflow: hidden;"
														:style="{'padding-left': typeof(item) === 'string'? '0px': '10px'}">
										<div class="title-dark"
															style="margin: 0px; font-size: 14px; text-overflow: ellipsis; word-break: break-all; white-space: nowrap; overflow: hidden;"
															v-html="get_Text(item)">
										</div>
									</div>
								</div>
							</div>
						</template>
					</div>
				</div>
			</div>
		</div>
	</div>

</template>
<script>
import { ICONMAP } from '../Utils.js'

export default {
	name: 'IC_Dropdown',
	components: {},
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
					default: false,
					showselected: false,
					list: [],
					selectitem: '',
					hold: true
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
			show: false,
			TopAdditional: 8,
			Margin: 8,
			selected: ''
		}
	},
	computed: {
	},
	watch: {
		itemvalue(newval) {
			this.selected = newval.selectitem || ''
		},
		show(newval) {
			if (newval) {
				function getElementToPageTop(el) {
					// //console.log(el.style.position)
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
				let x = event.clientX
				let tab_width = 0//this.$refs.Tabs.offsetWidth
				let tab_height = 0//this.$refs.Tabs.offsetHeight
				let y = event.clientY
				let width = window.innerWidth
				let height = window.innerHeight
				// //console.log(height)
				let button_width = this.$refs.ResizeContainer.offsetWidth
				let button_height = this.itemvalue.list.length * 30
				this.$refs.ResizeContainer.style.maxHeight = (height - 2 * this.Margin) + 'px'
				let margin = this.Margin
				// //console.log((x + button_width / 2 + margin), width)
				this.$refs.ResizeContainer.style.left = ((x + button_width / 2 + tab_width / 2 + margin) > width ? width - (button_width + margin) : ((x - button_width / 2 - tab_width / 2) < 0 ? margin : x - button_width / 2 + tab_width / 2)) + 'px'
				if ((y + tab_height + this.TopAdditional + button_height + margin) > height) {
					this.$refs.ResizeContainer.style.top = 'unset'
					// //console.log("bottom")
					this.$refs.ResizeContainer.style.bottom = Math.max(height - y + this.TopAdditional, margin) + 'px'
					// //console.log(y)
					if ((y - this.TopAdditional - margin) <= button_height) {
						//console.log("not enough")
						this.$refs.ResizeContainer.style.top = margin + 'px'
						this.$refs.ResizeContainer.style.bottom = 'unset'
					}
				}
				else {
					this.$refs.ResizeContainer.style.top = (y + tab_height + this.TopAdditional) + 'px'
					this.$refs.ResizeContainer.style.bottom = 'unset'
				}
			}
		}
	},
	methods: {
		get_Icon(icon) {
			if (ICONMAP[icon] === undefined) return ICONMAP.blank
			return ICONMAP[icon]
		},
		get_Text(item) {
			return typeof (item) === 'string' ? item : item.text
		},
		update() {
			this.$emit('datachange', this.action, this.selected)
			// this.$EventBus.$emit(this.uid + "_inspectorUpdate", this.action, this.tempvalue)
		}
	},
	mounted() {
		this.selected = this.itemvalue.selectitem || ''
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
	min-width: 230px;
	z-index: 1;
	overflow-x: hidden;
	overflow-y: auto;
	padding: 0px;
	box-shadow: 0px 0px 20px 6px rgba(0, 0, 0, 0.15);
	display: flex;
	flex-direction: column;
}
</style>
