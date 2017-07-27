// axios.get('../data/route.json').then(data => {
//   const topLeft = data.coordinate.topLeft;
//   const downLeft = data.coordinate.downLeft;
//   const downRight = data.coordinate.downRight;
//   const topRight = data.coordinate.topRight;
//   const xRatio = (topRight[0] - topLeft[0]) / 1600;
//   const yRatio = (topLeft[1] - downLeft[1]) / 900;
//   const draw = SVG('main-svg');
//   // const polyline = draw.circle(20).fill('#000').move((data.points[0][0] - topLeft[0]) / xRatio, 900 - (data.points[0][1] - downLeft[1]) / yRatio);
// });

Vue.prototype.$http = axios;

const DAY_OF_MONTH = {
  1: 31,
  2: 28,
  3: 31,
  4: 30,
  5: 31,
  6: 30,
  7: 31,
  8: 31,
  9: 30,
  10: 31,
  11: 30,
  12: 31
};

const TYPHOON_INFO_API = 'http://140.134.26.64:1234/wmega/webapi/typh/getTyphoonInfo';
const CORNER_COORDS = {
  topLeft: [101.074, 43.97638],
  downLeft: [101.074, 8.5433],
  downRight: [167.1901, 8.5433],
  topRight: [167.1901, 43.97638]
};

const X_RATIO = (CORNER_COORDS.topRight[0] - CORNER_COORDS.topLeft[0]) / 1600;
const Y_RATIO = (CORNER_COORDS.topLeft[1] - CORNER_COORDS.downLeft[1]) / 900;

const calcLength = target => {
  let totalLength = 0;
  let prevPos;

  if (target.getTotalLength) {
    return target.getTotalLength();
  }

  for (let i = 0 ; i < target.points.numberOfItems; i++) {
    const pos = target.points.getItem(i);
    if (i > 0) {
      totalLength += Math.sqrt(Math.pow((pos.x - prevPos.x), 2) + Math.pow((pos.y - prevPos.y), 2));
    }
    prevPos = pos;
  }
  return totalLength;
}
const typhoonLevel = [
  {
    text: '',
    class: ''
  },
  {
    text: '輕度颱風',
    class: 'low'
  },
  {
    text: '中度颱風',
    class: 'mid'
  },
  {
    text: '強度颱風',
    class: 'high'
  }
];
const impactLevel = [
  {
    text: '無',
    class: ''
  },
  {
    text: '低',
    class: 'low'
  },
  {
    text: '中',
    class: 'mid'
  },
  {
    text: '高',
    class: 'high'
  }
]
const app = new Vue({
  el: '.app',
  data: {
    typhoonInfo: {
      chineseName: '颱風',
      englishName: 'typhoon',
      gust: '65m/s（17級風）',
      impactLevel: 0,
      typhoonLevel: 0,
      level7Radius: '180km',
      level10Radius: '--km',
      windDirection: '東北，20km/hr',
      maxWind: '45m/s（13級風）',
      number: 13,
      pressure: '942hPa',
      updateTime: '2017-07-15 15:00'
    },
    routes: {
      cwb: '中央氣象局',
      cma: '中國氣象局',
      hko: '香港天文台',
      jma: '日本氣象廳',
      jtwc: '美軍聯合颱風警報中心',
      kma: '大韓民國氣象廳'
    },
    routeSelector: {
      all: false,
      disableAll: false,
      avg: true,
      cwb: true,
      cma: true,
      hko: true,
      jma: true,
      jtwc: true,
      kma: true
    },
    animationSequence: [],
    typhoonEye: { x: 0, y: 0 },
    fcstRoutesDays: []
  },
  computed: {
    updateTimeText() {
      const releaseDate = new Date(this.typhoonInfo.updateTime);

      const formatedYear = this.fillTimeText(releaseDate.getFullYear());
      const formatedMonth = this.fillTimeText(releaseDate.getMonth() + 1);
      const formatedDay = this.fillTimeText(releaseDate.getDate());
      const formatedHour = this.fillTimeText(releaseDate.getHours());
      const formatMinuts = this.fillTimeText(releaseDate.getMinutes());

      return `${formatedYear}.${formatedMonth}.${formatedDay}
        ${formatedHour}:${formatMinuts}`;
    }
  },
  methods: {
    typhoonLevelText: level => {
      return typhoonLevel[level].text;
    },
    typhoonLevelClass: level => {
      return typhoonLevel[level].class;
    },
    impactLevelText: level => {
      return impactLevel[level].text;
    },
    impactLevelClass: level => {
      return impactLevel[level].class;
    },
    selectAllRoute: function () {
      for (let key in this.routeSelector) {
        this.routeSelector[key] = true;
      }
    },
    disableAllRoute: function () {
      for (let key in this.routeSelector) {
        this.routeSelector[key] = false;
      }
    },
    fillTimeText: time => (String(time).length === 1 ? `0${time}` : String(time)),
    addTyphoonAnimation() {
      $('.eye circle').each((_, eye) => {
        const $this = $(eye);

        $this.data('original-r', $this.attr('r')).attr('r', 0);
        this.animationSequence.push({
          e: $this,
          p: {'r': $this.data('original-r')},
          o: {duration: 300, easing: 'easeOutCubic'}
        });
      });

      $('.day').each((_, day) => {
        const $path = $(day).find('.route path');
        const $info = $(day).find('.info, .point');

        $path.each((_, route) => {
          const $route = $(route)[0];

          $.Velocity($route, {
            'stroke-dasharray': calcLength(route),
            'stroke-dashoffset': calcLength(route)
          }, 0);
        });

        this.animationSequence.push({
          e: $path,
          p: 'fadeIn',
          o: {duration: 100}
        });
        this.animationSequence.push({
          e: $path,
          p: {'stroke-dashoffset': 0},
          o: {duration: 800, easing: 'easeOutCubic'}
        });
        this.animationSequence.push({
          e: $info,
          p: 'fadeIn',
          o: {duration: 300}
        });
      });
    },
    addUiAnimation() {
      this.animationSequence.push({
        e: $('.city g, .grid-line'),
        p: 'fadeIn',
        o: {duration: 800}
      });
      this.animationSequence.push({
        e: $('.info-box, .route-selector'),
        p: 'fadeIn',
        o: {duration: 300}
      });
    },
    coords2SvgPosition: coords => {
      return [(coords[0] - CORNER_COORDS.topLeft[0]) / X_RATIO,
        900 - ((coords[1] - CORNER_COORDS.downLeft[1]) / Y_RATIO)];
    },
  },
  created() {
    const vm = this;
    this.$http.get(TYPHOON_INFO_API)
      .then((typhoonJson) => {
        console.log('API GET');

        // Setting main typhoon temp temporarily
        const targetTyphoon = _.filter(typhoonJson.data.typhs, typh =>
          typh.chineseName === '尼莎')[0];

        _.map(vm.typhoonInfo, (_, key) => {
          vm.typhoonInfo[key] = targetTyphoon[key];
        });

        // setting typhoon's eye
        // TODO: multiple typhoons' eye
        const cwbOriPoint =
           _.filter(targetTyphoon.fcstRoutes, route => route.org === 'CWB')[0].points[0];
        const typhoonEyePosition = this.coords2SvgPosition([cwbOriPoint.lng, cwbOriPoint.lat]);
        vm.typhoonEye.x = typhoonEyePosition[0];
        vm.typhoonEye.y = typhoonEyePosition[1];

        // format typhoon's routes
        // TODO: multiple typhoons' routes
        // fcstRoutesDays: [ {dateOfMonth, routes:[{org, cx, cy, d}]} ]
        const orgRoutes = targetTyphoon.fcstRoutes;
        const displayRoutes = _.filter(orgRoutes, orgRoute => orgRoute.points.length > 3);

        // format api data
        _.forEach(displayRoutes, (routes) => {
          _.forEach(routes.points, (route) => {
            const pointPosition = this.coords2SvgPosition([route.lng, route.lat]);
            const routeInfo = {
              org: routes.org.toLowerCase(),
              cx: pointPosition[0],
              cy: pointPosition[1],
              // d for later
            };
            const targetRoute = _.find(this.fcstRoutesDays, { dateOfMonth: route.dateOfMonth });
            if (targetRoute === undefined) {
              this.fcstRoutesDays.push({
                dateOfMonth: route.dateOfMonth,
                routes: [routeInfo]
              });
            } else {
              targetRoute.routes.push(routeInfo);
            }
          });
        });

        // fiil d to fcstRoutesDays
        // const lastTempPositions = {};
        _.forEach(this.fcstRoutesDays, (routesOfDate) => {
          _.forEach(routesOfDate.routes, (route) => {
            const routeInfo = route;
            let lastRoutes;
            if (routesOfDate.dateOfMonth === 1) {
              const monthOfToday = new Date().getMonth();
              lastRoutes = _.find(this.fcstRoutesDays, routes =>
                routes.dateOfMonth === DAY_OF_MONTH[monthOfToday + 1]);
            } else {
              lastRoutes = _.find(this.fcstRoutesDays, routes =>
                routes.dateOfMonth === routesOfDate.dateOfMonth - 1);
            }
            if (lastRoutes !== undefined) {
              const lastOrgRoutes = _.find(lastRoutes.routes, lastRoute =>
                lastRoute.org === route.org);
              if (lastOrgRoutes === undefined) {
                routeInfo.d =
                  `M${typhoonEyePosition[0]} ${typhoonEyePosition[1]} L${routeInfo.cx} ${routeInfo.cy}`;
              } else {
                const lastCx = lastOrgRoutes.cx;
                const lastCy = lastOrgRoutes.cy;
                routeInfo.d = `M${lastCx} ${lastCy} L${routeInfo.cx} ${routeInfo.cy}`;
              }
            }
          });
        });

        // setting animations
        this.addTyphoonAnimation();
        this.addUiAnimation();
        setTimeout(() => {
          $.Velocity.RunSequence(this.animationSequence)
        }, 500);
      })
      .catch((error) => {
        console.log(error);
      });
  },
  mounted () {
    // initialize
    $('.draggable').draggabilly();
  }
})
