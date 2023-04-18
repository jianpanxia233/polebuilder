import { get_UniqueID } from '../Sun/ModuleSlot.js';

export function init_Editor() {
	//console.log(">>> Text Editor Init")
}

export function new_Scene(item) {
	this.register_Scene({
		filetype: 'txt',
		name: '新建文本(' + get_UniqueID() + ')',
		uid: undefined,
		path: undefined,
		eventlistener: undefined,
		context: {
		},
		reactive: {
			text: 'hello world',
			fontsize: 20
		},
		render: false
	})
}

export function deselect_Scene(scene) {
}

export function can_Switch(scene) {
	return true
}

export function switch_Scene(scene) {
	this.$EventBus.$emit('inspectorInit', {
		uid: 'display', iuid: 'moduledisplay_build_empty', list: [
			// { type: 'taglist', action: 'test', title: '', itemvalue: { list: ['123', '234', '235'], allowinput: true } }
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
}

export function change_FontSize(b) {
	if (b) {
		this.$static.Scene.reactive.fontsize++
	}
	else {
		this.$static.Scene.reactive.fontsize--
	}
}
