/* eslint-disable */
import $ from 'jquery'
import _ from 'lodash'
import * as d3 from 'd3'
import data from '../assets/data/data.json'
import { RANKORDER, RANKCOLOR, RANKOREDERMAP, PAGES, CHARGENAME } from '../common/variable.js'
import generatePolygon from '../common/generatePolygon.js'
import { getRegularHexagon } from '../common/common.js'
import mapData from '../assets/data/map.json'
import {showInfomationDetails, hideInfomationDetails} from './showDetailsInformation.js'
import {showRankDialog, hideRankDialog, showEightChargeDialog, hideEightChargeDialog, showMultifyChargesDialog, hideMultifyChargesDialog} from './showDialog.js'
let cos60 = Math.cos(Math.PI / 3)
let sin60 = Math.sin(Math.PI / 3)
let dom
let svg
let width
let height
let handler
let nowStatus = 0
let prevStatus = 0
let status = {}
let swipeDirection = 'down'

function init (el) {
  dom = $(el)[0]
  width = $(el).width()
  height = $(el).height()
  svg = d3.select(dom).append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('class', 'svg-content')
}

// rankpage start
let RankPage = {
  init: function () {
    this.startLeft = width * 0.2
    this.startTop = height * 0.05
    this.rowGapY = 4
    this.rowGapX = 3
    this.colStart = 0
    this.width = width
    this.height = height
    this.r = this.width * 0.03
    this.xR = Math.cos(Math.PI / 6) * this.r
    this.yR = this.r
    this.grids = {}
    let groups = _.groupBy(data, 'rankCat')
    groups = _.omit(groups, '-')
    let arr = RANKORDER.map((d) => {
      return {
        name: d,
        value: groups[d]
      }
    })
    arr = _.map(arr, (d, i) => {
      let tmp = arr.slice(0, i)
      let t = 0
      _.each(tmp, (e) => {
        t += Math.ceil(e.value.length / 10) * (this.rowGapY + 2 * this.yR)
      })
      d.startHeight = t + this.startTop
      return d
    })
    _.each(arr, (d, i) => {
      _.each(d.value, (e, i) => {
        let col = i % 10
        let row = Math.floor(i / 10)
        e['grid'] = [(col * (2 * this.xR + this.rowGapX)) + this.xR + this.startLeft, d.startHeight + row * (2 * this.yR + this.rowGapY) + this.yR]
        e['cd'] = [col, row]
        this.grids[e.name] = e['grid']
      })
    })
    this.arr = arr
  },
  render: function () {
    showRankDialog()
    let chartData = this
    this.svg = svg.append('svg').attr('class', 'rank-page')
    this.svg.selectAll('g.rank-group')
      .data(this.arr)
      .enter()
      .append('g')
      .attr('class', 'rank-group')
    this.svg.selectAll('g.rank-group')
      .data(this.arr)
      .attr('class', 'rank-group')
    this.svg.selectAll('g.rank-group')
      .data(this.arr)
      .exit()
      .remove()
    let r = this.r
    let startLeft = this.startLeft
    let startHeight = this.startHeight
    this.svg.selectAll('g.rank-group')
      .each(function (d) {
        d3.select(this)
          .append('text')
          .attr('class', 'rank-label')
          .attr('x', 0)
          .attr('y', '1em')
          .attr('dy', r / 2)
          .attr('transform', (d) => {
            return `translate(${startLeft - 10},${d.startHeight})`
          })
          .text(d.name)
          .style('text-anchor', 'end')
          .style('font-size', 10)
          .style('fill', '#5b1112')
        // --------- ploygons -----------
        d3.select(this).selectAll('polygon.rank-hexagon')
          .data(d.value)
          .enter()
          .append('polygon')
          .attr('id', (e) => {
            return e.name
          })
          .attr('class', 'rank-hexagon')
          .attr('points', function (d) {
            let points = getRegularHexagon(d.grid, r)
            return _.map(points, function (e) {
              return e.join(',')
            }).join(' ')
          })
          .attr('transform-origin', (e) => {
            return `${e.grid[0]} ${e.grid[1]}`
          })
          .style('fill', (d) => {
            return RANKCOLOR[d.rankOrder]
          })
          .attr('stroke-width', 1)
          .attr('stroke', (d) => {
            if (d.rankCat === '军队落马将领') {
              return '#000000'
            } else {
              return 'transparent'
            }
          })
          .attr('data-more', true)
          .on('click', function (d) {
            d3.select('.rank-active-group').remove()
            let activeGroup = svg.append('g')
              .attr('class', 'rank-active-group')
            let thisDom = d3.select(this)
              .style('fill', '#5B1112')
              activeGroup.append('use')
              .attr('xlink:href', () => {
                return '#' + d.name
              })
              .attr('transform-origin', () => {
                return `${d.grid[0]} ${d.grid[1]}`
              })
              .style('transform', 'scale(1,1)')
              .transition()
              .duration(200)
              .ease(d3.easeLinear)
              .style('transform', 'scale(2,2)')
              .transition()
              .duration(600)
              .ease(d3.easeBounce)
              .style('transform', 'scale(1,1)')
              .on('end', function () {
                d3.select(this)
                  .style('fill', () => {
                    return RANKCOLOR[d.rankOrder]
                  })
                thisDom
                  .style('fill', () => {
                    return RANKCOLOR[d.rankOrder]
                  })
              })
              let data = d3.range(6, chartData.r, (chartData.r) / 3)
            data = data.reverse()
            activeGroup.selectAll('circle.rank-active')
              .data(data)
              .enter()
              .append('circle')
              .attr('class', 'rank-active')
              .attr('cx', d.grid[0])
              .attr('cy', d.grid[1])
              .attr('r', (d) => {
                return d
              })
              .attr('transform-origin', `${d.grid[0]} ${d.grid[1]}`)
              .attr('fill', '#5b1112')
            showInfomationDetails(d, d3.event)
          })
        svg.on('click', (e) => {
          let hide = !$(d3.event.target).data('more')
          if(hide) {
            hideInfomationDetails()
            d3.selectAll('.rank-hexagon')
            .classed('active-rank-hexagon', false)
          }
        })
      })
  },
  riseUp: function () {},
  falldown: function () {
    // show labels
    d3.selectAll('.rank-label')
      .style('opacity', 0)
      .transition()
      .duration(500)
      .delay((d, i) => {
        return i * 500 + 2000
      })
      .style('opacity', 1)
    // show polygon fall down
    d3.selectAll('.rank-hexagon')
      .attr('transform', () => {
        return `translate(${Math.random() * -2000 + 1000},${Math.random() * -2000 - 1000})`
      })
      .transition()
      .duration(2000)
      .attr('transform', () => {
        return `translate(0, 0)`
      })
  },
  showAgain: function () {
    svg.append('g')
    .attr('class', 'rank-page')
    .html(this.cache)
  },
  disappear: function () {
    this.cache = svg.select('.rank-page').html()
    svg.select('.rank-page').remove()
  }
}
// rankpage end
RankPage.init()

// mappage start
let MapPage = {
  init: function () {
    this.width = width
    this.height = height
    this.r = width * 0.015
    this.marginLeft = width * 0.1
    this.otherTop = width + width * 0.08
    let rate = width / 750
    this.colNumber = 25
    this.mapGroupTop = width * 0.15
    this.mapTop = -width * 0.11
    this.mapLeft = -width * 0.005
    this.mapData = mapData.map((d) => {
      let find = _.find(data, e => _.trim(e.name) === _.trim(d.name))
      d.points = d.points.map(d => {
        return d.map(e => e * rate)
      })
      let obj = Object.assign(d, find)

      obj['rankGrid'] = RankPage.grids[d.name]
      return obj
    })
    let areaGroup = _.groupBy(data, 'area')
    this.otherData = []
    this.otherData[0] = {
      name: '中央',
      value: _.reverse(_.sortBy(areaGroup['中央'], 'rankOrder')),
      number: areaGroup['中央'].length,
      hStart: 0
    }
    this.otherData[1] = {
      name: '企业',
      value: _.reverse(_.sortBy(areaGroup['企业'], 'rankOrder')),
      number: areaGroup['企业'].length,
      hStart: Math.ceil(this.otherData[0].number / this.colNumber)
    }
    this.otherData[2] = {
      name: '军队',
      value: areaGroup['军队'],
      number: areaGroup['军队'].length,
      hStart: Math.ceil(this.otherData[0].number / this.colNumber) + Math.ceil(this.otherData[1].number / this.colNumber)
    }
    this.otherData[3] = {
      name: '兵团',
      value: areaGroup['兵团'],
      number: areaGroup['兵团'].length,
      hStart: Math.ceil(this.otherData[0].number / this.colNumber) + Math.ceil(this.otherData[1].number / this.colNumber) + Math.ceil(this.otherData[2].number / this.colNumber)
    }
  },
  render: function () {
    this.svg = svg.append('g').attr('class', 'map-page')
    let mapSvgGroups = this.svg.append('g')
      .attr('class', 'map-polygon-group')
      .attr('transform', `translate(0,${this.mapGroupTop})`)
    mapSvgGroups.append('image')
      .attr('xlink:href', '../static/img/map.svg')
      .attr('x', this.mapLeft)
      .attr('y', this.mapTop)
      .attr('width', this.width)
      .attr('height', this.width)
      .attr('opacity', 0)
      .transition()
      .duration(500)
      .delay(2000)
      .attr('opacity', 1)
    let mapSvgPolygons = mapSvgGroups.selectAll('polygon.map-polygon')
      .data(this.mapData)
      .enter()
      .append('polygon')
      .attr('class', 'map-polygon')
      .style('fill', d => {
        return RANKCOLOR[d.rankOrder]
      })
      .attr('points', (d) => {
        let points = getRegularHexagon(d.grid, RankPage.r)
        return _.map(points, (e) => {
          return e.join(',')
        }).join(' ')
      })
      .transition()
      .duration(2000)
      .attr('points', function (d) {
        return _.map(d.points, (e) => {
          return e.join(',')
        }).join(' ')
      })
    let othersSVGGroups = this.svg.append('g')
      .attr('class', 'others-polygon-group')
      .attr('transform', `translate(${this.marginLeft}, ${this.otherTop})`)
    this.othersSVG = othersSVGGroups.selectAll('g.other-groups')
      .data(this.otherData)
      .enter()
      .append('g')
      .attr('class', 'other-groups')
      .attr('transform', (d, i) => {
        return `translate(0,${d.hStart * (this.r * 3) + this.r * 3})`
      })
    let r = this.r
    let colNumber = this.colNumber
    let otherTop = this.otherTop
    let marginLeft = this.marginLeft
    this.othersSVG
      .each(function (d, i) {
        console.log(d)
        d3.select(this)
          .append('text')
          .attr('class', 'other-label')
          .text(d.name + ':')
          .attr('x', 0)
          .attr('y', 0)
          .attr('dx', '-0.5em')
          .attr('text-anchor', 'end')
          .style('font-size', '10')
          .style('fill', '#5b1112')
        // add polygon
        d3.select(this)
          .selectAll('polygon.other-polygon')
          .data(d.value)
          .enter()
          .append('polygon')
          .attr('class', 'other-polygon')
          .attr('fill', d => {
            return RANKCOLOR[d.rankOrder]
          })
          .attr('stroke-width', 1)
          .attr('stroke', '#000')
          .attr('points', function (d) {
            let points = getRegularHexagon(d.grid, RankPage.r)
            return _.map(points, (e) => {
              return e.join(',')
            }).join(' ')
          })
          .attr('transform', e => {
            return `translate(-${marginLeft}, -${d.hStart * (r * 3) + r * 3 + otherTop})`
          })
          .transition()
          .duration(2000)
          .attr('points', (d, i) => {
            let x = i % colNumber
            x = x * 2.1 * r + width * 0.05
            let y = parseInt(i / colNumber) * 2.2 * r
            let pos = [x, y]
            let points = getRegularHexagon(pos, r)
            return points.map(d => d.join(',')).join(' ')
          })
          .attr('transform', e => {
            return `translate(0,0)`
          })
      })
  },
  showAgain: function () {
    svg.append('g')
    .attr('class', 'map-page')
    .html(this.cache)
  },
  disappear: function () {
    this.cache = svg.select('.map-page').html()
    svg.select('.map-page').remove()
  }
}

// map page end

// fall down number start
let FalldownPage = {
  init: function () {
    let dataGroup = _.groupBy(data, function (d) {
      var yearReg = /(\d{4})年/
      var matchs = d.falldownTime.match(yearReg)
      return matchs[1]
    })
    dataGroup = _.toPairs(dataGroup)
    this.dataGroup = dataGroup
    this.width = width
    this.height = height
    let r = +(0.012 * height).toFixed(2) * 0.8
    this.r = r
    this.margin = {
      left: 2 * r * 2,
      right: 2 * r * 2,
      bottom: 15,
      top: 15
    }
    this.gap = width * 0.04
    this.dy = height * 0.0005
    this.axisHeight = height * 0.075
  },
  getVerticalCoord(order, x) {
    let xs = 0
    let r = this.r
    let dy = this.dy
    let height = this.height
    let axisHeight = this.axisHeight
    if (order % 2) {
      // 奇数
      xs = parseInt(x - this.r * Math.cos(Math.PI / 6))
    } else {
      // 偶数
      xs = x
    }
    let bigGap = Math.floor(order / 3) * 3 * dy
    let y = (height - axisHeight * 2) - (1.5 * order * (r + 1) - 0.5 * r) - bigGap - r - r * Math.sin(Math.PI / 6)
    return [xs, y]
  },
  render: function () {
    let chartData = this
    this.svg = svg.append('g').attr('class', 'falldown-time-page')
    let axes = this.svg.append('g')
      .attr('class', 'axis')
      .attr('transform', function () {
        return 'translate(' + chartData.margin.left + ',' + (chartData.height - chartData.axisHeight * 2) + ')'
      })
    axes.append('line')
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', chartData.width - (chartData.margin.right + chartData.margin.left))
      .attr('y2', 0)
      .attr('stroke-width', 1)
      .attr('stroke', '#5B1112')

    let ticks = axes.selectAll('g.tick-group')
      .data(chartData.dataGroup)
      .enter()
      .append('g')
      .attr('class', 'tick-group')
      .attr('transform', function (d, i) {
        let gap = chartData.gap
        let w = (chartData.width - chartData.margin.left - chartData.margin.right - 2 * gap) / (chartData.dataGroup.length - 1)
        return 'translate(' + (gap + w * i) + ',0)'
      })

    ticks.append('text')
      .attr('class', 'year')
      .text(function (d) {
        if (+d[0] === 2017) {
          return d[0] + '(年)'
        }
        return d[0]
      })
      .attr('dy', 55)
      .style('text-anchor', 'middle')
      .style('font-size', 10)
      .style('fill', '#5B1112')
    ticks.append('line')
      .attr('class', 'tick-line')
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', 0)
      .attr('y2', 40)
      .attr('stroke-width', 1)
      .attr('stroke', '#5B1112')
      // aixs end

    let yLines = [0, 20, 40]
    let yLinesGroup = this.svg.selectAll('g.number-line-group')
      .data(yLines)
      .enter()
      .append('g')
      .attr('class', 'number-line-group')
      .attr('transform', (d) => {
        let x = 0
        let order = d
        let pos = chartData.getVerticalCoord(order, x)
        return 'translate(' + (chartData.margin.left + pos[0]) + ',' + (pos[1] + chartData.r) + ')'
      })

      yLinesGroup.attr('opacity', 0)
      .transition()
      .duration(300)
      .delay((d,i) => i * 2000)
      .attr('opacity', 1)
    this.svg.selectAll('g.number-line-group')
      .append('line')
      .attr('class', 'number-line')
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', chartData.width - (chartData.margin.right + chartData.margin.left))
      .attr('y2', 0)
      .attr('stroke-width', 1)
      .attr('stroke', '#5B1112')
    this.svg.selectAll('g.number-line-group')
      .append('text')
      .attr('class', 'number-text')
      .attr('x', -10)
      .attr('y', 0)
      .attr('dy', '0.5em')
      .style('text-anchor', 'end')
      .style('font-size', 10)
      .style('fill', '#5B1112')
      .text(function (d) {
        return d
      })

    // render hexagon
    let hexagonGroup = this.svg.selectAll('g.fall-down-hexagons-group')
      .data(chartData.dataGroup)
      .enter()
      .append('g')
      .attr('class', 'fall-down-hexagons-group')
      .attr('transform', (d, i) => {
        let gap = chartData.gap
        let w = (chartData.width - chartData.margin.left - chartData.margin.right - 2 * gap) / (chartData.dataGroup.length - 1)
        return 'translate(' + (chartData.margin.left + w * i - chartData.r * Math.cos(Math.PI / 6)) + ',0)'
      })

    hexagonGroup
      .each(function (d) {
        d3.select(this)
          .selectAll('polygon.fall-down-hexagon')
          .data(d[1])
          .enter()
          .append('polygon')
          .attr('class', 'fall-down-hexagon')
          .attr('points', function (d, i) {
            let x = chartData.r * Math.cos(Math.PI / 6) + chartData.gap
            let pos = chartData.getVerticalCoord(i, x)
            let points = getRegularHexagon(pos, chartData.r)
            return _.map(points, (d) => {
              return d.join(',')
            }).join(' ')
          })
          .attr('fill', d => {
            return RANKCOLOR[d.rankOrder]
          })
          .attr('stroke', (d) => {
            if (d.rankCat !== '军队落马将领') {
              return 'transparent'
            } else {
              return '#000'
            }
          })
          .attr('transform', (d, i) => {
            return `translate(0, -2000)`
          })
          .transition()
          .duration(2000)
          .delay((d, i) => i * 80)
          .attr('transform', (d, i) => {
            return `translate(0,0)`
          })
      })
  },
  showAgain: function () {
    svg.append('g')
    .attr('class', 'falldown-time-page')
    .html(this.cache)
  },
  disappear: function () {
    this.cache = svg.select('.falldown-time-page').html()
    svg.select('.falldown-time-page').remove()
  }
}
// fall down number down

// fall down rank start
let FalldownRankPage = {
  init: function () {
    this.width = width
    this.height = height
    let r = +(0.012 * height).toFixed(2) * 1
    this.r = r
    this.margin = {
      left: 0,
      right: 0,
      bottom: 15,
      top: 15
    }
    this.gap = width * 0.08
    this.dy = height * 0.0005
    this.axisHeight = height * 0.075
    // -----------------------
    let timeGroup = _.groupBy(data, function (d) {
      let yearReg = /(\d{4})年/
      let matchs = d.falldownTime.match(yearReg)
      return matchs[1]
    })
    this.timeGroup = _.toPairs(timeGroup)
    let rankGroup = _.groupBy(data, 'rankCat')
    rankGroup = _.omit(rankGroup, '-')
    rankGroup = _.toPairs(rankGroup)
    let rankData = []
    function findOrder (name) {
      let find = _.find(rankGroup, function (d) {
        return d[0] === name
      })
      rankData.push(find)
    }
    _.each(RANKORDER, findOrder)
    this.timeRank = [2012, 2013, 2014, 2015, 2016, 2017]
    let hstart = 0
    rankData = _.reverse(rankData)
    _.each(rankData, function (d, i) {
      let n = _.groupBy(d[1], function (d) {
        let yearReg = /(\d{4})年/
        let matchs = d.falldownTime.match(yearReg)
        return matchs[1]
      })
      n = _.toPairs(n)
      var m = _.maxBy(n, function (e) {
        return e[1].length
      })
      d[2] = hstart
      let y = 3
      if (m[1].length % 6) {
        let g = Math.floor(m[1].length / 6) * 3
        let f = m[1].length % 6
        if (f > 3) {
          y = 3
        } else {
          y = f
        }
        y = y + g
      } else {
        y = Math.floor(m[1].length / 6) * 3
      }
      hstart += y
    })
    this.rankData = rankData
  },
  getVerticalCoord(order) {
    let r = this.r
    let g = Math.floor(order / 6)
    let xOrder = Math.floor(order / 3)
    let yOrder = order % 3
    let x, y
    if (yOrder % 2) {
      // y 是单数 x 需要减去 r * Math.cos(Math.PI / 6)
      if (xOrder % 2) {
        // 当x为奇数时 x + Math.cos(MAth.PI / 6) * 2
        x = Math.cos(Math.PI / 6) * 2 * r + 4
      } else {
        // 当x是偶数时 x 不需要处理
        x = 0
      }
      x = x - r * Math.cos(Math.PI / 6)
    } else {
      // y 是偶数 y 是偶数的时候不用减
      if (xOrder % 2) {
        // 当x为奇数时 x + Math.cos(MAth.PI / 6) * 2
        x = Math.cos(Math.PI / 6) * 2 * r + 4
      } else {
        // 当x是偶数时 x 不需要处理
        x = 0
      }
    }
    y = r + (r + Math.sin(Math.PI / 6) * r) * yOrder
    y = y + g * (3 * r)
    y = 0 - y - r * 3 * g
    return [x, y]
  },
  render: function () {
    let chartData = this
    this.svg = svg.append('g').attr('class', 'falldown-rank-page')
    let axes = this.svg .append('g')
      .attr('class', 'axis')
      .attr('transform', function () {
        return 'translate(' + chartData.margin.left + ',' + (chartData.height - chartData.axisHeight * 2) + ')'
      })
    let ticks = axes.selectAll('g.tick-group')
      .data(chartData.timeGroup)
      .enter()
      .append('g')
      .attr('class', 'tick-group')
      .attr('transform', function (d, i) {
        let gap = chartData.gap
        let w = (chartData.width - chartData.margin.left - chartData.margin.right - 2 * gap) / (chartData.timeGroup.length - 1)
        return 'translate(' + (gap + w * i) + ',0)'
      })
    ticks.append('text')
      .attr('class', 'year')
      .text(function (d) {
        if (+d[0] === 2017) {
          return d[0] + '(年)'
        }
        return d[0]
      })
      .attr('dy', 55)
      .style('text-anchor', 'middle')
      .style('font-size', 10)
      .style('fill', '#5B1112')
    ticks.append('line')
      .attr('class', 'tick-line')
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', 0)
      .attr('y2', 40)
      .attr('stroke-width', 1)
      .attr('stroke', '#5B1112')
    // ----------------split line------------------------
    let gGroups = this.svg.selectAll('g.group-rank-time')
      .data(chartData.rankData)
      .enter()
      .append('g')
      .attr('class', 'group-rank-time')
      .attr('transform', (d) => {
        return 'translate( ' + (chartData.margin.left / 2) + ', ' + (chartData.height - chartData.axisHeight * 2 - (d[2]) * (2 * chartData.r)) + ')'
      })
    gGroups.append('line')
      .attr('class', 'rank-time-line')
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', chartData.width)
      .attr('y2', 0)
      .attr('stroke-width', 1)
      .attr('stroke', '#5B1112')
      .attr('stroke-dasharray', 3)
    gGroups.append('text')
      .attr('class', 'rank-time-label')
      .attr('x', 0)
      .attr('y', 0)
      .attr('dy', '1.1em')
      .attr('dx', '0.15rem')
      .text(function (d) {
        return d[0]
      })
      .style('font-size', 10)
      .style('fill', '#5B1112')
    gGroups
      .each(function (d) {
        let t = _.groupBy(d[1], function (d) {
          let yearReg = /(\d{4})年/
          let matchs = d.falldownTime.match(yearReg)
          return matchs[1]
        })

        let data = _.map(chartData.timeRank, function (d) {
          let val = t[d]
          if (!val) {
            val = []
          }
          return {
            year: d,
            value: val
          }
        })
        let timeRankGroups = d3.select(this).selectAll('g.time-rank-polygon')
          .data(data)
          .enter()
          .append('g')
          .attr('class', 'time-rank-polygon')
          .attr('transform', (d, i) => {
            let gap = chartData.gap
            let w = (chartData.width - chartData.margin.left - chartData.margin.right - 2 * gap) / (chartData.timeGroup.length - 1)
            return 'translate(' + (gap + w * i + chartData.margin.left / 2) + ',0)'
          })
        timeRankGroups
          .each(function (d, index) {
            d3.select(this)
              .selectAll('polygon.time-rank-polygon')
              .data(d.value)
              .enter()
              .append('polygon')
              .attr('points', (d, i) => {
                let pos = chartData.getVerticalCoord(i)
                let points = getRegularHexagon(pos, chartData.r)
                return _.map(points, (e) => {
                  return e.join(',')
                }).join(' ')
              })
              .attr('fill', d => {
                return RANKCOLOR[d.rankOrder]
              })
              .attr('stroke', (d) => {
                if (d.rankCat !== '军队落马将领') {
                  return '#fff'
                } else {
                  return '#000'
                }
              })
              .attr('transform', (d, i) => {
                return `translate(0, -2000)`
              })
              .transition()
              .duration(1000)
              .delay((d, i) => {
                return i * 100
              })
              .attr('transform', (d, i) => {
                return `translate(0, 0)`
              })
          })
      })
  },
  showAgain: function () {
    svg.append('g')
    .attr('class', 'falldown-rank-page')
    .html(this.cache)
  },
  disappear: function () {
    this.cache = svg.select('.falldown-rank-page').html()
    svg.select('.falldown-rank-page').remove()
  }
}
// fall down rank end

let chargeEightPage = {
  init: function () {
    let rate = width / 750
    this.areaPos = [[250, 360], [450, 500], [120, 530], [250, 670], [630, 700], [400, 200], [440, 620], [550, 610]]
    this.areaPos = this.areaPos.map(d => {
      return d.map(e => e * rate)
    })
    let chargeNameData = _.map(CHARGENAME, (d, i) => {
      let filterData = _.filter(data, (e) => {
        if (e.chargeMains) {
          let index = (i + 1) + ''
          return e.chargeMains.indexOf(index) > -1
        } else {
          return false
        }
      })
      let back = {}
      back['value'] = filterData
      back['name'] = d
      back['number'] = filterData.length
      return back
    })
    chargeNameData = _.sortBy(chargeNameData, 'number')
    chargeNameData = chargeNameData.reverse()
    this.margin = {
      left: 0,
      right: 0,
      bottom: 15,
      top: 15
    }
    this.width = width
    this.height = height
    this.r = this.width * 0.015
    this.chargeNameData = chargeNameData
    this.gap = width * 0.08
    this.dy = height * 0.0005
    this.axisHeight = height * 0.075
    this.timeChartMarginLeft = width * 0.35
    // ----------------- add ------------------------------
    let areaExtent = d3.extent(_.map(chargeNameData, (d) => {
      return d.number
    }))
    let areaScale = d3.scaleLinear()
      .domain(areaExtent)
      .range([width * 0.14, width * 0.33])
    this.areaCal = _.map(chargeNameData, (d, i) => {
      var c = chargeNameData.slice(0, i)
      var s = _.sumBy(c, (d) => {
        return areaScale(d.number)
      })
      return s + 30
    })
    this.areaScale = areaScale
    let dataGroup = _.groupBy(data, (d) => {
      var yearReg = /(\d{4})年/
      var matchs = d.falldownTime.match(yearReg)
      return matchs[1]
    })
    dataGroup = _.toPairs(dataGroup)
    this.dataGroup = dataGroup
  },
  getVerticalCoord(order, x) {
    let xs = 0
    let r = this.r
    let dy = this.dy
    let height = this.height
    let axisHeight = this.axisHeight
    if (order % 2) {
      // 奇数
      xs = parseInt(x - this.r * Math.cos(Math.PI / 6))
    } else {
      // 偶数
      xs = x
    }
    let bigGap = Math.floor(order / 3) * 3 * dy
    let y = (height - axisHeight * 2) - (1.5 * order * (r + 1) - 0.5 * r) - bigGap - r - r * Math.sin(Math.PI / 6)
    xs = xs + r * Math.cos(Math.PI / 3)
    return [xs, y]
  },
  render: function () {
    showEightChargeDialog()
    let chartData = this
    this.svg = svg.append('g').attr('class', 'charge-eight-page')
    let areaGroups = this.svg.selectAll('g.charge-area-group')
      .data(chartData.chargeNameData)
      .enter()
      .append('g')
      .attr('class','charge-area-group')
      .attr('transform', (d, i) => {
        var x = chartData.areaPos[i][0]
        var y = chartData.areaPos[i][1]
        return 'translate(' + x + ',' + y + ')'
      })
    areaGroups
    .attr('transform', (d, i) => {
        var x = chartData.areaPos[i][0]
        var y = chartData.areaPos[i][1]
        return 'translate(' + x + ',' + y + ') scale(0, 0) '
      })
    .transition()
    .duration(2000)
    .delay((d, i) => i * 100)
        .attr('transform', (d, i) => {
        var x = chartData.areaPos[i][0]
        var y = chartData.areaPos[i][1]
        return 'translate(' + x + ',' + y + ') scale(1, 1)'
      })
    areaGroups
      .append('rect')
      .attr('x', (d, i) => {
        return -chartData.areaScale(d.number) / 2
      })
      .attr('y', (d, i) => {
        return -chartData.areaScale(d.number) / 2
      })
      .attr('width', (d) => {
        return chartData.areaScale(d.number)
      })
      .attr('height', (d) => {
        return chartData.areaScale(d.number)
      })
      .attr('fill', '#5b1112')
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
    areaGroups
      .append('text')
      .attr('x', 0)
      .attr('y', 0)
      .style('text-anchor', 'middle')
      .style('fill', '#fff')
      .html((d) => {
        let html = ''
        let name = d.name.replace('、', '')
        let row = 0
        for (let i = 0; i < name.length - 1; i = i + 5) {
          html += '<tspan x="0" dy="' + row + '">' + name.slice(i, i + 5) + '</tspan>'
          row += 15
        }
        return html
      })
      .style('font-size', 10)
  },
  renderNoAnimation() {
    let chartData = this
    this.svg = svg.append('g').attr('class', 'charge-eight-page')
    let areaGroups = this.svg.selectAll('g.charge-area-group')
      .data(chartData.chargeNameData)
      .enter()
      .append('g')
      .attr('class','charge-area-group')
      .attr('transform', (d, i) => {
        var x = chartData.areaPos[i][0]
        var y = chartData.areaPos[i][1]
        return 'translate(' + x + ',' + y + ')'
      })
    areaGroups
      .append('rect')
      .attr('x', (d, i) => {
        return -chartData.areaScale(d.number) / 2
      })
      .attr('y', (d, i) => {
        return -chartData.areaScale(d.number) / 2
      })
      .attr('width', (d) => {
        return chartData.areaScale(d.number)
      })
      .attr('height', (d) => {
        return chartData.areaScale(d.number)
      })
      .attr('fill', '#5b1112')
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
    areaGroups
      .append('text')
      .attr('x', 0)
      .attr('y', 0)
      .style('text-anchor', 'middle')
      .style('fill', '#fff')
      .html((d) => {
        let html = ''
        let name = d.name.replace('、', '')
        let row = 0
        for (let i = 0; i < name.length - 1; i = i + 5) {
          html += '<tspan x="0" dy="' + row + '">' + name.slice(i, i + 5) + '</tspan>'
          row += 15
        }
        return html
      })
      .style('font-size', 10)
  },
  renderTime: function () {
    hideEightChargeDialog()
    this.renderNoAnimation()
    let chartData = this
    let axes =  this.svg.append('g')
      .attr('class', 'axis')
      .attr('transform', () => {
        return 'translate(' + chartData.timeChartMarginLeft + ',' + (chartData.height - chartData.axisHeight * 2) + ')'
      })
    let ticks = axes.selectAll('g.tick-group')
      .data(chartData.dataGroup)
      .enter()
      .append('g')
      .attr('class', 'tick-group')
      .attr('transform', (d, i) => {
        let w = (chartData.width - chartData.timeChartMarginLeft - chartData.margin.left - chartData.margin.right - 2 * chartData.gap) / (chartData.dataGroup.length - 1)
        return 'translate(' + (w * i + chartData.margin.left) + ',0)'
      })
    ticks.append('text')
      .attr('class', 'year')
      .text((d) => {
        if (+d[0] === 2017) {
          return d[0] + '(年)'
        }
        return d[0]
      })
      .attr('dy', 55)
      .style('text-anchor', 'middle')
      .style('font-size', 10)
      .style('fill', '#5B1112')
    ticks.append('line')
      .attr('class', 'tick-line')
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', 0)
      .attr('y2', 40)
      .attr('stroke-width', 1)
      .attr('stroke', '#5B1112')
    let hexagonGroup =  this.svg.selectAll('g.fall-down-hexagons-group')
      .data(chartData.dataGroup)
      .enter()
      .append('g')
      .attr('class', 'fall-down-hexagons-group')
      .attr('transform', (d, i) => {
        let w = (chartData.width - chartData.timeChartMarginLeft - chartData.margin.left - chartData.margin.right - 2 * chartData.gap) / (chartData.dataGroup.length - 1)
        return 'translate(' + (chartData.timeChartMarginLeft + w * i - w + chartData.margin.left) + ',0)'
      })
    hexagonGroup
      .each(function (d) {
        d3.select(this)
          .selectAll('polygon.fall-down-hexagon')
          .data(d[1])
          .enter()
          .append('polygon')
          .attr('class', 'fall-down-hexagon')
          .attr('points', function (d, i) {
            let x = chartData.r * Math.cos(Math.PI / 6) + chartData.gap
            let pos = chartData.getVerticalCoord(i, x)
            let points = getRegularHexagon(pos, chartData.r)
            return _.map(points, (d) => {
              return d.join(',')
            }).join(' ')
          })
          .attr('fill', d => {
            return RANKCOLOR[d.rankOrder]
          })
          .attr('stroke', (d) => {
            if (d.rankCat !== '军队落马将领') {
              return 'transparent'
            } else {
              return '#000'
            }
          })
          .attr('transform', 'translate(0, -2000)')
          .transition()
          .duration(300)
          .delay((d, i) => i * 30)
          .attr('transform', 'translate(0, 0)')
      })
      this.svg.selectAll('g.charge-area-group')
      .transition()
      .duration(2000)
      .delay((d, i) => {
        return 100 * i
      })
      .attr('transform', (d, i) => {
        let x = chartData.areaScale(d.number) / 2
        let y = chartData.areaCal[i] + chartData.areaScale(d.number) / 2
        return 'translate(' + (x + chartData.margin.left / 2) + ',' + y + ')'
      })
  },
  showAgain1: function () {
    svg.selectAll('.charge-eight-page').remove()
    svg.append('g')
    .attr('class', 'charge-eight-page')
    .html(this.cache1)
    showEightChargeDialog()
  },
  showAgain2: function () {
    svg.selectAll('.charge-eight-page').remove()
    svg.append('g')
    .attr('class', 'charge-eight-page')
    .html(this.cache2)
  },
  disappear1: function () {
    this.cache1 = svg.select('.charge-eight-page').html()
    svg.select('.charge-eight-page').remove()
    hideEightChargeDialog()
  },
  disappear2: function () {
    this.cache2 = svg.select('.charge-eight-page').html()
    svg.select('.charge-eight-page').remove()
  }
}


let chargeMultipyPage = {
  init: function() {
    let rate = width / 750
    this.areaPos = [[556, 596], [550,160], [42, 114], [462, 844], [42, 758], [336, 76], [104, 556], [98,606],[248, 836],[584,376], [222,656],[260,758],[260,614],[422,590],[466,496],[372,684],[92,160]]
    this.areaPos = this.areaPos.reverse()
    this.areaPos = this.areaPos.map(d => {
      return d.map(e => e * rate)
    })
    let charges = []
    _.each(data,function(d){
      var names = d.chargeName
      names= names.split('|')
      charges = charges.concat(names)
    })
    charges = _.uniq(charges)
    _.remove(charges, function (i) {
      return '-' == i
    })

    charges = _.map(charges, function(e) {
      var filter = _.filter(data, function(d) {
        if(d.chargeName) {
          return  d.chargeName.indexOf(e) > -1
        } else {
          return false
        }
      })
      var obj = {}
      obj['name'] = e
      obj['value'] = filter
      obj['number'] = filter.length
      return obj
    });
    charges = _.sortBy(charges,'number')
    this.margin = {
      left: 0,
      right: 0,
      bottom: 15,
      top: 15
    }
    this.width = width
    this.height = height
    this.r = this.width * 0.015
    this.charges = charges
    this.gap = width * 0.08
    this.dy = height * 0.0005
    this.axisHeight = height * 0.075
    this.timeChartMarginLeft = width * 0.35
    let areaExtent = d3.extent(_.map(charges, (d) => {
      return d.number
    }))
    let areaScale = d3.scaleLinear()
      .domain(areaExtent)
      .range([width * 0.05, width * 0.5])
    console.log(charges)
    this.areaCal = _.map(charges.reverse(), (d, i) => {
      var c = charges.slice(0, i)
      var s = _.sumBy(c, (d) => {
        return areaScale(d.number)
      })
      return s + 30
    })
    console.log(this.areaCal)
    this.areaScale = areaScale
    let dataGroup = _.groupBy(data, (d) => {
      var yearReg = /(\d{4})年/
      var matchs = d.falldownTime.match(yearReg)
      return matchs[1]
    })
    dataGroup = _.toPairs(dataGroup)
    this.dataGroup = dataGroup
  },
  getVerticalCoord(order, x) {
    let xs = 0
    let r = this.r
    let dy = this.dy
    let height = this.height
    let axisHeight = this.axisHeight
    if (order % 2) {
      // 奇数
      xs = parseInt(x - this.r * Math.cos(Math.PI / 6))
    } else {
      // 偶数
      xs = x
    }
    let bigGap = Math.floor(order / 3) * 3 * dy
    let y = (height - axisHeight * 2) - (1.5 * order * (r + 1) - 0.5 * r) - bigGap - r - r * Math.sin(Math.PI / 6)
    xs = xs + r * Math.cos(Math.PI / 3)
    return [xs, y]
},
  render: function() {
    showMultifyChargesDialog()
    let chartData = this
    svg.select('.charge-multipy-page').remove()
    this.svg = svg.append('g').attr('class', 'charge-multipy-page')
    let areaGroups = this.svg.append('g')
    .attr('classs', 'area-block-groups')
    let groups = areaGroups.selectAll('g.block-area-mutiply-group')
    .data(chartData.charges)
    .enter()
    .append('g')
    .attr('class','block-area-mutiply-group')
    .attr('transform', (d, i) => {
      let x = chartData.areaPos[i][0]
      let y = chartData.areaPos[i][1]
      return `translate(${x},${y})`
    })



    groups
    .append('rect')
    .attr('class', 'area-block')
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', d => {
      return chartData.areaScale(d.number)
    })
    .attr('height', d => {
      return chartData.areaScale(d.number)
    })
    .attr('fill', '#5B1111')
    .attr('stroke', '#fff')
    .attr('stroke-width', 1)
    groups
    .append('text')
    .attr('x', d => {
      if (d.number < 100) {
        return chartData.areaScale(d.number) + 5
      } else {
        return chartData.areaScale(d.number) / 2
      }
    })
    .attr('y', d=> {
         return chartData.areaScale(d.number) / 2
    })
    .attr('dy', '0.5em')
    .text(d => d.name)
    .style('font-size', 10)
    .style('fill', d => {
      if (d.number < 100) {
        return '#5B1111'
              } else {
        return '#fff'
      }
    })
    .style('text-anchor', (d) => {
      if (d.number < 100) {
        return 'start'
      } else {
        return 'middle'
      }
    })

    groups
    .attr('transform', (d, i) => {
        var x = chartData.areaPos[i][0]
        var y = chartData.areaPos[i][1]
        return 'translate(' + x + ',' + y + ') scale(0, 0) '
      })
    .transition()
    .duration(2000)
    .delay((d, i) => i * 100)
        .attr('transform', (d, i) => {
        var x = chartData.areaPos[i][0]
        var y = chartData.areaPos[i][1]
        return 'translate(' + x + ',' + y + ') scale(1, 1)'
      })
  },
  renderNoAnimation: function() {
    let chartData = this
    svg.select('.charge-multipy-page').remove()
    this.svg = svg.append('g').attr('class', 'charge-multipy-page')
    let areaGroups = this.svg.append('g')
    .attr('classs', 'area-block-groups')
    let groups = areaGroups.selectAll('g.block-area-mutiply-group')
    .data(chartData.charges)
    .enter()
    .append('g')
    .attr('class','block-area-mutiply-group')
    .attr('transform', (d, i) => {
      let x = chartData.areaPos[i][0]
      let y = chartData.areaPos[i][1]
      return `translate(${x},${y})`
    })

    groups
    .append('rect')
    .attr('class', 'area-block')
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', d => {
      return chartData.areaScale(d.number)
    })
    .attr('height', d => {
      return chartData.areaScale(d.number)
    })
    .attr('fill', '#5B1111')
    .attr('stroke', '#fff')
    .attr('stroke-width', 1)
    groups
    .append('text')
    .attr('x', d => {
      if (d.number < 100) {
        return chartData.areaScale(d.number) + 5
      } else {
        return chartData.areaScale(d.number) / 2
      }
    })
    .attr('y', d=> {
         return chartData.areaScale(d.number) / 2
    })
    .attr('dy', '0.5em')
    .text(d => d.name)
    .style('font-size', 10)
    .style('fill', d => {
      if (d.number < 100) {
        return '#5B1111'
              } else {
        return '#fff'
      }
    })
    .style('text-anchor', (d) => {
      if (d.number < 100) {
        return 'start'
      } else {
        return 'middle'
      }
    })
  },
  renderTime: function() {
    this.renderNoAnimation()
    let chartData = this
    let axes = this.svg.append('g')
      .attr('class', 'axis')
      .attr('transform', () => {
        return 'translate(' + chartData.timeChartMarginLeft + ',' + (chartData.height - chartData.axisHeight * 2) + ')'
      })
    let ticks = axes.selectAll('g.tick-group')
      .data(this.dataGroup)
      .enter()
      .append('g')
      .attr('class', 'tick-group')
      .attr('transform', (d, i) => {
        let w = (chartData.width - chartData.timeChartMarginLeft - chartData.margin.left - chartData.margin.right - 2 * chartData.gap) / (chartData.dataGroup.length - 1)
        return 'translate(' + (w * i + chartData.margin.left) + ',0)'
      })
    ticks.append('text')
      .attr('class', 'year')
      .text((d) => {
        if (+d[0] === 2017) {
          return d[0] + '(年)'
        }
        return d[0]
      })
      .attr('dy', 55)
      .style('text-anchor', 'middle')
      .style('font-size', 10)
      .style('fill', '#5B1112')
    ticks.append('line')
      .attr('class', 'tick-line')
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', 0)
      .attr('y2', 40)
      .attr('stroke-width', 1)
      .attr('stroke', '#5B1112')
      console.log(chartData.dataGroup)
    let hexagonGroup = this.svg.selectAll('g.fall-down-hexagons-group')
      .data(chartData.dataGroup)
      .enter()
      .append('g')
      .attr('class', 'fall-down-hexagons-group')
      .attr('transform', (d, i) => {
        let w = (chartData.width - chartData.timeChartMarginLeft - chartData.margin.left - chartData.margin.right - 2 * chartData.gap) / (chartData.dataGroup.length - 1)
        return 'translate(' + (chartData.timeChartMarginLeft + w * i - w + chartData.margin.left) + ',0)'
      })
    hexagonGroup
      .each(function (d) {
        d3.select(this)
          .selectAll('polygon.fall-down-hexagon')
          .data(d[1])
          .enter()
          .append('polygon')
          .attr('class', 'fall-down-hexagon')
          .attr('points', function (d, i) {
            let x = chartData.r * Math.cos(Math.PI / 6) + chartData.gap
            let pos = chartData.getVerticalCoord(i, x)
            let points = getRegularHexagon(pos, chartData.r)
            return _.map(points, (d) => {
              return d.join(',')
            }).join(' ')
          })
          .attr('fill', d => {
            return RANKCOLOR[d.rankOrder]
          })
          .attr('stroke', (d) => {
            if (d.rankCat !== '军队落马将领') {
              return 'transparent'
            } else {
              return '#000'
            }
          })
          .attr('transform', 'translate(0, -2000)')
          .transition()
          .duration(300)
          .delay((d, i) => i * 30)
          .attr('transform', 'translate(0, 0)')
      })
      this.svg.selectAll('g.block-area-mutiply-group')
      .transition()
      .duration(2000)
      .delay((d, i) => {
        return 100 * i
      })
      .attr('transform', (d, i) => {
        let x = 2
        let y = chartData.areaCal[i]
        return 'translate(' + (x + chartData.margin.left / 2) + ',' + y + ')'
      })

  },
  showAgain1: function () {
    svg.select('.charge-multipy-page').remove()
    svg.append('g')
    .attr('class', 'charge-multipy-page')
    .html(this.cache1)
    showMultifyChargesDialog()
  },
  showAgain2: function () {
    hideMultifyChargesDialog()
    svg.select('.charge-multipy-page').remove()
    svg.append('g')
    .attr('class', 'charge-multipy-page')
    .html(this.cache2)
  },
  disappear1: function () {
    this.cache1 = svg.select('.charge-multipy-page').html()
    svg.select('.charge-multipy-page').remove()
    hideMultifyChargesDialog()
  },
  disappear2: function () {
    this.cache2 = svg.select('.charge-multipy-page').html()
    svg.select('.charge-multipy-page').remove()
  }
}

let chargePenaltyPage = {
  init: function() {
    this.width = width
    this.height = width
    this.yR = width * 0.0075
    this.yGap = 1
    this.leftX = width * 0.08
    this.marginTop = width * 0.1
    this.yearWidth = width * 0.025
    this.yearHeight = this.yR * 0.6
    this.yearGapX = width * 0.008
    this.maxWidth = 20 * (this.yearWidth + this.yearGapX)
    this.maxHeight = width * 0.01
    let judgment = _.filter(data, (d) => {
      return d.prisonTime !== '-'
    })
    let arr = []
    let death = _.filter(judgment, (d) => {
      return d.prisonTime === '死刑'
    })
    death = _.map(death, (d) => {
      d['years'] = '死刑'
      return d
    })

    let deathSentence = _.filter(judgment, (d) => {
      return d.prisonTime === '死缓'
    })

    deathSentence = _.map(deathSentence, (d) => {
      d['years'] = '死缓'
      return d
    })

    let leftImprisonment = _.filter(judgment, (d) => {
      return d.prisonTime === '无期徒刑'
    })

    leftImprisonment = _.map(leftImprisonment, (d) => {
      d['years'] = '无期徒刑'
      return d
    })
    function orderYear (start, end) {
      var data = _.filter(judgment, (d) => {
        if (d.prisonTime.indexOf('年') > -1) {
          let s = d.prisonTime.split('年')
          let t = (+s[0]) <= end && (+s[0]) > start
          if (t) {
            return true
          } else {
            return false
          }
        } else {
          return d.prisonTime === false
        }
      })

      data = _.map(data, (d) => {
        var s = d.prisonTime.split('年')
        var t = (+s[0])
        d['years'] = t
        return d
      })
      data = _.sortBy(data, 'years')
      return data
    }

    let lessEquala5 = orderYear(0, 5)
    let bt5to10 = orderYear(5, 10)
    let bt10to15 = orderYear(10, 15)
    let bt15to20 = orderYear(15, 20)
    arr = arr.concat(lessEquala5, bt5to10, bt10to15, bt15to20, leftImprisonment, deathSentence, death)
    let areaData = [
      {
        name: '刑期≤5年',
        number: lessEquala5.length
      }, {
        name: '5<刑期≤10(年)',
        number: bt5to10.length
      }, {
        name: '10<刑期≤15年(年)',
        number: bt10to15.length
      }, {
        name: '15<刑期≤20(年)',
        number: bt15to20.length
      }, {
        name: '无期徒刑',
        number: leftImprisonment.length
      }, {
        name: '死缓',
        number: deathSentence.length
      }, {
        name: '死刑',
        number: death.length
      }
    ]
    this.arr = arr
    this.areaData = areaData
  },
  render: function() {
     let chartData = this
     this.svg = svg.append('svg').attr('class', 'penalty-page')
     let blockGroup = this.svg.selectAll('g.penalty-block')
      .data(chartData.areaData)
      .enter()
      .append('g')
      .attr('class', 'penalty-block')
      .attr('transform', (d, i) => {
        let x = 0
        let e = chartData.areaData.slice(0, i)
        let h = _.reduce(e, (a, b) => {
          return a + b.number
        }, 0)
        let y = chartData.marginTop + h * (chartData.yR  + chartData.yR * sin60 + chartData.yGap) + chartData.yR
        return `translate(${x},${y})`
      })

    blockGroup.append('rect')
      .attr('class', 'block-rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', chartData.width)
      .attr('height', (d) => {
        return (d.number) * (chartData.yR * 2  + chartData.yGap)
      })
      .attr('fill', (d, i) => {
        if (i % 2) {
          return '#fff'
        } else {
          return '#e5e5e5'
        }
      })
         blockGroup
        .append('text')
        .attr('x', chartData.width - 15)
        .attr('y', 0)
        .attr('dy', 10)
        .text((d) => {
          return d.name
        })
        .style('text-anchor', 'end')
        .style('font-size',10)
        .style('fill', '#5B1111')

        this.svg.selectAll('g.group-penalty')
          .data(chartData.arr)
          .enter()
          .append('g')
          .attr('class', 'group-penalty')
          .attr('transform', (d, i) => {
            let y = chartData.marginTop + chartData.yR + i * (chartData.yR  + chartData.yR * sin60 + chartData.yGap)
            return `translate(${chartData.leftX},${y})`
          })
        this.svg.selectAll('g.group-penalty')
          .append('polygon')
          .attr('class', 'penalty-hexagon')
          .attr('points', (d, i) => {
            let x = chartData.yR * sin60
            if(i % 2){
             x = 0
            }
            let points = getRegularHexagon([x, chartData.yR], chartData.yR * 1.2)
            return _.map(points, function (e) {
              return e.join(',')
            }).join(' ')
          })
          .attr('fill', d => {
            return RANKCOLOR[d.rankOrder]
          })
          .attr('stroke-width', 1)
          .attr('stroke', (d) => {
            if (d.rankCat !== '军队落马将领') {
              return '#fff'
            } else {
              return '#000'
            }
          })
          .attr('transform', `translate(-200,0)`)
          .transition()
          .duration(200)
          .delay((d, i) => i * 10)
          .attr('transform', 'translate(0, 0)')
        this.svg.selectAll('g.group-penalty')
          .each(function (d) {
            if (d['years'] === '无期徒刑') {
              d3.select(this)
                .append('rect')
                .attr('class', 'penalty-year')
                .attr('x', 20)
                .attr('y', chartData.yR / 2)
                .attr('height', chartData.maxHeight)
                .attr('fill', '#a07b7b')
                .attr('opacity', 0)
                .attr('width', 0)
                .transition()
                .duration(2000)
                .delay((d, i) => i * 50)
                .attr('opacity', 1)
                .attr('width', chartData.maxWidth)
            }
            if (d['years'] === '死缓') {
              d3.select(this)
                .append('rect')
                .attr('class', 'penalty-year')
                .attr('x', 20)
                .attr('y', chartData.yR / 2)
                .attr('height', chartData.maxHeight)
                .attr('fill', '#8c5858')
                  .attr('opacity', 0)
                .attr('width', 0)
                .transition()
                .duration(2000)
                .delay((d, i) => i * 50)
                .attr('opacity', 1)
                .attr('width', chartData.maxWidth)
            }
            if (d['years'] === '死刑') {
              d3.select(this)
                .append('rect')
                .attr('class', 'penalty-year')
                .attr('x', 20)
                .attr('y', chartData.yR / 2)
                .attr('height', chartData.maxHeight)
                .attr('fill', '#692626')
                .attr('opacity', 0)
                .attr('width', 0)
                .transition()
                .duration(2000)
                .delay((d, i) => i * 50)
                .attr('opacity', 1)
                .attr('width', chartData.maxWidth)
            }
            if (typeof d['years'] === 'number') {
              let data = d3.range(0, d['years'], 1)
              d3.select(this)
                .selectAll('rect.year-bar')
                .data(data)
                .enter()
                .append('rect')
                .attr('class', 'year-bar')
                .attr('x', (d, i) => {
                  return d * (chartData.yearWidth + chartData.yearGapX) + 20
                })
                .attr('y', chartData.yR / 2)
                .attr('width', chartData.yearWidth)
                .attr('height', chartData.yearHeight)
                .attr('fill', '#692626')
                .attr('opacity', 0)
                .transition()
                .duration(2000)
                .delay((d, i) => i * 50)
                .attr('opacity', 1)
            }
          })
  },
  showAgain: function () {
    svg.append('g')
    .attr('class', 'penalty-page')
    .html(this.cache)
  },
  disappear: function () {
    this.cache = svg.select('.penalty-page').html()
    svg.select('.penalty-page').remove()
  }
}

export { init, RankPage, MapPage, FalldownPage, FalldownRankPage, chargeEightPage, chargeMultipyPage,chargePenaltyPage}
