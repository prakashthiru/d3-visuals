var divWidth = ($('#meter-gauge').width())*0.5
  , divHeight = divWidth*0.8;

var margin = {top: divHeight*0.01, right: divWidth*0.01, bottom: divHeight*0.01, left: divWidth*0.01}
  , width = divWidth - margin.left - margin.right
  , height = divHeight - margin.top - margin.bottom;

var gaugeTransform = function () {
	return 'translate('+divWidth*0.5 +','+ divHeight*0.7 +')';
}

function meterGaugeSetup() {
	var settings = {
		ringInset: 20, minAng: -90, maxAng: 90,
		labelFormat: d3.format(',g'), labelInset: 10,
	};

	settings.range = settings.maxAng-settings.minAng;
	settings.radius = d3.min([width, height])*0.6;

	var pointerWidth = 10, pointerTailLn = 5, pointerHeadLnPercent = 0.9, majorTicks = 5,  ringWidth = 30
	, pointerHeadLength = Math.round(settings.radius * pointerHeadLnPercent)

	settings.scale = d3.scale.linear()
			.range([0,1])
			.domain([0, 10]);

	settings.ticks = settings.scale.ticks(majorTicks);
	settings.tickData = d3.range(majorTicks).map(function() {return 1/majorTicks;});
	settings.arcColor = d3.scale.linear()
			.domain([1, 3, 5])
			.range(['orange', 'yellow', 'green']);

	var calcAngle = function (ratio) {
		return (settings.minAng + (ratio * settings.range))* Math.PI / 180;
	}

	settings.arc = d3.svg.arc()
			.innerRadius(settings.radius - ringWidth - settings.ringInset)
			.outerRadius(settings.radius - settings.ringInset)
			.startAngle(function(d, i) { return calcAngle(d * i); })
			.endAngle(function(d, i) {return calcAngle(d * (i+1)) });

	settings.lineData = [ 
		[pointerWidth*0.5, 0], 
		[0, -pointerHeadLength],
		[-(pointerWidth*0.5), 0],
		[0, pointerTailLn],
		[pointerWidth*0.5, 0]
	];

	return settings;
}

function plotMeterGauge(settings, div_id) {
	d3.select('#meter-gauge').select('svg').remove();
	var svgContainer = d3.select(div_id)
			.append('svg:svg')
			.attr('class', 'gauge')
			.attr('width', width)
			.attr('height', height);

	var arcs = svgContainer.append('g')
			.attr('class', 'arc')
			.attr('transform', gaugeTransform());

	arcs.selectAll('path')
			.data(settings.tickData)
			.enter().append('path')
			.attr('fill', function(d, i) { return settings.arcColor(i); })
			.attr('d', settings.arc);

	var lg = svgContainer.append('g')
			.attr('class', 'label')
			.attr('transform', gaugeTransform());

	lg.selectAll('text')
			.data(settings.ticks)
			.enter().append('text')
			.attr('transform', function(d) {
			var ratio = settings.scale(d);
			var newAngle = settings.minAng + (ratio * settings.range);
				return 'rotate(' +newAngle +') translate(0,' +(settings.labelInset - settings.radius) +')';
			})
			.text(settings.labelFormat);

	var pointerLine = d3.svg.line().interpolate('monotone');

	var pg = svgContainer.append('g').data([settings.lineData])
			.attr('class', 'pointer')
			.attr('transform', gaugeTransform());

	gauge_pointer = pg.append('path')
			.attr('d', pointerLine)
			.attr('transform', 'rotate(' +settings.minAng +')');

	return settings;
}

function updateMeterGauge(newValue) {
	var settings = plotMeterGauge(meterGaugeSetup(), '#meter-gauge')
	var ratio = settings.scale(newValue);
	var newAngle = settings.minAng + (ratio * settings.range);
	gauge_pointer.transition()
			.duration(2000)
			.ease('elastic')
			.attr('transform', 'rotate(' +newAngle +')');
}

function generateRandomValue(min, max){
	var randomValue = Math.floor(Math.random() * (max - min + 1)) + min;
	return randomValue;
};

$(document).ready(function() {
	updateMeterGauge(generateRandomValue(1,10));
});