import request from '@/utils/request'
import CryptoJS from 'crypto-js'
import {isNotUndefinedOrNull} from "@/api/Common";

// 根据项目id获取灯杆信息
export function getBundlePole(param) {
  const word = 'projectId=' + param.regionId +
    '&pageNum=' + param.pageNum +
    '&pageSize=' + param.pageSize;

		return request({
			url: '/woody/visual/getBundlePole?' + word,
			method: 'get'
		})
}

export function searchSchemeLogsByUnitEngineeringId(data) {

	return request({
		url: '/woody/visualDesign/snapshot/searchSchemeLogsByUnitEngineeringId',
		method: 'post',
		data
	})
}

// 自动拼接综合杆
export function getPartsByPoleCode(param) {
	let word = ''

	if(isNotUndefinedOrNull(param.presetPoleCode)){
		word += '&presetPoleCode=' + param.presetPoleCode
	}
	if(isNotUndefinedOrNull(param.sourceType)){
		word += '&sourceType=' + param.sourceType
	}
	if(isNotUndefinedOrNull(param.regionId)){
		word += '&regionId=' + param.regionId
	}
	if(isNotUndefinedOrNull(param.platFormId)){
		word += '&platFormId=' + param.platFormId
	}

	return request({
		url: '/woody/visual/getPartsByPoleCode?' + word,
		method: 'get'
	})
}

// 自动拼接综合设备箱
export function getPartsByEquipmentBoxCode(param) {
	let word = ''

	if(isNotUndefinedOrNull(param.boxCode)){
		word += '&boxCode=' + param.boxCode
	}

	return request({
		url: '/woody/visual/getPartsByEquipmentBoxCode?' + word,
		method: 'get'
	})
}
