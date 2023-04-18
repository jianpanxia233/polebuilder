import * as THREE from 'three'
import TransformControls from 'three-transformcontrols'
import OrbitControls from 'three-orbitcontrols'

// 创建场景
function initScene() {
	this.Scene = new THREE.Scene()
	this.ObjectOrigin = new THREE.Object3D()
	this.Scene.add(this.ObjectOrigin)

	this.GroundGridHelper = new THREE.GridHelper(20, 20, '#000000')
	this.Scene.add(this.GroundGridHelper)

	this.BoundingBox = new THREE.Box3().setFromObject(this.Scene)

	this.AxisHelper = new THREE.Object3D()
	this.Scene.add(this.AxisHelper)
	this.AxisHelper.add(new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, 0), 20, 0xff0000, 1, 1))
	// this.AxisHelper.add(new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 0), 20, 0x00ff00, 1, 1))
	this.AxisHelper.add(new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, 0), 20, 0x0000ff, 1, 1))

	// let loader = new THREE.FontLoader()

	// loader.load('./Fira Code Medium_Regular', function (font) {

	// 	let textgeometry = new THREE.TextGeometry('Hello three.js!', {
	// 		font: font,
	// 		size: 80,
	// 		height: 5,
	// 		curveSegments: 12,
	// 		bevelEnabled: true,
	// 		bevelThickness: 10,
	// 		bevelSize: 8,
	// 		bevelOffset: 0,
	// 		bevelSegments: 5
	// 	})

	// 	this.Scene.add(new THREE.Mesh(textgeometry, new THREE.MeshBasicMaterial({ color: "#00ff00" })))
	// })

}

// 创建相机
function initCamera() {
	let width = 100
	let height = 100
	this.PerspectiveCamera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000)
	this.OrthographicCamera = new THREE.OrthographicCamera(width / -2, width / 2, height / 2, height / -2, 0.0001, 100000)
	this.Camera = this.PerspectiveCamera
	this.Camera.position.set(20, 20, 20)

	// this.camera.lookAt(new THREE.Vector3(0, 80, 0))
	this.Scene.add(this.PerspectiveCamera)
	this.Scene.add(this.OrthographicCamera)
}

// 添加光源
function initLight() {
	// 添加环境光
	this.HemisphereLight = new THREE.HemisphereLight(0xffffff, 0x000000, 1)
	this.Scene.add(this.HemisphereLight)

	this.DirectionalLight = new THREE.DirectionalLight('#ffffff', 4)
	this.DirectionalLight.position.set(80, 200, 80)
	this.DirectionalLight.castShadow = true
	this.DirectionalLight.shadow.mapSize.width = 4096
	this.DirectionalLight.shadow.mapSize.height = 4096
	this.DirectionalLight.shadow.camera.near = 0.1
	this.DirectionalLight.shadow.camera.far = 500
	this.DirectionalLight.shadow.camera.top = 100
	this.DirectionalLight.shadow.camera.bottom = -100
	this.DirectionalLight.shadow.camera.right = 100
	this.DirectionalLight.shadow.camera.left = -100
	this.Scene.add(this.DirectionalLight)
}

// 创建渲染器
function initRenderer() {
	this.Renderer = new THREE.WebGLRenderer({
		antialias: true,
		alpha: true
	})
	this.Renderer.setClearColor(new THREE.Color('#424242'))
	this.Renderer.setSize(100, 100)
	this.Renderer.setPixelRatio(devicePixelRatio)
	this.Renderer.shadowMap.enabled = true
	this.Renderer.shadowMap.type = THREE.PCFSoftShadowMap
}

// 控制器初始化
function initControl() {
	this.Control.OrbitControls = new OrbitControls(this.Camera, this.Renderer.domElement)
	this.Control.OrbitControls.screenSpacePanning = true
	this.Control.TransformControls = new TransformControls(this.Camera, this.Renderer.domElement)

	// this.Control.TransformControls.setSize(0.5)
}

function initAxis() {

	this.AxisScene = new THREE.Scene()

	this.AxisRenderer = new THREE.WebGLRenderer({
		antialias: true,
		alpha: true
	})
	this.AxisRenderer.setClearColor(new THREE.Color('#ffffff'), 0)
	this.AxisRenderer.setSize(80, 80)
	this.AxisRenderer.setPixelRatio(devicePixelRatio)

	this.AxisCamera = new THREE.OrthographicCamera(-40, 40, 40, -40, 0.0000001, 100000)
	this.AxisCamera.position.set(40, 0, 0)
	this.AxisCamera.zoom = 10
	this.AxisScene.add(this.AxisCamera)

	let axisHelperX = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, 0), 80, 0xff0000, 10, 10)
	let axisHelperY = new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 0), 80, 0x00ff00, 10, 10)
	let axisHelperZ = new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, 0), 80, 0x3d85ff, 10, 10)
	axisHelperX.position.x = -40
	axisHelperY.position.y = -40
	axisHelperZ.position.z = -40

	this.AxisScene.add(axisHelperX)
	this.AxisScene.add(axisHelperY)
	this.AxisScene.add(axisHelperZ)
	// this.AxisScene.add(angleHelperX)
	// this.AxisScene.add(angleHelperY)
	// this.AxisScene.add(angleHelperZ)
}

export default {
	initScene,
	initCamera,
	initLight,
	initRenderer,
	initControl,
	initAxis
}
