<template>
	<div id="PW_PoleBoxDisplay" style="width: 100%; height: 100%; position: relative;">
		<div class="Layout-Panel" id="PW_PoleBoxDisplay_CanvasPanel">
			<div class="container full" id="PW_PoleBoxDisplay_CanvasContainer" @dblclick="mouseDoubleClick()">
				<canvas id="PW_PoleBoxDisplay_Canvas"></canvas>
			</div>
		</div>
		<div class="Layout-Panel" id="PW_PoleBoxDisplay_RightPanel">
			<div class="container full">
			</div>
			<div id="line" class="button" @click="drawline()">
				<a class="button-text">Lines</a>
			</div>
			<br>
			<div id='boxinfodata'  class="container" style="margin-top: 40px">
				<span style="font-size: 20px">
					设备信息
				</span>
				<table id="space1" class="space" style="text-align: center">
					<thead>
						<th>舱位编号</th>
						<th>舱位高度</th>
						<th>额定功率</th>
					</thead>
					<tbody>
						<tr>
							<td> </td>
							<td> </td>
							<td> </td>
						</tr>
					</tbody>
				</table>
				<table id="space2" class="space" style="text-align: center">
					<thead>
						<th>权属单位</th>
					</thead>
					<tbody>
						<tr>
							<td> </td>
						</tr>
					</tbody>
				</table>
				<table id="space3" class="space" style="text-align: center">
					<thead>
						<th>舱内已用功率</th>
						<th>舱内剩余功率</th>
					</thead>
					<tbody>
						<tr>
							<td> </td>
							<td> </td>
						</tr>
					</tbody>
				</table>
				<table id="equip1" class="equip" style="text-align: center">
					<thead>
						<th>设备类型</th>
						<th>设备编号</th>
						<th>额定功率</th>
					</thead>
					<tbody>
						<tr>
							<td> </td>
							<td> </td>
							<td> </td>
						</tr>
					</tbody>
				</table>
			</div>
			<br>
			<br>
			<br>
			<br>
			<br>
			<br>
			<br>
			<br>
			<br>
			<br>
			<br>
			<br>
			<br>
			<br>
			<br>
			<div id="frontdoortext" class="button" disabled="disabled">
				<a class="button-text">前门</a>
			</div>
				<input id="frontdoorcheckbox" style="margin-left: 90px"  class="checkbox" type="checkbox" v-model="openFront" />
			<div id="sidedoortext" class="button" disabled="disabled">
				<a class="button-text">侧门</a>
			</div>
				<input id="sidedoorcheckbox" style="margin-left: 90px" class="checkbox" type="checkbox" v-model="openSide" />
			<div id="backdoortext" class="button" disabled="disabled">
				<a class="button-text">后门</a>
			</div>
				<input id="backdoorcheckbox" style="margin-left: 90px" class="checkbox" type="checkbox" v-model="openBack" />
			<div id="wavetext" class="button" disabled="disabled">
				<a class="button-text">波纹</a>
			</div>
				<input id="wavecheckbox" style="margin-left: 90px" class="checkbox" type="checkbox" v-model="openWave" />
			<div id="fantext" class="button" disabled="disabled">
				<a class="button-text">风扇</a>
			</div>
				<input id="fancheckbox" style="margin-left: 90px" class="checkbox" type="checkbox" v-model="openFan" />
			<div id="locktext" class="button" disabled="disabled">
				<a class="button-text">门锁</a>
			</div>
				<input id="lockcheckbox" style="margin-left: 90px" class="checkbox" type="checkbox" v-model="changeLock" />

		</div>
	</div>
</template>
<script>
	import * as THREE from "three";
	import OrbitControls from 'three-orbitcontrols'
	import { Panel, Layouter } from '../Sun/Layout.js'
	import { Slot, Module, SlotModifier, SM_Free, create_Module_from_Json, create_Tree_from_PoleJson, Unit, get_UniqueID } from '../Sun/ModuleSlot.js';
	import * as TWEEN from '@tweenjs/tween.js';
	import CryptoJS from 'crypto-js'
	import { customLog, HTML, radius_to_degree, degree_to_radius, to_PoleAngle, get_NearPoleAngle } from '../Utils.js'
	import * as ComponentManager from '../Sun/ComponentManager.js'
	import data from '../test3'
	import staticData from '../Sun/StaticData.js'
	import { MeshLine, MeshLineMaterial, MeshLineRaycast } from 'three.meshline';
	import {Water} from "three/examples/jsm/objects/Water2.js";

	let uniqueID = 0;

	let boxinfo =[
            {
                "spaceCode": 1,
                "orgName": "上海市徐汇交警总队",
                "orgType": "交警",
                "height": 360,
                "ratedPower": 500,
                "supplyVoltage": 0,
                "equips": [
                    {
                        "equipmentId": 136,
                        "equipmentType": "光端机",
                        "equipmentCode": "摄徐0012206-2",
                        "equipLength": 260,
                        "equipWidth": 220,
                        "equipHeight": 90,
                        "equipRatedPower": 12,
                        "equipSupplyVoltage": 1
                    },
                    {
                        "equipmentId": 138,
                        "equipmentType": "光端机",
                        "equipmentCode": "摄徐0012213-1",
                        "equipLength": 260,
                        "equipWidth": 220,
                        "equipHeight": 60,
                        "equipRatedPower": 36,
                        "equipSupplyVoltage": 1
                    }
                ],
                "remainingPower": 452,
                "usedPower": 48
            },
            {
                "spaceCode": 2,
                "orgName": "上海市徐汇公安分局",
                "orgType": "公安",
                "height": 360,
                "ratedPower": 500,
                "supplyVoltage": 0,
                "equips": [
                    {
                        "equipmentId": 135,
                        "equipmentType": "收发器",
                        "equipmentCode": "摄徐0012206-1",
                        "equipLength": 100,
                        "equipWidth": 80,
                        "equipHeight": 20,
                        "equipRatedPower": 5,
                        "equipSupplyVoltage": 1
                    }
                ],
                "remainingPower": 495,
                "usedPower": 5
            },
            {
                "spaceCode": 3,
                "orgName": "上海市徐汇交警总队",
                "orgType": "交警",
                "height": 360,
                "ratedPower": 500,
                "supplyVoltage": 0,
                "equips": [
                    {
                        "equipmentId": 132,
                        "equipmentType": "收发器",
                        "equipmentCode": "摄徐0012206-3",
                        "equipLength": 100,
                        "equipWidth": 80,
                        "equipHeight": 20,
                        "equipRatedPower": 5,
                        "equipSupplyVoltage": 1
                    },
                    {
                        "equipmentId": 133,
                        "equipmentType": "光端机",
                        "equipmentCode": "摄徐0012206-4",
                        "equipLength": 260,
                        "equipWidth": 220,
                        "equipHeight": 90,
                        "equipRatedPower": 22,
                        "equipSupplyVoltage": 1
                    }
                ],
                "remainingPower": 473,
                "usedPower": 27
			}
		]

	let boxdata = [{
		"moduleid": 0,
		"modulename": "主箱体",
		"classification": null,
		"url": "static/model/合箱/主箱体.stl",
		"moduleposition": [0, 5.8, 0],
		"modulerotation": [0, 0, 1.5707963267948966],
		"maxLoad": null,
		"propertyInfo": null,
		"interfaces": [
			{ "interfaceUID": 0, "interfacename": "箱顶盖插槽", "interfaceposition": ["0", "11.6", "0"], "interfacerotation": ["0", "0", "0"], "rules": ["All"] },
			{ "interfaceUID": 1, "interfacename": "前门插槽", "interfaceposition": ["-3.68", "1.58", "2.3"], "interfacerotation": ["0", "0", "0"], "rules": ["All"] },
			{ "interfaceUID": 2, "interfacename": "仓位分隔板插槽", "interfaceposition": ["3.5", "0", "0"], "interfacerotation": ["0", "0", "0"], "rules": ["All"] },
			{ "interfaceUID": 3, "interfacename": "后门插槽", "interfaceposition": ["-3.68", "1.58", "-2.3"], "interfacerotation": ["0", "3.141592653589793", "0"], "rules": ["All"] },
			{ "interfaceUID": 4, "interfacename": "侧门插槽", "interfaceposition": ["3.68", "1.58", "-2.3"], "interfacerotation": ["0", "1.5707963267948966", "0"], "rules": ["All"] },
			{ "interfaceUID": 5, "interfacename": "风扇插槽", "interfaceposition": ["-0.4", "11.3", "0"], "interfacerotation": ["0", "0", "0"], "rules": ["All"] },
			{ "interfaceUID": 6, "interfacename": "波纹插槽", "interfaceposition": ["0", "5", "0"], "interfacerotation": ["0", "0", "0"], "rules": ["All"] },
			{ "interfaceUID": 7, "interfacename": "门锁插槽", "interfaceposition": ["-3.68", "1.58", "2.3"], "interfacerotation": ["0", "0", "0"], "rules": ["All"] }
			]
	},
	{
		"moduleid": 1,
		"modulename": "箱顶盖",
		"classification": null,
		"url": "static/model/合箱/箱顶盖.stl",
		"moduleposition": [0, 0.6, 0],
		"modulerotation": [0, 0, 1.5707963267948966],
		"maxLoad": null,
		"propertyInfo": null,
		"interfaces": []
	},
	{
		"moduleid": 2,
		"modulename": "前门",
		"classification": null,
		"url": "static/model/合箱/前门.stl",
		"moduleposition": [2.86, 4.96, 0], "modulerotation": [0, 0, 1.5707963267948966],
		"maxLoad": null, "propertyInfo": null,
		"interfaces": []
	},
	{
		"moduleid": 3,
		"modulename": "仓位分隔板",
		"classification": null,
		"url": "static/model/合箱/仓位分隔板.STL",
		"moduleposition": [-4.2, 8, 0],
		"modulerotation": [1.5707963267948966, 0, 0],
		"maxLoad": null,
		"propertyInfo": null,
		"interfaces": [{ "interfaceUID": 0, "interfacename": "波纹插槽", "interfaceposition": ["0", "9", "0"], "interfacerotation": ["0", "0", "0"], "rules": ["All"] },
		{ "interfaceUID": 1, "interfacename": "立方体插槽", "interfaceposition": ["-3.5", "12.5", "0"], "interfacerotation": ["0", "0", "0"], "rules": ["All"] }],
	},
	{
		"moduleid": 4,
		"modulename": "后门",
		"classification": null,
		"url": "static/model/合箱/后门.stl",
		"moduleposition": [-2.86, 4.96, 0],
		"modulerotation": [0, 3.141592653589793, 1.5707963267948966],
		"maxLoad": null,
		"propertyInfo": null,
		"interfaces": []
	},
	{
		"moduleid": 5,
		"modulename": "侧门",
		"classification": null,
		"url": "static/model/合箱/侧门.stl",
		"moduleposition": [-2.32, 4.96, 0],
		"modulerotation": [0, 0, -1.5707963267948966],
		"maxLoad": null,
		"propertyInfo": null,
		"interfaces": []
	},
		{
			"moduleid": 6,
			"modulename": "风扇",
			"classification": null,
			"url": "static/model/合箱/风扇.STL",
			"moduleposition": [0, 0.3, 0],
			"modulerotation": [-29.9, 0, 0],
			"maxLoad": null,
			"propertyInfo": null,
			"interfaces": []
		},
		{
			"moduleid": 7,
			"modulename": "门锁",
			"classification": null,
			"url": "static/model/合箱/门锁.stl",
			"moduleposition": [5.15, 4.945, 0.1],
			"modulerotation": [0, 0, 1.5707963267948966],
			"maxLoad": null,
			"propertyInfo": null,
			"interfaces": [],
			"myUnit": [0.032, 0.042, 0.04],

		},
		{
			"moduleid": 8,
			"modulename": "仓位分隔板",
			"classification": null,
			"url": "static/model/合箱/仓位分隔板.STL",
			"moduleposition": [-4.2, 5.8, 0],
			"modulerotation": [1.5707963267948966, 0, 0],
			"maxLoad": null,
			"propertyInfo": null,
			"interfaces": [{ "interfaceUID": 0, "interfacename": "波纹插槽", "interfaceposition": ["0", "6.8", "0"], "interfacerotation": ["0", "0", "0"], "rules": ["All"] }],
		},
		{
			"moduleid": 9,
			"modulename": "仓位分隔板",
			"classification": null,
			"url": "static/model/合箱/仓位分隔板.STL",
			"moduleposition": [-4.2, 3.6, 0],
			"modulerotation": [1.5707963267948966, 0, 0],
			"maxLoad": null,
			"propertyInfo": null,
			"interfaces": [{ "interfaceUID": 0, "interfacename": "波纹插槽", "interfaceposition": ["0", "4.6", "0"], "interfacerotation": ["0", "0", "0"], "rules": ["All"] }],
		},
		{
			"moduleid": 10,
			"modulename": "设备1",
			"classification": null,
			"url": "static/model/合箱/门锁.stl",
			"moduleposition": [-4.9, 0, 0],
			"modulerotation": [1.5707963267948966, 3.141592, 0],
			"maxLoad": null,
			"propertyInfo": null,
			"interfaces": [{ "interfaceUID": 0, "interfacename": "波纹插槽", "interfaceposition": ["-1.3", "0", "0"], "interfacerotation": ["0", "0", "0"], "rules": ["All"] }],
		},
		{
			"moduleid": 11,
			"modulename": "设备2",
			"classification": null,
			"url": "static/model/合箱/门锁.stl",
			"moduleposition": [-2.7, 0, 0],
			"modulerotation": [1.5707963267948966, 3.141592, 0],
			"maxLoad": null,
			"propertyInfo": null,
			"interfaces": [{ "interfaceUID": 0, "interfacename": "波纹插槽", "interfaceposition": ["-0.01", "0", "0"], "interfacerotation": ["0", "0", "0"], "rules": ["All"] }],
		},
		{
			"moduleid": 12,
			"modulename": "设备3",
			"classification": null,
			"url": "static/model/合箱/门锁.stl",
			"moduleposition": [-4.4, 0, 0],
			"modulerotation": [1.5707963267948966, 3.141592, 0],
			"maxLoad": null,
			"propertyInfo": null,
			"interfaces": [{ "interfaceUID": 0, "interfacename": "波纹插槽", "interfaceposition": ["-0.5", "0", "0"], "interfacerotation": ["0", "0", "0"], "rules": ["All"] }],
		},
		{
			"moduleid": 13,
			"modulename": "设备4",
			"classification": null,
			"url": "static/model/合箱/门锁.stl",
			"moduleposition": [-4.9, 0, 0],
			"modulerotation": [1.5707963267948966, 3.141592, 0],
			"maxLoad": null,
			"propertyInfo": null,
			"interfaces": [{ "interfaceUID": 0, "interfacename": "波纹插槽", "interfaceposition": ["-1.3", "0", "0"], "interfacerotation": ["0", "0", "0"], "rules": ["All"] }],
		},
		{
			"moduleid": 14,
			"modulename": "设备5",
			"classification": null,
			"url": "static/model/合箱/门锁.stl",
			"moduleposition": [-2.7, 0, 0],
			"modulerotation": [1.5707963267948966, 3.141592, 0],
			"maxLoad": null,
			"propertyInfo": null,
			"interfaces": [{ "interfaceUID": 0, "interfacename": "波纹插槽", "interfaceposition": ["-0.01", "0", "0"], "interfacerotation": ["0", "0", "0"], "rules": ["All"] }],
		},
		{
			"moduleid": 15,
			"modulename": "走线1",
			"classification": null,
			"url": "static/model/合箱/门锁.stl",
			"moduleposition": [-4, 0, 0],
			"modulerotation": [1.5707963267948966, 3.141592, 0],
			"maxLoad": null,
			"propertyInfo": null,
			"interfaces": [],
		},
		{
			"moduleid": 16,
			"modulename": "走线2",
			"classification": null,
			"url": "static/model/合箱/门锁.stl",
			"moduleposition": [-3.5, 0, 0],
			"modulerotation": [1.5707963267948966, 3.141592, 0],
			"maxLoad": null,
			"propertyInfo": null,
			"interfaces": [],
		},
		{
			"moduleid": 17,
			"modulename": "走线3",
			"classification": null,
			"url": "static/model/合箱/门锁.stl",
			"moduleposition": [-3.7, 0, 0],
			"modulerotation": [1.5707963267948966, 3.141592, 0],
			"maxLoad": null,
			"propertyInfo": null,
			"interfaces": [],
		},
		{
			"moduleid": 18,
			"modulename": "走线4",
			"classification": null,
			"url": "static/model/合箱/门锁.stl",
			"moduleposition": [-4, 0, 0],
			"modulerotation": [1.5707963267948966, 3.141592, 0],
			"maxLoad": null,
			"propertyInfo": null,
			"interfaces": [],
		},
		{
			"moduleid": 19,
			"modulename": "走线5",
			"classification": null,
			"url": "static/model/合箱/门锁.stl",
			"moduleposition": [-3.5, 0, 0],
			"modulerotation": [1.5707963267948966, 3.141592, 0],
			"maxLoad": null,
			"propertyInfo": null,
			"interfaces": [],
		},
		{
			"moduleid": 20,
			"modulename": "走线1-1",
			"classification": null,
			"url": "static/model/合箱/门锁.stl",
			"moduleposition": [-4, 0, 0],
			"modulerotation": [1.5707963267948966, 3.141592, 0],
			"maxLoad": null,
			"propertyInfo": null,
			"interfaces": [{ "interfaceUID": 0, "interfacename": "波纹插槽", "interfaceposition": ["-0.01", "0", "0"], "interfacerotation": ["0", "0", "0"], "rules": ["All"] }]
		},
		{
			"moduleid": 21,
			"modulename": "走线2-2",
			"classification": null,
			"url": "static/model/合箱/门锁.stl",
			"moduleposition": [-3.5, 0, 0],
			"modulerotation": [1.5707963267948966, 3.141592, 0],
			"maxLoad": null,
			"propertyInfo": null,
			"interfaces": [{ "interfaceUID": 0, "interfacename": "波纹插槽", "interfaceposition": ["-0.01", "0", "0"], "interfacerotation": ["0", "0", "0"], "rules": ["All"] }]
		},
		{
			"moduleid": 22,
			"modulename": "走线3-3",
			"classification": null,
			"url": "static/model/合箱/门锁.stl",
			"moduleposition": [-3.7, 0, 0],
			"modulerotation": [1.5707963267948966, 3.141592, 0],
			"maxLoad": null,
			"propertyInfo": null,
			"interfaces": [{ "interfaceUID": 0, "interfacename": "波纹插槽", "interfaceposition": ["-0.01", "0", "0"], "interfacerotation": ["0", "0", "0"], "rules": ["All"] }]
		},
		{
			"moduleid": 23,
			"modulename": "走线4-4",
			"classification": null,
			"url": "static/model/合箱/门锁.stl",
			"moduleposition": [-4, 0, 0],
			"modulerotation": [1.5707963267948966, 3.141592, 0],
			"maxLoad": null,
			"propertyInfo": null,
			"interfaces": [{ "interfaceUID": 0, "interfacename": "波纹插槽", "interfaceposition": ["-0.01", "0", "0"], "interfacerotation": ["0", "0", "0"], "rules": ["All"] }]
		},
		{
			"moduleid": 24,
			"modulename": "走线5-5",
			"classification": null,
			"url": "static/model/合箱/门锁.stl",
			"moduleposition": [-3.5, 0, 0],
			"modulerotation": [1.5707963267948966, 3.141592, 0],
			"maxLoad": null,
			"propertyInfo": null,
			"interfaces": [{ "interfaceUID": 0, "interfacename": "波纹插槽", "interfaceposition": ["-0.01", "0", "0"], "interfacerotation": ["0", "0", "0"], "rules": ["All"] }]
		},
	]
	export default {
		mixins: [staticData],
		name: 'PW_PoleBoxDisplay',
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
						actionlist: {}
					}
				}
			}
		},
		static() {
			return {
				MouseRawPosition: new THREE.Vector2(0, 0),
				Scene: new THREE.Scene(),
				Lines: new THREE.Object3D(),
				Renderer: null,
				Camera: null,
				OrbitControl: null,
				Base: null,
				Raycaster: new THREE.Raycaster()
			}
		},
		data() {
			return {
				shouldRender: false,
				dataManager: null,
				// 选中的Module
				selectedModule: null,
				mesh: new THREE.Mesh(),
				arrowHelper: new THREE.ArrowHelper(),
				// 是否点击Lines触发画线事件
				shouldShowInfo: false,
				boxModule: null,
				frontDoorModule: null,
				backDoorModule: null,
				sideDoorModule: null,
				panelModule1: null,
				panelModule2: null,
				panelModule3: null,
				topModule: null,
				fanModule: null,
				deviceModule1: null,
				deviceModule2: null,
				deviceModule3: null,
				deviceModule4: null,
				deviceModule5: null,
				zouxianModule1: null,
				zouxianModule2: null,
				zouxianModule3: null,
				zouxianModule4: null,
				zouxianModule5: null,
				zouxianModule1_1: null,
				zouxianModule2_2: null,
				zouxianModule3_3: null,
				zouxianModule4_4: null,
				zouxianModule5_5: null,
				watertop: null,
				waterfront: null,
				waterback: null,
				waterleft: null,
				waterright: null,
				waveModule: null,
				openFront: false,
				openBack: false,
				openSide: false,
				openFan: false,
				changeLock: false,
				smoke: false,
				openWave: false,
				boxinfo: false,
				openSmoke: 0,
			}
		},
		watch: {
			PopupSize() {
				if (this.layout !== null) {
					this.Layout.refresh_Layout()
				}
			},
			shouldRender(newval) {
				if (newval) {
					this.animate();
				}
			},
			openWave(newval, oldval)	{
				if (newval) {
						console.log("开波纹");
						const textureLoader = new THREE.TextureLoader();
						const waterGeometry = new THREE.PlaneBufferGeometry(10, 10 ,1);
						this.watertop = new Water( waterGeometry, {
							color: '#2E9AFE',
							scale: 2,
							flowDirection: new THREE.Vector2( 60, 5 ),
							textureWidth: 1024,
							textureHeight: 1024,
							reflectivity: 0.1,
							flowspeed: 1,
							clipBias:0
						} );

						this.watertop.position.y = 3;
						this.watertop.rotation.x = Math.PI * - 0.5;
						this.waterfront = new Water( waterGeometry, {
							color: '#2E9AFE',
							scale: 2,
							flowDirection: new THREE.Vector2( 60, 5 ),
							textureWidth: 1024,
							textureHeight: 1024,
							reflectivity: 0.1,
							flowspeed: 1,
							clipBias:0
						} );
						this.waterfront.position.y = -2;
						this.waterfront.position.z = 4.9;

						this.waterright = new Water( waterGeometry, {
							color: '#2E9AFE',
							scale: 2,
							flowDirection: new THREE.Vector2( 60, 5 ),
							textureWidth: 1024,
							textureHeight: 1024,
							reflectivity: 1,
							flowspeed: 1,
							clipBias:0
						} );
						this.waterright.position.y = -2;
						this.waterright.position.x = -4.9;
						this.waterright.rotation.y = Math.PI * - 0.5;
						console.log(this.waterright);
						this.$static.Scene.add( this.watertop );
						this.$static.Scene.add( this.waterfront );
						this.$static.Scene.add( this.waterright );
						requestAnimationFrame(this.animate);
						this.$static.Renderer.render(this.$static.Scene, this.$static.Camera);


				}
				else {
						console.log("关波纹咯");
						this.$static.Scene.remove( this.watertop );
						this.$static.Scene.remove( this.waterfront );
						this.$static.Scene.remove( this.waterright );
				}
			},
			openFan(newval, oldval){
				let that = this
				let rotation = new THREE.Euler()
				rotation.copy(this.fanModule.slotmodifier.rotation)
				let value = {x:rotation.x, y:rotation.y,z:rotation.z }
				let tween = new TWEEN.Tween(value)
				if(newval) {
					if(this.fanModule !== null){
						console.log(this.backDoorModule)
						console.log(this.fanModule)
						tween.to({x: rotation.x, y: rotation.y+50, z: rotation.z},0x3f3f)
						.easing(TWEEN.Easing.Quadratic.In)
						.onUpdate(function(){
							that.fanModule.slotmodifier.rotation.set(value.x,value.y,value.z)
							that.refresh_Tree()
						})
						.start();
						that.topModule.model.material.opacity = 0.5
						that.topModule.model.material.transparent = true
						//tween.repeat(Infinity);
					}
				} else {
					if(this.fanModule !== null)
					{
						console.log(this.topModule)
						console.log(tween)
						tween.stop();
						that.topModule.model.material.opacity = 1
						that.topModule.model.material.transparent = false
						that.refresh_Tree()
						console.log(that.topModule.model.material.opacity)
					}
				}
			},

			changeLock(newval, oldval) {
				if (newval) {
					console.log("hao");
					if (this.lockModule !== null) {
						let that = this
						console.log(that.lockModule);
						that.lockModule.model.material.opacity = 0.5
						that.lockModule.model.material.transparent = true
						that.lockModule.model.material.color = new THREE.Color(1,0,0)
					}
				}
				else {
					console.log("buhao");
					if (this.lockModule !== null) {
						let that = this
						that.lockModule.model.material.color = new THREE.Color(0,1,0)
					}
				}
			},

			openBack(newval, oldval) {
				if (newval) {
					if (this.backDoorModule !== null) {
						let that = this
						let rotation = new THREE.Euler()
						rotation.copy(this.backDoorModule.slotmodifier.rotation)
						let value = { x: rotation.x, y: rotation.y, z: rotation.z }
						let tween = new TWEEN.Tween(value)
							.to({ x: rotation.x, y: Math.PI, z: rotation.z }, 500)
							.easing(TWEEN.Easing.Quadratic.Out)
							.onUpdate(function () {
								that.backDoorModule.slotmodifier.rotation.set(value.x, value.y, value.z)
								that.refresh_Tree()
							})
							.start();
					}
				}
				else {
					if (this.backDoorModule !== null) {
						let that = this
						let rotation = new THREE.Euler()
						rotation.copy(this.backDoorModule.slotmodifier.rotation)
						let value = { x: rotation.x, y: rotation.y, z: rotation.z }
						let tween = new TWEEN.Tween(value)
							.to({ x: rotation.x, y: 0, z: rotation.z }, 500)
							.easing(TWEEN.Easing.Quadratic.In)
							.onUpdate(function () {
								that.backDoorModule.slotmodifier.rotation.set(value.x, value.y, value.z)
								that.refresh_Tree()
							})
							.start();
					}
				}
			},

			openSide(newval, oldval) {
				if (newval) {
					if (this.sideDoorModule !== null) {
						let that = this
						let rotation = new THREE.Euler()
						rotation.copy(this.sideDoorModule.slotmodifier.rotation)
						let value = { x: rotation.x, y: rotation.y, z: rotation.z }
						let tween = new TWEEN.Tween(value)
							.to({ x: rotation.x, y: Math.PI, z: rotation.z }, 500)
							.easing(TWEEN.Easing.Quadratic.Out)
							.onUpdate(function () {
								that.sideDoorModule.slotmodifier.rotation.set(value.x, value.y, value.z)
								that.refresh_Tree()
							})
							.start();
					}
				}
				else {
					if (this.sideDoorModule !== null) {
						let that = this
						let rotation = new THREE.Euler()
						rotation.copy(this.sideDoorModule.slotmodifier.rotation)
						let value = { x: rotation.x, y: rotation.y, z: rotation.z }
						let tween = new TWEEN.Tween(value)
							.to({ x: rotation.x, y: 0, z: rotation.z }, 500)
							.easing(TWEEN.Easing.Quadratic.In)
							.onUpdate(function () {
								that.sideDoorModule.slotmodifier.rotation.set(value.x, value.y, value.z)
								that.refresh_Tree()
							})
							.start();
					}
				}
			},

			openFront(newval, oldval) {
				console.log("开前门咯");
				if (newval) {
					if (this.frontDoorModule !== null) {
						let that = this
						let rotation = new THREE.Euler()
						let rotationLock = new THREE.Euler()
						console.log(this.frontDoorModule.slotmodifier.rotation);
						rotation.copy(this.frontDoorModule.slotmodifier.rotation)
						rotationLock.copy(this.lockModule.slotmodifier.rotation)
						let value = { x: rotation.x, y: rotation.y, z: rotation.z }
						let valueLock = { x: rotationLock.x, y: rotationLock.y, z: rotationLock.z }
						let tween = new TWEEN.Tween(value)
							.to({ x: rotation.x, y: -Math.PI, z: rotation.z }, 500)
							.easing(TWEEN.Easing.Quadratic.Out)
							.onUpdate(function () {
								that.frontDoorModule.slotmodifier.rotation.set(value.x, value.y, value.z)
								that.refresh_Tree()
							});
						let tweenLock = new TWEEN.Tween(valueLock)
							.to({ x: rotationLock.x, y: -Math.PI, z: rotationLock.z }, 500)
							.easing(TWEEN.Easing.Quadratic.Out)
							.onUpdate(function () {
								that.lockModule.slotmodifier.rotation.set(valueLock.x, valueLock.y, valueLock.z)
								that.refresh_Tree()
							});
						//tween.repeat(5)
							tween.start();
							tweenLock.start();
					}
				}
				 else {
				 	if (this.frontDoorModule !== null) {
				 		let that = this
				 		let rotation = new THREE.Euler()
						let rotationLock = new THREE.Euler()
				 		rotation.copy(this.frontDoorModule.slotmodifier.rotation)
						rotationLock.copy(this.lockModule.slotmodifier.rotation)
				 		let value = { x: rotation.x, y: rotation.y, z: rotation.z }
						let valueLock = { x: rotationLock.x, y: rotationLock.y, z: rotationLock.z }
				 		let tween = new TWEEN.Tween(value)
				 			.to({ x: rotation.x, y: 0, z: rotation.z }, 500)
				 			.easing(TWEEN.Easing.Quadratic.Out)
				 			.onUpdate(function () {
				 				that.frontDoorModule.slotmodifier.rotation.set(value.x, value.y, value.z)
				 				that.refresh_Tree()
				 			});
						let tweenLock = new TWEEN.Tween(valueLock)
							.to({ x: rotationLock.x, y: 0, z: rotationLock.z }, 500)
							.easing(TWEEN.Easing.Quadratic.Out)
							.onUpdate(function () {
								that.lockModule.slotmodifier.rotation.set(valueLock.x, valueLock.y, valueLock.z)
								that.refresh_Tree()
							});
						tweenLock.start();
				 		tween.start();

				 	}
				 }
			},


			// Mode(newval, oldval) {
			// 	if (newval === 'build') {
			// 		this.refresh_build_selectedModule_inspector(this.selectedModule)
			// 	}
			// },
			// selectedModule(newval, oldval) {
			// 	// if (newval !== null)
			// 	// 	newval.groupid = 2
			// 	this.refresh_build_selectedModule_inspector(newval)
			// }
		},
		activated() {
			console.log(">>>>>>>>>>>>>>>>>>>")
			console.log(this.Input.poleid)
			this.load(this.Input.poleid)
			this.shouldRender = true
			this.shouldShowInfo = false
			this.Layout.layout_tree.set_Visible(true)
			this.Layout.refresh_Layout()
		},
		deactivated() {
			this.shouldRender = false
			this.shouldShowInfo = true
			this.Layout.layout_tree.set_Visible(false)
			this.Layout.refresh_Layout()
			this.$static.Scene.remove(this.$static.Scene.getObjectByName('mesh')); // 删除原先的线
			this.$static.Scene.remove(this.$static.Scene.getObjectByName('myarrowHelper')); // 删除原先的箭头
			this.selectedModule = null
		},
		methods: {
			init() {
				var axes = new THREE.AxisHelper(800);//参数设置了三条轴线的长度
				this.$static.Scene.add(axes, this.$static.Lines)
				this.$static.Scene.add(new THREE.HemisphereLight(0xffffff, 0x000000, 1))
				let directLight = new THREE.DirectionalLight()
				directLight.position.set(80, 200, 80)
				directLight.castShadow = true
				directLight.shadow.mapSize.width = 2048 // default
				directLight.shadow.mapSize.height = 2048 // default
				directLight.shadow.camera.near = 0.1 // default
				directLight.shadow.camera.far = 500 // default
				directLight.shadow.camera.top = 100 // defaultright
				directLight.shadow.camera.bottom = -100 // default
				directLight.shadow.camera.right = 100 // default
				directLight.shadow.camera.left = -100 // default

				this.$static.Scene.add(directLight)
				// this.$static.Scene.background = new THREE.Color(0xcce0ff);
				// 添加草坪贴图

				this.$static.Scene.add(new THREE.AmbientLight(0x666666));
				this.$static.Scene.fog = new THREE.Fog(0xcce0ff, 500, 10000);

				let constainer = document.getElementById('PW_PoleBoxDisplay_CanvasContainer')
				let width = constainer.offsetWidth - 12
				let height = constainer.offsetHeight - 12
				this.$static.Renderer = new THREE.WebGLRenderer({
					canvas: document.getElementById('PW_PoleBoxDisplay_Canvas'),
					antialias: true,
					alpha: true
				})
				this.$static.Renderer.setClearColor(new THREE.Color('#424242')) // 设置窗口背景颜色
				this.$static.Renderer.setSize(width, height) // 设置窗口尺寸
				this.$static.Renderer.setPixelRatio(devicePixelRatio)
				// 阴影效果
				this.$static.Renderer.shadowMap.enabled = true
				this.$static.Renderer.shadowMap.type = THREE.PCFSoftShadowMap

				let PerspectiveCamera = new THREE.PerspectiveCamera(60, width / height, 1, 10000)
				PerspectiveCamera.position.set(30, 100, 30)
				this.$static.Camera = PerspectiveCamera

				let OrbitControl = new OrbitControls(this.$static.Camera, document.getElementById('PW_PoleBoxDisplay_Canvas'))
				OrbitControl.screenSpacePanning = true
				OrbitControl.mouseButtons = {
					LEFT: THREE.MOUSE.LEFT,
					MIDDLE: -1,
					RIGHT: -1,
				}
				this.$static.OrbitControl = OrbitControl
				this.$static.OrbitControl.target = new THREE.Vector3(0, 40, 0)
				this.$static.OrbitControl.update()

				let base = new Module(-1, -1, "Base", new THREE.Vector3(0, -5, 0), new THREE.Euler(-Math.PI / 2, 0, 0, "XYZ"), this.$static.Scene, "", new SlotModifier(), false, '场景', {}, -1)
				base.model = new THREE.Mesh(new THREE.BoxGeometry(10, 10, 10), new THREE.MeshStandardMaterial({
					color: '#ffffff',
					metalness: 0.7,
					roughness: 0.2,
					transparent: true,
					opacity: 1
				}))
				base.model.receiveShadow = true
				base.allowadditionalposition = false
				Module.add_to_Scene(base)
				let baseslot = new Slot(-1, "BaseSlot", new THREE.Vector3(0, 0, 0), new THREE.Euler(0, 0, 0, "XYZ"), this.$static.Scene)
				base.add_Slot(baseslot)
				// this.$static.Base.push(base)
				// base.Update()
				this.$static.Base = base
				// this.test2()
			},
			refresh_Tree: function (additionaldistance = 0) {
				let value = parseFloat(additionaldistance)
				this.$static.Base.Update(new THREE.Vector3(0, 0, 0), new THREE.Euler(0, 0, 0, "XYZ"), new THREE.Vector3(0, additionaldistance, 0))
			},
			refresh_build_selectedModule_inspector(module) {
				if (this.Mode === 'build') {
					if (this.SelectedMode === 0) {
						if (module === null) {
							// this.AxesHelper.visible = false
							this.$EventBus.$emit('inspectorInit', {
								uid: 'display', iuid: 'moduledisplay_build_empty', list: [
									{ type: 'title', title: '无选中项' },
									{ type: 'text', title: '在画布中单击选中组件' },
									{ type: 'title', title: '模拟搭建生成' },
									// { type: 'textarea', title: 'JSON', action: 'getJson', value: this.createJson, placeholder: "build JSON" },
									// { type: 'button', title: '生成', action: 'buildFromJson', list: ["生成"] },
									{
										type: 'group', title: '', action: '模拟搭建生成', itemvalue: {
											grouped: false, list: [
												{ type: 'lineedit', title: 'poleCode', action: 'getUrl', itemvalue: { value: '', placeholder: '' } },
												{ type: 'button', title: '测试样例', action: 'testBuild', itemvalue: { list: ["网络接口生成"] } }]
										}
									},
									{ type: 'title', title: '设计规划综合杆' },
									{
										type: 'group', title: '', action: '设计规划综合杆', itemvalue: {
											grouped: false, list: [
												{ type: 'lineedit', title: 'poleId', action: 'getPoleId', itemvalue: { value: '', placeholder: '' } },
												{ type: 'lineedit', title: 'poleCode', action: 'getPoleCode', itemvalue: { value: '', placeholder: '' } },
												{ type: 'button', title: '测试样例', action: 'upload', itemvalue: { list: ["上传"] } }]
										}
									}
								]
							})
						}
						else {
							if (module.is_InGroup() && !module.is_GroupRoot()) {
								this.$EventBus.$emit('inspectorInit', {
									uid: 'display', iuid: 'moduledisplay_build_select_Module_' + module.uid, list: [
										{ type: 'title', title: module.name },
										{ type: 'text', title: 'UID: ' + module.uid },
										{ type: 'title', title: '复合组件 GID: ' + module.groupid + '，无法编辑' }
									]
								})
								return
							}

							let linkslot = module.linkslotlist.map((slot) => {
								return { text: slot.get_Info(), uid: slot.uid.toString() }
							})
							// console.log(Module.get_LinkCalcuStyleName(module.linkcalcustyle), module.linkcalcustyle)
							let is_ArmPoleEquip = module.get_Parent().classificationid === 2
							let list = [
								{ type: 'title', title: module.name },
								{ type: 'text', title: 'UID: ' + module.uid }, { type: 'title', title: '空间姿态' },
								!module.is_Link() ? { type: 'select', title: '坐标系', action: 'selectorigin', itemvalue: { list: ["原点", "父级"], selectitem: module.relatetoorigin ? "原点" : "父级" } } : undefined,
								{ type: 'vector3', title: '坐标', action: 'slotPosition', itemvalue: { x: module.slotmodifier.position.x, y: module.slotmodifier.position.y, z: module.slotmodifier.position.z, min: -100000, max: 100000, step: 1 } },
								{ type: 'euler3', title: '旋转', action: 'slotRotation', itemvalue: { x: module.slotmodifier.rotation.x, y: module.slotmodifier.rotation.y, z: module.slotmodifier.rotation.z, step: 1 } },
								!module.relatetoorigin && is_ArmPoleEquip ? { type: 'title', title: '多插槽驱动' } : undefined,
								// { type: 'button', title: '选择插槽', action: 'select_Slot', itemvalue: { list: ["添加驱动插槽"] } },
								!module.relatetoorigin && is_ArmPoleEquip ? { type: 'list', title: '驱动插槽', action: 'link_slot', itemvalue: { list: linkslot, allowdelete: true, allowinput: false, allowadd: true, showempty: false } } : undefined,
								module.is_Link() && is_ArmPoleEquip ? [{ type: 'text', title: '驱动方式' }, { type: 'select', title: '平均值计算', action: 'link_CalcuStyle', itemvalue: { list: ["无", "X", "Y", "Z", "XZ", "XYZ"], selectitem: Module.get_LinkCalcuStyleName(module.linkcalcustyle) } }, { type: 'toggle', title: '包含父插槽', action: 'include_ParentSlot', itemvalue: module.linkcalcustyle.parent }] : undefined,
								module.classification === '灯臂' ? [{ type: 'title', title: '特殊属性' }, { type: 'numberedit', title: '灯臂仰角', action: 'lamp_elevationAngle', itemvalue: { value: module.property.elevationAngle, min: -100, max: 100, step: 1, placeholder: 0 } }] : undefined,
								module.componentid === 40 ? [{ type: 'title', title: '特殊属性' }, { type: 'vector2', title: '2F尺寸', action: '2F_size', itemvalue: { x: module.property.equipWidth, y: module.property.equipLength, min: -100000, max: 100000, step: 1 } }] : undefined,
								{ type: 'title', title: '插件' },
								{ type: 'dropdown', title: '', action: 'add_Plugin', itemvalue: { list: [/*'鼠标检测', */{ icon: 'cover', text: '指示牌标志贴图' }, '模型缩放', '自定义脚本'], selectitem: '', hold: false } }
							]
							let plugins = module.get_Plugins()
							if (plugins.length > 0) {
								list.push({ type: 'list', title: '插件列表', action: 'remove_Plugin', itemvalue: { list: plugins, allowdelete: true, allowinput: false, allowadd: false, showempty: false } })
							}
							list = list.concat(module.get_EditorPropertyInspector())
							this.$EventBus.$emit('inspectorInit', {
								uid: 'display', iuid: 'moduledisplay_build_select_Module_' + module.uid, list: list
							})
						}
					}
					if (this.SelectedMode === 1) {
						let list = [{ type: 'title', title: '荷载分析汇总' }]
						this.checkLoadResult.forEach((item) => {
							let module = this.get_Module_by_UID(item.uid)
							if (module === null) {
								list.push({ type: 'text', title: 'UID: ' + item.uid + ' 的组件不存在，可能需要重新进行荷载计算' })
							}
							else {
								list.push({ type: 'checkload', title: module.name, action: 'select_Module', itemvalue: { value: item.data.currBend, max: 100, uid: item.uid, valid: item.data.vaildFlag, selected: this.selectedModule === null ? false : item.uid === this.selectedModule.uid } })
							}
						})
						this.$EventBus.$emit('inspectorInit', {
							uid: 'display', iuid: 'moduledisplay_checkload_empty', list: list
						})
					}

				}
				else if (this.Mode === 'display') {
					if (module === null) {
						this.$EventBus.$emit('inspectorInit', {
							uid: 'display', iuid: 'moduledisplay_display_empty', list: [
								{ type: 'title', title: '无选中项' },
								{ type: 'text', title: '在画布中单击选中组件' },
							]
						})
					}
					else {
						let newlist = JSON.parse(JSON.stringify(module.property))
						this.$EventBus.$emit('inspectorInit', {
							uid: 'display', iuid: 'moduledisplay_build_select_Module_' + module.uid, list: [
								{ type: 'title', title: module.name },
								{ type: 'text', title: 'UID: ' + module.uid },
								{
									type: 'propertylist', title: '属性', action: 'null', itemvalue: { list: newlist, allowinput: false, musthave: [] }
								}
							]
						})
					}
				}
			},
			animate() {
				// let scale = this.update_Mouse3DPlane()

				// this.actionLoop(scale)
				if (this.$static.Renderer !== null) {
					this.$static.Renderer.render(this.$static.Scene, this.$static.Camera)
				}

				if (this.shouldRender) {
					TWEEN.update()
					requestAnimationFrame(this.animate)
				}
				// console.log(this.mesh)
				// 动态刷新画线，首先保证其被定义（已调用过drawline）
				if (this.mesh.material.dashOffset != undefined)
				{
					// 该数值决定了动画刷新的中止时间
					if (this.mesh.material.uniforms.dashOffset.value > 100) return;
					// 该数值决定了动画刷新的更新速率
					this.mesh.material.uniforms.dashOffset.value += 0.003;
				}
				// 若需动态更新，在此修改
				// if (this.arrowHelper.position != undefined)
				// {
				// 	var vec1 = new THREE.Vector3(0,10,0);
				// 	// this.arrowHelper.position.add(vec1);
				// 	this.arrowHelper.position.y += 10;
				// 	console.log(this.arrowHelper.position);
				// }
			},

			// draw lines
			drawline() {
				this.shouldShowInfo = true // 设置变量为真，使表格渲染
				this.$static.Scene.remove(this.$static.Scene.getObjectByName('mesh')); // 删除原先的线
				this.$static.Scene.remove(this.$static.Scene.getObjectByName('myarrowHelper')); // 删除原先的箭头
				var tb = document.getElementById('space1')
				var spacenb = tb.rows[0].cells[0]
				var spaceheight = tb.rows[0].cells[1]
				var spacerate = tb.rows[0].cells[2]
				tb = document.getElementById('space2')
				var orgname = tb.rows[0].cells[0]
				tb = document.getElementById('space3')
				var usedrate = tb.rows[0].cells[0]
				var remainrate = tb.rows[0].cells[1]
				tb = document.getElementById('equip1')
				var equiptype = tb.rows[0].cells[0]
				var equiptcode = tb.rows[0].cells[1]
				var equiptrate = tb.rows[0].cells[2]

				this.boxinfo =  boxinfo
				console.log(this.boxinfo[0]);
				console.log(this.boxinfo[0]['equips'][0]);

				console.log(this.selectedModule.name);
				if(this.selectedModule.name == '走线1'){
					spacenb.innerHTML = this.boxinfo[0]['spaceCode']
					spaceheight.innerHTML = this.boxinfo[0]['height']
					spacerate.innerHTML = this.boxinfo[0]['ratedPower']
					orgname.innerHTML = this.boxinfo[0]['orgName']
					usedrate.innerHTML = this.boxinfo[0]['usedPower']
					remainrate.innerHTML = this.boxinfo[0]['remainingPower']
					equiptype.innerHTML = this.boxinfo[0]['equips'][0]['equipmentType']
					equiptcode.innerHTML = this.boxinfo[0]['equips'][0]['equipmentCode']
					equiptrate.innerHTML = this.boxinfo[0]['equips'][0]['equipRatedPower']
				}
				else if(this.selectedModule.name == '走线2'){
					spacenb.innerHTML = this.boxinfo[0]['spaceCode']
					spaceheight.innerHTML = this.boxinfo[0]['height']
					spacerate.innerHTML = this.boxinfo[0]['ratedPower']
					orgname.innerHTML = this.boxinfo[0]['orgName']
					usedrate.innerHTML = this.boxinfo[0]['usedPower']
					remainrate.innerHTML = this.boxinfo[0]['remainingPower']
					equiptype.innerHTML = this.boxinfo[0]['equips'][1]['equipmentType']
					equiptcode.innerHTML = this.boxinfo[0]['equips'][1]['equipmentCode']
					equiptrate.innerHTML = this.boxinfo[0]['equips'][1]['equipRatedPower']
				}
				else if(this.selectedModule.name == '走线3'){
					spacenb.innerHTML = this.boxinfo[1]['spaceCode']
					spaceheight.innerHTML = this.boxinfo[1]['height']
					spacerate.innerHTML = this.boxinfo[1]['ratedPower']
					orgname.innerHTML = this.boxinfo[1]['orgName']
					usedrate.innerHTML = this.boxinfo[1]['usedPower']
					remainrate.innerHTML = this.boxinfo[1]['remainingPower']
					equiptype.innerHTML = this.boxinfo[1]['equips'][0]['equipmentType']
					equiptcode.innerHTML = this.boxinfo[1]['equips'][0]['equipmentCode']
					equiptrate.innerHTML = this.boxinfo[1]['equips'][0]['equipRatedPower']
				}
				else if(this.selectedModule.name == '走线4'){
					spacenb.innerHTML = this.boxinfo[2]['spaceCode']
					spaceheight.innerHTML = this.boxinfo[2]['height']
					spacerate.innerHTML = this.boxinfo[2]['ratedPower']
					orgname.innerHTML = this.boxinfo[2]['orgName']
					usedrate.innerHTML = this.boxinfo[2]['usedPower']
					remainrate.innerHTML = this.boxinfo[2]['remainingPower']
					equiptype.innerHTML = this.boxinfo[2]['equips'][0]['equipmentType']
					equiptcode.innerHTML = this.boxinfo[2]['equips'][0]['equipmentCode']
					equiptrate.innerHTML = this.boxinfo[2]['equips'][0]['equipRatedPower']
				}
				else if(this.selectedModule.name == '走线5'){
					spacenb.innerHTML = this.boxinfo[2]['spaceCode']
					spaceheight.innerHTML = this.boxinfo[2]['height']
					spacerate.innerHTML = this.boxinfo[2]['ratedPower']
					orgname.innerHTML = this.boxinfo[2]['orgName']
					usedrate.innerHTML = this.boxinfo[2]['usedPower']
					remainrate.innerHTML = this.boxinfo[2]['remainingPower']
					equiptype.innerHTML = this.boxinfo[2]['equips'][1]['equipmentType']
					equiptcode.innerHTML = this.boxinfo[2]['equips'][1]['equipmentCode']
					equiptrate.innerHTML = this.boxinfo[2]['equips'][1]['equipRatedPower']
				}
				else{
					spacenb.innerHTML = ' '
					spaceheight.innerHTML = ' '
					spacerate.innerHTML = ' '
					orgname.innerHTML = ' '
					usedrate.innerHTML = ' '
					remainrate.innerHTML = ' '
					equiptype.innerHTML = ' '
					equiptcode.innerHTML = ' '
					equiptrate.innerHTML = ' '
				}

				//td.innerHTML = '222'
				const points = []
				//console.log(this);
				//console.log(this.selectedModule)
				//points.push(this.selectedModule.world_position)
				let parent = this.selectedModule.get_Parent()
				while (parent.name !== 'Base') {
					points.push(parent.world_position)
					parent = parent.get_Parent()
				}
				// console.log(points)
				this.$static.Base.Traverse((module) => {
					Module.set_Color(module, 0.2)
				}, () => {
				})
				Module.set_Color(this.selectedModule, 1, 'orange')

				const line = new MeshLine();
				line.setPoints(points);
				console.log(line)
				const material = new MeshLineMaterial({
					transparent: true,
					depthTest: false,
					color:'#FFA500',
					dashArray: 0.05,
					dashOffset: 0,
					dashRatio: 0.15
				});
				const mesh = new THREE.Mesh(line, material);
				mesh.name = 'mesh'
				this.$static.Scene.add(mesh);
				this.mesh = mesh
				// 加入箭头
				var dir = new THREE.Vector3();
				// 规格化方向向量(转换为长度为1的向量)
				dir.subVectors(points[0],points[1]).normalize();
				// console.log(dir)
				// 箭头开始的点
				var origin = points[0];
				// 箭头的长度。默认值为1
				var length = 3;
				// 用于定义颜色的十六进制值。默认值为0xffff00
				var hex = '#FFA500';
				// 箭头的长度。默认值为0.2 *length
				var headLength = 2;
				// 箭头宽度的长度。默认值为0.2 * headLength。
				var headWidth = 1;
				var arrowHelper = new THREE.ArrowHelper(dir, origin, length, hex, headLength,headWidth);
				arrowHelper.name = 'myarrowHelper'
				// console.log(arrowHelper)
				this.$static.Scene.add(arrowHelper);
			},

			load(poleid) {
				//console.log(poleid);
				var divL = document.getElementById("line");
				var divFT = document.getElementById("frontdoortext");
				var divFC = document.getElementById("frontdoorcheckbox");
				var divST = document.getElementById("sidedoortext");
				var divSC = document.getElementById("sidedoorcheckbox");
				var divBT = document.getElementById("backdoortext");
				var divBC = document.getElementById("backdoorcheckbox");
				var divWT = document.getElementById("wavetext");
				var divWC = document.getElementById("wavecheckbox");
				var divFanT = document.getElementById("fantext");
				var divFanC = document.getElementById("fancheckbox");
				var divLT = document.getElementById("locktext");
				var divLC = document.getElementById("lockcheckbox");
				this.openFront = false;
				this.openBack = false;
				this.openSide = false;
				this.openWave = false;
				this.openFan = false;
				this.changeLock = false;
				if(this.watertop != null){
					this.$static.Scene.remove( this.watertop );
					this.$static.Scene.remove( this.waterfront );
					this.$static.Scene.remove( this.waterright );
				}
				if(poleid == 100){
					divL.style.display = "block";
					divFT.style.display = "block";
					divFC.style.display = "block";
					divST.style.display = "block";
					divSC.style.display = "block";
					divBT.style.display = "block";
					divBC.style.display = "block";
					divWT.style.display = "block";
					divWC.style.display = "block";
					divFanT.style.display = "block";
					divFanC.style.display = "block";
					divLT.style.display = "block";
					divLC.style.display = "block";
					console.log("这是100");

					let baseslot = this.$static.Base.get_Slot_by_Name('BaseSlot')
						while (baseslot.connectedmodule.length > 0) {
							let module = baseslot.connectedmodule[0]
							baseslot.disconnect(module)
							module.Traverse(Module.remove_from_Scene, Slot.remove_from_Scene)
						}
					this.$static.Base.Traverse(Module.get_Summary, () => { })

					this.boxModule = this.create_Tree_from_JSON({ ComponentID: 0, Sub: null })
					this.$static.Base.get_Slot_by_Name('BaseSlot').connect(this.boxModule)
					this.topModule = this.create_Tree_from_JSON({ ComponentID: 1, Sub: null })
					console.log('///////////')
					this.boxModule.get_Slot_by_Name("箱顶盖插槽").connect(this.topModule)
					this.frontDoorModule = this.create_Tree_from_JSON({ ComponentID: 2, Sub: null })
					this.boxModule.get_Slot_by_Name("前门插槽").connect(this.frontDoorModule)
					this.backDoorModule = this.create_Tree_from_JSON({ ComponentID: 4, Sub: null })
					this.boxModule.get_Slot_by_Name("后门插槽").connect(this.backDoorModule)
					this.sideDoorModule = this.create_Tree_from_JSON({ ComponentID: 5, Sub: null })
					this.boxModule.get_Slot_by_Name("侧门插槽").connect(this.sideDoorModule)
					this.panelModule1 = this.create_Tree_from_JSON({ ComponentID: 3, Sub: null })
					Module.set_Scale(this.panelModule1, 1.18, 1, 1)
					//console.log(this.panelModule1)
					this.boxModule.get_Slot_by_Name("仓位分隔板插槽").connect(this.panelModule1)
					this.panelModule2 = this.create_Tree_from_JSON({ ComponentID: 8, Sub: null })
					Module.set_Scale(this.panelModule2, 1.18, 1, 1)
					this.boxModule.get_Slot_by_Name("仓位分隔板插槽").connect(this.panelModule2)
					this.panelModule3 = this.create_Tree_from_JSON({ ComponentID: 9, Sub: null })
					Module.set_Scale(this.panelModule3, 1.18, 1, 1)
					this.boxModule.get_Slot_by_Name("仓位分隔板插槽").connect(this.panelModule3)

					this.deviceModule1 = this.create_Tree_from_JSON({ ComponentID: 10, Sub: null })
					Module.set_Scale(this.deviceModule1, 1, 1, 1)
					this.panelModule1.get_Slot_by_Name("波纹插槽").connect(this.deviceModule1)

					this.deviceModule2 = this.create_Tree_from_JSON({ ComponentID: 11, Sub: null })
					Module.set_Scale(this.deviceModule2, 1, 1, 1)
					this.panelModule1.get_Slot_by_Name("波纹插槽").connect(this.deviceModule2)

					this.deviceModule3 = this.create_Tree_from_JSON({ ComponentID: 12, Sub: null })
					Module.set_Scale(this.deviceModule3, 1, 1, 1)
					this.panelModule2.get_Slot_by_Name("波纹插槽").connect(this.deviceModule3)

					this.deviceModule4 = this.create_Tree_from_JSON({ ComponentID: 13, Sub: null })
					Module.set_Scale(this.deviceModule4, 1, 1, 1)
					this.panelModule3.get_Slot_by_Name("波纹插槽").connect(this.deviceModule4)

					this.deviceModule5 = this.create_Tree_from_JSON({ ComponentID: 14, Sub: null })
					Module.set_Scale(this.deviceModule5, 1, 1, 1)
					this.panelModule3.get_Slot_by_Name("波纹插槽").connect(this.deviceModule5)

					this.zouxianModule1 = this.create_Tree_from_JSON({ ComponentID: 15, Sub: null })
					this.zouxianModule2 = this.create_Tree_from_JSON({ ComponentID: 16, Sub: null })
					this.zouxianModule3 = this.create_Tree_from_JSON({ ComponentID: 17, Sub: null })
					this.zouxianModule4 = this.create_Tree_from_JSON({ ComponentID: 18, Sub: null })
					this.zouxianModule5 = this.create_Tree_from_JSON({ ComponentID: 19, Sub: null })

					this.zouxianModule1_1 = this.create_Tree_from_JSON({ ComponentID: 20, Sub: null })
					this.zouxianModule2_2 = this.create_Tree_from_JSON({ ComponentID: 21, Sub: null })
					this.zouxianModule3_3 = this.create_Tree_from_JSON({ ComponentID: 22, Sub: null })
					this.zouxianModule4_4 = this.create_Tree_from_JSON({ ComponentID: 23, Sub: null })
					this.zouxianModule5_5 = this.create_Tree_from_JSON({ ComponentID: 24, Sub: null })
					
					console.log("here");
					console.log(this.zouxianModule1_1);

					Module.set_Scale(this.zouxianModule1_1, 1, 1, 1)
					this.deviceModule1.get_Slot_by_Name("波纹插槽").connect(this.zouxianModule1_1)
					Module.set_Scale(this.zouxianModule2_2, 1, 1, 1)
					this.deviceModule2.get_Slot_by_Name("波纹插槽").connect(this.zouxianModule2_2)
					Module.set_Scale(this.zouxianModule3_3, 1, 1, 1)
					this.deviceModule3.get_Slot_by_Name("波纹插槽").connect(this.zouxianModule3_3)
					Module.set_Scale(this.zouxianModule4_4, 1, 1, 1)
					this.deviceModule4.get_Slot_by_Name("波纹插槽").connect(this.zouxianModule4_4)
					Module.set_Scale(this.zouxianModule5_5, 1, 1, 1)
					this.deviceModule5.get_Slot_by_Name("波纹插槽").connect(this.zouxianModule5_5)

					Module.set_Scale(this.zouxianModule1, 3, 16, 16)
					this.zouxianModule1_1.get_Slot_by_Name("波纹插槽").connect(this.zouxianModule1)
					Module.set_Scale(this.zouxianModule2, 3, 16, 16)
					this.zouxianModule2_2.get_Slot_by_Name("波纹插槽").connect(this.zouxianModule2)
					Module.set_Scale(this.zouxianModule3, 4.5, 16, 16)
					this.zouxianModule3_3.get_Slot_by_Name("波纹插槽").connect(this.zouxianModule3)
					Module.set_Scale(this.zouxianModule4, 3, 16, 16)
					this.zouxianModule4_4.get_Slot_by_Name("波纹插槽").connect(this.zouxianModule4)
					Module.set_Scale(this.zouxianModule5, 3, 16, 16)
					this.zouxianModule5_5.get_Slot_by_Name("波纹插槽").connect(this.zouxianModule5)

					this.fanModule = this.create_Tree_from_JSON({ ComponentID: 6, Sub: null })
					this.boxModule.get_Slot_by_Name("风扇插槽").connect(this.fanModule)
					this.lockModule = this.create_Tree_from_JSON({ ComponentID: 7, Sub: null})
					Module.set_Scale(this.lockModule, 3, 5, 4)
					this.boxModule.get_Slot_by_Name("门锁插槽").connect(this.lockModule)
					this.$static.Base.Traverse(Module.set_Visible)
					this.$static.Base.Update()

				}
				else{
					divL.style.display = "block";
					divFT.style.display = "none";
					divFC.style.display = "none";
					divST.style.display = "none";
					divSC.style.display = "none";
					divBT.style.display = "none";
					divBC.style.display = "none";
					divWT.style.display = "none";
					divWC.style.display = "none";
					divFanT.style.display = "none";
					divFanC.style.display = "none";
					divLT.style.display = "none";
					divLC.style.display = "none";
				let aeskey = 'fSQDFy2ca7MeWc6YBXPQse86FJHTYTPn'
				let PublicKey = 'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCmOPICLOzNSRMjcwWbtO+/a4hc2i87Iov3p5Sfky0u75Wt5Kycb4BOhurZWQnx453yN+u8ljBV4HfEResUcgDdPnNy281EIJbAOIz39pknTBuJzAmqM6atmZKrJVfOxZIMnNRDgWu4fsvpPqgsQWc5NaCdMreIE5Z5JyrbgA94ewIDAQAB'
				//let word = 'presetPoleCode=' + poleid + '&sourceType=1&regionId=2'

				let word = 'presetPoleCode=' + poleid + '&sourceType=1&regionId=2&platFormId=0'
				const key = CryptoJS.enc.Utf8.parse(aeskey)
				const srcs = CryptoJS.enc.Utf8.parse(word)
				const encrypted = CryptoJS.AES.encrypt(srcs, key, {
					mode: CryptoJS.mode.ECB,
					padding: CryptoJS.pad.Pkcs7
				})

				let that = this
				fetch('http://180.167.245.227:65516/woody/visual/getPartsByPoleCode?param=' + encrypted.ciphertext.toString(), {
					method: 'GET',
					headers: {
						'access_key': 'ZN193CkJqwo7FJ0TnCyjVe/z0AYevc32oD8fONk1fH8XvTAs8uVtRWhcPK+uwDFSU/GVDc9ASuOlpfYoxj1AVutb393iLNKQJBrZ6car08QtNzISrMDvLr0SkXBfZBbMG0auPK1DFdcZVzjgGMrd4QUkHKSFLgbZL20pLQmKgpg=',
						'access_token': PublicKey,
						'Content-Type': 'application/json'
					}
				})
					.then(function (response) {
						return response.json()
					})
					.then(function (Json) {
						console.log(Json)
						if (Json.respCode === 0) {
							let baseslot = that.$static.Base.get_Slot_by_Name('BaseSlot')
							while (baseslot.connectedmodule.length > 0) {
								let module = baseslot.connectedmodule[0]
								baseslot.disconnect(module)
								module.Traverse(Module.remove_from_Scene, Slot.remove_from_Scene)
							}
							that.$static.Base.Traverse(Module.get_Summary, () => { })
							let ans = create_Tree_from_PoleJson(Json.returns.components, Json.returns.acrossMultiTransverseArm, that.$static.Scene, that)
							console.log(ans.tree)
							that.$static.Base.get_Slot_by_Name('BaseSlot').connect(ans.tree)
							that.$static.Base.Traverse(Module.set_Visible)
							that.$static.Base.Update()
						}
						else {
							customLog(that, "error", "自动拼接", "网络接口生成 错误", "在 <请求数据> 出现了如下错误: <br>" + HTML.create_KeyPair('错误', Json.respMsg, "String"))
						}
					});
				}
			},



			create_Tree_from_JSON: function (json) {
				if (json === null || json === {}) {
					return
				}
				if (json["Sub"] === null) {
					let Main_data = boxdata[json["ComponentID"]]
					//console.log(Main_data)
					let LastModule = new Module(Main_data["moduleid"], uniqueID, Main_data["modulename"], new THREE.Vector3(parseFloat(Main_data["moduleposition"][0]), parseFloat(Main_data["moduleposition"][1]), parseFloat(Main_data["moduleposition"][2])), new THREE.Euler(parseFloat(Main_data["modulerotation"][0]), parseFloat(Main_data["modulerotation"][1]), parseFloat(Main_data["modulerotation"][2]), 'XYZ'), this.$static.Scene, Main_data["url"], new SM_Free(new THREE.Vector3(0, 0, 0), new THREE.Euler(0, 0, 0, "XYZ")), false, '合箱', {}, -1,)
					let current_slotlist = Main_data["interfaces"]

					for (let i = 0; i < current_slotlist.length; i++) {
						let Slot_data = current_slotlist[i]
						// let positionx = parseFloat(Slot_data["interfaceposition"][0]) + parseFloat(current_module.shiftposition.x)
						// let positiony = parseFloat(Slot_data["interfaceposition"][1]) + parseFloat(current_module.shiftposition.y)
						// let positionz = parseFloat(Slot_data["interfaceposition"][2]) + parseFloat(current_module.shiftposition.z)

						let positionx = parseFloat(Slot_data["interfaceposition"][0])
						let positiony = parseFloat(Slot_data["interfaceposition"][1])
						let positionz = parseFloat(Slot_data["interfaceposition"][2])

						let slot = new Slot(Slot_data["interfaceUID"], Slot_data["interfacename"], new THREE.Vector3(positionx, positiony, positionz), new THREE.Euler(parseFloat(Slot_data["interfacerotation"][0]), parseFloat(Slot_data["interfacerotation"][1]), parseFloat(Slot_data["interfacerotation"][2]), 'XYZ'), this.$static.Scene)
						// console.log(slot)

						LastModule.add_Slot(slot)
					}
					return LastModule
				}
				this.baseslot.remove_SubTree_from_Scene()

				let moduledatalist = new Array()
				let modulelist = new Array()

				let currentuid = 0

				let Main_data = boxdata[json["ComponentID"]]
				console.log(Main_data)
				let LastModule = new Module(Main_data["moduleid"], currentuid, Main_data["modulename"], new THREE.Vector3(parseFloat(Main_data["moduleposition"][0]), parseFloat(Main_data["moduleposition"][1]), parseFloat(Main_data["moduleposition"][2])), new THREE.Euler(parseFloat(Main_data["modulerotation"][0]), parseFloat(Main_data["modulerotation"][1]), parseFloat(Main_data["modulerotation"][2]), 'XYZ'), this.objectorigin, Main_data["url"], this.unit)
				this.baseslot.connect(LastModule)

				moduledatalist.push(json)
				modulelist.push(LastModule)

				currentuid++

				while (moduledatalist.length > 0) {
					let current_data = moduledatalist.pop()
					let current_module = modulelist.pop()
					let current_component_data = boxdata[current_data["ComponentID"]]
					let current_slotlist = current_component_data["interfaces"]

					for (let i = 0; i < current_slotlist.length; i++) {
						let Slot_data = current_slotlist[i]
						// let positionx = parseFloat(Slot_data["interfaceposition"][0]) + parseFloat(current_module.shiftposition.x)
						// let positiony = parseFloat(Slot_data["interfaceposition"][1]) + parseFloat(current_module.shiftposition.y)
						// let positionz = parseFloat(Slot_data["interfaceposition"][2]) + parseFloat(current_module.shiftposition.z)

						let positionx = parseFloat(Slot_data["interfaceposition"][0])
						let positiony = parseFloat(Slot_data["interfaceposition"][1])
						let positionz = parseFloat(Slot_data["interfaceposition"][2])

						let slot = new Slot(Slot_data["interfaceUID"], Slot_data["interfacename"], new THREE.Vector3(positionx, positiony, positionz), new THREE.Euler(parseFloat(Slot_data["interfacerotation"][0]), parseFloat(Slot_data["interfacerotation"][1]), parseFloat(Slot_data["interfacerotation"][2]), 'XYZ'), this.objectorigin)
						// console.log(slot)

						current_module.add_Slot(slot)

						let Sub_datalist = current_data["Sub"][i]
						for (let j = 0; j < Sub_datalist.length; j++) {
							let Sub_Data = boxdata[Sub_datalist[j]["ComponentID"]]
							// console.log(">>> " + Sub_Data)
							let Sub_Module = new Module(Sub_Data["moduleid"], currentuid, Sub_Data["modulename"], new THREE.Vector3(parseFloat(Sub_Data["moduleposition"][0]), parseFloat(Sub_Data["moduleposition"][1]), parseFloat(Sub_Data["moduleposition"][2])), new THREE.Euler(parseFloat(Sub_Data["modulerotation"][0]), parseFloat(Sub_Data["modulerotation"][1]), parseFloat(Sub_Data["modulerotation"][2]), 'XYZ'), this.$static.Scene, Sub_Data["url"], this.unit)
							currentuid++
							slot.connect(Sub_Module)
							modulelist.push(Sub_Module)
							moduledatalist.push(Sub_datalist[j])
						}
						let LastModule = new Module(Main_data["moduleid"], currentuid, Main_data["modulename"], new THREE.Vector3(parseFloat(Main_data["moduleposition"][0]), parseFloat(Main_data["moduleposition"][1]), parseFloat(Main_data["moduleposition"][2])), new THREE.Euler(parseFloat(Main_data["modulerotation"][0]), parseFloat(Main_data["modulerotation"][1]), parseFloat(Main_data["modulerotation"][2]), 'XYZ'), this.objectorigin, Main_data["url"], this.unit)
						this.baseslot.connect(LastModule)

					}
				}
				return LastModule
			},

			on_Canvas_Resize(x, y, width, height) {
				let canvasdom = document.getElementById('PW_PoleBoxDisplay_Canvas')
				if (canvasdom === null || this.$static.Renderer === null || this.$static.Camera === null) return
				let newwidth = (width - 12)
				let newheight = (height - 12)
				this.$static.Renderer.setSize(newwidth, newheight)
				this.$static.Camera.aspect = (newwidth / newheight)
				this.$static.Camera.updateProjectionMatrix()
			},
			// RayCastObject
			get_RayCastObject: function (objarray, mouseposition) {

				this.$static.Raycaster.setFromCamera(mouseposition, this.$static.Camera)

				let intersects = this.$static.Raycaster.intersectObjects(objarray)

				let indexarray = []

				intersects.forEach((item) => {
					let obj = item.object
					for (let i = 0; i < objarray.length; i++) {
						if (obj === objarray[i]) {
							indexarray.push(i)
							break
						}
					}
				})

				if (intersects.length > 0) {
					return { interfaces: intersects, index: indexarray }
				}
				else {
					return null
				}
			},
			// on_ContextMenu: function (event) {
			// 	// console.log(">>>on_ContextMenu")
			// 	if (this.selectedModule === null) {
			// 		// 未选中任何组件
			// 		// console.log(">>>this.selectedModule === null")
			// 	}
			// 	else {
			// 		this.$EventBus.$emit('contextmenu_open', 'display', [
			// 		'画布 - ' + this.selectedModule.name, '-',
			// 		// { text: this.selectedModule.get_Info(), icon: 'blank', action: 'display_select_Module', data: 'deselect' },
			// 		{ text: '线缆类型:xx线', icon: 'blank', action: 'display_select_Module', data: 'deselect' },
			// 		{ text: '所在舱位:xxx', icon: 'blank', action: 'display_select_Module', data: 'deselect' },
			// 		{ text: '规格型号:xxx', icon: 'blank', action: 'display_select_Module', data: 'deselect' }], this.selectedModule.uid, event.clientX, event.clientY, 2)
			// 	}
			// },
			mouseDoubleClick: function () {
				this.$static.Scene.remove(this.$static.Scene.getObjectByName('mesh')); // 删除原先的线
				this.$static.Scene.remove(this.$static.Scene.getObjectByName('myarrowHelper')); // 删除原先的箭头
				this.$static.MouseRawPosition.set(event.offsetX, event.offsetY)
				let modulelist = []
				this.$static.Base.get_Slot_by_Name('BaseSlot').Traverse((module) => {
					if (module.model !== null)
						modulelist.push(module)
				}, () => {
				})
				let canvassize = this.$static.Renderer.getSize()
				let mousePosition = new THREE.Vector2((this.$static.MouseRawPosition.x) / (canvassize.x) * 2 - 1, - (this.$static.MouseRawPosition.y) / (canvassize.y) * 2 + 1)
				let touchedModel = this.get_RayCastObject(modulelist.map((module) => { return module.model }), mousePosition)
				if (touchedModel !== null) {
					let ans = Array.from(new Set(touchedModel.index.map((idx) => { return modulelist[idx] })))
					let parent = ans[0]
					// console.log(parent.get_Info())
					console.log(parent)
					this.selectedModule = parent
					
					this.$static.Base.Traverse((module) => {
						Module.set_Color(module, 1)
						// Module.highlight(module, false)
					}, () => {
					})
					Module.set_Color(this.selectedModule, 1, 'orange')

					if(this.selectedModule.classification == '灯臂'){
						console.log("是灯臂")
						Module.set_Color(this.selectedModule, 1, 'yellow')

					}
					// while (parent.componentid !== -1) {
					// 	parent = parent.get_Parent()
					// 	if (parent === null) {
					// 		break;
					// 	}
					// }
					// if (parent === null) {
					// 	console.log("-------null-------")
					// }
					// else {
					// 	console.log(parent)
					// 	console.log(parent.id)
					// }
				}
				// alert(this.selectedModule.get_Info())
				// let touchedModel = this.get_RayCastObject(modulelist.map((module) => { return module.model }), mousePosition)
				// if (touchedModel !== null) {
				// 	let ans = Array.from(new Set(touchedModel.index.map((idx) => { return modulelist[idx] })))
				// 	let parent = ans[0]
				// 	console.log(parent.get_Info())
				// 	// while (parent.componentid !== -1) {
				// 	// 	parent = parent.get_Parent()
				// 	// 	if (parent === null) {
				// 	// 		break;
				// 	// 	}
				// 	// }
				// 	// if (parent === null) {
				// 	// 	console.log("-------null-------")
				// 	// }
				// 	// else {
				// 	// 	console.log(parent)
				// 	// 	console.log(parent.id)
				// 	// }
				// }
			}
		},
		mounted() {
			this.init()
			let result = ComponentManager.load_JSON_Legacy(data)
			this.dataManager = result[0]
			this.Layout = new Layouter('PW_PoleBoxDisplay', ['PW_PoleBoxDisplay_CanvasPanel', 'PW_PoleBoxDisplay_RightPanel'])
			let CanvasPanel = new Panel('PW_PoleBoxDisplay_CanvasPanel', '', this.on_Canvas_Resize, true, true, 200, 400)
			let RightPanel = new Panel('PW_PoleBoxDisplay_RightPanel', '', null, false, true, 220, 400)
			RightPanel.set_Visible(true)
			this.Layout.layout_tree.split([CanvasPanel, RightPanel])
			this.Layout.format()
			this.Layout.refresh_Layout()
		}
	}
</script>
<style scoped>
	#PW_PoleBoxDisplay_Canvas {
		/* background-color: tomato; */
		position: absolute;
		top: 6px;
		left: 6px;
		right: 6px;
		bottom: 6px;
		border: none;
		outline: none;
		border-radius: var(--ObjectRadius);
	}
</style>
