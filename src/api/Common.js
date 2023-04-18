// 根据项目id获取灯杆信息
export function isNotUndefinedOrNull(param) {
		if(typeof param != 'undefined' && param != null){
			return true
		}
		return false
}
