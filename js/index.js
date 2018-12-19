"use strict";

var AqiApi = "https://json2jsonp.com/?url=http://opendata2.epa.gov.tw/AQI.json&callback=cbfunc"; // var AqiApi = "http://opendata2.epa.gov.tw/AQI.json";

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
};
var AqiData = {
  OpenData: [],
  County: [],
  CountyRadio: [],
  position: [],
  filter: "全臺灣",
  pageMaxData: 6,
  pageNum: 1
};
var vm = new Vue({
  el: "#AQI",
  data: AqiData,
  methods: {
    ClickCountyRadio: function ClickCountyRadio(res) {
      this.filter = res;
      this.pageNum = 1;
      goTop();
    },
    pageSelect: function pageSelect(res) {
      this.pageNum = res;
      goTop();
    }
  },
  computed: {
    FilterData: function FilterData() {
      var _this = this;

      var filterData;
      filterData = this.OpenData;

      if (this.filter != '全臺灣') {
        filterData = this.OpenData.filter(function (obj) {
          return obj.County == _this.filter;
        });
      }

      return filterData;
    },
    pageMaxData: function pageMaxData() {
      return this.pageMaxData;
    },
    pageNum: function pageNum() {
      return this.pageNum;
    }
  }
});
GetLocation();
$.ajax({
  url: AqiApi,
  method: "get",
  dataType: "jsonp",
  // cache: false,
  success: function success(res) {
    // 陣列順序調整
    vm.OpenData = res;
    vm.OpenData.map(function (obj) {
      var x, y, distance;
      x = vm.position[0] - obj.Longitude;
      y = vm.position[1] - obj.Latitude;
      distance = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
      obj.nearest = distance;

      if (obj.AQI < aqiRange.Good) {
        obj.aqiClass = "Good";
      } else if (obj.AQI < aqiRange.Moderate) {
        obj.aqiClass = "Moderate";
      } else if (obj.AQI < aqiRange.Unhealthy) {
        obj.aqiClass = "Unhealthy";
      } else if (obj.AQI < aqiRange.UnhealthyForSensitiveGroups) {
        obj.aqiClass = "UnhealthyForSensitiveGroups";
      } else if (obj.AQI < aqiRange.VeryUnhealthy) {
        obj.aqiClass = "VeryUnhealthy";
      } else {
        obj.aqiClass = "Hazardous";
      }
    });
    vm.OpenData.sort(function (a, b) {
      return a.nearest - b.nearest;
    }); // 抓取所有縣市，存到城市陣列

    vm.OpenData.forEach(function (obj) {
      if (vm.County.indexOf(obj.County) == -1) {
        vm.County.push(obj.County);
      }
    });
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

  $(".nowtime").text(hrs + ":" + min + ":" + sec); // setInterval(time, 1000)
});
$(function Today() {
  var yer = new Date().getFullYear();
  var mom = new Date().getMonth() + 1; // 0-11

  var date = new Date().getDate();
  var day = new Date().getDay();
  var dayArray = ["日", "一", "二", "三", "四", "五", "六"];
  $(".Today").text(yer + " 年 " + mom + " 月 " + date + " 日 ");
});

function goTop() {
  $("html,body").animate({
    scrollTop: $(".AQIBox").offset().top - 20
  }, 600);
} // 取得地理資訊


function GetLocation() {
  function success(position) {
    var latitude = position.coords.latitude;
    var longitude = position.coords.longitude;
    vm.position = [longitude, latitude];
  }

  function error() {}

  navigator.geolocation.getCurrentPosition(success, error);
}