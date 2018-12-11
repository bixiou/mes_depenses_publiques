<!DOCTYPE html> 

<html>  
    <head>
        <meta charset="UTF-8">    
        <title>Simulation de l'impôt</title>  

        <link rel="stylesheet" type="text/css" href="../../We give the 99 percents/jquery-ui-1.10.4/themes/base/jquery-ui.css"/>        
        <script type="text/javascript" src="../../We give the 99 percents/Simulation impot/jquery.js"></script>
        <script type="text/javascript" src="../../We give the 99 percents/Simulation impot/jquery-ui.js">    </script> 
        <script type="text/javascript" src="../../We give the 99 percents/Simulation impot/jquery.svg.js"></script>
        <script type="text/javascript" src="../../We give the 99 percents/Simulation impot/jquery.svgdom.js"></script> 
<!--
        <link rel="stylesheet" type="text/css" href="jquery-ui-1.10.4/themes/base/jquery-ui.css"/>        
        <script type="text/javascript" src="Simulation impot/jquery.js"></script>
        <script type="text/javascript" src="Simulation impot/jquery-ui.js">    </script> 
        <script type="text/javascript" src="Simulation impot/jquery.svg.js"></script>
        <script type="text/javascript" src="Simulation impot/jquery.svgdom.js"></script>
-->
        <script src="../dhtmlxSlider_v50_std/codebase/dhtmlxslider.js"></script>
        <link rel="STYLESHEET" type="text/css" href="../dhtmlxSlider_v50_std/sources/dhtmlxSlider/codebase/skins/dhtmlxslider_dhx_skyblue.css">
        <script src="http://d3js.org/d3.v3.min.js"></script>  <!-- http://cdnjs.cloudflare.com/ajax/libs/d3/3.4.13/d3.min.js -->

        <script type="text/javascript" src="simulateur_depenses.js"></script> <!-- algo_av&des moy_actuel_utilitarien nivvie  -->
        <!--<script type="text/javascript" src="d3_test.js"></script>-->

<style>
body {
    font-family: arial;
    font-size: 1.1em;
}

.axis path,
.axis line {
  fill: none;
  stroke: #000;
  shape-rendering: crispEdges;
}

</style>
       
    </head>  
    <body> 
        <span id="out"></span><span id="tr"></span> <!-- github.com/bixiou/mes_depenses_publiques -->
    <div style="width:1100px">
        <div style="display:inline-block; width=250px; vertical-align:top;">
            <br><span style="line-height:1.7em">Dépenses publiques</span><br>
            <span style="float:right">Actuelles</span><br><br>
            <span style="float:right">Souhaitées</span>
        </div>
        <div id="figure" style="display:inline-block; width=800px;"></div>
        <div style="display:inline-block; width=50px; vertical-align:top;"><br><span style="line-height:1.7em">Mds&nbsp;€</span></div>
    </div>
    <div id="Text_deficit" style="left:700px; position:relative; vertical-align:top; float:left;"><span style="color:green">Équilibre</span>
        <span style="color:red">&emsp;3% de déficit</span>&emsp;&emsp;&emsp;Déficit&nbsp;:&nbsp;<span id="deficit" style="color:red"></span>&emsp;
        <span id="deficit_moyen" style="color:blue"></span></div>
    <form><br><input type="checkbox" id="Fixed_total"> Bloquer la dépense totale au montant désiré
    &emsp;&emsp;<input type="checkbox" id="affiche_moyenne"><span  style="color:blue">Affiche la moyenne des propositions</span>
    &emsp;&emsp;<input type="button" name="Enregistrer" id="enregistrer" value="Enregistrer ma proposition !"></form><br>
    <div id="Slider_recette"  style="line-height:1.8em; display:inline; vertical-align:top"></div>
<!--    <div style="display:inline"><span id="Slider_recette_text">&emsp;Recettes  (impôts...)</span>
    <span id="Slider_recette_variation"style="font-weight: bold;">0%     </span> 
    <span id="Slider_recette_amount"></span>&nbsp;milliards d'euros (Mds&nbsp;€)</div><br>
    <div id="Slider_total"></div>
    <span id="Slider_total_text">&emsp;Dépense totale    </span>
    <span id="Slider_total_variation"style="font-weight: bold;">0%     </span> 
    <span id="Slider_total_amount"></span>&nbsp;Mds&nbsp;€<br><br> -->
    &emsp;<span id="Slider_recette_variation"style="font-weight: bold;">0%</span> 
    <span id="Slider_recette_amount"></span>&nbsp;Mds&nbsp;€
    <span id="Slider_recette_text">&emsp;Recettes  (impôts...)</span>
    <span id="Slider_recette_mean" style="color:blue"></span></div><br>
    <div id="Slider_total"></div>
    &emsp;<span id="Slider_total_variation"style="font-weight: bold;">0%</span> 
    <span id="Slider_total_amount"></span>&nbsp;Mds&nbsp;€
    <span id="Slider_total_text">&emsp;Dépense totale    </span>
    <span id="Slider_total_mean" style="color:blue"></span><br><br>
    <div id="Sliders"></div>
    
            <?php
            try
            {
                $bdd = new PDO('mysql:host=localhost;dbname=depenses_publiques', 'root', ' ');
            }
            catch(Exception $e)
            {
                die('Erreur : '.$e->getMessage());
            }
            $req = $bdd->query('SELECT AVG(dep_tot) as dep, AVG(recette) as rev, AVG(dep0) as m0, AVG(dep1) as m1, AVG(dep2) as m2, AVG(dep3) as m3, AVG(dep4) as m4, 
                                AVG(dep5) as m5, AVG(dep6) as m6, AVG(dep7) as m7, AVG(dep8) as m8, AVG(dep9) as m9, AVG(dep10) as m10, AVG(dep11) as m11, 
                                AVG(dep12) as m12, AVG(dep13) as m13 FROM depenses');
            // $req = $bdd->query('SELECT AVG(dep_tot), AVG(recette), AVG(dep0), AVG(dep1), AVG(dep2), AVG(dep3), AVG(dep4), 
            //                     AVG(dep5), AVG(dep6), AVG(dep7), AVG(dep8), AVG(dep9), AVG(dep10) AVG(dep11), 
            //                     AVG(dep12), AVG(dep13) FROM depenses');
            $donnees = $req->fetch(PDO::FETCH_ASSOC);
            // echo $donnees;
            $fp = fopen('moyenne.csv', 'w');
            fputcsv($fp, $donnees);
            fclose($fp);
            $req->closeCursor();            
            if (isset($_POST['dep0']))
            {
                $req = $bdd->prepare('INSERT INTO depenses (dep_tot, recette, dep0, dep1, dep2, dep3, dep4, dep5, dep6, dep7, dep8, dep9, dep10, dep11, dep12, dep13) 
                    VALUES(:dep_tot, :recette, :dep0, :dep1, :dep2, :dep3, :dep4, :dep5, :dep6, :dep7, :dep8, :dep9, :dep10, :dep11, :dep12, :dep13)');
                $req->execute(array('dep_tot' => htmlspecialchars($_POST['dep_tot']), 'recette' => htmlspecialchars($_POST['recette']), 
                    'dep0' => htmlspecialchars($_POST['dep0']), 'dep1' => htmlspecialchars($_POST['dep1']), 'dep2' => htmlspecialchars($_POST['dep2']), 
                    'dep3' => htmlspecialchars($_POST['dep3']), 'dep4' => htmlspecialchars($_POST['dep4']), 'dep5' => htmlspecialchars($_POST['dep5']), 
                    'dep6' => htmlspecialchars($_POST['dep6']), 'dep7' => htmlspecialchars($_POST['dep7']), 'dep8' => htmlspecialchars($_POST['dep8']), 
                    'dep9' => htmlspecialchars($_POST['dep9']), 'dep10' => htmlspecialchars($_POST['dep10']), 'dep11' => htmlspecialchars($_POST['dep11']), 
                    'dep12' => htmlspecialchars($_POST['dep12']), 'dep13' => htmlspecialchars($_POST['dep13'])));
                $req->closeCursor();
            }
            ?>
    </body>
</html>
