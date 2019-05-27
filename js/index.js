
; (function () {

    Vue.component('quality', {
        template: '#quality',
        props: ['airData']


    })

  
    var vm = new Vue({
        el: '#app',
        data() {
            return {
                county: new Array,
                ajaxData: null,
                selectCounty: '臺中市',
                selectClass: 'taiwan-county--active',
                ready: false,
                navType: false,
                bodyType: false,
                windowType: true,
                loadingTime: null,
            }

        },
        mounted() {
            var googleApp = 'https://script.google.com/macros/s/AKfycbxe3Ba-MiNT5T_mHhW-mf5IixAk2xScNjX74766jThzC3sMAc0/exec?url=',
                airApi = `${googleApp}http://opendata2.epa.gov.tw/AQI.json`
            var svg = d3.select('.taiwan-content').append('svg').attr('class', 'taiwan-svg').attr('viewBox', '0 0 650 650')

            d3.json('database/taiwan.json', this.drowSVGHandler);
            
            $.ajax({
                url: airApi,
                method: 'get',
                success: this.ajaxSuccessHandler
            })

            window.addEventListener('resize', this.resizeHandler)
            this.resizeHandler()
        },
        methods: {
            // 空氣品質 API 載入
            ajaxSuccessHandler(res) {
                this.ajaxData = res.map(obj => ({
                    County: obj['County'],
                    SiteName: obj['SiteName'],
                    AQI: obj['AQI'],
                    AQIStatus: this.statusHandler(obj['AQI']),
                    Index: [
                        { name: '細懸浮微粒', key: 'PM25', chemical: 'PM2.5', unit: 'μg/m³', value: obj['PM2.5'], max: 350.4},
                        { name: '懸浮微粒', key: 'PM10', chemical: 'PM10', unit: 'μg/m³', value: obj['PM10'], max: 504},
                        { name: '二氧化硫', key: 'SO2', chemical: 'SO<sub>2</sub>', unit: 'ppb', value: obj['SO2'], max: 804},
                        { name: '一氧化碳', key: 'CO', chemical: 'CO', unit: 'ppm', value: obj['CO'], max: 40.4},
                        { name: '臭氧', key: 'O3', chemical: 'O<sub>3</sub>', unit: 'ppb', value: obj['O3'], max: 504},
                        { name: '二氧化氮', key: 'NO2', chemical: 'NO<sub>2</sub>', unit: 'ppb', value: obj['NO2'], max: 1649}
                    ],
                }))
                this.loadingTime = new Date
                this.ready = true
            },
            statusHandler(data) {
                var status = new Object
                if (!data) {
                    status = { text: '設備維護', class: '--null' }
                    return status
                }
                if (data <= 50) status = { text: '良好', class: '--good' } 
                else if (data > 50 && data <= 100) status = { text: '普通', class: '--moderate' }
                else if (data > 100 && data <= 150) status = { text: '對敏感族群不健康', class: '--unhealthyForSensitiveGroups' }
                else if (data > 150 && data <= 200) status = { text: '對所有族群不健康', class: '--unhealthy' }
                else if (data > 200 && data <= 300) status = { text: '非常不健康', class: '--veryUnhealthy' }
                else  status = { text: '危害', class: '--hazardous' }
                return status
            },
            // 台灣地圖繪製
            drowSVGHandler(data) {
                var features = topojson.feature(data, data.objects['County_MOI_1060525']).features,
                    path = d3.geo.path().projection(d3.geo.mercator().center([121, 24]).scale(9000)),

                    // 繪製 svg
                    svhPath = d3.select('svg')
                        .selectAll('path')
                        .data(features)
                        .enter()
                        .append('path')
                        .attr('class', 'taiwan-county')    
                        .attr('data-county', features.properties)
                        .attr('d', path);
                
                // 傳一份資料到 Vue 裡面
                features.forEach(obj => { this.county.push(obj.properties) });

                // 每個路徑給名子
                svhPath[0].forEach((obj, i) => {
                    var arrayItem =  this.county[i]
                    obj.dataset.countyCh = arrayItem.COUNTYNAME
                    obj.dataset.countyEn = arrayItem.COUNTYENG 
                    if(arrayItem.COUNTYNAME === this.selectCounty) obj.classList.add(this.selectClass)
                })
            },
            // 地圖點選
            countyClickHandler(e) {
                var target = e.target
                if (target.nodeName === 'path') {
                    var vmThis = this,
                        data = target.dataset.countyCh,  
                        $group = $('.quality-group')
                    var targetSiblings = Array.prototype.filter.call(target.parentNode.children, (child) => {
                        return child !== target
                    })
                    targetSiblings.forEach(obj => {
                        if (obj.classList.contains(this.selectClass)) {
                            obj.classList.remove(this.selectClass)
                            return
                        }
                    })
                    target.classList.add(this.selectClass)
                    this.changeSelectHandler(data)
                }
            },
            radioClickHandler(data) {
                var prevSelect, nextSelect
                if (this.selectCounty === data) return
                prevSelect = document.querySelector(`.taiwan-county[class*=${this.selectClass}]`)
                nextSelect = document.querySelector(`.taiwan-county[data-county-ch="${data}"]`)

                prevSelect.classList.remove(this.selectClass)
                nextSelect.classList.add(this.selectClass)

                this.changeSelectHandler(data)
                
            },
            changeSelectHandler(data) {
                var $group = $('.quality-group'),
                    vmThis = this

                $('html, body').stop().animate({ scrollTop: 0 }, 500, function () {
                    if (this.tagName === 'BODY') {
                        $group.fadeOut(400, () => {
                            vmThis.selectCounty = data
                            $group.fadeIn(400)
                        })
                    }
                })
            },
            // 固定 body
            bodyLockHandler() {
                var body = document.body;
                var html = document.documentElement;
                var distance = -(html.scrollTop + body.scrollTop)
                var bodyTop = bodyTop = Math.abs(parseFloat(body.style.top))
                if (this.bodyType) {
                    this.bodyType = false
                    body.removeAttribute('style')
                    html.scrollTop = body.scrollTop = bodyTop
                    return
                }
                this.bodyType = true
                body.style.width =  `calc(100% - ${this.scrollBarWidth}px)`
                body.style.top = distance + 'px'
                body.style.position = 'fixed'
            },
            navOpenHandler() {
                this.bodyLockHandler()
                this.navType = this.bodyType
            },
            resizeHandler() {
                if (window.innerWidth >= 767.98) {
                    this.windowType = true
                    if (this.bodyType) { this.bodyLockHandler() }
                    return
                }
                if (this.navType && !this.bodyType) { this.bodyLockHandler() }
                this.windowType = false
            }
        },
        computed: {
            filterData() {
                if (!this.ready) return

                var select, filterArray = new Array
                filterArray = this.ajaxData
                select = this.selectCounty

                if (select) filterArray = filterArray.filter(obj => { return obj.County === select })
                return filterArray
            },
            scrollBarWidth() {
                return window.innerWidth - document.documentElement.clientWidth;
            }
        }
    })

})()
