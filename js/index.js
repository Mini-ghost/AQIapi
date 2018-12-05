var AqiApi = "https://json2jsonp.com/?url=http://opendata2.epa.gov.tw/AQI.json&callback=cbfunc";
// var AqiApi = "http://opendata2.epa.gov.tw/AQI.json";

var aqiMax = {
  "PM2.5": 350.4,
  PM10: 504,
  SO2: 804,
  CO: 40.4,
  O3: 504,
  NO2: 1649
};

var aqiRange = {
  Good: 51,
  Moderate: 101,
  UnhealthyForSensitiveGroups: 151,
  Unhealthy: 201,
  VeryUnhealthy: 300,
  Hazardous: 500
}

var AqiData = {
  OpenData: [],
  County: [],
  CountyRadio: [],
  position: [],
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
});

GetLocation()

$.ajax({
  url: AqiApi,
  method: "get",
  dataType: "jsonp",
  // cache: false,
  success: function(res) {
    // 陣列順序調整
    vm.OpenData = res
    vm.OpenData.map((obj)=>{
      
      var x, y, distance
      x = vm.position[0] - obj.Longitude
      y = vm.position[1] - obj.Latitude
      distance = Math.sqrt(Math.pow(x,2) + Math.pow(y,2))
      obj.nearest = distance
      
      if(obj.AQI < aqiRange.Good){obj.aqiClass = "Good"}
      else if(obj.AQI < aqiRange.Moderate){obj.aqiClass = "Moderate"}
      else if(obj.AQI < aqiRange.Unhealthy){obj.aqiClass = "Unhealthy"}
      else if(obj.AQI < aqiRange.UnhealthyForSensitiveGroups){obj.aqiClass = "UnhealthyForSensitiveGroups"}
      else if(obj.AQI < aqiRange.VeryUnhealthy){obj.aqiClass = "VeryUnhealthy"}
      else {obj.aqiClass = "Hazardous"}
      
    })
    
    vm.OpenData.sort(function(a, b){return a.nearest - b.nearest;})
    
    // 抓取所有縣市，存到城市陣列
    vm.OpenData.forEach((obj)=>{
      if(vm.County.indexOf(obj.County) == -1){
        vm.County.push(obj.County)
      }
    })
    
    vm.CountyRadio = res;
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

// 取得地理資訊
function GetLocation() {
  var ShowLocation = document.getElementById("NowLocation");

  function success(position) {
    var latitude = position.coords.latitude;
    var longitude = position.coords.longitude;
    
    vm.position = [longitude,latitude]


    ShowLocation.innerHTML =
      "<p class='location'><i class='fas fa-map-marker-alt'></i>你目前<b>緯度</b>：" +
      latitude.toFixed(6) +
      "　<b>經度</b>：" +
      longitude.toFixed(6) +
      "</p>";
  }

  function error() {
    ShowLocation.innerHTML = "Error！無法取得您的定位資訊";
  }

  ShowLocation.innerHTML = "Locating…";

  navigator.geolocation.getCurrentPosition(success, error);
}