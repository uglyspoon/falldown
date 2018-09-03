<template>
<div  class="page-rank">
    <div class="wrapper">
      <div class="title">据财新统计，十八大来落马的中管干部至少185人。</div>
      <div class="content-chart">
        <div class="chart" id="page-rank" ref="pageRank">
        </div>
      </div>
    </div>
</div>
</template>

<script>
  import * as d3 from 'd3'
  import _ from 'lodash'
  import {RANKORDER, RANKCOLOR} from '../../common/variable'
  import {addSVG, getRegularHexagon} from '../../common/common'
  export default {
    name: 'pageRank',
    props: ['svgData', 'activeIndex', 'previousIndex', 'pageIndex'],
    data () {
      return {
        svg: null,
        polygons: null,
        chartData: {
          rankOrder: RANKORDER,
          rankColor: RANKCOLOR,
          startLeft: 160,
          startTop: 60,
          rowGapY: 4,
          rowGapX: 3,
          colStart: 0
        }
      }
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
    mounted () {
      // 初始化
      this.$nextTick(() => {
        this.prepareData()
        this.renderInit()
        this.renderContent()
      })
    },
    methods: {
      prepareData () {
        this.chartData.width = this.$refs.pageRank.clientWidth
        this.chartData.height = this.$refs.pageRank.clientHeight
        this.chartData.r = this.chartData.width * 0.02
        this.chartData.xR = Math.cos(Math.PI / 6) * this.chartData.r
        this.chartData.yR = this.chartData.r
        this.chartData.startLeft = this.chartData.width * 0.15
        this.chartData.startTop = this.chartData.height * 0.05
        let colNum = 20
        let rowGap = 30
        let groups = _.groupBy(this.svgData, 'rankCat')
        groups = _.omit(groups, '-')
        let arr = this.chartData.rankOrder.map((d) => {
          return {
            name: d,
            value: groups[d]
          }
        })
        arr = _.map(arr, (d, i) => {
          let tmp = arr.slice(0, i)
          let t = 0
          _.each(tmp, (e) => {
            t += Math.ceil(e.value.length / colNum) * (this.chartData.rowGapY + 2 * this.chartData.yR) + rowGap
          })
          d.startHeight = t + this.chartData.startTop
          return d
        })
        _.each(arr, (d, index) => {
          _.each(d.value, (e, i) => {
            let col = i % colNum
            let row = Math.floor(i / colNum)
            e['grid'] = [(col * (2 * this.chartData.xR + this.chartData.rowGapX)) + this.chartData.xR + this.chartData.startLeft, d.startHeight + row * (2 * this.chartData.yR + this.chartData.rowGapY) + this.chartData.yR]
            e['cd'] = [col, row]
          })
        })
        this.chartData.arr = arr
      },
      renderInit () {
        let selector = `#${this.$refs.pageRank.id}`
        this.svg = addSVG(selector, 'svg-page-rank')
        this.svgPloygonGroup = this.svg
      },
      renderContent () {
        this.$eventBus.$emit('showRankDialog')
        let $eventBus = this.$eventBus
        let chartData = this.chartData
        let svg = this.svg
        svg.on('click', (e) => {
          if (d3.event.target.tagName !== 'polygon') {
            $eventBus.$emit('hideInformationDetails')
            d3.selectAll('.rank-hexagon')
              .classed('active-rank-hexagon', false)
            d3.select('.rank-active-group').remove()
          }
        })
        svg.selectAll('g.rank-group')
          .data(chartData.arr)
          .enter()
          .append('g')
          .attr('class', 'rank-group')
        svg.selectAll('g.rank-group')
          .data(chartData.arr)
          .attr('class', 'rank-group')
        svg.selectAll('g.rank-group')
          .data(chartData.arr)
          .exit()
          .remove()
        // -------------------------------------
        svg.selectAll('g.rank-group')
          .each(function (d) {
            d3.select(this)
              .append('text')
              .attr('class', 'rank-label')
              .attr('x', 0)
              .attr('y', '1em')
              .attr('dy', chartData.r / 2)
              .attr('transform', (d, i) => {
                return `translate(${chartData.startLeft - 10},${d.startHeight})`
              })
              .text(function () {
                if (d.name === '中管') {
                  return '其他中管干部'
                } else {
                  return d.name
                }
              })
              // .attr('opacity', 0)
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
                let points = getRegularHexagon(d.grid, chartData.r)
                return _.map(points, function (e) {
                  return e.join(',')
                }).join(' ')
              })
              .attr('transform-origin', (e) => {
                return `${e.grid[0]} ${e.grid[1]}`
              })
              .style('fill', (d) => {
                return chartData.rankColor[d.rankOrder]
              })
              .attr('stroke-width', 1)
              .attr('stroke', (d) => {
                if (d.rankCat === '军队落马将领') {
                  return '#000000'
                } else {
                  return 'transparent'
                }
              })
          })
        this.polygons = svg.selectAll('.rank-hexagon')
        this.polygons
          .attr('transform', () => {
            let x = Math.random() * (-2000) + 1000
            let y = Math.random() * (-2000) - 1000
            return `translate(${x},${y})`
          })
          .transition()
          .duration(2000)
          .attr('transform', 'translate(0,0)')
        this.polygons
          .on('click', function (d) {
            // 点击事件绑定
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
                    return chartData.rankColor[d.rankOrder]
                  })
                thisDom
                  .style('fill', () => {
                    return chartData.rankColor[d.rankOrder]
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
            $eventBus.$emit('showInformationDetails', d, d3.event)
          })
      },
      renderFallDown () {
        this.polygons
          .attr('transform', 'translate(0,0)')
          .transition()
          .duration(2000)
          .attr('transform', () => {
            let x = Math.random() * (-2000) + 1000
            let y = Math.random() * (-2000) - 1000
            return `translate(${x},${y})`
          })
      },
      renderRiseUp () {
        this.polygons
          .attr('transform', () => {
            let x = Math.random() * (-2000) + 1000
            let y = Math.random() * 2000 + 1000
            return `translate(${x},${y})`
          })
          .transition()
          .duration(2000)
          .attr('transform', 'translate(0,0)')
      }
    }
  }
</script>

<!-- CSS -->
<style lang="scss">
  @import '../../assets/scss/common';
  .page-rank {
    width: 100%;
    height: 100%;
    background: #FFFFFF;
  }

  .page-rank  .wrapper{
    position: relative;
    width: 100%;
    max-width: 700px;
    height: 100%;
    margin: 0 auto;
  }

  .page-rank  .wrapper .chart{
    width: 100%;
    height: 100%;
  }


  .rank-label{
    font-size: 14px;
    text-anchor: end;
    fill: $falldownRed;
  }


 .rank-active {
    transform: scale3d(0, 0,1);
  }
.rank-active:nth-child(1){
    animation: bobble 0.8s linear 0.1s infinite;;
    will-change: opacity;
  }

.rank-active:nth-child(2){
    animation: bobble 0.8s linear 0.4s infinite;;
    will-change: opacity;
  }

.rank-active:nth-child(3){
    animation: bobble 0.8s  linear 0.6s infinite;;
    will-change: opacity, transform;
  }

  @keyframes bobble {
    0% {
      opacity: 0.8;
      transform: scale3d(1.3, 1.3,1);
    }
    50% {
      opacity: 0.5;
      transform: scale3d(0.9, 0.9,1);
    }
    100% {
      opacity: 1;
      transform: scale3d(1, 1,1);
    }
  }
  .rank-group:hover{
    cursor: pointer;
  }
</style>
