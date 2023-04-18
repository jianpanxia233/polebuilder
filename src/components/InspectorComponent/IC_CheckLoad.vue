<template>
	<div :class="{'listview-dark':true, 'selected': itemvalue.selected, 'border': true}" style="padding: 6px;">
		<div class="form-vcontainer" style="gap: 8px;">
			<div v-if="title!==''" class="form-container">
				<svg class="icon-dark" :style="{'fill': get_ValidColor,
				'stroke': get_ValidColor}" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg"
					xmlns:xlink="http://www.w3.org/1999/xlink" id="Icons_BeachBall" overflow="hidden">
					<path
						d="M60.1 77.6C62 71 63 64.1 63 57 63 52.5 62.6 48.1 61.8 43.8 64.9 43.1 67.3 40.6 67.9 37.5 71.8 38.5 75.6 39.6 79.2 41 79.7 43.3 80 45.6 80 48.1 80 61.3 71.8 72.8 60.1 77.6ZM18.3 36.1C25.3 34.7 32.6 34 40 34 44.1 34 48.1 34.2 52.1 34.7 52 35.1 52 35.5 52 36 52 38.4 53.1 40.6 54.8 42 45.9 52.5 35.7 61.7 24.4 69.5 19.2 63.8 16 56.3 16 48 16 43.8 16.8 39.8 18.3 36.1ZM60 40C57.8 40 56 38.2 56 36 56 33.8 57.8 32 60 32 62.2 32 64 33.8 64 36 64 38.2 62.2 40 60 40ZM71.3 26.1C69.4 27.5 67.6 29 65.8 30.5 64.3 29 62.3 28 60 28 59.1 28 58.2 28.2 57.4 28.4 55.6 24.1 53.5 20 51 16.1 59 16.9 66.1 20.6 71.3 26.1ZM48 10C27 10 10 27 10 48 10 69 27 86 48 86 69 86 86 69 86 48 86 27 69 10 48 10Z" />
				</svg>
				<div class="title-dark" :style="{'text-align': 'left', 'flex': '1', 'color': get_ValidColor}">
					{{title + ' '}}<span style="color: var(--BarColorTransparent);">{{itemvalue.uid}}</span></div>
				<!-- <div class="button-dark" style="height: auto;" @click="update()">
				<svg class="button-icon-svg" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"
					p-id="1713" xmlns:xlink="http://www.w3.org/1999/xlink" width="128" height="128">
					<path
						d="M950.81472 129.536l-56.46336-56.5248a92.16 92.16 0 0 0-130.29376 0l-131.072 131.1744-63.35488-63.3856L444.29312 266.24l52.224 52.224-357.84704 357.9904a131.44064 131.44064 0 0 0-38.3488 85.8112l-20.8384 20.7872A114.21696 114.21696 0 0 0 240.9472 944.64l20.81792-20.8896a130.64192 130.64192 0 0 0 85.85216-38.2976l357.84704-357.9904 52.224 52.224 125.34784-125.3376-63.34464-63.3856 131.072-131.072a92.16 92.16 0 0 0 0.0512-130.3552zM289.7408 827.4944a49.84832 49.84832 0 0 1-57.088 9.6256l-49.57184 49.5616a32.3072 32.3072 0 0 1-45.71136-45.6704l49.55136-49.664a49.87904 49.87904 0 0 1 9.60512-57.0368l357.84704-357.9904 93.184 93.2864z">
					</path>
				</svg>
			</div> -->
			</div>
			<div class="form-container">
				<div
					style="flex: 1; height: 18px; background-color: var(--ContainerColor); border-radius: var(--ObjectRadius); overflow: hidden;">
					<div :style="{'width': get_Percent, 'height': '18px', 'background-color': get_Color}">
					</div>
				</div>
			</div>
			<div class="form-container">
				<div class="title-dark noleftmargin">额定：{{itemvalue.max}} kN/㎡</div>
				<div class="title-dark noleftmargin">现有：{{itemvalue.value}} kN/㎡</div>
			</div>
		</div>
	</div>
</template>
<script>
	export default {//不仅要传tittle
		name: 'IC_Vector3',
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
						value: 100,
						max: 200,
						uid: BigInt(-1),
						valid: true,
						selected: false
					}
				}
			},
			action: {
				type: String,
				default: "未定"
			}
		},
		data() {
			return {
			}
		},
		computed: {
			get_Percent: function () {
				return this.clamp(this.itemvalue.value / this.itemvalue.max, 0, 1) * 100 + "%"
			},
			get_Color: function () {
				let percent = this.clamp(this.itemvalue.value / this.itemvalue.max, 0, 1)
				if (percent <= 0.5) return 'rgb(82, 179, 109)'
				else if (percent <= 0.75) return '#ffb52a'
				else return 'rgb(255,34,34)'
			},
			get_ValidColor: function () {
				if (this.itemvalue.valid) return 'var(--FontColor)'
				else return 'rgb(255,34,34)'
			}
		},
		watch: {
		},
		methods: {
			clamp(x, min, max) {
				return Math.min(max, Math.max(min, x))
			},
			update() {
				this.$emit('datachange', this.action, this.itemvalue.uid)
				// this.$EventBus.$emit(this.uid + "_inspectorUpdate", this.action, this.itemvalue.uid)
			},
		},
		mounted() {
		}
	}
</script>
<style scoped>
	.listview-dark.selected {
		border-width: 4px;
		border-color: var(--ThemeColor);
		border-style: solid;
	}
</style>