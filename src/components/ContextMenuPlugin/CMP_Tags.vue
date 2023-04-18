<template>
	<div class="form-container vcenter gap right"
		style="padding: 5px 12px 5px 10px; min-height: 33px; max-height: 30px; flex-wrap: nowrap; background-color: transparent;">
		<div class="cmp-tags" :class="{'selected': selected===0}" style=" background-color: rgb(230, 53, 53);"
			@click="click(0)"></div>
		<div class="cmp-tags" :class="{'selected': selected===1}" style="background-color: rgb(231, 102, 9);"
			@click="click(1)"></div>
		<div class="cmp-tags" :class="{'selected': selected===2}" style="background-color: rgb(255, 238, 0);"
			@click="click(2)"></div>
		<div class="cmp-tags" :class="{'selected': selected===3}" style="background-color: rgb(42, 190, 67);"
			@click="click(3)"></div>
		<div class="cmp-tags" :class="{'selected': selected===4}" style="background-color: rgb(0, 162, 255);"
			@click="click(4)"></div>
		<div class="cmp-tags" :class="{'selected': selected===5}" style="background-color: rgb(48, 28, 224);"
			@click="click(5)"></div>
		<div class="cmp-tags" :class="{'selected': selected===6}" style="background-color: rgb(219, 71, 212);"
			@click="click(6)"></div>
	</div>
	</div>
</template>
<script>
	export default {//不仅要传tittle
		name: 'CMP_Tags',
		props: {
			uid: {
				type: String,
				default: "none"
			},
			data: {
				type: Object,
				default: () => {
					return {
						selected: -1,
						oninput: false
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
				selected: -1
			}
		},
		watch: {
			data(newval) {
				this.init(newval)
			}
		},
		methods: {
			init(val) {
				this.selected = val.selected
			},
			update(item) {
				this.$emit('datachange', this.action, item)
				// this.$EventBus.$emit(this.uid + "_inspectorUpdate", this.action, item)
			},
			click(id) {
				console.log(">>>>>>", this.data)
				if (this.data.oninput !== undefined && this.data.oninput) {
					this.selected = id
					this.$emit('ContextmenuClick', this.action, id)
					return
				}
				if (this.selected !== id) {
					this.selected = id
					this.$emit('ContextmenuClick', this.action, id)
				}
			}
		},
		mounted() {
			this.init(this.data)
		}
	}
</script>
<style scoped>
	.cmp-tags {
		width: 15px;
		height: 15px;
		margin: 2px;
		border-radius: 50%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		/* transition: all 0.1s; */
	}

	.cmp-tags.selected {
		width: 19px;
		margin: 0px;
		height: 19px;
	}

	.cmp-tags:hover {
		opacity: 60%;
	}

	.cmp-tags.selected:hover {
		opacity: 100%;
	}

	.cmp-tags::after {
		content: '';
		width: 0px;
		height: 0px;
		background-color: black;
		/* transition: all 0.1s; */
	}

	.cmp-tags.selected::after {
		content: '';
		width: 8px;
		height: 8px;
		background-color: black;
		border-radius: 50%;
		background-color: var(--PanelColor);
	}
</style>