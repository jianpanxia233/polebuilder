///////////////////////////////////
//        SUN ToolManager
///////////////////////////////////
import { HTML } from '../Utils.js';

// class ToolManager
export class ToolManager {
	constructor(log = (type, info) => { }, fin = () => { }) {
		this.micro_tools = {}
		this.current_tool = null
		this.global_data = {}
		this.last_param = {}
		this.graph = null
		this.log_func = log
		this.fin_func = fin
		this.graph_stack = []
		this.global_data_stack = []
		this.allow_input = true
	}

	add_MicroTool(microtool) {
		if (!(microtool instanceof MicroTool)) {
			throw new Error("microtoll is not an instance of MicroTool Class")
		}

		if (this.micro_tools[microtool.name] !== undefined)
			throw new Error("microtool name already existed")

		this.micro_tools[microtool.name] = microtool
		// microtool.uid = this.micro_tools.length
	}

	equip_Tools(obj) {
		for (let key in obj) {
			this.add_MicroTool(obj[key])
		}
	}

	get_MicroTool(toolname) {
		if (this.micro_tools[toolname] === undefined) return null
		else return this.micro_tools[toolname]
		// for (let i = 0; i < this.micro_tools.length; i++) {
		// 	if (toolname === this.micro_tools[i].name) {
		// 		return this.micro_tools[i]
		// 	}
		// }
		// return null
	}

	end_SubGrpah(result) {
		while (this.graph_stack.length > 0) {
			let graph = this.graph_stack.pop()
			this.graph = graph
			let global_data = this.global_data_stack.pop()
			this.global_data = global_data
			let transform = this.graph.advance(result.flag)
			if (this.graph.current_node === null) {
				continue
			}
			else if (transform !== null && this.graph.transforms[transform] !== undefined) {
				result.param = this.graph.transforms[transform](this.global_data, result.param)
			}
			return this.turnTo(this.graph.current_node.name, result.param)
		}
		return { flag: 'END', param: result.param }
	}

	end() {
		this.current_tool = null
		this.global_data = {}
		this.graph = null
		this.last_param = {}
		this.graph_stack = []
		this.fin_func()
	}

	turnTo(toolname, param) {
		this.last_param = param
		let tool
		if (this.current_tool !== null) {
			this.current_tool.reset_Data()
		}
		if (toolname.split(':')[0] === 'SubGraph') {
			this.graph_stack.push(this.graph)
			this.global_data_stack.push(this.global_data)
			this.graph = this.last_param.subgraph
			this.global_data = this.last_param.global || {}
			this.last_param = this.last_param.param || {}
			toolname = this.graph.current_node.name
		}
		toolname = toolname.split(':')[0]
		if (toolname === 'END') {
			return null
		}
		tool = this.get_MicroTool(toolname)
		if (tool === null) {
			throw new Error("MicroTool not found")
		}
		this.current_tool = tool
		if (this.current_tool.description !== '')
			this.log_func('log', 'ToolManager', HTML.create_TabOr([this.get_ToolStyledHTML(), this.current_tool.description]))
		if (this.current_tool.autorun !== undefined) {
			this.current_tool.reset_Data()
			return this.current_tool.autorun(this, this.global_data, this.last_param)
		}
		return null
	}

	// send_Param(param) {
	// 	this.last_param = param
	// }

	emit(signal, param = {}) {
		signal = this.current_tool.name + "_" + signal
		if (this.graph.signals[signal] !== undefined) {
			return this.graph.signals[signal](this.global_data, param)
		}
	}

	get_ToolStyledHTML() {
		if (this.current_tool !== null) {
			let str = "<span style=\"padding: 4px 8px ; background-color:rgb(240, 70, 60); border-radius: var(--ObjectRadius) 0px 0px var(--ObjectRadius); color:white;font-weight:bold;\">微工具</span><span style=\"padding: 4px 8px ; background-color: rgb(50,50,50); border-radius: 0px var(--ObjectRadius) var(--ObjectRadius) 0px; color: white;\">" + this.current_tool.nickname + "</span>"
			return str
		}
		return ''
	}

	log(type, msg) {
		this.log_func(type, 'ToolManager', HTML.create_TabOr([this.get_ToolStyledHTML(), msg]))
	}

	call(func, param = {}) {
		if (this.allow_input && this.current_tool !== null && this.current_tool[func] !== undefined) {
			let result = (this.current_tool[func])(this, this.global_data, this.last_param, param)
			if (result !== null) {
				if (result.flag === "ERROR") {
					this.current_tool = null
					this.global_data = {}
					this.graph = null
					this.log_func('error', 'ToolManager', HTML.create_TabOr([this.get_ToolStyledHTML(), result.param.errorMsg]))
					this.fin_func()
					return
				}
				else if (result.flag === "END") {
					this.end()
					return
				}
				let transform = this.graph.advance(result.flag)
				if (transform !== null && this.graph.transforms[transform] !== undefined) {
					result.param = this.graph.transforms[transform](this.global_data, result.param)
				}
				this.run(this.graph, result.param, this.global_data)
				return
			}
		}
	}

	run(graph, param = {}, global = {}) {
		if (this.graph !== null && this.graph !== graph) {
			throw new Error("Has FlowGraph in progress")
		}
		this.graph = graph
		this.global_data = global
		if (this.graph.current_node === null || this.graph.current_node.name === 'END') {
			this.end()
			return
		}
		let result = this.turnTo(this.graph.current_node.name, param)
		while (result !== null) {
			if (result.flag === "ERROR") {
				this.log_func('error', 'ToolManager', HTML.create_TabOr([this.get_ToolStyledHTML(), result.param.errorMsg]))
				this.end()
				return
			}
			else if (result.flag === "END") {
				this.end()
				return
			}
			let transform = this.graph.advance(result.flag)
			if (this.graph.current_node === null) {
				result = this.end_SubGrpah(result)
				continue
			}
			else if (transform !== null && this.graph.transforms[transform] !== undefined) {
				result.param = this.graph.transforms[transform](this.global_data, result.param)
			}
			result = this.turnTo(this.graph.current_node.name, result.param)
		}
		if (this.graph.current_node === null || this.graph.current_node.name === 'END') {
			this.end()
			return
		}
	}

	is_Running() {
		return (this.graph !== null)
	}
}

// class MicroTool
export class MicroTool {
	constructor(name, nickname = '', description = '', reset = () => { return {} }) {
		this.name = name
		this.uid = 0
		this.autorun = () => { return null }
		this.reset = reset
		this.data = this.reset()
		this.nickname = nickname === '' ? this.name : nickname
		this.description = description
	}

	reset_Data() {
		this.data = this.reset()
	}
}

// class FlowGraph
export class FlowGraph {
	constructor(pathstr, startname, transforms = {}, signals = {}) {
		let path = pathstr.split('|')

		this.nodes = new Array()
		this.transforms = transforms
		this.signals = signals

		for (let i = 0; i < path.length; i++) {
			let pathitem = path[i].split('-')
			if (pathitem.length === 1) {
				let nodeFromIndex = this.create_Node(pathitem[0])
			}
			else if (pathitem.length === 2) {
				let nodeFromIndex = this.create_Node(pathitem[0])
				let nodeToIndex = this.create_Node(pathitem[1])
				this.nodes[nodeFromIndex].add_Path('ALL', nodeToIndex)
			}
			else if (pathitem.length === 3) {
				let nodeFromIndex = this.create_Node(pathitem[0])
				let nodeToIndex = this.create_Node(pathitem[2])
				this.nodes[nodeFromIndex].add_Path(pathitem[1], nodeToIndex)
			}
			else if (pathitem.length === 4) {
				let nodeFromIndex = this.create_Node(pathitem[0])
				let nodeToIndex = this.create_Node(pathitem[3])
				this.nodes[nodeFromIndex].add_Path(pathitem[1], nodeToIndex, pathitem[2])
			}
		}

		let start_index = this.get_NodeIndex(startname)
		if (start_index === null) {
			throw new Error('Can not find startnode with name of \'' + startname + '\'')
		}
		this.current_node = this.nodes[start_index]
	}

	get_NodeByName(name) {
		for (let i = 0; i < this.nodes.length; i++) {
			if (name === this.nodes[i].name) {
				return this.nodes[i]
			}
		}
		return null
	}

	get_NodeIndex(name) {
		for (let i = 0; i < this.nodes.length; i++) {
			if (name === this.nodes[i].name) {
				return i
			}
		}
		return null
	}

	create_Node(name) {
		let node = this.get_NodeIndex(name)
		if (node !== null) return node
		this.nodes.push(new FlowGraphNode(name))
		return this.nodes.length - 1
	}

	advance(flag) {
		let path = this.current_node.get_Path(flag)
		// //console.log(path)
		if (path !== null) {
			this.current_node = this.nodes[path.next]
			return path.transform
		}
		else {
			this.current_node = null
			return null
		}
	}
}

class FlowGraphNode {
	constructor(name) {
		this.name = name
		// the map of the flag and the next node
		this.path = new Array()
	}

	add_Path(flag, to, transform = "") {
		this.path.push({ flag: flag, next: to, transform: transform })
	}

	get_Path(flag) {
		for (let i = 0; i < this.path.length; i++) {
			let pathitem = this.path[i]
			if (pathitem.flag === 'ALL' || pathitem.flag === flag) {
				return pathitem
			}
		}
		return null
	}

	no_Next() {
		if (this.path.length <= 0) return true
		return false
	}
}
