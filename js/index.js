var AqiApi = "https://opendata.epa.gov.tw/ws/Data/AQI/?$format=json";

var AqiMax = {
  "PM2.5": 350.4,
  PM10: 504,
  SO2: 804,
  CO: 40.4,
  O3: 504,
  NO2: 1649
};

var AqiData = {
  OpenData: [],
  County: [],
  CountyRadio: [],
  filter: "全臺灣"
};

var vm = new Vue({
  el: "#AQI",
  data: AqiData,
  methods: {
    ClickCountyRadio: function(res) {
      vm.filter = res;
      var vobj = this;
      var result = this.OpenData.filter(function(obj) {
        return obj.County == vobj.filter;
      });
      vm.CountyRadio = result;
    },
    ClickTaiwan: function(res) {
      this.filter = "全臺灣";
      this.CountyRadio = this.OpenData;
    }
  },
  computed: {}
});

$.ajax({
  url: AqiApi,
  method: "get",
  dataType: "jsonp",
  cache: false,
  success: function(res) {
    vm.OpenData = res
      .sort(function(a, b) {
        return a.AQI - b.AQI;
      })
      .reverse();
    // 陣列順序調整

    vm.CountyRadio = res;

    var j = 0;
    for (var i = 0; i < res.length; i++) {
      if (vm.County.indexOf(res[i].County) === -1) {
        vm.County[j] = res[i].County;
        j++;
      } else {
      }
    }
    // 抓取所有縣市，存到城市陣列
    vm.County.sort();
  }
});

$(function time() {
  var hrs = new Date().getHours();
  var min = new Date().getMinutes();
  var sec = new Date().getSeconds();

  if (hrs == 0) {
    hrs += 12;
  }
  if (hrs < 10) {
    hrs = "0" + hrs;
  }
  if (min < 10) {
    min = "0" + min;
  }
  if (sec < 10) {
    sec = "0" + sec;
  }
  $(".nowtime").text(hrs + ":" + min + ":" + sec);
  // setInterval(time, 1000)
});

$(function Today() {
  var yer = new Date().getFullYear();
  var mom = new Date().getMonth() + 1; // 0-11
  var date = new Date().getDate();
  var day = new Date().getDay();
  var dayArray = ["日", "一", "二", "三", "四", "五", "六"];
  $(".Today").text(yer + " 年 " + mom + " 月 " + date + " 日 ");
});

// $(window).scroll(function(){
//   console.log($("h1").scrollTop())
//   if($("body").scrollTop()==0){
//     $(".filter .bgc_img").addClass("FilterBlur")
//   }else{
//     $(".filter .bgc_img").removeClass("FilterBlur")
//   }
// })

// 取得地理資訊
function GetLocation() {
  var ShowLocation = document.getElementById("NowLocation");

  function success(position) {
    var latitude = position.coords.latitude;
    var longitude = position.coords.longitude;

    // console.log(latitude ,longitude)

    ShowLocation.innerHTML =
      "<p class='location'><i class='fas fa-map-marker-alt'></i>你目前在：<b>緯度（Latitude）</b>：" +
      latitude.toFixed(6) +
      "　<b>經度（Longitude）</b>：" +
      longitude.toFixed(6) +
      "</p>";
  }

  function error() {
    ShowLocation.innerHTML = "Error！無法取得您的定位資訊";
  }

  ShowLocation.innerHTML = "Locating…";

  navigator.geolocation.getCurrentPosition(success, error);
}

function Width(){
  $("h4").text(document.body.clientWidth)
}

window.onload = GetLocation();
window.onload = Width();
// window.onload($(".filter .bgc_img").addClass("FilterBlur"))