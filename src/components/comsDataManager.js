// 导入json文件 => json 已弃用

import data from '@/components/test'

class Interface {
	constructor(interfaceUID, interfacename, interfaceposition, interfacerotation, rules, property) {
		this.interfaceUID = interfaceUID // 接口UID
		this.interfacename = interfacename // 接口名称
		this.interfaceposition = interfaceposition // 接口位置偏移
		this.interfacerotation = interfacerotation // 接口旋转偏移
		this.rules = rules // 拼接规则
		this.property = property
	}

	// 获取设置接口id
	getId() {
		return this.interfaceUID
	}
	setId(UID) {
		if (UID != null) {
			this.interfaceUID = UID
		}
	}
	// 获取设置接口名称
	getName() {
		return this.interfacename
	}
	setName(interfacename) {
		if (interfacename !== null) {
			this.interfacename = interfacename
		}
	}
	// 获取设置接口位置偏移
	getPosition() {
		return this.interfaceposition
	}
	setPosition(position) {
		if (position != null) {
			this.interfaceposition = position
		}
	}
	// 获取设置接口旋转角度偏移
	getRotation() {
		return this.interfacerotation
	}
	setRotation(rotation) {
		if (rotation != null) {
			this.interfacerotation = rotation
		}
	}
	// 获取设置接口规则
	getRules() {
		return this.rules
	}
	setRules(rules) {
		if (rules != null) {
			this.rules = rules
		}
	}
	// 根据字符串内容添加或删除规则
	addRule(str) {
		if (str != null) {
			this.rules.push(str)
		}
	}
	deleteRule(str) {
		if (str != null) {
			let index = this.rules.indexOf(str)
			this.rules.splice(index, 1)
		}
	}
}

class Component {
	constructor(moduleid, modulename, classification, url, moduleposition, modulerotation, maxLoad, propertyInfo) {
		this.moduleid = moduleid // 组件模型id，主键
		this.modulename = modulename // 模型名称，可重复
		this.classification = classification // 模型分类，如基本杆件，枪机球机等
		this.url = url // 模型存储路径
		this.moduleposition = moduleposition // 模型位置偏移
		this.modulerotation = modulerotation // 模型旋转偏移
		this.maxLoad = maxLoad // 最大负载
		this.propertyInfo = propertyInfo // 模型规格信息，如长宽高形状等
		this.interfaces = [] // 接口，初始构造为空，通过createInterfacefromjson从Json文件中装载或addInterface新增接口
	}

	// 根据json文件特定id的组件，加载该组件的所有Interface接口
	createInterfacefromjson(moduleid, json) {
		let that = this
		json.components.forEach((itemtest, indextest) => {
			if (moduleid === itemtest.moduleid) {
				itemtest.interfaces.forEach((item, index) => {
					let testinterface = new Interface(item.interfaceUID, item.interfacename, item.interfaceposition, item.interfacerotation, item.rules, item.property === undefined ? { angleMin: -100000, angleMax: 100000, yMin: 100000, yMax: 100000 } : item.property)
					// //console.log(testinterface)
					that.interfaces.push(testinterface)
				})
			}
		})
	}
	// 根据Interface UID获取Interface
	getInterface(UID) {
		let that = this
		let tempindex = -1
		if (UID != null) {
			that.interfaces.forEach((item, index) => {
				if (item.interfaceUID === UID) {
					tempindex = index
				}
			})
		}
		return that.interfaces[tempindex]
	}
	// 各种获取参数的函数
	getId() { // 模型id
		return this.moduleid
	}
	// 创建模型页面数据添加到类，同时写入到json文件
	setId(moduleid) {
		if (moduleid != null) {
			this.moduleid = moduleid
		}
	}
	// 获取设置模型名称
	getName() {
		return this.modulename
	}
	setName(modulename) {
		if (modulename != null) {
			this.modulename = modulename
		}
	}
	// 获取设置模型名称
	getClassification() {
		return this.classification
	}
	setClassification(classification) {
		if (classification != null) {
			this.classification = classification
		}
	}
	// 获取设置模型路径
	getUrl() { // 模型路径
		return this.url
	}
	setUrl(url) {
		if (url != null) {
			this.url = url
		}
	}
	// 获取设置模型位置
	getPosition() {
		return this.moduleposition
	}
	setPosition(position) {
		if (position != null) {
			this.moduleposition = position
		}
	}
	// 获取设置模型旋转角度
	getRotation() {
		return this.modulerotation
	}
	setRotation(rotation) {
		if (rotation != null) {
			this.modulerotation = rotation
		}
	}
	// 获取设置模型规格
	getPropertyInfo() {
		return this.propertyInfo
	}
	setPropertyInfo(propertyInfo) {
		if (propertyInfo != null) {
			this.propertyInfo = propertyInfo
		}
	}
	// 最大负载
	getMaxLoad() {
		return this.maxLoad
	}
	setMaxLoad(maxLoad) {
		if (maxLoad != null) {
			this.maxLoad = maxLoad
		}
	}
	// 添加删除Interface，对象分别为Interface各元素或一个Interface对象
	addInterface(temp) {
		let that = this
		if ((temp instanceof Interface) === true) {
			that.interfaces.push(temp)
		}
	}
	addInterfacebyelement(interfaceUID, interfacename, interfaceposition, interfacerotation, rules) {
		let that = this
		if (interfaceUID != null) {
			let temp = new Interface(interfaceUID, interfacename, interfaceposition, interfacerotation, rules)
			that.interfaces.push(temp)
		}
	}
	deleteInterface(UID) {
		let that = this
		let flag = 0
		that.interfaces.forEach((item, index) => {
			if (flag === 1) {
				item.interfaceUID = String(item.interfaceUID - 1)
			}
			if (item.interfaceUID === UID) {
				that.interfaces.splice(index, 1)
				that.interfaces[index].interfaceUID = String(that.interfaces[index].interfaceUID - 1)
				flag = 1
			}
		})
	}
}

class ComsDataManager {
	constructor(json) {
		this.components = []
		this.createComponentfromjson(json)
	}
	// 将json中的所有Component及其Interface装载到ComsDataManager中
	createComponentfromjson(json) {
		let that = this
		json.components.forEach((item, index) => {
			let testcomponent = new Component(item.moduleid, item.modulename, item.classification, item.url, item.moduleposition, item.modulerotation, item.maxLoad, item.propertyInfo)
			testcomponent.createInterfacefromjson(item.moduleid, json)
			// //console.log(testcomponent)
			that.components.push(testcomponent)
		})
	}

	// 根据modulename获取Component
	getComponentById(id) {
		id = String(id)
		for (let i = 0; i < this.components.length; i++) {
			if (this.components[i].moduleid === id) {
				return this.components[i]
			}
		}
		return null
		//console.log('Component not exist!')
	}

	// 添加删除Component，类似addInterface
	addComponent(temp) {
		let that = this
		if ((temp instanceof Component) === true) {
			that.components.push(temp)
		}
	}

	addComponentbyelement(moduleid, modulename, classification, url, moduleposition, modulerotation, maxLoad, propertyInfo, interfaces) {
		let that = this
		if (moduleid != null) {
			let tempComponent = new Component(moduleid, modulename, classification, url, moduleposition, modulerotation, maxLoad, propertyInfo)
			that.interfaces.forEach((item, index) => {
				let tempInterface = interfaces[index]
				tempComponent.interfaces.push(tempInterface)
			})
			that.components.push(tempComponent)
		}
	}
	deleteComponent(moduleid) {
		let that = this
		let flag = 0
		that.components.forEach((item, index) => {
			if (flag === 1) {
				item.moduleid = String(item.moduleid - 1)
			}
			if (item.moduleid === moduleid) {
				that.components.splice(index, 1)
				that.components[index].moduleid = String(that.components[index].moduleid - 1)
				flag = 1
			}
		})
	}

	getallclass() { // 获得模型所有的分类
		let temp = []
		let test = []
		let that = this
		that.components.forEach((item, index) => {
			test.push(item.classification)
			if (!isRepeat(test)) {
				temp.push(item.classification)
			}
			test = []
			test = temp.concat()
		})
		return temp
	}

	getmouduleinclass(classification) { // 获得某一分类下的所有组件，返回Component对象数组
		let temp = []
		let that = this
		that.components.forEach((item, index) => {
			if (item.classification === classification) {
				temp.push(item)
			}
		})
		return temp
	}

	ConvertToJson() { // 讲一个ComsDataManager对象转换为Json格式，无导出到本地文件功能
		let temp = JSON.stringify(this)
		return temp
	}
}

function isRepeat(arr) {
	var hash = {}
	for (var i in arr) {
		if (hash[arr[i]]) {
			return true
		}
		// 不存在该元素，则赋值为true，可以赋任意值，相应的修改if判断条件即可
		hash[arr[i]] = true
	}
	return false
}

function loadResources() {
	return new ComsDataManager(data)
}

let Manager = {
	loadResources
}

export default {
	Manager
}
