// three.js初始化工具箱
// 包括以下功能：
// 场景初始化、相机初始化、光源初始化、渲染器初始化、控制器初始化
// 在ModelDisplay.vue 中用到

import * as THREE from 'three'
import Stats from 'stats-js' // 检测动画运行时的帧数

// 创建相机
function initCamera() {
	this.axisscene = new THREE.Scene()
	let axisHelperX = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, 0), 80, 0xff0000, 10, 10)
	let axisHelperY = new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 0), 80, 0x00ff00, 10, 10)
	let axisHelperZ = new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, 0), 80, 0x3d85ff, 10, 10)
	axisHelperX.position.x = -40
	axisHelperY.position.y = -40
	axisHelperZ.position.z = -40
	// let geometry = new THREE.TorusGeometry(28, 0.4, 16, 100)
	// let angleHelperX = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 1 }))
	// let angleHelperY = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: 0x00aa00, transparent: true, opacity: 1 }))
	// let angleHelperZ = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: 0x3d85ff, transparent: true, opacity: 1 }))
	// angleHelperX.rotation.set(0, Math.PI / 2, 0)
	// angleHelperY.rotation.set(Math.PI / 2, 0, 0)
	// angleHelperZ.rotation.set(0, 0, 0)
	this.axisscene.add(axisHelperX)
	this.axisscene.add(axisHelperY)
	this.axisscene.add(axisHelperZ)
	// this.axisscene.add(angleHelperX)
	// this.axisscene.add(angleHelperY)
	// this.axisscene.add(angleHelperZ)
	this.axiscamera = new THREE.OrthographicCamera(-40, 40, 40, -40, 0.0000001, 100000)
	this.axiscamera.position.set(40, 0, 0)
	this.axiscamera.zoom = 10
	this.axisscene.add(this.axiscamera)
}

// 创建渲染器
function initRenderer() {
	this.container = document.getElementById('Canvas-Show')
	// antialias:true增加抗锯齿效果
	this.$static.Renderer = new THREE.WebGLRenderer({
		canvas: document.getElementById('Canvas-Show-Canvas'),
		antialias: true,
		alpha: false
		// logarithmicDepthBuffer: true
	})
	this.$static.Renderer.setClearColor(new THREE.Color('#424242')) // 设置窗口背景颜色
	this.$static.Renderer.setSize(this.container.offsetWidth, this.container.offsetHeight) // 设置窗口尺寸
	this.$static.Renderer.setPixelRatio(1.25)
	// 阴影效果
	this.$static.Renderer.shadowMap.enabled = true
	this.$static.Renderer.shadowMap.type = THREE.PCFSoftShadowMap

	// antialias:true增加抗锯齿效果
	this.axisrenderer = new THREE.WebGLRenderer({
		antialias: true,
		alpha: true
	})
	this.axisrenderer.setClearColor(new THREE.Color('#ffffff'), 0) // 设置窗口背景颜色
	this.axisrenderer.setSize(80, 80) // 设置窗口尺寸
	this.axisrenderer.setPixelRatio(2)
	// 阴影效果
}

// 创建帧率监控
function initStats() {
	let stats = new Stats()
	this.stats = stats
	stats.domElement.style.position = 'unset'
	document.getElementById('Stats-output-show').appendChild(stats.domElement)
}

export default {
	initCamera,
	initRenderer,
	initStats
}
