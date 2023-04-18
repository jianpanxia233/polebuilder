import CryptoJS from 'crypto-js'
// import './jquery.min.js'
import {JSEncrypt} from 'jsencrypt'
import store from '@/store'
import {
	getToken
} from '@/utils/auth'

function log(url, data, key) {
	console.log('请求接口:', url, '| AesKey:', key, '| 加密之前的参数:', data)
}
// 接收一个参数和公钥，利用公钥加密参数
export function encryptedData(val, code) {
	if (val) {
		const encryptor = new JSEncrypt()
		encryptor.setPublicKey(code)
		return encryptor.encrypt(val)
	}
}
// 指定长度的获取key
export function getAesKey(len) {
	len = len || 32
	var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678' // 默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1
	var maxPos = $chars.length
	var keyStr = ''
	for (let i = 0; i < len; i++) {
		keyStr += $chars.charAt(Math.floor(Math.random() * maxPos))
	}
	return keyStr
}
// aes使用key加密数据
function encrypt(word, keyStr) {
	const key = CryptoJS.enc.Utf8.parse(keyStr)
	const srcs = CryptoJS.enc.Utf8.parse(word)
	const encrypted = CryptoJS.AES.encrypt(srcs, key, {
		mode: CryptoJS.mode.ECB,
		padding: CryptoJS.pad.Pkcs7
	})
	return encrypted.ciphertext.toString() // 输出二进制结果
	// return encrypted + '' // 输出base64结果
}

// aes使用key解密数据
// function decrypt(word, keyStr) {
//   const key = CryptoJS.enc.Utf8.parse(keyStr) // Latin1 w8m31+Yy/Nw6thPsMpO5fg==
//   // 如果加密后没有转成base64,那么先要转成base64再传入
//   const encryptedHexStr = CryptoJS.enc.Hex.parse(word) // 从二进制文本转成二进制
//   const messageBase64 = CryptoJS.enc.Base64.stringify(encryptedHexStr) // 转成base64
//   const decrypt = CryptoJS.AES.decrypt(messageBase64, key, {
//     mode: CryptoJS.mode.ECB,
//     padding: CryptoJS.pad.Pkcs7
//   })
//   // return CryptoJS.enc.Utf8.stringify(decrypt)
//   const decryptedStr = decrypt.toString(CryptoJS.enc.Utf8)
//   return decryptedStr.toString()
// }

export function setConfig(config) {
	const aesKey = getAesKey()
	let token = getToken()

	// if (config.url.includes('/sys/auth/user/login')) {
	// 	token = store.state.dataDictionary.publicKey
	// } else {
	// 	token = getToken()
	// }
	// if (!(config.url.includes('upload') && config.url.includes('File'))) {
	if (config.url.includes('?')) {
		const local = config.url.split('?')
		const urlList = local[0]
		log(urlList.split('/')[urlList.split('/').length - 1], local[1], aesKey)
		config.url = local[0] + '?param=' + encodeURIComponent(encrypt(local[1], aesKey))
	}
	// else {
		if (config.method.toLowerCase() !== 'get') {
		// 	const urlList = config.url
		// 	log(urlList.split('/')[urlList.split('/').length - 1], config.params, aesKey)
		// 	if (config.params !== undefined) {
		// 		let text = ''
		// 		for (const i in config.params) {
		// 			text += text.includes('?') ? `&${i}=${config.params[i]}` : `?${i}=${config.params[i]}`
		// 		}
		// 		const local = text.split('?')
		// 		config.url = config.url + '?param=' + encodeURIComponent(encrypt(local[1], aesKey))
		// 		config.params = {}
		// 	}
		// } else {
			// 如果是FormData类型，跳过加密
			if (Object.prototype.toString.call(config.data) !== '[object FormData]') {
				const urlList = config.url
				log(urlList.split('/')[urlList.split('/').length - 1], config.data, aesKey)
				let result
				if (config.headers['Content-Type'] === 'multipart/form-data') {
					result = config.data
				} else {
					result = JSON.stringify(config.data)
				}
				config.data = {
					param: encrypt(result, aesKey)
				}
			}
			// //console.log('解码结果：', decrypt(config.data.param, aesKey))
		}
	// }
	// 此处是增加的代码，设置请求头的类型
	// config.headers['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8'
	config.headers['access_token'] = token
	config.headers['access_key'] = encryptedData(aesKey, token)
	// if (config.method.toLowerCase() === 'get') config.data = {} // Axios will delete git's Content-Type and give an empty object if judgment to skip deletion.
	if (config.method.toLowerCase() === 'get' || config.method.toLowerCase() === 'delete') config.data = {}
	if (!config.data) config.data = {}
	// config.headers['Content-Type'] = 'application/json'
	return config
}
// export {
//     getAesKey,
//     encrypt,
//     encryptedData
// }
