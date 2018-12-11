// cf. mail René Carlet 5/09/2018 pour amélioration design
// TODO: slider déficit => non, mettre le 0 du slider dépense à 988 + afficher déficit

$(document).ready(function($) {
	// TODO: check button qui affiche souhaits moyens en-dessous d'actuel (et au-dessus de souhaitées)
	//       et qui met les curseurs à ces niveaux-là s'ils sont tous à zéro
	//        + traduction en anglais
	var max_evolution = 20; // TODO: augmenter ?
	var deficit = 73; // 75.9 en 2016 (2017: 59.3, 2018: 67.7 cf ci-dessous) source: https://www.insee.fr/fr/statistiques/2669747
	var deficit_over_gdp = 0.026; // 2016: 0.034 (2017: 0.026) // TODO: prendre 2016 ? source: https://www.insee.fr/fr/statistiques/3375616
	var total_depenses = 1257.2; // 2016 source: https://www.insee.fr/fr/statistiques/2669747
	var gdp = deficit/deficit_over_gdp;
	// PIB 2016: 2228.9 / 2017: 2291.7 sources: https://www.insee.fr/fr/statistiques/2856119 https://www.insee.fr/fr/statistiques/3550563
// TODO: pouvoir bloquer chaque dépense
    $.ajax({
    	url:'depenses_2017_etat.csv', // depenses_2016 avec_aide: https://hbs.ca1.qualtrics.com/ControlPanel/File.php?F=F_2g98pV3W6Nj0v6R 
    	// simplifiees: https://hbs.ca1.qualtrics.com/ControlPanel/File.php?F=F_8xglo2oAjuruUkZ
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
	        	min: -max_evolution, //  - 5.5 modification DGFIP
	        	max: max_evolution, // - 5.50 modification Bercy TODO: enlever
	        	value: 0, //amounts_proposed[nb_categories],
	        	tooltip: true,
	        	size: 400,
	        	vertical: false,
	        	skin: "dhx_skyblue"
	        });

	        slider_recette = new dhtmlXSlider({
	        	parent: "Slider_recette",
	        	step: 0.5,
	        	min: -max_evolution,
	        	max: max_evolution,
	        	value: 0, //amounts_proposed[nb_categories],
	        	tooltip: true,
	        	size: 400,
	        	vertical: false,
	        	skin: "dhx_skyblue"
	        });

			var indices_color = new Array(nb_categories);
			for (i=0; i<nb_categories; i++) { indices_color[i] = i; }

			var margin = {top: 50, right: 25, bottom: 1, left: 5},
			      width = 800 - margin.left - margin.right, height = 150 - margin.top - margin.bottom;
			var y = d3.scale.ordinal().rangeRoundBands([0, height-10], .3);
			var x = d3.scale.linear().rangeRound([0, width]);				
			var color = d3.scale.category10(); // d3.scale.category20()
			var xAxis = d3.svg.axis().scale(x).orient("top");
			var yAxis = d3.svg.axis().scale(y).orient("left");
			var svg = d3.select("#figure");

			var scaling_factor = width/1300*2.6; // 1300 comes from the line above
			// deficit *= total_actual/total_depenses;
			var revenue_actual = total_actual - deficit;
			var total_revenue = revenue_actual;

	        $('#Slider_total_amount').text(Math.round(total_actual));
	        $('#Slider_recette_amount').text(Math.round(revenue_actual));

			function load_bars() {
				svg = d3.select("#figure").append("svg").attr("width", width + margin.left + margin.right)
				      .attr("height", height + margin.top + margin.bottom).attr("id", "d3-plot")
				      .append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
				color.domain(indices_color);
				var x0 = 0; // -1*(d["Neither agree nor disagree"]/2+d["Disagree"]+d["Strongly disagree"]);			
				boxes = color.domain().map(function(name) { return {name: name, x0: x0, x1: x0 += amounts_proposed[name], N: name, n: name}; });//, N:+d.N,n:+d[idx += 1]
				x.domain([0, total_actual*(1+max_evolution/100)]).nice();
				var vakken = svg.selectAll(".question").data(boxes).enter().append("g")
				        .attr("class", "bar").attr("transform", function(d) { return "translate(0," + y(d.Question) + ")"; });
				var bars = vakken.selectAll("rect").data(boxes).enter().append("g").attr("class", "subbar");
				bars.append("rect").attr("height", height-30).attr("y", 20).attr("x", function(d) { return x(d.x0); })
				        .attr("width", function(d) { return x(d.x1) - x(d.x0); }).style("fill", function(d) { return color(d.name); });
				// /!\ Pb: some spendings are not included in depenses_2016_simplifiees : aides aux entreprises, protection environnement, aide aux pays pauvres
				//         and some are not even included in depenses_2016 ('other', administration générale, debt repayment)
				//        so the computations of budget_neutral and golden_rule point are problematic
				// Budget actuel
				color.domain(indices_color);
				var x0 = 0; // -1*(d["Neither agree nor disagree"]/2+d["Disagree"]+d["Strongly disagree"]);			
				boxes = color.domain().map(function(name) { return {name: name, x0: x0, x1: x0 += amounts_actual[name], N: name, n: name}; }); //, N: +d.N,n:+d[idx += 1]
				var vakken = svg.selectAll(".question").data(boxes).enter().append("g")
				        .attr("class", "bar").attr("transform", function(d) { return "translate(0," + y(d.Question) + ")"; });
				var bars = vakken.selectAll("rect").data(boxes).enter().append("g").attr("class", "subbar");
				bars.append("rect").attr("height", 20).attr("x", function(d) { return x(d.x0); })
				        .attr("width", function(d) { return x(d.x1) - x(d.x0); }).style("fill", function(d) { return color(d.name); });
				svg.append("g").attr("class", "x axis").call(xAxis);
				svg.append("g").attr("class", "y axis").call(yAxis);
				var deficit_proposed = deficit + revenue_actual - total_revenue;
				var budget_neutral = scaling_factor*(total_actual-deficit_proposed);
				var golden_rule = scaling_factor*(total_actual-deficit_proposed+0.03*gdp);
		        $('#deficit').text(Math.round(-1000*deficit_proposed/gdp)/10+'%');
		        // $('#deficit').text(Math.round(-1000*deficit_proposed*total_depenses/(total_actual*gdp))/10+'%');
				svg.append("g").attr("class", "x axis").append("line").attr("y1", 20).attr("y2", 20).attr("x2", scaling_factor*total_actual);
				svg.append("g").attr("class", "y axis").append("line").attr("x1", budget_neutral)
				.attr("x2", budget_neutral).attr("y2", height+30).style({stroke: "green", 'stroke-width': 1});
				svg.append("g").attr("class", "y axis").append("line").attr("x1", golden_rule).attr("x2", golden_rule)
				.attr("y2", height+30).style({stroke: "red", 'stroke-width': 1});
			} 

			load_bars();

			function save_proposition() {
				for (i=0; i<nb_categories; i++) {
					Qualtrics.SurveyEngine.setEmbeddedData('variation_'+i, 100*(amounts_proposed[i]/amounts_actual[i]-1));
					Qualtrics.SurveyEngine.setEmbeddedData('depense_'+i, amounts_proposed[i]);	}
				Qualtrics.SurveyEngine.setEmbeddedData('depense_totale', amounts_proposed[nb_categories]);
				Qualtrics.SurveyEngine.setEmbeddedData('variation_totale', 100*(amounts_proposed[nb_categories]/total_actual-1));
				Qualtrics.SurveyEngine.setEmbeddedData('recette_totale', total_revenue);
				Qualtrics.SurveyEngine.setEmbeddedData('variation_recette', 100*(total_revenue/revenue_actual-1));
				var deficit_proposed = deficit + revenue_actual - total_revenue;
				var budget_neutral = total_actual-deficit_proposed;
				var golden_rule = total_actual-deficit_proposed+0.03*gdp;
				Qualtrics.SurveyEngine.setEmbeddedData('budget_neutral', budget_neutral);
				Qualtrics.SurveyEngine.setEmbeddedData('golden_rule', golden_rule);
			}
			
	        slider_total.attachEvent("onChange",function(pos,slider){
				amounts_proposed[nb_categories] = total_actual*(1+pos/100);
				var diff_variation_total = pos - variation[nb_categories];
				for (i=0; i<nb_categories-2; i++) { // -2: modification DGFIP pour empêcher de bouger charge de la dette et UE
					var pos_i = sliders[i].getValue();
					if (Math.abs(pos_i)<max_evolution | (pos_i==max_evolution & amounts_proposed[i]<=(1+max_evolution/100)*amounts_actual[i]) |
						(pos_i==-max_evolution & amounts_proposed[i]==(1-max_evolution/100)*amounts_actual[i])) {
						sliders[i].setValue(pos_i + diff_variation_total); }
					amounts_proposed[i] += diff_variation_total*amounts_actual[i]/100;
    				var sign='';
					if (amounts_proposed[i]/amounts_actual[i]-1>0) { sign='+'; }
		        	$('#Slider_'+i+'_variation').text(sign+''+Math.round(1000*(amounts_proposed[i]/amounts_actual[i]-1))/10+'%     ');
		        	$('#Slider_'+i+'_amount').text(Math.round(amounts_proposed[i])+' Mds €')
				}
				variation[nb_categories] = pos;
				var sign='';
				if (variation[nb_categories]>0) { sign='+'; }
	        	$('#Slider_total_variation').text(sign+''+variation[nb_categories]+'%     ');
	        	$('#Slider_total_amount').text(Math.round(amounts_proposed[nb_categories]));
		        //save_proposition();
				$('#figure').empty();
			 	load_bars();
	        	deficit_proposed = amounts_proposed[nb_categories] - total_revenue; // deficit + revenue_actual - total_revenue;
	        	if (deficit_proposed>0) {
	        		$('#deficit').css('color', 'red');
	        		sign='';
	        	} else {
	        		$('#deficit').css('color', 'green')
	        		sign='+';
	        	}
		        $('#deficit').text(Math.round(-1000*deficit_proposed/gdp)/10+'%');
		        // $('#deficit').text(sign+Math.round(-1000*deficit_proposed*total_depenses/(total_actual*gdp))/10+'%');
	        });
	        
	        slider_recette.attachEvent("onChange",function(pos,slider){
				total_revenue = revenue_actual*(1+pos/100);
				var sign='';
				if (pos>0) { sign='+'; }
	        	$('#Slider_recette_variation').text(sign+''+pos+'%     ');
	        	$('#Slider_recette_amount').text(Math.round(total_revenue));
	        	$('#Text_deficit').css('left', 115+scaling_factor*total_revenue);
		        //save_proposition();
				$('#figure').empty();
			 	load_bars();
	        	deficit_proposed = amounts_proposed[nb_categories] - total_revenue; // deficit + revenue_actual - total_revenue;
	        	if (deficit_proposed>0) {
	        		$('#deficit').css('color', 'red');
	        		sign='';
	        	} else {
	        		$('#deficit').css('color', 'green')
	        		sign='+';
	        	}
	        	$('#deficit').text(sign+Math.round(-1000*deficit_proposed/gdp)/10+'%');
	        });	        
			for (i=0; i<nb_categories; i++) {
	        	$('#Sliders').append('<div style="line-height:1.8em; display:inline; vertical-align:top" id="Slider_'+i+'" data-id="' + 
	        		i + '"></div><div style="display:inline">&emsp;<span id="Slider_'+
	        		i+'_variation" style="font-weight: bold;">'+Math.round(amounts_proposed[i]/amounts_actual[i]-1)+'%     </span>	<span id="Slider_'+
	        		i+'_amount">'+Math.round(amounts_proposed[i])+' Mds €</span><span id="Slider_'+i+'_name">&emsp;'+names[i]+
	        		'     </span><span id="Slider_'+i+'_mean" style="color:blue"	></span></div><br>'); 
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

		        var col="";
		        if (i!=10) { col = d3.range(20).map(color)[i]; 
		        } else { col = "darkblue"; }
				$('#Slider_'+i+' .dhxsl_runner').css('background', col);
				$('#Slider_'+i+'_name').css('color', col);

				if (i<nb_categories-2) { // modification DGFIP pour empêcher de bouger charge de la dette et UE
		        sliders[i].attachEvent("onChange",function(pos,slider){
		        	var j = $(slider.base).data("id"); // "j==i"
					if ($('#Fixed_total').is(':checked')) {
						amounts_proposed[j] = amounts_actual[j]*(1+pos/100);
						var diff_amount_j = amounts_actual[j]*(pos - variation[j])/100;
						for (l=0; l<nb_categories-2; l++) { // -2: modification DGFIP pour empêcher de bouger charge de la dette et UE
							var pos_l = Math.max(-max_evolution, Math.min(max_evolution, (amounts_proposed[l]/amounts_actual[l]-1)*100))
							if (l!=j) { 
								amounts_proposed[l] -= diff_amount_j*amounts_proposed[l]/(amounts_proposed[nb_categories]-amounts_proposed[j]); }
							// TODO: other mode of calculation for line above? Now, the adjustment takes place pro rata to amounts proposed,
							//       and doesn't take into account the preferences for variation.
							//       We could instead try to tamper the variations of the same sign of the current one (diff_amount_j) (more cumbersome)
							
							var variation_l = 100*(amounts_proposed[l]/amounts_actual[l]-1);
							if (Math.abs(pos_l)<max_evolution | (pos_l==max_evolution & amounts_proposed[l]<=(1+max_evolution/100)*amounts_actual[l]) |
								(pos_l==-max_evolution & amounts_proposed[l]==(1-max_evolution/100)*amounts_actual[l])) {
								sliders[l].setValue(variation_l); }
	        				var sign='';
							if (variation_l>0) { sign='+'; }
				        	$('#Slider_'+l+'_variation').text(sign+''+Math.round(variation_l*10)/10+'%     ');
				        	$('#Slider_'+l+'_amount').text(Math.round(amounts_proposed[l])+' Mds €');							
						}
						amounts_proposed[j] = amounts_proposed[nb_categories];
						for (h=0; h<nb_categories; h++) { if (h!=j) { amounts_proposed[j] -= amounts_proposed[h]; } }
					} else {
						amounts_proposed[j] = amounts_actual[j]*(1+pos/100);
						var total_proposed = 0;
						for (k=0; k<nb_categories; k++) { total_proposed += amounts_proposed[k]; }
						amounts_proposed[nb_categories] = total_proposed;
						variation[nb_categories] = 100*(total_proposed/total_actual-1);
						slider_total.setValue(variation[nb_categories]);
        				var sign='';
						if (variation[nb_categories]>0) { sign='+'; }
			        	$('#Slider_total_variation').text(sign+''+Math.round(variation[nb_categories]*10)/10+'%     ');
			        	$('#Slider_total_amount').text(Math.round(amounts_proposed[nb_categories]));
					}
					variation[j] = 100*(amounts_proposed[j]/amounts_actual[j]-1);
					sign='';
					if (variation[j]>0) { sign='+'; }
		        	$('#Slider_'+j+'_variation').text(sign+''+Math.round(variation[j]*10)/10+'%     ');
		        	$('#Slider_'+j+'_amount').text(Math.round(amounts_proposed[j])+' Mds €');
		        	//save_proposition();
					$('#figure').empty();
					load_bars();	
        			deficit_proposed = amounts_proposed[nb_categories] - total_revenue; // deficit + revenue_actual - total_revenue;
		        	if (deficit_proposed>0) {
		        		$('#deficit').css('color', 'red');
		        		sign='';
		        	} else {
		        		$('#deficit').css('color', 'green')
		        		sign='+';
		        	}
		        $('#deficit').text(Math.round(-1000*deficit_proposed/gdp)/10+'%');
		        // $('#deficit').text(sign+Math.round(-1000*deficit_proposed*total_depenses/(total_actual*gdp))/10+'%');
	        	});

				}
	        }

	        $('#enregistrer').click(function(){
	         	$.post( 'simulateur_depenses.php',
	                { 'dep0': amounts_proposed[0], 'dep1': amounts_proposed[1], 'dep2': amounts_proposed[2], 'dep3': amounts_proposed[3], 'dep4': amounts_proposed[4], 
	                'dep5': amounts_proposed[5], 'dep6': amounts_proposed[6], 'dep7': amounts_proposed[7], 'dep8': amounts_proposed[8], 'dep9': amounts_proposed[9],
	                'dep10': amounts_proposed[10], 'dep11': amounts_proposed[11], 'dep12': amounts_proposed[12], 'dep13': amounts_proposed[13], 
	                 'recette': total_revenue, 'dep_tot': amounts_proposed[nb_categories]}, // .toString()
	                function(info){});
                    $('#enregistrer').hide();
                    // alert('Félicitations ! Vos dépenses ont été enregistrées !');
        	});
			
			// $('#out').text(donnees['dep_tot']);
		    $.ajax({
		        url : 'moyenne.csv',
		        success : function (data) {
					var tab=data.split(',');
					var n = tab.length;
					var dep_tot = Math.round(1000*(tab[0]/total_actual-1))/10; // tab[0];
					var recette = Math.round(1000*(tab[1]/revenue_actual-1))/10; // tab[1];
					var dep = new Array(n-2);
					for (var i = 2; i<n; i++) {	
						dep[i-2] = Math.round(1000*(tab[i]/amounts_actual[i-2]-1))/10;	}	//tab[i]
					$('#affiche_moyenne').click( function() {
		        		if ($('#affiche_moyenne').is(':checked')) {
		        			var sign='';
							if (dep_tot>0) { sign='+'; }
		        			$('#Slider_total_mean').text(sign+dep_tot+'%');
		        			var sign='';
							if (recette>0) { sign='+'; }
		        			$('#Slider_recette_mean').text(sign+recette+'%');
		        			for (var i = 0; i<n-2; i++) {
		        				var sign='';
								if (dep[i]>0) { sign='+'; }
		        				$('#Slider_'+i+'_mean').text(sign+''+dep[i]+'%');
		        			}
		        			if (recette>dep_tot) { sign='+'}
		        			else { sign='' }
		        			$('#deficit_moyen').text(Math.round(1000*(tab[1] - tab[0])/gdp)/10+'%');
		        		} else {
		        			$('#Slider_total_mean').text('');
		        			$('#Slider_recette_mean').text('');
		        			for (var i = 0; i<n-2; i++) $('#Slider_'+i+'_mean').text('');
		        			$('#deficit_moyen').text('');
		        		}
		        	});
		        },
		        error : function () {
		           alert("error reading $donnees in JS");
		        }
		    });


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

});