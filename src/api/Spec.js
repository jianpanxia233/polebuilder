import request from '@/utils/request'
import CryptoJS from 'crypto-js'
import {isNotUndefinedOrNull} from './Common'

// 查询搭载设施规格信息 [部件上传界面]
export function getCarryEquipmentSpecsInfo(param) {
 let word =''

	if(isNotUndefinedOrNull(param.partsType)){
		word += '&partsType=' + param.partsType
	}

	return request({
			url: '/woody/visualMgr/getCarryEquipmentSpecsInfo?' + word,
			method: 'get'
		})
}

// 根据[非主杆]模型类型->级联查询其规格信息 [部件上传界面]
export function getSpecsInfoWithOutPrimaryPole(param) {
	let word =''

	if(isNotUndefinedOrNull(param.partsType)){
		word += '&partsType=' + param.partsType
	}

	return request({
		url: '/woody/visualMgr/getSpecsInfoWithOutPrimaryPole?' + word,
		method: 'get'
	})
}

// 根据零件类型->级联查询规格信息 [零件上传界面]
export function searchSpecsInfoByType(param) {
	let word =''

	if(isNotUndefinedOrNull(param.type)){
		word += '&type=' + param.type
	}

	if(isNotUndefinedOrNull(param.belongPartType)){
		word += '&belongPartType=' + param.belongPartType
	}

	if(isNotUndefinedOrNull(param.subType)){
		word += '&subType=' + param.subType
	}

	if(isNotUndefinedOrNull(param.standardType)){
		word += '&standardType=' + param.standardType
	}

	return request({
		url: '/woody/visualMgr/searchSpecsInfoByType?' + word,
		method: 'get'
	})
}
