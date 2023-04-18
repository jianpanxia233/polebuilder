<template>
	<div class="container canvas-container" @dragover.prevent @drop="drop_File" @contextmenu="mouseRightClick($event)">
		<div id="Canvas-Show2"
			style="border-radius: var(--ContainerRadius); overflow: hidden; position: absolute; top: 0px; bottom: 0px; left: 0px; right: 0px;">
			<canvas v-show="scenes.length !== 0" id="Canvas-Show-Canvas2"></canvas>
		</div>
		<div class="v-box"
			style="position: absolute; left: 0px; right: 0px; top: 0px; bottom: 0px; pointer-events: none;">

			<div class="topbar" style="justify-content: center; pointer-events: all;" @click.stop @dblclick.stop
				@mousemove.stop @mousedown.stop @contextmenu.stop.prevent>

				<panel-switch-bar :Tabs="PanelTabs" :currentTab="'PoleViewer'" :Width="PanelWidth" :Height="PanelHeight"
					:Zindex="2" />

				<div class="bargroup" style="gap: 6px; flex-wrap: nowrap; overflow: auto;">
					<template v-for="item, idx in scenes">
						<div :class="{'tab': true, 'selected': idx === currentsceneidx}" style="padding: 0px 6px;"
							:style="{'background-color':item.color===''? '': ColorMap[item.color] }"
							@click="switch_Scene(idx)">
							<!-- <div style="display: flex; pointer-events: none;" v-html="iconMap[item.filetype]"></div> -->
							<a :style="{'color': item.color===2? 'var(--FontColorDark)': 'var(--FontColor)'}"
								class="tab-text">{{item.name}}</a>
							<svg v-show="idx === currentsceneidx" class="icon-button" viewBox="0 0 115 116"
								xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
								overflow="hidden" @click.stop="close_Scene(idx)" style="margin-right: 1px;">
								<g transform="translate(-561 -534)">
									<path d="M584 558 653.101 627.101" stroke-width="9" stroke-miterlimit="8"
										fill-rule="evenodd" />
									<path d="M653.101 557 584 626.101" stroke-width="9" stroke-miterlimit="8"
										fill-rule="evenodd" />
								</g>
							</svg>
						</div>
					</template>
					<!-- <div class="tab" style="margin: 0px 6px;" @click="new_Scene()">
							<svg class="tab-icon-svg" viewBox="0 0 118 118" xmlns="http://www.w3.org/2000/svg"
								xmlns:xlink="http://www.w3.org/1999/xlink" overflow="hidden">
								<g transform="translate(-561 -534)">
									<path d="M619.188 549.025 619.188 635.145" stroke-width="9" stroke-miterlimit="8"
										fill-rule="evenodd" />
									<path d="M662.423 591.911 576.303 591.91" stroke-width="9" stroke-miterlimit="8"
										fill-rule="evenodd" />
								</g>
							</svg>
						</div> -->
				</div>

				<div class="filler" style="min-width: 0px;"></div>

				<div class="title">sync</div>
				<input type="checkbox" class="checkbox" v-model="sync_view">

				<button-panel class="button" :TopAdditional="6" :Zindex="2" :Width="300">
					<template slot="button">
						<a class="button-text">版本对比</a>
					</template>
					<template slot="panel">
						<div class="form-vcontainer gap">
							<div class="title-dark left noleftmargin">STL 导出</div>
							<div class="listview-dark flex">
								<div class="form-container gap">
									<div class="form-container smallgap center">
										<div class="button-dark left" @click="emit('export_STL', [false])">ASCII
										</div>
										<div class="button-dark right" @click="emit('export_STL', [true])">BINARY
										</div>
									</div>
								</div>
							</div>
							<template v-if="reactive.selectedMode===1">
								<div class="title-dark left noleftmargin">爆炸图</div>
								<div class="listview-dark flex">
									<div class="form-container gap">
										<input type="range" min="0" max="30" step="0.01" class="slider-dark"
											style="flex: 1; margin: 8px 4px;"
											v-model.number="reactive.additionaldistance"
											@input="emit('update_Additional')">
									</div>
								</div>
							</template>
							<div class="title-dark left noleftmargin">async Popup Test</div>
							<div class="listview-dark flex">
								<div class="form-container gap">
									<div class="form-container smallgap center">
										<div class="button-dark" @click="emit('test')">open Popup
										</div>
									</div>
								</div>
							</div>
						</div>
					</template>
				</button-panel>

				<div class="button" @click="$EventBus.$emit('app_openhide_Canvas2', false)" title="关闭PoleViewer">
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
				<!-- put topbar custom items here -->
			</div>

			<div v-if="scenes.length === 0"
				style="overflow: auto; padding: 12px; background-color: transparent; display: flex; flex: 1; flex-direction: column; align-items: center; justify-content: center; pointer-events: all;">
				<div class="form-vcontainer center" style="margin: auto; flex: unset; gap: 40px;">
					<svg style="fill: var(--ObjectBGColor);" viewBox="-50 -50 1124 1124" version="1.1"
						xmlns="http://www.w3.org/2000/svg" p-id="2377" width="180" height="180">
						<path
							d="M136.63247 0h195.798637c18.470765 4.820315 34.126124 14.716891 47.904547 27.599503 8.787477 8.104954 17.489639 16.337882 26.02117 24.74144a43105.560617 43105.560617 0 0 1 140.343686 140.514316c5.289549 5.289549 10.536441 7.209144 17.830899 5.758784 12.072116-2.346171 24.314863-3.284639 36.685584-3.28464 43.553466 0.127973 87.192247 1.365045 130.703056-0.341261 35.619142-1.407703 64.029141 11.048333 88.557292 35.6618 56.308105 56.564051 112.957471 112.829498 169.222918 169.478864 15.612702 15.698017 28.665944 33.272971 34.083467 55.369637v431.52484c-0.511892 2.260856-1.109099 4.521711-1.535676 6.825225-15.271441 77.039725-78.788689 129.551299-157.36409 129.679272-91.884589 0.170631-183.769179 0.55455-275.653768-0.170631-56.905312-0.426577-100.757382-26.277116-132.025443-73.456482-21.115539-31.865268-25.978512-67.825672-25.168017-105.065805 0.426577-17.27635 0.042658-17.319008-16.807116-17.319008-84.888734 0-169.820125 0.341261-254.708859-0.127973-91.287382-0.469234-160.392784-70.04387-160.392784-161.203279-0.170631-169.777468-0.170631-339.554936 0-509.332404 0-48.075177 19.11063-87.746797 54.985718-119.441434 23.333737-20.646305 51.189186-31.822611 81.476121-37.410764zM81.348149 405.930247v129.807245c-0.085315 43.29752-0.511892 86.59504-0.341262 129.849903 0.170631 47.691259 32.505133 80.622968 80.23905 80.836256 89.581076 0.426577 179.162152 0.298604 268.743228 0a93.377607 93.377607 0 0 0 71.067653-31.054773 38.263917 38.263917 0 0 0 10.579099-27.130268c-0.127973-134.499587 0-268.999174-0.127973-403.498761-0.042658-36.685584-10.323153-46.710132-46.966078-47.136709-23.333737-0.298604-46.667475 0.426577-69.915897-0.938469-26.703692-1.578333-40.610088-17.574954-40.780719-44.449277-0.127973-21.627431 0.085315-43.29752-0.042657-64.924951-0.213288-31.140088-15.356756-46.411529-46.667475-47.179366a201.770709 201.770709 0 0 0-5.033604-0.042658c-46.283556 0-92.567112 0-138.850667 0.085315-7.976982 0-15.911305 0.213288-23.760314 2.132883-33.144998 7.976982-54.345853 34.254097-54.303195 67.996302 0 85.229995-3.071351 170.417333-3.839189 255.647328z m862.281842 272.795705v-114.834407c-0.042658-32.291845 0.085315-64.58369-0.426576-96.875535-0.255946-17.27635-8.787477-26.874323-25.423963-31.268062a69.531978 69.531978 0 0 0-17.830899-1.706306c-23.632341-0.042658-47.264682 0.213288-70.939681-0.127973-21.670089-0.341261-38.306574-13.863738-41.29261-33.400944a170.204044 170.204044 0 0 1-1.450361-22.907161c-0.341261-21.328828-0.255946-42.614998-0.72518-63.901167a34.765989 34.765989 0 0 0-13.949053-27.556846c-9.597972-7.507747-20.902251-9.811261-32.846395-9.81126h-131.89747c-14.077026 0-14.418287 0.298604-14.418287 14.674233l0.042658 327.610792c0 3.839189-1.876937 9.043423 1.834279 11.133648 4.095135 2.303513 6.953198-2.687432 9.896576-4.948288 43.980043-33.486259 87.832112-67.143149 131.726839-100.672066 2.559459-1.919594 5.033603-5.673468 8.531531-3.881847 3.412612 1.748964 2.00491 5.972072 2.00491 9.171396 0.085315 28.964548 0.383919 57.929096-0.085315 86.850986-0.170631 9.768603 3.369955 12.669324 12.797296 12.541351 30.969458-0.426577 61.938915 0.127973 92.908373-0.341261 9.725945-0.127973 12.797297 3.412612 12.541351 12.797296-0.511892 16.977747-0.127973 33.955494-0.127973 50.933241 0 17.319008-0.042658 17.319008-16.935089 17.361665h-85.86986c-15.058152 0-15.143468 0.085315-15.143468 15.015495-0.042658 28.282025 0 56.564051-0.085315 84.888734 0 2.815405 0.938468 6.526621-2.602117 7.849008-2.815405 1.023784-4.90563-1.578333-6.995855-3.114008-7.422432-5.588153-14.844864-11.261621-22.224639-16.93509L597.207173 707.434554c-4.137793-3.156666-8.232927-7.166486-10.664413 1.791622-10.451126 38.946439-32.974367 69.31869-66.204681 91.927247a12.37072 12.37072 0 0 0-6.057387 10.664414c-0.341261 16.636486-1.578333 33.315629-1.151757 49.909456 1.194414 47.947204 32.334503 80.537653 78.319455 80.793599 91.585986 0.511892 183.129314 0.127973 274.7153 0.170631 24.186891 0 44.534592-9.384684 62.365492-25.168017a42.231079 42.231079 0 0 0 15.314098-34.083466c-0.55455-68.252248-0.255946-136.504497-0.255946-204.714088zM226.213546 487.918261c-15.143468 0-30.329593-0.255946-45.515718 0.085315-7.379774 0.213288-10.109864-2.900721-10.024549-10.579099 0.298604-19.665179 0.426577-39.373016 0-59.038194-0.213288-8.958108 3.412612-11.602882 11.304278-11.560225 28.452656 0.213288 56.905312 0.085315 85.315311 0.042658 15.527387 0 15.527387 0 15.527386-16.849774 0-27.044953-0.042658-54.047249 0.085316-81.049545 0-3.45527-1.578333-8.104954 2.303513-9.981891 3.241982-1.578333 5.673468 2.132883 8.104954 4.052477 56.990627 45.984952 113.895939 92.097878 170.971883 137.997514 6.014729 4.862973 7.038513 7.976982 0.341261 13.351847-57.630492 46.240898-115.047696 92.7804-172.592873 139.149271-2.132883 1.706306-4.351081 4.948288-7.337117 3.114009-2.858063-1.706306-1.791622-5.417522-1.791621-8.275585-0.085315-29.348467-0.383919-58.739591 0.085315-88.088058 0.170631-9.768603-3.199324-12.882612-12.20009-12.498693-14.844864 0.597207-29.689728 0.170631-44.577249 0.17063v-0.042657z">
						</path>
					</svg>
					<!-- <div class="title1-dark" style="color: var(--ObjectBGColor); font-size: 30pxx;">
						比较器
					</div> -->
				</div>
			</div>

			<div v-show="scenes.length !== 0" class="filler"></div>

			<div v-show="scenes.length !== 0" class="bottombar" style="justify-content: flex-end; pointer-events: all;"
				@click.stop @dblclick.stop @mousemove.stop @mousedown.stop>

				<div class="filler"></div>
				<div class="bargroup smallgap">
					<div class="button left" @click="switch_View('Front')">
						<svg class="button-icon-svg" viewBox="0 0 222 222" xmlns="http://www.w3.org/2000/svg"
							xmlns:xlink="http://www.w3.org/1999/xlink" overflow="hidden">
							<g transform="translate(-935 -125)">
								<path
									d="M1106.01 206.25 1053.86 231.463 1053.86 300.727 1106.01 274.524ZM1046 152 1118 188.05 1118 283.95 1046 320 974 283.95 974 188.05Z"
									fill-rule="evenodd" />
							</g>
						</svg>
						<a class="button-text">前视图</a>
					</div>
					<div class="button center" @click="switch_View('Top')">
						<svg class="button-icon-svg" viewBox="0 0 222 222" xmlns="http://www.w3.org/2000/svg"
							xmlns:xlink="http://www.w3.org/1999/xlink" overflow="hidden">
							<g transform="translate(-684 -125)">
								<path
									d="M794.678 166.018 745.591 191.068 794.738 215.202 843.595 190.981ZM795 152 867 188.05 867 283.95 795 320 723 283.95 723 188.05Z"
									fill-rule="evenodd" />
							</g>
						</svg>
					</div>
					<div class="button right" @click="switch_View('Left')">
						<svg class="button-icon-svg" viewBox="0 0 222 222" xmlns="http://www.w3.org/2000/svg"
							xmlns:xlink="http://www.w3.org/1999/xlink" overflow="hidden">
							<g transform="translate(-271 -177)">
								<path
									d="M321.992 257.927 321.992 325.794 374.144 351.841 374.144 282.99ZM382 204 454 239.835 454 335.165 382 371 310 335.165 310 239.835Z"
									fill-rule="evenodd" />
							</g>
						</svg>
					</div>
				</div>
				<div class="button" @click="on_SwitchCamera()">
					<a class="button-text">{{currentCamera}}</a>
				</div>
				<div class="button" @click="center_View()">
					<a class="button-text">居中视图</a>
				</div>
			</div>
		</div>
	</div>
</template>
<script>
	import * as THREE from "three";
	import OrbitControls from 'three-orbitcontrols'
	import { Slot, Module, SlotModifier, SM_Free, create_Module_from_Json, create_Tree_from_PoleJson, Unit, get_UniqueID, ModulePlugin, MP_Model, disposeHierarchy/*, MP_Scale, MP_CustomScript, MP_MouseSensor*/ } from './Sun/ModuleSlot.js';
	// import * as TOOL from './Sun/ToolManager.js'
	// import { get_Tools, get_FlowGraph } from './Tools.js'
	import { customLog, set_Console, HTML, radius_to_degree, degree_to_radius, to_PoleAngle, get_NearPoleAngle, get_AngleBetween } from './Utils.js'
	import PanelSwitchBar from './Sun/PanelSwitchBar'
	import { getAesKey, encrypt, encryptedData } from '../assets/encryption/encryption.js'
	import ColorPicker from './Sun/ColorPicker'
	import ButtonPanel from './Sun/ButtonPanel'
	import CryptoJS from 'crypto-js'
	import staticData from './Sun/StaticData.js'
	import * as FileSystem from './Sun/FileSystem.js'
	import { createImg } from "@/components/Editor/Editor_Pole";
	import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js'
	export default {
		mixins: [staticData],
		name: "ModelDisplay2",
		components: {
			'panel-switch-bar': PanelSwitchBar,
			'color-picker': ColorPicker,
			'button-panel': ButtonPanel,
			// codemirror
		},
		props: {
			// Mode: {
			// 	type: String,
			// 	default: () => { }
			// },
			CanvasSize: {
				type: Object,
				default: () => { return { x: 0, y: 0, width: 0, height: 0 } }
			},
			PanelTabs: {
				type: Array,
				default: () => {
					return [{ name: '画布', panelid: 'CanvasPanel' }]
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
		static() {
			return {
				// ToolManager: ToolManager,
				MouseRawPosition: new THREE.Vector2(0, 0),
				Scenes: [],
				Scene: null,
				Raycaster: new THREE.Raycaster(),
				OrbitControl: null,
				Clock: new THREE.Clock(false),
				SelectedModule: null,
				Editor: 'none',
				ModuleList: [],
				CanvasSize: { width: 0, height: 0 },
				Renderere: null,
				Camera_Pos: new THREE.Vector3(),
				Camera_Rot: new THREE.Euler(),
			}
		},
		data() {
			return {
				reactive: {},
				sync_view: false,
				currentCamera: '透视',
				scenes: [],
				currentsceneidx: -1,
				ColorMap: ['rgb(230, 53, 53)', 'rgb(231, 102, 9)', 'rgb(255, 238, 0)', 'rgb(42, 190, 67)', 'rgb(0, 162, 255)', 'rgb(48, 28, 224)', 'rgb(219, 71, 212)']
			}
		},
		watch: {
			CanvasSize(newval, oldval) {
				let width = Math.round(this.CanvasSize.width - 4)
				let height = Math.round(this.CanvasSize.height - 4)
				if (this.$static.CanvasSize.width !== width || this.$static.CanvasSize.height !== height) {
					this.$static.CanvasSize.width = width
					this.$static.CanvasSize.height = height
					this.needResize = true
				}
			},
		},
		computed: {
		},
		methods: {
			init() {
				let container = document.getElementById('Canvas-Show2')
				// antialias:true增加抗锯齿效果
				this.$static.Renderer = new THREE.WebGLRenderer({
					canvas: document.getElementById('Canvas-Show-Canvas2'),
					antialias: true,
					alpha: false
					// logarithmicDepthBuffer: true
				})
				this.$static.Renderer.setClearColor(new THREE.Color('#424242')) // 设置窗口背景颜色
				this.$static.CanvasSize = { width: container.offsetWidth, height: container.offsetHeight }
				this.$static.Renderer.setSize(container.offsetWidth, container.offsetHeight) // 设置窗口尺寸
				this.$static.Renderer.setPixelRatio(1.25)
				// 阴影效果
				this.$static.Renderer.shadowMap.enabled = true
				this.$static.Renderer.shadowMap.type = THREE.PCFSoftShadowMap

				let OrbitControl = new OrbitControls(new THREE.Object3D(), document.getElementById('Canvas-Show-Canvas2'))
				OrbitControl.screenSpacePanning = true
				OrbitControl.mouseButtons = {
					LEFT: THREE.MOUSE.LEFT,
					MIDDLE: -1,
					RIGHT: -1,
				}
				this.$static.OrbitControl = OrbitControl
				this.$static.OrbitControl.target = new THREE.Vector3(0, 0, 0)
				this.$static.OrbitControl.update()
			},

			register_Scene(scene) {
				if (!this.$static.Scenes.includes(scene)) {
					this.$static.Scenes.push(scene)
					this.scenes = this.$static.Scenes.map((scene) => { return { name: scene.name, filetype: scene.filetype, color: scene.color } })
					this.switch_Scene(this.$static.Scenes.length - 1)
				}
			},

			switch_Scene(idx) {
				// 保存当前的摄像机位置
				if (this.$static.Scene !== null) {
					this.$static.Scene.cameratarget = (new THREE.Vector3(0, 0, 0)).copy(this.$static.OrbitControl.target)
				}
				// 切换
				if (this.$static.Scenes.length === 0) {
					this.$static.Scene = null
					this.currentsceneidx = -1
					return
				}
				this.currentsceneidx = idx
				let scene = this.$static.Scenes[idx]
				this.reactive = scene.reactive || {}
				this.$static.Scene = scene
				this.$static.OrbitControl.object = scene.currentcamera
				this.$static.OrbitControl.target.copy(scene.cameratarget)
				this.$static.OrbitControl.update()
				let width = this.CanvasSize.width - 4
				let height = this.CanvasSize.height - 4
				this.$static.Renderer.setSize(width, height)
				this.$static.Scene.camera.persp.aspect = (width / height)
				this.$static.Scene.camera.persp.updateProjectionMatrix()
				this.$static.Scene.camera.orth.left = width / -2
				this.$static.Scene.camera.orth.right = width / 2
				this.$static.Scene.camera.orth.top = height / 2
				this.$static.Scene.camera.orth.bottom = height / -2
				this.$static.Scene.camera.orth.updateProjectionMatrix()
				this.currentCamera = scene.currentcameraname
			},

			close_Scene(idx) {
				let scene = this.$static.Scenes[idx]
				scene.base.Traverse(Module.remove_from_Scene, Slot.remove_from_Scene)
				disposeHierarchy(scene.scene)
				this.release_Scene(idx)
			},

			release_Scene(idx) {
				let scene = this.$static.Scenes.splice(idx, 1)[0]
				this.scenes = this.$static.Scenes.map((scene) => { return { name: scene.name, filetype: scene.filetype, color: scene.color } })
				this.switch_Scene(Math.max(0, idx - 1))
			},

			new_Scene() {

			},

			create_SceneTemplate(name) {
				let scene = new THREE.Scene()
				// grid
				let grid = new THREE.GridHelper(100, 20, '#000000')
				grid.name = "GroundGrid"
				scene.add(grid)
				// camera
				let constainer = document.getElementById('Canvas-Show2')
				let width = constainer.offsetWidth
				let height = constainer.offsetHeight
				let PerspectiveCamera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000)
				let OrthographicCamera = new THREE.OrthographicCamera(width / -2, width / 2, height / 2, height / -2, 0.0001, 100000)
				let camera = PerspectiveCamera
				camera.position.set(30, 100, 30)
				scene.add(PerspectiveCamera)
				scene.add(OrthographicCamera)
				// light
				scene.add(new THREE.HemisphereLight(0xffffff, 0x000000, 1))

				let directLight = new THREE.DirectionalLight('#ffffff', 4)
				directLight.position.set(80, 200, 80)
				directLight.castShadow = true
				directLight.shadow.mapSize.width = 2048 // default
				directLight.shadow.mapSize.height = 2048 // default
				directLight.shadow.camera.near = 0.1 // default
				directLight.shadow.camera.far = 500 // default
				directLight.shadow.camera.top = 100 // defaultright
				directLight.shadow.camera.bottom = -100 // default
				directLight.shadow.camera.right = 100 // default
				directLight.shadow.camera.left = -100 // default
				// let directLightHelper = new THREE.DirectionalLightHelper(directLight, 5, '#fffbfd')
				// directLightHelper.visible = false
				// scene.add(directLightHelper)
				scene.add(directLight)

				// 反面光源
				let directLight2 = new THREE.DirectionalLight('#ffffff', 4)
				directLight2.position.set(-80, -200, -80)
				directLight2.castShadow = true
				directLight2.shadow.mapSize.width = 2048 // default
				directLight2.shadow.mapSize.height = 2048 // default
				directLight2.shadow.camera.near = 0.1 // default
				directLight2.shadow.camera.far = -500 // default
				directLight2.shadow.camera.top = -100 // defaultright
				directLight2.shadow.camera.bottom = 100 // default
				directLight2.shadow.camera.right = -100 // default
				directLight2.shadow.camera.left = 100 // default
				scene.add(directLight2)


				// module
				let base = new Module(-1, -1, "Base", new THREE.Vector3(0, -5, 0), new THREE.Euler(-Math.PI / 2, 0, 0, "XYZ"), scene, "", new SlotModifier(), false, '场景', {}, -1)
				base.model = new THREE.Mesh(new THREE.BoxGeometry(10, 10, 10), new THREE.MeshStandardMaterial({
					color: '#ffffff',
					metalness: 0.7,
					roughness: 0.2,
					transparent: true,
					opacity: 1
				}))
				base.model.receiveShadow = true
				base.allowadditionalposition = false
				Module.add_to_Scene(base)
				let baseslot = new Slot(-1, "BaseSlot", new THREE.Vector3(0, 0, 0), new THREE.Euler(0, 0, 0, "XYZ"), scene)
				base.add_Slot(baseslot)
				base.Update(new THREE.Vector3(0, 0, 0), new THREE.Euler(0, 0, 0, "XYZ"), new THREE.Vector3(0, 0, 0))

				return {
					name: name || '新建合杆(' + get_UniqueID() + ')',
					scene: scene,
					currentcamera: camera,
					currentcameraname: '透视',
					cameratarget: new THREE.Vector3(0, 0, 0),
					camera: {
						persp: PerspectiveCamera,
						orth: OrthographicCamera
					},
					reactive: {
					},
					base: base,
					color: '',
					baseslot: baseslot
				}
			},

			drop_File() {
				let data = event.dataTransfer.getData("FileDragData")
				if (data !== '') {
					let itemfrom = JSON.parse(data)
					if (itemfrom && itemfrom.type === 'file' && itemfrom.filetype === 'pole') {
						let file = FileSystem.ROOT.get(itemfrom.path)
						if (file !== null) {
							let scene = this.create_SceneTemplate(file.name);
							this.register_Scene(scene);
							let data = JSON.parse(file.data)
							let ans;
							try {
								ans = create_Tree_from_PoleJson(data.components, data.acrossMultiTransverseArm, scene.scene, this)
								scene.baseslot.connect(ans.tree)
								if (ans.warn.length > 0)
									this.$EventBus.$emit('console_add_Output', "info", '自动拼接 警告', "在 <自动拼接> 出现了如下警告:" + HTML.create_UList(ans.warn))
								if (ans.error.length > 0) {
									this.$EventBus.$emit('console_add_Output', "error", '自动拼接 错误', "在 <自动拼接> 出现了如下错误:" + HTML.create_UList(ans.error) + '可能的影响:<ul><li>自动拼接被中断</li></ul>')
								}
								// get_Module_by_UID(668)
							} catch (error) {
								console.error(error)
								this.$EventBus.$emit('console_add_Output', "error", '.pole文件 警告', "在 <打开.pole文件> 出现了如下警告:" + HTML.create_List([error.message]))
							}
							scene.base.Update()
							scene.baseslot.Traverse((module, layer) => {
								Module.set_Color(module)
								Module.highlight(module, false)
								Module.set_Visible(module, true)
							},
								(slot, layer) => {
									Slot.set_Visible(slot, false)
								})
							if (ans.equipWithSticker !== null && ans.equipWithSticker !== undefined) {
								for (let i = 0; i < ans.equipWithSticker.length; i++) {
									createImg.call(this, ans.equipWithSticker[i], ans.equipWithSticker[i].editorworkspace.sticker, scene.scene)
									// console.log("123", ans.equipWithSticker[i])
									if (ans.equipWithSticker[i].editorproperty.sticker.text != null && ans.equipWithSticker[i].editorproperty.sticker.text != -1) {
										// console.log("12345")
										ans.equipWithSticker[i].editorproperty.sticker.create_TextModel(ans.equipWithSticker[i].editorproperty.sticker.text.toString())
									}
								}
							}
						}
					}
				}
			},

			mouseRightClick(event) {
				if (this.$static.Scene === null) return;
				this.$EventBus.$emit('contextmenu_open', 'display', ['PoleViewer - 画布', '-', { text: '视图', list: [{ text: '居中视图', action: 'display2_switch_View', data: 'center', icon: 'blank' }, { text: '前视图', action: 'display2_switch_View', data: 'front', icon: 'blank' }, { text: '左视图', action: 'display2_switch_View', data: 'left', icon: 'blank' }, { text: '顶视图', action: 'display2_switch_View', data: 'top', icon: 'blank' }, { text: '正交/透视', action: 'display2_switch_View', data: 'mode', icon: this.currentCamera === '透视' ? 'selected' : 'select' }], first: 0 }, '-', { type: 'cmp-tags', data: { selected: this.scenes[this.currentsceneidx].color, oninput: true }, action: 'display2_switch_Label' }], null, event.clientX, event.clientY, 0)
			},

			switch_View(dir) {
				// alert("fin!!!")
				this.switch_Camera('正交')
				switch (dir) {
					case 'Front':
						this.$static.Scene.currentcamera.position.set(1000, this.$static.OrbitControl.target.y, this.$static.OrbitControl.target.z)
						this.$static.OrbitControl.update()
						break
					case 'Top':
						this.$static.Scene.currentcamera.position.set(this.$static.OrbitControl.target.x, 1000, this.$static.OrbitControl.target.z)
						this.$static.OrbitControl.update()
						break
					case 'Left':
						this.$static.Scene.currentcamera.position.set(this.$static.OrbitControl.target.x, this.$static.OrbitControl.target.y, 1000)
						this.$static.OrbitControl.update()
						break
				}
			},

			center_View() {
				let box = new THREE.Box3();
				box.setFromObject(this.$static.Scene.scene)
				box.getCenter(this.$static.OrbitControl.target)
				this.$static.OrbitControl.target.x = 0
				this.$static.OrbitControl.target.z = 0
				this.$static.OrbitControl.update()
			},

			on_SwitchCamera() {
				switch (this.$static.Scene.currentcameraname) {
					case '正交':
						this.switch_Camera('透视')
						break
					case '透视':
						this.switch_Camera('正交')
						break
				}
			},

			switch_Camera(val) {
				let width = this.CanvasSize.width - 4
				let height = this.CanvasSize.height - 4
				if (this.$static.Scene.currentcameraname !== val) {
					switch (val) {
						case '正交':
							this.$static.Scene.currentcamera = this.$static.Scene.camera.orth
							this.$static.Scene.currentcamera.position.copy(this.$static.Scene.camera.persp.position)
							this.$static.Scene.currentcamera.rotation.copy(this.$static.Scene.camera.persp.rotation)

							let vecP = new THREE.Vector3(0, 0, 0)
							let tarP = new THREE.Vector3(0, 0, 0)
							vecP.copy(this.$static.Scene.camera.persp.position)
							tarP.copy(this.$static.OrbitControl.target).negate()
							vecP.add(tarP)
							let dP0 = (height / 2) / (Math.tan(this.$static.Scene.camera.persp.fov / 2 / 180 * Math.PI))
							let dP = vecP.length()
							this.$static.Scene.camera.orth.zoom = (dP0 / dP)
							this.$static.OrbitControl.object = this.$static.Scene.currentcamera
							this.$static.Scene.camera.orth.updateProjectionMatrix()
							this.$static.OrbitControl.update()
							this.$static.Scene.currentcameraname = '正交'
							this.currentCamera = '正交'
							break
						case '透视':
							this.$static.Scene.currentcamera = this.$static.Scene.camera.persp
							this.$static.Scene.currentcamera.position.copy(this.$static.Scene.camera.orth.position)
							this.$static.Scene.currentcamera.rotation.copy(this.$static.Scene.camera.persp.rotation)
							// //console.log(this.OrthographicCamera.zoom)
							let vecO = new THREE.Vector3(0, 0, 0)
							let tarO = new THREE.Vector3(0, 0, 0)
							vecO.copy(this.$static.Scene.camera.persp.position)
							tarO.copy(this.$static.OrbitControl.target).negate()
							vecO.add(tarO).normalize()

							let dO = (height / 2) / (Math.tan(this.$static.Scene.camera.persp.fov / 2 / 180 * Math.PI))
							vecO.multiplyScalar(dO / this.$static.Scene.camera.orth.zoom)
							tarO.negate().add(vecO)

							this.$static.Scene.camera.persp.position.copy(tarO)
							this.$static.OrbitControl.object = this.$static.Scene.currentcamera
							this.$static.OrbitControl.update()
							this.$static.Scene.currentcameraname = '透视'
							this.currentCamera = '透视'
							break
					}
					if (this.$static.Scene.transformcontrol !== undefined) {
						//console.log(">>>>>>>>>>>>>>>>>>>")
						this.$static.Scene.transformcontrol.camera = this.$static.Scene.currentcamera
					}
				}
			},

			animate() {
				if (this.needResize) {
					let width = this.$static.CanvasSize.width
					let height = this.$static.CanvasSize.height
					this.$static.Renderer.setSize(width, height, true)
					if (this.$static.Scene !== null) {
						this.$static.Scene.camera.persp.aspect = (width / height)
						this.$static.Scene.camera.persp.updateProjectionMatrix()
						this.$static.Scene.camera.orth.left = width / -2
						this.$static.Scene.camera.orth.right = width / 2
						this.$static.Scene.camera.orth.top = height / 2
						this.$static.Scene.camera.orth.bottom = height / -2
						this.$static.Scene.camera.orth.updateProjectionMatrix()
					}
					this.needResize = false
				}
				if (this.$static.Scene !== null) {
					// console.log(this.$static.Scene.currentcamera)
					if (this.sync_view) {
						this.$static.Scene.currentcamera.position.copy(this.$static.Camera_Pos)
						this.$static.Scene.currentcamera.rotation.copy(this.$static.Camera_Rot)
					}
					this.$static.Renderer.render(this.$static.Scene.scene, this.$static.Scene.currentcamera)
				}
				// if (this.$static.Scene !== null && this.$static.Scene.render)
				requestAnimationFrame(this.animate);
			},

		},
		mounted() {
			this.$EventBus.$on('display2_switch_View', (data, args) => {
				switch (args) {
					case 'front':
						this.switch_View('Front')
						return
					case 'left':
						this.switch_View('Left')
						return
					case 'top':
						this.switch_View('Top')
						return
					case 'center':
						this.center_View()
						return
					case 'mode':
						this.on_SwitchCamera()
						return
				}
			})
			this.$EventBus.$on('display2_switch_Label', (data, args) => {
				if (this.$static.Scene.color === undefined) return
				if (this.scenes[this.currentsceneidx].color === args) {
					this.$static.Scene.color = ''
					this.scenes[this.currentsceneidx].color = ''
				}
				else {
					this.$static.Scene.color = args
					this.scenes[this.currentsceneidx].color = args
				}
			})
			this.$EventBus.$on("display_camera_PosRot", (pos, rot) => {
				// console.log(pos, rot)
				this.$static.Camera_Pos.copy(pos)
				this.$static.Camera_Rot.copy(rot)
			})
			this.init();
			this.animate();
		},
		beforeDestroy() {
			this.$EventBus.$off('display2_switch_View')
			this.$EventBus.$off('display2_switch_Label')
		}
	};
</script>
<style>
	#Canvas-Show-Canvas2 {
		position: absolute;
		top: 0px;
		left: 0px;
		right: 0px;
		bottom: 0px;
		border: none;
		outline: none;
		border-radius: var(--CanvasRadius);
	}

	#Stats-output-show>div {
		overflow: hidden;
		border-radius: var(--ObjectRadius);
	}

	.CodeMirror {
		height: 100%;
		font-family: consolas;
	}
</style>