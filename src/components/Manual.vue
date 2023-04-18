<template>
	<div class="container" id="Manual">
		<div class="v-box">
			<div class="topbar" id="Manual-toolbar">
				<panel-switch-bar :Tabs="PanelTabs" :currentTab="'手册'" :Width="PanelWidth" :Height="PanelHeight" />
			</div>
			<div class="scroll-container flex">
				<iframe src=".././static/manual.html"
					style="flex: 1; width: 100%; margin-bottom: 6px; box-sizing: border-box; border: none; border-radius: var(--ObjectBGRadius);"></iframe>
			</div>
		</div>
	</div>
</template>
<script>
	import PanelSwitchBar from './Sun/PanelSwitchBar'

	export default {
		name: 'Manual',
		components: {
			'panel-switch-bar': PanelSwitchBar
		},//监听事件总线，列表
		props: {
			PanelTabs: {
				type: Array,
				default: () => {
					return [{ name: '检视器', panelid: 'InspectorPanel' }]
				}
			},
			PanelWidth: {
				type: Number,
				default: 100
			},
			PanelHeight: {
				type: Number,
				default: 100
			}
		},
		data() {
			return {

			}
		},
		computed: {

		},
		methods: {},
		mounted() {

		}
	}
</script>
<style scoped>

</style>