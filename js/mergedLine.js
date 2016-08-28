var divWidth = $('#merge-response').width();
var divHeight = 300;

var margin = {
      top: divHeight*0.05,
      right: divWidth*0.2,
      bottom: divHeight*0.3,
      left: divWidth*0.12
    },
    width = divWidth - margin.left - margin.right,
    height = divHeight - margin.top - margin.bottom;

var xScale = d3.time.scale()
    .range([0, width]);

var yScale = d3.scale.linear()
    .range([height, 0]);

var gridScale = d3.scale.linear()
    .range([height, 0]);

var xAxis = d3.svg.axis()
    .scale(xScale)
    .orient("bottom")
    .tickFormat(d3.time.format("%b %d"))
    .tickSize(0)
    .outerTickSize(5)

var yAxis = d3.svg.axis()
    .scale(yScale)
    .orient("left")
    .tickSize(0)
    .outerTickSize(5)

function y_grid() {        
  return d3.svg.axis()
    .scale(gridScale)
    .orient("left")
    .ticks(10)
}

var line = d3.svg.line()
    .x(function(d) { return xScale(d.timescope); })
    .y(function(d) { return yScale(d.duration); });

var color = ["#4682B8", "#A5D22D"];
var parseDate = d3.time.format("%d/%m/%Y %X").parse;

readFile(assignData);

function readFile (callback) {
  d3.json("../data/mergedLine.json", function(error, data) {
    callback(data.meta_data, data.merge_data, 'merge-response');
    callback(data.meta_data, data.issue_data, 'issue-response');
  });
}

function assignData(meta_data, chart_data, div_id) {
  var change_over = parseDate(meta_data.change_over)

  chart_data.forEach(function(d) {
    d.timescope = parseDate(d.timescope);
  });

  chart_data.sort(function(a,b){ return d3.ascending(a.timescope, b.timescope);});

  joinerData = joiner(chart_data, change_over)

  xScale.domain(d3.extent(chart_data, function(d) { return d.timescope; }));
  var yMax = d3.max(chart_data, function(d) { return d.duration; })
  yScale.domain([0, yMax*1.2]);

  plotLine(chart_data, meta_data, change_over, div_id, joinerData);
}

function plotLine (chart_data, meta_data, change_over, div_id, joinerData) {

  d3.select('#' + div_id + ' svg').remove();

  var svgContainer = d3.select('#' + div_id).append("svg")
    .attr("width", divWidth)
    .attr("height", divHeight)
    .call(responsivefy);

  var chartContainer = svgContainer.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    .attr("class", 'container-g');

  chartContainer.append("g")
        .attr("class", "grid")
        .call(y_grid().tickSize(-width, 0, 0).tickFormat(""));

  var x_axis = chartContainer.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height*1.1 + ")")
      .call(xAxis);

  x_axis.selectAll("text")
      .transition()
      .duration(500)
      .attr("y", height*0.1)

  var x_label = x_axis.append("text")
      .attr("class", "label")
      .style("text-anchor", "middle")
      .attr("x", width*0.5)
      .attr("y", height*0.3)
      .text(function(d){return meta_data.x_text;});

  var y_axis = chartContainer.append("g")
      .attr("class", "y axis")
      .attr("transform", "translate(" + (-width*0.04) + ",0)")
      .call(yAxis);

  y_axis.selectAll("text")
      .transition()
      .duration(500)
      .attr('x', -width*0.02);

  var y_label = y_axis.append("text")
      .attr("class", "label")
      .attr("transform", "rotate(-90)")
      .attr("x", -height*0.5)
      .attr("y", -width*0.1)
      .style("text-anchor", "middle")
      .text(function(d){return meta_data.y_text;});

  var responseLine1 = chartContainer.append("path")
      .attr("class", "line one")
      .attr("d", line(chart_data.filter(function (d) {
        return d.timescope < change_over;
      })))

  var responseLine2 = chartContainer.append("path")
      .attr("class", "line two")
      .attr("d", line(chart_data.filter(function (d) {
        return d.timescope > change_over;
      })))

  var joinerLine = chartContainer.append("path")
      .attr("class", "line joiner")
      .attr("d", line(joinerData))

  var legend = chartContainer.append('g')
      .attr('class', 'legend')
      .selectAll(".legend")
      .data([meta_data.legend_one, meta_data.legend_two])
      .enter().append("g")
      .attr("transform", function(d, i) { return "translate(" + (width*1.05) + "," + (i*height*0.15) + ")"; });

  legend.append("rect")
      .attr("width", 15)
      .attr("height", 15)
      .style("fill", function(d, i) { return color[i]; });

  legend.append("text")
      .attr("x", width*0.03)
      .attr("y", 6)
      .attr("dy", ".35em")
      .text(function(d) { return d; });
}

function joiner(dataset, change_over) {
  var temp1 = [], temp2 = [], joinerData = [];

  for(var i=0;i<dataset.length;i++){
    var obj = {};
    if(dataset[i].timescope <= change_over){
      obj['timescope']=dataset[i].timescope;
      obj['duration']=dataset[i].duration;
      temp1.push(obj);
    }
    else if(dataset[i].timescope > change_over){
      obj['timescope']=dataset[i].timescope;
      obj['duration'] = dataset[i].duration;
      temp2.push(obj);
    }
  }

  joinerData.push(temp1[temp1.length-1]); joinerData.push(temp2[0])
  return joinerData;
}

function responsivefy(svg) {
    // get container + svg aspect ratio
    var container = d3.select(svg.node().parentNode),
        width = parseInt(svg.style("width")),
        height = parseInt(svg.style("height")),
        aspect = width / height;

    svg.attr("viewBox", "0 0 " + width + " " + height)
        .attr("perserveAspectRatio", "xMinYMid")
        .call(resize);

    d3.select(window).on("resize." + container.attr("id"), resize);

    // get width of container and resize svg to fit it
    function resize() {
        var targetWidth = parseInt(container.style("width"));
        svg.attr("width", targetWidth);
        svg.attr("height", Math.round(targetWidth / aspect));
    }
}