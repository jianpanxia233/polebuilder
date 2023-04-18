<template>
	<div style="width: 100%; height: 100%; position: relative;">
		<div class="container full">
			<div class="v-box">
				<div class="scroll-container flex" style="gap: 0px;">
					<div class="title1-dark">{{Input.title}}</div>
					<div class="form-vcontainer vcenter left flex gap">
						<div
							style="background-color: var(--ObjectBGColor); width: 100%; height: 16px; border-radius: 8px; overflow: hidden;">
							<div style="background-color: var(--ThemeColor); height: 16px;"
								:style="{'width': `${Input.progress}%`}">
							</div>
						</div>
						<div class="title-dark left">{{Input.progress}}/100</div>
					</div>
				</div>

			</div>
		</div>
	</div>
</template>
<script>
	export default {
		name: 'PW_Progress',
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