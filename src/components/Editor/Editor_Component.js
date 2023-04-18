import * as TOOL from '../Sun/ToolManager.js'
import * as THREE from 'three'
import OrbitControls from 'three-orbitcontrols'
import { get_Tools, get_FlowGraph } from '../Tools.js'
import * as FileSystem from '../Sun/FileSystem.js'
import {
	customLog,
	HTML,
	radius_to_degree,
	degree_to_radius,
	to_PoleAngle,
	get_NearPoleAngle,
	get_AngleBetween
} from '../Utils.js'
import {
	Slot,
	Module,
	SlotModifier,
	SM_Free,
	create_Module_from_Json,
	create_Tree_from_PoleJson,
	Unit,
	get_UniqueID,
	ModulePlugin,
	MP_Model,
	disposeNode,
	get_TransfromPosRot,
	create_Module_from_Json_Promise
} from '../Sun/ModuleSlot.js'
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js'
import CryptoJS from 'crypto-js'
import STLLoader from 'three-stl-net-loader'
import { Vector3 } from 'three'
import {saveComponent, aOrUDisassemblyRawMaterial, editDecoComponent} from '@/api/Components'
import {uploadFileBlock, deleteFile} from '@/api/FileBlock'

let loader = new STLLoader()

let mainPoleLineGeometry = null
loader.load('static/model/assist/zg_zgbottom280-height6500.stl', function (geometry) {
	geometry.computeVertexNormals()
	geometry.center()
	mainPoleLineGeometry = new THREE.EdgesGeometry(geometry)
}
)

let vicePoleLineGeometry = null
loader.load('static/model/assist/tr_160_aluminum_3500.STL', function (geometry) {
	geometry.computeVertexNormals()
	geometry.center()
	vicePoleLineGeometry = new THREE.EdgesGeometry(geometry)
}
)

let armLineGeometry = null
loader.load('static/model/assist/hb_5.2M_taper.STL', function (geometry) {
	geometry.computeVertexNormals()
	geometry.center()
	armLineGeometry = new THREE.EdgesGeometry(geometry)
}
)

let cameraGunLineGeometry = null
loader.load('static/model/assist/gun.stl', function (geometry) {
	geometry.computeVertexNormals()
	geometry.center()
	cameraGunLineGeometry = new THREE.EdgesGeometry(geometry)
})

let connecterGeometry = null
loader.load('static/model/assist/link.stl', function (geometry) {
	geometry.computeVertexNormals()
	geometry.center()
	connecterGeometry = new THREE.EdgesGeometry(geometry)
})

let lampLineGeometry = null
loader.load('static/model/assist/db_hb76lightLED.stl', function (geometry) {
	geometry.computeVertexNormals()
	geometry.center()
	lampLineGeometry = new THREE.EdgesGeometry(geometry)
})

let classificationlist = ['主杆', '副杆', '横臂', '卡槽', '灯臂', '连接件', '搭载设备', '微型杆', '杆体', '侧边法兰', '底部法兰', '顶部法兰', '小检修门', '大检修门', '副杆体', '副侧边法兰', '副底部法兰', '副顶部法兰', '副小检修门', '副大检修门', '贴图', '模板']

export function init_Editor() {
	//console.log('>>> Component Editor Init')
}

// Scene
function create_Scene(name) {
	// scene
	let scene = new THREE.Scene()
	// grid
	let grid = new THREE.GridHelper(100, 20, '#000000')
	grid.name = 'GroundGrid'
	scene.add(grid)
	// origin
	let objectorigin = new THREE.Object3D()
	scene.add(objectorigin)
	// camera
	let constainer = document.getElementById('Canvas-Show')
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
	scene.add(directLight)

	let RaycastPlane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1, 1, 1), new THREE.MeshStandardMaterial({
		color: '#ff0000',
		metalness: 1,
		roughness: 0.6
	}))
	RaycastPlane.name = 'RaycastPlane'
	RaycastPlane.visible = false
	scene.add(RaycastPlane)
	let mainPoleLine = new THREE.LineSegments(mainPoleLineGeometry, new THREE.LineBasicMaterial({
		color: '#84733c',
		// opacity: 0.4,
		linewidth: 20,
	}))
	mainPoleLine.visible = false
	mainPoleLine.scale.set(Unit, Unit, Unit)
	mainPoleLine.position.set(0, 33.35, 0)
	mainPoleLine.rotation.set(0, -Math.PI / 2, 0)
	mainPoleLine.name = 'mainPoleLine'
	scene.add(mainPoleLine)
	let vicePoleLine = new THREE.LineSegments(vicePoleLineGeometry, new THREE.LineBasicMaterial({
		color: '#84733c',
		// opacity: 0.4,
		linewidth: 20,
	}))
	vicePoleLine.visible = false
	vicePoleLine.scale.set(Unit, Unit, Unit)
	vicePoleLine.position.set(0, 83.55, 0)
	vicePoleLine.rotation.set(0, 0, 0)
	vicePoleLine.name = 'vicePoleLine'
	scene.add(vicePoleLine)
	let armLine = new THREE.LineSegments(armLineGeometry, new THREE.LineBasicMaterial({
		color: '#84733c',
		// opacity: 0.4,
		linewidth: 20,
	}))
	armLine.visible = false
	armLine.scale.set(Unit, Unit, Unit)
	armLine.position.set(27.6, 63.15, 0)
	// armLine.rotation.set(0, 89.536, 3)
	armLine.rotation.set(0, Math.PI / 2, 0)
	armLine.name = 'armLine'
	scene.add(armLine)

	let cameraGunLine = new THREE.LineSegments(cameraGunLineGeometry, new THREE.LineBasicMaterial({
		color: '#84733c',
		// opacity: 0.4,
		linewidth: 20,
	}))
	cameraGunLine.visible = false
	cameraGunLine.scale.set(Unit, Unit, Unit)
	cameraGunLine.position.set(0, 83.55, 0)
	cameraGunLine.rotation.set(0, 0, 0)
	cameraGunLine.name = 'cameraGunLine'
	scene.add(cameraGunLine)

	//场景中添加连接件
	let connecter = new THREE.LineSegments(connecterGeometry, new THREE.LineBasicMaterial({
		color: '#84733c',
		// opacity: 0.4,
		linewidth: 20,
	}))
	connecter.visible = false
	connecter.scale.set(Unit, Unit, Unit)
	connecter.position.set(0, 100, 0)
	connecter.rotation.set(0, 0, 0)
	connecter.name = 'connecter'
	scene.add(connecter)

	let lamp = new THREE.LineSegments(lampLineGeometry, new THREE.LineBasicMaterial({
		color: '#84733c',
		// opacity: 0.4,
		linewidth: 20,
	}))
	lamp.visible = false
	lamp.scale.set(Unit, Unit, Unit)
	lamp.position.set(0, 100, 0)
	lamp.rotation.set(0, 0, 0)
	lamp.name = 'lamp'
	scene.add(lamp)

	return {
		filetype: 'component',
		name: name || '新建组件(' + get_UniqueID() + ')',
		uid: undefined,
		path: undefined,
		eventlistener: undefined,
		scene: scene,
		objectorigin: objectorigin,
		component: null,
		isRemote: false,
		componentslot: {
			position: new THREE.Vector3(0, 0, 0),
			rotation: new THREE.Euler(0, 0, 0)
		},
		context: {
			selectedSlot: null
		},
		reactive: {
			info: '<span style="padding: 4px 8px ; background-color:rgb(240, 70, 60); border-radius: var(--ObjectRadius) 0px 0px var(--ObjectRadius); color:white;font-weight:bold;">微工具</span><span style="padding: 4px 8px ; background-color: rgb(50,50,50); border-radius: 0px var(--ObjectRadius) var(--ObjectRadius) 0px; color: white;">选中组件</span> <a style="width: 20px; padding: 0px 10px;"></a> 选中 <span style="padding: 4px 8px ; background-color:rgb(60, 80, 240); border-radius: var(--ObjectRadius) 0px 0px var(--ObjectRadius); color:white;font-weight:bold;">组件</span><span style="padding: 4px 8px ; background-color: rgb(50,50,50); border-radius: 0px var(--ObjectRadius) var(--ObjectRadius) 0px; color: white;">48, 搭载设备</span>',
			error: '<span style="padding: 4px 8px ; background-color:rgb(240, 70, 60); border-radius: var(--ObjectRadius) 0px 0px var(--ObjectRadius); color:white;font-weight:bold;">微工具</span><span style="padding: 4px 8px ; background-color: rgb(50,50,50); border-radius: 0px var(--ObjectRadius) var(--ObjectRadius) 0px; color: white;">选中组件</span> <a style="width: 20px; padding: 0px 10px;"></a> 选中 <span style="padding: 4px 8px ; background-color:rgb(60, 80, 240); border-radius: var(--ObjectRadius) 0px 0px var(--ObjectRadius); color:white;font-weight:bold;">组件</span><span style="padding: 4px 8px ; background-color: rgb(50,50,50); border-radius: 0px var(--ObjectRadius) var(--ObjectRadius) 0px; color: white;">48, 搭载设备</span>',
			showInfo: true
		},
		modelpath: '',
		modeleventlistener: undefined,
		currentcamera: camera,
		currentcameraname: '透视',
		cameratarget: new THREE.Vector3(0, 0, 0),
		camera: {
			persp: PerspectiveCamera,
			orth: OrthographicCamera
		},
		raycastplane: RaycastPlane,
		render: true
	}
}

export function new_Scene(item) {
	let scene
	if (item === null) {
		scene = create_Scene()
		this.register_Scene(scene)
	}
	else {
		let path = item.path
		scene = create_Scene(item.name)
		let vue = this
		let eventlistener = (e) => {
			// //console.log(scene)
			switch (e.event) {
				case 'pathchange': {
					scene.path = e.path
					return
				}
				case 'rename': {
					scene.name = e.name
					scene.path = e.path
					refresh_Inspector.call(vue)
					vue.scenes = vue.$static.Scenes.map((scene) => {
						return { name: scene.name, filetype: scene.filetype }
					})
					return
				}
				case 'delete': {
					scene.path = undefined
					scene.uid = undefined
					// e.file.close(this.eventlistener) //注意on_Delete不需要手动关闭
					scene.eventlistener = undefined
					return
				}
			}
		}
		try {
			let filedescripter = FileSystem.ROOT.open(path, eventlistener)
			scene.name = filedescripter.name
			scene.path = filedescripter.path
			scene.uid = filedescripter.uid
			scene.isRemote = true
			scene.eventlistener = eventlistener
			this.register_Scene(scene)
			// 不是stl零件拖入时，按照原来逻辑
			if(typeof item.filetype !== 'undefined' && null !== item.filetype && item.filetype !== 'stl'){
				let data = filedescripter.file.data
				let createJson = JSON.parse(data)
				//console.log(createJson)
				if (createJson.property.polePartsSpecsId !== undefined) {
					createJson.property.specsId = createJson.property.polePartsSpecsId
					createJson.property.specsName = '规格号: ' + createJson.property.polePartsSpecsId
				}
				if (createJson.property.specsId !== undefined) {
					createJson.property.specsName = '规格号: ' + createJson.property.specsId
				}

				var [Insert, promise] = create_Module_from_Json_Promise(createJson, scene.objectorigin, (progress) => {
					this.$EventBus.$emit('app_open_Popup', 'pw-progress', 'display', '加载模型', 600, 160, true, false, true, {
						title: '加载' + createJson.name + '模型...',
						progress: Math.round(progress * 100) / 100
					}, false)
				})
				Module.add_to_Scene(Insert)
				this.$EventBus.$emit('app_open_Popup', 'pw-progress', 'display', '加载模型', 600, 160, true, false, true, {
					title: '加载' + Insert.name + '模型...',
					progress: 0
				}, false)
				promise.then(() => {
					this.$EventBus.$emit('app_close_Popup')
				}, () => {
					this.$EventBus.$emit('app_close_Popup')
				})
				scene.component = Insert
				Insert.Traverse((m) => {
					Module.set_Visible(m)
				}, (s) => {
					s.axishelper.visible = true
				})
				refresh_Tree.call(this)
				refresh_Inspector.call(this)
			}

			// 如果是直接拖入零件，则调用action===file
			let initAction = 'module_classification'
			let initClassification = typeof Insert === 'undefined' ? item : Insert.classification
			if(typeof item.filetype !== 'undefined' && null !== item.filetype && item.filetype === 'stl'){
				initAction = 'file'
				scene.isRemote = false
			}

			inspectorUpdate.call(this, initAction, initClassification)
		} catch (error) {
			this.$EventBus.$emit('console_add_Output', 'error', '组件文件错误', '在<打开 .component 文件时出现错误>: </br>' + error.message)
		}
	}
}

export function deselect_Scene(scene) {
}

export function can_Switch(scene) {
	return true
}

export function switch_Scene(scene) {
	// //console.log(">>>>> 这里是组件导入编辑器")
	refresh_Inspector.call(this)
	refresh_Tree.call(this)
}

// 只在已存在的文件被关闭前调用
export function close_Scene(scene) {
	// //console.log("close");
	return true
}

export function release_Scene(scene) {
	//console.log('release')
	FileSystem.ROOT.close(scene.path, scene.eventlistener)
	if (scene.modeleventlistener) {
		FileSystem.ROOT.close(scene.modelpath, scene.modeleventlistener)
	}
	scene.scene.traverse((node) => {
		disposeNode(node)
	})
}

export function save_Scene(scene, pathobj) {
	//console.log('save')
	let data = ''
	if (scene.component !== null) data = JSON.stringify(scene.component.get_JSONObject())
	if (pathobj === undefined) {
		FileSystem.ROOT.write(scene.path, data)
	} else {
		this.$EventBus.$emit('filesystem_add_File', { path: pathobj.filepath, data: data })
	}
}

// Event
export function mouseClick() {

}

export function mouseDoubleClick() {
}

export function onContextMenu() {
	this.$EventBus.$emit('contextmenu_open', 'display', ['画布 - 无选中项', '-', /*{ text: '转换为父级组装树', icon: '大纲', action: 'display_convertTo_LocalTree' }, '-',*/ {
		text: '视图',
		list: [{ text: '居中视图', action: 'display_switch_View', data: 'center', icon: 'blank' }, {
			text: '前视图',
			action: 'display_switch_View',
			data: 'front',
			icon: 'blank'
		}, { text: '左视图', action: 'display_switch_View', data: 'left', icon: 'blank' }, {
			text: '顶视图',
			action: 'display_switch_View',
			data: 'top',
			icon: 'blank'
		}, {
			text: '正交/透视',
			action: 'display_switch_View',
			data: 'mode',
			icon: this.currentCamera === '透视' ? 'selected' : 'select'
		}],
		first: 0
	}], null, event.clientX, event.clientY, 0)
}

export function actionLoop(scale) {
}

export function select_Slot(uid) {
	let scene = this.$static.Scene
	let component = scene.component
	let selected = null
	component.Traverse(() => {
	}, (slot) => {
		if (slot.uid === uid) {
			selected = slot
		}
	})
	if (selected !== null) {
		scene.context.selectedSlot = selected
		this.$emit('moduleSelect', selected.name, selected.uid, -1)
	}
	refresh_Inspector.call(this)
}

export function select_Module(uid) {
	let scene = this.$static.Scene
	let component = scene.component
	if (component !== null) {
		scene.context.selectedSlot = null
		this.$emit('moduleSelect', component.name, component.uid, -1)
	}
	refresh_Inspector.call(this)
}

export function inspectorUpdate(action, val) {
	let scene = this.$static.Scene
	let module = this.$static.Scene.component
	if (action === 'file') {
		// hide_Components.call(this)
		if (val !== null) {
			if (!scene.modeleventlistener) {
				load_Model.call(this, val.path, scene)
				refresh_Inspector.call(this)
				refresh_Tree.call(this)
				refresh_classification.call(this, val)
			} else {
				this.$EventBus.$emit('app_open_Popup', 'pw-confirm', 'display', '组件模型', 600, 200, true, false, true, {
					title: '设置组件模型',
					description: '打开一个新的组件模型将会清除当前编辑内容',
					action: '@open_ModelFile',
					data: val
				}, false)
			}
		} else {
			this.$EventBus.$emit('app_open_Popup', 'pw-confirm', 'display', '组件模型', 600, 200, true, false, true, {
				title: '清除组件模型',
				description: '清除组件模型将会清除当前编辑内容',
				action: '@clear_ModelFile',
				data: null
			}, false)
			// //console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>")
			// return
		}
	} else if (action === 'module_autoAdjust') {
		if (module === null) return
		switch (module.classification) {
			case '主杆': {
				set_mainPole_Position(this.$static.Scene)
				module.Update(scene.componentslot.position, scene.componentslot.rotation)
			}
				break
			case '副杆': {
				set_vicePole_Position(this.$static.Scene)
				module.Update(scene.componentslot.position, scene.componentslot.rotation)
			}
				break
			case '横臂': {
				set_armPole_Position(this.$static.Scene, val)
				module.Update(scene.componentslot.position, scene.componentslot.rotation)
			}
				break
			case '灯臂': {
				set_lampArm_Position(this.$static.Scene)
				module.Update(scene.componentslot.position, scene.componentslot.rotation)
			}
				break
			case '搭载设备': {
				set_instrument_Position(this.$static.Scene, val === '放置于横臂')
				module.editorworkspace.instrument_place = val
				module.Update(scene.componentslot.position, scene.componentslot.rotation)
			}
				break
			case '微型杆': {
				set_microPole_Position(this.$static.Scene)
				module.Update(scene.componentslot.position, scene.componentslot.rotation)
			}
				break
			case '连接件': {
				set_connection_Position(this.$static.Scene)
				module.Update(scene.componentslot.position, scene.componentslot.rotation)
			}
				break
			case '杆体': {
				set_polebody_Position(this.$static.Scene)
				module.Update(scene.componentslot.position, scene.componentslot.rotation)
			}
				break
			case '小检修门': {
				set_small_door_Position(this.$static.Scene)
				module.Update(scene.componentslot.position, scene.componentslot.rotation)
			}
				break
			case '大检修门': {
				set_big_door_Position(this.$static.Scene)
				module.Update(scene.componentslot.position, scene.componentslot.rotation)
			}
				break
			case '底部法兰': {
				set_bottomflan_Position(this.$static.Scene)
				module.Update(scene.componentslot.position, scene.componentslot.rotation)
			}
				break
			case '顶部法兰': {
				set_topflan_Position(this.$static.Scene)
				module.Update(scene.componentslot.position, scene.componentslot.rotation)
			}
				break
			case '侧边法兰': {
				set_sideflan_Position(this.$static.Scene)
				module.Update(scene.componentslot.position, scene.componentslot.rotation)
			}
				break
			case '副杆体': {
				set_Vice_Polebody_Position(this.$static.Scene)
				module.Update(scene.componentslot.position, scene.componentslot.rotation)
			}
				break
			case '副小检修门': {
				set_Vice_Small_Door_Position(this.$static.Scene)
				module.Update(scene.componentslot.position, scene.componentslot.rotation)
			}
				break
			case '副大检修门': {
				set_Vice_Big_Door_Position(this.$static.Scene)
				module.Update(scene.componentslot.position, scene.componentslot.rotation)
			}
				break
			case '副底部法兰': {
				set_Vice_Bottomflan_Position(this.$static.Scene)
				module.Update(scene.componentslot.position, scene.componentslot.rotation)
			}
				break
			case '副顶部法兰': {
				set_Vice_Topflan_Position(this.$static.Scene)
				module.Update(scene.componentslot.position, scene.componentslot.rotation)
			}
			case '副侧边法兰': {
				set_Vice_Sideflan_Position(this.$static.Scene)
				module.Update(scene.componentslot.position, scene.componentslot.rotation)
			}
				break
		}
		refresh_Inspector.call(this)
	} else if (action === 'module_classification') {
		module.classification = val
		scene.componentslot.position.set(0, 0, 0)
		scene.componentslot.rotation.set(0, 0, 0)
		show_Components.call(this)
		switch (val) {
			case '主杆':
				scene.componentslot.position.set(0, 0, 0)
				scene.componentslot.rotation.set(0, 0, 0)
				break
			case '横臂':
				scene.componentslot.position.set(1.535, 63.15, 0)
				scene.componentslot.rotation.set(1.5707963267948963, 0, -1.5707963267948966)
				break
			case '灯臂':
				scene.componentslot.position.set(0, 100.417, 0)
				scene.componentslot.rotation.set(0, 0, 0)
				break
			case '搭载设备':
				scene.componentslot.position.set(0, 0, 0)
				scene.componentslot.rotation.set(0, 0, 0)
				break
			case '副杆':
				scene.componentslot.position.set(0, 65.5, 0)
				scene.componentslot.rotation.set(0, 0, 0)
				break
			case '卡槽':
				scene.componentslot.position.set(0, 0, 0)
				scene.componentslot.rotation.set(0, 0, 0)
				break
			case '连接件':
				scene.componentslot.position.set(0, 100.90, -1.2)
				scene.componentslot.rotation.set(0, 0, 0)
				break
			case '杆身':
				scene.componentslot.position.set(0, 0, 0)
				scene.componentslot.rotation.set(0, 0, 0)
				break
			case '侧边法兰':
				scene.componentslot.position.set(0, 61, 0)
				scene.componentslot.rotation.set(0, 0, 0)
				break
			case '底部法兰':
				scene.componentslot.position.set(0, 0, 0)
				scene.componentslot.rotation.set(0, 0, 0)
				break
			case '顶部法兰':
				scene.componentslot.position.set(-0.12, 65.3, 0)
				break
			case '大检修门':
				scene.componentslot.position.set(0, 5.3, -1.25)
				break
			case '小检修门':
				scene.componentslot.position.set(0, 11, 1.25)
				break
			case '副杆体':
				scene.componentslot.position.set(0, 65.5, 0)
				scene.componentslot.rotation.set(0, 0, 0)
				break
			case '副侧边法兰':
				scene.componentslot.position.set(0, 97.5, 0)
				scene.componentslot.rotation.set(0, 0, 0)
				break
			case '副底部法兰':
				scene.componentslot.position.set(0, 65.5, 0)
				scene.componentslot.rotation.set(0, 0, 0)
				break
			case '副顶部法兰':
				scene.componentslot.position.set(-0.12, 100.5, 0)
				break
			case '副大检修门':
				scene.componentslot.position.set(0, 68.3, -1.25)
				break
			case '副小检修门':
				scene.componentslot.position.set(0, 74, 1.25)
				break
		}
		refresh_Inspector.call(this)
		module.Update(scene.componentslot.position, scene.componentslot.rotation)
	} else if(action === 'module_subClassification'){
		module.editorworkspace.subClassification = val;
		//console.log(module)
		refresh_Inspector.call(this)
	}
	else if (action === 'module_mainclassification') {
		module.mainclassification = val
		switch (module.mainclassification) {
			case '组件':
				module.classificationlist = ['主杆', '副杆', '横臂', '卡槽', '灯臂', '连接件', '搭载设备', '微型杆']
				break
			case '贴图、模板':
				module.classificationlist = ['贴图', '模板']
				break
			case '主杆零件':
				module.classificationlist = ['杆体', '侧边法兰', '底部法兰', '顶部法兰', '小检修门', '大检修门']
				break
			case '副杆零件':
				module.classificationlist = ['副杆体', '副底部法兰', '副顶部法兰', '普通杆灯头连接件']
				break
		}
		refresh_Inspector.call(this)
	} else if (action === 'module_select') {
		module.selectLibrary = val
		refresh_Inspector.call(this)
	} else if (action === 'poleType_select') {
		module.editorworkspace.poleType = val
		refresh_Inspector.call(this)
	}
	else if (action === 'module_position') {
		module.shiftposition.set(val.x, val.y, val.z)
		module.Update(scene.componentslot.position, scene.componentslot.rotation)
	} else if (action === 'module_rotation') {
		module.shiftrotation.set(val.x, val.y, val.z)
		module.Update(scene.componentslot.position, scene.componentslot.rotation)
	} else if (action === 'select_Specs') {
		const map = {
			'主杆': '部件',
			'横臂': '部件',
			'副杆': '部件',
			'连接件': '部件',
			'搭载设备': '搭载设备',
			'灯臂': '部件',
			'卡槽': '部件',
			// '微型杆': '部件',
			'杆体': '主杆零件',
			'侧边法兰': '主杆零件',
			'底部法兰': '主杆零件',
			'顶部法兰': '主杆零件',
			'小检修门': '主杆零件',
			'大检修门': '主杆零件',
			'副杆体': '副杆零件',
			'副底部法兰': '副杆零件',
			'副顶部法兰': '副杆零件',
			'普通杆灯头连接件': '副杆零件'
		}
		if (map[this.$static.Scene.component.classification] !== undefined) {
			if (this.$static.Scene.component.selectLibrary !== undefined) {
				this.$EventBus.$emit('app_open_Popup', 'pw-spec-select', 'display', '关联规格选择', 1000, 800, true, true, true, {
					action: '@select_Specs',
					specsId: this.$static.Scene.component.property.specsId,
					specsName: this.$static.Scene.component.property.specsName,
					classification: this.$static.Scene.component.classification,
					mainClassification: map[this.$static.Scene.component.classification],
					selectLibrary: this.$static.Scene.component.selectLibrary,
					subClassification: this.$static.Scene.component.classification == "侧边法兰" ?  this.$static.Scene.component.editorworkspace.subClassification : null
				})
			} else {
				alert("请选择库")
			}
		}
	} else if (action === 'select_TransverseArmSpecs') {
		if (this.$static.Scene.component.selectLibrary !== undefined) {
			this.$EventBus.$emit('app_open_Popup', 'pw-spec-select', 'display', '关联规格选择', 1000, 800, true, true, true, {
				action: '@select_Specs2',
				specsId: "",
				specsName: "",
				classification: "侧边法兰",
				mainClassification: "主杆零件",
				selectLibrary: this.$static.Scene.component.selectLibrary,
				poleType : this.$static.Scene.component.editorworkspace.poleType
			})
		}
	}
	else if (action === 'getTransverseArmsType') {
		this.$static.Scene.component.editorworkspace.TransverseArmsType = val
		//console.log(this.$static.Scene.component.editorworkspace.TransverseArmsType)
	}
	else if (action === 'change_Property') {
		scene.component.property = val
		refresh_Inspector.call(this)
	} else if (action === 'module_add_Slot') {
		let box = new THREE.Box3()
		box.setFromObject(scene.component.model)
		const SLOTPR = {
			'搭载设备插槽': { p: [0, 2, -1], r: [4.71238898038469, 3.141592653589793, 0] },
			'横臂插槽': { p: [0, box.max.y - box.min.y - 3, -1.5], r: [4.71238898038469, 3.141592653589793, 0] },
			'连接件插槽': { p: [0, 0, 0], r: [0, 0, 0] },
			'副杆插槽': { p: [0, box.max.y - box.min.y, 0], r: [0, 0, 0] },
			'灯臂插槽': { p: [0, 0, 0], r: [0, 0, 0] }
		}
		let slot = new Slot(0, val, new THREE.Vector3(0, 0, 0), new THREE.Euler(0, 0, 0, 'XYZ'), this.$static.Scene.objectorigin, {}, 2)
		if (SLOTPR[val]) {
			slot.position.set(SLOTPR[val].p[0], SLOTPR[val].p[1], SLOTPR[val].p[2])
			slot.rotation.set(SLOTPR[val].r[0], SLOTPR[val].r[1], SLOTPR[val].r[2])
		}

		scene.component.add_Slot(slot)
		slot.axishelper.visible = true
		scene.component.Update(scene.componentslot.position, scene.componentslot.rotation)
		scene.component.Traverse(Module.get_Summary, Slot.get_Summary)
		refresh_Tree.call(this)
	} else if (action === 'delete_Slot') {
		let slot = scene.context.selectedSlot
		slot.belong.delete_Slot(slot)
		Slot.remove_from_Scene(slot)
		scene.component.Traverse(() => {
		}, (slot) => {
			if (slot.name === '原点插槽') {
				scene.context.selectedSlot = slot
			}
		})
		refresh_Tree.call(this)
		refresh_Inspector.call(this)
	} else if (action === 'change_SelectedSlot_Position') {
		scene.context.selectedSlot.position.set(val.x, val.y, val.z)
		scene.component.Update(scene.componentslot.position, scene.componentslot.rotation)
		refresh_Template.call(this)
	} else if (action === 'change_SelectedSlot_Rotation') {
		scene.context.selectedSlot.rotation.set(val.x, val.y, val.z)
		scene.component.Update(scene.componentslot.position, scene.componentslot.rotation)
		refresh_Template.call(this)
	}
	update_Info.call(this)
}

// custom function
export function open_ModelFile(data, args) {
	if (data) {
		hide_Components.call(this)
		let scene = this.$static.Scene
		if (scene.modeleventlistener) {
			FileSystem.ROOT.close(scene.modelpath, scene.modeleventlistener)
			scene.modelpath = ''
			scene.modeleventlistener = undefined
		}
		Module.remove_from_Scene(scene.component)
		scene.component.Traverse(() => {
		}, (s) => {
			Slot.remove_from_Scene(s)
		})
		scene.component = null
		load_Model.call(this, args.path, scene)
		refresh_classification.call(this, args)
		refresh_Inspector.call(this)
		refresh_Tree.call(this)
	}
}

export function clear_ModelFile(data, args) {
	if (data) {
		let scene = this.$static.Scene
		if (scene.modeleventlistener) {
			FileSystem.ROOT.close(scene.modelpath, scene.modeleventlistener)
			scene.modelpath = ''
			scene.modeleventlistener = undefined
		}
		scene.component.Traverse(() => {
		}, (slot) => {
			Slot.remove_from_Scene(slot)
		})
		Module.remove_from_Scene(scene.component)
		scene.component.model.traverse((node) => {
			disposeNode(node)
		})
		scene.component.line.traverse((node) => {
			disposeNode(node)
		})
		scene.component = null
		scene.componentslot.position.set(0, 0, 0)
		scene.componentslot.rotation.set(0, 0, 0)
		hide_Components.call(this)
		reset_Components.call(this)
		refresh_Inspector.call(this)
		refresh_Tree.call(this)
	}
}

function load_Model(path, scene) {
	let vue = this
	let eventlistener = (e) => {
		switch (e.event) {
			case 'pathchange': {
				scene.modelpath = e.path
				refresh_Inspector.call(vue)
				return
			}
			case 'rename': {
				scene.modelpath = e.path
				refresh_Inspector.call(vue)
				return
			}
			case 'delete': {
				scene.modelpath = ''
				// e.file.close(this.eventlistener) //注意on_Delete不需要手动关闭
				scene.modeleventlistener = undefined
				refresh_Inspector.call(vue)
				return
			}
		}
	}
	scene.modeleventlistener = eventlistener
	let filedescripter = FileSystem.ROOT.open(path, eventlistener)
	scene.modelpath = filedescripter.path
	let url = URL.createObjectURL(new Blob([filedescripter.file.data]))
	let base = new Module(null, 0, filedescripter.name, new THREE.Vector3(0, 0, 0), new THREE.Euler(0, 0, 0, 'XYZ'), scene.objectorigin, '', new SlotModifier(), false, '', {}, -1)
	base.load_Mesh(url).then(() => {
		URL.revokeObjectURL(url)
	})
	Module.set_Visible(base)
	base.Traverse(() => {
	}, (s) => {
		s.axishelper.visible = true
	})
	base.Update(scene.componentslot.position, scene.componentslot.rotation)
	scene.component = base
}

function refresh_classification(val) {
	for (var i = 0; i < classificationlist.length; i++) {
		if (val.path.search(classificationlist[i]) !== -1) {
			inspectorUpdate.call(this, 'module_classification', classificationlist[i])
			if (i <= 7) {
				inspectorUpdate.call(this, 'module_mainclassification', '组件')
			} else if (i <= 13) {
				inspectorUpdate.call(this, 'module_mainclassification', '主杆零件')
			} else if (i <= 19) {
				inspectorUpdate.call(this, 'module_mainclassification', '副杆零件')
			} else {
				inspectorUpdate.call(this, 'module_mainclassification', '贴图、模板')
			}
			break
		}
	}
}

function refresh_Inspector() {
	let scene = this.$static.Scene
	let slot = scene.context.selectedSlot
	refresh_Template.call(this)
	if (slot === null) {
		let list = [
			{ type: 'title', title: scene.component === null ? '无模型' : scene.component.name },
			scene.isRemote ? undefined : {
				type: 'filedrop',
				action: 'file',
				title: '组件模型',
				itemvalue: { path: scene.modelpath, accept: ['stl'] }
			}
		]
		if (scene.component !== null) {
			let module = scene.component
			//console.log('module', module)
			const autoAdjust = {
				主杆: { type: 'button', action: 'module_autoAdjust', title: '', itemvalue: { list: ['尝试自动调整'] } },
				副杆: { type: 'button', action: 'module_autoAdjust', title: '', itemvalue: { list: ['尝试自动调整'] } },
				灯臂: { type: 'button', action: 'module_autoAdjust', title: '', itemvalue: { list: ['尝试自动调整'] } },
				横臂: {
					type: 'button', action: 'module_autoAdjust', title: '', itemvalue: { list: ['尝试自动调整-笔直', '尝试自动调整-倾斜', '尝试自动调整-海鸥臂'] }
				},
				搭载设备: { type: 'button', action: 'module_autoAdjust', title: '', itemvalue: { list: ['尝试自动调整'] } },
				连接件: { type: 'button', action: 'module_autoAdjust', title: '', itemvalue: { list: ['尝试自动调整'] } },
				微型杆: { type: 'button', action: 'module_autoAdjust', title: '', itemvalue: { list: ['尝试自动调整'] } },
				杆体: { type: 'button', action: 'module_autoAdjust', title: '', itemvalue: { list: ['尝试自动调整'] } },
				小检修门: { type: 'button', action: 'module_autoAdjust', title: '', itemvalue: { list: ['尝试自动调整'] } },
				大检修门: { type: 'button', action: 'module_autoAdjust', title: '', itemvalue: { list: ['尝试自动调整'] } },
				底部法兰: { type: 'button', action: 'module_autoAdjust', title: '', itemvalue: { list: ['尝试自动调整'] } },
				顶部法兰: { type: 'button', action: 'module_autoAdjust', title: '', itemvalue: { list: ['尝试自动调整'] } },
				侧边法兰: { type: 'button', action: 'module_autoAdjust', title: '', itemvalue: { list: ['尝试自动调整'] } },
				副杆体: { type: 'button', action: 'module_autoAdjust', title: '', itemvalue: { list: ['尝试自动调整'] } },
				副底部法兰: { type: 'button', action: 'module_autoAdjust', title: '', itemvalue: { list: ['尝试自动调整'] } },
				副顶部法兰: { type: 'button', action: 'module_autoAdjust', title: '', itemvalue: { list: ['尝试自动调整'] } },
				普通杆灯头连接件: { type: 'button', action: 'module_autoAdjust', title: '', itemvalue: { list: ['尝试自动调整'] } },
			}
			const addSlot = {
				主杆: {
					type: 'dropdown', action: 'module_add_Slot', title: '', itemvalue: {
						default: false,
						showselected: false,
						list: get_slotlist('主杆'),
						selectitem: '',
						hold: false
					}
				},
				横臂: {
					type: 'dropdown', action: 'module_add_Slot', title: '', itemvalue: {
						default: false,
						showselected: false,
						list: get_slotlist('横臂'),
						selectitem: '',
						hold: false
					}
				},
				副杆: {
					type: 'dropdown', action: 'module_add_Slot', title: '', itemvalue: {
						default: false,
						showselected: false,
						list: get_slotlist('副杆'),
						selectitem: '',
						hold: false
					}
				},
				杆体: {
					type: 'dropdown', action: 'module_add_Slot', title: '', itemvalue: {
						default: false,
						showselected: false,
						list: ['连接件插槽'],
						selectitem: '',
						hold: false
					}
				},
				顶部法兰: {
					type: 'dropdown', action: 'module_add_Slot', title: '', itemvalue: {
						default: false,
						showselected: false,
						list: ['副杆插槽'],
						selectitem: '',
						hold: false
					}
				},
				侧边法兰: {
					type: 'dropdown', action: 'module_add_Slot', title: '', itemvalue: {
						default: false,
						showselected: false,
						list: ['横臂插槽'],
						selectitem: '',
						hold: false
					}
				},
				副杆体: {
					type: 'dropdown', action: 'module_add_Slot', title: '', itemvalue: {
						default: false,
						showselected: false,
						list: ['连接件插槽', '灯臂插槽'],
						selectitem: '',
						hold: false
					}
				},
				连接件: {
					type: 'dropdown', action: 'module_add_Slot', title: '', itemvalue: {
						default: false,
						showselected: false,
						list: ['搭载设备插槽'],
						selectitem: '',
						hold: false
					}
				},
				卡槽: {
					type: 'dropdown', action: 'module_add_Slot', title: '', itemvalue: {
						default: false,
						showselected: false,
						list: ['搭载设备插槽'],
						selectitem: '',
						hold: false
					}
				}
			}
			if (module.classification === "") module.classification = '搭载设备'
			list = list.concat([
				{ type: 'title', title: '分类' },
				{
					type: 'select',
					action: 'module_mainclassification',
					title: '分类',
					itemvalue: {
						list: ['组件', '贴图、模板', '主杆零件', '副杆零件'],
						selectitem: module.mainclassification === undefined ? '组件' : module.mainclassification
					}
				},
				{ type: 'title', title: '类别' },
				{
					type: 'select',
					action: 'module_classification',
					title: '类别',
					itemvalue: {
						list: module.classificationlist === undefined ? ['主杆', '副杆', '横臂', '卡槽', '灯臂', '连接件', '搭载设备', '微型杆'] : module.classificationlist,
						selectitem: module.classification === "" ? '搭载设备' : module.classification
					}
				},
				module.classification === '侧边法兰' ? 				{
					type: 'select',
					action: 'module_subClassification',
					title: '类别',
					itemvalue: {
						list:  ['适配直横臂', '适配斜横臂'],
						selectitem: module.editorworkspace.subClassification
					}
				}: null,

				{ type: 'title', title: '库' },
				{
					type: 'select',
					action: 'module_select',
					title: '库',
					itemvalue: {
						list: ['标准库', '自定义库'],
						selectitem: module.selectLibrary
					}
				},
				module.classification == "横臂" ?
					{ type: 'select', action: 'poleType_select', title: '横臂类型', itemvalue: { list: ['直横臂', '斜横臂'], selectitem: module.editorworkspace.poleType } } : null,
				module.classification == "灯臂" ?
					{ type: 'select', action: 'poleType_select', title: '灯臂灯头数量', itemvalue: { list: ['1', '2'], selectitem: module.editorworkspace.poleType } } : null,
				module.classification == "搭载设备" ?
					{ type: 'lineedit', title: '跨横臂数', action: 'getTransverseArmsType', itemvalue: { value: '', placeholder: '' } } : null,

				{ type: 'title', title: '空间姿态' },
				{
					type: 'vector3',
					action: 'module_position',
					title: '坐标',
					itemvalue: {
						x: module.shiftposition.x,
						y: module.shiftposition.y,
						z: module.shiftposition.z,
						min: -10000,
						max: 10000,
						step: 1,
						unit: '㎜',
						multiplier: Unit
					}
				},
				{
					type: 'euler3',
					action: 'module_rotation',
					title: '旋转',
					itemvalue: {
						x: module.shiftrotation.x,
						y: module.shiftrotation.y,
						z: module.shiftrotation.z,
						min: -10000,
						max: 10000,
						step: 0.01
					}
				},
				addSlot[module.classification] ? { type: 'title', title: '添加插槽' } : undefined,
				addSlot[module.classification],
				autoAdjust[module.classification] ? { type: 'title', title: '自动调整' } : undefined,
				autoAdjust[module.classification],
				{ type: 'title', title: '关联规格' },
				{
					type: 'button',
					action: 'select_Specs',
					title: '选择规格',
					itemvalue: { list: [((!module.property.specsId || module.property.specsId === -1) ? '无' : module.property.specsName)] }
				},
				module.classification == "横臂" ?
					{
						type: 'button',
						action: 'select_TransverseArmSpecs',
						title: '法兰规格',
						itemvalue: { list: [((!module.property.specsId2 || module.property.specsId2 === -1) ? '无' : module.property.specsName2)] }
					} : null
				,
			{ type: 'title', title: '属性' },
				{
					type: 'propertylist', action: 'change_Property', title: '123', itemvalue: {
						allowinput: true,
						list: module.property,
						musthave: []
					}
				}
			])
		}
		this.$EventBus.$emit('inspectorInit', {
			uid: 'display', iuid: 'moduledisplay_build_empty', list: list
		})
	}
	update_Info.call(this)
}

function hide_Components() {
	this.$static.Scene.scene.getObjectByName('mainPoleLine').visible = false
	this.$static.Scene.scene.getObjectByName('vicePoleLine').visible = false
	this.$static.Scene.scene.getObjectByName('armLine').visible = false
	this.$static.Scene.scene.getObjectByName('cameraGunLine').visible = false
	this.$static.Scene.scene.getObjectByName('connecter').visible = false
	this.$static.Scene.scene.getObjectByName('lamp').visible = false
}

function show_Components() {
	let scene = this.$static.Scene.scene
	let component = this.$static.Scene.component
	switch (component.classification) {
		case '横臂':
			scene.getObjectByName('mainPoleLine').visible = true
			scene.getObjectByName('vicePoleLine').visible = true
			break
		case '副杆':
			scene.getObjectByName('mainPoleLine').visible = true
			break
		case '灯臂':
			scene.getObjectByName('mainPoleLine').visible = true
			scene.getObjectByName('vicePoleLine').visible = true
			break
		case '搭载设备': {
			if (component.editorworkspace.instrument_place === '放置于横臂') {
				scene.getObjectByName('mainPoleLine').visible = true
				scene.getObjectByName('vicePoleLine').visible = true
				scene.getObjectByName('armLine').visible = true
			} else {
				scene.getObjectByName('mainPoleLine').visible = true
				scene.getObjectByName('vicePoleLine').visible = true
				scene.getObjectByName('connecter').visible = true
			}
		}
			break
		case '微型杆': {
		}
			break
		case '连接件': {
			scene.getObjectByName('mainPoleLine').visible = true
			scene.getObjectByName('vicePoleLine').visible = true
			scene.getObjectByName('armLine').visible = true
		}
			break
		case '杆体': {
			break
		}
		case '小检修门': {
			scene.getObjectByName('mainPoleLine').visible = true
			break
		}
		case '大检修门': {
			scene.getObjectByName('mainPoleLine').visible = true
			break
		}
		case '底部法兰': {
			scene.getObjectByName('mainPoleLine').visible = true
			break
		}
		case '顶部法兰': {
			scene.getObjectByName('mainPoleLine').visible = true
			scene.getObjectByName('vicePoleLine').visible = true
			break
		}
		case '侧边法兰': {
			scene.getObjectByName('mainPoleLine').visible = true
			scene.getObjectByName('armLine').visible = true
			break
		}
		case '副杆体': {
			scene.getObjectByName('mainPoleLine').visible = true
			break
		}
		case '副小检修门': {
			scene.getObjectByName('mainPoleLine').visible = true
			scene.getObjectByName('vicePoleLine').visible = true
			break
		}
		case '副大检修门': {
			scene.getObjectByName('mainPoleLine').visible = true
			scene.getObjectByName('vicePoleLine').visible = true
			break
		}
		case '副底部法兰': {
			scene.getObjectByName('mainPoleLine').visible = true
			scene.getObjectByName('vicePoleLine').visible = true
			break
		}
		case '副顶部法兰': {
			scene.getObjectByName('mainPoleLine').visible = true
			scene.getObjectByName('vicePoleLine').visible = true
			break
		}
		case '副侧边法兰': {
			scene.getObjectByName('mainPoleLine').visible = true
			scene.getObjectByName('vicePoleLine').visible = true
			break
		}
	}
}

function reset_Components() {
	let mainPoleLine = this.$static.Scene.scene.getObjectByName('mainPoleLine')
	let vicePoleLine = this.$static.Scene.scene.getObjectByName('vicePoleLine')
	let armLine = this.$static.Scene.scene.getObjectByName('armLine')
	let cameraGunLine = this.$static.Scene.scene.getObjectByName('cameraGunLine')
	let connecter = this.$static.Scene.scene.getObjectByName('connecter')
	let lamp = this.$static.Scene.scene.getObjectByName('lamp')
	mainPoleLine.position.set(0, 33.35, 0)
	mainPoleLine.rotation.set(0, -Math.PI / 2, 0)
	vicePoleLine.position.set(0, 83.55, 0)
	vicePoleLine.rotation.set(0, 0, 0)
	armLine.position.set(27.6, 63.15, 0)
	armLine.rotation.set(0, Math.PI / 2, 0)
	cameraGunLine.position.set(0, 83.55, 0)
	cameraGunLine.rotation.set(0, 0, 0)
	connecter.position.set(7.5, 50, 0)
	connecter.rotation.set(0, Math.PI / 2, 0)
	lamp.position.set(0, 100, 0)
	lamp.rotation.set(0, 0, 0)
}

function refresh_Template() {
	let scene = this.$static.Scene.scene
	let component = this.$static.Scene.component
	let slot = this.$static.Scene.context.selectedSlot
	let componentslot = this.$static.Scene.componentslot
	hide_Components.call(this)
	reset_Components.call(this)
	if (component === null) return
	show_Components.call(this)
	if (slot === null) {
		return
	} else if (slot.name === '原点插槽') {
		this.$EventBus.$emit('inspectorInit', {
			uid: 'display',
			iuid: 'moduledisplay_build_empty',
			list: [{ type: 'title', title: slot.name + ' ' + slot.uid }, {
				type: 'text',
				title: '无法编辑'
			}]
		})
	} else {
		let name = slot.name
		const CnMap = {
			'灯臂插槽': {
				name: 'lamp',
				position: new THREE.Vector3(13.612, 3.75, 0),
				rotation: new THREE.Euler(0, 1.5707963267948966, 0, 'XYZ'),
				calculate: (box) => new THREE.Vector3(0, box.max.y * 2 / 3, 0)
			},
			'连接件插槽': {
				name: 'connecter',
				position: new THREE.Vector3(7.5, 0, 0),
				rotation: new THREE.Euler(0, 1.5707963267948966, 0, 'XYZ'),
				calculate: (box) => new THREE.Vector3(0, box.max.y * 2 / 3, 0)
			},
			'搭载设备插槽': {
				name: 'cameraGunLine',
				position: new THREE.Vector3(0.4, 0.9, 0),
				rotation: new THREE.Euler(0, 4.71238898038469, 0, 'XYZ'),
				calculate: (box) => new THREE.Vector3(0, 0, -box.max.z)
			},
			'横臂插槽': {
				name: 'armLine',
				position: new THREE.Vector3(0, 26.12, -0.45),
				rotation: new THREE.Euler(4.695110220789947, 0, 0, 'XYZ'),
				calculate: (box) => new THREE.Vector3(0, 0, 0)
			},
			'副杆插槽': {
				name: 'vicePoleLine',
				position: new THREE.Vector3(0, 18.05, 0),
				rotation: new THREE.Euler(0, 0, 0, 'XYZ'),
				calculate: (box) => new THREE.Vector3(0, 0, 0)
			}
		}
		let pos = (new THREE.Vector3()).copy(component.shiftposition)
		let rot = (new THREE.Euler()).copy(component.shiftrotation)
		component.shiftposition.set(0, 0, 0)
		component.shiftrotation.set(0, 0, 0)
		component.Update()
		let box = new THREE.Box3()
		box.setFromObject(component.model)
		component.shiftposition.copy(pos)
		component.shiftrotation.copy(rot)
		component.Update(componentslot.position, componentslot.rotation)
		let object = scene.getObjectByName(CnMap[name].name)
		let [p, r, ,] = get_TransfromPosRot(slot.world_position, slot.world_rotation, CnMap[name].position, CnMap[name].rotation, new SM_Free(CnMap[name].calculate(box), new THREE.Euler()))
		object.visible = true
		object.position.copy(p)
		object.rotation.copy(r)
		this.$EventBus.$emit('inspectorInit', {
			uid: 'display',
			iuid: 'importdisplay_select_Slot',
			list: [
				{ type: 'title', title: slot.name + ' ' + slot.uid },
				{ type: 'button', action: 'delete_Slot', title: '删除插槽', itemvalue: { list: ['删除' + slot.name + ' ' + slot.uid] } },
				{ type: 'title', title: '空间姿态' },
				{
					type: 'vector3',
					title: '坐标',
					action: 'change_SelectedSlot_Position',
					itemvalue: {
						x: slot.position.x,
						y: slot.position.y,
						z: slot.position.z,
						min: -100000,
						max: 100000,
						step: 1,
						unit: '㎜',
						multiplier: Unit
					}
				},
				{
					type: 'euler3',
					title: '旋转',
					action: 'change_SelectedSlot_Rotation',
					itemvalue: { x: slot.rotation.x, y: slot.rotation.y, z: slot.rotation.z, min: -10000, max: 10000, step: 0.01 }
				}]
		})
	}
}

function refresh_Tree() {
	let scene = this.$static.Scene
	let component = scene.component
	if (component === null) {
		this.$EventBus.$emit('display_TreeData_changed', [], [])
		this.$emit('moduleSelect', -1, -1, -1)
	} else {
		let tree = [{ Type: 'Module', Name: component.name, UID: component.uid, Layer: 0, tags: [] }]

		function get_all_slot(slot, layer) {
			tree.push({ Type: 'Slot', Name: slot.name, UID: slot.uid, Layer: 1, tags: [] })
		}

		component.Traverse(() => {
		}, get_all_slot)
		this.$EventBus.$emit('display_TreeData_changed', [], tree)
		if (scene.context.selectedSlot === null) {
			this.$emit('moduleSelect', component.name, component.uid, -1)
		} else {
			this.$emit('moduleSelect', scene.context.selectedSlot.name, scene.context.selectedSlot.uid, -1)
		}
	}
}

function set_mainPole_Position(scene) {
	scene.component.shiftposition.set(0, 0, 0)
	scene.component.shiftrotation.set(0, 0, 0)
	scene.component.Update()
	let box = new THREE.Box3()
	box.setFromObject(scene.component.model)
	scene.component.shiftposition.y = box.max.y
}

function set_armPole_Position(scene, val) {
	scene.component.shiftposition.set(0, 0, 0)
	scene.component.shiftrotation.set(0, 0, 0)
	scene.component.Update()
	let box = new THREE.Box3()
	box.setFromObject(scene.component.model)
	if (val === '尝试自动调整-笔直') {
		scene.component.shiftposition.y = box.max.z
		scene.component.shiftrotation.x = 1.5 * Math.PI
	} else if (val === '尝试自动调整-倾斜') {
		const angle = (1.5 - 1.4945) * Math.PI
		let len = box.max.z - box.max.x * Math.tan(angle)
		let y = box.max.z - len * Math.cos(angle)
		let x = len * Math.sin(angle)
		scene.component.shiftposition.y = box.max.z - y
		scene.component.shiftposition.z = -x
		scene.component.shiftrotation.x = 1.4945 * Math.PI
	} else {
		scene.component.shiftrotation.z = 0.5 * Math.PI
		scene.component.shiftrotation.y = -0.5 * Math.PI
		// scene.component.shiftposition.x = box.max.x
		scene.component.shiftposition.y = box.max.x
		scene.component.shiftposition.z = -box.max.y

	}
}

function set_lampArm_Position(scene, straight = true) {
	scene.component.shiftposition.set(0, 0, 0)
	scene.component.shiftrotation.set(0, 0, 0)
	scene.component.Update()
	let box = new THREE.Box3()
	box.setFromObject(scene.component.model)
	scene.component.shiftposition.x = box.max.z - 3.7
	scene.component.shiftposition.y = box.max.y
	scene.component.shiftrotation.y = 0.5 * Math.PI
}

function set_instrument_Position(scene, straight = true) {
	if (straight) {
		//console.log('横臂上')
		scene.componentslot.position.set(18.16, 64.00, 0)
		scene.componentslot.rotation.set(0, Math.PI / 2 * 3, 0)
		scene.component.get_Slot_by_Name('原点插槽').axishelper.visible = true
		scene.component.Update()
	} else {
		//console.log('连接件上')
		let connecter = scene.scene.getObjectByName('connecter')
		connecter.position.set(7.5, 50, 0)
		connecter.rotation.set(0, Math.PI / 2, 0)
		connecter.visible = true
		scene.componentslot.position.set(16.16, 50.2, 0)
		scene.componentslot.rotation.set(0, Math.PI / 2 * 3, 0)
		scene.component.get_Slot_by_Name('原点插槽').axishelper.visible = true
		scene.component.Update()
	}
}

function set_microPole_Position(scene, straight = true) {
	scene.component.shiftposition.set(0, 0, 0)
	scene.component.shiftrotation.set(0, 0, 0)
	scene.component.Update()
	let box = new THREE.Box3()
	box.setFromObject(scene.component.model)
	scene.component.shiftposition.y = box.max.y
}

function set_polebody_Position(scene) {
	scene.component.shiftposition.set(0, 0, 0)
	scene.component.shiftrotation.set(0, 0, 0)
	scene.component.Update()
	let box = new THREE.Box3()
	box.setFromObject(scene.component.model)
	scene.component.shiftposition.y = box.max.y
}

function set_small_door_Position(scene) {
	scene.component.shiftposition.set(0, 0, 0)
	scene.component.shiftrotation.set(0, 0, 0)
	scene.component.Update()
	let box = new THREE.Box3()
	box.setFromObject(scene.component.model)
	scene.component.shiftposition.y = box.max.y
	scene.component.shiftrotation.y = Math.PI / 2
}

function set_big_door_Position(scene) {
	scene.component.shiftposition.set(0, 0, 0)
	scene.component.shiftrotation.set(0, 0, 0)
	scene.component.Update()
	let box = new THREE.Box3()
	box.setFromObject(scene.component.model)
	scene.component.shiftposition.y = box.max.y
	scene.component.shiftrotation.y = Math.PI / 2
}

function set_bottomflan_Position(scene) {
	scene.component.shiftposition.set(0, 0, 0)
	scene.component.shiftrotation.set(0, 0, 0)
	scene.component.Update()
	let box = new THREE.Box3()
	box.setFromObject(scene.component.model)
	scene.component.shiftposition.y = box.max.y
}

function set_topflan_Position(scene) {
	scene.component.shiftposition.set(0, 0, 0)
	scene.component.shiftrotation.set(0, 0, 0)
	scene.component.Update()
	let box = new THREE.Box3()
	box.setFromObject(scene.component.model)
	scene.component.shiftposition.y = box.max.y
	scene.component.shiftrotation.y = -0.5 * Math.PI
}

function set_sideflan_Position(scene) {
	scene.component.shiftposition.set(0, 0, 0)
	scene.component.shiftrotation.set(0, 0, 0)
	scene.component.Update()
	let box = new THREE.Box3()
	box.setFromObject(scene.component.model)
	scene.component.shiftposition.y = box.max.y
	// scene.component.shiftrotation.y = -Math.PI / 2
}

function set_vicePole_Position(scene) {
	scene.component.shiftposition.set(0, 0, 0)
	scene.component.shiftrotation.set(0, 0, 0)
	scene.component.Update()
	let box = new THREE.Box3()
	box.setFromObject(scene.component.model)
	scene.component.shiftposition.y = box.max.y
}

function set_Vice_Polebody_Position(scene) {
	scene.component.shiftposition.set(0, 0, 0)
	scene.component.shiftrotation.set(0, 0, 0)
	scene.component.Update()
	let box = new THREE.Box3()
	box.setFromObject(scene.component.model)
	scene.component.shiftposition.y = box.max.y
}

function set_Vice_Small_Door_Position(scene) {
	scene.component.shiftposition.set(0, 0, 0)
	scene.component.shiftrotation.set(0, 0, 0)
	scene.component.Update()
	let box = new THREE.Box3()
	box.setFromObject(scene.component.model)
	scene.component.shiftposition.y = box.max.y
	scene.component.shiftrotation.y = Math.PI / 2

}

function set_Vice_Big_Door_Position(scene) {
	scene.component.shiftposition.set(0, 0, 0)
	scene.component.shiftrotation.set(0, 0, 0)
	scene.component.Update()
	let box = new THREE.Box3()
	box.setFromObject(scene.component.model)
	scene.component.shiftposition.y = box.max.y
	scene.component.shiftrotation.y = -Math.PI / 2
}

function set_Vice_Bottomflan_Position(scene) {
	scene.component.shiftposition.set(0, 0, 0)
	scene.component.shiftrotation.set(0, 0, 0)
	scene.component.Update()
	let box = new THREE.Box3()
	box.setFromObject(scene.component.model)
	scene.component.shiftposition.y = box.max.y
	scene.component.shiftrotation.y = -Math.PI / 2
}

function set_Vice_Topflan_Position(scene) {
	scene.component.shiftposition.set(0, 0, 0)
	scene.component.shiftrotation.set(0, 0, 0)
	scene.component.Update()
	let box = new THREE.Box3()
	box.setFromObject(scene.component.model)
	scene.component.shiftposition.y = box.max.y
	scene.component.shiftrotation.y = -Math.PI / 2
}

function set_Vice_Sideflan_Position(scene) {
	scene.component.shiftposition.set(0, 0, 0)
	scene.component.shiftrotation.set(0, 0, 0)
	scene.component.Update()
	let box = new THREE.Box3()
	box.setFromObject(scene.component.model)
	scene.component.shiftposition.y = box.max.y
	// scene.component.shiftrotation.y = -Math.PI / 2
}

function set_connection_Position(scene) {
	scene.component.shiftposition.set(0, 0, 0)
	scene.component.shiftrotation.set(0, 0, 0)
	scene.component.Update()
	let box = new THREE.Box3()
	box.setFromObject(scene.component.model)
	scene.component.shiftposition.z = box.max.z
}

function error(slotlist) {
	let scene = this.$static.Scene
	let reactive = scene.reactive
	scene.component.Traverse(() => {
	}, (slot) => {
		for (var i = 0; i < slotlist.length; i++) {
			if (slot.name === slotlist[i]) {
				slotlist.splice(i, 1)
			}
		}
	})
	let error = []
	for (var i = 0; i < slotlist.length; i++) {
		error.push('需要含有' + slotlist[i])
	}
	reactive.error = error.join('</br>')
}

function get_slotlist(classification) {
	let slotlist = []
	switch (classification) {
		case '主杆':
			slotlist = ['横臂插槽', '副杆插槽', '连接件插槽']
			break
		case '横臂':
			slotlist = ['搭载设备插槽']
			break
		case '副杆':
			slotlist = ['灯臂插槽', '连接件插槽']
			break
		case '顶部法兰':
			slotlist = ['副杆插槽']
		case '杆体':
			slotlist = ['连接件插槽']
		case '副杆体':
			slotlist = ['灯臂插槽', '连接件插槽']
		case '侧边法兰':
			slotlist = ['横臂插槽']
			break
	}
	return slotlist
}

function update_Info() {
	let scene = this.$static.Scene
	let reactive = scene.reactive
	// let slot = scene.context.selectedSlot
	let component = scene.component
	if (component === null) {
		reactive.error = '无组件模型'
		reactive.info = ''
	} else {
		reactive.error = ''
		reactive.info = ''
		let slotlist = get_slotlist(component.classification)
		switch (component.classification) {
			case '主杆': {
				reactive.info = '请注意' + HTML.create_List(['主杆对应坐标轴方向'])
				error.call(this, slotlist)
			}
				break
			case '横臂': {
				reactive.info = '请注意' + HTML.create_List(['横臂是否含有仰角'])
				error.call(this, slotlist)
			}
				break
			case '灯臂': {
				reactive.info = '请注意' + HTML.create_List(['灯臂的孔径是否与杆径对应'])
			}
				break
			case '副杆': {
				reactive.info = '请注意' + HTML.create_List(['副杆能否和主杆接合'])
				error.call(this, slotlist)
			}
				break
			case '搭载设备': {
				reactive.info = '请注意' + HTML.create_List(['搭载设备对应位置', '名为搭载设备的文件夹内组件可自动识别'])
			}
				break
			case '微型杆': {
				reactive.info = '请注意' + HTML.create_List([''])
			}
				break
			case '连接件': {
				reactive.info = '请注意' + HTML.create_List(['注意连接件朝向'])
			}
				break
		}
	}
}

export function select_Specs(data) {
	this.$static.Scene.component.property.specsId = data.specsId
	this.$static.Scene.component.property.specsName = data.specsName
	refresh_Inspector.call(this)
}

export function select_Specs2(data) {
	this.$static.Scene.component.property.specsId2 = data.specsId
	this.$static.Scene.component.property.specsName2 = data.specsName
	refresh_Inspector.call(this)
}

// Upload
export function upload() {
	debugger
	console.log(this)
	if (this.$static.Scene.isRemote) {
		uploadName(this, this.$static.Scene.component.url, this.$static.Scene.component.componentid)
	} else {
		uploadFile(this)
	}
}

function uploadFile(that) {
	let file = FileSystem.ROOT.get(that.$static.Scene.modelpath)
	let blob = null
	if (file === null) {
		return
	} else {
		blob = new Blob([file.data])
	}
	let updateStl = new FormData()
	updateStl.append('file', blob)
	updateStl.append('fileMd5', that.$md5(blob.toString()))
	updateStl.append('fileName', 'scene.stl')
	updateStl.append('fileSize', blob.size)
	updateStl.append('blockNo', 0)
	updateStl.append('blockTotalNo', 1)
	updateStl.append('blockSize', 3145728)
	updateStl.append('noGroupPath', null)
	uploadFileBlock(updateStl).then(response => {
		debugger
		//console.log('post', response)
		uploadName(that, response.returns.groupPath)
		// customLog(this, 'log', 'upload', '编辑器 提示', HTML.create_KeyPair('操作', '上传模型文件', 'String') + ' 完成')
	})
}

function getStandardType(that){
	// 大小检修门该字段一律为0
	if(that.$static.Scene.component.classification === '大检修门' || that.$static.Scene.component.classification === '小检修门'){
		return 0
	}
	return that.$static.Scene.component.selectLibrary == '标准库' ? 0 : 1
}

function uploadName(that, url, id = null) {
	let jsonExport = {}
	let rawMaterial
	//console.log(that)
	let updateJson = {
		type: null,
		fileName: that.$static.Scene.component.name,
		fileUrl: url,
		specsId: that.$static.Scene.component.property.specsId,
		desc: 'desc',
		picUrl: '1.stl',
		standardType: getStandardType(that),
	}
	if (that.$static.Scene.component.mainclassification === '主杆零件') {
		updateJson.belongPartType = 0
	}
	if (that.$static.Scene.component.mainclassification === '副杆零件') {
		updateJson.belongPartType = 1
	}
	if (id !== null) {
		updateJson.id = id
	}
	switch (that.$static.Scene.component.classification) {
		case '杆体':
		case '副杆体':
			updateJson.type = 1
			rawMaterial = 1
			if (id !== null) {
				updateJson.id = id
			}
			addOrUpdateDisassemblyRawMaterial(that, updateJson, rawMaterial)
			break
		case '卡槽':
			updateJson.type = 3
			rawMaterial = 0
			updateJson.connRuleFlag = 0
			updateJson.poleType = 0
			updateJson.physicalSize = 6500
			if (id !== null) {
				updateJson.id = id
			}
			uploadComponent(that, updateJson, rawMaterial)
			break
		case '侧边法兰':
		case '副侧边法兰':
			updateJson.type = 2
			rawMaterial = 1
			if (id !== null) {
				updateJson.id = id
			}
			addOrUpdateDisassemblyRawMaterial(that, updateJson, rawMaterial)
			break
		case '底部法兰':
		case '副底部法兰':
			updateJson.type = 3
			rawMaterial = 1
			if (id !== null) {
				updateJson.id = id
			}
			addOrUpdateDisassemblyRawMaterial(that, updateJson, rawMaterial)
			break
		case '顶部法兰':
			updateJson.type = 4
			updateJson.belongPartType = 0
			rawMaterial = 1
			if (id !== null) {
				updateJson.id = id
			}
			addOrUpdateDisassemblyRawMaterial(that, updateJson, rawMaterial)
			break
		case '副顶部法兰':
			updateJson.type = 4
			rawMaterial = 1
			if (id !== null) {
				updateJson.id = id
			}
			addOrUpdateDisassemblyRawMaterial(that, updateJson, rawMaterial)
			break
		case '小检修门':
		case '副小检修门':
			updateJson.type = 5
			rawMaterial = 1
			updateJson.specsId = -1
			if (id !== null) {
				updateJson.id = id
			}
			addOrUpdateDisassemblyRawMaterial(that, updateJson, rawMaterial)
			break
		case '普通杆灯头连接件':
			updateJson.type = 5
			rawMaterial = 1
			if (id !== null) {
				updateJson.id = id
			}
			addOrUpdateDisassemblyRawMaterial(that, updateJson, rawMaterial)
			break
		case '大检修门':
		case '副大检修门':
			updateJson.type = 6
			rawMaterial = 1
			updateJson.specsId = -1
			if (id !== null) {
				updateJson.id = id
			}
			addOrUpdateDisassemblyRawMaterial(that, updateJson, rawMaterial)
			break
		case '主杆':
			updateJson.type = 0
			rawMaterial = 0
			updateJson.poleType = 1
			updateJson.physicalSize = 6500
			if (id !== null) {
				updateJson.componentId = id
			}
			uploadComponent(that, updateJson, rawMaterial)
			break
		case '副杆':
			updateJson.type = 1
			rawMaterial = 0
			updateJson.physicalSize = 6500
			if (id !== null) {
				updateJson.componentId = id
			}
			uploadComponent(that, updateJson, rawMaterial)
			break
		case '横臂':
			updateJson.type = 2
			rawMaterial = 0
			updateJson.physicalSize = 6500
			const LIBRARY2 = {
				'标准库': 0,
				'自定义库': 1
			}
			updateJson.poleType = LIBRARY2[that.$static.Scene.component.editorworkspace.poleType]
			const LIBRARY = {
				'标准库': 0,
				'自定义库': 1
			}
			updateJson.standardType = LIBRARY[that.$static.Scene.component.selectLibrary]
			updateJson.disassemblyTransverseArmList = [{
				disassemblyRawMaterialId: that.$static.Scene.component.property.specsId2,
				disassemblyType: 3
			}]
			if (id !== null) {
				updateJson.componentId = id
			}
			uploadComponent(that, updateJson, rawMaterial)
			break
		case '灯臂':
			updateJson.type = 4
			rawMaterial = 0
			updateJson.physicalSize = 6500
			updateJson.poleType = that.$static.Scene.component.editorworkspace.poleType
			if (id !== null) {
				updateJson.componentId = id
			}
			uploadComponent(that, updateJson, rawMaterial)
			break
		case '搭载设备':
			updateJson.type = 6
			rawMaterial = 0
			updateJson.physicalSize = 6500
			if (id !== null) {
				updateJson.componentId = id
			}
			if (that.$static.Scene.component.property.crossMultiTransverseArmsType !== null && that.$static.Scene.component.property.crossMultiTransverseArmsType !== undefined) {
				updateJson.crossMultiTransverseArmsType = that.$static.Scene.component.property.crossMultiTransverseArmsType
			}
			uploadComponent(that, updateJson, rawMaterial)
			break
		case '连接件':
			updateJson.type = 5
			rawMaterial = 0
			updateJson.physicalSize = 6500
			updateJson.connRuleFlag = 0;
			uploadComponent(that, updateJson, rawMaterial)
	}
}

function deleteUploadFile(that, groupPath) {
	let param = {
		groupPath : groupPath,
		operationChannel : 22
	}
	deleteFile(param).then(response=> {
		//console.log('response', response)
	})
}

function uploadComponent(that, uploadJson, rawMaterial) {
	uploadJson.disassemblyPrimaryPoleList = []
	uploadJson.crossMultiTransverseArmsType = that.$static.Scene.component.editorworkspace.TransverseArmsType != undefined ? that.$static.Scene.component.editorworkspace.TransverseArmsType : null

	if(uploadJson.id != null){
		let Json = {}
		Json = getJson(that, JSON.parse(JSON.stringify(that.$static.Scene.component.get_JSONObject(), null, 2)), rawMaterial)
		editDecoratedComponent(that, Json)
	}

	saveComponent(uploadJson).then(response => {
		//console.log(response)
		if (response.respCode == 0) {
			for (var key in response.returns) {
				alert('上传成功,id为 ' + key) //获取key值
				that.$static.Scene.component.componentid = key
			}
			let Json = {}
			Json = getJson(that, JSON.parse(JSON.stringify(that.$static.Scene.component.get_JSONObject(), null, 2)), rawMaterial)
			customLog(this, 'log', 'upload', '编辑器 提示', HTML.create_KeyPair('操作', '保存模型信息', 'String') + ' 完成')
			editDecoratedComponent(that, Json)
		} else {
			deleteUploadFile(that, uploadJson.fileUrl)
			alert(response.respMsg)
			customLog(that, "error", "upload", "保存模型信息 错误", "在 <保存模型> 出现了如下错误: <br>" + HTML.create_KeyPair('错误', response.respMsg, "String"))
		}
	})
}

function getJson(that, json, rawMaterialFlag) {
	//console.log('*********', json)
	let jsonExport = {}
	jsonExport.moduleId = that.$static.Scene.component.componentid
	jsonExport.modulePosition = json.moduleposition
	jsonExport.moduleRotation = json.modulerotation
	jsonExport.rawMaterialFlag = rawMaterialFlag
	let jsonInterface = []
	for (let i = 0; i < json.slots.length; i++) {
		let temp = {}
		switch (json.slots[i].slotname) {
			case '副杆插槽':
				temp.interfaceType = 1
				break
			case '横臂插槽':
				temp.interfaceType = 2
				break
			case '搭载设备插槽':
				temp.interfaceType = 6
				break
			case '装载设施插槽':
				temp.interfaceType = 6
				break
			case '装载设备插槽':
				temp.interfaceType = 6
				break
			case '搭载设施插槽':
				temp.interfaceType = 6
				break
			case '灯臂插槽':
				temp.interfaceType = 4
				break
			case '连接件插槽':
				temp.interfaceType = 5
				break
		}

		// temp.interfaceType = json.slots[i].slotid
		temp.interfaceName = json.slots[i].slotname
		temp.interfacePosition = []
		temp.interfacePosition.push(json.slots[i].slotposition[0])
		temp.interfacePosition.push(json.slots[i].slotposition[1])
		temp.interfacePosition.push(json.slots[i].slotposition[2])
		temp.interfaceRotation = []
		temp.interfaceRotation.push(json.slots[i].slotrotation[0])
		temp.interfaceRotation.push(json.slots[i].slotrotation[1])
		temp.interfaceRotation.push(json.slots[i].slotrotation[2])
		// temp.angleMin = json.slots[i].property.angleMin
		// temp.angleMax = json.slots[i].property.angleMax
		// temp.heightMin = json.slots[i].property.yMin
		// temp.heightMax = json.slots[i].property.yMax
		temp.rules = []
		jsonInterface.push(temp)
	}
	jsonExport.interfaces = jsonInterface
	return jsonExport
}

function addOrUpdateDisassemblyRawMaterial(that, uploadJson, rawMaterial) {
	console.log(uploadJson)

	aOrUDisassemblyRawMaterial(uploadJson).then(response => {
		//console.log(response)
		let newId = 0
		if (response.respCode == 0) {
			for (var key in response.returns) {
				alert('上传成功,id为 ' + key) //获取key值
				that.$static.Scene.component.componentid = key
			}
			customLog(this, 'log', 'upload', '编辑器 提示', HTML.create_KeyPair('操作', '保存模型', 'String') + ' 完成')
			let Json = {}
			Json = getJson(that, JSON.parse(JSON.stringify(that.$static.Scene.component.get_JSONObject(), null, 2)), rawMaterial)
			editDecoratedComponent(that, Json)
		} else {
			deleteUploadFile(that, uploadJson.fileUrl)
			alert(response.respMsg)
			customLog(that, "error", "upload", "上传规格信息 错误", "在 <保存模型> 出现了如下错误: <br>" + HTML.create_KeyPair('错误', response.respMsg, "String"))
		}
	}).catch(error => {
		//debugger
		deleteUploadFile(that, uploadJson.fileUrl)
		alert(error.res.respMsg)
		customLog(that, "error", "upload", "上传规格信息 错误", "在 <保存模型> 出现了如下错误: <br>" + HTML.create_KeyPair('错误', error.res.respMsg, "String"))
	})
}

function editDecoratedComponent(that, uploadJson) {
	console.log('---------', uploadJson)

	editDecoComponent(uploadJson).then(res => {
		//console.log(res)
		if (res.respCode == 0) {
			alert('上传成功')
			customLog(this, 'log', 'upload', '编辑器 提示', HTML.create_KeyPair('操作', '上传姿态信息', 'String') + ' 完成')
		} else {
			alert(res.data.respMsg)
			customLog(that, "error", "upload", "上传姿态信息 错误", "在 <上传姿态信息> 出现了如下错误: <br>" + HTML.create_KeyPair('错误', res.data.respMsg, "String"))
		}
	})
}

// WEBPACK FOOTER //
// src/components/Editor/Editor_Component.js
