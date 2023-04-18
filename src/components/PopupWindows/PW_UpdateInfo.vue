<template>
	<div id="PW_UpdateInfo" style="width: 100%; height: 100%; position: relative;">
		<div class="container full">
			<div class="v-box">
				<div class="scroll-container flex">
					<div class="title1-dark">{{Input.title}}</div>
					<div v-if="Input.description !== ''" class="title-dark left noleftmargin"
						style="word-break: break-all; font-size: 20px;" v-html="Input.description"></div>
				</div>
			</div>
		</div>
	</div>
</template>
<script>
	export default {
		name: 'PW_UpdateInfo',
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
						description: 'description'
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

		},
		mounted() {
		}
	}
</script>
<style scoped>

</style>