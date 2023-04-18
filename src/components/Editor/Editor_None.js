// //////////////////////////////////////////
//             Editor Template
// //////////////////////////////////////////

// this function will only be called once when the editor open
export function init_Editor() {
	//console.log(">>> None Editor Init")
}

// request a new file, with item===null means a new file, or item is a filedescriptor
export function new_Scene(item) {

}

// called when the focus is removed , no matter whether this scene is selected or not
export function deselect_Scene(scene) {
}

// check whether current scene can be deselected, return true/false
export function can_Switch(scene) {

}

// called when this scene is seleced
export function switch_Scene(scene) {
	this.$EventBus.$emit('inspectorInit', {
		uid: 'display', iuid: 'moduledisplay_build_empty', list: [
			// { type: 'taglist', action: 'test', title: '', itemvalue: { list: ['123', '234', '235'], allowinput: true } }
		]
	})
	this.$EventBus.$emit("display_TreeData_changed", [], [])
	this.$emit('moduleSelect', -1, -1, -1)
}

// called when this scene is ready to be removed
export function release_Scene(scene) {

}

export function save_Scene(scene, pathobj) {

}

// called when current scene can be closed **this will not prevent a scene to be closed only shows a warning
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
	//console.log(action, val)
}

export function open_Setting(menu) {
	this.$EventBus.$emit('app_open_Popup', 'pw-setting', 'app', '设置', 700, 600, true, true, true, { menu: menu })
}

export function open_UpdateInfo() {
	this.$EventBus.$emit('app_open_Popup', 'pw-update-info', 'app', '更新内容', 1000, 800, true, true, true, { title: '20/12/10 更新内容', description: '<ol><li>新的可编辑属性(editable property)，实现仰角/2F尺寸/设备编号等</li><li>网络版初步并入</li><li>阻止Observer的侵入</li><li>create_Tree_by_PoleJson 搭载设备 zaxis 错误修复，灯臂连接使用“灯臂插槽”</li></ol></br>注意若出现页面布局错误，请至 开发人员工具 > Application > Storage > LoacalStorage 下 删除\'layout\'项目</br></br>问题<ol><li>横臂的搭载设备插槽的初始旋转， 见test3.json</li><li>2F 模型尺寸</li></ol> </br>注意！！！！<ol><li>可以使用ModuleSlot.js中的create_Tree_from_PoleJson来生成合杆</li></ol>' })
}

export function load_Project() {
	this.$EventBus.$emit('filesystem_import_Project')
}

export function load_Remote() {
	this.$EventBus.$emit('app_open_Popup', 'pw-remote', 'app', '远程加载', 300, 400, true, true, true, {})
}
