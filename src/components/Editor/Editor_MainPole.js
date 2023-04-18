import * as TOOL from '../Sun/ToolManager.js'
import * as THREE from "three";
import { get_Tools, get_FlowGraph } from '../Tools.js'
import * as FileSystem from '../Sun/FileSystem.js'
import { customLog, HTML, radius_to_degree, degree_to_radius, to_PoleAngle, get_NearPoleAngle, get_AngleBetween } from '../Utils.js'
import { Slot, Module, SlotModifier, SM_Free, create_Module_from_Json, create_Tree_from_PoleJson, Unit, get_UniqueID, ModulePlugin, MP_Model, MP_CustomScript, disposeHierarchy, disposeNode, create_Module_from_Json_Promise } from '../Sun/ModuleSlot.js';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js'
import CryptoJS from 'crypto-js'
import { Color } from 'three';
import { parse } from 'semver';
import {uploadFileBlock} from '@/api/FileBlock'
import {saveComponent, editDecoComponent} from '@/api/Components'
import {
	getUser
} from '@/utils/auth'


export function init_Editor() {
	//console.log(">>> MainPole Editor Init")
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
	base.Update()
	base.editorworkspace.name = name || '新建复合组件(' + get_UniqueID() + ')'
	base.editorworkspace.isMiniPole = false
	base.editorworkspace.remarks = ''
	base.editorworkspace.alias = ''
	base.editorworkspace.selectLibrary = '标准库'

	// raycast plane
	let RaycastPlane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1, 1, 1), new THREE.MeshStandardMaterial({
		color: '#ff0000',
		metalness: 1,
		roughness: 0.6
	}))
	RaycastPlane.name = "RaycastPlane"
	RaycastPlane.visible = false
	scene.add(RaycastPlane)

	return {
		filetype: 'mainpole',
		name: base.editorworkspace.name,
		uid: undefined,
		path: undefined,
		eventlistener: undefined,
		scene: scene,
		objectorigin: objectorigin,
		currentcamera: camera,
		currentcameraname: '透视',
		cameratarget: new THREE.Vector3(0, 0, 0),
		camera: {
			persp: PerspectiveCamera,
			orth: OrthographicCamera
		},
		context: {
			selectedModule: null
		},
		reactive: {
			info: '',
			error: '',
			showInfo: true
		},
		base: base,
		raycastplane: RaycastPlane,
		baseslot: baseslot,
		render: true
	}
}

export function new_Scene(item) {
	let scene
	if (item === null) {
		scene = create_Scene()
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
		try {
			let ans = create_Tree_from_PoleJson(data.components, data.acrossMultiTransverseArm, scene.objectorigin, this)
			scene.baseslot.connect(ans.tree)
			if (ans.warn.length > 0)
				this.$EventBus.$emit('console_add_Output', "info", '自动拼接 警告', "在 <自动拼接> 出现了如下警告:" + HTML.create_UList(ans.warn))
			if (ans.error.length > 0) {
				this.$EventBus.$emit('console_add_Output', "error", '自动拼接 错误', "在 <自动拼接> 出现了如下错误:" + HTML.create_UList(ans.error) + '可能的影响:<ul><li>自动拼接被中断</li></ul>')
			}
		} catch (error) {
			this.$EventBus.$emit('console_add_Output', "error", '.pole文件 警告', "在 <打开.pole文件> 出现了如下警告:" + HTML.create_List([error.message]))
		}
	}
	this.register_Scene(scene)
}

export function deselect_Scene(scene) {
}

export function can_Switch(scene) {
	return true
}

export function switch_Scene(scene) {
	refresh_Inspector.call(this)
	refresh_Tree.call(this)
	if (this.$static.Scene.context.selectedModule === null) {
		this.$emit('moduleSelect', -1, -1, -1)
	}
	else {
		this.$emit('moduleSelect', this.$static.Scene.context.selectedModule.name, this.$static.Scene.context.selectedModule.uid, this.$static.Scene.context.selectedModule.componentid)
	}
}

export function release_Scene(scene) {
	scene.base.Traverse(Module.remove_from_Scene, Slot.remove_from_Scene)
	disposeHierarchy(scene.scene)
}

export function close_Scene(scene) {
	return true
}

export function save_Scene(scene, pathobj) {
}
// Event
export function mouseClick() {
	let modulelist = []
	this.$static.Scene.base.get_Slot_by_Name('BaseSlot').Traverse((module) => {
		if (module.model !== null)
			modulelist.push(module)
	},
		() => { })
	let modellist = modulelist.map((item) => { return item.model })
	let getModule = null
	let touchedModule = this.get_RayCastObject(modellist, this.get_Mouse2DPosition())
	if (touchedModule !== null) {
		getModule = modulelist[touchedModule.index[0]]
		set_SelectedModule.call(this, getModule)
	}
}

export function mouseDoubleClick() {
	deselect_Module.call(this)
}

export function onContextMenu() {
	if (this.$static.Scene.context.selectedModule === null) {
		this.$EventBus.$emit('contextmenu_open', 'display', ['画布 - 无选中项', '-', /*{ text: '转换为父级组装树', icon: '大纲', action: 'display_convertTo_LocalTree' }, '-',*/ { text: '视图', list: [{ text: '居中视图', action: 'display_switch_View', data: 'center', icon: 'blank' }, { text: '前视图', action: 'display_switch_View', data: 'front', icon: 'blank' }, { text: '左视图', action: 'display_switch_View', data: 'left', icon: 'blank' }, { text: '顶视图', action: 'display_switch_View', data: 'top', icon: 'blank' }, { text: '正交/透视', action: 'display_switch_View', data: 'mode', icon: this.currentCamera === '透视' ? 'selected' : 'select' }], first: 0 }], null, event.clientX, event.clientY, 0)
	}
	else {
		this.$EventBus.$emit('contextmenu_open', 'display', ['画布 - ' + this.$static.Scene.context.selectedModule.name, '-', { text: '取消选中', icon: 'blank', action: '@deselect_Module' }, '-', { text: '<a style="color: var(--ElementColorRed);">删除</a>', icon: 'delete', action: '@delete_Module' }/*, { text: '@测试', action: '@log', data: 'hello world', description: '测试一下右键菜单', icon: 'blank' }*/, '-', { text: '视图', list: [{ text: '居中视图', action: 'display_switch_View', data: 'center', icon: 'blank' }, { text: '前视图', action: 'display_switch_View', data: 'front', icon: 'blank' }, { text: '左视图', action: 'display_switch_View', data: 'left', icon: 'blank' }, { text: '顶视图', action: 'display_switch_View', data: 'top', icon: 'blank' }, { text: '正交/透视', action: 'display_switch_View', data: 'mode', icon: this.currentCamera === '透视' ? 'selected' : 'select' }], first: 0 }], this.$static.Scene.context.selectedModule.uid, event.clientX, event.clientY, 2)
	}
}

export function actionLoop(scale) {

}

export function inspectorUpdate(action, val) {
	let module = this.$static.Scene.context.selectedModule
	let body = null
	this.$static.Scene.base.Traverse((module) => {
		if (module.classification === '杆身') {
			body = module
			return false
		}
	})
	if (action === 'change_PosRot') {
		if (module === null) return
		switch (module.classification) {
			case '顶部法兰': case '副顶部法兰': {
				module.slotmodifier.position.y = val * Unit
				this.$static.Scene.base.Update()
				break
			}
			case '小检修门': case '副小检修门': {
				if (body !== null && body.property.length) {
					module.editorworkspace.edit_angle = ({ "0°": 0, "90°": 90, "180°": 180, "270°": 270 })[val.data.angle]
					let angle = ({ "0°": 0, "90°": Math.PI / 2 * 3, "180°": Math.PI, "270°": Math.PI / 2 })[val.data.angle]
					let y = val.data.y * Unit
					module.editorworkspace.edit_radius = val.data.radius
					// let len = parseFloat(body.property.length)
					// let top = parseFloat(body.property.lowerCaliber)
					// let bottom = parseFloat(body.property.upperCaliber)
					// let p = 400 / len
					let x = val.data.radius * Unit
					let sinx = Math.cos(Math.PI * 2 - angle) * x
					let sinz = Math.sin(Math.PI * 2 - angle) * x
					module.slotmodifier.rotation.y = angle
					module.slotmodifier.position.set(sinx, y, sinz)
					this.$static.Scene.base.Update()
				}
				else {
					this.$EventBus.$emit('console_add_Output', "error", '自动调整 错误', HTML.create_KeyPair('类型', '杆身', 'String') + ' 类型的零件不存在，无法调整')
				}
				break
			}
			case '大检修门': case '副大检修门': {
				if (body !== null && body.property.length) {
					module.editorworkspace.edit_angle = ({ "0°": 0, "90°": 90, "180°": 180, "270°": 270 })[val.data.angle]
					let angle = ({ "0°": 0, "90°": Math.PI / 2 * 3, "180°": Math.PI, "270°": Math.PI / 2 })[val.data.angle]
					let y = val.data.y * Unit
					module.editorworkspace.edit_radius = val.data.radius
					// let len = parseFloat(body.property.length)
					// let top = parseFloat(body.property.lowerCaliber)
					// let bottom = parseFloat(body.property.upperCaliber)
					// let p = 400 / len
					let x = val.data.radius * Unit
					let sinx = Math.cos(Math.PI * 2 - angle) * x
					let sinz = Math.sin(Math.PI * 2 - angle) * x
					module.slotmodifier.rotation.y = angle
					module.slotmodifier.position.set(sinx, y, sinz)
					this.$static.Scene.base.Update()
				}
				else {
					this.$EventBus.$emit('console_add_Output', "error", '自动调整 错误', HTML.create_KeyPair('类型', '杆身', 'String') + ' 类型的零件不存在，无法调整')
				}
				break
			}
			case '侧边法兰': case '副侧边法兰': {
				if (body !== null && body.property.length) {
					//console.log(val)
					module.editorworkspace.edit_angle = ({ "0°": 0, "90°": 90, "180°": 180, "270°": 270 })[val.data.angle]
					let angle = ({ "0°": 0, "90°": Math.PI / 2 * 3, "180°": Math.PI, "270°": Math.PI / 2 })[val.data.angle]
					let y = val.data.y * Unit
					module.slotmodifier.rotation.y = angle
					module.slotmodifier.position.y = y
					this.$static.Scene.base.Update()
				}
				else {
					this.$EventBus.$emit('console_add_Output', "error", '自动调整 错误', HTML.create_KeyPair('类型', '杆身', 'String') + ' 类型的零件不存在，无法调整')
				}
				break
			}
			default: {
				break;
			}
		}
	}
	// else if (action === 'module_autoAdjust') {
	// 	switch (module.classification) {
	// 		case '顶部法兰': {
	// 			if (body !== null && body.property.length) {
	// 				let len = parseFloat(body.property.length)
	// 				module.slotmodifier.position.y = len * Unit
	// 				this.$static.Scene.base.Update()
	// 				refresh_Inspector.call(this)
	// 			}
	// 			else {
	// 				this.$EventBus.$emit('console_add_Output', "error", '自动调整 错误', HTML.create_KeyPair('类型', '杆身', 'String') + ' 类型的零件不存在，无法调整')
	// 			}
	// 			break
	// 		}
	// 		default: {
	// 			//console.log(Insert.classification)
	// 			break;
	// 		}
	// 	}
	// }
	else if (action === 'change_Name') {
		this.$static.Scene.base.editorworkspace.name = val
	}
	else if (action === 'change_Type') {
		this.$static.Scene.base.editorworkspace.selectType = val
		refresh_Inspector.call(this)
	}
	else if (action === 'change_Remarks') {
		this.$static.Scene.base.editorworkspace.remarks = val
	}
	else if (action === 'change_Alias') {
		this.$static.Scene.base.editorworkspace.alias = val
	}
	else if (action === 'change_Library') {
		this.$static.Scene.base.editorworkspace.selectLibrary = val
		//console.log(this)
	}else if(action === 'select_poleType'){
		this.$EventBus.$emit('app_open_Popup', 'pw-spec-select', 'display', '关联规格选择', 1000, 800, true, true, true, {
			action: '@select_Type',
			specsId: "",
			specsName: "",
			classification: "1003",
			mainClassification: "主杆杆型",
			selectLibrary: this.$static.Scene.base.editorworkspace.selectLibrary
		})
	}
}
export function select_Type(data) {
	//console.log(data)
	this.$static.Scene.base.editorworkspace.poleType = data.specsId
	this.$static.Scene.base.editorworkspace.poleName = data.specsName
	//console.log(this.$static.Scene.base.editorworkspace.poleName)
	refresh_Inspector.call(this)
}

function refresh_Inspector() {
	if (this.$static.Scene.context.selectedModule === null) {
		this.$EventBus.$emit('inspectorInit', {
			uid: 'display', iuid: 'moduledisplay_checkload_empty', list: [
				{ type: 'title', title: this.$static.Scene.name },
				{ type: 'lineedit', title: '命名', action: 'change_Name', itemvalue: { value: this.$static.Scene.base.editorworkspace.name, placeholder: '' } },
				{
					type: 'select',
					action: 'change_Type',
					title: '类型',
					itemvalue: {
						list: ['主杆', '副杆','微型杆'],
						selectitem: this.$static.Scene.base.editorworkspace.selectType
					}
				},
				{
					type: 'select',
					action: 'change_Library',
					title: '库',
					itemvalue: {
						list: ['标准库', '自定义库'],
						selectitem: this.$static.Scene.base.editorworkspace.selectLibrary
					}
				},
				this.$static.Scene.base.editorworkspace.selectType === '主杆' ? 					{
					type: 'button',
					action: 'select_poleType',
					title: '主杆杆型',
					itemvalue: { list: [((this.$static.Scene.base.editorworkspace.poleType == undefined || this.$static.Scene.base.editorworkspace.poleType === -1) ? '无' : this.$static.Scene.base.editorworkspace.poleName)] }
				} : null
				,
				{ type: 'lineedit', title: 'Remarks', action: 'change_Remarks', itemvalue: { value: this.$static.Scene.base.editorworkspace.remarks, placeholder: '' } },
				{ type: 'lineedit', title: 'Alias', action: 'change_Alias', itemvalue: { value: this.$static.Scene.base.editorworkspace.alias, placeholder: '' } }
			]
		})
	}
	else {
		let module = this.$static.Scene.context.selectedModule
		let list = [{ type: 'title', title: module.name },
		{ type: 'text', title: 'UID: ' + module.uid }]
		switch (module.classification) {
			case '顶部法兰': case '顶部法兰2': {
				list = [
					{ type: 'title', title: module.name },
					{ type: 'text', title: 'UID: ' + module.uid },
					{ type: 'title', title: '空间姿态' },
					{
						type: 'numberedit', title: '高度', action: 'change_PosRot', itemvalue: {
							value: module.slotmodifier.position.y / Unit,
							placeholder: 0,
							min: 0,
							max: 10000,
							step: 1,
						}
					},
					// { type: 'title', title: '自动调整' },
					// { type: 'button', action: 'module_autoAdjust', title: '', itemvalue: { list: ['尝试自动调整'] } }
				]
				break
			}
			case '小检修门': case '副小检修门': {
				list = [
					{ type: 'title', title: module.name },
					{ type: 'text', title: 'UID: ' + module.uid },
					{ type: 'title', title: '空间姿态' },
					{
						type: 'group', title: '', action: 'change_PosRot', itemvalue: {
							grouped: false, list: [
								{ type: 'select', title: '朝向', action: 'angle', itemvalue: { list: ["0°", "90°", "180°", "270°"], selectitem: module.editorworkspace.edit_angle + '°' } },
								{
									type: 'numberedit', title: '高度', action: 'y', itemvalue: {
										value: module.slotmodifier.position.y / Unit,
										placeholder: 0,
										min: 0,
										max: 10000,
										step: 1,
									}
								},
								{
									type: 'numberedit', title: '偏移半径', action: 'radius', itemvalue: {
										value: module.editorworkspace.edit_radius,
										placeholder: 0,
										min: 0,
										max: 10000,
										step: 1,
									}
								}
							]
						}
					}
				]
				break
			}
			case '大检修门': case '副大检修门': {
				list = [
					{ type: 'title', title: module.name },
					{ type: 'text', title: 'UID: ' + module.uid },
					{ type: 'title', title: '空间姿态' },
					{
						type: 'group', title: '', action: 'change_PosRot', itemvalue: {
							grouped: false, list: [
								{ type: 'select', title: '朝向', action: 'angle', itemvalue: { list: ["0°", "90°", "180°", "270°"], selectitem: module.editorworkspace.edit_angle + '°' } },
								{
									type: 'numberedit', title: '高度', action: 'y', itemvalue: {
										value: module.slotmodifier.position.y / Unit,
										placeholder: 0,
										min: 0,
										max: 10000,
										step: 1,
									}
								},
								{
									type: 'numberedit', title: '偏移半径', action: 'radius', itemvalue: {
										value: module.editorworkspace.edit_radius,
										placeholder: 0,
										min: 0,
										max: 10000,
										step: 1,
									}
								}
							]
						}
					}
				]
				break
			}
			case '侧边法兰': case '侧边法兰【适配直横臂】': case '侧边法兰【适配斜横臂】': case '副侧边法兰': {
				list = [
					{ type: 'title', title: module.name },
					{ type: 'text', title: 'UID: ' + module.uid },
					{ type: 'title', title: '空间姿态' },
					{
						type: 'group', title: '', action: 'change_PosRot', itemvalue: {
							grouped: false, list: [
								{ type: 'select', title: '朝向', action: 'angle', itemvalue: { list: ["0°", "90°", "180°", "270°"], selectitem: module.editorworkspace.edit_angle + '°' } },
								{
									type: 'numberedit', title: '高度', action: 'y', itemvalue: {
										value: module.slotmodifier.position.y / Unit,
										placeholder: 0,
										min: 0,
										max: 10000,
										step: 1,
									}
								}
							]
						}
					}
				]
				break
			}
			default: {
				this.$EventBus.$emit('inspectorInit', {
					uid: 'display', iuid: 'moduledisplay_checkload_empty', list: [
						{ type: 'title', title: module.name },
						{ type: 'text', title: 'UID: ' + module.uid }
					]
				})
				break;
			}
		}
		list.push({ type: 'title', title: '属性' })
		list.push({ type: 'propertylist', title: 'property', action: 'property', itemvalue: { list: module.property, musthave: [], allowinput: false } })
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
// function refresh_Tree(base, additionaldistance = 0) {
// 	base.Update(new THREE.Vector3(0, 0, 0), new THREE.Euler(0, 0, 0, "XYZ"), new THREE.Vector3(0, additionaldistance, 0))
// }

function set_SelectedModule(module) {
	let lastmodule = this.$static.Scene.context.selectedModule
	if (module !== null) {
		this.$static.Scene.context.selectedModule = module
		// this.$EventBus.$emit('display_select_Module', module.name, module.uid, module.componentid)
		this.$emit('moduleSelect', module.name, module.uid, module.componentid)
	}
	else {
		this.$static.Scene.context.selectedModule = null
		// this.$EventBus.$emit('display_select_Module', "", -1, -1)
		this.$emit('moduleSelect', "", -1, -1)
	}
	if (this.$static.Scene.context.selectedModule !== lastmodule) {
		this.$static.Scene.base.Traverse((m) => {
			Module.set_Visible(m)
			Module.set_Color(m)
			Module.highlight(m, false)
		})
		if (module !== null)
			Module.highlight(module, true)
		refresh_Inspector.call(this)
	}
}

export function leftmenu_dragend_Module(modulename, componentid, createJson, event) {
	// //console.log(modulename, componentid, createJson, event)
	if (!(['杆身', '底部法兰', '顶部法兰', '小检修门', '大检修门', '侧边法兰', '副杆身', '副底部法兰', '副顶部法兰', '副小检修门', '副大检修门', '副侧边法兰','侧边法兰【适配直横臂】','侧边法兰【适配斜横臂】'].includes(createJson.classification))) {
		this.$EventBus.$emit('console_add_Output', "error", '拖入零件 错误', HTML.create_KeyPair('类型', HTML.create_Or(['杆身', '底部法兰', '顶部法兰', '小检修门', '大检修门', '侧边法兰', '副杆身', '副底部法兰', '副顶部法兰', '副小检修门', '副大检修门', '副侧边法兰']), 'String') + ' 类型的零件才能拖入，当前类型为 ' + HTML.create_KeyPair('classification', createJson.classification, 'String'))
		return
	}
	let body = null
	this.$static.Scene.base.Traverse((module) => {
		if (module.classification === '杆身') {
			body = module
			return false
		}
		else if (module.classification === '副杆身') {
			body = module
			return false
		}
	})
	if (body === null) {
		if (createJson.classification !== '杆身' && createJson.classification !== '副杆身') {
			this.$EventBus.$emit('console_add_Output', "error", '拖入零件 错误', '需要包含 ' + HTML.create_KeyPair('类型', HTML.create_Or(['杆身', '副杆身']), 'String') + ' 类型的零件才能拖入 ' + HTML.create_KeyPair('类型', createJson.classification, 'String') + ' 类型的零件 ')
			return
		}
	}
	else {
		if (createJson.classification === body.classification) {
			this.$EventBus.$emit('console_add_Output', "error", '拖入零件 错误', '已包含 ' + HTML.create_KeyPair('类型', createJson.classification, 'String') + ' 类型的零件，无法重复拖入')
			return
		}
		if (body.classification === '杆身') {
			if (!(['底部法兰', '顶部法兰', '小检修门', '大检修门', '侧边法兰', '侧边法兰【适配直横臂】','侧边法兰【适配斜横臂】'].includes(createJson.classification))) {
				this.$EventBus.$emit('console_add_Output', "error", '拖入零件 错误', HTML.create_KeyPair('类型', HTML.create_Or(['底部法兰', '顶部法兰', '小检修门', '大检修门', '侧边法兰','侧边法兰【适配直横臂】','侧边法兰【适配斜横臂】']), 'String') + ' 类型的零件才能拖入，当前类型为 ' + HTML.create_KeyPair('classification', createJson.classification, 'String'))
				return
			}
			if ((createJson.classification === '底部法兰')) {
				let bottom = null
				this.$static.Scene.base.Traverse((module) => {
					if (module.classification === '底部法兰') {
						bottom = module
						return false
					}
				})
				if (bottom !== null) {
					this.$EventBus.$emit('console_add_Output', "error", '拖入零件 错误', '已包含 ' + HTML.create_KeyPair('类型', '底部法兰', 'String') + ' 类型的零件，无法重复拖入')
					return
				}
			}
			if ((createJson.classification === '顶部法兰')) {
				let top = null
				this.$static.Scene.base.Traverse((module) => {
					if (module.classification === '顶部法兰') {
						top = module
						return false
					}
				})
				if (top !== null) {
					this.$EventBus.$emit('console_add_Output', "error", '拖入零件 错误', '已包含 ' + HTML.create_KeyPair('类型', '顶部法兰', 'String') + ' 类型的零件，无法重复拖入')
					return
				}
			}
		}
		if (body.classification === '副杆身') {
			if (!(['副底部法兰', '副顶部法兰', '副小检修门', '副大检修门', '副侧边法兰'].includes(createJson.classification))) {
				this.$EventBus.$emit('console_add_Output', "error", '拖入零件 错误', HTML.create_KeyPair('类型', HTML.create_Or(['副底部法兰', '副顶部法兰', '副小检修门', '副大检修门', '副侧边法兰']), 'String') + ' 类型的零件才能拖入，当前类型为 ' + HTML.create_KeyPair('classification', createJson.classification, 'String'))
				return
			}
			if ((createJson.classification === '副底部法兰')) {
				let bottom = null
				this.$static.Scene.base.Traverse((module) => {
					if (module.classification === '副底部法兰') {
						bottom = module
						return false
					}
				})
				if (bottom !== null) {
					this.$EventBus.$emit('console_add_Output', "error", '拖入零件 错误', '已包含 ' + HTML.create_KeyPair('类型', '底部法兰2', 'String') + ' 类型的零件，无法重复拖入')
					return
				}
			}
			if ((createJson.classification === '副顶部法兰')) {
				let top = null
				this.$static.Scene.base.Traverse((module) => {
					if (module.classification === '副顶部法兰') {
						top = module
						return false
					}
				})
				if (top !== null) {
					this.$EventBus.$emit('console_add_Output', "error", '拖入零件 错误', '已包含 ' + HTML.create_KeyPair('类型', '副顶部法兰', 'String') + ' 类型的零件，无法重复拖入')
					return
				}
			}
		}
	}

	let [Insert, promise] = create_Module_from_Json_Promise(createJson, this.$static.Scene.objectorigin, (progress) => {
		this.$EventBus.$emit('app_open_Popup', 'pw-progress', 'display', '加载模型', 600, 160, true, false, true, { title: '加载' + createJson.name + '模型...', progress: Math.round(progress * 100) / 100 }, false)
	})
	Module.add_to_Scene(Insert)
	Insert.editorworkspace.edit_angle = 0
	Insert.editorworkspace.edit_y = 0
	Insert.editorworkspace.edit_radius = 0
	this.$EventBus.$emit('app_open_Popup', 'pw-progress', 'display', '加载模型', 600, 160, true, false, true, { title: '加载' + Insert.name + '模型...', progress: 0 }, false)
	promise.then(() => {
		this.$EventBus.$emit('app_close_Popup')
	}, () => {
		this.$EventBus.$emit('app_close_Popup')
	})
	this.$static.Scene.base.get_Slot_by_Name('BaseSlot').connect(Insert)
	switch (Insert.classification) {
		case '顶部法兰':
		case '副顶部法兰': {
			if (body !== null && body.property.length) {
				let len = parseFloat(body.property.length)
				Insert.slotmodifier.position.y = len * Unit
			}
			break
		}
		case '侧边法兰':case '侧边法兰【适配直横臂】': case '侧边法兰【适配斜横臂】': case '副侧边法兰': {
			if (body !== null && body.property.length) {
				let len = parseFloat(body.property.length)
				Insert.slotmodifier.position.y = len / 2 * Unit
			}
			break
		}
		case '小检修门': case '副小检修门': {
			if (body !== null) {
				let len = parseFloat(body.property.length)
				let top = parseFloat(body.property.lowerCaliber)
				let bottom = parseFloat(body.property.upperCaliber)
				let p = 400 / len
				let size = (bottom + (top - bottom) * p)
				Insert.slotmodifier.position.x = size / 2 * Unit
				Insert.editorworkspace.edit_radius = size / 2
				Insert.slotmodifier.position.y = 400 * Unit
			}
			break
		}
		case '大检修门': case '副大检修门': {
			let body = null
			this.$static.Scene.base.Traverse((module) => {
				if (module.classification === '杆身') {
					body = module
					return false
				}
			})
			if (body !== null) {
				let len = parseFloat(body.property.length)
				let top = parseFloat(body.property.lowerCaliber)
				let bottom = parseFloat(body.property.upperCaliber)
				let p = 600 / len
				let size = (bottom + (top - bottom) * p)
				Insert.slotmodifier.position.x = -size / 2 * Unit
				Insert.editorworkspace.edit_radius = size / 2
				Insert.editorworkspace.edit_angle = 180
				Insert.slotmodifier.rotation.y = Math.PI
				Insert.slotmodifier.position.y = 600 * Unit
			}
			break
		}
	}
	this.$static.Scene.base.Update()
	set_SelectedModule.call(this, Insert)
	refresh_Tree.call(this)
	// let graph = get_FlowGraph('PickModuleSlot_and_Connect', this)
	// ToolManager.run(graph, { module: Insert })
}

export function refresh_Tree() {
	let mnul = []
	let tree = []
	function get_all_module(module, layer) {
		if (module.name !== "Base") {
			mnul.push({ Name: module.name, UID: module.uid, ComponentID: module.componentid })
			tree.push({ Type: "Module", Name: module.name, UID: module.uid, ComponentID: module.componentid, GroupID: module.groupid, Layer: layer, tags: [] })
		}
	}
	this.$static.Scene.base.Traverse(get_all_module)
	this.$EventBus.$emit("display_TreeData_changed", mnul, tree)
}

export function deselect_Module(data, args) {
	set_SelectedModule.call(this, null)
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

export function delete_Module(data, args) {
	let module = this.$static.Scene.context.selectedModule
	let base = this.$static.Scene.base
	if (module !== null) {
		let baseslot = base.get_Slot_by_Name('BaseSlot')
		baseslot.disconnect(module)
		module.Traverse((m) => {
			Module.remove_from_Scene(m)
			if (m.model !== null)
				m.model.traverse((node) => {
					disposeNode(node)
				})
			if (m.line !== null)
				m.line.traverse((node) => {
					disposeNode(node)
				})
		}, (s) => {
			Slot.remove_from_Scene(s)
		})
		set_SelectedModule.call(this, null)
		refresh_Tree.call(this)
	}
}

export function select_Module(uid) {
	if (uid !== undefined) {
		let module = get_Module_by_UID(this.$static.Scene.base, uid)
		set_SelectedModule.call(this, module)
	}
}

export function upload(params) {
	debugger
	//console.log(this.$static)
	let remarks = this.$static.Scene.base.editorworkspace.remarks
	let alias = this.$static.Scene.base.editorworkspace.alias
	if(remarks && alias && remarks.length > 0 && alias.length >0){
		let body = null
		this.$static.Scene.base.Traverse((module) => {
			if (module.classification === '杆身') {
				body = module
				return false
			}
			else if (module.classification === '副杆身') {
				body = module
				return false
			}
		})
		if (body === null) {
			alert("请进行设计")
			return
		}
		let classification = body.classification
		//console.log("Upload", classification, this.$static.Scene.base.editorworkspace)
		upload_Pole(classification, this)
	}else{
		alert("请填写Remarks和Alias")
	}
}

function get_scene_stl(that) {
	let array = []
	that.$static.Scene.baseslot.Traverse((module) => {
		if (module.model !== undefined && module.model !== null) {
			array.push(module.model)
		}
	}, () => { })
	// //console.log(array)
	let stlString = STLExporter(array, Unit)

	let blob = new Blob([stlString], { type: 'text/plain' })
	// //console.log("fin !!")
	return blob
}

function STLExporter(scene, unit) {
	let vector = new THREE.Vector3();
	let normalMatrixWorld = new THREE.Matrix3();

	let output = '';

	output += 'solid exported\n';

	scene.forEach(function (object) {
		// !object instanceof THREE.Object3D && !object instanceof THREE.Line && !object instanceof THREE.ArrowHelper
		// //console.log(object, object instanceof THREE.Mesh && !(object instanceof THREE.Line) && !(object instanceof THREE.ArrowHelper))
		if (object.type === 'Mesh') {


			// if object is hidden - exit
			// if (object.visible == false) return;
			// //console.log(object)
			var geometry = object.geometry;
			var matrixWorld = object.matrixWorld;
			var mesh = object;

			// //console.log(geometry, geometry instanceof THREE.BufferGeometry)


			if (geometry.type === 'BufferGeometry') {
				geometry = new THREE.Geometry().fromBufferGeometry(geometry)
			}


			if (geometry.type === 'Geometry') {

				var vertices = geometry.vertices;
				var faces = geometry.faces;

				// //console.log(faces)

				normalMatrixWorld.getNormalMatrix(matrixWorld);

				if (typeof faces != 'undefined') {

					for (var i = 0, l = faces.length; i < l; i++) {
						var face = faces[i];

						vector.copy(face.normal).applyMatrix3(normalMatrixWorld).normalize();

						output += '\tfacet normal ' + vector.x / unit + ' ' + vector.y / unit + ' ' + vector.z / unit + '\n';
						output += '\t\touter loop\n';

						var indices = [face.a, face.b, face.c];

						for (var j = 0; j < 3; j++) {
							var vertexIndex = indices[j];
							if (typeof geometry.skinIndices !== 'undefined' && geometry.skinIndices.length == 0) {
								vector.copy(vertices[vertexIndex]).applyMatrix4(matrixWorld);
								output += '\t\t\tvertex ' + vector.x / unit + ' ' + vector.y / unit + ' ' + vector.z / unit + '\n';
							} else {
								vector.copy(vertices[vertexIndex]); //.applyMatrix4( matrixWorld );

								var boneIndices = [
									geometry.skinIndices[vertexIndex].x,
									geometry.skinIndices[vertexIndex].y,
									geometry.skinIndices[vertexIndex].z,
									geometry.skinIndices[vertexIndex].w
								];

								var weights = [
									geometry.skinWeights[vertexIndex].x,
									geometry.skinWeights[vertexIndex].y,
									geometry.skinWeights[vertexIndex].z,
									geometry.skinWeights[vertexIndex].w
								];

								var inverses = [
									skeleton.boneInverses[boneIndices[0]],
									skeleton.boneInverses[boneIndices[1]],
									skeleton.boneInverses[boneIndices[2]],
									skeleton.boneInverses[boneIndices[3]]
								];

								var skinMatrices = [
									skeleton.bones[boneIndices[0]].matrixWorld,
									skeleton.bones[boneIndices[1]].matrixWorld,
									skeleton.bones[boneIndices[2]].matrixWorld,
									skeleton.bones[boneIndices[3]].matrixWorld
								];

								//this checks to see if the mesh has any morphTargets - jc
								if (geometry.morphTargets !== 'undefined') {
									var morphMatricesX = [];
									var morphMatricesY = [];
									var morphMatricesZ = [];
									var morphMatricesInfluence = [];

									for (var mt = 0; mt < geometry.morphTargets.length; mt++) {
										//collect the needed vertex info - jc
										morphMatricesX[mt] = geometry.morphTargets[mt].vertices[vertexIndex].x;
										morphMatricesY[mt] = geometry.morphTargets[mt].vertices[vertexIndex].y;
										morphMatricesZ[mt] = geometry.morphTargets[mt].vertices[vertexIndex].z;
										morphMatricesInfluence[mt] = morphTargetInfluences[mt];
									}
								}

								var finalVector = new THREE.Vector4();

								// if (mesh.geometry.morphTargets !== 'undefined') {

								// 	var morphVector = new THREE.Vector4(vector.x, vector.z, vector.y);

								// 	for (var mt = 0; mt < geometry.morphTargets.length; mt++) {
								// 		//not pretty, but it gets the job done - jc
								// 		morphVector.lerp(new THREE.Vector4(morphMatricesX[mt], morphMatricesY[mt], morphMatricesZ[mt], 1), morphMatricesInfluence[mt]);
								// 	}

								// }

								for (var k = 0; k < 4; k++) {

									var tempVector = new THREE.Vector4(vector.x, vector.y, vector.z);
									tempVector.multiplyScalar(weights[k]);
									//the inverse takes the vector into local bone space
									tempVector.applyMatrix4(inverses[k])
										//which is then transformed to the appropriate world space
										.applyMatrix4(skinMatrices[k]);
									finalVector.add(tempVector);

								}

								output += '\t\t\tvertex ' + finalVector.x / unit + ' ' + finalVector.y / unit + ' ' + finalVector.z / unit + '\n';
							}
						}
						output += '\t\tendloop\n';
						output += '\tendfacet\n';
					}
				}
			}
		}

	});

	output += 'endsolid exported\n';

	// //console.log(output)
	return output;
}

function get_SaveObject(that) {

	let box = new THREE.Box3()
	let center = new THREE.Vector3(0, 0, 0)
	let component = {
		moduleid: null,
		modulename: "this.createUrl",
		remark: "this.createRemark",
		alias: "this.createAlias",
		classification: "主杆",
		url: "",
		moduleposition: [
			0,
			0,
			0
		],
		modulerotation: [
			"0",
			"0",
			"0"
		],
		maxLoad: null,
		propertyInfo: {},
		interfaces: [],
	}

	for (let i = 0; i < that.$static.Scene.baseslot.connectedmodule.length; i++) {
		if (that.$static.Scene.baseslot.connectedmodule[i].classification === '杆身' || that.$static.Scene.baseslot.connectedmodule[i].classification === '副杆身') {
			component.speecId = that.$static.Scene.baseslot.connectedmodule[i].property.specsId;
		}
	}

	that.$static.Scene.baseslot.Traverse((module) => {
		box.expandByObject(module.model)
	}, (slot, index) => {
		if (slot.name !== 'BaseSlot') {

			component.interfaces.push({
				interfaceUID: index + 1,
				interfacename: slot.name,
				interfaceposition: [
					slot.world_position.x,
					slot.world_position.y,
					slot.world_position.z
				],
				interfacerotation: [
					slot.world_rotation.x,
					slot.world_rotation.y,
					slot.world_rotation.z
				],
				property: null,
				rules: [
					"All"
				]
			})
		}
	})
	box.getCenter(center)
	component.moduleposition = [center.x, center.y, center.z]
	return component
}

export function upload_Pole(params, that) {
	//debugger
	// //console.log(JSON.stringify(this.get_SaveObject(),null,2));
	let stlFile = get_scene_stl(that)

	let updateStl = new FormData()
	updateStl.append('file', stlFile)
	updateStl.append('fileMd5', that.$md5(stlFile.toString()))
	updateStl.append('fileName', 'scene.stl')
	updateStl.append('fileSize', stlFile.size)
	updateStl.append('blockNo', 0)
	updateStl.append('blockTotalNo', 1)
	updateStl.append('blockSize', 3145728)
	updateStl.append('noGroupPath', null)

	let slotJson = that.$static.Scene.baseslot.connectedmodule

	const LIBRARY = {
		'标准库': 0,
		'自定义库': 1
	}

	let updateJson = {
		type: 0,
		fileName: that.$static.Scene.base.editorworkspace.name,
		modelIds: [],
		fileUrl: '',
		physicalSize: 6500,
		specsId: get_SaveObject(that).speecId,
		poleType: 1,
		remark: that.$static.Scene.base.editorworkspace.remarks,
		alias: that.$static.Scene.base.editorworkspace.alias,
		disassemblyPrimaryPoleList: [],
		disassemblySecondaryPoleList: [],
		picUrl: '1.stl',
		standardType: LIBRARY[that.$static.Scene.base.editorworkspace.selectLibrary]
	}
	let isExistPole = false
	for (let i = 0; i < slotJson.length; i++) {
		let temp = slotJson[i]

		if (temp.classification == '杆身' || temp.classification == '副杆身') {
			updateJson.disassemblyPrimaryPoleList.push({
				disassemblyRawMaterialId: temp.componentid,
			})
			updateJson.disassemblySecondaryPoleList.push({
				disassemblyRawMaterialId: temp.componentid,
				disassemblyHeight: 0,
				disassemblyAngle: 0,
				disassemblyType: 1
			})
			if (!isExistPole) {
				isExistPole = true
				continue
			} else {
				error('存在多根杆体')
			}
		} else {
			switch (temp.classification) {
				case '大检修门': case '副大检修门':
					updateJson.disassemblyPrimaryPoleList.push({
						disassemblyRawMaterialId: temp.componentid,
						sideFlangeHeight: temp.slotmodifier.position.y / Unit,
						sideFlangeAngle: temp.editorworkspace.edit_angle
					})
					updateJson.disassemblySecondaryPoleList.push({
						disassemblyRawMaterialId: temp.componentid,
						sideFlangeHeight: temp.slotmodifier.position.y / Unit,
						disassemblyAngle: temp.editorworkspace.edit_angle,
						disassemblyType: 6
					})
					break

				case '小检修门': case '副小检修门':
					updateJson.disassemblyPrimaryPoleList.push({
						disassemblyRawMaterialId: temp.componentid,
						sideFlangeHeight: temp.slotmodifier.position.y / Unit,
						sideFlangeAngle: temp.editorworkspace.edit_angle
					})
					updateJson.disassemblySecondaryPoleList.push({
						disassemblyRawMaterialId: temp.componentid,
						disassemblyHeight: temp.slotmodifier.position.y / Unit,
						disassemblyAngle: temp.editorworkspace.edit_angle,
						disassemblyType: 5
					})
					break

				case '顶部法兰': case '副顶部法兰':
					updateJson.disassemblyPrimaryPoleList.push({
						disassemblyRawMaterialId: temp.componentid,
						flangeType: 1,
						sideFlangeHeight: temp.slotmodifier.position.y / Unit,
						sideFlangeAngle: temp.editorworkspace.edit_angle
					})
					updateJson.disassemblySecondaryPoleList.push({
						disassemblyRawMaterialId: temp.componentid,
						disassemblyHeight: temp.slotmodifier.position.y / Unit,
						disassemblyAngle: temp.editorworkspace.edit_angle,
						disassemblyType: 4
					})
					break

				case '底部法兰': case '副底部法兰':
					updateJson.disassemblyPrimaryPoleList.push({
						disassemblyRawMaterialId: temp.componentid,
						flangeType: 0,
						sideFlangeHeight: temp.slotmodifier.position.y / Unit,
						sideFlangeAngle: temp.editorworkspace.edit_angle
					})
					updateJson.disassemblySecondaryPoleList.push({
						disassemblyRawMaterialId: temp.componentid,
						disassemblyHeight: 0,
						disassemblyAngle: 0,
						disassemblyType: 3
					})
					break

				case '侧边法兰': case '副侧边法兰':
					updateJson.disassemblyPrimaryPoleList.push({
						disassemblyRawMaterialId: temp.componentid,
						flangeType: 2,
						sideFlangeHeight: temp.slotmodifier.position.y / Unit,
						sideFlangeAngle: temp.editorworkspace.edit_angle
					})
					updateJson.disassemblySecondaryPoleList.push({
						disassemblyRawMaterialId: temp.componentid,
						disassemblyHeight: temp.slotmodifier.position.y / Unit,
						disassemblyAngle: temp.editorworkspace.edit_angle,
						disassemblyType: 2
					})
					break
			}
		}
	}

	if (!isExistPole) {
		alert('不存在杆体')
		return
	}

	uploadFileBlock(updateStl).then(response => {
		//console.log(response)
		if (response.respCode == 0) {
			updateJson.fileUrl = response.returns.groupPath
			update_Json(updateJson, that.$static.Scene.base.editorworkspace.selectType, that)
		}
	}).catch(function (error) {
		//console.log(error)
	})
}

function update_Json(updateJson, moduleType, that) {
//debugger

	if(that.$static.Scene.base.editorworkspace.selectType == '副杆'){
		updateJson.type = 1
	}else if(that.$static.Scene.base.editorworkspace.selectType == '主杆'){
		updateJson.type = 0
	}else if(that.$static.Scene.base.editorworkspace.selectType == '微型杆'){
		updateJson.type = 7
	}

	if(updateJson.standardType === 1){
		let user = getUser()
		let orgId = typeof user.orgId === 'undefined' ? null : user.orgId
		if(orgId !== null){
			updateJson.orgId = orgId
		}else{
			let orgList = typeof user.orgList === 'undefined' || user.orgList.length === 0 ? null : user.orgList
			updateJson.orgList = orgList
		}
	}

	//console.log(updateJson)
	// //console.log(JSON.stringify(updateJson,null,2))
	let srcs = CryptoJS.enc.Utf8.parse(JSON.stringify(updateJson))
	saveComponent(updateJson).then(response => {
		//console.log("上传成功", response)
		let id;
		for (var key in response.returns) {
			id = key;
			alert("上传成功,id为 " + key) //获取key值
		}
		let json = get_SaveObject(that)
		let upJson = {}
		let jsonExport = {}
		let aeskey = 'fEPbbkswA48ejNsNrJ2KZzr46KQDZsrE'
		jsonExport.moduleId = id
		jsonExport.modulePosition = json.moduleposition
		jsonExport.moduleRotation = json.modulerotation
		jsonExport.rawMaterialFlag = 0
		let jsonInterface = []
		for (let i = 0; i < json.interfaces.length; i++) {
			let temp = {}
			switch (json.interfaces[i].interfacename) {
				case '副杆插槽':
					temp.interfaceType = 1
					break;
				case '横臂插槽':
					temp.interfaceType = 2
					break;
				case '装载设施插槽':
				case '装载设备插槽':
					temp.interfaceType = 6
					break;
				case '灯臂插槽':
					temp.interfaceType = 4
					break;
				case '连接件插槽':
					temp.interfaceType = 5
					break;
			}

			// temp.interfaceType = json.slots[i].slotid
			temp.interfaceName = json.interfaces[i].interfacename
			temp.interfacePosition = []
			temp.interfacePosition.push(json.interfaces[i].interfaceposition[0])
			temp.interfacePosition.push(json.interfaces[i].interfaceposition[1])
			temp.interfacePosition.push(json.interfaces[i].interfaceposition[2])
			temp.interfaceRotation = []
			temp.interfaceRotation.push(json.interfaces[i].interfacerotation[0])
			temp.interfaceRotation.push(json.interfaces[i].interfacerotation[1])
			temp.interfaceRotation.push(json.interfaces[i].interfacerotation[2])
			// temp.angleMin = json.slots[i].property.angleMin
			// temp.angleMax = json.slots[i].property.angleMax
			// temp.heightMin = json.slots[i].property.yMin
			// temp.heightMax = json.slots[i].property.yMax
			temp.rules = []
			jsonInterface.push(temp)
		}
		jsonExport.interfaces = jsonInterface
		//console.log(jsonExport)

		editDecoComponent(jsonExport).then(res => {
			//console.log(res);
			alert("上传成功")
		})
		// this.export_scene_stl()
	}).catch((response) => {
		//console.log(response, "false")
		alert("上传失败:" + response.res.respMsg)
	});
}
