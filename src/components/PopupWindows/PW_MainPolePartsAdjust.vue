<template>
	<div id="PW_Setting" style="width: 100%; height: 100%; position: relative;">
		<div class="Layout-Panel" id="PW_Setting_ListPanel">
			<div class="container full">
				<div class="v-box">
					<div class="scroll-container flex" style="padding-right: 0px;">
						<div class="title1-dark">
							设置项目
						</div>
						<div class="listview-dark">
							<div class="form-vcontainer">
								<div v-for="(item, index) in ClassList"
									:class="{'button-dark': true, 'contextleft': true, 'selected': item===SelectedClass, 'top': index===0&&ClassList.length>1, 'vcenter': index!==0&&index!==ClassList.length-1, 'bottom': index===ClassList.length-1&&ClassList.length>1}"
									@click="SelectedClass = item" :key="item">
									<a class="button-text">{{item}}</a>
								</div>
							</div>
						</div>
						<div class="listview-dark">
							<div class="form-vcontainer">
								<div :class="{'button-dark': true, 'contextleft': true, 'selected': '关于'===SelectedClass, 'top': true}"
									@click="SelectedClass = '关于'">
									<a class="button-text">关于</a>
								</div>
								<div class="button-dark bottom contextleft">
									<a class="button-text">{{Version}}</a>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
		<div class="Layout-Panel" id="PW_Setting_ItemPanel">
			<div class="container full">
				<div class="v-box">
					<div class="scroll-container flex" v-if="SelectedClass==='主题'">
						<div class="title1-dark">
							主题
						</div>
						<div class="listview-dark">
							<div class="form-container">
								<div class="form-container icon leftpadding fixedwidth">
									<div class="title-dark" style="margin-bottom: 0px;">颜色主题</div>
								</div>
								<div class="form-vcontainer sub right">
									<div class="form-container right">
										<div :class="{'button-dark': true, 'left': true, 'selected': Theme === 'light'}"
											@click="set_Light_Theme(true)">
											<a class="button-text">
												sun 亮色主题
											</a>
										</div>
										<div :class="{'button-dark': true, 'right': true, 'selected': Theme === 'dark'}"
											@click="set_Light_Theme(false)">
											<a class="button-text">
												sun 暗色主题
											</a>
										</div>
									</div>
								</div>
							</div>
						</div>

					</div>
					<div class="scroll-container flex" v-if="SelectedClass==='界面'">
						<div class="title1-dark">
							界面
						</div>
						<div class="listview-dark">
							<div class="form-container">
								<div class="form-container icon leftpadding fixedwidth">
									<div class="title-dark" style="margin-bottom: 0px;">界面布局</div>
								</div>
								<div class="form-vcontainer sub right">
									<div class="form-container right">
										<div class="button-dark">
											<a class="button-text">
												保存界面布局
											</a>
										</div>
										<div class="button-dark">
											<a class="button-text">
												重置界面布局
											</a>
										</div>
									</div>
								</div>
							</div>
						</div>
						<!-- <div class="listview-dark">
							<div class="form-container">
								<div class="form-container icon leftpadding fixedwidth">
									<div class="title-dark" style="margin-bottom: 0px;">功能页面</div>
								</div>
								<div class="form-vcontainer sub" style="max-width: 250px;">
									<div class="form-container">
										<div class="title-dark">地图</div>
										<div class="space6px"></div>
										<input class="checkbox-dark" type="checkbox" />
									</div>
									<div class="form-container">
										<div class="title-dark">编辑器</div>
										<div class="space6px"></div>
										<input class="checkbox-dark" type="checkbox" />
									</div>
									<div class="form-container">
										<div class="title-dark">呈现</div>
										<div class="space6px"></div>
										<input class="checkbox-dark" type="checkbox" />
									</div>
									<div class="form-container">
										<div class="title-dark">综合箱</div>
										<div class="space6px"></div>
										<input class="checkbox-dark" type="checkbox" />
									</div>
									<div class="form-container">
										<div class="title-dark">组件导入</div>
										<div class="space6px"></div>
										<input class="checkbox-dark" type="checkbox" />
									</div>
								</div>
							</div>
						</div> -->

						<!-- <div class="listview-dark">
							<div class="form-container">
								<div class="form-container icon leftpadding fixedwidth">
									<div class="title-dark" style="margin-bottom: 0px;">布局</div>
								</div>
								<div class="form-container sub right">
									<div class="selectview-dark">
										<div class="form-vcontainer center">
											<div class="form-container icon center leftpadding">
												<svg class="icon-dark extra" viewBox="0 0 97 97"
													xmlns="http://www.w3.org/2000/svg"
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
											</div>
											<div class="title-dark">简易</div>
										</div>
									</div>
									<div class="selectview-dark">
										<div class="form-vcontainer center">
											<div class="form-container icon center leftpadding">
												<svg class="icon-dark extra" viewBox="0 0 97 97"
													xmlns="http://www.w3.org/2000/svg"
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
											</div>
											<div class="title-dark">Advance</div>
										</div>
									</div>
								</div>
							</div>
						</div> -->

					</div>
					<div class="scroll-container flex" v-if="SelectedClass==='系统'">
						<div class="title1-dark">
							系统
						</div>
						<div class="listview-dark">
							<div class="form-container">
								<div class="form-container icon leftpadding fixedwidth">
									<div class="title-dark" style="margin-bottom: 0px;">角度单位</div>
								</div>
								<div class="form-vcontainer sub right">
									<div class="form-container right">
										<div class="button-dark left">
											<a class="button-text">角度</a>
										</div>
										<div class="button-dark hcenter">
											<a class="button-text">弧度</a>
										</div>
										<div class="button-dark right">
											<a class="button-text">PI的倍数 rad</a>
										</div>
									</div>
								</div>
							</div>
						</div>

					</div>

					<div class="scroll-container flex" v-if="SelectedClass==='关于'">
						<div class="title1-dark" style="font-size: 30px;">
							合杆合箱三维可视化平台
						</div>
						<img src="../../assets/img/splashscreen1.png"
							style="border-radius: var(--ContainerRadius); object-fit: cover; max-height: 187px; margin-bottom: 6px;" />
						<div class="title1-dark">
							信息
						</div>
						<div class="title-dark">
							合杆合箱三维可视化平台 {{Version}}
						</div>
						<div class="title-dark">
							2019-2020
						</div>
						<div class="title1-dark">
							制作群
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
<script>
	import { Panel, Layouter } from '../Sun/Layout.js'
	import { change_UITheme } from '../Utils.js'

	export default {
		name: 'PW_Setting',
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
						actionlist: {}
					}
				}
			}
		},
		data() {
			return {
				Layout: null,
				ClassList: ['主题', '界面', '系统'],
				SelectedClass: '主题',
				Version: 'version 0.0.1',
				Theme: 'dark'
			}
		},
		watch: {
			PopupSize() {
				if (this.layout !== null) {
					this.Layout.refresh_Layout()
				}
			}
		},
		activated() {
			this.SelectedClass = '主题'
			this.Layout.layout_tree.set_Visible(true)
			this.Layout.refresh_Layout()
		},
		deactivated() {
			this.Layout.layout_tree.set_Visible(false)
			this.Layout.refresh_Layout()
		},
		methods: {
			set_Light_Theme(light) {
				let body_element = document.body
				if (light) {
					change_UITheme(body_element, 'light')
					this.Theme = 'light'
				}
				else {
					change_UITheme(body_element, 'dark')
					this.Theme = 'dark'
				}
			}
		},
		mounted() {
			this.Layout = new Layouter('PW_Setting', ['PW_Setting_ListPanel', 'PW_Setting_ItemPanel'])
			let PreviewPanel = new Panel('PW_Setting_ListPanel', '', null, false, true, 200, 400)
			let ModulePanel = new Panel('PW_Setting_ItemPanel', '', null, true, true, 400, 400)
			this.Layout.layout_tree.split([PreviewPanel, ModulePanel])
			this.Layout.format()
			// this.Layout.layout_tree.set_Visible(false)
			this.Layout.refresh_Layout()
			if (window.localStorage.theme !== undefined) {
				this.Theme = window.localStorage.theme
			}

			// this.set_Light_Theme(false)
		}
	}
</script>
<style scoped>

</style>