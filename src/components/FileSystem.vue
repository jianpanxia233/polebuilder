<template>
	<div class="container" id="Left-Menu">
		<div class="v-box">
			<div class="topbar">
				<panel-switch-bar :Tabs="PanelTabs" :currentTab="'资源管理器'" :Width="PanelWidth" :Height="PanelHeight" />
			</div>
			<input style="display: none;" id="ProjectInput" type="file" accept="txt/*.pole" single
				@input="import_Project($event)">
			<input style="display: none;" id="FileSystemInput" type="file" accept="txt/*.pole" multiple
				@input="import_File($event)">
			<div class="scroll-container flex">
				<!-- <div class="listview-dark">
					<div class="form-container right gap">
						<div class="button-dark" @click="open_Project()">
							<a class="button-text">导入项目</a>
						</div>
						<div class="button-dark" @click="save_Project()">
							<a class="button-text">导出项目</a>
						</div>

					</div>
				</div> -->
				<div class="listview-dark">
					<div class="form-container right gap">
						<div class="button-dark" @click="new_Folder()">
							<svg class="button-icon-svg" viewBox="0 0 1024 1024" version="1.1"
								xmlns="http://www.w3.org/2000/svg">
								<path
									d="M928.426667 354.986667L213.333333 687.786667 102.4 450.56 781.653333 134.826667c20.48-10.24 44.373333 0 52.906667 18.773333l93.866667 201.386667z"
									opacity=".3"></path>
								<path
									d="M459.093333 262.826667l-6.826666-51.2c-1.706667-15.36-13.653333-25.6-29.013334-25.6H114.346667c-15.36 0-29.013333 13.653333-29.013334 29.013333v658.773333c0 15.36 13.653333 29.013333 29.013334 29.013334h795.306666c15.36 0 29.013333-13.653333 29.013334-29.013334V317.44c0-15.36-13.653333-29.013333-29.013334-29.013333H488.106667c-15.36 0-27.306667-10.24-29.013334-25.6z">
								</path>
							</svg>
							<a class="button-text">新建文件夹</a>
						</div>
					</div>
				</div>
				<div class="treeview-dark flex" @dblclick="dblclick_Blank()">
					<filetree-group :List="file" :OnlyFolder="false" :Drag="true" :Items="file" :Rename="rename"
						:Selected="selectedPath" @rightclick="rightclick" @doubleclick="doubleclick" @rename="on_Rename"
						@move="move" @click="click">
					</filetree-group>
				</div>
			</div>
		</div>
	</div>
</template>
<script>
	import PanelSwitchBar from './Sun/PanelSwitchBar'
	import FileTreeGroup from './Sun/FileTreeGroup'
	import * as FileSystem from './Sun/FileSystem'
	import { customLog, HTML } from './Utils.js'
	import staticData from './Sun/StaticData.js'
	import * as ShortCut from './Sun/ShortCut.js'
	import { getPartsByPoleCode } from '@/api/ThreeDimExhibition'
	import CryptoJS from "crypto-js";

	let copyPath = ''

	export default {
		mixins: [staticData],
		name: 'FileSystem',
		components: {
			'panel-switch-bar': PanelSwitchBar,
			'filetree-group': FileTreeGroup
		},
		props: {
			PanelTabs: {
				type: Array,
				default: () => {
					return [{ name: '资源管理器', panelid: 'FileSystemPanel' }]
				}
			},
			PanelWidth: {
				type: Number,
				default: 100
			},
			PanelHeight: {
				type: Number,
				default: 100
			}
		},
		static() {
			return {
				inputFilePath: ''
			}
		},
		data() {
			return {
				file: undefined,
				rename: '',
				selectedPath: '',
				listQuery: {
					presetPoleCode: 0,
					sourceType: 0,
					regionId: 0
				},
				newPoleList: []
			}
		},
		computed: {
		},
		watch: {
			file() {
				this.rename = ''
				this.selectedPath = ''
			}
		},
		methods: {
			open_Project() {
				FileSystem.open_Project().then((file) => {
					if (file === null) return
					FileSystem.load_Project(JSON.parse(file))
					this.file = FileSystem.ROOT.get_Object()
				})
				// document.getElementById('ProjectInput').click()
			},
			import_Project(event) {
				let files = event.target.files[0]
				let namelist = files.name.split('.')
				let that = this

				let type = namelist.slice(-1)[0].toLowerCase()

				if (type !== 'poledesign') {
					this.$EventBus.$emit('console_add_Output', "error", "导入项目 错误", "无法导入 " + HTML.create_KeyPair('文件', namelist[0], 'File')
						+ ' 类型为 ' + HTML.create_KeyPair('扩展名', type, 'String'))
					return
				}

				event.target.value = ''

				let reader = new FileReader()
				reader.readAsText(files, "UTF-8")
				reader.onload = function (evt) {
					let data = JSON.parse(evt.target.result)
					FileSystem.load_Project(data)
					that.file = FileSystem.ROOT.get_Object()
				}
			},
			import_File(event) {
				if (this.$static.inputFilePath === '') return
				let folder = FileSystem.ROOT.get(this.$static.inputFilePath)
				if (folder === null || folder.type !== 'folder') return


				for (let i = 0; i < event.target.files.length; i++) {
					let file = event.target.files[i]
					let namelist = file.name.split('.')
					let that = this

					let type = namelist.slice(-1)[0].toLowerCase()
					let name = namelist.slice(0, -1).join('.')



					if (!['pole', 'svg', 'stl'].includes(type)) {
						this.$EventBus.$emit('console_add_Output', "error", "导入文件 错误", "无法导入 " + HTML.create_KeyPair('文件', name, 'File')
							+ ' 类型为 ' + HTML.create_KeyPair('扩展名', type, 'String'))
						continue
					}

					if (type === 'stl') {
						let new_file
						let reader = new FileReader()
						reader.readAsArrayBuffer(file)
						reader.onload = function (evt) {
							folder.create_File(name, type, evt.target.result)
							that.file = FileSystem.ROOT.get_Object()
							// 无需拖拽入画布，直接展示
							new_file = that.file.list[that.file.list.length - 1]
							that.doubleclick(new_file)
						}
					}
					else {
						let reader = new FileReader()
						reader.readAsText(file)
						reader.onload = function (evt) {
							folder.create_File(name, type, evt.target.result)
							that.file = FileSystem.ROOT.get_Object()
						}
					}
				}
				event.target.value = ''
			},
			loadPole(item) {
				let that = this

				let param = {
					presetPoleCode: item.presetPoleCode,
					sourceType: item.sourceType === null ? 1 : item.sourceType,
					regionId: item.regionId,
					platFormId: 0
				}
				getPartsByPoleCode(param).then(response => {
					if (response.respCode === 0) {
						let poleList = FileSystem.ROOT.children;
						that.newPoleList = []
						poleList.forEach((pole) => {
							if (pole.presetPoleCode === item.presetPoleCode) {
								pole.data = JSON.stringify(response.returns)
							}
							that.newPoleList.push(pole)
						})
						that.$nextTick(() => {
							FileSystem.ROOT.children = that.newPoleList
						})
					}
				})
			},
			click(item) {
				this.selectedPath = item.path
				// 单击时加载模型文件
				if (typeof item.data === 'undefined' || item.data === null) {
					this.loadPole(item)
				}
			},
			dblclick_Blank() {
				if (this.rename !== '') {
					this.rename = ''
					return
				}
				else {
					this.selectedPath = ''
				}
			},
			doubleclick(item) {
				this.$EventBus.$emit('display_open_File', item)
			},
			rightclick(item) {
				// //console.log(item)
				if (item.type === 'file')
					this.$EventBus.$emit('contextmenu_open', 'filesystem', ['资源管理器右键菜单 - 文件', '-', { text: '克隆', icon: 'clone', action: 'filesystem_clone_File' }, '-', { text: '重命名文件', icon: 'blank', action: 'filesystem_begin_rename' }, '-', { text: '<a style="color: var(--ElementColorRed);">删除</a>', icon: 'delete', action: 'filesystem_delete' }], item, event.clientX, event.clientY)
				else if (item.type === 'folder')
					if (item.path.split('/').length !== 1)
						this.$EventBus.$emit('contextmenu_open', 'filesystem', ['资源管理器右键菜单 - 文件夹', '-', { text: '导入', icon: 'blank', action: 'filesystem_import_File', description: '导入单个文件' }, { text: '新建文件夹', icon: '资源管理器', action: 'filesystem_add_Folder' }, '-', { text: '远程加载', icon: 'blank', action: 'filesystem_import_RemoteFile', description: '远程加载文件' }, '-', { text: '重命名文件夹', icon: 'blank', action: 'filesystem_begin_rename' }/*, '-', { text: '新建', list: [{ text: '组件 .component', icon: 'blank', action: 'filesystem_create_File', data: 'component' }, { text: '合杆设计 .pole', icon: 'blank', action: 'filesystem_create_File', data: 'pole' }], first: 0 }*/, '-', { text: '<a style="color: var(--ElementColorRed);">删除</a>', icon: 'delete', action: 'filesystem_delete' }], item, event.clientX, event.clientY)
					else
						this.$EventBus.$emit('contextmenu_open', 'filesystem', ['资源管理器右键菜单 - 文件夹', '-', { text: '导入', icon: 'blank', action: 'filesystem_import_File', description: '导入单个文件' }, { text: '新建文件夹', icon: '资源管理器', action: 'filesystem_add_Folder' }, '-', { text: '远程加载', icon: 'blank', action: 'filesystem_import_RemoteFile', description: '远程加载文件' }, '-', { text: '重命名文件夹', icon: 'blank', action: 'filesystem_begin_rename' }/*, '-', { text: '新建', list: [{ text: '组件 .component', icon: 'blank', action: 'filesystem_create_File', data: 'component' }, { text: '合杆设计 .pole', icon: 'blank', action: 'filesystem_create_File', data: 'pole' }], first: 0 }*/], item, event.clientX, event.clientY)
			},
			on_Rename(path, name) {
				this.rename = ''
				this.$EventBus.$emit('filesystem_rename', path, name)
			},
			move(from, to) {
				this.$EventBus.$emit('filesystem_move', from.path, to.path)
			},
			save_Project() {
				FileSystem.save_Project()
			},
			new_Folder() {
				this.$EventBus.$emit('filesystem_add_Folder', { path: this.selectedPath })
			},
			shortcut_Copy(action) {
				let file = FileSystem.ROOT.get(this.selectedPath)
				if (file !== null && file.type === 'file') {
					copyPath = file.get_AbsolutePath()
				}
			},
			shortcut_Paste(action) {
				let folder = FileSystem.ROOT.get(this.selectedPath)
				if (folder !== null && folder.type === 'folder') {
					let pathto = folder.get_AbsolutePath()
					FileSystem.ROOT.copy(copyPath, pathto)
					this.file = FileSystem.ROOT.get_Object()
				}
			}
		},
		mounted() {
			this.file = FileSystem.ROOT.get_Object()

			// short cut
			ShortCut.bind_ShortCut('ctrl+c', 'copy', 'FileSystemPanel', this.shortcut_Copy)
			ShortCut.bind_ShortCut('ctrl+v', 'paste', 'FileSystemPanel', this.shortcut_Paste)

			// event
			this.$EventBus.$on('filesystem_delete', (data, args) => {
				FileSystem.ROOT.delete(data.path)
				this.file = FileSystem.ROOT.get_Object()
			})
			this.$EventBus.$on('filesystem_add_Folder', (data, args) => {
				let folder = FileSystem.ROOT.get(data.path)
				if (folder === null) return
				if (folder.type !== 'folder') {
					folder = folder.parent
				}
				folder.create_Folder('新建文件夹')
				this.file = FileSystem.ROOT.get_Object()
				return
			})
			this.$EventBus.$on('filesystem_add_File', (data, args) => {
				FileSystem.ROOT.write(data.path, data.data)
				this.file = FileSystem.ROOT.get_Object()
			})
			this.$EventBus.$on('filesystem_save_File', (data, path) => {
				FileSystem.ROOT.write(path, data)
				this.file = FileSystem.ROOT.get_Object()
			})
			this.$EventBus.$on('filesystem_save_File_Pole', (data, path, presetPoleCode, sourceType, regionId, name, poleId) => {
				FileSystem.ROOT.write(path, data)
				this.file = FileSystem.ROOT.get_Object_Pole(null, true, presetPoleCode, sourceType, regionId, name, poleId)
			})
			this.$EventBus.$on('filesystem_clone_File', (data, args) => {
				FileSystem.ROOT.clone(data.path)
				this.file = FileSystem.ROOT.get_Object()
			})
			this.$EventBus.$on('filesystem_begin_rename', (data, path) => {
				this.rename = data.path
			})
			this.$EventBus.$on('filesystem_rename', (path, name) => {
				if (FileSystem.ROOT.rename(path, name)) {
					this.file = FileSystem.ROOT.get_Object()
				}
			})
			this.$EventBus.$on('filesystem_move', (frompath, topath) => {
				if (FileSystem.ROOT.move(frompath, topath)) {
					this.file = FileSystem.ROOT.get_Object()
				}
			})
			this.$EventBus.$on('filesystem_import_File', (data) => {
				this.$static.inputFilePath = data.path
				document.getElementById('FileSystemInput').click()
			})
			this.$EventBus.$on('filesystem_import_RemoteFile', (data) => {
				let path = data.path
				this.$EventBus.$emit('app_open_Popup', 'pw-remote', 'app', '远程加载', 300, 400, true, true, true, { topath: path })
			})
			this.$EventBus.$on('filesystem_import_Project', () => {
				//console.log(">>>>>>>>>>")
				this.open_Project()
			})
			this.$EventBus.$on('filesystem_create_File', (item, data) => {
				switch (data) {
					case 'component': {
						let folder = FileSystem.ROOT.get(item.path).create_Folder('新建组件')
						folder.create_File('新建组件', 'component', '')
						break
					}
					case 'pole': {
						let folder = FileSystem.ROOT.get(item.path)
						folder.create_File('新建合杆设计', 'pole', '{"components": {}, "acrossMultiTransverseArm":{}}')
						break
					}
				}
				this.file = FileSystem.ROOT.get_Object()
			})
			this.$EventBus.$on('filesystem_save_SnapShot', (state, data, path) => {
				//console.log(">>>>>>>>>")
				let that = this
				//console.log(state, data, path)
				data.data.forEach((d, idx) => {
					this.$EventBus.$emit('filesystem_save_File', JSON.stringify(d), path.folderpath + '/' + path.name + (idx + 1) + '.' + path.filetype)
				})
			})
			this.$EventBus.$on('set_selectedPath', (path) => {
				this.selectedPath = path
			})
		},
		beforeDestroy() {
			this.$EventBus.$off('filesystem_delete')
			this.$EventBus.$off('filesystem_add_Folder')
			this.$EventBus.$off('filesystem_add_File')
			this.$EventBus.$off('filesystem_clone_File')
			this.$EventBus.$off('filesystem_begin_rename')
			this.$EventBus.$off('filesystem_rename')
			this.$EventBus.$off('filesystem_move')
			this.$EventBus.$off('filesystem_import_File')
			this.$EventBus.$off('filesystem_create_File')
			this.$EventBus.$off('filesystem_save_SnapShot')
		}
	}
</script>
<style scoped>

</style>
