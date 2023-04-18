<template>
	<div class="form-vcontainer gap" style="flex: none;">
		<div v-if="itemvalue.allowinput || itemvalue.allowadd" class="listview-dark">
			<div v-if="itemvalue.allowinput || itemvalue.allowadd" class="form-container gap"
				style="justify-content: flex-start;">
				<input v-if="itemvalue.allowinput" class="lineedit-dark" style="flex: 1;" v-model="input" />
				<div v-else class="filler"></div>
				<div v-if="itemvalue.allowinput || itemvalue.allowadd" class="button-dark" @click="add">
					<svg class="button-icon-svg" viewBox="0 0 118 118" xmlns="http://www.w3.org/2000/svg"
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
		</div>
		<div v-if="itemvalue.list.length > 0" class="listview-dark">
			<div class="form-vcontainer gap">
				<div v-for="(item, index) in itemvalue.list" class="form-container gap" style="align-items: unset;">
					<div class="select-dark" style="flex: 1; justify-content: left; height: unset;"
						@click="update(item)" :key="item+index">
						<a class="button-text" style="text-align: left;">{{item.text===undefined? item:item.text}}</a>
					</div>
					<div v-if="itemvalue.allowdelete" class="button-dark" :key="item+'button'+index"
						@click="delete_Item(item)">
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
			</div>
		</div>
		<div v-else-if="itemvalue.showempty" class="listview-dark">
			<div class="form-vcontainer center" style="color: white; justify-content: center;min-height: 37px;">
				<div class="title-dark center">空</div>
			</div>
		</div>
	</div>
</template>
<script>
	export default {//不仅要传tittle
		name: 'IC_List',
		props: {
			uid: {
				type: String,
				default: "none"
			},
			title: {
				type: String,
				default: "未命名项"
			},
			itemvalue: {
				type: Object,
				default: () => {
					return {
						list: [],
						allowdelete: true,
						allowinput: true,
						allowadd: true,
						showempty: false
						// allowselect: false
					}
				}
			},
			action: {
				type: String,
				default: "未定"
			},
		},
		data() {
			return {
				input: ''
			}
		},
		watch: {
		},
		methods: {
			add() {
				this.$emit('datachange', this.action, { action: 'add', value: this.input })
				// this.$EventBus.$emit(this.uid + "_inspectorUpdate", this.action, { action: 'add', value: this.input })
				// this.input = ''
			},

			update(item) {
				if (this.selectitem !== item)
					this.$emit('datachange', this.action, { action: 'click', value: item })
				// this.$EventBus.$emit(this.uid + "_inspectorUpdate", this.action, item)
			},

			delete_Item(item) {
				this.$emit('datachange', this.action, { action: 'delete', value: item })
				// this.$EventBus.$emit(this.uid + "_inspectorUpdate", this.action, { action: 'delete', value: item })
			}
		},
		mounted() {
		}
	}
</script>
<style>
</style>