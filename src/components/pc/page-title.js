/* eslint-disable */
import * as d3 from 'd3'
import $ from 'jquery'
import TWEEN from '@tweenjs/tween.js'
import generatePolygon from '../../common/generatePolygon'
import facesSVG from '../../common/faces'
import fanfuSVG from '../../common/fanfu'
let width, height
let el, svg
let theta60 = Math.PI / 3
let cos60 = Math.cos(theta60)
let sin60 = Math.sin(theta60)
let lineA
let lineB
let lineC
let lineD
let lineE
let lineF
let lineG
let pointA
let pointB
let pointC
let pointD
let pointE
let pointF
let pointG
let pointH
let line1
let line8
let line2
let hexagonPoints
let hexagonCx
let hexagonCy
let hexagonRadius
let groupHexagon
let groupDash
let groupSolid
let groupTextFanfu
let groupTextZhangMianKong
let scaleRate
function init (dom) {
  el = $(dom)
  width = el.width()
  height = el.height()
  scaleRate = width / 750
  hexagonCx = width / 2
  hexagonCy = 170
  hexagonRadius = width * 0.4
  if (hexagonRadius > 150) {
    hexagonRadius = 150
  }
  hexagonPoints = generatePolygon([hexagonRadius, hexagonCy], hexagonRadius, 6, 0)
  let points = hexagonPoints
  let radius = hexagonRadius
  lineA = [pointsCenter(points[1], points[2]), pointsCenter(points[3], points[4])]
  lineB = [pointsCenter(points[1], points[2]), pointsCenter(points[0], points[5])]
  lineC = [pointsCenter(points[0], points[1]), pointsCenter(points[4], points[5])]
  lineD = [[points[0][0] - 10, points[0][1]], [points[3][0] - 10, points[3][1]]]
  lineE = [points[3], points[5]]
  lineF = [pointsCenter(points[0], points[1]), pointsCenter(points[2], points[3])]
  lineG = [[points[2][0] - 10, points[2][1]], [points[5][0] - 10, points[5][1]]]
  pointA = [points[0][0] - radius, points[0][1] - 2 * radius * sin60 / 4 * 3]
  pointB = [points[0][0] - radius, points[0][1] - 2 * radius * sin60 / 4]
  pointC = [points[0][0] - radius * cos60 * 0.5, points[0][1] - 0.5 * radius * sin60]
  pointD = [points[0][0] - radius * 0.5 * cos60 * 3, points[0][1] - 0.5 * radius * sin60]
  pointE = [pointD[0], pointD[1] - radius * sin60]
  pointF = [pointC[0], pointD[1] - radius * sin60]
  pointG = [pointC[0] + radius * 0.5, pointF[1]]
  pointH = [pointC[0] + radius * 0.5, pointC[1]]
  line1 = [pointA, pointB]
  line8 = [[pointD[0] - 10, pointD[1]], [pointC[0] - 10, pointC[1]], [pointE[0] - 10, [pointE[1]]], [pointF[0] - 10, pointF[1]], [pointD[0] - 10, pointD[1]]]
  line2 = [pointH, pointC, pointG, pointF]
  svg = d3.select(el[0])
    .append('svg')
    .attr('width', width)
    .attr('height', height)
  groupHexagon = svg.append('g')
    .attr('class', 'hexagon')
  groupDash = svg.append('g')
    .attr('class', 'dash')
  groupSolid = svg.append('g')
    .attr('class', 'solid')
  groupTextFanfu = svg.append('g')
    .attr('class', 'text-fanfu')
  groupTextZhangMianKong = svg.append('g')
    .attr('class', 'text-faces')
  svg.append('image')
  .attr('x', width - 60)
  .attr('y', 0)
  .attr('width', 60)
  .attr('height', 60)
  .attr('xlink:href', 'static/img/caixin_logo.png')
}

function animatePolygon (during, delay) {
  let start = {
    x: hexagonCx,
    y: hexagonCy,
    s: 0
  }
  let hexagon
  let tween = new TWEEN.Tween(start)
    .to({
      x: 0,
      y: 0,
      s: 1
    }, during)
    .onStart(() => {
      hexagon = groupHexagon.append('polygon')
        .attr('points', () => {
          return hexagonPoints.map(d => {
            return d.join(',')
          }).join(' ')
        })
        .attr('fill', '#fff')
        // .attr('transform', function () {
        //   return `translate(${hexagonRadius}, 0) scale(0, 0)`
        // })
    })
    .onUpdate(() => {
      hexagon.attr('transform', function () {
        // return `translate(${start.x},${start.y}) scale(${start.s},${start.s})`
      })
    })
    .delay(delay)
  tween.start()
}

function animateTextFanfu (during, delay) {
  groupTextFanfu.html(fanfuSVG)
    .attr('transform', `translate(${hexagonRadius}, -115) scale(${scaleRate},${scaleRate})`)
  let fonts = groupTextFanfu.selectAll('g')
    .attr('opacity', 0)
  fonts.each(function (d, i) {
    let start = {
      opacity: 0
    }
    let font = d3.select(this)
    let tween = new TWEEN.Tween(start)
      .to({
        opacity: 1
      }, during)
      .onStart(() => {})
      .onUpdate(() => {
        font.attr('opacity', start.opacity)
      })
    tween
      .delay(delay + i * 500)
      .start()
  })
  let rect = groupTextFanfu.select('rect')
  let rectX = +rect.attr('x')
  let rectY = +rect.attr('y')
  let rectWidth = +rect.attr('width')
  let rectHeight = +rect.attr('height')
  let rectCx = rectX + rectWidth / 2
  let rectCy = rectY + rectHeight / 2
  let start = {
    rotate: 0
  }
  let tween = new TWEEN.Tween(start)
  .to({
    rotate: 360
  }, during)
  .repeat(Infinity)
  // .yoyo(true)
  .onStart(() => {})
  .onUpdate(() => {
    rect.attr('transform', `rotate(${start.rotate},${rectCx},${rectCy})`)
  })
  tween.start()
}

function animateTextZhangMianKong (during, delay) {
  groupTextZhangMianKong.html(facesSVG)
    .attr('transform', `translate(110, 00)`)
    .attr('fill', '#fff')
  groupTextZhangMianKong.selectAll('path')
  .attr('fill', '#fff')
  groupTextZhangMianKong.selectAll('polyline')
  .attr('stroke', '#fff')
  groupTextZhangMianKong.selectAll('line')
  .attr('stroke', '#fff')
  groupTextZhangMianKong.selectAll('rect')
  .attr('stroke', '#fff')
  let fonts = groupTextZhangMianKong.selectAll('g')
    .attr('opacity', 0)
  fonts.each(function (d, i) {
    let start = {
      opacity: 0
    }
    let font = d3.select(this)
    let tween = new TWEEN.Tween(start)
      .to({
        opacity: 1
      }, during)
      .onStart(() => {})
      .onUpdate(() => {
        font.attr('opacity', start.opacity)
      })
    tween
      .delay(delay + i * 500)
      .start()
  })
}

function animateLines (during, delay) {
  animateLine(lineA, delay / 5 + delay * Math.random(), delay * Math.random())
  // animateLine(lineB, delay / 5 + delay * Math.random(), delay * Math.random())
  animateLine(lineC, delay / 5 + delay * Math.random(), delay * Math.random())
  animateLine(lineD, delay / 5 + delay * Math.random(), delay * Math.random())
  animateLine(lineE, delay / 5 + delay * Math.random(), delay * Math.random())
  animateLine(lineF, delay / 5 + delay * Math.random(), delay * Math.random())
  animateLine(lineG, delay / 5 + delay * Math.random(), delay * Math.random())
}

function animateLine (linePoints, during, delay) {
  let line = groupDash.append('line')
    .attr('x1', linePoints[0][0])
    .attr('y1', linePoints[0][1])
    .attr('x2', linePoints[0][0])
    .attr('y2', linePoints[0][1])
    .attr('stroke-width', 1)
    .attr('stroke', '#5b1112')
    .attr('opacity', 0.3)
  let start = {
    x: linePoints[0][0],
    y: linePoints[0][1]
  }
  let tween = new TWEEN.Tween(start)
    .to({
      x: linePoints[1][0],
      y: linePoints[1][1]
    }, during)
    .repeat(Infinity)
    .yoyo(true)
    .onStart(() => {

    })
    .onUpdate(() => {
      line
        .attr('x2', start.x)
        .attr('y2', start.y)
    })
  tween.start()
}

function animatePaths (during, delay) {
  animatePath(line1, during, delay)
  animatePath(line8, during, delay)
  animatePath(line2, during, delay)
}

function animatePath (pathPoints, during, delay) {
  let path = groupSolid.append('path')
    .attr('d', () => {
      return 'M' + pathPoints.map(d => {
        return d.join(',')
      }).join('L')
    })
    .attr('stroke', '#5b1112')
    .attr('stroke-width', 3)
    .attr('fill', 'none')
  let totalLength = path.node().getTotalLength()
  let start = {
    len: totalLength
  }

  path.attr('stroke-dashoffset', totalLength)
    .attr('stroke-dasharray', totalLength)
  let tween = new TWEEN.Tween(start)
    .to({
      len: 0
    }, during)
    .easing(TWEEN.Easing.Linear.None)
    .onUpdate(function () {
      path.attr('stroke-dashoffset', start.len)
    })
    .onStart(function () {
      path.attr('stroke-dashoffset', totalLength)
        .attr('stroke-dasharray', totalLength)
    })
  tween.delay(delay)
    .start()
}

function pointsCenter (a, b) {
  return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]
}

function animateStart () {
  animatePolygon(1000, 0)
  animateLines(1000, 1000)
  animatePaths(1000, 1000)
  animateTextFanfu(1000, 1200)
  animateTextZhangMianKong(1000, 1200)
  function animate (time) {
    requestAnimationFrame(animate)
    TWEEN.update(time)
  }
  requestAnimationFrame(animate)
}

export default {
  init: init,
  start: animateStart
}
