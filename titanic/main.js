
var settings = {
  screen: {
    w: 1600,
    h: 800
  },
  chart: {
    w: 1400,
    h: 600,
    padding: {
      left: 100,
      bottom: 100
    }
  },
  margin: {
    top: 50,
    bottom: 50,
    left: 50,
    right: 50
  }
}

// Import data into objects
var dataset = d3.csv.parse(titanicCSV, function(d){
  return {
    survived: !!+d.Survived,
    pClass: +d.Pclass,
    sex: d.Sex,
    age: +d.Age
  }
});
dataset = dataset.filter(function(d){
  return d.age > 0;
});

// Group data
var nest = d3.nest()
  .key(function(d){ return 10*Math.ceil(d.age/10); })
  .sortKeys(d3.ascending)
  .key(function(d){ return d.pClass; })
  .sortKeys(d3.ascending)
  .rollup(function(d){
    return [
      {
        label: 'survivedM',
        value: d.filter(function(d){
          return d.survived && d.sex === 'male';
        }).length
      },
      {
        label: 'deceasedM',
        value: d.filter(function(d){
          return !d.survived && d.sex === 'male';
        }).length
      },
      {
        label: 'survivedF',
        value: d.filter(function(d){
          return d.survived && d.sex === 'female';
        }).length
      },
      {
        label: 'deceasedF',
        value: d.filter(function(d){
          return !d.survived && d.sex === 'female';
        }).length
      },
    ];
  })
  .entries(dataset);

var spacingHor = d3.scale.ordinal()
  .domain(d3.range(8))
  .rangePoints([0, settings.chart.w], 1);

var spacingVert = d3.scale.ordinal()
  .domain(d3.range(3))
  .rangePoints([0, settings.chart.h], 1);

var color = d3.scale.category20();

var svg = d3.select('body').append('svg')
  .attr('width', settings.screen.w)
  .attr('height', settings.screen.h);

// Draw axes
var xAxisScale = d3.scale.linear()
  .domain([0, 80])
  .range([0, settings.chart.w]);

var xAxis = d3.svg.axis()
  .scale(xAxisScale);

var xAxisGroup = svg.append("g")
  .attr('class', 'axis')
  .attr('transform', 'translate('+(settings.margin.left+settings.chart.padding.left)+','+(settings.margin.top+settings.chart.h)+')')
  .call(xAxis);

var yAxisScale = d3.scale.linear()
  .domain([0.5, 3.5])
  .range([0, settings.chart.h], 1);

var yAxis = d3.svg.axis()
  .orient('left')
  .tickFormat(d3.format('.0f'))
  .tickValues([3,2,1])
  .scale(yAxisScale);

var yAxisGroup = svg.append('g')
  .attr('transform', 'translate('+(settings.margin.left+settings.chart.padding.left)+','+settings.margin.top+')')
  .attr('class', 'axis')
  .call(yAxis);

// Label Axes
svg.append('text')
  .attr('transform', 'translate('+(settings.margin.left+settings.chart.padding.left+settings.chart.w/2)+','+(settings.chart.h+settings.margin.top+settings.chart.padding.bottom/2)+')')
  .style('text-anchor', 'middle')
  .attr('class', 'axis-title')
  .text('Age');

svg.append('text')
  .attr('transform', 'rotate(-90)')
  .attr('y', settings.margin.left + settings.chart.padding.left/2)
  .attr('x',-(settings.margin.top + settings.chart.h/2))
  .attr('dy', '1em')
  .style('text-anchor', 'middle')
  .attr('class', 'axis-title')
  .text('Class');

// Input title
svg.append('text')
  .attr('transform', 'translate('+(settings.margin.left+settings.chart.w/2)+','+settings.margin.top+')')
  .style('text-anchor', 'middle')
  .attr('class', 'chart-title')
  .text('Titanic Fatalities');

// Draw Legend
var legend = svg.append("g")
  .attr("class", "legend")
  .attr("x", settings.chart.w - 15)
  .attr("y", settings.margin.top + settings.chart.h - 150)
  .attr("height", 100)
  .attr("width", 100);

legend.selectAll('g').data(['Male Survivor', 'Male Fatality', 'Female Survivor', 'Female Fatality'])
  .enter()
  .append('g')
  .each(function(d, i) {
    var g = d3.select(this);
    g.append("rect")
      .attr("x", settings.chart.w - 15)
      .attr("y", settings.margin.top + settings.chart.h - 150 + i*25)
      .attr("width", 10)
      .attr("height", 10)
      .style("fill", color(i));
    
    g.append("text")
      .attr("x", settings.chart.w - 0)
      .attr("y", settings.margin.top + settings.chart.h - 150 + i * 25 + 8)
      .attr("height",30)
      .attr("width",100)
      .style("fill", color(i))
      .text(d);

  });

// Draw pie charts
var pieCharts = svg.append('svg:g')
  .attr('transform', 'translate('+(settings.margin.left+settings.chart.padding.left)+','+settings.margin.top+')')
nest.forEach(function(ageRange, i){
  ageRange.values.forEach(function(classRange, j){
    var data = classRange.values;
    var vis = pieCharts.append('svg:g').data([data])
      .attr('transform', 'translate(' + spacingHor(i) + ',' + spacingVert(j) + ')');

    var pie = d3.layout.pie()
      .value(function(d){ return d.value; });

    var r = 7*Math.sqrt(data.reduce(function(a, b) {
      return a + b.value;
    }, 0));
    var arc = d3.svg.arc().outerRadius(r);

    var arcs = vis.selectAll('g.slice').data(pie).enter()
      .append('svg:g').attr('class', 'slice');

    arcs.append('svg:path')
      .attr('fill', function(d, i){
        return color(i);
      })
      .attr('d', function(d) {
        return arc(d);
      });
  });
})

for (var i = 0; i < nest.length; i++) {
  nest[i]
};