import request from '@/utils/request'
import CryptoJS from 'crypto-js'
import {isNotUndefinedOrNull} from './Common'

// 跨多横臂设施模型id维护接口
export function searchDicDetailList(param) {
 let word =''

	if(isNotUndefinedOrNull(param.typeIdList)){
		word += '&typeIdList=' + param.typeIdList
	}

	return request({
			url: '/woody/visualMgr/searchDicDetailList?' + word,
			method: 'get'
		})
}
