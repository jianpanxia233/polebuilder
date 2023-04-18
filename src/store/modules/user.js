// import { login, logout, getInfo } from '@/api/user'
import { getToken, setToken, removeToken, getUser, setUser, removeUser } from '@/utils/auth'
// import router, { resetRouter } from '@/router'
// import { loadMenu } from '@/api/systemMana/baseMenuMger'
const state = {
  token: getToken(),
  // userId: '',
  // userName: '',
  // status: '',
  // orgId: '',
  // roles: [],
  // roleNames: [],
  // orgIds: [],
  // areaCodes: [],
  // version: 2, // 版本控制 1 旧版本 2 新版本
  // menuList: [], // caidan
  // name: '' // 用户姓名
}

const mutations = {
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  // SET_STATUS: (state, status) => {
  //   state.status = status
  // },
  // SET_USERID: (state, userId) => {
  //   state.userId = userId
  // },
  // SET_USERNAME: (state, userName) => {
  //   state.userName = userName
  // },
  // SET_ORGID: (state, orgId) => {
  //   state.orgId = orgId
  // },
  // SET_ROLES: (state, roleCode) => {
  //   state.roles = roleCode
  // },
  // SET_ROLENAMES: (state, roleNames) => {
  //   state.roleNames = roleNames
  // },
  // SET_ORGIDS: (state, orgIds) => {
  //   state.orgIds = orgIds
  // },
  // SET_AREACODES: (state, areaCodes) => {
  //   state.areaCodes = areaCodes
  // },
  // SET_MENU_LIST: (state, menuList) => {
  //   state.menuList = menuList
  // },
  // SET_NAME: (state, name) => {
  //   state.name = name
  // }
}

const actions = {
  // user login
  // login({ commit }, userInfo) {
  //   const { username, password } = userInfo
  //   // 无登录情况下
  //   // commit('SET_TOKEN', 'admin-token')
  //   return new Promise((resolve, reject) => {
  //     login({ username: username.trim(), password: password }).then(response => {
  //       const { returns } = response
  //       // token
  //       if (!returns.token) {
  //         reject('没有获取token值')
  //       }
  //       let accessToken
  //       state.version === 1 ? { accessToken } = returns.token : accessToken = returns.token
  //       commit('SET_TOKEN', accessToken)
  //       setToken(accessToken)
  //       returns.user && setUser(returns.user)
  //       resolve()
  //     }).catch(error => {
  //       reject(error)
  //     })
  //   })
  // },
		//
  // // get user info
  // getInfo({ commit, state }) {
  //   // var admin = {
  //   //   roles: ['admin'],
  //   //     introduction: 'I am a super administrator',
  //   //     avatar: 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif',
  //   //     name: 'Super Admin'
  //   // };
  //   // commit('SET_ROLES', admin.roles)
  //   // commit('SET_NAME', admin.name)
  //   // commit('SET_AVATAR', admin.ava/processManager/delayAudittar)
  //   // commit('SET_INTRODUCTION', admin.introduction)
  //   return new Promise((resolve, reject) => {
  //     if (state.version === 2) {
  //       const returns = getUser()
		//
  //       if (returns) {
  //         let { roleId, roleName, areaCode, userId, userName, orgId, name } = returns
  //         sessionStorage.setItem('roleId', roleId)
  //         const [roleIds, roleNames, orgIds, areaCodes] = [
  //           [],
  //           [],
  //           [],
  //           []
  //         ]
  //         roleId = roleId == null ? 2 : roleId
  //         roleName = roleName == null ? '系统管理员二号' : roleName
  //         areaCode = areaCode == null ? '310112' : areaCode
  //         orgId = orgId == null ? 2 : orgId
  //         roleIds.push(roleId)
  //         roleNames.push(roleName)
  //         orgIds.push(orgId)
  //         areaCodes.push(areaCode)
  //         commit('SET_ROLES', roleIds)
  //         commit('SET_ROLENAMES', roleNames)
  //         commit('SET_ORGIDS', orgIds)
  //         commit('SET_AREACODES', areaCodes)
  //         commit('SET_USERID', userId)
  //         commit('SET_USERNAME', userName)
  //         commit('SET_NAME', name)
  //         commit('SET_ORGID', orgId)
  //         const roleUser = {
  //           roleCode: roleIds
  //         }
  //         resolve(roleUser)
  //       } else {
  //         reject('Verification failed, please Login again.')
  //       }
  //     } else {
  //       getInfo(state.token).then(response => {
  //         const { returns } = response
  //         // 用户信息
  //         if (!returns.user) {
  //           reject('Verification failed, please Login again.')
  //         }
  //         const { roles, userId, userName, orgId } = returns.user
  //         // roles must be a non-empty array
  //         if (!roles || roles.length <= 0) {
  //           reject('getInfo: roles must be a non-null array!')
  //         }
  //         const roleIds = []
  //         const roleNames = []
  //         const orgIds = []
  //         const areaCodes = []
  //         roles.filter((v, i) => {
  //           roleIds.push(v.roleId)
  //           roleNames.push(v.roleName)
  //           orgIds.push(v.orgId)
  //           areaCodes.push(v.areaCode)
  //         })
  //         commit('SET_ROLES', roleIds)
  //         commit('SET_ROLENAMES', roleNames)
  //         commit('SET_ORGIDS', orgIds)
  //         commit('SET_AREACODES', areaCodes)
  //         commit('SET_USERID', userId)
  //         commit('SET_USERNAME', userName)
  //         commit('SET_ORGID', orgId)
  //         const roleUser = {
  //           roleCode: roleIds
  //         }
  //         resolve(roleUser)
  //       }).catch(error => {
  //         reject(error)
  //       })
  //     }
  //   })
  // },
		//
  // // user logout
  // logout({ commit, state }) {
  //   // commit('SET_TOKEN', '')
  //   // commit('SET_ROLES', [])
  //   // removeToken()
  //   return new Promise((resolve, reject) => {
  //     logout(state.token).then(() => {
  //       commit('SET_TOKEN', '')
  //       commit('SET_ROLES', [])
  //       removeToken()
  //       removeUser()
  //       resetRouter()
  //       resolve()
  //     }).catch(error => {
  //       reject(error)
  //     })
  //   })
  // },
		//
  // // 未在原框架下修改，若使用到则需要修改
  // // remove token
  // resetToken({ commit }) {
  //   return new Promise(resolve => {
  //     commit('SET_TOKEN', '')
  //     commit('SET_ROLES', [])
  //     removeToken()
  //     removeUser()
  //     resolve()
  //   })
  // },
		//
  // // 未在原框架下修改，若使用到则需要修改
  // // dynamically modify permissions
  // changeRoles({ commit, dispatch }, role) {
  //   return new Promise(async resolve => {
  //     const token = role + '-token'
		//
  //     commit('SET_TOKEN', token)
  //     setToken(token)
  //     const { roles } = await dispatch('getInfo')
		//
  //     resetRouter()
		//
  //     // generate accessible routes map based on roles
  //     const accessRoutes = await dispatch('permission/generateRoutes', roles, { root: true })
		//
  //     // dynamically add accessible routes
  //     router.addRoutes(accessRoutes)
		//
  //     // reset visited views and cached views
  //     dispatch('tagsView/delAllViews', null, { root: true })
		//
  //     resolve()
  //   })
  // },
  // getChangeRoles({ commit }, parms) {
  //   return new Promise(async resolve => {
  //     const res = await loadMenu(parms)
  //     if (res.respCode === 0) {
  //       // commit('SET_MENU_LIST', res.returns.menu)
  //     }
  //     resolve(res)
  //   })
  // }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
