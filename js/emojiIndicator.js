var divWidth = ($('#emoji-chart').width())*0.4
  , divHeight = divWidth*0.8;

var margin = {top: divHeight*0.01, right: divWidth*0.01, bottom: divHeight*0.01, left: divWidth*0.01}
  , width = divWidth - margin.left - margin.right
  , height = divHeight - margin.top - margin.bottom;

var radius=d3.min([width,height]);
var emojiText = ["Hey! Why so serious","Why don't you try smiling a bit","Good start! Keep smiling","Good. You seem to be a jovial person","Wow. Aren't you one happy person"]

var color = d3.scale.linear()
	.domain([1, 3, 5])
	.range(['red', 'orange', 'green']);


plotChart(1);

function plotChart(score) {
	d3.select('#emoji-chart').select('svg').remove();
	d3.select('#emoji-text').select('p').remove();

	var svgContainer = d3.select("#emoji-chart").append("svg")
		.attr("width", divWidth)
		.attr("height", divHeight)
		.append("g")
		.attr("transform", "translate(" + divWidth*0.5 + "," + divHeight*0.5 + ")")
		.attr("class", "container-g")

	svgContainer.append("circle")
		.attr("class", "emoji-circle")
		.attr("transform", "translate(0,0)")  
		.attr("r", radius*0.4)
		.style("fill", color(score))
		.style("stroke", color(score))
		.transition().duration(1000)
		.style("stroke-width", radius*0.1)

	svgContainer.append("image")
		.attr("xlink:href", "../images/emoji_"+score+".png")
		.attr("transform", "translate(" + -(radius*0.35) + "," + (-radius*0.35) + ")")
		.attr("width", radius*0.7)
		.attr("height", radius*0.7);

	d3.select("#emoji-text").append("p")
		.attr("class", "emoji-text")
		.text(emojiText[score-1]);
}

function generateRandomValue(min, max){
	var randomValue = Math.floor(Math.random() * (max - min + 1)) + min;
	return randomValue;
};

$(document).ready(function() {
	plotChart(generateRandomValue(1,5));
	setInterval(function(){	plotChart(generateRandomValue(1,5)) },5000);
});