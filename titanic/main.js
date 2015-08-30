
var settings = {
  w: 1600,
  h: 800
}


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

var nest = d3.nest()
  .key(function(d){ return 10*Math.ceil(d.age/10); })
  .sortKeys(d3.ascending)
  .key(function(d){ return d.pClass; })
  .sortKeys(d3.ascending)
  .rollup(function(d){
    return [
      {
        label: 'survived',
        value: d.filter(function(d){
          return d.survived;
        }).length
      },
      {
        label: 'deceased',
        value: d.filter(function(d){
          return !d.survived;
        }).length
      }
    ];
  })
  .entries(dataset);

var spacingHor = d3.scale.ordinal()
  .domain(d3.range(8))
  .rangePoints([0, settings.w], 1);

var spacingVert = d3.scale.ordinal()
  .domain(d3.range(3))
  .rangePoints([0, settings.h], 1);

var color = d3.scale.category10();

var svg = d3.select('body').append('svg')
  .attr('width', settings.w)
  .attr('height', settings.h);

nest.forEach(function(ageRange, i){
  ageRange.values.forEach(function(classRange, j){
    var data = classRange.values;
    var vis = svg.append('svg:g').data([data])
      .attr('transform', 'translate(' + spacingHor(i) + ',' + spacingVert(j) + ')');

    var pie = d3.layout.pie()
      .value(function(d){ return d.value; });

    var r = 9*Math.sqrt(data[0].value + data[1].value);
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