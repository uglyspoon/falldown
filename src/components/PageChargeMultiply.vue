<template>
  <div class="page-charge-multiply" id="page-charge-multiply" ref="pageChargeMultiply">
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
          areaPos: [[556, 596], [550, 160], [42, 114], [462, 844], [42, 758], [336, 76], [104, 656], [98, 606], [248, 836], [584, 376], [222, 686], [260, 758], [260, 614], [422, 590], [466, 496], [372, 684], [92, 160]],
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
        let width = this.$refs.pageChargeMultiply.clientWidth
        let rate = width / 750
        this.chartData.width = width
        this.chartData.areaPos = this.chartData.areaPos.map(d => {
          return d.map(e => e * rate)
        })
        let charges = []
        _.each(this.svgData, (d) => {
          let names = d.chargeName
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
        // charges = _.sortBy(charges, 'number')
        let chargeNameData = charges
        this.chartData.chargeNameData = chargeNameData
        let areaExtent = d3.extent(_.map(charges, (d) => {
          return d.number
        }))
        let areaScale = d3.scaleLinear()
          .domain(areaExtent)
          .range([width * 0.05, width * 0.45])
        this.chartData.areaCal = _.map(charges.reverse(), (d, i) => {
          var c = charges.slice(0, i)
          var s = _.sumBy(c, (d) => {
            return areaScale(d.number)
          })
          return s + 30
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
        let selector = `#${this.$refs.pageChargeMultiply.id}`
        this.svg = addSVG(selector, 'svg-charge-group')
      },
      renderContent () {
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
      }
    }
  }
</script>

<!-- CSS -->
<style scoped lang="scss">
  @import '../assets/scss/common.scss';
  .page-charge-multiply{
    width:100%;
    height:100%;
    overflow: hidden;
  }
  .assay{
    position: absolute;
    bottom: 1.3rem;
    width:7rem;
    margin: 0.25rem;
    padding: 0.8em;
    line-height: 1.5;
    color: $falldownRed;
    font-weight: bold;
    box-shadow: 3px 3px 4px rgba(0,0,0,0.4), 0 0 2px 2px rgba(0,0,0,0.2);
  }
</style>
