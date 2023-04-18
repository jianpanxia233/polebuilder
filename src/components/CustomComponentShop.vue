<template>
	<div class="container" id="Left-Menu">
		<div class="v-box">
			<div class="topbar">
				<panel-switch-bar :Tabs="PanelTabs" :currentTab="'自定义组件库（从api读取保存的模型结构）'" :Width="PanelWidth" :Height="PanelHeight" />

				<div class="filler"></div>

				<div class="button" @click="switch_classList(null, 0)">
					<svg class="button-icon-svg" viewBox="-100 -100 1224 1224" version="1.1"
						xmlns="http://www.w3.org/2000/svg">
						<path
							d="M512.034377 0a512 512 0 0 1 296.813714 929.206857l-87.113142-117.540571a365.714286 365.714286 0 1 0-426.569143-5.12l84.041143-109.348572L512.034377 1024H128.034377l77.970286-101.595429-10.971429-8.338285A512 512 0 0 1 512.034377 0z">
						</path>
					</svg>
				</div>
			</div>
			<div class="scroll-container flex" style="position: relative;">
				<div class="title1-dark">分类</div>
				<div class="listview-dark">
					<div class="form-container left smallgap">
						<div class="button-dark left" :class="{'selected': 0===LibrarySelectedClass}"
							style="flex: 1; min-width: fit-content; margin-left: 0px;" @click="switch_Tab(0)">
							<!--							@click="LibrarySelectedClass = index" :key="item">-->
							<a class="button-text">组件</a>
						</div>
						<div class="button-dark hcenter" :class="{'selected': 1===LibrarySelectedClass}"
							style="flex: 1; min-width: fit-content; margin-left: 0px;" @click="switch_Tab(1)">
							<!--							@click="LibrarySelectedClass = index" :key="item">-->
							<a class="button-text">贴图、模板</a>
						</div>
						<div class="button-dark hcenter" :class="{'selected': 2===LibrarySelectedClass}"
							style="flex: 1; min-width: fit-content; margin-left: 0px;" @click="switch_Tab(2)">
							<!--							@click="LibrarySelectedClass = index" :key="item">-->
							<a class="button-text">主杆零件</a>
						</div>
						<div class="button-dark right" :class="{'selected': 3===LibrarySelectedClass}"
							style="flex: 1; min-width: fit-content; margin-left: 0px;" @click="switch_Tab(3)">
							<!--							@click="LibrarySelectedClass = index" :key="item">-->
							<a class="button-text">副杆零件</a>
						</div>
						<div class="button-dark right" :class="{'selected': 4===LibrarySelectedClass}"
							style="flex: 1; min-width: fit-content; margin-left: 0px;" @click="switch_Tab(4)">
							<!--							@click="LibrarySelectedClass = index" :key="item">-->
							<a class="button-text">微型杆</a>
						</div>
					</div>
				</div>
				<!-- Select: 组件分类按钮 -->
				<div class="listview-dark">
					<div v-if="LibraryMainClassList.length > 0" class="form-container left smallgap">
						<div v-for="(item, index) in LibraryMainClassList[LibrarySelectedClass]"
							:class="{'button-dark': true, 'selected': item===LibraryMainClassList[LibrarySelectedClass][LibrarySelectedSubClass], 'left': index===0&&get_SubClassList.length>1, 'hcenter': index!==0&&index!==get_SubClassList.length-1, 'right': index===get_SubClassList.length-1&&get_SubClassList.length>1}"
							style="flex: 1; min-width: fit-content; margin-left: 0px;"
							@click="switch_classList(index, 0)" :key="item">
							<!--							@click="LibrarySelectedClass = index" :key="item">-->
							<a class="button-text">{{item}}</a>
						</div>
					</div>
					<div v-else class="form-container center leftpadding" style="height: 30px;">
						<div class="title-dark">
							无
						</div>
					</div>
				</div>
				<template v-if="!(LibrarySelectedSubClass === 1 && LibrarySelectedSubClass === 1)">
					<div class="title1-dark">筛选</div>
					<div class="listview-dark">
						<div class="form-container gap">
							<div class="form-vcontainer gap flex">
								<div class="form-container gap">
									<!-- <div class="form-container" style="flex: unset">
									<div class="title-dark"
										style="margin-right: 6px; text-align: left; word-break: break-all;">组件名
									</div>
								</div> -->
									<div class="form-container">
										<input class="lineedit-dark" style="flex: 1; min-width: 50px; height: auto;"
											placeholder="组件名" v-model="key_ComponentName" />
									</div>
								</div>
								<!-- <div class="form-container gap"> -->
								<!-- <div class="form-container" style="flex: unset">
									<div class="title-dark"
										style="margin-right: 6px; text-align: left; word-break: break-all;">设备号
									</div>
								</div> -->
								<!--									<div class="form-container">-->
								<!--										<input class="lineedit-dark" type="number"-->
								<!--											style="flex: 1; min-width: 50px; height: auto;" placeholder="设备号"-->
								<!--											v-model.number="key_SpecId" />-->
								<!--									</div>-->
								<!-- </div> -->
							</div>
							<div class="button-dark" @click="search()">
								<svg class="button-icon-svg" viewBox="0 0 1024 1024" version="1.1"
									xmlns="http://www.w3.org/2000/svg">
									<path
										d="M939.432441 853.649194L753.550916 667.797345c107.269096-148.788721 93.987604-357.63426-39.896662-491.518526-148.694577-148.694577-389.755842-148.694577-538.450418 0-148.694577 148.660808-148.694577 389.755842 0 538.416649 133.904733 133.874033 342.705246 147.164734 491.511363 39.920199l185.859012 185.859011c23.982204 23.982204 62.877049 23.982204 86.859253 0s23.981181-62.84328-0.001023-86.825484z m-674.481582-228.700749c-99.118462-99.118462-99.118462-259.83791 0-358.922603 99.118462-99.152231 259.803117-99.152231 358.956372 0 99.117438 99.084693 99.117438 259.804141 0 358.922603-99.153254 99.152231-259.838933 99.152231-358.956372 0z">
									</path>
								</svg>
							</div>
							<div class="button-dark" @click="clear_Search()">
								<svg class="button-icon-svg" viewBox="0 0 115 116" xmlns="http://www.w3.org/2000/svg"
									xmlns:xlink="http://www.w3.org/1999/xlink" overflow="hidden">
									<g transform="translate(-561 -534)">
										<path d="M584 558 653.101 627.101" stroke-width="9" stroke-miterlimit="8"
											fill-rule="evenodd" />
										<path d="M653.101 557 584 626.101" stroke-width="9" stroke-miterlimit="8"
											fill-rule="evenodd" />
									</g>
								</svg>
							</div>
						</div>
					</div>
				</template>
				<div class="listview-dark">
					<div class="form-container right">
						<div class="button-dark" @click="isList = !isList">{{isList? '缩略图':'列表'}}</div>
					</div>
				</div>

				<div class="itemview-dark flex" style="min-height: 100px;">
					<template v-for="component in LibraryComponents">
						<moduleview v-if="isList" :ModuleName="component.modulename" :ModuleUID="component.moduleid"
							:ModuleViewID="0" :ShowName="component.modulename + ' CID:' + component.moduleid"
							:Draggable="true" :ModuleSrc="component" :actived="false" :Component="component"
							:StandardType="1" @clicked="childModuleViewClick"
							@dragended="createModule(component, arguments)">
						</moduleview>
						<modulelistview v-else :ModuleName="component.modulename" :ModuleUID="component.moduleid"
							:ModuleViewID="0" :ShowName="component.modulename + ' CID:' + component.moduleid"
							:Draggable="true" :ModuleSrc="component" :actived="false" :Component="component"
							:StandardType="1" @clicked="childModuleViewClick"
							@dragended="createModule(component, arguments)">
						</modulelistview>
					</template>
				</div>
				<div class="listview-dark">
					<div v-if="LibraryPageCount > 0" class="form-container left gap">
						<div v-for="item of LibraryPageCount" :key="item"
							:class="{'button-dark': true, 'selected': item === LibraryCurrentPage}"
							@click="select_Page(item)">
							<a class="button-text">{{item}}</a>
						</div>
					</div>
					<div v-else class="form-container center" style="height: 30px;">
						<div class="title-dark">
							无
						</div>
					</div>
				</div>
				<div v-show="MaskShow" class="MaskCover">
					<div class="button-dark noleftmargin nobottommargin" style="background-color: var(--ThemeColor);">
						<div class="title1-dark" style="margin: 0px; padding: 0px; color: var(--FontColorReverse);">
							服务端数据暂不可用，请使用标准组件库...
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
	import { customLog, HTML, radius_to_degree, degree_to_radius, to_PoleAngle, get_NearPoleAngle } from './Utils.js'
	// import * as THREE from "three";
	import moduleview from './ModuleView'
	import modulelistview from './ModuleListView'
	// import moduleviewlist from './moduleviewlist'
	import * as ComponentManager from './Sun/ComponentManager.js'
	import PanelSwitchBar from './Sun/PanelSwitchBar'
	import * as FileSystem from './Sun/FileSystem'
	import CryptoJS from 'crypto-js'
	import {
		getComponentsByTab, searchStickers, searchPoleTmplByPage,
		getRowMaterial, deleteSticker, deletePoleTmpl, delComponent, get2F3F
	} from "@/api/Components";

	export default {
		name: 'ComponentShop',
		components: {
			moduleview,
			modulelistview,
			'panel-switch-bar': PanelSwitchBar
		},
		props: {
			show: {
				type: Boolean,
				default: false
			},
			PanelTabs: {
				type: Array,
				default: () => {
					return [{ name: '组件列表', panelid: 'ComponentShopPanel' }]
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
			let LibraryClassList = ['主杆', '副杆', '横臂', '卡槽', '灯臂', '连接件', '搭载设备', '微型杆', "杆身", "侧边法兰", "底部法兰", "顶部法兰", "小检修门", "大检修门", "副杆身", "副侧边法兰", "副底部法兰", "副顶部法兰", "副小检修门", "副大检修门", "贴图", "模板"]
			return {
				//Library
				LibrarySelectedClass: 0,

				LibrarySelectedSubClass: 0,

				LibraryClassList: LibraryClassList,

				LibraryPageCount: 0,

				LibraryMainClassList: [['主杆', '副杆', '横臂', '卡槽', '灯臂', '连接件', '搭载设备', '微型杆'], ["贴图", "模板"], ["杆身", "侧边法兰[适配直横臂]", "侧边法兰[适配斜横臂]", "底部法兰", "顶部法兰", "小检修门", "大检修门"], ["副杆身", "副底部法兰", "副顶部法兰", "普通杆灯头连接件"], ["微型杆杆身", "(微)底部法兰", "(微)小检修门", "(微)大检修门"]],

				LibraryMainClassRemain: [0, LibraryClassList.indexOf("贴图"), LibraryClassList.indexOf("杆身"), LibraryClassList.indexOf("副杆身")],

				LibraryComponents: [],

				LibraryCurrentPage: 0,

				MaskShow: false,

				key_ComponentName: '',
				key_SpecId: '',
				isList: true,
				id2F: null,
				id3F: null
			}
		},
		computed: {
			get_Class: function () {
				let selectedclass = this.LibraryClassList[this.LibrarySelectedClass]
				for (let i = 0; i < this.LibraryMainClassList.length; i++) {
					if (this.LibraryMainClassList[i].includes(selectedclass))
						return i
				}
			},
			get_SubClassList: function () {
				let selectedclass = this.LibraryClassList[this.LibrarySelectedClass]
				for (let i = 0; i < this.LibraryMainClassList.length; i++) {
					if (this.LibraryMainClassList[i].includes(selectedclass))
						return this.LibraryMainClassList[i]
				}
			}
		},
		watch: {
		},
		methods: {
			childModuleViewClick(modulename, moduleuid) {
				if (this.LeftMenuType === 'Current')
					this.$EventBus.$emit('display_select_Module', moduleuid)
			},

			createModule(component, arg) {
				if (component.classification === '贴图' || component.classification === '模板') {
					this.$EventBus.$emit('leftmenu_dragend_Module', arg[0], arg[1], component, arg[2])
					return
				}
				try {
					let ans = ComponentManager.convert_Component_Lagecy(component).get_Object()
					console.log("2f,3f",this.id2F,this.id3F)
					if (ans.componentid === this.id2F) {
						console.log("123")
						ans.is2F = true
						ans.equipWidth = 1600
						ans.equipLength = 1800
					}
					if (ans.componentid === this.id3F) {
						ans.is3F = true
						ans.equipWidth = 1600
						ans.equipLength = 1800
					}
					this.$EventBus.$emit('leftmenu_dragend_Module', arg[0], arg[1], ans, arg[2])
				} catch (error) {
					this.$EventBus.$emit('console_add_Output', "error", '生成CreateJson 错误', HTML.create_KeyPair('ComponentName', arg[0], 'String') + ' ' + HTML.create_KeyPair('ComponentID', arg[1], 'Number') + ' ' + error.message)
				}
			},

			switch_Tab(tab = 1) {
				this.LibrarySelectedClass = tab
				this.switch_classList(0, 0)
			},

			select_Page(item) {
				this.LibraryCurrentPage = item
				this.get_Page(item)
			},

			get_Page(currPage = this.LibraryCurrentPage) {

				if (this.MaskShow) return
				this.switch_classList(null, currPage)
			},

			get_FirstComponent() {
				if (this.MaskShow) return
				this.MaskShow = true
				const that = this
				// //console.log('that', that)
				let param = {
					pageNum: 1,
					pageSize: 16,
					tabType: 0,
					standardType: 1
				}
				getComponentsByTab(param).then(res => {
					if (res.respCode === 0) {
						let components = res.returns.components
						that.LibraryComponents = []
						if (typeof components != 'undefined' && components.length > 0) {
							that.LibraryComponents = components
						}
						// that.LibraryComponents = that.LibraryComponents.map((item) => { return item })
						that.LibraryPageCount = res.returns.page.totalPage
					}
					else {
						// customLog(that, "error", "各组件面板加载第一屏数据", "网络接口 错误", "在 <请求数据> 出现了如下错误: <br>" + HTML.create_KeyPair('错误', Json.respMsg, "String"))
					}
					that.MaskShow = false
				})
			},

			// 分类：组件 下的tab点击事件
			clickCompositeComponentsTab(index, currPage) {
				const that = this
				that.MaskShow = true
				let param = {
					pageNum: currPage,
					pageSize: 16,
					tabType: index,
					standardType: 1,
					componentName: that.key_ComponentName != null && that.key_ComponentName.length > 0 ? '' : that.key_ComponentName
				}

				getComponentsByTab(param).then(res => {

					if (res.respCode === 0) {
						let componentsList = res.returns.components
						that.LibraryComponents = []
						if (typeof componentsList != 'undefined' && componentsList.length > 0) {
							that.LibraryComponents = componentsList
						}
						if (param.tabType === 7) {
							for (let i = 0; i < that.LibraryComponents.length; i++) {
								that.LibraryComponents[i].classification = "主杆";
							}
						}
						that.LibraryPageCount = res.returns.page.totalPage
					}

					that.MaskShow = false
				})
			},

			// 分类：贴图 下的tab点击事件
			clickStickerTab(index, currPage) {
				const that = this
				let param = {
					pageNum: currPage,
					pageSize: 16,
					standardType: 1,
					name: that.key_ComponentName != null && that.key_ComponentName.length > 0 ? '' : that.key_ComponentName
				}

				searchStickers(param).then(response => {
					that.LibraryComponents = []
					console.log(response)
					if (response.respCode === 0) {
						if (response.returns != null && response.returns.stickerList != null && response.returns.stickerList.length > 0) {
							that.LibraryComponents = response.returns.stickerList;
							for (let i = 0; i < that.LibraryComponents.length; i++) {
								that.LibraryComponents[i].modulename = that.LibraryComponents[i].stickerName;
								that.LibraryComponents[i].moduleid = response.returns.stickerList[i].id;
								that.LibraryComponents[i].url = that.LibraryComponents[i].stickerAddr;
								that.LibraryComponents[i].classification = '贴图';
								delete that.LibraryComponents[i].stickerAddr;
								delete that.LibraryComponents[i].stickerName;
							}
						}
						that.LibraryPageCount = response.totalPage;
					}
					that.MaskShow = false
				})
			},
			// 分类：模板 下的tab点击事件
			clickPoleTmpl(index, currPage) {
				const that = this
				let param = {
					pageNum: currPage,
					pageSize: 16,
					standardType: 1
				}

				searchPoleTmplByPage(param).then(response => {
					// //console.log(Json)
					that.LibraryComponents = []
					if (response.respCode === 0) {
						that.LibraryComponents = response.returns.tmplList;
						if (that.LibraryComponents != null && that.LibraryComponents.length > 0) {
							for (let i = 0; i < that.LibraryComponents.length; i++) {
								that.LibraryComponents[i].modulename = that.LibraryComponents[i].poleTmplName;
								that.LibraryComponents[i].moduleid = that.LibraryComponents[i].id;
								that.LibraryComponents[i].classification = '模板';
								delete that.LibraryComponents[i].poleTmplName;
							}
						} else {
							that.LibraryComponents = []
						}
						that.LibraryPageCount = response.totalPage;
					}

					that.MaskShow = false
				})
				// .error(function (res) {
				// 	//console.log(res)
				// })
			},

			// 处理零件Type
			getType(belongPartType, index) {
				// 主杆零件
				if (belongPartType === 0) {
					if (index === 0) {
						return index + 1
					} else if (index > 0 && index < 3) {// 侧法兰特殊处理
						return 2
					} else {
						return index
					}
				}
				// 副杆零件
				if (belongPartType === 1) {
					return index < 1 ? index + 1 : index + 2
				}
				return index
			},

			// 处理侧法兰适配
			getSubType(belongPartType, index) {
				// 目前只有主杆的侧法兰有分叉
				if (belongPartType === 0) {
					return index === 1 ? 2 : (index === 2 ? 5 : null)
				}
				return null
			},

			// 处理库
			getStandardType(index) {
				// 检修门应为标准库零件，但自定义库也需要看见
				if (index === 5 || index === 6) {
					return 0
				}
				return 1
			},

			// 分类：主杆零件 下的tab点击事件
			clickPoleParts(index, currPage, belongPartType) {
				const that = this
				let param = {
					pageNum: currPage,
					pageSize: 16,
					type: that.getType(belongPartType, index),
					belongPartType: belongPartType,
					standardType: that.getStandardType(index),
					name: that.key_ComponentName != null && that.key_ComponentName.length > 0 ? null : that.key_ComponentName
				}
				getRowMaterial(param).then(response => {
					that.LibraryComponents = []
					if (response.respCode === 0) {
						if (typeof response.returns != 'undefined' && response.returns.rawMaterialList != null && response.returns.rawMaterialList.length > 0) {
							that.LibraryComponents = response.returns.rawMaterialList
							//debugger
							for (let i = 0; i < that.LibraryComponents.length; i++) {
								that.LibraryComponents[i].modulename = that.LibraryComponents[i].rawMaterialName;
								that.LibraryComponents[i].moduleid = that.LibraryComponents[i].id
								that.LibraryComponents[i].url = that.LibraryComponents[i].fileAddr;
								that.LibraryComponents[i].classification = that.LibraryClassList[that.LibrarySelectedSubClass + 14]
								that.LibraryComponents[i].mainClassification = '零件'
								that.LibraryComponents[i].belongPartType = param.belongPartType

								if (param.type === 2) {
									that.LibraryComponents[i].classification = "侧边法兰"
								}

							}
						}
						that.LibraryPageCount = response.totalPage;
					}
					that.MaskShow = false
				})
			},

			switch_classList(index = this.LibrarySelectedSubClass, currPage) {
				let that = this
				// that.MaskShow = true
				if (index != null) {
					that.LibrarySelectedSubClass = index
				}

				// 分类：组件 下的tab点击事件
				if (that.LibrarySelectedClass === 0) {
					that.clickCompositeComponentsTab(that.LibrarySelectedSubClass, currPage)
				}// 分类：贴图、模板 下的tab点击事件
				else if (that.LibrarySelectedClass === 1) {
					// 贴图
					if (that.LibrarySelectedSubClass === 0) {
						that.clickStickerTab(that.LibrarySelectedSubClass, currPage)
					} else {// 模板
						that.clickPoleTmpl(that.LibrarySelectedSubClass, currPage)
					}
				}// 分类：主干零件 下的tab点击事件
				else if (that.LibrarySelectedClass === 2) {
					// 主杆零件
					that.clickPoleParts(that.LibrarySelectedSubClass, currPage, 0)
				}// 分类：副杆零件 下的tab点击事件
				else if (that.LibrarySelectedClass === 3) {
					// 副杆零件
					that.clickPoleParts(that.LibrarySelectedSubClass, currPage, 1)
				}// 分类：微型杆 下的tab点击事件
				else if (that.LibrarySelectedClass === 4) {
					// 微型杆
					that.clickPoleParts(that.LibrarySelectedSubClass, currPage, 7)
				}
				else {
					customLog(that, "error", "各组件面板加载第一屏数据", "网络接口 错误", "在 <请求数据> 出现了如下错误: <br>" + HTML.create_KeyPair('错误', '未找到对应分类', "String"))

					that.MaskShow = false
				}
			},

			clear_Search() {
				this.key_ComponentName = ''
				// this.key_SpecId = ''
				this.get_Page()
			},

			search(tab) {
				this.get_Page()
			}

		},
		mounted() {
			this.get_FirstComponent()
			this.$EventBus.$on('component_add', (data, args) => {
				// //console.log(data)
				if (data.classification !== '模板' && data.classification !== '贴图') {
					try {
						let ans = ComponentManager.convert_Component_Lagecy(data).get_Object()
						this.$EventBus.$emit('app_open_Popup', 'pw-file-system-dialogue', 'componentshop', '保存', 1000, 800, true, true, true, { path: FileSystem.ROOT.name, savetype: 'component', data: JSON.stringify(ans), savename: ans.name })
					} catch (error) {
						this.$EventBus.$emit('console_add_Output', "error", '生成CreateJson 错误', HTML.create_KeyPair('ComponentName', data.modulename, 'String') + ' ' + HTML.create_KeyPair('ComponentID', data.moduleid, 'Number') + ' ' + error.message)
					}
				}
			})
			this.$EventBus.$on('component_delete', (data, args) => {
				let mymessage = confirm("确认删除!");
				if (mymessage == true) {
					//console.log('component_delete_data', data)
					//console.log('component_delete_this', this)
					if (data.classification === '贴图') {
						let param = {
							stickerId: data.id
						}

						deleteSticker(param).then(res => {
							//console.log('response', res)
							return res.json()
						})
						return;
					}
					if (data.classification === '模板') {
						let param = {
							templateId: data.id
						}

						deletePoleTmpl(param).then(res => {
							return res;
						})
						return;
					}

					let type = null
					console.log(data)
					switch (data.classification) {
						case '杆身': case '副杆身':
							type = 1;
							break;
						case "侧边法兰": case "副侧边法兰":
							type = 2;
							break;
						case "底部法兰": case "副底部法兰":
							type = 3;
							break;
						case "顶部法兰": case "副顶部法兰":
							type = 4;
							break;
						case "小检修门": case "副小检修门":
							type = 5;
							break;
						case "大检修门": case "副大检修门":
							type = 6;
							break;
						case '主杆':
							type = 0;
							break;
						case '副杆':
							type = 1;
							break;
						case '横臂':
							type = 2;
							break;
						case '卡槽':
							type = 3;
							break;
						case '灯臂':
							type = 4;
							break;
						case '搭载设备':
							type = 6;
							break;
						case '连接件':
							type = 5;
							break;
						case '微型杆':
							type = 7;
							break;
					}
					let partsType = null
					//console.log(this.get_Class)
					switch (this.get_Class) {
						case 0:
							partsType = '组件'
							break
						case 1:
							partsType = '贴图及模板'
							break
						case 2:
							partsType = '主杆零件'
							break
						case 3:
							partsType = '副杆零件'
							break
					}
					//console.log(partsType)
					let param = {
						componentId: data.moduleid,
						partsType: type,
						rawMaterialFlag: data.mainClassification === '零件' ? 1 : 0
					}
					data.mainClassification === '零件' ? param.belongPartsType = data.belongPartType : null;

					delComponent(param).then((response) => {
						//console.log('response', response)
						return response
					})
				}
			})
			this.$EventBus.$on('componentshop_search', (tab, name, spec) => {
				// //console.log(tab, name, spec)
				if (name === undefined && spec === undefined) {
					if (this.key_ComponentName !== '' || this.key_SpecId !== '') {
						this.switch_Tab(tab)
						this.clear_Search()
					}
					else {
						if (this.LibrarySelectedClass !== tab) {
							this.switch_Tab(tab)
							this.clear_Search()
						}
					}
					return
				}
				this.key_ComponentName = name || ''
				this.key_SpecId = spec || ''
				this.search(tab)
			})
			let that = this
			get2F3F().then(res => {
				//console.log("2f3f",res)
				for (let i = 0; i < res.returns.length; i++) {
					if (res.returns[i].dicCode == 2) {
						that.id2F = parseInt(res.returns[i].dicValue);
					} else if (res.returns[i].dicCode == 3) {
						that.id3F = parseInt(res.returns[i].dicValue);
					}
				}
			})
		},
		beforeDestroy() {
			this.$EventBus.$off('component_add')
			this.$EventBus.$off('component_delete')
			this.$EventBus.$off('componentshop_search')
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
