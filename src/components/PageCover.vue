<template>
  <div class="page-cover">
    <!--尾页-->
    <div class="leave-blank">
    </div>
    <div class="credit">
      <img src="../assets/img/credit.png" alt="" class="credit-hexogon">
      <p class="content-source">
        数据来源：中央纪委监察部、财新网综合报道、电视专题片《巡视利剑》
        </p>
      <p class="time-end">
        时间截至：2017年10月14日
        </p>
      <ul>
        <li>记者：丁苗 陈宝成 林子桢</li>
        <li>设计：刘佳昕 牛晨明 高旭</li>
        <li>开发：沈志超</li>
        <li>监制：黄晨</li>
      </ul>
      <p class="make">
        <span>财新数据可视化实验室出品</span>
      </p>
      <a href="http://datanews.caixin.com/">
        <img src="../assets/img/logo.png" class="logo" alt="财新-数字说">
      </a>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'page-cover',
    data () {
      return {}
    },
    mounted () {
    }
  }
</script>

<!-- CSS -->
<style scoped>

  .page-cover{
    position: relative;
    display: flex;
    flex-flow: column nowrap;
    align-items: stretch;
    align-content: stretch;
    width: 100%;
    height: 100%;
    background: #fff;
  }


  .page-cover .leave-blank{
    width:100%;
    flex:1;
  }

  .page-cover .credit {
    position: relative;
    height:6.4rem;
    padding: 0.25rem;
    background: #5B1112;
    color: #fff;
    font-size: 12px;
    line-height: 1.5;
  }

  @media screen and (max-device-height: 568px){
     .page-cover .credit {
       height: 7rem;
     }
  }

  .page-cover .credit {
    display: flex;
    flex-flow: column wrap;
    justify-content: center;
  }
  .page-cover .credit .content-source {
    margin-bottom: 0.05rem;
  }

  .page-cover .credit ul {
    margin-top: 1rem;
    list-style: none;
  }

  .page-cover .credit .make{
    margin-top: 0.5rem;
    margin-bottom: 0.2rem;
  }
  .page-cover .credit .make span{
    padding-right: 1.6rem;
    padding-bottom: 0.05rem;
    border-bottom: 1px solid #fff;
  }

  .credit-hexogon{
    position: absolute;
    right: 0;
    top: -0.54rem;
    width: 0.8rem;
  }
  .page-cover .credit .logo{
    width:0.7rem;
  }

</style>
