import { get_UniqueID } from '../Sun/ModuleSlot.js';
import * as FileSystem from '../Sun/FileSystem.js'
import CryptoJS from 'crypto-js'
import {uploadFileBlock} from '@/api/FileBlock'
import {addSticker} from '@/api/Components'
import {addOrUpdateSticker} from '@/api/Snapshot'

let selectLibrary ;

export function init_Editor() {
	//console.log(">>> Road Svg Builder Init")
}

export function new_Scene(item) {
	if (item !== null) {
		this.$EventBus.$emit('console_add_Output', 'error', 'Road SVG 编辑', '无法打开文件')
	}
	else {
		let scene = {
			filetype: 'roadsvg',
			name: `路牌(${get_UniqueID()})`,
			uid: undefined,
			path: undefined,
			eventlistener: undefined,
			url: '',
			context: {
			},
			reactive: {
				bottombar: false,
				left: '',
				right: ''
			},
			render: false
		}
		this.register_Scene(scene)
	}
}

export function deselect_Scene(scene) {
}

export function can_Switch(scene) {
	return true
}

export function switch_Scene(scene) {
	this.$EventBus.$emit('inspectorInit', {
		uid: 'display', iuid: 'moduledisplay_build_empty', list: [
			{ type: 'title', title: '左侧' },
			{
				type: 'dropdown', title: '左侧图形', action: 'left', itemvalue: {
					default: true,
					showselected: true,
					list: ['三角形', '圆形'],
					selectitem: scene.reactive.left,
					hold: true
				}
			},
			{ type: 'title', title: '右侧' }, {
				type: 'dropdown', title: '右侧图形', action: 'right', itemvalue: {
					default: true,
					showselected: true,
					list: ['三角形', '圆形'],
					selectitem: scene.reactive.right,
					hold: true
				}
			},
			{ type: 'title', title: '设计路牌' },
			{
				type: 'group', title: '', action: '设计路牌', itemvalue: { // action需要调用
					grouped: false, list: [
						{ type: 'lineedit', title: 'id', action: 'getId', itemvalue: { value: '', placeholder: '' } },
						{ type: 'lineedit', title: '名称', action: 'getName', itemvalue: { value: '', placeholder: '' } },
						{
							type: 'select',
							action: 'module_select',
							title: '库',
							itemvalue: {
								list: ['标准库', '自定义库'],
								selectitem: selectLibrary // 初始化在第5行：let selectLibrary = "标准库";
							}
						}
					]
				}
			}
		]
	})
	this.$EventBus.$emit("display_TreeData_changed", [], [])
	this.$emit('moduleSelect', -1, -1, -1)
}

export function release_Scene(scene) {
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
	if (action === 'left') {
		this.$static.Scene.reactive.left = val
	}
	else if (action === 'right') {
		this.$static.Scene.reactive.right = val
	}else if(action === '设计路牌'){
		//console.log(action,val)
		if(val.actionchain === '设计路牌>getId'){
			this.$static.Scene.id = val.data.getId
		}else if(val.actionchain === '设计路牌>getName'){
			this.$static.Scene.name = val.data.getName
		}else if(val.actionchain === '设计路牌>module_select'){
			this.$static.Scene.module_select = val.data.module_select
		}
	}
}

export function upload(id = null, name = null) {
	//console.log('svg')
	//console.log(this)
	// id = prompt("请输入Id:", "")//
	// name = prompt("请输入Name:", "")//
	// 上面两行要改，需换成检视器设计路牌中getId和getName的action
	// //console.log(">> upload Svg", this.$static.Scene.url)
	let file = { data: get_SvgStr.call(this) }
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
 let that = this;
	uploadFileBlock(updateStl).then(response => {
		//console.log(response)
		if (response.respCode == 0) {
			let path = response.returns.groupPath;
			let uploadJson = {
				stickerName: that.$static.Scene.name,
				stickerAddr: path,
				standardType: 0
			}
			addSticker(uploadJson).then((response) => {
				//console.log(response)
			})
		} else {
			that.$EventBus.$emit('console_add_Output', 'error', '上传svg', '上传svg失败，错误代码为' + response.respCode)
		}
	})
	// implement upload
}

function get_SvgStr() {
	let left = this.$static.Scene.reactive.left
	let right = this.$static.Scene.reactive.right
	let str = `<svg version="1.1" id="图层_1" xmlns="http://www.w3.org/2000/svg"
xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 4252 1276"
style="enable-background:new 0 0 4252 1276;" xml:space="preserve">
	<path
	d="M71,0h4110c39.2,0,71,31.8,71,71v1134c0,39.2-31.8,71-71,71H71c-39.2,0-71-31.8-71-71V71C0,31.8,31.8,0,71,0z"
	style="fill:#FFFFFF;" />
	<path d="M0,855V71C0,31.8,31.8,0,71,0h4110c39.2,0,71,31.8,71,71v784" style="fill:#03529D;" />
	${left === '三角形' ? `<polygon points="150.3,541 347.8,655 347.8,427 "
		style="fill:#FFFFFF;" />` : ``}
	${right === '三角形' ? `<polygon points="4110.5,540.8 3913.1,426.8 3913.1,654.8 "
	style="fill:#FFFFFF;" />`: ``}
	${right === '圆形' ? `<circle cx="3982.5" cy="541" r="128" style="fill:#FFFFFF;" />` : ``}
	${left === '圆形' ? `<circle cx="278.3" cy="541" r="128" style="fill:#FFFFFF;" />` : ``}
</svg>`
	return str
}
