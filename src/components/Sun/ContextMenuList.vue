<template>
	<div ref="ContextMenuBackground" class="ContextMenu-Background" id="contextmenu"
		:style="{'left': get_X+'px', 'top': get_Y+'px', 'max-height': get_MaxHeight+'px', 'width': Width===undefined? 'unset':Width + 'px'}"
		@mousedown.stop>
		<template v-for="item, index in List">
			<template v-if="item === '-'">
				<div class="ContextMenu-Separater"></div>
			</template>
			<template v-else-if="typeof(item) === 'string'">
				<div class="form-container" style="padding: 5px 12px 5px 12px; min-height: 30px;" :title="item">
					<div class="title-dark"
						style="margin: 0px; font-size: 11px; color: var(--FontColor); opacity: 40%; text-overflow: ellipsis; word-break: break-all; white-space: nowrap; overflow: hidden;"
						v-html="item">
					</div>
				</div>
			</template>
			<template v-else>
				<template v-if="item.type !== undefined">
					<div class="ContextMenu-Container" style="background-color:transparent;"
						@mouseover.stop="Show = index">
						<component :is="item.type" :data="item.data" :action="item.action"
							@ContextmenuClick="contextmenu_Click">
						</component>
					</div>
				</template>
				<template v-else-if="item.list === undefined">
					<div class="ContextMenu-Container" @click="click(item.action, item.data)"
						:title="(item.description !== undefined? item.description:item.text)"
						@mouseover.stop="Show = index">
						<div class="form-container" style="padding: 5px 12px 5px 10px; min-height: 30px;">
							<div class="form-container icon" style="padding: 0px;">
								<div v-html="get_Icon(item.icon)" style="height: 18px; width: 18px;">

								</div>
							</div>
							<div class="form-container" style="padding-left: 10px; overflow: hidden;">
								<div class="title-dark"
									style="margin: 0px; font-size: 14px; text-overflow: ellipsis; word-break: break-all; white-space: nowrap; overflow: hidden;"
									v-html="item.text">
								</div>
							</div>
						</div>
					</div>
				</template>
				<template v-else>
					<div class="ContextMenu-Container"
						:title="(item.description !== undefined? item.description:item.text)"
						@mouseover.stop="Show = index">
						<div class="form-container" style="padding: 5px 10px 5px 10px; min-height: 30px;">
							<div class="form-container icon" style="padding: 0px;">
								<div v-html="get_Icon(item.icon)" style="height: 18px; width: 18px;">

								</div>
							</div>
							<div class="form-container" style="padding-left: 10px; overflow: hidden;">
								<div class="title-dark"
									style="margin: 0px; font-size: 14px; text-overflow: ellipsis; word-break: break-all; white-space: nowrap; overflow: hidden;"
									v-html="item.text">
								</div>
							</div>
							<div class="form-container icon" style="padding: 0px;">
								<svg svg class="icon-dark small" style="margin: 0px;" viewBox="-200 -80 1224 1244"
									version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2168"
									xmlns:xlink="http://www.w3.org/1999/xlink" width="128" height="128">
									<path
										d="M642.5 513.1L310 180.6c-15.7-15.7-15.7-41.2 0-56.9 15.7-15.7 41.2-15.7 56.9 0L726 482.8c8.3 8.3 12.3 19.4 11.7 30.3 0.5 10.9-3.4 22-11.7 30.3L367 902.5c-15.7 15.7-41.2 15.7-56.9 0-15.7-15.7-15.7-41.2 0-56.9l332.4-332.5z"
										p-id="2169"></path>
								</svg>
							</div>
						</div>
					</div>
					<contextmenu-list v-if="Show === index" :List="item.list" :Position="get_SubPosition(index)"
						:ScreenSize="ScreenSize" :First="item.first" :NextDirection="get_NextDirection"
						@ContextmenuClick="contextmenu_Click" />
				</template>
			</template>
		</template>
	</div>
</template>
<script>
	import * as Util from '../Utils.js'
	import CMP_Tags from '../ContextMenuPlugin/CMP_Tags'
	import CMP_Input from '../ContextMenuPlugin/CMP_Input'

	const PLUGIN_HEIGHT = {
		'cmp-tags': 33,
		'cmp-input': 50
	}

	export default {
		name: 'contextmenu-list',
		components: {
			'cmp-tags': CMP_Tags,
			'cmp-input': CMP_Input
		},
		props: {
			ScreenSize: {
				type: Object,
				default: () => { return { width: 0, height: 0 } }
			},
			Position: {
				type: Object,
				default: () => { return { x: 0, y: 0, width: 230 } }
			},
			List: {
				type: Array,
				default: () => { return [] }
			},
			First: {
				type: Number,
				default: 0
			},
			NextDirection: {
				type: Number,
				default: -1
			}
		},
		data() {
			return {
				Margin: 10,
				Show: -1,
				Width: undefined
			}
		},
		computed: {
			get_X: function () {
				if (this.NextDirection === -1) {
					return Math.max(this.Margin, Math.min(this.Position.x, this.ScreenSize.width - this.Width - this.Margin))
				}
				if (this.NextDirection === 0) {
					if (this.Position.x - this.Width - this.Margin < 0) {
						return Math.max(this.Margin, Math.min(this.Position.x + this.Position.width, this.ScreenSize.width - this.Width - this.Margin))
					}
					return this.Position.x - this.Width
				}
				if (this.NextDirection === 1) {
					if (this.Position.x + this.Position.width > this.ScreenSize.width - this.Width - this.Margin) {
						return Math.max(this.Margin, this.Position.x - this.Width)
					}
					return this.Position.x + this.Position.width
				}
			},
			get_Y: function () {
				return Math.max(this.Margin, Math.min(this.Position.y - this.get_First(this.First), this.ScreenSize.height - this.get_Height() - this.Margin))
			},
			get_MaxHeight: function () {
				let height = this.get_Height()
				if (height > this.ScreenSize.height - this.Margin * 2) {
					return this.ScreenSize.height - this.Margin * 2
				}
				else {
					return height
				}
			},
			get_NextDirection: function () {
				if (this.NextDirection === -1) return 1
				if (this.NextDirection === 0) {
					if (this.Position.x - this.Width - this.Margin < 0) {
						return 1
					}
					else return 0
				}
				if (this.NextDirection === 1) {
					if (this.Position.x + this.Position.width > this.ScreenSize.width - this.Width - this.Margin) {
						return 0
					}
					else return 1
				}
			}
		},
		watch: {
		},
		methods: {
			get_Height() {
				return this.List.reduce((ans, item, index) => {
					if (item === '-') {
						return ans += 6
					}
					else if (typeof (item) === 'string') {
						return ans += 30
					}
					else {
						if (item.type !== undefined) {
							return ans += PLUGIN_HEIGHT[item.type]
						}
						return ans += 30
					}
				}, 0)// + 36
			},
			get_PositionY() {
				return Math.max(this.Margin, Math.min(this.Position.y - this.get_First(this.First), this.ScreenSize.height - this.get_Height() - this.Margin)) + 15
			},
			get_First(first = 0) {
				if (first === -1) return 0
				let height = 0
				for (let i = 0; i < this.List.length; i++) {
					let item = this.List[i]
					if (i === first) {
						if (item === '-') {
							return height + 3
						}
						else if (typeof (item) === 'string') {
							return height + 15
						}
						else {
							if (item.type !== undefined) {
								return height + PLUGIN_HEIGHT[item.type] / 2
							}
							return height + 15
						}
					}
					else {
						if (item === '-') {
							height += 6
						}
						else if (typeof (item) === 'string') {
							height += 30
						}
						else {
							if (item.type !== undefined) {
								height += PLUGIN_HEIGHT[item.type]
							}
							else {
								height += 30
							}
						}
					}
				}
			},
			get_Nth(n = 0) {
				let height = 0
				for (let i = 0; i < this.List.length; i++) {
					let item = this.List[i]
					if (i === n) {
						return height
					}
					else {
						if (item === '-') {
							height += 6
						}
						else if (typeof (item) === 'string') {
							height += 30
						}
						else {
							if (item.type !== undefined) {
								height += PLUGIN_HEIGHT[item.type]
							}
							else {
								height += 30
							}
						}
					}
				}
			},
			get_SelfX() {
				if (this.NextDirection === -1) {
					return Math.max(this.Margin, Math.min(this.Position.x, this.ScreenSize.width - this.Width - this.Margin))
				}
				if (this.NextDirection === 0) {
					if (this.Position.x - this.Width - this.Margin < 0) {
						return Math.max(this.Margin, Math.min(this.Position.x + this.Position.width, this.ScreenSize.width - this.Width - this.Margin))
					}
					return this.Position.x - this.Width
				}
				if (this.NextDirection === 1) {
					if (this.Position.x + this.Position.width > this.ScreenSize.width - this.Width - this.Margin) {
						return Math.max(this.Margin, this.Position.x - this.Width)
					}
					return this.Position.x + this.Position.width
				}
			},
			get_SubPosition(idx) {
				let position = { x: this.get_SelfX(), y: this.get_PositionY() + this.get_Nth(idx), width: this.Width }
				// let width = this.Width
				// // //console.log(width)
				// if (this.NextDirection === -1) {
				// 	if (this.Position.x > this.ScreenSize.width - width - this.Margin) {
				// 		position.x = Math.max(this.Margin, Math.min(this.Position.x, this.ScreenSize.width - width - this.Margin)) - width
				// 	}
				// 	else {
				// 		position.x = Math.max(this.Margin, Math.min(this.Position.x, this.ScreenSize.width - width - this.Margin)) + width
				// 	}
				// }
				// else if (this.NextDirection === 0) {
				// 	position.x = Math.max(this.Margin, Math.min(this.Position.x, this.ScreenSize.width - width - this.Margin)) - width
				// }
				// else {
				// 	position.x = Math.max(this.Margin, Math.min(this.Position.x, this.ScreenSize.width - width - this.Margin)) + width
				// }
				return position
			},
			get_Icon(icon) {
				if (Util.ICONMAP[icon] !== undefined) {
					return Util.ICONMAP[icon]
				}
				else {
					return Util.ICONMAP.blank
				}
			},
			click(action, data) {
				this.$emit('ContextmenuClick', action, data)
			},
			contextmenu_Click(action, data) {
				this.$emit('ContextmenuClick', action, data)
			}
		},
		mounted() {
			this.Width = Math.max(this.$refs.ContextMenuBackground.offsetWidth, 230)
		}
	}
</script>
<style scoped>

</style>