<template>
	<div class="cover" ref="PopupCover">
		<div class="Layout-Panel" ref="PopupPanel" style="width: 500px;">
			<div class="container"
				style="left: 12px; right: 12px; top: 12px; bottom: 12px; box-shadow: 0px 0px 20px 20px rgba(0,0,0,0.15);">
				<div class="v-box">
					<div class="topbar" style="overflow: visible;">
						<div class="tab selected">
							<svg class="button-icon-svg" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg"
								xmlns:xlink="http://www.w3.org/1999/xlink" overflow="hidden">
								<path
									d="M90.55 80 51.47 12C50.3711 10.0836 47.9267 9.42084 46.0103 10.5197 45.3942 10.873 44.8833 11.3839 44.53 12L5.45 80C4.34543 81.9132 5.00093 84.3595 6.9141 85.4641 7.52097 85.8145 8.20924 85.9993 8.91 86L87.09 86C89.2991 85.9977 91.0882 84.205 91.0859 81.9959 91.0852 81.2951 90.9004 80.6069 90.55 80ZM60.73 63.8C58.5781 69.0935 53.4441 72.5649 47.73 72.59 47.73 72.59 47.73 69.31 44.2 64.96 40.67 60.61 42.27 54.33 42.27 54.33 38.0823 58.3251 36.9149 64.5488 39.37 69.79 36.18 68.05 31.49 60.79 34.63 53.13 35.26 51.58 37.34 48.92 40.43 46.36 43.52 43.8 48.93 37.67 45.43 31 53.21 34.38 56.64 44.19 51.95 50.47 49.81 53.46 51 56.94 54 58 56.4901 58.9094 59.2459 57.6279 60.1553 55.1378 60.4708 54.2738 60.5314 53.3374 60.33 52.44 62.57 55.44 62.42 60.57 60.73 63.8Z" />
							</svg>
							<a class="tab-text" id="PopupTitle">确认</a>
						</div>
						<div class="filler" ref="PopupDrag"></div>
						<!-- <div class="button" @click="Popup.center()">
								<img class="button-icon" src="./assets/img/Pointer.svg" draggable="false" />
							</div> -->
						<div class="button" @click="close()">
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
					</div>

					<div style="width: 100%; height: 100%; position: relative;">
						<div class="container full">
							<div class="v-box" style="height: min-content;" ref="body">
								<div class="scroll-container flex" style="overflow: visible;">
									<div class="title1-dark">{{Input.title}}</div>
									<div v-if="Input.description !== ''" class="title-dark left"
										style="word-break: break-all; margin-left: 0px;">
										{{Input.description}}</div>
									<div class="filler"></div>
									<div class="listview-dark">
										<div class="form-container right gap">
											<div class="button-dark" @click="cancel()">
												<a class="button-text">取消</a>
											</div>
											<template v-if="Input.additional !== undefined">
												<div v-for="item in Input.additional" class="button-dark"
													@click="click(item.action)">
													<a class="button-text">{{item.title}}</a>
												</div>
											</template>
											<div class="button-dark" @click="confirm()">
												<svg class="button-icon-svg" viewBox="0 0 115 115"
													xmlns="http://www.w3.org/2000/svg"
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
						</div>
					</div>
				</div>

			</div>
			<div class="PopupResize" ref="PopupResize">
			</div>
		</div>
	</div>
</template>
<script>
	import * as Popup from '../Sun/Popup.js'

	export default {
		name: 'PF_FileDialogue',
		components: {
		},
		props: {
			PopupParam: {
				type: Object,
				default: () => { return { width: 800, height: 600, exclusive: true, center: true, resize: true } }
			},
			Self: {
			},
			Parent: {
			},
			Input: {
				type: Object,
				default: () => {
					return {
						additional: undefined
					}
				}
			},
			Handler: {
				type: Object,
				default: () => {
					return {
						resolve: undefined,
						reject: undefined
					}
				}
			}
		},
		data() {
			return {
				Popup: null
			}
		},
		computed: {
		},
		watch: {
		},
		methods: {
			confirm() {
				this.Handler.resolve(true);
				this.end();
			},
			cancel() {
				this.Handler.resolve(false);
				this.end();
			},
			close() {
				this.end()
			},
			end() {
				this.Popup.popup(false);
				this.Popup.release_Event();
				this.Handler.reject("Form_Closed");
				this.$emit("close", this.Self);
			},
			focus() {
				this.$emit('top')
			}
		},
		mounted() {
			let height = this.$refs.body.offsetHeight
			this.Popup = new Popup.PopupWindow(this.$refs.PopupCover, this.$refs.PopupDrag, this.$refs.PopupResize, this.$refs.PopupPanel, undefined, () => { }, () => { }, this.focus, true, -25, -25)
			this.Popup.set_Resizeable(false)
			this.Popup.resize(500, height + 67)
			this.Popup.center(true)
			this.Popup.popup(true, true)
		},
		beforeDestroy() {
			this.Handler.reject()
			this.Popup.release_Event()
		}
	}
</script>
<style scoped>
	.Layout-Panel {
		pointer-events: all;
	}
</style>