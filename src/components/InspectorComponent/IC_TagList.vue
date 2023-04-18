<template>
	<div class="itemview-dark" @dblclick.self="selectId = -1; selectName = '';">
		<template v-for="item, idx in list">
			<div class="select-dark center" style="padding: 6px;">
				<a class="button-text">{{item}}</a>
				<svg class="icon-button" viewBox="0 0 115 116" xmlns="http://www.w3.org/2000/svg"
					xmlns:xlink="http://www.w3.org/1999/xlink" overflow="hidden" style="margin-right: 1px;"
					@click.stop="list.splice(idx, 1); update();">
					<g transform="translate(-561 -534)">
						<path d="M584 558 653.101 627.101" stroke-width="9" stroke-miterlimit="8" fill-rule="evenodd" />
						<path d="M653.101 557 584 626.101" stroke-width="9" stroke-miterlimit="8" fill-rule="evenodd" />
					</g>
				</svg>
			</div>

		</template>
		<div v-if="add === false" class="select-dark center"
			style="padding: 0px; min-height: 34px; background-color: transparent;">
			<svg class="icon-button" style="margin: 0px; align-self: center;" viewBox="0 0 118 118"
				xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" overflow="hidden"
				@click="add = true">
				<g transform="translate(-561 -534)">
					<path d="M619.188 549.025 619.188 635.145" stroke-width="9" stroke-miterlimit="8"
						fill-rule="evenodd" />
					<path d="M662.423 591.911 576.303 591.91" stroke-width="9" stroke-miterlimit="8"
						fill-rule="evenodd" />
				</g>
			</svg>
		</div>
		<div v-else class="select-dark center" style="padding: 0px;">
			<input class="lineedit-dark" style="height: 100%; min-height: 34px;" v-focus v-model="input"
				@change="add_Tag(input)" @blur="blur(input)">
		</div>

	</div>
</template>
<script>
	export default {//不仅要传tittle
		name: 'IC_TagList',
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
						list: []
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
				list: [],
				input: '',
				add: false
			}
		},
		watch: {
			itemvalue(newval, oldval) {
				this.init(newval)
			}
		},
		methods: {
			init(val) {
				this.list = val.list.map((i) => { return i })
			},
			add_Tag(tag) {
				if (!this.list.includes(tag)) {
					this.list.push(tag)
					this.add = false
					this.input = ''
					this.update()
				}
			},
			blur(tag) {
				this.add = false
				this.input = ''
			},
			update() {
				// //console.log(this.uid + "_inspectorUpdate")
				this.$emit('datachange', this.action, this.list.map((i) => { return i }))
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
