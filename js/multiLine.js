var svgWidth = 960, svgHeight = 500
var margin = {
  top: svgHeight*0.2, right: svgWidth*0.1, bottom: svgHeight*0.25, left: svgWidth*0.1
}
, width = svgWidth - margin.left - margin.right
, height = svgHeight - margin.top - margin.bottom;

var xScale = d3.time.scale()
  .range([0, width]);

var yScale = d3.scale.linear()
  .range([height, 0]);

var gridScale = d3.scale.linear()
  .range([height, 0]);

var xAxis = d3.svg.axis()
  .scale(xScale)
  .orient("bottom")
  .tickFormat(d3.time.format("%a"))
  .ticks(5)
  .tickSize(0)
  .outerTickSize(5)

var yAxis = d3.svg.axis()
  .scale(yScale)
  .orient("left")
  .tickFormat(d3.format("d"))
  .ticks(5)
  .tickSize(0)
  .outerTickSize(5)

var line = d3.svg.line()
  .x(function(d) { return xScale(d.key); })
  .y(function(d) { return yScale(d.value); });

var y_grid = function () {
  return d3.svg.axis()
  .scale(gridScale)
  .orient("left")
  .ticks(5)
}

var tip = d3.tip()
  .attr('class', 'd3-tip')
  .html(function(d) { return d.value+" posts"; })
  .direction('nw')
  .offset([0, 3])

var parseDate = d3.time.format("%Y-%m-%d").parse
, color = d3.scale.category10()
, color2 = d3.scale.category10();

var svgContainer = d3.select("body").append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top*0.15 + ")")
  .attr("class", 'container-g');

d3.json("data/multiLine.json", function(error, data) {
  var tempData=d3.entries(data);

  var dataset=[];

  tempData.forEach(function(d){
    var obj={};
    var tempValues = d3.entries(d.value)
      tempValues.forEach(function(d) {
      d.key=parseDate(d.key)
      d.value = + d.value;
    });
    tempValues.sort(function(a,b){ return d3.ascending(a.key, b.key);});
    obj['name']=d.key;
    obj['values']=tempValues;
    dataset.push(obj)
  })

  var yMax = d3.max(dataset, function (d) { return d3.max(d.values, function(d) { return d.value; }); })

  xScale.domain(d3.extent(dataset[0].values, function(d) { return d.key }));
  yScale.domain([0, yMax*1.2]);

  svgContainer.append("g")
      .attr("class", "grid")
      .call(y_grid().tickSize(-width, 0, 0).tickFormat(""));

  var x_axis = svgContainer.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height*1.1 + ")")
    .call(xAxis);

  x_axis.selectAll("text")
    .attr("x", -width*0.02)
    .attr("y", height*0.15)
    .attr("transform", "rotate(330)");

  var y_axis = svgContainer.append("g")
    .attr("class", "y axis")
    .attr("transform", "translate(" + (-width*0.04) + ",0)")
    .call(yAxis);

  y_axis.selectAll("text")
    .attr('x', -width*0.02);

  var chart = svgContainer.selectAll(".linechart")
    .data(dataset)
    .enter().append("g")
    .attr("class", "linechart")
    .call(tip);

  chart.append("path")
    .attr("class", "line")
    .style("stroke", function(d) { return color(d.name); })
    .style('stroke-dasharray', function(d) { return d.name == 'Overall' ? ("3,3") : ("0,0"); })
    .attr("d", function(d) { return line(d.values); });

  chart.selectAll('circle')
    .data(function (d) { return d.values; })
    .enter().append('circle')
    .attr("class","circle")
    .attr("cx", function(d) { return xScale(d.key) })
    .attr("cy", function(d) { return yScale(d.value) })
    .attr("r", 3)
    .style("fill", "gray")
    .on('mouseover', function(d){ tip.show(d); d3.select(this).transition().duration(100).attr("r", 6);})
    .on('mouseout', function(d){ tip.hide(d); d3.select(this).transition().duration(500).attr("r", 3);});

  var legend = svgContainer.append('g')
    .attr('class', 'activity-legend')
    .selectAll(".legend")
    .data(dataset)
    .enter().append("g")
    .attr("class", "legend")
    .attr("transform", function(d, i) { return "translate(" + i * 130 + "," + (height*1.4) + ")"; });

  legend.append("circle")
    .attr("cx", 10)
    .attr("cy", 10)
    .attr("r", 6)
    .style('stroke-dasharray', function(d) { return d.name == 'Overall' ? '3,3' : '0,0'; })
    .style('stroke', function (d, i) { return color2(i);})
    .style('stroke-width', 2)
    .style('fill', 'white')

  legend.append("text")
    .attr("x", 25)
    .attr("y", 10)
    .attr("dy", ".35em")
    .text(function(d) { return d.name; });
});