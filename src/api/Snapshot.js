import request from '@/utils/request'
import CryptoJS from 'crypto-js'
import {isNotUndefinedOrNull} from './Common'

// 查询搭载设施规格信息 [部件上传界面]
export function searchLogs(data) {
 // let word =''
	//
	// if(isNotUndefinedOrNull(param.poleId)){
	// 	word += 'poleId=' + param.poleId
	// }

	return request({
			url: '/woody/visualDesign/snapshot/searchLogs' ,
			method: 'post',
		data
		})
}

// 保存or编辑纹理贴图流水信息
export function addOrUpdateSticker(data) {
	return request({
		url: '/woody/visualSupplementary/addOrUpdateSticker',
		method: 'post',
		data
	})
}
