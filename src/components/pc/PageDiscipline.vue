<template>
  <div class="page-charge-multiply-time">
    <div class="wrapper">
      <div class="title">罪名</div>
      <div class="content-chart">
        <div class="chart"  id="page-charge-multiply-time" ref="pageChargeMultiplyTime">

        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import _ from 'lodash'
  import * as d3 from 'd3'
  import $ from 'jquery'
  import {RANKORDER, RANKCOLOR, CHARGENAME} from '../../common/variable'
  import {addSVG, getRegularHexagon} from '../../common/common'
  export default {
    name: 'template',
    props: ['svgData', 'activeIndex', 'previousIndex', 'pageIndex'],
    data () {
      return {
        svg: null,
        areaGroups: null,
        groups: null,
        init: false,
        chartData: {
          areaPos: [[556, 426], [550, 160], [42, 114], [462, 584], [42, 658], [336, 76], [54, 556], [98, 606], [448, 336], [584, 376], [222, 656], [160, 708], [260, 614], [522, 240], [536, 496], [266, 526], [372, 684], [92, 160]],
          rankOrder: RANKORDER,
          rankColor: RANKCOLOR,
          chargeName: CHARGENAME
        }
      }
    },
    mounted () {
      this.$nextTick(() => {
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
      prepareData () {
        let width = this.$refs.pageChargeMultiplyTime.clientWidth
        let height = this.$refs.pageChargeMultiplyTime.clientHeight
        let rate = width / 750
        this.chartData.width = width
        this.chartData.areaPos = this.chartData.areaPos.map(d => {
          return d.map(e => e * rate)
        })
        this.chartData.areaPos = this.chartData.areaPos.reverse()
        this.chartData.timeChartMarginLeft = width * 0.35
        this.chartData.width = width
        this.chartData.height = height
        this.chartData.margin = {
          left: 0,
          right: 0,
          bottom: 15,
          top: 15
        }
        let r = +(0.012 * height).toFixed(2) * 0.8
        this.chartData.r = r
        this.chartData.gap = width * 0.08
        this.chartData.dy = height * 0.0005
        this.chartData.axisHeight = height * 0.1
        this.chartData.timeChartMarginLeft = width * 0.35
        let charges = []
        _.each(this.svgData, (d) => {
          let names = d.chargeName
          console.log(names)
          names = names.split('|')
          charges = charges.concat(names)
        })
        charges = _.uniq(charges)
        _.remove(charges, (i) => {
          return i === '-'
        })

        charges = _.map(charges, (e) => {
          var filter = _.filter(this.svgData, (d) => {
            if (d.chargeName) {
              return d.chargeName.indexOf(e) > -1
            } else {
              return false
            }
          })
          var obj = {}
          obj['name'] = e
          obj['value'] = filter
          obj['number'] = filter.length
          return obj
        })
        charges = _.sortBy(charges, 'number')
        let chargeNameData = charges
        this.chartData.chargeNameData = chargeNameData
        let areaExtent = d3.extent(_.map(charges, (d) => {
          return d.number
        }))
        let areaScale = d3.scaleLinear()
          .domain(areaExtent)
          .range([width * 0.03, width * 0.3])
        this.chartData.areaCal = _.map(charges.reverse(), (d, i) => {
          var c = charges.slice(0, i)
          var s = _.sumBy(c, (d) => {
            return areaScale(d.number)
          })
          return s + 50
        })

        this.chartData.areaScale = areaScale
        let dataGroup = _.groupBy(this.svgData, (d) => {
          var yearReg = /(\d{4})年/
          var matchs = d.falldownTime.match(yearReg)
          return matchs[1]
        })
        dataGroup = _.toPairs(dataGroup)
        this.chartData.dataGroup = dataGroup
      },
      renderInit () {
        let selector = `#${this.$refs.pageChargeMultiplyTime.id}`
        this.svg = addSVG(selector, 'svg-charge-group')
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
          if (d3.event.target.tagName === 'polygon' && !d3.select(d3.event.target).classed('active-click')) {
            $eventBus.$emit('hideInformationDetails')
            d3.selectAll('.rank-hexagon')
              .classed('active-rank-hexagon', false)
            d3.select('.rank-active-group').remove()
          }
        })
        this.$eventBus.$emit('hideArrow')
        let chartData = this.chartData
        this.svg.select('.charge-multipy-page').remove()
        this.svg = this.svg.append('g').attr('class', 'charge-multipy-page')
        let areaGroups = this.svg.append('g')
        .attr('classs', 'area-block-groups')
        let groups = areaGroups.selectAll('g.block-area-mutiply-group')
        .data(chartData.chargeNameData)
        .enter()
        .append('g')
        .attr('class', 'block-area-mutiply-group')
        .attr('transform', (d, i) => {
          console.log(chartData.chargeNameData, chartData.areaPos, i)
          let x = chartData.areaPos[i][0]
          let y = chartData.areaPos[i][1]
          return `translate(${x},${y})`
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
        .classed('active-block', (d, i) => {
          if (i === 0) {
            return true
          } else {
            return false
          }
        })
        .attr('transform-origin', (d, i) => {
          let x = chartData.areaScale(d.number) / 2
          let y = chartData.areaScale(d.number) / 2
          return `${x} ${y}`
        })
        groups
        .append('text')
        .attr('x', d => {
          if (d.number < 100) {
            return chartData.areaScale(d.number) + 5
          } else {
            return chartData.areaScale(d.number) / 2
          }
        })
        .attr('y', d => {
          return chartData.areaScale(d.number) / 2
        })
        .attr('dy', '0.5em')
        .text(d => d.name)
        .style('font-size', 12)
        .attr('fill', d => {
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
        let self = this
        this.groups = groups
        this.groups.on('click', function (d) {
          self.groups.on('click', null)
          self.renderMore(d)
          d3.select(this).select('rect').attr('transform', 'scale(1,1)')
        })
        this.$eventBus.$on('orderStatus5', () => {
          this.svg.select('.block-area-mutiply-group').dispatch('click')
        })
      },
      renderMore (d) {
        this.init = true
        d3.select('.active-block').classed('active-block', false)
        this.$eventBus.$emit('showArrow')
        this.$eventBus.$emit('status5Init')
        let chartData = this.chartData
        // ----------------------------
        let self = this
        this.groups.on('click', function (d, i) {
          self.svg.selectAll('.area-block')
          .attr('fill', '#fff')
          .attr('stroke', '#5b1112')
          d3.select(this).select('rect')
          .attr('fill', '#5b1112')
          if (d.name === '受贿') {
            self.svg.select('.block-area-mutiply-group text')
              .attr('fill', '#fff')
          } else {
            self.svg.select('.block-area-mutiply-group text')
              .attr('fill', '#5b1112')
          }
          self.svg.selectAll('.fall-down-hexagon')
          .attr('stroke', (d) => {
            if (d.rankCat !== '军队落马将领') {
              return '#fff'
            } else {
              return '#000'
            }
          })
          .classed('active-click', false)
          self.svg.selectAll('.fall-down-hexagon')
          .filter((d, i) => {
            return d.chargeName === '-'
          })
          .attr('fill', (d, i) => {
            return '#fff'
          })
        .attr('stroke', '#000')
        .attr('stroke-dasharray', 1)
          self.svg.selectAll('.fall-down-hexagon')
          .filter((e, i) => {
            if (e.chargeName.indexOf(d.name) > -1) {
              return true
            } else {
              return false
            }
          })
          .attr('stroke', '#5b1112')
          .classed('active-click', true)
        })
        this.drawAxis()
        this.drawTimeContent()
        // ----------------------------
        this.svg.select('.block-area-mutiply-group text')
        .attr('fill', (e, i) => {
          if (e.name === d.name) {
            return '#fff'
          } else {
            return '#5b1112'
          }
        })
        .style('text-anchor', 'middle')
        this.groups
        .attr('transform', (d, i) => {
          var x = chartData.areaPos[i][0]
          var y = chartData.areaPos[i][1]
          return 'translate(' + x + ',' + y + ') scale(1, 1)'
        })
        .transition()
        .duration(2000)
        .delay((d, i) => {
          return 100 * i
        })
        .attr('transform', (d, i) => {
          let y = chartData.areaCal[i]
          return 'translate(0,' + y + ')'
        })
        this.groups
        .each(function (e) {
          if (e.name === d.name) {
            d3.select(this).dispatch('click')
          }
        })
        this.groups
        .selectAll('rect.area-block')
        .transition()
        .duration(2000)
        .delay((d, i) => {
          return 100 * i
        })
        .attr('fill', e => {
          if (e.name === d.name) {
            return '#5b1112'
          } else {
            return '#fff'
          }
        })
        .attr('stroke', e => {
          if (e.name === d.name) {
            return 'transparent'
          } else {
            return '#5b1112'
          }
        })
        this.groups
        .selectAll('text')
        .text((d, i) => {
          console.log(d)
          if (d.name === '受贿') {
            return `${d.name}(${d.number}人)`
          } else {
            if (d.number > 1) {
              return `${d.name}(${d.number})`
            } else {
              return `${d.name}`
            }
          }
        })
        let note = this.svg.append('g')
        .attr('class', 'note')
        .attr('transform', `translate(15, 15)`)
        note.append('text')
        .attr('x', chartData.r * 2.2)
        .attr('y', chartData.r * 2)
        .attr('dy', '0.35em')
        .text('无相关罪名信息')
        .style('font-size', 12)
        note.append('polygon')
        .attr('points', d => {
          let pos = [0, chartData.r * 2]
          let points = getRegularHexagon(pos, chartData.r)
          return _.map(points, (d) => {
            return d.join(',')
          }).join(' ')
        })
        .attr('stroke', '#000')
        .attr('stroke-dasharray', 1)
        .attr('fill', '#fff')
      },
      drawAxis () {
        let chartData = this.chartData
        let axes = this.svg.append('g')
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
          .style('fill', '#5b1112')
          .style('font-size', 12)
        ticks.append('line')
          .attr('class', 'tick-line')
          .attr('x1', () => {
            return -this.chartData.r / 2
          })
          .attr('y1', 0)
          .attr('x2', () => {
            return -this.chartData.r / 2
          })
          .attr('y2', 40)
          .attr('stroke-width', 1)
          .attr('stroke', '#5b1112')
      },
      drawTimeContent () {
        let chartData = this.chartData
        let getVerticalCoord = this.getVerticalCoord
        this.hexagonGroup = this.svg.selectAll('g.fall-down-hexagons-group')
          .data(chartData.dataGroup)
          .enter()
          .append('g')
          .attr('class', 'fall-down-hexagons-group')
          .attr('transform', (d, i) => {
            let w = (chartData.width - chartData.timeChartMarginLeft - chartData.margin.left - chartData.margin.right - 2 * chartData.gap) / (chartData.dataGroup.length - 1)
            return 'translate(' + (chartData.timeChartMarginLeft + w * i - w + chartData.margin.left) + ',0)'
          })
        this.hexagonGroup
          .each(function (d) {
            d3.select(this)
              .selectAll('polygon.fall-down-hexagon')
              .data(d[1])
              .enter()
              .append('polygon')
              .attr('class', 'fall-down-hexagon')
              .attr('points', function (d, i) {
                let x = chartData.r * Math.cos(Math.PI / 6) + chartData.gap
                let pos = getVerticalCoord(i, x)
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
                  return '#fff'
                } else {
                  return '#000'
                }
              })
              .attr('transform', `translate(0, -2000)`)
              .transition()
              .duration(1000)
              .delay((d, i) => i * 30)
              .attr('transform', 'translate(0, 0)')
          })
        d3.selectAll('.fall-down-hexagon')
        .filter((d, i) => {
          return d.chargeName === '-'
        })
        .attr('fill', (d, i) => {
          return '#fff'
        })
        .attr('stroke', '#000')
        .attr('stroke-dasharray', 1)
        // this.svg.selectAll('.fall-down-hexagon')
        //   .filter((e, i) => {
        //     if (e.chargeName.indexOf('受贿') > -1) {
        //       return true
        //     } else {
        //       return false
        //     }
        //   })
        //   .attr('stroke', '#5b1112')
        let self = this
        this.svg.selectAll('polygon.fall-down-hexagon').on('click', function (d, i) {
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
            console.log(d)
            return d
          })
          .attr('transform-origin', `${x} ${y}`)
          .attr('fill', '#5b1112')
          self.$eventBus.$emit('showInformationDetails', d, d3.event)
        })
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
      }
    }
  }
</script>

<!-- CSS -->
<style>
  .page-charge-multiply-time{
    width: 100%;
    height: 100%;
    overflow: hidden;
  }
  .page-charge-multiply-time .wrapper{
    height: 100%;
  }
  .page-charge-multiply-time .wrapper .chart{
    width: 100%;
    height: 100%;
  }
  .block-area-mutiply-group:hover {
    cursor: pointer;
  }
  .note polygon,
  .fall-down-hexagon{
    shape-rendering: crispEdges;
  }

</style>
