<template>
	<div>
		<div class="container canvas-container" @contextmenu="mouseRightClick()" @click="mouseClick()"
			@dblclick="mouseDoubleClick()" @mousemove="mouseMove()" @mouseout="mouseOut()" @mouseout.stop>
			<div id="shade" v-show="loading" :style="{width:(CanvasSize.width-4)+'px'}">
				<canvas id="Shade-canvas" style="display:block"></canvas>
			</div>
			<div id="Canvas-Show-Box" style="border-radius: var(--ContainerRadius); overflow: hidden;">
				<canvas id="Canvas-Show-Box-Canvas"></canvas>
			</div>
			<div class="v-box"
				style="position: absolute; left: 0px; right: 0px; top: 0px; bottom: 0px; pointer-events: none;">
				<div class="topbar" style="justify-content: center; pointer-events: all;" @click.stop @dblclick.stop
					@mousemove.stop>
					<panel-switch-bar :Tabs="PanelTabs" :currentTab="'画布'" :Width="PanelWidth" :Height="PanelHeight" />

					<div class="filler"></div>

					<!-- <div class="title" style="margin-right: 6px;"> 前门 </div>
					<input class="checkbox" type="checkbox" v-model="openFront" />

					<div class="separater"></div>

					<div class="title" style="margin-right: 6px;"> 侧门 </div>
					<input class="checkbox" type="checkbox" v-model="openSide" />

					<div class="separater"></div>

					<div class="title" style="margin-right: 6px;"> 后门 </div>
					<input class="checkbox" type="checkbox" v-model="openBack" /> -->
					<div class="button" @click="roamingView()">
						<img class="button-icon" src="../assets/img/Ball.svg" draggable="false" />
						<a class="button-text">roamingView</a>
					</div>
					<div class="button" @click="test2()">
						<img class="button-icon" src="../assets/img/Ball.svg" draggable="false" />
						<a class="button-text">connect</a>
					</div>
					<!--<div class="button" @click="openDisplaytest()">
						<img class="button-icon" src="../assets/img/Ball.svg" draggable="false" />
						<a class="button-text">Box</a>
					</div>-->
					<div class="filler"></div>
					<div class="button" @click="drawLine()">
						<a class="button-text">Lines</a>
					</div>
					<div class="button" @click="showHouse()">
						<a class="button-text">Houses</a>
					</div>

				</div>

				<div style="flex: 1;">

				</div>
				<div class="bottombar" style="justify-content: flex-end; pointer-events: all;" @click.stop
					@dblclick.stop @mousemove.stop>
					<!-- <div class="button left" @click="switch_View('Front')">
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
					<div class="separater"></div>
					<div class="button" @click="button_SwitchCamera()">
						<a class="button-text">{{currentCamera}}</a>
					</div>
					<div class="separater"></div>
					<div class="button" @click="center_View()">
						<img class="button-icon" src="../assets/img/Pointer.svg" draggable="false" />
						<a class="button-text">居中视图</a>
					</div> -->
				</div>
			</div>
		</div>
	</div>
</template>
<script>
	import * as THREE from "three";
	import STLLoader from 'three-stl-net-loader';
	import OrbitControls from 'three-orbitcontrols'
	import { customLog, HTML, radius_to_degree, degree_to_radius, to_PoleAngle, get_NearPoleAngle } from './Utils.js'
	import TWEEN from "tween";
	import { saveAs } from 'file-saver';
	import PanelSwitchBar from './Sun/PanelSwitchBar'
	import { Slot, Module, SlotModifier, SM_Free, create_Module_from_Json, create_Tree_from_PoleJson, Unit, get_UniqueID } from './Sun/ModuleSlot.js';
	import staticData from './Sun/StaticData.js'
	// let STLLoader = require("three-stl-loader")(THREE);
	import CryptoJS from 'crypto-js'
	import { CircleGeometry } from 'three';
	import { MeshLine, MeshLineMaterial, MeshLineRaycast } from 'three.meshline';
	let box = new THREE.BoxGeometry(1, 1, 1)
	var id1001 = 0
	let uniqueID = 0

	let data = [{
		"moduleid": 0,
		"modulename": "主箱体",
		"classification": null,
		"url": "static/model/合箱/主箱体.stl",
		"moduleposition": [0, 5.8, 0],
		"modulerotation": [0, 0, 1.5707963267948966],
		"maxLoad": null,
		"propertyInfo": null,
		"interfaces": [
			{ "interfaceUID": 0, "interfacename": "箱顶盖插槽", "interfaceposition": ["0", "11.6", "0"], "interfacerotation": ["0", "0", "0"], "rules": ["All"] },
			{ "interfaceUID": 1, "interfacename": "前门插槽", "interfaceposition": ["-3.68", "1.58", "2.3"], "interfacerotation": ["0", "0", "0"], "rules": ["All"] },
			{ "interfaceUID": 2, "interfacename": "仓位分隔板插槽", "interfaceposition": ["-3.5", "12.5", "0"], "interfacerotation": ["0", "0", "0"], "rules": ["All"] },
			{ "interfaceUID": 3, "interfacename": "后门插槽", "interfaceposition": ["-3.68", "1.58", "-2.3"], "interfacerotation": ["0", "3.141592653589793", "0"], "rules": ["All"] },
			{ "interfaceUID": 4, "interfacename": "侧门插槽", "interfaceposition": ["3.68", "1.58", "-2.3"], "interfacerotation": ["0", "1.5707963267948966", "0"], "rules": ["All"] }]
	},
	{
		"moduleid": 1,
		"modulename": "箱顶盖",
		"classification": null,
		"url": "static/model/合箱/箱顶盖.stl",
		"moduleposition": [0, 0.6, 0],
		"modulerotation": [0, 0, 1.5707963267948966],
		"maxLoad": null,
		"propertyInfo": null,
		"interfaces": []
	},
	{
		"moduleid": 2,
		"modulename": "前门",
		"classification": null,
		"url": "static/model/合箱/前门.stl",
		"moduleposition": [2.86, 4.96, 0], "modulerotation": [0, 0, 1.5707963267948966],
		"maxLoad": null, "propertyInfo": null,
		"interfaces": []
	},
	{
		"moduleid": 3,
		"modulename": "仓位分隔板",
		"classification": null,
		"url": "static/model/合箱/仓位分隔板.STL",
		"moduleposition": [2.35, 0, 0],
		"modulerotation": [1.5707963267948966, 0, 0],
		"maxLoad": null,
		"propertyInfo": null,
		"interfaces": [{ "interfaceUID": 0, "interfacename": "设备插槽", "interfaceposition": ["0", "0.15", "0"], "interfacerotation": ["0", "0", "0"], "rules": ["All"] }]
	},
	{
		"moduleid": 4,
		"modulename": "后门",
		"classification": null,
		"url": "static/model/合箱/后门.stl",
		"moduleposition": [-2.86, 4.96, 0],
		"modulerotation": [0, 3.141592653589793, 1.5707963267948966],
		"maxLoad": null,
		"propertyInfo": null,
		"interfaces": []
	},
	{
		"moduleid": 5,
		"modulename": "侧门",
		"classification": null,
		"url": "static/model/合箱/侧门.stl",
		"moduleposition": [-2.32, 4.96, 0],
		"modulerotation": [0, 0, -1.5707963267948966],
		"maxLoad": null,
		"propertyInfo": null,
		"interfaces": []
	}
	]

	let FONT = null;
	(new THREE.FontLoader()).load('static/font/FZLanTingHeiS-R-GB_Regular.json', function (font) {
		FONT = font;
	})

	export default {
		mixins: [staticData],
		name: "BoxDisplay",
		components: {
			'panel-switch-bar': PanelSwitchBar
		},
		props: {
			dataManager: {
				type: Object,
				default: () => { }
			},
			Mode: {
				type: String,
				default: () => { }
			},
			builderTree: {
				type: Object,
				default: () => { return {} }
			},
			CanvasSize: {
				type: Object,
				default: () => { return { x: 0, y: 0, width: 0, height: 0 } }
			},
			shouldRender: {
				type: Boolean,
				default: () => { }
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
			}
		},
		static() {
			return {
				MouseRawPosition: new THREE.Vector2(0, 0),
				Scene: new THREE.Scene(),
				Lines: new THREE.Object3D(),
				Renderer: null,
				Camera: null,
				OrbitControl: null,
				baseslot: [],
				Raycaster: new THREE.Raycaster()
			}
		},
		data() {
			return {
				objects: [],
				intersects: [],
				lastSelectObj: null,
				groundLine: 0,
				buildings: 0,
				objectorigin: null,
				unit: 0.01,
				boxModule: null,
				baseslot: null,
				mouseRawPosition: new THREE.Vector2(0, 0),
				raycaster: new THREE.Raycaster(),
				loading: false,
			}
		},
		watch: {
			shouldRender(newval, oldval) {
				// console.log(">> Display " + newval)
				this.animate();
			},
			CanvasSize(newval, oldval) {
				let width = newval['width'] - 4
				let height = newval['height'] - 4
				this.$static.Renderer.setSize(width, height)
				this.$static.Camera.aspect = (width / height)
				this.$static.Camera.updateProjectionMatrix()
				// this.OrthographicCamera.left = width / -2
				// this.OrthographicCamera.right = width / 2
				// this.OrthographicCamera.top = height / 2
				// this.OrthographicCamera.bottom = height / -2
				// this.OrthographicCamera.updateProjectionMatrix()
			},

			Mode(newval, oldval) {
				if (newval === 'box') {
					this.$EventBus.$emit('inspectorInit', {
						uid: 'boxdisplay', iuid: 'boxdisplay_build_empty', list: [
							{ type: 'title', title: '模拟搭建生成' },
							// { type: 'textarea', title: 'JSON', action: 'getJson', value: this.createJson, placeholder: "build JSON" },
							// { type: 'button', title: '生成', action: 'buildFromJson', list: ["生成"] },
							{ type: 'lineedit', title: 'boxCode', action: 'getUrl', itemvalue: { value: this.createJson }, placeholder: '' },
							{ type: 'button', title: '测试样例', action: 'testBuild', itemvalue: { list: ["网络接口生成"] } }]
					})
				}
			},

			// 	openFront(newval, oldval) {
			// 		if (newval) {
			// 			if (this.frontDoorModule !== null) {
			// 				let that = this
			// 				let rotation = new THREE.Euler()
			// 				rotation.copy(this.frontDoorModule.slotmodifier.rotation)
			// 				let value = { x: rotation.x, y: rotation.y, z: rotation.z }
			// 				let tween = new TWEEN.Tween(value)
			// 					.to({ x: rotation.x, y: -Math.PI, z: rotation.z }, 500)
			// 					.easing(TWEEN.Easing.Quadratic.Out)
			// 					.onUpdate(function () {
			// 						that.frontDoorModule.slotmodifier.rotation.set(value.x, value.y, value.z)
			// 						that.refresh_Tree()
			// 					})
			// 					.start();
			// 			}
			// 		}
			// 		else {
			// 			if (this.frontDoorModule !== null) {
			// 				let that = this
			// 				let rotation = new THREE.Euler()
			// 				rotation.copy(this.frontDoorModule.slotmodifier.rotation)
			// 				let value = { x: rotation.x, y: rotation.y, z: rotation.z }
			// 				let tween = new TWEEN.Tween(value)
			// 					.to({ x: rotation.x, y: 0, z: rotation.z }, 500)
			// 					.easing(TWEEN.Easing.Quadratic.In)
			// 					.onUpdate(function () {
			// 						that.frontDoorModule.slotmodifier.rotation.set(value.x, value.y, value.z)
			// 						that.refresh_Tree()
			// 					})
			// 					.start();
			// 			}
			// 		}
			// 	},

			// 	openBack(newval, oldval) {
			// 		if (newval) {
			// 			if (this.backDoorModule !== null) {
			// 				let that = this
			// 				let rotation = new THREE.Euler()
			// 				rotation.copy(this.backDoorModule.slotmodifier.rotation)
			// 				let value = { x: rotation.x, y: rotation.y, z: rotation.z }
			// 				let tween = new TWEEN.Tween(value)
			// 					.to({ x: rotation.x, y: Math.PI, z: rotation.z }, 500)
			// 					.easing(TWEEN.Easing.Quadratic.Out)
			// 					.onUpdate(function () {
			// 						that.backDoorModule.slotmodifier.rotation.set(value.x, value.y, value.z)
			// 						that.refresh_Tree()
			// 					})
			// 					.start();
			// 			}
			// 		}
			// 		else {
			// 			if (this.backDoorModule !== null) {
			// 				let that = this
			// 				let rotation = new THREE.Euler()
			// 				rotation.copy(this.backDoorModule.slotmodifier.rotation)
			// 				let value = { x: rotation.x, y: rotation.y, z: rotation.z }
			// 				let tween = new TWEEN.Tween(value)
			// 					.to({ x: rotation.x, y: 0, z: rotation.z }, 500)
			// 					.easing(TWEEN.Easing.Quadratic.In)
			// 					.onUpdate(function () {
			// 						that.backDoorModule.slotmodifier.rotation.set(value.x, value.y, value.z)
			// 						that.refresh_Tree()
			// 					})
			// 					.start();
			// 			}
			// 		}
			// 	},

			// 	openSide(newval, oldval) {
			// 		if (newval) {
			// 			if (this.sideDoorModule !== null) {
			// 				let that = this
			// 				let rotation = new THREE.Euler()
			// 				rotation.copy(this.sideDoorModule.slotmodifier.rotation)
			// 				let value = { x: rotation.x, y: rotation.y, z: rotation.z }
			// 				let tween = new TWEEN.Tween(value)
			// 					.to({ x: rotation.x, y: Math.PI, z: rotation.z }, 500)
			// 					.easing(TWEEN.Easing.Quadratic.Out)
			// 					.onUpdate(function () {
			// 						that.sideDoorModule.slotmodifier.rotation.set(value.x, value.y, value.z)
			// 						that.refresh_Tree()
			// 					})
			// 					.start();
			// 			}
			// 		}
			// 		else {
			// 			if (this.sideDoorModule !== null) {
			// 				let that = this
			// 				let rotation = new THREE.Euler()
			// 				rotation.copy(this.sideDoorModule.slotmodifier.rotation)
			// 				let value = { x: rotation.x, y: rotation.y, z: rotation.z }
			// 				let tween = new TWEEN.Tween(value)
			// 					.to({ x: rotation.x, y: 0, z: rotation.z }, 500)
			// 					.easing(TWEEN.Easing.Quadratic.In)
			// 					.onUpdate(function () {
			// 						that.sideDoorModule.slotmodifier.rotation.set(value.x, value.y, value.z)
			// 						that.refresh_Tree()
			// 					})
			// 					.start();
			// 			}
			// 		}
			// 	}
		},
		computed: {
		},
		methods: {
			init: function () {
				var axes = new THREE.AxisHelper(500);
				this.$static.Scene.add(axes)
				let directLight = new THREE.DirectionalLight()
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

				this.$static.Scene.add(directLight)
				this.$static.Scene.background = new THREE.Color(0xcce0ff);
				// 添加地面贴图
				let loader = new THREE.TextureLoader();
				let groundTexture = loader.load( '../../static/road.jpg' );
				groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
				groundTexture.repeat.set( 100, 100);
				groundTexture.anisotropy = 16;

				let groundMaterial = new THREE.MeshLambertMaterial({ map: groundTexture });

				let groundmesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(20000, 20000), groundMaterial);
				groundmesh.position.y = 0;
				groundmesh.rotation.x = - Math.PI / 2;
				groundmesh.receiveShadow = true;
				this.$static.Scene.add( groundmesh );
				this.$static.Scene.add( new THREE.AmbientLight( 0x666666 ) );
				this.$static.Scene.fog = new THREE.Fog( 0xcce0ff, 500, 10000 );


				let constainer = document.getElementById('Canvas-Show-Box')
				let width = constainer.offsetWidth
				let height = constainer.offsetHeight
				this.$static.Renderer = new THREE.WebGLRenderer({
					canvas: document.getElementById('Canvas-Show-Box-Canvas'),
					antialias: true,
					alpha: true
				})
				this.$static.Renderer.setClearColor(new THREE.Color('#424242')) // 设置窗口背景颜色
				this.$static.Renderer.setSize(width, height) // 设置窗口尺寸
				this.$static.Renderer.setPixelRatio(devicePixelRatio)
				// 阴影效果
				this.$static.Renderer.shadowMap.enabled = true
				this.$static.Renderer.shadowMap.type = THREE.PCFSoftShadowMap

				let PerspectiveCamera = new THREE.PerspectiveCamera(60, width / height, 1, 10000)
				this.$static.Camera = PerspectiveCamera
				let OrbitControl = new OrbitControls(this.$static.Camera, document.getElementById('Canvas-Show-Box-Canvas'))
				OrbitControl.screenSpacePanning = true
				// OrbitControl.maxPolarAngle = Math.PI / 2;
				OrbitControl.mouseButtons = {
					LEFT: THREE.MOUSE.LEFT,
					MIDDLE: -1,
					RIGHT: -1,
				}
				OrbitControl.maxDistance = 3000;
				this.$static.OrbitControl = OrbitControl
				this.$static.OrbitControl.target = new THREE.Vector3(0, 40, 0)
				this.$static.OrbitControl.update()
				this.roamingView()
				this.addArrows()
			},
			creatStreetBuilding() {
				let points = [[0,0,0],[0,1,0],[0,2,0]];
				let height = 10;
				let topPoints = [];
				for(let i=0;i<points.length;i++){
					let vertice = points[i];
					topPoints.push([vertice[0],vertice[1]+height,vertice[2]])
				}
				let totalPoints = points.cancat(topPoints)
				let vertices = [];
				for(let i=0;i<totalPoints.length;i++){
					vertices.push(new THREE.Vector3(totalPoints[i][0],totalPoints[i][1],totalPoints[i][2]))

				}
			},
			requestPole() {
				let aeskey = 'fSQDFy2ca7MeWc6YBXPQse86FJHTYTPn'
					let PublicKey = 'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCmOPICLOzNSRMjcwWbtO+/a4hc2i87Iov3p5Sfky0u75Wt5Kycb4BOhurZWQnx453yN+u8ljBV4HfEResUcgDdPnNy281EIJbAOIz39pknTBuJzAmqM6atmZKrJVfOxZIMnNRDgWu4fsvpPqgsQWc5NaCdMreIE5Z5JyrbgA94ewIDAQAB'
					let word = 'pageNum=' + 1 + '&pageSize=200'
					const key = CryptoJS.enc.Utf8.parse(aeskey)
					const srcs = CryptoJS.enc.Utf8.parse(word)
					const encrypted = CryptoJS.AES.encrypt(srcs, key, {
						mode: CryptoJS.mode.ECB,
						padding: CryptoJS.pad.Pkcs7
					})

					let that = this

					fetch('http://180.167.245.227:65516/woody/visual/getBundlePole?param=' + encrypted.ciphertext.toString(), {
						method: 'GET',
						headers: {
							'access_key': 'ZN193CkJqwo7FJ0TnCyjVe/z0AYevc32oD8fONk1fH8XvTAs8uVtRWhcPK+uwDFSU/GVDc9ASuOlpfYoxj1AVutb393iLNKQJBrZ6car08QtNzISrMDvLr0SkXBfZBbMG0auPK1DFdcZVzjgGMrd4QUkHKSFLgbZL20pLQmKgpg=',
							'access_token': PublicKey,
							'Content-Type': 'application/json'
						}
					})
						.then(function (response) {
							return response.json()
						})
						.then(function (Json) {
							if (Json.respCode === 0) {
								that.objects = Json.returns.poleList
							} else {
								customLog(that, "error", "自动拼接", "网络接口生成 错误", "在 <请求数据> 出现了如下错误: <br>" + HTML.create_KeyPair('错误', Json.respMsg, "String"))
							}
						})
			},
			drawway() {
				var sidewalkPlane = new THREE.Geometry();
				var sidewalkPlaneForbbiden = new THREE.Geometry();
				var sidewalks = new THREE.Geometry();
				var curvesidewalks = new THREE.Geometry();
				var geometry = new THREE.Geometry();
				var geometryLine = new THREE.Geometry();
				var straightRoad =  new THREE.Geometry();
				var straightLine1 = new THREE.Geometry();
				var straightLine2 = new THREE.Geometry();
				var curveLine1 = new THREE.Geometry();
				var curveLine2 = new THREE.Geometry();
				var dottedLine = new THREE.Geometry();
 				let loader = new THREE.TextureLoader();
				let wellTexture = loader.load( '../../static/jinggai.png' );
				let wellMaterial = new THREE.MeshLambertMaterial( { map: wellTexture,side: THREE.DoubleSide } );
				//井盖
				var geometrywell =  new CircleGeometry(15);
				var mesh5 = new THREE.Mesh(geometrywell,wellMaterial);
				let p1 = [new THREE.Vector3(0, 0, 95),new THREE.Vector3(80, 0, 700),
				new THREE.Vector3(150, 0, 1000),new THREE.Vector3(20, 0, 2100)]
				let p1down = [new THREE.Vector3(-5, 0, 95),new THREE.Vector3(75, 0, 700),
				new THREE.Vector3(145, 0, 1000),new THREE.Vector3(15, 0, 2100)]
				let p2 = [new THREE.Vector3(-200, 0, 95),new THREE.Vector3(-120, 0, 700),
				new THREE.Vector3(-50, 0, 1000),new THREE.Vector3(-180, 0, 2100)]
				let p2up = [new THREE.Vector3(-195, 0, 95),new THREE.Vector3(-115, 0, 700),
				new THREE.Vector3(-45, 0, 1000),new THREE.Vector3(-175, 0, 2100)]
				// 曲线
				let p3 = [new THREE.Vector3(-100, 0, 100),new THREE.Vector3(-20, 0, 700),
				new THREE.Vector3(50, 0, 1000),new THREE.Vector3(-80, 0, 2100)]
				let p4 = [new THREE.Vector3(1000, 0, 100),new THREE.Vector3(1000, 0, -100),
				new THREE.Vector3(-1000, 0, -100),new THREE.Vector3(-1000, 0, 100)]
				// 马路实线坐标
				let p5 = [new THREE.Vector3(1000, 0, 95),new THREE.Vector3(1000, 0, 100),
				new THREE.Vector3(0, 0, 95),new THREE.Vector3(0, 0, 100),new THREE.Vector3(-200,0,95),
				new THREE.Vector3(-200,0,100),new THREE.Vector3(-1000,0,95),new THREE.Vector3(-1000,0,100)]
				let p6 = [new THREE.Vector3(1000, 0, -95),new THREE.Vector3(1000, 0, -100),
				new THREE.Vector3(-1000, 0, -95),new THREE.Vector3(-1000, 0, -100)]
				let p7 = [new THREE.Vector3(1000, 0, 58), new THREE.Vector3(1000, 0, 54),
				new THREE.Vector3(880, 0, 58),new THREE.Vector3(880, 0, 54)]
				let psidewalkplane = [new THREE.Vector3(80,0,-100),new THREE.Vector3(80,0,100),
				new THREE.Vector3(-280,0,-100),new THREE.Vector3(-280,0,100)]
				let sidewalksPoints = [new THREE.Vector3(70,0,90), new THREE.Vector3(70,0,80),
				new THREE.Vector3(0,0,80),new THREE.Vector3(0,0,90)]
				var curve1 = new THREE.CubicBezierCurve3(...p1);
				var curve1copy = new THREE.CubicBezierCurve3(...p1down);
				var curve2 = new THREE.CubicBezierCurve3(...p2);
				var curve2copy = new THREE.CubicBezierCurve3(...p2up);
				var curve3 =  new THREE.CubicBezierCurve3(...p3);
				var points = curve1.getPoints(20).concat(curve2.getPoints(20));
				var higherpoints = curve1.getPoints(20).concat(curve1copy.getPoints(20))
				var lowerpoints = curve2copy.getPoints(20).concat(curve2.getPoints(20))
				geometry.setFromPoints(points);
				geometry.faces.push(...this.getallFaces(points))
				const material = new THREE.MeshBasicMaterial({
					color: 0x696969,
					transparent: true,
					opacity: 1.0,
					side: THREE.DoubleSide
				});
				const testmaterial = new THREE.MeshBasicMaterial({
					color: 'yellow',
					transparent: true,
					opacity: 1.0,
					side: THREE.DoubleSide
				});
				const dottedmaterial = new THREE.MeshBasicMaterial({
					color: 'white',
					transparent: true,
					opacity: 1.0,
					side: THREE.DoubleSide
				});
				var mesh=new THREE.Mesh(geometry,material);//网格模型对象
				straightRoad.setFromPoints(p4);
				straightRoad.faces.push(new THREE.Face3(0,1,2),
				new THREE.Face3(0,2,3)
				)
				sidewalkPlane.setFromPoints(psidewalkplane);
				let allForbbidenpoints = []
				for(let i=0;i<=1;i++){
					let twoPoints = psidewalkplane.slice(i*2,(i+1)*2);
					let otherPoints = []
					twoPoints.forEach(item => {
						otherPoints.push(new THREE.Vector3(item.x-5,item.y,item.z))
					})
					allForbbidenpoints = allForbbidenpoints.concat(twoPoints.concat(otherPoints))
				}
				sidewalkPlaneForbbiden.setFromPoints(allForbbidenpoints);
				sidewalkPlaneForbbiden.faces.push(new THREE.Face3(0,1,2),
				new THREE.Face3(1,2,3),new THREE.Face3(4,5,6),new THREE.Face3(5,6,7))
				sidewalkPlane.faces.push(new THREE.Face3(0,1,2),
				new THREE.Face3(1,2,3)
				)
				sidewalks.setFromPoints(sidewalksPoints)
				sidewalks.faces.push(new THREE.Face3(0,1,2),new THREE.Face3(0,2,3))
				//人行横道
				var meshsidewalks = new THREE.Mesh(sidewalks,dottedmaterial)
				//复制人行横道
				for(let i=0;i<10;i++){
					let crossLine1 = meshsidewalks.clone()
					let crossLine2 = meshsidewalks.clone()
					crossLine1.translateZ(-20*i)
					crossLine2.translateX(-270)
					crossLine2.translateZ(-20*i)
					crossLine1.position.y+=6
					crossLine2.position.y+=6
					this.$static.Scene.add(crossLine1,crossLine2)
				}
				var meshsidewalkPlane = new THREE.Mesh(sidewalkPlane,material)
				var meshsidewalkPlaneForbbiden = new THREE.Mesh(sidewalkPlaneForbbiden,dottedmaterial)
				var mesh3 = new THREE.Mesh(straightRoad,material);
				//曲线道路人行横道
				var curvesidewalksPoints = curve1.getPoints(120).slice(0,10)
				var curvesidewalksdownPoints = []
				curvesidewalksPoints.forEach(item => {
					curvesidewalksdownPoints.push(new THREE.Vector3(item.x-10,item.y,item.z))
				})
				curvesidewalks.setFromPoints(curvesidewalksPoints.concat(curvesidewalksdownPoints))
				curvesidewalks.faces.push(...this.getallFaces(curvesidewalksPoints.concat(curvesidewalksdownPoints)))
				var meshcurvesidewalks = new THREE.Mesh(curvesidewalks,dottedmaterial)
				for(let i=0;i<10;i++){
					let curveCross = meshcurvesidewalks.clone();
					curveCross.translateX(-20*i)
					curveCross.position.y+=4
					this.$static.Scene.add(curveCross)
				}
				//曲线道路的线
				curveLine1.setFromPoints(higherpoints);
				curveLine1.faces.push(...this.getallFaces(higherpoints))
				var mesh3up = new THREE.Mesh(curveLine1,testmaterial)
				curveLine2.setFromPoints(lowerpoints);
				curveLine2.faces.push(...this.getallFaces(lowerpoints))
				var mesh3down = new THREE.Mesh(curveLine2,testmaterial)
				// 弯曲道路的线
				var mesh2 = new THREE.Mesh(curveLine1,dottedmaterial)
				//直线道路的线
				straightLine1.setFromPoints(p5);
				straightLine1.faces.push(new THREE.Face3(0,1,2),
				new THREE.Face3(1,2,3),
				new THREE.Face3(4,5,6),
				new THREE.Face3(5,6,7))
				straightLine2.setFromPoints(p6);
				straightLine2.faces.push(new THREE.Face3(0,1,2),
				new THREE.Face3(1,2,3))
				dottedLine.setFromPoints(p7);
				dottedLine.faces.push(new THREE.Face3(0,1,2),
				new THREE.Face3(1,2,3))
				let mesh4 = new THREE.Mesh(straightLine1,testmaterial);
				let mesh4left = new THREE.Mesh(straightLine2,testmaterial);
				let mesh4leftcopy1 = mesh4left.clone();
				let mesh4leftcopy2 = mesh4left.clone();
				let mesh4right = new THREE.Mesh(dottedLine,dottedmaterial)
				// 复制虚线
				for(let i=0;i<=12;i++){
					let dottedmesh1 = mesh4right.clone();
					let dottedmesh2 = mesh4right.clone();
					dottedmesh1.translateX(-154 * i);
					dottedmesh1.position.y += 3;
					dottedmesh2.translateZ(-112);
					dottedmesh2.translateX(-154 * i);
					dottedmesh2.position.y += 3;
					this.$static.Scene.add(dottedmesh1,dottedmesh2)
				}
				mesh.position.y += 2;
				mesh2.position.y +=3;
				mesh2.position.x -= 100;
				mesh3.position.y +=2;
				meshsidewalkPlane.position.y +=5
				meshsidewalkPlaneForbbiden.position.y +=5
				mesh3up.position.y +=3;
				mesh3down.position.y +=3;
				mesh4.position.y += 3;
				mesh4left.position.y +=3;
				mesh4right.position.y +=3;
				mesh4leftcopy1.position.z += 90;
				mesh4leftcopy1.position.y += 3;
				mesh4leftcopy2.position.z += 105;
				mesh4leftcopy2.position.y += 3;
				mesh5.position.y += 5;
				mesh5.position.x -= 80;
				mesh5.position.z += 288
				mesh5.rotation.x -= Math.PI * 0.5
				this.$static.Scene.add(mesh,mesh2,mesh3,meshsidewalkPlane,meshsidewalkPlaneForbbiden,mesh3up,mesh3down,mesh4,mesh4left,mesh4leftcopy1,mesh4leftcopy2,mesh4right,mesh5)

				const sidepoints = curve1.getPoints(10).concat(curve2.getPoints(10));
				for (let i = 0; i < 22; i++) {
					let point = sidepoints[i];
					let position = new SM_Free(point, new THREE.Euler(0,Math.floor(i/11) === 0 ? Math.PI/2 : -Math.PI/2, 0, 'XYZ'));
					let base = new Module(-1, -1, "Base", new THREE.Vector3(0, -5, 0), new THREE.Euler(-Math.PI / 2, 0, 0, "XYZ"), this.$static.Scene, "", position, false, '场景', {}, -1)
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
					let baseslot = new Slot(-1, "BaseSlot", new THREE.Vector3(0, 0, 0), new THREE.Euler(0, 0, 0, "XYZ"), this.$static.Scene)
					base.add_Slot(baseslot)
					this.$static.baseslot.push(base)
					base.Update()
					let meshjinggai = mesh5.clone()
					meshjinggai.position.set(point.x + (i > 10 ? -20:20),point.y+5,point.z+20)
					this.$static.Scene.add(meshjinggai)
				}
				let straightpoints = []
				let originStraightpoints = []
				let originSidepoints = [].concat(sidepoints)
				for (let i = 0; i < 22; i++) {
					if(i!=1&&i!=13)
					{
						let x;
						if(i <=11) x = Math.floor(i/2) * 180;
						else x = Math.floor((i-10)/2) * -180;
						let y = i % 2 == 0 ? -100 : 100;
						originStraightpoints.push(new THREE.Vector3( x, 0, y))
						if(i==0||i==10){
							let point = sidepoints.splice(i,1)
							console.log(point)
							straightpoints.push(...point)
						}
						straightpoints.push(new THREE.Vector3(x, 0, y))
						let position = new SM_Free(new THREE.Vector3( x, 0, y), new THREE.Euler(0, i % 2 === 0 ? Math.PI : 0, 0, 'XYZ'));
						let base = new Module(-1, -1, "Base", new THREE.Vector3(0, -5, 0), new THREE.Euler(-Math.PI / 2, 0, 0, "XYZ"), this.$static.Scene, "", position, false, '场景', {}, -1)
						base.model = new THREE.Mesh(new THREE.BoxGeometry(10, 10, 10), new THREE.MeshStandardMaterial({
							color: '#ffffff',
							metalness: 0.7,
							roughness: 0.2,
							transparent: true,
							opacity: 1
						}))
						let j;
						if(1<i<13) j = i-1;
						else if(i>13) j = i-2;
						base.model.receiveShadow = true
						base.allowadditionalposition = false
						Module.add_to_Scene(base)
						let baseslot = new Slot(-1, "BaseSlot", new THREE.Vector3(0, 0, 0), new THREE.Euler(0, 0, 0, "XYZ"), this.$static.Scene)
						base.add_Slot(baseslot)
						this.$static.baseslot.push(base)
						base.Update()
						let meshjinggai = mesh5.clone()
						meshjinggai.position.set(x ,5,y+(i%2==0 ? -20:20))
						this.$static.Scene.add(meshjinggai)
					}
				}
				sidepoints.unshift(mesh5.position)
				let mesh5straight = mesh5.clone()
				mesh5straight.position.set(-900,10,0)
				this.$static.Scene.add(mesh5straight)
				straightpoints.unshift(mesh5straight.position)
				sessionStorage.setItem('sidepoints',JSON.stringify(sidepoints))
				sessionStorage.setItem('straightpoints',JSON.stringify(straightpoints))
				// this.drawText(originSidepoints,originStraightpoints)
			},
			getallFaces(arr) {
				const result = []
				let len = arr.length/2
				for(let i=0;i<len-1;i++){
					let face1 = new THREE.Face3(i,i+1,i+len)
					let face2 = new THREE.Face3(i+1,i+len,i+len+1)
					result.push(face1,face2)
				}
				return result
			},
			showHouse() {
				this.buildings++;
				if(this.buildings==1){
					this.getHouse()
				} else {
					let allChildren = this.$static.Scene.children;
					try{
						allChildren.forEach(child => {
						if (child.name === '房屋') {
							child.material.visible = !child.material.visible
						}
					})
					} catch(err) {
						console.log(err)
					}

				}
			},
			getHouse() {
				const geometry = new THREE.BoxBufferGeometry( 1, 1, 1 );
				geometry.translate( 0, 0.5, 0 );
				const material = new THREE.MeshPhongMaterial( { color: 0xffffff, flatShading: true, transparent: true, opacity: 0.5 } );

				for ( let i = 0; i < 20; i ++ ) {

					const mesh = new THREE.Mesh( geometry, material );
					mesh.name = "房屋";
					mesh.position.x = Math.random() * 1600 - 800;
					mesh.position.y = 0;
					mesh.position.z = Math.random() * 1000 - 1300;
					mesh.scale.x = 150;
					mesh.scale.y = Math.random() * 280 + 100;
					mesh.scale.z = 150;
					mesh.updateMatrix();
					mesh.matrixAutoUpdate = false;
					this.$static.Scene.add( mesh );

				}
				for ( let i = 0; i < 20; i ++ ) {

					const mesh = new THREE.Mesh( geometry, material );
					mesh.name = "房屋";
					mesh.position.x = Math.random() * 800 + 200;
					mesh.position.y = 0;
					mesh.position.z = Math.random() * 1800 + 200;
					mesh.scale.x = 150;
					mesh.scale.y = Math.random() * 280 + 100;
					mesh.scale.z = 150;
					mesh.updateMatrix();
					mesh.matrixAutoUpdate = false;
					this.$static.Scene.add( mesh );

				}
				for ( let i = 0; i < 25; i ++ ) {

					const mesh = new THREE.Mesh( geometry, material );
					mesh.name = "房屋";
					mesh.position.x = Math.random() * 800 - 1200;
					mesh.position.y = 0;
					mesh.position.z = Math.random() * 1800 + 200;
					mesh.scale.x = 150;
					mesh.scale.y = Math.random() * 280 + 100;
					mesh.scale.z = 150;
					mesh.updateMatrix();
					mesh.matrixAutoUpdate = false;
					this.$static.Scene.add( mesh );

				}
			} ,
			roamingView(){
				this.$static.Camera.position.set(1100,40,0)
				this.$static.OrbitControl.target = new THREE.Vector3(0, 40, 0)
				this.$static.OrbitControl.update()
			},
			test2() {
				var deg1 = 0;
				var index = 1;
				var opa = 1;
				var flag = true;
				var canvas = document.getElementById('Shade-canvas');
				let container = document.getElementById('Canvas-Show-Box');
				var ctx = canvas.getContext('2d');
				canvas.height = this.CanvasSize.height - 4;
				canvas.width = this.CanvasSize.width - 4;
				container.style.display = 'none'
				var centerX = canvas.width / 2;
				var centerY = canvas.height / 2;
				var PI = Math.PI;
				ctx.fillRect(0, 0, canvas.width, canvas.height);
				// ctx.translate(centerX,centerY);
				this.loading = true;
				let wait = true;
				function arc() {
					ctx.fillStyle = '#D5D5D5';
					ctx.clearRect(0, 0, canvas.width, canvas.height);
					ctx.fillRect(0, 0, canvas.width, canvas.height);
					ctx.beginPath();
					ctx.strokeStyle = '#808080';
					ctx.lineWidth = 5;
					// 过渡
					ctx.arc(centerX, centerY, 100, PI * 3 / 2, deg1 * PI / 180 + PI * 3 / 2);
					if (deg1 < 360) {
						if (deg1 < 180) {
							index *= 1.08;
						} else {
							index /= 1.08;
						}
						deg1 += index;
					}
					if (deg1 >= 360) {
						deg1 = 0;
					}
					ctx.stroke();
					ctx.beginPath();
					if (flag) {
						opa -= 0.02;
						if (opa < 0.2) {
							flag = false;
						}
					} else {
						opa += 0.02;
						if (opa > 1) {
							flag = true;
						}
					}
					ctx.font = "Bold 20px Arial";
					ctx.textAlign = "center";
					ctx.fillStyle = "rgba(48,128,236," + opa + ")";
					ctx.fillText("loading...", centerX, centerY + 5);
					if(wait!=false){
						window.requestAnimationFrame(arc);
					}
				}
				window.requestAnimationFrame(arc);
				this.drawway();
				let promises = [this.testnew(0,null)]
				this.objects = this.objects.filter(el => el.visualPlanningCompositePoleId<1049)
				for(let idx in this.$static.baseslot){
					if(idx < this.objects.length)
						promises.push(this.testnew(idx,this.objects[idx]))
					else
						break
				}
				Promise.all(promises).then(() => {
					wait = false;
					this.loading = false;
					container.style.display = 'block'
				})
			},
			openDisplay(name,id) {
				this.$EventBus.$emit('app_open_Popup', 'pw-poleboxdisplay', 'box', '杆箱呈现:'+name, 1200, 800, true, true, true, { poleid: id })
			},
			openDisplaytest() {
				this.$EventBus.$emit('app_open_Popup', 'pw-poleboxdisplay', 'box', '杆箱呈现:'+"合箱", 1200, 800, true, true, true, { poleid: 100 })
			},
			async test(idx = 0) {
				if(idx == 3 || idx == 34) {
					this.boxModule = this.create_Tree_from_JSON({ ComponentID: 0, Sub: null })
					console.log(this.boxModule)
					this.$static.baseslot[idx].get_Slot_by_Name('BaseSlot').connect(this.boxModule)
					let top = this.create_Tree_from_JSON({ ComponentID: 1, Sub: null })
					this.boxModule.get_Slot_by_Name("箱顶盖插槽").connect(top)
					this.frontDoorModule = this.create_Tree_from_JSON({ ComponentID: 2, Sub: null })
					this.boxModule.get_Slot_by_Name("前门插槽").connect(this.frontDoorModule)
					this.backDoorModule = this.create_Tree_from_JSON({ ComponentID: 4, Sub: null })
					this.boxModule.get_Slot_by_Name("后门插槽").connect(this.backDoorModule)
					this.sideDoorModule = this.create_Tree_from_JSON({ ComponentID: 5, Sub: null })
					this.boxModule.get_Slot_by_Name("侧门插槽").connect(this.sideDoorModule)
					this.$static.baseslot[idx].get_Slot_by_Name('BaseSlot').Traverse((module) => {
						Module.set_Visible(module, true)
					}, () => { })
					this.$static.baseslot[idx].Update()
				}
				else {
					let aeskey = 'fSQDFy2ca7MeWc6YBXPQse86FJHTYTPn'
					let PublicKey = 'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCmOPICLOzNSRMjcwWbtO+/a4hc2i87Iov3p5Sfky0u75Wt5Kycb4BOhurZWQnx453yN+u8ljBV4HfEResUcgDdPnNy281EIJbAOIz39pknTBuJzAmqM6atmZKrJVfOxZIMnNRDgWu4fsvpPqgsQWc5NaCdMreIE5Z5JyrbgA94ewIDAQAB'
					//let word = 'presetPoleCode=' + (idx < 22 ? 66 : 11) + '&sourceType=1&regionId=2'
					let word = 'presetPoleCode=' + (66) + '&sourceType=1&regionId=2'
					const key = CryptoJS.enc.Utf8.parse(aeskey)
					const srcs = CryptoJS.enc.Utf8.parse(word)
					const encrypted = CryptoJS.AES.encrypt(srcs, key, {
						mode: CryptoJS.mode.ECB,
						padding: CryptoJS.pad.Pkcs7
					})

					let that = this

					await fetch('http://180.167.245.227:65516/woody/visual/getPartsByPoleCode?param=' + encrypted.ciphertext.toString(), {
						method: 'GET',
						headers: {
							'access_key': 'ZN193CkJqwo7FJ0TnCyjVe/z0AYevc32oD8fONk1fH8XvTAs8uVtRWhcPK+uwDFSU/GVDc9ASuOlpfYoxj1AVutb393iLNKQJBrZ6car08QtNzISrMDvLr0SkXBfZBbMG0auPK1DFdcZVzjgGMrd4QUkHKSFLgbZL20pLQmKgpg=',
							'access_token': PublicKey,
							'Content-Type': 'application/json'
						}
					})
						.then(function (response) {
							return response.json()
						})
						.then(function (Json) {
							if (Json.respCode === 0) {
								let baseslot = that.$static.baseslot[idx].get_Slot_by_Name('BaseSlot')
								while (baseslot.connectedmodule.length > 0) {
									let module = baseslot.connectedmodule[0]
									baseslot.disconnect(module)
									module.Traverse(Module.remove_from_Scene, Slot.remove_from_Scene)
								}
								that.$static.baseslot[idx].Traverse(Module.get_Summary, () => { })
								let ans = create_Tree_from_PoleJson(Json.returns.components, Json.returns.acrossMultiTransverseArm, that.$static.Scene, that)
								that.$static.baseslot[idx].get_Slot_by_Name('BaseSlot').connect(ans.tree)
								that.$static.baseslot[idx].Traverse(Module.set_Visible)
								that.$static.baseslot[idx].Update()
							}
							else {
								customLog(that, "error", "自动拼接", "网络接口生成 错误", "在 <请求数据> 出现了如下错误: <br>" + HTML.create_KeyPair('错误', Json.respMsg, "String"))
							}
						});
				}
			},



			async testnew(idx = 0,pole = null) {
				if(idx == 0 || idx == 13) {
					this.boxModule = this.create_Tree_from_JSON({ ComponentID: 0, Sub: null })
					this.$static.baseslot[idx].get_Slot_by_Name('BaseSlot').connect(this.boxModule)
					let top = this.create_Tree_from_JSON({ ComponentID: 1, Sub: null })
					console.log('///////////')
					console.log(this.boxModule)
					this.boxModule.get_Slot_by_Name("箱顶盖插槽").connect(top)
					this.frontDoorModule = this.create_Tree_from_JSON({ ComponentID: 2, Sub: null })
					this.boxModule.get_Slot_by_Name("前门插槽").connect(this.frontDoorModule)
					this.backDoorModule = this.create_Tree_from_JSON({ ComponentID: 4, Sub: null })
					this.boxModule.get_Slot_by_Name("后门插槽").connect(this.backDoorModule)
					this.sideDoorModule = this.create_Tree_from_JSON({ ComponentID: 5, Sub: null })
					this.boxModule.get_Slot_by_Name("侧门插槽").connect(this.sideDoorModule)
					this.$static.baseslot[idx].get_Slot_by_Name('BaseSlot').Traverse((module) => {
						Module.set_Visible(module, true)
					}, () => { })
					this.$static.baseslot[idx].Update()
				}
				else {
					//整体合杆
					// let baseslot = this.$static.baseslot[idx].get_Slot_by_Name('BaseSlot')
					
					// while (baseslot.connectedmodule.length > 0) {
					// 	let module = baseslot.connectedmodule[0]
					// 	baseslot.disconnect(module)
					// 	module.Traverse(Module.remove_from_Scene, Slot.remove_from_Scene)
					// }
					// this.$static.baseslot[idx].Traverse(Module.get_Summary, () => { })

					// // let ans = create_Tree_from_PoleJson(Json.returns.components, Json.returns.acrossMultiTransverseArm, that.$static.Scene, that)
					// let ans = new Module(0, pole.presetPoleCode, pole.engineeringCode||'undefined', new THREE.Vector3(10, 53, 20), new THREE.Euler(-Math.PI/2, 0, Math.PI/2, "XYZ"), this.$static.Scene, pole.threeDimensionalFileAddr)
					// let obj = this.$static.baseslot[idx]
					// obj.get_Slot_by_Name('BaseSlot').connect(ans)
					// this.drawText(obj,pole.presetPoleCode,pole.engineeringCode||'undefined')
					// this.$static.baseslot[idx].Traverse(Module.set_Visible)
					// this.$static.baseslot[idx].Update()

					//拼接合杆
					let aeskey = 'fSQDFy2ca7MeWc6YBXPQse86FJHTYTPn'
					let PublicKey = 'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCmOPICLOzNSRMjcwWbtO+/a4hc2i87Iov3p5Sfky0u75Wt5Kycb4BOhurZWQnx453yN+u8ljBV4HfEResUcgDdPnNy281EIJbAOIz39pknTBuJzAmqM6atmZKrJVfOxZIMnNRDgWu4fsvpPqgsQWc5NaCdMreIE5Z5JyrbgA94ewIDAQAB'

					let word = 'presetPoleCode=' + pole.visualPlanningCompositePoleId + '&sourceType=1&regionId=2&platFormId=0'
					const key = CryptoJS.enc.Utf8.parse(aeskey)
					const srcs = CryptoJS.enc.Utf8.parse(word)
					const encrypted = CryptoJS.AES.encrypt(srcs, key, {
						mode: CryptoJS.mode.ECB,
						padding: CryptoJS.pad.Pkcs7
					})

					let that = this
					try {
						await fetch('http://180.167.245.227:65516/woody/visual/getPartsByPoleCode?param=' + encrypted.ciphertext.toString(), {
						method: 'GET',
						headers: {
							'access_key': 'ZN193CkJqwo7FJ0TnCyjVe/z0AYevc32oD8fONk1fH8XvTAs8uVtRWhcPK+uwDFSU/GVDc9ASuOlpfYoxj1AVutb393iLNKQJBrZ6car08QtNzISrMDvLr0SkXBfZBbMG0auPK1DFdcZVzjgGMrd4QUkHKSFLgbZL20pLQmKgpg=',
							'access_token': PublicKey,
							'Content-Type': 'application/json'
						}
					})
					.then(function (response) {
						return response.json()
					})
					.then(function (Json) {
						console.log(Json)
						if (Json.respCode === 0) {
							let baseslot = that.$static.baseslot[idx].get_Slot_by_Name('BaseSlot')
							while (baseslot.connectedmodule.length > 0) {
								let module = baseslot.connectedmodule[0]
								baseslot.disconnect(module)
								module.Traverse(Module.remove_from_Scene, Slot.remove_from_Scene)
							}
							that.$static.baseslot[idx].Traverse(Module.get_Summary, () => { })
							let ans = create_Tree_from_PoleJson(Json.returns.components, Json.returns.acrossMultiTransverseArm, that.$static.Scene, that)
							that.$static.baseslot[idx].get_Slot_by_Name('BaseSlot').connect(ans.tree)
							that.drawText(that.$static.baseslot[idx],pole.presetPoleCode,pole.visualPlanningCompositePoleId||'undefined')
							that.$static.baseslot[idx].Traverse(Module.set_Visible)
							that.$static.baseslot[idx].Update()
						}
						else {
							customLog(that, "error", "自动拼接", "网络接口生成 错误", "在 <请求数据> 出现了如下错误: <br>" + HTML.create_KeyPair('错误', Json.respMsg, "String"))
						}
					});
					} catch(err) {
						Promise.resolve(err)
					}
				}
			},
			drawLine() {
				let sidepoints = JSON.parse(sessionStorage.getItem('sidepoints')).map(item => new THREE.Vector3(item.x,item.y,item.z))
				let straightpoints = JSON.parse(sessionStorage.getItem('straightpoints')).map(item => new THREE.Vector3(item.x,item.y,item.z))
				this.groundLine++;
				if(this.groundLine==1){
					//曲线道路走线
					let strleftp = straightpoints.filter(x => x.z<0)
					let strrightp = straightpoints.filter(x => x.z>0)
					let point1 = sidepoints.slice(1,2)[0]
					point1.x += 20
					let point2 = sidepoints.slice(11,12)[0]
					point2.x -= 20
					const material = new MeshLineMaterial({
						lineWidth: 10,
						transparent: true,
						depthTest: false,
						color:'black'
					});
					const line = new MeshLine();
					line.setPoints([point1,point2])
					let mesh = new THREE.Mesh(line,material)
					mesh.name = 'pipe'
					mesh.position.y += 10
					mesh.position.z += 20
					// mesh.visible = false
					point1.x -= 20;
					point2.x += 20;
					const lineup = new MeshLine();
					lineup.setPoints(sidepoints.slice(1,11));
					let meshup = new THREE.Mesh(lineup,material)
					meshup.name = 'pipe'
					meshup.position.y += 10
					meshup.position.x += 20
					meshup.position.z += 10
					const linedown = new MeshLine();
					linedown.setPoints(sidepoints.slice(11))
					let meshdown = new THREE.Mesh(linedown,material)
					meshdown.name = 'pipe'
					meshdown.position.y += 10
					meshdown.position.x -= 20
					meshdown.position.z += 10
					console.log(straightpoints)
					const straightLine = new MeshLine()
					straightLine.setPoints(straightpoints.slice(21))
					let meshstraight = new THREE.Mesh(straightLine,material)
					meshstraight.name = 'pipe'
					meshstraight.position.y += 10
					const straightleft = new MeshLine()
					straightleft.setPoints(strleftp)
					let meshstraightleft = new THREE.Mesh(straightleft,material)
					meshstraightleft.name = 'pipe'
					meshstraightleft.position.y += 10
					const straightright = new MeshLine()
					straightright.setPoints(strrightp)
					let meshstraightright = new THREE.Mesh(straightright,material)
					meshstraightright.name = 'pipe'
					meshstraightright.position.y += 10
					this.$static.Scene.add(mesh,meshup,meshdown,meshstraight,meshstraightleft,meshstraightright)
				} else {
					let allChildren = this.$static.Scene.children;
					allChildren.forEach(child => {
						if(child.name == 'pipe') child.visible = !child.visible
					})
				}

			},
			drawText(obj,id,name) {
				console.log('obj为',obj)
				let that = this;
				obj.name = id
				paintText(name, obj)
				function paintText(name,obj){
					let color = 0xffff00;
					const matLite = new THREE.MeshBasicMaterial( {
						color: color,
						transparent: true,
						opacity: 0.4,
						side: THREE.DoubleSide
					} );
					let message = name.toString();
					let shapes = FONT.generateShapes( message, 8 );
					let geometry = new THREE.ShapeBufferGeometry( shapes );
					geometry.computeBoundingBox();
					const xMid = - 0.5 * ( geometry.boundingBox.max.x - geometry.boundingBox.min.x );
					geometry.translate( xMid, 0, 0 );
					// make shape ( N.B. edge view not visible )
					const text = new THREE.Mesh( geometry, matLite );
					text.name = "text";
					// text.rotation.x += 	Math.PI / 2;
					text.rotation.y += 	Math.PI / 2;
					text.position.x = obj.world_position.x+10
					text.position.y = obj.world_position.y + 3
					text.position.z = obj.world_position.z
					console.log('字体',text)
					that.$static.Scene.add(text);
				}
			},
			create_Module: function (cid, poleid, origin = false, position = new THREE.Vector3(0, 0, 0), rotation = new THREE.Euler(0, 0, 0, "XYZ")) {
				let module
				// console.log(this.dataManager)
				try {
					let modulejson = this.dataManager.get(cid)
					if (modulejson === null) return null
					module = create_Module_from_Json(this.dataManager.get(cid), this.$static.Scene)
					module.id = poleid
					module.property.partsId = poleid
					if (origin) {
						module.relatetoorigin = true
						module.slotmodifier.position.copy(position)
						module.slotmodifier.rotation.copy(rotation)
					}
					if (module.classification === '灯臂') {
						module.property.elevationAngle = 0
					}
					if (module.componentid === 40) { //2F
						module.property.equipLength = 1800
						module.property.equipWidth = 1600
						Module.set_Scale(module, 900, 800, null)
					}
					return module
				} catch (error) {
					// console.log(error)
					module = null
					this.$EventBus.$emit('console_add_Output', "error", "create_Module 错误", error)
					return null
				}
			},

			build_Tree_from_JSON: function (json, cross, idx) {
				console.log(idx)
				let error = []
				let warn = []
				// type 0-main 1-vice 2-lamp 3-connector 4-equip 5-arm 6-armEquip
				let modules = []

				// 监测是否有主杆  >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
				let has_mainpole = false
				let mainpoleModule = null
				let mainpoleJson = null
				{
					mainpoleJson = json.mainPole
					// no MainPole
					if (mainpoleJson === undefined || mainpoleJson === null) {
						error.push(HTML.create_KeyPair('BuildPath', 'mainPole', 'String') + ' 不存在，无法生成主杆')
					}
					//Create MainPole
					else {
						mainpoleModule = this.create_Module(mainpoleJson.componentId, mainpoleJson.mainId)
						if (mainpoleModule === null) {
							error.push('在生成 ' + HTML.create_KeyPair('BuildPath', 'mainPole', 'String') + ' 时发现，对于 ' + HTML.create_KeyPair('mainId', mainpoleJson.mainId, 'Number') + ' ' + HTML.create_KeyPair('ComponentID', mainpoleJson.componentId, 'Number') + ' 不存在，无法生成主杆')
							// customLog(this, "error", "Build ERROR", "主杆组件不存在", "mainPole.componentId=" + mainpoleJson.componentId + " not exist")
						}
						else {
							has_mainpole = true
							modules.push({ id: mainpoleJson.mainId, module: mainpoleModule, type: 0 })
							console.log(this.$static.baseslot[idx].get_Slot_by_Name('BaseSlot'))
							this.$static.baseslot[idx].get_Slot_by_Name('BaseSlot').connect(mainpoleModule)
						}
					}
				}

				// 监测是否有副杆  >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
				let has_vicepole = false
				let vicepoleModule = null
				let vicepoleJson = null
				if (has_mainpole) {
					vicepoleJson = mainpoleJson.vicePole
					// no VicePole
					if (vicepoleJson === undefined || vicepoleJson === null) {
						warn.push(HTML.create_KeyPair('BuildPath', HTML.create_Or(['mainPole', 'vicePole']), 'String') + ' 不存在，无法生成副杆')
					}
					//Create VicePole
					else {
						vicepoleModule = this.create_Module(vicepoleJson.componentId, vicepoleJson.viceId)
						if (vicepoleModule === null) {
							error.push('在生成 ' + HTML.create_KeyPair('BuildPath', HTML.create_Or(['mainPole', 'vicePole']), 'String') + ' 时发现，对于 ' + HTML.create_KeyPair('viceId', vicepoleJson.viceId, 'Number') + ' ' + HTML.create_KeyPair('ComponentID', vicepoleJson.componentId, 'Number') + ' 不存在，无法生成副杆')
						}
						else {
							let vicepoleSlot = mainpoleModule.get_Slot_by_Name("副杆插槽")

							if (vicepoleSlot === null) {
								error.push('在连接 ' + HTML.create_KeyPair('BuildPath', HTML.create_Or(['mainPole', 'vicePole']), 'String') + ' 时发现，对于其父级不存在 ' + HTML.create_KeyPair('SlotName', '副杆插槽', 'String') + ' 的插槽，无法连接副杆')
							}
							else {
								has_vicepole = true
								modules.push({ id: vicepoleJson.viceId, module: vicepoleModule, type: 1 })
								vicepoleSlot.connect(vicepoleModule)
							}
						}
					}
				}

				// 监测是否有灯臂  >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
				if (has_vicepole) {
					let lampsJson = vicepoleJson.lampArms
					if (lampsJson === undefined || lampsJson === null) {
						warn.push(HTML.create_KeyPair('BuildPath', HTML.create_Or(['mainPole', 'vicePole', 'lampArms']), 'String') + ' 不存在，无法生成灯臂')
					}
					else {
						for (let i = 0; i < lampsJson.length; i++) {
							let lampJson = lampsJson[i]
							let positionangle = (parseFloat(lampJson.angle)) / 180 * Math.PI
							let angle = (360.0 - parseFloat(lampJson.angle)) / 180 * Math.PI
							let y = parseFloat(lampJson.yaxis) * Unit
							let x = parseFloat(lampJson.xaxis) * Unit * Math.cos(positionangle)
							let z = parseFloat(lampJson.xaxis) * Unit * Math.sin(positionangle)
							let position = new THREE.Vector3(x, y, z)
							let lampModule = this.create_Module(lampJson.componentId, lampJson.lampId, true, position, new THREE.Euler(0, angle, 0, "XYZ"))
							if (lampModule === null) {
								error.push('在生成 ' + HTML.create_KeyPair('BuildPath', HTML.create_Or(['mainPole', 'vicePole', 'lampArms[' + i + ']']), 'String') + ' 时发现，对于 ' + HTML.create_KeyPair('lampId', lampJson.lampId, 'Number') + ' ' + HTML.create_KeyPair('ComponentID', lampJson.componentId, 'Number') + ' 不存在，无法生成灯臂')
							}
							else {
								if (lampJson.elevationAngle !== undefined) {
									lampModule.property.elevationAngle = lampJson.elevationAngle
								}
								let lampSlot = vicepoleModule.get_Slot_by_Name("灯臂插槽")
								if (lampSlot === null) {
									error.push('在连接 ' + HTML.create_KeyPair('BuildPath', HTML.create_Or(['mainPole', 'vicePole', 'lampArms[' + i + ']']), 'String') + ' 时发现，对于其父级不存在 ' + HTML.create_KeyPair('SlotName', '灯臂插槽', 'String') + ' 的插槽，无法连接灯臂')
								}
								else {
									modules.push({ id: lampJson.lampId, module: lampModule, type: 2 })
									lampSlot.connect(lampModule)
								}
							}
						}
					}
				}

				// 监测是否有副杆连接件  >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
				if (has_vicepole) {
					let connectorsJson = vicepoleJson.connectors
					if (connectorsJson === undefined || connectorsJson === null) {
						warn.push(HTML.create_KeyPair('BuildPath', HTML.create_Or(['mainPole', 'vicePole', 'connectors']), 'String') + ' 不存在，无法生成连接件')
					}
					else {
						for (let i = 0; i < connectorsJson.length; i++) {
							let connectorJson = connectorsJson[i]
							let positionangle = (parseFloat(connectorJson.angle)) / 180 * Math.PI
							let angle = (360.0 - parseFloat(connectorJson.angle)) / 180 * Math.PI
							let y = parseFloat(connectorJson.yaxis) * Unit
							let x = parseFloat(connectorJson.xaxis) * Unit * Math.cos(positionangle)
							let z = parseFloat(connectorJson.xaxis) * Unit * Math.sin(positionangle)
							let position = new THREE.Vector3(x, y, z)
							// zaxis
							if (connectorJson.lookingDirectionAngle === null || connectorJson.zaxis === null) {
								warn.push('在生成 ' + HTML.create_KeyPair('BuildPath', HTML.create_Or(['mainPole', 'vicePole', 'connectors[' + i + ']']), 'String') + ' 时发现，' + HTML.create_Or([HTML.create_KeyPair('Property', 'zaixs', 'String'), HTML.create_KeyPair('Property', 'lookingDirectionAngle', 'String')]) + ' 为null，将不考虑z轴偏移')
							}
							else {
								let lookingatangle = parseFloat(connectorJson.lookingDirectionAngle) / 180 * Math.PI
								angle = parseFloat(360.0 - connectorJson.lookingDirectionAngle) / 180 * Math.PI
								let lookatvector = new THREE.Vector3(Math.cos(lookingatangle), 0, Math.sin(lookingatangle))
								let zvector = lookatvector.cross(new THREE.Vector3(0, 1, 0)).normalize()
								position.add(zvector.multiplyScalar(connectorJson.zaxis * Unit))
							}
							let connectorModule = this.create_Module(connectorJson.componentId, connectorJson.connectorId, true, position, new THREE.Euler(0, angle, 0, "XYZ"))
							if (connectorModule === null) {
								error.push('在生成 ' + HTML.create_KeyPair('BuildPath', HTML.create_Or(['mainPole', 'vicePole', 'connectors[' + i + ']']), 'String') + ' 时发现，对于 ' + HTML.create_KeyPair('connectorId', connectorJson.connectorId, 'Number') + ' ' + HTML.create_KeyPair('ComponentID', connectorJson.componentId, 'Number') + ' 不存在，无法生成连接件')
							}
							else {
								let connectorSlot = vicepoleModule.get_Slot_by_Name("灯臂插槽")
								if (connectorSlot === null) {
									error.push('在连接 ' + HTML.create_KeyPair('BuildPath', HTML.create_Or(['mainPole', 'vicePole', 'connectors[' + i + ']']), 'String') + ' 时发现，对于其父级不存在 ' + HTML.create_KeyPair('SlotName', '灯臂插槽', 'String') + ' 的插槽，无法连接连接件')
								}
								else {
									modules.push({ id: connectorJson.connectorId, module: connectorModule, type: 3 })
									connectorSlot.connect(connectorModule)
								}

								// 监测是否有副杆连接件搭载设施  >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
								let equipsJson = connectorJson.carryEquips
								if (equipsJson === undefined || equipsJson === null) {
									warn.push(HTML.create_KeyPair('BuildPath', HTML.create_Or(['mainPole', 'vicePole', 'connectors[' + i + ']', 'carryEquips']), 'String') + ' 不存在，无法生成搭载设施')
								}
								else {
									for (let j = 0; j < equipsJson.length; j++) {
										let equipJson = equipsJson[j]
										// console.log(equipJson.angle)
										let polearmangle = parseFloat(equipJson.angle) / 180 * Math.PI
										let equipangle = parseFloat(360 - equipJson.angle) / 180 * Math.PI
										let ye = parseFloat(equipJson.yaxis) * Unit
										let xe = parseFloat(equipJson.xaxis) * Unit * Math.cos(polearmangle)
										let ze = parseFloat(equipJson.xaxis) * Unit * Math.sin(polearmangle)
										let positione = new THREE.Vector3(xe, ye, ze)
										// zaxis
										if (equipJson.lookingDirectionAngle === null || equipJson.zaxis === null) {
											warn.push('在生成 ' + HTML.create_KeyPair('BuildPath', HTML.create_Or(['mainPole', 'vicePole', 'connectors[' + i + ']', 'carryEquips[' + j + ']']), 'String') + ' 时发现，' + HTML.create_Or([HTML.create_KeyPair('Property', 'zaixs', 'String'), HTML.create_KeyPair('Property', 'lookingDirectionAngle', 'String')]) + ' 为null，将不考虑z轴偏移')
										}
										else {
											let lookingatangle = parseFloat(equipJson.lookingDirectionAngle) / 180 * Math.PI
											equipangle = parseFloat(360.0 - equipJson.lookingDirectionAngle) / 180 * Math.PI
											let lookatvector = new THREE.Vector3(Math.cos(lookingatangle), 0, Math.sin(lookingatangle))
											let zvector = lookatvector.cross(new THREE.Vector3(0, 1, 0)).normalize()
											positione.add(zvector.multiplyScalar(equipJson.zaxis * Unit))
										}
										let equipModule = this.create_Module(equipJson.componentId, equipJson.equipId, true, positione, new THREE.Euler(0, equipangle, 0, "XYZ"))
										// console.log(position)
										if (equipModule === null) {
											error.push('在生成 ' + HTML.create_KeyPair('BuildPath', HTML.create_Or(['mainPole', 'vicePole', 'connectors[' + i + ']', 'carryEquips[' + j + ']']), 'String') + ' 时发现，对于 ' + HTML.create_KeyPair('equipId', equipJson.equipId, 'Number') + ' ' + HTML.create_KeyPair('ComponentID', equipJson.componentId, 'Number') + ' 不存在，无法生成搭载设施')
										}
										else {
											let equipSlot = connectorModule.get_Slot_by_Name("搭载设备插槽")
											if (equipSlot === null) {
												error.push('在连接 ' + HTML.create_KeyPair('BuildPath', HTML.create_Or(['mainPole', 'vicePole', 'connectors[' + i + ']', 'carryEquips[' + j + ']']), 'String') + ' 时发现，对于其父级不存在 ' + HTML.create_KeyPair('SlotName', '搭载设备插槽', 'String') + ' 的插槽，无法连接搭载设施')
											}
											else {
												modules.push({ id: equipJson.equipId, module: equipModule, type: 4 })
												equipSlot.connect(equipModule)
											}
										}
									}
								}
							}
						}
					}
				}

				// 监测是否有横臂  >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
				if (has_mainpole) {
					let armsJson = mainpoleJson.poleArms
					// no Arm
					if (armsJson === undefined || armsJson === null) {
						warn.push(HTML.create_KeyPair('BuildPath', HTML.create_Or(['mainPole', 'poleArms']), 'String') + ' 不存在，无法生成横臂')
					}
					//Create Arms
					else {
						for (let i = 0; i < armsJson.length; i++) {
							let armJson = armsJson[i]

							let armModule = this.create_Module(armJson.componentId, armJson.poleArmId)
							if (armModule === null) {
								error.push('在生成 ' + HTML.create_KeyPair('BuildPath', HTML.create_Or(['mainPole', 'poleArms[' + i + ']']), 'String') + ' 时发现，对于 ' + HTML.create_KeyPair('poleArmId', armJson.poleArmId, 'Number') + ' ' + HTML.create_KeyPair('ComponentID', armJson.componentId, 'Number') + ' 不存在，无法生成横臂')
							}
							else {
								let armSlotlist = mainpoleModule.slotlist.filter((slot) => { return slot.match("横臂插槽", armJson.angle, armJson.yaxis) })
								if (armSlotlist.length === 0) {
									let slotarray = mainpoleModule.slotlist.filter((slot) => { return slot.match("横臂插槽") }).map((slot) => {
										return Slot.get_StyledHTML(slot) + ' ' + HTML.create_KeyPair('Angle', slot.property.angleMin + ' ~ ' + slot.property.angleMax, 'Float') + ' ' + HTML.create_KeyPair('Y', slot.property.yMin + ' ~ ' + slot.property.yMax, 'Float')
									})
									error.push('在连接 ' + HTML.create_KeyPair('BuildPath', HTML.create_Or(['mainPole', 'poleArms[' + i + ']']), 'String') + ' 时发现，对于其父级不存在可以匹配的的插槽，无法连接副杆。匹配条件是: ' + HTML.create_UList([HTML.create_KeyPair('SlotName', '横臂插槽', 'String') + ' ' + HTML.create_KeyPair('Angle', armJson.angle, 'Float') + ' ' + HTML.create_KeyPair('Y', armJson.yaxis, 'Float')]) + '而其父组件上所有的横臂插槽为: ' + HTML.create_List(slotarray))
								}
								else {
									if (armSlotlist.length > 1) {
										let slotarray = armSlotlist.map((slot) => {
											return Slot.get_StyledHTML(slot) + ' ' + HTML.create_KeyPair('Angle', slot.property.angleMin + ' ~ ' + slot.property.angleMax, 'Float') + ' ' + HTML.create_KeyPair('Y', slot.property.yMin + ' ~ ' + slot.property.yMax, 'Float')
										})
										warn.push('在连接 ' + HTML.create_KeyPair('BuildPath', HTML.create_Or(['mainPole', 'poleArms[' + i + ']']), 'String') + ' 时发现，其父级存在多个匹配的的插槽，它们是: ' + HTML.create_List(slotarray) + ' 将使用第一个插槽进行连接')
									}
									modules.push({ id: armJson.poleArmId, module: armModule, type: 5 })
									armSlotlist[0].connect(armModule)


									// ///////////////////////////
									//       搭载设备
									// ///////////////////////////
									let equipsJson = armJson.carryEquips
									if (equipsJson === undefined || equipsJson === null) {
										warn.push(HTML.create_KeyPair('BuildPath', HTML.create_Or(['mainPole', 'poleArms[' + i + ']', 'carryEquips']), 'String') + ' 不存在，无法生成搭载设施')
									}
									for (let j = 0; j < equipsJson.length; j++) {
										let equipJson = equipsJson[j]
										let polearmangle = parseFloat(equipJson.angle) / 180 * Math.PI
										let equipangle = parseFloat(360 - (equipJson.lookingDirectionAngle === null ? equipJson.angle + 90 : equipJson.lookingDirectionAngle)) / 180 * Math.PI
										let y = parseFloat(equipJson.yaxis) * Unit
										let x = parseFloat(equipJson.xaxis) * Unit * Math.cos(polearmangle)
										let z = parseFloat(equipJson.xaxis) * Unit * Math.sin(polearmangle)
										let position = new THREE.Vector3(x, y, z)
										if (equipJson.lookingDirectionAngle === null || equipJson.zaxis === null) {
											warn.push('在生成 ' + HTML.create_KeyPair('BuildPath', HTML.create_Or(['mainPole', 'poleArms[' + i + ']', 'carryEquips[' + j + ']']), 'String') + ' 时发现，' + HTML.create_Or([HTML.create_KeyPair('Property', 'zaixs', 'String'), HTML.create_KeyPair('Property', 'lookingDirectionAngle', 'String')]) + ' 为null，将不考虑z轴偏移')
										}
										else {
											let lookingatangle = parseFloat(equipJson.lookingDirectionAngle) / 180 * Math.PI
											let lookatvector = new THREE.Vector3(Math.cos(lookingatangle), 0, Math.sin(lookingatangle))
											let zvector = lookatvector.normalize()
											position.add(zvector.multiplyScalar(equipJson.zaxis * Unit))
										}
										let equipModule = this.create_Module(equipJson.componentId, equipJson.equipId, true, position, new THREE.Euler(0, equipangle, 0, "XYZ"))
										if (equipModule === null) {
											warn.push('在生成 ' + HTML.create_KeyPair('BuildPath', HTML.create_Or(['mainPole', 'poleArms[' + i + ']', 'carryEquips[' + j + ']']), 'String') + ' 时发现，对于 ' + HTML.create_KeyPair('equipId', equipJson.equipId, 'Number') + ' ' + HTML.create_KeyPair('ComponentID', equipJson.componentId, 'Number') + ' 不存在，无法生成搭载设施')
										}
										else {
											if (equipJson.componentId === 40 && equipJson.equipWidth !== undefined && equipJson.equipLength !== undefined) {
												equipModule.property.equipWidth = equipJson.equipWidth
												equipModule.property.equipLength = equipJson.equipLength
												Module.set_Scale(equipModule, equipModule.property.equipLength / 2, equipModule.property.equipWidth / 2, null)
											}
											let equipSlot = armModule.get_Slot_by_Name("搭载设备插槽")
											if (equipSlot === null) {
												error.push('在连接 ' + HTML.create_KeyPair('BuildPath', HTML.create_Or(['mainPole', 'poleArms[' + i + ']', 'carryEquips[' + j + ']']), 'String') + ' 时发现，对于其父级不存在 ' + HTML.create_KeyPair('SlotName', '搭载设备插槽', 'String') + ' 的插槽，无法连接搭载设施')
											}
											else {
												modules.push({ id: equipJson.equipId, module: equipModule, type: 6 })
												equipSlot.connect(equipModule)
											}
										}
									}
								}
							}
						}
					}
				}

				// 监测是否有连接件  >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
				if (has_mainpole) {
					let connectorsJson = mainpoleJson.connectors
					if (connectorsJson === undefined || connectorsJson === null) {
						warn.push(HTML.create_KeyPair('BuildPath', HTML.create_Or(['mainPole', 'connectors']), 'String') + ' 不存在，无法生成连接件')
					}
					else {
						// console.log(connectorsJson)
						for (let i = 0; i < connectorsJson.length; i++) {
							let connectorJson = connectorsJson[i]
							// console.log(">>>>", connectorJson)
							let positionangle = (parseFloat(connectorJson.angle)) / 180 * Math.PI
							let angle = (360.0 - parseFloat(connectorJson.angle)) / 180 * Math.PI
							let y = parseFloat(connectorJson.yaxis) * Unit
							let x = parseFloat(connectorJson.xaxis) * Unit * Math.cos(positionangle)
							let z = parseFloat(connectorJson.xaxis) * Unit * Math.sin(positionangle)
							let position = new THREE.Vector3(x, y, z)
							// zaxis
							if (connectorJson.lookingDirectionAngle === null || connectorJson.zaxis === null) {
								warn.push('在生成 ' + HTML.create_KeyPair('BuildPath', HTML.create_Or(['mainPole', 'connectors[' + i + ']']), 'String') + ' 时发现，' + HTML.create_Or([HTML.create_KeyPair('Property', 'zaixs', 'String'), HTML.create_KeyPair('Property', 'lookingDirectionAngle', 'String')]) + ' 为null，将不考虑z轴偏移')
							}
							else {
								// console.log(">>>>> ", connectorJson)
								let lookingatangle = parseFloat(connectorJson.lookingDirectionAngle) / 180 * Math.PI
								angle = (360.0 - parseFloat(connectorJson.lookingDirectionAngle)) / 180 * Math.PI
								let lookatvector = new THREE.Vector3(Math.cos(lookingatangle), 0, Math.sin(lookingatangle))
								let zvector = lookatvector.cross(new THREE.Vector3(0, 1, 0)).normalize()
								position.add(zvector.multiplyScalar(connectorJson.zaxis * Unit))
							}
							let connectorModule = this.create_Module(connectorJson.componentId, connectorJson.connectorId, true, position, new THREE.Euler(0, angle, 0, "XYZ"))
							if (connectorModule === null) {
								error.push('在生成 ' + HTML.create_KeyPair('BuildPath', HTML.create_Or(['mainPole', 'connectors[' + i + ']']), 'String') + ' 时发现，对于 ' + HTML.create_KeyPair('connectorId', connectorJson.connectorId, 'Number') + ' ' + HTML.create_KeyPair('ComponentID', connectorJson.componentId, 'Number') + ' 不存在，无法生成连接件')
							}
							else {
								let connectorSlot = mainpoleModule.get_Slot_by_Name("原点插槽")
								if (connectorSlot === null) {
									error.push('在连接 ' + HTML.create_KeyPair('BuildPath', HTML.create_Or(['mainPole', 'connectors[' + i + ']']), 'String') + ' 时发现，对于其父级不存在 ' + HTML.create_KeyPair('SlotName', '原点插槽', 'String') + ' 的插槽，无法连接连接件')
								}
								else {
									modules.push({ id: connectorJson.connectorId, module: connectorModule })
									connectorSlot.connect(connectorModule)
								}

								let equipsJson = connectorJson.carryEquips
								if (equipsJson === undefined || equipsJson === null) {
									warn.push(HTML.create_KeyPair('BuildPath', HTML.create_Or(['mainPole', 'connectors[' + i + ']', 'carryEquips']), 'String') + ' 不存在，无法生成搭载设施')
								}

								for (let j = 0; j < equipsJson.length; j++) {
									let equipJson = equipsJson[j]
									let polearmangle = parseFloat(equipJson.angle) / 180 * Math.PI
									let equipangle = parseFloat(360 - equipJson.angle) / 180 * Math.PI
									let ye = parseFloat(equipJson.yaxis) * Unit
									let xe = parseFloat(equipJson.xaxis) * Unit * Math.cos(polearmangle)
									let ze = parseFloat(equipJson.xaxis) * Unit * Math.sin(polearmangle)
									let positione = new THREE.Vector3(xe, ye, ze)
									// zaxis
									if (equipJson.lookingDirectionAngle === null || equipJson.zaxis === null) {
										warn.push('在生成 ' + HTML.create_KeyPair('BuildPath', HTML.create_Or(['mainPole', 'connectors[' + i + ']', 'carryEquips[' + j + ']']), 'String') + ' 时发现，' + HTML.create_Or([HTML.create_KeyPair('Property', 'zaixs', 'String'), HTML.create_KeyPair('Property', 'lookingDirectionAngle', 'String')]) + ' 为null，将不考虑z轴偏移')
									}
									else {
										let lookingatangle = parseFloat(equipJson.lookingDirectionAngle) / 180 * Math.PI
										equipangle = parseFloat(360 - equipJson.lookingDirectionAngle) / 180 * Math.PI
										let lookatvector = new THREE.Vector3(Math.cos(lookingatangle), 0, Math.sin(lookingatangle))
										let zvector = lookatvector.cross(new THREE.Vector3(0, 1, 0)).normalize()
										positione.add(zvector.multiplyScalar(equipJson.zaxis * Unit))
									}
									let equipModule = this.create_Module(equipJson.componentId, equipJson.equipId, true, positione, new THREE.Euler(0, equipangle, 0, "XYZ"))
									if (equipModule === null) {
										warn.push('在生成 ' + HTML.create_KeyPair('BuildPath', HTML.create_Or(['mainPole', 'connectors[' + i + ']', 'carryEquips[' + j + ']']), 'String') + ' 时发现，对于 ' + HTML.create_KeyPair('equipId', equipJson.equipId, 'Number') + ' ' + HTML.create_KeyPair('ComponentID', equipJson.componentId, 'Number') + ' 不存在，无法生成搭载设施')
									}
									else {
										let equipSlot = connectorModule.get_Slot_by_Name("搭载设备插槽")
										if (equipSlot === null) {
											error.push('在连接 ' + HTML.create_KeyPair('BuildPath', HTML.create_Or(['mainPole', 'connectors[' + i + ']', 'carryEquips[' + j + ']']), 'String') + ' 时发现，对于其父级不存在 ' + HTML.create_KeyPair('SlotName', '搭载设备插槽', 'String') + ' 的插槽，无法连接搭载设施')
										}
										else {
											modules.push({ id: equipJson.equipId, module: equipModule })
											equipSlot.connect(equipModule)
										}
									}
								}
							}
						}
					}
				}

				mainpoleModule.Update()
				function modulefunc(module, layer) {
					if (module.relatetoorigin) {
						module.relatetoorigin = false
						let position = new THREE.Vector3(0, 0, 0)
						let parentposition = new THREE.Vector3(0, 0, 0)
						parentposition.copy(module.connectedslot.world_position)
						position.copy(module.world_position)
						position.add(parentposition.negate())
						let rotation = new THREE.Euler(0, 0, 0, "XYZ")
						let parentrotation = new THREE.Quaternion()
						parentrotation.setFromEuler(module.connectedslot.world_rotation)
						let selfrotation = new THREE.Quaternion()
						selfrotation.setFromEuler(module.slotmodifier.rotation)
						rotation.setFromQuaternion(parentrotation.inverse().multiply(selfrotation))

						let reverserotation = new THREE.Euler(0, 0, 0, "XYZ")
						parentrotation.setFromEuler(module.connectedslot.world_rotation)
						reverserotation.setFromQuaternion(parentrotation.inverse())
						position.applyEuler(reverserotation)
						// rotation.reorder('YXZ')
						// rotation.reorder('XYZ')

						// if (true) {
						// 	module.slotmodifier.position.set(Math.round(position.x), Math.round(position.y), Math.round(position.z))
						// 	module.slotmodifier.rotation.set(Math.round(rotation.x / Math.PI * 180) / 180 * Math.PI, Math.round(rotation.y / Math.PI * 180) / 180 * Math.PI, Math.round(rotation.z / Math.PI * 180) / 180 * Math.PI)
						// }
						// else {
						module.slotmodifier.position.copy(position)
						module.slotmodifier.rotation.copy(rotation)
						// }
					}
				}
				this.$static.baseslot[idx].get_Slot_by_Name('BaseSlot').Traverse(modulefunc, () => { })
				this.refresh_Tree(idx)
				// 横臂搭载设备 y <- 0
				modules.filter((module) => { return module.type === 6 }).forEach((module) => {
					// console.log(module)
					module.module.slotmodifier.position.y = 0
				})

				function get_byID(id) {
					for (let i = 0; i < modules.length; i++) {
						if (modules[i].id === id) {
							return modules[i].module
						}
					}
					return null
				}

				// 跨横臂
				for (let id in cross) {
					console.log(id)
					let equip = get_byID(parseInt(id))
					let equipParent = equip.get_Parent()
					let crossmodule = cross[id].map((item) => { return get_byID(item) }).filter((module) => { return module !== equipParent })

					for (let i = 0; i < crossmodule.length; i++) {
						let equipSlot = crossmodule[i].get_Slot_by_Name('搭载设备插槽')
						if (equipSlot === null) {
							error.push('在跨横臂引用 ' + HTML.create_KeyPair('equipID', id, 'Number') + ' 时发现，被引用的组件' + Module.get_StyledHTML(crossmodule[i]) + '不存在 ' + HTML.create_KeyPair('SlotName', '搭载设备插槽', 'String') + ' 的插槽，无法创建引用')
						}
						else {
							try {
								equip.make_Link(equipSlot)
							} catch (linkerror) {
								error.push('在跨横臂引用 ' + HTML.create_KeyPair('equipID', id, 'Number') + ' 时发现，' + linkerror.message)
							}
						}
					}
				}

				this.refresh_Tree(idx)

				this.$static.baseslot[idx].Traverse((module) => {
					Module.set_Visible(module, true)
				}, () => { })

				// if (warn.length > 0)
				// 	this.$EventBus.$emit('console_add_Output', "info", '自动拼接 警告', "在 <自动拼接> 出现了如下警告:" + HTML.create_UList(warn))
				// if (error.length > 0) {
				// 	this.$EventBus.$emit('console_add_Output', "error", '自动拼接 错误', "在 <自动拼接> 出现了如下错误:" + HTML.create_UList(error) + '可能的影响:<ul><li>自动拼接被中断</li></ul>')
				// }
				// else {
				// 	customLog(this, 'log', 'build', '编辑器 提示', HTML.create_KeyPair('操作', '自动拼接', 'String') + ' 完成' + (warn.length > 0 ? ('，有输出 ' + HTML.create_Warn() + ' 请查看') : ''))
				// }
			},

			create_Bases(count) {
				while (this.$static.baseslot.length > 0) {
					let base = this.$static.baseslot
				}
			},

			load_Pole(idx, poleid, polecode) {

			},

			create_BuildObject: function (json) {
				let object = {
					boxCode: json.integratedEquipmentBoxCode,
					boxId: json.integratedEquipmentBoxId,
					array: []
				}

				json.usageSpace.forEach((space) => {
					let spaceobject = {
						equips: [],
						height: space.height * this.unit,
						spaceId: space.spaceCode,
						property: {
							orgName: space.orgName,
							orgType: space.orgType,
							ratedPower: space.ratedPower,
							remainingPower: space.remainingPower,
							supplyVoltage: space.supplyVoltage,
							usedPower: space.usedPower
						}
					}
					if (space.equips !== null)
						space.equips.forEach((equip) => {
							spaceobject.equips.push({
								equipmentId: equip.equipmentId,
								equipmentCode: equip.equipmentCode,
								equipmentType: equip.equipmentType,
								height: equip.equipHeight * this.unit,
								width: equip.equipWidth * this.unit,
								length: equip.equipLength * this.unit,
								property: {
									equipRatedPower: equip.equipRatedPower,
									equipSupplyVoltage: equip.equipSupplyVoltage
								}
							})
						})

					object.array.push(spaceobject)
				})

				return object
			},

			buildFromArray: function (json) {

				console.log(json)

				let height = 0
				let array = json.Array
				let connectslot = this.boxModule.get_Slot_by_Name("仓位分隔板插槽")

				while (connectslot.connectedmodule.length > 0) {
					connectslot.connectedmodule[0].Traverse(Module.remove_from_Scene, Slot.remove_from_Scene)
					connectslot.disconnect(connectslot.connectedmodule[0])
				}

				this.boxModule.property = {
					boxCode: json.boxCode,
					boxId: json.boxId
				}

				// for (let j = 0; j < array.length; j++) {
				// 	let module = this.create_Tree_from_JSON({ ComponentID: 3, Sub: null })
				// 	connectslot.connect(module)
				// 	module.slotmodifier.position.y = height - array[j].height
				// 	height -= array[j].height
				// }

				json.array.forEach((space) => {
					let module = this.create_Tree_from_JSON({ ComponentID: 3, Sub: null })
					connectslot.connect(module)
					module.property = space.property
					module.slotmodifier.position.y = height - space.height
					height -= space.height

					let width = 0
					space.equips.forEach((equip) => {
						let equipmodule = new Module(0, equip.equipmentId, equip.equipmentCode, new THREE.Vector3(0, 0, 0), new THREE.Euler(0, 0, 0, "XYZ"), this.scene, "", 0.01, new SM_Free(new THREE.Vector3(0, 0, 0), new THREE.Euler(0, 0, 0, "XYZ")))
						equipmodule.model = new THREE.Mesh(box, new THREE.MeshStandardMaterial({
							color: '#aaaaff',
							// 材质像金属的程度. 非金属材料，如木材或石材，使用0.0，金属使用1.0，中间没有（通常）.
							// 默认 0.5. 0.0到1.0之间的值可用于生锈的金属外观
							metalness: 1,
							// 材料的粗糙程度. 0.0表示平滑的镜面反射，1.0表示完全漫反射. 默认 0.5
							roughness: 0.6,
						}))
						equipmodule.property = equip.property
						equipmodule.slotmodifier.position.y = equip.height / 2
						equipmodule.slotmodifier.position.x = width + equip.width / 2
						width += equip.width + 0.05
						Module.add_to_Scene(equipmodule)
						equipmodule.model.scale.set(equip.width, equip.height, equip.length)
						module.get_Slot_by_Name("设备插槽").connect(equipmodule)
					})
				})

				this.refresh_Tree(0)
			},
			//========================================
			//             Module Tree
			//========================================
			// update the components tree
			refresh_Tree: function (idx) {
				this.$static.baseslot[idx].Update()
			},

			clear_Tree: function () {
				while (this.baseslot.connectedmodule.length > 0) {
					this.baseslot.connectedmodule[0].Traverse(Module.remove_from_Scene, Slot.remove_from_Scene)
					this.baseslot.disconnect(this.baseslot.connectedmodule[0])
				}
				uniqueID = 0
			},

			create_Tree_from_JSON: function (json) {
				if (json === null || json === {}) {
					return
				}
				if (json["Sub"] === null) {
					let Main_data = data[json["ComponentID"]]
					console.log(Main_data)
					let LastModule = new Module(Main_data["moduleid"], uniqueID, Main_data["modulename"], new THREE.Vector3(parseFloat(Main_data["moduleposition"][0]), parseFloat(Main_data["moduleposition"][1]), parseFloat(Main_data["moduleposition"][2])), new THREE.Euler(parseFloat(Main_data["modulerotation"][0]), parseFloat(Main_data["modulerotation"][1]), parseFloat(Main_data["modulerotation"][2]), 'XYZ'), this.$static.Scene, Main_data["url"], new SlotModifier(), false, '合箱', {}, -1)
					let current_slotlist = Main_data["interfaces"]

					for (let i = 0; i < current_slotlist.length; i++) {
						let Slot_data = current_slotlist[i]
						// let positionx = parseFloat(Slot_data["interfaceposition"][0]) + parseFloat(current_module.shiftposition.x)
						// let positiony = parseFloat(Slot_data["interfaceposition"][1]) + parseFloat(current_module.shiftposition.y)
						// let positionz = parseFloat(Slot_data["interfaceposition"][2]) + parseFloat(current_module.shiftposition.z)

						let positionx = parseFloat(Slot_data["interfaceposition"][0])
						let positiony = parseFloat(Slot_data["interfaceposition"][1])
						let positionz = parseFloat(Slot_data["interfaceposition"][2])

						let slot = new Slot(Slot_data["interfaceUID"], Slot_data["interfacename"], new THREE.Vector3(positionx, positiony, positionz), new THREE.Euler(parseFloat(Slot_data["interfacerotation"][0]), parseFloat(Slot_data["interfacerotation"][1]), parseFloat(Slot_data["interfacerotation"][2]), 'XYZ'), this.$static.Scene)
						console.log(slot)

						LastModule.add_Slot(slot)
					}
					return LastModule
				}
				this.baseslot.remove_SubTree_from_Scene()

				let moduledatalist = new Array()
				let modulelist = new Array()

				let currentuid = 0

				let Main_data = data[json["ComponentID"]]
				// console.log(Main_data)
				let LastModule = new Module(Main_data["moduleid"], currentuid, Main_data["modulename"], new THREE.Vector3(parseFloat(Main_data["moduleposition"][0]), parseFloat(Main_data["moduleposition"][1]), parseFloat(Main_data["moduleposition"][2])), new THREE.Euler(parseFloat(Main_data["modulerotation"][0]), parseFloat(Main_data["modulerotation"][1]), parseFloat(Main_data["modulerotation"][2]), 'XYZ'), this.objectorigin, Main_data["url"], this.unit)
				this.baseslot.connect(LastModule)

				moduledatalist.push(json)
				modulelist.push(LastModule)

				currentuid++

				while (moduledatalist.length > 0) {
					let current_data = moduledatalist.pop()
					let current_module = modulelist.pop()
					let current_component_data = data[current_data["ComponentID"]]
					let current_slotlist = current_component_data["interfaces"]

					for (let i = 0; i < current_slotlist.length; i++) {
						let Slot_data = current_slotlist[i]
						// let positionx = parseFloat(Slot_data["interfaceposition"][0]) + parseFloat(current_module.shiftposition.x)
						// let positiony = parseFloat(Slot_data["interfaceposition"][1]) + parseFloat(current_module.shiftposition.y)
						// let positionz = parseFloat(Slot_data["interfaceposition"][2]) + parseFloat(current_module.shiftposition.z)

						let positionx = parseFloat(Slot_data["interfaceposition"][0])
						let positiony = parseFloat(Slot_data["interfaceposition"][1])
						let positionz = parseFloat(Slot_data["interfaceposition"][2])

						let slot = new Slot(Slot_data["interfaceUID"], Slot_data["interfacename"], new THREE.Vector3(positionx, positiony, positionz), new THREE.Euler(parseFloat(Slot_data["interfacerotation"][0]), parseFloat(Slot_data["interfacerotation"][1]), parseFloat(Slot_data["interfacerotation"][2]), 'XYZ'), this.objectorigin)
						// console.log(slot)

						current_module.add_Slot(slot)

						let Sub_datalist = current_data["Sub"][i]
						for (let j = 0; j < Sub_datalist.length; j++) {
							let Sub_Data = data[Sub_datalist[j]["ComponentID"]]
							// console.log(">>> " + Sub_Data)
							let Sub_Module = new Module(Sub_Data["moduleid"], currentuid, Sub_Data["modulename"], new THREE.Vector3(parseFloat(Sub_Data["moduleposition"][0]), parseFloat(Sub_Data["moduleposition"][1]), parseFloat(Sub_Data["moduleposition"][2])), new THREE.Euler(parseFloat(Sub_Data["modulerotation"][0]), parseFloat(Sub_Data["modulerotation"][1]), parseFloat(Sub_Data["modulerotation"][2]), 'XYZ'), this.$static.Scene, Sub_Data["url"], this.unit)
							currentuid++
							slot.connect(Sub_Module)
							modulelist.push(Sub_Module)
							moduledatalist.push(Sub_datalist[j])
						}
						// let LastModule = new Module(Main_data["moduleid"], currentuid, Main_data["modulename"], new THREE.Vector3(parseFloat(Main_data["moduleposition"][0]), parseFloat(Main_data["moduleposition"][1]), parseFloat(Main_data["moduleposition"][2])), new THREE.Euler(parseFloat(Main_data["modulerotation"][0]), parseFloat(Main_data["modulerotation"][1]), parseFloat(Main_data["modulerotation"][2]), 'XYZ'), this.objectorigin, Main_data["url"], this.unit)
						// this.baseslot.connect(LastModule)

					}
				}
				return LastModule
			},

			refresh_AllTreeData: function () {
				let ml = new Array()
				let sl = new Array()
				let mnul = new Array()
				let tree = new Array()
				function get_all_module(module, layer) {
					if (module.name !== "Base") {
						mnul.push({ Name: module.name, UID: module.uid, ComponentID: module.componentid })
						ml.push(module)
						let layerstyle = { "padding-left": layer * 30 + 'px' }
						tree.push({ Type: "Module", Name: module.name, UID: module.uid, ComponentID: module.componentid, Layer: layer, LayerStyle: layerstyle })
					}
				}
				function get_all_slot(slot, layer) {
					if (slot.name !== "BaseSlot") {
						let layerstyle = { "padding-left": layer * 30 + 'px' }
						tree.push({ Type: "Slot", Name: slot.name, UID: slot.uid, Layer: layer, LayerStyle: layerstyle })
					}
					sl.push(slot)
				}
				this.base.Traverse(get_all_module, get_all_slot)
				this.modulelist = ml
				this.slotlist = sl
				this.nameuidlist = mnul
				this.moduletree = tree
				// console.log(this.slotlist)
				this.$emit("moduleDataRefresh", this.nameuidlist, this.moduletree)
			},

			get_ModuleList_by_Name: function (name) {
				let result = new Array()
				for (let i = 0; i < this.modulelist.length; i++) {
					let module = this.modulelist[i]
					if (module.name === name) {
						result.push(module)
					}
				}
				return result
			},

			get_ModuleList_by_UID: function (uid) {
				let result = new Array()
				for (let i = 0; i < this.modulelist.length; i++) {
					let module = this.modulelist[i]
					if (module.uid === uid) {
						result.push(module)
					}
				}
				return result
			},

			get_FirstModule_with_NameUID: function (name, uid) {
				for (let i = 0; i < this.modulelist.length; i++) {
					let module = this.modulelist[i]
					if (module.uid === uid && module.name === name) {
						return module
					}
				}
				return null
			},

			get_NextModule_with_NameUID: function (lastmodule, name, uid) {
				let i = 0
				for (i = 0; i < this.modulelist.length; i++) {
					let module = this.modulelist[i]
					if (module === lastmodule) {
						break
					}
				}
				for (i++; i < this.modulelist.length; i++) {
					let module = this.modulelist[i]
					if (module.uid === uid && module.name === name) {
						return module
					}
				}
				return null
			},

			//========================================
			//                 Camera
			//========================================
			// 切换三视图
			switch_View: function (dir) {
				// alert("fin!!!")
				this.switch_Camera('正交')
				switch (dir) {
					case 'Front':
						this.camera.position.set(-100, this.controls.orbitControls.target.y, this.controls.orbitControls.target.z)
						this.controls.orbitControls.update()
						break
					case 'Top':
						this.camera.position.set(this.controls.orbitControls.target.x, 100, this.controls.orbitControls.target.z)
						this.controls.orbitControls.update()
						break
					case 'Left':
						this.camera.position.set(this.controls.orbitControls.target.x, this.controls.orbitControls.target.y, 100)
						this.controls.orbitControls.update()
						break
				}
			},

			// 居中视图
			center_View: function () {
				this.boundingbox.setFromObject(this.objectorigin)
				this.boundingbox.getCenter(this.controls.orbitControls.target)
				this.controls.orbitControls.update()
			},

			button_SwitchCamera: function () {
				switch (this.currentCamera) {
					case '正交':
						this.switch_Camera('透视')
						break
					case '透视':
						this.switch_Camera('正交')
						break
				}
			},

			// 切换相机“透视”/“正交”
			switch_Camera: function (val) {
				let width = this.CanvasSize.width - 4
				let height = this.CanvasSize.height - 4
				if (this.currentCamera != val)
					switch (val) {
						case '正交':
							this.camera = this.OrthographicCamera
							this.camera.position.set(this.PerspectiveCamera.position.x, this.PerspectiveCamera.position.y, this.PerspectiveCamera.position.z)
							this.camera.rotation.set(this.PerspectiveCamera.rotation.x, this.PerspectiveCamera.rotation.y, this.PerspectiveCamera.rotation.z)

							let vecP = new THREE.Vector3(0, 0, 0)
							let tarP = new THREE.Vector3(0, 0, 0)
							vecP.copy(this.PerspectiveCamera.position)
							tarP.copy(this.controls.orbitControls.target).negate()
							vecP.add(tarP)
							let dP0 = (height / 2) / (Math.tan(this.PerspectiveCamera.fov / 2 / 180 * Math.PI))
							let dP = vecP.length()
							this.OrthographicCamera.zoom = (dP0 / dP)
							this.controls.orbitControls.object = this.camera
							this.OrthographicCamera.updateProjectionMatrix()
							this.controls.orbitControls.update()
							this.currentCamera = '正交'
							break
						case '透视':
							this.camera = this.PerspectiveCamera
							this.camera.position.set(this.OrthographicCamera.position.x, this.OrthographicCamera.position.y, this.OrthographicCamera.position.z)
							this.camera.rotation.set(this.OrthographicCamera.rotation.x, this.OrthographicCamera.rotation.y, this.OrthographicCamera.rotation.z)
							// console.log(this.OrthographicCamera.zoom)
							let vecO = new THREE.Vector3(0, 0, 0)
							let tarO = new THREE.Vector3(0, 0, 0)
							vecO.copy(this.PerspectiveCamera.position)
							tarO.copy(this.controls.orbitControls.target).negate()
							vecO.add(tarO).normalize()

							let dO = (height / 2) / (Math.tan(this.PerspectiveCamera.fov / 2 / 180 * Math.PI))
							vecO.multiplyScalar(dO / this.OrthographicCamera.zoom)
							tarO.negate().add(vecO)

							this.PerspectiveCamera.position.copy(tarO)
							this.controls.orbitControls.object = this.camera
							this.controls.orbitControls.update()
							this.currentCamera = '透视'
							break
					}
			},

			//========================================
			//             Mouse Control
			//========================================
			mouseMove: function () {
				this.mouseRawPosition.set(event.offsetX, event.offsetY)
			},

			//========================================
			//             Ray Cast
			//========================================
			get_RayCastObject: function (objarray, mouseposition) {

				this.raycaster.setFromCamera(mouseposition, this.$static.Camera)

				let intersects = this.raycaster.intersectObjects(objarray)

				let indexarray = new Array()

				intersects.forEach((item) => {
					let obj = item.object
					for (let i = 0; i < objarray.length; i++) {
						if (obj === objarray[i]) {
							indexarray.push(i)
							break
						}
					}
				})

				if (intersects.length > 0) {
					return { interfaces: intersects, index: indexarray }
				}
				else {
					return null
				}
			},

			mouseOut: function () {
			},

			mouseClick: function () {
			},
			mouseDoubleClick: function () {
				let modulelist = []
				this.$static.MouseRawPosition.set(event.offsetX, event.offsetY)
				this.$static.baseslot.forEach((base)=>{
				base.get_Slot_by_Name('BaseSlot').Traverse((module)=>{
				if (module.model !== null)
				modulelist.push(module)
				},()=>{})
				})
				let arrow1 = this.$static.Scene.getObjectByName('turnleft')
				let arrow2 = this.$static.Scene.getObjectByName('gofoward')
				let canvassize = this.$static.Renderer.getSize()
				let mousePosition = new THREE.Vector2((this.$static.MouseRawPosition.x) / (canvassize.x) * 2 - 1, - (this.$static.MouseRawPosition.y) / (canvassize.y) * 2 + 1)
				let touchedModel = this.get_RayCastObject(modulelist.map((module) => { return module.model }), mousePosition)
				let touchedarrow = this.get_RayCastObject([arrow1,arrow2],mousePosition)
				if(touchedarrow !== null){
					console.log(touchedarrow)
					if(touchedarrow.interfaces[0].object.name == 'turnleft'){
						this.$static.OrbitControl.target = new THREE.Vector3(-20, 40, 2100)
						this.$static.Camera.position.set(0,40,0)
						this.$static.OrbitControl.update()
						this.$static.Renderer.render(this.$static.Scene, this.$static.Camera)
					} else if(touchedarrow.interfaces[0].object.name == 'gofoward'){
						this.$static.OrbitControl.target = new THREE.Vector3(-1000, 40, 0)
						this.$static.Camera.position.set(0,40,0)
						this.$static.OrbitControl.update()
					}
				}
				if (touchedModel !== null)
				{
					console.log('模型名称')
					console.log(touchedModel)
				let ans = Array.from(new Set(touchedModel.index.map((idx)=>{return modulelist[idx]})))
				let parent = ans[0]
				while (parent.componentid !== -1)
				{
				parent = parent.get_Parent()
				if(parent.get_Parent() === null)
				{
				break;
				}
				}
				if(parent === null)
				{
				console.log("-------null-------")
				}
				else
				{
					console.log(parent.name)
					//this.openDisplay(parent.name, (parent.name.includes('JingAn0013')||parent.name.includes('HuaiHai0003')) ? 100:66)
					this.openDisplay(parent.name, parent.name == 'Base' ? 100 : parent.name)
				}
				}
			},

			mouseRightClick: function () {
			},

			//========================================
			//            Render & Loop
			//========================================
			actionLoop: function (scale) {
			},

			animate: function () {
				// let scale = this.update_Mouse3DPlane()
				// this.actionLoop(scale)
				if (this.$static.Renderer !== null) {
					this.$static.Renderer.render(this.$static.Scene, this.$static.Camera)
				}

				if (this.shouldRender) {
					TWEEN.update()
					requestAnimationFrame(this.animate)
				}
			},

			addArrows(){
				var geometry1 = new THREE.BoxGeometry(36,36,1);
				var geometry2 = new THREE.BoxGeometry(36,36,1);
				let loader = new THREE.TextureLoader();
				let wellTexture = loader.load( '../../static/straightarrow.png' );
				let wellMaterial = new THREE.MeshLambertMaterial( { map: wellTexture,side: THREE.DoubleSide } );
				let arrowmesh1 = new THREE.Mesh(geometry1,wellMaterial);
				arrowmesh1.name = "turnleft"
				let arrowmesh2 = new THREE.Mesh(geometry2,wellMaterial);
				arrowmesh2.name = "gofoward"
				arrowmesh1.rotation.x += Math.PI/2
				arrowmesh1.position.y += 10
				arrowmesh1.position.z += 50
				arrowmesh1.position.x -=100
				arrowmesh2.rotation.x += Math.PI/2
				arrowmesh2.rotation.z += Math.PI/2
				arrowmesh2.position.x -= 200
				arrowmesh2.position.y += 10
				this.$static.Scene.add(arrowmesh1,arrowmesh2)
			},

			inspectorUpdate: function (action, val) {
				if (action === 'testBuild') {
					let aeskey = 'fSQDFy2ca7MeWc6YBXPQse86FJHTYTPn'
					let PublicKey = 'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCmOPICLOzNSRMjcwWbtO+/a4hc2i87Iov3p5Sfky0u75Wt5Kycb4BOhurZWQnx453yN+u8ljBV4HfEResUcgDdPnNy281EIJbAOIz39pknTBuJzAmqM6atmZKrJVfOxZIMnNRDgWu4fsvpPqgsQWc5NaCdMreIE5Z5JyrbgA94ewIDAQAB'
					let word = 'boxCode=' + this.createJson

					const key = CryptoJS.enc.Utf8.parse(aeskey)
					const srcs = CryptoJS.enc.Utf8.parse(word)
					const encrypted = CryptoJS.AES.encrypt(srcs, key, {
						mode: CryptoJS.mode.ECB,
						padding: CryptoJS.pad.Pkcs7
					})

					let that = this

					fetch('http://180.167.245.227:65522/woody/visual/getPartsByEquipmentBoxCode?param=' + encrypted.ciphertext.toString(), {
						method: 'GET',
						headers: {
							'access_key': 'ZN193CkJqwo7FJ0TnCyjVe/z0AYevc32oD8fONk1fH8XvTAs8uVtRWhcPK+uwDFSU/GVDc9ASuOlpfYoxj1AVutb393iLNKQJBrZ6car08QtNzISrMDvLr0SkXBfZBbMG0auPK1DFdcZVzjgGMrd4QUkHKSFLgbZL20pLQmKgpg=',
							'access_token': PublicKey,
							'Content-Type': 'application/json'
						}
					})
						.then(function (response) {
							return response.json()
						})
						.then(function (Json) {
							// console.log(Json)
							if (Json.respCode === 0) {
								that.buildFromArray(that.create_BuildObject(Json.returns))
								customLog(that, 'log', 'buildBox', '编辑器 提示', HTML.create_KeyPair('操作', '合箱生成', 'String') + ' 完成')
							}
							else {
								customLog(that, "error", "自动拼接", "网络接口生成 错误", "在 <请求数据> 出现了如下错误: <br>" + HTML.create_KeyPair('错误', Json.respMsg, "String"))
							}
						});
				}
				else if (action === 'getUrl') {
					this.createJson = val
				}
			}
		},

		mounted() {
			this.init()
			this.animate()
			this.requestPole()
			this.$EventBus.$on('boxdisplay_inspectorUpdate', (action, val) => {
				this.inspectorUpdate(action, val)
			})
		}
	};

</script>
<style>
	#Canvas-Show-Box>canvas {
		background-color: tomato;
		position: absolute;
		top: 0px;
		left: 0px;
		right: 0px;
		bottom: 0px;
		border: none;
		outline: none;
		border-radius: var(--CanvasRadius);
	}
</style>
