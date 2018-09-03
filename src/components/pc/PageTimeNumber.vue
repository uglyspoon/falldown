<template>
  <div class="page-time-number">
      <div class="wrapper">
        <div class="title">历年落马人数</div>
        <div class="content-chart">
          <div class="chart" id="page-time-number" ref="pageTimeNumber">

          </div>
        </div>
      </div>
  </div>
</template>

<script>
  import _ from 'lodash'
  import * as d3 from 'd3'
  import $ from 'jquery'
  import {RANKORDER, RANKCOLOR, TIMEORDER} from '../../common/variable'
  import {addSVG, getRegularHexagon} from '../../common/common'
  export default {
    name: 'pageTimeNumber',
    props: ['svgData', 'activeIndex', 'previousIndex', 'pageIndex'],
    data () {
      return {
        svg: null,
        allHexagons: null,
        chartData: {
          rankOrder: RANKORDER,
          rankColor: RANKCOLOR,
          timeOrder: TIMEORDER
        }
      }
    },
    mounted () {
      this.$nextTick(() => {
        this.prepareData()
        this.renderInit()
        this.renderContent()
        console.log(getRegularHexagon)
      })
    },
    activated () {
      console.log('active')
    },
    deactivated () {
      console.log('deactived')
      this.svg.select('.rank-active-group').remove()
      this.$eventBus.$emit('hideInformationDetails')
    },
    methods: {
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
          .style('font-size', 14)
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
          .style('font-size', 14)
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
        this.svg.selectAll('polygon.fall-down-hexagon')
          .data(arr)
          .enter()
          .append('polygon')
          .attr('class', 'fall-down-hexagon')
          .attr('points', function (d) {
            let pos = getVerticalCoord(d.pos.i, d.pos.x)
            let points = getRegularHexagon(pos, chartData.r)
            return _.map(points, (d) => {
              return d.join(',')
            }).join(' ')
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
          .attr('transform', `translate(0, -2000)`)
          .transition()
          .duration(1000)
          .delay((d, i) => {
            return d.pos.i * 30
          })
          .attr('transform', 'translate(0, 0)')
        let self = this
        d3.selectAll('.fall-down-hexagon')
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
        this.allHexagons = this.svg.selectAll('polygon.fall-down-hexagon')
      }
    }
  }
</script>

<!-- CSS -->
<style lang="scss">
  .page-time-number {
    width: 100%;
    height: 100%;
    position: relative;
  }
  .page-time-number .wrapper{
    height: 100%;
  }
  .page-time-number .wrapper .chart{
    width: 100%;
    height: 100%;
  }
  .svg-time-number .fall-down-hexagon:hover{
    cursor: pointer;
  }
</style>
