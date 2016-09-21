var divWidth = $('#top-stories').width()
  , divHeight = divWidth*0.6;

var margin = {top: divHeight*0.05, right: divWidth*0.01, bottom: divHeight*0.01, left: divWidth*0.05}
  , width = divWidth - margin.left - margin.right
  , height = divHeight - margin.top - margin.bottom;

var xScale = d3.scale.linear()
                .range([0, width]);

var yScale = d3.scale.ordinal()
                .rangeRoundBands([0, height], 0.8);

var yAxis = d3.svg.axis()
                  .scale(yScale)
                  .orient("right")
                  .tickSize(0);

readFile();

function readFile(){

  d3.json("../data/modernBar.json", function(error,data) {

    var dataset = d3.entries(data);
    dataset = dataset.sort(function (a, b) { return b.value-a.value; }).slice(0,3);

    var xMax = d3.max(dataset, function(d) { return d.value; });
    xScale.domain([0, xMax+xMax*0.20]);
    yScale.domain(dataset.map(function(d) { return d.key; }));

    plotChart(dataset);
  });
}

function plotChart(dataset){

  var yRangebandHalf = yScale.rangeBand()/2;

  var svgContainer = d3.select('#top-stories')
              .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
              .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                .attr("class", 'container-g');

  var yAxisLine = svgContainer.append("g")
                .attr("class", "top-stories-y-axis")
                .call(yAxis);

  var yAxisText = yAxisLine.selectAll("text")
                .attr("y", -(yScale.rangeBand()*2));

  var bar = svgContainer.selectAll(".bar")
              .data(dataset)
              .enter().append("g")
                .attr("class", "top-stories-bar")
                .attr("transform", function(d) { return "translate(0," + yScale(d.key) + ")"; });
              
  var backBar = bar.append("rect")
                .attr("class", "top-stories-back-bar")
                .attr("width", width)
                .attr("height", yScale.rangeBand()+yRangebandHalf)
                .attr("rx", yRangebandHalf)
                .attr("ry", yRangebandHalf);

  var frontBar = bar.append("rect")
                .attr("class", "top-stories-front-bar")
                .attr("width", function(d) { return xScale(d.value); })
                .attr("height", yScale.rangeBand())
                .attr("transform", function(d) { return "translate(" + width*0.01 + "," + yRangebandHalf/2 + ")"; })
                .attr("rx", yRangebandHalf)
                .attr("ry", yRangebandHalf)

  var barText = bar.append("text")
                .attr("class", "top-stories-bar-text")
                .attr("text-anchor", "end")
                .attr("x", width + width*0.1)
                .attr("y", yScale.rangeBand())
                .attr("alignment-baseline", "middle")
                .text(function(d) { return d.value});
}