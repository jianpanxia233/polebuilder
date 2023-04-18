<template>
	<div id="PW_RuleLangAction" style="width: 100%; height: 100%; position: relative;">

		<div class="Layout-Panel" id="PW_RuleLangAction_ActionModulePanel">
			<div class="container full">
				<div class="v-box">
					<div class="scroll-container flex" style="padding-right: 0px;">
						<div class="title1-dark">
							动作模块
						</div>
						<div class="listview-dark">
							<div class="form-container">
								<input class="lineedit-dark" style="flex: 1;" v-model="SearchKey"
									@dblclick="SearchKey=''" />
								<div class="button-dark" @click="SearchKey=''">
									<svg class="button-icon-svg" viewBox="0 0 115 116"
										xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
										overflow="hidden">
										<g transform="translate(-561 -534)">
											<path d="M584 558 653.101 627.101" stroke-width="9" stroke-miterlimit="8"
												fill-rule="evenodd" />
											<path d="M653.101 557 584 626.101" stroke-width="9" stroke-miterlimit="8"
												fill-rule="evenodd" />
										</g>
									</svg>
								</div>
							</div>
						</div>
						<div class="scrollview-dark flex">

							<div v-for="item, index in get_ActionArray" class="selectview-dark" draggable="true"
								@drag="dragging_ActionModule($event)"
								@dragend="drop_ActionModule($event, item.actionid)">
								<div class="form-container">
									<div class="form-container icon">
										<svg v-if="item.icon==='fx'" class="icon-dark large" style="margin-left: 16px;"
											viewBox="0 0 97 97" xmlns="http://www.w3.org/2000/svg"
											xmlns:xlink="http://www.w3.org/1999/xlink" overflow="hidden">
											<g transform="translate(-403 -246)">
												<path
													d="M459.465 253.988C462.366 253.988 464.867 254.226 466.969 254.702L465.238 262.285 461.33 262.285C460.915 260.59 460.375 259.371 459.709 258.628 459.043 257.884 458.059 257.512 456.756 257.512 455.069 257.512 453.641 257.98 452.471 258.917 451.302 259.854 450.303 261.245 449.474 263.088 448.645 264.932 447.875 267.415 447.165 270.538L446.055 275.401 457.467 275.401 456.49 279.906 445.033 279.906 436.774 318.806C435.412 325.259 433.325 330.07 430.513 333.237 427.701 336.404 424.163 337.988 419.9 337.988 418.657 337.988 417.68 337.914 416.969 337.765L417.724 333.839C418.02 333.928 418.716 333.973 419.811 333.973 421.143 333.973 422.283 333.631 423.231 332.947 424.178 332.263 425.058 331.073 425.873 329.378 426.687 327.683 427.434 325.334 428.115 322.33L437.662 279.906 430.158 279.906 430.824 276.828C432.807 276.709 434.236 276.546 435.109 276.337 435.982 276.129 436.663 275.817 437.152 275.401 437.64 274.984 438.055 274.441 438.395 273.772 438.735 273.103 439.172 271.876 439.705 270.092 441.274 264.739 443.694 260.716 446.965 258.025 450.236 255.334 454.403 253.988 459.465 253.988Z"
													fill-rule="evenodd" />
												<path
													d="M461.148 282.99C461.951 282.99 462.656 283.079 463.265 283.259 463.873 283.438 464.41 283.713 464.876 284.084 465.342 284.456 465.757 284.936 466.119 285.525 466.482 286.115 466.831 286.915 467.168 287.927 467.504 288.938 467.821 290.194 468.119 291.692 468.417 293.191 468.682 294.747 468.915 296.361L469.303 296.361C471.789 292.902 473.673 290.373 474.954 288.772 476.236 287.171 477.316 285.98 478.197 285.199 479.077 284.418 479.925 283.867 480.74 283.546 481.556 283.227 482.637 283.066 483.983 283.066 485.2 283.066 486.197 283.22 486.973 283.527L485.42 290.482 482.701 290.482C482.546 289.406 482.093 288.868 481.342 288.868 481.109 288.868 480.863 288.907 480.605 288.983 480.346 289.06 480.028 289.227 479.653 289.483 479.278 289.739 478.727 290.239 478.002 290.981 477.277 291.724 476.462 292.633 475.556 293.709 474.65 294.785 473.718 295.912 472.76 297.091L470.119 300.357C470.585 302.816 471.025 304.942 471.44 306.735 471.854 308.528 472.223 310.02 472.546 311.211 472.87 312.402 473.155 313.344 473.401 314.035 473.647 314.727 473.912 315.245 474.197 315.591 474.482 315.937 474.773 316.181 475.07 316.321 475.368 316.462 475.711 316.533 476.1 316.533 476.799 316.533 477.479 316.264 478.139 315.726 478.799 315.188 479.75 313.971 480.993 312.075L483.517 313.728C481.705 316.392 480.067 318.268 478.604 319.357 477.142 320.445 475.401 320.99 473.381 320.99 472.268 320.99 471.323 320.791 470.546 320.394 469.77 319.997 469.096 319.363 468.527 318.492 467.957 317.621 467.452 316.264 467.012 314.419 466.21 311.141 465.718 308.63 465.537 306.888L465.148 306.888C462.404 310.705 460.365 313.446 459.032 315.111 457.698 316.776 456.598 318.005 455.731 318.8 454.863 319.594 454.022 320.151 453.206 320.471 452.391 320.791 451.31 320.951 449.964 320.951 448.747 320.951 447.75 320.798 446.973 320.49L448.527 313.535 451.245 313.535C451.4 314.611 451.854 315.15 452.605 315.15 452.967 315.15 453.349 315.053 453.75 314.861 454.151 314.669 454.727 314.208 455.478 313.478 456.229 312.748 457.265 311.602 458.585 310.039 459.905 308.477 461.822 306.133 464.332 303.008 463.944 300.984 463.543 299.037 463.129 297.168 462.715 295.298 462.287 293.556 461.847 291.942 461.407 290.328 461.045 289.272 460.76 288.772 460.475 288.273 460.171 287.927 459.847 287.735 459.524 287.543 459.116 287.447 458.624 287.447 458.08 287.447 457.588 287.568 457.148 287.812 456.708 288.055 456.229 288.477 455.711 289.08 455.193 289.681 454.507 290.623 453.653 291.903L451.129 290.251C452.76 287.818 454.326 285.999 455.828 284.795 457.33 283.591 459.103 282.99 461.148 282.99Z"
													fill-rule="evenodd" />
											</g>
										</svg>
										<svg v-else-if="item.icon==='code'" class="icon-dark large"
											style="margin-left: 16px;" viewBox="0 0 97 97"
											xmlns="http://www.w3.org/2000/svg"
											xmlns:xlink="http://www.w3.org/1999/xlink" overflow="hidden">
											<g transform="translate(-415 -248)">
												<path
													d="M431 287C431 289.761 428.985 292 426.5 292 424.015 292 422 289.761 422 287 422 284.239 424.015 282 426.5 282 428.985 282 431 284.239 431 287Z"
													fill-rule="evenodd" />
												<path
													d="M450 287C450 289.761 447.761 292 445 292 442.239 292 440 289.761 440 287 440 284.239 442.239 282 445 282 447.761 282 450 284.239 450 287Z"
													fill-rule="evenodd" />
												<path
													d="M468 287C468 289.761 465.985 292 463.5 292 461.015 292 459 289.761 459 287 459 284.239 461.015 282 463.5 282 465.985 282 468 284.239 468 287Z"
													fill-rule="evenodd" />
												<path d="M422 264 450 264 450 273 422 273Z" fill-rule="evenodd" />
												<path d="M459 264 486 264 486 273 459 273Z" fill-rule="evenodd" />
												<path
													d="M431 305.5C431 307.985 428.985 310 426.5 310 424.015 310 422 307.985 422 305.5 422 303.015 424.015 301 426.5 301 428.985 301 431 303.015 431 305.5Z"
													fill-rule="evenodd" />
												<path
													d="M450 305.5C450 307.985 447.761 310 445 310 442.239 310 440 307.985 440 305.5 440 303.015 442.239 301 445 301 447.761 301 450 303.015 450 305.5Z"
													fill-rule="evenodd" />
												<path
													d="M505 305.5C505 307.985 502.985 310 500.5 310 498.015 310 496 307.985 496 305.5 496 303.015 498.015 301 500.5 301 502.985 301 505 303.015 505 305.5Z"
													fill-rule="evenodd" />
												<path d="M459 301 486 301 486 310 459 310Z" fill-rule="evenodd" />
												<path d="M423 319 451 319 451 328 423 328Z" fill-rule="evenodd" />
											</g>
										</svg>
									</div>
									<div class="form-vcontainer sub">
										<div class="title-dark left"
											style="font-size: 14px; margin-bottom: 0px; margin-left: 0px;">
											{{item.title}}</div>
										<div class="title-dark left" style="font-size: 12px; margin-left: 0px;">
											{{item.info}}
										</div>
									</div>
								</div>
							</div>

						</div>
						<!-- <div class="listview-dark">
							<div class="form-container right">
								<div class="button-dark">
									<svg class="button-icon-svg" viewBox="0 0 115 116"
										xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
										overflow="hidden">
										<g transform="translate(-561 -534)">
											<path d="M584 558 653.101 627.101" stroke-width="9" stroke-miterlimit="8"
												fill-rule="evenodd" />
											<path d="M653.101 557 584 626.101" stroke-width="9" stroke-miterlimit="8"
												fill-rule="evenodd" />
										</g>
									</svg>
									<a class="button-text">取消</a>
								</div>
								<div class="button-dark">
									<svg class="button-icon-svg" viewBox="0 0 118 118"
										xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
										overflow="hidden">
										<g transform="translate(-561 -534)">
											<path d="M619.188 549.025 619.188 635.145" stroke-width="9"
												stroke-miterlimit="8" fill-rule="evenodd" />
											<path d="M662.423 591.911 576.303 591.91" stroke-width="9"
												stroke-miterlimit="8" fill-rule="evenodd" />
										</g>
									</svg>
									<a class="button-text">插入</a>
								</div>
							</div>
						</div> -->
					</div>
				</div>
			</div>
		</div>

		<div class="Layout-Panel" id="PW_RuleLangAction_ActionEditorPanel">
			<div class="container full">
				<div class="v-box">
					<div class="scroll-container flex" style="padding-right: 0px;">
						<div class="title1-dark">
							动作编辑器
						</div>
						<div class="listview-dark">
							<div class="form-container right">
								<div :class="{'button-dark': true, 'left':true, 'inactive': (ActionList.length === 0 || SelectedActionModuleIndex <= 0 )}"
									@click="move_ActionModule_Up(SelectedActionModuleIndex)">
									<svg class="button-icon-svg" viewBox="0 0 116 116"
										xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
										overflow="hidden">
										<g transform="translate(-239 -269)">
											<path d="M259 323 336 323 336 331 259 331 259 323Z" fill-rule="evenodd" />
										</g>
									</svg>

								</div>
								<div :class="{'button-dark': true, 'right':true, 'inactive': (ActionList.length === 0 || SelectedActionModuleIndex < 0 || SelectedActionModuleIndex >= ActionList.length-1)}"
									@click="move_ActionModule_Down(SelectedActionModuleIndex)">
									<svg class="button-icon-svg" viewBox="0 0 118 118"
										xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
										overflow="hidden">
										<g transform="translate(-561 -534)">
											<path d="M619.188 549.025 619.188 635.145" stroke-width="9"
												stroke-miterlimit="8" fill-rule="evenodd" />
											<path d="M662.423 591.911 576.303 591.91" stroke-width="9"
												stroke-miterlimit="8" fill-rule="evenodd" />
										</g>
									</svg>
								</div>
								<div :class="{'button-dark': true, 'inactive': (ActionList.length === 0 || SelectedActionModuleIndex < 0) }"
									title="删除选中的动作模块" @click="delete_ActionModule(SelectedActionModuleIndex)">
									<svg class="button-icon-svg" viewBox="0 0 114 114"
										xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
										overflow="hidden">
										<g transform="translate(-252 -261)">
											<path
												d="M340.25 288.833 322.542 288.833 322.542 283.625C322.542 279.563 319.313 276.333 315.25 276.333L302.75 276.333C298.688 276.333 295.458 279.563 295.458 283.625L295.458 288.833 277.75 288.833C275.458 288.833 273.583 290.708 273.583 293L273.583 297.167 344.417 297.167 344.417 293C344.417 290.708 342.542 288.833 340.25 288.833ZM301.708 283.625C301.708 283 302.125 282.583 302.75 282.583L315.25 282.583C315.875 282.583 316.292 283 316.292 283.625L316.292 288.833 301.708 288.833 301.708 283.625Z" />
											<path
												d="M279.833 355.5C279.833 357.792 281.708 359.667 284 359.667L334 359.667C336.292 359.667 338.167 357.792 338.167 355.5L338.167 301.333 279.833 301.333 279.833 355.5ZM322.542 307.583 328.792 307.583 328.792 353.417 322.542 353.417 322.542 307.583ZM305.875 307.583 312.125 307.583 312.125 353.417 305.875 353.417 305.875 307.583ZM289.208 307.583 295.458 307.583 295.458 353.417 289.208 353.417 289.208 307.583Z" />
										</g>
									</svg>
								</div>
							</div>
						</div>
						<div class="scrollview-dark flex" id="RuleLang_ActionModule_Editor"
							@dblclick="SelectedActionModuleIndex=-1">
							<template v-if="ActionList.length === 0">
								<div class="form-vcontainer center"
									style="color: var(--ObjectColor);height: 100%; justify-content: center;">
									<div class="title-dark">
										模块列表为空
									</div>
									<div class="title-dark">
										在左侧动作模块栏 <span style="text-decoration: underline;">拖拽</span> 选项添加RuLeLangAction
									</div>
								</div>
							</template>
							<template v-else>
								<template v-for="item, index in ActionList">
									<am-match-moduleclass v-if="item.actionid === 'match_ModuleClass'" :idx="index"
										:selected="index===SelectedActionModuleIndex" v-model="item.list"
										@onClick="SelectedActionModuleIndex = index"
										@change="on_ActionList_Changed()" />
									<am-custom-rulelang v-else-if="item.actionid === 'custom_RuleLang'" :idx="index"
										:selected="index===SelectedActionModuleIndex" v-model="item.code"
										@onClick="SelectedActionModuleIndex = index"
										@change="on_ActionList_Changed()" />
									<am-match-moduleproperty v-else-if="item.actionid === 'match_ModuleProperty'"
										:idx="index" :selected="index===SelectedActionModuleIndex"
										v-model="item.property" @onClick="SelectedActionModuleIndex = index"
										@change="on_ActionList_Changed()" />
									<am-is-slotempty v-else-if="item.actionid === 'is_SlotEmpty'" :idx="index"
										:selected="index===SelectedActionModuleIndex"
										@onClick="SelectedActionModuleIndex = index" />
								</template>
							</template>
						</div>
					</div>
				</div>
			</div>
		</div>

		<div class="Layout-Panel" id="PW_RuleLangAction_RuleLangPanel">
			<div class="container full">
				<div class="v-box">
					<div class="scroll-container flex">
						<div class="title1-dark">
							RuleLangActionList代码
						</div>
						<div class="listview-dark flex">
							<div class="form-container" style="height: 100%; max-height: 100%;">
								<textarea class="textarea-dark"
									style="flex: 1; resize: none; line-height: 1.2; font-family: 'consolas';" readonly
									disabled :value="RuleLang"></textarea>
							</div>
						</div>
						<div class="listview-dark">
							<div class="form-container right">
								<div class="button-dark" @click="on_Cancel_Click">
									<svg class="button-icon-svg" viewBox="0 0 115 116"
										xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
										overflow="hidden">
										<g transform="translate(-561 -534)">
											<path d="M584 558 653.101 627.101" stroke-width="9" stroke-miterlimit="8"
												fill-rule="evenodd" />
											<path d="M653.101 557 584 626.101" stroke-width="9" stroke-miterlimit="8"
												fill-rule="evenodd" />
										</g>
									</svg>
									<a class="button-text">取消</a>
								</div>
								<div class="button-dark" @click="on_Comfirm_Click">
									<svg class="button-icon-svg" viewBox="0 0 115 115"
										xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
										overflow="hidden">
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
			</div>
		</div>

	</div>
</template>
<script>
	import { Panel, Layouter } from '../Sun/Layout.js'
	import * as RuleLang from '../Sun/RuleLang.js'
	import AM_match_ModuleClass from './ActionModule/AM_match_ModuleClass'
	import AM_custom_RuleLang from './ActionModule/AM_custom_RuleLang'
	import AM_match_ModuleProperty from './ActionModule/AM_match_ModuleProperty'
	import AM_is_SlotEmpty from './ActionModule/AM_is_SlotEmpty'

	export default {
		name: 'PW_RuleLangAction',
		components: {
			'am-match-moduleclass': AM_match_ModuleClass,
			'am-custom-rulelang': AM_custom_RuleLang,
			'am-is-slotempty': AM_is_SlotEmpty,
			'am-match-moduleproperty': AM_match_ModuleProperty
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
						actionlist: {}
					}
				}
			}
		},
		data() {
			return {
				Layout: null,
				ActionEditorDiv: null,
				LayoutDiv: null,
				ActionArray:
					[{ icon: 'fx', title: '插槽为空', info: '该插槽当前未连接任何组件', actionid: 'is_SlotEmpty' },
					{ icon: 'fx', title: '组件类型判断', info: '当有组件尝试连接到此插槽时判断该组件的 类型 是否 满足 一定的条件', actionid: 'match_ModuleClass' },
					{ icon: 'fx', title: '组件属性判断', info: '当有组件尝试连接到此插槽时判断该组件的是否 含有 并 满足 一定的属性', actionid: 'match_ModuleProperty' },
					// { icon: 'fx', title: '组件名称判断', info: '当有组件尝试连接到此插槽时判断该组件的名称是否满足一点的条件', actionid: 'match_ModuleName' },
					// { icon: 'fx', title: '组件CID判断', info: '当有组件尝试连接到此插槽时判断该组件的componentID是否满足一点的条件', actionid: 'match_ModuleCID' },

					{ icon: 'code', title: 'RuleLang代码', info: '直接编写RuleLang代码', actionid: 'custom_RuleLang' }],
				SearchKey: '',
				SelectedActionModuleIndex: -1,
				ActionList: [{ actionid: 'is_SlotEmpty' }, { actionid: 'match_ModuleClass', list: [] }],
				RuleLang: '',
				RuleLangObject: null
			}
		},
		computed: {
			get_ActionArray() {
				return this.ActionArray.filter((item) => {
					if (this.SearchKey === '') {
						return true
					}
					if (item.title.search(this.SearchKey) !== -1) {
						return true
					}
					else {
						return false
					}
				})
			}
		},
		watch: {
			PopupSize() {
				if (this.layout !== null) {
					this.Layout.refresh_Layout()
				}
			}
		},
		methods: {
			is_Mouse_Inside(mouse_x, mouse_y, rect) {
				let div_x = rect.left
				let div_y = rect.top
				let div_width = rect.width
				let div_height = rect.height
				if (((mouse_x >= div_x) && (mouse_x <= div_x + div_width)) && ((mouse_y >= div_y) && (mouse_y <= div_y + div_height))) {
					// IN
					return true
				}
				else {
					return false
				}
			},

			dragging_ActionModule(event) {
				// if (this.is_Mouse_Inside(event.clientX, event.clientY, this.ActionEditorDiv.getBoundingClientRect())) {
				// 	this.ActionEditorDiv.style.border = 'solid 4px var(--ThemeColor)'
				// }
				// else {
				// 	this.ActionEditorDiv.style.border = 'none'
				// }
			},
			drop_ActionModule(event, actionid) {
				this.ActionEditorDiv.style.border = 'none'
				if (this.is_Mouse_Inside(event.clientX, event.clientY, this.ActionEditorDiv.getBoundingClientRect())) {
					this.add_ActionModule(actionid)
				}
			},
			add_ActionModule(actionid) {
				// //console.log(actionid)
				if (actionid === 'match_ModuleClass') {
					this.ActionList.push({ actionid: 'match_ModuleClass', list: [] })
				}
				else if (actionid === 'match_ModuleProperty') {
					this.ActionList.push({ actionid: 'match_ModuleProperty', property: { Name: '', Value: '' } })
				}
				else if (actionid === 'custom_RuleLang') {
					this.ActionList.push({ actionid: 'custom_RuleLang', code: '' })
				}
				else if (actionid === 'is_SlotEmpty') {
					this.ActionList.push({ actionid: 'is_SlotEmpty' })
				}
				this.on_ActionList_Changed()
			},
			move_ActionModule_Up(idx) {
				if (idx >= 1 && idx < this.ActionList.length) {
					let item = this.ActionList.splice(idx, 1)[0]
					this.ActionList.splice(idx - 1, 0, item)
					this.SelectedActionModuleIndex--
					this.on_ActionList_Changed()
				}
			},
			move_ActionModule_Down(idx) {
				if (idx >= 0 && idx < this.ActionList.length - 1) {
					let item = this.ActionList.splice(idx, 1)[0]
					this.ActionList.splice(idx + 1, 0, item)
					this.SelectedActionModuleIndex++
					this.on_ActionList_Changed()
				}
			},
			delete_ActionModule(idx) {
				if (idx >= 0 && idx < this.ActionList.length) {
					this.ActionList.splice(idx, 1)

				}
				this.SelectedActionModuleIndex = -1
				this.on_ActionList_Changed()
			},
			on_ActionList_Changed() {
				this.RuleLang = JSON.stringify(this.ActionList, null, 2)
			},
			on_Cancel_Click() {
				this.$EventBus.$emit('app_close_Popup')
			},
			on_Comfirm_Click() {
				// //console.log(this.Parent + '_receive_RuleLang')
				this.$EventBus.$emit(this.Parent + '_receive_RuleLang', this.ActionList)
				this.$EventBus.$emit('app_close_Popup')
			}
		},
		activated() {
			this.SelectedActionModuleIndex = -1
			this.ActionList = [{ actionid: 'is_SlotEmpty' }, { actionid: 'match_ModuleClass', list: [] }]
			this.on_ActionList_Changed()
			this.$forceUpdate()
			this.Layout.layout_tree.set_Visible(true)
			this.Layout.refresh_Layout()
		},
		deactivated() {
			this.SelectedActionModuleIndex = -1
			this.ActionList = []
			this.Layout.layout_tree.set_Visible(false)
			this.Layout.refresh_Layout()
		},
		mounted() {
			this.ActionEditorDiv = document.getElementById('RuleLang_ActionModule_Editor')
			this.LayoutDiv = document.getElementById('PW_RuleLangAction')
			this.Layout = new Layouter('PW_RuleLangAction', ['PW_RuleLangAction_ActionPanel'])
			let ActionModulePanel = new Panel('PW_RuleLangAction_ActionModulePanel', '', null, false, true, 300, 400)
			let ActionEditorPanel = new Panel('PW_RuleLangAction_ActionEditorPanel', '', null, true, true, 400, 400)
			let RuleLangPanel = new Panel('PW_RuleLangAction_RuleLangPanel', '', null, true, true, 200, 400)
			this.Layout.layout_tree.split([ActionModulePanel, ActionEditorPanel, RuleLangPanel])
			this.Layout.format()
			// this.Layout.layout_tree.set_Visible(false)
			this.Layout.refresh_Layout()
		}
	}
</script>
<style scoped>

</style>
