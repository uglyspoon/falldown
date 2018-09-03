<template>
  <div class="china-map">
    <div class="wrapper">
      <div class="title">十八大以来落马中管干部地域分布
        <img src="../../assets/img/map-categorypc.png" alt="">
      </div>
      <div class="content-chart">
        <div class="chart" id="china-map"  ref="chinaMap">

        </div>
      </div>
    </div>
  </div>

</template>

<script>
  import _ from 'lodash'
  import $ from 'jquery'
  import * as d3 from 'd3'
  import mapData from '../../assets/data/map.json'
  import {RANKORDER, RANKCOLOR, RANKOREDERMAP, RANKCOLORMAP} from '../../common/variable'
  import {addSVG, getRegularHexagon} from '../../common/common'
  import chinaMap from '../mapsvg.js'
  export default {
    name: 'chinaMap',
    props: ['svgData', 'activeIndex', 'previousIndex', 'pageIndex'],
    data () {
      return {
        svg: null,
        mapData: mapData,
        mapSvgPolygons: null,
        othersSVG: null,
        mapProvinceData: null,
        chartData: {
          r: 11,
          rankOrderMap: RANKOREDERMAP,
          rankColorMap: RANKCOLORMAP,
          rankOrder: RANKORDER,
          rankColor: RANKCOLOR,
          marginLeft: 0,
          otherLeft: 80
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
      this.$eventBus.$emit('showArrow')
    },
    deactivated () {
      console.log('deactived')
      this.svg.select('.rank-active-group').remove()
      this.$eventBus.$emit('hideInformationDetails')
    },
    methods: {
      prepareData () {
        let width = $(this.$refs.chinaMap).width()
        let height = $(this.$refs.chinaMap).height()
        let rate = width / 900
        this.chartData.translateLeft = 50
        this.chartData.reduceHeight = 40
        this.chartData.rate = rate
        this.chartData.width = width
        this.chartData.height = height
        this.chartData.r = width * 0.012
        this.chartData.marginLeft = width * 0.1
        this.chartData.otherTop = width / 375 * 250
        this.chartData.colNumber = 25
        this.chartData.mapGroupTop = width * 0.2
        this.chartData.mapTop = 0
        this.chartData.mapLeft = -width * 0.005
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
        this.chartData.marginTop = 0
        let areaGroup = _.groupBy(this.svgData, 'area')
        this.mapProvinceData = _.map(areaGroup, (val, key) => {
          return {
            area: key,
            value: val,
            pos: 0
          }
        })
        this.chartData.otherData = []
        this.chartData.otherData[0] = {
          name: '中央',
          value: _.reverse(_.sortBy(areaGroup['中央'], 'rankOrder')),
          number: areaGroup['中央'].length,
          hStart: 0
        }
        this.chartData.otherData[1] = {
          name: '企业',
          value: _.reverse(_.sortBy(areaGroup['企业'], 'rankOrder')),
          number: areaGroup['企业'].length,
          hStart: Math.ceil(this.chartData.otherData[0].number / 25)
        }
        this.chartData.otherData[2] = {
          name: '军队',
          value: areaGroup['军队'],
          number: areaGroup['军队'].length,
          hStart: Math.ceil(this.chartData.otherData[0].number / 25) + Math.ceil(this.chartData.otherData[1].number / 25)
        }
        this.chartData.otherData[3] = {
          name: '兵团',
          value: areaGroup['兵团'],
          number: areaGroup['兵团'].length,
          hStart: Math.ceil(this.chartData.otherData[0].number / 25) + Math.ceil(this.chartData.otherData[1].number / 25) + Math.ceil(this.chartData.otherData[2].number / 25)
        }
      },
      renderInit () {
        let selector = `#${this.$refs.chinaMap.id}`
        this.svg = addSVG(selector, 'svg-china-map')
      },
      renderContent () {
        let chartData = this.chartData
        let $eventBus = this.$eventBus
        this.svg.on('click', (e) => {
          console.log(d3.event)
          if (!(d3.event.target.tagName === 'polygon' || d3.event.target.tagName === 'path' || d3.event.target.tagName === 'polyline')) {
            $eventBus.$emit('hideInformationDetails')
            d3.selectAll('.rank-hexagon')
              .classed('active-rank-hexagon', false)
            d3.select('.rank-active-group').remove()
          }
        })
        let testMap = this.svg.append('g')
        .attr('class', 'test-map')
        testMap.html(chinaMap)
        testMap.attr('transform', () => {
          return `translate(${chartData.translateLeft},${chartData.reduceHeight}) scale(${chartData.rate}, ${chartData.rate})`
        })
        .style('opacity', 0)
        .transition()
        .duration(1000)
        .delay(1500)
        .style('opacity', 1)
        let mapSvg = this.svg.append('g')
        .attr('class', 'map-svg')
        .attr('transform', `translate(0,${chartData.reduceHeight})`)
        let mapSvgGroups = mapSvg.append('g')
          .attr('class', 'map-polygon-group')
          .attr('transform', `translate(0,0)`)
        this.mapSvgPolygons = mapSvgGroups.selectAll('polygon.map-polygon')
          .data(chartData.mapData)
          .enter()
          .append('polygon')
          .attr('class', 'map-polygon data-polygon')
          .attr('transform', `translate(0, ${-chartData.reduceHeight})`)
          .attr('points', (d) => {
            let points = getRegularHexagon(d.grid, this.chartData.width * 0.02)
            return _.map(points, (e) => {
              return e.join(',')
            }).join(' ')
          })
          .attr('fill', d => {
            return chartData.rankColor[d.rankOrder]
          })
          .transition()
          .duration(2000)
          .attr('points', (d) => {
            return _.map(d.points, (e) => {
              return e.join(',')
            }).join(' ')
          })
          .attr('transform', `translate(${chartData.translateLeft}, 0)`)
        let othersSVGGroups = mapSvg.append('g')
          .attr('class', 'others-polygon-group')
          .attr('transform', `translate(${chartData.marginLeft}, ${chartData.otherTop})`)
        this.othersSVG = othersSVGGroups.selectAll('g.other-groups')
          .data(chartData.otherData)
          .enter()
          .append('g')
          .attr('class', 'other-groups')
          .attr('transform', (d, i) => {
            return `translate(0,${d.hStart * (this.chartData.r * 3.5) + this.chartData.r * 3})`
          })
        this.svg.append('text')
        .text('地方：')
        .attr('x', 0)
        .attr('y', 0)
        .attr('dy', '0.3em')
        .attr('text-anchor', 'end')
        .style('font-size', '14')
        .attr('fill', '#5b1112')
        .attr('transform', `translate(${chartData.marginLeft + 10}, 50)`)
        this.othersSVG
          .each(function (d) {
            d3.select(this)
              .append('text')
              .attr('class', 'other-label')
              .text(d.name + ':')
              .attr('x', 0)
              .attr('y', 0)
              .attr('dy', '0.3em')
              .attr('text-anchor', 'end')
              .style('font-size', '14')
            // add polygon
            d3.select(this)
              .selectAll('polygon.other-polygon')
              .data(d.value)
              .enter()
              .append('polygon')
              .attr('class', 'other-polygon data-polygon')
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
              .attr('stroke-width', 1)
              .attr('points', function (d) {
                let points = getRegularHexagon(d.grid, chartData.width * 0.02)
                return _.map(points, (e) => {
                  return e.join(',')
                }).join(' ')
              })
              .attr('transform', e => {
                return `translate(-${chartData.marginLeft}, -${d.hStart * (chartData.r * 3) + chartData.r * 3 + chartData.otherTop + chartData.reduceHeight})`
              })
              .transition()
              .duration(2000)
              .attr('points', (d, i) => {
                let x = i % chartData.colNumber
                x = x * 2.1 * chartData.r + chartData.width * 0.05
                let y = parseInt(i / chartData.colNumber) * 2.2 * chartData.r
                let pos = [x, y]
                let points = getRegularHexagon(pos, chartData.r)
                return points.map(d => d.join(',')).join(' ')
              })
              .attr('transform', e => {
                return `translate(0,0)`
              })
          })
        let self = this
        d3.selectAll('.data-polygon')
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
              console.log(d)
              return d
            })
            .attr('transform-origin', `${x} ${y}`)
            .attr('fill', '#5b1112')
          self.$eventBus.$emit('showInformationDetails', d, d3.event)
        })
        this.svg.selectAll('.province')
        .on('click', function () {
          let id = d3.select(this).attr('id')
          let obj = _.find(self.mapProvinceData, e => {
            return e.area === id
          })
          if (obj.pos >= obj.value.length) {
            obj.pos = 0
          }
          let active = obj.value[obj.pos]
          obj.pos++
          console.log(active)
          d3.selectAll('.data-polygon')
          .each(function (d) {
            if (d.name === active.name) {
              d3.select(this).dispatch('click')
            }
          })
        })
      }
    }
  }
</script>

<!-- CSS -->
<style  lang="scss">
  .china-map .wrapper{
    height: 100%;
  }
  .china-map .wrapper .chart{
    width: 100%;
    height: 100%;
  }
  .china-map svg{
    position: relative;
    z-index: 1000;
  }
  .china-map .map {
    position: absolute;
    z-index: 1;
  }
  .china-map .margin-top{
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    z-index: 10;
  }
  .china-map {
    width: 100%;
    height: 100%;
    position: relative;
    display: flex;
    flex-flow: column nowrap;
    align-content: stretch;
    svg {
      width: 100%;
      max-width: 100%;
    }
  }

  .china-map .rank {
    font-size: 10px;
    width: 100%;
    height: 0.3rem;
    line-height: 0.3rem;
    border-bottom: 1px solid #5B1112;
    background: url("../../assets/img/map-category.png") center center no-repeat;
    background-size: 100%;
  }

  .china-map .map-chart {
    flex: 1;
    width: 100%;
    background-size: 100%;
  }

  .china-map .map-area {
    height: 0.5rem;
    line-height: 0.5rem;
    width: 100%;
    padding: 0 0.25rem;
    font-size: 10px;
    color: #5B1112;

  }

  .other-label{
    fill: #5b1112;
  }
  .province:hover,
  .data-polygon:hover {
    cursor: pointer;
  }

	.st0{fill:#5B1111;stroke:#FFFFFF;stroke-width:0.5;stroke-miterlimit:10;}
	.st1{fill-rule:evenodd;clip-rule:evenodd;fill:#5B1111;stroke:#FFFFFF;stroke-width:0.5;stroke-miterlimit:10;}
	.st2{fill:#5B1111;}
	.st3{fill:none;stroke:#FFFFFF;stroke-width:0.5;stroke-miterlimit:10;}
	.st4{display:none;}
	.st5{display:inline;fill:#EBEBEB;}
	.st6{display:inline;fill:#FFFFFF;}
	.st7{display:inline;fill:#B0B0B0;}
	.st8{display:inline;fill:#757575;}
	.st9{display:inline;fill:#666666;stroke:#FFFFFF;stroke-miterlimit:10;}
	.st10{display:inline;fill:#4D4D4D;}
	.st11{display:inline;fill:#999999;stroke:#FFFFFF;stroke-miterlimit:10;}
	.st12{display:inline;fill:none;stroke:#000000;stroke-miterlimit:10;}
</style>
