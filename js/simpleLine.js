var divWidth = 960, divHeight = 500;

var margin = {top: divWidth*0.1, right: divWidth*0.1, bottom: divHeight*0.1, left: divHeight*0.2},
  width = divWidth - margin.left - margin.right,
  height = divHeight - margin.top - margin.bottom;

var xScale = d3.time.scale()
  .range([0, width]);

var yScale = d3.scale.linear()
  .range([height, 0]);

var xAxis = d3.svg.axis()
  .scale(xScale)
  .orient("bottom")
  .tickFormat(d3.time.format("%b"))
  .tickSize(0)
  .outerTickSize(8)
  .ticks(10);

var yAxis = d3.svg.axis()
  .scale(yScale)
  .orient("left")
  .tickSize(0)
  .outerTickSize(8);

var parseDate = d3.time.format("%d %b %Y").parse
,  bisectDate = d3.bisector(function(d) { return d.key; }).left;

var line = d3.svg.line()
  .x(function(d) { return xScale(d.key); })
  .y(function(d) { return yScale(d.value); });

var svgContainer = d3.select("body").append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.json("data/simpleLine.json", function(error, data) {

  var dataset = d3.entries(data);

  dataset.forEach(function(d) {
    d.key = parseDate(d.key);
    d.value = +d.value;
  });

  dataset.sort(function(a,b){ return d3.ascending(a.key, b.key);});

  xScale.domain(d3.extent(dataset, function(d) { return d.key; }));
  yScale.domain(d3.extent(dataset, function(d) { return d.value; }));

  var x_axis = svgContainer.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height*1.05 + ")")
    .call(xAxis);

  x_axis.selectAll("text")
    .attr("transform", "rotate(330) translate(20," + margin.bottom*0.5 + ")")

  var y_axis = svgContainer.append("g")
    .attr("class", "y axis")
    .attr("transform", "translate(" + (-margin.left*0.4) + ",0)")
    .call(yAxis)

  y_axis.selectAll("text")
    .attr("transform", "translate(" + (-margin.left*0.2) + "," + (-height*0.05) + ")")

  svgContainer.append("path")
    .datum(dataset)
    .attr("class", "line")
    .attr("d", line);

  var focus = svgContainer.append("g")
      .attr("class", "focus")
      .style("display", "none")

  focus.append("circle")
      .attr("r", 4);

  focus.append("text")
      .attr("x", 9)
      .attr("dy", ".35em");

  svgContainer.append("rect")
      .attr("class", "overlay")
      .attr("width", width)
      .attr("height", height)
      .on("mouseover", function() { focus.style("display", null); })
      .on("mouseout", function() { focus.style("display", "none"); })
      .on("mousemove", mousemove);

  function mousemove() {
    var x0 = xScale.invert(d3.mouse(this)[0])
    ,  i = bisectDate(dataset, x0, 1)
    ,  d0 = dataset[i - 1]
    ,  d1 = dataset[i]
    ,  d = x0 - d0.key > d1.key - x0 ? d1 : d0;

    focus.attr("transform", "translate(" + xScale(d.key) + "," + yScale(d.value) + ")");
    focus.select("text").text(d.value);
  }
});