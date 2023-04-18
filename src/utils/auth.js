import Cookies from 'js-cookie'
// 内网token user
const TokenKey = 'Admin-Token'
const UserKey = 'Admin-User'

export function getToken() {
	if(!Cookies.get(TokenKey)){
		return 'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCmOPICLOzNSRMjcwWbtO+/a4hc2i87Iov3p5Sfky0u75Wt5Kycb4BOhurZWQnx453yN+u8ljBV4HfEResUcgDdPnNy281EIJbAOIz39pknTBuJzAmqM6atmZKrJVfOxZIMnNRDgWu4fsvpPqgsQWc5NaCdMreIE5Z5JyrbgA94ewIDAQAB'
	}
  return Cookies.get(TokenKey)
}

export function setToken(token) {
  return Cookies.set(TokenKey, token)
}

export function removeToken() {
  return Cookies.remove(TokenKey)
}

export function getUser() {
  return JSON.parse(Cookies.get(UserKey))
}

export function setUser(user) {
  return Cookies.set(UserKey, JSON.stringify(user))
}

export function removeUser() {
  return Cookies.remove(UserKey)
}
