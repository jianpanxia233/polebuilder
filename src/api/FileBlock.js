import request from '@/utils/request'
import CryptoJS from 'crypto-js'
import {isNotUndefinedOrNull} from './Common'

// 上传文件
export function uploadFileBlock(data) {
	return request({
			url: '/extBiz/fileBlock/uploadFileBlock',
			method: 'post',
		 data
		})
}

// 上传文件
export function deleteFile(param) {
	let word = ''

	if(isNotUndefinedOrNull(param.groupPath)){
		word += '&groupPath=' + param.groupPath
	}

	if(isNotUndefinedOrNull(param.operationChannel)){
		word += '&operationChannel=' + param.operationChannel
	}

	return request({
		url: '/extBiz/file/deleteFile?' + word,
		method: 'delete'
	})
}
