<template>
  <div class="page-charge-group-time">
    <div class="wrapper">
      <div class="title">违纪信息</div>
      <div class="content-chart">
        <div class="chart"  id="page-charge-group-time" ref="pageChargeGroupTime">
        <div class="example-details-assay" v-if="showExp">
          <p v-html="exp.msg1"></p>
          <p v-html="exp.msg2"></p>
          <div class="close">
            <img src="../../assets/img/close.png" alt="close" @click="closeExample">
          </div>
        </div>
        <div class="assay" v-if="!init">
          2015年起，关于落马官员违纪信息的表述变得多样，其中较有代表性的八项表述，颇能展示腐败问题的一些切面。
        </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import _ from 'lodash'
  import * as d3 from 'd3'
  import $ from 'jquery'
  import {RANKORDER, RANKCOLOR, CHARGENAME, CHARGES} from '../../common/variable'
  import {addSVG, getRegularHexagon} from '../../common/common'
  export default {
    name: 'template',
    props: ['svgData', 'activeIndex', 'previousIndex', 'pageIndex'],
    data () {
      return {
        svg: null,
        areaGroups: null,
        exp: {
          msg1: '',
          msg2: '',
          show: false,
          has: false
        },
        init: false,
        chartData: {
          areaPos: [[250, 260], [450, 400], [120, 430], [250, 570], [630, 600], [400, 100], [440, 520], [550, 510]],
          rankOrder: RANKORDER,
          rankColor: RANKCOLOR,
          chargeName: CHARGENAME,
          chargesExp: CHARGES
        },
        nowSelect: '',
        showExp: false
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
      closeExample () {
        this.showExp = false
      },
      prepareData () {
        let width = this.$refs.pageChargeGroupTime.clientWidth
        let height = this.$refs.pageChargeGroupTime.clientHeight
        let rate = width / 750
        this.chartData.width = width
        this.chartData.areaPos = this.chartData.areaPos.map(d => {
          return d.map(e => e * rate)
        })
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
        let chargeNameData = _.map(this.chartData.chargeName, (d, i) => {
          let filterData = _.filter(this.svgData, (e) => {
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
        this.nowSelect = chargeNameData[0].name
        this.chartData.chargeNameData = chargeNameData
        // ----------------- add ------------------------------
        let areaExtent = d3.extent(_.map(chargeNameData, (d) => {
          return d.number
        }))
        let areaScale = d3.scaleLinear()
          .domain(areaExtent)
          .range([width * 0.06, width * 0.25])
        this.chartData.areaCal = _.map(chargeNameData, (d, i) => {
          var c = chargeNameData.slice(0, i)
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
        let selector = `#${this.$refs.pageChargeGroupTime.id}`
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
        let areaScale = this.chartData.areaScale
        let areaGroups = this.svg.selectAll('g.charge-area-group')
          .data(chartData.chargeNameData)
          .enter()
          .append('g')
          .attr('class', 'charge-area-group')
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
            return -areaScale(d.number) / 2
          })
          .attr('y', (d, i) => {
            return -areaScale(d.number) / 2
          })
          .attr('width', (d) => {
            return areaScale(d.number)
          })
          .attr('height', (d) => {
            return areaScale(d.number)
          })
          .attr('fill', '#5b1112')
          .attr('stroke', 'transparent')
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
        areaGroups
          .append('text')
          .attr('x', 0)
          .attr('y', 0)
          .style('text-anchor', 'middle')
          .attr('fill', '#fff')
          .style('font-size', 12)
          .html((d) => {
            let html = ''
            let name = d.name.replace('、', '')
            let row = 0
            let nameLength = parseInt(areaScale(d.number) / 12)
            for (let i = 0; i <= name.length - 1; i = i + nameLength) {
              html += '<tspan x="0" dy="' + row + '">' + name.slice(i, i + nameLength) + '</tspan>'
              row += 14
            }
            return html
          })
        this.areaGroups = areaGroups
        let self = this
        this.areaGroups.on('click', function (d) {
          self.areaGroups.on('click', null)
          d3.select(this).select('rect').attr('transform', 'scale(1,1)')
          self.renderMore(d)
        })
        this.$eventBus.$on('orderStatus4', () => {
          this.svg.select('.charge-area-group').dispatch('click')
        })
      },
      renderMore (d) {
        d3.select('.active-block').classed('active-block', false)
        this.$eventBus.$emit('showArrow')
        this.$eventBus.$emit('status4Init')
        this.init = true
        let chartData = this.chartData
        let areaScale = chartData.areaScale
        this.drawAxis()
        this.drawTimeContent()
        // --------------------------------------
        let self = this
        self.areaGroups.selectAll('rect')
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
        this.areaGroups.on('click', function (d, i) {
          self.nowSelect = d.name
          self.areaGroups.classed('twinkle', false)
          let msg
          let tmp = self.chartData.chargesExp[self.nowSelect]
          if (tmp) {
            msg = Object.assign({show: false, has: true}, tmp)
            d3.select(this).classed('twinkle', true)
          } else {
            msg = {
              show: false,
              has: false
            }
          }
          self.exp = msg
          if (tmp) {
            self.showExp = true
          } else {
            self.showExp = false
          }
          d3.select(this).select('rect')
          .attr('fill', '#5b1112')
          .attr('stroke', '#transparent')
          self.svg.selectAll('.fall-down-hexagon')
          .attr('stroke', (d) => {
            if (d.rankCat !== '军队落马将领') {
              return '#fff'
            } else {
              return '#000'
            }
          })
          .classed('active-click', false)
          self.areaGroups.selectAll('text')
          .attr('fill', function (e) {
            if (e.name === d.name) {
              return '#fff'
            } else {
              return '#5b1112'
            }
          })
          self.svg.selectAll('.fall-down-hexagon')
          .filter((d, i) => {
            return d.chargeInfo === '-'
          })
          .attr('fill', (d, i) => {
            return '#fff'
          })
          .attr('stroke', '#000')
          .attr('stroke-dasharray', 1)
          let chargeIndex = _.findIndex(CHARGENAME, n => n === d.name) + 1
          chargeIndex = '' + chargeIndex
          d3.selectAll('.fall-down-hexagon')
          .filter((e, i) => {
            if (e.chargeMains) {
              return e.chargeMains.indexOf(chargeIndex) > -1
            } else {
              return false
            }
          })
          .attr('stroke', '#5b1112')
          .classed('active-click', true)
          self.areaGroups.selectAll('rect')
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
        })
        this.areaGroups
        .each(function (e, i) {
          if (e.name === d.name) {
            console.log(e.name)
            d3.select(this).dispatch('click')
          }
        })
        this.areaGroups.transition()
        .duration(2000)
        .delay((d, i) => {
          return 100 * i
        })
        .attr('transform', (d, i) => {
          let x = areaScale(d.number) / 2
          let y = areaScale(d.number) / 2 + chartData.areaCal[i]
          return 'translate(' + (x + chartData.margin.left / 2) + ',' + y + ')'
        })
        let note = this.svg.append('g')
        .attr('class', 'note')
        .attr('transform', `translate(15, 15)`)
        note.append('text')
        .attr('x', chartData.r * 2.2)
        .attr('y', chartData.r * 2)
        .attr('dy', '0.35em')
        .text('无相关违纪信息')
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
          return d.chargeInfo === '-'
        })
        .attr('fill', (d, i) => {
          return '#fff'
        })
        .attr('stroke', '#000')
        .attr('stroke-dasharray', 1)
        let self = this
        this.svg.selectAll('polygon.fall-down-hexagon')
        .on('click', function (d, i) {
          d3.select('.rank-active-group').remove()
          if (!d3.select(this).classed('active-click')) {
            return
          }
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
  .page-charge-group-time {
    width: 100%;
    height: 100%;
    overflow: hidden;
  }
  .page-charge-group-time .wrapper {
    height: 100%;
  }
  .page-charge-group-time .wrapper .chart{
    width: 100%;
    height: 100%;
  }
  .example-details{
    position: absolute;
    left: 220px;
    top: 20px;
    padding: 5px 15px;
    background: #5B1111;
    color: #fff;
    border-radius: 8px;
    font-size: 12px;
    box-shadow: 3px 3px 3px rgba(0,0,0,0.2);
  }

  .example-details-assay {
    position: absolute;
    left:280px;
    top: 50px;
    width:300px;
    background: #ffffff;
    box-shadow: 2px 2px 2px rgba(0,0,0,0.2), 0 0 2px 2px rgba(0,0,0,0.1);
    padding: 0.8em;
    font-size: 14px;
  }
  .example-details-assay p {
    margin-bottom: 10px;
  }
  .example-details-assay .info-name {
    font-weight: 300;
    margin-bottom: 0.5em;
  }
  @keyframes bobble {
    0% {
      opacity: 0.9;
      transform: scale3d(1.05, 1.05,1);
    }
    50% {
      transform: scale3d(0.95, 0.95,1);
      opacity: 0.95;
    }
    100% {
      transform: scale3d(1, 1,1);
      opacity: 1;
    }
  }

  .assay{
    position: absolute;
    bottom: 40px;
    left:50%;
    width: 600px;
    margin-left: -300px;
    padding: 0.8em;
    line-height: 1.5;
    color: #5B1111;
    font-weight: bold;
    box-shadow: 3px 3px 4px rgba(0,0,0,0.4), 0 0 2px 2px rgba(0,0,0,0.2);
  }
  @media screen and (min-height:801px) {
    .assay{
      bottom: 100px;
    }
  }
   .close {
    text-align: center;
  }
  .close img{
    width: 40px;
    margin-top: 5px;
  }
  .close img:hover{
     cursor: pointer;
  }
  .note polygon,
  .fall-down-hexagon.{
    shape-rendering: crispEdges;
  }
  .fall-down-hexagon.active-click,
  .charge-area-group:hover{
    cursor: pointer;
  }
  .active-block{
    animation: bobble 1s linear infinite alternate;
  }

  @keyframes bobble {
    0% {
      opacity: 0.9;
      transform: scale3d(1.05, 1.05,1);
    }
    50% {
      transform: scale3d(0.95, 0.95,1);
      opacity: 0.95;
    }
    100% {
      transform: scale3d(1, 1,1);
      opacity: 1;
    }
  }
</style>
