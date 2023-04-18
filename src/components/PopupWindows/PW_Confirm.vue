<template>
	<div id="PW_Confirm" style="width: 100%; height: 100%; position: relative;">
		<div class="container full">
			<div class="v-box">
				<div class="scroll-container flex">
					<div class="title1-dark">{{Input.title}}</div>
					<div v-if="Input.description !== ''" class="title-dark left"
						style="word-break: break-all; margin-left: 3px;">
						{{Input.description}}</div>
					<div class="filler"></div>
					<div class="listview-dark">
						<div class="form-container right gap">
							<div class="button-dark" @click="cancel()">
								<a class="button-text">取消</a>
							</div>
							<template v-if="Input.additional !== undefined">
								<div v-for="item in Input.additional" class="button-dark" @click="click(item.action)">
									<a class="button-text">{{item.title}}</a>
								</div>
							</template>
							<div class="button-dark" @click="confirm()">
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
		</div>
	</div>
</template>
<script>
	export default {
		name: 'PW_Confirm',
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
						description: 'description',
						action: 'unknown',
						data: -1
					}
				}
			}
		},
		data() {
			return {
			}
		},
		watch: {
		},
		activated() {
		},
		deactivated() {
		},
		methods: {
			click(action) {
				if (action[0] === '@') {
					this.$EventBus.$emit(this.Parent + '_PopupWindow', action.slice(1), true, this.Input.data)
				}
				else {
					this.$EventBus.$emit(action, true, this.Input.data)
				}
				this.$EventBus.$emit('app_close_Popup')
			},
			confirm() {
				if (this.Input.action[0] === '@') {
					this.$EventBus.$emit(this.Parent + '_PopupWindow', this.Input.action.slice(1), true, this.Input.data)
				}
				else {
					this.$EventBus.$emit(this.Input.action, true, this.Input.data)
				}
				this.$EventBus.$emit('app_close_Popup')
			},
			cancel() {
				if (this.Input.action[0] === '@') {
					this.$EventBus.$emit(this.Parent + '_PopupWindow', this.Input.action.slice(1), false, this.Input.data)
				}
				else {
					this.$EventBus.$emit(this.Input.action, false, this.Input.data)
				}
				this.$EventBus.$emit('app_close_Popup')
			}
		},
		mounted() {
		}
	}
</script>
<style scoped>

</style>