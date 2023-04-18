///////////////////////////////////////////
//          SUN ComponentManager
///////////////////////////////////////////

// class ComponentManager - used to manage component list
// - auto collect component by classification
// - auto page divide by get_Page(class, page, each_page_count)
export class ComponentManager {
	constructor() {
		this.components = []
		this.classref = {}
	}

	// whether cid exists
	has(cid) {
		for (let i = 0; i < this.components.length; i++) {
			if (this.components[i].componentid === cid) {
				return true
			}
		}
		return false
	}

	// add a component instance with auto collect
	add(component) {
		if (component instanceof Component) {
			component = component.get_Object()
		}
		if (this.has(component.componentid)) return
		let newcomponent = component
		this.components.push(newcomponent)
		if (this.classref[newcomponent.classification] !== undefined) {
			this.classref[newcomponent.classification].push(newcomponent)
		}
		else {
			this.classref[newcomponent.classification] = [newcomponent]
		}
	}

	// get a component instance by its cid
	// - not found return null
	get(cid) {
		for (let i = 0; i < this.components.length; i++) {
			if (this.components[i].componentid === cid) {
				return this.components[i]
			}
		}
		return null
	}


	// get a classicification's page's count
	get_PageCount(classification, eachcount = 6) {
		if (this.classref[classification] !== undefined) {
			return Math.ceil(this.classref[classification].length / eachcount)
		}
		return -1
	}

	// get a classicification's all components
	get_Classifications() {
		let classifications = []
		for (let key in this.classref) {
			classifications.push(key)
		}
		return classifications
	}

	// get a component list in page of a classification
	get_Page(classification, page, eachcount = 6) {
		let maxpage = this.get_PageCount(classification, eachcount)
		if (maxpage === -1) return []
		let start = page * eachcount, end = Math.min(start + eachcount, this.classref[classification].length)
		let ans = []
		for (let i = start; i < end; i++) {
			ans.push(this.classref[classification][i])
		}
		return ans
	}

	// deconstruct
	release() {
		this.classref = {}
		this.components = []
	}
}


// class Component use to restore a component's structure
// - componentid : int,
// - name : string,
// - classification : string,
// - url: string,
// - position: Array<float>[3] (x,y,z),
// - rotation: Array<float>[3] (radx, rady, radz),
// - slots: Array<obj>,
// - property: obj
export class Component {
	constructor(cid, name, classification, url, positionarray, rotationarray, propertyobject = {}) {
		this.component = {
			componentid: cid,
			name: name,
			classification: classification,
			url: url,
			position: [positionarray[0], positionarray[1], positionarray[2]],
			rotation: [rotationarray[0], rotationarray[1], rotationarray[2]],
			slots: [],
			property: propertyobject
		}
	}

	add_Slot(id, name, type, positionarray, rotationarray, propertyobject = {}, actionlist = null) {
		let slot = {
			id: id,
			name: name,
			type: type,
			position: [positionarray[0], positionarray[1], positionarray[2]],
			rotation: [rotationarray[0], rotationarray[1], rotationarray[2]],
			property: propertyobject,
			actionlist: actionlist
		}
		this.component.slots.push(slot)
	}

	get_Object() {
		return this.component
	}
}

// donot use this
export function get_SlotType_Legacy(name) {
	let substr = name.substr(0, 2)
	switch (substr) {
		case '主杆':
			return 0
		case '副杆':
			return 1
		case '横臂':
			return 2
		case '卡槽':
			return 3
		case '灯臂':
			return 4
		case '连接':
			return 5
		case '搭载':
			return 6
		default:
			return -1
	}
}

// load from a json like
// - json = {components:[a,b,c]}
// - return a ComponentManager
export function load_JSON_Legacy(json) {
	let warn = []
	let manager = new ComponentManager()
	json.components.forEach((item, index) => {
		let component = new Component(parseInt(item.moduleid), item.modulename, item.classification, item.url, item.moduleposition, item.modulerotation, item.propertyInfo)
		item.interfaces.forEach((slot, index) => {
			if (item.classification === '主杆' && slot.interfacename === '横臂插槽' && slot.property === undefined) {
				warn.push(item.moduleid + " 组件上的横臂插槽" + slot.interfaceUID + " 缺失property")
			}
			component.add_Slot(slot.interfaceUID, slot.interfacename, get_SlotType_Legacy(slot.interfacename), slot.interfaceposition, slot.interfacerotation, slot.property, slot.rules)
		})
		manager.add(component)
	})
	return [manager, warn]
}

// convert a component obj from external format to internal format
// - return a Component instance
export function convert_Component_Lagecy(item) {
	//console.log(item)
	let property = {}
	for (let key in item) {
		if (!(['moduleid', 'interfaces', 'modulename', 'classification', 'url', 'moduleposition', 'modulerotation', 'propertyInfo', 'disassemblySecondaryPoleList', 'disassemblyPrimaryPoleList'].includes(key))) {
			property[key] = item[key]
		}
	}
	if (item.propertyInfo && item.propertyInfo !== null)
		property = Object.assign(property, item.propertyInfo)
	let component = new Component(parseInt(item.moduleid), item.modulename, item.classification, item.url, item.moduleposition, item.modulerotation, property)
	component.component.validInstallPositionList = item.validInstallPositionList
	component.component.disassemblyPrimaryPoleList = item.disassemblyPrimaryPoleList
	component.component.disassemblySecondaryPoleList = item.disassemblySecondaryPoleList
	item.interfaces.forEach((slot, index) => {
		component.add_Slot(slot.interfaceUID, slot.interfacename, get_SlotType_Legacy(slot.interfacename), slot.interfaceposition, slot.interfacerotation, slot.property, slot.rules)
	})
	return component
}
