axios.get('../data/route.json').then(data => {
  const topLeft = data.coordinate.topLeft;
  const downLeft = data.coordinate.downLeft;
  const downRight = data.coordinate.downRight;
  const topRight = data.coordinate.topRight;
  const xRatio = (topRight[0] - topLeft[0]) / 1600;
  const yRatio = (topLeft[1] - downLeft[1]) / 900;
  const draw = SVG('main-svg');
  // const polyline = draw.circle(20).fill('#000').move((data.points[0][0] - topLeft[0]) / xRatio, 900 - (data.points[0][1] - downLeft[1]) / yRatio);
});

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
      hk: '香港天文台',
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
      hk: true,
      jma: true,
      jtwc: true,
      kma: true
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
    clickRoute: function (route) {
      this.routeSelector[route] = !this.routeSelector[route];
    }
  },
  mounted () {
    // initialize
    $('.draggable').draggabilly();
  }
})

// $('.draggable').draggabilly();

$('.navbar').sticky({
  topSpacing: 0,
  zIndex: 10
});

const animationSequence = [];

animationSequence.push({
  e: $('.city g, .grid-line'),
  p: 'fadeIn',
  o: {duration: 800}
});

$('.eye circle').each(() => {
  const $this = $(this);

  $this.data('original-r', $this.attr('r')).attr('r', 0);
  animationSequence.push({
    e: $this,
    p: {'r': $this.data('original-r')},
    o: {duration: 300, easing: 'easeOutCubic'}
  });
});

$('.day').each(() => {
  const $day = $(this);
  const $path = $day.find('.route path');
  const $info = $day.find('.info, .point');

  $path.each(() => {
    const $route = $(this);
    const route = $route[0];

    $.Velocity(route, {
      'stroke-dasharray': calcLength(route),
      'stroke-dashoffset': calcLength(route)
    }, 0);
  });

  animationSequence.push({
    e: $path,
    p: 'fadeIn',
    o: {duration: 0}
  });
  animationSequence.push({
    e: $path,
    p: {'stroke-dashoffset': 0},
    o: {duration: 800, easing: 'easeOutCubic'}
  });
  animationSequence.push({
    e: $info,
    p: 'fadeIn',
    o: {duration: 300}
  });
});
animationSequence.push({
  e: $('.info-box, .route-selector'),
  p: 'fadeIn',
  o: {duration: 300}
});

setTimeout(() => {
  $.Velocity.RunSequence(animationSequence);
}, 500);

$('.btn-route').on('click', () => {
  const $this = $(this);
  const routes = [];

  if (['all', 'none'].indexOf($this.data('route')) > -1) {
    if ($this.data('route') === 'all') {
      $('.btn-route').addClass('active');
      $('.tw, .cn, .hk, .jp, .kr, .usa').show();
    }
    if ($this.data('route') === 'none') {
      $('.btn-route').removeClass('active');
      $('.tw, .cn, .hk, .jp, .kr, .usa').hide();
    }
    return;
  }

  $this.toggleClass('active');
  $('.btn-route.active').each(() => {
    routes.push('.' + $(this).data('route'));
  });
  $('.tw, .cn, .hk, .jp, .kr, .usa, .avg').hide();
  $(routes.join(',')).show();
});

$('.btn-toggle').on('click', () => {
  const info = '.' + $(this).data('toggle');

  $(info).toggle();
});