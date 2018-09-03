<template>
  <div id="app">
    <img src="../static/img/arrow.png" alt="slide up" class="slide-up-arrow" v-if="activeIndex === 1 && showArrow">
    <div class="rank-dialog" v-if="showRankDialog" ref="rankDialog">
      <p>
          中共十八大后，中央领导层交替，新旧两任执政党总书记均称：腐败问题解决不好将会“亡党亡国”。至2017年秋，十九大召开，五年中反腐进展如何？从 “老虎苍蝇一起打”，到“反腐进入深水区”，从李春城到孙政才，五年间落马高级干部至少187人。
         <br>
         <br>
         <small class="note">注：本文统计截至2017年10月14日，<span> 标注的“官员任职”为落马时担任的职务</span>，凡“原XX”为落马时已不担任此职。</small>
      </p>
    </div>
    <infomation-details></infomation-details>
    <swiper :options="swiperOption" ref="mySwiper">
      <!--首页-->
      <swiper-slide>
        <page-title></page-title>
      </swiper-slide>
      <swiper-slide>
        <main-content-wrapper
        ref="contentWrapper"
        :active-index="activeIndex"
        @lockPrev="lockPrev"
        @unlockPrev="unlockPrev"
        @lockNext="lockNext"
        @unlockNext="unlockNext"
        @unlock="unlock"
        @lock="lock"
        @slidePrev="slidePrev"
        @slideNext="slideNext"
        ></main-content-wrapper>
      </swiper-slide>
      <!--尾页-->
      <swiper-slide>
        <page-cover  @unlock="unlock"></page-cover>
      </swiper-slide>
    </swiper>
  </div>
</template>

<script>
import Hammer from 'hammerjs'
import $ from 'jquery'
import * as d3 from 'd3'
import { swiper, swiperSlide } from 'vue-awesome-swiper'
import PageTitle from './components/PageTitle'
import PageCover from './components/PageCover'
import MainContentWrapper from './components/MainContentWrapper'
import svgData from './assets/data/data.json'
import InfomationDetails from './common/InfomationDetails'
export default {
  name: 'app',
  data () {
    return {
      data: svgData,
      showArrow: true,
      activeIndex: 0,
      previousIndex: 0,
      contentStatus: 0,
      showRankDialog: false,
      swiperOption: {
        direction: 'vertical',
        setWrapperSize: true,
        mousewheelControl: true,
        observeParents: true,
        enabled: false
      }
    }
  },
  created () {
    this.swiperOption.onTransitionStart = (swiper) => {
      //
    }
    this.swiperOption.onSlideChangeStart = (swiper) => {
      console.log(swiper)
      this.activeIndex = swiper.activeIndex
      this.previousIndex = swiper.previousIndex
      if (this.activeIndex === 1) {
        swiper.lockSwipes()
        console.log('lock')
      }
    }
  },
  mounted () {
    this.$eventBus.$on('showRankDialog', () => {
      this.showRankDialog = true
      this.$nextTick(() => {
        console.log(this.$refs)
        let handler = new Hammer(this.$refs.rankDialog)
        handler.get('swipe').set({ direction: Hammer.DIRECTION_VERTICAL })
        handler.on('swipeup', (swiper) => {
          this.removeRankDialog()
        })
        handler.on('swipedown', (swiper) => {
          this.removeRankDialog()
        })
      })
    })
    this.$eventBus.$on('hideArrow', () => {
      this.showArrow = false
    })
    this.$eventBus.$on('showArrow', () => {
      this.showArrow = true
    })
  },
  methods: {
    removeRankDialog: function () {
      //
      $('.rank-dialog p').animate({
        bottom: '2000px'
      }, 1000, function () {
        $('.rank-dialog').remove()
        $('.page-rank').append('<div class="title">这张图列出的是中共十八大到十九大期间落马的187名高级干部。</div>')
        d3.selectAll('.rank-label')
        .attr('opacity', 0)
        .transition()
        .duration(500)
        .delay((d, i) => i * 50)
        .attr('opacity', 1)
        d3.select('.svg-page-rank .rank-group #李春城').dispatch('click')
        setTimeout(() => {
          $('.information-details').css('left', '24%')
        }, 100)
      })
    },
    slidePrev: function () {
      this.unlock()
      this.$refs.mySwiper.swiper.slidePrev()
    },
    slideNext: function () {
      this.unlock()
      this.$refs.mySwiper.swiper.slideNext()
    },
    lockPrev: function () {
      console.log('lock prev')
      this.$refs.mySwiper.swiper.lockSwipeToPrev()
    },
    unlockPrev: function () {
      console.log('unlock prev')
      this.$refs.mySwiper.swiper.unlockSwipeToPrev()
    },
    lockNext: function () {
      console.log('lock next')
      this.$refs.mySwiper.swiper.lockSwipeToNext()
    },
    unlockNext: function () {
      console.log('unlock next')
      this.$refs.mySwiper.swiper.unlockSwipeToNext()
    },
    unlock: function () {
      console.log('unlocks')
      this.$refs.mySwiper.swiper.unlockSwipes()
    },
    lock: function () {
      console.log('lock')
      this.$refs.mySwiper.swiper.lockSwipes()
    }
  },
  components: {
    PageTitle,
    PageCover,
    InfomationDetails,
    MainContentWrapper,
    swiper,
    swiperSlide
  }
}
</script>

<style lang="scss">
  @import "~normalize.scss/normalize.scss";
  *{
    box-sizing: border-box;
    padding: 0;
    margin: 0;
  }
  html, body, #app {
    width: 100%;
    height: 100%;
    font-family: '微软雅黑', 'PingFang SC', 'Droidsansfallback';
    font-size: 14px;
    overflow: hidden;
  }

  #app {
    max-width: 750px;
    margin: 0 auto;
    background-color: #cccccc;
  }

  .index,
  .swiper-container {
    width: 100%;
    height: 100%;
    position: relative;
    overflow: hidden;
  }
  .swiper-slide{
    background: #ffffff;
    position: relative;
  }
  .rank-dialog{
    position: absolute;
    z-index: 10;
    bottom:0;
    left:0;
    top: 0;right:0;
    color: #5B1112;
    font-size: 14px;
    p {
      position: absolute;
      bottom:3rem;
      width: 6.8rem;
      left: 50%;
      line-height: 1.6;
      margin-left: - 3.4rem;
      text-indent: 2em;
      background-color: #fff;
      padding: 5px;
      box-shadow: 3px 3px 3px rgba(0,0,0,0.3), 0 0 3px 3px rgba(0,0,0,0.2);
    }
    @keyframes slideup {
      0% {
        transform: translate(0, 0.1rem);
      }
      50% {
        transform: translate(0, 0);
      }
      100% {
        transform: translate(0, -0.1rem);
      }
    }
  }
  .eight-charge-dialog{
    position: absolute;
    bottom: 2.65rem;
    width: 6.8rem;
    left: 50%;
    padding: 5px 5px 10px 5px;
    margin-left: -3.4rem;
    background-color: #fff;
    box-shadow: 3px 3px 3px rgba(0,0,0,0.3), 0 0 3px 3px rgba(0,0,0,0.2);
    color: #5B1112;
    font-size: 14px;
    line-height: 1.6;
  }
  .mutiply-charge-dialog{
    position: absolute;
    bottom: 0.65rem;
    width: 6.8rem;
    left: 50%;
    padding: 5px 5px 10px 5px;
    margin-left: -3.4rem;
    background-color: #fff;
    box-shadow: 3px 3px 3px rgba(0,0,0,0.3), 0 0 3px 3px rgba(0,0,0,0.2);
    color: #5B1112;
    font-size: 14px;
    line-height: 1.6;
    p {
      text-indent: 2em;
    }
  }
  .slide-up-arrow{
    position: absolute;
    z-index:100;
    bottom: 0.2rem;
    width: 0.7rem;
    left: 50%;
    margin-left: -0.35rem;
    animation: slideup 1s  linear infinite alternate;
  }
  .note span{
    text-decoration: underline;
  }
</style>
