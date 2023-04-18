<template>
	<div class="container" id="Inspector">
		<div class="v-box">
			<div class="topbar" id="Inspector-toolbar">
				<panel-switch-bar :Tabs="PanelTabs" :currentTab="'检视器'" :Width="PanelWidth" :Height="PanelHeight" />
			</div>
			<div class="scroll-container flex">
				<template v-for="(item, index) in List">
					<template v-if="item !== null && item !== undefined">
						<div v-if="item.type === '---'" class="separater-dark"
							:style="{'margin': item.size==='large'? '18px 12px': '6px 12px'}" />
						<div v-else-if="item.type === 'title'" class="title1-dark" style="text-align: left;">
							{{item.title}}
						</div>
						<div v-else-if="item.type === 'text'" class="title-dark left noleftmargin">
							{{item.title}}
						</div>
						<component v-else :is="'ic-'+item.type" :uid="itemList.uid" :title="item.title"
							:action="item.action" :itemvalue="item.itemvalue" @datachange="on_DataChange"
							:key="get_Key()" />
					</template>
				</template>
				<div v-show="MaskShow" class="MaskCover">
					<div class="button-dark noleftmargin nobottommargin" style="background-color: var(--ThemeColor);">
						<div class="title1-dark" style="margin: 0px; padding: 0px; color: var(--FontColorReverse);">
							当前不可操作
						</div>
					</div>
				</div>
			</div>

			<!-- <div class="bottombar">
				<div class="title1-dark">qwerefdgvcdsqwerefdgvcdsqwerefdgvcdsqwerefdgvcdsqwerefdgvcdsqwerefdgvcds</div>
				<div class="title-dark">qwerefdgvcdsqwerefdgvcdsqwerefdgvcdsqwerefdgvcdsqwerefdgvcdsqwerefdgvcds</div>
			</div> -->

		</div>
	</div>
</template>
<script>
	import IC_Vector3 from './InspectorComponent/IC_Vector3'
	import IC_CheckLoad from './InspectorComponent/IC_CheckLoad'
	import IC_Euler3 from './InspectorComponent/IC_Euler3'
	import IC_Vector2 from './InspectorComponent/IC_Vector2'
	import IC_Slider from './InspectorComponent/IC_Slider'
	import IC_LineEdit from './InspectorComponent/IC_LineEdit'
	import IC_NumberEdit from './InspectorComponent/IC_NumberEdit'
	import IC_Textarea from './InspectorComponent/IC_Textarea'
	import IC_Select from './InspectorComponent/IC_Select'
	import IC_Button from './InspectorComponent/IC_Button'
	import IC_PropertyList from './InspectorComponent/IC_PropertyList'
	import IC_List from './InspectorComponent/IC_List'
	import IC_Toggle from './InspectorComponent/IC_Toggle'
	import IC_Group from './InspectorComponent/IC_Group'
	import IC_Dropdown from './InspectorComponent/IC_Dropdown'
	import IC_Dropdown2 from './InspectorComponent/IC_Dropdown2'
	import IC_FileDrop from './InspectorComponent/IC_FileDrop'
	import IC_Canvas from './InspectorComponent/IC_Canvas'
	import IC_TagList from './InspectorComponent/IC_TagList'
	import PanelSwitchBar from './Sun/PanelSwitchBar'
	import { get_UniqueID } from './Sun/ModuleSlot.js';
	import { searchDicDetailList } from '@/api/DicTools'

	let uid = BigInt(0);

	export default {
		name: 'Inspector',
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
			'ic-checkload': IC_CheckLoad,
			'ic-dropdown': IC_Dropdown,
			'ic-dropdown2': IC_Dropdown2,
			'ic-group': IC_Group,
			'ic-filedrop': IC_FileDrop,
			'ic-canvas': IC_Canvas,
			'ic-taglist': IC_TagList,
			'panel-switch-bar': PanelSwitchBar
		},//监听事件总线，列表
		props: {
			PanelTabs: {
				type: Array,
				default: () => {
					return [{ name: '检视器', panelid: 'InspectorPanel' }]
				}
			},
			PanelWidth: {
				type: Number,
				default: 100
			},
			PanelHeight: {
				type: Number,
				default: 100
			}
		},
		data() {
			return {
				itemList: {
					uid: 'empty', list: []
				},
				MaskShow: false,
				belongPartTypeMap: {},
				flangeTypeMap:{},
				polePartsPropertyMap: {
					// '材质': null,
					'壁厚（mm）': null,
					// '颜色': null,
					'部件类型': null,
					'规格名称': null,
					'长度（mm）': null,
					'额定重量': null,
					// '形状': null,
					'上口径（mm）': null,
					'下口径（mm）': null,
					'弯矩（KN.m）': null,
					'扭矩（KN.m）': null,
					'部件名称': null
				},
				doorPropertyMap: {
					// '材质': null,
					'零件名称': null
				},
				bodyPartPropertyMap: {
					// '材质': null,
					'零件名称': null,
					'长度（mm）': null,
					'上口径（mm）': null,
					'下口径（mm）': null,
				},
				flangePropertyMap: {
					// '材质': null,
					'零件名称': null,
					'所属部件类型': null,
					'安装部件类型': null,
				}
			}
		},
		computed: {
			List: function () {
				let list = []
				function getItem(lists) {
					lists.forEach((item) => {
						if (item === undefined || item === null) return
						// //console.log((item) instanceof Array)
						if (item instanceof Array) {
							getItem(item)
						}
						else {
							list.push(item)
						}
					})
				}
				getItem(this.itemList.list)
				// //console.log(list)
				return list
			}
		},
		methods: {
			on_DataChange(action, data) {
				this.$EventBus.$emit(this.itemList.uid + "_inspectorUpdate", action, data)
				// //console.log(this.itemList.uid, action, data)
			},
			get_Key() {
				return (uid++).toString()
			}
		},
		mounted() {
			this.$EventBus.$on('inspectorInit', (val) => {

				let that = this
				if(val && val.list){
					let inspectorList = val.list
					let partsType = 0 // 部件：0，法兰：1，搭载设备：2，杆身零件：3，大小检修门：4，新建复合组件：5
					// 判断是部件、法兰还是搭载设施
					inspectorList.forEach((item)=>{
						if(item && item.title){
								if(item.title.indexOf('法兰') !== -1){
									partsType = 1
								}
								else if(item.title === '搭载设备'){
									partsType = 2
								}
								else if(item.title.indexOf('TR') !== -1){
									partsType = 3
								}
								else if(item.title.indexOf('小检修门') !== -1){
									partsType = 4
								}
								else if(item.title.indexOf('新建复合组件') !== -1){
									partsType = 5
								}
								else if(item.title === 'Remarks'){
									item.title = '备注'
								}else if(item.title === 'Alias'){
									item.title = '别名'
								}
						}
					})

					// 初始化字典
					let dicParam = {
						typeIdList: [1013, 1006]
					}
					searchDicDetailList(dicParam).then(response => {
						if (response.respCode === 0 && response.returns.length > 0) {
							let dics = response.returns
							dics.forEach((dic)=>{
								if(dic.typeId === 1013){
									that.belongPartTypeMap[dic.dicCode] = dic.dicValue
								}else if(dic.typeId === 1006){
									that.flangeTypeMap[dic.dicCode] = dic.dicValue
								}
							})
						}
					})

					this.$nextTick(() => {

						// 属性的key转中文
						inspectorList.forEach((item)=>{
							if(item && item.title){
								debugger
								if(item.title === 'property'){
									let property = item.itemvalue.list
									// 部件: 主杆副杆横臂
									if(partsType === 0){
										that.polePartsPropertyMap["壁厚（mm）"] = property.thickness
										that.polePartsPropertyMap.部件类型 = property.partsType
										that.polePartsPropertyMap.规格名称 = property.modelName
										that.polePartsPropertyMap["长度（mm）"] = property.length
										that.polePartsPropertyMap.额定重量 = property.weight
										that.polePartsPropertyMap["上口径（mm）"] = property.topDiameter
										that.polePartsPropertyMap["下口径（mm）"] = property.bottomDiameter
										that.polePartsPropertyMap["弯矩（KN.m）"] = property.ratedBend
										that.polePartsPropertyMap["扭矩（KN.m）"] = property.ratedTorque
										that.polePartsPropertyMap.部件名称 = property.componentName
										item.itemvalue.list = that.polePartsPropertyMap
									}// 法兰
									else if(partsType === 1){
										that.flangePropertyMap["零件名称"] = property.rawMaterialName
										that.flangePropertyMap["所属部件类型"] = that.belongPartTypeMap[property.belongPartType] ? that.belongPartTypeMap[property.belongPartType] : '未找到所属部件类型'
										that.flangePropertyMap["安装部件类型"] = that.flangeTypeMap[property.disassemblyType] ? that.flangeTypeMap[property.disassemblyType] : '未找到安装部件类型'
										item.itemvalue.list = that.flangePropertyMap
									}// 杆身零件
									else if(partsType === 3){
										that.bodyPartPropertyMap["零件名称"] = property.rawMaterialName
										that.bodyPartPropertyMap["长度（mm）"] = property.length
										that.bodyPartPropertyMap["上口径（mm）"] = property.upperCaliber
										that.bodyPartPropertyMap["下口径（mm）"] = property.lowerCaliber
										item.itemvalue.list = that.bodyPartPropertyMap
									}// 大小检修门
									else if(partsType === 4){
										that.doorPropertyMap["零件名称"] = property.rawMaterialName
										item.itemvalue.list = that.doorPropertyMap
									}
								}
							}
						})

						this.itemList = val
					});

				}

				// //console.log(that.itemList)
			})
		}
	}
</script>
<style scoped>
	.MaskCover {
		background-color: var(--BarColorTransparent);
		pointer-events: all;
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		top: 0;
		display: flex;
		align-items: center;
		justify-content: center;
	}
</style>
