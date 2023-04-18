import { get_UniqueID } from '../Sun/ModuleSlot.js';
import * as FileSystem from '../Sun/FileSystem.js'
import CryptoJS from 'crypto-js'
import { customLog,HTML } from '@/components/Utils'
import {uploadFileBlock} from '@/api/FileBlock'
import {addOrUpdateSticker} from '@/api/Snapshot'
export function init_Editor() {
	//console.log(">>> Svg Viewer Init")
}
var vue
export function new_Scene(item) {
	if (item === null) {
		this.$EventBus.$emit('console_add_Output', 'error', 'SVG 查看', '无法新建.svg文件')
	}
	else {
		let scene = {
			filetype: 'svg',
			name: '',
			uid: undefined,
			path: undefined,
			eventlistener: undefined,
			url: '',
			context: {
				name: '',
				library: '标准库'
			},
			reactive: {
				bottombar: false
			},
			render: false,
			regionId: 0
		}
		let path = item.path
		vue = this
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
		let filedescripter = FileSystem.ROOT.open(path, eventlistener)
		scene.name = filedescripter.name
		scene.context.name = filedescripter.name
		scene.path = filedescripter.path
		scene.uid = filedescripter.uid
		scene.eventlistener = eventlistener
		scene.regionId = filedescripter.regionId
		this.register_Scene(scene)
		let url = URL.createObjectURL(new Blob([filedescripter.file.data], { type: "image/svg+xml;charset=utf-8" }))
		scene.url = url
		scene.reactive.url = url
	}
}

export function deselect_Scene(scene) {
}

export function can_Switch(scene) {
	return true
}

export function switch_Scene(scene) {
	refresh_Inspector.call(this)
	this.$EventBus.$emit("display_TreeData_changed", [], [])
	this.$emit('moduleSelect', -1, -1, -1)
}

export function release_Scene(scene) {
	FileSystem.ROOT.close(scene.path, scene.eventlistener)
	URL.revokeObjectURL(scene.url)
}

export function save_Scene(scene, pathobj) {

}

// 只在已存在的文件被关闭前调用
export function close_Scene(scene) {
	return true
}

// Event
export function mouseClick() {

}

export function mouseDoubleClick() {
}

export function onContextMenu() {
}

export function actionLoop(scale) {
}

export function inspectorUpdate(action, val) {
	//console.log(action, val)
	if (action === 'change') {
		this.$static.Scene.context.name = val.data.getName
		this.$static.Scene.context.library = val.data.getLibrary
	}
}

function refresh_Inspector() {
	this.$EventBus.$emit('inspectorInit', {
		uid: 'display', iuid: 'moduledisplay_build_empty', list: [
			{
				type: 'group', title: '', action: 'change', itemvalue: { // action需要调用
					grouped: false, list: [
						// { type: 'lineedit', title: 'id', action: 'getId', itemvalue: { value: '', placeholder: '' } },
						{ type: 'lineedit', title: '名称', action: 'getName', itemvalue: { value: this.$static.Scene.context.name, placeholder: '' } },
						{
							type: 'select',
							action: 'getLibrary',
							title: '库',
							itemvalue: {
								list: ['标准库', '自定义库'],
								selectitem: this.$static.Scene.context.library // 初始化在第5行：let selectLibrary = "标准库";
							}
						},
						// { type: 'button', title: '', action: 'upload', itemvalue: { list: ["上传"] } },
						// { type: 'button', title: '', action: 'delete', itemvalue: { list: ["删除"] } }
					]
				}
			}
		]
	})
}

export function upload(id = null, name = null) {
	// id = prompt("请输入Id:", "")
	// name = prompt("请输入Name:", "")
	//console.log(">> upload Svg", this.$static.Scene.url)
	let file = FileSystem.ROOT.get(this.$static.Scene.path)
	//debugger
	let blob = null

	if (file === null) {
	}
	else {
		blob = new Blob([file.data], { type: "image/svg+xml;charset=utf-8" })
	}

	let updateStl = new FormData();

	// this.CurrentModule.shiftposition.copy(temp)
	// this.CurrentModule.shiftrotation.copy(temp2)
	// this.CurrentModule.Update()


	updateStl.append("file", blob)
	updateStl.append("fileMd5", this.$md5(blob.toString()))
	updateStl.append("fileName", file.name)
	updateStl.append("fileSize", blob.size)
	updateStl.append("blockNo", 0)
	updateStl.append("blockTotalNo", 1)
	updateStl.append("blockSize", 3145728)
	updateStl.append("noGroupPath", null);
	//console.log("updateStl", updateStl)

	const LIBRARY = {
		'标准库': 0,
		'自定义库': 1
	}

	uploadFileBlock(updateStl).then(response => {
		//console.log(response)
		if (response.respCode == 0) {
			let path = response.returns.groupPath;
			let uploadJson = {
				stickerName: this.$static.Scene.context.name,
				stickerAddr: path,
				standardType: LIBRARY[this.$static.Scene.context.library],
			}
			debugger
			if(uploadJson.standardType === 1){
				 uploadJson.unitEngineeringId = vue.listQuery.unitEngineeringId
					uploadJson.orgCompanyId = vue.listQuery.orgCompanyId
			}
			if (id !== null && id !== '') {
				uploadJson.id = id;
			}

			addOrUpdateSticker(uploadJson).then(response => {
				if (response.respCode === 0) {
					customLog(this, 'log', 'upload', '编辑器 提示', HTML.create_KeyPair('操作', '上传贴图', 'String') + ' 完成')
				}
				else {
					this.$EventBus.$emit('console_add_Output', 'error', '上传svg', '上传svg失败，错误代码为' + response.respCode)
				}
			})
		} else {
			this.$EventBus.$emit('console_add_Output', 'error', '上传svg', '上传svg失败，错误代码为' + response.respCode)
		}
	})
	// implement upload
}
