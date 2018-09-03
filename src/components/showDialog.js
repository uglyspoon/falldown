/* eslint-disable */
import $ from 'jquery'
import Hammer from 'hammerjs'
import * as d3 from 'd3'
let width = $('#app').width()
function showRankDialog () {
  let html = `
  <div class="rank-dialog">
    <p>
      中共十八大后，中央领导层交替，新旧两任执政党总书记均称：腐败问题解决不好将会“亡党亡国”。转眼十九大在即，五年来反腐进展如何？从2012年“新人带来新气象”，到今天“反腐进入深水区”，我们搜集了十八大以来落马的中管干部，邀您一起检视反腐“成绩单”。
    </p>
    <img src="static/img/arrow.png" class="slide-up">
  </div>
  `
  $('#app').append(html)

 let handler = new Hammer($('.rank-dialog')[0])
 handler.get('swipe').set({ direction: Hammer.DIRECTION_VERTICAL }) // 垂直方向的
 handler.on('swipeup', (ev) => {
        $('.rank-dialog p').animate({
          bottom:  '2000px',
          opacity: 0
        },1200, function () {
          $('.rank-dialog').remove()
           d3.select('.rank-page').append('text')
          .attr('class', 'rank-title')
          .attr('x', width / 2)
          .attr('y', width * 0.11)
          .attr('dy', '-1em')
          .text('据财新统计，十八大来落马的中管干部至少182名。')
          .style('fill', '#5b1112')
          .style('text-anchor', 'middle')
        })
      })
}

function hideRankDialog () {
  $('.rank-dialog').remove()
}

function showEightChargeDialog () {
  let html = `
    <div class="eight-charge-dialog">
    2015年起，关于落马官员违纪信息的表述变得丰富多样起来，记者从中选取较有代表性的八项表述，试图展示反腐的另一个侧面。
    </div>
  `
  $('.main-content-wrapper').append(html)
}

function hideEightChargeDialog () {
  $('.eight-charge-dialog').remove()
}


function showMultifyChargesDialog () {
  let html =
  `<div class="mutiply-charge-dialog">
    <p>截止2017年9月4日，据中纪委检查网站公布的信息，共有102名中管干部、一名军区将领（郭伯雄）公布判决罪名，受贿为最常见罪行。</p>
    <p>据财新此前统计，中共十八大后贪腐金额过亿元的高官共16人，其中天津市政协原副主席武长顺涉案金额最大，逾五亿元。</p>
  `
  $('.main-content-wrapper').append(html)
}

function hideMultifyChargesDialog () {
  $('.mutiply-charge-dialog').remove()
}

export {
  showRankDialog,
  hideRankDialog,
  showEightChargeDialog,
  hideEightChargeDialog,
  showMultifyChargesDialog,
  hideMultifyChargesDialog
}
