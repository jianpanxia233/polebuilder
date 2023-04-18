import * as TOOL from '../Sun/ToolManager.js'
import * as THREE from "three";
import { get_Tools, get_FlowGraph } from '../Tools.js'
import * as FileSystem from '../Sun/FileSystem.js'
import { customLog, HTML, radius_to_degree, degree_to_radius, to_PoleAngle, get_NearPoleAngle, get_AngleBetween, to_BinarySTL } from '../Utils.js'
import { Slot, Module, SlotModifier, SM_Free, create_Module_from_Json, create_Tree_from_PoleJson, Unit, get_UniqueID, ModulePlugin, MP_Model, MP_CustomScript, disposeHierarchy, disposeNod, create_Component_from_Json, export_to_STL } from '../Sun/ModuleSlot.js';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js'
import CryptoJS from 'crypto-js'
import { Color, Object3D } from 'three';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';
let pdfMake = require('pdfmake/build/pdfmake.js')
let pdfFonts = require('../ThreeUtils/vfs_fonts.js')
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import { saveAs } from 'file-saver';
import {getPartsByPoleCode} from '@/api/ThreeDimExhibition'
import {searchLogs} from '@/api/Snapshot'
import {calcPolePartLoad, createPoleTmpl, assembleComponts} from "@/api/Components";

let uniqueID = 0

let data = [{
	"moduleid": 0,
	"modulename": "主箱体",
	"classification": null,
	"url": "static/model/forBox/mainBox.stl",
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
		"url": "static/model/forBox/boxCover.stl",
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
		"url": "static/model/forBox/frontDoor.stl",
		"moduleposition": [2.86, 4.96, 0], "modulerotation": [0, 0, 1.5707963267948966],
		"maxLoad": null, "propertyInfo": null,
		"interfaces": []
	},
	{
		"moduleid": 3,
		"modulename": "仓位分隔板",
		"classification": null,
		"url": "static/model/forBox/warehouseSplit.STL",
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
		"url": "static/model/forBox/backDoor.stl",
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
		"url": "static/model/forBox/sideDoor.stl",
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
	// //console.log(FONT)
})

let selectLibrary = "标准库";
export let ToolManager = null

export function init_Editor() {
	ToolManager = new TOOL.ToolManager((type, title, info) => {
		this.$EventBus.$emit('console_add_Output', type, '工具流程', info)
	}, (info) => {
		customLog(null, 'info', 'Pole ToolManager', '结束!!!', '')
	})
	// ToolManager.equip_Tools(get_MicroTools(this))
	//console.log(">>> Pole Editor Init")
}

// Scene
function create_Scene(name) {
	// scene
	let scene = new THREE.Scene()
	// grid
	let grid = new THREE.GridHelper(100, 20, '#000000')
	grid.name = "GroundGrid"
	scene.add(grid)
	// origin
	let objectorigin = new THREE.Object3D()
	let lineorigin = new THREE.Object3D()
	scene.add(objectorigin)
	scene.add(lineorigin)
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
	// let directLightHelper = new THREE.DirectionalLightHelper(directLight, 5, '#fffbfd')
	// directLightHelper.visible = false
	// scene.add(directLightHelper)
	scene.add(directLight)

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
// 箱体
	let jsonParam = {ComponentID: 0, Sub: null}
	let boxModule = create_Tree_from_JSON.call(this, baseslot, objectorigin, 0.01, jsonParam)
	baseslot.connect(boxModule)
	let top = create_Tree_from_JSON.call(this, baseslot, objectorigin, 0.01, { ComponentID: 1, Sub: null })

	let topSlot = boxModule.get_Slot_by_Name("箱顶盖插槽")
	topSlot.connect(top)
	let frontDoorModule = create_Tree_from_JSON.call(this, baseslot, objectorigin, 0.01, { ComponentID: 2, Sub: null })
	boxModule.get_Slot_by_Name("前门插槽").connect(frontDoorModule)
	let backDoorModule = create_Tree_from_JSON.call(this, baseslot, objectorigin, 0.01, { ComponentID: 4, Sub: null })
	boxModule.get_Slot_by_Name("后门插槽").connect(backDoorModule)
	let sideDoorModule = create_Tree_from_JSON.call(this, baseslot, objectorigin, 0.01, { ComponentID: 5, Sub: null })
	boxModule.get_Slot_by_Name("侧门插槽").connect(sideDoorModule)

	let insertObj = new Module(-10, -10, "InsertObj", new THREE.Vector3(0, 0, 0), new THREE.Euler(-Math.PI / 2, 0, 0, "XYZ"), scene, "", new SlotModifier())
	let insertObjSlot = new Slot(-10, "InsertObjSlot", new THREE.Vector3(0, 0, 0), new THREE.Euler(0, 0, 0, "XYZ"), scene)
	insertObj.add_Slot(insertObjSlot)
	insertObjSlot.helper.visible = false
	// base.Update(new THREE.Vector3(0, 0, 0), new THREE.Euler(0, 0, 0, "XYZ"), new THREE.Vector3(0, 0, 0))

	// raycast plane
	let RaycastPlane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1, 1, 1), new THREE.MeshStandardMaterial({
		color: '#ff0000',
		metalness: 1,
		roughness: 0.6
	}))
	RaycastPlane.name = "RaycastPlane"
	RaycastPlane.visible = false
	scene.add(RaycastPlane)

	let transformControl = new TransformControls(camera, document.getElementById('Canvas-Show-Canvas'))
	let transformorigin = new Object3D()
	let transformobject = new Object3D()
	transformorigin.add(transformobject)
	transformorigin.rotation.set(0, Math.PI / 2, 0)
	// transformControl.attach(transformobject)
	transformControl.setSpace('local')
	transformControl.setSize(0.6)
	transformobject.position.set(100000, 100000, 100000)
	transformControl.attach(transformobject)
	scene.add(transformControl)
	scene.add(transformorigin)
	let that = this;
	transformControl.visible = false;
	transformControl.enabled = false;
	transformControl.addEventListener('dragging-changed', function (event) {
		if (!event.value) {
			refresh_build_selectedModule_inspector.call(that, that.$static.Scene.context.selectedModule)
		}
		let orbit = that.$static.OrbitControl;
		orbit.enabled = !event.value;
	});
	transformControl.addEventListener('objectChange', function (event) {
		// //console.log(event)
		if (that.$static.Scene.transform.hover && that.$static.Scene.context.selectedModule !== null) {
			that.$static.Scene.context.selectedModule.slotmodifier.position.copy(that.$static.Scene.transform.object.position)
			that.$static.Scene.context.selectedModule.slotmodifier.rotation.copy(that.$static.Scene.transform.object.rotation)
			refresh_Tree.call(that, that.$static.Scene.base)
		}
	});
	transformControl.addEventListener('axis-changed', function (event) {
		that.$static.Scene.transform.hover = !(event.value === null)
	});

	refresh_Tree(base)

	return {
		filetype: 'pole',
		name: name || '新建合杆(' + get_UniqueID() + ')',
		uid: undefined,
		path: undefined,
		eventlistener: undefined,
		scene: scene,
		objectorigin: objectorigin,
		lineorigin: lineorigin,
		currentcamera: camera,
		currentcameraname: '透视',
		cameratarget: new THREE.Vector3(0, 0, 0),
		transformcontrol: transformControl,
		transform: {
			origin: transformorigin,
			object: transformobject,
			hover: false
		},
		camera: {
			persp: PerspectiveCamera,
			orth: OrthographicCamera
		},
		context: {
			selectedModule: null,
			threeView: '',
			checkLoadResult: []
		},
		reactive: {
			showGround: true,
			selectedMode: 0,
			transformMode: 0,
			transformSnap: false
		},
		base: base,
		raycastplane: RaycastPlane,
		baseslot: baseslot,
		insertobj: insertObj,
		insertobjslot: insertObjSlot,
		render: true
	}
}

function create_Tree_from_JSON(baseslot, objectorigin, unit, json){

	if (json === null || json === {}) {
		return
	}
	if (json["Sub"] === null) {
		let Main_data = data[json["ComponentID"]]
		// //console.log(Main_data)
		let LastModule = new Module(Main_data["moduleid"], uniqueID, Main_data["modulename"], new THREE.Vector3(parseFloat(Main_data["moduleposition"][0]), parseFloat(Main_data["moduleposition"][1]), parseFloat(Main_data["moduleposition"][2])), new THREE.Euler(parseFloat(Main_data["modulerotation"][0]), parseFloat(Main_data["modulerotation"][1]), parseFloat(Main_data["modulerotation"][2]), 'XYZ'), objectorigin, Main_data["url"])
		let current_slotlist = Main_data["interfaces"]

		for (let i = 0; i < current_slotlist.length; i++) {
			let Slot_data = current_slotlist[i]
			// let positionx = parseFloat(Slot_data["interfaceposition"][0]) + parseFloat(current_module.shiftposition.x)
			// let positiony = parseFloat(Slot_data["interfaceposition"][1]) + parseFloat(current_module.shiftposition.y)
			// let positionz = parseFloat(Slot_data["interfaceposition"][2]) + parseFloat(current_module.shiftposition.z)

			let positionx = parseFloat(Slot_data["interfaceposition"][0])
			let positiony = parseFloat(Slot_data["interfaceposition"][1])
			let positionz = parseFloat(Slot_data["interfaceposition"][2])
			//console.log(Slot_data["interfacename"])
			let slot = new Slot(Slot_data["interfaceUID"], Slot_data["interfacename"], new THREE.Vector3(positionx, positiony, positionz), new THREE.Euler(parseFloat(Slot_data["interfacerotation"][0]), parseFloat(Slot_data["interfacerotation"][1]), parseFloat(Slot_data["interfacerotation"][2]), 'XYZ'), objectorigin)
			// //console.log(slot)
			slot.name = Slot_data["interfacename"]

			LastModule.add_Slot(slot)
		}
		return LastModule
	}
	baseslot.remove_SubTree_from_Scene()

	let moduledatalist = new Array()
	let modulelist = new Array()

	let currentuid = 0

	let Main_data = data[json["ComponentID"]]
	// //console.log(Main_data)
	let LastModule = new Module(Main_data["moduleid"], currentuid, Main_data["modulename"], new THREE.Vector3(parseFloat(Main_data["moduleposition"][0]), parseFloat(Main_data["moduleposition"][1]), parseFloat(Main_data["moduleposition"][2])), new THREE.Euler(parseFloat(Main_data["modulerotation"][0]), parseFloat(Main_data["modulerotation"][1]), parseFloat(Main_data["modulerotation"][2]), 'XYZ'), objectorigin, Main_data["url"])
	baseslot.connect(LastModule)

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

			let slot = new Slot(Slot_data["interfaceUID"], Slot_data["interfacename"], new THREE.Vector3(positionx, positiony, positionz), new THREE.Euler(parseFloat(Slot_data["interfacerotation"][0]), parseFloat(Slot_data["interfacerotation"][1]), parseFloat(Slot_data["interfacerotation"][2]), 'XYZ'), objectorigin)
			// //console.log(slot)

			current_module.add_Slot(slot)

			let Sub_datalist = current_data["Sub"][i]
			for (let j = 0; j < Sub_datalist.length; j++) {
				let Sub_Data = data[Sub_datalist[j]["ComponentID"]]
				// //console.log(">>> " + Sub_Data)
				let Sub_Module = new Module(Sub_Data["moduleid"], currentuid, Sub_Data["modulename"], new THREE.Vector3(parseFloat(Sub_Data["moduleposition"][0]), parseFloat(Sub_Data["moduleposition"][1]), parseFloat(Sub_Data["moduleposition"][2])), new THREE.Euler(parseFloat(Sub_Data["modulerotation"][0]), parseFloat(Sub_Data["modulerotation"][1]), parseFloat(Sub_Data["modulerotation"][2]), 'XYZ'), objectorigin, Sub_Data["url"])
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
}



export function new_Scene(item) {
	let scene
	if (item === null) {
		scene = create_Scene.call(this)
	}
	else {
		let path = item.path
		scene = create_Scene.call(this, item.name)
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
					vue.scenes = vue.$static.Scenes.map((scene) => { return { name: scene.name, filetype: scene.filetype } })
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
		let filedescripter = FileSystem.ROOT.open(path, eventlistener)
		scene.name = filedescripter.name
		scene.path = filedescripter.path
		scene.uid = filedescripter.uid
		scene.eventlistener = eventlistener
		let data = JSON.parse(filedescripter.file.data)
		//console.log(data)
		try {
			let ans = create_Tree_from_PoleJson(data.components, data.acrossMultiTransverseArm, scene.objectorigin, this)
			scene.baseslot.connect(ans.tree)
			if (ans.warn.length > 0)
				this.$EventBus.$emit('console_add_Output', "info", '自动拼接 警告', "在 <自动拼接> 出现了如下警告:" + HTML.create_UList(ans.warn))
			if (ans.error.length > 0) {
				this.$EventBus.$emit('console_add_Output', "error", '自动拼接 错误', "在 <自动拼接> 出现了如下错误:" + HTML.create_UList(ans.error) + '可能的影响:<ul><li>自动拼接被中断</li></ul>')
			}
		} catch (error) {
			console.error(error)
			this.$EventBus.$emit('console_add_Output', "error", '.pole文件 警告', "在 <打开.pole文件> 出现了如下警告:" + HTML.create_List([error.message]))
		}
	}
	this.register_Scene(scene)
	refresh_AllTreeData.call(this)
	set_TreeShowMode.call(this, 'normal')
	refresh_Tree(scene.base)
}

export function deselect_Scene(scene) {
}

export function can_Switch(scene) {
	if (ToolManager.is_Running() || this.$static.Scene.transform.hover) return false;
	scene.transformcontrol.enabled = false;
	return true;
}

export function switch_Scene(scene) {
	scene.transformcontrol.enabled = true;
	ToolManager.allow_input = true;
	refresh_AllTreeData.call(this);
	refresh_build_selectedModule_inspector.call(this, scene.context.selectedModule)
	set_SelectedModule.call(this, scene.context.selectedModule)
}

export function release_Scene(scene) {
	scene.transformcontrol.dispose()
	FileSystem.ROOT.close(scene.path, scene.eventlistener)
	scene.base.Traverse(Module.remove_from_Scene, Slot.remove_from_Scene)
	disposeHierarchy(scene.scene)
}

export function close_Scene(scene) {
	if (ToolManager.is_Running() || this.$static.Scene.transform.hover) return false;
	return true;
}

export function save_Scene(scene, pathobj) {
	//console.log("pole save !!!")
}
// Event
export function mouseClick() {
	let run = ToolManager.is_Running()
	ToolManager.call('click', { mouse_pos: this.get_Mouse2DPosition() })
	if (!run && !this.$static.Scene.transform.hover)
		ToolManager.run(get_FlowGraph('PickModule_and_Select_and_Highlight', this), { clicked: true, once: true })
}

export function mouseDoubleClick() {
	let run = ToolManager.is_Running()
	ToolManager.call('doubleclick', { mouse_pos: this.get_Mouse2DPosition() })
	if (run || this.$static.Scene.transform.hover) return
	let that = this
	let graph = new TOOL.FlowGraph('PickModule-GET-getSubGraphEquip-SubGraph:Equip|PickModule-FAIL-SelectModule|SelectModule-FIN-HighlightModule', 'PickModule', {
		getSubGraphEquip(global, param) {
			let graph = get_FlowGraph('PickModuleSlot_and_Connect', that)
			return { subgraph: graph, param: param }
		}
	})
	ToolManager.run(graph, {
		clicked: true, once: true, module_filter: (module) => {
			return !module.is_InGroup() || module.is_GroupRoot()
		}
	})
}

export function onContextMenu() {
	let run = ToolManager.is_Running()
	ToolManager.call('contextmenu_open', {})
	if (run || this.$static.Scene.transform.hover) return
	if (this.$static.Scene.reactive.selectedMode === 0) {
		if (this.$static.Scene.context.selectedModule === null) {
			this.$EventBus.$emit('contextmenu_open', 'display', ['画布 - 无选中项', '-', /*{ text: '转换为父级组装树', icon: '大纲', action: 'display_convertTo_LocalTree' }, '-',*/ { text: '视图', list: [{ text: '居中视图', action: 'display_switch_View', data: 'center', icon: 'blank' }, { text: '前视图', action: 'display_switch_View', data: 'front', icon: 'blank' }, { text: '左视图', action: 'display_switch_View', data: 'left', icon: 'blank' }, { text: '顶视图', action: 'display_switch_View', data: 'top', icon: 'blank' }, { text: '正交/透视', action: 'display_switch_View', data: 'mode', icon: this.currentCamera === '透视' ? 'selected' : 'select' }], first: 0 }/*, '-', '标签', { type: 'cmp-tags', data: { selected: 2 }, action: 'test' }, '-', '标签', { type: 'cmp-input', data: { selected: 2 }, action: 'testw' }*/], null, event.clientX, event.clientY, 0)
		}
		else {
			this.$EventBus.$emit('contextmenu_open', 'display', ['画布 - ' + this.$static.Scene.context.selectedModule.name, '-', { text: '取消选中', icon: 'blank', action: '@deselect_Module' }, '-', { text: '<a style="color: var(--ElementColorRed);">删除</a>', icon: 'delete', action: '@delete_Module' }/*, { text: '@测试', action: '@log', data: 'hello world', description: '测试一下右键菜单', icon: 'blank' }*/, '-', { text: '视图', list: [{ text: '居中视图', action: 'display_switch_View', data: 'center', icon: 'blank' }, { text: '前视图', action: 'display_switch_View', data: 'front', icon: 'blank' }, { text: '左视图', action: 'display_switch_View', data: 'left', icon: 'blank' }, { text: '顶视图', action: 'display_switch_View', data: 'top', icon: 'blank' }, { text: '正交/透视', action: 'display_switch_View', data: 'mode', icon: this.currentCamera === '透视' ? 'selected' : 'select' }], first: 0 }, { text: '以选中项为中心', action: '@center_Component', icon: 'rotate' }], this.$static.Scene.context.selectedModule.uid, event.clientX, event.clientY, 2)
		}
	}
	else {
		if (this.$static.Scene.context.selectedModule === null) {
			this.$EventBus.$emit('contextmenu_open', 'display', ['画布 - 无选中项', '-', /*{ text: '转换为父级组装树', icon: '大纲', action: 'display_convertTo_LocalTree' }, '-',*/ { text: '视图', list: [{ text: '居中视图', action: 'display_switch_View', data: 'center', icon: 'blank' }, { text: '前视图', action: 'display_switch_View', data: 'front', icon: 'blank' }, { text: '左视图', action: 'display_switch_View', data: 'left', icon: 'blank' }, { text: '顶视图', action: 'display_switch_View', data: 'top', icon: 'blank' }, { text: '正交/透视', action: 'display_switch_View', data: 'mode', icon: this.currentCamera === '透视' ? 'selected' : 'select' }], first: 0 }], null, event.clientX, event.clientY, 0)
		}
		else {
			this.$EventBus.$emit('contextmenu_open', 'display', ['画布 - ' + this.$static.Scene.context.selectedModule.name, '-', { text: '取消选中', icon: 'blank', action: '@deselect_Module' }, '-', { text: '视图', list: [{ text: '居中视图', action: 'display_switch_View', data: 'center', icon: 'blank' }, { text: '前视图', action: 'display_switch_View', data: 'front', icon: 'blank' }, { text: '左视图', action: 'display_switch_View', data: 'left', icon: 'blank' }, { text: '顶视图', action: 'display_switch_View', data: 'top', icon: 'blank' }, { text: '正交/透视', action: 'display_switch_View', data: 'mode', icon: this.currentCamera === '透视' ? 'selected' : 'select' }], first: 0 }], this.$static.Scene.context.selectedModule.uid, event.clientX, event.clientY, 2)
		}
	}
}

export function actionLoop(scale) {
	ToolManager.call('actionloop', { mouse_pos: this.get_Mouse2DPosition(), scale: scale })
}

export function inspectorUpdate(action, val) {
	if (action === 'slotPosition') {
		if (this.$static.Scene.context.selectedModule !== null) {
			this.$static.Scene.context.selectedModule.slotmodifier.position.set(val.x, val.y, val.z)
			this.$static.Scene.transform.object.position.set(val.x, val.y, val.z)
			refresh_Tree(this.$static.Scene.base)
		}
	}
	else if (action === 'slotRotation') {
		if (this.$static.Scene.context.selectedModule !== null) {
			this.$static.Scene.context.selectedModule.slotmodifier.rotation.set(val.x, val.y, val.z)
			this.$static.Scene.transform.object.rotation.set(val.x, val.y, val.z)
			refresh_Tree(this.$static.Scene.base)
		}
	}
	else if (action === '模拟搭建生成') {
		if (val.actionchain === '模拟搭建生成>testBuild') {
			if (val.data.getUrl === "") {
				alert("poleCode不能为空")
			}
			else {
				let that = this
				let param = {
					presetPoleCode : val.data.getUrl,
					sourceType : 1,
					regionId : 2,
					platFormId : 0
				}

				getPartsByPoleCode(param).then(response =>{
						// //console.log(Json)
						if (response.respCode === 0) {
							that.$EventBus.$emit('app_open_Popup', 'pw-file-system-dialogue', 'display', '保存', 1000, 800, true, true, true, { path: FileSystem.ROOT.name, savetype: 'pole', data: JSON.stringify(response.returns), savename: '合杆' + val.data.getUrl })
						}
						else {
							customLog(that, "error", "自动拼接", "网络接口生成 错误", "在 <请求数据> 出现了如下错误: <br>" + HTML.create_KeyPair('错误', response.respMsg, "String"))
						}
					});

			}
		}
		if (val.actionchain === '模拟搭建生成>snapshot') {
			if (val.data.getUrl === "") {
				alert("poleCode不能为空")
			}
			else {
				let param = {
					facilityId : val.data.getUrl
				}
				let that = this

				searchLogs(param).then(response=> {
						// //console.log(Json)
						if (response.respCode === 0 && response.returns !== null) {
							// //console.log(Json.returns)
							that.$EventBus.$emit('app_open_Popup', 'pw-file-system-dialogue', 'display', '加载历史快照', 1000, 800, true, true, true, { path: FileSystem.ROOT.name, action: 'save_SnapShot', savetype: 'pole', data: response.returns, savename: '合杆' + val.data.getUrl })

						}
						else {
							customLog(that, "error", "自动拼接", "网络接口生成 错误", "在 <请求数据> 出现了如下错误: <br>" + HTML.create_KeyPair('错误', response.respMsg, "String"))
						}
					})
			}
		}
	}
	else if (action === 'selectorigin') {
		if (this.$static.Scene.context.selectedModule !== null) {
			if (val === '原点') {
				this.$static.Scene.context.selectedModule.relatetoorigin = true
				this.$static.Scene.context.selectedModule.slotmodifier.position.copy(this.$static.Scene.context.selectedModule.world_position)
				this.$static.Scene.context.selectedModule.slotmodifier.rotation.copy(this.$static.Scene.context.selectedModule.world_rotation)
				refresh_Tree(this.$static.Scene.base)
			}
			else {
				this.$static.Scene.context.selectedModule.relatetoorigin = false
				let position = new THREE.Vector3(0, 0, 0)
				let parentposition = new THREE.Vector3(0, 0, 0)
				parentposition.copy(this.$static.Scene.context.selectedModule.connectedslot.world_position)
				position.copy(this.$static.Scene.context.selectedModule.world_position)
				position.add(parentposition.negate())
				let rotation = new THREE.Euler(0, 0, 0, "XYZ")
				let parentrotation = new THREE.Quaternion()
				parentrotation.setFromEuler(this.$static.Scene.context.selectedModule.connectedslot.world_rotation)
				let selfrotation = new THREE.Quaternion()
				selfrotation.setFromEuler(this.$static.Scene.context.selectedModule.slotmodifier.rotation)
				rotation.setFromQuaternion(parentrotation.invert().multiply(selfrotation))

				let reverserotation = new THREE.Euler(0, 0, 0, "XYZ")
				parentrotation.setFromEuler(this.$static.Scene.context.selectedModule.connectedslot.world_rotation)
				reverserotation.setFromQuaternion(parentrotation.invert())
				position.applyEuler(reverserotation)
				this.$static.Scene.context.selectedModule.slotmodifier.position.copy(position)
				this.$static.Scene.context.selectedModule.slotmodifier.rotation.copy(rotation)
				refresh_Tree(this.$static.Scene.base)
			}
			let selected = this.$static.Scene.context.selectedModule
			update_TransformHelper.call(this, selected);
			refresh_build_selectedModule_inspector.call(this, this.$static.Scene.context.selectedModule)
		}
	}
	else if (action === 'link_slot') {
		let selected = this.$static.Scene.context.selectedModule
		if (val.action === 'add') {
			if (ToolManager.is_Running()) return
			let that = this
			let graph = new TOOL.FlowGraph('PickModuleSlot-GET-Link-HighlightModule|PickModuleSlot-QUIT-HighlightModule', 'PickModuleSlot', {
				Link(global, param) {
					try {
						that.$static.Scene.context.selectedModule.make_Link(param.slot)
					}
					catch (err) {
						customLog(that, "error", "ModuleSlot.js", "添加驱动插槽 错误", err.message)
					}
					refresh_Tree(that.$static.Scene.base)
					refresh_AllTreeData.call(that);
					refresh_build_selectedModule_inspector.call(that, that.$static.Scene.context.selectedModule)
					that.$static.Scene.transform.object.position.copy(selected.slotmodifier.position)
					that.$static.Scene.transform.object.rotation.copy(selected.slotmodifier.rotation)
					that.$static.Scene.transform.origin.position.copy(selected.slot_world_position)
					that.$static.Scene.transform.origin.rotation.copy(selected.slot_world_rotation)
					return {}
				}
			}, {
				PickModuleSlot_filterslot(global, param) {
					let slotans = []
					let moduleslot = []
					if (param.modules !== null && param.modules.length > 0) {
						moduleslot = param.modules.map((module) => {
							return module.module.rules.get_DefaultSlot(module.module)
						}).filter((slot) => {
							return slot !== null
						})
					}
					for (let i = 0; i < moduleslot.length; i++) {
						let targetslot = moduleslot[i]
						if (targetslot.classificationid === 6) {
							slotans.push({ slot: targetslot })
						}
					}
					if (param.slots !== null && param.slots.length > 0) {
						for (let i = 0; i < param.slots.length; i++) {
							let targetslot = param.slots[i]
							if (targetslot.classificationid === 6) {
								slotans.push({ slot: targetslot })
							}
						}
					}
					return slotans
				}
			})
			ToolManager.run(graph, {})
		}
		else if (val.action === 'delete') {
			let getSlot = null
			this.$static.Scene.base.Traverse(() => { }, (slot) => {
				if (slot.uid === BigInt(val.value.uid)) {
					getSlot = slot
				}
			})
			if (getSlot !== null) {
				this.$static.Scene.context.selectedModule.discard_Link(getSlot)
				refresh_Tree(this.$static.Scene.base)
				refresh_AllTreeData.call(this);
				refresh_build_selectedModule_inspector.call(this, this.$static.Scene.context.selectedModule)
				this.$static.Scene.transform.object.position.copy(selected.slotmodifier.position)
				this.$static.Scene.transform.object.rotation.copy(selected.slotmodifier.rotation)
				this.$static.Scene.transform.origin.position.copy(selected.slot_world_position)
				this.$static.Scene.transform.origin.rotation.copy(selected.slot_world_rotation)
			}
		}
	}
	else if (action === 'link_CalcuStyle') {
		if (this.$static.Scene.context.selectedModule !== null) {
			switch (val) {
				case 'X':
					this.$static.Scene.context.selectedModule.linkcalcustyle.x = true;
					this.$static.Scene.context.selectedModule.linkcalcustyle.y = false;
					this.$static.Scene.context.selectedModule.linkcalcustyle.z = false;
					break;
				case 'Y':
					this.$static.Scene.context.selectedModule.linkcalcustyle.x = false;
					this.$static.Scene.context.selectedModule.linkcalcustyle.y = true;
					this.$static.Scene.context.selectedModule.linkcalcustyle.z = false;
					break;
				case 'Z':
					this.$static.Scene.context.selectedModule.linkcalcustyle.x = false;
					this.$static.Scene.context.selectedModule.linkcalcustyle.y = false;
					this.$static.Scene.context.selectedModule.linkcalcustyle.z = true;
					break;
				case 'XY':
					this.$static.Scene.context.selectedModule.linkcalcustyle.x = true;
					this.$static.Scene.context.selectedModule.linkcalcustyle.y = false;
					this.$static.Scene.context.selectedModule.linkcalcustyle.z = false;
					break;
				case 'XZ':
					this.$static.Scene.context.selectedModule.linkcalcustyle.x = true;
					this.$static.Scene.context.selectedModule.linkcalcustyle.y = false;
					this.$static.Scene.context.selectedModule.linkcalcustyle.z = true;
					break;
				case 'YZ':
					this.$static.Scene.context.selectedModule.linkcalcustyle.x = false;
					this.$static.Scene.context.selectedModule.linkcalcustyle.y = true;
					this.$static.Scene.context.selectedModule.linkcalcustyle.z = true;
					break;
				case 'XYZ':
					this.$static.Scene.context.selectedModule.linkcalcustyle.x = true;
					this.$static.Scene.context.selectedModule.linkcalcustyle.y = true;
					this.$static.Scene.context.selectedModule.linkcalcustyle.z = true;
					break;
				case '无':
					this.$static.Scene.context.selectedModule.linkcalcustyle.x = false;
					this.$static.Scene.context.selectedModule.linkcalcustyle.y = false;
					this.$static.Scene.context.selectedModule.linkcalcustyle.z = false;
					// this.$static.Scene.context.selectedModule.linkcalcustyle.parent = true;
					break;
			}
			refresh_Tree(this.$static.Scene.base)
			// refresh_build_selectedModule_inspector.call(this, this.$static.Scene.context.selectedModule)
			let selected = this.$static.Scene.context.selectedModule
			update_TransformHelper.call(this, selected);
		}
	}
	else if (action === 'include_ParentSlot') {
		if (this.$static.Scene.context.selectedModule !== null) {
			this.$static.Scene.context.selectedModule.linkcalcustyle.parent = val
			refresh_Tree(this.$static.Scene.base)
		}
	}
	else if (action === '设计规划综合箱') {
		// //console.log(val)
		if (val.actionchain == '设计规划综合箱>module_select') {
			selectLibrary = val.data.module_select
			refresh_build_selectedModule_inspector.call(this, this.$static.Scene.context.selectedModule)
		}
		if (val.actionchain !== '设计规划综合箱>upload') return
		if (val.data.getPoleId === '' || val.data.getPoleCode === '') {
			alert("poleCode, poleId不能为空")
			return
		}
		save.call(this, val.data.getPoleId, val.data.getPoleCode)
	} else if (action === '设计模板') {
		if (val.actionchain == '设计模板>module_select') {
			selectLibrary = val.data.module_select
			refresh_build_selectedModule_inspector.call(this, this.$static.Scene.context.selectedModule)
		}
		if (val.actionchain == '设计模板>upload') {
			let json = get_SaveObject.call(this, val.data.getId, null)
			json.components.poleCode = val.data.getName
			json.standardType = selectLibrary == "标准库" ? 0 : 1
			uploadTemplate(json, val.data.getId, this);
			return
		}
		if (val.actionchain == '设计模板>delete') {
			deleteTemplate(val.data.getId, this);
			return
		}
	}
	else if (action === 'add_Plugin') {
		switch (val) {
			case '指示牌标志贴图': {
				let that = this
				const loader = new SVGLoader()
				let plugin = new MP_Model('指示牌标志贴图', null, this.$static.Scene.objectorigin)

				try {
					this.$static.Scene.context.selectedModule.add_Plugin(plugin, this)
					// loader.load("static/sign/非机动车行驶.svg", function (data) {
					// 	const paths = data.paths;
					// 	const group = new THREE.Group();
					// 	group.position.x = 0;
					// 	group.position.y = 0;
					// 	group.scale.y *= -0.19;
					// 	group.scale.x *= -0.19;
					// 	for (let i = 0; i < paths.length; i++) {
					// 		const path = paths[i];
					// 		const fillColor = path.userData.style.fill;

					// 		let material1 = new THREE.MeshBasicMaterial({
					// 			color: new THREE.Color().setStyle(fillColor),
					// 			opacity: path.userData.style.fillOpacity,
					// 			// transparent: path.userData.style.strokeOpacity < 1,
					// 			transparent: true,
					// 			polygonOffset: false,
					// 			polygonOffsetFactor: i * 100,
					// 			polygonOffUnits: 4,
					// 			depthTest: true,
					// 			depthWrite: false,
					// 			side: THREE.DoubleSide,
					// 		})

					// 		const shapes = path.toShapes(true);
					// 		for (let j = 0; j < shapes.length; j++) {
					// 			const shape = shapes[j];
					// 			const geometry = new THREE.ShapeBufferGeometry(shape);
					// 			geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0, 0, 0));
					// 			const mesh = new THREE.Mesh(geometry, material1);
					// 			mesh.renderOrder = j;
					// 			group.add(mesh);
					// 		}

					// 	}
					// 	let base = new THREE.Object3D()
					// 	base.add(group)
					// 	group.renderOrder = 1
					// 	group.name = 'SignGroup'
					// 	group.rotation.y = Math.PI / 2
					// 	let box = new THREE.Box3()
					// 	box.setFromObject(group)
					// 	group.position.set(1.1, (box.max.y - box.min.y) / 2, (box.min.z - box.max.z) / 2)
					// 	plugin.model = base
					// 	// //console.log(plugin.model)
					// 	plugin.scene.add(plugin.model)
					// 	plugin.scale = { x: group.scale.x, y: group.scale.y };
					// 	plugin.position = { x: group.position.x, y: group.position.y, z: group.position.z };
					// 	that.refresh_Tree()
					// 	that.refresh_build_selectedModule_inspector(that.$static.SelectedModule)
					// })
					refresh_Tree(this.$static.Scene.base)
					refresh_build_selectedModule_inspector.call(this, this.$static.Scene.context.selectedModule)
				} catch (error) {
					plugin.remove()
					this.$EventBus.$emit('console_add_Output', "error", "添加插件 错误", error.message)
				}
				break
			}
			// case '模型缩放': {
			// 	let plugin = new MP_Scale('模型缩放');
			// 	try {
			// 		this.$static.Scene.context.selectedModule.add_Plugin(plugin)
			// 		refresh_Tree(this.$static.Scene.base)
			// 		this.refresh_build_selectedModule_inspector(this.$static.Scene.context.selectedModule)
			// 	} catch (error) {
			// 		// plugin.remove()
			// 		this.$EventBus.$emit('console_add_Output', "error", "添加插件 错误", error.message)
			// 	}
			// 	break
			// }
			case '自定义脚本': {
				let plugin = new MP_CustomScript('自定义脚本');
				try {
					this.$static.Scene.context.selectedModule.add_Plugin(plugin, this)
					refresh_build_selectedModule_inspector.call(this, this.$static.Scene.context.selectedModule)
				} catch (error) {
					// plugin.remove()
					this.$EventBus.$emit('console_add_Output', "error", "添加插件 错误", error.message)
				}
				break
			}
		}
	}
	else if (action === 'remove_Plugin') {
		if (val.action === 'delete') {
			try {
				this.$static.Scene.context.selectedModule.remove_Plugin(val.value)
				refresh_Tree(this.$static.Scene.base)
				refresh_build_selectedModule_inspector.call(this, this.$static.Scene.context.selectedModule)
			} catch (error) {
				this.$EventBus.$emit('console_add_Output', "error", "移除插件 错误", error.message)
			}
		}
	}
	else if (action.split(':')[0] === 'edit_Plugin') {
		let plugin = action.split(':')[1]
		if (this.$static.Scene.context.selectedModule.editorproperty[plugin]) {
			let refresh = this.$static.Scene.context.selectedModule.editorproperty[plugin].set_Property(val, this) || false
			if (refresh) {
				refresh_Tree(this.$static.Scene.base)
				refresh_build_selectedModule_inspector.call(this, this.$static.Scene.context.selectedModule)
			}
		}
	}
	else if (action.split(':')[0] === 'edit_Property') {
		let property = action.split(':')[1]
		let refresh = this.$static.Scene.context.selectedModule.set_EditableProperty(property, val)
		if (refresh) {
			refresh_Tree(this.$static.Scene.base)
			refresh_build_selectedModule_inspector.call(this, this.$static.Scene.context.selectedModule)
		}
	}
}

export function refresh_build_selectedModule_inspector(module) {
	if (this.$static.Scene.reactive.selectedMode === 0) {
		if (module === null) {
			this.$EventBus.$emit('inspectorInit', {
				uid: 'display', iuid: 'moduledisplay_build_empty', list: [
					// { type: 'title', title: '无选中项' },
					// { type: 'text', title: '在画布中单击选中组件' },
					// { type: 'title', title: '模拟搭建生成' },
					// {
					// 	type: 'group', title: '', action: '模拟搭建生成', itemvalue: {
					// 		grouped: false, list: [
					// 			{ type: 'lineedit', title: 'poleCode', action: 'getUrl', itemvalue: { value: '', placeholder: '' } },
					// 			{ type: 'button', title: '', action: 'testBuild', itemvalue: { list: ["网络接口生成"] } },
					// 			{ type: 'button', title: '', action: 'snapshot', itemvalue: { list: ["历史快照"] } }]
					// 	}
					// },
					{ type: 'title', title: '设计规划综合箱' },
					{
						type: 'group', title: '', action: '设计规划综合箱', itemvalue: {
							grouped: false, list: [
								// { type: 'lineedit', title: 'poleId', action: 'getPoleId', itemvalue: { value: '', placeholder: '' } },
								// { type: 'lineedit', title: 'poleCode', action: 'getPoleCode', itemvalue: { value: '', placeholder: '' } },
								// {
								// 	type: 'select',
								// 	action: 'module_select',
								// 	title: '库',
								// 	itemvalue: {
								// 		list: ['标准库', '自定义库'],
								// 		selectitem: selectLibrary
								// 	}
								// },
								{ type: 'button', title: '', action: 'upload', itemvalue: { list: ["上传"] } }]
						}
					},
					{ type: 'title', title: '设计模板' },
					{
						type: 'group', title: '', action: '设计模板', itemvalue: {
							grouped: false, list: [
								{ type: 'lineedit', title: '模板id', action: 'getId', itemvalue: { value: '', placeholder: '' } },
								{ type: 'lineedit', title: '模板名称', action: 'getName', itemvalue: { value: '', placeholder: '' } },
								{
									type: 'select',
									action: 'module_select',
									title: '库',
									itemvalue: {
										list: ['标准库', '自定义库'],
										selectitem: selectLibrary
									}
								},
								{ type: 'button', title: '', action: 'upload', itemvalue: { list: ["上传"] } },
								{ type: 'button', title: '', action: 'delete', itemvalue: { list: ["删除"] } }]
						}
					}
				]
			})
		}
		else {
			// 是复合非根组件
			if (module.is_InGroup() && !module.is_GroupRoot()) {
				this.$EventBus.$emit('inspectorInit', {
					uid: 'display', iuid: 'moduledisplay_build_select_Module_' + module.uid, list: [
						{ type: 'title', title: module.name },
						{ type: 'text', title: 'UID: ' + module.uid },
						{ type: 'title', title: '复合组件 GID: ' + module.groupid + '，无法编辑' }
					]
				})
				return
			}

			let linkslot = module.linkslotlist.map((slot) => {
				return { text: slot.get_Info(), uid: slot.uid.toString() }
			})

			let is_ArmPoleEquip = module.get_Parent().classificationid === 2
			let list = [
				{ type: 'title', title: module.name },
				{ type: 'text', title: 'UID: ' + module.uid }, { type: 'title', title: '空间姿态' },
				!module.is_Link() ? { type: 'select', title: '坐标系', action: 'selectorigin', itemvalue: { list: ["原点", "父级"], selectitem: module.relatetoorigin ? "原点" : "父级" } } : undefined,
				{ type: 'vector3', title: '坐标', action: 'slotPosition', itemvalue: { x: module.slotmodifier.position.x, y: module.slotmodifier.position.y, z: module.slotmodifier.position.z, min: -100000, max: 100000, step: 1, unit: '㎜', multiplier: Unit } },
				{ type: 'euler3', title: '旋转', action: 'slotRotation', itemvalue: { x: module.slotmodifier.rotation.x, y: module.slotmodifier.rotation.y, z: module.slotmodifier.rotation.z, step: 1 } },
				!module.relatetoorigin && is_ArmPoleEquip ? { type: 'title', title: '多插槽驱动' } : undefined,
				!module.relatetoorigin && is_ArmPoleEquip ? { type: 'list', title: '驱动插槽', action: 'link_slot', itemvalue: { list: linkslot, allowdelete: true, allowinput: false, allowadd: true, showempty: false } } : undefined,
				module.is_Link() && is_ArmPoleEquip ? [{ type: 'text', title: '驱动方式' }, { type: 'select', title: '平均值计算', action: 'link_CalcuStyle', itemvalue: { list: ["无", "X", "Y", "Z", "XZ", "XYZ"], selectitem: Module.get_LinkCalcuStyleName(module.linkcalcustyle) } }, { type: 'toggle', title: '包含父插槽', action: 'include_ParentSlot', itemvalue: { value: module.linkcalcustyle.parent } }] : undefined
			]
			let property = module.get_EditablePropertyInspector()
			if (property.length > 0) {
				list.push({ type: 'title', title: '编辑属性' })
				list = list.concat(property)
			}
			// list = list.concat([{ type: 'title', title: '插件' },
			// { type: 'dropdown', title: '', action: 'add_Plugin', itemvalue: { list: [/*'鼠标检测', */'指示牌标志贴图', /*'模型缩放',*/ '自定义脚本'], selectitem: '', hold: false } }])
			let plugins = module.get_Plugins()
			if (plugins.length > 0) {
				list.push({ type: 'title', title: '插件列表' })
				list.push({ type: 'list', title: '插件列表', action: 'remove_Plugin', itemvalue: { list: plugins, allowdelete: true, allowinput: false, allowadd: false, showempty: false } })
			}
			list = list.concat(module.get_EditorPropertyInspector())
			list = list.concat([{ type: 'title', title: '属性' }, { type: 'propertylist', title: 'property', action: 'property', itemvalue: { list: module.property, musthave: [], allowinput: false } }])
			this.$EventBus.$emit('inspectorInit', {
				uid: 'display', iuid: 'moduledisplay_build_select_Module_' + module.uid, list: list
			})
		}
	}
	else {
		let list = [{ type: 'title', title: '荷载分析汇总' }]
		let selected = this.$static.Scene.context.selectedModule
		this.$static.Scene.context.checkLoadResult.forEach((item) => {
			let module = get_Module_by_UID(this.$static.Scene.baseslot, item.uid)
			if (module === null) {
				list.push({ type: 'text', title: 'UID: ' + item.uid + ' 的组件不存在，可能需要重新进行荷载计算' })
			}
			else {
				//console.log(module.name, module.property.ratedBend)
				list.push({ type: 'checkload', title: module.name, action: 'select_Module', itemvalue: { value: item.data.currBend, max: module.property.ratedBend === null ? '未知' : parseFloat(module.property.ratedBend), uid: item.uid, valid: item.data.vaildFlag, selected: selected === null ? false : item.uid === selected.uid } })
			}
		})
		this.$EventBus.$emit('inspectorInit', {
			uid: 'display', iuid: 'moduledisplay_checkload_empty', list: list
		})
	}
}

export function log(globaldata, loacldata) {
	//console.log(globaldata, loacldata)
}



// eventhandler 这里的事件处理由ModelDispaly.vue发出
// eg： export function eventA(a, b, c){} 在 vue文件中呼叫 this.emit('eventA', [a, b, c])
export function refresh_Tree(base, additionaldistance = 0) {
	base.slotmodifier = new SM_Free(new THREE.Vector3(0, 0, 0), new THREE.Euler(0, 0, 0, "XYZ"))
	base.Update(new THREE.Vector3(0, 0, 0), new THREE.Euler(0, 0, 0, "XYZ"), new THREE.Vector3(0, additionaldistance, 0))
}

function update_TransformHelper(selected) {
	this.$static.Scene.transform.object.position.copy(selected.slotmodifier.position)
	this.$static.Scene.transform.object.rotation.copy(selected.slotmodifier.rotation)
	this.$static.Scene.transform.origin.position.copy(selected.relatetoorigin ? new THREE.Vector3(0, 0, 0) : selected.slot_world_position)
	this.$static.Scene.transform.origin.rotation.copy(selected.relatetoorigin ? new THREE.Euler(0, 0, 0) : selected.slot_world_rotation)
}

function set_SelectedModule(module) {
	let lastmodule = this.$static.Scene.context.selectedModule
	if (module !== null) {
		this.$static.Scene.context.selectedModule = module
		this.$emit('moduleSelect', module.name, module.uid, module.componentid)
	}
	else {
		this.$static.Scene.context.selectedModule = null
		this.$emit('moduleSelect', "", -1, -1)
	}
	if (this.$static.Scene.context.selectedModule !== lastmodule) {
		let selected = this.$static.Scene.context.selectedModule
		search_Component.call(this, selected)
		if (this.$static.Scene.reactive.selectedMode === 1 || selected === null || (module.is_InGroup() && !module.is_GroupRoot())) {
			this.$static.Scene.transformcontrol.visible = false;
			this.$static.Scene.transformcontrol.enabled = false;
			this.$static.Scene.transform.origin.position.set(100000, 100000, 100000)
			this.$static.Scene.transform.origin.rotation.set(100000, 100000, 100000)
		}
		else if ([0, 1, 2, 7].includes(selected.classificationid)) {
			this.$static.Scene.transformcontrol.visible = false;
			this.$static.Scene.transformcontrol.enabled = false;
			this.$static.Scene.transform.origin.position.set(100000, 100000, 100000)
			this.$static.Scene.transform.origin.rotation.set(100000, 100000, 100000)
		}
		else {
			this.$static.Scene.transformcontrol.visible = false;
			this.$static.Scene.transformcontrol.enabled = false;
			update_TransformHelper.call(this, selected);
			this.$static.Scene.transformcontrol.visible = true;
			this.$static.Scene.transformcontrol.enabled = true;
		}
		refresh_build_selectedModule_inspector.call(this, this.$static.Scene.context.selectedModule)
	}
}

function search_Component(module) {
	if (module === null) return
	let type = module.property.flangeType
	let spec = module.property.specsId

	if (type && type >= 0) {
		this.$EventBus.$emit('componentshop_search', type, undefined, spec)
	}
}

export function leftmenu_dragend_Module(modulename, componentid, createJson, event) {
	//console.log(createJson)
	if (ToolManager.is_Running() || this.$static.Scene.reactive.selectedMode === 1) return
	if (createJson.classification === '贴图') {
		if (this.$static.Scene.context.selectedModule !== null) {
			{
				let module = this.$static.Scene.context.selectedModule
				let that = this
				const loader = new SVGLoader()
				let plugin = new MP_Model('指示牌标志贴图', null, this.$static.Scene.objectorigin)
				try {
					module.add_Plugin(plugin)

					loader.load(createJson.url, function (data) {

						let selectBox = new THREE.Box3()
						let p = new THREE.Vector3()
						let r = new THREE.Euler()
						p.copy(module.slotmodifier.position)
						r.copy(module.slotmodifier.rotation)
						module.slotmodifier.position.set(0, 0, 0)
						module.slotmodifier.rotation.set(0, 0, 0)
						module.Update()
						selectBox.setFromObject(module.model)
						module.slotmodifier.position.copy(p)
						module.slotmodifier.rotation.copy(r)
						let yLength = selectBox.max.y - selectBox.min.y;
						let zLength = selectBox.max.z - selectBox.min.z;
						let xLength = selectBox.max.x - selectBox.min.x;

						const paths = data.paths;
						const group = new THREE.Group();
						group.position.x = 0;
						group.position.y = 0;

						for (let i = 0; i < paths.length; i++) {
							const path = paths[i];
							const fillColor = path.userData.style.fill;
							if (fillColor !== undefined && fillColor !== 'none') {
								const material = new THREE.MeshBasicMaterial({
									color: new THREE.Color().setStyle(fillColor),
									opacity: path.userData.style.fillOpacity,
									transparent: true,
									polygonOffset: false,
									polygonOffsetFactor: i * 100,
									polygonOffUnits: 4,
									depthTest: true,
									depthWrite: false,
									side: THREE.DoubleSide,
								});
								const shapes = path.toShapes(true);
								for (let j = 0; j < shapes.length; j++) {
									const shape = shapes[j];
									const geometry = new THREE.ShapeBufferGeometry(shape);
									const mesh = new THREE.Mesh(geometry, material);
									mesh.renderOrder = i;
									group.add(mesh);
								}
							}
							const strokeColor = path.userData.style.stroke;
							if (strokeColor !== undefined && strokeColor !== 'none') {
								const material = new THREE.MeshBasicMaterial({
									color: new THREE.Color().setStyle(fillColor),
									opacity: path.userData.style.fillOpacity,
									transparent: true,
									polygonOffset: false,
									polygonOffsetFactor: i * 100,
									polygonOffUnits: 4,
									depthTest: true,
									depthWrite: false,
									side: THREE.DoubleSide,
								});

								for (let j = 0, jl = path.subPaths.length; j < jl; j++) {
									const subPath = path.subPaths[j];
									const geometry = SVGLoader.pointsToStroke(subPath.getPoints(), path.userData.style);
									if (geometry) {
										const mesh = new THREE.Mesh(geometry, material);
										mesh.renderOrder = i
										group.add(mesh);
									}
								}
							}
						}

						//console.log(group)

						let base = new THREE.Object3D()
						base.add(group)
						group.name = 'SignGroup'
						group.rotation.y = Math.PI / 2
						let box = new THREE.Box3()
						box.setFromObject(base)
						group.scale.y = -1 * yLength / (box.max.y - box.min.y);
						group.scale.x = 1 * zLength / (box.max.z - box.min.z);
						box.setFromObject(base)
						group.position.z = -box.min.z - (box.max.z - box.min.z) / 2
						group.position.y = -box.min.y - (box.max.y - box.min.y) / 2
						group.position.x = 1
						plugin.model = base
						plugin.scene.add(plugin.model)
						plugin.scale = { x: group.scale.x, y: group.scale.y };
						plugin.position = { x: group.position.x, y: group.position.y, z: group.position.z };
						//console.log(plugin.scale, plugin.position)
						refresh_Tree.call(that, that.$static.Scene.base)
						refresh_build_selectedModule_inspector.call(that, module)
					})
					refresh_Tree.call(that, that.$static.Scene.base)
					refresh_build_selectedModule_inspector.call(that, module)
				} catch (error) {
					plugin.remove()
					this.$EventBus.$emit('console_add_Output', "error", "添加插件 错误", error.message)
				}
			}
		}
	}
	else if (createJson.classification === '模板') {
		if (this.$static.Scene.base.get_Children().length > 0) {
			this.$EventBus.$emit('console_add_Output', 'error', '打开模板 错误', '场景中存在组件，无法导入模板。请确保场景中组件为空，再次尝试。')
			return
		}
		else {
			let data = JSON.parse(createJson.poleContent)
			//console.log(data)
			// data.components.mainPole.vicePole.lampArms[0].elevationAngle = 123
			let scene = this.$static.Scene
			try {
				let ans = create_Tree_from_PoleJson(data.components, data.acrossMultiTransverseArm, scene.objectorigin, this)
				scene.baseslot.connect(ans.tree)
				if (ans.warn.length > 0)
					this.$EventBus.$emit('console_add_Output', "info", '自动拼接 警告', "在 <自动拼接> 出现了如下警告:" + HTML.create_UList(ans.warn))
				if (ans.error.length > 0) {
					this.$EventBus.$emit('console_add_Output', "error", '自动拼接 错误', "在 <自动拼接> 出现了如下错误:" + HTML.create_UList(ans.error) + '可能的影响:<ul><li>自动拼接被中断</li></ul>')
				}
			} catch (error) {
				console.error(error)
				this.$EventBus.$emit('console_add_Output', "error", '.pole文件 警告', "在 <打开.pole文件> 出现了如下警告:" + HTML.create_List([error.message]))
			}
			refresh_AllTreeData.call(this)
			set_TreeShowMode.call(this, 'normal')
			refresh_Tree(scene.base)
		}
	}
	else {
		let Insert = create_Component_from_Json(createJson, this.$static.Scene.objectorigin
			// 	, (progress) => {
			// 	this.$EventBus.$emit('app_open_Popup', 'pw-progress', 'display', '加载模型', 600, 160, true, false, true, { title: '加载' + createJson.name + '模型...', progress: Math.round(progress * 100) / 100 }, false)
			// }
		)
		//console.log(Insert)
		Insert.Traverse((i) => {
			Module.add_to_Scene(i)
		})
		Insert.editorworkspace.edit_angle = 0
		Insert.editorworkspace.edit_y = 0
		// this.$EventBus.$emit('app_open_Popup', 'pw-progress', 'display', '加载模型', 600, 160, true, false, true, { title: '加载' + Insert.name + '模型...', progress: 0 }, false)
		// promise.then(() => {
		// 	this.$EventBus.$emit('app_close_Popup')
		// }, () => {
		// 	this.$EventBus.$emit('app_close_Popup')
		// })
		let graph = get_FlowGraph('PickModuleSlot_and_Connect', this)
		ToolManager.run(graph, { module: Insert })
	}
}

export function deselect_Module(data, args) {
	ToolManager.run(get_FlowGraph('SelectModule_and_Highlight', this), { module: null })
}

function get_Module_by_UID(base, uid) {
	let ans = null
	base.Traverse((module) => {
		if (module.uid === uid) {
			ans = module
			return false
		}
	})
	return ans
}

function remove_SubModules(module) {
	if (module.connectedslot !== null) {
		module = module.connectedslot.disconnect(module)
		module.Traverse((module) => {
			Module.remove_from_Scene(module)
			disposeHierarchy(module.model)
			disposeHierarchy(module.line)
		}, (slot) => {
			Slot.remove_from_Scene(slot)
			disposeHierarchy(slot.helper)
			disposeHierarchy(slot.axishelper)
		})
	}
}

export function delete_Module(data, args) {
	let selectmodule = get_Module_by_UID(this.$static.Scene.base, data)
	if (selectmodule === null)
		this.$EventBus.$emit('console_add_Output', "error", "删除组件 错误", "UID: " + moduleuid.toString() + " 不存在")
	else if (selectmodule.is_InGroup() && !selectmodule.is_GroupRoot())
		this.$EventBus.$emit('console_add_Output', "error", "删除组件 错误", Module.get_StyledHTML(selectmodule) + " 为复合组件子组件，无法删除")
	else {
		remove_SubModules(selectmodule)
		set_SelectedModule.call(this, null)
		refresh_AllTreeData.call(this)
	}
}

export function select_Module(uid) {
	let run = ToolManager.is_Running()
	if (run || this.$static.Scene.transform.hover) return
	// //console.log(">>>>>>>>>>> select Module")
	let module = get_Module_by_UID(this.$static.Scene.base, uid)
	if (module !== null) {
		ToolManager.run(get_FlowGraph('SelectModule_and_Highlight', this), { module: module })
	}
}

export function change_Color(args) {
	// this.renderer.setClearColor(new THREE.Color(`rgb(${args.r},${args.g},${args.b})`))
}

//////////////////////////////////////////////////////////////////////////////
function check_Tree() {
	//console.log(this)
	let error = []
	// check mainpole
	let mainpolearray = this.$static.Scene.base.get_Children()
	let mainpoleModule = null
	{
		if (mainpolearray.length > 1) {
			let strarray = mainpolearray.map((module) => { return Module.get_StyledHTML(module) + ' 来自 ' + HTML.create_KeyPair('ComponentPath', module.get_Path(), 'String') })
			error.push('基座连接了多于1个的组件，它们是: ' + HTML.create_List(strarray))
		}
		let others = mainpolearray.filter((module) => { return module.classification !== '主杆' })
		if (others.length > 0) {
			let strarray = others.map((module) => { return Module.get_StyledHTML(module) + ' 来自 ' + HTML.create_KeyPair('ComponentPath', module.get_Path(), 'String') })
			error.push('基座连接了非\"主杆\"类型的组件，它(们)是: ' + HTML.create_List(strarray))
		}

		if (mainpolearray[0] !== undefined) {
			mainpoleModule = mainpolearray[0]
		}
	}

	// mainpole passed
	let vicepoleModule = null
	let polearmModules = []
	let connectorModules = []
	if (mainpoleModule !== null) {
		// mainpole children
		let mainpolechildren = mainpoleModule.get_Children()
		let vicepolearray = []
		let polearmarray = []
		let connectorarray = []
		let equiparray = []
		let otherarray = []
		mainpolechildren.forEach((module) => {
			switch (module.classification) {
				case '副杆':
					vicepolearray.push(module)
					break
				case '横臂':
					polearmarray.push(module)
					break
				case '连接件':
					connectorarray.push(module)
					break
				case '搭载设备':
					equiparray.push(module)
					break
				default:
					otherarray.push(module)
					break
			}
		})

		if (otherarray.length > 0) {
			let strarray = otherarray.map((module) => { return Module.get_StyledHTML(module) + ' 来自 ' + HTML.create_KeyPair('ComponentPath', module.get_Path(), 'String') })
			error.push('主杆 ' + HTML.create_KeyPair('ComponentPath', mainpoleModule.get_Path(), 'String') + ' 连接了非' + HTML.create_Or(['\"副杆\"', '\"横臂\"', '\"连接件\"']) + '类型的组件，它(们)是: ' + HTML.create_List(strarray))
		}

		if (vicepolearray.length > 1) {
			let strarray = vicepolearray.map((module) => { return Module.get_StyledHTML(module) + ' 来自 ' + HTML.create_KeyPair('ComponentPath', module.get_Path(), 'String') })
			error.push('主杆 ' + HTML.create_KeyPair('ComponentPath', mainpoleModule.get_Path(), 'String') + ' 连接了多于1个的\"副杆\"组件，它们是: ' + HTML.create_List(strarray))
		}
		else if (vicepolearray.length === 1) {
			let vicepole = vicepolearray[0]
			if (vicepole.is_Link()) {
				error.push('副杆 ' + HTML.create_KeyPair('ComponentPath', vicepole.get_Path(), 'String') + ' 存在驱动插槽，副杆组件不应该被驱动')
			}
			if (!vicepole.connectedslot.match('副杆插槽')) {
				error.push('副杆 ' + HTML.create_KeyPair('ComponentPath', vicepole.get_Path(), 'String') + ' 所连接的插槽类型为 ' + HTML.create_KeyPair('SlotName', vicepole.connectedslot.name, 'String') + ' 应连接\"副杆插槽\"')
			}
			vicepoleModule = vicepolearray[0]
		}

		polearmarray.forEach((polearm) => {
			if (polearm.is_Link()) {
				error.push('横臂 ' + HTML.create_KeyPair('ComponentPath', polearm.get_Path(), 'String') + ' 存在驱动插槽，横臂组件不应该被驱动')
			}
			if (!polearm.connectedslot.match('横臂插槽')) {
				error.push('横臂 ' + HTML.create_KeyPair('ComponentPath', polearm.get_Path(), 'String') + ' 所连接的插槽类型为 ' + HTML.create_KeyPair('SlotName', polearm.connectedslot.name, 'String') + ' 应连接\"横臂插槽\"')
			}
			polearmModules.push(polearm)
		})

		connectorarray.forEach((connector) => {
			if (connector.is_Link()) {
				error.push('连接件 ' + HTML.create_KeyPair('ComponentPath', connector.get_Path(), 'String') + ' 存在驱动插槽，连接件组件不应该被驱动')
			}
			// else if (!polearm.connectedslot.match('连接件插槽')) {
			// 	error.push('连接件 ' + HTML.create_KeyPair('ComponentPath', polearm.get_Path(), 'String') + ' 所连接的插槽类型为 ' + HTML.create_KeyPair('SlotName', polearm.connectedslot.name, 'String') + ' 应连接\"连接件插槽\"')
			// }
			connectorModules.push(connector)
		})

		equiparray.forEach((equip) => {
			if (equip.is_Link()) {
				error.push('搭载设备 ' + HTML.create_KeyPair('ComponentPath', equip.get_Path(), 'String') + ' 存在驱动插槽，搭载设备组件不应该被驱动')
			}
		})
	}

	// vicepole passed
	let viceconnectorModules = []
	if (vicepoleModule !== null) {
		let vicepolechildren = vicepoleModule.get_Children()
		let lamparray = []
		let connectorarray = []
		let otherarray = []
		vicepolechildren.forEach((module) => {
			switch (module.classification) {
				case '灯臂':
					lamparray.push(module)
					break
				case '连接件':
					connectorarray.push(module)
					break
				default:
					otherarray.push(module)
					break
			}
		})

		lamparray.forEach((lamp) => {
			lamparray.forEach((lamp2) => {
				if (lamp !== lamp2 && lamp.componentid === lamp2.componentid) {
					let dis = Math.abs(Math.round(lamp.slotmodifier.position.y / Unit) - Math.round(lamp2.slotmodifier.position.y / Unit))
					let anglebetween = Math.abs(get_AngleBetween(radius_to_degree(lamp.slotmodifier.get_ReorderRotation().y), radius_to_degree(lamp2.slotmodifier.get_ReorderRotation().y)))
					let angle = Math.abs(anglebetween - 180)
					if (dis <= 10) {
						if (angle > 0.1) {
							error.push('灯臂 ' + HTML.create_KeyPair('ComponentPath', lamp.get_Path(), 'String') + ' 与灯臂 ' + HTML.create_KeyPair('ComponentPath', lamp2.get_Path(), 'String') + ' 高度相同，两者夹角应为180度，现为' + anglebetween + '度')
						}
						else if (lamp.property.elevationAngle !== lamp2.property.elevationAngle) {
							error.push('灯臂 ' + HTML.create_KeyPair('ComponentPath', lamp.get_Path(), 'String') + ' 与灯臂 ' + HTML.create_KeyPair('ComponentPath', lamp2.get_Path(), 'String') + ' 高度相同，夹角为180度，则两者仰角应相同')
						}
					}
				}
			})
		})

		if (otherarray.length > 0) {
			let strarray = otherarray.map((module) => { return Module.get_StyledHTML(module) + ' 来自 ' + HTML.create_KeyPair('ComponentPath', module.get_Path(), 'String') })
			error.push('副杆 ' + HTML.create_KeyPair('ComponentPath', vicepoleModule.get_Path(), 'String') + ' 连接了非' + HTML.create_Or(['\"灯臂\"', '\"连接件\"']) + '类型的组件，它(们)是: ' + HTML.create_List(strarray))
		}

		lamparray.forEach((lamp) => {
			if (lamp.is_Link()) {
				error.push('灯臂 ' + HTML.create_KeyPair('ComponentPath', lamp.get_Path(), 'String') + ' 存在驱动插槽，灯臂组件不应该被驱动')
			}
			if (lamp.get_Children().length > 0) {
				error.push('灯臂 ' + HTML.create_KeyPair('ComponentPath', lamp.get_Path(), 'String') + ' 包含子组装树或有被引用的插槽，搭载设备应为叶子组件')
			}
		})

		connectorarray.forEach((connector) => {
			if (connector.is_Link()) {
				error.push('连接件 ' + HTML.create_KeyPair('ComponentPath', connector.get_Path(), 'String') + ' 存在驱动插槽，连接件组件不应该被驱动')
			}
				// else if (!polearm.connectedslot.match('连接件插槽')) {
				// 	error.push('连接件 ' + HTML.create_KeyPair('ComponentPath', polearm.get_Path(), 'String') + ' 所连接的插槽类型为 ' + HTML.create_KeyPair('SlotName', polearm.connectedslot.name, 'String') + ' 应连接\"连接件插槽\"')
			// }
			else {
				viceconnectorModules.push(connector)
			}
		})
	}

	// connector passed
	connectorModules.forEach((connector) => {
		let connectorchildren = connector.get_Children()
		let equiparray = []
		let otherarray = []
		connectorchildren.forEach((module) => {
			switch (module.classification) {
				case '搭载设备':
					equiparray.push(module)
					break
				default:
					otherarray.push(module)
					break
			}
		})

		if (otherarray.length > 0) {
			let strarray = otherarray.map((module) => { return Module.get_StyledHTML(module) + ' 来自 ' + HTML.create_KeyPair('ComponentPath', module.get_Path(), 'String') })
			error.push('连接件 ' + HTML.create_KeyPair('ComponentPath', connector.get_Path(), 'String') + ' 连接了非\"搭载设备\"类型的组件，它(们)是: ' + HTML.create_List(strarray))
		}

		equiparray.forEach((equip) => {
			if (equip.is_Link()) {
				error.push('搭载设备 ' + HTML.create_KeyPair('ComponentPath', equip.get_Path(), 'String') + ' 存在驱动插槽，主杆上的搭载设备组件不应该被驱动')
			}
			if (!equip.connectedslot.match('搭载设备插槽')) {
				error.push('搭载设备 ' + HTML.create_KeyPair('ComponentPath', equip.get_Path(), 'String') + ' 所连接的插槽类型为 ' + HTML.create_KeyPair('SlotName', equip.connectedslot.name, 'String') + ' 应连接\"搭载设备插槽\"')
			}
			if (equip.get_Children().length > 0) {
				error.push('搭载设备 ' + HTML.create_KeyPair('ComponentPath', equip.get_Path(), 'String') + ' 包含子组装树或有被引用的插槽，搭载设备应为叶子组件')
			}
		})
	})

	// viceconnector passed
	viceconnectorModules.forEach((connector) => {
		let connectorchildren = connector.get_Children()
		let equiparray = []
		let otherarray = []
		connectorchildren.forEach((module) => {
			switch (module.classification) {
				case '搭载设备':
					equiparray.push(module)
					break
				default:
					otherarray.push(module)
					break
			}
		})

		if (otherarray.length > 0) {
			let strarray = otherarray.map((module) => { return Module.get_StyledHTML(module) + ' 来自 ' + HTML.create_KeyPair('ComponentPath', module.get_Path(), 'String') })
			error.push('连接件 ' + HTML.create_KeyPair('ComponentPath', connector.get_Path(), 'String') + ' 连接了非\"搭载设备\"类型的组件，它(们)是: ' + HTML.create_List(strarray))
		}

		equiparray.forEach((equip) => {
			if (equip.is_Link()) {
				error.push('搭载设备 ' + HTML.create_KeyPair('ComponentPath', equip.get_Path(), 'String') + ' 存在驱动插槽，副杆上的搭载设备组件不应该被驱动')
			}
			if (!equip.connectedslot.match('搭载设备插槽')) {
				error.push('搭载设备 ' + HTML.create_KeyPair('ComponentPath', equip.get_Path(), 'String') + ' 所连接的插槽类型为 ' + HTML.create_KeyPair('SlotName', equip.connectedslot.name, 'String') + ' 应连接\"搭载设备插槽\"')
			}
			if (equip.get_Children().length > 0) {
				error.push('搭载设备 ' + HTML.create_KeyPair('ComponentPath', equip.get_Path(), 'String') + ' 包含子组装树或有被引用的插槽，搭载设备应为叶子组件')
			}
		})
	})

	// polearm passed
	let equipModules = []
	polearmModules.forEach((polearm) => {
		// //console.log(polearm)
		let polearmchildren = polearm.get_Children()
		let otherarray = []
		let equiparray = []
		polearmchildren.forEach((module) => {
			switch (module.classification) {
				case '搭载设备':
					if (!equipModules.includes(module)) {
						equiparray.push(module)
						equipModules.push(module)
					}
					break
				default:
					otherarray.push(module)
					break
			}
		})

		if (otherarray.length > 0) {
			let strarray = otherarray.map((module) => { return Module.get_StyledHTML(module) + ' 来自 ' + HTML.create_KeyPair('ComponentPath', module.get_Path(), 'String') })
			error.push('横臂 ' + HTML.create_KeyPair('ComponentPath', polearm.get_Path(), 'String') + ' 连接了非\"搭载设备\"类型的组件，它(们)是: ' + HTML.create_List(strarray))
		}

		equiparray.forEach((equip) => {
			if (equip.is_Link()) {
				let strarray = []
				equip.linkslotlist.forEach((slot) => {
					if (!slot.match('搭载设备插槽')) {
						strarray.push(HTML.create_KeyPair('ComponentPath', slot.belong.get_Path(), 'String') + ' 上的插槽 ' + Slot.get_StyledHTML(slot))
					}
				})
				if (strarray.length > 0) {
					error.push('搭载设备 ' + HTML.create_KeyPair('ComponentPath', equip.get_Path(), 'String') + ' 引用了类型不是\"搭载设备插槽\"的驱动插槽，它(们)是: ' + HTML.create_List(strarray))
				}
			}
			if (!equip.connectedslot.match('搭载设备插槽')) {
				error.push('搭载设备 ' + HTML.create_KeyPair('ComponentPath', equip.get_Path(), 'String') + ' 所连接的插槽类型为 ' + HTML.create_KeyPair('SlotName', equip.connectedslot.name, 'String') + ' 应连接\"搭载设备插槽\"')
			}
			if (equip.get_Children().length > 0) {
				error.push('搭载设备 ' + HTML.create_KeyPair('ComponentPath', equip.get_Path(), 'String') + ' 包含子组装树或有被引用的插槽，搭载设备应为叶子组件')
			}
		})
	})


	if (error.length > 0) {
		return "在 <检查组装树> 出现了如下错误:" + HTML.create_UList(error) + '可能的影响:<ul><li>依赖于检查结果的操作将无法进行</li></ul>'
	}
	return true
}
//////////////////////////////////////////////////////////////////////////////
// update the components tree
function refresh_AllTreeData() {
	// let sl = new Array()
	let mnul = []
	let tree = []
	function get_all_module(module, layer) {
		if (module.name !== "Base") {
			mnul.push({ Name: module.name, UID: module.uid, ComponentID: module.componentid })
			let layerstyle = { "padding-left": layer * 30 + 'px', "margin-bottom": 0 + 'px' }
			tree.push({ Type: "Module", Name: module.name, UID: module.uid, ComponentID: module.componentid, GroupID: module.groupid, Layer: layer, LayerStyle: layerstyle, tags: [module.is_Link() ? 'link' : undefined, module.is_InGroup() ? module.is_GroupRoot() ? 'grouproot' : 'ingroup' : undefined].filter((tag) => { return tag !== undefined }) })
		}
	}
	function get_all_slot(slot, layer) {
		if (slot.name !== "BaseSlot") {
			// let layerstyle = { "padding-left": layer * 30 + 'px' }
			tree.push({ Type: "Slot", Name: slot.name, UID: slot.uid, Layer: layer, tags: [slot.is_LinkEmpty() ? undefined : 'linkedby'].filter((tag) => { return tag !== undefined }) })
		}
		// sl.push(slot)
	}
	this.$static.Scene.base.Traverse(get_all_module, get_all_slot)
	this.nameuidlist = mnul
	this.moduletree = tree
	this.$EventBus.$emit("display_TreeData_changed", mnul, tree)
}

function set_TreeShowMode(mode = 'normal') {
	switch (mode) {
		case 'select_slot':
			this.$static.Scene.baseslot.Traverse((module, layer) => {
					Module.set_Color(module, 0.6)
					Module.highlight(module, false)
				},
				(slot, layer) => {
					if (slot.helper !== null)
						// slotlist.push(slot)
						Slot.set_Visible(slot, true)
				})
			break
		case 'normal':
			this.$static.Scene.baseslot.Traverse((module, layer) => {
					Module.set_Color(module)
					Module.highlight(module, false)
					Module.set_Visible(module, true)
				},
				(slot, layer) => {
					Slot.set_Visible(slot, false)
				})
			break
		case 'highlight_module':
			// throw new Error(">>>>>")
			this.$static.Scene.baseslot.Traverse((module, layer) => {
					Module.set_Color(module)
					Module.highlight(module, module === this.$static.Scene.context.selectedModule)
					Module.set_Visible(module, true)
				},
				(slot, layer) => {
					Slot.set_Visible(slot, false)
				})
			break
	}
}

function save(poleid, polecode) {
	let object = get_SaveObject.call(this, poleid, polecode)
	if (object === null) return

	// let updateStl = new FormData()
	// let blob = get_STL.call(this)
	// updateStl.append('file', blob)
	// updateStl.append('fileMd5', this.$md5(blob.toString()))
	// updateStl.append('fileName', 'scene.stl')
	// updateStl.append('fileSize', blob.size)
	// updateStl.append('blockNo', 0)
	// updateStl.append('blockTotalNo', 1)
	// updateStl.append('blockSize', 3145728)
	// updateStl.append('noGroupPath', null)
	// let that = this
	// this.$axios({
	// 	method: 'POST',
	// 	url: 'http://10.8.20.40:9000/angryBirds/fileBlock/uploadFileBlock',
	// 	headers: {
	// 		'access_key': 'gEFqAxvEzZV7PfAN0ztrXqkH08jqZD0LE3tERLGlRfq8R28DLtDuAIeocVdMWlfegqtpCZOfULyYu64Pc/KTV64+21GQnQsYZFX9HZjrXtpuaN3QOwqmvX++T39SDS0wnzWPH8U0bmFBJ1gs/YeKL6YauDIAuv0YGA00hI45U9w=',
	// 		'access_token': 'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCmOPICLOzNSRMjcwWbtO+/a4hc2i87Iov3p5Sfky0u75Wt5Kycb4BOhurZWQnx453yN+u8ljBV4HfEResUcgDdPnNy281EIJbAOIz39pknTBuJzAmqM6atmZKrJVfOxZIMnNRDgWu4fsvpPqgsQWc5NaCdMreIE5Z5JyrbgA94ewIDAQAB',
	// 		'Content-Type': 'application/form-data'
	// 	},
	// 	data: updateStl
	// }).then((response) => {
	// 	if (response.data.respCode == 0) {
	// 		object.assembledPoleAddr = response.data.returns.groupPath
			let word = JSON.stringify(object)

			// let param = { param: encrypted.ciphertext.toString() }

	assembleComponts(word).then((res) => {
				// //console.log(res)
				if (res.data.respCode === 0) {
					customLog(this, 'log', 'upload', '编辑器 提示', HTML.create_KeyPair('操作', '设计规划综合箱', 'String') + ' 完成')
				}
				else {
					customLog(that, "error", "upload", "设计规划综合箱 错误", "在 <请求数据> 出现了如下错误: <br>" + HTML.create_KeyPair('错误', res.data.respMsg, "String"))
				}
			})
		// }
	// })

}

// export function checkLoad() {
// 	let object = get_CheckLoadObject.call(this)
// 	if (object === null) return
// 	//console.log(JSON.stringify(object, null, 2))
//
// 	let word = JSON.stringify(object)
// 	let param = {
// 		sourceType : 1,
// 		data : word
// 	}
//
// 	let that = this
//
// 	calcPolePartLoad(param).then(res => {
// 		//console.log(res)
// 		if (res.data.respCode === 0) {
// 			set_checkLoad_Result.call(this, res.data.returns)
// 			alert("请求成功")
// 		}
// 		else {
// 			customLog(that, "error", "荷载分析", "网络接口生成 错误", "在 <请求数据> 出现了如下错误: <br>" + HTML.create_KeyPair('错误', res.data.respMsg, "String"))
// 		}
// 	})
// }

export function checkLoad() {
	let object = get_CheckLoadObject.call(this)
	if (object === null) return
	//console.log(JSON.stringify(object, null, 2))

	let aeskey = 'fSQDFy2ca7MeWc6YBXPQse86FJHTYTPn'
	let PublicKey = 'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCmOPICLOzNSRMjcwWbtO+/a4hc2i87Iov3p5Sfky0u75Wt5Kycb4BOhurZWQnx453yN+u8ljBV4HfEResUcgDdPnNy281EIJbAOIz39pknTBuJzAmqM6atmZKrJVfOxZIMnNRDgWu4fsvpPqgsQWc5NaCdMreIE5Z5JyrbgA94ewIDAQAB'
	let word = JSON.stringify(object)
	let param = 'sourceType=1'

	// //console.log(JSON.stringify(object, null, 2))

	const key = CryptoJS.enc.Utf8.parse(aeskey)
	const srcs = CryptoJS.enc.Utf8.parse(word)
	const encrypted = CryptoJS.AES.encrypt(srcs, key, {
		mode: CryptoJS.mode.ECB,
		padding: CryptoJS.pad.Pkcs7
	})
	// let param = { param: encrypted.ciphertext.toString() }
	const srcs2 = CryptoJS.enc.Utf8.parse(param)
	const encrypted2 = CryptoJS.AES.encrypt(srcs2, key, {
		mode: CryptoJS.mode.ECB,
		padding: CryptoJS.pad.Pkcs7
	})

	let that = this

	this.$axios({
		method: 'POST',
		url: 'http://180.167.245.227:65516/woody/visual/calcPolePartLoad?param=' + encrypted2.ciphertext.toString(),
		headers: {
			'access_key': 'ZN193CkJqwo7FJ0TnCyjVe/z0AYevc32oD8fONk1fH8XvTAs8uVtRWhcPK+uwDFSU/GVDc9ASuOlpfYoxj1AVutb393iLNKQJBrZ6car08QtNzISrMDvLr0SkXBfZBbMG0auPK1DFdcZVzjgGMrd4QUkHKSFLgbZL20pLQmKgpg=',
			'access_token': PublicKey,
			'Content-Type': 'application/json'
		},
		data: { param: encrypted.ciphertext.toString() }
	}).then((res) => {
		//console.log(res)
		if (res.data.respCode === 0) {
			set_checkLoad_Result.call(this, res.data.returns)
			alert("请求成功")
		}
		else {
			customLog(that, "error", "荷载分析", "网络接口生成 错误", "在 <请求数据> 出现了如下错误: <br>" + HTML.create_KeyPair('错误', res.data.respMsg, "String"))
		}
	})
}


function set_checkLoad_Result(result) {
	//console.log(result)
	let array = []
	for (let key in result.lampArms) {
		array.push({ uid: BigInt(key), data: result.lampArms[key] })
	}
	for (let key in result.mainPole) {
		array.push({ uid: BigInt(key), data: result.mainPole[key] })
	}
	for (let key in result.poleArms) {
		array.push({ uid: BigInt(key), data: result.poleArms[key] })
	}
	for (let key in result.vicePole) {
		array.push({ uid: BigInt(key), data: result.vicePole[key] })
	}
	this.$static.Scene.context.checkLoadResult = array
	if (this.$static.Scene.reactive.selectedMode === 1) {
		show_checkLoadResult.call(this, array)
	}
	return array
}

function show_checkLoadResult(result) {
	refresh_build_selectedModule_inspector.call(this, this.$static.Scene.context.selectedModule)
	result.forEach((item) => {
		let module = get_Module_by_UID(this.$static.Scene.baseslot, item.uid)
		if (module !== null) {
			Module.set_Color(module, 1, item.data.vaildFlag ? '#00ff00' : '#ff0000')
		}
	})
}

//========================================
//             RuleLang
//========================================
//////////////////////////////////////////////////////////////////////////////
function get_CheckLoadObject() {
	let checktree = check_Tree.call(this)
	if (typeof (checktree) === 'string') {
		this.$EventBus.$emit('console_add_Output', "error", '荷载分析前期准备 组装树检查 未通过', checktree)
		return null
	}
	let error = []
	let warn = []
	let param = {
		poleId: 0,
		poleCode: "",
		mainPole: null
	}
	let paramtree = {
		mainPole: null
	}
	// 主杆
	{
		let children = this.$static.Scene.base.get_Children()
		let mainpolesarray = []
		let otherarray = []
		children.forEach((module) => {
			if (module.classification === '主杆') mainpolesarray.push(module)
			else otherarray.push(module)
		})
		if (otherarray.length > 0) {
			let otherstr = otherarray.map((module) => { return HTML.create_KeyPair('ComponentPath', module.get_Path(), 'String') })
			warn.push('在基座 ' + Module.get_StyledHTML(this.$static.Scene.base) + ' 找到不属于\"主杆\"类型的组件，它(们)是:' + HTML.create_List(otherstr))
		}
		if (mainpolesarray.length === 0) {
			error.push('在基座 ' + Module.get_StyledHTML(this.$static.Scene.base) + ' 找不到属于\"主杆\"类型的组件')
		}
		else if (mainpolesarray.length > 1) {
			let mainpolestr = mainpolesarray.map((module) => { return HTML.create_KeyPair('ComponentPath', module.get_Path(), 'String') })
			error.push('在基座 ' + Module.get_StyledHTML(this.$static.Scene.base) + ' 找到多个属于\"主杆\"类型的组件，它们是:' + HTML.create_List(mainpolestr))
		}
		else {
			let mainpole = mainpolesarray[0]
			param.mainPole = {
				mainId: 0,
				mainPartsCode: null,
				componentId: parseInt(mainpole.componentid),
				fileAddr: "",
				uid: parseInt(mainpole.uid.toString()),
				vicePole: null,
				poleArms: [],
				connectors: []
			}
			paramtree.mainPole = {
				module: mainpole,
				vicePole: null,
				poleArms: [],
				connectors: []
			}
		}
	}

	//副杆 / 横臂 / 连接件
	if (paramtree.mainPole !== null) {
		let children = paramtree.mainPole.module.get_Children()
		let vicepolesarray = []
		let armpolesarray = []
		let connectorsarray = []
		let equiparray = []
		let otherarray = []
		children.filter((module) => {
			if (module.classification === '副杆') vicepolesarray.push(module)
			else if (module.classification === '横臂') armpolesarray.push(module)
			else if (module.classification === '连接件') connectorsarray.push(module)
			else if (module.classification === '搭载设备') equiparray.push(module)
			else otherarray.push(module)
		})
		if (otherarray.length > 0) {
			let otherstr = otherarray.map((module) => { return HTML.create_KeyPair('ComponentPath', module.get_Path(), 'String') })
			warn.push('在 ' + Module.get_StyledHTML(paramtree.mainPole.module) + ' 找到不属于' + HTML.create_Or(['\"副杆\"', '\"横臂\"', '\"连接件\"']) + '类型的组件，它(们)是:' + HTML.create_List(otherstr))
		}

		// 副杆
		if (vicepolesarray.length === 0);
		else if (vicepolesarray.length > 1) {
			let vicepolestr = vicepolesarray.map((module) => { return HTML.create_KeyPair('ComponentPath', module.get_Path(), 'String') })
			error.push('在主杆 ' + Module.get_StyledHTML(paramtree.mainPole.module) + ' 找到多个属于\"副杆\"类型的组件，它们是:' + HTML.create_List(vicepolestr))
		}
		else {
			let vicepole = vicepolesarray[0]
			let position = vicepole.get_WorldPosition_HSL()
			param.mainPole.vicePole = {
				viceId: 0,
				vicePartsCode: null,
				componentId: parseInt(vicepole.componentid),
				fileAddr: "",
				uid: parseInt(vicepole.uid.toString()),
				lampArms: [],
				connectors: [],
				angle: position.angle,
				xaxis: position.x,
				yaxis: position.y
			}
			paramtree.mainPole.vicePole = {
				module: vicepole,
				lampArms: [],
				connectors: []
			}

			let vicechildren = vicepole.get_Children()
			let lampsarray = []
			let connectorsarray = []
			let viceotherarray = []
			vicechildren.filter((module) => {
				if (module.classification === '灯臂') lampsarray.push(module)
				else if (module.classification === '连接件') connectorsarray.push(module)
				else viceotherarray.push(module)
			})
			if (viceotherarray.length > 0) {
				let viceotherstr = viceotherarray.map((module) => { return HTML.create_KeyPair('ComponentPath', module.get_Path(), 'String') })
				warn.push('在 ' + Module.get_StyledHTML(vicepole) + ' 找到不属于' + HTML.create_Or(['\"灯臂\"', '\"连接件\"']) + '类型的组件，它(们)是:' + HTML.create_List(viceotherstr))
			}
			// 灯臂
			if (lampsarray.length === 0);
			else {
				lampsarray.forEach((lamp) => {
					let lampposition = lamp.get_WorldPosition_HSL()
					param.mainPole.vicePole.lampArms.push({
						lampId: parseInt(lamp.uid.toString()),
						lampPartsCode: null,
						componentId: parseInt(lamp.componentid),
						fileAddr: "",
						uid: parseInt(lamp.uid.toString()),
						angle: lampposition.angle,
						xaxis: lampposition.x,
						yaxis: lampposition.y
					})
					paramtree.mainPole.vicePole.lampArms.push({
						module: lamp
					})

					let lampchildren = lamp.get_Children()
					if (lampchildren.length > 0) {
						let lampstr = lampchildren.map((module) => { return HTML.create_KeyPair('ComponentPath', module.get_Path(), 'String') })
						warn.push('在 ' + Module.get_StyledHTML(lamp) + ' 找到多余的组件，它(们)是:' + HTML.create_List(lampstr))
					}
				})
			}

			// 连接件
			if (connectorsarray.length === 0);
			else {
				connectorsarray.forEach((connector, index) => {
					let position = connector.get_WorldPosition_HSL()
					param.mainPole.vicePole.connectors.push({
						connectorId: 0,
						connectPartsCode: null,
						componentId: parseInt(connector.componentid),
						fileAddr: "",
						uid: parseInt(connector.uid.toString()),
						carryEquips: [],
						angle: position.angle,
						xaxis: position.x,
						yaxis: position.y
					})
					paramtree.mainPole.vicePole.connectors.push({
						module: connector,
						carryEquips: []
					})

					// 搭载设备
					let connectorchildren = connector.get_Children()
					let equiparray = []
					let connectorotherarray = []
					connectorchildren.forEach((module) => {
						if (module.classification === '搭载设备') equiparray.push(module)
						else connectorotherarray.push(module)
					})
					if (connectorotherarray.length > 0) {
						let otherstr = connectorotherarray.map((module) => { return HTML.create_KeyPair('ComponentPath', module.get_Path(), 'String') })
						warn.push('在 ' + Module.get_StyledHTML(connector) + ' 找到不属于\"搭载设备\"类型的组件，它(们)是:' + HTML.create_List(otherstr))
					}
					if (equiparray.length === 0);
						// else if (equiparray.length > 1) {
						// 	let equipstr = equiparray.map((module) => { return HTML.create_KeyPair('ComponentPath', module.get_Path(), 'String') })
						// 	error.push('在 ' + Module.get_StyledHTML(connector) + ' 找到多个属于\"搭载设备\"类型的组件，它们是:' + HTML.create_List(equipstr))
					// }
					else {
						equiparray.forEach((equip) => {
							let equipposition = equip.get_WorldPosition_HSL()
							param.mainPole.vicePole.connectors[index].carryEquips.push({
								equipId: 0,
								componentId: parseInt(equip.componentid),
								fileAddr: "",
								uid: parseInt(equip.uid.toString()),
								angle: equipposition.angle,
								xaxis: equipposition.x,
								yaxis: equipposition.y
							})
							paramtree.mainPole.vicePole.connectors[index].carryEquips.push({
								module: equip
							})
							let equipchildren = equip.get_Children()
							if (equipchildren.length > 0) {
								let equipstr = equipchildren.map((module) => { return HTML.create_KeyPair('ComponentPath', module.get_Path(), 'String') })
								warn.push('在 ' + Module.get_StyledHTML(equip) + ' 找到多余的组件，它(们)是:' + HTML.create_List(equipstr))
							}
						})
					}
				})
			}
		}

		// 横臂
		if (armpolesarray.length === 0);
		else {
			armpolesarray.forEach((arm, armindex) => {
				let position = arm.get_WorldPosition_HSL()
				param.mainPole.poleArms.push({
					poleArmId: 0,
					armPartsCode: null,
					armAngle: 0,
					componentId: parseInt(arm.componentid),
					fileAddr: "",
					uid: parseInt(arm.uid.toString()),
					carryEquips: [],
					angle: position.angle,
					xaxis: position.x,
					yaxis: position.y
				})
				paramtree.mainPole.poleArms.push({
					module: arm,
					carryEquips: []
				})

				// 搭载设备
				let armchildren = arm.get_Children()
				let equiparray = []
				let connectorotherarray = []
				armchildren.forEach((module) => {
					if (module.classification === '搭载设备') equiparray.push(module)
					else connectorotherarray.push(module)
				})
				if (connectorotherarray.length > 0) {
					let otherstr = connectorotherarray.map((module) => { return HTML.create_KeyPair('ComponentPath', module.get_Path(), 'String') })
					warn.push('在 ' + Module.get_StyledHTML(arm) + ' 找到不属于\"搭载设备\"类型的组件，它(们)是:' + HTML.create_List(otherstr))
				}
				if (equiparray.length === 0);
				else {
					equiparray.forEach((equip) => {
						let equipposition = arm.get_WorldPosition_HSL()
						param.mainPole.poleArms[armindex].carryEquips.push({
							equipId: 0,
							componentId: parseInt(equip.componentid),
							fileAddr: "",
							uid: parseInt(equip.uid.toString()),
							angle: equipposition.angle,
							xaxis: equipposition.x,
							yaxis: equipposition.y
						})
						paramtree.mainPole.poleArms[armindex].carryEquips.push({
							module: equip
						})

						let equipchildren = equip.get_Children()
						if (equipchildren.length > 0) {
							let equipstr = equipchildren.map((module) => { return HTML.create_KeyPair('ComponentPath', module.get_Path(), 'String') })
							warn.push('在 ' + Module.get_StyledHTML(equip) + ' 找到多余的组件，它(们)是:' + HTML.create_List(equipstr))
						}
					})
				}
			})
		}

		// 连接件
		if (connectorsarray.length === 0);
		else {
			connectorsarray.forEach((connector, index) => {
				let position = connector.get_WorldPosition_HSL()
				param.mainPole.connectors.push({
					connectorId: 0,
					connectPartsCode: null,
					componentId: parseInt(connector.componentid),
					fileAddr: "",
					uid: parseInt(connector.uid.toString()),
					carryEquips: [],
					angle: position.angle,
					xaxis: position.x,
					yaxis: position.y
				})
				paramtree.mainPole.connectors.push({
					module: connector,
					carryEquips: []
				})

				// 搭载设备
				let connectorchildren = connector.get_Children()
				let equiparray = []
				let connectorotherarray = []
				connectorchildren.forEach((module) => {
					if (module.classification === '搭载设备') equiparray.push(module)
					else connectorotherarray.push(module)
				})
				if (connectorotherarray.length > 0) {
					let otherstr = connectorotherarray.map((module) => { return HTML.create_KeyPair('ComponentPath', module.get_Path(), 'String') })
					warn.push('在 ' + Module.get_StyledHTML(connector) + ' 找到不属于\"搭载设备\"类型的组件，它(们)是:' + HTML.create_List(otherstr))
				}
				if (equiparray.length === 0);
					// else if (equiparray.length > 1) {
					// 	let equipstr = equiparray.map((module) => { return HTML.create_KeyPair('ComponentPath', module.get_Path(), 'String') })
					// 	error.push('在 ' + Module.get_StyledHTML(connector) + ' 找到多个属于\"搭载设备\"类型的组件，它们是:' + HTML.create_List(equipstr))
				// }
				else {
					equiparray.forEach((equip) => {
						let equipposition = equip.get_WorldPosition_HSL()
						param.mainPole.connectors[index].carryEquips.push({
							equipId: 0,
							componentId: parseInt(equip.componentid),
							fileAddr: "",
							uid: parseInt(equip.uid.toString()),
							angle: equipposition.angle,
							xaxis: equipposition.x,
							yaxis: equipposition.y
						})
						paramtree.mainPole.connectors[index].carryEquips.push({
							module: equip
						})
						let equipchildren = equip.get_Children()
						if (equipchildren.length > 0) {
							let equipstr = equipchildren.map((module) => { return HTML.create_KeyPair('ComponentPath', module.get_Path(), 'String') })
							warn.push('在 ' + Module.get_StyledHTML(equip) + ' 找到多余的组件，它(们)是:' + HTML.create_List(equipstr))
						}
					})
				}
			})
		}

		if (equiparray.length === 0);
		else {
			equiparray.forEach((connector, index) => {
				let position = connector.get_WorldPosition_HSL()
				param.mainPole.connectors.push({
					connectorId: 0,
					connectPartsCode: null,
					componentId: 556,
					fileAddr: "",
					uid: parseInt(connector.uid.toString()),
					carryEquips: [{
						equipId: 0,
						componentId: parseInt(connector.componentid),
						fileAddr: "",
						uid: parseInt(connector.uid.toString()),
						angle: position.angle,
						xaxis: position.x,
						yaxis: position.y
					}],
					angle: position.angle,
					xaxis: position.x,
					yaxis: position.y
				})
				paramtree.mainPole.connectors.push({
					module: null,
					carryEquips: [connector]
				})
			})
		}

	}

	// //console.log(param)
	if (warn.length > 0)
		this.$EventBus.$emit('console_add_Output', "info", '荷载分析 警告', "在 <生成荷载分析组装树参数对象> 出现了如下警告:" + HTML.create_UList(warn) + '可能的影响:<ul><li>以上组件及其未列出的子组件将在荷载分析中被忽略，显示为灰色</li></ul>')
	if (error.length > 0) {
		this.$EventBus.$emit('console_add_Output', "error", '荷载分析 错误', "在 <生成荷载分析组装树参数对象> 出现了如下错误:" + HTML.create_UList(error) + '可能的影响:<ul><li>荷载分析组装树参数对象生成被中断</li></ul>')
		return null
	}
	else
		return param
}

// function get_SaveObject(poleid, polecode) {
// 	let checktree = check_Tree.call(this)
// 	if (typeof (checktree) === 'string') {
// 		this.$EventBus.$emit('console_add_Output', "error", '组装树检查 未通过', checktree)
// 		return null
// 	}
// 	let error = []
// 	let warn = []
// 	let param = {
// 		poleId: parseInt(poleid),
// 		poleCode: polecode,
// 		mainPole: null
// 	}
// 	let paramtree = {
// 		mainPole: null
// 	}
// 	let crossModules = []
// 	let acrossMultiRecordUidBean = {}
// 	// 主杆
// 	{
// 		let children = this.$static.Scene.base.get_Children()
// 		let mainpolesarray = []
// 		let otherarray = []
// 		children.forEach((module) => {
// 			if (module.classification === '主杆') mainpolesarray.push(module)
// 			else otherarray.push(module)
// 		})
// 		if (otherarray.length > 0) {
// 			let otherstr = otherarray.map((module) => { return HTML.create_KeyPair('ComponentPath', module.get_Path(), 'String') })
// 			warn.push('在基座 ' + Module.get_StyledHTML(this.$static.Scene.base) + ' 找到不属于\"主杆\"类型的组件，它(们)是:' + HTML.create_List(otherstr))
// 		}
// 		if (mainpolesarray.length === 0) {
// 			error.push('在基座 ' + Module.get_StyledHTML(this.$static.Scene.base) + ' 找不到属于\"主杆\"类型的组件')
// 		}
// 		else if (mainpolesarray.length > 1) {
// 			let mainpolestr = mainpolesarray.map((module) => { return HTML.create_KeyPair('ComponentPath', module.get_Path(), 'String') })
// 			error.push('在基座 ' + Module.get_StyledHTML(this.$static.Scene.base) + ' 找到多个属于\"主杆\"类型的组件，它们是:' + HTML.create_List(mainpolestr))
// 		}
// 		else {
// 			let mainpole = mainpolesarray[0]
// 			param.mainPole = {
// 				// mainId: mainpole.id,
// 				// mainPartsCode: mainpole.id,
// 				componentId: parseInt(mainpole.componentid),
// 				// fileAddr: "",
// 				uid: parseInt(mainpole.uid.toString()),
// 				vicePole: null,
// 				poleArms: [],
// 				connectors: []
// 			}
// 			paramtree.mainPole = {
// 				module: mainpole,
// 				vicePole: null,
// 				poleArms: [],
// 				connectors: []
// 			}
// 		}
// 	}
//
// 	//副杆 / 横臂 / 连接件
// 	if (paramtree.mainPole !== null) {
// 		let children = paramtree.mainPole.module.get_Children()
// 		let vicepolesarray = []
// 		let armpolesarray = []
// 		let connectorsarray = []
// 		let equiparray = []
// 		let otherarray = []
// 		children.filter((module) => {
// 			if (module.classification === '副杆') vicepolesarray.push(module)
// 			else if (module.classification === '横臂') armpolesarray.push(module)
// 			else if (module.classification === '连接件') connectorsarray.push(module)
// 			else if (module.classification === '搭载设备') equiparray.push(module)
// 			else otherarray.push(module)
// 		})
// 		if (otherarray.length > 0) {
// 			let otherstr = otherarray.map((module) => { return HTML.create_KeyPair('ComponentPath', module.get_Path(), 'String') })
// 			warn.push('在 ' + Module.get_StyledHTML(paramtree.mainPole.module) + ' 找到不属于' + HTML.create_Or(['\"副杆\"', '\"横臂\"', '\"连接件\"']) + '类型的组件，它(们)是:' + HTML.create_List(otherstr))
// 		}
//
// 		// 副杆
// 		if (vicepolesarray.length === 0);
// 		else if (vicepolesarray.length > 1) {
// 			let vicepolestr = vicepolesarray.map((module) => { return HTML.create_KeyPair('ComponentPath', module.get_Path(), 'String') })
// 			error.push('在主杆 ' + Module.get_StyledHTML(paramtree.mainPole.module) + ' 找到多个属于\"副杆\"类型的组件，它们是:' + HTML.create_List(vicepolestr))
// 		}
// 		else {
// 			let vicepole = vicepolesarray[0]
// 			let position = vicepole.get_WorldPosition_HSL()
// 			param.mainPole.vicePole = {
// 				// viceId: 0,
// 				// vicePartsCode: null,
// 				componentId: parseInt(vicepole.componentid),
// 				// fileAddr: "",
// 				uid: parseInt(vicepole.uid.toString()),
// 				lampArms: [],
// 				connectors: [],
// 				angle: position.angle,
// 				xaxis: position.x,
// 				yaxis: position.y
// 			}
// 			paramtree.mainPole.vicePole = {
// 				module: vicepole,
// 				lampArms: [],
// 				connectors: []
// 			}
//
// 			let vicechildren = vicepole.get_Children()
// 			let lampsarray = []
// 			let connectorsarray = []
// 			let viceotherarray = []
// 			vicechildren.filter((module) => {
// 				if (module.classification === '灯臂') lampsarray.push(module)
// 				else if (module.classification === '连接件') connectorsarray.push(module)
// 				else viceotherarray.push(module)
// 			})
// 			if (viceotherarray.length > 0) {
// 				let viceotherstr = viceotherarray.map((module) => { return HTML.create_KeyPair('ComponentPath', module.get_Path(), 'String') })
// 				warn.push('在 ' + Module.get_StyledHTML(vicepole) + ' 找到不属于' + HTML.create_Or(['\"灯臂\"', '\"连接件\"']) + '类型的组件，它(们)是:' + HTML.create_List(viceotherstr))
// 			}
// 			// 灯臂
// 			if (lampsarray.length === 0);
// 			else {
// 				lampsarray.forEach((lamp) => {
// 					let lampposition = lamp.get_WorldPosition_HSL()
// 					param.mainPole.vicePole.lampArms.push({
// 						componentId: parseInt(lamp.componentid),
// 						uid: parseInt(lamp.uid.toString()),
// 						angle: lamp.get_WorldRotation().y,
// 						// lookingDirectionAngle: lamp.get_WorldRotation().y,
// 						xaxis: lampposition.x,
// 						yaxis: lampposition.y,
// 						elevationAngle: lamp.get_Property().elevationAngle
// 					})
// 					paramtree.mainPole.vicePole.lampArms.push({
// 						module: lamp
// 					})
//
// 					let lampchildren = lamp.get_Children()
// 					if (lampchildren.length > 0) {
// 						let lampstr = lampchildren.map((module) => { return HTML.create_KeyPair('ComponentPath', module.get_Path(), 'String') })
// 						warn.push('在 ' + Module.get_StyledHTML(lamp) + ' 找到多余的组件，它(们)是:' + HTML.create_List(lampstr))
// 					}
// 				})
// 			}
//
// 			// 连接件
// 			if (connectorsarray.length === 0);
// 			else {
// 				connectorsarray.forEach((connector, index) => {
// 					let position = connector.get_WorldPosition_HSL()
// 					param.mainPole.vicePole.connectors.push({
// 						// connectorId: 0,
// 						// connectPartsCode: null,
// 						componentId: parseInt(connector.componentid),
// 						// fileAddr: "",
// 						uid: parseInt(connector.uid.toString()),
// 						carryEquips: [],
// 						angle: connector.get_WorldRotation().z,
// 						lookingDirectionAngle: connector.get_WorldRotation().y,
// 						xaxis: position.x,
// 						yaxis: position.y,
// 						zaxis: position.angle
// 					})
// 					paramtree.mainPole.vicePole.connectors.push({
// 						module: connector,
// 						carryEquips: []
// 					})
//
// 					// 搭载设备
// 					let connectorchildren = connector.get_Children()
// 					let equiparray = []
// 					let connectorotherarray = []
// 					connectorchildren.forEach((module) => {
// 						if (module.classification === '搭载设备') equiparray.push(module)
// 						else connectorotherarray.push(module)
// 					})
// 					if (connectorotherarray.length > 0) {
// 						let otherstr = connectorotherarray.map((module) => { return HTML.create_KeyPair('ComponentPath', module.get_Path(), 'String') })
// 						warn.push('在 ' + Module.get_StyledHTML(connector) + ' 找到不属于\"搭载设备\"类型的组件，它(们)是:' + HTML.create_List(otherstr))
// 					}
// 					if (equiparray.length === 0);
// 					// else if (equiparray.length > 1) {
// 					// 	let equipstr = equiparray.map((module) => { return HTML.create_KeyPair('ComponentPath', module.get_Path(), 'String') })
// 					// 	error.push('在 ' + Module.get_StyledHTML(connector) + ' 找到多个属于\"搭载设备\"类型的组件，它们是:' + HTML.create_List(equipstr))
// 					// }
// 					else {
// 						equiparray.forEach((equip) => {
// 							let equipposition = equip.get_WorldPosition_HSL()
// 							let property = equip.get_Property()
// 							let ans = {
// 								// equipId: 0,
// 								componentId: parseInt(equip.componentid),
// 								// fileAddr: "",
// 								uid: parseInt(equip.uid.toString()),
// 								angle: equip.get_WorldRotation().z,
// 								lookingDirectionAngle: equip.get_WorldRotation().y,
// 								elevationAngle: equip.get_WorldRotation().x,
// 								xaxis: equipposition.x,
// 								yaxis: equipposition.y,
// 								zaxis: equipposition.angle
// 							}
// 							Object.assign(ans, property)
// 							param.mainPole.vicePole.connectors[index].carryEquips.push(ans)
// 							paramtree.mainPole.vicePole.connectors[index].carryEquips.push({
// 								module: equip
// 							})
// 							let equipchildren = equip.get_Children()
// 							if (equipchildren.length > 0) {
// 								let equipstr = equipchildren.map((module) => { return HTML.create_KeyPair('ComponentPath', module.get_Path(), 'String') })
// 								warn.push('在 ' + Module.get_StyledHTML(equip) + ' 找到多余的组件，它(们)是:' + HTML.create_List(equipstr))
// 							}
// 						})
// 					}
// 				})
// 			}
// 		}
//
// 		// 横臂
// 		if (armpolesarray.length === 0);
// 		else {
// 			armpolesarray.forEach((arm, armindex) => {
// 				let position = arm.get_WorldPosition_HSL()
// 				let slot = arm.connectedslot
// 				param.mainPole.poleArms.push({
// 					// poleArmId: 0,
// 					// armPartsCode: null,
// 					armAngle: 0,
// 					componentId: parseInt(arm.componentid),
// 					// fileAddr: "",
// 					uid: parseInt(arm.uid.toString()),
// 					carryEquips: [],
// 					angle: slot.property.angleMin === undefined ? 0 : slot.property.angleMin,
// 					xaxis: position.x,
// 					yaxis: slot.position.y / Unit
// 				})
// 				paramtree.mainPole.poleArms.push({
// 					module: arm,
// 					carryEquips: []
// 				})
//
// 				// 搭载设备
// 				let armchildren = arm.get_Children()
// 				let equiparray = []
// 				let connectorotherarray = []
// 				armchildren.forEach((module) => {
// 					if (module.classification === '搭载设备') equiparray.push(module)
// 					else connectorotherarray.push(module)
// 				})
// 				if (connectorotherarray.length > 0) {
// 					let otherstr = connectorotherarray.map((module) => { return HTML.create_KeyPair('ComponentPath', module.get_Path(), 'String') })
// 					warn.push('在 ' + Module.get_StyledHTML(arm) + ' 找到不属于\"搭载设备\"类型的组件，它(们)是:' + HTML.create_List(otherstr))
// 				}
// 				if (equiparray.length === 0);
// 				else {
// 					equiparray.forEach((equip) => {
// 						if (equip.is_Link()) {
// 							if (!crossModules.includes(equip))
// 								crossModules.push(equip)
// 							return
// 						}
// 						let equipposition = equip.get_WorldPosition_HSL()
// 						let property = equip.get_Property()
// 						let ans = {
// 							componentId: parseInt(equip.componentid),
// 							uid: parseInt(equip.uid.toString()),
// 							angle: equip.get_WorldRotation().z,
// 							lookingDirectionAngle: equip.get_WorldRotation().y,
// 							elevationAngle: equip.get_WorldRotation().x,
// 							xaxis: equipposition.x,
// 							yaxis: equipposition.y,
// 							zaxis: equipposition.angle
// 						}
// 						Object.assign(ans, property)
// 						param.mainPole.poleArms[armindex].carryEquips.push(ans)
// 						paramtree.mainPole.poleArms[armindex].carryEquips.push({
// 							module: equip
// 						})
//
// 						let equipchildren = equip.get_Children()
// 						if (equipchildren.length > 0) {
// 							let equipstr = equipchildren.map((module) => { return HTML.create_KeyPair('ComponentPath', module.get_Path(), 'String') })
// 							warn.push('在 ' + Module.get_StyledHTML(equip) + ' 找到多余的组件，它(们)是:' + HTML.create_List(equipstr))
// 						}
// 					})
// 				}
// 			})
// 		}
//
// 		// 连接件
// 		if (connectorsarray.length === 0);
// 		else {
// 			connectorsarray.forEach((connector, index) => {
// 				let position = connector.get_WorldPosition_HSL()
// 				param.mainPole.connectors.push({
// 					// connectPartsCode: null,
// 					componentId: parseInt(connector.componentid),
// 					uid: parseInt(connector.uid.toString()),
// 					carryEquips: [],
// 					angle: connector.get_WorldRotation().z,
// 					lookingDirectionAngle: connector.get_WorldRotation().y,
// 					elevationAngle: connector.get_WorldRotation().x,
// 					xaxis: position.x,
// 					yaxis: position.y,
// 					zaxis: position.angle
// 				})
// 				paramtree.mainPole.connectors.push({
// 					module: connector,
// 					carryEquips: []
// 				})
//
// 				// 搭载设备
// 				let connectorchildren = connector.get_Children()
// 				let equiparray = []
// 				let connectorotherarray = []
// 				connectorchildren.forEach((module) => {
// 					if (module.classification === '搭载设备') equiparray.push(module)
// 					else connectorotherarray.push(module)
// 				})
// 				if (connectorotherarray.length > 0) {
// 					let otherstr = connectorotherarray.map((module) => { return HTML.create_KeyPair('ComponentPath', module.get_Path(), 'String') })
// 					warn.push('在 ' + Module.get_StyledHTML(connector) + ' 找到不属于\"搭载设备\"类型的组件，它(们)是:' + HTML.create_List(otherstr))
// 				}
// 				if (equiparray.length === 0);
// 				// else if (equiparray.length > 1) {
// 				// 	let equipstr = equiparray.map((module) => { return HTML.create_KeyPair('ComponentPath', module.get_Path(), 'String') })
// 				// 	error.push('在 ' + Module.get_StyledHTML(connector) + ' 找到多个属于\"搭载设备\"类型的组件，它们是:' + HTML.create_List(equipstr))
// 				// }
// 				else {
// 					equiparray.forEach((equip) => {
// 						let equipposition = equip.get_WorldPosition_HSL()
// 						let property = equip.get_Property()
// 						let ans = {
// 							componentId: parseInt(equip.componentid),
// 							uid: parseInt(equip.uid.toString()),
// 							angle: equip.get_WorldRotation().z,
// 							lookingDirectionAngle: equip.get_WorldRotation().y,
// 							elevationAngle: equip.get_WorldRotation().x,
// 							xaxis: equipposition.x,
// 							yaxis: equipposition.y,
// 							zaxis: equipposition.angle
// 						}
// 						Object.assign(ans, property)
// 						param.mainPole.connectors[index].carryEquips.push(ans)
// 						paramtree.mainPole.connectors[index].carryEquips.push({
// 							module: equip
// 						})
// 						let equipchildren = equip.get_Children()
// 						if (equipchildren.length > 0) {
// 							let equipstr = equipchildren.map((module) => { return HTML.create_KeyPair('ComponentPath', module.get_Path(), 'String') })
// 							warn.push('在 ' + Module.get_StyledHTML(equip) + ' 找到多余的组件，它(们)是:' + HTML.create_List(equipstr))
// 						}
// 					})
// 				}
// 			})
// 		}
//
// 		// “连接件”- - -搭载设施
// 		if (equiparray.length === 0);
// 		else {
// 			equiparray.forEach((connector, index) => {
// 				let position = connector.get_WorldPosition_HSL()
// 				let rotation = connector.get_WorldRotation()
// 				let property = connector.get_Property()
// 				let ans = {
// 					componentId: parseInt(connector.componentid),
// 					uid: parseInt(connector.uid.toString()),
// 					angle: rotation.z,
// 					lookingDirectionAngle: rotation.y,
// 					elevationAngle: rotation.x,
// 					xaxis: position.x,
// 					yaxis: position.y,
// 					zaxis: position.angle
// 				}
// 				Object.assign(ans, property)
// 				param.mainPole.connectors.push({
// 					// connectPartsCode: null,
// 					componentId: 503,
// 					uid: parseInt(connector.uid.toString()),
// 					carryEquips: [ans],
// 					angle: rotation.z,
// 					lookingDirectionAngle: rotation.y,
// 					elevationAngle: rotation.x,
// 					xaxis: position.x,
// 					yaxis: position.y,
// 					zaxis: position.angle
// 				})
// 				paramtree.mainPole.connectors.push({
// 					module: null,
// 					carryEquips: [connector]
// 				})
// 			})
// 		}
//
// 	}
//
// 	function push_ArmEquip(arm, equip) {
// 		let armsarray = paramtree.mainPole.poleArms
// 		for (let i = 0; i < armsarray.length; i++) {
// 			if (armsarray[i].module === arm) {
// 				armsarray[i].carryEquips.push(equip)
// 				let equipposition = equip.get_WorldPosition_HSL()
// 				let property = equip.get_Property()
// 				let ans = {
// 					componentId: parseInt(equip.componentid),
// 					uid: parseInt(equip.uid.toString()),
// 					angle: equip.get_WorldRotation().z,
// 					lookingDirectionAngle: equip.get_WorldRotation().y,
// 					xaxis: equipposition.x,
// 					yaxis: equipposition.y,
// 					zaxis: equipposition.angle
// 				}
// 				Object.assign(ans, property)
// 				param.mainPole.poleArms[i].carryEquips.push(ans)
// 			}
// 		}
// 	}
//
// 	crossModules.forEach((equip) => {
// 		let parents = [equip.get_Parent()].concat(equip.linkslotlist.map((slot) => { return slot.belong }))
// 		let connectparent = parents.reduce((ans, parent) => {
// 			let height = ans.get_WorldPosition_HSL().yaxis
// 			if (height > parent.get_WorldPosition_HSL().yaxis) return ans
// 			else return parent
// 		})
// 		let count = parents.length
// 		if (acrossMultiRecordUidBean[count] === undefined) {
// 			acrossMultiRecordUidBean[count] = []
// 		}
// 		acrossMultiRecordUidBean[count].push({
// 			equipmentUid: parseInt(equip.uid),
// 			maxTransverseArmUid: parseInt(connectparent.uid)
// 		})
// 		push_ArmEquip(connectparent, equip)
// 	})
//
// 	if (warn.length > 0)
// 		this.$EventBus.$emit('console_add_Output', "info", '荷载分析 警告', "在 <生成荷载分析组装树参数对象> 出现了如下警告:" + HTML.create_UList(warn) + '可能的影响:<ul><li>以上组件及其未列出的子组件将在荷载分析中被忽略，显示为灰色</li></ul>')
// 	if (error.length > 0) {
// 		this.$EventBus.$emit('console_add_Output', "error", '荷载分析 错误', "在 <生成荷载分析组装树参数对象> 出现了如下错误:" + HTML.create_UList(error) + '可能的影响:<ul><li>荷载分析组装树参数对象生成被中断</li></ul>')
// 		return null
// 	}
// 	else
// 		return {
// 			components: param,
// 			acrossMultiTransverseArm: crossModules.length > 0 ? { acrossMultiRecordUidBean: acrossMultiRecordUidBean } : {}
// 		}
// }
//保存拼接树json
function get_SaveObject(poleid, polecode) {
	let checktree = check_Tree.call(this)
	if (typeof (checktree) === 'string') {
		this.$EventBus.$emit('console_add_Output', "error", '组装树检查 未通过', checktree)
		return null
	}
	let error = []
	let warn = []
	let param = {
		poleId: parseInt(poleid),
		poleCode: polecode,
		mainPole: null
	}
	let paramtree = {
		mainPole: null
	}
	let crossModules = []
	let acrossMultiRecordUidBean = {}
	// 主杆
	{
		let children = this.$static.Scene.base.get_Children()
		let mainpolesarray = []
		let otherarray = []
		children.forEach((module) => {
			if (module.classification === '主杆') mainpolesarray.push(module)
			else otherarray.push(module)
		})
		if (otherarray.length > 0) {
			let otherstr = otherarray.map((module) => { return HTML.create_KeyPair('ComponentPath', module.get_Path(), 'String') })
			warn.push('在基座 ' + Module.get_StyledHTML(this.$static.Scene.base) + ' 找到不属于\"主杆\"类型的组件，它(们)是:' + HTML.create_List(otherstr))
		}
		if (mainpolesarray.length === 0) {
			error.push('在基座 ' + Module.get_StyledHTML(this.$static.Scene.base) + ' 找不到属于\"主杆\"类型的组件')
		}
		else if (mainpolesarray.length > 1) {
			let mainpolestr = mainpolesarray.map((module) => { return HTML.create_KeyPair('ComponentPath', module.get_Path(), 'String') })
			error.push('在基座 ' + Module.get_StyledHTML(this.$static.Scene.base) + ' 找到多个属于\"主杆\"类型的组件，它们是:' + HTML.create_List(mainpolestr))
		}
		else {
			let mainpole = mainpolesarray[0]
			param.mainPole = {
				// mainId: mainpole.id,
				// mainPartsCode: mainpole.id,
				componentId: parseInt(mainpole.componentid),
				// fileAddr: "",
				uid: parseInt(mainpole.uid.toString()),
				vicePole: null,
				poleArms: [],
				connectors: []
			}
			paramtree.mainPole = {
				module: mainpole,
				vicePole: null,
				poleArms: [],
				connectors: []
			}
		}
	}

	//副杆 / 横臂 / 连接件
	if (paramtree.mainPole !== null) {
		let children = paramtree.mainPole.module.get_Children()
		let vicepolesarray = []
		let armpolesarray = []
		let connectorsarray = []
		let equiparray = []
		let otherarray = []
		children.filter((module) => {
			if (module.classification === '副杆') vicepolesarray.push(module)
			else if (module.classification === '横臂') armpolesarray.push(module)
			else if (module.classification === '连接件') connectorsarray.push(module)
			else if (module.classification === '搭载设备') equiparray.push(module)
			else otherarray.push(module)
		})
		if (otherarray.length > 0) {
			let otherstr = otherarray.map((module) => { return HTML.create_KeyPair('ComponentPath', module.get_Path(), 'String') })
			warn.push('在 ' + Module.get_StyledHTML(paramtree.mainPole.module) + ' 找到不属于' + HTML.create_Or(['\"副杆\"', '\"横臂\"', '\"连接件\"']) + '类型的组件，它(们)是:' + HTML.create_List(otherstr))
		}

		// 副杆
		if (vicepolesarray.length === 0);
		else if (vicepolesarray.length > 1) {
			let vicepolestr = vicepolesarray.map((module) => { return HTML.create_KeyPair('ComponentPath', module.get_Path(), 'String') })
			error.push('在主杆 ' + Module.get_StyledHTML(paramtree.mainPole.module) + ' 找到多个属于\"副杆\"类型的组件，它们是:' + HTML.create_List(vicepolestr))
		}
		else {
			let vicepole = vicepolesarray[0]
			let position = vicepole.get_WorldPosition_HSL()
			param.mainPole.vicePole = {
				// viceId: 0,
				// vicePartsCode: null,
				componentId: parseInt(vicepole.componentid),
				// fileAddr: "",
				uid: parseInt(vicepole.uid.toString()),
				lampArms: [],
				connectors: [],
				angle: position.angle,
				xaxis: position.x,
				yaxis: position.y
			}
			paramtree.mainPole.vicePole = {
				module: vicepole,
				lampArms: [],
				connectors: []
			}

			let vicechildren = vicepole.get_Children()
			let lampsarray = []
			let connectorsarray = []
			let viceotherarray = []
			vicechildren.filter((module) => {
				if (module.classification === '灯臂') lampsarray.push(module)
				else if (module.classification === '连接件') connectorsarray.push(module)
				else viceotherarray.push(module)
			})
			if (viceotherarray.length > 0) {
				let viceotherstr = viceotherarray.map((module) => { return HTML.create_KeyPair('ComponentPath', module.get_Path(), 'String') })
				warn.push('在 ' + Module.get_StyledHTML(vicepole) + ' 找到不属于' + HTML.create_Or(['\"灯臂\"', '\"连接件\"']) + '类型的组件，它(们)是:' + HTML.create_List(viceotherstr))
			}
			// 灯臂
			if (lampsarray.length === 0);
			else {
				lampsarray.forEach((lamp) => {
					let lampposition = lamp.get_WorldPosition_HSL()
					param.mainPole.vicePole.lampArms.push({
						componentId: parseInt(lamp.componentid),
						uid: parseInt(lamp.uid.toString()),
						angle: lamp.get_WorldRotation().y,
						// lookingDirectionAngle: lamp.get_WorldRotation().y,
						xaxis: lampposition.x,
						yaxis: lampposition.y,
						elevationAngle: lamp.get_Property().elevationAngle
					})
					paramtree.mainPole.vicePole.lampArms.push({
						module: lamp
					})

					let lampchildren = lamp.get_Children()
					if (lampchildren.length > 0) {
						let lampstr = lampchildren.map((module) => { return HTML.create_KeyPair('ComponentPath', module.get_Path(), 'String') })
						warn.push('在 ' + Module.get_StyledHTML(lamp) + ' 找到多余的组件，它(们)是:' + HTML.create_List(lampstr))
					}
				})
			}

			// 连接件
			if (connectorsarray.length === 0);
			else {
				connectorsarray.forEach((connector, index) => {
					let position = connector.get_WorldPosition_HSL()
					param.mainPole.vicePole.connectors.push({
						// connectorId: 0,
						// connectPartsCode: null,
						componentId: parseInt(connector.componentid),
						// fileAddr: "",
						uid: parseInt(connector.uid.toString()),
						carryEquips: [],
						angle: connector.get_WorldRotation().z,
						lookingDirectionAngle: connector.get_WorldRotation().y,
						xaxis: position.x,
						yaxis: position.y,
						zaxis: position.angle
					})
					paramtree.mainPole.vicePole.connectors.push({
						module: connector,
						carryEquips: []
					})

					// 搭载设备
					let connectorchildren = connector.get_Children()
					let equiparray = []
					let connectorotherarray = []
					connectorchildren.forEach((module) => {
						if (module.classification === '搭载设备') equiparray.push(module)
						else connectorotherarray.push(module)
					})
					if (connectorotherarray.length > 0) {
						let otherstr = connectorotherarray.map((module) => { return HTML.create_KeyPair('ComponentPath', module.get_Path(), 'String') })
						warn.push('在 ' + Module.get_StyledHTML(connector) + ' 找到不属于\"搭载设备\"类型的组件，它(们)是:' + HTML.create_List(otherstr))
					}
					if (equiparray.length === 0);
						// else if (equiparray.length > 1) {
						// 	let equipstr = equiparray.map((module) => { return HTML.create_KeyPair('ComponentPath', module.get_Path(), 'String') })
						// 	error.push('在 ' + Module.get_StyledHTML(connector) + ' 找到多个属于\"搭载设备\"类型的组件，它们是:' + HTML.create_List(equipstr))
					// }
					else {
						equiparray.forEach((equip) => {
							let equipposition = equip.get_WorldPosition_HSL()
							let property = equip.get_Property()
							let ans = {
								// equipId: 0,
								componentId: parseInt(equip.componentid),
								// fileAddr: "",
								uid: parseInt(equip.uid.toString()),
								angle: equip.get_WorldRotation().z,
								lookingDirectionAngle: equip.get_WorldRotation().y,
								elevationAngle: equip.get_WorldRotation().x,
								xaxis: equipposition.x,
								yaxis: equipposition.y,
								zaxis: equipposition.angle
							}
							Object.assign(ans, property)
							param.mainPole.vicePole.connectors[index].carryEquips.push(ans)
							paramtree.mainPole.vicePole.connectors[index].carryEquips.push({
								module: equip
							})
							let equipchildren = equip.get_Children()
							if (equipchildren.length > 0) {
								let equipstr = equipchildren.map((module) => { return HTML.create_KeyPair('ComponentPath', module.get_Path(), 'String') })
								warn.push('在 ' + Module.get_StyledHTML(equip) + ' 找到多余的组件，它(们)是:' + HTML.create_List(equipstr))
							}
						})
					}
				})
			}
		}

		// 横臂
		if (armpolesarray.length === 0);
		else {
			armpolesarray.forEach((arm, armindex) => {
				let position = arm.get_WorldPosition_HSL()
				let slot = arm.connectedslot
				param.mainPole.poleArms.push({
					// poleArmId: 0,
					// armPartsCode: null,
					armAngle: 0,
					componentId: parseInt(arm.componentid),
					// fileAddr: "",
					uid: parseInt(arm.uid.toString()),
					carryEquips: [],
					angle: slot.property.angleMin,
					xaxis: position.x,
					yaxis: slot.property.yMin
				})
				paramtree.mainPole.poleArms.push({
					module: arm,
					carryEquips: []
				})

				// 搭载设备
				let armchildren = arm.get_Children()
				let equiparray = []
				let connectorotherarray = []
				armchildren.forEach((module) => {
					if (module.classification === '搭载设备') equiparray.push(module)
					else connectorotherarray.push(module)
				})
				if (connectorotherarray.length > 0) {
					let otherstr = connectorotherarray.map((module) => { return HTML.create_KeyPair('ComponentPath', module.get_Path(), 'String') })
					warn.push('在 ' + Module.get_StyledHTML(arm) + ' 找到不属于\"搭载设备\"类型的组件，它(们)是:' + HTML.create_List(otherstr))
				}
				if (equiparray.length === 0);
				else {
					equiparray.forEach((equip) => {
						if (equip.is_Link()) {
							if (!crossModules.includes(equip))
								crossModules.push(equip)
							return
						}
						let equipposition = equip.get_WorldPosition_HSL()
						let property = equip.get_Property()
						let ans = {
							componentId: parseInt(equip.componentid),
							uid: parseInt(equip.uid.toString()),
							angle: equip.get_WorldRotation().z,
							lookingDirectionAngle: equip.get_WorldRotation().y,
							elevationAngle: equip.get_WorldRotation().x,
							xaxis: equipposition.x,
							yaxis: equipposition.y,
							zaxis: equipposition.angle
						}
						Object.assign(ans, property)
						param.mainPole.poleArms[armindex].carryEquips.push(ans)
						paramtree.mainPole.poleArms[armindex].carryEquips.push({
							module: equip
						})

						let equipchildren = equip.get_Children()
						if (equipchildren.length > 0) {
							let equipstr = equipchildren.map((module) => { return HTML.create_KeyPair('ComponentPath', module.get_Path(), 'String') })
							warn.push('在 ' + Module.get_StyledHTML(equip) + ' 找到多余的组件，它(们)是:' + HTML.create_List(equipstr))
						}
					})
				}
			})
		}

		// 连接件
		if (connectorsarray.length === 0);
		else {
			connectorsarray.forEach((connector, index) => {
				let position = connector.get_WorldPosition_HSL()
				param.mainPole.connectors.push({
					// connectPartsCode: null,
					componentId: parseInt(connector.componentid),
					uid: parseInt(connector.uid.toString()),
					carryEquips: [],
					angle: connector.get_WorldRotation().z,
					lookingDirectionAngle: connector.get_WorldRotation().y,
					elevationAngle: connector.get_WorldRotation().x,
					xaxis: position.x,
					yaxis: position.y,
					zaxis: position.angle
				})
				paramtree.mainPole.connectors.push({
					module: connector,
					carryEquips: []
				})

				// 搭载设备
				let connectorchildren = connector.get_Children()
				let equiparray = []
				let connectorotherarray = []
				connectorchildren.forEach((module) => {
					if (module.classification === '搭载设备') equiparray.push(module)
					else connectorotherarray.push(module)
				})
				if (connectorotherarray.length > 0) {
					let otherstr = connectorotherarray.map((module) => { return HTML.create_KeyPair('ComponentPath', module.get_Path(), 'String') })
					warn.push('在 ' + Module.get_StyledHTML(connector) + ' 找到不属于\"搭载设备\"类型的组件，它(们)是:' + HTML.create_List(otherstr))
				}
				if (equiparray.length === 0);
					// else if (equiparray.length > 1) {
					// 	let equipstr = equiparray.map((module) => { return HTML.create_KeyPair('ComponentPath', module.get_Path(), 'String') })
					// 	error.push('在 ' + Module.get_StyledHTML(connector) + ' 找到多个属于\"搭载设备\"类型的组件，它们是:' + HTML.create_List(equipstr))
				// }
				else {
					equiparray.forEach((equip) => {
						let equipposition = equip.get_WorldPosition_HSL()
						let property = equip.get_Property()
						let ans = {
							componentId: parseInt(equip.componentid),
							uid: parseInt(equip.uid.toString()),
							angle: equip.get_WorldRotation().z,
							lookingDirectionAngle: equip.get_WorldRotation().y,
							elevationAngle: equip.get_WorldRotation().x,
							xaxis: equipposition.x,
							yaxis: equipposition.y,
							zaxis: equipposition.angle
						}
						Object.assign(ans, property)
						param.mainPole.connectors[index].carryEquips.push(ans)
						paramtree.mainPole.connectors[index].carryEquips.push({
							module: equip
						})
						let equipchildren = equip.get_Children()
						if (equipchildren.length > 0) {
							let equipstr = equipchildren.map((module) => { return HTML.create_KeyPair('ComponentPath', module.get_Path(), 'String') })
							warn.push('在 ' + Module.get_StyledHTML(equip) + ' 找到多余的组件，它(们)是:' + HTML.create_List(equipstr))
						}
					})
				}
			})
		}

		// “连接件”- - -搭载设施
		if (equiparray.length === 0);
		else {
			equiparray.forEach((connector, index) => {
				let position = connector.get_WorldPosition_HSL()
				let rotation = connector.get_WorldRotation()
				let property = connector.get_Property()
				let ans = {
					componentId: parseInt(connector.componentid),
					uid: parseInt(connector.uid.toString()),
					angle: rotation.z,
					lookingDirectionAngle: rotation.y,
					elevationAngle: rotation.x,
					xaxis: position.x,
					yaxis: position.y,
					zaxis: position.angle
				}
				Object.assign(ans, property)
				param.mainPole.connectors.push({
					// connectPartsCode: null,
					componentId: 556,
					uid: parseInt(connector.uid.toString()),
					carryEquips: [ans],
					angle: rotation.z,
					lookingDirectionAngle: rotation.y,
					elevationAngle: rotation.x,
					xaxis: position.x,
					yaxis: position.y,
					zaxis: position.angle
				})
				paramtree.mainPole.connectors.push({
					module: null,
					carryEquips: [connector]
				})
			})
		}

	}

	function push_ArmEquip(arm, equip) {
		let armsarray = paramtree.mainPole.poleArms
		for (let i = 0; i < armsarray.length; i++) {
			if (armsarray[i].module === arm) {
				armsarray[i].carryEquips.push(equip)
				let equipposition = equip.get_WorldPosition_HSL()
				let property = equip.get_Property()
				let ans = {
					componentId: parseInt(equip.componentid),
					uid: parseInt(equip.uid.toString()),
					angle: equip.get_WorldRotation().z,
					lookingDirectionAngle: equip.get_WorldRotation().y,
					xaxis: equipposition.x,
					yaxis: equipposition.y,
					zaxis: equipposition.angle
				}
				Object.assign(ans, property)
				param.mainPole.poleArms[i].carryEquips.push(ans)
			}
		}
	}

	crossModules.forEach((equip) => {
		let parents = [equip.get_Parent()].concat(equip.linkslotlist.map((slot) => { return slot.belong }))
		let connectparent = parents.reduce((ans, parent) => {
			let height = ans.get_WorldPosition_HSL().yaxis
			if (height > parent.get_WorldPosition_HSL().yaxis) return ans
			else return parent
		})
		let count = parents.length
		if (acrossMultiRecordUidBean[count] === undefined) {
			acrossMultiRecordUidBean[count] = []
		}
		acrossMultiRecordUidBean[count].push({
			equipmentUid: parseInt(equip.uid),
			maxTransverseArmUid: parseInt(connectparent.uid)
		})
		push_ArmEquip(connectparent, equip)
	})

	if (warn.length > 0)
		this.$EventBus.$emit('console_add_Output', "info", '荷载分析 警告', "在 <生成荷载分析组装树参数对象> 出现了如下警告:" + HTML.create_UList(warn) + '可能的影响:<ul><li>以上组件及其未列出的子组件将在荷载分析中被忽略，显示为灰色</li></ul>')
	if (error.length > 0) {
		this.$EventBus.$emit('console_add_Output', "error", '荷载分析 错误', "在 <生成荷载分析组装树参数对象> 出现了如下错误:" + HTML.create_UList(error) + '可能的影响:<ul><li>荷载分析组装树参数对象生成被中断</li></ul>')
		return null
	}
	else
		return {
			components: param,
			acrossMultiTransverseArm: crossModules.length > 0 ? { acrossMultiRecordUidBean: acrossMultiRecordUidBean } : {}
		}
}

//上传模板
function uploadTemplate(json, id = null, that) {
	let word = JSON.stringify(json)

	createPoleTmpl(word).then(res => {
		//console.log(res)
		if (res.data.respCode === 0) {
			customLog(this, 'log', 'upload', '编辑器 提示', HTML.create_KeyPair('操作', '设计综合杆模板', 'String') + ' 完成')
		} else {
			customLog(that, "error", "upload", "设计综合杆模板 错误", "在 <请求数据> 出现了如下错误: <br>" + HTML.create_KeyPair('错误', res.data.respMsg, "String"))
		}
	})
}

//删除模板
function deleteTemplate(id, that) {
	if (id === null) {
		alert('id不能为0')
		return;
	}
	let json = { templateId: id }
	let word = JSON.stringify(json)

	deletePoleTmpl(word).then(res => {
		//console.log(res)
		if (res.data.respCode === 0) {
			customLog(this, 'log', 'upload', '编辑器 提示', HTML.create_KeyPair('操作', '删除设计综合杆模板', 'String') + ' 完成')
		} else {
			customLog(that, "error", "upload", "设计综合杆模板 错误", "在 <请求数据> 出现了如下错误: <br>" + HTML.create_KeyPair('错误', res.data.respMsg, "String"))
		}
	})
}
//////////////////////////////////////////////////////////////////////////////

// 在这里实现画布中的按钮功能
// custom events
export function switch_Ground(show) {
	let ground = this.$static.Scene.scene.getObjectByName('GroundGrid')
	ground.visible = show
	Module.set_Visible(this.$static.Scene.base, show)
}

export function set_CADView(type) {
	// //console.log(">> set_CADView", type)
	switch (type) {
		case 'MainView': {
			MainView.call(this)
			break;
		}
		case 'TopView': {
			TopView.call(this)
			break;
		}
		case 'LeftView': {
			LeftView.call(this)
			break;
		}
	}
	fit_View.call(this, type)
}

export function clear_CADView() {
	// //console.log(">> clear_CADView")
	ClearLineAndText.call(this)
}

export async function export_PDF() {
	//console.log(">> export_PDF")
	this.$EventBus.$emit('app_open_Popup', 'pw-progress', 'display', '加载模型', 600, 160, true, false, true, { title: '导出PDF...', progress: 0 }, false)
	await export2PDF.call(this)
	this.$EventBus.$emit('app_close_Popup')
}

export function set_ToolMode(mode) {
	if (ToolManager.is_Running()) return
	this.$static.Scene.reactive.selectedMode = mode
	refresh_build_selectedModule_inspector.call(this, this.$static.Scene.context.selectedModule)
	if (mode === 0) {
		set_TreeShowMode.call(this, 'highlight_module')
		update_TransformHelper.call(this, this.$static.Scene.context.selectedModule);
		this.$static.Scene.transformcontrol.visible = true;
		this.$static.Scene.transformcontrol.enabled = true;
	}
	else {
		show_checkLoadResult.call(this, this.$static.Scene.context.checkLoadResult)
		this.$static.Scene.transformcontrol.visible = false;
		this.$static.Scene.transformcontrol.enabled = false;
	}
}

export function set_TransformMode(mode) {
	this.$static.Scene.reactive.transformMode = mode
	this.$static.Scene.transformcontrol.setMode(mode === 0 ? 'translate' : 'rotate')
	this.$static.Scene.transformcontrol.setSize(mode === 0 ? 0.6 : 0.4)
}

export function set_TransformSnap(snap) {
	this.$static.Scene.reactive.transformSnap = snap
	let control = this.$static.Scene.transformcontrol
	if (snap) {
		control.setTranslationSnap(1);
		control.setRotationSnap(THREE.MathUtils.degToRad(15));
	}
	else {
		control.setTranslationSnap(null);
		control.setRotationSnap(null);
	}
}

export function center_Component() {
	this.$static.OrbitControl.target.copy(this.$static.Scene.context.selectedModule.world_position)
	this.$static.OrbitControl.update()
}
/*
注意在这里呼叫函数最好使用 functionName.call(this, arg1, arg2, ...)
这样在functionName中就可以像ModelDispaly.vue中一样使用 this
eg:	export_PDF.call(this, 'bar', 123)
	function export_PDF (a, b) {
		//console.log(this, a, b) // this (.vue 的 this), bar, 123
		let base = this.$static.Scene.base
		let objorigin = this.$static.Scene.objectorigin
	}
特别的不需要使用到vue功能的，直接呼叫也可
*/

// 三视图 获得拼接树
// build重复 20210223 drq注释
// function GetModuleAndSlot() {
// 	let stack = [];
// 	let res = [];
// 	stack.push(this.$static.Scene.baseslot.connectedmodule);
// 	while (stack.length > 0) {
// 		let tempModule = stack.pop();
// 		for (let i = 0; i < tempModule.length; i++) {
// 			res.push(tempModule[i]);
// 			for (let j = 0; j < tempModule[i].slotlist.length; j++) {
// 				if (tempModule[i].slotlist[j].connectedmodule.length != 0) {
// 					stack.push(tempModule[i].slotlist[j].connectedmodule);
// 				}
// 			}
// 		}
// 	}
// 	return res
// }

// 三视图计算包围盒，可以简化
function GetBox(module) {
	if (module.classification == "主杆" && module.name == "主杆") {
		let box = new THREE.Box3();
		box.setFromObject(module.model);
		module.box = box;
	} else {
		let box = new THREE.Box3();
		box.setFromObject(module.model);
		module.box = box;
	}
}

function DrawLine(points, number, auxiliaryLinePoints1, auxiliaryLinePoints2, option = true) {
	number = Math.round(number)
	if (option) {
		let material = new THREE.LineBasicMaterial({ color: 0x00ff00 });
		let geometry = new THREE.BufferGeometry().setFromPoints(points);
		let line = new THREE.Line(geometry, material);
		this.$static.Scene.lineorigin.add(line)

		let material2 = new THREE.LineBasicMaterial({ color: 0x828282 });
		let geometry2 = new THREE.BufferGeometry().setFromPoints(auxiliaryLinePoints1);
		let line2 = new THREE.Line(geometry2, material2);
		this.$static.Scene.lineorigin.add(line2)

		let material3 = new THREE.LineBasicMaterial({ color: 0x828282 });
		let geometry3 = new THREE.BufferGeometry().setFromPoints(auxiliaryLinePoints2);
		let line3 = new THREE.Line(geometry3, material3);
		this.$static.Scene.lineorigin.add(line3)
	}

	let that = this;
	let message = number.toString();
	let shapes = FONT.generateShapes(message, 1.5);
	let geometry = new THREE.ShapeBufferGeometry(shapes);
	geometry.computeBoundingBox();
	let xMid = - 0.5 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x);
	geometry.translate(xMid, 0, 0);
	// make shape ( N.B. edge view not visible )
	let text = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({
			color: 0xffff00,
			transparent: true,
			opacity: 0.4,
			side: THREE.DoubleSide
		})
	);
	text.name = "text";
	if (points[0].y == points[1].y) {
		text.rotation.y = Math.PI / 2;
		text.position.x = points[0].x;
		text.position.y = points[0].y + 1;
		text.position.z = (points[0].z + points[1].z) / 2;
	} else if (points[0].z == points[1].z) {
		text.rotation.y = Math.PI / 2;
		text.rotation.z = Math.PI / 2;
		text.position.x = points[0].x;
		text.position.y = (points[0].y + points[1].y) / 2;
		text.position.z = points[0].z + 1;
	}
	that.$static.Scene.lineorigin.add(text);
}

function DrawLineTop(points, number, auxiliaryLinePoints1, auxiliaryLinePoints2) {
	number = Math.round(number)
	let material = new THREE.LineBasicMaterial({ color: 0x00ff00 });
	let geometry = new THREE.BufferGeometry().setFromPoints(points);
	let line = new THREE.Line(geometry, material);
	this.$static.Scene.lineorigin.add(line)

	let material2 = new THREE.LineBasicMaterial({ color: 0xFFF5EE });
	let geometry2 = new THREE.BufferGeometry().setFromPoints(auxiliaryLinePoints1);
	let line2 = new THREE.Line(geometry2, material2);
	this.$static.Scene.lineorigin.add(line2)

	let material3 = new THREE.LineBasicMaterial({ color: 0xFFF5EE });
	let geometry3 = new THREE.BufferGeometry().setFromPoints(auxiliaryLinePoints2);
	let line3 = new THREE.Line(geometry3, material3);
	this.$static.Scene.lineorigin.add(line3)

	let that = this;
	const matLite = new THREE.MeshBasicMaterial({
		color: 0xffff00,
		transparent: true,
		opacity: 0.4,
		side: THREE.DoubleSide
	});
	const message = number.toString();
	const shapes = FONT.generateShapes(message, 1.5);
	geometry3 = new THREE.ShapeBufferGeometry(shapes);
	geometry3.computeBoundingBox();
	const xMid = - 0.5 * (geometry3.boundingBox.max.x - geometry3.boundingBox.min.x);
	geometry3.translate(xMid, 0, 0);
	// make shape ( N.B. edge view not visible )
	const text = new THREE.Mesh(geometry3, matLite);
	text.name = "text";
	if (points[0].z == points[1].z) {
		text.rotation.x = - Math.PI / 2;
		text.position.x = (points[0].x + points[1].x) / 2;
		text.position.y = points[0].y;
		text.position.z = points[0].z - 1;
	} else if (points[0].x == points[1].x) {
		text.rotation.z = Math.PI / 2;
		text.rotation.x = - Math.PI / 2;
		text.position.x = points[0].x - 1;
		text.position.y = points[0].y;
		text.position.z = (points[0].z + points[1].z) / 2;
	}
	that.$static.Scene.lineorigin.add(text);
}

function DrawLineLeft(points, number, auxiliaryLinePoints1, auxiliaryLinePoints2) {
	number = Math.round(number)
	let material = new THREE.LineBasicMaterial({ color: 0x00ff00 });
	let geometry = new THREE.BufferGeometry().setFromPoints(points);
	let line = new THREE.Line(geometry, material);
	this.$static.Scene.lineorigin.add(line)

	let material2 = new THREE.LineBasicMaterial({ color: 0xFFF5EE });
	let geometry2 = new THREE.BufferGeometry().setFromPoints(auxiliaryLinePoints1);
	let line2 = new THREE.Line(geometry2, material2);
	this.$static.Scene.lineorigin.add(line2)

	let material3 = new THREE.LineBasicMaterial({ color: 0xFFF5EE });
	let geometry3 = new THREE.BufferGeometry().setFromPoints(auxiliaryLinePoints2);
	let line3 = new THREE.Line(geometry3, material3);
	this.$static.Scene.lineorigin.add(line3)

	let that = this;
	let matLite = new THREE.MeshBasicMaterial({
		color: 0xffff00,
		transparent: true,
		opacity: 0.4,
		side: THREE.DoubleSide
	});
	let message = number.toString();
	let shapes = FONT.generateShapes(message, 1.5);
	geometry3 = new THREE.ShapeBufferGeometry(shapes);
	geometry3.computeBoundingBox();
	let xMid = - 0.5 * (geometry3.boundingBox.max.x - geometry3.boundingBox.min.x);
	geometry3.translate(xMid, 0, 0);
	// make shape ( N.B. edge view not visible )
	let text = new THREE.Mesh(geometry3, matLite);
	text.name = "text";
	if (points[0].y == points[1].y) {
		text.position.x = (points[0].x + points[1].x) / 2;
		text.position.y = points[0].y + 1;
		text.position.z = 0;
	} else if (points[0].z == points[1].z) {
		text.rotation.z = Math.PI / 2;
		text.position.x = points[0].x - 1;
		text.position.y = (points[0].y + points[1].y) / 2;
		text.position.z = points[0].z;
	}
	that.$static.Scene.lineorigin.add(text);
}

function GetTowVector3Max(vector1, vector2) {
	if (vector2.x > vector1.x) {
		vector1.x = vector2.x;
	}
	if (vector2.y > vector1.y) {
		vector1.y = vector2.y;
	}
	if (vector2.z > vector1.z) {
		vector1.z = vector2.z;
	}
}

function GetTowVector3Min(vector1, vector2) {
	if (vector2.x < vector1.x) {
		vector1.x = vector2.x;
	}
	if (vector2.y < vector1.y) {
		vector1.y = vector2.y;
	}
	if (vector2.z < vector1.z) {
		vector1.z = vector2.z;
	}
}

function GetModuleAndSlot() {
	let stack = [];
	let res = [];
	let module = {};
	stack.push(this.$static.Scene.baseslot.connectedmodule);
	while (stack.length > 0) {
		let tempModule = stack.pop();
		for (let i = 0; i < tempModule.length; i++) {
			res.push(tempModule[i]);
			for (let j = 0; j < tempModule[i].slotlist.length; j++) {
				if (tempModule[i].slotlist[j].connectedmodule.length != 0) {
					stack.push(tempModule[i].slotlist[j].connectedmodule);
				}
			}
		}
	}
	return res
}

// 三视图 清除标注线
function ClearLineAndText(isCloseView = false) {
	this.$static.Scene.context.threeView = isCloseView ? null : this.$static.Scene.context.threeView;
	let allChildren = this.$static.Scene.lineorigin.children.map((i) => { return i })
	for (let i = 0; i < allChildren.length; i++) {
		// //console.log(allChildren[i])
		let obj = allChildren[i]
		// //console.log(obj.type, i)
		this.$static.Scene.lineorigin.remove(obj)
		switch (obj.type) {
			case 'Line': {
				obj.geometry.dispose()
				obj.material.dispose()
				break
			}
			case 'ArrowHelp': {
				break
			}
			case 'Mesh': {
				obj.geometry.dispose()
				obj.material.dispose()
				break
			}
		}
	}
}

function MainView() {
	this.switch_View('Front')
	this.$static.Scene.context.threeView = 'MainView'   // 判断现在是否使用贴图
	let interval = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50]
	let moduleAndSlot = GetModuleAndSlot.call(this);
	let max = new THREE.Vector3(0, 0, 0);
	let min = new THREE.Vector3(0, 0, 0);
	let mainSizeBox = new THREE.Box3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0));
	let indexOfVice = [];            //记录副杆的数组位置
	let indexOfConnector = [[], []]; //记录链接在各个杆体上的搭载设备的数组位置
	//确定各个model的包围盒
	// //console.log(moduleAndSlot);
	for (let i = 0; i < moduleAndSlot.length; i++) {
		GetBox(moduleAndSlot[i]);
		if (moduleAndSlot[i].classification == "横臂") {
			indexOfVice.push(i);
		}
		if (moduleAndSlot[i].classification == "主杆") {
			mainSizeBox.min = moduleAndSlot[i].box.min;
			mainSizeBox.max = moduleAndSlot[i].box.max;
		}
		if (moduleAndSlot[i].classification == "副杆") {
			mainSizeBox.max = moduleAndSlot[i].box.max;
		}
		GetTowVector3Max(max, moduleAndSlot[i].box.max);
		GetTowVector3Max(max, moduleAndSlot[i].box.min);
		GetTowVector3Min(min, moduleAndSlot[i].box.max);
		GetTowVector3Min(min, moduleAndSlot[i].box.min);
	}
	let baseLine = 0;
	let rate = 1;
	if (Math.abs(max.z) > Math.abs(min.z)) {
		baseLine = min.z;
		rate = -1;
	} else {
		baseLine = max.z;
		rate = 1;
	}
	//移除已有标注线
	ClearLineAndText.call(this);

	//计算横臂上搭载设施到地面的最小值
	let minHeight = new THREE.Vector3(mainSizeBox.max.x, mainSizeBox.max.y, mainSizeBox.max.z);

	let linePoints = []
	linePoints.push(new THREE.Vector3(6, 0, 0));
	linePoints.push(new THREE.Vector3(6, 0, 40));
	let geometry = new THREE.BufferGeometry().setFromPoints(linePoints);
	let line = new THREE.Line(geometry, new THREE.LineDashedMaterial({ color: 0xffff00, dashSize: 1, gapSize: 1 }));
	line.computeLineDistances();
	this.$static.Scene.lineorigin.add(line)

	linePoints = [];
	linePoints.push(new THREE.Vector3(6, 0, 0))
	linePoints.push(new THREE.Vector3(6, 1.4, 40))
	geometry = new THREE.BufferGeometry().setFromPoints(linePoints);
	line = new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: 0xffff00 }))
	line.computeLineDistances();
	this.$static.Scene.lineorigin.add(line);

	linePoints = []
	linePoints.push(new THREE.Vector3(6, 1, 0));
	linePoints.push(new THREE.Vector3(6, 1, -30));
	geometry = new THREE.BufferGeometry().setFromPoints(linePoints);
	line = new THREE.Line(geometry, new THREE.LineDashedMaterial({ color: 0xffff00, dashSize: 1, gapSize: 1 }));
	line.computeLineDistances();
	this.$static.Scene.lineorigin.add(line)


	let dir = new THREE.Vector3(0, 2, 0);
	dir.normalize();
	let origin = new THREE.Vector3(6, -3, 17);
	let length = 3;
	let hex = 0xffff00;
	let arrowHelper = new THREE.ArrowHelper(dir, origin, length, hex);
	this.$static.Scene.lineorigin.add(arrowHelper);
	dir = new THREE.Vector3(0, -1, 0);
	dir.normalize();
	origin = new THREE.Vector3(6, 3.2, 17);
	arrowHelper = new THREE.ArrowHelper(dir, origin, length, hex);
	this.$static.Scene.lineorigin.add(arrowHelper);

	let that = this;
	let matLite = new THREE.MeshBasicMaterial({
		color: 0xffff00,
		transparent: true,
		opacity: 0.4,
		side: THREE.DoubleSide
	});
	let message = "2%";
	let shapes = FONT.generateShapes(message, 1.5);
	geometry = new THREE.ShapeBufferGeometry(shapes);
	geometry.computeBoundingBox();
	let xMid = - 0.5 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x);
	geometry.translate(xMid, 0, 0);
	// make shape ( N.B. edge view not visible )
	let text = new THREE.Mesh(geometry, matLite);
	text.name = "text";
	text.rotation.y = Math.PI / 2;
	text.position.x = 6;
	text.position.y = -2;
	text.position.z = 23;
	that.$static.Scene.lineorigin.add(text);

	let color = 0xffff00;
	matLite = new THREE.MeshBasicMaterial({
		color: color,
		transparent: true,
		opacity: 0.4,
		side: THREE.DoubleSide
	});

	message = "道路基准线";
	shapes = FONT.generateShapes(message, 1.5);
	geometry = new THREE.ShapeBufferGeometry(shapes);
	geometry.computeBoundingBox();
	xMid = - 0.5 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x);
	geometry.translate(xMid, 0, 0);
	// make shape ( N.B. edge view not visible )
	text = new THREE.Mesh(geometry, matLite);
	text.name = "text";
	text.rotation.y = Math.PI / 2;
	text.position.x = 6;
	text.position.y = -3;
	text.position.z = 40;
	that.$static.Scene.lineorigin.add(text);

	message = "机动车道";
	shapes = FONT.generateShapes(message, 1.5);
	geometry = new THREE.ShapeBufferGeometry(shapes);
	geometry.computeBoundingBox();
	xMid = - 0.5 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x);
	geometry.translate(xMid, 0, 0);
	// make shape ( N.B. edge view not visible )
	text = new THREE.Mesh(geometry, matLite);
	text.name = "text";
	text.rotation.y = Math.PI / 2;
	text.position.x = 6;
	text.position.y = -3;
	text.position.z = 30;
	that.$static.Scene.lineorigin.add(text);

	message = "人行道";
	shapes = FONT.generateShapes(message, 1.5);
	geometry = new THREE.ShapeBufferGeometry(shapes);
	geometry.computeBoundingBox();
	xMid = - 0.5 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x);
	geometry.translate(xMid, 0, 0);
	// make shape ( N.B. edge view not visible )
	text = new THREE.Mesh(geometry, matLite);
	text.name = "text";
	text.rotation.y = Math.PI / 2;
	text.position.x = 6;
	text.position.y = -3;
	text.position.z = -20;
	that.$static.Scene.lineorigin.add(text);

	message = "人行道基准面";
	shapes = FONT.generateShapes(message, 1.5);
	geometry = new THREE.ShapeBufferGeometry(shapes);
	geometry.computeBoundingBox();
	xMid = - 0.5 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x);
	geometry.translate(xMid, 0, 0);
	// make shape ( N.B. edge view not visible )
	text = new THREE.Mesh(geometry, matLite);
	text.name = "text";
	text.rotation.y = Math.PI / 2;
	text.position.x = 6;
	text.position.y = 1;
	text.position.z = -30;
	that.$static.Scene.lineorigin.add(text);

	let checkPole = true
	for (let i = 0; i < moduleAndSlot.length; i++) {
		if ((moduleAndSlot[i].classification == "主杆" || moduleAndSlot[i].classification == "微型杆") && checkPole) {
			checkPole = false
			let points = [];
			let box = moduleAndSlot[i].box;
			points.push(new THREE.Vector3(6, box.min.y - interval[2], box.min.z));
			points.push(new THREE.Vector3(6, box.min.y - interval[2], box.max.z));
			let auxiliaryLinePoints1 = [];
			auxiliaryLinePoints1.push(new THREE.Vector3(6, box.min.y - interval[2] - 0.5, box.min.z));
			auxiliaryLinePoints1.push(new THREE.Vector3(6, box.min.y, box.min.z));
			let auxiliaryLinePoints2 = [];
			auxiliaryLinePoints2.push(new THREE.Vector3(6, box.min.y - interval[2] - 0.5, box.max.z));
			auxiliaryLinePoints2.push(new THREE.Vector3(6, box.min.y, box.max.z));
			DrawLine.call(this, points, Math.abs(box.min.z - box.max.z) * 100, auxiliaryLinePoints1, auxiliaryLinePoints2);

			points = [];
			points.push(new THREE.Vector3(0, box.min.y, baseLine + rate * interval[2]));
			points.push(new THREE.Vector3(0, box.max.y, baseLine + rate * interval[2]));
			auxiliaryLinePoints1 = [];
			auxiliaryLinePoints1.push(new THREE.Vector3(0, box.min.y, baseLine + rate * (interval[2] + 0.5)));
			auxiliaryLinePoints1.push(new THREE.Vector3(0, box.min.y, 0));
			auxiliaryLinePoints2 = [];
			auxiliaryLinePoints2.push(new THREE.Vector3(0, box.max.y, baseLine + rate * (interval[2] + 0.5)));
			auxiliaryLinePoints2.push(new THREE.Vector3(0, box.max.y, 0));
			DrawLine.call(this, points, Math.abs(box.min.y - box.max.y) * 100, auxiliaryLinePoints1, auxiliaryLinePoints2);

		} else if (moduleAndSlot[i].classification == "副杆") {
			let viceYLevel = 2
			let viceXLevel = 2
			// //console.log(moduleAndSlot[i]);
			let points = [];
			let box = moduleAndSlot[i].box;
			points.push(new THREE.Vector3(0, box.max.y + interval[viceYLevel], box.min.z));
			points.push(new THREE.Vector3(0, box.max.y + interval[viceYLevel], box.max.z));
			let auxiliaryLinePoints1 = [];
			auxiliaryLinePoints1.push(new THREE.Vector3(0, box.max.y + interval[viceYLevel] + 0.5, box.min.z));
			auxiliaryLinePoints1.push(new THREE.Vector3(0, box.max.y, box.min.z));
			let auxiliaryLinePoints2 = [];
			auxiliaryLinePoints2.push(new THREE.Vector3(0, box.max.y + interval[viceYLevel] + 0.5, box.max.z));
			auxiliaryLinePoints2.push(new THREE.Vector3(0, box.max.y, box.max.z));
			DrawLine.call(this, points, Math.abs(box.min.z - box.max.z) * 100, auxiliaryLinePoints1, auxiliaryLinePoints2);

			points = [];
			points.push(new THREE.Vector3(0, box.min.y, baseLine + rate * interval[viceXLevel]));
			points.push(new THREE.Vector3(0, box.max.y, baseLine + rate * interval[viceXLevel]));
			auxiliaryLinePoints1 = [];
			auxiliaryLinePoints1.push(new THREE.Vector3(0, box.min.y, baseLine + rate * (interval[viceXLevel] + 0.5)));
			auxiliaryLinePoints1.push(new THREE.Vector3(0, box.min.y, 0));
			auxiliaryLinePoints2 = [];
			auxiliaryLinePoints2.push(new THREE.Vector3(0, box.max.y, baseLine + rate * (interval[viceXLevel] + 0.5)));
			auxiliaryLinePoints2.push(new THREE.Vector3(0, box.max.y, 0));
			DrawLine.call(this, points, Math.abs(box.min.y - box.max.y) * 100, auxiliaryLinePoints1, auxiliaryLinePoints2);
		} else if (moduleAndSlot[i].classification === "灯臂") {
			let points = [];
			let box = moduleAndSlot[i].box;
			if ((box.max.z - box.min.z) < mainSizeBox.max.z * 4) {
				continue;
			}
			let long = Math.abs(box.max.z) > Math.abs(box.min.z) ? box.max.clone() : box.min.clone()
			long.y = Math.abs(box.max.y) > Math.abs(box.min.y) ? box.max.y : box.min.y
			points.push(new THREE.Vector3(0, moduleAndSlot[i].world_position.y + interval[3], 0));
			// //console.log(long)
			// let pointY = (((moduleAndSlot[i].property.length * (long.y - moduleAndSlot[i].world_position.y)) / Math.abs(long.z)) / 100)+ moduleAndSlot[i].world_position.y;
			// //console.log("pointy",pointY)
			points.push(new THREE.Vector3(0, moduleAndSlot[i].world_position.y + interval[3], long.z));
			let auxiliaryLinePoints1 = [];
			auxiliaryLinePoints1.push(new THREE.Vector3(0, moduleAndSlot[i].world_position.y + interval[3] + 0.5, 0));
			auxiliaryLinePoints1.push(new THREE.Vector3(0, moduleAndSlot[i].world_position.y, 0));
			let auxiliaryLinePoints2 = [];
			auxiliaryLinePoints2.push(new THREE.Vector3(0, moduleAndSlot[i].world_position.y + interval[3] + 0.5, long.z));
			auxiliaryLinePoints2.push(new THREE.Vector3(0, long.y, long.z));
			DrawLine.call(this, points, Math.abs(long.z) * 100, auxiliaryLinePoints1, auxiliaryLinePoints2);
		} else if (moduleAndSlot[i].classification == "搭载设备") {
			let connectedSlot = moduleAndSlot[i].connectedslot;

			if (connectedSlot.belong.classification == "连接件") {
				moduleAndSlot[i].belong = connectedSlot.belong.connectedslot.belong;
			} else {
				moduleAndSlot[i].belong = connectedSlot.belong;
			}
			if (moduleAndSlot[i].belong.classification == "主杆") {
				indexOfConnector[0].push(i);
			} else {
				let flag = false;
				for (let k = 1; k < indexOfConnector.length; k++) {
					if (indexOfConnector[k].length == 0) {
						indexOfConnector[k].push(i)
						flag = true;
						break;
					}
					if (moduleAndSlot[indexOfConnector[k][0]].belong == moduleAndSlot[i].belong) {
						indexOfConnector[k].push(i);
						flag = true;
						break;
					}
				}
				if (!flag) {
					let temp = []
					temp.push(i)
					indexOfConnector.push(temp);
				}
			}
		}
	}

	//画横臂的线
	for (let i = 0; i < indexOfVice.length; i++) {
		if (indexOfVice.length == 1) {
			let points = [];
			let box = moduleAndSlot[indexOfVice[i]].box;
			if ((box.max.z - box.min.z) < mainSizeBox.max.z * 4) {
				continue;
			}
			points.push(new THREE.Vector3(0, box.max.y - 1 + interval[3], 0));
			points.push(new THREE.Vector3(0, box.max.y - 1 + interval[3], Math.abs(box.max.z) > Math.abs(box.min.z) ? box.max.z : box.min.z));
			let auxiliaryLinePoints1 = [];
			auxiliaryLinePoints1.push(new THREE.Vector3(0, box.max.y - 1 + interval[3] + 0.5, 0));
			auxiliaryLinePoints1.push(new THREE.Vector3(0, box.min.y, 0));
			let auxiliaryLinePoints2 = [];
			auxiliaryLinePoints2.push(new THREE.Vector3(0, box.max.y - 1 + interval[3] + 0.5, Math.abs(box.max.z) > Math.abs(box.min.z) ? box.max.z : box.min.z));
			auxiliaryLinePoints2.push(new THREE.Vector3(0, box.max.y, Math.abs(box.max.z) > Math.abs(box.min.z) ? box.max.z : box.min.z));

			DrawLine.call(this, points, Math.abs(Math.abs(box.max.z) > Math.abs(box.min.z) ? box.max.z : box.min.z) * 100, auxiliaryLinePoints1, auxiliaryLinePoints2);

			points = [];
			points.push(new THREE.Vector3(0, 0, baseLine + rate * interval[0]));
			points.push(new THREE.Vector3(0, moduleAndSlot[i].world_position.y, baseLine + rate * interval[0]));
			auxiliaryLinePoints1 = [];
			auxiliaryLinePoints1.push(new THREE.Vector3(0, 0, baseLine + rate * (interval[0] + 0.5)));
			auxiliaryLinePoints1.push(new THREE.Vector3(0, 0, 0));
			auxiliaryLinePoints2 = [];
			auxiliaryLinePoints2.push(new THREE.Vector3(0, moduleAndSlot[i].world_position.y, baseLine + rate * (interval[0] + 0.5)));
			auxiliaryLinePoints2.push(new THREE.Vector3(0, moduleAndSlot[i].world_position.y, 0));
			DrawLine.call(this, points, moduleAndSlot[i].world_position.y * 100, auxiliaryLinePoints1, auxiliaryLinePoints2);
		} else {
			//排序
			for (let n = 0; n < indexOfVice.length - 1; n++) {
				for (let m = n + 1; m < indexOfVice.length; m++) {
					if (Math.abs(moduleAndSlot[indexOfVice[n]].world_position.y) > Math.abs(moduleAndSlot[indexOfVice[m]].world_position.y)) {
						let temp = moduleAndSlot[indexOfVice[m]];
						moduleAndSlot[indexOfVice[m]] = moduleAndSlot[indexOfVice[n]];
						moduleAndSlot[indexOfVice[n]] = temp;
					}
				}
			}
			let points = [];
			let box = moduleAndSlot[indexOfVice[i]].box;
			if ((box.max.z - box.min.z) < mainSizeBox.max.z * 4) {
				continue;
			}


			points.push(new THREE.Vector3(0, box.max.y - 1 + interval[3], 0));
			points.push(new THREE.Vector3(0, box.max.y - 1 + interval[3], Math.abs(box.max.z) > Math.abs(box.min.z) ? box.max.z : box.min.z));
			let auxiliaryLinePoints1 = [];
			auxiliaryLinePoints1.push(new THREE.Vector3(0, box.max.y - 1 + interval[3] + 0.5, 0));
			auxiliaryLinePoints1.push(new THREE.Vector3(0, box.max.y - 1, 0));
			let auxiliaryLinePoints2 = [];
			auxiliaryLinePoints2.push(new THREE.Vector3(0, box.max.y - 1 + interval[3] + 0.5, Math.abs(box.max.z) > Math.abs(box.min.z) ? box.max.z : box.min.z));
			auxiliaryLinePoints2.push(new THREE.Vector3(0, box.max.y - 1, Math.abs(box.max.z) > Math.abs(box.min.z) ? box.max.z : box.min.z));
			DrawLine.call(this, points, Math.abs(Math.abs(box.max.z) > Math.abs(box.min.z) ? box.max.z : box.min.z) * 100, auxiliaryLinePoints1, auxiliaryLinePoints2);

			points = [];
			points.push(new THREE.Vector3(0, i === 0 ? 0 : moduleAndSlot[indexOfVice[i - 1]].world_position.y, baseLine + rate * (interval[1])));
			points.push(new THREE.Vector3(0, moduleAndSlot[indexOfVice[i]].world_position.y, baseLine + rate * interval[1]));
			auxiliaryLinePoints1 = [];
			auxiliaryLinePoints1.push(new THREE.Vector3(0, i === 0 ? 0 : moduleAndSlot[indexOfVice[i - 1]].world_position.y, baseLine + rate * (interval[1] + 0.5)));
			auxiliaryLinePoints1.push(new THREE.Vector3(0, i === 0 ? 0 : moduleAndSlot[indexOfVice[i - 1]].world_position.y, 0));
			auxiliaryLinePoints2 = [];
			auxiliaryLinePoints2.push(new THREE.Vector3(0, moduleAndSlot[indexOfVice[i]].world_position.y, baseLine + rate * (interval[1] + 0.5)));
			auxiliaryLinePoints2.push(new THREE.Vector3(0, moduleAndSlot[indexOfVice[i]].world_position.y, 0));
			DrawLine.call(this, points, i === 0 ? moduleAndSlot[indexOfVice[i]].world_position.y * 100 : Math.round(Math.abs(moduleAndSlot[indexOfVice[i]].world_position.y - moduleAndSlot[indexOfVice[i - 1]].world_position.y)) * 100, auxiliaryLinePoints1, auxiliaryLinePoints2);
		}
	}

	//画搭载设施的线
	for (let i = 0; i < indexOfConnector.length; i++) {
		if (i == 0 && indexOfConnector[0].length != 0) {
			if (indexOfConnector[i].length == 1) {
				let connectorOfpole = 0;
				let points = [];

				points.push(new THREE.Vector3(0, 0, baseLine + rate * (interval[connectorOfpole])));
				points.push(new THREE.Vector3(0, moduleAndSlot[indexOfConnector[0][0]].world_position.y, baseLine + rate * (interval[connectorOfpole])));
				let auxiliaryLinePoints1 = [];
				auxiliaryLinePoints1.push(new THREE.Vector3(0, 0, baseLine + rate * (interval[connectorOfpole] + 0.5)));
				auxiliaryLinePoints1.push(new THREE.Vector3(0, 0, 0));
				let auxiliaryLinePoints2 = [];
				auxiliaryLinePoints2.push(new THREE.Vector3(0, moduleAndSlot[indexOfConnector[i][0]].world_position.y, baseLine + rate * (interval[connectorOfpole] + 0.5)));
				auxiliaryLinePoints2.push(new THREE.Vector3(0, moduleAndSlot[indexOfConnector[i][0]].world_position.y, 0));
				DrawLine.call(this, points, Math.abs(0 - moduleAndSlot[indexOfConnector[i][0]]) * 100, auxiliaryLinePoints1, auxiliaryLinePoints2);
			} else {
				let connectorOfVice = 0;
				//排序
				for (let n = 0; n < indexOfConnector[0].length - 1; n++) {
					for (let m = n + 1; m < indexOfConnector[0].length; m++) {
						if (Math.abs(moduleAndSlot[indexOfConnector[0][n]].world_position.y) > Math.abs(moduleAndSlot[indexOfConnector[0][m]].world_position.y)) {
							let temp = moduleAndSlot[indexOfConnector[0][m]];
							moduleAndSlot[indexOfConnector[0][m]] = moduleAndSlot[indexOfConnector[0][n]];
							moduleAndSlot[indexOfConnector[0][n]] = temp;
						}
					}
				}
				for (let n = 0; n < indexOfConnector[0].length; n++) {
					let points = [];
					points.push(new THREE.Vector3(0, moduleAndSlot[indexOfConnector[0][n]].world_position.y, baseLine + interval[connectorOfVice]));
					points.push(new THREE.Vector3(0, n === 0 ? 0 : moduleAndSlot[indexOfConnector[0][n - 1]].world_position.y, baseLine + interval[connectorOfVice]));
					let auxiliaryLinePoints1 = [];
					auxiliaryLinePoints1.push(new THREE.Vector3(0, moduleAndSlot[indexOfConnector[0][n]].world_position.y, baseLine + rate * (interval[connectorOfVice] + 0.5)));
					auxiliaryLinePoints1.push(new THREE.Vector3(0, moduleAndSlot[indexOfConnector[0][n]].world_position.y, 0));
					let auxiliaryLinePoints2 = [];
					auxiliaryLinePoints2.push(new THREE.Vector3(0, n === 0 ? 0 : moduleAndSlot[indexOfConnector[0][n - 1]].world_position.y, baseLine + rate * (interval[connectorOfVice] + 0.5)));
					auxiliaryLinePoints2.push(new THREE.Vector3(0, n === 0 ? 0 : moduleAndSlot[indexOfConnector[0][n - 1]].world_position.y, 0));
					DrawLine.call(this, points, Math.round(Math.abs((n === 0 ? 0 : moduleAndSlot[indexOfConnector[0][n - 1]].world_position.y) - moduleAndSlot[indexOfConnector[0][n]].world_position.y) * 100), auxiliaryLinePoints1, auxiliaryLinePoints2);
				}
			}
		} else if (i > 0 && indexOfConnector[i].length != 0) {

			let parent = moduleAndSlot[indexOfConnector[i][0]].belong;
			if (indexOfConnector[i].length == 1) {
				let connectorOfVice = 2;
				let points = [];
				let box = moduleAndSlot[indexOfConnector[i][0]].box;
				if (Math.abs(moduleAndSlot[indexOfConnector[i][0]].world_position.z) < mainSizeBox.max.z * 2) {
					continue;
				}
				points.push(new THREE.Vector3(0, moduleAndSlot[indexOfConnector[i][0]].world_position.y + interval[connectorOfVice], moduleAndSlot[indexOfConnector[i][0]].world_position.z));
				points.push(new THREE.Vector3(0, moduleAndSlot[indexOfConnector[i][0]].world_position.y + interval[connectorOfVice], 0));
				let auxiliaryLinePoints1 = [];
				auxiliaryLinePoints1.push(new THREE.Vector3(0, moduleAndSlot[indexOfConnector[i][0]].world_position.y + interval[connectorOfVice] + 0.5, moduleAndSlot[indexOfConnector[i][0]].world_position.z));
				auxiliaryLinePoints1.push(new THREE.Vector3(0, moduleAndSlot[indexOfConnector[i][0]].world_position.y, moduleAndSlot[indexOfConnector[i][0]].world_position.z));
				let auxiliaryLinePoints2 = [];
				auxiliaryLinePoints2.push(new THREE.Vector3(0, moduleAndSlot[indexOfConnector[i][0]].world_position.y + interval[connectorOfVice] + 0.5, 0));
				auxiliaryLinePoints2.push(new THREE.Vector3(0, moduleAndSlot[indexOfConnector[i][0]].world_position.y, 0));
				DrawLine.call(this, points, Math.round(Math.abs(0 - moduleAndSlot[indexOfConnector[i][0]].world_position.z) * 100), auxiliaryLinePoints1, auxiliaryLinePoints2);

				let lowest = box.max.y > box.min.y ? box.min : box.max;
				minHeight = minHeight.y > lowest.y ? lowest : minHeight;

			} else {
				let parent = moduleAndSlot[indexOfConnector[i][0]].belong;
				let connectorOfVice = 2;
				//排序
				for (let n = 0; n < indexOfConnector[i].length - 1; n++) {
					for (let m = n + 1; m < indexOfConnector[i].length; m++) {
						if (Math.abs(moduleAndSlot[indexOfConnector[i][n]].world_position.z) > Math.abs(moduleAndSlot[indexOfConnector[i][m]].world_position.z)) {
							let temp = moduleAndSlot[indexOfConnector[i][m]];
							moduleAndSlot[indexOfConnector[i][m]] = moduleAndSlot[indexOfConnector[i][n]];
							moduleAndSlot[indexOfConnector[i][n]] = temp;
						}
					}
				}

				for (let n = 0; n < indexOfConnector[i].length; n++) {
					let points = [];
					let box = moduleAndSlot[indexOfConnector[i][n]].box;
					if (Math.abs(moduleAndSlot[indexOfConnector[i][n]].world_position.z) < mainSizeBox.max.z * 2) {
						continue;
					}
					points.push(new THREE.Vector3(0, moduleAndSlot[indexOfConnector[i][0]].world_position.y + interval[connectorOfVice], moduleAndSlot[indexOfConnector[i][n]].world_position.z));
					points.push(new THREE.Vector3(0, moduleAndSlot[indexOfConnector[i][0]].world_position.y + interval[connectorOfVice], n === 0 ? 0 : moduleAndSlot[indexOfConnector[i][n - 1]].world_position.z));
					let auxiliaryLinePoints1 = [];
					auxiliaryLinePoints1.push(new THREE.Vector3(0, moduleAndSlot[indexOfConnector[i][0]].world_position.y + interval[connectorOfVice] + 0.5, moduleAndSlot[indexOfConnector[i][n]].world_position.z));
					auxiliaryLinePoints1.push(new THREE.Vector3(0, moduleAndSlot[indexOfConnector[i][0]].world_position.y, moduleAndSlot[indexOfConnector[i][n]].world_position.z));
					let auxiliaryLinePoints2 = [];
					auxiliaryLinePoints2.push(new THREE.Vector3(0, moduleAndSlot[indexOfConnector[i][0]].world_position.y + interval[connectorOfVice] + 0.5, n === 0 ? 0 : moduleAndSlot[indexOfConnector[i][n] - 1].world_position.z));
					auxiliaryLinePoints2.push(new THREE.Vector3(0, moduleAndSlot[indexOfConnector[i][0]].world_position.y, n === 0 ? 0 : moduleAndSlot[indexOfConnector[i][n - 1]].world_position.z));
					DrawLine.call(this, points, Math.round(Math.abs((n === 0 ? 0 : moduleAndSlot[indexOfConnector[i][n] - 1].world_position.z) - moduleAndSlot[indexOfConnector[i][n]].world_position.z) * 100), auxiliaryLinePoints1, auxiliaryLinePoints2);

					let lowest = box.min.clone();
					lowest.z = moduleAndSlot[indexOfConnector[i][n]].world_position.z
					minHeight = minHeight.y > lowest.y ? lowest : minHeight;
				}
			}
		}
	}

	if (minHeight.y != mainSizeBox.max.y) {
		let points = [];
		if (minHeight.z > 0) {
			rate = 1;
		} else {
			rate = -1;
		}
		points.push(new THREE.Vector3(0, minHeight.y, minHeight.z - rate * interval[0]));
		points.push(new THREE.Vector3(0, 0, minHeight.z - rate * interval[0]));
		let auxiliaryLinePoints1 = [];
		auxiliaryLinePoints1.push(new THREE.Vector3(0, minHeight.y, minHeight.z - rate * (interval[0] + 0.5)));
		auxiliaryLinePoints1.push(new THREE.Vector3(0, minHeight.y, minHeight.z));
		let auxiliaryLinePoints2 = [];
		auxiliaryLinePoints2.push(new THREE.Vector3(0, 0, 0));
		auxiliaryLinePoints2.push(new THREE.Vector3(0, 0, minHeight.z - rate * (interval[0] + 0.5)));
		DrawLine.call(this, points, Math.round(Math.abs(minHeight.y) * 100), auxiliaryLinePoints1, auxiliaryLinePoints2);
	}
}

function TopView() {
	this.switch_View('Top')
	this.$static.Scene.context.threeView = 'TopView'
	let interval = [5, 10, 15, 20]
	let moduleAndSlot = GetModuleAndSlot.call(this);
	let max = new THREE.Vector3(0, 0, 0);
	let min = new THREE.Vector3(0, 0, 0);
	let mainSizeBox = new THREE.Box3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0));
	let indexOfVice = [];            //记录副杆的数组位置
	//确定各个model的包围盒
	// //console.log(moduleAndSlot);
	for (let i = 0; i < moduleAndSlot.length; i++) {
		// let length = moduleAndSlot[i].property.length;
		// let topDiameter = moduleAndSlot[i].property.topDiameter;
		// let bottomDiameter = moduleAndSlot[i].property.bottomDiameter;
		GetBox(moduleAndSlot[i]);
		if (moduleAndSlot[i].classification == "横臂") {
			indexOfVice.push(i);
		}
		// moduleAndSlot[i].box = box;
		// let box = new THREE.Box3();
		// box.setFromObject(moduleAndSlot[i].model);
		// //console.log(box)
		GetTowVector3Max(max, moduleAndSlot[i].box.max);
		GetTowVector3Min(min, moduleAndSlot[i].box.min);
	}

	//移除已有标注线
	ClearLineAndText.call(this);
	let flag = true;
	for (let i = 0; i < moduleAndSlot.length; i++) {
		if (moduleAndSlot[i].classification === "灯臂") {
			let level = 0
			let points = [];
			let auxiliaryLinePoints1 = [];
			let auxiliaryLinePoints2 = [];
			let box = moduleAndSlot[i].box;
			let y = box.max.y;
			if (Math.abs(box.max.x - box.min.x) > Math.abs(box.max.z - box.min.z)) {
				let long = Math.abs(box.max.x) > Math.abs(box.min.x) ? box.max.clone() : box.min.clone();
				long.z = Math.abs(box.max.z) > Math.abs(box.min.z) ? box.max.z : box.min.z;

				points.push(new THREE.Vector3(0, y, long.z > 0 ? max.z + interval[level] : min.z - interval[level]));
				points.push(new THREE.Vector3(long.x, y, long.z > 0 ? max.z + interval[level] : min.z - interval[level]));
				auxiliaryLinePoints1.push(new THREE.Vector3(0, y, 0));
				auxiliaryLinePoints1.push(new THREE.Vector3(0, y, long.z > 0 ? max.z + interval[level] : min.z - interval[level]));
				auxiliaryLinePoints2.push(new THREE.Vector3(long.x, y, long.z > 0 ? max.z + interval[level] : min.z - interval[level]));
				auxiliaryLinePoints2.push(new THREE.Vector3(long.x, y, long.z));

				DrawLineTop.call(this, points, Math.abs(long.x) * 100, auxiliaryLinePoints1, auxiliaryLinePoints2);

			} else {
				let long = Math.abs(box.max.x) > Math.abs(box.min.x) ? box.max.clone() : box.min.clone();
				long.z = Math.abs(box.max.z) > Math.abs(box.min.z) ? box.max.z : box.min.z;

				points.push(new THREE.Vector3(long.x > 0 ? max.x + interval[level] : min.x - interval[level], y, 0));
				points.push(new THREE.Vector3(long.x > 0 ? max.x + interval[level] : min.x - interval[level], y, long.z));
				auxiliaryLinePoints1.push(new THREE.Vector3(0, y, 0));
				auxiliaryLinePoints1.push(new THREE.Vector3(long.x > 0 ? max.x + interval[level] : min.x - interval[level], y, 0));
				auxiliaryLinePoints2.push(new THREE.Vector3(long.x > 0 ? max.x + interval[level] : min.x - interval[level], y, long.z));
				auxiliaryLinePoints2.push(new THREE.Vector3(long.x, y, long.z));
				DrawLineTop.call(this, points, Math.abs(long.z) * 100, auxiliaryLinePoints1, auxiliaryLinePoints2);
			}
		} else if (moduleAndSlot[i].classification === "横臂" && flag) {
			flag = false
			let level = 1
			let points = [];
			let auxiliaryLinePoints1 = [];
			let auxiliaryLinePoints2 = [];
			let box = moduleAndSlot[i].box;
			let y = moduleAndSlot[i].world_position.y;
			if (Math.abs(box.max.x - box.min.x) > Math.abs(box.max.z - box.min.z)) {
				let long = Math.abs(box.max.x) > Math.abs(box.min.x) ? box.max.clone() : box.min.clone();
				long.z = Math.abs(box.max.z) > Math.abs(box.min.z) ? box.max.z : box.min.z;

				points.push(new THREE.Vector3(0, y, long.z > 0 ? max.z + interval[level] : min.z - interval[level]));
				points.push(new THREE.Vector3(long.x, y, long.z > 0 ? max.z + interval[level] : min.z - interval[level]));
				auxiliaryLinePoints1.push(new THREE.Vector3(0, y, 0));
				auxiliaryLinePoints1.push(new THREE.Vector3(0, y, long.z > 0 ? max.z + interval[level] : min.z - interval[level]));
				auxiliaryLinePoints2.push(new THREE.Vector3(long.x, y, long.z > 0 ? max.z + interval[level] : min.z - interval[level]));
				auxiliaryLinePoints2.push(new THREE.Vector3(long.x, y, 0));

				DrawLineTop.call(this, points, Math.abs(long.x) * 100, auxiliaryLinePoints1, auxiliaryLinePoints2);

			} else {
				let long = Math.abs(box.max.x) > Math.abs(box.min.x) ? box.max.clone() : box.min.clone();
				long.z = Math.abs(box.max.z) > Math.abs(box.min.z) ? box.max.z : box.min.z;

				points.push(new THREE.Vector3(long.x > 0 ? max.x + interval[level] : min.x - interval[level], y, 0));
				points.push(new THREE.Vector3(long.x > 0 ? max.x + interval[level] : min.x - interval[level], y, long.z));
				auxiliaryLinePoints1.push(new THREE.Vector3(0, y, 0));
				auxiliaryLinePoints1.push(new THREE.Vector3(long.x > 0 ? max.x + interval[level] : min.x - interval[level], y, 0));
				auxiliaryLinePoints2.push(new THREE.Vector3(long.x > 0 ? max.x + interval[level] : min.x - interval[level], y, long.z));
				auxiliaryLinePoints2.push(new THREE.Vector3(0, y, long.z));
				DrawLineTop.call(this, points, Math.abs(long.z) * 100, auxiliaryLinePoints1, auxiliaryLinePoints2);
			}
		}
	}
}

function LeftView() {
	this.switch_View('Left')
	this.$static.Scene.context.threeView = 'LeftView'
	let interval = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50]
	let moduleAndSlot = GetModuleAndSlot.call(this);
	let max = new THREE.Vector3(0, 0, 0);
	let min = new THREE.Vector3(0, 0, 0);
	let mainSizeBox = new THREE.Box3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0));
	let indexOfVice = [];            //记录副杆的数组位置
	let indexOfConnector = [[], []]; //记录链接在各个杆体上的搭载设备的数组位置
	//确定各个model的包围盒
	for (let i = 0; i < moduleAndSlot.length; i++) {
		// let length = moduleAndSlot[i].property.length;
		// let topDiameter = moduleAndSlot[i].property.topDiameter;
		// let bottomDiameter = moduleAndSlot[i].property.bottomDiameter;
		GetBox(moduleAndSlot[i]);
		if (moduleAndSlot[i].classification == "横臂") {
			indexOfVice.push(i);
		}
		// moduleAndSlot[i].box = box;
		// let box = new THREE.Box3();
		// box.setFromObject(moduleAndSlot[i].model);
		// //console.log(box)
		if (moduleAndSlot[i].classification == "主杆") {
			mainSizeBox.min = moduleAndSlot[i].box.min;
			mainSizeBox.max = moduleAndSlot[i].box.max;
		}
		if (moduleAndSlot[i].classification == "副杆") {
			mainSizeBox.max = moduleAndSlot[i].box.max;
		}
		GetTowVector3Max(max, moduleAndSlot[i].box.max);
		GetTowVector3Max(max, moduleAndSlot[i].box.min);
		GetTowVector3Min(min, moduleAndSlot[i].box.max);
		GetTowVector3Min(min, moduleAndSlot[i].box.min);
	}

	let baseLine = 0;
	let rate = 1;
	if (Math.abs(max.x) > Math.abs(min.x)) {
		baseLine = min.x;
		rate = -1;
	} else {
		baseLine = max.x;
		rate = 1;
	}

	//移除已有标注线
	ClearLineAndText.call(this);

	for (let i = 0; i < moduleAndSlot.length; i++) {
		if (moduleAndSlot[i].classification == "副杆") {
			let viceYLevel = 2
			let viceXLevel = 0
			// //console.log(moduleAndSlot[i]);
			let points = [];
			let box = moduleAndSlot[i].box;
			// points.push(new THREE.Vector3(box.min.x, box.max.y + interval[viceYLevel], 0));
			// points.push(new THREE.Vector3(box.max.x, box.max.y + interval[viceYLevel], 0));
			// let auxiliaryLinePoints1 = [];
			// auxiliaryLinePoints1.push(new THREE.Vector3(box.min.x, box.max.y + interval[viceYLevel] + 0.5, 0));
			// auxiliaryLinePoints1.push(new THREE.Vector3(box.min.x, box.max.y, 0));
			// let auxiliaryLinePoints2 = [];
			// auxiliaryLinePoints2.push(new THREE.Vector3(0, box.max.y + interval[viceYLevel] + 0.5, box.max.z));
			// auxiliaryLinePoints2.push(new THREE.Vector3(0, box.max.y, box.max.z));
			// DrawLineLeft.call(this, points, Math.abs(box.min.z - box.max.z) * 100, auxiliaryLinePoints1, auxiliaryLinePoints2);
			points.push(new THREE.Vector3(baseLine + rate * interval[viceXLevel], box.min.y, 0));
			points.push(new THREE.Vector3(baseLine + rate * interval[viceXLevel], box.max.y, 0));
			let auxiliaryLinePoints1 = [];
			auxiliaryLinePoints1.push(new THREE.Vector3(0, box.min.y, 0));
			auxiliaryLinePoints1.push(new THREE.Vector3(baseLine + rate * (interval[viceXLevel] + 0.5), box.min.y, 0));
			let auxiliaryLinePoints2 = [];
			auxiliaryLinePoints2.push(new THREE.Vector3(0, box.max.y, 0));
			auxiliaryLinePoints2.push(new THREE.Vector3(baseLine + rate * (interval[viceXLevel] + 0.5), box.max.y, 0));
			DrawLineLeft.call(this, points, Math.abs(box.min.y - box.max.y) * 100, auxiliaryLinePoints1, auxiliaryLinePoints2);
		} else if (moduleAndSlot[i].classification === "灯臂") {
			let points = [];
			let box = moduleAndSlot[i].box;
			let long = Math.abs(box.max.x) > Math.abs(box.min.x) ? box.max.clone() : box.min.clone()
			long.x = Math.abs(box.max.x) > Math.abs(box.min.x) ? box.max.x : box.min.x
			long.y = box.max.y
			if (Math.abs(long.x) <= 1.5 * mainSizeBox.max.x) {
				continue;
			}
			points.push(new THREE.Vector3(0, moduleAndSlot[i].world_position.y + interval[3], 0));
			// //console.log(long)
			// let pointY = (((moduleAndSlot[i].property.length * (long.y - moduleAndSlot[i].world_position.y)) / Math.abs(long.z)) / 100)+ moduleAndSlot[i].world_position.y;
			// //console.log("pointy",pointY)
			points.push(new THREE.Vector3(long.x, moduleAndSlot[i].world_position.y + interval[3], 0));
			let auxiliaryLinePoints1 = [];
			auxiliaryLinePoints1.push(new THREE.Vector3(0, moduleAndSlot[i].world_position.y + interval[3] + 0.5, 0));
			auxiliaryLinePoints1.push(new THREE.Vector3(0, moduleAndSlot[i].world_position.y, 0));
			let auxiliaryLinePoints2 = [];
			auxiliaryLinePoints2.push(new THREE.Vector3(long.x, moduleAndSlot[i].world_position.y + interval[3] + 0.5, 0));
			auxiliaryLinePoints2.push(new THREE.Vector3(long.x, long.y, 0));
			DrawLineLeft.call(this, points, Math.abs(long.x) * 100, auxiliaryLinePoints1, auxiliaryLinePoints2);
		} else if (moduleAndSlot[i].classification == "搭载设备") {
			let connectedSlot = moduleAndSlot[i].connectedslot;
			if (connectedSlot.belong.classification == "连接件") {
				moduleAndSlot[i].belong = connectedSlot.belong.connectedslot.belong;
			} else {
				moduleAndSlot[i].belong = connectedSlot.belong;
			}
			if (moduleAndSlot[i].belong.classification == "主杆") {
				indexOfConnector[0].push(i);
			} else {
				let flag = false;
				for (let k = 1; k < indexOfConnector.length; k++) {
					if (indexOfConnector[k].length == 0) {
						indexOfConnector[k].push(i)
						flag = true;
						break;
					}
					if (moduleAndSlot[indexOfConnector[k][0]].belong == moduleAndSlot[i].belong) {
						indexOfConnector[k].push(i);
						flag = true;
						break;
					}
				}
				if (!flag) {
					let temp = []
					temp.push(i)
					indexOfConnector.push(temp);
				}
			}
		}
	}

	//画横臂的线
	for (let i = 0; i < indexOfVice.length; i++) {
		if (indexOfVice.length == 1) {
			let points = [];
			let box = moduleAndSlot[indexOfVice[i]].box;
			// //console.log(moduleAndSlot[indexOfVice[i]])
			if ((box.max.x - box.min.x) < mainSizeBox.max.x * 4) {
				continue;
			}
			// //console.log("^^",(box.max.x-box.min.x),mainSizeBox.max.x * 4)
			points.push(new THREE.Vector3(0, (box.max.y + box.min.y) / 2 + interval[3], 0));
			points.push(new THREE.Vector3(Math.abs(box.max.x) > Math.abs(box.min.x) ? box.max.x : box.min.x, (box.max.y + box.min.y) / 2 + interval[3], 0));
			let auxiliaryLinePoints1 = [];
			auxiliaryLinePoints1.push(new THREE.Vector3(0, (box.max.y + box.min.y) / 2 + interval[3] + 0.5, 0));
			auxiliaryLinePoints1.push(new THREE.Vector3(0, box.min.y, 0));
			let auxiliaryLinePoints2 = [];
			auxiliaryLinePoints2.push(new THREE.Vector3(Math.abs(box.max.x) > Math.abs(box.min.x) ? box.max.x : box.min.x, (box.max.y + box.min.y) / 2 + interval[3] + 0.5, 0));
			auxiliaryLinePoints2.push(new THREE.Vector3(Math.abs(box.max.x) > Math.abs(box.min.x) ? box.max.x : box.min.x, box.max.y, 0));
			DrawLineLeft.call(this, points, Math.abs(Math.abs(box.max.x) > Math.abs(box.min.x) ? box.max.x : box.min.x) * 100, auxiliaryLinePoints1, auxiliaryLinePoints2);

			points = [];
			points.push(new THREE.Vector3(baseLine + rate * interval[0], 0, 0));
			points.push(new THREE.Vector3(baseLine + rate * interval[0], moduleAndSlot[indexOfVice[i]].world_position.y, 0));
			auxiliaryLinePoints1 = [];
			auxiliaryLinePoints1.push(new THREE.Vector3(baseLine + rate * (interval[0] + 0.5), 0, 0));
			auxiliaryLinePoints1.push(new THREE.Vector3(0, 0, 0));
			auxiliaryLinePoints2 = [];
			auxiliaryLinePoints2.push(new THREE.Vector3(baseLine + rate * (interval[0] + 0.5), moduleAndSlot[indexOfVice[i]].world_position.y, 0));
			auxiliaryLinePoints2.push(new THREE.Vector3(0, moduleAndSlot[indexOfVice[i]].world_position.y, 0));
			DrawLineLeft.call(this, points, moduleAndSlot[indexOfVice[i]].world_position.y * 100, auxiliaryLinePoints1, auxiliaryLinePoints2);
		} else {
			//排序
			for (let n = 0; n < indexOfVice.length - 1; n++) {
				for (let m = n + 1; m < indexOfVice.length; m++) {
					if (Math.abs(moduleAndSlot[indexOfVice[n]].world_position.y) > Math.abs(moduleAndSlot[indexOfVice[m]].world_position.y)) {
						let temp = moduleAndSlot[indexOfVice[m]];
						moduleAndSlot[indexOfVice[m]] = moduleAndSlot[indexOfVice[n]];
						moduleAndSlot[indexOfVice[n]] = temp;
					}
				}
			}
			let points = [];
			let box = moduleAndSlot[indexOfVice[i]].box;

			if (Math.abs(box.max.x) < mainSizeBox.max.x * 2) {
				continue;
			}
			points.push(new THREE.Vector3(0, box.max.y - 1 + interval[3], 0));
			points.push(new THREE.Vector3(Math.abs(box.max.x) > Math.abs(box.min.x) ? box.max.x : box.min.x, box.max.y - 1 + interval[3], 0));
			let auxiliaryLinePoints1 = [];
			auxiliaryLinePoints1.push(new THREE.Vector3(0, box.max.y - 1 + interval[3] + 0.5, 0));
			auxiliaryLinePoints1.push(new THREE.Vector3(0, box.min.y, 0));
			let auxiliaryLinePoints2 = [];
			auxiliaryLinePoints2.push(new THREE.Vector3(Math.abs(box.max.x) > Math.abs(box.min.x) ? box.max.x : box.min.x, box.max.y - 1 + interval[3] + 0.5, 0));
			auxiliaryLinePoints2.push(new THREE.Vector3(Math.abs(box.max.x) > Math.abs(box.min.x) ? box.max.x : box.min.x, box.max.y - 1, 0));
			DrawLineLeft.call(this, points, Math.abs(Math.abs(box.max.x) > Math.abs(box.min.x) ? box.max.x : box.min.x) * 100, auxiliaryLinePoints1, auxiliaryLinePoints2);

			points = [];
			points.push(new THREE.Vector3(baseLine + rate * interval[1], i === 0 ? 0 : moduleAndSlot[indexOfVice[i - 1]].world_position.y, 0));
			points.push(new THREE.Vector3(baseLine + rate * interval[1], moduleAndSlot[indexOfVice[i]].world_position.y, 0));
			auxiliaryLinePoints1 = [];
			auxiliaryLinePoints1.push(new THREE.Vector3(baseLine + rate * (interval[1] + 0.5), i === 0 ? 0 : moduleAndSlot[indexOfVice[i - 1]].world_position.y, 0));
			auxiliaryLinePoints1.push(new THREE.Vector3(0, i === 0 ? 0 : moduleAndSlot[indexOfVice[i - 1]].world_position.y, 0));
			auxiliaryLinePoints2 = [];
			auxiliaryLinePoints2.push(new THREE.Vector3(baseLine + rate * (interval[1] + 0.5), moduleAndSlot[indexOfVice[i]].world_position.y, 0));
			auxiliaryLinePoints2.push(new THREE.Vector3(0, moduleAndSlot[indexOfVice[i]].world_position.y, 0));
			DrawLineLeft.call(this, points, i === 0 ? moduleAndSlot[indexOfVice[i]].world_position.y * 100 : Math.round(Math.abs(moduleAndSlot[indexOfVice[i]].world_position.y - moduleAndSlot[indexOfVice[i - 1]].world_position.y)) * 100, auxiliaryLinePoints1, auxiliaryLinePoints2);
		}
	}

	if (indexOfVice.length != 0) {

		let i = indexOfVice.length - 1;
		let viceYLevel = 3;
		let points = [];
		let box = moduleAndSlot[indexOfVice[i]].box;

		if (Math.abs(box.max.x) > Math.abs(box.min.x) ? Math.abs(box.max.x) : Math.abs(box.min.x) < mainSizeBox.max.x * 2) {
		} else {
			points.push(new THREE.Vector3(0, box.max.y - 1 + interval[viceYLevel], 0));
			points.push(new THREE.Vector3(Math.abs(box.max.x) > Math.abs(box.min.x) ? box.max.x : box.min.x, box.max.y - 1 + interval[viceYLevel], 0));
			let auxiliaryLinePoints1 = [];
			auxiliaryLinePoints1.push(new THREE.Vector3(0, box.max.y - 1 + interval[viceYLevel] + 0.5, 0));
			auxiliaryLinePoints1.push(new THREE.Vector3(0, box.max.y - 1, 0));
			let auxiliaryLinePoints2 = [];
			auxiliaryLinePoints2.push(new THREE.Vector3(Math.abs(box.max.x) > Math.abs(box.min.x) ? box.max.x : box.min.x, box.max.y - 1 + interval[viceYLevel] + 0.5, 0));
			auxiliaryLinePoints2.push(new THREE.Vector3(Math.abs(box.max.x) > Math.abs(box.min.x) ? box.max.x : box.min.x, box.max.y - 1, 0));
			DrawLineLeft.call(this, points, Math.abs(Math.abs(box.max.x) > Math.abs(box.min.x) ? box.max.x : box.min.x) * 100, auxiliaryLinePoints1, auxiliaryLinePoints2);
		}
	}


	//画搭载设施的线
	for (let i = 0; i < indexOfConnector.length; i++) {
		if (i == 0 && indexOfConnector[0].length != 0) {
			let connectorOfVice = 2;

			for (let n = 0; n < indexOfConnector[0].length; n++) {
				if (Math.abs(moduleAndSlot[indexOfConnector[0][0]].world_position.x) < mainSizeBox.max.x * 1.5) {
					continue;
				}
				let points = [];
				points.push(new THREE.Vector3(moduleAndSlot[indexOfConnector[0][n]].world_position.x, moduleAndSlot[indexOfConnector[0][n]].world_position.y + interval[connectorOfVice], 0));
				points.push(new THREE.Vector3(0, moduleAndSlot[indexOfConnector[0][n]].world_position.y + interval[connectorOfVice], 0));
				let auxiliaryLinePoints1 = [];
				auxiliaryLinePoints1.push(new THREE.Vector3(moduleAndSlot[indexOfConnector[0][n]].world_position.x, moduleAndSlot[indexOfConnector[0][n]].world_position.y + interval[connectorOfVice], 0));
				auxiliaryLinePoints1.push(new THREE.Vector3(moduleAndSlot[indexOfConnector[0][n]].world_position.x, moduleAndSlot[indexOfConnector[0][n]].world_position.y, 0));
				let auxiliaryLinePoints2 = [];
				auxiliaryLinePoints2.push(new THREE.Vector3(0, moduleAndSlot[indexOfConnector[0][n]].world_position.y + interval[connectorOfVice], 0));
				auxiliaryLinePoints2.push(new THREE.Vector3(0, moduleAndSlot[indexOfConnector[0][n]].world_position.y, 0));
				DrawLineLeft.call(this, points, Math.round(Math.abs(moduleAndSlot[indexOfConnector[0][n]].world_position.x * 100)), auxiliaryLinePoints1, auxiliaryLinePoints2);
			}

		} else if (i > 0 && indexOfConnector[i].length != 0) {
			let parent = moduleAndSlot[indexOfConnector[i][0]].belong;
			//console.log(indexOfConnector, moduleAndSlot[indexOfConnector[0][0]])
			if (indexOfConnector[i].length == 1) {
				if (Math.abs(moduleAndSlot[indexOfConnector[i][0]].world_position.x) < mainSizeBox.max.x * 1.5) {
					continue;
				}
				let connectorOfVice = 2;
				let points = [];
				points.push(new THREE.Vector3(moduleAndSlot[i].world_position.x, moduleAndSlot[indexOfConnector[i][0]].world_position.y + interval[connectorOfVice], 0));
				points.push(new THREE.Vector3(0, moduleAndSlot[indexOfConnector[i][0]].world_position.y + interval[connectorOfVice], 0));
				let auxiliaryLinePoints1 = [];
				auxiliaryLinePoints1.push(new THREE.Vector3(moduleAndSlot[indexOfConnector[i][0]].world_position.x, moduleAndSlot[indexOfConnector[i][0]].world_position.y + interval[connectorOfVice] + 0.5, 0));
				auxiliaryLinePoints1.push(new THREE.Vector3(moduleAndSlot[indexOfConnector[i][0]].world_position.x, moduleAndSlot[indexOfConnector[i][0]].world_position.y, 0));
				let auxiliaryLinePoints2 = [];
				auxiliaryLinePoints2.push(new THREE.Vector3(0, moduleAndSlot[indexOfConnector[i][0]].world_position.y + interval[connectorOfVice] + 0.5, 0));
				auxiliaryLinePoints2.push(new THREE.Vector3(0, moduleAndSlot[indexOfConnector[i][0]].world_position.y, 0));
				DrawLineLeft.call(this, points, Math.round(Math.abs(0 - moduleAndSlot[indexOfConnector[i][0]].world_position.x) * 100), auxiliaryLinePoints1, auxiliaryLinePoints2);

			} else {
				let parent = moduleAndSlot[indexOfConnector[i][0]].belong;
				let connectorOfVice = 2;
				//排序
				for (let n = 0; n < indexOfConnector[i].length - 1; n++) {
					for (let m = n + 1; m < indexOfConnector[i].length; m++) {
						if (Math.abs(moduleAndSlot[indexOfConnector[i][n]].world_position.x) > Math.abs(moduleAndSlot[indexOfConnector[i][m]].world_position.x)) {
							let temp = moduleAndSlot[indexOfConnector[i][m]];
							moduleAndSlot[indexOfConnector[i][m]] = moduleAndSlot[indexOfConnector[i][n]];
							moduleAndSlot[indexOfConnector[i][n]] = temp;
						}
					}
				}

				for (let n = 0; n < indexOfConnector[i].length; n++) {
					// //console.log(moduleAndSlot[indexOfConnector[i][n]], indexOfConnector)
					if (Math.abs(moduleAndSlot[indexOfConnector[i][n]].world_position.x) < mainSizeBox.max.x * 1.5) {
						continue;
					}
					let points = [];
					let box = moduleAndSlot[indexOfConnector[i][n]].box;
					points.push(new THREE.Vector3(moduleAndSlot[indexOfConnector[i][n]].world_position.x, moduleAndSlot[indexOfConnector[i][0]].world_position.y + interval[connectorOfVice], 0));
					points.push(new THREE.Vector3(n === 0 ? 0 : moduleAndSlot[indexOfConnector[i][n - 1]].world_position.x, moduleAndSlot[indexOfConnector[i][0]].world_position.y + interval[connectorOfVice], 0));

					let auxiliaryLinePoints1 = [];
					auxiliaryLinePoints1.push(new THREE.Vector3(moduleAndSlot[indexOfConnector[i][n]].world_position.x, moduleAndSlot[indexOfConnector[i][0]].world_position.y + interval[connectorOfVice] + 0.5, 0));
					auxiliaryLinePoints1.push(new THREE.Vector3(moduleAndSlot[indexOfConnector[i][n]].world_position.x, moduleAndSlot[indexOfConnector[i][0]].world_position.y, 0));
					let auxiliaryLinePoints2 = [];
					auxiliaryLinePoints2.push(new THREE.Vector3(n === 0 ? 0 : moduleAndSlot[indexOfConnector[i][n] - 1].world_position.x, moduleAndSlot[indexOfConnector[i][0]].world_position.y + interval[connectorOfVice] + 0.5, 0));
					auxiliaryLinePoints2.push(new THREE.Vector3(n === 0 ? 0 : moduleAndSlot[indexOfConnector[i][n - 1]].world_position.x, moduleAndSlot[indexOfConnector[i][0]].world_position.y, 0));
					DrawLineLeft.call(this, points, Math.round(Math.abs((n === 0 ? 0 : moduleAndSlot[indexOfConnector[i][n] - 1].world_position.x) - moduleAndSlot[indexOfConnector[i][n]].world_position.x) * 100), auxiliaryLinePoints1, auxiliaryLinePoints2);
				}
			}
		}
	}
}

async function export2PDF() {
	set_SelectedModule.call(this, null)
	set_TreeShowMode.call(this, 'normal')

	let imgData = []
	this.switch_View('Front')
	MainView.call(this)
	fit_View.call(this, 'MainView')
	this.renderer.render(this.$static.Scene.scene, this.$static.Scene.currentcamera);
	imgData.push(this.renderer.domElement.toDataURL("image/jpeg"));//这里可以选择png格式jpeg格式
	// this.showImg(imgData[0]);

	this.switch_View('Left')
	LeftView.call(this)
	fit_View.call(this, 'LeftView', true, false)
	this.renderer.render(this.$static.Scene.scene, this.$static.Scene.currentcamera);
	imgData.push(this.renderer.domElement.toDataURL("image/jpeg"));//这里可以选择png格式jpeg格式

	this.switch_View('Top')
	TopView.call(this)
	fit_View.call(this, 'TopView', true, false)
	this.renderer.render(this.$static.Scene.scene, this.$static.Scene.currentcamera);
	imgData.push(this.renderer.domElement.toDataURL("image/jpeg"));//这里可以选择png格式jpeg格式

	let object = get_CheckLoadObject.call(this)
	if (object === null) return
	// //console.log("pinjie", JSON.stringify(object, null, 2))

	let word = JSON.stringify(object)
	// //console.log(JSON.stringify(object, null, 2))

	this.$EventBus.$emit('app_open_Popup', 'pw-progress', 'display', '导出PDF', 600, 160, true, false, true, { title: '导出PDF...', progress: 50 }, false)

	let param = {
		sourceType : 1,
		data : word
	}

	let that = this

	let promise = new Promise(function (resolve, reject) {
		calcPolePartLoad(param).then(res => {
			//console.log(res)
			if (res.data.respCode === 0) {

				pdfMake.fonts = {
					// download default Roboto font from cdnjs.com
					MyFont: {
						normal: 'FZYTK.TTF',
						bold: 'FZYTK.TTF',
						italics: 'FZYTK.TTF',
					}
				}

				var dd = {
					pageSize: {
						width: 2000,
						height: 1000
					},
					content: [
						{
							style: 'tableExample',
							color: '#444',
							table: {
								widths: [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100],
								body: [
									[{ text: '名称', style: 'tableHeader', rowSpan: 2, alignment: 'center' },
										{ text: '长度(m)', style: 'tableHeader', rowSpan: 2, alignment: 'center' },
										{ text: '杆体下口径(mm)', style: 'tableHeader', rowSpan: 2, alignment: 'center' },
										{ text: '杆体上口径(mm)', style: 'tableHeader', rowSpan: 2, alignment: 'center' },
										{ text: '材料牌号', style: 'tableHeader', rowSpan: 2, alignment: 'center' },
										{ text: '厚度(mm)', style: 'tableHeader', rowSpan: 2, alignment: 'center' },
										{ text: '截面惯性矩MM', style: 'tableHeader', rowSpan: 2, alignment: 'center' },
										{ text: '螺栓规格', style: 'tableHeader', rowSpan: 2, alignment: 'center' },
										{ text: '外部荷载计算结果(设计值)', style: 'tableHeader', colSpan: 2, alignment: 'center' },
										{},
										{ text: '额定可承受荷载(同时满足)', style: 'tableHeader', colSpan: 2, alignment: 'center' },
										{},
										{ text: '部件之间额定可承受连接荷载', style: 'tableHeader', colSpan: 3, alignment: 'center' },
										{},
										{},
										{ text: '基础顶端外部荷载计算结果(标准值)', style: 'tableHeader', colSpan: 2, alignment: 'center' },
										{},
										{ text: '基础类型', style: 'tableHeader', rowSpan: 2, alignment: 'center' }],
									[{}, {}, {}, {}, {}, {}, {}, {}, '弯矩(kN.m)', '扭矩(kN.m)', '弯矩(kN.m)', '扭矩(kN.m)', {}, '弯矩(kN.m)', '扭矩(kN.m)', '弯矩(kN.m)', '扭矩(kN.m)', {}]
								]
							}
						},
						{
							columns: [
								{
									// auto-sized columns have their widths based on their content
									image: imgData[0],
									width: 600,
									heigh: 600
								},
								{
									// star-sized columns fill the remaining space
									// if there's more than one star-column, available width is divided equally
									image: imgData[1],
									width: 600,
									heigh: 600
								},
								{
									// fixed width
									image: imgData[2],
									width: 600,
									heigh: 600
								},
							],
							// optional space between columns
							columnGap: 10
						}
					],

					styles: {
						header: {
							fontSize: 18,
							font: 'MyFont',
							bold: true,
							margin: [0, 0, 0, 10]
						},
						subheader: {
							fontSize: 16,
							font: 'MyFont',
							bold: true,
							margin: [0, 10, 0, 5]
						},
						tableExample: {
							font: 'MyFont',
							margin: [0, 5, 0, 15]
						},
						tableHeader: {
							bold: true,
							fontSize: 13,
							font: 'MyFont',
							color: 'black'
						}
					},
					defaultStyle: {
						// alignment: 'justify'
					}
				}
				// //console.log(dd)

				let array = set_checkLoad_Result.call(that, res.data.returns)
				//console.log("array", array)
				let connectedLoad = [];
				for (let i = 0; i < array.length; i++) {
					let uid = array[i].uid
					let module = get_Module_by_UID.call(that, that.$static.Scene.baseslot, uid)
					if (module.classification == '主杆') {
						continue;
					}
					if (module.classification == '副杆' || module.classification == '横臂') {
						let temp = []
						temp.push('主杆和' + module.name + '连接')
						temp.push(array[i].data.currBend === undefined ? "" : array[i].data.currBend)
						temp.push(array[i].data.currTorque === undefined ? "" : array[i].data.currTorque)
						connectedLoad.push(temp)
						continue;
					}
					if (module.classification == '灯臂') {
						let temp = []
						temp.push('副杆和' + module.name + '连接')
						temp.push(array[i].data.currBend === undefined ? "" : array[i].data.currBend)
						temp.push(array[i].data.currTorque === undefined ? "" : array[i].data.currTorque)
						connectedLoad.push(temp)
						continue;
					}

				}

				for (let i = 0; i < array.length; i++) {
					let uid = array[i].uid
					let module = get_Module_by_UID.call(that, that.$static.Scene.baseslot, uid)
					let temp = []
					let paihao = ''
					let guige = ''
					let jiemian = ''
					switch (module.classification) {
						case '主杆':
							paihao = 'Q420B';
							guige = '8*M30';
							break;
						case '副杆':
							paihao = 'Q355B';
							guige = '6-M14-195';
							jiemian = '5267924';
							break;
						case '横臂':
							break;
						case '灯臂':
							paihao = 'Q235';
							guige = '4-M12';
							break;
					}
					temp.push(module.name === undefined ? "" : module.name.toString())
					temp.push(module.property.length === undefined ? "" : module.property.length)
					temp.push(module.property.topDiameter === undefined ? "" : module.property.topDiameter)
					temp.push(module.property.bottomDiameter === undefined ? "" : module.property.bottomDiameter)
					temp.push(paihao)
					temp.push(module.property.thickness === undefined ? "" : module.property.thickness)
					temp.push(jiemian)
					temp.push(guige)
					temp.push(array[i].data.currBend === undefined ? "" : array[i].data.currBend)
					temp.push(array[i].data.currTorque === undefined ? "" : array[i].data.currTorque)
					temp.push(module.property.ratedBend === undefined ? "" : module.property.ratedBend)
					temp.push(module.property.ratedTorque === undefined ? "" : module.property.ratedTorque)
					temp.push(i < connectedLoad.length ? connectedLoad[i][0] : '')
					temp.push(i < connectedLoad.length ? connectedLoad[i][1] : '')
					temp.push(i < connectedLoad.length ? connectedLoad[i][2] : '')
					temp.push('')
					temp.push('')
					temp.push('')
					// let data = {
					// 	text: module.name ===  undefined ? "" : module.name.toString(),
					// 	长度mm: module.property.length === undefined ? "null" : module.property.length,
					// 	杆体下口径mm: module.property.topDiameter === undefined ? "null" : module.property.topDiameter,
					// 	杆体上口径mm: module.property.bottomDiameter === undefined ? "null" : module.property.bottomDiameter,
					// 	材料牌号: "null",
					// 	厚度MM: module.property.thickness === undefined ? "null" : module.property.thickness,
					// 	截面惯性矩MM: "null",
					// 	螺栓规格: "null",
					// 	外部荷载设计值弯矩kNm: array[i].data.currBend === undefined ? "null" : array[i].data.currBend,
					// 	外部荷载设计值扭矩kNm: array[i].data.currTorque === undefined ? "null" : array[i].data.currTorque,
					// 	规定可承受荷载弯矩kNm: "null",
					// 	规定可承受荷载扭矩kNm: "null",
					// 	连接方式: "null",
					// 	弯矩kNm: "null",
					// 	扭矩kNm: "null",
					// 	基础顶端外部荷载计算结果: "null",
					// 	基础类型: "null"
					// }

					dd.content[0].table.body.push(temp)
				}
				pdfMake.createPdf(dd).download();
				resolve()
			}
			else {
				customLog(that, "error", "荷载分析", "网络接口生成 错误", "在 <请求数据> 出现了如下错误: <br>" + HTML.create_KeyPair('错误', res.data.respMsg, "String"))
				reject()
			}
		})
	})

	return promise
}

function fit_View(view = 'MainView', includeline = true, zoom = true) {
	let box = new THREE.Box3()
	box.setFromObject(this.$static.Scene.objectorigin)
	if (includeline) {
		box.expandByObject(this.$static.Scene.lineorigin)
	}
	let center = new THREE.Vector3()
	let width = 0
	let height = 0
	box.max.add(new THREE.Vector3(10, 20, 10))
	box.min.add(new THREE.Vector3(-10, -20, -10))
	box.getCenter(center)
	switch (view) {
		case 'MainView':
			width += Math.abs(box.max.z - box.min.z)
			height += Math.abs(box.max.y - box.min.y)
			break
		case 'TopView':
			width += Math.abs(box.max.z - box.min.z)
			height += Math.abs(box.max.x - box.min.x)
			break
		case 'LeftView':
			width += Math.abs(box.max.x - box.min.x)
			height += Math.abs(box.max.y - box.min.y)
			break
	}

	this.$static.OrbitControl.target.copy(center)

	if (zoom)
		this.$static.Scene.camera.orth.zoom = Math.min(this.$static.CanvasSize.width / width, this.$static.CanvasSize.height / height)


	switch (view) {
		case 'MainView':
			this.$static.Scene.currentcamera.position.x = 1000
			this.$static.Scene.currentcamera.position.y = center.y
			this.$static.Scene.currentcamera.position.z = center.z
			break
		case 'TopView':
			this.$static.Scene.currentcamera.position.x = center.x
			this.$static.Scene.currentcamera.position.y = 1000
			this.$static.Scene.currentcamera.position.z = center.z
			break
		case 'LeftView':
			//console.log(">>>>>>>>>>>>>")
			this.$static.Scene.currentcamera.position.y = center.y
			this.$static.Scene.currentcamera.position.z = 1000
			this.$static.Scene.currentcamera.position.x = center.x
			break
	}

	this.$static.Scene.camera.orth.updateProjectionMatrix()

	this.$static.OrbitControl.update()
}

export function export_STL(bin = false) {
	let scene = []
	this.$static.Scene.baseslot.Traverse((m) => {
		if (m.model !== null) {
			scene.push(m.model)
		}
	})
	//console.log(scene)
	let ascii = export_to_STL(scene, Unit)
	let file
	if (bin) {
		file = new Blob([to_BinarySTL(ascii)]);
	}
	else {
		file = new Blob([ascii], { type: "text/plain;charset=utf-8" });
	}
	saveAs(file, "hello world.stl");
}

function get_STL(bin = false) {
	let scene = []
	this.$static.Scene.baseslot.Traverse((m) => {
		if (m.model !== null) {
			scene.push(m.model)
		}
	})
	//console.log(scene)
	let ascii = export_to_STL(scene, Unit)
	let file
	if (bin) {
		file = new Blob([to_BinarySTL(ascii)]);
	}
	else {
		file = new Blob([ascii], { type: "text/plain;charset=utf-8" });
	}
	return file
}
