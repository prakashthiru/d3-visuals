var divWidth = ($('#fuel-gauge').width())*0.8
,   divHeight = divWidth*0.35

var margin = {top: divHeight*0.05, right: divWidth*0.01, bottom: divHeight*0.01, left: divWidth*0.05}
,   width = divWidth - margin.left - margin.right
,   height = divHeight - margin.top - margin.bottom;

var color = d3.scale.linear()
    .domain([1, 5, 10])
    .range(['red', 'orange', 'green']);

function plotChart(score) {

	var score_a = score*0.1
	,   score_b = (10-score)*0.1
	,   radius=d3.min([width,height]);
  
  d3.select('#fuel-gauge').select('svg').remove();

	var svgContainer = d3.select('#fuel-gauge').append("svg")
	    .attr("width", divWidth)
	    .attr("height", divHeight)
	    .append("g")
	    .attr("transform", "translate(" + divWidth*0.5 + "," + divHeight*0.5 + ")")

  var filler = svgContainer.append("defs").append("linearGradient").attr("id", "filler")
      .attr("x1", 0).attr("x2", 0).attr("y1", 1).attr("y2", 0);

  filler.append("stop")
      .attr("offset", 0)
      .style("stop-color", "white")
      .transition().duration(2000).ease('bounce')
      .attr("offset", score_a)
      .style("stop-color", color(score));

  filler.append("stop")
      .attr("offset", score_b)
      .style("stop-color", "white");

  svgContainer.append("circle")
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("r", radius*0.5)
      .style("stroke", color(score))
      .style("fill", "url(#filler)")
      .style("fill-opacity", 0.4)
      .style("stroke-width", radius*0.025);

  svgContainer.append("text")
      .attr("x", 0)
      .attr("y", 0)
      .attr("text-anchor", "middle")
      .attr("alignment-baseline", "central")
      .attr("font-size", radius*0.4)
      .style("fill", "#5A5A5A")
      .text(1)
      .transition()
      .duration(500)
      .ease('cubic')
      .tween("text", function() {
          var i = d3.interpolate(this.textContent, score);
          return function(t) { this.textContent = Math.round(i(t)); };
      });
}

function generateRandomValue(min, max){
	var randomValue = Math.floor(Math.random() * (max - min + 1)) + min;
	return randomValue;
};

$(document).ready(function() {
	plotChart(generateRandomValue(1,10));
	setInterval(function(){	plotChart(generateRandomValue(1,10)) },3000);
});