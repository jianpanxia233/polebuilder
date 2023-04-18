import * as TOOL from './Sun/ToolManager.js'
import { Slot, Module, SlotModifier, SM_Free, create_Module_from_Json, Unit } from './Sun/ModuleSlot.js';
import { HTML } from './Utils.js';
import * as THREE from 'three'

export function get_Tools(vue) {
	// PickModule
	const ToolPickModule = new TOOL.MicroTool('PickModule', '选择组件', '', () => {
		return {
			hoversignal: false,
			lastmodule: null
		}
	})
	{
		ToolPickModule.autorun = function (manager, global, param, callevent) {
			this.data.hoversignal = param.hoversignal || false
			this.data.allowquit = param.allowquit || true
			let modulelist = []
			vue.$static.Scene.baseslot.Traverse((module, layer) => {
				if (module.model !== null && (param.module_filter !== undefined ? param.module_filter(module) : true))
					modulelist.push(module)
			},
				() => { })
			let modellist = modulelist.map((item) => { return item.model })
			if (param.clicked !== undefined && param.clicked) {
				let getModule = null
				let touchedModule = vue.get_RayCastObject(modellist, vue.get_Mouse2DPosition())
				if (touchedModule !== null) {
					getModule = modulelist[touchedModule.index[0]]
				}
				if (getModule !== this.data.lastmodule) {
					this.data.lastmodule = getModule
					manager.emit('hoverchange', { module: getModule })
				}
				if (getModule !== null) {
					return { flag: 'GET', param: { module: getModule } }
				}
			}
			if (param.once !== undefined && param.once) {
				return { flag: 'FAIL', param: { module: null } }
			}
			else {
				if (this.data.allowquit)
					manager.log('log', HTML.create_TabOr([HTML.create_Button('左键') + ' 选择插槽', HTML.create_Or([HTML.create_Button('右键'), HTML.create_Button('Escape')]) + ' 退出']))
				else
					manager.log('log', HTML.create_Button('左键') + ' 选择插槽')
				return null
			}
		}

		ToolPickModule.actionloop = function (manager, global, param, callevent) {
			if (!this.data.hoversignal) return null
			let modulelist = []
			vue.$static.Scene.baseslot.Traverse((module, layer) => {
				if (module.model !== null && (param.module_filter !== undefined ? param.module_filter(module) : true))
					modulelist.push(module)
			},
				() => { })
			let modellist = modulelist.map((item) => { return item.model })
			let getModule = null
			let touchedModule = vue.get_RayCastObject(modellist, vue.get_Mouse2DPosition())
			if (touchedModule !== null) {
				getModule = modulelist[touchedModule.index[0]]
			}
			if (getModule !== this.data.lastmodule) {
				this.data.lastmodule = getModule
				manager.emit('hoverchange', { module: getModule })
				manager.emit('mousemove', { module: getModule, once: true })
			}
			else {
				manager.emit('mousemove', { module: getModule, once: false })
			}
			return null
		}

		ToolPickModule.click = function (manager, global, param, callevent) {
			let modulelist = []
			vue.$static.Scene.baseslot.Traverse((module, layer) => {
				if (module.model !== null && (param.module_filter !== undefined ? param.module_filter(module) : true))
					modulelist.push(module)
			},
				() => { })
			let modellist = modulelist.map((item) => { return item.model })
			let getModule = null
			let touchedModule = vue.get_RayCastObject(modellist, vue.get_Mouse2DPosition())
			if (touchedModule !== null) {
				getModule = modulelist[touchedModule.index[0]]
			}
			if (getModule !== this.data.lastmodule) {
				this.data.lastmodule = getModule
				manager.emit('hoverchange', { module: getModule })
			}
			if (getModule !== null) {
				return { flag: 'GET', param: { module: getModule } }
			}
			return null
		}

		ToolPickModule.rightclick = function (manager, global, param, callevent) {
			if (this.data.allowquit) {
				return { flag: 'QUIT', param: { module: null } }
			}
		}
	}
	// PickSlot
	const ToolPickSlot = new TOOL.MicroTool('PickSlot', '选择插槽', '', () => {
		return {
			hoversignal: false,
			allowquit: true,
			slotlist: [],
			modellist: [],
			lastslot: null
		}
	})
	{
		ToolPickSlot.autorun = function (manager, global, param, callevent) {
			this.data.hoversignal = param.hoversignal || false
			this.data.allowquit = param.allowquit || true
			vue.set_TreeShowMode('select_slot')
			vue.$static.Scene.base.Traverse(() => { },
				(slot, layer) => {
					if (slot.helper !== null && (param.slot_filter !== undefined ? param.slot_filter(slot) : true))
						this.data.slotlist.push(slot)
				})
			this.data.modellist = this.data.slotlist.map((item) => { return item.helper })
			if (param.clicked !== undefined && param.clicked) {
				let getSlot = null
				let touchedSlot = vue.get_RayCastObject(this.data.modellist, vue.get_Mouse2DPosition())
				if (touchedSlot !== null) {
					if (touchedSlot.index.length > 1) {
						// multi slots
						let last = this.data.slotlist[touchedSlot.index[0]]
						if (last !== this.data.lastslot) {
							this.data.lastslot = last
							manager.emit('hoverchange', { slot: last })
						}
					}
					else {
						getSlot = this.data.slotlist[touchedSlot.index[0]]
						return { flag: 'GET', param: { slot: getSlot } }
					}
				}
			}
			if (param.once !== undefined && param.once) {
				return { flag: 'FAIL', param: { slot: null } }
			}
			else {
				if (this.data.allowquit)
					manager.log('log', HTML.create_TabOr([HTML.create_Button('左键') + ' 选择插槽', HTML.create_Or([HTML.create_Button('右键'), HTML.create_Button('Escape')]) + ' 退出']))
				else
					manager.log('log', HTML.create_Button('左键') + ' 选择插槽')
				return null
			}
		}

		ToolPickSlot.actionloop = function (manager, global, param, callevent) {
			if (!this.data.hoversignal) return null
			this.data.slotlist = []
			vue.$static.Scene.base.Traverse(() => { },
				(slot, layer) => {
					if (slot.helper !== null && (param.slot_filter !== undefined ? param.slot_filter(slot) : true)) {
						this.data.slotlist.push(slot)
						let size = Math.max(callevent.scale * 14, 2)
						slot.helper.scale.set(size, size, size)
					}
				})
			this.data.modellist = this.data.slotlist.map((item) => { return item.helper })
			let touchedSlot = vue.get_RayCastObject(this.data.modellist, vue.get_Mouse2DPosition())
			if (touchedSlot !== null) {
				let getSlot = this.data.slotlist[touchedSlot.index[0]]
				if (getSlot !== this.data.lastslot) {
					this.data.lastslot = getSlot
					manager.emit('hoverchange', { slot: getSlot })
					manager.emit('mousemove', { slot: getSlot, once: true })
				}
				else {
					manager.emit('mousemove', { slot: getSlot, once: false })
				}
			}
			else {
				if (null !== this.data.lastslot) {
					this.data.lastslot = null
					manager.emit('hoverchange', { slot: null })
					manager.emit('mousemove', { slot: null, once: true })
				}
				else {
					manager.emit('mousemove', { slot: null, once: false })
				}
			}
			return null
		}

		ToolPickSlot.click = function (manager, global, param, callevent) {
			this.data.slotlist = []
			vue.$static.Scene.base.Traverse(() => { },
				(slot, layer) => {
					if (slot.helper !== null && (param.slot_filter !== undefined ? param.slot_filter(slot) : true))
						this.data.slotlist.push(slot)
				})
			this.data.modellist = this.data.slotlist.map((item) => { return item.helper })

			let getSlot = null
			let touchedSlot = vue.get_RayCastObject(this.data.modellist, vue.get_Mouse2DPosition())
			if (touchedSlot !== null) {
				if (touchedSlot.index.length > 1) {
					// multi slots
					let last = this.data.slotlist[touchedSlot.index[0]]
					if (last !== this.data.lastslot) {
						this.data.lastslot = last
						manager.emit('hoverchange', { slot: last })
					}
					getSlot = touchedSlot.index.map((idx) => { return this.data.slotlist[idx] })
					let contextlist = [this.nickname, '-'].concat(getSlot.map((slot) => { return { text: slot.name + ' > ' + slot.belong.name, icon: 'slot', action: 'display_ToolManager_ContextMenu', data: { action: 'pickslots', slot: slot } } }))
					vue.$EventBus.$emit('contextmenu_open', 'display', contextlist, 'PickSlot', event.clientX, event.clientY, 0)
				}
				else {
					getSlot = this.data.slotlist[touchedSlot.index[0]]
					return { flag: 'GET', param: { slot: getSlot } }
				}
			}
			return null
		}

		ToolPickSlot.contextmenu_open = function (manager, global, param, callevent) {
			if (this.data.allowquit) {
				vue.$EventBus.$emit('contextmenu_open', 'display', [this.nickname, '-', { text: '取消插槽选择', icon: 'check', action: 'display_ToolManager_ContextMenu', data: { action: 'quit' } }, { text: '返回', icon: 'cancel', action: 'display_ToolManager_ContextMenu', data: false }], 'PickSlot', event.clientX, event.clientY, 2)
				return null
			}
		}

		ToolPickSlot.contextmenu_click = function (manager, global, param, callevent) {
			if (callevent.data !== 'PickSlot') return null
			if (callevent.args.action === 'quit') {
				return { flag: 'QUIT', param: { slot: null } }
			}
			else if (callevent.args.action === 'pickslots') {
				return { flag: 'GET', param: { slot: callevent.args.slot } }
			}
			return null
		}
	}

	// PickModuleSlot
	const ToolPickModuleSlot = new TOOL.MicroTool('PickModuleSlot', '选择插槽或组件', '', () => {
		return {
			allowquit: true,
			slotlist: [],
			modulelist: [],
			slotans: []
		}
	})
	{
		ToolPickModuleSlot.autorun = function (manager, global, param, callevent) {
			this.data.allowquit = param.allowquit || true
			Slot.set_Visible(vue.$static.Scene.baseslot, true)
			this.data.slotlist.push(vue.$static.Scene.baseslot)
			vue.$static.Scene.baseslot.Traverse((component) => {
				component.rules.get_Slots(component).forEach((slot) => {

					Slot.set_Visible(slot, true)
					this.data.slotlist.push(slot)
				})
				if (component.model !== null) {
					Module.highlight(component, false)
					if (component.rules.get_Module) {
						Module.set_Color(component, 0.6, '#00ff00')
						this.data.modulelist.push(component)
					}
					else {
						Module.set_Color(component, 0.15)
					}
				}
			}, () => { })
			if (this.data.allowquit)
				manager.log('log', HTML.create_TabOr([HTML.create_Button('左键') + ' 选择插槽', HTML.create_Or([HTML.create_Button('右键'), HTML.create_Button('Escape')]) + ' 退出']))
			else
				manager.log('log', HTML.create_Button('左键') + ' 选择插槽')
			return null
		}

		ToolPickModuleSlot.actionloop = function (manager, global, param, callevent) {
			vue.$static.Scene.base.Traverse(() => { },
				(slot, layer) => {
					if (slot.helper !== null) {
						let size = Math.max(callevent.scale * 14, 2)
						slot.helper.scale.set(size, size, size)
					}
				})
			let pos = vue.get_Mouse2DPosition()
			let touchedSlot = vue.get_RayCastObject(this.data.slotlist.map((slot) => { return slot.helper }), pos)
			let touchedModule = vue.get_RayCastObject(this.data.modulelist.map((component) => { return component.model }), pos)

			let selectedModule = []
			if (touchedModule === null)
				selectedModule = null
			else {
				let picked = []
				for (let i = 0; i < touchedModule.index.length; i++) {
					if (picked.includes(touchedModule.index[i])) continue
					picked.push(touchedModule.index[i])
					let module = this.data.modulelist[touchedModule.index[i]]
					let mousepos = touchedModule.interfaces[i].point
					selectedModule.push({ module: module, pos: mousepos })
				}
			}

			let selectedSlot = []
			if (touchedSlot === null)
				selectedSlot = null
			else
				selectedSlot = touchedSlot.index.map((idx) => { return this.data.slotlist[idx] })

			manager.emit('filterslotpreview', { slots: selectedSlot, modules: selectedModule })
			return null
		}

		ToolPickModuleSlot.click = function (manager, global, param, callevent) {
			let pos = vue.get_Mouse2DPosition()
			// //console.log(this.data.slotlist)
			let touchedSlot = vue.get_RayCastObject(this.data.slotlist.map((slot) => { return slot.helper }), pos)
			let touchedModule = vue.get_RayCastObject(this.data.modulelist.map((component) => { return component.model }), pos)

			let selectedModule = []
			if (touchedModule === null)
				selectedModule = null
			else {
				let picked = []
				for (let i = 0; i < touchedModule.index.length; i++) {
					if (picked.includes(touchedModule.index[i])) continue
					picked.push(touchedModule.index[i])
					let module = this.data.modulelist[touchedModule.index[i]]
					let mousepos = touchedModule.interfaces[i].point
					selectedModule.push({ module: module, pos: mousepos })
				}
			}

			let selectedSlot = []
			if (touchedSlot === null)
				selectedSlot = null
			else
				selectedSlot = touchedSlot.index.map((idx) => { return this.data.slotlist[idx] })

			let ans = manager.emit('filterslot', { slots: selectedSlot, modules: selectedModule })
			if (ans.length === 0) {
				return null
			}
			if (ans.length === 1) {
				return { flag: 'GET', param: ans[0] }
			}
			else {
				this.data.slotans = ans
				let contextlist = [this.nickname, '-'].concat(this.data.slotans.map((slot) => { return { text: slot.slot.name + ' > ' + slot.slot.belong.name, icon: 'slot', action: 'display_ToolManager_ContextMenu', data: { action: 'pickslots', slot: slot } } }))
				vue.$EventBus.$emit('contextmenu_open', 'display', contextlist, 'PickModuleSlot', event.clientX, event.clientY, 0)
				return null
			}
		}

		ToolPickModuleSlot.contextmenu_open = function (manager, global, param, callevent) {
			if (this.data.allowquit) {
				vue.$EventBus.$emit('contextmenu_open', 'display', [this.nickname, '-', { text: '取消插槽选择', icon: 'check', action: 'display_ToolManager_ContextMenu', data: { action: 'quit' } }, { text: '返回', icon: 'cancel', action: 'display_ToolManager_ContextMenu', data: false }], 'PickModuleSlot', event.clientX, event.clientY, 2)
				return null
			}
		}

		ToolPickModuleSlot.contextmenu_click = function (manager, global, param, callevent) {
			if (callevent.data !== 'PickModuleSlot') return null
			if (callevent.args.action === 'quit') {
				return { flag: 'QUIT', param: { slot: null } }
			}
			else if (callevent.args.action === 'pickslots') {
				return { flag: 'GET', param: callevent.args.slot }
			}
			return null
		}
	}

	// HighlightModule
	const ToolHighlightModule = new TOOL.MicroTool('HighlightModule', '高亮')
	{
		ToolHighlightModule.autorun = function (manager, global, param, callevent) {
			param.exclusive = param.exclusive || true
			if (param.exclusive === true) {
				vue.$static.Scene.base.Traverse((highlightobj) => {
					Module.set_Visible(highlightobj)
					Module.set_Color(highlightobj)
					Module.highlight(highlightobj, false)
				}, (slot) => {
					Slot.set_Visible(slot, false)
				})
			}
			if (param.module !== undefined) {
				let highlightobj = param.module
				if (highlightobj === null) {
					return { flag: 'FIN', param: { module: highlightobj } }
				}
				else if (highlightobj instanceof Array) {
					highlightobj.forEach((module) => {
						if (module instanceof Module) {
							Module.set_Visible(module, true)
							let highlight_color = param.highlight_color || '#ff9800'
							Module.highlight(module, true, highlight_color)
						}
						else {
							return { flag: 'ERROR', param: { errorMsg: 'param "module" needs to ba an instance of Module' } }
						}
					})
					return { flag: 'FIN', param: { module: highlightobj } }
				}
				else if (highlightobj instanceof Module) {
					Module.set_Visible(highlightobj, true)
					let highlight_color = param.highlight_color || '#ff9800'
					Module.highlight(highlightobj, true, highlight_color)
					return { flag: 'FIN', param: { module: highlightobj } }
				}
				else return { flag: 'ERROR', param: { errorMsg: 'param "module" needs to ba an instance of Module' } }
			}
			else if (vue.$static.SelectedModule !== null) {
				Module.set_Visible(vue.$static.SelectedModule, true)
				let highlight_color = param.highlight_color || '#ff9800'
				Module.highlight(vue.$static.SelectedModule, true, highlight_color)
				return { flag: 'FIN', param: { module: vue.$static.SelectedModule } }
			}
			else {
				return { flag: 'ERROR', param: { errorMsg: 'param "module" is not defined' } }
			}
		}
	}
	// SelectModule
	const ToolSelectModule = new TOOL.MicroTool('SelectModule', '选中组件')
	{
		ToolSelectModule.autorun = function (manager, global, param, callevent) {
			if (param.module !== undefined) {
				let module = param.module
				if (module === null) {
					if (vue.$static.SelectedModule !== module) {
						vue.set_SelectedModule(module)
						manager.log('log', '取消选择')
					}
					return { flag: 'FIN', param: { module: module } }
				}
				else if (module instanceof Module) {
					if (vue.$static.SelectedModule !== module) {
						vue.set_SelectedModule(module)
						manager.log('log', '选中 ' + Module.get_StyledHTML(module))
					}
					return { flag: 'FIN', param: { module: module } }
				}
				else return { flag: 'ERROR', param: { errorMsg: 'param "module" needs to ba an instance of Module' } }
			}
			else {
				return { flag: 'ERROR', param: { errorMsg: 'param "module" is not defined' } }
			}
		}
	}

	const ToolEquipModule = new TOOL.MicroTool('EquipModule', '装备组件')
	{
		ToolEquipModule.autorun = function (manager, global, param, callevent) {
			if (param.module !== undefined) {
				let module = param.module
				if (module instanceof Module) {
					if (module.connectedslot !== null) {
						module.connectedslot.disconnect(module)
					}
					vue.refresh_Tree()
					vue.refresh_AllTreeData()
					module.rules.on_Arm(module, null, null, { unit: Unit })
					vue.set_SelectedModule(null)
					vue.$static.Scene.insertobjslot.connect(module)
					vue.$static.Scene.insertobjslot.Traverse((module, layer) => {
						Module.set_Visible(module, false)
						Module.highlight(module, true, '#00ff00')
					},
						(slot, layer) => {
							Slot.set_Visible(slot, false)
						})
					manager.log('log', '装备 ' + Module.get_StyledHTML(module))
					global.equip_module = module
					return { flag: 'FIN', param: { module: module } }
				}
				else return { flag: 'ERROR', param: { errorMsg: 'param "module" needs to ba an instance of Module' } }
			}
			else {
				return { flag: 'ERROR', param: { errorMsg: 'param "module" is not defined' } }
			}
		}
	}

	const ToolReleaseEquipModule = new TOOL.MicroTool('ReleaseEquipModule', '卸载组件')
	{
		ToolReleaseEquipModule.autorun = function (manager, global, param, callevent) {
			if (!vue.$static.Scene.insertobjslot.is_Empty()) {
				while (vue.$static.Scene.insertobjslot.connectedmodule.length > 0) {
					let oldmodule = vue.$static.Scene.insertobjslot.connectedmodule[0]
					vue.$static.Scene.insertobjslot.disconnect(oldmodule)
					oldmodule.Traverse((module) => {
						Module.remove_from_Scene(module)
					}, Slot.remove_from_Scene)
				}
				manager.log('log', '')
			}
			return { flag: 'FIN', param: {} }
		}
	}

	const ToolConnect = new TOOL.MicroTool('Connect', '连接组件')
	{
		ToolConnect.autorun = function (manager, global, param, callevent) {
			if (param.module !== undefined && param.slot !== undefined) {
				if (param.module.connectedslot !== null) {
					param.module.connectedslot.disconnect(param.module)
				}
				param.shiftposition = param.shiftposition || [0, 0, 0]
				param.shiftrotation = param.shiftrotation || [0, 0, 0]
				param.slot.connect(param.module)
				param.module.slotmodifier.position.set(param.shiftposition[0], param.shiftposition[1], param.shiftposition[2])
				param.module.slotmodifier.rotation.set(param.shiftrotation[0], param.shiftrotation[1], param.shiftrotation[2])
				vue.refresh_Tree()
				vue.refresh_AllTreeData()
				return { flag: 'FIN', param: { module: param.module, slot: param.slot } }
			}
			else {
				return { flag: 'ERROR', param: { errorMsg: 'param "module"/"slot" is not defined' } }
			}
		}
	}

	const LOG = new TOOL.MicroTool('LOG', 'LOG')
	{
		LOG.autorun = function (manager, global, param, callevent) {
			//console.log(global, param)
			return { flag: 'ALL', param: param }
		}
	}

	const BRANCH = new TOOL.MicroTool('BRANCH', 'BRANCH')
	{
		BRANCH.autorun = function (manager, global, param, callevent) {
			if (param.path === undefined) {
				return { flag: 'ERROR', param: { errorMsg: 'param "path" is not defined' } }
			}
			if (typeof (param.path) === 'string') {
				return { flag: param.path, param: param.param }
			}
			if (typeof (param.path) === 'boolean') {
				return { flag: param.path ? 'TRUE' : 'FALSE', param: param.param }
			}
			return { flag: 'ERROR', param: { errorMsg: 'param "path" is unknown type' } }
		}
	}

	return {
		ToolPickModule,
		ToolPickSlot,
		ToolPickModuleSlot,
		ToolHighlightModule,
		ToolSelectModule,
		ToolEquipModule,
		ToolReleaseEquipModule,
		ToolConnect,

		// std
		LOG,
		BRANCH
	}
}

const FlowGraphs = {
	SelectModule_and_Highlight: (vue) => {
		return new TOOL.FlowGraph("SelectModule-FIN-set_HighlightModuleParam-HighlightModule", "SelectModule", {
			//Transform
			set_HighlightModuleParam: (global, param) => {
				return { module: param.module, exclusive: true, highlight_color: global.highlight_color }
			}
		})
	},

	PickModule_and_Select_and_Highlight: (vue) => {
		return new TOOL.FlowGraph("PickModule-GET-SelectModule|SelectModule-FIN-set_HighlightModuleParam-HighlightModule", "PickModule", {
			//Transform
			set_HighlightModuleParam: (global, param) => {
				return { module: param.module, exclusive: true, highlight_color: global.highlight_color }
			}
		})
	},

	PickModuleSlot_and_Connect: (vue) => {
		return new TOOL.FlowGraph('EquipModule-FIN-PickModuleSlot|PickModuleSlot-GET-ConnectParam-Connect|Connect-FIN-SelectModule|SelectModule-FIN-HighlightModule|PickModuleSlot-QUIT-ReleaseEquipModule|ReleaseEquipModule-FIN-SelectModuleParam-SelectModule', 'EquipModule', {
			ConnectParam(global, param) {
				return { module: global.equip_module, slot: param.slot, shiftposition: param.shiftposition, shiftrotation: param.shiftrotation }
			},
			SelectModuleParam(global, param) {
				return { module: null }
			}
		}, {
			PickModuleSlot_filterslotpreview(global, param) {
				let moduleslot = []
				if (param.modules !== null && param.modules.length > 0) {
					moduleslot = param.modules.map((module) => {
						return { slot: module.module.rules.get_DefaultSlot(module.module), pos: module.pos }
					}).filter((slot) => {
						return slot.slot !== null
					})
				}
				for (let i = 0; i < moduleslot.length; i++) {
					let targetslot = moduleslot[i].slot
					let mat = (new THREE.Matrix4().compose(targetslot.world_position, new THREE.Quaternion().setFromEuler(targetslot.world_rotation), new THREE.Vector3(1, 1, 1))).invert()
					let newpos = moduleslot[i].pos.applyMatrix4(mat)
					let ans = global.equip_module.rules.check_Slot(global.equip_module, targetslot, vue.$static.Scene.base, { unit: Unit, pos: newpos })
					// //console.log(ans)
					if (ans.can) {
						newpos.x = ans.mask[0] === true ? newpos.x : ans.mask[0] === false ? 0 : ans.mask[0]
						newpos.y = ans.mask[1] === true ? newpos.y : ans.mask[1] === false ? 0 : ans.mask[1]
						newpos.z = ans.mask[2] === true ? newpos.z : ans.mask[2] === false ? 0 : ans.mask[2]
						vue.$static.Scene.insertobjslot.connectedmodule[0].slotmodifier.position.copy(newpos)
						if (ans.rotation !== undefined) {
							vue.$static.Scene.insertobjslot.connectedmodule[0].slotmodifier.rotation.set(ans.rotation[0], ans.rotation[1], ans.rotation[2])
						}
						else {
							vue.$static.Scene.insertobjslot.connectedmodule[0].slotmodifier.rotation.set(0, 0, 0)
						}
						vue.$static.Scene.insertobj.Update(targetslot.world_position, targetslot.world_rotation)
						vue.$static.Scene.insertobj.Traverse((module) => {
							Module.highlight(module, true, '#00ff00')
						}, () => { })
						return
					}
				}
				if (param.slots !== null && param.slots.length > 0) {
					for (let i = 0; i < param.slots.length; i++) {
						let targetslot = param.slots[i]
						let ans = global.equip_module.rules.check_Slot(global.equip_module, targetslot, vue.$static.Scene.base, { unit: Unit })
						if (ans.can) {
							vue.$static.Scene.insertobjslot.connectedmodule[0].slotmodifier.rotation.set(0, 0, 0)
							vue.$static.Scene.insertobjslot.connectedmodule[0].slotmodifier.position.set(0, 0, 0)
							vue.$static.Scene.insertobj.Update(targetslot.world_position, targetslot.world_rotation)
							vue.$static.Scene.insertobj.Traverse((module) => {
								Module.highlight(module, true, '#00ff00')
							}, () => { })
							return
						}
					}
				}
				vue.$static.Scene.insertobjslot.connectedmodule[0].slotmodifier.rotation.set(0, 0, 0)
				vue.$static.Scene.insertobjslot.connectedmodule[0].slotmodifier.position.set(0, 0, 0)
				vue.$static.Scene.insertobj.Update(vue.get_Mouse3DPosition())
				vue.$static.Scene.insertobj.Traverse((module) => {
					Module.highlight(module, true, '#ff0000')
				}, () => { })
			},
			PickModuleSlot_filterslot(global, param) {
				let slotans = []
				let moduleslot = []
				if (param.modules !== null && param.modules.length > 0) {
					moduleslot = param.modules.map((module) => {
						return { slot: module.module.rules.get_DefaultSlot(module.module), pos: module.pos }
					}).filter((slot) => {
						return slot.slot !== null
					})
				}
				for (let i = 0; i < moduleslot.length; i++) {
					let targetslot = moduleslot[i].slot
					let mat = (new THREE.Matrix4().compose(targetslot.world_position, new THREE.Quaternion().setFromEuler(targetslot.world_rotation), new THREE.Vector3(1, 1, 1))).invert()
					let newpos = moduleslot[i].pos.applyMatrix4(mat)
					let ans = global.equip_module.rules.check_Slot(global.equip_module, targetslot, vue.$static.Scene.base, { unit: Unit, pos: newpos })
					// //console.log(ans)
					if (ans.can) {
						newpos.x = ans.mask[0] === true ? newpos.x : ans.mask[0] === false ? 0 : ans.mask[0]
						newpos.y = ans.mask[1] === true ? newpos.y : ans.mask[1] === false ? 0 : ans.mask[1]
						newpos.z = ans.mask[2] === true ? newpos.z : ans.mask[2] === false ? 0 : ans.mask[2]
						if (ans.rotation !== undefined) {
							slotans.push({ slot: targetslot, shiftposition: [newpos.x, newpos.y, newpos.z], shiftrotation: ans.rotation })
						}
						else {
							slotans.push({ slot: targetslot, shiftposition: [newpos.x, newpos.y, newpos.z], shiftrotation: [0, 0, 0] })
						}

					}
				}
				if (param.slots !== null && param.slots.length > 0) {
					for (let i = 0; i < param.slots.length; i++) {
						let targetslot = param.slots[i]
						let ans = global.equip_module.rules.check_Slot(global.equip_module, targetslot, vue.$static.Scene.base, { unit: Unit })
						if (ans.can) {
							slotans.push({ slot: targetslot, shiftposition: [0, 0, 0], shiftrotation: [0, 0, 0] })
						}
					}
				}
				// //console.log(slotans)
				return slotans
			}
		})
	}
}

export function get_FlowGraph(name, vue) {
	return FlowGraphs[name](vue)
}
