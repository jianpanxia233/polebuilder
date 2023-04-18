<template>
	<div class="contextmenu-cover" id="contextmenu-cover" @mousedown.stop="close()"
		:style="{'pointer-events': Show? 'all':'none'}">
		<contextmenu-list v-if="Show" :List="List" :Position="Position" :ScreenSize="ScreenSize" :First="First"
			:NextDirection="-1" @ContextmenuClick="click">
		</contextmenu-list>
	</div>
</template>
<script>
	import ContextMenuList from './Sun/ContextMenuList'

	export default {
		name: 'ContextMenu',
		components: {
			'contextmenu-list': ContextMenuList
		},
		props: {

		},
		data() {
			return {
				ContextMenu: null,
				Self: undefined,
				Margin: 10,
				Parent: '',
				Data: null,
				Position: { x: 0, y: 0, width: 0 },
				ScreenSize: { width: 0, height: 0 },
				First: 0,
				Show: false,
				List: [],
				Handler: undefined
			}
		},
		watch: {
		},
		methods: {
			test(event) {
				//console.log(event)
				event.preventDefault()
			},
			clear() {
				if (this.Handler !== undefined) {
					this.Handler.reject("ContextMenu_Closed")
				}
				this.Show = false
				this.Parent = undefined
				this.Self = undefined
				this.Parent = undefined
			},
			close() {
				this.clear()
				event.preventDefault()
				return false
			},
			get_Height() {
				return this.List.reduce((ans, item, index) => {
					if (item === '-') {
						return ans += 6
					}
					else if (typeof (item) === 'string') {
						return ans += 30
					}
					else {
						return ans += 30
					}
				}, 0)
			},
			get_First(first = 0) {
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
							height += 30
						}
					}
				}
			},
			click(action, data) {
				if (this.Handler !== undefined) {
					this.Handler.resolve({ Action: action, Data: this.Data, LocalData: data })
					this.clear()
					return
				}
				if (action[0] !== '@') {
					this.$EventBus.$emit(action, this.Data, data)
				}
				else {
					this.$EventBus.$emit(this.Parent + '_ContextMenu', action.slice(1), this.Data, data)
				}
				this.clear()
				// //console.log(action, data)
			}
		},
		mounted() {
			this.ContextMenu = document.getElementById('contextmenu')

			this.$EventBus.$on('contextmenu_open', (parent, list, data, x, y, first = 0, shift = true) => {
				this.clear()
				this.Parent = parent
				this.List = list
				this.Data = data
				this.Position = { x: shift ? (x - 40) : x, y: y, width: 0 }
				let screen = document.getElementById('contextmenu-cover')
				this.ScreenSize = { width: screen.offsetWidth, height: screen.offsetHeight }
				this.First = first
				this.Show = true
			})

			this.$EventBus.$on('contextmenu_new_ContextMenu', (contextmenuparam) => {
				// console.log(contextmenuparam)
				// contextmenuparam.Handler.resolve(contextmenuparam.Data)
				this.clear()
				this.Parent = contextmenuparam.Parent
				this.List = contextmenuparam.List
				this.Data = contextmenuparam.Data
				this.Position = { x: contextmenuparam.ContextMenuParam.shift ? (contextmenuparam.ContextMenuParam.x - 40) : contextmenuparam.ContextMenuParam.x, y: contextmenuparam.ContextMenuParam.y, width: 0 }
				let screen = document.getElementById('contextmenu-cover')
				this.ScreenSize = { width: screen.offsetWidth, height: screen.offsetHeight }
				this.First = contextmenuparam.ContextMenuParam.first
				this.Handler = contextmenuparam.Handler
				this.Self = contextmenuparam.Self
				this.Show = true
			})
		},
		beforeDestroy() {
			this.$EventBus.$off('contextmenu_open')
			this.$EventBus.$off('contextmenu_new_ContextMenu')
		}
	}
</script>
<style scoped>

</style>