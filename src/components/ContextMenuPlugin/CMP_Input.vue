<template>
	<div class="form-container vcenter gap right"
		style="padding: 5px 10px 5px 10px; min-height: 50px; max-height: 50px; flex-wrap: nowrap; background-color: transparent;">
		<input type="number" class="lineedit-dark">
	</div>
	</div>
</template>
<script>
	export default {//不仅要传tittle
		name: 'CMP_Input',
		props: {
			uid: {
				type: String,
				default: "none"
			},
			data: {
				type: Object,
				default: () => {
					return {
						selected: -1
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
		width: 12px;
		height: 12px;
		margin: 2px;
		border-radius: 50%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		/* transition: all 0.1s; */
	}

	.cmp-tags.selected {
		width: 16px;
		margin: 0px;
		height: 16px;
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