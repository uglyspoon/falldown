import * as d3 from 'd3'
import _ from 'lodash'
/**
 * 添加svg元素
 * @param selector 选择器
 * @param name svg className
 */
function addSVG (selector, name) {
  let width = document.querySelector(selector).clientWidth
  let height = document.querySelector(selector).clientHeight
  let svg = d3.select(selector)
    .append('svg')
    .attr('class', name)
    .attr('width', width)
    .attr('height', height)
    .attr('baseProfile', 'tiny')
    .attr('version', '1.2')
    .attr('xmlns:ev', 'http://www.w3.org/2001/xml-events')
    .attr('xmlns:xlink', 'http://www.w3.org/1999/xlink')
  return svg
}
/**
 *
 * @param point 六边形的中心点
 * @param r 六边形的半径
 * @returns {[*,*,*,*,*,*]}
 */
function getRegularHexagon (point, r) {
  let x = point[0]
  let y = point[1]
  let angle = Math.PI / 6
  let p1 = [x, y - r]
  let p2 = [x + Math.cos(angle) * r, y - Math.sin(angle) * r]
  let p3 = [x + Math.cos(angle) * r, y + Math.sin(angle) * r]
  let p4 = [x, y + r]
  let p5 = [x - Math.cos(angle) * r, y + Math.sin(angle) * r]
  let p6 = [x - Math.cos(angle) * r, y - Math.sin(angle) * r]
  let p = [p1, p2, p3, p4, p5, p6]
  p = _.map(p, function (d) {
    return _.map(d, function (e) {
      return +(e).toFixed(9)
    })
  })
  return p
}

export {
  getRegularHexagon,
  addSVG
}
