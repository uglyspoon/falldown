<template>
  <div class="page-penalty">
    <div class="wrapper">
      <div class="title">
        刑期
      </div>
      <div class="content-chart">
        <div class="chart"  id="page-penalty" ref="pagePenalty"></div>
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
    name: 'pagePenalty',
    props: ['svgData', 'activeIndex', 'previousIndex', 'pageIndex'],
    data () {
      return {
        svg: null,
        chartData: {
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
      this.svg.selectAll('.group-penalty rect').attr('stroke-width', 0)
    },
    methods: {
      prepareData () {
        let width = this.$refs.pagePenalty.clientWidth
        this.chartData.width = width
        this.chartData.height = this.$refs.pagePenalty.clientHeight
        this.chartData.yR = width * 0.004
        this.chartData.yGap = 1
        this.chartData.leftX = width * 0.08
        this.chartData.marginTop = width * 0.1
        this.chartData.yearWidth = width * 0.03
        this.chartData.yearHeight = this.chartData.yR * 0.6
        this.chartData.yearGapX = width * 0.008
        this.chartData.maxWidth = 20 * (this.chartData.yearWidth + this.chartData.yearGapX)
        this.chartData.maxHeight = width * 0.006
        let judgment = _.filter(this.svgData, (d) => {
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
        this.chartData.arr = arr
        this.chartData.areaData = areaData
      },
      renderInit () {
        let selector = `#${this.$refs.pagePenalty.id}`
        this.svg = addSVG(selector, 'svg-page-penalty')
      },
      renderContent () {
        let $eventBus = this.$eventBus
        this.svg.on('click', (e) => {
          console.log(d3.event.target.parentNode.parentNode)
          if (!(d3.event.target.tagName === 'polygon' || d3.select(d3.event.target.parentNode.parentNode).attr('class') === 'group-penalty')) {
            $eventBus.$emit('hideInformationDetails')
            d3.selectAll('.rank-hexagon')
              .classed('active-rank-hexagon', false)
            d3.select('.rank-active-group').remove()
            self.svg.selectAll('.group-penalty rect')
            .attr('stroke', 'transparent')
          }
        })
        let self = this
        this.svg.append('text')
        .attr('class', 'penalty-title')
        .text('已判刑的落马官员')
        .attr('x', 15)
        .attr('y', this.chartData.marginTop)
        .attr('fill', '#5b1112')
        .attr('font-size', 12)
        this.svg.append('text')
        .attr('class', 'penalty-title')
        .text('每条横线代表一年刑期')
        .attr('x', '12em')
        .attr('y', this.chartData.marginTop)
        .attr('fill', '#5b1112')
        .attr('font-size', 12)
        let chartData = this.chartData
        // ----------------background------------------------
        this.svg.selectAll('rect.penalty-block')
          .data(chartData.areaData)
          .enter()
          .append('rect')
          .attr('x', 0)
          .attr('y', (d, i) => {
            let e = chartData.areaData.slice(0, i)
            let h = _.reduce(e, (a, b) => {
              return a + b.number
            }, 0)
            return chartData.marginTop + h * (chartData.yR + chartData.yR * Math.sin(Math.PI / 3) + chartData.yGap) + chartData.yR
          })
          .attr('width', chartData.width)
          .attr('height', (d) => {
            return d.number * (chartData.yR + chartData.yR * Math.sin(Math.PI / 3) + chartData.yGap)
          })
          .attr('fill', (d, i) => {
            if (i % 2) {
              return '#fff'
            } else {
              return '#e5e5e5'
            }
          })
        // ----------------background------------------------
        // ------------------text----------------------------
        this.svg.selectAll('text.penalty-text')
          .data(chartData.areaData)
          .enter()
          .append('text')
          .attr('x', chartData.width - 15)
          .attr('y', (d, i) => {
            let e = chartData.areaData.slice(0, i)
            let h = _.reduce(e, (a, b) => {
              return a + b.number
            }, 0)
            return chartData.marginTop + h * (chartData.yR + chartData.yR * Math.sin(Math.PI / 3) + chartData.yGap) + chartData.yR
          })
          .attr('dy', 10)
          .text((d) => {
            return d.name
          })
          .style('text-anchor', 'end')
          .style('font-size', 12)
          .style('fill', '#5B1111')
        // ------------------text----------------------------
        // --------------------------------------------------
        this.svg.append('g').attr('class', 'touchmove-group').selectAll('g.group-penalty')
          .data(chartData.arr)
          .enter()
          .append('g')
          .attr('class', 'group-penalty')
          .attr('transform', (d, i) => {
            let y = chartData.marginTop + chartData.yR + i * (chartData.yR + chartData.yR * Math.sin(Math.PI / 3) + chartData.yGap)
            return `translate(${chartData.leftX},${y})`
          })
          .on('click', function (d) {
            d3.select(this).select('polygon').dispatch('click')
          })
        this.svg.selectAll('g.group-penalty').append('g')
        .attr('class', 'rect-group')
        .attr('id', d => d.name)
        this.svg.selectAll('g.group-penalty')
          .append('polygon')
          .attr('class', 'penalty-hexagon')
          .attr('points', (d, i) => {
            let x = chartData.yR * Math.sin(Math.PI / 3)
            if (i % 2) {
              x = 0
            }
            let points = getRegularHexagon([x, chartData.yR], chartData.yR * 1.2)
            return _.map(points, function (e) {
              return e.join(',')
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
          .on('click', function (d, i) {
            self.svg.selectAll('.group-penalty rect')
            .attr('stroke-width', 0)
            d3.select(this.parentNode)
            .selectAll('rect')
            .attr('stroke-width', 2)
            .attr('stroke', '#f00')
            d3.select('.rank-active-group').remove()
            let activeGroup = self.svg.append('g')
            .attr('class', 'rank-active-group')
            let pos = d3.select(this).node().getBoundingClientRect()
            let offset = $('.content-chart').offset()
            let x = pos.left + pos.width / 2 - offset.left
            let y = pos.top + pos.height / 2 - offset.top
            let data = d3.range(0, chartData.yR, (chartData.yR) / 3)
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
        // --------------------------------------------------
        this.svg.selectAll('g.group-penalty')

        this.svg.selectAll('g.group-penalty  .rect-group')
          .attr('opacity', 0)
          .attr('width', 0)
          .transition()
          .duration(1000)
          .delay((d, i) => i * 10)
          .attr('opacity', 1)
          .attr('width', chartData.maxWidth)
          .each(function (d) {
            if (d['years'] === '无期徒刑') {
              d3.select(this)
                .append('rect')
                .attr('x', 20)
                .attr('y', chartData.yR / 2)
                .attr('width', 0)
                .attr('height', chartData.maxHeight)
                .attr('fill', '#a07b7b')
                // .attr('opacity', 0)
                // .attr('width', 0)
                // .transition()
                // .duration(2000)
                // .delay((d, i) => i * 50)
                .attr('opacity', 1)
                .attr('width', chartData.maxWidth)
            }
            if (d['years'] === '死缓') {
              d3.select(this)
                .append('rect')
                .attr('x', 20)
                .attr('y', chartData.yR / 2)
                .attr('width', 0)
                .attr('height', chartData.maxHeight)
                .attr('fill', '#8c5858')
                // .attr('opacity', 0)
                // .attr('width', 0)
                // .transition()
                // .duration(2000)
                // .delay((d, i) => i * 50)
                .attr('opacity', 1)
                .attr('width', chartData.maxWidth)
            }
            if (d['years'] === '死刑') {
              d3.select(this)
                .append('rect')
                .attr('x', 20)
                .attr('y', chartData.yR / 2)
                .attr('width', 0)
                .attr('height', chartData.maxHeight)
                .attr('fill', '#692626')
                // .attr('opacity', 0)
                // .attr('width', 0)
                // .transition()
                // .duration(2000)
                // .delay((d, i) => i * 50)
                .attr('opacity', 1)
                .attr('width', chartData.maxWidth)
            }
            if (typeof d['years'] === 'number') {
              let data = d3.range(0, d['years'], 1)
              d3.select(this)
                .selectAll('rect.year-bak')
                .data(data)
                .enter()
                .append('rect')
                .attr('x', (d, i) => {
                  return d * (chartData.yearWidth + chartData.yearGapX) + 20
                })
                .attr('y', chartData.yR / 2)
                .attr('width', chartData.yearWidth)
                .attr('height', chartData.yearHeight)
                .attr('fill', '#692626')
                // .attr('opacity', 0)
                // .transition()
                // .duration(2000)
                // .delay((d, i) => i * 50)
                .attr('opacity', 1)
            }
          })
        // --------------------------------------------------
      }
    }
  }
</script>

<!-- CSS -->
<style>
  .page-penalty {
    width: 100%;
    height: 100%;
  }
  .group-penalty polygon:hover,
  .group-penalty rect:hover{
    cursor: pointer;
  }
  .page-penalty .wrapper {
    height: 100%;
  }
  .page-penalty .wrapper .chart{
    height: 100%;
    width: 100%;
  }
</style>
