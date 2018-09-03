import * as d3 from 'd3'
import $ from 'jquery'

let width = $('#app').width()
function hideInfomationDetails () {
  $('.infomation-wrapper').hide()
}

function showInfomationDetails (info, coord) {
  console.log(info, coord)
  let handdler
  if ($('.infomation-wrapper').length) {
    $('.infomation-wrapper').show()
    handdler = d3.select('.infomation-wrapper')
      .html('')
  } else {
    handdler = d3.select('#app')
      .append('div')
      .attr('class', 'infomation-wrapper')
  }

  let html = `<div class="infomation-name"><b>${info.name}</b><span>(${info.rank})</span></div>
                <p class="infomation-position">${info.position}</p>`
  if (info.chargeName !== '-') {
    html += `<p class="infomation-charge">${info.chargeName}</p>`
  }
  if (info.result && info.result !== '-') {
    html += `<p class="infomation-prison-time">${info.result}</p>`
  }
  handdler.html(html)

  // adjust position

  let infoWidth = $('.infomation-wrapper').width()
  let infoHeight = $('.infomation-wrapper').height()
  let x = event.x
  let y = event.y
  let top = y
  if (infoHeight > y - 30) {
    top = y + 30
  } else {
    top = y - infoHeight - 30
  }
  var left = x
  if (left - infoWidth / 2 < 10) {
    left = 10
  } else if (left + infoWidth / 2 > width) {
    left = width - infoWidth - 20
  } else {
    left = x - infoWidth / 2
  }
  $('.infomation-wrapper').css({
    left: left + 'px',
    top: top + 'px'
  })
}

export {
  showInfomationDetails,
  hideInfomationDetails
}

