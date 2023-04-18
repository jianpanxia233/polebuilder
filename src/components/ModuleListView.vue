<template>
	<div :class="{'select-dark': true, 'selected': actived}" style="width: 100%; "
		@click="clicked(ModuleName, ModuleUID)" :draggable="Draggable" @dragend="dragend(ModuleName, ModuleUID)"
		@dragstart="dragstart($event)" @mousedown.right.stop="rightclick()">
		<svg class="button-icon-svg" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg"
			xmlns:xlink="http://www.w3.org/1999/xlink" id="Icons_BeachBall" overflow="hidden"
			style="margin: 6px; position: static;">
			<path
				d="M60.1 77.6C62 71 63 64.1 63 57 63 52.5 62.6 48.1 61.8 43.8 64.9 43.1 67.3 40.6 67.9 37.5 71.8 38.5 75.6 39.6 79.2 41 79.7 43.3 80 45.6 80 48.1 80 61.3 71.8 72.8 60.1 77.6ZM18.3 36.1C25.3 34.7 32.6 34 40 34 44.1 34 48.1 34.2 52.1 34.7 52 35.1 52 35.5 52 36 52 38.4 53.1 40.6 54.8 42 45.9 52.5 35.7 61.7 24.4 69.5 19.2 63.8 16 56.3 16 48 16 43.8 16.8 39.8 18.3 36.1ZM60 40C57.8 40 56 38.2 56 36 56 33.8 57.8 32 60 32 62.2 32 64 33.8 64 36 64 38.2 62.2 40 60 40ZM71.3 26.1C69.4 27.5 67.6 29 65.8 30.5 64.3 29 62.3 28 60 28 59.1 28 58.2 28.2 57.4 28.4 55.6 24.1 53.5 20 51 16.1 59 16.9 66.1 20.6 71.3 26.1ZM48 10C27 10 10 27 10 48 10 69 27 86 48 86 69 86 86 69 86 48 86 27 69 10 48 10Z" />
		</svg>
		<a class="button-text" style="text-align: left;">{{ModuleName}}</a>
		<div style="flex: 1;"></div>
		<a class="button-text" style="color: var(--BarColorTransparent); text-align: left;">{{ModuleUID}}</a>
	</div>
	</div>
</template>
<script>
	// import * as THREE from "three";
	// import STLLoader from 'three-stl-net-loader';
	import staticData from './Sun/StaticData.js';
	// let loader = new STLLoader();
	// loader.setWithCredentials(false);

	export default {
		mixins: [staticData],
		name: 'ModuleListView',
		static() {
			return {
				test: '1234'
			}
		},
		props: ['ModuleName', 'ModuleUID', 'ModuleViewID', 'ShowName', 'Draggable', 'ModuleSrc', 'actived', 'Grouped', 'ImageUrl', 'Component'],
		data() {
			return {

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
				if (this.Component !== null)
					this.$EventBus.$emit('contextmenu_open', 'app', [this.ShowName, '-', { text: '加载至资源管理器', icon: 'blank', action: 'component_add' }, { text: '<a style="color: var(--ElementColorRed);">删除</a>', icon: 'delete', action: 'component_delete' }], this.Component, event.clientX, event.clientY, 2)
			}
		},
		mounted() {

		}
	}
</script>
<style>
</style>