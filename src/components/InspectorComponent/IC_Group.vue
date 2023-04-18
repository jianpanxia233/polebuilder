<template>

	<div class="listview-dark"
		:style="(itemvalue.grouped !== undefined && itemvalue.grouped) ? {'background-color': layer ? 'var(--ScrollColor)' : 'var(--ObjectColor)'} : {'padding': '0px', 'background-color': 'transparent', 'margin': '0px'}">
		<div class="form-vcontainer gap">
			<div v-if="title !== '' && itemvalue.grouped !== undefined && itemvalue.grouped" class="form-container">
				<div class="title-dark" style="text-align: left; flex: 1; margin-left: 0px; ">{{title}}</div>
			</div>
			<template v-for="(item, index) in itemvalue.list">
				<template v-if="item !== null && item !== undefined">
					<!-- <div>{{index}}</div> -->
					<div v-if="item.type === '---'" class="separater-dark"
						:style="{'margin': item.size==='large'? '18px 12px': '6px 12px'}" />
					<div v-else-if="item.type === 'title'" class="title1-dark" style="text-align: left;">
						{{item.title}}
					</div>
					<div v-else-if="item.type === 'text'" class="title-dark" style="text-align: left;">
						{{item.title}}
					</div>
					<template v-else-if="item.type === 'group'">
						<ic-group :uid="uid" :title="item.title" :action="item.action" :itemvalue="item.itemvalue"
							:layer="!layer" @datachange="on_SubDataChange" />
					</template>
					<component v-else :is="'ic-'+item.type" :uid="uid" :title="item.title" :action="item.action"
						:itemvalue="item.itemvalue" @datachange="on_SubDataChange" />
				</template>
			</template>
		</div>
	</div>
</template>
<script>
	import IC_Vector3 from './IC_Vector3'
	import IC_CheckLoad from './IC_CheckLoad'
	import IC_Euler3 from './IC_Euler3'
	import IC_Vector2 from './IC_Vector2'
	import IC_Slider from './IC_Slider'
	import IC_LineEdit from './IC_LineEdit'
	import IC_NumberEdit from './IC_NumberEdit'
	import IC_Textarea from './IC_Textarea'
	import IC_Select from './IC_Select'
	import IC_Button from './IC_Button'
	import IC_TagList from './IC_TagList'
	import IC_PropertyList from './IC_PropertyList'
	import IC_List from './IC_List'
	import IC_Toggle from './IC_Toggle'
	import IC_Dropdown from './IC_Dropdown'
	import IC_Dropdown2 from './IC_Dropdown2'
	import IC_FileDrop from './IC_FileDrop'
	import IC_Canvas from './IC_Canvas'

	import staticData from '../Sun/StaticData.js'

	function get_InitValue(item) {
		switch (item.type) {
			case 'vector3':
				return { x: item.itemvalue.x, y: item.itemvalue.y, z: item.itemvalue.z }
			case 'vector2':
				return { x: item.itemvalue.x, y: item.itemvalue.y }
			case 'euler3':
				return { x: item.itemvalue.x, y: item.itemvalue.y, z: item.itemvalue.z }
			case 'lineedit':
				return item.itemvalue.value
			case 'numberedit':
				return item.itemvalue.value
			case 'textarea':
				return item.itemvalue.value
			case 'select':
				return item.itemvalue.selectitem
			case 'toggle':
				return item.itemvalue.value
			case 'taglist':
				return item.itemvalue.list
			case 'dropdown':
				return item.itemvalue.selectitem
			case 'filedrop':
				return item.itemvalue.path
			case 'propertylist':
				{
					let propertydata = {}
					for (let key in item.itemvalue.list) {
						propertydata[key] = item.itemvalue.list[key]
					}
					return propertydata
				}
			case 'group':
				{
					// //console.log(item)
					let groupdata = {}
					for (let key in item.itemvalue.list) {
						let groupitem = item.itemvalue.list[key]
						if (groupitem !== undefined && groupitem.action !== undefined) {
							let initvalue = get_InitValue(groupitem)
							if (initvalue !== null)
								groupdata[groupitem.action] = initvalue
						}
					}
					return groupdata
				}
			default:
				return null
		}
	}

	export default {
		mixins: [staticData],
		name: 'ic-group',
		components: {
			'ic-vector3': IC_Vector3,
			'ic-vector2': IC_Vector2,
			// 'ic-slider': IC_Slider, // unfinished
			'ic-lineedit': IC_LineEdit,
			'ic-numberedit': IC_NumberEdit,
			'ic-textarea': IC_Textarea,
			'ic-euler3': IC_Euler3,
			'ic-select': IC_Select,
			'ic-button': IC_Button,
			'ic-propertylist': IC_PropertyList,
			'ic-list': IC_List,
			'ic-toggle': IC_Toggle,
			'ic-dropdown': IC_Dropdown,
			'ic-dropdown2': IC_Dropdown2,
			'ic-checkload': IC_CheckLoad,
			'ic-filedrop': IC_FileDrop,
			'ic-canvas': IC_Canvas,
			'ic-taglist': IC_TagList,
		},//监听事件总线，列表
		props: {
			uid: {
				type: String,
				default: "none"
			},
			title: {
				type: String,
				default: "未命名组"
			},
			itemvalue: {
				type: Object,
				default: () => {
					return {
						grouped: true,
						list: [],
					}
				}
			},
			layer: {
				type: Boolean,
				default: true
			},
			action: {
				type: String,
				default: "未定"
			},
		},
		watch: {
			itemvalue(newval) {
				this.refresh_Data()
			}
		},
		static() {
			return {

			}
		},
		data() {
			return {
				datalist: {}
			}
		},
		computed: {
		},
		methods: {
			on_SubDataChange(action, data) {
				if (this.$static.datalist[action] !== undefined) {
					if (data && data !== null && data.data !== undefined) {
						this.$static.datalist[action] = data.data
					}
					else {
						this.$static.datalist[action] = data
					}
				}
				this.$emit('datachange', this.action, { actionchain: this.action + ((!data || data === null || data.actionchain === undefined) ? ('>' + action) : ('>' + data.actionchain)), calldata: (data && data !== null && data.calldata !== undefined) ? data.calldata : data, data: this.$static.datalist })
			},
			refresh_Data() {
				this.$static.datalist = get_InitValue({ type: 'group', action: this.action, itemvalue: this.itemvalue })
				// //console.log(this.$static.datalist)
			}
		},
		mounted() {
			this.refresh_Data()
		}
	}
</script>
<style scoped>

</style>
