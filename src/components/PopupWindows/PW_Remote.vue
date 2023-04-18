<template>
	<div style="width: 100%; height: 100%; position: relative;">
		<div class="container full" style="border-radius: 0 0 var(--ContainerRadius) var(--ContainerRadius);">
			<div class="v-box">
				<div class="scroll-container flex">
					<div class="listview-dark">
						<div class="form-container hbuttonlist">
							<div class="button-dark left flex" :class="{'selected': selectClass === '综合杆'}"
								@click="selectClass = '综合杆'">
								<a class="button-text">综合杆</a>
							</div>
							<div class="button-dark right flex" :class="{'selected': selectClass === '历史版本'}"
								@click="selectClass = '历史版本'">
								<a class="button-text">历史版本</a>
							</div>
						</div>
					</div>
					<template v-if="selectClass === '综合杆'">
						<div class="title1-dark">综合杆</div>
						<div class="listview-dark">
							<div class="form-container gap">
								<div class="form-container" style="min-width: 90px; max-width: 90px;">
									<div class="title-dark" style="text-align: left; word-break: break-all;">PoleId
									</div>
								</div>
								<div class="form-container">
									<input class="lineedit-dark" style="flex: 1; min-width: 50px; height: auto;"
										v-model="pole_PoleId" />
								</div>
							</div>
						</div>
						<div class="listview-dark">
							<div class="form-container right gap">
								<div class="button-dark" @click="load_Pole()">
									<svg class="button-icon-svg" viewBox="0 0 115 115"
										xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
										overflow="hidden">
										<g transform="translate(-534 -322)">
											<path d="M551 379.832 585.727 409 632 345" stroke-width="9"
												stroke-miterlimit="8" fill="none" fill-rule="evenodd" />
										</g>
									</svg>
									<a class="button-text">加载</a>
								</div>
							</div>
						</div>
					</template>
					<template v-else-if="selectClass === '历史版本'">
						<div class="title1-dark">历史版本</div>
						<div class="listview-dark">
							<div class="form-container gap">
								<div class="form-container" style="min-width: 90px; max-width: 90px;">
									<div class="title-dark" style="text-align: left; word-break: break-all;">PoleId
									</div>
								</div>
								<div class="form-container">
									<input class="lineedit-dark" style="flex: 1; min-width: 50px; height: auto;"
										v-model="history_PoleId" />
								</div>
							</div>
						</div>
						<div class="listview-dark">
							<div class="form-container right gap">
								<div class="button-dark" @click="load_History()">
									<svg class="button-icon-svg" viewBox="0 0 115 115"
										xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
										overflow="hidden">
										<g transform="translate(-534 -322)">
											<path d="M551 379.832 585.727 409 632 345" stroke-width="9"
												stroke-miterlimit="8" fill="none" fill-rule="evenodd" />
										</g>
									</svg>
									<a class="button-text">加载</a>
								</div>
							</div>
						</div>
					</template>
					<template v-if="error !== ''">
						<div class="listview-dark"
							style="border-radius: var(--ObjectRadius); background-color: rgb(221, 59, 59); color: white; text-align: left; z-index: 1; height: fit-content; pointer-events: all; line-height: 2; padding: 2px 6px;"
							v-html="error">
						</div>
					</template>
				</div>

			</div>
		</div>
	</div>
</template>
<script>
	import * as FileSystem from '../Sun/FileSystem'
	import CryptoJS from 'crypto-js'
	import { customLog, HTML, radius_to_degree, degree_to_radius, to_PoleAngle, get_NearPoleAngle, get_AngleBetween } from '../Utils.js'
	import { getPartsByPoleCode } from '@/api/ThreeDimExhibition'
	import { searchLogs } from '@/api/Snapshot'


	export default {
		name: 'PW_Remote',
		components: {
		},
		props: {
			PopupSize: {
				type: Object,
				default: () => { return { width: 0, height: 0 } }
			},
			PopupShowHide: {
				type: Boolean,
				default: () => { return false }
			},
			Parent: {
				type: String,
				default: ''
			},
			Input: {
				type: Object,
				default: () => {
					return {
						title: 'Title',
						description: 'description'
					}
				}
			}
		},
		data() {
			return {
				selectClass: '综合杆',

				pole_PoleId: '',
				history_PoleId: '',

				error: ''
			}
		},
		computed: {
		},
		watch: {
		},
		activated() {
		},
		deactivated() {
		},
		methods: {
			confirm() {
				if (this.selectId === -1) return
				if (this.Input.action[0] === '@') {
					this.$EventBus.$emit(this.Parent + '_PopupWindow', this.Input.action.slice(1), { specsId: this.selectId, specsName: this.selectName })
				}
				else {
					this.$EventBus.$emit(this.Input.action, { specsId: this.selectId, specsName: this.selectName })
				}
				this.$EventBus.$emit('app_close_Popup')
			},
			load_Pole() {
				this.error = ''
				let that = this
				let param = {
					presetPoleCode: that.pole_PoleId,
					sourceType: 1,
					regionId: 2,
					platFormId: 0
				}
				getPartsByPoleCode(param).then(response => {
					// //console.log(Json)
					if (response.respCode === 0) {
						console.log(JSON.stringify(response.returns, null, 2))
						//console.log(response.returns)
						that.$EventBus.$emit('app_open_Popup', 'pw-file-system-dialogue', 'remote', '保存', 1000, 800, true, true, true, { path: (this.Input && this.Input.topath !== undefined) ? this.Input.topath : FileSystem.ROOT.name, savetype: 'pole', data: JSON.stringify(response.returns), savename: '合杆' + that.pole_PoleId })
					}
					else {
						that.error = ("在 <请求数据> 出现了如下错误: " + HTML.create_KeyPair('错误', response.respMsg, "String"))
					}
				})
				.catch(err => {
					that.error = ("在 <请求数据> 出现了如下错误: " + HTML.create_KeyPair('错误', err.res.respMsg, "String"))
				});

			},
			load_History() {
				this.error = ''
				let that = this
				let param = {
					facilityId: that.history_PoleId
				}

				searchLogs(param).then(response => {
					// //console.log(Json)
					if (response.respCode === 0 && response.returns !== null) {
						console.log(response)
						that.$EventBus.$emit('app_open_Popup', 'pw-file-system-dialogue', 'remote', '加载历史快照', 1000, 800, true, true, true, { path: FileSystem.ROOT.name, action: 'filesystem_save_SnapShot', savetype: 'pole', data: response.returns, savename: '合杆' + that.history_PoleId })
					}
					else {
						that.error = ("在 <请求数据> 出现了如下错误: " + HTML.create_KeyPair('错误', response.respMsg, "String"))
					}
				});
			},
			cancel() {
				this.$EventBus.$emit('app_close_Popup')
			}
		},
		mounted() {
		},
		beforeDestroy() {
		}
	}
</script>
<style scoped>
	.MaskCover {
		background-color: var(--BarColorTransparent);
		pointer-events: all;
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		top: 0;
		display: flex;
		align-items: center;
		justify-content: center;
	}
</style>
