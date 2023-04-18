// 已弃用
export function get_RuleLangObject_from_ActionList(actionlist) {
	if (actionlist === null) {
		return null
	}
	if (actionlist.length === 0) {
		return null
	}
	let rulelangobject = {
		"flow": "do",
		"action": [
			{
				"flow": "var",
				"name": "Test",
				"expression": [{ "type": "data", "data": true }]
			}
		]
	}
	actionlist.forEach((actionmodule) => {
		if (actionmodule.actionid === 'match_ModuleClass') {
			let item = {
				"flow": "if",
				"expression": [{ "type": "data", "data": actionmodule.list }, { "type": "data", "data": "connectModule" }, { "type": "method", "method": ".getClass" }, { "type": "method", "method": ".include" }],
				"true": [],
				"false": [{
					"flow": "var",
					"name": "Test",
					"expression": [{ "type": "data", "data": false }]
				}]
			}
			rulelangobject.action.push(item)
		}
		else if (actionmodule.actionid === 'custom_RuleLang') {
			if (actionmodule.code === '') {
				return
			}
			let item = JSON.parse(actionmodule.code)
			rulelangobject.action.push(item)
		}
		else if (actionmodule.actionid === 'is_SlotEmpty') {
			let item = {
				"flow": "if",
				"expression": [{ "type": "data", "data": 'connectSlot' }, { "type": "method", "method": ".connectedmodule" }, { "type": "method", "method": ".length" }, { "type": "data", "data": 0 }, { "type": "method", "method": "===" }],
				"true": [],
				"false": [{
					"flow": "var",
					"name": "Test",
					"expression": [{ "type": "data", "data": false }]
				}]
			}
			rulelangobject.action.push(item)
		}
	})
	rulelangobject.action.push({
		"flow": "if",
		"expression": [{ "type": "var", "name": "Test" }],
		"true": [
			{
				"flow": "print",
				"expression": [{ "type": "data", "data": "可连接" }]
			}
		],
		"false": [
			{
				"flow": "print",
				"expression": [{ "type": "data", "data": "非法" }]
			}
		]
	})
	return rulelangobject
}

// test: function () {
			// 	this.check_VM(
			// 		{
			// 			"flow": "do",
			// 			"action": [
			// 				{
			// 					"flow": "var",
			// 					"name": "sum",
			// 					"expression": [{ "type": "data", "data": 0 }]
			// 				},
			// 				{
			// 					"flow": "var",
			// 					"name": "n",
			// 					"expression": [{ "type": "method", "method": "prompt" }]
			// 				},
			// 				// {
			// 				// 	"flow": "do",
			// 				// 	"action": [
			// 				// 		{
			// 				// 			"flow": "var",
			// 				// 			"name": "sum",
			// 				// 			"expression": [{ "type": "var", "name": "1234" }]
			// 				// 		}
			// 				// 	]
			// 				// }
			// 				{
			// 					"flow": "while",
			// 					"expression": [{ "type": "var", "name": "n" }, { "type": "data", "data": 0 }, { "type": "method", "method": ">" }],
			// 					"action": [{
			// 						"flow": "if",
			// 						"expression": [{ "type": "var", "name": "n" }, { "type": "data", "data": 2 }, { "type": "method", "method": "%" }, { "type": "data", "data": 0 }, { "type": "method", "method": "===" }],
			// 						"true": [
			// 							{
			// 								"flow": "var",
			// 								"name": "n",
			// 								"expression": [{ "type": "var", "name": "n" }, { "type": "data", "data": 1 }, { "type": "method", "method": "-" }]
			// 							},
			// 							{
			// 								"flow": "continue"
			// 							}
			// 						],
			// 						"false": []
			// 					}, {
			// 						"flow": "if",
			// 						"expression": [{ "type": "var", "name": "n" }, { "type": "data", "data": 31 }, { "type": "method", "method": "===" }],
			// 						"true": [
			// 							{
			// 								"flow": "break"
			// 							}
			// 						],
			// 						"false": []
			// 					}, {
			// 						"flow": "print",
			// 						"expression": [{ "type": "var", "name": "n" }]
			// 					}, {
			// 						"flow": "var",
			// 						"name": "n",
			// 						"expression": [{ "type": "var", "name": "n" }, { "type": "data", "data": 1 }, { "type": "method", "method": "-" }]
			// 					}]
			// 				}
			// 			]
			// 		}, null, null)
			// },

			// exp_VM: function (expression, slot, module, variables) {
			// 	let vmstack = new Array()
			// 	for (let i = 0; i < expression.length; i++) {
			// 		let atomexp = expression[i]
			// 		if (atomexp['type'] === 'data') {
			// 			switch (atomexp['data']) {
			// 				case 'connectSlot':
			// 					vmstack.push(slot)
			// 					break
			// 				case 'connectModule':
			// 					vmstack.push(module)
			// 					break
			// 				case 'sceneBase':
			// 					vmstack.push(this.$static.Scene.base)
			// 					break
			// 				case 'sceneBaseSlot':
			// 					vmstack.push(this.$static.Scene.baseslot)
			// 					break
			// 				default:
			// 					vmstack.push(atomexp['data'])
			// 					break
			// 			}
			// 		}
			// 		else if (atomexp['type'] === 'var') {
			// 			let found = false
			// 			for (let i = 0; i < variables.length; i++) {
			// 				if (variables[i]['name'] === atomexp['name']) {
			// 					vmstack.push(variables[i]['data'])
			// 					found = true
			// 					break
			// 				}
			// 			}
			// 			if (!found)
			// 				return { is_Valid: false, data: "未声明的变量 " + atomexp['name'] }
			// 		}
			// 		else {
			// 			let method = atomexp['method']
			// 			if (method === '+') {
			// 				let a = vmstack.pop()
			// 				let b = vmstack.pop()
			// 				vmstack.push(b + a)
			// 			}
			// 			else if (method === '===') {
			// 				let a = vmstack.pop()
			// 				let b = vmstack.pop()
			// 				vmstack.push(a === b)
			// 			}
			// 			else if (method === '.connectedmodule') {
			// 				let a = vmstack.pop()
			// 				vmstack.push(a.connectedmodule)
			// 			}
			// 			else if (method === '.getInfo') {
			// 				let a = vmstack.pop()
			// 				vmstack.push(a.get_Info())
			// 			}
			// 			else if (method === '.length') {
			// 				let a = vmstack.pop()
			// 				vmstack.push(a.length)
			// 			}
			// 			else if (method === '-') {
			// 				let a = vmstack.pop()
			// 				let b = vmstack.pop()
			// 				vmstack.push(b - a)
			// 			}
			// 			else if (method === '%') {
			// 				let a = vmstack.pop()
			// 				let b = vmstack.pop()
			// 				vmstack.push(b % a)
			// 			}
			// 			else if (method === '>') {
			// 				let a = vmstack.pop()
			// 				let b = vmstack.pop()
			// 				vmstack.push(b > a)
			// 			}
			// 			else if (method === 'prompt') {
			// 				vmstack.push(prompt("输入"))
			// 			}
			// 		}
			// 	}
			// 	return { is_Valid: true, data: vmstack.pop() }
			// },

			// get_VM_Variables: function (varstack) {
			// 	let variables = new Array()
			// 	varstack.forEach((region) => {
			// 		region.variables.forEach((variable) => {
			// 			variables.unshift(variable)
			// 		})
			// 	})
			// 	return variables
			// },

			// check_VM: function (rulelang, slot, module) {
			// 	const maxcount = 15536
			// 	let count = 0
			// 	let vmstack = new Array()
			// 	let varstack = new Array()
			// 	vmstack.push(rulelang)


			// 	while (vmstack.length > 0) {
			// 		if (count > maxcount) {
			// 			this.$EventBus.$emit('console_add_Output', "error", "RuleLang VM Runtime Error", "严重错误 Action Overflow 程序未来运行稳定性无法保证，请刷新页面重置")
			// 			return
			// 		}
			// 		let flow = vmstack.pop()
			// 		let current_variables = this.get_VM_Variables(varstack)
			// 		// console.info(">> flow " + flow.flow)
			// 		let exp = { is_Valid: false, data: "未知错误" }


			// 		switch (flow['flow']) {
			// 			case 'exit':
			// 				varstack.pop()
			// 				break
			// 			case 'do':
			// 				vmstack.push({ flow: 'exit' })
			// 				for (let i = flow['action'].length - 1; i >= 0; i--) {
			// 					vmstack.push(flow['action'][i])
			// 				}
			// 				varstack.push({ region: 'do', variables: [] })
			// 				break
			// 			case 'var':
			// 				let has_var = false
			// 				for (let i = 0; i < current_variables.length; i++) {
			// 					if (current_variables[i]['name'] === flow['name']) {
			// 						// if (varstack[varstack.length - 1].variables['name'] === undefined) {
			// 						// 	this.$EventBus.$emit('console_add_Output', "info", "RuleLang VM Warning", "尝试修改已存在的非本层级的变量 " + flow['name'])
			// 						// }
			// 						exp = this.exp_VM(flow['expression'], slot, module, current_variables)
			// 						if (exp.is_Valid) {
			// 							current_variables[i]['data'] = exp.data
			// 						}
			// 						else {
			// 							this.$EventBus.$emit('console_add_Output', "error", "RuleLang VM Runtime Error", exp.data)
			// 							return
			// 						}
			// 						has_var = true
			// 						break
			// 					}
			// 				}
			// 				if (!has_var) {
			// 					exp = this.exp_VM(flow['expression'], slot, module, current_variables)
			// 					if (!exp.is_Valid) {
			// 						this.$EventBus.$emit('console_add_Output', "error", "RuleLang VM Runtime Error", exp.data)
			// 						return
			// 					}
			// 					varstack[varstack.length - 1].variables.push({ 'name': flow['name'], 'data': exp.data })
			// 				}
			// 				break
			// 			case 'if':
			// 				vmstack.push({ flow: 'exit' })
			// 				exp = this.exp_VM(flow['expression'], slot, module, current_variables)
			// 				if (!exp.is_Valid) {
			// 					this.$EventBus.$emit('console_add_Output', "error", "RuleLang VM Runtime Error", exp.data)
			// 					return
			// 				}

			// 				if (exp.data) {
			// 					for (let i = flow['true'].length - 1; i >= 0; i--) {
			// 						vmstack.push(flow['true'][i])
			// 					}
			// 				}
			// 				else {
			// 					for (let i = flow['false'].length - 1; i >= 0; i--) {
			// 						vmstack.push(flow['false'][i])
			// 					}
			// 				}
			// 				varstack.push({ region: 'if', variables: [] })
			// 				break
			// 			case 'while':
			// 				exp = this.exp_VM(flow['expression'], slot, module, current_variables)
			// 				if (!exp.is_Valid) {
			// 					this.$EventBus.$emit('console_add_Output', "error", "RuleLang VM Runtime Error", exp.data)
			// 					return
			// 				}

			// 				if (exp.data) {
			// 					flow['flow'] = 'loop'
			// 					vmstack.push(flow)
			// 					for (let i = flow['action'].length - 1; i >= 0; i--) {
			// 						vmstack.push(flow['action'][i])
			// 					}
			// 					varstack.push({ region: 'while', variables: [] })
			// 				}
			// 				break
			// 			case 'loop':
			// 				exp = this.exp_VM(flow['expression'], slot, module, current_variables)
			// 				if (!exp.is_Valid) {
			// 					this.$EventBus.$emit('console_add_Output', "error", "RuleLang VM Runtime Error", exp.data)
			// 					return
			// 				}

			// 				if (exp.data) {
			// 					vmstack.push(flow)
			// 					for (let i = flow['action'].length - 1; i >= 0; i--) {
			// 						vmstack.push(flow['action'][i])
			// 					}
			// 				}
			// 				else {
			// 					varstack.pop()
			// 				}
			// 				break
			// 			case 'break':
			// 				for (let action = vmstack.pop(); action['flow'] !== 'loop'; action = vmstack.pop()) {
			// 					if (action['flow'] === 'exit') {
			// 						varstack.pop()
			// 					}
			// 				}
			// 				varstack.pop()
			// 				break
			// 			case 'continue':
			// 				let last_loop;
			// 				for (last_loop = vmstack.pop(); last_loop['flow'] !== 'loop'; last_loop = vmstack.pop()) {
			// 					if (last_loop['flow'] === 'exit') {
			// 						varstack.pop()
			// 					}
			// 				}
			// 				vmstack.push(last_loop)
			// 				break
			// 			case 'print':
			// 				exp = this.exp_VM(flow['expression'], slot, module, current_variables)
			// 				if (!exp.is_Valid) {
			// 					this.$EventBus.$emit('console_add_Output', "error", "RuleLang VM Runtime Error", exp.data)
			// 					return
			// 				}
			// 				this.$EventBus.$emit('console_add_Output', "info", "RuleLang VM", exp.data)
			// 				break
			// 			case 'printerror':
			// 				exp = this.exp_VM(flow['expression'], slot, module, current_variables)
			// 				if (!exp.is_Valid) {
			// 					this.$EventBus.$emit('console_add_Output', "error", "RuleLang VM Runtime Error", exp.data)
			// 					return
			// 				}
			// 				this.$EventBus.$emit('console_add_Output', "error", "来自 RuleLang VM 的错误消息", exp.data)
			// 				break
			// 			case 'method':
			// 				exp = this.exp_VM(flow['expression'], slot, module, current_variables)
			// 				if (!exp.is_Valid) {
			// 					this.$EventBus.$emit('console_add_Output', "error", "RuleLang VM Runtime Error", exp.data)
			// 					return
			// 				}
			// 				break
			// 			case 'connect':
			// 				slot.connect(module)
			// 				this.set_SelectedModule(module)
			// 				// this.$EventBus.$emit('console_add_Output', "log", "组件连接", Module.get_StyledHTML(module) + " 连接至 " + Slot.get_StyledHTML(slot))
			// 				break
			// 			case 'rearm':
			// 				this.insertObjSlot.connect(module)
			// 				break
			// 			default:
			// 				this.$EventBus.$emit('console_add_Output', "error", "RuleLang VM Runtime Error", "未识别指令 " + flow["flow"])
			// 				return
			// 		}
			// 		count++;
			// 		// //console.log(">> varstack " + JSON.stringify(varstack))
			// 	}
			// 	// this.$EventBus.$emit('console_add_Output', "info", "RuleLang VM", "Finished")
			// 	// this.refresh_Tree()
			// 	// this.refresh_AllTreeData()
			// 	// this.$static.Scene.baseslot.Traverse((module, layer) => {
			// 	// 	if (module.model !== null)
			// 	// 		module.model.visible = true
			// 	// 	if (module.line !== null)
			// 	// 		module.line.visible = false
			// 	// },
			// 	// 	(slot, layer) => {
			// 	// 		slot.helper.visible = true
			// 	// 	})
			// }
