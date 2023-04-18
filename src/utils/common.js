/**
 * Created by on 19/9/25.
 */
import Vue from 'vue'

/**
 * common message
 * @param {String} text
 * @param {String} type
 */
export function info(text, type) {
  Vue.prototype.$message({
    message: text,
    type: type
  })
}

/**
 * add data to tablist
 * @param {Array} tabList
 * @param {string} whichtab
 * @param {(Object|Array)} tabData
 */
export function addTabData(tabList, whichtab, tabData, updateFun, deleteFun) {
  tabList.find(item => {
    if (item.name === whichtab) {
      if (updateFun) {
        item.updateItemData = updateFun
      }
      if (deleteFun) {
        item.deleteItemData = deleteFun
      }
      if (Array.isArray(tabData)) {
        if (item.hasOwnProperty('tableData')) {
          item.tableData = tabData
        } else if (item.hasOwnProperty('imgs')) {
          item.imgs = tabData
        }
      } else {
        if (item.hasOwnProperty('acuData')) {
          item.acuData = tabData
        } else if (item.hasOwnProperty('tableData')) {
          item.tableData = []
          item.tableData.push(tabData)
        } else if (item.hasOwnProperty('imgs')) {
          item.imgs = []
          item.imgs.push(tabData)
        }
      }
    }
  })
}

/**
 * get type of form-item
 * @param {String} val
 * @rerurn {(Object|Array)} type
 */
export function typeOfForm(val) {
  const selects = ['color', 'roadProperty', 'areaCode', 'phase', 'manageUnits', 'upperPowerType', 'controlRange', 'contrRange', 'manholeSetType', 'installType', 'poleType', 'cableType', 'lineType', 'bulbType']
  const selectSpecs = ['modelCode']
  const dates = ['installDate', 'runDate']
  const radios = ['flagStreetlight', 'flagEnergy']
  let type = 'input'
  if (dates.includes(val)) {
    type = 'date'
  }
  if (selects.includes(val)) {
    type = 'select'
  }
  if (selectSpecs.includes(val)) {
    type = 'selectSpec'
  }
  if (radios.includes(val)) {
    type = 'radio'
  }
  return type
}

/**
 * get options of select
 * @param {String} val
 * @rerurn {Array} options
 */
export function getSelectOptions(val) {
  // if (val === 'color') {
  //   return Vue.prototype.$store.state.dateDictionary.color.items
  // }
  // if (val === 'contrRange' || val === 'controlRange') {
  //   // //console.log(Vue.prototype.$store.state.dataDictionary)
  //   return Vue.prototype.$store.state.dateDictionary.controlRange.items
  // }
  return []
}

/**
 * filter arr from selectbox
 * @param {Array} arr
 * @param {(String|Number)} id
 * @rerurn {Array} afterFilter
 */
export function filterSelectBoxArr(arr, id) {
  var afterFilter = []
  arr.filter((v, i) => {
    if (v.typeId === id) {
      afterFilter.push(v.code)
    }
  })
  return afterFilter
}

/**
 * get current time
 * @rerurn {String} currectTime
 */
export function getCurrentTime() {
  var dateObj = new Date()
  var currectTime = `${dateObj.getFullYear()}-${fillZero(dateObj.getMonth() + 1)}-${fillZero(dateObj.getDate())} ${fillZero(dateObj.getHours())}:${fillZero(dateObj.getMinutes())}:${fillZero(dateObj.getSeconds())}`
  return currectTime
}

export function fillZero(str) {
  return str > 10 ? str : '0' + str
}
