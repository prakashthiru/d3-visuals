var mObj = {}
, toPercent = d3.format("1%")
, parseDate = d3.time.format("%Y-%m-%d").parse;

init();

function init () {
  mObj.call_metric = 'cost';
	mObj.call_type = 'voice';
  mObj.overview_call_type = 'voice';

	d3.json('../data/callAnalysis.json', function(error, overall_data) {

    mObj.overall_data = overall_data;
    var data_cf = crossfilter(overall_data);
    mObj.type_dimension = data_cf.dimension(function(d){ return d.call_type });

    mObj.voice_data = mObj.type_dimension.filter('voice').top(Infinity);
    mObj.video_data = mObj.type_dimension.filter('video').top(Infinity);

    plotCallCounter(mObj.voice_data.length, mObj.video_data.length);
    calcDataOverview()
    assignDataTypeStat(plotTypeStat, typeStatSetup());
    calcDataDetailedStat('type_dimension','call_type','group_dimension','group_name','group-stat');
    calcDataDetailedStat('group_dimension','group_name','user_dimension','user_name','user-stat');
	});
}

function overviewSetup() {
  var divWidth = $('#call-overview').width(), divHeight = divWidth*0.4;

  var margin = {top: divHeight*0.1, right: divWidth*0.1, bottom: divHeight*0.2, left: divWidth*0.2}
  , width = divWidth - margin.left - margin.right
  , height = divHeight - margin.top - margin.bottom;

  var xScale = d3.time.scale()
      .range([0, width]);

  var yScale = d3.scale.linear()
      .range([height, 0]);

  var xAxis = d3.svg.axis()
      .scale(xScale)
      .orient("bottom")
      .ticks(7)
      .tickFormat(d3.time.format("%a"))
      .tickSize(0)
      .outerTickSize(5)

  var yAxis = d3.svg.axis()
      .scale(yScale)
      .orient("left")
      .tickSize(0)
      .tickFormat(d3.format("d"))
      .outerTickSize(5);

  var scatterScale = d3.scale.linear().range([10, 50])

  var settings = {
    divWidth:divWidth, divHeight:divHeight, margin:margin, width: width, height: height, xScale: xScale, yScale: yScale, xAxis: xAxis, yAxis: yAxis, scatterScale:scatterScale
  };

  return settings;
}

function typeStatSetup() {
  var divWidth = $('#calltype-stat').width(), divHeight = $('#call-overview').height();

  var margin = {top: divHeight*0.1, right: divWidth*0.1, bottom: divHeight*0.1, left: divWidth*0.1}
  , width = divWidth - margin.left - margin.right
  , height = divHeight - margin.top - margin.bottom
  , radius = Math.min(width,height)*0.4;

  var arc = d3.svg.arc()
      .outerRadius(radius*0.9)
      .innerRadius(0);

  var arc2 = d3.svg.arc()
      .outerRadius(radius*0.5)
      .innerRadius(radius*0.5);

  var arcAnimate = d3.svg.arc()
      .outerRadius(radius*0.95)
      .innerRadius(0);

  var pie = d3.layout.pie()
      .sort(null)
      .value(function(d) { return d.value; });

  var settings = {
    divWidth:divWidth, divHeight:divHeight, margin:margin, width: width, height: height, arc:arc, arc2: arc2, arcAnimate:arcAnimate, pie: pie
  }

  return settings;
}

function detailedStatSetup () {
  var divWidth = $('#group-stat').width(), divHeight = divWidth;

  var margin = {top: divHeight*0.05, right: divWidth*0.05, bottom: divHeight*0.2, left: divWidth*0.2}
  , width = divWidth - margin.left - margin.right
  , height = divHeight - margin.top - margin.bottom;

  var xScale = d3.scale.ordinal()
      .rangeRoundBands([0, width], .4);

  var yScale = d3.scale.linear()
      .range([height, 0]);

  var xAxis = d3.svg.axis()
      .scale(xScale)
      .orient("bottom")
      .tickSize(0);

  var yAxis = d3.svg.axis()
      .scale(yScale)
      .orient("left")
      .tickSize(0)
      .outerTickSize(5)

  var settings = {
    divWidth:divWidth, divHeight:divHeight, margin:margin, width: width, height: height, xScale: xScale, yScale: yScale, xAxis: xAxis, yAxis: yAxis
  }

  return settings;
}

function calcDataOverview () {
  if (mObj.overview_call_type == 'voice') {
    overview_cf = crossfilter(mObj.voice_data);
  } else if (mObj.overview_call_type == 'video') {
    overview_cf = crossfilter(mObj.video_data);
  } else {
    overview_cf = crossfilter(mObj.overall_data);
  };

  var date_dimension = overview_cf.dimension(function(d){ return d.timescope});
  var dates = date_dimension.group().reduceCount().top(Infinity).map(function(d){ return d.key;});
  mObj.overview_data = []
  dates.forEach(function (key) {
    var obj = {}; 
    var date_data = date_dimension.filter(key).top(Infinity);
    obj['timescope'] = parseDate(key);
    obj['count'] = date_data.length;
    obj[mObj.call_metric] = d3.sum(date_data,function(d){return d[mObj.call_metric]});
    mObj.overview_data.push(obj);
  })
  date_dimension.filterAll();
  assignDataOverview(plotOverview, overviewSetup())
}

function calcDataDetailedStat(parent_dimension,filter_key,child_dimension,child_key,div_id) {
  var parent_data = mObj[parent_dimension].filter(mObj[filter_key]).top(Infinity);
  var parent_data_cf = crossfilter(parent_data);
  mObj[child_dimension] = parent_data_cf.dimension(function (d) { return d[child_key] });
  var child_names = mObj[child_dimension].group().reduceCount().top(Infinity).map(function(d){ return d.key;});
  var child_values = [];
  child_names.forEach(function (key) {
    var obj = {};
    var child_data_temp = mObj[child_dimension].filter(key).top(Infinity);
    obj['name'] = key;
    obj['count'] = child_data_temp.length;
    obj[mObj.call_metric] = d3.sum(child_data_temp,function(d){return d[mObj.call_metric]});
    child_values.push(obj);
  })
  child_values.sort(function(a,b){ return d3.descending(a[mObj.call_metric], b[mObj.call_metric])})
  assignDataDetailedStat(plotDetailedStat,child_values,div_id,detailedStatSetup());

  mObj[child_key] = child_values[0].name;
}

function assignDataOverview(callback, settings){
  var scalingData = mObj.overview_data.map(function (d) { return d[mObj.call_metric] });
  settings.scatterScale.domain(d3.extent(scalingData));

  mObj.overview_data.sort(function(a,b){ return d3.descending(a[mObj.call_metric], b[mObj.call_metric]);});

  var yMax = d3.max(mObj.overview_data, function(d) { return +d.count; });
  settings.xScale.domain(d3.extent(mObj.overview_data, function(d) { return d.timescope; }));
  settings.yScale.domain([0, (yMax*1.2)])

  callback(settings);
}

function assignDataTypeStat (callback, settings) {
  var dataset = {};

  dataset['video'] = d3.sum(mObj.video_data, function (d) { return d[mObj.call_metric] });
  dataset['voice'] = d3.sum(mObj.voice_data, function (d) { return d[mObj.call_metric] });
  dataset = d3.entries(dataset);
  callback(dataset,settings);
}

function assignDataDetailedStat(callback,dataset,div_id,settings) {
  dataset.forEach(function (d) {
    d[mObj.call_metric] = +d[mObj.call_metric];
  });

  dataset.sort(function(a,b){ return d3.descending(a[mObj.call_metric], b[mObj.call_metric]);});

  var yMax = d3.max(dataset, function(d) { return d[mObj.call_metric]; })
  settings.xScale.domain(dataset.map(function(d) { return d.name; }));
  settings.yScale.domain([0, yMax*1.1]);

  callback(dataset, div_id, settings);
}

function plotCallCounter(voice_count, conf_count) {
  $('#voice-counter p.value-stat-large').html(voice_count);
  $('#video-counter p.value-stat-large').html(conf_count);
};

function plotOverview(settings){
  d3.select('#call-overview svg').remove();

  var tip = d3.tip()
            .attr('class', 'd3-tip')
            .html(function(d) { return "<p>No. of calls: "+d.count+"</p><p>"+ tipMetricValue(d) });

  var svgContainer = d3.select('#call-overview')
            .append("svg")
              .attr("width", settings.divWidth)
              .attr("height", settings.divHeight)
            .append("g")
              .attr("transform", "translate(" + settings.margin.left + "," + settings.margin.top + ")")
              .attr('class', 'container-g')
              .call(tip);

  svgContainer.append("g")
              .attr("transform", "translate(0," + settings.height*1.1 + ")")
              .attr("class", "x axis")
              .call(settings.xAxis)
            .selectAll('text')
              .attr("transform", "rotate(330) translate(-10," + settings.margin.bottom*0.2 + ")")

  svgContainer.append("g")
              .attr("transform", "translate("+(-settings.margin.left*0.3)+",0)")
              .attr("class", "y axis")
              .call(settings.yAxis)
            .selectAll('text')
              .attr("transform", "translate("+(-settings.margin.left*0.2)+",0)");
  
  var circle = svgContainer.selectAll(".bubble")
              .data(mObj.overview_data)
              .enter().append("g")
              .attr("class", "bubble");

  circle.append("circle")
              .attr("class", "overview-circle")
              .attr("cx", function (d) { return settings.xScale(d.timescope); })
              .attr("cy", function (d) { return settings.yScale(d.count); })
              .on('mouseover', tip.show)
              .on('mousemove', function () { return tip
                .style("top", (d3.event.pageY + 16) + "px")
                .style("left", (d3.event.pageX + 16) + "px");
              })
              .on('mouseout', tip.hide)
              .attr("r", 0)
              .transition().duration(500)
              .attr("r", function (d) { return settings.scatterScale(d[mObj.call_metric]); });
}

function plotTypeStat (dataset, settings) {
  var color = ['#ADABBA', '#FFB1C2'];
  var total = d3.sum(dataset, function (d){return d.value });
  
  var tip = d3.tip()
      .attr('class', 'd3-tip')
      .html(function(d) { 
        if (mObj.call_metric  ==  'cost') {
          return mObj.call_metric+" : $ "+d.value;
        } else {
          return mObj.call_metric+ " : "+d.value+" minutes";
        }
      });

  d3.select("#calltype-stat .chart-stage svg").remove();

  var svgContainer = d3.select("#calltype-stat .chart-stage")
      .append("svg")
      .attr("width", settings.divWidth)
      .attr("height", settings.divHeight)
      .append("g")
      .attr("transform", "translate(" + settings.divWidth*0.5 + "," + settings.divHeight*0.45 + ")")
      .call(tip);

  var pieChart = svgContainer.selectAll(".arc")
      .data(settings.pie(dataset))
      .enter().append("g")
      .attr("class", "arc");

  pieChart.append("path")
      .attr("d", settings.arc)
      .style("fill", function(d,i) { return color[i]; })
      .on('mouseover', function(d) { tip.show(d); d3.select(this).transition().duration(100).attr("d", settings.arcAnimate); })
      .on('mousemove', function () { return tip
        .style("top", (d3.event.pageY + 16) + "px")
        .style("left", (d3.event.pageX + 16) + "px");
      })
      .on('mouseout', function(d) { tip.hide(d); d3.select(this).transition().ease("elastic").duration(1000).attr("d", settings.arc) })
      .on('click', function (d) {
        mObj.call_type = d.data.key;
        calcDataDetailedStat('type_dimension','call_type','group_dimension','group_name','group-stat');
        calcDataDetailedStat('group_dimension','group_name','user_dimension','user_name','user-stat');
      });
  
  pieChart.append("text")
      .attr("class", "chart-value")
      .attr("transform", function(d) { return "translate(" + settings.arc2.centroid(d) + ")"; })
      .attr("dy", ".35em")
      .style("text-anchor", "middle")
      .text(function(d) { return toPercent(d.value/total) });

  var legend = svgContainer.append('g')
      .attr("transform", "translate(" + -(settings.divWidth*0.3) + "," + settings.margin.bottom*0.5+")")
      .selectAll(".legend")
      .data(dataset)
      .enter().append("g")
      .attr("class", "legend")
      .attr("transform", function(d, i) { return "translate(" + i * 150 + "," + (settings.divHeight*0.4) + ")"; });

  legend.append("circle")
      .attr("cx", 10)
      .attr("cy", 10)
      .attr("r", 6)
      .style("fill", function(d, i) { return color[i]; });

  legend.append("text")
      .attr("x", 25)
      .attr("y", 10)
      .attr("dy", ".35em")
      .text(function(d) { return d.key; });

  $('#calltype-stat .chart-title span').text(mObj.call_metric)
}

function plotDetailedStat(dataset, div_id, settings) {

  d3.select('#'+div_id+' .chart-stage svg').remove();

  var tip = d3.tip()
    .attr('class', 'd3-tip')
    .html(function(d) { return "<p>No. of calls: "+d.count+"</p><p>"+ tipMetricValue(d) });

  var svgContainer = d3.select("#"+div_id+' .chart-stage').append("svg")
    .attr("width", settings.divWidth)
    .attr("height", settings.divHeight)
    .append("g")
    .attr("transform", "translate(" + settings.margin.left + "," + settings.margin.top + ")")
    .call(tip);

  svgContainer.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + settings.height + ")")
    .call(settings.xAxis)
    .selectAll("text")
    .attr("transform", "rotate(300) translate(" + (-settings.margin.bottom*0.5) + ",0)")

  svgContainer.append("g")
    .attr("class", "y axis")
    .call(settings.yAxis)
    .selectAll("text")
    .attr("transform", "translate("+(-settings.margin.left*0.2)+",0)");

  svgContainer.selectAll(".bar")
    .data(dataset)
    .enter().append("rect")
    .attr("class", "bar")
    .attr("x", function(d) { return settings.xScale(d.name); })
    .attr("width", settings.xScale.rangeBand())
    .attr("y", function(d) { return settings.yScale(d[mObj.call_metric]); })
    .attr("height", function(d) { return settings.height - settings.yScale(d[mObj.call_metric]); })
    .on('mouseover', tip.show)
    .on('mousemove', function () { return tip
      .style("top", (d3.event.pageY + 16) + "px")
      .style("left", (d3.event.pageX + 16) + "px");
    })
    .on('mouseout', tip.hide)
    .on('click', function (d) {
      mObj.group_name = d.name;
      calcDataDetailedStat('group_dimension','group_name','user_dimension','user_name','user-stat');
    });

    $('#group-stat .chart-title span').text(mObj.call_type)
    $('#user-stat .chart-title span').text(mObj.group_name)
}

var tipMetricValue = function (d) {
  if (mObj.call_metric == 'cost') {
    return mObj.call_metric + " : $" + d[mObj.call_metric]
  } else {
    return mObj.call_metric + " : " + d[mObj.call_metric] + " minutes"
  }
};

$('#call-type').click(function () {
  var check = $(this).find('input:checked');
  var selectedKeys = check.map(function() { return $(this).val() ; }).get();

  if (selectedKeys.length == 1) {
    mObj.overview_call_type = selectedKeys[0];
    $(check).attr('disabled', true);
  }
  else {
    mObj.overview_call_type = 'overall';
    $(check).attr('disabled', false);
  }
  calcDataOverview();
});

$('#call-metric').click(function () {
  mObj.call_metric = $('input[name = call-metric]:checked').val();
  calcDataOverview();
  assignDataTypeStat(plotTypeStat, typeStatSetup());
  calcDataDetailedStat('type_dimension','call_type','group_dimension','group_name','group-stat');
  calcDataDetailedStat('group_dimension','group_name','user_dimension','user_name','user-stat');
});

