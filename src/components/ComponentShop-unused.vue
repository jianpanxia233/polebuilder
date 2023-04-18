<template>
	<div class="container" id="Left-Menu">
		<div class="v-box">
			<div class="topbar">
				<panel-switch-bar :Tabs="PanelTabs" :currentTab="'标准组件库'" :Width="PanelWidth" :Height="PanelHeight" />

				<div class="filler"></div>

				<div class="button" @click="get_FirstComponent(true)">
					<svg class="button-icon-svg" viewBox="-100 -100 1224 1224" version="1.1"
						xmlns="http://www.w3.org/2000/svg">
						<path
							d="M512.034377 0a512 512 0 0 1 296.813714 929.206857l-87.113142-117.540571a365.714286 365.714286 0 1 0-426.569143-5.12l84.041143-109.348572L512.034377 1024H128.034377l77.970286-101.595429-10.971429-8.338285A512 512 0 0 1 512.034377 0z">
						</path>
					</svg>
				</div>
			</div>

			<div class="scroll-container flex" style="position: relative;">
				<!-- Select: 组件分类按钮 -->
				<div class="listview-dark">
					<div v-if="LibraryClassList.length > 0" class="form-container left hbuttonlist">
						<div v-for="(item, index) in LibraryClassList"
							:class="{'button-dark': true, 'selected': index===LibrarySelectedClass}"
							style="flex: 1; min-width: fit-content; margin-left: 0px;"
							@click="LibrarySelectedClass = index" :key="item">
							<a class="button-text">{{item}}</a>
						</div>
					</div>
					<div v-else class="form-container center leftpadding" style="height: 36px;">
						<div class="title-dark">
							无
						</div>
					</div>
				</div>

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
							<div class="form-container gap">
								<!-- <div class="form-container" style="flex: unset">
									<div class="title-dark"
										style="margin-right: 6px; text-align: left; word-break: break-all;">设备号
									</div>
								</div> -->
								<div class="form-container">
									<input class="lineedit-dark" type="number"
										style="flex: 1; min-width: 50px; height: auto;" placeholder="设备号"
										v-model.number="key_SpecId" />
								</div>
							</div>
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

				<div class="itemview-dark flex" style="min-height: 100px;">
					<template v-for="component in LibraryComponents[LibrarySelectedClass]">
						<!-- <div class="button-dark">
							<a class="button-text">{{component.modulename + ' CID:' + component.moduleid}}</a>
						</div> -->
						<moduleview :ModuleName="component.modulename" :ModuleUID="component.moduleid" :ModuleViewID="0"
							:ShowName="component.modulename + ' CID:' + component.moduleid" :Draggable="true"
							:ModuleSrc="component" :actived="false" @clicked="childModuleViewClick"
							@dragended="createModule(component, arguments)">
						</moduleview>
					</template>
				</div>

				<div v-if="LibraryPageCount[LibrarySelectedClass] > 0" class="listview-dark">
					<div class="form-container left gap">
						<div v-for="item, index in LibraryPageCount[LibrarySelectedClass]"
							:class="{'button-dark': true, 'selected': item === LibraryCurrentPage[LibrarySelectedClass]}"
							@click="select_Page(item)">
							<a class="button-text">{{item}}</a>
						</div>
					</div>
				</div>

				<div v-show="MaskShow" class="MaskCover">
					<div class="button-dark" style="background-color: var(--ThemeColor);">
						<div class="title1-dark" style="margin: 0px; padding: 0px; color: var(--FontColorReverse);">
							加载中...
						</div>
					</div>
				</div>

			</div>
		</div>
	</div>
</template>
<script>
	import { customLog, HTML } from './Utils.js'
	// import * as THREE from "three";
	import moduleview from './moduleview'
	import moduleviewlist from './ModuleView'
	import * as ComponentManager from './Sun/ComponentManager.js'
	import PanelSwitchBar from './Sun/PanelSwitchBar'
	import CryptoJS from 'crypto-js'
	import { getComponentsByTab, getComponents } from '../api/Components'

	export default {
		name: 'ComponentShop',
		components: {
			moduleview,
			moduleviewlist,
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
			},
		},
		data() {
			return {
				//Library
				LibrarySelectedClass: 0,
				// componectdata: comsDataManager.Manager.loadResources(),
				LibraryClassList: ['主杆', '副杆', '横臂', '卡槽', '灯臂', '连接件', '搭载设备', '微型杆'],

				LibraryPageCount: [0, 0, 0, 0, 0, 0, 0, 0],

				LibraryComponents: [[], [], [], [], [], [], [], []],

				LibraryCurrentPage: [1, 1, 1, 1, 1, 1, 1, 1],

				MaskShow: false,

				key_ComponentName: '',
				key_SpecId: ''
			}
		},
		computed: {

		},
		watch: {
		},
		methods: {
			childModuleViewClick(modulename, moduleuid) {
				if (this.LeftMenuType === 'Current')
					this.$EventBus.$emit('display_select_Module', moduleuid)
			},

			createModule(component, arg) {
				try {
					let ans = ComponentManager.convert_Component_Lagecy(component).get_Object()
					this.$EventBus.$emit('leftmenu_dragend_Module', arg[0], arg[1], ans, arg[2])
				} catch (error) {
					this.$EventBus.$emit('console_add_Output', "error", '生成CreateJson 错误', HTML.create_KeyPair('ComponentName', arg[0], 'String') + ' ' + HTML.create_KeyPair('ComponentID', arg[1], 'Number') + ' ' + error.message)
				}
			},

			switch_Tab(tab = 1) {
				this.LibrarySelectedClass = tab
			},

			select_Page(item) {
				this.get_Page(this.LibrarySelectedClass, item)
			},

			get_Page(tab, page, count = 8) {
				if (this.MaskShow) return
				this.MaskShow = true
				let that = this
				let param = {
					pageNum: page,
					pageSize: 8,
					tabType: tab,
					componentName: that.key_ComponentName === '' ? '' : that.key_ComponentName,
					specsId: that.key_SpecId === '' ? '' : that.key_SpecId
				}

				getComponentsByTab(param).then(res => {
					if (res.respCode === 0) {
						that.LibraryComponents.splice(tab, 1, res.returns.components)
						that.switch_Tab(tab)
						that.LibraryCurrentPage.splice(that.LibrarySelectedClass, 1, page)
						that.LibraryCurrentPage.splice(tab, 1, res.returns.page.pageNum)
						that.LibraryPageCount.splice(tab, 1, res.returns.page.totalPage)
					}
					else {
						customLog(that, "error", "各组件面板中点击翻页接口", "网络接口 错误", "在 <请求数据> 出现了如下错误: <br>" + HTML.create_KeyPair('错误', res.respMsg, "String"))
					}
					that.MaskShow = false
				})
			},

			get_FirstComponent(force = false) {
				if (this.MaskShow && !force) return
				this.MaskShow = true
				let that = this

				getComponents().then(res => {
					// //console.log(Json)
					if (res.respCode === 0) {
						let pages_count = res.returns.components.page
						for (let key in pages_count) {
							that.LibraryPageCount[key] = pages_count[key]
						}
						that.LibraryPageCount = that.LibraryPageCount.map((item) => { return item })
						for (let i = 0; i <= 7; i++) {
							let components = res.returns.components[i]
							if (components === undefined) {
								that.LibraryComponents[i] = []
							}
							else
								that.LibraryComponents[i] = components
						}
						that.LibraryComponents = that.LibraryComponents.map((item) => { return item })
						that.LibraryCurrentPage = that.LibraryComponents.map((item) => { return 1 })
					}
					else {
						customLog(that, "error", "各组件面板加载第一屏数据", "网络接口 错误", "在 <请求数据> 出现了如下错误: <br>" + HTML.create_KeyPair('错误', res.respMsg, "String"))
					}
					that.MaskShow = false
				})
			},

			clear_Search() {
				this.key_ComponentName = ''
				this.key_SpecId = ''
				this.get_Page(this.LibrarySelectedClass, 1)
			},

			search(tab) {
				if (this.key_ComponentName === '' && this.key_SpecId === '') return
				this.get_Page(tab || this.LibrarySelectedClass, 1)
			}
		},
		mounted() {
			this.get_FirstComponent()
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
		},
		beforeDestroy() {
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