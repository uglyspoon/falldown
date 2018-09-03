<template>
  <div class="page-charge-group" id="page-charge-group" ref="pageChargeGroup">
      <div class="assay">
        2015年起，关于落马官员违纪信息的表述变得丰富多样起来，记者从中选取较有代表性的八项表述，试图展示反腐的另一个侧面。
      </div>
  </div>
</template>

<script>
  import _ from 'lodash'
  import * as d3 from 'd3'
  import {RANKORDER, RANKCOLOR, CHARGENAME} from '../common/variable'
  import {addSVG} from '../common/common'
  export default {
    name: 'template',
    props: ['svgData', 'activeIndex', 'previousIndex', 'pageIndex'],
    data () {
      return {
        svg: null,
        chartData: {
          areaPos: [[250, 360], [450, 500], [120, 530], [250, 670], [630, 700], [400, 200], [440, 620], [550, 610]],
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
    methods: {
      prepareData () {
        let width = this.$refs.pageChargeGroup.clientWidth
        let rate = width / 750
        this.chartData.width = width
        this.chartData.areaPos = this.chartData.areaPos.map(d => {
          return d.map(e => e * rate)
        })
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
        this.chartData.chargeNameData = chargeNameData
      },
      renderInit () {
        let selector = `#${this.$refs.pageChargeGroup.id}`
        this.svg = addSVG(selector, 'svg-charge-group')
      },
      renderContent () {
        let chartData = this.chartData
        let areaExtent = d3.extent(_.map(chartData.chargeNameData, d => {
          return d.number
        }))
        let areaScale = d3.scaleLinear()
          .domain(areaExtent)
          .range([chartData.width * 0.14, chartData.width * 0.33])
        let areaGroups = this.svg.selectAll('g.charge-area-group')
          .data(chartData.chargeNameData)
          .enter()
          .append('g')
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
          .attr('stroke', '#fff')
          .attr('stroke-width', 1)
        areaGroups
          .append('text')
          .attr('x', 0)
          .attr('y', 0)
          .style('text-anchor', 'middle')
          .style('fill', '#fff')
          .style('font-size', 10)
          .html((d) => {
            let html = ''
            let name = d.name.replace('、', '')
            let row = 0
            for (let i = 0; i < name.length - 1; i = i + 5) {
              html += '<tspan x="0" dy="' + row + '">' + name.slice(i, i + 5) + '</tspan>'
              row += 25
            }
            return html
          })
      }
    }
  }
</script>

<!-- CSS -->
<style scoped lang="scss">
  @import '../assets/scss/common.scss';
  .page-charge-group{
    width:100%;
    height:100%;
    overflow: hidden;
  }
  .assay{
    position: absolute;
    bottom: 1.4rem;
    width:7rem;
    margin: 0.25rem;
    padding: 0.8em;
    line-height: 1.5;
    color: $falldownRed;
    font-weight: bold;
    box-shadow: 3px 3px 4px rgba(0,0,0,0.4), 0 0 2px 2px rgba(0,0,0,0.2);
  }
</style>
