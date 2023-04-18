import request from '@/utils/request'
import CryptoJS from 'crypto-js'
import {isNotUndefinedOrNull} from './Common'

// 根据项目id获取灯杆信息
export function getComponentsByTab(param) {
	return import('../components/mainPoleParts')
}

export function getComponents(param) {
	let word =''

	if(isNotUndefinedOrNull(param.standardType)){
		word += '&standardType=' + param.standardType
	}

	return request({
		url: '/woody/visualMgr/getComponents?' + word,
		method: 'get'
	})
}

export function searchPoleTmplByPage(param) {
	let word ='pageNum=' + param.pageNum +
		'&pageSize=' + param.pageSize

	if(isNotUndefinedOrNull(param.standardType)){
		word += '&standardType=' + param.standardType
	}

	return request({
		url: '/woody/visualDesign/pole/searchPoleTmplByPage?' + word,
		method: 'get'
	})
}

export function getRowMaterial(param) {
	let word ='pageNum=' + param.pageNum +
		'&pageSize=' + param.pageSize

	if(isNotUndefinedOrNull(param.type)){
		word += '&type=' + param.type
	}

	if(isNotUndefinedOrNull(param.belongPartType)){
		word += '&belongPartType=' + param.belongPartType
	}

	if(isNotUndefinedOrNull(param.name) && param.name.length > 0){
		word += '&name=' + param.name
	}

	if(isNotUndefinedOrNull(param.subType)){
		word += '&subType=' + param.subType
	}

	if(isNotUndefinedOrNull(param.standardType)){
		word += '&standardType=' + param.standardType
	}

	return request({
		url: '/woody/visualDesign/disassembledParts/getRowMaterial?' + word,
		method: 'get'
	})
}

// 设计规划综合杆
export function assembleComponts(data) {
	return request({
		url: '/woody/visualDesign/pole/assembleComponts',
		method: 'post',
		data
	})
}

// 创建及编辑综合杆杆型模板
export function createPoleTmpl(word,data) {
	return request({
		url: '/woody/visualDesign/pole/createPoleTmpl?' + word,
		method: 'post',
		data
	})
}

// =======================================贴图Start============================================
export function searchStickers(param) {
	let word ='pageNum=' + param.pageNum +
		'&pageSize=' + param.pageSize

	if(isNotUndefinedOrNull(param.standardType)){
		word += '&standardType=' + param.standardType
	}
	if(isNotUndefinedOrNull(param.name)){
		word += '&name=' + param.name
	}

	return request({
		url: '/woody/visualSupplementary/searchStickers?' + word,
		method: 'get'
	})
}
export function deleteSticker(param) {
	let word = ''

	if(isNotUndefinedOrNull(param.stickerId)){
		word += '&stickerId=' + param.stickerId
	}

	return request({
		url: '/woody/visualSupplementary/deleteSticker?' + word,
		method: 'delete'
	})
}
// =======================================贴图End============================================
// =======================================模板Start============================================
// 删除综合杆杆型模板
export function deletePoleTmpl(param) {
	let word = ''

	if(isNotUndefinedOrNull(param.templateId)){
		word += '&templateId=' + param.templateId
	}
	return request({
		url: '/woody/visualDesign/pole/deletePoleTmpl?' + word,
		method: 'delete'
	})
}
// =======================================贴图End============================================
// =======================================零部件模型Start============================================
// 保存模型
export function saveComponent(data) {
	return request({
		url: '/woody/visualMgr/component',
		method: 'post',
		data
	})
}
// 保存模型
export function delComponent(param) {

	let word = ''

	if(isNotUndefinedOrNull(param.componentId)){
		word += '&componentId=' + param.componentId
	}

	if(isNotUndefinedOrNull(param.partsType)){
		word += '&partsType=' + param.partsType
	}

	if(isNotUndefinedOrNull(param.rawMaterialFlag)){
		word += '&rawMaterialFlag=' + param.rawMaterialFlag
	}

	if(isNotUndefinedOrNull(param.belongPartsType)){
		word += '&belongPartsType=' + param.belongPartsType
	}

	if(isNotUndefinedOrNull(param.orgId)){
		word += '&orgId=' + param.orgId
	}

	console.log(word)
	return request({
		url: '/woody/visualMgr/component?' + word,
		method: 'delete'
	})
}
// 组件姿态编辑及插槽定义接口
export function aOrUDisassemblyRawMaterial(data) {
	return request({
		url: '/woody/visualMgr/addOrUpdateDisassemblyRawMaterial',
		method: 'post',
		data
	})
}

export function editDecoComponent(data) {
	return request({
		url: '/woody/visualMgr/editDecoratedComponent',
		method: 'post',
		data
	})
}
// =======================================零部件模型End============================================
// =======================================荷载Start============================================
// 删除综合杆杆型模板
export function calcPolePartLoad(param) {
	//console.log(param)
	let word =''
	let data = param.data
	if(isNotUndefinedOrNull(param.sourceType)){
		word += 'sourceType=' + param.sourceType
	}
	return request({
		url: '/woody/visual/calcPolePartLoad?' + word,
		method: 'post',
		data
	})
}
// =======================================荷载End============================================

//获取2F、3F id
export function get2F3F(){
	let word = 'typeIdList=' + [282];

	return request({
		url: '/woody/visualMgr/searchDicDetailList?' + word,
		method: 'get'
	})
}

export function addSticker(data){

	return request({
		url: '/woody/visualSupplementary/addOrUpdateSticker',
		method: 'post',
		data
	})
}

