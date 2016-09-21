var divWidth = $('#tag-cloud').width();
var divHeight = divWidth*0.8
var scaleSet = {};

d3.json("../data/tagCloud.json", function(error,data) {

  var dataset = d3.entries(data);

  var counts = dataset.map(function (d) { return d.value });
  scaleSet.sizeScale = d3.scale.linear().range([15, 50]).domain(d3.extent(counts));
  scaleSet.opacityScale = d3.scale.linear().range([0.5, 1]).domain(d3.extent(counts));

  dataset.sort(function(a,b){ return d3.descending(a.value, b.value);});

  d3.layout.cloud()
    .size([divWidth, divHeight])
    .words(dataset)
    .padding(5)
    .rotate(0)
    .fontSize(function(d) { return scaleSet.sizeScale(d.value); })
    .text(function (d) { return d.key})
    .padding(5)
    .on("end", plotChart)
    .start();
});

function plotChart(words) {

  var svgContainer = d3.select("#tag-cloud").append("svg")
      .attr("width", divWidth)
      .attr("height", divHeight)
      .append("g")
      .attr("transform", 'translate(' + divWidth/2 + ',' + divHeight/2 + ')');

  var cloudTags = svgContainer.selectAll("text")
      .data(words)
      .enter().append("text");

  cloudTags.style("font-size", function(d){ return d.size + "px"; })
      .style("opacity", function(d) { return scaleSet.opacityScale(d.value); })
      .attr("text-anchor", "middle")
      .transition().duration(1000)
      .attr("transform", function(d) { return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")"; })
      .text(function(d) { return d.text; });
}