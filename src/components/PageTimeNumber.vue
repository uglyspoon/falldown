<template>
  <div class="page-time-number" id="page-time-number" ref="pageTimeNumber">

  </div>
</template>

<script>
  import _ from 'lodash'
  import * as d3 from 'd3'
  import mapData from '../assets/data/map.json'
  import {RANKORDER, RANKCOLOR, TIMEORDER, RANKOREDERMAP, RANKCOLORMAP} from '../common/variable'
  import {addSVG, getRegularHexagon} from '../common/common'
  export default {
    name: 'pageTimeNumber',
    props: ['svgData', 'activeIndex', 'previousIndex', 'pageIndex'],
    data () {
      return {
        svg: null,
        mapData: mapData,
        allHexagons: null,
        chartData: {
          rankOrder: RANKORDER,
          rankColor: RANKCOLOR,
          timeOrder: TIMEORDER,
          rankOrderMap: RANKOREDERMAP,
          rankColorMap: RANKCOLORMAP
        }
      }
    },
    mounted () {
      this.$nextTick(() => {
        this.prepareDataMap()
        this.prepareData()
        this.renderInit()
        this.renderContent()
      })
    },
    activated () {
      console.log('active')
    },
    deactivated () {
      console.log('deactived')
      this.svg.select('.rank-active-group').remove()
    },
    methods: {
      prepareDataMap () {
        let width = this.$refs.pageTimeNumber.clientWidth
        let height = this.$refs.pageTimeNumber.clientHeight
        let rate = width / 900
        this.chartData.mapHeadTop = 2.4 * width / 7.5
        this.chartData.mapTranslateLeft = 50
        this.chartData.mapReduceHeight = 40
        this.chartData.mapRate = rate
        this.chartData.mapWidth = width
        this.chartData.mapHeight = height
        this.chartData.mapR = width * 0.012
        this.chartData.marginLeft = width * 0.1
        this.chartData.mapOtherTop = width / 375 * 250
        this.chartData.mapColNumber = 25
        this.chartData.mapGroupTop = width * 0.2
        this.chartData.mapTop = 0
        this.chartData.mapLeft = -width * 0.005
        let chartData = this.chartData
        this.chartData.mapData = this.mapData.map((dd) => {
          let d = _.cloneDeep(dd)
          let find = _.find(this.svgData, e => _.trim(e.name) === _.trim(d.name))
          d.points = d.points.map(n => {
            return [n[0] * rate, n[1] * rate]
          })
          d.grid = d.grid.map(n => {
            return [n[0] * rate, n[1] * rate]
          })
          let obj = Object.assign(d, find)
          return obj
        })
        _.each(this.chartData.mapData, (d, i) => {
          d.mapPos = {}
          d.mapPos.map = true
          d.mapPos.transX = this.chartData.mapTranslateLeft
          d.mapPos.transY = chartData.mapReduceHeight
          d.mapPos.points = d.points
        })
        this.chartData.mapMarginTop = 0
        let areaGroup = _.groupBy(this.svgData, 'area')
        this.mapProvinceData = _.map(areaGroup, (val, key) => {
          return {
            area: key,
            value: val,
            pos: 0
          }
        })
        this.chartData.mapOtherData = []
        this.chartData.mapOtherData[0] = {
          name: '中央',
          value: _.reverse(_.sortBy(areaGroup['中央'], 'rankOrder')),
          number: areaGroup['中央'].length,
          hStart: 0
        }
        this.chartData.mapOtherData[1] = {
          name: '企业',
          value: _.reverse(_.sortBy(areaGroup['企业'], 'rankOrder')),
          number: areaGroup['企业'].length,
          hStart: Math.ceil(this.chartData.mapOtherData[0].number / 25)
        }
        this.chartData.mapOtherData[2] = {
          name: '军队',
          value: areaGroup['军队'],
          number: areaGroup['军队'].length,
          hStart: Math.ceil(this.chartData.mapOtherData[0].number / 25) + Math.ceil(this.chartData.mapOtherData[1].number / 25)
        }
        this.chartData.mapOtherData[3] = {
          name: '兵团',
          value: areaGroup['兵团'],
          number: areaGroup['兵团'].length,
          hStart: Math.ceil(this.chartData.mapOtherData[0].number / 25) + Math.ceil(this.chartData.mapOtherData[1].number / 25) + Math.ceil(this.chartData.mapOtherData[2].number / 25)
        }

        _.each(this.chartData.mapOtherData, (d, i) => {
          let dy = d.hStart * (this.chartData.mapR * 3.5) + this.chartData.mapR * 3
          _.each(d.value, (val, index) => {
            let x = index % chartData.mapColNumber
            x = x * 2.1 * chartData.mapR + width * 0.05
            let y = parseInt(index / chartData.mapColNumber) * 2.2 * chartData.mapR
            val.mapPos = {}
            val.mapPos.x = x + chartData.mapTranslateLeft
            val.mapPos.y = y + dy + chartData.mapReduceHeight + chartData.mapOtherTop
            this.chartData.mapData.push(val)
          })
        })
      },
      prepareData () {
        let dataGroup = _.groupBy(this.svgData, function (d) {
          var yearReg = /(\d{4})年/
          var matchs = d.falldownTime.match(yearReg)
          return matchs[1]
        })
        dataGroup = _.toPairs(dataGroup)
        this.chartData.dataGroup = dataGroup
        let width = this.$refs.pageTimeNumber.clientWidth
        let height = this.$refs.pageTimeNumber.clientHeight
        let r = +(0.012 * height).toFixed(2) * 0.8
        this.chartData.width = width
        this.chartData.height = height
        this.chartData.r = r
        this.chartData.margin = {
          left: 2 * r * 2,
          right: 2 * r * 2,
          bottom: 15,
          top: 15
        }
        this.chartData.gap = width * 0.04
        this.chartData.dy = height * 0.0005
        this.chartData.axisHeight = height * 0.1
      },
      getVerticalCoord (order, x) {
        let xs = 0
        let r = this.chartData.r
        let dy = this.chartData.dy
        let height = this.chartData.height
        let axisHeight = this.chartData.axisHeight
        if (order % 2) {
          // 奇数
          xs = parseInt(x - this.chartData.r * Math.cos(Math.PI / 6))
        } else {
          // 偶数
          xs = x
        }
        let bigGap = Math.floor(order / 3) * 3 * dy
        let y = (height - axisHeight * 2) - (1.5 * order * (r + 1) - 0.5 * r) - bigGap - r - r * Math.sin(Math.PI / 6)
        return [xs, y]
      },
      renderInit () {
        let selector = `#${this.$refs.pageTimeNumber.id}`
        this.svg = addSVG(selector, 'svg-time-number')
      },
      renderContent () {
        // axis
        let $eventBus = this.$eventBus
        this.svg.on('click', (e) => {
          if (d3.event.target.tagName !== 'polygon') {
            $eventBus.$emit('hideInformationDetails')
            d3.selectAll('.rank-hexagon')
              .classed('active-rank-hexagon', false)
            d3.select('.rank-active-group').remove()
          }
        })
        let chartData = this.chartData
        let getVerticalCoord = this.getVerticalCoord
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
          .style('fill', '#5B1112')
          .style('font-size', 10)
        ticks.append('line')
          .attr('class', 'tick-line')
          .attr('x1', 0)
          .attr('y1', 0)
          .attr('x2', 0)
          .attr('y2', 40)
          .attr('stroke-width', 1)
          .attr('stroke', '#5B1112')
        // render y line
        let yLines = [0, 20, 40]
        this.svg.selectAll('g.number-line-group')
          .data(yLines)
          .enter()
          .append('g')
          .attr('class', 'number-line-group')
          .attr('transform', (d) => {
            let x = 0
            let order = d
            let pos = getVerticalCoord(order, x)
            return 'translate(' + (chartData.margin.left + pos[0]) + ',' + (pos[1] + chartData.r) + ')'
          })
          .attr('opacity', 0)
          .transition()
          .duration(1000)
          .delay((d, i) => i * 600)
          .attr('opacity', 1)
        this.svg.selectAll('g.number-line-group')
          .append('line')
          .attr('class', 'number-line')
          .attr('x1', 15)
          .attr('y1', 0)
          .attr('x2', chartData.width - (chartData.margin.right + chartData.margin.left))
          .attr('y2', 0)
          .attr('stroke-width', 1)
          .attr('stroke', '#5B1112')
        this.svg.selectAll('g.number-line-group')
          .append('text')
          .attr('class', 'number-text')
          .attr('x', -5)
          .attr('y', 0)
          .attr('dy', '0.5em')
          .style('text-anchor', 'middle')
          .style('font-size', 10)
          .text(function (d) {
            if (d === 40) {
              return d + '(人)'
            }
            return d
          })
          .style('fill', '#5b1112')
        // render hexagon
        this.hexagonGroup = this.svg.selectAll('g.fall-down-hexagons-group')
          .data(chartData.dataGroup)
          .enter()
          .append('g')
          .attr('class', 'fall-down-hexagons-group')
          .attr('transform', (d, i) => {
            let gap = chartData.gap
            let w = (chartData.width - chartData.margin.left - chartData.margin.right - 2 * gap) / (chartData.dataGroup.length - 1)
            return 'translate(' + (chartData.margin.left + w * i - chartData.r * Math.cos(Math.PI / 6)) + ',0)'
          })
        _.each(chartData.dataGroup, function (d, i) {
          d[1] = _.sortBy(d[1], 'rankOrder')
          _.each(d[1], function (val, index) {
            let gap = chartData.gap
            let i = _.findIndex(TIMEORDER, a => a === d[0])
            let w = (chartData.width - chartData.margin.left - chartData.margin.right - 2 * gap) / (chartData.dataGroup.length - 1)
            let addX = gap + w * i
            let x = chartData.margin.left + addX
            val['pos'] = {i: index, x: x}
          })
        })
        let arr = _.reduce(chartData.dataGroup, (a, b) => {
          return a.concat(b[1])
        }, [])
        _.each(arr, (d, i) => {
          let obj = _.find(chartData.mapData, e => e.name === d.name)
          d['mapPos'] = obj.mapPos
        })
        this.svg.selectAll('polygon.fall-down-hexagon')
          .data(arr)
          .enter()
          .append('polygon')
          .attr('class', 'fall-down-hexagon')
          .attr('points', function (d) {
            if (d.mapPos.map) {
              let points = d.mapPos.points
              return _.map(points, (d) => {
                return d.join(',')
              }).join(' ')
            } else {
              let pos = [d.mapPos.x, d.mapPos.y]
              let points = getRegularHexagon(pos, chartData.mapR)
              return _.map(points, (d) => {
                return d.join(',')
              }).join(' ')
            }
          })
          .attr('fill', d => {
            return chartData.rankColor[d.rankOrder]
          })
          .attr('stroke', (d) => {
            if (d.rankCat !== '军队落马将领') {
              return 'transparent'
            } else {
              return '#000'
            }
          })
          .attr('transform', `translate(0,${chartData.mapReduceHeight + chartData.mapHeadTop})`)
          .transition()
          .duration(1000)
          .delay((d, i) => {
            return d.pos.i * 30
          })
          .attr('points', function (d) {
            let pos = getVerticalCoord(d.pos.i, d.pos.x)
            let points = getRegularHexagon(pos, chartData.r)
            return _.map(points, (d) => {
              return d.join(',')
            }).join(' ')
          })
          .attr('transform', 'translate(0, 0)')
        let self = this
        d3.selectAll('.fall-down-hexagon')
        .on('click', function (d) {
          d3.select('.rank-active-group').remove()
          let activeGroup = self.svg.append('g')
            .attr('class', 'rank-active-group')
          let pos = d3.select(this).node().getBoundingClientRect()
          let x = pos.left + pos.width / 2
          let y = pos.top + pos.height / 2
          let data = d3.range(0, chartData.r, (chartData.r) / 3)
          data = data.reverse()
          activeGroup.selectAll('circle.rank-active')
          .data(data)
          .enter()
          .append('circle')
          .attr('class', 'rank-active')
          .attr('cx', x)
          .attr('cy', y)
          .attr('r', (d) => {
            return d
          })
          .attr('transform-origin', `${x} ${y}`)
          .attr('fill', '#5b1112')
          self.$eventBus.$emit('showInformationDetails', d, d3.event)
        })
        this.allHexagons = this.svg.selectAll('polygon.fall-down-hexagon')
      }
    }
  }
</script>

<!-- CSS -->
<style scoped lang="scss">
  .page-time-number {
    width: 100%;
    height: 100%;
    position: relative;
  }

</style>
