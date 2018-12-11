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
            var sliders = new Array(nb_categories)
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

	        slider_total.attachEvent("onChange",function(pos,slider){
				amounts_proposed[nb_categories] = total_actual*(1+pos/100);
				var diff_variation_total = pos - variation[nb_categories];
				for (i=0; i<nb_categories; i++) {
					var pos_i = sliders[i].getValue();
					sliders[i].setValue(pos_i + diff_variation_total);
					amounts_proposed[i] += diff_variation_total*amounts_actual[i]/100;
		        	$('#Slider_'+i+'_variation').text(Math.round(100*(amounts_proposed[i]/amounts_actual[i]-1))+'%     ');
		        	$('#Slider_'+i+'_amount').text(Math.round(amounts_proposed[i])+'G€')
				}
				variation[nb_categories] = pos;
	        	$('#Slider_total_variation').text(variation[nb_categories]+'%     ');
	        	$('#Slider_total_amount').text(Math.round(amounts_proposed[nb_categories])+'G€')
	        });

	        for (i=0; i<nb_categories; i++) {
	        	$('#Sliders').append('<div id="Slider_'+i+'" data-id="' + i + '"></div><span id="Slider_'+i+'_name">&emsp;'+names[i]+'     </span><span id="Slider_'+i+'_variation">'+Math.round(amounts_proposed[i]/amounts_actual[i]-1)+'%     </span>	<span id="Slider_'+i+'_amount">'+Math.round(amounts_proposed[i])+'G€</span><br><br>'); 
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

		        sliders[i].attachEvent("onChange",function(pos,slider){
		        	var j = $(slider.base).data("id");
					// amounts_proposed[j] = amounts_actual[j]*(1+pos/100);
					// var diff_amount_j = amounts_actual[j]*(pos - variation[j])/100;
					// var total_proposed = 0;
					// for (k=0; k<nb_categories; k++) { total_proposed += amounts_proposed[k]; }
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

	// function ajust_total(diff) {
	// 	for (i=0; i<nb_categories; i++) {
	// 		var pos_i = sliders[i].getValue();
	// 		sliders[i].setValue(pos_i+diff);
	// 	}
	// }

	// function ajust_category(i, pos, fixed_total) {
	// 	if (fixed_total) {

	// 	} else {

	// 		slider_total.setValue();
	// 	}
	// }
});