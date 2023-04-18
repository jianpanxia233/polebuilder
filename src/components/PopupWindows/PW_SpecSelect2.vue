<template>
	<div id="PW_UpdateInfo" style="width: 100%; height: 100%; position: relative;">
		<div class="container full" style="border-radius: 0 0 var(--ContainerRadius) var(--ContainerRadius);">
			<div class="v-box">
				<div class="scroll-container flex">

					<div class="listview-dark">
						<div class="form-container gap">
							<div class="form-container gap">
								<!-- <div class="form-container" style="flex: unset">
										<div class="title-dark"
											style="margin-right: 6px; text-align: left; word-break: break-all;">设备号
										</div>
									</div> -->
								<div class="form-container">
									<input class="lineedit-dark" style="flex: 1; min-width: 50px; height: auto;"
										placeholder="筛选" v-model="keyword" />
								</div>
							</div>
							<div class="button-dark" @click="keyword = ''">
								<svg class="button-icon-svg" viewBox="0 0 115 116" xmlns="http://www.w3.org/2000/svg"
									xmlns:xlink="http://www.w3.org/1999/xlink" overflow="hidden">
									<g transform="translate(-561 -534)">
										<path d="M584 558 653.101 627.101" stroke-width="9" stroke-miterlimit="8"
											fill-rule="evenodd" />
										<path d="M653.101 557 584 626.101" stroke-width="9" stroke-miterlimit="8"
											fill-rule="evenodd" />
									</g>
								</svg>
							</div>
							<div class="button-dark" @click="refresh()">
								<svg class="button-icon-svg" viewBox="-100 -100 1224 1224" version="1.1"
									xmlns="http://www.w3.org/2000/svg">
									<path
										d="M512.034377 0a512 512 0 0 1 296.813714 929.206857l-87.113142-117.540571a365.714286 365.714286 0 1 0-426.569143-5.12l84.041143-109.348572L512.034377 1024H128.034377l77.970286-101.595429-10.971429-8.338285A512 512 0 0 1 512.034377 0z">
									</path>
								</svg>
							</div>
						</div>

					</div>

					<div class="itemview-dark flex" @dblclick.self="selectId = -1; selectName = '';">
						<template v-for="item in get_List">
							<div class="select-dark border left" :class="{'selected': item.specsId === selectId}"
								@click="selectId = item.specsId; selectName = item.specsName;">
								<a class="button-text" v-html="item.text"></a>
							</div>
						</template>
					</div>
					<div class="listview-dark">
						<div class="form-container right gap">
							<div class="button-dark" @click="cancel()">
								<a class="button-text">取消</a>
							</div>
							<div class="button-dark" :class="{'inactive': selectId === -1}" @click="confirm()">
								<svg class="button-icon-svg" viewBox="0 0 115 115" xmlns="http://www.w3.org/2000/svg"
									xmlns:xlink="http://www.w3.org/1999/xlink" overflow="hidden">
									<g transform="translate(-534 -322)">
										<path d="M551 379.832 585.727 409 632 345" stroke-width="9"
											stroke-miterlimit="8" fill="none" fill-rule="evenodd" />
									</g>
								</svg>
								<a class="button-text">确认</a>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div v-show="MaskShow" class="MaskCover">
				<div class="button-dark" style="background-color: var(--ThemeColor);">
					<div class="title1-dark" style="margin: 0px; padding: 0px; color: var(--FontColorReverse);">
						加载中...
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
<script>
	import CryptoJS from 'crypto-js'
	import { customLog, HTML, radius_to_degree, degree_to_radius, to_PoleAngle, get_NearPoleAngle } from '../Utils.js'
	import * as ComponentManager from '../Sun/ComponentManager.js'
	import data from '../test3'
	import staticData from '../Sun/StaticData.js'
	import {searchDicDetailList} from '@/api/DicTools'
	import {getCarryEquipmentSpecsInfo, getSpecsInfoWithOutPrimaryPole, searchSpecsInfoByType} from '@/api/Spec'

	export default {
		name: 'PW_SpecSelect',
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
				list: [],
				selectName: '',
				selectId: -1,
				keyword: '',
				MaskShow: true
			}
		},
		computed: {
			get_List: function () {
				let list = []
				if (this.keyword === '') {
					return this.list.map((i) => {
						return {
							specsId: i.specsId,
							specsName: i.specsName,
							text: `<span>${i.specsName}</span> <span style="color: var(--BarColorTransparent)">${i.specsId}</span>`
						}
					})
				}
				else {
					list = this.list.filter((item) => {
						return item.specsName.indexOf(this.keyword) !== -1// || item.specsId.toString().indexOf(this.keyword) !== -1
					})
				}
				return list.map((i) => {
					let idx = i.specsName.indexOf(this.keyword)
					let front = i.specsName.slice(0, idx)
					let end = i.specsName.slice(idx + this.keyword.length)
					if (idx === -1) {

					}
					return {
						specsId: i.specsId,
						specsName: i.specsName,
						text: `<span>${front}</span><span style="background-color: var(--ThemeColor); color: var(--FontColorReverse);">${this.keyword}</span><span>${end}</span> <span style="color: var(--BarColorTransparent)">${i.specsId}</span>`
					}
				})
			}
		},
		watch: {
		},
		activated() {
			//console.log(this)
			this.refresh();
		},
		deactivated() {
		},
		methods: {
			refresh() {
				// //console.log(this.Input)
				// //console.log(this.Input.mainClassification)
				let that = this;
				if(this.Input.mainClassification === '主杆杆型'){
					this.MaskShow = true
					let param = {
						typeIdList : [1003]
					}
					searchDicDetailList(param).then(response => {
							//console.log(response)
							that.MaskShow = false
							if (response.respCode === 0) {
								that.list = response.returns
								for(let i = 0 ; i < that.list.length; i++){
									that.list[i].specsId = that.list[i].dicCode
									that.list[i].specsName = that.list[i].dicValue
								}
							}
						});
				}
				else if (this.Input.mainClassification === "搭载设备") {
					this.MaskShow = true
					let that = this
					let param = {
						partsType : 6
					}

					getCarryEquipmentSpecsInfo(param).then(response => {
							//console.log(response)
							that.MaskShow = false
							if (response.respCode === 0) {
								that.list = response.returns
							}
						});
				}
				else if (this.Input.mainClassification === "部件") {
					this.MaskShow = true
					let word

					let partsType = 0
					switch (this.Input.classification) {
						case '主杆': partsType = 0; break;
						case '副杆': partsType = 1; break;
						case '横臂': partsType = 2; break;
						case '灯臂': partsType = 4; break;
						case '连接件': partsType = 5; break;
						case '卡槽': partsType = 3; break;
					}

					let param = {
						partsType : partsType
					}
					let that = this

					getSpecsInfoWithOutPrimaryPole(param).then(response => {
							//console.log(response)
							that.MaskShow = false
							if (response.respCode === 0) {
								that.list = response.returns
							}
						});
				} else {
					this.MaskShow = true

					let type = 1;
					let belongPartType = 0;
					let subType = null;
					let standardType = 0;
					switch (this.Input.classification) {
						case '杆体':case '副杆体': case '杆身': case '副杆身': type=1; break;
						case '侧边法兰':case '副侧边法兰': type=2; break;
						case '底部法兰':case '副底部法兰': type=3; break;
						case '顶部法兰':case '副顶部法兰': type=4; break;
						case '小检修门':case '副小检修门': type=5; break;
						case '大检修门':case '副大检修门': type=6; break;
					}

					switch(this.Input.mainClassification){
						case '主杆零件': belongPartType=0; break;
						case '副杆零件': belongPartType=1; break;

					}

					switch(this.Input.selectLibrary){
						case '标准库': standardType=0; break;
						case '自定义库': standardType=1; break;

					}

					// 侧法兰分类
					if(type === 2){
						switch(this.Input.subClassification){
							case '适配斜横臂': subType=5; break;
							case '适配直横臂': subType=2; break;
						}
						switch(this.Input.poleType){
							case '斜横臂': subType=5; break;
							case '直横臂': subType=2; break;
						}
					}
					let param = {
						type : type,
						belongPartType : belongPartType,
						subType : subType,
						standardType : standardType
					}
					let that = this

					searchSpecsInfoByType(param).then(function (response) {
							that.MaskShow = false
							if (response.respCode === 0) {
								that.list = response.returns
							}
						});

				}

			},
			confirm() {
				if (this.selectId === -1) return
				if (this.Input.action[0] === '@') {
					//console.log(this.Parent + '_PopupWindow',this)
					this.$EventBus.$emit(this.Parent + '_PopupWindow', 'select_TransverseArmSpecs',{specsId: this.selectId , specsName : this.selectName})
					this.$EventBus.$emit(this.Parent + '_PopupWindow', this.Input.action.slice(1), { specsId: this.selectId, specsName: this.selectName })
				}
				else {
					//console.log(this.Input)
					this.$EventBus.$emit(this.Input.action, { specsId: this.selectId, specsName: this.selectName })
				}
				this.$EventBus.$emit('app_close_Popup')
			},
			cancel() {
				this.$EventBus.$emit('app_close_Popup')
			}
		},
		mounted() {
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
