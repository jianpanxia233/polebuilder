<template>
	<div id="app">
		<div class="cover" id="cover">
			<div class="Layout-Panel" id="PopupPanel">
				<div class="container"
					style="left: 12px; right: 12px; top: 12px; bottom: 12px; box-shadow: 0px 0px 20px 20px rgba(0,0,0,0.15);">
					<div class="v-box">
						<div class="topbar" id="PopupDrag" style="overflow: visible;">
							<div class="tab selected">
								<a class="tab-text" id="PopupTitle">弹出框</a>
							</div>
							<div class="filler"></div>
							<!-- <div class="button" @click="Popup.center()">
									<img class="button-icon" src="./assets/img/Pointer.svg" draggable="false" />
								</div> -->
							<div class="space6px" />
							<div v-if="CanClose" class="button" @click="Popup.popup(false)">
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


						<keep-alive>
							<component :is="PopupWindow" :PopupSize="PopupSize" :PopupShowHide="PopupShowHide"
								:Parent="PopupParent" :Input="PopupInput">
							</component>
						</keep-alive>
					</div>

				</div>
				<div id="PopupResize">
				</div>
			</div>
		</div>

		<template v-for="form, idx in Forms">
			<component :style="{'z-index': 10000 + idx}" :is="form.Form" :key="form.Self" :PopupParam="form.PopupParam"
				:Self="form.Self" :Parent="form.Parent" :Input="form.Input" :Handler="form.Handler"
				@close="close_Form(form.Self)" @top="top_Form(idx)">
			</component>
		</template>

		<context-menu></context-menu>

		<top-bar :current-page="currentPage">
			<template slot="topmenu">
				<div class="form-container left" style="align-items: center; padding-left: 2px;">
					<div class="button-dark tool-button" style="background-color: transparent; padding-top: 4px;"
						@mousedown.left="click_Project()">
						<a class="button-text">文件</a>
					</div>
					<!-- <div class="button-dark tool-button" style="background-color: transparent;">
						<a class="button-text">编辑器</a>
					</div>
					<div class="button-dark tool-button" style="background-color: transparent;">
						<a class="button-text">帮助</a>
					</div> -->
				</div>
			</template>
		</top-bar>

		<div class="Layout-main" id="MainLayout">

			<div class="Layout-Panel" id="ComponentShopPanel">
				<component-shop ref="ComponentShop" :PanelTabs="ComponentShopPanels.tabs"
					:PanelWidth="ComponentShopPanels.width" :PanelHeight="ComponentShopPanels.height" />
			</div>

			<div class="Layout-Panel" id="CustomComponentShopPanel">
				<custom-component-shop ref="CustomComponentShop" :PanelTabs="CustomComponentShopPanels.tabs"
					:PanelWidth="CustomComponentShopPanels.width" :PanelHeight="CustomComponentShopPanels.height" />
			</div>

			<div class="Layout-Panel" id="InspectorPanel">
				<inspector ref="Inspector" :PanelTabs="InspectorPanels.tabs" :PanelWidth="InspectorPanels.width"
					:PanelHeight="InspectorPanels.height" />
			</div>

			<div class="Layout-Panel" id="OutlinerPanel">
				<outliner ref="Outliner" :ModuleSelected="moduleSelectedUID" :PanelTabs="OutlinerPanels.tabs"
					:PanelWidth="OutlinerPanels.width" :PanelHeight="OutlinerPanels.height" />
			</div>

			<div class="Layout-Panel" id="FileSystemPanel">
				<file-system ref="FileSystem" :PanelTabs="FileSystemPanels.tabs" :PanelWidth="FileSystemPanels.width"
					:PanelHeight="FileSystemPanels.height" />
			</div>

			<div class="Layout-Panel" id="ConsolePanel">
				<console ref="Console" :ConsoleSize="ConsoleSize" :PanelTabs="ConsolePanels.tabs"
					:PanelWidth="ConsolePanels.width" :PanelHeight="ConsolePanels.height" />
			</div>

			<div class="Layout-Panel" id="CanvasPanel">
				<model-display v-show="Mode==='build'" ref="Canvas" :CanvasSize="CanvasSize"
					@moduleSelect="moduleSelect" :canvasid="0" :shouldRender="true" :PanelTabs="CanvasPanels.tabs"
					:PanelWidth="CanvasPanels.width" :PanelHeight="CanvasPanels.height" />
				<box-display v-show="Mode==='engineeringdisplay'" :CanvasSize="CanvasSize" :Mode="Mode"
					:shouldRender="Mode==='engineeringdisplay'" :PanelTabs="CanvasPanels.tabs"
					:PanelWidth="CanvasPanels.width" :PanelHeight="CanvasPanels.height" />

			</div>

			<div class="Layout-Panel" id="Canvas2Panel">
				<model-display2 ref="Canvas2" :CanvasSize="CanvasSize2" @moduleSelect="moduleSelect" :canvasid="0"
					:shouldRender="true" :PanelTabs="Canvas2Panels.tabs" :PanelWidth="Canvas2Panels.width"
					:PanelHeight="Canvas2Panels.height" />
			</div>

			<!-- <div class="Layout-Panel" id="ManualPanel">
				<manual :PanelTabs="ManualPanels.tabs" :PanelWidth="ManualPanels.width"
					:PanelHeight="ManualPanels.height" />
			</div> -->

			<div class="Drag_Box" id="dragbox">
			</div>
		</div>

		<div v-show="TerminalShow" class="cover active" style="z-index: 100000;">
			<div id="terminal">
				<div class="filler" />
				<div
					style="flex: 2; max-width: 800px; background-color: var(--PanelColor); border-radius: 0 0 var(--ContainerRadius) var(--ContainerRadius); box-shadow: rgb(0 0 0 / 15%) 0px 0px 20px 20px; padding: 10px; box-sizing: border-box; display: flex; pointer-events: all; align-self: flex-start; max-height: 100%; ">
					<div class="form-vcontainer" style="gap: 10px;">
						<!-- <div class="title1-dark" style="font-family: consolas; color: var(--FontColor);">
						Terminal
					</div> -->
						<div class="listview-dark">
							<div class="form-container gap" style="flex: 0;">
								<div class="title-dark noleftmargin" style="font-family: consolas;font-size: 18px;">>>
								</div>
								<input ref="terminal-input" class="lineedit-dark" v-model="TerminalInput"
									style="font-family: consolas; flex: 1 0;font-size: 18px;"
									@keypress.enter="act_Action()">
							</div>
						</div>
						<!-- <div class="form-container gap" style="flex: 1; gap: 10px;"> -->
						<!-- <div class="title-dark noleftmargin" style="font-family: consolas; align-self: flex-start;">--
						</div> -->
						<div v-if="get_List.length > 0" class="itemview-dark" style="flex: 1;">
							<template v-for="item, idx in get_List">
								<div class="select-dark" style="width: 100%; padding: 7px 8px 7px 7px;"
									@click="act_Action(item)"
									@contextmenu="TerminalInput = item.action.description + ' '; focus_Terminal();">
									<div class="form-container left vcenter">
										<div v-html="get_Icon(item.icon)"
											style="height: 18px; width: 18px; justify-self: flex-start;margin-right: 8px;">
										</div>
										<a v-html="item.text"
											style="justify-self: flex-start; font-family: consolas; font-size: 16px;"></a>
										<a v-html="item.doc"
											style="justify-self: flex-start; font-family: consolas; font-size: 16px; margin-left: 6px; color: var(--BarColorTransparent);"></a>
										<div class="filler"></div>
										<!-- <a v-html="item.panel"></a> -->
										<a v-html="item.title" style="justify-self: flex-start;"></a>
										<template v-if="item.key !== ''">
											<a v-html="item.key"
												style="justify-self: flex-start; margin-left: 10px;"></a>
										</template>
									</div>
								</div>
							</template>
						</div>
						<!-- </div> -->

					</div>
				</div>
				<div class="filler" />
			</div>
		</div>
	</div>
</template>

<script>
	import TopBar from './components/TopBar'
	import ComponentShop from './components/ComponentShop2'
	import CustomComponentShop from './components/CustomComponentShop'
	import Console from './components/Console'
	import Outliner from './components/Outliner'
	import FileSystem from './components/FileSystem'
	import Inspector from './components/Inspector'
	import ModelDisplay from './components/ModelDisplay'
	import BoxDisplay from './components/BoxDisplay'
	import ModelDisplay2 from './components/ModelDisplay2'
	import ContextMenu from './components/ContextMenu'
	import { Panel, Layouter } from './components/Sun/Layout.js'
	import * as Popup from './components/Sun/Popup.js'
	import * as WindowEnv from './components/Sun/WindowEnv.js'
	import * as ShortCut from './components/Sun/ShortCut.js'
	import PW_Setting from './components/PopupWindows/PW_Setting'
	// import PW_RuleLangAction from './components/PopupWindows/PW_Setting'
	import PW_PoleBoxDisplay from './components/PopupWindows/PW_PoleBoxDisplay'
	import PW_Confirm from './components/PopupWindows/PW_Confirm'
	import PW_UpdateInfo from './components/PopupWindows/PW_UpdateInfo'
	import PW_FileDialogue from './components/PopupWindows/PW_FileDialogue'
	// import PW_RuleLangAction from './components/PopupWindows/PW_RuleLangAction'
	import PW_SpecSelect from './components/PopupWindows/PW_SpecSelect2'
	import PW_Remote from './components/PopupWindows/PW_Remote'
	import PW_Progress from './components/PopupWindows/PW_Progress'
	import { customLog, HTML, ICONMAP, change_UITheme } from './components/Utils.js'
	import { getPartsByPoleCode } from '@/api/ThreeDimExhibition'
	import * as FS from './components/Sun/FileSystem'
	import { fire_Event } from './components/Sun/Extensions.js'
	import PF_FileDialogue from './components/PopupForm/PF_FileDialogue'
	import PF_Confirm from './components/PopupForm/PF_Confirm'
	import PF_DiffInspect from './components/PopupForm/PF_DiffInspect'
	import PF_Inspector from './components/PopupForm/PF_InspectorTest'

	const DEFAULT_LAYOUT = { "type": "control", "name": "CONTROL", "panel_id": null, "min_width": 3060, "min_height": 1200, "direction": false, "expand_x": true, "expand_y": true, "visible": true, "control_switch": false, "current_panelname": "", "children": [{ "type": "control", "name": "CONTROL", "panel_id": null, "min_width": 3060, "min_height": 800, "direction": true, "expand_x": true, "expand_y": true, "visible": true, "control_switch": false, "current_panelname": "", "children": [{ "type": "control", "name": "CONTROL", "panel_id": null, "min_width": 1320, "min_height": 800, "direction": true, "expand_x": true, "expand_y": true, "visible": true, "control_switch": false, "current_panelname": "", "children": [{ "type": "control", "name": "CONTROL", "panel_id": null, "min_width": 420, "min_height": 800, "direction": false, "expand_x": false, "expand_y": true, "visible": true, "control_switch": false, "current_panelname": "", "children": [{ "type": "panel", "name": "大纲", "panel_id": "OutlinerPanel", "min_width": 420, "min_height": 400, "expand_x": false, "expand_y": true, "visible": true, "children": [] }, { "type": "panel", "name": "资源管理器", "panel_id": "FileSystemPanel", "min_width": 420, "min_height": 400, "expand_x": false, "expand_y": true, "visible": true, "children": [] }] }, { "type": "panel", "name": "画布", "panel_id": "CanvasPanel", "min_width": 900, "min_height": 400, "expand_x": true, "expand_y": true, "visible": true, "children": [] }] }, { "type": "control", "name": "CONTROL", "panel_id": null, "min_width": 1740, "min_height": 400, "direction": true, "expand_x": true, "expand_y": true, "visible": true, "control_switch": false, "current_panelname": "", "children": [{ "type": "control", "name": "CONTROL", "panel_id": null, "min_width": 1320, "min_height": 400, "direction": true, "expand_x": true, "expand_y": true, "visible": true, "control_switch": false, "current_panelname": "", "children": [{ "type": "panel", "name": "PoleViewer", "panel_id": "Canvas2Panel", "min_width": 900, "min_height": 400, "expand_x": true, "expand_y": true, "visible": true, "children": [] }, { "type": "panel", "name": "检视器", "panel_id": "InspectorPanel", "min_width": 420, "min_height": 400, "expand_x": false, "expand_y": true, "visible": true, "children": [] }] }, { "type": "control", "name": "CONTROL", "panel_id": null, "min_width": 420, "min_height": 400, "direction": true, "expand_x": false, "expand_y": true, "visible": true, "control_switch": true, "current_panelname": "自定义组件库", "children": [{ "type": "panel", "name": "标准组件库", "panel_id": "ComponentShopPanel", "min_width": 420, "min_height": 400, "expand_x": false, "expand_y": true, "visible": true, "children": [] }, { "type": "panel", "name": "自定义组件库", "panel_id": "CustomComponentShopPanel", "min_width": 420, "min_height": 400, "expand_x": false, "expand_y": true, "visible": true, "children": [] }] }] }] }, { "type": "panel", "name": "控制台", "panel_id": "ConsolePanel", "min_width": 900, "min_height": 46, "expand_x": false, "expand_y": false, "visible": true, "children": [] }] }
	const DEFAULT_VIEWLAYOUT = { "type": "control", "name": "CONTROL", "panel_id": null, "min_width": 3060, "min_height": 1200, "direction": false, "expand_x": true, "expand_y": true, "visible": true, "control_switch": false, "current_panelname": "", "children": [{ "type": "control", "name": "CONTROL", "panel_id": null, "min_width": 3060, "min_height": 800, "direction": true, "expand_x": true, "expand_y": true, "visible": true, "control_switch": false, "current_panelname": "", "children": [{ "type": "control", "name": "CONTROL", "panel_id": null, "min_width": 1320, "min_height": 800, "direction": true, "expand_x": true, "expand_y": true, "visible": true, "control_switch": false, "current_panelname": "", "children": [{ "type": "control", "name": "CONTROL", "panel_id": null, "min_width": 420, "min_height": 800, "direction": false, "expand_x": false, "expand_y": true, "visible": true, "control_switch": false, "current_panelname": "", "children": [{ "type": "panel", "name": "大纲", "panel_id": "OutlinerPanel", "min_width": 420, "min_height": 400, "expand_x": false, "expand_y": true, "visible": false, "children": [] }, { "type": "panel", "name": "资源管理器", "panel_id": "FileSystemPanel", "min_width": 420, "min_height": 400, "expand_x": false, "expand_y": true, "visible": true, "children": [] }] }, { "type": "panel", "name": "画布", "panel_id": "CanvasPanel", "min_width": 900, "min_height": 400, "expand_x": true, "expand_y": true, "visible": true, "children": [] }] }, { "type": "control", "name": "CONTROL", "panel_id": null, "min_width": 1740, "min_height": 400, "direction": true, "expand_x": true, "expand_y": true, "visible": true, "control_switch": false, "current_panelname": "", "children": [{ "type": "control", "name": "CONTROL", "panel_id": null, "min_width": 1320, "min_height": 400, "direction": true, "expand_x": true, "expand_y": true, "visible": true, "control_switch": false, "current_panelname": "", "children": [{ "type": "panel", "name": "PoleViewer", "panel_id": "Canvas2Panel", "min_width": 900, "min_height": 400, "expand_x": true, "expand_y": true, "visible": true, "children": [] }, { "type": "panel", "name": "检视器", "panel_id": "InspectorPanel", "min_width": 420, "min_height": 400, "expand_x": false, "expand_y": true, "visible": false, "children": [] }] }, { "type": "control", "name": "CONTROL", "panel_id": null, "min_width": 420, "min_height": 400, "direction": true, "expand_x": false, "expand_y": true, "visible": true, "control_switch": true, "current_panelname": "自定义组件库", "children": [{ "type": "panel", "name": "标准组件库", "panel_id": "ComponentShopPanel", "min_width": 420, "min_height": 400, "expand_x": false, "expand_y": true, "visible": false, "children": [] }, { "type": "panel", "name": "自定义组件库", "panel_id": "CustomComponentShopPanel", "min_width": 420, "min_height": 400, "expand_x": false, "expand_y": true, "visible": false, "children": [] }] }] }] }, { "type": "panel", "name": "控制台", "panel_id": "ConsolePanel", "min_width": 900, "min_height": 46, "expand_x": false, "expand_y": false, "visible": true, "children": [] }] }

	const ENGINEERING_LAYOUT = { "type": "control", "name": "CONTROL", "panel_id": null, "min_width": 3060, "min_height": 1200, "direction": false, "expand_x": true, "expand_y": true, "visible": true, "control_switch": false, "current_panelname": "", "children": [{ "type": "control", "name": "CONTROL", "panel_id": null, "min_width": 3060, "min_height": 800, "direction": true, "expand_x": true, "expand_y": true, "visible": true, "control_switch": false, "current_panelname": "", "children": [{ "type": "control", "name": "CONTROL", "panel_id": null, "min_width": 1320, "min_height": 800, "direction": true, "expand_x": true, "expand_y": true, "visible": false, "control_switch": false, "current_panelname": "", "children": [{ "type": "control", "name": "CONTROL", "panel_id": null, "min_width": 420, "min_height": 800, "direction": false, "expand_x": false, "expand_y": true, "visible": false, "control_switch": false, "current_panelname": "", "children": [{ "type": "panel", "name": "大纲", "panel_id": "OutlinerPanel", "min_width": 420, "min_height": 400, "expand_x": false, "expand_y": true, "visible": false, "children": [] }, { "type": "panel", "name": "资源管理器", "panel_id": "FileSystemPanel", "min_width": 420, "min_height": 400, "expand_x": false, "expand_y": true, "visible": false, "children": [] }] }, { "type": "panel", "name": "画布", "panel_id": "CanvasPanel", "min_width": 900, "min_height": 400, "expand_x": true, "expand_y": true, "visible": true, "children": [] }] }, { "type": "control", "name": "CONTROL", "panel_id": null, "min_width": 1740, "min_height": 400, "direction": true, "expand_x": true, "expand_y": true, "visible": true, "control_switch": false, "current_panelname": "", "children": [{ "type": "control", "name": "CONTROL", "panel_id": null, "min_width": 1320, "min_height": 400, "direction": true, "expand_x": true, "expand_y": true, "visible": false, "control_switch": false, "current_panelname": "", "children": [{ "type": "panel", "name": "PoleViewer", "panel_id": "Canvas2Panel", "min_width": 900, "min_height": 400, "expand_x": true, "expand_y": true, "visible": false, "children": [] }, { "type": "panel", "name": "检视器", "panel_id": "InspectorPanel", "min_width": 420, "min_height": 400, "expand_x": false, "expand_y": true, "visible": false, "children": [] }] }, { "type": "control", "name": "CONTROL", "panel_id": null, "min_width": 420, "min_height": 400, "direction": true, "expand_x": false, "expand_y": true, "visible": true, "control_switch": true, "current_panelname": "自定义组件库", "children": [{ "type": "panel", "name": "标准组件库", "panel_id": "ComponentShopPanel", "min_width": 420, "min_height": 400, "expand_x": false, "expand_y": true, "visible": false, "children": [] }, { "type": "panel", "name": "自定义组件库", "panel_id": "CustomComponentShopPanel", "min_width": 420, "min_height": 400, "expand_x": false, "expand_y": true, "visible": false, "children": [] }] }] }] }, { "type": "panel", "name": "控制台", "panel_id": "ConsolePanel", "min_width": 900, "min_height": 46, "expand_x": false, "expand_y": false, "visible": false, "children": [] }] }

	export default {
		name: 'App',
		components: {
			'top-bar': TopBar,
			'component-shop': ComponentShop,
			'custom-component-shop': CustomComponentShop,
			'inspector': Inspector,
			// 'manual': Manual,
			'model-display': ModelDisplay,
			'box-display': BoxDisplay,
			'model-display2': ModelDisplay2,
			'outliner': Outliner,
			'file-system': FileSystem,
			'console': Console,
			'pw-setting': PW_Setting,
			'pw-poleboxdisplay': PW_PoleBoxDisplay,
			'pw-confirm': PW_Confirm,
			'pw-update-info': PW_UpdateInfo,
			'pw-file-system-dialogue': PW_FileDialogue,
			'pf-file-system-dialogue': PF_FileDialogue,
			'pf-confirm': PF_Confirm,
			'pf-diff-inspect': PF_DiffInspect,
			'pf-inspector': PF_Inspector,
			// 'pw-rulelang-action': PW_RuleLangAction,
			'pw-spec-select': PW_SpecSelect,
			'pw-remote': PW_Remote,
			'pw-progress': PW_Progress,
			'context-menu': ContextMenu
		},
		data() {
			return {
				Layout: null,
				Popup: null,
				Mode: '',
				Forms: [],

				moduleSelectedUID: BigInt(-1),

				currentPage: 'build',
				CanvasSize: { x: 0, y: 0, width: 0, height: 0 },
				CanvasSize2: { x: 0, y: 0, width: 0, height: 0 },
				ConsoleSize: { x: 0, y: 0, width: 0, height: 0 },
				mainLayout: null,
				PopupSize: { width: 0, height: 0 },
				PopupShowHide: false,
				PopupWindow: '',
				PopupParent: '',
				PopupInput: null,
				resize_func: () => {
					this.Layout.refresh_Layout()
				},
				CanClose: true,

				OutlinerPanels: { tabs: [{ name: '大纲', panelid: 'OutlinerPanel' }], width: 420, height: 240 },
				FileSystemPanels: { tabs: [{ name: '资源管理器', panelid: 'FileSystemPanel' }], width: 420, height: 240 },
				ComponentShopPanels: { tabs: [{ name: '标准组件库', panelid: 'ComponentShopPanel' }], width: 420, height: 400 },
				CustomComponentShopPanels: { tabs: [{ name: '自定义组件库', panelid: 'CustomComponentShopPanel' }], width: 420, height: 400 },
				InspectorPanels: { tabs: [{ name: '检视器', panelid: 'InspectorPanel' }], width: 420, height: 400 },
				// ManualPanels: { tabs: [{ name: '手册', panelid: 'InspectorPanel' }], width: 420, height: 400 },
				CanvasPanels: { tabs: [{ name: '画布', panelid: 'CanvasPanel' }], width: 900, height: 400 },
				Canvas2Panels: { tabs: [{ name: 'PoleViewer', panelid: 'Canvas2Panel' }], width: 900, height: 400 },
				ConsolePanels: { tabs: [{ name: '控制台', panelid: 'ConsolePanel' }], width: 900, height: 46 },

				ExtensionAction: [],
				TerminalShow: false,
				TerminalInput: ''
			}
		},
		computed: {
			get_List: function () {
				let list = []
				if (this.TerminalInput === '') {
					return this.ExtensionAction
				}
				else {
					list = this.ExtensionAction.filter((item) => {
						return item.text.indexOf(this.TerminalInput) !== -1// || item.specsId.toString().indexOf(this.keyword) !== -1
					})
				}
				return list.map((i) => {
					let idx = i.text.indexOf(this.TerminalInput)
					let front = i.text.slice(0, idx)
					let end = i.text.slice(idx + this.TerminalInput.length)
					return {
						title: i.title,
						ext: i.ext,
						icon: i.icon,
						doc: i.doc,
						action: i.action,
						key: i.key,
						text: `<span>${front}</span><span style="background-color: var(--ThemeColor); color: var(--FontColorReverse); border-radius: var(--ObjectRadius); padding: 0px 3px;">${this.TerminalInput}</span><span>${end}</span>`
					}
				})
			}
		},
		methods: {
			change_Page(page) {
				if (page === undefined) {
					page = this.currentPage
				}
				else
					this.currentPage = page
				if (page === 'build') {
					this.Layout.save = "layout"
					this.Mode = 'build'
					if (window.localStorage.layout !== undefined) {
						this.Layout.load_Layout(JSON.parse(window.localStorage.layout))
					}
					else {
						this.Layout.load_Layout(DEFAULT_LAYOUT)
					}
				} else if (page === 'engineeringdisplay') {
					this.Layout.load_Layout(ENGINEERING_LAYOUT)
					this.Mode = 'engineeringdisplay'
				}
				else {
					this.Layout.save = "viewlayout"
					if (window.localStorage.viewlayout !== undefined) {
						this.Layout.load_Layout(JSON.parse(window.localStorage.viewlayout))
					}
					else {
						this.Layout.load_Layout(DEFAULT_VIEWLAYOUT)
					}
				}
			},
			moduleSelect(name, uid, componentid) {
				this.moduleSelectedUID = uid
			},
			//Resize
			on_Canvas_Resize(x, y, width, height) {
				this.CanvasSize = { x: x + this.mainLayout.offsetLeft, y: y + this.mainLayout.offsetTop, width: width, height: height }
			},
			on_Canvas2_Resize(x, y, width, height) {
				this.CanvasSize2 = { x: x + this.mainLayout.offsetLeft, y: y + this.mainLayout.offsetTop, width: width, height: height }
			},
			on_Console_Resize(x, y, width, height) {
				this.ConsoleSize = { x: x + this.mainLayout.offsetLeft, y: y + this.mainLayout.offsetTop, width: width, height: height }
			},
			on_Popup_Resize(x, y, width, height) {
				this.PopupSize = { x: x, y: y, width: width, height: height }
			},
			on_Popup_ShowHide_Changed(showhide) {
				this.PopupShowHide = showhide
				if (!showhide) {
					this.PopupWindow = ''
				}
			},
			// PanelTabs
			Outliner_PanelTabs_Change(tabs, width, height) {
				this.OutlinerPanels = { tabs: tabs, width: width, height: height }
			},
			FileSystem_PanelTabs_Change(tabs, width, height) {
				this.FileSystemPanels = { tabs: tabs, width: width, height: height }
			},
			ComponentShop_PanelTabs_Change(tabs, width, height) {
				this.ComponentShopPanels = { tabs: tabs, width: width, height: height }
			},
			CustomComponentShop_PanelTabs_Change(tabs, width, height) {
				this.CustomComponentShopPanels = { tabs: tabs, width: width, height: height }
			},
			Inspector_PanelTabs_Change(tabs, width, height) {
				this.InspectorPanels = { tabs: tabs, width: width, height: height }
			},
			// Manual_PanelTabs_Change(tabs, width, height) {
			// 	this.ManualPanels = { tabs: tabs, width: width, height: height }
			// },
			Canvas_PanelTabs_Change(tabs, width, height) {
				this.CanvasPanels = { tabs: tabs, width: width, height: height }
			},
			Canvas2_PanelTabs_Change(tabs, width, height) {
				this.Canvas2Panels = { tabs: tabs, width: width, height: height }
			},
			Console_PanelTabs_Change(tabs, width, height) {
				this.ConsolePanels = { tabs: tabs, width: width, height: height }
			},

			close_Form(sym) {
				let idx = 0;
				let parent = [sym];
				while (idx < this.Forms.length) {
					if (this.Forms[idx].Self === sym) {
						this.Forms.splice(idx, 1);
						continue;
					}
					if (parent.includes(this.Forms[idx].Parent)) {
						parent.push(this.Forms[idx].Self)
						this.Forms.splice(idx, 1);
						continue;
					}
					else {
						idx++;
					}
				}
			},

			top_Form(idx) {
				let form = this.Forms.splice(idx, 1)[0]
				this.Forms.push(form)
			},

			check_ShortCut() {
				return true
			},

			beforeunloadFn(e) {
				alert("REFRESH")
				e = e || window.event;

				// 兼容IE8和Firefox 4之前的版本
				if (e) {
					e.returnValue = '关闭提示';
				}

				// Chrome, Safari, Firefox 4+, Opera 12+ , IE 9+
				return '关闭提示';
			},

			click_Project() {
				this.$EventBus.$emit('contextmenu_open', 'app', [/*{ text: '打开项目', icon: 'blank', action: 'filesystem_import_Project' }, { text: '关闭项目', icon: 'blank', action: 'open_Project' }, '-',*/ { text: '新建', list: [{ text: '合杆设计 .pole', icon: 'pole', action: 'display_new_File', data: 'pole' }, { text: '组件 .component', icon: 'component', action: 'display_new_File', data: 'component' }, { text: '复合组件 .mainpole', icon: 'mainpole', action: 'display_new_File', data: 'mainpole' }, { text: '路牌', icon: 'roadsvg', action: 'display_new_File', data: 'roadsvg' }], first: 0 }, { text: '远程加载', icon: 'blank', action: 'load_Remote' }, { text: '远程加载项目', icon: 'blank', action: 'load_Remote50Poles' }], null, 300, 34, -1, false)
			},

			focus_Terminal() {
				let linedit = this.$refs['terminal-input']
				let that = this
				setTimeout(function () {
					linedit.focus()
					linedit.setSelectionRange(that.TerminalInput.length, that.TerminalInput.length)
				}, 0)
			},

			press_Escape() {
				if (!this.TerminalShow) {
					this.TerminalInput = ''
					this.focus_Terminal()
				}
				this.TerminalShow = !this.TerminalShow
			},

			act_Action(item) {
				if (item) {
					fire_Event(item.ext, item.action, [])
					this.TerminalShow = false
					this.TerminalInput = ''
				}
				else {
					let target = this.TerminalInput.split(' ').filter((i) => i !== '')
					for (let i of this.ExtensionAction) {
						// console.log(i.text, target[0])
						if (i.text === target[0]) {
							fire_Event(i.ext, i.action, target.slice(1, target.length))
							this.TerminalShow = false
							this.TerminalInput = ''
						}
					}
				}
			},

			get_Icon(icon) {
				if (ICONMAP[icon] !== undefined) {
					return ICONMAP[icon]
				}
				else {
					return ICONMAP.blank
				}
			},

		},
		mounted() {

			this.mainLayout = document.getElementById('MainLayout')

			this.Layout = new Layouter('MainLayout', ['FileSystemPanel', 'ComponentShopPanel', 'CustomComponentShopPanel', 'CanvasPanel', 'Canvas2Panel', 'InspectorPanel', 'ConsolePanel', 'OutlinerPanel', 'ManualPanel'], document.getElementById('dragbox'), 2, "layout")
			let PanelComponentShop = new Panel("ComponentShopPanel", '标准组件库', null, false, true, 420, 420, true, this.ComponentShop_PanelTabs_Change)
			let PanelCustomComponentShop = new Panel("CustomComponentShopPanel", '自定义组件库', null, false, true, 420, 420, true, this.CustomComponentShop_PanelTabs_Change)
			let PanelOutliner = new Panel("OutlinerPanel", '大纲', null, false, true, 420, 240, true, this.Outliner_PanelTabs_Change)
			let PanelFileSystem = new Panel("FileSystemPanel", '资源管理器', null, false, true, 420, 240, true, this.FileSystem_PanelTabs_Change)
			let PanelCanvas = new Panel("CanvasPanel", '画布', this.on_Canvas_Resize, true, true, 900, 400, true, this.Canvas_PanelTabs_Change)
			let PanelCanvas2 = new Panel("Canvas2Panel", 'PoleViewer', this.on_Canvas2_Resize, true, true, 900, 400, true, this.Canvas2_PanelTabs_Change)
			let PanelInspector = new Panel("InspectorPanel", '检视器', null, false, true, 420, 400, true, this.Inspector_PanelTabs_Change)
			let PanelConsole = new Panel("ConsolePanel", '控制台', this.on_Console_Resize, false, false, 900, 46, true, this.Console_PanelTabs_Change)
			this.Layout.layout_tree.split([PanelOutliner, PanelComponentShop, PanelCustomComponentShop, PanelCanvas, PanelCanvas2, PanelConsole, PanelCanvas2, PanelInspector, PanelFileSystem])

			this.Layout.format()
			this.Layout.refresh_Layout()

			ShortCut.set_Layouter(this.Layout, this.check_ShortCut)
			ShortCut.bind_ShortCut('escape', 'Escape', undefined, this.press_Escape, false, '开/关 终端')
			WindowEnv.set_App(this)

			this.$EventBus.$on('app_new_Form', param => {
				this.Forms.push(param)
			})

			if (window.localStorage.theme !== undefined) {
				change_UITheme(window.localStorage.theme)
			}

			this.Popup = new Popup.PopupWindow('cover', 'PopupDrag', 'PopupResize', 'PopupPanel', 'PopupTitle', this.on_Popup_Resize, this.on_Popup_ShowHide_Changed, () => { }, true, -25, -25)

			window.addEventListener("resize", this.resize_func)

			this.$EventBus.$on('app_change_Page', page => {
				if (this.currentPage === page) return;
				this.change_Page(page)
			})

			this.$EventBus.$on('app_save_Layout', () => {
				// //console.log(">>>>")
				this.Layout.format()
				window.localStorage[this.currentPage === 'build' ? 'layout' : 'viewlayout'] = JSON.stringify(this.Layout.save_Layout())
			})

			this.$EventBus.$on('app_reset_Layout', () => {
				this.Layout.load_Layout(DEFAULT_LAYOUT)
				this.Layout.format()
				window.localStorage.layout = JSON.stringify(this.Layout.save_Layout())
				this.Layout.refresh_Layout()
			})

			this.$EventBus.$on('app_openhide_Canvas2', (show) => {
				let panel = this.Layout.get_Panel_by_ID('Canvas2Panel')
				// console.log(panel.visible, show)
				if (show) {
					panel.set_Visible(!panel.visible)
					this.Layout.format()
					this.Layout.refresh_Layout()
					this.$EventBus.$emit('app_save_Layout')
				}
				else if (panel.visible !== show) {
					panel.set_Visible(show)
					this.Layout.format()
					this.Layout.refresh_Layout()
					this.$EventBus.$emit('app_save_Layout')
				}
			})

			this.$EventBus.$on('panel_Fold', (name, id) => {

			})

			this.$EventBus.$on('app_open_Popup', (popup, parent, title, width, height, center, resizeable, exculsive, input = undefined, canclose = true, force = false) => {
				this.PopupParent = parent
				this.PopupInput = input
				this.Popup.set_Title(title)
				if (this.PopupWindow !== popup || force) {
					this.PopupWindow = popup
					if (!(width <= 100 || height <= 100)) {
						this.Popup.resize(width, height)
					}
					if (center) {
						this.Popup.center()
					}
					this.Popup.set_Resizeable(resizeable)
					this.Popup.popup(true, exculsive)
					this.CanClose = canclose
				}
			})

			//this.$EventBus.$emit('app_open_Popup', 'pw-update-info', 'app', '关于', 300, 140, true, true, true, { title: 'Alpha 1', description: '测试、修正、整合' })

			this.$EventBus.$on('app_close_Popup', () => {
				this.Popup.popup(false)
			})

			this.$EventBus.$on('panel_switch_Tab', (name, id) => {
				// //console.log(name, id)
				let controlpanel = this.Layout.get_Panel_by_ID(id).parent
				if (controlpanel.is_ControlPanel() && controlpanel.control_switch) {
					// //console.log(">>>>>")
					controlpanel.switch(name)
					this.Layout.format()
					this.Layout.refresh_Layout()
				}
				this.$EventBus.$emit('app_save_Layout')
			})

			this.$EventBus.$on('panel_set_Size', (name, id, width, height) => {
				// //console.log(name, id, width, height)
				if (id === 'ConsolePanel' && height >= 200) {
					window.localStorage.consoleSize = height
				}
				this.Layout.get_Panel_by_ID(id).set_Size(width, height)
				// this.Layout.format()
				this.Layout.refresh_Layout()
			})

			this.$EventBus.$on('console_show_hide', (show) => {
				if (show) {
					this.Layout.get_Panel_by_ID('ConsolePanel').set_Style(null, true, null, window.localStorage.consoleSize !== undefined ? parseFloat(window.localStorage.consoleSize) : 200)
				}
				else {
					this.Layout.get_Panel_by_ID('ConsolePanel').set_Style(null, false, null, 46)
				}
				this.Layout.refresh_Layout()
			})

			this.$EventBus.$on('load_Remote', () => {
				this.$EventBus.$emit('app_open_Popup', 'pw-remote', 'app', '远程加载', 300, 400, true, true, true, {})
			})

			this.$EventBus.$on('load_Remote50Poles', () => {
				let that = this
				let promise = [];
				let saveName = "杨000000"
				for (let i = 1001; i <= 1028; i++) {
					let param = {
						presetPoleCode: (i).toString(),
						sourceType: 1,
						regionId: 2,
						platFormId: 0
					}
					if (i > 10) {
						saveName = "杨00000"
					}
					promise.push(getPartsByPoleCode(param))
				}
				console.log(promise)

				let pro = Promise.all(promise)
				pro.then((res) => {
					res = res.map((r) => {
						return r.returns;
					})
					that.$EventBus.$emit('app_open_Popup', 'pw-file-system-dialogue', 'remote', '远程加载项目', 1000, 800, true, true, true, { path: FS.ROOT.name, action: 'filesystem_save_SnapShot', savetype: 'pole', data: res, savename: saveName })
				})
			})

			this.$EventBus.$on('app_add_Action', (ext, title, action, icon, key, doc) => {
				this.ExtensionAction.push({ ext: ext, action: action, text: action.description, title: title, doc: doc, icon: icon, key: key })
			})

			console.log("%cApp inited", "fontsize: 30px; background-color: rgb(10,10,10); border-radius: 8px; padding: 5px 10px; color: white;")

			this.change_Page('build')
			// window.addEventListener("", this.beforeunloadFn)
		},
		destroyed() {
			this.Layout.release_Event()
			this.Popup.release_Event()
			ShortCut.release_Event()
			window.removeEventListener("resize", this.resize_func)
			// window.removeEventListener('beforeunload', this.beforeunloadFn)
		}
	}
</script>

<style>
	#app {
		font-family: 'Avenir', Helvetica, Arial, sans-serif;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
		text-align: center;
		color: var(--FontColor);
		margin-top: 60px;
	}

	#MainLayout {
		/* background-color: red; */
		position: absolute;
		left: 2px;
		right: 2px;
		bottom: 2px;
		top: 37px;
	}

	#PopupPanel {
		width: 800px;
		height: 600px;
		/* background-color: red; */
		pointer-events: all;
		position: absolute;
	}

	#PopupResize {
		position: absolute;
		top: 0px;
		left: 0px;
		width: 18px;
		height: 18px;
		background-color: transparent;
		border-radius: 50%;
		cursor: nwse-resize;
	}

	.tool-button {
		color: var(--FontColor);
	}

	.tool-button:hover {
		color: var(--ThemeColor);
	}

	#terminal {
		position: absolute;
		top: 0px;
		left: 0px;
		right: 0px;
		height: 50%;
		z-index: 9999;
		display: flex;
		flex-direction: row;
		pointer-events: none;
		/* background-color: rebeccapurple; */
		align-self: flex-start;
	}
</style>