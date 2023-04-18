///////////////////////////////////////////////
//           Core ModuleSlot.js
///////////////////////////////////////////////
import * as THREE from "three";
import { HTML, customLog, radius_to_degree, degree_to_radius, to_PoleAngle, get_NearPoleAngle, get_AngleBetween, to_BinarySTL } from '../Utils.js'
import * as FileSystem from './FileSystem.js'
import STLLoader from 'three-stl-net-loader';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js'
import { get2F3F, getComponents } from "@/api/Components";
import { BoxHelper } from "three";
import {searchDicDetailList} from "@/api/DicTools";

// STL Loader
let loader = new STLLoader();
loader.setWithCredentials(false);
let slothelper = new THREE.SphereGeometry(0.7, 32);
let boxhelper = new THREE.SphereGeometry(5, 32);
let boxhelpermaterial = new THREE.MeshBasicMaterial({ color: '#ff00ff' });
let initialequipId = 0 // equipid for this.classificationid === 6
let id2F, id3F

let kcId = 715;
let word = "standardType = 0"
getComponents(word).then(res => {
	try {
		if (res.respCode == 0) {
			kcId = res.returns.components[3][0].moduleid
		}
	} catch (error) {
		console.error(error)
		this.$EventBus.$emit('console_add_Output', "error", '系统初始化', "初始化卡槽ID失败")
	}
})
// get2F3F().then(res => {
// 	for (let i = 0; i < res.returns.length; i++) {
// 		if (res.returns[i].dicCode == 2) {
// 			id2F = res.returns[i].dicValue;
// 		} else if (res.returns[i].dicCode == 3) {
// 			id3F = res.returns[i].dicValue;
// 		}
// 	}
// })

const DEMO = false

export let Unit = 0.01

export let UniqueID = BigInt(0)

// you can use this to get a Global Uid BigInt use toString() to convert it to serlizeable value
export function get_UniqueID() {
	return UniqueID++
}

export const ClassificationMap = {
	0: '主杆', 1: '副杆', 2: '横臂', 3: '卡槽', 4: '灯臂', 5: '连接件', 6: '搭载设备', 7: '微型杆'
}

export const ClassificationReverseMap = {
	'主杆': 0, '副杆': 1, '横臂': 2, '卡槽': 3, '灯臂': 4, '连接件': 5, '搭载设备': 6, '微型杆': 7
}

export function map_Classsification(class_id) {
	if (typeof (class_id) === 'string') {
		return ClassificationReverseMap[class_id]
	}
	else {
		return ClassificationMap[class_id]
	}
}

// Basic Material
export const materialNormal = new THREE.MeshStandardMaterial({
	color: '#ffffff',
	metalness: 1,
	roughness: 0.6,
	transparent: true,
	opacity: 1
})

// class SlotModifier
// this class is used to modifier a module's connected slot' pos/rot
// you can make your own SlotModifier by extends SlotModifier and impliment get_Position & get_Rotation method
// warn !!!! this SlotModifer base class will do nothing this project use is inhertants class as follow
export class SlotModifier {
	get_Position(position, rotation) {
		return position
	}

	get_Rotation(position, rotation) {
		return rotation
	}

	get_ReorderRotation(order = 'YXZ') {
		return 0
	}
}

// the Basic SlotModifier class used in this project
// allow user to change a module's connection pos/rot through additional pos/rot
export class SM_Free extends SlotModifier {
	constructor(position = new THREE.Vector3(0, 0, 0), rotation = new THREE.Euler(0, 0, 0, "XYZ")) {
		super()
		this.position = position
		this.rotation = rotation
	}

	get_Position(position, rotation) {
		// position
		let newposition = new THREE.Vector3(0, 0, 0);
		newposition.copy(this.position);
		newposition.applyEuler(rotation);
		newposition.add(position);
		return newposition
	}

	get_Rotation(position, rotation) {
		// rotation
		let parentrotation = new THREE.Quaternion();
		parentrotation.setFromEuler(rotation);
		let selfrotation = new THREE.Quaternion();
		selfrotation.setFromEuler(this.rotation);
		parentrotation.multiply(selfrotation);
		let newrotation = new THREE.Euler(0, 0, 0, "XYZ");
		newrotation.setFromQuaternion(parentrotation, "XYZ");
		return newrotation
	}

	get_ReorderRotation(order = 'YXZ') {
		let neweuler = this.rotation.clone().reorder(order)
		return neweuler
	}
}

// class ModulePlugin
// a Plugin to be attach on a Module instance in order to add ability
// like: sticker uses plugin to add a new model under the attached module while not showing in the outline tree
// usage :
// Module class has a mathod : add_Plugin(plugin, vue), pass in the plugin instance and the Editor vue component (ModelDisplay.vue -> this inorder to allow the plugin to contol the Interface)
export class ModulePlugin {
	// passin the plugin's name this needs to be unique on each plugin
	// if not the add_Plugin method will throw an expcetion
	// so you can use try catch to test whether a plugin already existed
	// the this.module will automaticall points to its parent : the module it attach on
	constructor(name) {
		this.name = name;
		this.uid = UniqueID++;
		// this will be automaticall set to module
		this.module = null
	}

	// call if the module 's pos/rot changed
	UpdatePosRot(position, rotation) {
	}

	// this function will be call just after the plugin is attached
	// you may need to save the vue param as this.vue = vue for later usage
	// or do other initalizations
	init(vue) {

	}

	// Module has a update_Plugin(delta, vue) method
	// this update method is called if update_Plugin is fired
	// its mainly usage is to call update_Plugin(delta, vue) every frame (delta means frames delta)
	// so you can use this update function to do some animations
	update(delta, vue) {
	}

	// discard do not use
	get_Plugin(name) {
		if (this.module === null) return null;
		else return this.module.editorproperty[name] || null;
	}

	// call when the module is highlight
	highlight(hight) {
	}

	// call before this plugin is deattached
	// use to clear memory
	remove() {
	}

	// return the Inspector Componets in the Inspector Panel
	get_InspectorObject() {
		return null;
	}

	// call when a Inspector Componet is changed
	set_Property(val) {
	}

	// get Save Data
	save() {
		return { name: 'moduleplugin', data: undefined }
	}

	// load from Data
	load(data) {

	}
}

// Here are some ModulePlugin Examples
// warn !!!! not all of them is tested!!!
// MP_Model is used to diaplay sticker
export class MP_Model extends ModulePlugin {
	constructor(name, model, scene, id = 1, text = null) {
		super(name);
		this.scene = scene;
		this.model = model;
		this.scale = { x: 1, y: 1 };
		this.position = { x: 0, y: 0, z: 0 };
		this.rotation = { x: 0, y: 0, z: 0 };
		this.text = text;
		this.textModel;
		this.id = id;
		if (model !== null)
			this.scene.add(model);
	}

	UpdatePosRot(position, rotation) {
		if (this.model !== null) {
			this.model.position.copy(position);
			this.model.rotation.copy(rotation);
		}
	}

	highlight(hight) {
	}

	remove() {
		if (this.model === null) return;
		this.scene.remove(this.model);
		disposeHierarchy(this.model);
	}

	get_InspectorObject() {
		//console.log(this)
		return {
			type: 'group',
			title: '',
			action: 'edit_Plugin:' + this.name,
			itemvalue: {
				grouped: false,
				list: [{
					type: 'vector2',
					title: '缩放',
					action: 'scale',
					itemvalue: { x: this.scale.x, y: this.scale.y, min: -10, max: 10, step: 0.01 }
				}, {
					type: 'vector3',
					title: '偏移',
					action: 'position',
					itemvalue: { x: this.position.x, y: this.position.y, z: this.position.z, min: -100000, max: 100000, step: 1, unit: '㎜', multiplier: Unit, round: true }
				}, {
					type: 'euler3',
					title: '旋转',
					action: 'rotation',
					itemvalue: { x: this.rotation.x, y: this.rotation.y, z: this.rotation.z, min: -100000, max: 100000, step: 0.1 }
				}, { type: 'lineedit', title: "路名", action: 'getText', itemvalue: { value: this.text, placeholder: '' } }, {
					type: 'button',
					title: '',
					action: 'generate',
					itemvalue: { list: ["生成路名", "删除路名"] }
				}]
			}
		}
	}

	create_TextModel(message1) {
		let that = this;
		let loader = new THREE.FontLoader();
		loader.load('static\\font\\FZLanTingHeiS-R-GB_Regular.json', function (font) {
			const color = 0xffffff;
			const matLite = new THREE.MeshBasicMaterial({
				color: color,
				transparent: true,
				opacity: 0.4,
				side: THREE.DoubleSide
			});
			let message = message1.toString();
			let shapes = font.generateShapes(message, 1); // 1:size
			let geometry = new THREE.ShapeBufferGeometry(shapes);
			geometry.computeBoundingBox();
			let xMid = - 0.5 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x);
			geometry.translate(xMid, 0, 0);
			that.textModel = new THREE.Mesh(geometry, matLite);
			that.textModel.name = "text";
			that.textModel.rotation.y = Math.PI / 2;
			let group = that.model.getObjectByName('SignGroup')
			let box = new THREE.Box3()
			box.setFromObject(group);
			let base = new THREE.Object3D()

			that.textModel.position.x = that.module.model_world_position.x + 0.5;
			that.textModel.position.y = that.module.model_world_position.y;
			that.textModel.position.z = that.module.model_world_position.z + 0.5;
			that.textModel.rotation.copy(that.model.rotation)
			that.textModel.rotation.y += Math.PI / 2;
			base.add(that.textModel)
			that.textModel.renderOrder = 2;
			disposeHierarchy(that.model);
			that.scene.add(that.textModel);
		});
	}

	set_Property(val) {
		if (val.actionchain === 'edit_Plugin:' + this.name + '>svg') {
			let file = FileSystem.ROOT.get(val.calldata.path)
			if (file !== null) {
				//console.log(file.data)
			}
		}
		if (val.actionchain === 'edit_Plugin:' + this.name + '>generate') {
			if (val.data.getText == null) {
				//console.log("null")
			} else {
				//console.log(val)
				//console.log(val.calldata)
				if (val.calldata === '生成路名') {
					this.text = val.data.getText;
					let that = this;
					if (this.textModel != undefined) {
						this.scene.remove(this.textModel);
						disposeHierarchy(this.textModel);
					}
					//console.log(this)
					this.create_TextModel(this.text.toString())
				}
				else if (val.calldata === '删除路名') {
					this.scene.remove(this.textModel);
					disposeHierarchy(this.textModel);
					this.text = null;
				}
			}
		}
		if (this.model !== null) {
			//console.log(this)
			this.scale = val.data.scale
			this.position = val.data.position
			this.rotation = val.data.rotation
			let group = this.model.getObjectByName('SignGroup')
			group.scale.x = this.scale.x
			group.scale.y = this.scale.y
			group.position.x = this.position.x
			group.position.y = this.position.y
			group.position.z = this.position.z
		}
	}
}

export class MP_Scale extends ModulePlugin {
	constructor(name) {
		super(name);
	}

	UpdatePosRot(position, rotation) {

	}

	highlight(hight) {
	}

	remove() {
		if (this.module !== null)
			Module.set_Scale(this.module, 1, 1, 1);
	}

	get_InspectorObject() {
		return { type: 'numberedit', title: this.name, action: 'edit_Plugin:' + this.name, itemvalue: { value: this.module.model.scale.x, placeholder: 1, min: 0, max: 100, step: 1 } };
	}

	set_Property(val) {
		if (this.module !== null)
			Module.set_Scale(this.module, val, val, val);
	}
}

export class MP_MouseSensor extends ModulePlugin {
	constructor(name) {
		super(name);
		this.raycaster = null;
		this.get2D = null;
	}

	UpdatePosRot(position, rotation) {
	}

	init(vue) {
		this.raycaster = vue.$static.Raycaster;
		this.get2D = vue.get_Mouse2DPosition;
	}

	is_MouseOver() {
		if (this.module.model === null) return false;
		let array = this.raycaster.intersectObjects(this.module.model);
	}

	update(delta, vue) {
	}

	highlight(hight) {
	}

	remove() {
		this.raycaster = null;
		this.get2D = null;
	}
}

export class MP_CustomScript extends ModulePlugin {
	constructor(name) {
		super(name);
		this.process_script = function (delta, vue) {
			if (this.time === undefined) {
				this.time = 0;
			}
			this.time += delta;
			const pi = Math.PI / 2;
			let y = Math.sin(this.time - pi) * 5 + 5;
			this.module.slotmodifier.position.y = y;
			return true;
		};
		this.init_script = function (vue) {
			this.time = 0;
			this.module.slotmodifier.position.y = 0;
			return true;
		};
		this.process_str = 'this.time += delta;\nconst pi = Math.PI/2;\nlet y = Math.sin(this.time - pi)*5+5;\nthis.module.slotmodifier.position.y = y;\nreturn true;';
		this.init_str = 'this.time = 0;\nthis.module.slotmodifier.position.y = 0;\nreturn true;';
		this.canrun = true;
	}

	UpdatePosRot(position, rotation) {

	}

	init(vue) {
		try {
			let ans = this.init_script(vue);
			return ans;
		}
		catch (error) {
			this.canrun = false;
			vue.$EventBus.$emit('console_add_Output', "error", "脚本init 错误", error.message);
		}
	}

	update(delta, vue) {
		if (this.canrun) {
			try {
				let ans = this.process_script(delta, vue);
				return ans;
			}
			catch (error) {
				this.canrun = false;
				vue.$EventBus.$emit('console_add_Output', "error", "脚本process 错误", error.message);
			}
		}

	}

	highlight(hight) {
	}

	remove() {
	}

	get_InspectorObject() {
		return { type: 'group', title: '', action: 'edit_Plugin:' + this.name, itemvalue: { grouped: false, list: [{ type: 'textarea', title: 'function _init(vue)', action: 'init', itemvalue: { value: this.init_str, placeholder: '', readyonly: false, code: true } }, { type: 'textarea', title: 'function _process(delta, vue)', action: 'process', itemvalue: { value: this.process_str, placeholder: '', readyonly: false, code: true } }] } };
	}

	set_Property(val, vue) {
		try {
			this.canrun = true;
			this.process_str = val.data.process;
			this.init_str = val.data.init;
			this.process_script = new Function('delta', 'vue', this.process_str);
			this.init_script = new Function('vue', this.init_str);
		}
		catch (error) {
			this.canrun = false;
			vue.$EventBus.$emit('console_add_Output', "error", "脚本 错误", error.message);
		}
	}
}

/////////////////////////////////////////////////////
// 				Core Slot / Module
/////////////////////////////////////////////////////

// Some Definition
// A Component is assembled by one Module and several Slots
// so a Module intance itself is a represent of a Component (it contains all the slot a component has)

// A Component Tree is a Tree whose node's are components
// in Module and Slot it looks like:
//								Base							Module
//								 |
//							 BaseSlot							Slot
//							/		\
//					  ModuleA		ModuleB						Module
//					/	|	\		|
//				  S1 	S2	S3		S4							Slot
//				...		...	...		...
// we call ModuleA and its children (S1,S2,S3) a Component as you can see a Component can be fully defined by a Module instance
// so i will use both Component / Module in the following
// also a Module can link to a Slot every where in the tree unless it creates a loop
// so the full data structure can be seen as a DAGraph having the Component Tree and link references


// class Slot a world pos/rot a Module instance can connect to
export class Slot {
	constructor(
		id,
		name,
		position = new THREE.Vector3(0, 0, 0),
		rotation = new THREE.Euler(0, 0, 0, "XYZ"),
		scene,
		property = { angleMin: 0, angleMax: 0, yMin: 0, yMax: 0 },
		classificationid = null) {

		// the type of this object
		this.type = 'Slot';
		// unique id
		this.uid = UniqueID;
		UniqueID++;
		// id (in an Component it should be unique)
		this.id = id;
		// the name of a slot
		this.name = get_SlotName_Legacy(name);
		// the classification of a slot or which classification of Module is allowed to be connected to it
		this.classificationid = (classificationid === null) ? map_Slot_Legacy(this.name) : classificationid;

		// the tree pointer
		// the Module it belongs to (which Component it's in)
		this.belong = null;

		// the Module connected to it, muliple Modules is allow so its an Array<Module>
		this.connectedmodule = new Array();

		// the Modules link to this slots
		this.linkedby = new Array();

		// the THREE.Scene it's in
		this.scene = scene;

		// the slot local Position / Rotation (related to its owner who belongs it)
		// it will auto re-calculate after the Update method
		this.position = position;
		this.rotation = rotation;

		// the slot's world Position / Rotation (related to the World Origin)
		this.world_position = new THREE.Vector3(0, 0, 0);
		this.world_rotation = new THREE.Euler(0, 0, 0, "XYZ");

		// the yMin,yMax,angleMin, angleMax of the slot
		// the polearm used those four properties to select which slot to connect
		this.property = {};

		// if a slot is polearm type it will auto calculate those properties
		if (this.classificationid === 2) {
			if (property.yMin !== undefined && property.yMax !== undefined && property.angleMin !== undefined && property.angleMax !== undefined) this.property = property
			else {
				let up = (new THREE.Vector3(0, 1, 0)).applyEuler(this.rotation)
				let angle = Module.to_HSL(up).angle
				this.property = { angleMin: angle, angleMax: angle, yMin: Math.floor(this.position.y / Unit), yMax: Math.ceil(this.position.y / Unit) }
			}
		}

		// used in the editor of any kinds of operations, middle values etc.
		// use this if you don't want to pollute the property scope
		this.editorproperty = {};

		// the SphereGeometry used to illustrate the slot and pick mouse hover event
		this.helper = new THREE.Mesh(slothelper, new THREE.MeshBasicMaterial({ color: '#00ff00' }));
		this.helper.visible = false;
		this.helper.castShadow = false;
		this.helper.receiveShadow = false;

		// slot's pos/rot illustration
		if (this.scene !== null) {
			this.axishelper = new THREE.Object3D();
			this.axishelper.add(new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, 0), 5, 0xff0000, 1, 1));
			this.axishelper.add(new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 0), 5, 0x00ff00, 1, 1));
			this.axishelper.add(new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, 0), 5, 0x0000ff, 1, 1));
			this.axishelper.visible = false;
			// Init
			Slot.add_to_Scene(this)
		}
	}
	// Methods

	// check whether there is a loop in the "Tree" Structure
	check_Loop(module) {
		// a First Order Traverse
		let slotstack = new Array();
		for (let i = module.slotlist.length - 1; i >= 0; i--) {
			if (module.slotlist[i] == this) return true;
			slotstack.push(module.slotlist[i]);
		}
		while (slotstack.length > 0) {
			let current_slot = slotstack.pop();
			// we found the start in its own sub tree so there is a loop
			if (current_slot == this) return true;
			for (let j = 0; j < current_slot.connectedmodule.length; j++) {
				let current_module = current_slot.connectedmodule[j];
				for (let i = current_module.slotlist.length - 1; i >= 0; i--) {
					slotstack.push(current_module.slotlist[i]);
				}
			}
		}
		return false;
	}

	// connect a module to this slot
	// auto loop check so it may fail but it will not throw an exception but rather console.error inthe console
	// since it rarely possible to make a loop in the connect in the Editor
	connect(module, addtoscene = false) {
		if (module === null) return;
		if (module.connectedslot !== null && module.connectedslot !== undefined) {
			let info = "%cERROR%c This module already connected to other slot\n" + "  try to Connect: %cModule%c" + module.id + ", " + module.name + "%c -> " + "%cSlot%c" + this.id + ", " + this.name;
			console.error(info, "padding: 2px 8px ; background-color:rgb(233, 40, 50); border-radius: 4px; color:white;font-weight:bold;", "", "padding: 2px 8px ; background-color:rgb(60, 80, 240); border-radius: 4px 0px 0px 4px; color:white;font-weight:bold;", "padding: 2px 8px ; background-color: rgb(50,50,50); border-radius: 0px 4px 4px 0px; color: white;", "", "padding: 2px 8px ; background-color:rgb(24, 170, 90); border-radius: 4px 0px 0px 4px; color:white;font-weight:bold;", "padding: 2px 8px ; background-color: rgb(50,50,50); border-radius: 0px 4px 4px 0px; color: white;");
			return;
		}
		if (this.check_Loop(module)) {
			let info = "%cERROR%c Loop connection\n" + "  try to Connect: %cModule%c" + module.id + ", " + module.name + "%c -> " + "%cSlot%c" + this.id + ", " + this.name;
			console.error(info, "padding: 2px 8px ; background-color:rgb(233, 40, 50); border-radius: 4px; color:white;font-weight:bold;", "", "padding: 2px 8px ; background-color:rgb(60, 80, 240); border-radius: 4px 0px 0px 4px; color:white;font-weight:bold;", "padding: 2px 8px ; background-color: rgb(50,50,50); border-radius: 0px 4px 4px 0px; color: white;", "", "padding: 2px 8px ; background-color:rgb(24, 170, 90); border-radius: 4px 0px 0px 4px; color:white;font-weight:bold;", "padding: 2px 8px ; background-color: rgb(50,50,50); border-radius: 0px 4px 4px 0px; color: white;");
		} else {
			this.connectedmodule.push(module);
			module.connectedslot = this;
		}
	}

	// disconnect a module from this slot
	// the link in the main tree and the disconnected subtree will be auto discarded
	disconnect(module, removefromscene = false) {
		if (module === null) return;
		let i = 0;
		let connectedmodule = null;
		while (i < this.connectedmodule.length) {
			if (this.connectedmodule[i] === module) {
				module.connectedslot = null;
				connectedmodule = module
				this.connectedmodule.splice(i, 1);

				// link
				let linkarray = new Array();
				let slotslist = new Array();
				connectedmodule.Traverse((module) => {
					if (module.is_Link()) {
						linkarray.push(module);
					}
				},
					(slot) => {
						slotslist.push(slot);
					});
				// //console.log(slotslist, linkarray)
				// //console.log(linkarray, slotslist);
				linkarray.forEach((module) => {
					let i = 0;
					while (i < module.linkslotlist.length) {
						let slot = module.linkslotlist[i];
						if (!slotslist.includes(slot)) {
							module.discard_Link(slot);
							continue;
						}
						i++;
					}
				});
				slotslist.forEach((linkedslot) => {
					let i = 0;
					while (i < linkedslot.linkedby.length) {
						let module = linkedslot.linkedby[i];
						if (!linkarray.includes(module)) {
							module.discard_Link(linkedslot);
							continue;
						}
						i++;
					}
				});

				return connectedmodule;
			}
			i++;
		}
		let info = "%cERROR%c This module is not connected to the slot\n" + "  try to Disonnect: %cModule%c" + module.id + ", " + module.name + "%c <- " + "%cSlot%c" + this.id + ", " + this.name;
		console.error(info, "padding: 2px 8px ; background-color:rgb(233, 40, 50); border-radius: 4px; color:white;font-weight:bold;", "", "padding: 2px 8px ; background-color:rgb(60, 80, 240); border-radius: 4px 0px 0px 4px; color:white;font-weight:bold;", "padding: 2px 8px ; background-color: rgb(50,50,50); border-radius: 0px 4px 4px 0px; color: white;", "", "padding: 2px 8px ; background-color:rgb(24, 170, 90); border-radius: 4px 0px 0px 4px; color:white;font-weight:bold;", "padding: 2px 8px ; background-color: rgb(50,50,50); border-radius: 0px 4px 4px 0px; color: white;");
		return;
	}

	// check if a module is this slot's child
	is_Module_connected(module) {
		let i = 0;
		while (i < this.connectedmodule.length) {
			if (this.connectedmodule[i] == module) {
				return true
			}
			i++;
		}
		return false
	}

	// First Order Traverse use this slot as root
	Traverse(module_func = () => { }, slot_func = () => { }) {
		let stack = new Array();
		let layerstack = new Array();
		stack.push(this)
		layerstack.push(0)
		while (stack.length > 0) {
			let current = stack.pop();
			let current_layer = layerstack.pop();
			if (current.type === "Module") {
				let ans = module_func(current, current_layer);
				if (ans !== undefined && !ans) return;
				for (let i = current.slotlist.length - 1; i >= 0; i--) {
					stack.push(current.slotlist[i]);
					layerstack.push(current_layer);
				}
			}
			else {
				let ans = slot_func(current, current_layer);
				if (ans !== undefined && !ans) return;
				for (let i = 0; i < current.connectedmodule.length; i++) {
					stack.push(current.connectedmodule[i]);
					layerstack.push(current_layer + 1);
				}
			}
		}
	}

	remove_SubTree_from_Scene(module_func, slot_func) {
		let slotstack = new Array();
		for (let j = 0; j < this.connectedmodule.length; j++) {
			let current_module = this.connectedmodule[j];
			Module.remove_from_Scene(current_module)
			for (let i = current_module.slotlist.length - 1; i >= 0; i--) {
				slotstack.push(current_module.slotlist[i]);
			}
		}
		while (slotstack.length > 0) {
			let current_slot = slotstack.pop();
			Slot.remove_from_Scene(current_slot)
			for (let j = 0; j < current_slot.connectedmodule.length; j++) {
				let current_module = current_slot.connectedmodule[j];
				Module.remove_from_Scene(current_module)
				for (let i = current_module.slotlist.length - 1; i >= 0; i--) {
					slotstack.push(current_module.slotlist[i]);
				}
			}
		}
		this.connectedmodule = new Array()
	}

	// nothing connected to it
	is_Empty() {
		return this.connectedmodule.length <= 0
	}

	// nothing linked to it
	is_LinkEmpty() {
		return this.linkedby.length <= 0
	}

	// check if a module link to it
	is_LinkedBy(module) {
		if (!(module instanceof Module) || module === null) return;
		for (let i = 0; i < this.linkedby.length; i++) {
			if (this.linkedby[i] === module) {
				return true;
			}
		}
		return false;
	}

	remove_SubTree() {
		while (!this.is_Empty()) {
			let current_module = this.connectedmodule[0]
			this.disconnect(current_module)
			current_module.Traverse(Module.remove_from_Scene, Slot.remove_from_Scene)
		}
	}

	// check if a module is in its subtree
	// warn !!! not tested !!!
	has_ModuleInSubtree(module) {
		let slotstack = new Array();
		slotstack.push(this);
		while (slotstack.length > 0) {
			let current_slot = slotstack.pop();
			let current_module = current_slot.connectedmodule;
			if (current_module != null && current_module != undefined) {
				if (current_module == module) return true;
				for (let i = current_module.slotlist.length - 1; i >= 0; i--) {
					slotstack.push(current_module.slotlist[i]);
				}
			}
		}
	}

	// Refresh the PositionRotation of this slot and its children
	Update(
		position = new THREE.Vector3(0, 0, 0),
		rotation = new THREE.Euler(0, 0, 0, "XYZ"),
		additionalposition = new THREE.Vector3(0, 0, 0)
	) {
		let slotstack = new Array();
		slotstack.push(this);
		while (slotstack.length > 0) {
			let current_slot = slotstack.pop();
			for (let j = 0; j < current_slot.connectedmodule.length; j++) {
				let current_module = current_slot.connectedmodule[j];
				current_module.UpdatePosRot(current_slot.world_position, current_slot.world_rotation, additionalposition);
				for (let i = current_module.slotlist.length - 1; i >= 0; i--) {
					current_module.slotlist[i].UpdatePosRot(current_module.world_position, current_module.world_rotation, additionalposition);
					slotstack.push(current_module.slotlist[i]);
				}
			}
		}
	}

	// calculate new PositionRotation
	UpdatePosRot(
		position,
		rotation,
		additionalposition = new THREE.Vector3(0, 0, 0)
	) {
		// position
		let newposition = new THREE.Vector3(0, 0, 0);
		newposition.copy(this.position);
		newposition.applyEuler(rotation);
		newposition.add(position);
		if (this.scene !== null) {
			this.helper.position.set(newposition.x, newposition.y, newposition.z);
			this.axishelper.position.set(newposition.x, newposition.y, newposition.z);

		}
		this.world_position.copy(newposition);
		// rotation
		let parentrotation = new THREE.Quaternion();
		parentrotation.setFromEuler(rotation);
		let selfrotation = new THREE.Quaternion();
		selfrotation.setFromEuler(this.rotation);
		parentrotation.multiply(selfrotation);
		let newrotation = new THREE.Euler(0, 0, 0, "XYZ");
		newrotation.setFromQuaternion(parentrotation, "XYZ");
		if (this.scene !== null) {
			this.helper.rotation.set(newrotation.x, newrotation.y, newrotation.z);
			this.axishelper.rotation.set(newrotation.x, newrotation.y, newrotation.z);
		}
		this.world_rotation.copy(newrotation);
	}

	// check if a polearm can connect to this slot using the four propertise in the this properties scope
	// you may check the comments in the construnt  method
	match(name = null, angle = null, y = null) {
		if (name !== null) {
			if (this.name !== name) {
				return false
			}
		}
		if (angle !== null) {
			if (this.property.angleMin !== undefined || this.property.angleMin !== null) {
				if (angle < parseFloat(this.property.angleMin)) {
					return false
				}
			}
			if (this.property.angleMax !== undefined || this.property.angleMax !== null) {
				if (angle > parseFloat(this.property.angleMax)) {
					return false
				}
			}
		}
		if (y !== null) {
			if (this.property.yMin !== undefined || this.property.yMin !== null) {
				if (y < parseFloat(this.property.yMin)) {
					return false
				}
			}
			if (this.property.yMax !== undefined || this.property.yMax !== null) {
				if (y > parseFloat(this.property.yMax)) {
					return false
				}
			}
		}
		return true
	}

	// get Basic info (uid, name)
	get_Info() {
		return "Slot " + this.uid + ', ' + this.name
	}

	// abandoned
	// regulate_Property() {
	// 	if (this.property === null) this.property = { angleMin: '0', angleMax: '0', yMin: '0', yMax: '0' }
	// 	if (this.property.angleMin !== undefined) {
	// 		this.property.angleMin = parseInt(this.property.angleMin)
	// 	}
	// 	if (this.property.angleMax !== undefined) {
	// 		this.property.angleMax = parseInt(this.property.angleMax)
	// 	}
	// 	if (this.property.yMin !== undefined) {
	// 		this.property.yMin = parseInt(this.property.yMin)
	// 	}
	// 	if (this.property.yMax !== undefined) {
	// 		this.property.yMax = parseInt(this.property.yMax)
	// 	}
	// }

	get_JSONObject(idx = 0) {
		if (this.property === null) this.property = { version: '', 关联组件: '0', 杆高: '1', 材质: '钢' }
		if (this.property.关联组件 !== undefined) {
			this.property.关联组件 = parseInt(this.property.关联组件)
		}
		// //console.log(this.rulelang_object)
		let jsonobject = {
			slotid: idx,
			slotname: this.name,
			slotposition: [this.position.x, this.position.y, this.position.z],
			slotrotation: [this.rotation.x, this.rotation.y, this.rotation.z],
			property: this.property,
			actionlist: this.actionlist
		}
		return jsonobject
	}

	// get Stylized Basic Info(name, uid, link info)
	// this meant to be used like
	// A.Traverse(Module.get_Summary, Slot.get_Summary) so its a static func
	static get_Summary(slot, layer = 0) {

		let summary = "";
		for (let i = 0; i < layer; i++) {
			summary += "    ";
		}
		if (slot.linkedby.length > 0) {
			let linkmodules = '';
			slot.linkedby.forEach((module) => {
				linkmodules += module.get_Info() + ' ';
			});
			console.log(summary + "%c> %cSlot%c" + slot.id + ', ' + slot.name + '%c 驱动: %c' + linkmodules, "font-weight:bold;", "padding: 2px 8px ; background-color:rgb(24, 170, 90); border-radius: 4px 0px 0px 4px; color:white;font-weight:bold;", "padding: 2px 8px ; background-color: rgb(50,50,50); border-radius: 0px 4px 4px 0px; color: white;", "", "padding: 2px 8px ; background-color: rgb(50,50,50); border-radius: 4px 4px 4px 4px; color: white;");
		}
		else
			console.log(summary + "%c> %cSlot%c" + slot.id + ', ' + slot.name + '', "font-weight:bold;", "padding: 2px 8px ; background-color:rgb(24, 170, 90); border-radius: 4px 0px 0px 4px; color:white;font-weight:bold;", "padding: 2px 8px ; background-color: rgb(50,50,50); border-radius: 0px 4px 4px 0px; color: white;");
	}

	// get StyledHTML to be shown in the Terminal Interface
	static get_StyledHTML(slot) {
		let str = "<span style=\"padding: 4px 8px ; background-color:rgb(28 145 81); border-radius: var(--ObjectRadius) 0px 0px var(--ObjectRadius); color: white;font-weight:bold;\">插槽</span><span style=\"padding: 4px 8px ; background-color: rgb(50,50,50); border-radius: 0px var(--ObjectRadius) var(--ObjectRadius) 0px; color: white;\">" + slot.uid + ', ' + slot.name + "</span>"
		return str
	}

	// remove model from Scene
	static remove_from_Scene(slot, dispose = true) {
		slot.scene.remove(slot.helper);
		slot.scene.remove(slot.axishelper);
		if (dispose) {
			Slot.dispose(slot)
		}
	}

	// recursive dispose memory
	static dispose(slot) {
		disposeHierarchy(slot.helper)
		disposeHierarchy(slot.axishelper)
	}

	// add model to Scene
	static add_to_Scene(slot) {
		slot.scene.add(slot.helper);
		slot.scene.add(slot.axishelper);
	}

	// set the Sphere' visibility
	static set_Visible(slot, visible) {
		slot.helper.visible = visible
	}

	// set the Axis' visibility
	static set_Helper_Visible(slot, visible) {
		slot.axishelper.visible = visible
	}
}

export class Module {
	// para : cid, id, name, shiftposition, shiftrotation, scene, modelpath, unit, slotmodifier, relatetoorigin
	constructor(
		componentid,
		id,
		name,
		shiftposition = new THREE.Vector3(0, 0, 0),
		shiftrotation = new THREE.Euler(0, 0, 0, "XYZ"),
		scene = null,
		path = "",
		slotmodifier = new SM_Free(new THREE.Vector3(0, 0, 0), new THREE.Euler(0, 0, 0, "XYZ")),
		relatetoorigin = false,
		classification = '主杆',
		property = { version: '', 关联组件: '0', 杆高: '1', 材质: '钢' },
		groupid = -1,
		orgType=0) {

		// Module or Slot
		this.type = 'Module';
		// componentId to Identifie a Component (like 2F-486, every 2F instances' cids are all 486)
		this.componentid = componentid;

		// GroupID the components in the same group will have the same groupid, each group has its own unique groupid
		// default groupid = -1 means not in a group
		this.groupid = groupid;
		// UID unique in each ModuleSlotTee , its BigInt type
		// same cid will have different uid
		this.uid = UniqueID;
		UniqueID++;
		// ID here it can be the poleID
		this.id = id;
		// Name
		this.name = name;
		this.classification = classification;
		this.classificationid = map_Classsification(classification);
		// property
		this.property = JSON.parse(JSON.stringify(property));

		// same as Slot.editorworkspace
		this.editorworkspace = {
			explodeAxis: new THREE.Vector3(0, 1, 0)
		};

		if ([3, 4, 5, 6].includes(this.classificationid)) {
			this.editorworkspace.explodeAxis = new THREE.Vector3(1, 0, 0)
		}

		// Plugin
		this.editorproperty = {};

		// Editable Property used for create module-diff-editable property, but plugin is not nesseary
		// eg.
		// 2F - SF-size
		// 搭载设备 - 设备编号
		this.editableproperty = {};

		this.regulate_Property();

		// Model's url
		this.url = path;

		// SlotModifier
		this.slotmodifier = slotmodifier;

		// slots attach to it
		this.slotlist = new Array();

		// slots it references to
		this.linkslotlist = new Array();

		// model's world postion
		this.shiftposition = shiftposition;
		// model's world rotation
		this.shiftrotation = shiftrotation;
		// parent in ComponentTree
		this.connectedslot = null;
		// Model
		this.model = null;
		// Highlight Line Model
		this.line = null;
		// the THREE.Scene it be added to
		this.scene = scene;

		// flags
		this.allowadditionalposition = true;
		// calcu position/rotation from world or this parent
		this.relatetoorigin = relatetoorigin;
		// the way to calcu the slot references
		// parent whether take its connectedslot in to considration
		// x,y,z average on each axis
		this.linkcalcustyle = { parent: true, x: false, y: true, z: false };
		this.is_highlighted = false;
		this.is_visible = false;
		this.is_in_scene = false;
		this.is_disposed = false;
		this.is_loading = false;
		this.highlight_color = '#ff9800';
		this.model_color = '#ffffff';
		this.model_opacity = 1;
		this.model_scale = new THREE.Vector3(1, 1, 1);

		// auto calcu position rotation
		// model
		this.model_world_position = new THREE.Vector3(0, 0, 0);
		this.model_world_rotation = new THREE.Euler(0, 0, 0, "XYZ");
		// parent slot without linkslots
		this.slot_world_position = new THREE.Vector3(0, 0, 0);
		this.slot_world_rotation = new THREE.Euler(0, 0, 0, "XYZ");
		// parent slot with linkslots
		this.world_position = new THREE.Vector3(0, 0, 0);
		this.world_rotation = new THREE.Euler(0, 0, 0, "XYZ");

		// equipid for this.classificationid === 6
		this.defaultequipId = initialequipId
		this.orgType = orgType

		// rules when connecting the modules
		this.rules = {
			// 在选择插槽的时候是否以热区显示
			get_Module: (this.classification === '横臂' || this.classification === '副杆' || this.classification === '主杆' || this.classification === '微型杆'),
			// 在选择插槽的时候，需要显示组件的哪些插槽，为函数，输入this（组件本身）
			get_Slots: (this.classification === '横臂' || this.classification === '副杆') ? new Function('module', "return [];") : new Function('module', "return module.get_Slots(false, true);"),
			// 热区所代表的插槽，为函数，输入this、classcificaion
			get_DefaultSlot: get_DefaultSlotFunction(this.classification),
			// 插槽和组件能否相连，为函数，输入this, slot, base, scenedata
			check_Slot: get_CheckSlotFunction(this.classification),
			// 初始化，为函数，输入this、scenedata
			on_Arm: new Function('module', 'scenedata', "module.slotmodifier.position.set(0,0,0);module.slotmodifier.rotation.set(0,0,0);"),
		}

		// Init
		// attach a "原点插槽"
		if (this.name !== 'Base') {
			this.add_Slot(new Slot(-1, "原点插槽", new THREE.Vector3(0, 0, 0), new THREE.Euler(0, 0, 0, "XYZ"), this.scene, undefined, -1))
		}

		if (this.classificationid === 6) {
			// //console.log("this.defaultequipId",this.defaultequipId)
			this.add_EditableProperty('设备编号', 'string', this.defaultequipId, function (val, module) {
				this.data = val
				return false
			}, function () {
				return { equipId: this.data }
			})

			// 获取权属单位列表
			let orgTypeData = {
				selectitem: {},
				list: []
			}
			let param = {
				typeIdList : [23]
			}

			let that = this
			searchDicDetailList(param).then(response => {
				//console.log(response)
				if (response.respCode === 0 && response.returns) {
					that.orgTypeList = response.returns
					orgTypeData.list = response.returns
					for(let i = 0 ; i < orgTypeData.list.length; i++){
						orgTypeData.list[i].code = orgTypeData.list[i].dicCode
						orgTypeData.list[i].text = orgTypeData.list[i].dicValue
						// 权属单位没有传入时默认字典第一个值，传入时匹配字典
						if((!that.orgType && orgTypeData.list[i].dicCode === 0 ) || (that.orgType === orgTypeData.list[i].dicCode)){
							orgTypeData.selectitem = orgTypeData.list[i]
						}
					}
				}

				this.add_EditableProperty('权属单位', 'dropdown2', orgTypeData, function (val, module) {
					this.data = val
					return false
				}, function () {
					return { orgType: this.data }
				})
			});

			initialequipId = initialequipId + 1
			// //console.log("initialequipId",initialequipId)
		}
		if (this.classificationid === 4) {
			this.add_EditableProperty('灯臂仰角', 'number', 0, function (val, module) {
				this.data = val
				return false
			}, function () {
				return { elevationAngle: this.data }
			})
		}

		// auto add to Scene, Lazy you can call this when the model is not loaded, it will be added automatically once it is loaded
		if (this.scene !== null) {
			Module.add_to_Scene(this);
			// set construct url to "" in order to call load_Mesh mannually, this will return a promise
			// this is useful when you have to mannually control the load processes
			if (this.url != "") {
				this.load_Mesh(this.url).then((resolve) => {
					// customLog(undefined, 'log', 'ModuleSlot.js', '加载模型', Module.get_StyledHTML(this) + ' 加载模型 ' + HTML.create_KeyPair('URL', this.url, 'String') + ' 成功')
				}, (error) => {
					customLog(undefined, 'error', 'ModuleSlot.js', '加载模型', Module.get_StyledHTML(this) + ' 加载模型 ' + HTML.create_KeyPair('URL', this.url, 'String') + ' 失败')
				})
			}
		}
	}
	// Methods
	// Warn !!!!!
	// some methods will accept a param called "ignore_group" default is false
	// it means whether the method is applied to the whole group this module is in, ot only itself

	// check if there is Loop in ComonentTree
	// warn this will not check LinkSlots Graph
	check_Loop(slot) {
		let slotstack = new Array();
		if (slot.connectedmodule.length === 0)
			return false;
		for (let j = 0; j < slot.connectedmodule.length; j++) {
			if (slot.connectedmodule[j] == this) return true;
			for (let i = slot.connectedmodule[j].slotlist.length - 1; i >= 0; i--) {
				slotstack.push(slot.connectedmodule[j].slotlist[i]);
			}
		}
		while (slotstack.length > 0) {
			let current_slot = slotstack.pop();
			for (let j = 0; j < current_slot.connectedmodule.length; j++) {
				let current_module = current_slot.connectedmodule[j];
				if (current_module == this) return true;
				for (let i = current_module.slotlist.length - 1; i >= 0; i--) {
					slotstack.push(current_module.slotlist[i]);
				}
			}
		}
		return false;
	}

	// attach a slot to it
	// error will be console.error()
	add_Slot(slot) {
		if (!(slot instanceof Slot) || slot === null) return;
		if (slot.belong == this) {
			let info = "%cERROR%c This module already has this slot\n" + "  try to Add Slot: %cSlot%c" + slot.uid + ", " + slot.name + "%c -> " + "%cModule%c" + this.uid + ", " + this.name;
			console.error(info, "padding: 2px 8px ; background-color:rgb(233, 40, 50); border-radius: 4px; color:white;font-weight:bold;", "", "padding: 2px 8px ; background-color:rgb(24, 170, 90); border-radius: 4px 0px 0px 4px; color:white;font-weight:bold;", "padding: 2px 8px ; background-color: rgb(50,50,50); border-radius: 0px 4px 4px 0px; color: white;", "", "padding: 2px 8px ; background-color:rgb(60, 80, 240); border-radius: 4px 0px 0px 4px; color:white;font-weight:bold;", "padding: 2px 8px ; background-color: rgb(50,50,50); border-radius: 0px 4px 4px 0px; color: white;");
			return;
		} else if (this.check_Loop(slot)) {
			let info = "%cERROR%c Loop add slot\n" + "  try to Add Slot: %cSlot%c" + slot.uid + ", " + slot.name + "%c -> " + "%cModule%c" + this.uid + ", " + this.name;
			console.error(info, "padding: 2px 8px ; background-color:rgb(233, 40, 50); border-radius: 4px; color:white;font-weight:bold;", "", "padding: 2px 8px ; background-color:rgb(24, 170, 90); border-radius: 4px 0px 0px 4px; color:white;font-weight:bold;", "padding: 2px 8px ; background-color: rgb(50,50,50); border-radius: 0px 4px 4px 0px; color: white;", "", "padding: 2px 8px ; background-color:rgb(60, 80, 240); border-radius: 4px 0px 0px 4px; color:white;font-weight:bold;", "padding: 2px 8px ; background-color: rgb(50,50,50); border-radius: 0px 4px 4px 0px; color: white;");
			return;
		}
		if (slot.belong == null || slot.belong == undefined) {
			this.slotlist.push(slot);
			slot.belong = this;
		} else {
			let info = "%cERROR%c This slot already added to other module\n" + "  try to Add Slot: %cSlot%c" + slot.uid + ", " + slot.name + "%c -> " + "%cModule%c" + this.uid + ", " + this.name;
			console.error(info, "padding: 2px 8px ; background-color:rgb(233, 40, 50); border-radius: 4px; color:white;font-weight:bold;", "", "padding: 2px 8px ; background-color:rgb(24, 170, 90); border-radius: 4px 0px 0px 4px; color:white;font-weight:bold;", "padding: 2px 8px ; background-color: rgb(50,50,50); border-radius: 0px 4px 4px 0px; color: white;", "", "padding: 2px 8px ; background-color:rgb(60, 80, 240); border-radius: 4px 0px 0px 4px; color:white;font-weight:bold;", "padding: 2px 8px ; background-color: rgb(50,50,50); border-radius: 0px 4px 4px 0px; color: white;");
			return;
		}
	}

	// get all slot attached to it
	// includeorigin means whether to include "原点插槽"
	get_Slots(includeorigin = true, ignore_group = false) {
		if (!ignore_group && this.is_InGroup()) {
			let nodes = this.get_GroupNodes()
			let ans = []
			nodes.forEach((module) => {
				ans = ans.concat(module.get_Slots(includeorigin, true))
			})
			return ans
		}
		else {
			if (includeorigin)
				return this.slotlist
			else {
				return this.slotlist.filter((slot) => { return slot.name !== '原点插槽' })
			}
		}
	}

	// Warn !!!
	// All get_Slot_by_... will only return the first slot meets the requirement
	get_Slot_by_ID(id, ignore_group = false) {
		let slotlist = this.get_Slots(true, ignore_group);
		let i = 0;
		while (i < slotlist.length) {
			if (slotlist[i].id === id) {
				return slotlist[i];
			}
			i++;
		}
		return null;
	}

	get_Slot_by_Name(name, ignore_group = false) {
		let slotlist = this.get_Slots(true, ignore_group);
		let i = 0;
		while (i < slotlist.length) {
			if (slotlist[i].name === name) {
				return slotlist[i];
			}
			i++;
		}
		return null;
	}

	// get Slot through slot's classID see ClassificationMap/Slot.classificationid
	get_Slot_by_ClassID(classid, ignore_group = false) {
		let slotlist = this.get_Slots(true, ignore_group);
		let i = 0;
		while (i < slotlist.length) {
			if (slotlist[i].classificationid === classid) {
				return slotlist[i];
			}
			i++;
		}
		return null;
	}

	// dettact a slot
	delete_Slot(slot) {
		if (!(slot instanceof Slot) || slot === null) return;
		// if (slot.id = -1) return;
		let i = 0;
		while (i < this.slotlist.length) {
			if (this.slotlist[i] === slot) {
				this.slotlist[i].belong = null;
				this.slotlist.splice(i, 1);
				continue;
			}
			i++;
		}
	}

	// ref a slot
	make_Link(slot) {
		if (!(slot instanceof Slot) || slot === null) return;
		if (slot.belong === this) {
			let err = "在 <尝试创建驱动> " + Slot.get_StyledHTML(slot) + " <<< " + Module.get_StyledHTML(this) + '<ul><li>无法创建组件和该组件的插槽间的驱动关系</li></ul>';
			let info = "%cERROR%c Cannot make a link between a module and its own slot\n" + "  try to Make Link: %cSlot%c" + slot.uid + ", " + slot.name + "%c <- " + "%cModule%c" + this.uid + ", " + this.name;
			console.error(info, "padding: 2px 8px ; background-color:rgb(233, 40, 50); border-radius: 4px; color:white;font-weight:bold;", "", "padding: 2px 8px ; background-color:rgb(24, 170, 90); border-radius: 4px 0px 0px 4px; color:white;font-weight:bold;", "padding: 2px 8px ; background-color: rgb(50,50,50); border-radius: 0px 4px 4px 0px; color: white;", "", "padding: 2px 8px ; background-color:rgb(60, 80, 240); border-radius: 4px 0px 0px 4px; color:white;font-weight:bold;", "padding: 2px 8px ; background-color: rgb(50,50,50); border-radius: 0px 4px 4px 0px; color: white;");
			throw new Error(err)
			return;
		}
		if (slot === this.connectedslot) {
			let err = "在 <尝试创建驱动> " + Slot.get_StyledHTML(slot) + " <<< " + Module.get_StyledHTML(this) + '<ul><li>无法创建组件和该组件的组装树父级插槽间的驱动关系</li></ul>';
			let info = "%cERROR%c Cannot make a link between a module and its connected slot\n" + "  try to Make Link: %cSlot%c" + slot.uid + ", " + slot.name + "%c <- " + "%cModule%c" + this.uid + ", " + this.name;
			console.error(info, "padding: 2px 8px ; background-color:rgb(233, 40, 50); border-radius: 4px; color:white;font-weight:bold;", "", "padding: 2px 8px ; background-color:rgb(24, 170, 90); border-radius: 4px 0px 0px 4px; color:white;font-weight:bold;", "padding: 2px 8px ; background-color: rgb(50,50,50); border-radius: 0px 4px 4px 0px; color: white;", "", "padding: 2px 8px ; background-color:rgb(60, 80, 240); border-radius: 4px 0px 0px 4px; color:white;font-weight:bold;", "padding: 2px 8px ; background-color: rgb(50,50,50); border-radius: 0px 4px 4px 0px; color: white;");
			throw new Error(err)
			return;
		}
		if (this.check_Link_Loop(slot)) {
			let err = "在 <尝试创建驱动> " + Slot.get_StyledHTML(slot) + " <<< " + Module.get_StyledHTML(this) + '<ul><li>无法创建组件和插槽间的驱动关系 在该组件的被驱动链上已存在该组件</li></ul>';
			let info = "%cERROR%c Loop Link\n" + "  try to Make Link: %cSlot%c" + slot.uid + ", " + slot.name + "%c <- " + "%cModule%c" + this.uid + ", " + this.name;
			console.error(info, "padding: 2px 8px ; background-color:rgb(233, 40, 50); border-radius: 4px; color:white;font-weight:bold;", "", "padding: 2px 8px ; background-color:rgb(24, 170, 90); border-radius: 4px 0px 0px 4px; color:white;font-weight:bold;", "padding: 2px 8px ; background-color: rgb(50,50,50); border-radius: 0px 4px 4px 0px; color: white;", "", "padding: 2px 8px ; background-color:rgb(60, 80, 240); border-radius: 4px 0px 0px 4px; color:white;font-weight:bold;", "padding: 2px 8px ; background-color: rgb(50,50,50); border-radius: 0px 4px 4px 0px; color: white;");
			throw new Error(err)
			return;
		}
		if (!this.has_LinkSlot(slot)) {
			this.linkslotlist.push(slot);
			slot.linkedby.push(this);
		}
		// //console.log(">>>>>>>>> Maked Link")
	}

	// remove the reference to a slot
	discard_Link(slot) {
		if (!(slot instanceof Slot) || slot === null) return;
		if (this.has_LinkSlot(slot)) {
			let i = 0;
			while (i < this.linkslotlist.length) {
				if (this.linkslotlist[i] === slot) {
					let slottarget = this.linkslotlist[i];
					let j = 0;
					while (j < slottarget.linkedby.length) {
						if (slottarget.linkedby[j] === this) {
							slottarget.linkedby.splice(j, 1);
							continue;
						}
						j++;
					}
					this.linkslotlist.splice(i, 1);
					continue;
				}
				i++;
			}
		}
	}

	// check whether is refing a slot
	has_LinkSlot(slot) {
		if (!(slot instanceof Slot) || slot === null) return;
		for (let i = 0; i < this.linkslotlist.length; i++) {
			if (this.linkslotlist[i] === slot) {
				return true;
			}
		}
		return false;
	}

	// check whether this module has reference slots
	is_Link() {
		return this.linkslotlist.length > 0
	}

	// check whether the slots which attached to it are beening refed
	is_LinkedBy() {
		for (let i = 0; i < this.slotlist.length; i++) {
			if (!this.slotlist[i].is_LinkEmpty()) {
				return true
			}
		}
		return false
	}

	// check Loop in LinkSlot Graph and ComponentTree
	// make sure update process will not enter an endless-loop
	check_Link_Loop(slot) {
		let modulestack = new Array();
		modulestack.push(slot.belong);
		while (modulestack.length > 0) {
			let current_module = modulestack.pop();
			if (current_module === this) return true;
			if (current_module.connectedslot !== null) {
				modulestack.push(current_module.connectedslot.belong);
			}
			current_module.linkslotlist.forEach((slot) => {
				modulestack.push(slot.belong);
			});
		}
		return false;
	}

	// First Order Traverse taking this module as root see Slot.Traverse
	Traverse(module_func = () => { }, slot_func = () => { }) {
		let stack = new Array();
		let layerstack = new Array();
		stack.push(this)
		layerstack.push(0)
		while (stack.length > 0) {
			let current = stack.pop();
			let current_layer = layerstack.pop();
			if (current.type === "Module") {
				let ans = module_func(current, current_layer)
				if (ans !== undefined && !ans) return;
				for (let i = current.slotlist.length - 1; i >= 0; i--) {
					stack.push(current.slotlist[i]);
					layerstack.push(current_layer);
				}
			}
			else {
				let ans = slot_func(current, current_layer);
				if (ans !== undefined && !ans) return;
				for (let i = 0; i < current.connectedmodule.length; i++) {
					stack.push(current.connectedmodule[i]);
					layerstack.push(current_layer + 1);
				}
			}
		}
	}

	Reduce(module_func = (sum, current, layer) => { }, slot_func = (sum, current, layer) => { }, init_val = {}) {
		let init = init_val
		this.Traverse((module, layer) => {
			let ans = module_func(init_val, module, layer)
			init_val = ans === undefined ? init_val : ans
		}, (slot, layer) => {
			let ans = slot_func(init_val, slot, layer)
			init_val = ans === undefined ? init_val : ans
		})
		return init
	}

	ReduceLayer(module_func = (sum, current, layer) => { }, slot_func = (sum, current, layer) => { }, init_val = {}) {
		let init = init_val
		let stack = new Array();
		let valstack = new Array();
		let layerstack = new Array();
		stack.push(this)
		valstack.push(init)
		layerstack.push(0)
		while (stack.length > 0) {
			let current = stack.pop();
			let current_layer = layerstack.pop();
			let current_val = valstack.pop();
			if (current.type === "Module") {
				let ans = module_func(current_val, current, current_layer)
				current_val = ans === undefined ? current_val : ans;
				for (let i = current.slotlist.length - 1; i >= 0; i--) {
					stack.push(current.slotlist[i]);
					layerstack.push(current_layer);
					valstack.push(current_val);
				}
			}
			else {
				let ans = slot_func(current_val, current, current_layer);
				current_val = ans === undefined ? current_val : ans;
				for (let i = 0; i < current.connectedmodule.length; i++) {
					stack.push(current.connectedmodule[i]);
					layerstack.push(current_layer + 1);
					valstack.push(current_val);
				}
			}
		}
		return init
	}


	has_Module_in_subtree(module) {
		let slotstack = new Array();
		if (this == module) return true;
		for (let i = this.slotlist.length - 1; i >= 0; i--) {
			slotstack.push(this.slotlist[i]);
		}
		while (slotstack.length > 0) {
			let current_slot = slotstack.pop();
			let current_module = current_slot.connectedmodule;
			if (current_module != null && current_module != undefined) {
				if (current_module == module) return true;
				for (let i = current_module.slotlist.length - 1; i >= 0; i--) {
					slotstack.push(current_module.slotlist[i]);
				}
			}
		}
	}

	Update(
		position = new THREE.Vector3(0, 0, 0),
		rotation = new THREE.Euler(0, 0, 0, "XYZ"),
		additionalposition = new THREE.Vector3(0, 0, 0)
	) {
		let slotstack = new Array();
		let linkarray = new Array();
		this.UpdatePosRot(position, rotation, additionalposition);
		for (let i = this.slotlist.length - 1; i >= 0; i--) {
			this.slotlist[i].UpdatePosRot(
				this.world_position,
				this.world_rotation,
				additionalposition
			);
			slotstack.push(this.slotlist[i]);
		}
		while (slotstack.length > 0) {

			let current_slot = slotstack.pop();
			for (let j = 0; j < current_slot.connectedmodule.length; j++) {
				let current_module = current_slot.connectedmodule[j];
				if (current_module.is_Link()) {
					linkarray.splice(0, 0, current_module)
				}
				else {
					//console.log(this.slotmodifier)
					current_module.UpdatePosRot(
						current_slot.world_position,
						current_slot.world_rotation,
						additionalposition
					);
				}

				for (let i = current_module.slotlist.length - 1; i >= 0; i--) {

					current_module.slotlist[i].UpdatePosRot(
						current_module.world_position,
						current_module.world_rotation,
						additionalposition
					);
					slotstack.push(current_module.slotlist[i]);
				}
			}
		}
		//sort linkarray
		if (linkarray.length <= 0) return;
		// //console.log(linkarray);
		let remove_module = (array, module, idx) => {
			let j = 0;
			while (j < array.length) {
				if (array[j] === module) {
					if (j <= idx) {
						idx--
					}
					array.splice(j, 1);
					continue;
				}
				j++;
			}
			return idx
		}
		let i = 0;
		while (i < linkarray.length) {
			let front = linkarray[i];
			for (let j = 0; j < front.slotlist.length; j++) {
				let slot = front.slotlist[j];
				slot.connectedmodule.forEach((module) => {
					linkarray.splice(i + 1, 0, module);
				});
				for (let k = 0; k < slot.linkedby.length; k++) {
					let nextmodule = slot.linkedby[k];
					i = remove_module(linkarray, nextmodule, i);
					// //console.log(i);
					linkarray.push(nextmodule);
				}
			}
			i++;
			// //console.log(i, linkarray.length)
		}

		linkarray.forEach((module) => {
			// //console.log(module)
			module.UpdatePosRot(
				module.connectedslot.world_position,
				module.connectedslot.world_rotation,
				additionalposition);
			module.slotlist.forEach((slot) => {
				slot.UpdatePosRot(
					module.world_position,
					module.world_rotation,
					additionalposition
				);
			});
		});

	}

	// get All child **Module**
	get_Children(withlink = true, ignore_group = false) {
		if (!ignore_group && this.is_InGroup()) {
			let root = this.get_GroupRoot();
			let stack = [];
			let children = [];
			stack = stack.concat(root.get_Children(false, true));
			while (stack.length > 0) {
				let node = stack.pop();
				if (node.belong_ToGroup(root.groupid)) {
					stack = stack.concat(node.get_Children(false, true));
				}
				else {
					children.push(node)
				}
			}
			return children
		}
		else {
			let array = new Array();
			this.slotlist.forEach((slot) => {
				slot.connectedmodule.forEach((module) => {
					if (!array.includes(module))
						array.push(module);
				});
				if (withlink) {
					slot.linkedby.forEach((module) => {
						if (!array.includes(module))
							array.push(module);
					});
				}
			});
			return array;
		}
	}

	// get Parent **Module**
	get_Parent() {
		if (this.connectedslot === null) return null;
		if (this.connectedslot.belong === null) return null;
		return this.connectedslot.belong;
	}

	// check if this module is in a group
	is_InGroup() {
		return this.groupid !== -1;
	}

	// check if this module is in a group with GroupId=XXX
	belong_ToGroup(gid) {
		return this.groupid === gid && this.is_InGroup();
	}

	// get module's groupid
	// -1 means not in group
	get_GroupID() {
		return this.groupid;
	}

	// get All Modules in its group
	get_GroupNodes() {
		if (!this.is_InGroup()) return null;
		let root = this.get_GroupRoot();
		let ans = [root];
		let stack = [];
		stack = stack.concat(root.get_Children(false, true));
		while (stack.length > 0) {
			let node = stack.pop();
			if (node.belong_ToGroup(root.groupid)) {
				// //console.log(">>>>>>")
				ans.push(node);
				stack = stack.concat(node.get_Children(false, true));
			}
		}
		return ans;
	}

	// get the Root Module in the Group SubTree
	get_GroupRoot() {
		if (!this.is_InGroup()) return null;
		let parent = this;
		while (!parent.is_GroupRoot()) {
			parent = parent.get_Parent();
		}
		return parent;
	}

	// check whether this is a Root in Group SubTree
	is_GroupRoot() {
		let parent = this.get_Parent();
		return this.is_InGroup() && (parent === null || parent.groupid !== this.groupid);
	}

	// check whether this is a Root in the whole Component Tree
	is_Base() {
		return this.connectedslot === null;
	}

	// get Html path from root
	get_Path() {
		let pathobject = new Array();
		let parent = this;
		pathobject.splice(0, 0, parent.uid + ", " + parent.name);
		while (parent.connectedslot !== null && parent.connectedslot.belong !== null) {
			parent = parent.connectedslot.belong;
			pathobject.splice(0, 0, parent.uid + ", " + parent.name);
		}
		return pathobject.join(' <span style="color: rgb(150,150,150,0.5);">/</span> ')
	}

	get_WorldPositionVector3() {
		return new THREE.Vector3(this.world_position.x / Unit, this.world_position.y / Unit, this.world_position.z / Unit)
	}

	get_WorldPosition() {
		return { x: this.world_position.x / Unit, y: this.world_position.y / Unit, z: this.world_position.z / Unit }
	}

	get_WorldPosition_HSL(round = true) {
		let position = this.get_WorldPosition()
		let angle = Math.atan2(position.z, position.x) / Math.PI * 180
		if (angle < 0) {
			angle = 360 + angle
		}
		if (round) return { angle: Math.round(angle), x: Math.round(Math.sqrt(position.z * position.z + position.x * position.x)), y: Math.round(position.y) }
		else
			return { angle: angle, x: Math.sqrt(position.z * position.z + position.x * position.x), y: position.y }
	}

	get_WorldRotation(order = 'YZX', round = true) {
		let neweuler = this.world_rotation.clone().reorder(order)
		if (round) {
			neweuler.set(Math.round(radius_to_degree(neweuler.x)), Math.round(radius_to_degree(neweuler.y)), Math.round(radius_to_degree(neweuler.z)))
		}
		return neweuler
	}

	get_WorldRotationY(lookat = new THREE.Vector3(1, 0, 0), round = true) {
		lookat.applyEuler(this.world_rotation)
		return Module.to_HSL(lookat, round, 'XZ').angle
	}

	get_WorldRotationZ(lookat = new THREE.Vector3(1, 0, 0), round = true) {
		lookat.applyEuler(this.world_rotation)
		return Module.to_HSL(lookat, round, 'XY').angle
	}

	get_WorldRotationX(lookat = new THREE.Vector3(0, 1, 0), round = true) {
		lookat.applyEuler(this.world_rotation)
		return Module.to_HSL(lookat, round, 'YZ').angle
	}

	UpdatePosRot(
		position,
		rotation,
		additionalposition = new THREE.Vector3(0, 0, 0)
	) {

		//console.log(this.slotmodifier)
		if (this.is_Link() && (this.linkcalcustyle.x || this.linkcalcustyle.y || this.linkcalcustyle.z)) {
			let copyposition = new THREE.Vector3(0, 0, 0);
			let initcount = 0;
			copyposition.copy(position);
			let originposition = new THREE.Vector3().copy(copyposition);
			if (this.linkcalcustyle.parent) {
				initcount = 1;
			}
			position = copyposition;
			if (this.linkcalcustyle.x) { //x
				let count = initcount;
				let x = position.x - (this.linkcalcustyle.parent ? 0 : originposition.x);
				this.linkslotlist.forEach((slot) => {
					x += slot.world_position.x;
					count++;
				})
				position.x = x / count;
			}
			if (this.linkcalcustyle.y) { //y
				let count = initcount;
				let y = position.y - (this.linkcalcustyle.parent ? 0 : originposition.y);
				this.linkslotlist.forEach((slot) => {
					y += slot.world_position.y;
					count++;
				})
				position.y = y / count;
			}
			if (this.linkcalcustyle.z) { //z
				let count = initcount;
				let z = position.z - (this.linkcalcustyle.parent ? 0 : originposition.z);
				this.linkslotlist.forEach((slot) => {
					z += slot.world_position.z;
					count++;
				})
				position.z = z / count;
			}
		}
		else if (this.is_Link() && !this.linkcalcustyle.parent) {
			position.set(0, 0, 0)
			rotation.set(0, 0, 0)
		}
		// position
		let modifiedposition;
		let modifiedrotation;

		this.slot_world_position.copy(position)
		this.slot_world_rotation.copy(rotation)

		if (this.relatetoorigin) {
			modifiedposition = this.slotmodifier.get_Position(new THREE.Vector3(0, 0, 0), new THREE.Euler(0, 0, 0, "XYZ"));
			modifiedrotation = this.slotmodifier.get_Rotation(new THREE.Vector3(0, 0, 0), new THREE.Euler(0, 0, 0, "XYZ"));
		}
		else {
			modifiedposition = this.slotmodifier.get_Position(position, rotation);
			modifiedrotation = this.slotmodifier.get_Rotation(position, rotation);
		}

		let newposition = new THREE.Vector3(0, 0, 0);
		let addposition = new THREE.Vector3(0, 0, 0);
		if (this.allowadditionalposition) {
			if (typeof (additionalposition) === 'number') {
				addposition.copy(this.editorworkspace.explodeAxis).multiplyScalar(additionalposition)
			}
			else if (additionalposition instanceof THREE.Vector3)
				addposition.copy(additionalposition);
			addposition.applyEuler(modifiedrotation);
		}
		addposition.add(modifiedposition);
		newposition.copy(this.shiftposition);
		newposition.applyEuler(modifiedrotation);
		newposition.add(addposition);
		if (this.model != null || this.model != undefined) {
			this.model.position.set(newposition.x, newposition.y, newposition.z);
		}
		if (this.line != null || this.line != undefined) {
			this.line.position.set(newposition.x, newposition.y, newposition.z);
		}
		this.model_world_position.copy(newposition);
		this.world_position.copy(addposition);

		// rotation


		let parentrotation = new THREE.Quaternion();
		parentrotation.setFromEuler(modifiedrotation);
		let selfrotation = new THREE.Quaternion();
		selfrotation.setFromEuler(this.shiftrotation);
		parentrotation.multiply(selfrotation);
		let newrotation = new THREE.Euler(0, 0, 0, "XYZ");
		newrotation.setFromQuaternion(parentrotation, "XYZ");
		if (this.model != null || this.model != undefined) {
			this.model.rotation.set(newrotation.x, newrotation.y, newrotation.z);
		}
		if (this.line != null || this.line != undefined) {
			this.line.rotation.set(newrotation.x, newrotation.y, newrotation.z);
		}
		this.world_rotation.copy(modifiedrotation);
		this.model_world_rotation.copy(newrotation);
		for (let key in this.editorproperty) {
			this.editorproperty[key].UpdatePosRot(new THREE.Vector3().copy(this.world_position), new THREE.Euler().copy(this.world_rotation))
		}
	}

	load_Mesh(path, unit = Unit, progress = (progress) => { }) {
		if (this.is_disposed || this.is_loading || this.scene === null) { return }
		if (this.model !== null || this.line !== null) { throw new Error('model and line exist, please release them before loading a new Mesh, do not forget to dispose last model and line') }
		let module = this;
		this.is_loading = true;
		let promise = new Promise(function (resolve, reject) {
			loader.load(path, function (geometry) {
				geometry.computeVertexNormals();
				geometry.center();
				module.model = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({
					color: '#ffffff',
					metalness: 0.7,
					roughness: 0.2,
					transparent: true,
					opacity: 1
				}));
				let edge = new THREE.EdgesGeometry(geometry)
				module.line = new THREE.LineSegments(edge, new THREE.LineBasicMaterial({
					color: module.highlight_color,
					linewidth: 20,
				}));
				module.model.visible = module.is_visible;
				module.line.visible = module.is_highlighted;
				let scale = module.model_scale
				module.model.scale.set(scale.x * unit, scale.y * unit, scale.z * unit);
				module.line.scale.set(scale.x * unit, scale.y * unit, scale.z * unit);
				module.editorworkspace.boundingbox = new THREE.Box3()
				module.editorworkspace.boundingbox.setFromObject(module.model)

				module.model.castShadow = true;
				module.model.receiveShadow = true;
				module.model.position.copy(module.model_world_position);
				module.model.rotation.copy(module.model_world_rotation);
				module.line.position.copy(module.model_world_position);
				module.model.material.opacity = module.model_opacity
				module.model.material.color = new THREE.Color(module.model_color)
				module.line.rotation.copy(module.model_world_rotation);
				if (module.is_in_scene) {
					Module.add_to_Scene(module);
				}
				module.is_loading = false;
				resolve(module);
			}, progress, function (error) {
				module.model = new THREE.Mesh(boxhelper, boxhelpermaterial);
				module.line = new THREE.LineSegments(boxhelper, new THREE.LineBasicMaterial({
					color: module.highlight_color,
					linewidth: 20,
				}));
				module.model.visible = module.is_visible;
				module.line.visible = module.is_highlighted;
				module.model.castShadow = false;
				module.model.visible = true;
				module.model.receiveShadow = false;
				module.shiftposition.set(0, 0, 0);
				module.shiftrotation.set(0, 0, 0);
				module.model.position.copy(module.world_position);
				module.model.rotation.copy(module.world_rotation);
				module.line.position.copy(module.world_position);
				module.line.rotation.copy(module.world_rotation);
				if (module.is_in_scene) {
					Module.add_to_Scene(module);
				}
				module.is_loading = false;
				reject(error);
			});
		})
		return promise;
	}

	// Plugin
	// add a Plugin
	add_Plugin(plugin, vue = null) {
		let name = plugin.name;
		if (this.editorproperty[name] !== undefined) {
			throw new Error(Module.get_StyledHTML(this) + ' 中 ' + HTML.create_KeyPair('插件', name, 'Plugin') + ' 已经存在');
		}
		else {
			this.editorproperty[name] = plugin;
			plugin.module = this;
			plugin.init(vue);
		}
	}

	// upate all plugins
	// means calling all plugins' update method
	update_Plugins(delta, vue) {
		let refresh = false
		for (let key in this.editorproperty) {
			let ans = this.editorproperty[key].update(delta, vue)
			if (ans === undefined) ans = false
			refresh = refresh || ans
		}
		return refresh
	}

	// init a Plugin
	// this is automatically called when adding a plugin
	init_Plugins(vue) {
		let refresh = false
		for (let key in this.editorproperty) {
			let ans = this.editorproperty[key].init(vue)
			if (ans === undefined) ans = false
			refresh = refresh || ans
		}
		return refresh
	}

	// remove a Plugin
	// plugin's remove method will be called
	remove_Plugin(name) {
		if (this.editorproperty[name] === undefined) {
			throw new Error(Module.get_StyledHTML(this) + ' 中不存在 ' + HTML.create_KeyPair('插件', name, 'Plugin'));
		}
		else {
			this.editorproperty[name].remove();
			this.editorproperty[name].module = null;
			delete this.editorproperty[name];
		}
	}

	remove_AllPlugin() {
		for (let key in this.editorproperty) {
			this.editorproperty[key].remove();
		}
	}

	// get All Plugins' names
	get_Plugins() {
		let ans = [];
		for (let key in this.editorproperty) {
			ans.push(key);
		}
		return ans;
	}

	// get Plugins' Inpspector Compnents
	get_EditorPropertyInspector() {
		let ans = [];
		for (let key in this.editorproperty) {
			let ic = this.editorproperty[key].get_InspectorObject();
			if (ic && ic !== null) {
				ans.push({ type: 'title', title: key });
				ans.push(ic);
			}
		}
		return ans;
	}


	// Editable Property
	add_EditableProperty(name, type, data, set, get) {
		if (this.editableproperty[name] !== undefined) {
			throw new Error(Module.get_StyledHTML(this) + ' 中 ' + HTML.create_KeyPair('编辑属性', name, 'String') + ' 已经存在');
		}
		else {
			let property = {
				data: data,
				type: type,
				set: set,
				get: get
			};
			this.editableproperty[name] = property;
			property.set(property.data, this);
		}
	}

	get_EditableProperty() {
		let ans = [];
		for (let key in this.editableproperty) {
			ans.push(key);
		}
		return ans;
	}

	get_EditablePropertyInspector() {
		let ans = [];
		for (let key in this.editableproperty) {
			let property = this.editableproperty[key];
			switch (property.type) {
				case 'string': {
					ans.push({ type: 'lineedit', action: 'edit_Property:' + key, title: key, itemvalue: { value: property.data, placeholder: '' } })
				}
					break;
				case 'dropdown2': {
					ans.push({ type: 'dropdown2', action: 'edit_Property:' + key, title: key, itemvalue: property.data })
				}
					break;
				case 'vector2': {
					ans.push({ type: 'vector2', action: 'edit_Property:' + key, title: key, itemvalue: { x: property.data.x, y: property.data.y, min: -1000000, max: 1000000, step: 1 } })
				}
					break;
				case 'number': {
					ans.push({ type: 'numberedit', action: 'edit_Property:' + key, title: key, itemvalue: { value: property.data, placeholder: 0, min: -1000000, max: 1000000, step: 1 } })
				}
					break;
				case 'load': {
					ans.push({ type: 'checkload', action: 'edit_Property:' + key, title: '', itemvalue: { value: property.data.current, max: property.data.max, uid: this.uid, valid: true, selected: false } })
				}
					break;
			}
		}
		return ans;
	}

	set_EditableProperty(property, val) {
		if (this.editableproperty[property] === undefined) {
			throw new Error(Module.get_StyledHTML(this) + ' 中不存在 ' + HTML.create_KeyPair('编辑属性', name, 'String'));
		}
		return this.editableproperty[property].set(val, this);
	}

	get_Info() {
		return "Module " + this.uid + ', ' + this.name
	}

	regulate_Property() {
		if (this.property === null) this.property = { version: '', 关联组件: '0', 杆高: '1', 材质: '钢' }
		if (this.property.关联组件 !== undefined) {
			this.property.关联组件 = parseInt(this.property.关联组件)
		}
	}

	get_Property() {
		let properties = JSON.parse(JSON.stringify(this.property));
		for (let key in this.editableproperty) {
			let editableproperty = this.editableproperty[key];
			Object.assign(properties, editableproperty.get());
		}
		return properties;
	}

	get_JSONObject() {
		if (this.property === null) this.property = { version: '', 关联组件: '0', 杆高: '1', 材质: '钢' }
		if (this.property.关联组件 !== undefined) {
			this.property.关联组件 = parseInt(this.property.关联组件)
		}
		let jsonobject = {
			parseengine: '1.0.0',
			modulename: this.name,
			classification: this.classification,
			url: this.url,
			moduleposition: [this.shiftposition.x, this.shiftposition.y, this.shiftposition.z],
			modulerotation: [this.shiftrotation.x, this.shiftrotation.y, this.shiftrotation.z],
			property: this.property,
			slots: []
		}
		this.slotlist.forEach((slot, idx) => {
			if (slot.name !== '原点插槽') {
				jsonobject.slots.push(slot.get_JSONObject(idx))
			}
		})
		return jsonobject
	}

	export_STL(binary = true, unit = Unit) {
		let scene = [];
		this.Traverse((m) => {
			if (m.model !== null) {
				scene.push(m.model)
			}
		})

		let vector = new THREE.Vector3();
		let normalMatrixWorld = new THREE.Matrix3();

		let output = '';

		output += 'solid exported\n';

		scene.forEach(function (object) {
			// !object instanceof THREE.Object3D && !object instanceof THREE.Line && !object instanceof THREE.ArrowHelper
			// console.log(object, object instanceof THREE.Mesh && !(object instanceof THREE.Line) && !(object instanceof THREE.ArrowHelper))
			if (object.type === 'Mesh') {


				// if object is hidden - exit
				// if (object.visible == false) return;
				// console.log(object)
				var geometry = object.geometry;
				var matrixWorld = object.matrixWorld;
				var mesh = object;

				// console.log(geometry, geometry instanceof THREE.BufferGeometry)


				if (geometry.type === 'BufferGeometry') {
					geometry = new THREE.Geometry().fromBufferGeometry(geometry)
				}


				if (geometry.type === 'Geometry') {

					var vertices = geometry.vertices;
					var faces = geometry.faces;

					// console.log(faces)

					normalMatrixWorld.getNormalMatrix(matrixWorld);

					if (typeof faces != 'undefined') {

						for (var i = 0, l = faces.length; i < l; i++) {
							var face = faces[i];

							vector.copy(face.normal).applyMatrix3(normalMatrixWorld).normalize();

							output += '\tfacet normal ' + vector.x / unit + ' ' + -vector.z / unit + ' ' + vector.y / unit + '\n';
							output += '\t\touter loop\n';

							var indices = [face.a, face.b, face.c];

							for (var j = 0; j < 3; j++) {
								var vertexIndex = indices[j];
								if (typeof geometry.skinIndices !== 'undefined' && geometry.skinIndices.length == 0) {
									vector.copy(vertices[vertexIndex]).applyMatrix4(matrixWorld);
									output += '\t\t\tvertex ' + vector.x / unit + ' ' + -vector.z / unit + ' ' + vector.y / unit + '\n';
								} else {
									vector.copy(vertices[vertexIndex]); //.applyMatrix4( matrixWorld );

									var boneIndices = [
										geometry.skinIndices[vertexIndex].x,
										-geometry.skinIndices[vertexIndex].z,
										geometry.skinIndices[vertexIndex].y,
										geometry.skinIndices[vertexIndex].w
									];

									var weights = [
										geometry.skinWeights[vertexIndex].x,
										-geometry.skinWeights[vertexIndex].z,
										geometry.skinWeights[vertexIndex].y,
										geometry.skinWeights[vertexIndex].w
									];

									var inverses = [
										skeleton.boneInverses[boneIndices[0]],
										-skeleton.boneInverses[boneIndices[2]],
										skeleton.boneInverses[boneIndices[1]],
										skeleton.boneInverses[boneIndices[3]]
									];

									var skinMatrices = [
										skeleton.bones[boneIndices[0]].matrixWorld,
										-skeleton.bones[boneIndices[2]].matrixWorld,
										skeleton.bones[boneIndices[1]].matrixWorld,
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
											morphMatricesY[mt] = -geometry.morphTargets[mt].vertices[vertexIndex].z;
											morphMatricesZ[mt] = geometry.morphTargets[mt].vertices[vertexIndex].y;
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

										var tempVector = new THREE.Vector4(vector.x, -vector.z, vector.y);
										tempVector.multiplyScalar(weights[k]);
										//the inverse takes the vector into local bone space
										tempVector.applyMatrix4(inverses[k])
											//which is then transformed to the appropriate world space
											.applyMatrix4(skinMatrices[k]);
										finalVector.add(tempVector);

									}

									output += '\t\t\tvertex ' + finalVector.x / unit + ' ' + -finalVector.z / unit + ' ' + finalVector.y / unit + '\n';
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

		if (binary) {
			output = to_BinarySTL(output)
		}

		return output;
	}

	static get_Summary(module, layer = 0) {
		var summary = "";
		for (let i = 0; i < layer; i++) {
			summary += "    ";
		}
		if (module.is_Link()) {
			let linkslots = '';
			module.linkslotlist.forEach((slot) => {
				linkslots += ' ' + slot.get_Info();
			});
			console.log(summary + "%c+ %cModule%c" + module.uid + ', ' + module.name + '%c 驱动自:%c' + linkslots, "font-weight:bold;", "padding: 2px 8px ; background-color:rgb(60, 80, 240); border-radius: 4px 0px 0px 4px; color:white;font-weight:bold;", "padding: 2px 8px ; background-color: rgb(50,50,50); border-radius: 0px 4px 4px 0px; color: white;", "", "padding: 2px 8px ; background-color: rgb(50,50,50); border-radius: 4px 4px 4px 4px; color: white;");
		}
		else
			console.log(summary + "%c+ %cModule%c" + module.uid + ', ' + module.name + '', "font-weight:bold;", "padding: 2px 8px ; background-color:rgb(60, 80, 240); border-radius: 4px 0px 0px 4px; color:white;font-weight:bold;", "padding: 2px 8px ; background-color: rgb(50,50,50); border-radius: 0px 4px 4px 0px; color: white;");
	}

	static get_StyledHTML(module) {
		let str = "<span style=\"padding: 4px 8px ; background-color:rgb(60, 80, 240); border-radius: var(--ObjectRadius) 0px 0px var(--ObjectRadius); color:white;font-weight:bold;\">组件</span><span style=\"padding: 4px 8px ; background-color: rgb(50,50,50); border-radius: 0px var(--ObjectRadius) var(--ObjectRadius) 0px; color: white;\">" + module.uid + ', ' + module.name + "</span>"
		return str
	}

	static set_Scale(module, x = null, y = null, z = null, unit = Unit) {
		if (x !== null) {
			module.model_scale.x = x
		}
		if (y !== null) {
			module.model_scale.y = y
		}
		if (z !== null) {
			module.model_scale.z = z
		}
		if (module.model !== null) {
			module.model.scale.set(module.model_scale.x * unit, module.model_scale.y * unit, module.model_scale.z * unit)
			module.line.scale.set(module.model_scale.x * unit, module.model_scale.y * unit, module.model_scale.z * unit)
		}
	}

	static remove_from_Scene(module, dispose = true) {
		module.is_in_scene = false
		module.scene.remove(module.model);
		module.scene.remove(module.line);
		module.remove_AllPlugin();
		if (dispose) {
			Module.dispose(module);
		}
	}

	static dispose(module) {
		module.is_disposed = true;
		// //console.log('dispose' + module.name);
		if (module.line !== null)
			disposeHierarchy(module.model);
		if (module.line !== null)
			disposeHierarchy(module.line);
	}

	static add_to_Scene(module) {
		module.is_in_scene = true
		if (module.model != null && module.model != undefined) {
			module.scene.add(module.model);
		}
		if (module.line != null && module.line != undefined) {
			module.scene.add(module.line);
		}
	}

	static highlight(module, highlight = true, color = '#ff9800', ignore_group = false) {
		module.highlight_color = color
		if (!ignore_group && module.is_InGroup() && module.is_GroupRoot()) {
			module.get_GroupNodes().forEach((node) => {
				Module.highlight(node, highlight, color, true)
			})
		}
		else {
			if (highlight) {
				module.is_highlighted = true
				if (module.line !== null) {
					module.line.visible = true
					module.line.material.color = new THREE.Color(module.highlight_color)
				}
			}
			else {
				module.is_highlighted = false
				if (module.line !== null) {
					module.line.visible = false
					module.line.material.color = new THREE.Color(module.highlight_color)
				}
			}
		}

	}

	static set_Visible(module, visible = true, ignore_group = true) {
		module.is_visible = visible
		if (module.model !== null) {
			module.model.visible = visible
		}
	}

	static set_Color(module, opacity = 1, color = '#ffffff', ignore_group = true) {
		module.model_color = color
		module.model_opacity = opacity
		if (module.model !== null) {
			module.model.material.opacity = module.model_opacity
			module.model.material.color = new THREE.Color(module.model_color)
		}
	}

	// get the name of the way to calcu the linkslot references
	static get_LinkCalcuStyleName(styleobject) {
		// //console.log(styleobject.x, styleobject.y, styleobject.z)
		if (styleobject.x && !styleobject.y && !styleobject.z) return 'X';
		if (!styleobject.x && styleobject.y && !styleobject.z) return 'Y';
		if (!styleobject.x && !styleobject.y && styleobject.z) return 'Z';
		if (styleobject.x && styleobject.y && !styleobject.z) return 'XY';
		if (styleobject.x && !styleobject.y && styleobject.z) return 'XZ';
		if (!styleobject.x && styleobject.y && styleobject.z) return 'YZ';
		if (styleobject.x && styleobject.y && styleobject.z) return 'XYZ';
		if (!styleobject.x && !styleobject.y && !styleobject.z) return '无';
	}

	// get HSL world position
	static to_HSL(pos, round = true, plane = "XZ") {
		let angle = Math.atan2(pos.z, pos.x) / Math.PI * 180
		switch (plane) {
			case 'XY':
				angle = Math.atan2(pos.y, pos.x) / Math.PI * 180;
				break;
			case 'YZ':
				angle = Math.atan2(pos.z, pos.y) / Math.PI * 180;
				break;
		}
		if (angle < 0) {
			angle = 360 + angle
		}
		if (round) return { angle: Math.round(angle), x: Math.round(Math.sqrt(pos.z * pos.z + pos.x * pos.x)), y: Math.round(pos.y) }
		else
			return { angle: angle, x: Math.sqrt(pos.z * pos.z + pos.x * pos.x), y: pos.y }
	}

	// convert SM_Free from World to Local
	// this only works with SM_Free
	static convert_to_Local(module, layer, round = true) {
		if (module.relatetoorigin) {
			module.relatetoorigin = false
			let position = new THREE.Vector3(0, 0, 0)
			let parentposition = new THREE.Vector3(0, 0, 0)
			parentposition.copy(module.slot_world_position)
			position.copy(module.world_position)
			position.add(parentposition.negate())
			let rotation = new THREE.Euler(0, 0, 0, "XYZ")
			let parentrotation = new THREE.Quaternion()
			parentrotation.setFromEuler(module.slot_world_rotation)
			let selfrotation = new THREE.Quaternion()
			selfrotation.setFromEuler(module.slotmodifier.rotation)
			rotation.setFromQuaternion(parentrotation.invert().multiply(selfrotation))

			let reverserotation = new THREE.Euler(0, 0, 0, "XYZ")
			parentrotation.setFromEuler(module.slot_world_rotation)
			reverserotation.setFromQuaternion(parentrotation.invert())
			position.applyEuler(reverserotation)
			// rotation.reorder('YXZ')
			// rotation.reorder('XYZ')

			if (round) {
				module.slotmodifier.position.set(Math.round(position.x), Math.round(position.y), Math.round(position.z))
				module.slotmodifier.rotation.set(Math.round(rotation.x / Math.PI * 180) / 180 * Math.PI, Math.round(rotation.y / Math.PI * 180) / 180 * Math.PI, Math.round(rotation.z / Math.PI * 180) / 180 * Math.PI)
			}
			else {
				module.slotmodifier.position.copy(position)
				module.slotmodifier.rotation.copy(rotation)
			}
		}
	}

}

//////////////////////////////////////////////////////////////////////////////
// Utitlity
function get_CheckSlotFunction(classification) {
	switch (classification) {
		case '微型杆': {						// can = 代表可以链接   slot.classificationid === 0 代表是地基
			// 同时 没连其他的， mask代表使用热区时需要覆盖哪些轴向，可以参考下面搭载设备的实现
			return (module, slot, base, scenedata) => { return { can: slot.classificationid === 0 && slot.connectedmodule.length === 0, mask: [0, 0, 0] } }
		}
		case '搭载设备':
			return (module, slot, base, scenedata) => {
				if (slot.belong.classificationid === 2 && slot.classificationid === 6) {
					// 横臂
					return { can: true, mask: [0, 0, true] }
				}
				if (slot.belong.classificationid === 5 && slot.classificationid === 6) {
					// 连接件
					return { can: true, mask: [0, 0, 0] }
				}
				if (slot.belong.classificationid === 0 && slot.classificationid === 5) {
					return { can: true, mask: [0, true, 0] }
				}
				if (slot.belong.classificationid === 7 && slot.classificationid === 5) {
					return { can: true, mask: [0, true, 0] }
				}
				else {
					return { can: false }
				}
			}
		case '连接件':
			return (module, slot, base, scenedata) => {
				//console.log(">>>>>>")
				if (slot.belong.classificationid === 0 && slot.classificationid === 5) {
					// 主杆
					return { can: true, mask: [0, true, 0] }
				}
				if (slot.belong.classificationid === 7 && slot.classificationid === 5) {
					// 主杆
					return { can: true, mask: [0, true, 0] }
				}
				if (!DEMO && slot.belong.classificationid === 1 && slot.classificationid === 4) {
					// 副杆
					return { can: true, mask: [0, true, 0] }
				}
				if (DEMO && slot.belong.classificationid === 1 && slot.classificationid === -1) {
					// 副杆
					return { can: true, mask: [0, true, 0] }
				}
				else {
					return { can: false }
				}
			}
		case '灯臂':
			return (module, slot, base, scenedata) => {
				if (!DEMO && slot.classificationid === 4) {
					// console.log(scenedata.pos.y, slot.belong.editorworkspace.boundingbox.max.y * 2, module.editorworkspace.boundingbox.max.y * 2)
					if (scenedata.pos !== undefined) {
						let children = slot.belong.get_Children().filter((lamp) => { return lamp.classification === '灯臂' && lamp.componentid === module.componentid }).sort((a, b) => {
							return Math.abs(a.slotmodifier.position.y - scenedata.pos.y) - Math.abs(b.slotmodifier.position.y - scenedata.pos.y)
						})
						// //console.log(children)
						if (children.length > 0) {
							if (Math.abs(children[0].slotmodifier.position.y - scenedata.pos.y) <= 1) {
								return { can: true, mask: [children[0].slotmodifier.position.x, children[0].slotmodifier.position.y, children[0].slotmodifier.position.z], rotation: [children[0].slotmodifier.rotation.x, (children[0].slotmodifier.rotation.y + Math.PI) % (Math.PI * 2), children[0].slotmodifier.rotation.z] }
							}
						}
					}
					if (scenedata.pos !== undefined && slot.belong.editorworkspace.boundingbox !== undefined && module.editorworkspace.boundingbox !== undefined) {
						let maxheight = slot.belong.editorworkspace.boundingbox.max.y * 2 - module.editorworkspace.boundingbox.max.y * 2
						if (scenedata.pos.y > maxheight) {
							return { can: true, mask: [0, maxheight, 0] }
						}
					}
					return { can: true, mask: [0, true, 0] }
				}
				else if (DEMO && slot.classificationid === -1) {
					if (scenedata.pos !== undefined) {
						let children = slot.belong.get_Children().filter((lamp) => { return lamp.classification === '灯臂' && lamp.componentid === module.componentid }).sort((a, b) => {
							return Math.abs(a.slotmodifier.position.y - scenedata.pos.y) - Math.abs(b.slotmodifier.position.y - scenedata.pos.y)
						})
						// //console.log(children)
						if (children.length > 0) {
							if (Math.abs(children[0].slotmodifier.position.y - scenedata.pos.y) <= 1) {
								return { can: true, mask: [children[0].slotmodifier.position.x, children[0].slotmodifier.position.y, children[0].slotmodifier.position.z], rotation: [children[0].slotmodifier.rotation.x, (children[0].slotmodifier.rotation.y + Math.PI) % (Math.PI * 2), children[0].slotmodifier.rotation.z] }
							}
						}
					}
					return { can: true, mask: [0, true, 0] }
				}
				else {
					return { can: false }
				}
			}
		default:
			return (module, slot, base, scenedata) => { return { can: slot.classificationid === module.classificationid && slot.connectedmodule.length === 0, mask: [0, 0, 0] } }
	}
}

function get_DefaultSlotFunction(classification) {
	switch (classification) {
		case '主杆': case '微型杆':
			return new Function('module', 'classification', "return module.get_Slot_by_ClassID(5)")
		case '副杆':
			return !DEMO ? new Function('module', 'classification', "return module.get_Slot_by_ClassID(4)") : new Function('module', 'classification', "return module.get_Slot_by_ClassID(-1)")
		case '横臂':
			return new Function('module', 'classification', "return module.get_Slot_by_ClassID(6)")
		default:
			return new Function('module', 'classification', "return null")
	}
}
//////////////////////////////////////////////////////////////////////////////

function map_Slot_Legacy(name) {
	switch (name) {
		case 'BaseSlot':
			return 0
		case '副杆插槽':
			return 1
		case '横臂插槽':
			return 2
		case '搭载设备插槽':
			return 6
		case '装载设施插槽':
			return 6
		case '灯臂插槽':
			return 4
		case '连接件插槽':
			return 5
	}
}

function get_SlotName_Legacy(name) {
	switch (name) {
		case 'BaseSlot':
			return 'BaseSlot'
		case '原点插槽':
			return '原点插槽'
		case '副杆插槽':
			return '副杆插槽'
		case '横臂插槽':
			return '横臂插槽'
		case '搭载设备插槽':
			return '搭载设备插槽'
		case '搭载设施插槽':
			return '搭载设备插槽'
		case '装载设施插槽':
			return '搭载设备插槽'
		case '装载设备插槽':
			return '搭载设备插槽'
		case '灯臂插槽':
			return '灯臂插槽'
		case '连接件插槽':
			return '连接件插槽'
		case '箱顶盖插槽':
			return '箱顶盖插槽'
		case '前门插槽':
			return '前门插槽'
		case '仓位分隔板插槽':
			return '仓位分隔板插槽'
		case '后门插槽':
			return '后门插槽'
		case '侧门插槽':
			return '侧门插槽'
		case '风扇插槽':
			return '风扇插槽'
		case '波纹插槽':
			return '波纹插槽'
		case '门锁插槽':
			return '门锁插槽'

	}
}

export function disposeNode(node) {
	if (node instanceof THREE.Mesh) {
		if (node.geometry) {
			node.geometry.dispose();
		}

		if (node.material) {
			if (node.material instanceof THREE.MeshFaceMaterial) {
				$.each(node.material.materials, function (idx, mtrl) {
					if (mtrl.map) mtrl.map.dispose();
					if (mtrl.lightMap) mtrl.lightMap.dispose();
					if (mtrl.bumpMap) mtrl.bumpMap.dispose();
					if (mtrl.normalMap) mtrl.normalMap.dispose();
					if (mtrl.specularMap) mtrl.specularMap.dispose();
					if (mtrl.envMap) mtrl.envMap.dispose();
					if (mtrl.alphaMap) mtrl.alphaMap.dispose();
					if (mtrl.aoMap) mtrl.aoMap.dispose();
					if (mtrl.displacementMap) mtrl.displacementMap.dispose();
					if (mtrl.emissiveMap) mtrl.emissiveMap.dispose();
					if (mtrl.gradientMap) mtrl.gradientMap.dispose();
					if (mtrl.metalnessMap) mtrl.metalnessMap.dispose();
					if (mtrl.roughnessMap) mtrl.roughnessMap.dispose();

					mtrl.dispose();    // disposes any programs associated with the material
				});
			}
			else {
				if (node.material.map) node.material.map.dispose();
				if (node.material.lightMap) node.material.lightMap.dispose();
				if (node.material.bumpMap) node.material.bumpMap.dispose();
				if (node.material.normalMap) node.material.normalMap.dispose();
				if (node.material.specularMap) node.material.specularMap.dispose();
				if (node.material.envMap) node.material.envMap.dispose();
				if (node.material.alphaMap) node.material.alphaMap.dispose();
				if (node.material.aoMap) node.material.aoMap.dispose();
				if (node.material.displacementMap) node.material.displacementMap.dispose();
				if (node.material.emissiveMap) node.material.emissiveMap.dispose();
				if (node.material.gradientMap) node.material.gradientMap.dispose();
				if (node.material.metalnessMap) node.material.metalnessMap.dispose();
				if (node.material.roughnessMap) node.material.roughnessMap.dispose();

				node.material.dispose();   // disposes any programs associated with the material
			}
		}
	}
}

export function disposeHierarchy(node) {
	if (node === null) return;
	for (var i = node.children.length - 1; i >= 0; i--) {
		var child = node.children[i];
		disposeHierarchy(child, disposeNode);
		disposeNode(child);
	}
}
// Create Module Function
// create a module from new formated json
export function create_Module_from_Json(json, scene) {
	let Main_data = json
	if (Main_data === null) {
		throw new Error("在 create_Module_from_Json 中 参数 json 非法")
	}

	let slotmodifier = new SM_Free()
	if (Main_data.shiftposition !== undefined) {
		slotmodifier.position = new THREE.Vector3(parseFloat(Main_data.shiftposition[0]), parseFloat(Main_data.shiftposition[1]), parseFloat(Main_data.shiftposition[2]))
	}
	if (Main_data.shiftrotation !== undefined) {
		slotmodifier.rotation = new THREE.Euler(parseFloat(Main_data.shiftrotation[0]), parseFloat(Main_data.shiftrotation[1]), parseFloat(Main_data.shiftrotation[2]), 'XYZ')
	}

	let module = new Module(Main_data.componentid, Main_data.id || 0, Main_data.name, new THREE.Vector3(parseFloat(Main_data.position[0]), parseFloat(Main_data.position[1]), parseFloat(Main_data.position[2])), new THREE.Euler(parseFloat(Main_data.rotation[0]), parseFloat(Main_data.rotation[1]), parseFloat(Main_data.rotation[2]), 'XYZ'), scene, Main_data.url, slotmodifier, Main_data.relatetoorigin, Main_data.classification, Main_data.property, Main_data.groupid, json.orgType)

	let current_slotlist = Main_data.slots

	for (let i = 0; i < current_slotlist.length; i++) {
		let Slot_data = current_slotlist[i]
		let slot = new Slot(Slot_data.id, Slot_data.name, new THREE.Vector3(parseFloat(Slot_data.position[0]), parseFloat(Slot_data.position[1]), parseFloat(Slot_data.position[2])), new THREE.Euler(parseFloat(Slot_data.rotation[0]), parseFloat(Slot_data.rotation[1]), parseFloat(Slot_data.rotation[2]), 'XYZ'), scene, Slot_data.property, Slot_data.type || null)
		module.add_Slot(slot)
	}

	if (module.classificationid === 6 && json.validInstallPositionList && json.validInstallPositionList !== null) {
		const checkSlotFunc = {
			0: (module, slot, base, scenedata) => {
				if (slot.classificationid === 6) {
					if (slot.belong !== null && slot.belong.classificationid === 5) {
						let parent = slot.belong.get_Parent()
						if (parent !== null && parent.classificationid === 0)
							return { can: true, mask: [0, 0, 0] }
					}
				}
				return { can: false }
			},
			1: (module, slot, base, scenedata) => {
				if (slot.classificationid === 6) {
					if (slot.belong !== null && slot.belong.classificationid === 5) {
						let parent = slot.belong.get_Parent()
						if (parent !== null && parent.classificationid === 1)
							return { can: true, mask: [0, 0, 0] }
					}
				}
				return { can: false }
			},
			2: (module, slot, base, scenedata) => {
				if (slot.classificationid === 6) {
					if (slot.belong !== null && slot.belong.classificationid === 2) {
						return { can: true, mask: [0, 0, true] }
					}
				}
				return { can: false }
			}
		}
		let slotcheckfuncs = json.validInstallPositionList.map((i) => { return checkSlotFunc[i] })
		let func = (thismodule, slot, base, scenedata) => {
			for (let i = 0; i < slotcheckfuncs.length; i++) {
				let ans = slotcheckfuncs[i](thismodule, slot, base, scenedata)
				if (ans.can) {
					return ans
				}
			}
			return { can: false }
		}
		module.rules.check_Slot = func
		//console.log(module)
	}

	if (json.elevationAngle !== undefined) {
		if (module.editableproperty['灯臂仰角'] !== undefined) {
			module.set_EditableProperty('灯臂仰角', json.elevationAngle)
		}
	}

	if (json.is2F !== undefined && json.is2F) {
		module.add_EditableProperty('2F尺寸', 'vector2', { x: 1600, y: 1800 }, function (val, module) {
			this.data = val
			Module.set_Scale(module, (this.data.x / 1600), (this.data.y / 1800), null)
			return true
		}, function () {
			return { equipLength: this.data.x, equipWidth: this.data.y }
		})
		module.set_EditableProperty('2F尺寸', { x: json.equipLength, y: json.equipWidth })
	}

	if (json.is3F !== undefined && json.is3F) {
		module.add_EditableProperty('3F尺寸', 'vector2', { x: 1600, y: 1800 }, function (val, module) {
			this.data = val
			Module.set_Scale(module, (this.data.x / 1600), (this.data.y / 1800), null)
			return true
		}, function () {
			return { equipLength: this.data.x, equipWidth: this.data.y }
		})
		module.set_EditableProperty('3F尺寸', { x: json.equipLength, y: json.equipWidth })
	}

	customLog(null, 'log', 'ModuleSlot.js', 'create_Module_from_Json', '')
	// //console.log(module)

	return module
}

export function create_MainPoleDisassembly_from_Json(json, scene) {
	//console.log(json)
	let mainpoleJson = json
	let mainpoleCreateJson = {
		componentid: json.componentid,
		id: null,
		name: json.name,
		classification: json.classification,
		url: json.disassemblyPrimaryPoleList === undefined || json.disassemblyPrimaryPoleList.length === 0 ? json.url : '',
		position: json.position,
		rotation: json.rotation,
		slots: json.disassemblyPrimaryPoleList === undefined || json.disassemblyPrimaryPoleList.length === 0 ? json.slots : [],
		property: json.property,
		groupid: json.componentid
	}
	let mainpoleModule = create_Module_from_Json(mainpoleCreateJson, scene)
	if (mainpoleJson.disassemblyPrimaryPoleList !== null && mainpoleJson.disassemblyPrimaryPoleList !== undefined) {
		let len = 100000
		let top = 150
		let bottom = 150

		if (mainpoleCreateJson.property) {
			len = parseFloat(mainpoleCreateJson.property.length) || 1000000
			top = parseFloat(mainpoleCreateJson.property.lowerCaliber) || 150
			bottom = parseFloat(mainpoleCreateJson.property.upperCaliber) || 150
		}

		for (let i = 0; i < mainpoleJson.disassemblyPrimaryPoleList.length; i++) {
			let partsjson = mainpoleJson.disassemblyPrimaryPoleList[i]
			let partsCreateJson = {
				componentid: partsjson.componentId,
				name: partsjson.disassemblyRawMaterialName,
				url: partsjson.disassemblyRawMaterialFileAddr,
				id: partsjson.disassemblyRawMaterialId,
				property: {
					flangeType: partsjson.flangeType,
					sideFlangeAngle: partsjson.sideFlangeAngle,
					sideFlangeHeight: partsjson.sideFlangeHeight,
					sideFlangeSpec: partsjson.sideFlangeSpec,
					specsId: partsjson.specsId
				},
				position: partsjson.moduleposition,
				rotation: partsjson.modulerotation,
				slots: [],
				groupid: mainpoleModule.componentid
			}
			for (let i = 0; i < partsjson.interfaces.length; i++) {
				let slotJson = partsjson.interfaces[i]
				partsCreateJson.slots.push({
					id: slotJson.interfaceUID,
					name: slotJson.interfacename,
					position: slotJson.interfaceposition,
					rotation: slotJson.interfacerotation,
					actionlist: slotJson.rules,
					type: slotJson.slotType,
					property: {}
				})
			}
			// //console.log(partsjson)
			switch (partsjson.disassemblyType) {
				case 1: {
					mainpoleModule.url = partsCreateJson.url
					mainpoleModule.load_Mesh(mainpoleModule.url)
					let current_slotlist = partsCreateJson.slots
					for (let i = 0; i < current_slotlist.length; i++) {
						let Slot_data = current_slotlist[i]
						let slot = new Slot(Slot_data.id, Slot_data.name, new THREE.Vector3(parseFloat(Slot_data.position[0]), parseFloat(Slot_data.position[1]), parseFloat(Slot_data.position[2])), new THREE.Euler(parseFloat(Slot_data.rotation[0]), parseFloat(Slot_data.rotation[1]), parseFloat(Slot_data.rotation[2]), 'XYZ'), scene, Slot_data.property, Slot_data.type || null)
						mainpoleModule.add_Slot(slot)
					}
					mainpoleModule.shiftposition.set(parseFloat(partsCreateJson.position[0]), parseFloat(partsCreateJson.position[1]), parseFloat(partsCreateJson.position[2]))
					mainpoleModule.shiftrotation.set(parseFloat(partsCreateJson.rotation[0]), parseFloat(partsCreateJson.rotation[1]), parseFloat(partsCreateJson.rotation[2]))
				}
					break
				case 2: {
					// 侧法兰
					let angle = (360.0 - parseFloat(partsjson.sideFlangeAngle)) / 180 * Math.PI
					partsCreateJson.shiftrotation = [0, angle, 0]
					partsCreateJson.shiftposition = [0, partsjson.sideFlangeHeight * Unit, 0]
					partsCreateJson.slots[0].property = {
						yMin: partsjson.sideFlangeHeight,
						yMax: partsjson.sideFlangeHeight,
						angleMin: partsjson.sideFlangeAngle,
						angleMax: partsjson.sideFlangeAngle
					}
					let partsModule = create_Module_from_Json(partsCreateJson, scene)
					partsModule.allowadditionalposition = false;
					mainpoleModule.get_Slot_by_Name('原点插槽').connect(partsModule)
				}
					break
				case 3: {
					// 底法兰
					let partsModule = create_Module_from_Json(partsCreateJson, scene)
					partsModule.allowadditionalposition = false;
					mainpoleModule.get_Slot_by_Name('原点插槽').connect(partsModule)
				}
					break
				case 4: {
					// 顶法兰
					partsCreateJson.shiftposition = [0, partsjson.sideFlangeHeight * Unit, 0]
					let partsModule = create_Module_from_Json(partsCreateJson, scene)
					partsModule.allowadditionalposition = false;
					mainpoleModule.get_Slot_by_Name('原点插槽').connect(partsModule)
				}
					break
				case 5: {
					// 小检修门
					let angle = degree_to_radius(360 - parseFloat(partsjson.sideFlangeAngle))
					let p = partsjson.sideFlangeHeight / len
					let size = (bottom + (top - bottom) * p) * Unit
					let x = Math.cos(Math.PI * 2 - angle) * size
					let y = Math.sin(Math.PI * 2 - angle) * size
					partsCreateJson.shiftposition = [x, partsjson.sideFlangeHeight * Unit, y]
					partsCreateJson.shiftrotation = [0, angle, 0]
					let partsModule = create_Module_from_Json(partsCreateJson, scene)
					partsModule.allowadditionalposition = false;
					mainpoleModule.get_Slot_by_Name('原点插槽').connect(partsModule)
				}
					break
				case 6: {
					// 大检修门
					let angle = degree_to_radius(360 - parseFloat(partsjson.sideFlangeAngle))
					let p = partsjson.sideFlangeHeight / len
					let size = (bottom + (top - bottom) * p) * Unit
					//console.log(angle, size)
					let x = Math.cos(Math.PI * 2 - angle) * size
					let y = Math.sin(Math.PI * 2 - angle) * size
					partsCreateJson.shiftposition = [x, partsjson.sideFlangeHeight * Unit, y]
					partsCreateJson.shiftrotation = [0, angle, 0]
					let partsModule = create_Module_from_Json(partsCreateJson, scene)
					partsModule.allowadditionalposition = false;
					mainpoleModule.get_Slot_by_Name('原点插槽').connect(partsModule)
				}
					break
			}
		}
	}

	return mainpoleModule
}

export function create_Component_from_Json(json, scene) {
	if (json.classification === '主杆' || json.classification === '微型杆') {
		return create_MainPoleDisassembly_from_Json(json, scene);
	}
	else {
		return create_Module_from_Json(json, scene);
	}
}


export function create_Module_from_Json_Promise(json, scene, progress = () => { }) {
	let Main_data = json

	if (Main_data === null) {
		throw new Error("在 create_Module_from_Json 中 参数 json 非法")
	}

	let slotmodifier = new SM_Free()
	if (Main_data.shiftposition !== undefined) {
		slotmodifier.position = new THREE.Vector3(parseFloat(Main_data.shiftposition[0]), parseFloat(Main_data.shiftposition[1]), parseFloat(Main_data.shiftposition[2]))
	}
	if (Main_data.shiftrotation !== undefined) {
		slotmodifier.rotation = new THREE.Euler(parseFloat(Main_data.shiftrotation[0]), parseFloat(Main_data.shiftrotation[1]), parseFloat(Main_data.shiftrotation[2]), 'XYZ')
	}

	let module = new Module(Main_data.componentid, Main_data.id || 0, Main_data.name, new THREE.Vector3(parseFloat(Main_data.position[0]), parseFloat(Main_data.position[1]), parseFloat(Main_data.position[2])), new THREE.Euler(parseFloat(Main_data.rotation[0]), parseFloat(Main_data.rotation[1]), parseFloat(Main_data.rotation[2]), 'XYZ'), scene, '', slotmodifier, Main_data.relatetoorigin, Main_data.classification, Main_data.property, Main_data.groupid)
	module.url = json.url
	let promise = module.load_Mesh(Main_data.url, Unit, (x) => { progress(x.loaded / x.total * 100) })

	let current_slotlist = Main_data.slots

	for (let i = 0; i < current_slotlist.length; i++) {
		let Slot_data = current_slotlist[i]
		let slot = new Slot(Slot_data.id, Slot_data.name, new THREE.Vector3(parseFloat(Slot_data.position[0]), parseFloat(Slot_data.position[1]), parseFloat(Slot_data.position[2])), new THREE.Euler(parseFloat(Slot_data.rotation[0]), parseFloat(Slot_data.rotation[1]), parseFloat(Slot_data.rotation[2]), 'XYZ'), scene, Slot_data.property, Slot_data.type || null)
		module.add_Slot(slot)
	}

	if (module.classificationid === 6 && json.validInstallPositionList && json.validInstallPositionList !== null) {
		const checkSlotFunc = {
			0: (module, slot, base, scenedata) => {
				if (slot.classificationid === 6) {
					if (slot.belong !== null && slot.belong.classificationid === 5) {
						let parent = slot.belong.get_Parent()
						if (parent !== null && parent.classificationid === 0)
							return { can: true, mask: [0, 0, 0] }
					}
				}
				return { can: false }
			},
			1: (module, slot, base, scenedata) => {
				if (slot.classificationid === 6) {
					if (slot.belong !== null && slot.belong.classificationid === 5) {
						let parent = slot.belong.get_Parent()
						if (parent !== null && parent.classificationid === 1)
							return { can: true, mask: [0, 0, 0] }
					}
				}
				return { can: false }
			},
			2: (module, slot, base, scenedata) => {
				if (slot.classificationid === 6) {
					if (slot.belong !== null && slot.belong.classificationid === 2) {
						return { can: true, mask: [0, 0, true] }
					}
				}
				return { can: false }
			}
		}
		let slotcheckfuncs = json.validInstallPositionList.map((i) => { return checkSlotFunc[i] })
		let func = (thismodule, slot, base, scenedata) => {
			for (let i = 0; i < slotcheckfuncs.length; i++) {
				let ans = slotcheckfuncs[i](thismodule, slot, base, scenedata)
				if (ans.can) {
					return ans
				}
			}
			return { can: false }
		}
		module.rules.check_Slot = func
		//console.log(module)
	}

	if (json.elevationAngle !== undefined) {
		if (module.editableproperty['灯臂仰角'] !== undefined) {
			module.set_EditableProperty('灯臂仰角', json.elevationAngle)
		}
	}

	if (json.is2F !== undefined && json.is2F) {
		module.add_EditableProperty('2F尺寸', 'vector2', { x: 1600, y: 1800 }, function (val, module) {
			this.data = val
			Module.set_Scale(module, (this.data.x / 1600), (this.data.y / 1800), null)
			return true
		}, function () {
			return { equipLength: this.data.x, equipWidth: this.data.y }
		})
		module.set_EditableProperty('2F尺寸', { x: json.equipLength, y: json.equipWidth })
	}

	if (json.is3F !== undefined && json.is3F) {
		module.add_EditableProperty('3F尺寸', 'vector2', { x: 1600, y: 1800 }, function (val, module) {
			this.data = val
			Module.set_Scale(module, (this.data.x / 1600), (this.data.y / 1800), null)
			return true
		}, function () {
			return { equipLength: this.data.x, equipWidth: this.data.y }
		})
		module.set_EditableProperty('3F尺寸', { x: json.equipLength, y: json.equipWidth })
	}

	customLog(null, 'log', 'ModuleSlot.js', 'create_Module_from_Json', '')
	// //console.log(module)

	return [module, promise]
}

function get_CreateJson(data, classification) {
	let json = {
		componentid: data.componentId,
		id: null,
		name: data.componentName || classification,
		classification: classification,
		url: data.fileAddr,
		position: data.moduleposition,
		rotation: data.modulerotation,
		slots: [],
		property: data.propertyInfo
	}
	for (let i = 0; i < data.interfaces.length; i++) {
		let slotJson = data.interfaces[i]
		json.slots.push({
			id: slotJson.interfaceUID,
			name: slotJson.interfacename,
			position: slotJson.interfaceposition,
			rotation: slotJson.interfacerotation,
			actionlist: slotJson.rules,
			type: slotJson.slotType,
			property: {}
		})
	}
	return json
}

// create a tree from polejson
//////////////////////////////////////////////////////////////////////////////
export function create_Tree_from_PoleJson(json = null, cross = null, scene, that) {
	// //console.log(JSON.stringify(json, null, 2))
	let error = []
	let warn = []
	// type 0-main 1-vice 2-lamp 3-connector 4-equip 5-arm 6-armEquip
	let modules = []
	let sticker = []
	let stickerNum = 0
	let equipWithSticker = []
	if (json === null) {
		throw new Error("在 create_Tree_from_PoleJson 中 参数 json 或 cross 非法")
	}

	customLog(null, 'log', 'ModuleSlot.js', 'create_Tree_from_PoleJson', 'create')

	// return
	// 监测是否有主杆
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
			// 创建主杆
			let mainPoleCreateJson = get_CreateJson(mainpoleJson, mainpoleJson.classification && mainpoleJson.classification === '微型杆' ? '微型杆' : '主杆')
			mainPoleCreateJson.id = mainpoleJson.mainId
			mainPoleCreateJson.groupid = mainpoleJson.componentId
			mainPoleCreateJson.disassemblyPrimaryPoleList = mainpoleJson.disassemblyPrimaryPoleList
			mainpoleModule = create_MainPoleDisassembly_from_Json(mainPoleCreateJson, scene)
			has_mainpole = true
			modules.push({ id: mainpoleJson.mainId, module: mainpoleModule, type: 0 })
		}
	}

	// 主杆拼装
	// if (has_mainpole) {
	// 	if (mainpoleJson.disassemblyPrimaryPoleList !== undefined)
	// 		for (let i = 0; i < mainpoleJson.disassemblyPrimaryPoleList.length; i++) {
	// 			let partsjson = mainpoleJson.disassemblyPrimaryPoleList[i]
	// 			let partsCreateJson = {
	// 				componentid: partsjson.componentId,
	// 				name: partsjson.disassemblyRawMaterialName,
	// 				url: partsjson.disassemblyRawMaterialFileAddr,
	// 				id: partsjson.disassemblyRawMaterialId,
	// 				property: {
	// 					flangeType: partsjson.flangeType,
	// 					sideFlangeAngle: partsjson.sideFlangeAngle,
	// 					sideFlangeHeight: partsjson.sideFlangeHeight,
	// 					sideFlangeSpec: partsjson.sideFlangeSpec,
	// 					specsId: partsjson.specsId
	// 				},
	// 				position: partsjson.moduleposition,
	// 				rotation: partsjson.modulerotation,
	// 				slots: [],
	// 				groupid: mainpoleModule.componentid
	// 			}
	// 			for (let i = 0; i < partsjson.interfaces.length; i++) {
	// 				let slotJson = partsjson.interfaces[i]
	// 				partsCreateJson.slots.push({
	// 					id: slotJson.interfaceUID,
	// 					name: slotJson.interfacename,
	// 					position: slotJson.interfaceposition,
	// 					rotation: slotJson.interfacerotation,
	// 					actionlist: slotJson.rules,
	// 					type: slotJson.slotType,
	// 					property: {}
	// 				})
	// 			}
	// 			switch (partsjson.disassemblyType) {
	// 				case 1: {
	// 					// mainpoleModule.url = partsCreateJson.url
	// 					// mainpoleModule.load_Mesh(mainpoleModule.url)
	// 					// mainpoleModule.shiftposition.set(parseFloat(partsCreateJson.position[0]), parseFloat(partsCreateJson.position[1]), parseFloat(partsCreateJson.position[2]))
	// 					// mainpoleModule.shiftrotation.set(parseFloat(partsCreateJson.rotation[0]), parseFloat(partsCreateJson.rotation[1]), parseFloat(partsCreateJson.rotation[2]))
	// 				}
	// 					break
	// 				case 2: {
	// 					// 侧法兰
	// 					let angle = (360.0 - parseFloat(partsjson.sideFlangeAngle)) / 180 * Math.PI
	// 					partsCreateJson.shiftrotation = [0, angle, 0]
	// 					partsCreateJson.shiftposition = [0, partsjson.sideFlangeHeight * Unit, 0]
	// 					partsCreateJson.slots[0].property = {
	// 						yMin: partsjson.sideFlangeHeight - 10,
	// 						yMax: partsjson.sideFlangeHeight + 10,
	// 						angleMin: partsjson.sideFlangeAngle,
	// 						angleMax: partsjson.sideFlangeAngle
	// 					}
	// 					let partsModule = create_Module_from_Json(partsCreateJson, scene)
	// 					mainpoleModule.get_Slot_by_Name('原点插槽').connect(partsModule)
	// 				}
	// 					break
	// 				case 3: {
	// 					// 底法兰
	// 					let partsModule = create_Module_from_Json(partsCreateJson, scene)
	// 					mainpoleModule.get_Slot_by_Name('原点插槽').connect(partsModule)
	// 				}
	// 					break
	// 				case 4: {
	// 					// 顶法兰
	// 					partsCreateJson.shiftposition = [0, partsjson.sideFlangeHeight * Unit, 0]
	// 					let partsModule = create_Module_from_Json(partsCreateJson, scene)
	// 					mainpoleModule.get_Slot_by_Name('原点插槽').connect(partsModule)
	// 				}
	// 					break
	// 				case 5: {
	// 					// 小检修门
	// 					let angle = degree_to_radius(to_PoleAngle(360 - parseFloat(partsjson.sideFlangeAngle)))
	// 					let x = Math.cos(angle) * 1
	// 					let y = Math.sin(angle) * 1
	// 					partsCreateJson.shiftposition = [x, partsjson.sideFlangeHeight * Unit, y]
	// 					partsCreateJson.shiftrotation = [0, angle, 0]
	// 					let partsModule = create_Module_from_Json(partsCreateJson, scene)
	// 					mainpoleModule.get_Slot_by_Name('原点插槽').connect(partsModule)
	// 				}
	// 					break
	// 				case 6: {
	// 					// 大检修门
	// 					let angle = degree_to_radius(to_PoleAngle(360 - parseFloat(partsjson.sideFlangeAngle)))
	// 					let x = Math.cos(angle) * 1
	// 					let y = Math.sin(angle) * 1
	// 					partsCreateJson.shiftposition = [x, partsjson.sideFlangeHeight * Unit, y]
	// 					partsCreateJson.shiftrotation = [0, angle, 0]
	// 					let partsModule = create_Module_from_Json(partsCreateJson, scene)
	// 					mainpoleModule.get_Slot_by_Name('原点插槽').connect(partsModule)
	// 				}
	// 					break
	// 			}

	// 		}
	// }

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
			let vicePoleCreateJson = get_CreateJson(vicepoleJson, '副杆')
			vicePoleCreateJson.id = vicepoleJson.viceId
			let vicepoleSlot = mainpoleModule.get_Slot_by_Name("副杆插槽")
			if (vicepoleSlot === null) {
				// test
				has_vicepole = false
				error.push('在连接 ' + HTML.create_KeyPair('BuildPath', HTML.create_Or(['mainPole', 'vicePole']), 'String') + ' 时发现，对于其父级不存在 ' + HTML.create_KeyPair('SlotName', '副杆插槽', 'String') + ' 的插槽，无法连接副杆')
			} else {
				vicepoleModule = create_Module_from_Json(vicePoleCreateJson, scene)
				has_vicepole = true
				modules.push({ id: vicepoleJson.viceId, module: vicepoleModule, type: 1 })
				vicepoleSlot.connect(vicepoleModule)
			}
		}
	}

	// 监测是否有灯臂  >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
	if (has_vicepole) {
		let lampsJson = vicepoleJson.lampArms
		if (lampsJson === undefined || lampsJson === null) {
			warn.push(HTML.create_KeyPair('BuildPath', HTML.create_Or(['mainPole', 'vicePole', 'lampArms']), 'String') + ' 不存在，无法生成灯臂')
		} else {
			for (let i = 0; i < lampsJson.length; i++) {
				let lampJson = lampsJson[i]
				// let positionangle = (parseFloat(lampJson.lookingDirectionAngle)) / 180 * Math.PI
				let angle = parseFloat(lampJson.angle) / 180 * Math.PI
				let y = parseFloat(lampJson.yaxis) * Unit
				// let x = parseFloat(lampJson.xaxis) * Unit * Math.cos(positionangle)
				// let z = parseFloat(lampJson.xaxis) * Unit * Math.sin(positionangle)

				let lampArmsCreateJson = get_CreateJson(lampJson, '灯臂')
				lampArmsCreateJson.shiftrotation = [0, angle, 0]
				lampArmsCreateJson.id = lampJson.lampId
				lampArmsCreateJson.shiftposition = [0, y, 0]
				lampArmsCreateJson.relatetoorigin = true
				lampArmsCreateJson.elevationAngle = lampJson.elevationAngle
				let lampSlot = vicepoleModule.get_Slot_by_ClassID(4)
				if (lampSlot === null) {
					error.push('在连接 ' + HTML.create_KeyPair('BuildPath', HTML.create_Or(['mainPole', 'vicePole', 'lampArms[' + i + ']']), 'String') + ' 时发现，对于其父级不存在 ' + HTML.create_KeyPair('SlotName', '灯臂插槽', 'String') + ' 的插槽，无法连接灯臂')
				} else {
					let lampModule = create_Module_from_Json(lampArmsCreateJson, scene)
					modules.push({ id: lampJson.lampId, module: lampModule, type: 2 })
					lampSlot.connect(lampModule)
				}
			}
		}
	}

	// 监测是否有副杆连接件  >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
	if (has_vicepole) {
		let connectorsJson = vicepoleJson.connectors
		if (connectorsJson === undefined || connectorsJson === null) {
			warn.push(HTML.create_KeyPair('BuildPath', HTML.create_Or(['mainPole', 'connectors']), 'String') + ' 不存在，无法生成连接件')
		} else {
			// //console.log(connectorsJson)
			for (let i = 0; i < connectorsJson.length; i++) {
				let connectorJson = connectorsJson[i]
				let connectorCreateJson = get_CreateJson(connectorJson, '连接件')
				// //console.log(">>>>", connectorJson)
				let positionangle = (parseFloat(connectorJson.zaxis)) / 180 * Math.PI
				let y = parseFloat(connectorJson.yaxis) * Unit
				let x = parseFloat(connectorJson.xaxis) * Unit * Math.cos(positionangle)
				let z = parseFloat(connectorJson.xaxis) * Unit * Math.sin(positionangle)
				let position = new THREE.Vector3(x, y, z)
				connectorCreateJson.relatetoorigin = true
				connectorCreateJson.id = connectorJson.connectorId
				connectorCreateJson.shiftposition = [position.x, position.y, position.z]
				connectorCreateJson.shiftrotation = [0, degree_to_radius(connectorJson.lookingDirectionAngle), degree_to_radius(connectorJson.angle)]

				let connectorSlot = vicepoleModule.get_Slot_by_Name("原点插槽")
				if (connectorSlot === null) {
					error.push('在连接 ' + HTML.create_KeyPair('BuildPath', HTML.create_Or(['mainPole', 'connectors[' + i + ']']), 'String') + ' 时发现，对于其父级不存在 ' + HTML.create_KeyPair('SlotName', '原点插槽', 'String') + ' 的插槽，无法连接连接件')
				} else {
					let connectorModule = create_Module_from_Json(connectorCreateJson, scene)
					modules.push({ id: connectorJson.connectorId, module: connectorModule })
					connectorSlot.connect(connectorModule)
					// equip
					let equipsJson = connectorJson.carryEquips
					if (equipsJson === undefined || equipsJson === null) {
						warn.push(HTML.create_KeyPair('BuildPath', HTML.create_Or(['mainPole', 'connectors[' + i + ']', 'carryEquips']), 'String') + ' 不存在，无法生成搭载设备')
					}

					for (let j = 0; j < equipsJson.length; j++) {
						let equipJson = equipsJson[j]
						let equipCreateJson = get_CreateJson(equipJson, '搭载设备')
						let polearmangle = parseFloat(equipJson.zaxis) / 180 * Math.PI
						let ye = parseFloat(equipJson.yaxis) * Unit
						let xe = parseFloat(equipJson.xaxis) * Unit * Math.cos(polearmangle)
						let ze = parseFloat(equipJson.xaxis) * Unit * Math.sin(polearmangle)
						equipCreateJson.relatetoorigin = true
						equipCreateJson.shiftposition = [xe, ye, ze]
						equipCreateJson.shiftrotation = [degree_to_radius(equipJson.elevationAngle || 0), degree_to_radius(equipJson.lookingDirectionAngle), degree_to_radius(equipJson.angle)]
						equipCreateJson.id = equipJson.equipId
						let equipSlot = connectorModule.get_Slot_by_ClassID(6)
						if (equipSlot === null) {
							error.push('在连接 ' + HTML.create_KeyPair('BuildPath', HTML.create_Or(['mainPole', 'connectors[' + i + ']', 'carryEquips[' + j + ']']), 'String') + ' 时发现，对于其父级不存在 ' + HTML.create_KeyPair('SlotName', '搭载设备插槽', 'String') + ' 的插槽，无法连接搭载设备')
						} else {
							let equipModule = create_Module_from_Json(equipCreateJson, scene)
							modules.push({ id: equipJson.equipId, module: equipModule })
							//贴图新增
							if (equipJson.sticker !== null && equipJson.sticker !== undefined) {
								// sticker.push(equipJson.sticker)
								equipModule.editorworkspace.sticker = equipJson.sticker
								stickerNum++
								equipWithSticker.push(equipModule)
							}
							equipSlot.connect(equipModule)
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
				let armCreateJson = get_CreateJson(armJson, '横臂')
				armCreateJson.id = armJson.poleArmId
				// armCreateJson.slots[0].rotation = ["4.696681017116741", "3.141592653589793", "0"]
				// armCreateJson.slots[0].position = ["0", "1", "-1"]

				let armSlotlist = mainpoleModule.get_Slots().filter((slot) => {
					return slot.match("横臂插槽", armJson.angle, armJson.yaxis)
				})
				// 没有可以连接的横臂插槽
				//console.log(armSlotlist)
				if (armSlotlist.length === 0) {
					let slotarray = mainpoleModule.get_Slots().filter((slot) => {
						return slot.match("横臂插槽")
					}).map((slot) => {
						return Slot.get_StyledHTML(slot) + ' ' + HTML.create_KeyPair('Angle', slot.property.angleMin + ' ~ ' + slot.property.angleMax, 'Float') + ' ' + HTML.create_KeyPair('Y', slot.property.yMin + ' ~ ' + slot.property.yMax, 'Float')
					})
					error.push('在连接 ' + HTML.create_KeyPair('BuildPath', HTML.create_Or(['mainPole', 'poleArms[' + i + ']']), 'String') + ' 时发现，对于其父级不存在可以匹配的的插槽，无法连接副杆。匹配条件是: ' + HTML.create_UList([HTML.create_KeyPair('SlotName', '横臂插槽', 'String') + ' ' + HTML.create_KeyPair('Angle', armJson.angle, 'Float') + ' ' + HTML.create_KeyPair('Y', armJson.yaxis, 'Float')]) + '而其父组件上所有的横臂插槽为: ' + HTML.create_List(slotarray))
				} else {
					// 大于一个可连接的找第一个出现的
					if (armSlotlist.length > 1) {
						let slotarray = armSlotlist.map((slot) => {
							return Slot.get_StyledHTML(slot) + ' ' + HTML.create_KeyPair('Angle', slot.property.angleMin + ' ~ ' + slot.property.angleMax, 'Float') + ' ' + HTML.create_KeyPair('Y', slot.property.yMin + ' ~ ' + slot.property.yMax, 'Float')
						})
						warn.push('在连接 ' + HTML.create_KeyPair('BuildPath', HTML.create_Or(['mainPole', 'poleArms[' + i + ']']), 'String') + ' 时发现，其父级存在多个匹配的的插槽，它们是: ' + HTML.create_List(slotarray) + ' 将使用第一个插槽进行连接')
					}
					let armModule = create_Module_from_Json(armCreateJson, scene)
					modules.push({ id: armJson.poleArmId, module: armModule, type: 5 })
					armSlotlist[0].connect(armModule)

					//       搭载设备
					{
						let equipsJson = armJson.carryEquips
						if (equipsJson === undefined || equipsJson === null) {
							warn.push(HTML.create_KeyPair('BuildPath', HTML.create_Or(['mainPole', 'poleArms[' + i + ']', 'carryEquips']), 'String') + ' 不存在，无法生成搭载设备')
						}
						for (let j = 0; j < equipsJson.length; j++) {
							let equipJson = equipsJson[j]
							let equipCreateJson = get_CreateJson(equipJson, '搭载设备')
							// //console.log(equipJson, equipCreateJson)
							let polearmangle = parseFloat(equipJson.zaxis) / 180 * Math.PI
							let y = parseFloat(equipJson.yaxis) * Unit
							let x = parseFloat(equipJson.xaxis) * Unit * Math.cos(polearmangle)
							let z = parseFloat(equipJson.xaxis) * Unit * Math.sin(polearmangle)
							let position = new THREE.Vector3(x, y, z)

							equipCreateJson.relatetoorigin = true
							equipCreateJson.shiftposition = [position.x, position.y, position.z]
							equipCreateJson.shiftrotation = [degree_to_radius(equipJson.elevationAngle || 0), degree_to_radius(equipJson.lookingDirectionAngle), degree_to_radius(equipJson.angle)]
							equipCreateJson.id = equipJson.equipId
							equipCreateJson.is2F = equipJson.componentId === id2F
							equipCreateJson.is3F = equipJson.componentId === id3F
							equipCreateJson.equipWidth = equipJson.equipWidth !== undefined ? equipJson.equipWidth : 1600
							equipCreateJson.equipLength = equipJson.equipLength !== undefined ? equipJson.equipLength : 1600
							// equipCreateJson.orgType = typeof equipJson.orgType !== 'undefined' ? equipJson.orgType : null

							// create Equip
							let equipSlot = armModule.get_Slot_by_ClassID(6)
							// //console.log(armModule)
							if (equipSlot === null) {
								error.push('在连接 ' + HTML.create_KeyPair('BuildPath', HTML.create_Or(['mainPole', 'poleArms[' + i + ']', 'carryEquips[' + j + ']']), 'String') + ' 时发现，对于其父级不存在 ' + HTML.create_KeyPair('SlotName', '搭载设备插槽', 'String') + ' 的插槽，无法连接搭载设备')
							} else {
								let equipModule = create_Module_from_Json(equipCreateJson, scene)
								modules.push({ id: equipJson.equipId, module: equipModule, type: 6 })
								if (equipJson.sticker !== null && equipJson.sticker !== undefined) {
									// sticker.push(equipJson.sticker)
									equipModule.editorworkspace.sticker = equipJson.sticker
									stickerNum++
									equipWithSticker.push(equipModule)
								}
								equipSlot.connect(equipModule)
								// console.log('equipModule',equipModule)
								// let module = this.$static.Scene.context.selectedModule
								// let that = this
								// const loader = new SVGLoader()
								// let plugin = new MP_Model('指示牌标志贴图', null, this.$static.Scene.objectorigin)
								// try {
								// 	module.add_Plugin(plugin)
								//
								// 	loader.load(createJson.url, function (data) {
								//
								// 		let selectBox = new THREE.Box3()
								// 		let p = new THREE.Vector3()
								// 		let r = new THREE.Euler()
								// 		p.copy(module.slotmodifier.position)
								// 		r.copy(module.slotmodifier.rotation)
								// 		module.slotmodifier.position.set(0, 0, 0)
								// 		module.slotmodifier.rotation.set(0, 0, 0)
								// 		module.Update()
								// 		selectBox.setFromObject(module.model)
								// 		module.slotmodifier.position.copy(p)
								// 		module.slotmodifier.rotation.copy(r)
								// 		let yLength = selectBox.max.y - selectBox.min.y;
								// 		let zLength = selectBox.max.z - selectBox.min.z;
								// 		let xLength = selectBox.max.x - selectBox.min.x;
								//
								// 		const paths = data.paths;
								// 		const group = new THREE.Group();
								// 		group.position.x = 0;
								// 		group.position.y = 0;
								//
								// 		for (let i = 0; i < paths.length; i++) {
								// 			const path = paths[i];
								// 			const fillColor = path.userData.style.fill;
								// 			if (fillColor !== undefined && fillColor !== 'none') {
								// 				const material = new THREE.MeshBasicMaterial({
								// 					color: new THREE.Color().setStyle(fillColor),
								// 					opacity: path.userData.style.fillOpacity,
								// 					transparent: true,
								// 					polygonOffset: false,
								// 					polygonOffsetFactor: i * 100,
								// 					polygonOffUnits: 4,
								// 					depthTest: true,
								// 					depthWrite: false,
								// 					side: THREE.DoubleSide,
								// 				});
								// 				const shapes = path.toShapes(true);
								// 				for (let j = 0; j < shapes.length; j++) {
								// 					const shape = shapes[j];
								// 					const geometry = new THREE.ShapeBufferGeometry(shape);
								// 					const mesh = new THREE.Mesh(geometry, material);
								// 					mesh.renderOrder = i;
								// 					group.add(mesh);
								// 				}
								// 			}
								// 			const strokeColor = path.userData.style.stroke;
								// 			if (strokeColor !== undefined && strokeColor !== 'none') {
								// 				const material = new THREE.MeshBasicMaterial({
								// 					color: new THREE.Color().setStyle(fillColor),
								// 					opacity: path.userData.style.fillOpacity,
								// 					transparent: true,
								// 					polygonOffset: false,
								// 					polygonOffsetFactor: i * 100,
								// 					polygonOffUnits: 4,
								// 					depthTest: true,
								// 					depthWrite: false,
								// 					side: THREE.DoubleSide,
								// 				});
								//
								// 				for (let j = 0, jl = path.subPaths.length; j < jl; j++) {
								// 					const subPath = path.subPaths[j];
								// 					const geometry = SVGLoader.pointsToStroke(subPath.getPoints(), path.userData.style);
								// 					if (geometry) {
								// 						const mesh = new THREE.Mesh(geometry, material);
								// 						mesh.renderOrder = i
								// 						group.add(mesh);
								// 					}
								// 				}
								// 			}
								// 		}
								//
								// 		console.log(group)
								//
								// 		let base = new THREE.Object3D()
								// 		base.add(group)
								// 		group.name = 'SignGroup'
								// 		group.rotation.y = Math.PI / 2
								// 		let box = new THREE.Box3()
								// 		box.setFromObject(base)
								// 		group.scale.y = -1 * yLength / (box.max.y - box.min.y);
								// 		group.scale.x = 1 * zLength / (box.max.z - box.min.z);
								// 		box.setFromObject(base)
								// 		group.position.z = -box.min.z - (box.max.z - box.min.z) / 2
								// 		group.position.y = -box.min.y - (box.max.y - box.min.y) / 2
								// 		group.position.x = 1
								// 		plugin.model = base
								// 		plugin.scene.add(plugin.model)
								// 		plugin.scale = { x: group.scale.x, y: group.scale.y };
								// 		plugin.position = { x: group.position.x, y: group.position.y, z: group.position.z };
								// 		console.log(plugin.scale, plugin.position)
								// 		refresh_Tree.call(that, that.$static.Scene.base)
								// 		refresh_build_selectedModule_inspector.call(that, module)
								// 	})
								// 	refresh_Tree.call(that, that.$static.Scene.base)
								// 	refresh_build_selectedModule_inspector.call(that, module)
								// } catch (error) {
								// 	plugin.remove()
								// 	this.$EventBus.$emit('console_add_Output', "error", "添加插件 错误", error.message)
								// }
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
		} else {
			// //console.log(connectorsJson)
			for (let i = 0; i < connectorsJson.length; i++) {
				if (connectorsJson[i].componentId === kcId) {
					let equipsJson = connectorsJson[i].carryEquips
					if (equipsJson === undefined || equipsJson === null) {
						warn.push(HTML.create_KeyPair('BuildPath', HTML.create_Or(['mainPole', 'connectors[' + i + ']', 'carryEquips']), 'String') + ' 不存在，无法生成搭载设备')
					}

					for (let j = 0; j < equipsJson.length; j++) {
						let equipJson = equipsJson[j]
						let equipCreateJson = get_CreateJson(equipJson, '搭载设备')
						let polearmangle = parseFloat(equipJson.zaxis) / 180 * Math.PI
						let ye = parseFloat(equipJson.yaxis) * Unit
						let xe = parseFloat(equipJson.xaxis) * Unit * Math.cos(polearmangle)
						let ze = parseFloat(equipJson.xaxis) * Unit * Math.sin(polearmangle)
						let positione = new THREE.Vector3(xe, ye, ze)
						equipCreateJson.relatetoorigin = true
						equipCreateJson.shiftposition = [positione.x, positione.y, positione.z]
						equipCreateJson.shiftrotation = [degree_to_radius(equipJson.elevationAngle || 0), degree_to_radius(equipJson.lookingDirectionAngle), degree_to_radius(equipJson.angle)]
						equipCreateJson.id = equipJson.equipId

						let equipSlot = mainpoleModule.get_Slot_by_ClassID(5)
						if (equipSlot === null) {
							error.push('在连接 ' + HTML.create_KeyPair('BuildPath', HTML.create_Or(['mainPole', 'connectors[' + i + ']', 'carryEquips[' + j + ']']), 'String') + ' 时发现，对于其父级不存在 ' + HTML.create_KeyPair('SlotName', '搭载设备插槽', 'String') + ' 的插槽，无法连接搭载设备')
						} else {
							// //console.log(json, equipCreateJson)
							let equipModule = create_Module_from_Json(equipCreateJson, scene)
							modules.push({ id: equipJson.equipId, module: equipModule })
							if (equipJson.sticker !== null && equipJson.sticker !== undefined) {
								// sticker.push(equipJson.sticker)
								equipModule.editorworkspace.sticker = equipJson.sticker
								stickerNum++
								equipWithSticker.push(equipModule)
							}
							equipSlot.connect(equipModule)
						}
					}
				}
				else {
					let connectorJson = connectorsJson[i]
					let connectorCreateJson = get_CreateJson(connectorJson, '连接件')
					let positionangle = (parseFloat(connectorJson.zaxis)) / 180 * Math.PI
					let y = parseFloat(connectorJson.yaxis) * Unit
					let x = parseFloat(connectorJson.xaxis) * Unit * Math.cos(positionangle)
					let z = parseFloat(connectorJson.xaxis) * Unit * Math.sin(positionangle)
					let position = new THREE.Vector3(x, y, z)
					connectorCreateJson.relatetoorigin = true
					connectorCreateJson.id = connectorJson.connectorId
					connectorCreateJson.shiftposition = [position.x, position.y, position.z]
					connectorCreateJson.shiftrotation = [degree_to_radius(connectorJson.elevationAngle || 0), degree_to_radius(connectorJson.lookingDirectionAngle), degree_to_radius(connectorJson.angle)]

					let connectorSlot = mainpoleModule.get_Slot_by_ClassID(5)
					if (connectorSlot === null) {
						error.push('在连接 ' + HTML.create_KeyPair('BuildPath', HTML.create_Or(['mainPole', 'connectors[' + i + ']']), 'String') + ' 时发现，对于其父级不存在 ' + HTML.create_KeyPair('SlotName', '连接件插槽', 'String') + ' 的插槽，无法连接连接件')
					}
					else {
						let connectorModule = create_Module_from_Json(connectorCreateJson, scene)
						modules.push({ id: connectorJson.connectorId, module: connectorModule })
						connectorSlot.connect(connectorModule)
						// equip
						let equipsJson = connectorJson.carryEquips
						if (equipsJson === undefined || equipsJson === null) {
							warn.push(HTML.create_KeyPair('BuildPath', HTML.create_Or(['mainPole', 'connectors[' + i + ']', 'carryEquips']), 'String') + ' 不存在，无法生成搭载设备')
						}

						for (let j = 0; j < equipsJson.length; j++) {
							let equipJson = equipsJson[j]
							let equipCreateJson = get_CreateJson(equipJson, '搭载设备')
							let polearmangle = parseFloat(equipJson.zaxis) / 180 * Math.PI
							let ye = parseFloat(equipJson.yaxis) * Unit
							let xe = parseFloat(equipJson.xaxis) * Unit * Math.cos(polearmangle)
							let ze = parseFloat(equipJson.xaxis) * Unit * Math.sin(polearmangle)
							let positione = new THREE.Vector3(xe, ye, ze)
							equipCreateJson.relatetoorigin = true
							equipCreateJson.shiftposition = [positione.x, positione.y, positione.z]
							equipCreateJson.shiftrotation = [degree_to_radius(equipJson.elevationAngle || 0), degree_to_radius(equipJson.lookingDirectionAngle), degree_to_radius(equipJson.angle)]
							equipCreateJson.id = equipJson.equipId

							let equipSlot = connectorModule.get_Slot_by_ClassID(6)
							if (equipSlot === null) {
								error.push('在连接 ' + HTML.create_KeyPair('BuildPath', HTML.create_Or(['mainPole', 'connectors[' + i + ']', 'carryEquips[' + j + ']']), 'String') + ' 时发现，对于其父级不存在 ' + HTML.create_KeyPair('SlotName', '搭载设备插槽', 'String') + ' 的插槽，无法连接搭载设备')
							} else {
								// //console.log(json, equipCreateJson)
								let equipModule = create_Module_from_Json(equipCreateJson, scene)
								modules.push({ id: equipJson.equipId, module: equipModule })
								if (equipJson.sticker !== null && equipJson.sticker !== undefined) {
									// sticker.push(equipJson.sticker)
									equipModule.editorworkspace.sticker = equipJson.sticker
									stickerNum++
									equipWithSticker.push(equipModule)
								}
								equipSlot.connect(equipModule)
							}
						}
					}
				}
			}
		}
	}

	mainpoleModule.Update()
	// // 横臂搭载设备 y <- 0
	// modules.filter((module) => {
	// 	return module.type === 6
	// }).forEach((module) => {
	// 	// //console.log(module)
	// 	module.module.slotmodifier.position.y = 0
	// })

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
		let equip = get_byID(parseInt(id))
		let equipParent = equip.get_Parent()
		let crossmodule = cross[id].map((item) => {
			return get_byID(item)
		}).filter((module) => {
			return module !== equipParent
		})

		for (let i = 0; i < crossmodule.length; i++) {
			let equipSlot = crossmodule[i].get_Slot_by_ClassID(6)
			if (equipSlot === null) {
				error.push('在跨横臂引用 ' + HTML.create_KeyPair('equipID', id, 'Number') + ' 时发现，被引用的组件' + Module.get_StyledHTML(crossmodule[i]) + '不存在 ' + HTML.create_KeyPair('SlotName', '搭载设备插槽', 'String') + ' 的插槽，无法创建引用')
			} else {
				try {
					equip.make_Link(equipSlot)
				} catch (linkerror) {
					error.push('在跨横臂引用 ' + HTML.create_KeyPair('equipID', id, 'Number') + ' 时发现，' + linkerror.message)
				}
			}
		}
	}

	mainpoleModule.Update()
	mainpoleModule.Traverse(Module.convert_to_Local)

	return { tree: mainpoleModule, error: error, warn: warn, sticker: sticker, equipWithSticker: equipWithSticker }
}
//////////////////////////////////////////////////////////////////////////////

export function export_to_STL(scene, unit = Unit) {
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

						output += '\tfacet normal ' + vector.x / unit + ' ' + -vector.z / unit + ' ' + vector.y / unit + '\n';
						output += '\t\touter loop\n';

						var indices = [face.a, face.b, face.c];

						for (var j = 0; j < 3; j++) {
							var vertexIndex = indices[j];
							if (typeof geometry.skinIndices !== 'undefined' && geometry.skinIndices.length == 0) {
								vector.copy(vertices[vertexIndex]).applyMatrix4(matrixWorld);
								output += '\t\t\tvertex ' + vector.x / unit + ' ' + -vector.z / unit + ' ' + vector.y / unit + '\n';
							} else {
								vector.copy(vertices[vertexIndex]); //.applyMatrix4( matrixWorld );

								var boneIndices = [
									geometry.skinIndices[vertexIndex].x,
									-geometry.skinIndices[vertexIndex].z,
									geometry.skinIndices[vertexIndex].y,
									geometry.skinIndices[vertexIndex].w
								];

								var weights = [
									geometry.skinWeights[vertexIndex].x,
									-geometry.skinWeights[vertexIndex].z,
									geometry.skinWeights[vertexIndex].y,
									geometry.skinWeights[vertexIndex].w
								];

								var inverses = [
									skeleton.boneInverses[boneIndices[0]],
									-skeleton.boneInverses[boneIndices[2]],
									skeleton.boneInverses[boneIndices[1]],
									skeleton.boneInverses[boneIndices[3]]
								];

								var skinMatrices = [
									skeleton.bones[boneIndices[0]].matrixWorld,
									-skeleton.bones[boneIndices[2]].matrixWorld,
									skeleton.bones[boneIndices[1]].matrixWorld,
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
										morphMatricesY[mt] = -geometry.morphTargets[mt].vertices[vertexIndex].z;
										morphMatricesZ[mt] = geometry.morphTargets[mt].vertices[vertexIndex].y;
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

									var tempVector = new THREE.Vector4(vector.x, -vector.z, vector.y);
									tempVector.multiplyScalar(weights[k]);
									//the inverse takes the vector into local bone space
									tempVector.applyMatrix4(inverses[k])
										//which is then transformed to the appropriate world space
										.applyMatrix4(skinMatrices[k]);
									finalVector.add(tempVector);

								}

								output += '\t\t\tvertex ' + finalVector.x / unit + ' ' + -finalVector.z / unit + ' ' + finalVector.y / unit + '\n';
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
// save example
// export_scene_stl: function () {
// 	let array = []
// 	this.$static.Scene.baseslot.Traverse((module) => {
// 		if (module.model !== undefined && module.model !== null) {
// 			array.push(module.model)
// 		}
// 	}, () => { })
// 	//console.log(array)
// 	let stlString = STLExporter(array, Unit)

// 	let blob = new Blob([stlString], { type: 'text/plain' })
// 	// //console.log("fin !!")

// 	saveAs(blob, 'name' + '.stl');
// },

export function get_TransfromPosRot(position, rotation, shiftposition, shiftrotation, slotmodifier = new SlotModifier()) {

	// position
	let modifiedposition = slotmodifier.get_Position(position, rotation);
	let modifiedrotation = slotmodifier.get_Rotation(position, rotation);

	let newposition = new THREE.Vector3(0, 0, 0);
	let addposition = new THREE.Vector3(0, 0, 0);

	addposition.add(modifiedposition);
	newposition.copy(shiftposition);
	newposition.applyEuler(modifiedrotation);
	newposition.add(addposition);

	let model_world_position = newposition;
	let world_position = addposition;

	// rotation


	let parentrotation = new THREE.Quaternion();
	parentrotation.setFromEuler(modifiedrotation);
	let selfrotation = new THREE.Quaternion();
	selfrotation.setFromEuler(shiftrotation);
	parentrotation.multiply(selfrotation);
	let newrotation = new THREE.Euler(0, 0, 0, "XYZ");
	newrotation.setFromQuaternion(parentrotation, "XYZ");

	let world_rotation = (modifiedrotation);
	let model_world_rotation = (newrotation);

	return [model_world_position, model_world_rotation, world_position, world_rotation];
}
