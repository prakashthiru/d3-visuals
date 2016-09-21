var divWidth = 650,	divHeight = divWidth*0.3
, margin = {top: divHeight*0.05, right: divWidth*0.08, bottom: divHeight*0.05, left: divWidth*0.08};

var width = divWidth - margin.left - margin.right
, height = divHeight - margin.top - margin.bottom;

var xScale = d3.scale.linear()
  .range([margin.left, width])
  .domain([1,10]);

var minScale = d3.scale.linear()
	.range([1, 65])
	.domain([1,10]);

function markerData(rank) {
	var rank = Math.min(10, Math.ceil(Math.random()*rank))
	if (($("#slide-marker g.container-g").length) == 0) {var callback = plotMarker}
	else {var callback = updateMarker};
	callback(rank);
}

function plotMarker(rank) {
	var svgContainer = d3.select("#slide-marker").append("svg")
		.attr("width", divWidth)
		.attr("height", divHeight)
	.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")")
		.attr("class", "container-g");

	svgContainer.append("line")
			.attr("x1",margin.left).attr("y1", height*0.7)
			.attr("x2",width).attr("y2",height*0.7)
			.attr("stroke-width", 5)
			.attr("stroke", "#C1C5CA")

	svgContainer.append("circle")
			.attr("cx", xScale(rank))
			.attr("cy", height*0.7)
			.attr("r", 25)
			.attr("stroke", "white")
			.attr("stroke-width", 5)
			.style("fill", "#706A99")

	svgContainer.append("text")
			.attr("class", "marker-value")
			.attr("x", xScale(rank))
			.attr("text-anchor", "middle")
			.attr("y", height * 0.7)
			.attr("alignment-baseline", "middle")
			.style("fill", "#DEDEDE")
			.text(rank);
}

function updateMarker(rank) {
	var svgContainer = d3.select("#slide-marker g.container-g");

	svgContainer.select("circle")
			.transition()
	.duration(1000)
			.attr("cx", xScale(rank));

	svgContainer.select("text.marker-value")
			.transition()
	.duration(1000)
			.attr("x", xScale(rank))
			.text(rank);
}

function generateRandomValue(min, max){
	var randomValue = Math.floor(Math.random() * (max - min + 1)) + min;
	return randomValue;
};

$(document).ready(function() {
	markerData(generateRandomValue(1,10));
	setInterval(function(){	markerData(generateRandomValue(1,10)) },2000);
});