import axios from 'axios'
import {
	MessageBox,
	Message
} from 'element-ui'
import store from '@/store'
// import {  getToken  } from '@/utils/auth'
import {
	setConfig
} from '@/assets/encryption/encryption'
import {
	info
} from '@/utils/common'

// create an axios instance
const service = axios.create({
  // baseURL: process.env.VUE_APP_BASE_API, // 测试
		baseURL: 'http://180.167.245.227:65516', // 仿真
  // baseURL: 'http://10.8.20.40:9000', // 仿真

  headers: {
    'Content-Type': 'application/json;charset=utf-8',
			 'access_grant_secret':'TaEeB6IowEQKq6GF'
  },
  // withCredentials: true, // send cookies when cross-domain requests
  timeout: 300000 // request timeout
})
// request interceptor
service.interceptors.request.use(
	config => {
		// do something before request is sent
		// let each request carry token
		// ['X-Token'] is a custom headers key
		// please modify it according to the actual situation
		// if (store.state.user.version === 1) {
		//   if (store.getters.token) {
		//     config.headers['X-Token'] = getToken()
		//     config.headers['Authorization'] = 'Bearer' + getToken()
		//   }
		// } else {
		config = setConfig(config)
		// }
		return config
	},
	error => {
		// do something with request error
		//console.log(error) // for debug
		return Promise.reject(error)
	}
)

// response interceptor
service.interceptors.response.use(
	/**
		* If you want to get http information such as headers or status
		* Please return  response => response
		*/

	/**
		* Determine the request status by custom code
		* Here is just an example
		* You can also judge the status by HTTP Status Code
		*/
	response => {
		// 导出
		const headers = response.headers
		if (headers['content-type'] === 'application/vnd.ms-excel' || headers['content-type'] === 'application/force-download') {
			return response
		}
		const res = response.data
		// 导出失败时，将blob转化成json
		if (res && res.type && res.type.includes('application/json')) {
			var reader = new FileReader()
			var resinfo = {}
			reader.onload = e => {
				if (e.target.readyState === 2) {
					resinfo = JSON.parse(e.target.result)
					Message({
						message: resinfo.message || resinfo.respMsg || 'Error',
						type: 'error',
						duration: 5 * 1000
					})
				}
			}
			reader.readAsText(response.data)
			return {
				respCode: -1
			}
		}
		// if the custom code is not 20000, it is judged as an error.
		if (res.access_token !== undefined) {
			return res
		} else if (res.code !== 20000 && res.respCode !== 0 && res.respCode !== 3000 && res.respCode !== 21022) {
			Message({
				message: res.message || res.respMsg || 'Error',
				type: 'error',
				duration: 5 * 1000
			})

			// 50008: Illegal token; 50012: Other clients logged in; 50014: Token expired;<-2 relogin
			if (res.code === 50008 || res.code === 50012 || res.code === 50014) {
				// to re-login
				MessageBox.confirm('You have been logged out, you can cancel to stay on this page, or log in again', 'Confirm logout', {
					confirmButtonText: 'Re-Login',
					cancelButtonText: 'Cancel',
					type: 'warning'
				}).then(() => {
					store.dispatch('user/resetToken').then(() => {
						// location.reload()
						info('请回到登录页面重新登陆', 'error')
					})
				})
			}
			if (res.respCode === -3 || res.respCode === -4 || res.respCode === -5) {
				info('login message error, please login again', 'error')
				store.dispatch('user/resetToken').then(() => {
					info('请回到登录页面重新登陆', 'error')
				})
			}
			const err = {
				error: new Error(res.respMsg || 'Error'),
				res
			}
			return Promise.reject(err)
		} else {
			return res
		}
	},
	error => {
		if (error.response && error.response.data.error === 'invalid_grant') {
			Message({
				message: '登录信息错误',
				type: 'error',
				duration: 5 * 1000
			})
		} else {
			//console.log('err' + error) // for debug
			// Message({
			//   message: error.message,
			//   type: 'error',
			//   duration: 5 * 1000
			// })
		}
		return Promise.reject(error)
	}
)

export default service
