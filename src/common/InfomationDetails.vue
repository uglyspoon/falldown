<template>
  <div class="information-details"
       ref="informationDetails"
       v-if="show"
       :style="{left: `${pos.left}px`,top: `${pos.top}px`}">
    <p class="information-name"><b>{{information.name}}</b><span>({{information.rank.replace('|', '、')}})</span></p>
    <p class="information-position">{{information.position.replace('|', '、')}}</p>
    <p class="information-charge"
       v-if="information.chargeName!=='-'">{{information.chargeName.replace('|', '、')}}</p>
    <p class="information-prison-time"
       v-if="prison && prison!=='-'">
       {{prison}}
       </p>
  </div>
</template>

<script>
  import $ from 'jquery'
  export default {
    name: 'informationDetails',
    data () {
      return {
        show: false,
        width: 0,
        height: 0,
        pos: {
          left: 0,
          top: 0
        },
        information: {
          name: '',
          rank: '',
          result: '',
          position: '',
          chargeName: ''
        }
      }
    },
    computed: {
      prison () {
        if (this.information.prisonTime === '-' || this.information.prisonTime === '') {
          return '-'
        }
        if (this.information.prisonTime.indexOf('年') === -1) {
          return this.information.prisonTime
        } else {
          return '有期徒刑' + this.information.prisonTime
        }
      }
    },
    mounted () {
      this.$eventBus.$on('showInformationDetails', (data, coordInfo) => {
        //
        console.log(data, coordInfo)
        this.information = data
        this.show = true
        this.$nextTick(() => {
          this.calculatePos(coordInfo)
        })
      })
      this.width = $('#app').width()
      this.height = $('#app').height()
      this.$eventBus.$on('hideInformationDetails', () => {
        this.show = false
      })
    },
    methods: {
      calculatePos (event) {
        let infoWidth = this.$refs.informationDetails.clientWidth
        let infoHeight = this.$refs.informationDetails.clientHeight
        let pos = event.target.getBoundingClientRect()
        let x = pos.left + pos.width / 2
        let y = pos.top + pos.height / 2
        let top = y
        if (infoHeight > y - 30) {
          top = y + 30
        } else {
          top = y - infoHeight - 30
        }
        var left = x
        if (left - infoWidth / 2 < 10) {
          left = 10
        } else if (left + infoWidth / 2 > this.width) {
          left = this.width - infoWidth - 20
        } else {
          left = x - infoWidth / 2
        }
        this.pos.left = left
        this.pos.top = top
      }
    }
  }
</script>

<!-- CSS -->
<style scoped lang="scss">
  @import "../assets/scss/common.scss";
  .information-details {
    position: absolute;
    left:22px;
    top:25px;
    padding: 5px;
    z-index:1000;
    width:4.2rem;
    font-size: 12px;
    background: #fff;
    color: $falldownRed;
    border: 1px solid $falldownRed;
    box-shadow: 3px 3px 3px rgba(0,0,0,0.5),  0 0 2px 2px rgba(144,50,50,0.8);
    transition: all 0.3s linear;
  }
  .information-name {
    padding-bottom: 5px;
    margin-bottom: 5px;
    border-bottom:1px solid #5B1112;
  }
  .information-name b{
    margin-right: 0.5em;
    font-size: 14px;
    color: #000;
  }
  .information-details   p {
    line-height: 1.5;
  }
</style>
