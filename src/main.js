// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import axios from 'axios'
import md5 from 'js-md5'
import Cookies from 'js-cookie'
import * as Extensions from './components/Sun/Extensions.js'
// import VueCodeMirror from 'vue-codemirror'
// import 'codemirror/lib/codemirror.css'

document.oncontextmenu = () => { return false }
// Vue.use(VueCodeMirror)

Vue.prototype.$axios = axios
Vue.config.productionTip = false
Vue.prototype.$md5 = md5
Vue.prototype.$Cookies = Cookies

Vue.directive('focus', {
	inserted: function (el) {
		el.focus()
	}
})

// 事件总线
var eventbus = new Vue()
Vue.prototype.$EventBus = eventbus

/* eslint-disable no-new */
var vm = new Vue({
	el: '#app',
	components: { App },
	template: '<App ref="App"/>'
})

Extensions.init(eventbus, vm.$refs.App)

new Extensions.Extension((Utils, ModuleSlot, FileSystem, SaveAs, WindowEnv) => {
	return {
		init: function (ctx) {
			// console.log("System Call Init")
			ctx.data.Layout = {}
			ctx.add_Action('删除子组装树', 'delete', 'delete', '', 'moduleuid')
			ctx.add_Action('加载', 'load', 'clone', '', 'poleid')
			ctx.add_Action('比较', 'diff', 'clone', '', 'poleid-1 poleid-2')
			ctx.add_Action('转换为父级组装树', 'convert_Local', '大纲', '', '*use selected module as base tree*')
			ctx.add_ShortCut("ctrl+s", "save", "CanvasPanel", "保存sceneTree👉Console")
			ctx.add_Action('保存sceneTree👉Console', 'save', 'pole', 'ctrl+s', '*sceneTree*')
			ctx.add_Action('保存sceneTree模型', 'save_STL', 'pole', '', '[-b binary]')
			ctx.add_Action('Print World Rotation Y', 'print_RY', 'pole', '', '')
			ctx.add_Action('保存布局', 'save_Layout', 'clone', '', 'layout_name')
			ctx.add_Action('加载布局', 'load_Layout', 'clone', '', 'layout_name')
			ctx.add_Action('切换面板', 'switch_Panel', 'clone', '', 'layout_name *')
			ctx.add_Action('TEST', 'test', 'blank', '', '')
		},
		print_RY(ctx, args) {
			let that = ctx.get_Panel('Canvas')
			let $static = that.$static
			if ($static.Scene !== null && $static.Editor === 'pole') {
				let module = $static.Scene.context.selectedModule
				if (module !== null) {
					let ans = module.get_WorldRotationY()
					ctx.info(`World Rotation Y of ${ModuleSlot.Module.get_StyledHTML(module)} is ${ans}`)
				}
			}
		},
		delete(ctx, args) {
			let uid = null
			let that = ctx.get_Panel('Canvas')
			console.log(that)
			let $static = that.$static

			if (args[0]) uid = BigInt(parseInt(args[0]))
			else {
				if ($static.Scene !== null && $static.Editor === 'pole')
					uid = $static.Scene.context.selectedModule ? $static.Scene.context.selectedModule.uid : null
			}

			if ($static.Scene !== null && $static.Editor === 'pole') {
				if (uid !== null) {
					$static.EditorMap[$static.Editor].delete_Module.call(that, uid)
				}
			}
		},
		save_Layout(ctx, args) {
			let that = ctx.get_Panel()
			if (args[0] === undefined) return;
			ctx.data.Layout[args[0]] = that.Layout.save_Layout()
		},
		load_Layout(ctx, args) {
			let that = ctx.get_Panel()
			if (args[0] === undefined) {
				that.change_Page()
			};
			if (ctx.data.Layout[args[0]] === undefined) return;
			that.Layout.load_Layout(ctx.data.Layout[args[0]])
			that.Layout.refresh_Layout();
		},
		switch_Panel(ctx, args) {
			let that = ctx.get_Panel()
			args.forEach((id) => {
				let panel = that.Layout.get_Panel_by_ID(id)
				if (panel === null) return;
				panel.set_Visible(!panel.visible)
			})
			that.Layout.refresh_Layout()
		},
		save(ctx, args) {
			let that = ctx.get_Panel('Canvas')
			let $static = that.$static

			if ($static.Scene !== null && $static.Editor === 'pole') {
				let ans = $static.Scene.base.get_Children()[0].ReduceLayer((ans, current, layer) => {
					let sub = {
						sid: current.connectedslot.id,
						cid: current.componentid,
						gid: current.groupid,
						uid: (current.uid).toString(),
						isInGroup: current.is_InGroup(),
						relative: current.relatetoorigin,
						position: [current.slotmodifier.position.x, current.slotmodifier.position.y, current.slotmodifier.position.z],
						rotation: [current.slotmodifier.rotation.x, current.slotmodifier.rotation.y, current.slotmodifier.rotation.z],
						link: current.linkslotlist.map((i) => {
							return {
								uid: (i.belong.uid).toString(),
								sid: i.id
							}
						}),
						subs: [],
					}
					ans.subs.push(sub)
					return sub
				}, undefined, { subs: [] })
				console.log(JSON.stringify(ans.subs[0], null, 2));
			}
		},
		load(ctx, args) {
			if (args[0]) {
				let aeskey = 'fSQDFy2ca7MeWc6YBXPQse86FJHTYTPn'
				let PublicKey = 'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCmOPICLOzNSRMjcwWbtO+/a4hc2i87Iov3p5Sfky0u75Wt5Kycb4BOhurZWQnx453yN+u8ljBV4HfEResUcgDdPnNy281EIJbAOIz39pknTBuJzAmqM6atmZKrJVfOxZIMnNRDgWu4fsvpPqgsQWc5NaCdMreIE5Z5JyrbgA94ewIDAQAB'
				let word = 'presetPoleCode=' + args[0] + '&sourceType=1&regionId=2&platFormId=0'

				const encrypted = ctx.crypto(aeskey, word)

				let that = this

				fetch('http://180.167.245.227:65516/woody/visual/getPartsByPoleCode?param=' + encrypted.ciphertext.toString(), {
					method: 'GET',
					headers: {
						'access_key': 'ZN193CkJqwo7FJ0TnCyjVe/z0AYevc32oD8fONk1fH8XvTAs8uVtRWhcPK+uwDFSU/GVDc9ASuOlpfYoxj1AVutb393iLNKQJBrZ6car08QtNzISrMDvLr0SkXBfZBbMG0auPK1DFdcZVzjgGMrd4QUkHKSFLgbZL20pLQmKgpg=',
						'access_token': PublicKey,
						'Content-Type': 'application/json'
					}
				})
					.then(function (response) {
						return response.json()
					})
					.then(function (Json) {
						// console.log(Json)
						if (Json.respCode === 0) {
							// console.log(Json.returns)
							ctx.eventbus.$emit('app_open_Popup', 'pw-file-system-dialogue', 'remote', '保存', 1000, 800, true, true, true, { path: FileSystem.ROOT.name, savetype: 'pole', data: JSON.stringify(Json.returns), savename: '合杆' + args[0] })
						}
						else {
							ctx.error("在 <请求数据> 出现了如下错误: " + Utils.HTML.create_KeyPair('错误', Json.respMsg, "String"))
						}
					});

			}
			else {
				ctx.eventbus.$emit('app_open_Popup', 'pw-remote', 'app', '远程加载', 300, 400, true, true, true, {})
			}
		},
		convert_Local(ctx, args) {
			let that = ctx.get_Panel('Canvas')
			let $static = that.$static

			if ($static.Scene !== null && $static.Editor === 'pole') {
				let module = $static.Scene.context.selectedModule === null ? $static.Scene.base : $static.Scene.context.selectedModule
				if (module !== null) {
					module.Traverse((m) => {
						ModuleSlot.Module.convert_to_Local(m)
					})
					$static.EditorMap['pole'].refresh_Tree($static.Scene.base)
					ctx.log(Utils.HTML.create_KeyPair('操作', '转换为父级组装树', 'String') + ' 完成')
				}
			}
		},
		save_STL(ctx, args) {
			let that = ctx.get_Panel('Canvas')
			let $static = that.$static
			if (!($static.Scene !== null && $static.Editor === 'pole')) return
			args = args.map((i) => { return i.toLowerCase() })
			let bin = false
			if (args.includes('-b')) bin = true

			let root = $static.Scene.base.get_Children()[0]
			if (root !== undefined) {
				let save = root.export_STL(bin)
				console.log(save)
				let file
				if (bin) {
					file = new Blob([save]);
				}
				else {
					file = new Blob([save], { type: "text/plain;charset=utf-8" });
				}
				ctx.log(Utils.HTML.create_KeyPair('操作', '导出STL模型', 'String') + ' 完成')
				saveAs(file, "hello world.stl");
			}
			else {
				ctx.error(Utils.HTML.create_KeyPair('操作', '导出STL模型', 'String') + ' 失败，场景中无可导出的组装树')
			}
		},
		async test() {
			let ans = await WindowEnv.show_Form('pf-confirm', {}, {}, 'ceshi', undefined)
			alert(ans)
		},
		diff(ctx, args) {
			function _diff(_a, _b) {
				_a.Update()
				_b.Update()
				_a.Traverse((a) => {
					console.log(a.name, a.world_position)
				})
				let a = _a.ReduceLayer((ans, current, layer) => {
					let sub = {
						cid: current.componentid,
						gid: current.groupid,
						uid: (current.uid).toString(),
						module: current,
						matched: false,
						name: current.name,
						isInGroup: current.is_InGroup(),
						relative: current.relatetoorigin,
						worldPositon: [current.world_position.x, current.world_position.y, current.world_position.z],
						worldRotation: [current.world_rotation.x, current.world_rotation.y, current.world_rotation.z],
						position: [current.slotmodifier.position.x, current.slotmodifier.position.y, current.slotmodifier.position.z],
						rotation: [current.slotmodifier.rotation.x, current.slotmodifier.rotation.y, current.slotmodifier.rotation.z],
						link: current.linkslotlist.map((i) => {
							return {
								uid: (i.belong.uid).toString(),
								sid: i.id
							}
						}),
						subs: [],
					}
					ans.subs.push(sub)
					return sub
				}, undefined, { subs: [], root: true })
				let b = _b.ReduceLayer((ans, current, layer) => {
					let sub = {
						cid: current.componentid,
						gid: current.groupid,
						module: current,
						name: current.name,
						matched: false,
						uid: (current.uid).toString(),
						isInGroup: current.is_InGroup(),
						relative: current.relatetoorigin,
						worldPositon: [current.world_position.x, current.world_position.y, current.world_position.z],
						worldRotation: [current.world_rotation.x, current.world_rotation.y, current.world_rotation.z],
						position: [current.slotmodifier.position.x, current.slotmodifier.position.y, current.slotmodifier.position.z],
						rotation: [current.slotmodifier.rotation.x, current.slotmodifier.rotation.y, current.slotmodifier.rotation.z],
						link: current.linkslotlist.map((i) => {
							return {
								uid: (i.belong.uid).toString(),
								sid: i.id
							}
						}),
						subs: [],
					}
					ans.subs.push(sub)
					return sub
				}, undefined, { subs: [], root: true })

				function has(a, b, cmp) {
					for (let i = 0; i < a.length; i++) {
						let ans = cmp(a[i], b);
						if (ans) return [true, a[i]];
					}
					return [false, undefined];
				}
				function interset(a, b, cmp) {
					let ans = [];
					for (let i = 0; i < b.length; i++) {
						let [h, n] = has(a, b[i], cmp);
						if (h) {
							n.matched = true;
							b[i].matched = true;
							console.log(a)
							ans.push([n, b[i]]);
						}
					}
					return ans;
				}
				let res = [];
				function getLayer(num) {
					let str = '';
					for (let i = 0; i < num; i++) {
						str += "" + Utils.HTML.create_Tab();
					}
					return str + "+  ";
				}
				const cmpfunc = (a, b) => {
					return !a.matched && a.cid === b.cid;
				}
				function cmp(roota, rootb, layer = -1) {
					if (roota.root !== true && rootb.root !== true) {
						if (roota.worldPositon[0] === rootb.worldPositon[0]
							&& roota.worldPositon[1] === rootb.worldPositon[1]
							&& roota.worldPositon[2] === rootb.worldPositon[2]
							&& roota.worldRotation[0] === rootb.worldRotation[0]
							&& roota.worldRotation[1] === rootb.worldRotation[1]
							&& roota.worldRotation[2] === rootb.worldRotation[2]) {
							res.push(getLayer(layer) + ModuleSlot.Module.get_StyledHTML(roota.module))
						}
						else {
							res.push(getLayer(layer) + ModuleSlot.Module.get_StyledHTML(roota.module) + " " + Utils.HTML.create_Strong("CHG", "blue") + " " + Utils.HTML.create_KeyPair("位置", `${roota.worldPositon[0]},${roota.worldPositon[1]},${roota.worldPositon[2]} -> ${rootb.worldPositon[0]},${rootb.worldPositon[1]},${rootb.worldPositon[2]}`, "String") + " " + Utils.HTML.create_KeyPair("旋转", `${roota.worldRotation[0]},${roota.worldRotation[1]},${roota.worldRotation[2]} -> ${rootb.worldRotation[0]},${rootb.worldRotation[1]},${rootb.worldRotation[2]}`, "String"))
						}
					}

					roota.subs.forEach((a) => {
						a.matched = false;
					})
					rootb.subs.forEach((a) => {
						a.matched = false;
					})
					let samesubs = interset(roota.subs, rootb.subs, cmpfunc)

					roota.subs.filter((a) => {
						return !a.matched
					}).forEach((a => {
						// res.push(getLayer(layer) + " " + Utils.HTML.create_Strong("DEL", "red") + " " + ModuleSlot.Module.get_StyledHTML(a.module))
						a.module.Traverse((m, l) => {
							res.push(getLayer(l + layer + 1) + " " + Utils.HTML.create_Strong("DEL", "red") + " " + ModuleSlot.Module.get_StyledHTML(m))
						})
					}))
					samesubs.forEach((i) => {
						cmp(i[0], i[1], layer + 1)
					})
					rootb.subs.filter((a) => {
						return !a.matched
					}).forEach((a => {
						// res.push(getLayer(layer) + " " + Utils.HTML.create_Strong("ADD", "rgb(29 155 34)") + " " + ModuleSlot.Module.get_StyledHTML(a.module))
						a.module.Traverse((m, l) => {
							res.push(getLayer(l + layer + 1) + " " + Utils.HTML.create_Strong("ADD", "rgb(29 155 34)") + " " + ModuleSlot.Module.get_StyledHTML(m))
						})
					}))

				}
				cmp(a, b)
				ctx.info(res.join("</br>"))
			}

			if (args[0] && args[1]) {
				let aeskey = 'fSQDFy2ca7MeWc6YBXPQse86FJHTYTPn'
				let PublicKey = 'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCmOPICLOzNSRMjcwWbtO+/a4hc2i87Iov3p5Sfky0u75Wt5Kycb4BOhurZWQnx453yN+u8ljBV4HfEResUcgDdPnNy281EIJbAOIz39pknTBuJzAmqM6atmZKrJVfOxZIMnNRDgWu4fsvpPqgsQWc5NaCdMreIE5Z5JyrbgA94ewIDAQAB'
				let word = 'presetPoleCode=' + args[0] + '&sourceType=1&regionId=2&platFormId=0'

				const encrypted = ctx.crypto(aeskey, word)
				let word2 = 'presetPoleCode=' + args[1] + '&sourceType=1&regionId=2&platFormId=0'

				const encrypted2 = ctx.crypto(aeskey, word2)

				let that = this

				Promise.all([
					fetch('http://180.167.245.227:65516/woody/visual/getPartsByPoleCode?param=' + encrypted.ciphertext.toString(), {
						method: 'GET',
						headers: {
							'access_key': 'ZN193CkJqwo7FJ0TnCyjVe/z0AYevc32oD8fONk1fH8XvTAs8uVtRWhcPK+uwDFSU/GVDc9ASuOlpfYoxj1AVutb393iLNKQJBrZ6car08QtNzISrMDvLr0SkXBfZBbMG0auPK1DFdcZVzjgGMrd4QUkHKSFLgbZL20pLQmKgpg=',
							'access_token': PublicKey,
							'Content-Type': 'application/json'
						}
					})
						.then(function (response) {
							return response.json()
						}),
					fetch('http://180.167.245.227:65516/woody/visual/getPartsByPoleCode?param=' + encrypted2.ciphertext.toString(), {
						method: 'GET',
						headers: {
							'access_key': 'ZN193CkJqwo7FJ0TnCyjVe/z0AYevc32oD8fONk1fH8XvTAs8uVtRWhcPK+uwDFSU/GVDc9ASuOlpfYoxj1AVutb393iLNKQJBrZ6car08QtNzISrMDvLr0SkXBfZBbMG0auPK1DFdcZVzjgGMrd4QUkHKSFLgbZL20pLQmKgpg=',
							'access_token': PublicKey,
							'Content-Type': 'application/json'
						}
					})
						.then(function (response) {
							return response.json()
						})
				]).then(function (value) {
					if (value[0].respCode !== 0 || value[1].respCode !== 0) {
						ctx.error("在 <请求数据> 出现了如下错误: " + Utils.HTML.create_KeyPair('错误', value[0].respMsg, "String") + " " + Utils.HTML.create_KeyPair('错误', value[1].respMsg, "String"))
						return
					}
					console.log(value)
					_diff(ModuleSlot.create_Tree_from_PoleJson(value[0].returns.components, value[0].returns.acrossMultiTransverseArm, null).tree, ModuleSlot.create_Tree_from_PoleJson(value[1].returns.components, value[1].returns.acrossMultiTransverseArm, null).tree)
				}, () => {
					ctx.error("在 <请求数据> 出现了错误")
				})
			}

			else if (args[0]) {
				let that = ctx.get_Panel('Canvas')
				let $static = that.$static
				let b = null

				if ($static.Scene !== null && $static.Editor === 'pole')
					b = $static.Scene.base.get_Children()[0]
				else
					return

				let aeskey = 'fSQDFy2ca7MeWc6YBXPQse86FJHTYTPn'
				let PublicKey = 'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCmOPICLOzNSRMjcwWbtO+/a4hc2i87Iov3p5Sfky0u75Wt5Kycb4BOhurZWQnx453yN+u8ljBV4HfEResUcgDdPnNy281EIJbAOIz39pknTBuJzAmqM6atmZKrJVfOxZIMnNRDgWu4fsvpPqgsQWc5NaCdMreIE5Z5JyrbgA94ewIDAQAB'
				let word = 'presetPoleCode=' + args[0] + '&sourceType=1&regionId=2&platFormId=0'

				const encrypted = ctx.crypto(aeskey, word)

				fetch('http://180.167.245.227:65516/woody/visual/getPartsByPoleCode?param=' + encrypted.ciphertext.toString(), {
					method: 'GET',
					headers: {
						'access_key': 'ZN193CkJqwo7FJ0TnCyjVe/z0AYevc32oD8fONk1fH8XvTAs8uVtRWhcPK+uwDFSU/GVDc9ASuOlpfYoxj1AVutb393iLNKQJBrZ6car08QtNzISrMDvLr0SkXBfZBbMG0auPK1DFdcZVzjgGMrd4QUkHKSFLgbZL20pLQmKgpg=',
						'access_token': PublicKey,
						'Content-Type': 'application/json'
					}
				})
					.then(function (response) {
						return response.json()
					})
					.then(function (value) {
						if (value.respCode !== 0) {
							ctx.error("在 <请求数据> 出现了如下错误: " + Utils.HTML.create_KeyPair('错误', value.respMsg, "String"))
							return
						}
						_diff(ModuleSlot.create_Tree_from_PoleJson(value.returns.components, value.returns.acrossMultiTransverseArm, null).tree, b)
					}, () => {
						ctx.error("在 <请求数据> 出现了错误")
					})
			}
		}
	}
}, 'System', '1.0.0', 'Sun', 'System Call')