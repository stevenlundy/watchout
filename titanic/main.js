
var settings = {
  w: 1600,
  h: 800,
  yAxis: 200,
  xAxis: 200,
  margin: 50
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
  .rangePoints([settings.margin + settings.yAxis, settings.w - settings.margin], 1);

var spacingVert = d3.scale.ordinal()
  .domain(d3.range(3))
  .rangePoints([settings.margin, settings.h-settings.xAxis-settings.margin], 1);

var color = d3.scale.category20();

var svg = d3.select('body').append('svg')
  .attr('width', settings.w)
  .attr('height', settings.h);

// Draw axes
var xAxisScale = d3.scale.linear()
  .domain([0, 80])
  .range([settings.margin + settings.yAxis, settings.w - settings.margin]);

var xAxis = d3.svg.axis()
  .scale(xAxisScale);

var xAxisGroup = svg.append("g")
  .attr('class', 'axis')
  .call(xAxis);

var yAxisScale = d3.scale.linear()
  .domain([1, 3])
  .range([settings.margin, settings.h-settings.xAxis-settings.margin], 1);

var yAxis = d3.svg.axis()
  .orient('left')
  .tickFormat(d3.format(".0f"))
  .tickValues([3,2,1])
  .scale(yAxisScale);

var yAxisGroup = svg.append("g")
  .attr('transform', 'translate(200,0)')
  .attr('class', 'axis')
  .call(yAxis);

// Draw pie charts
nest.forEach(function(ageRange, i){
  ageRange.values.forEach(function(classRange, j){
    var data = classRange.values;
    var vis = svg.append('svg:g').data([data])
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