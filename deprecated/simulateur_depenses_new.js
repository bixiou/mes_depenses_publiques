$(document).ready(function($) {
	var max_evolution = 20;

    $.ajax({
    	url:'depenses_2016.csv', 
        success: function(data){
            var names_amounts = charge(data);
            var names = names_amounts[0];
            var amounts_actual = names_amounts[1].slice();
            var amounts_proposed = names_amounts[1];
            var nb_categories = names.length-1;
            var total_actual = amounts_actual[nb_categories];
            var sliders = new Array(nb_categories);
            var variation = new Array(nb_categories+1).fill(0);

	        slider_total = new dhtmlXSlider({
	        	parent: "Slider_total",
	        	step: 0.5,
	        	min: -max_evolution,
	        	max: max_evolution,
	        	value: 0, //amounts_proposed[nb_categories],
	        	tooltip: true,
	        	size: 400,
	        	vertical: false,
	        	skin: "dhx_skyblue"
	        });

	        $('#Slider_total_amount').text(Math.round(total_actual)+'G€');

			var indices = new Array(nb_categories);
			    for (i=0; i<nb_categories; i++) { indices[i] = i; }

			var margin = {top: 50, right: 20, bottom: 10, left: 65},
			      width = 800 - margin.left - margin.right, height = 130 - margin.top - margin.bottom;
			var y = d3.scale.ordinal().rangeRoundBands([0, height], .3);
			var x = d3.scale.linear().rangeRound([0, width]);				
			var color = d3.scale.category20();
			var xAxis = d3.svg.axis().scale(x).orient("top");
			var yAxis = d3.svg.axis().scale(y).orient("left")
			var svg = d3.select("#figure").append("svg").attr("width", width + margin.left + margin.right)
			      .attr("height", height + margin.top + margin.bottom).attr("id", "d3-plot")
			      .append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

			color.domain(indices);

			var x0 = 0; // -1*(d["Neither agree nor disagree"]/2+d["Disagree"]+d["Strongly disagree"]);			
			boxes = color.domain().map(function(name) { return {name: name, x0: x0, x1: x0 += amounts_proposed[name], N: name, n: name}; }); //, N: +d.N, n: +d[idx += 1]
			x.domain([0, total_actual*(1+max_evolution/100)]).nice();
			svg.append("g").attr("class", "x axis").call(xAxis);
			svg.append("g").attr("class", "y axis").call(yAxis);
			var vakken = svg.selectAll(".question").data(boxes).enter().append("g")
			        .attr("class", "bar").attr("transform", function(d) { return "translate(0," + y(d.Question) + ")"; });
			var bars = vakken.selectAll("rect").data(boxes).enter().append("g").attr("class", "subbar");
			bars.append("rect").attr("height", y.rangeBand()).attr("x", function(d) { return x(d.x0); })
			        .attr("width", function(d) { return x(d.x1) - x(d.x0); }).style("fill", function(d) { return color(d.name); });

			svg.append("g").attr("class", "y axis").append("line").attr("x1", 550).attr("x2", 550).attr("y2", height);

	        slider_total.attachEvent("onChange",function(pos,slider){
				amounts_proposed[nb_categories] = total_actual*(1+pos/100);
				var diff_variation_total = pos - variation[nb_categories];
				for (i=0; i<nb_categories; i++) {
					var pos_i = sliders[i].getValue();
					sliders[i].setValue(pos_i + diff_variation_total);
					amounts_proposed[i] += diff_varitaion_total*amounts_actual[i]/100;
		        	$('#Slider_'+i+'_variation').text(Math.round(100*(amounts_proposed[i]/amounts_actual[i]-1))+'%     ');
		        	$('#Slider_'+i+'_amount').text(Math.round(amounts_proposed[i])+'G€')
				}
				variation[nb_categories] = pos;
	        	$('#Slider_total_variation').text(variation[nb_categories]+'%     ');
	        	$('#Slider_total_amount').text(Math.round(amounts_proposed[nb_categories])+'G€')
		        	
				$('#figure').empty();
			 	
			 	 var svg = d3.select("#figure").append("svg").attr("width", width + margin.left + margin.right)
			      .attr("height", height + margin.top + margin.bottom)
			      .append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

			    color.domain(indices);
			    
				var x0 = 0;
      			boxes = color.domain().map(function(name) { return {name: name, x0: x0, x1: x0 += amounts_proposed[name], N: name, n: name}; }); //, N: +d.N, n: +d[idx += 1]
			    x.domain([0, total_actual*(1+max_evolution/100)]).nice();
			    svg.append("g").attr("class", "x axis").call(xAxis);
			    svg.append("g").attr("class", "y axis").call(yAxis);
			    var vakken = svg.selectAll(".question").data(boxes).enter().append("g").attr("class", "bar")
			        .attr("transform", function(d) { return "translate(0," + y(d.Question) + ")"; });
			    var bars = vakken.selectAll("rect").data(boxes).enter().append("g").attr("class", "subbar");
			    bars.append("rect").attr("height", y.rangeBand()).attr("x", function(d) { return x(d.x0); })
			        .attr("width", function(d) { return x(d.x1) - x(d.x0); }).style("fill", function(d) { return color(d.name); });
	        });

	        for (i=0; i<nb_categories; i++) {
	        	$('#Sliders').append('<div id="Slider_'+i+'" data-id="' + i + '"></div><span id="Slider_'+i+'_name">&emsp;'+names[i]+'     </span><span id="Slider_'+i+'_variation" style="font-weight: bold;">'+Math.round(amounts_proposed[i]/amounts_actual[i]-1)+'%     </span>	<span id="Slider_'+i+'_amount">'+Math.round(amounts_proposed[i])+'G€</span><br><br>'); 
		        sliders[i] = new dhtmlXSlider({
		        	parent: 'Slider_'+i,
		        	step: 0.5,
		        	min: -max_evolution,
		        	max: max_evolution,
		        	value: 0, //amounts_proposed[i],
		        	tooltip: true,
		        	size: 400,
		        	vertical: false,
		        	skin: "dhx_skyblue"
		        });

		        // $('#out').text(d3.range(12).map(color)); //
		        $('#Slider_'+i+' .dhxsl_runner').css('background', d3.range(nb_categories).map(color)[i]);

		        sliders[i].attachEvent("onChange",function(pos,slider){
		        	var j = $(slider.base).data("id");
					if ($('#Fixed_total').is(':checked')) {
						for (l=0; l<nb_categories; l++) {
					var total_proposed = 0;
					for (k=0; k<nb_categories; k++) { total_proposed += amounts_proposed[k]; }
					amounts_proposed[j] = amounts_actual[j]*(1+pos/100);
					var diff_amount_j = amounts_actual[j]*(pos - variation[j])/100;				
							amounts_proposed[l] -= diff_amount_j*amounts_proposed[l]/amounts_proposed[nb_categories]; // TODO: other mode of calculation
							var variation_l = 100*(amounts_proposed[l]/amounts_actual[l]-1);
							sliders[l].setValue(variation_l);
				        	$('#Slider_'+l+'_variation').text(Math.round(variation_l)+'%     '); // TODO: first decimal
				        	$('#Slider_'+l+'_amount').text(Math.round(amounts_proposed[l])+'G€');							
						}
					} else {
					amounts_proposed[j] = amounts_actual[j]*(1+pos/100);
					var total_proposed = 0;
					for (k=0; k<nb_categories; k++) { total_proposed += amounts_proposed[k]; }
						amounts_proposed[nb_categories] = total_proposed;
						variation[nb_categories] = 100*(total_proposed/total_actual-1);
						slider_total.setValue(variation[nb_categories]);
			        	$('#Slider_total_variation').text(Math.round(variation[nb_categories])+'%     ');
			        	$('#Slider_total_amount').text(Math.round(amounts_proposed[nb_categories])+'G€');
					}
					variation[j] = pos;
		        	$('#Slider_'+j+'_variation').text(variation[j]+'%     ');
		        	$('#Slider_'+j+'_amount').text(Math.round(amounts_proposed[j])+'G€');

					$('#figure').empty();
					var svg = d3.select("#figure").append("svg").attr("width", width + margin.left + margin.right)
					      .attr("height", height + margin.top + margin.bottom).attr("id", "d3-plot")
					      .append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

				    color.domain(indices);
			      	var x0 = 0; 
			      	boxes = color.domain().map(function(name) { return {name: name, x0: x0, x1: x0 += amounts_proposed[name], N: name, n: name}; }); //, N: +d.N, n: +d[idx += 1]
				    x.domain([0, total_actual*(1+max_evolution/100)]).nice();
				    svg.append("g").attr("class", "x axis").call(xAxis);
				    svg.append("g").attr("class", "y axis").call(yAxis)
				    var vakken = svg.selectAll(".question").data(boxes)
				      .enter().append("g").attr("class", "bar").attr("transform", function(d) { return "translate(0," + y(d.Question) + ")"; });

				    var bars = vakken.selectAll("rect").data(boxes).enter().append("g").attr("class", "subbar");
				    bars.append("rect").attr("height", y.rangeBand()).attr("x", function(d) { return x(d.x0); })
				        .attr("width", function(d) { return x(d.x1) - x(d.x0); }).style("fill", function(d) { return color(d.name); });

	        	});
	        }

        },
        error: function(){ alert('Les données n\'ont pas pu être chargées');}
    });

	function charge(data) {
		var tab=data.split('\n');
		var nb_categories = tab.length;
		var amounts = new Array(nb_categories+1);
		var names = new Array(nb_categories+1);
		var total = 0;
		for (var i = 0; i<nb_categories; i++) {	
			names[i] = tab[i].split(';')[0];
			amounts[i] = parseFloat(tab[i].split(';')[1]);
			total += amounts[i];	}
		names[nb_categories] = "Total";
		amounts[nb_categories] = total;
		return [names, amounts]
	}

	// function trace_total(amounts_proposed) {
	// 	var nb_categories = amounts_proposed.length-1;
	//     var indices = new Array(nb_categories);
	//     for (i=0; i<nb_categories; i++) { indices[i] = i; }

	//   var margin = {top: 50, right: 20, bottom: 10, left: 65},
	//       width = 800 - margin.left - margin.right,
	//       height = 130 - margin.top - margin.bottom;

	//   var y = d3.scale.ordinal()
	//       .rangeRoundBands([0, height], .3);

	//   var x = d3.scale.linear()
	//       .rangeRound([0, width]);
		

	// var color = d3.scale.category20();

	//   // var color = d3.scale.ordinal()
	//   //     .range(["#c7001e", "#f6a580", "#cccccc", "#92c6db", "#086fad"]);
	//   var xAxis = d3.svg.axis()
	//       .scale(x)
	//       .orient("top");

	//   var yAxis = d3.svg.axis()
	//       .scale(y)
	//       .orient("left")

	//   var svg = d3.select("#figure").append("svg")
	//       .attr("width", width + margin.left + margin.right)
	//       .attr("height", height + margin.top + margin.bottom)
	//       .attr("id", "d3-plot")
	//     .append("g")
	//       .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	//     // color.domain(["Strongly disagree", "Disagree", "Neither agree nor disagree", "Agree", "Strongly agree"]);
	//     // color.domain(indices);

	//   // d3.csv("raw_data.csv", function(error, data) {

	//     // data.forEach(function(d) {
	//       // calc percentages
	//       // for (i=0; i<nb_categories; i++) { d[i] = amounts_proposed[i] }
	//       // d["Strongly disagree"] = +d[1]*100/d.N;
	//       // d["Disagree"] = +d[2]*100/d.N;
	//       // d["Neither agree nor disagree"] = +d[3]*100/d.N;
	//       // d["Agree"] = +d[4]*100/d.N;
	//       // d["Strongly agree"] = +d[5]*100/d.N;
	//       var x0 = 0; // -1*(d["Neither agree nor disagree"]/2+d["Disagree"]+d["Strongly disagree"]);
	//       // var idx = 0;
	//       boxes = color.domain().map(function(name) { return {name: name, x0: x0, x1: x0 += amounts_proposed[name], N: name, n: name}; }); //, N: +d.N, n: +d[idx += 1]
	//     // });

	//     // var min_val = d3.min(data, function(d) {
	//     //         return d.boxes["0"].x0;
	//     //         });

	//     // var max_val = d3.max(data, function(d) {
	//     //         return d.boxes["4"].x1;
	//     //         });

	//     x.domain([0, total_actual*(1+max_evolution/100)]).nice();
	//     // y.domain(data.map(function(d) { return d.Question; }));

	//     svg.append("g")
	//         .attr("class", "x axis")
	//         .call(xAxis);

	//     svg.append("g")
	//         .attr("class", "y axis")
	//         .call(yAxis)

	//     var vakken = svg.selectAll(".question")
	//         .data(boxes)
	//       .enter().append("g")
	//         .attr("class", "bar")
	//         .attr("transform", function(d) { return "translate(0," + y(d.Question) + ")"; });

	//     var bars = vakken.selectAll("rect")
	//         .data(boxes)
	//       .enter().append("g").attr("class", "subbar");

	//     bars.append("rect")
	//         .attr("height", y.rangeBand())
	//         .attr("x", function(d) { return x(d.x0); })
	//         .attr("width", function(d) { return x(d.x1) - x(d.x0); })
	//         .style("fill", function(d) { return color(d.name); });

	//     svg.append("g")
	//         .attr("class", "y axis")
	//     .append("line")
	//         .attr("x1", 550)
	//         .attr("x2", 550)
	//         .attr("y2", height);
	// }

	// function trace_total_update(amounts_proposed) {
	// 	var nb_categories = amounts_proposed.length-1;
	//     var indices = new Array(nb_categories);
	//     for (i=0; i<nb_categories; i++) { indices[i] = i; }

	//   var margin = {top: 50, right: 20, bottom: 10, left: 65},
	//       width = 800 - margin.left - margin.right,
	//       height = 130 - margin.top - margin.bottom;

	//   var y = d3.scale.ordinal()
	//       .rangeRoundBands([0, height], .3);

	//   var x = d3.scale.linear()
	//       .rangeRound([0, width]);
		

	// var color = d3.scale.category20();

	//   // var color = d3.scale.ordinal()
	//   //     .range(["#c7001e", "#f6a580", "#cccccc", "#92c6db", "#086fad"]);
	//   var xAxis = d3.svg.axis()
	//       .scale(x)
	//       .orient("top");

	//   var yAxis = d3.svg.axis()
	//       .scale(y)
	//       .orient("left")

	//   var svg = d3.select("#figure")
	//   // .append("svg")
	//   //     .attr("width", width + margin.left + margin.right)
	//   //     .attr("height", height + margin.top + margin.bottom)
	//   //     .attr("id", "d3-plot")
	//   //   .append("g")
	//   //     .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	//     // color.domain(["Strongly disagree", "Disagree", "Neither agree nor disagree", "Agree", "Strongly agree"]);
	//     color.domain(indices);

	//   // d3.csv("raw_data.csv", function(error, data) {

	//     // data.forEach(function(d) {
	//       // calc percentages
	//       // for (i=0; i<nb_categories; i++) { d[i] = amounts_proposed[i] }
	//       // d["Strongly disagree"] = +d[1]*100/d.N;
	//       // d["Disagree"] = +d[2]*100/d.N;
	//       // d["Neither agree nor disagree"] = +d[3]*100/d.N;
	//       // d["Agree"] = +d[4]*100/d.N;
	//       // d["Strongly agree"] = +d[5]*100/d.N;
	//       var x0 = 0; // -1*(d["Neither agree nor disagree"]/2+d["Disagree"]+d["Strongly disagree"]);
	//       // var idx = 0;
	//       boxes = color.domain().map(function(name) { return {name: name, x0: x0, x1: x0 += amounts_proposed[name], N: name, n: name}; }); //, N: +d.N, n: +d[idx += 1]
	//     // });

	//     // var min_val = d3.min(data, function(d) {
	//     //         return d.boxes["0"].x0;
	//     //         });

	//     // var max_val = d3.max(data, function(d) {
	//     //         return d.boxes["4"].x1;
	//     //         });

	//     x.domain([0, total_actual*(1+max_evolution/100)]).nice();
	//     // y.domain(data.map(function(d) { return d.Question; }));

	//     // svg.append("g")
	//     //     .attr("class", "x axis")
	//     //     .call(xAxis);

	//     // svg.append("g")
	//     //     .attr("class", "y axis")
	//     //     .call(yAxis)

	//     var vakken = svg.selectAll(".question")
	//         .data(boxes)
	//       .enter().append("g")
	//         .attr("class", "bar")
	//         .attr("transform", function(d) { return "translate(0," + y(d.Question) + ")"; });

	//     var bars = vakken.selectAll("rect")
	//         .data(boxes)
	//       .enter().append("g").attr("class", "subbar");

	//     bars.attr("height", y.rangeBand())
	//         .attr("x", function(d) { return x(d.x0); })
	//         .attr("width", function(d) { return x(d.x1) - x(d.x0); })
	//         .style("fill", function(d) { return color(d.name); });

	//     svg.append("g")
	//         .attr("class", "y axis")
	//     .append("line")
	//         .attr("x1", 550)
	//         .attr("x2", 550)
	//         .attr("y2", height);
	// }
	// // function ajust_total(diff) {
	// // 	for (i=0; i<nb_categories; i++) {
	// // 		var pos_i = sliders[i].getValue();
	// // 		sliders[i].setValue(pos_i+diff);
	// // 	}
	// // }

	// // function ajust_category(i, pos, fixed_total) {
	// // 	if (fixed_total) {

	// // 	} else {

	// // 		slider_total.setValue();
	// // 	}
	// // }
});