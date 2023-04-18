<template>
	<div class="form-vcontainer gap" style="flex: none;">
		<div v-if="itemvalue.allowinput" class="listview-dark">
			<div class="form-container gap" style="justify-content: flex-start;">
				<div class="form-vcontainer gap">
					<div class="form-container gap">
						<div class="form-container" style="min-width: 90px; max-width: 90px;">
							<div class="title-dark"
								style="text-align: left; margin-bottom: 0px; word-break: break-all;">属性
							</div>
						</div>
						<input class="lineedit-dark" style="flex: 1;" v-model="Key" />
					</div>
					<div class="form-container gap">
						<div class="form-container" style="min-width: 90px; max-width: 90px;">
							<div class="title-dark"
								style="text-align: left; margin-bottom: 0px; word-break: break-all;">键值
							</div>
						</div>
						<input class="lineedit-dark" style="flex: 1;" v-model="Value" />
					</div>
				</div>
				<div class="button-dark" style="height: auto;" @click="add_Property()">
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
		<div v-if="PropertyList.length > 0" class="listview-dark">
			<div class="form-vcontainer gap">
				<div v-for="(item, index) in PropertyList" class="form-container gap" style="align-items: unset;">
					<div class="form-container" style="min-width: 90px; max-width: 90px;">
						<div class="title-dark" style="text-align: left; margin-bottom: 0px; word-break: break-all;">
							{{item.key}}
						</div>
					</div>
					<div class="select-dark" style="flex: 1; justify-content: left; height: unset; min-width: 50px;"
						@click="Key = item.key; Value = item.value">
						<a class="button-text" style="text-align: left; word-break: break-all;">{{item.value}}</a>
					</div>
					<div v-if="itemvalue.allowinput && itemvalue.musthave.indexOf(item.key)===-1" class="button-dark"
						@click="delete_Property(index)" :key="item+'button'+index">
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
	</div>
</template>
<script>
	export default {//不仅要传tittle
		name: 'IC_PropertyList',
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
						allowinput: true,
						list: {},
						musthave: []
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
				PropertyList: [],
				Key: '',
				Value: ''
			}
		},
		watch: {
			itemvalue(newval, oldval) {
				this.init(newval)
			}
		},
		methods: {
			init(val) {
				this.PropertyList = this.to_Array(val.list)
			},
			add_Property() {
				if (this.Key !== '' && this.Value !== '') {
					for (let i = 0; i < this.PropertyList.length; i++) {
						if (this.PropertyList[i].key === this.Key) {
							if (this.PropertyList[i].value === this.Value) {
								return
							}
							this.PropertyList.splice(i, 1, { key: this.Key, value: this.Value })
							this.update()
							return
						}
					}
					this.PropertyList.push({ key: this.Key, value: this.Value })
					this.update()
				}
			},
			delete_Property(index) {
				this.PropertyList.splice(index, 1)
				this.update()
			},
			to_Array(object) {
				let list = new Array()
				for (let item in object) {
					// //console.log(item, ":", object[item])
					list.push({ key: item, value: object[item] })
				}
				return list
			},
			to_Object(list) {
				let object = {}
				list.forEach((pair) => {
					object[pair.key] = pair.value
				})
				return object
			},
			update() {
				// //console.log(this.uid + "_inspectorUpdate")
				this.$emit('datachange', this.action, this.to_Object(this.PropertyList))
				// this.$EventBus.$emit(this.uid + "_inspectorUpdate", this.action, this.to_Object(this.PropertyList))
			}
		},
		mounted() {
			this.init(this.itemvalue)
		}
	}
</script>
<style>
</style>
