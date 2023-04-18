<template>
	<div class="container">
		<div class="v-box">
			<div class="topbar wrap" :style="ConsoleSize.height > 46? showhideStyle.show : showhideStyle.hide">
				<panel-switch-bar :Tabs="PanelTabs" :currentTab="'控制台'" :Width="PanelWidth" :Height="PanelHeight" />
				<div class="space6px" />
				<div v-show="outputArray.length > 0" class="bargroup nowrap"
					style="padding-bottom: 6px; overflow: hidden; align-items: center;">
					<div class="form-container vcenter " style="height: 30px;">
						<!-- <img class="tab-icon" src="../assets/img/Box.svg" draggable="false" /> -->
						<div :style="indicatorStyle[indicatorState]" />
						<!-- <a class="button-text">{{outputArray.length}}</a> -->
					</div>
					<div v-if="outputArray.length > 0 && outputArray[0].type === 'log' && !showed && ConsoleSize.height <= 46"
						class="title-dark" v-html="outputArray[0].title + ' : ' + outputArray[0].info"
						style="margin: 0px 6px; word-break: break-all; white-space: nowrap;">
					</div>
				</div>
				<!-- <div :class="{'tab': true, 'selected':currentTab==='大纲'}" @click="currentTab='大纲'">
					<img class="tab-icon" src="../assets/img/Scene.svg" draggable="false" />
					<a class="tab-text">大纲</a>
				</div> -->


				<div class="filler"></div>

				<!-- <div class="title-dark" v-show="!showed && outputArray.length > 0">
					{{outputArray.length > 0? outputArray[0].title+' '+ outputArray[0].info:''}}</div> -->
				<div class="bargroup smallgap" v-show="ConsoleSize.height > 46 && outputArray.length > 0">
					<div :class="{'button':true, 'left':true, 'selected':filter.log}" @click="filter.log = !filter.log"
						title="信息">
						<svg class="button-icon-svg" viewBox="0 0 87 88" xmlns="http://www.w3.org/2000/svg"
							xmlns:xlink="http://www.w3.org/1999/xlink" overflow="hidden">
							<g transform="translate(-368 -387)">
								<path
									d="M411 393C390.013 393 373 410.013 373 431 373 451.987 390.013 469 411 469 431.987 469 449 451.987 449 431 449 430.999 449 430.998 449 430.997 449.007 410.019 432.007 393.007 411.029 393 411.019 393 411.01 393 411 393ZM420.205 432.815C414.669 438.341 409.099 443.917 403.496 449.541 398.735 444.757 393.962 439.985 389.178 435.223L393.962 430.44 403.496 439.974C408.124 435.279 412.727 430.617 417.303 425.987 421.877 421.359 424.407 418.874 429.151 414.29 429.284 414.157 429.427 414.025 429.582 413.89 429.733 413.762 429.867 413.617 429.983 413.457L434.833 418.241C429.199 423.844 425.741 427.286 420.204 432.812Z" />
							</g>
						</svg>
					</div>
					<div :class="{'button':true, 'center':true, 'selected':filter.info}"
						@click="filter.info = !filter.info" title="警告">
						<svg class="button-icon-svg" viewBox="0 0 87 88" xmlns="http://www.w3.org/2000/svg"
							xmlns:xlink="http://www.w3.org/1999/xlink" overflow="hidden">
							<g transform="translate(-368 -387)">
								<path
									d="M411.001 393C390.014 392.999 373.001 410.012 373 430.999 372.999 451.986 390.012 468.999 410.999 469 431.986 469.001 448.999 451.988 449 431.001 449 431 449 430.998 449 430.997 449.008 410.02 432.01 393.008 411.033 393 411.022 393 411.012 393 411.001 393ZM414.933 451.507C414.51 452.496 413.721 453.285 412.732 453.708 412.223 453.924 411.675 454.035 411.122 454.032 410.018 454.034 408.958 453.598 408.175 452.818 407.798 452.44 407.496 451.994 407.286 451.503 407.068 450.993 406.958 450.445 406.961 449.891 406.958 448.786 407.395 447.726 408.175 446.943 409.793 445.321 412.42 445.318 414.042 446.936 414.044 446.938 414.047 446.941 414.05 446.943L414.05 446.943C414.429 447.324 414.731 447.775 414.939 448.271 415.156 448.784 415.266 449.335 415.264 449.891 415.266 450.446 415.153 450.995 414.933 451.505ZM418.466 433.938C415.733 435.586 414.045 438.528 414.003 441.72L407.999 441.72C408.035 436.463 410.785 431.598 415.269 428.856 419.029 426.499 420.166 421.541 417.809 417.781 415.453 414.022 410.494 412.885 406.735 415.241 404.39 416.711 402.966 419.285 402.968 422.052L396.965 422.052C396.962 414.3 403.244 408.013 410.997 408.01 418.749 408.007 425.037 414.289 425.039 422.042 425.041 426.873 422.558 431.366 418.466 433.936Z" />
							</g>
						</svg>
					</div>
					<div :class="{'button':true, 'right':true, 'selected':filter.error}"
						@click="filter.error = !filter.error" title="错误">
						<svg class="button-icon-svg" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg"
							xmlns:xlink="http://www.w3.org/1999/xlink" overflow="hidden">
							<path
								d="M90.55 80 51.47 12C50.3711 10.0836 47.9267 9.42084 46.0103 10.5197 45.3942 10.873 44.8833 11.3839 44.53 12L5.45 80C4.34543 81.9132 5.00093 84.3595 6.9141 85.4641 7.52097 85.8145 8.20924 85.9993 8.91 86L87.09 86C89.2991 85.9977 91.0882 84.205 91.0859 81.9959 91.0852 81.2951 90.9004 80.6069 90.55 80ZM60.73 63.8C58.5781 69.0935 53.4441 72.5649 47.73 72.59 47.73 72.59 47.73 69.31 44.2 64.96 40.67 60.61 42.27 54.33 42.27 54.33 38.0823 58.3251 36.9149 64.5488 39.37 69.79 36.18 68.05 31.49 60.79 34.63 53.13 35.26 51.58 37.34 48.92 40.43 46.36 43.52 43.8 48.93 37.67 45.43 31 53.21 34.38 56.64 44.19 51.95 50.47 49.81 53.46 51 56.94 54 58 56.4901 58.9094 59.2459 57.6279 60.1553 55.1378 60.4708 54.2738 60.5314 53.3374 60.33 52.44 62.57 55.44 62.42 60.57 60.73 63.8Z" />
						</svg>
					</div>
				</div>
				<div class="filler"></div>

				<div class="bargroup" v-show="ConsoleSize.height > 46 && outputArray.length > 0">
					<div class="button" @click="clear_Output()" title="清空输出栏">
						<svg class="button-icon-svg" viewBox="0 0 114 114" xmlns="http://www.w3.org/2000/svg"
							xmlns:xlink="http://www.w3.org/1999/xlink" overflow="hidden">
							<g transform="translate(-252 -261)">
								<path
									d="M340.25 288.833 322.542 288.833 322.542 283.625C322.542 279.563 319.313 276.333 315.25 276.333L302.75 276.333C298.688 276.333 295.458 279.563 295.458 283.625L295.458 288.833 277.75 288.833C275.458 288.833 273.583 290.708 273.583 293L273.583 297.167 344.417 297.167 344.417 293C344.417 290.708 342.542 288.833 340.25 288.833ZM301.708 283.625C301.708 283 302.125 282.583 302.75 282.583L315.25 282.583C315.875 282.583 316.292 283 316.292 283.625L316.292 288.833 301.708 288.833 301.708 283.625Z" />
								<path
									d="M279.833 355.5C279.833 357.792 281.708 359.667 284 359.667L334 359.667C336.292 359.667 338.167 357.792 338.167 355.5L338.167 301.333 279.833 301.333 279.833 355.5ZM322.542 307.583 328.792 307.583 328.792 353.417 322.542 353.417 322.542 307.583ZM305.875 307.583 312.125 307.583 312.125 353.417 305.875 353.417 305.875 307.583ZM289.208 307.583 295.458 307.583 295.458 353.417 289.208 353.417 289.208 307.583Z" />
							</g>
						</svg>
					</div>
				</div>
				<div class="button" @click="show_hide(!showed)" :title="showed? '折叠输出栏': '展开输出栏'">
					<svg v-if="showed" class="button-icon-svg" viewBox="0 0 116 116" xmlns="http://www.w3.org/2000/svg"
						xmlns:xlink="http://www.w3.org/1999/xlink" overflow="hidden">
						<g transform="translate(-239 -269)">
							<path d="M259 323 336 323 336 331 259 331 259 323Z" fill-rule="evenodd" />
						</g>
					</svg>
					<svg v-else class="button-icon-svg" viewBox="0 0 118 118" xmlns="http://www.w3.org/2000/svg"
						xmlns:xlink="http://www.w3.org/1999/xlink" overflow="hidden">
						<g transform="translate(-561 -534)">
							<path d="M619.188 549.025 619.188 635.145" stroke-width="9" stroke-miterlimit="8"
								fill-rule="evenodd" />
							<path d="M662.423 591.911 576.303 591.91" stroke-width="9" stroke-miterlimit="8"
								fill-rule="evenodd" />
						</g>
					</svg>
				</div>

			</div>
			<div class="scroll-container flex" v-show="ConsoleSize.height > 46">
				<div v-for="item, index in outputArray" v-if="filter[item.type]" class="listview-dark"
					:style="outputStyle[item.type].background">
					<div class="form-container">
						<div class="form-container icon">
							<svg v-if="item.type==='error'" class="icon-dark medium" viewBox="0 0 96 96"
								xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
								overflow="hidden" style="margin-left: 16px; fill:white;">
								<path
									d="M90.55 80 51.47 12C50.3711 10.0836 47.9267 9.42084 46.0103 10.5197 45.3942 10.873 44.8833 11.3839 44.53 12L5.45 80C4.34543 81.9132 5.00093 84.3595 6.9141 85.4641 7.52097 85.8145 8.20924 85.9993 8.91 86L87.09 86C89.2991 85.9977 91.0882 84.205 91.0859 81.9959 91.0852 81.2951 90.9004 80.6069 90.55 80ZM60.73 63.8C58.5781 69.0935 53.4441 72.5649 47.73 72.59 47.73 72.59 47.73 69.31 44.2 64.96 40.67 60.61 42.27 54.33 42.27 54.33 38.0823 58.3251 36.9149 64.5488 39.37 69.79 36.18 68.05 31.49 60.79 34.63 53.13 35.26 51.58 37.34 48.92 40.43 46.36 43.52 43.8 48.93 37.67 45.43 31 53.21 34.38 56.64 44.19 51.95 50.47 49.81 53.46 51 56.94 54 58 56.4901 58.9094 59.2459 57.6279 60.1553 55.1378 60.4708 54.2738 60.5314 53.3374 60.33 52.44 62.57 55.44 62.42 60.57 60.73 63.8Z" />
							</svg>
							<svg v-else-if="item.type==='info'" class="icon-dark medium" viewBox="0 0 87 88"
								xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
								overflow="hidden" style="margin-left: 16px; fill:black;">
								<g transform="translate(-368 -387)">
									<path
										d="M411.001 393C390.014 392.999 373.001 410.012 373 430.999 372.999 451.986 390.012 468.999 410.999 469 431.986 469.001 448.999 451.988 449 431.001 449 431 449 430.998 449 430.997 449.008 410.02 432.01 393.008 411.033 393 411.022 393 411.012 393 411.001 393ZM414.933 451.507C414.51 452.496 413.721 453.285 412.732 453.708 412.223 453.924 411.675 454.035 411.122 454.032 410.018 454.034 408.958 453.598 408.175 452.818 407.798 452.44 407.496 451.994 407.286 451.503 407.068 450.993 406.958 450.445 406.961 449.891 406.958 448.786 407.395 447.726 408.175 446.943 409.793 445.321 412.42 445.318 414.042 446.936 414.044 446.938 414.047 446.941 414.05 446.943L414.05 446.943C414.429 447.324 414.731 447.775 414.939 448.271 415.156 448.784 415.266 449.335 415.264 449.891 415.266 450.446 415.153 450.995 414.933 451.505ZM418.466 433.938C415.733 435.586 414.045 438.528 414.003 441.72L407.999 441.72C408.035 436.463 410.785 431.598 415.269 428.856 419.029 426.499 420.166 421.541 417.809 417.781 415.453 414.022 410.494 412.885 406.735 415.241 404.39 416.711 402.966 419.285 402.968 422.052L396.965 422.052C396.962 414.3 403.244 408.013 410.997 408.01 418.749 408.007 425.037 414.289 425.039 422.042 425.041 426.873 422.558 431.366 418.466 433.936Z" />
								</g>
							</svg>
							<svg v-else-if="item.type==='log'" class="icon-dark medium" viewBox="0 0 87 88"
								xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
								overflow="hidden" style="margin-left: 16px; fill:var(--FontColor);">
								<g transform="translate(-368 -387)">
									<path
										d="M411 393C390.013 393 373 410.013 373 431 373 451.987 390.013 469 411 469 431.987 469 449 451.987 449 431 449 430.999 449 430.998 449 430.997 449.007 410.019 432.007 393.007 411.029 393 411.019 393 411.01 393 411 393ZM420.205 432.815C414.669 438.341 409.099 443.917 403.496 449.541 398.735 444.757 393.962 439.985 389.178 435.223L393.962 430.44 403.496 439.974C408.124 435.279 412.727 430.617 417.303 425.987 421.877 421.359 424.407 418.874 429.151 414.29 429.284 414.157 429.427 414.025 429.582 413.89 429.733 413.762 429.867 413.617 429.983 413.457L434.833 418.241C429.199 423.844 425.741 427.286 420.204 432.812Z" />
								</g>
							</svg>
						</div>
						<div class="form-vcontainer sub gap">
							<div class="title-dark" :style="outputStyle[item.type].title" v-html="item.title"></div>
							<div class="title-dark" :style="outputStyle[item.type].info" v-html="item.info"></div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
<script>
	import PanelSwitchBar from './Sun/PanelSwitchBar'

	export default {
		name: 'Console',
		components: {
			'panel-switch-bar': PanelSwitchBar
		},
		props: {
			ConsoleSize: {
				type: Object,
				default: () => {
					return { x: 0, y: 0, width: 0, height: 0 }
				}
			},
			PanelTabs: {
				type: Array,
				default: () => {
					return [{ name: '控制台', panelid: 'ConsolePanel' }]
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
		data() {
			return {
				currentTab: "输出",
				showed: false,
				filter: { error: true, log: true, info: true },
				outputStyle: {
					error: {
						background: { "background-color": 'rgb(221, 59, 59)' },
						title: { "color": 'white', 'align-self': 'flex-start', "font-size": "14px", "word-break": "break-all", "margin-left": "0px", "font-weight": "normal", "user-select": "text" },
						info: { "color": 'white', 'align-self': 'flex-start', "font-size": "13px",/*  "word-break": "break-all", */ "margin-left": "0px", "line-height": "2", "user-select": "text" },
					},
					info: {
						background: { "background-color": 'rgb(240, 200, 97)' },
						title: { "color": 'black', 'align-self': 'flex-start', "font-size": "14px", "word-break": "break-all", "margin-left": "0px", "font-weight": "normal", "user-select": "text" },
						info: { "color": 'black', 'align-self': 'flex-start', "font-size": "13px", /* "word-break": "break-all",  */"margin-left": "0px", "line-height": "2", "user-select": "text" },
					},
					log: {
						background: {},
						title: { 'align-self': 'flex-start', "font-size": "14px", "word-break": "break-all", "margin-left": "0px", "font-weight": "normal", "user-select": "text" },
						info: { 'align-self': 'flex-start', "font-size": "13px", /*"word-break": "break-all",*/ "margin-left": "0px", "line-height": "2", "user-select": "text" },
					}
				},
				indicatorStyle: {
					error: {
						"width": "10px", "height": "10px", "border-radius": "50%", "background-color": 'rgb(255, 76, 76)', "margin": "0px 10px"
					},
					info: {
						"width": "10px", "height": "10px", "border-radius": "50%", "background-color": 'rgb(240, 200, 97)', "margin": "0px 10px"
					},
					log: {
						"width": "10px", "height": "10px", "border-radius": "50%", "background-color": 'var(--FontColor)', "margin": "0px 10px"
					}
				},
				indicatorState: 'log',
				showhideStyle: {
					show: { "border-radius": "var(--ContainerRadius) var(--ContainerRadius) 0 0", "flex-wrap": "nowrap" },
					hide: { "border-radius": "var(--ContainerRadius) var(--ContainerRadius) var(--ContainerRadius) var(--ContainerRadius)", "flex-wrap": "nowrap" }
				},
				outputArray: [],
				maxSize: 1000
			}
		},
		watch: {
		},
		methods: {
			show_hide(showed) {
				this.showed = showed
				if (showed) {
					this.$EventBus.$emit('console_show_hide', showed)
				}
				else {
					this.$EventBus.$emit('console_show_hide', showed)
				}
			},

			clear_Output() {
				this.outputArray.splice(0, this.outputArray.length)
				this.indicatorState = 'log'
			},

			add_Output(type = "log", title = undefined, info = undefined) {
				// //console.log(info)
				this.outputArray.unshift({ type: type, title: title, info: info })
				if (this.outputArray.length > this.maxSize) {
					this.outputArray.pop()
				}
				if (type === 'error') {
					this.indicatorState = 'error'
					this.show_hide(true)
				}
				else if (type === 'info') {
					this.indicatorState = 'info'
					// this.show_hide(true)
				}
			}
		},
		mounted() {
			this.$EventBus.$on('console_add_Output', (type, title, info) => {
				this.add_Output(type, title, info)
			})

		}
	}
</script>
<style scoped>

</style>
