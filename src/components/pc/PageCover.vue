<template>
  <div class="page-cover">
    <!--尾页-->
    <div class="leave-blank">
    </div>
    <div class="credit">
      <img src="../../assets/img/credit.png" alt="" class="credit-hexogon">
      <div class="wrapper">
        <p class="content-source">
          <b>数据来源：</b> 中央纪委监察部、财新网综合报道、电视专题片《巡视利剑》
          </p>
        <p class="time-end">
          <b>时间截至：</b>2017年10月10日
          </p>
        <ul>
          <li><b>记者：</b>丁苗 陈宝成 林子祯</li>
          <li><b>设计：</b>刘佳昕 牛晨明 高旭</li>
          <li><b>开发：</b>沈志超</li>
          <li><b>监制：</b>黄晨</li>
        </ul>
        <p class="make">
          <span><b>财新数据可视化实验室出品</b></span>
        </p>
        <a href="http://datanews.caixin.com/">
          <img src="../../assets/img/logo.png" class="logo" alt="财新-数字说">
        </a>
      </div>
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
    height:50%;
    background: #5B1112;
    color: #fff;
    font-size: 16px;
    line-height: 1.8;
  }

  .page-cover .credit {
    display: flex;
    flex-flow: column wrap;
    justify-content: center;
  }
  .page-cover .credit .content-source {
  }

  .page-cover .credit ul {
    list-style: none;
  }

  .page-cover .credit .make{
    margin-top: 10px;
  }
  .page-cover .credit .make span{
    padding-bottom: 3px;
    padding-left: 10px;
    padding-right: 10px;
    border-bottom: 1px solid #fff;
  }

  .credit-hexogon{
    position: absolute;
    right: 0;
    top: -40px;
    width: 60px;
  }
  .page-cover .credit .logo{
    width:60px;
    margin-top: 15px;
  }
.credit .wrapper{
  text-align: center;
}

</style>
