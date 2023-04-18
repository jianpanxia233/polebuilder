<template>
	<div :class="{'item-dark': true, 'selected': actived}" style="width: 110px; min-height: 180px;"
		@click="clicked(ModuleName, ModuleUID)" :draggable="Draggable" @dragend="dragend(ModuleName, ModuleUID)"
		@dragstart="dragstart($event)" @mousedown.right.stop="rightclick()">
		<div class="form-vcontainer gap">
			<div :id="'moduleview_container'+ModuleViewID" class="moduleview_container"
				style="background-color: var(--ThemeColor); display: flex;"
				:style="{'background-image': ModuleSrc.classification==='贴图'?`url(${ModuleSrc.url})`:'unset'}">
				<svg v-if="Grouped" class="button-icon-svg" viewBox="-20 -40 1084 1084" version="1.1"
					xmlns="http://www.w3.org/2000/svg" p-id="5163" xmlns:xlink="http://www.w3.org/1999/xlink"
					overflow="hidden" style="margin: 6px;">
					<path
						d="M490.666667 716.8h401.066666c25.6 0 46.933333 21.333333 46.933334 51.2v76.8c0 25.6-21.333333 51.2-46.933334 51.2h-401.066666c-25.6 0-46.933333-21.333333-46.933334-51.2v-8.533333H174.933333c-17.066667 0-29.866667-12.8-29.866666-29.866667V307.2h-12.8C106.666667 307.2 85.333333 281.6 85.333333 256V179.2C85.333333 149.333333 106.666667 128 132.266667 128H213.333333c25.6 0 46.933333 21.333333 46.933334 51.2V256c0 25.6-21.333333 51.2-46.933334 51.2h-12.8v179.2h238.933334v-8.533333c0-25.6 21.333333-51.2 46.933333-51.2h401.066667c25.6 0 46.933333 21.333333 46.933333 51.2V554.666667c0 25.6-21.333333 51.2-46.933333 51.2h-401.066667c-25.6 0-46.933333-21.333333-46.933333-51.2v-8.533334H200.533333v234.666667h238.933334V768c0-25.6 21.333333-51.2 51.2-51.2z m401.066666-409.6H366.933333c-29.866667 0-51.2-25.6-51.2-51.2V179.2c0-29.866667 21.333333-51.2 51.2-51.2h524.8c25.6 0 46.933333 21.333333 46.933334 51.2V256c0 25.6-21.333333 51.2-46.933334 51.2z">
					</path>
				</svg>
				<svg v-else class="button-icon-svg" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg"
					xmlns:xlink="http://www.w3.org/1999/xlink" id="Icons_BeachBall" overflow="hidden"
					style="margin: 6px;">
					<path
						d="M60.1 77.6C62 71 63 64.1 63 57 63 52.5 62.6 48.1 61.8 43.8 64.9 43.1 67.3 40.6 67.9 37.5 71.8 38.5 75.6 39.6 79.2 41 79.7 43.3 80 45.6 80 48.1 80 61.3 71.8 72.8 60.1 77.6ZM18.3 36.1C25.3 34.7 32.6 34 40 34 44.1 34 48.1 34.2 52.1 34.7 52 35.1 52 35.5 52 36 52 38.4 53.1 40.6 54.8 42 45.9 52.5 35.7 61.7 24.4 69.5 19.2 63.8 16 56.3 16 48 16 43.8 16.8 39.8 18.3 36.1ZM60 40C57.8 40 56 38.2 56 36 56 33.8 57.8 32 60 32 62.2 32 64 33.8 64 36 64 38.2 62.2 40 60 40ZM71.3 26.1C69.4 27.5 67.6 29 65.8 30.5 64.3 29 62.3 28 60 28 59.1 28 58.2 28.2 57.4 28.4 55.6 24.1 53.5 20 51 16.1 59 16.9 66.1 20.6 71.3 26.1ZM48 10C27 10 10 27 10 48 10 69 27 86 48 86 69 86 86 69 86 48 86 27 69 10 48 10Z" />
				</svg>
			</div>
			<div class="title-dark noleftmargin left" style="word-break: break-all;">{{ShowName}}</div>
		</div>
	</div>
</template>
<script>
	export default {
		name: 'ModuleView',
		props: ['ModuleName', 'ModuleUID', 'ModuleViewID', 'ShowName', 'Draggable', 'ModuleSrc', 'actived', 'Grouped', 'Component', 'StandardType'],
		data() {
			return {

				width: 110,
				height: 110,
				margin: 200,

			}
		},
		watch: {
		},
		methods: {
			clicked: function (modulename, moduleuid) {
				//console.log(this.$static.test)

				if (!this.Draggable)
					this.$emit('clicked', modulename, moduleuid)
			},
			dragend: function (modulename, moduleuid) {
				// //console.log(event)
				this.$emit('dragended', modulename, moduleuid, event)
			},
			dragstart: function (event) {
				if (event.ctrlKey) {
					event.preventDefault()
				}
			},
			rightclick() {
				let del_func_name = 'component_delete' + this.StandardType
				this.$EventBus.$emit('contextmenu_open', 'app',
					[this.ShowName, '-', { text: '加载至资源管理器', icon: 'blank', action: 'component_add' },
					{ text: '<a style="color: var(--ElementColorRed);">删除</a>', icon: 'delete', action: del_func_name }],
					this.Component, event.clientX, event.clientY, 2)
			}
		},
		mounted() {

		}
	}
</script>
<style>
	.moduleview_container {
		width: 110px;
		height: 110px;
		/* margin: 0px 0px 6px 6px; */
		border-radius: var(--ObjectRadius);
		/* background-color: var(--ThemeColor); */
	}

	.moduleview_container>canvas {
		width: 110px;
		height: 110px;
		/* margin: 0px 0px 6px 6px; */
		border-radius: var(--ObjectRadius);
		/* background-color: var(--ThemeColor); */
	}
</style>