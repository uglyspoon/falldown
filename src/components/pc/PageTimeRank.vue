<template>
  <div class="page-time-rank">
    <div class="wrapper">
      <div class="title">历年落马人数</div>
      <div class="content-chart">
        <div class="chart" id="page-time-rank" ref="pageTimeRank">

        </div>
      </div>
    </div>

  </div>
</template>

<script>
  import _ from 'lodash'
  import * as d3 from 'd3'
  import $ from 'jquery'
  import {RANKORDER, RANKCOLOR} from '../../common/variable'
  import {addSVG, getRegularHexagon} from '../../common/common'
  export default {
    name: 'pageTimeRank',
    props: ['svgData', 'activeIndex', 'previousIndex', 'pageIndex'],
    data () {
      return {
        svg: null,
        allHexagons: null,
        chartData: {
          rankOrder: RANKORDER,
          rankColor: RANKCOLOR
        }
      }
    },
    activated () {
      console.log('active')
    },
    deactivated () {
      console.log('deactived')
      this.svg.select('.rank-active-group').remove()
      this.$eventBus.$emit('hideInformationDetails')
    },
    mounted () {
      this.$nextTick(() => {
        this.prepareData()
        this.renderInit()
        this.renderContent()
        console.log(getRegularHexagon)
      })
    },
    methods: {
      prepareData () {
        let width = this.$refs.pageTimeRank.clientWidth
        let height = this.$refs.pageTimeRank.clientHeight
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
        // -----------------------
        let timeGroup = _.groupBy(this.svgData, function (d) {
          let yearReg = /(\d{4})年/
          let matchs = d.falldownTime.match(yearReg)
          return matchs[1]
        })
        this.chartData.timeGroup = _.toPairs(timeGroup)
        let rankGroup = _.groupBy(this.svgData, 'rankCat')
        rankGroup = _.omit(rankGroup, '-')
        rankGroup = _.toPairs(rankGroup)
        let rankData = []

        function findOrder (name) {
          let find = _.find(rankGroup, function (d) {
            return d[0] === name
          })
          rankData.push(find)
        }

        _.each(this.chartData.rankOrder, findOrder)
        this.chartData.timeRank = [2012, 2013, 2014, 2015, 2016, 2017]
        let hstart = 0
        rankData = _.reverse(rankData)
        _.each(rankData, function (d, i) {
          var n = _.groupBy(d[1], function (d) {
            var yearReg = /(\d{4})年/
            var matchs = d.falldownTime.match(yearReg)
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
        this.chartData.rankData = rankData
      },
      renderInit () {
        let selector = `#${this.$refs.pageTimeRank.id}`
        this.svg = addSVG(selector, 'svg-time-rank')
      },
      renderContent () {
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
        let getVerticalCoordPrev = this.getVerticalCoordPrev
        let axes = this.svg.append('g')
          .attr('class', 'axis')
          .attr('transform', function () {
            return 'translate(0,' + (chartData.height - chartData.axisHeight * 2) + ')'
          })
        let ticks = axes.selectAll('g.tick-group')
          .data(chartData.timeGroup)
          .enter()
          .append('g')
          .attr('class', 'tick-group')
          .attr('transform', function (d, i) {
            let gap = chartData.gap
            let w = (chartData.width - chartData.margin.left - chartData.margin.right - 2 * gap) / (chartData.timeGroup.length - 1)
            return 'translate(' + (gap + w * i + chartData.margin.left) + ',0)'
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
          .attr('font-size', '14')
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

        gGroups
          .attr('opacity', 0)
          .transition()
          .duration(200)
          .delay((d, i) => i * 200)
          .attr('opacity', 1)

        gGroups.append('line')
          .attr('class', 'rank-time-line')
          .attr('x1', 0)
          .attr('y1', 0)
          .attr('x2', chartData.width)
          .attr('y2', 0)
          .attr('stroke-width', 1)
          .attr('stroke', '#5B1112')
          .attr('stroke-dasharray', 3)
          .attr('transform', (d, i) => {
            return 'translate( 0, ' + (chartData.height - chartData.axisHeight * 2 - (d[2]) * (2 * chartData.r) - i * 15) + ')'
          })
        gGroups.append('text')
          .attr('class', 'rank-time-label')
          .attr('x', 0)
          .attr('y', 0)
          .attr('dy', function (d) {
            if (d[0] === '副省/部级') {
              return -chartData.r * 2 - 5
            } else {
              return '-0.5em'
            }
          })
          .attr('dx', '0.15rem')
          .text(function (d) {
            return d[0]
          })
          .attr('font-size', '14')
          .style('fill', '#5B1112')
          .attr('transform', (d, i) => {
            return 'translate( 0, ' + (chartData.height - chartData.axisHeight * 2 - (d[2]) * (2 * chartData.r) - i * 15) + ')'
          })
        console.log(chartData.rankData)
        let data = []
        _.each(chartData.rankData, (d, i) => {
          let t = _.groupBy(d[1], function (d) {
            let yearReg = /(\d{4})年/
            let matchs = d.falldownTime.match(yearReg)
            return matchs[1]
          })
          let tmp = _.map(chartData.timeRank, function (d) {
            let val = t[d]
            if (!val) {
              val = []
            }
            return {
              year: d,
              value: val
            }
          })
          let y = chartData.height - chartData.axisHeight * 2 - (d[2]) * (2 * chartData.r) - i * 15
          _.each(tmp, function (d, i) {
            let gap = chartData.gap
            let w = (chartData.width - chartData.margin.left - chartData.margin.right - 2 * gap) / (chartData.timeGroup.length - 1)
            let x = gap + w * i + chartData.margin.left
            _.each(d.value, function (val, index) {
              val['rankPos'] = {}
              val['rankPos'].x = x
              val['rankPos'].y = y
              val['rankPos'].i = index
              data = data.concat(val)
            })
          })
        })
        console.log(data)
        this.svg.selectAll('polygon.time-rank-polygon')
        .data(data)
        .enter()
        .append('polygon')
        .attr('class', 'rank-time-polygon')
        .attr('fill', d => {
          return chartData.rankColor[d.rankOrder]
        })
        .attr('stroke', (d) => {
          if (d.rankCat !== '军队落马将领') {
            return '#fff'
          } else {
            return '#000'
          }
        })
        .attr('points', function (d) {
          let pos = getVerticalCoordPrev(d.pos.i, d.pos.x)
          let points = getRegularHexagon(pos, chartData.r)
          return _.map(points, (d) => {
            return d.join(',')
          }).join(' ')
        })
        .attr('transform', 'translate(0, 0)')
        .transition()
        .duration(500)
        .delay((d, i) => d.rankPos.i * 30)
        .attr('points', (d, i) => {
          let pos = getVerticalCoord(d.rankPos.i)
          let points = getRegularHexagon(pos, chartData.r)
          return _.map(points, (e) => {
            return e.join(',')
          }).join(' ')
        })
        .attr('transform', (d, i) => {
          return `translate(${d.rankPos.x}, ${d.rankPos.y})`
        })

        // ----------polygons -------------------
        // --------------------------------------
        let self = this
        d3.selectAll('.rank-time-polygon')
        .on('click', function (d) {
          d3.select('.rank-active-group').remove()
          let activeGroup = self.svg.append('g')
            .attr('class', 'rank-active-group')
          let pos = d3.select(this).node().getBoundingClientRect()
          let offset = $('.content-chart').offset()
          let x = pos.left + pos.width / 2 - offset.left
          let y = pos.top + pos.height / 2 - offset.top
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
      },
      getVerticalCoordPrev (order, x) {
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
      getVerticalCoord (order) {
        let r = this.chartData.r
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
//        x = x + 4 * r
        return [x, y]
      }
    }
  }
</script>

<!-- CSS -->
<style>
  .page-time-rank {
    width: 100%;
    height: 100%;
    position: relative;
  }

.page-time-rank .wrapper {
  height: 100%;
}

.page-time-rank .wrapper .chart{
  width: 100%;
  height: 100%;
}
.rank-time-polygon:hover{
  cursor: pointer;
}
.rank-time-line{
  shape-rendering: crispEdges;
}
</style>
