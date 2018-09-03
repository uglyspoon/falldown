<template>
  <div id="app">
    <infomation-details-pc></infomation-details-pc>
    <img src="../static/img/arrow-down.png" alt="slide up" class="slide-up-arrow" v-if="showArrow">
    <swiper :options="swiperOption" ref="mySwiper">
      <!--首页-->
      <swiper-slide>
        <page-home></page-home>
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
          @slideNext="slideNext"></main-content-wrapper>
      </swiper-slide>
      <swiper-slide>
        <page-cover></page-cover>
      </swiper-slide>
    </swiper>
  </div>
</template>

<script>
import PageHome from './components/pc/PageHome.vue'
import MainContentWrapper from './components/pc/MainContentWrapper.vue'
import PageCover from './components/pc/PageCover.vue'
import { swiper, swiperSlide } from 'vue-awesome-swiper'
import InfomationDetailsPc from './common/InfomationDetailsPc'
export default {
  name: 'app',
  data () {
    return {
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
    this.$eventBus.$on('hideArrow', () => {
      this.showArrow = false
    })
    this.$eventBus.$on('showArrow', () => {
      this.showArrow = true
    })
  },
  methods: {
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
    swiper,
    swiperSlide,
    PageHome,
    MainContentWrapper,
    PageCover,
    InfomationDetailsPc
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
  .swiper-wrapper,
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
  .page{
    position: relative;
    width: 100%;
    height: 100%;
  }
  .wrapper{
    position: relative;
    width: 700px;
    padding: 15px;
    margin: 0 auto;
  }
  .wrapper .title{
    height: 80px;
    padding-top: 50px;
    line-height: 30px;
    width: 100%;
    color: #5B1112;
    font-size: 14px;
    font-weight: bold;
    border-bottom: 2px solid #5b1112;
  }
  .content-chart{
    position: absolute;
    left: 0;
    right: 0;
    top: 80px;
    bottom:0 ;
    width: 100%;
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
  .slide-up-arrow{
    position: absolute;
    z-index:100;
    bottom: 20px;
    width: 30px;
    left: 50%;
    margin-left:-15px;
    animation: slideup 1s  linear infinite alternate;
  }
  .title img{
    max-width: 100%;
  }
</style>
