var divWidth = 960, divHeight = 400;

var margin = {top: divWidth*0.02, right: divWidth*0.15, bottom: divHeight*0.1, left: divHeight*0.15},
  width = divWidth - margin.left - margin.right,
  height = divHeight - margin.top - margin.bottom;

var xScale = d3.time.scale()
  .range([0, width]);

var yScale = d3.scale.linear()
  .range([height, 0]);

var color = d3.scale.category10();
var color2 = d3.scale.category10();

var parseDate = d3.time.format("%d-%m-%Y").parse;

var xAxis = d3.svg.axis()
  .scale(xScale)
  .orient("bottom")
  .tickFormat(d3.time.format("%a"))
  .ticks(7)
  .tickSize(0)
  .outerTickSize(5);

var yAxis = d3.svg.axis()
  .scale(yScale)
  .orient("left")
  .tickSize(0)
  .outerTickSize(5);

var line = d3.svg.line()
  .interpolate("basis")
  .x(function(d) { return xScale(d.timescope); })
  .y(function(d) { return yScale(d.response); });

var area = d3.svg.area()
  .interpolate("basis")
  .x(function(d) { return xScale(d.timescope); })
  .y0(height)
  .y1(function(d) { return yScale(d.response); });

d3.json("../data/multiArea.json", function(error, data) {

  data.forEach(function(d) {
    d.timescope = parseDate(d.timescope);
  });

  var filterData = d3.keys(data[0]).filter(function(key) { return key !== "timescope"; });

  var dataset = filterData.map(function(name) {
    return {name: name, values: data.map(function(d) { return {timescope: d.timescope, response: +d[name]}; })};
  });

  xScale.domain(d3.extent(data, function(d) { return d.timescope; }));
  yScale.domain([d3.min(dataset, function(d) { return d3.min(d.values, function(d) { return d.response; }); }),
  d3.max(dataset, function(d) { return d3.max(d.values, function(d) { return d.response; }); })])
  createChart(dataset);
});

function createChart(dataset) {
  var svgContainer = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var x_axis = svgContainer.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

  x_axis.selectAll("text")
    .attr("transform", "rotate(330) translate(-10," + margin.bottom*0.5 + ")")

  var y_axis = svgContainer.append("g")
    .attr("class", "y axis")
    .call(yAxis);

  y_axis.selectAll("text")
    .attr("transform", "translate("+ (-margin.left*0.05) + "0)")

  var chart = svgContainer.selectAll(".chart")
    .data(dataset)
    .enter().append("g")
    .attr("class", "chart");

  chart.append("path")
    .attr("class", "line")
    .attr("d", function(d) { return line(d.values); })
    .style("stroke", function(d) { return color(d.name); });

  chart.append("path")
    .attr("class", "area")
    .attr("d", function(d) { return area(d.values); })
    .style("fill", function(d, i) { return color(d.name); });

  var legend = svgContainer.selectAll(".legend")
    .data(dataset)
    .enter().append("g")
    .attr("class", "legend")
    .attr("transform", function(d, i) { return "translate(" + width*1.05 + "," + i * 30 + ")"; });

  legend.append("circle")
    .attr("cx", 10)
    .attr("cy", 10)
    .attr("r", 6)
    .style('stroke', function (d, i) { return color2(i);})
    .style('stroke-width', 2)
    .style('fill', 'white')

  legend.append("text")
    .attr("x", 30)
    .attr("y", 10)
    .attr("dy", ".35em")
    .text(function(d) { return d.name; });

}