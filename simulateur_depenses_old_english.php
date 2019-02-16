<!DOCTYPE html> 

<html>  
    <head>
        <meta charset="UTF-8">    
        <title>Simulation de l'impôt</title>  
<!--
        <link rel="stylesheet" type="text/css" href="../../We give the 99 percents/jquery-ui-1.10.4/themes/base/jquery-ui.css"/>        
        <script type="text/javascript" src="../../We give the 99 percents/Simulation impot/jquery.js"></script>
        <script type="text/javascript" src="../../We give the 99 percents/Simulation impot/jquery-ui.js">    </script> 
        <script type="text/javascript" src="../../We give the 99 percents/Simulation impot/jquery.svg.js"></script>
        <script type="text/javascript" src="../../We give the 99 percents/Simulation impot/jquery.svgdom.js"></script> 
        <script src="dhtmlxSlider_v50_std/codebase/dhtmlxslider.js"></script>
        <link rel="STYLESHEET" type="text/css" href="dhtmlxSlider_v50_std/sources/dhtmlxSlider/codebase/skins/dhtmlxslider_dhx_skyblue.css">
-->

        <link rel="stylesheet" type="text/css" href="jquery-ui-1.10.4/themes/base/jquery-ui.css"/>        
        <script type="text/javascript" src="Simulation impot/jquery.js"></script>
        <script type="text/javascript" src="Simulation impot/jquery-ui.js">    </script> 
        <script type="text/javascript" src="Simulation impot/jquery.svg.js"></script>
        <script type="text/javascript" src="Simulation impot/jquery.svgdom.js"></script>
        <script src="../dhtmlxSlider_v50_std/codebase/dhtmlxslider.js"></script>
        <link rel="STYLESHEET" type="text/css" href="../dhtmlxSlider_v50_std/sources/dhtmlxSlider/codebase/skins/dhtmlxslider_dhx_skyblue.css">

        <script src="http://d3js.org/d3.v3.min.js"></script>  <!-- http://cdnjs.cloudflare.com/ajax/libs/d3/3.4.13/d3.min.js -->

        <script type="text/javascript" src="simulateur_depenses_old.js"></script> <!-- algo_av&des moy_actuel_utilitarien nivvie  -->
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
            <br><span style="line-height:1.7em">Public spending</span><br>
            <span style="float:right">Current</span><br><br>
            <span style="float:right">Desired</span>
        </div>
        <div id="figure" style="display:inline-block; width=800px;"></div>
        <div style="display:inline-block; width=50px; vertical-align:top;"><br><span style="line-height:1.7em">bn&nbsp;€</span></div>
    </div>
    <div id="Text_deficit" style="left:700px; position:relative; vertical-align:top; float:left;"><span style="color:green">Equilibrium</span><span style="color:red">&emsp;3% deficit</span></div>
    <form><br><input type="checkbox" id="Fixed_total"> Fix total spending to desid amount</form><br>
    <div id="container"><div id="zero" style="position: absolute; width: 1px; height: 422px; top: 215px; left: 208px;background-color: #000000; z-index: -1;"></div>
    <div id="Slider_recette"  style="line-height:1.8em; display:inline; vertical-align:top"></div>
    <div style="display:inline"><span id="Slider_recette_text">&emsp;Revenues  </span>
    <span id="Slider_recette_variation"style="font-weight: bold;">0%     </span> 
    <span id="Slider_recette_amount"></span>&nbsp;billion euros (bn&nbsp;€)</div><br>
    <div id="Slider_total"></div>
    <span id="Slider_total_text">&emsp;Total spending    </span>
    <span id="Slider_total_variation"style="font-weight: bold;">0%     </span> 
    <span id="Slider_total_amount"></span>&nbsp;bn&nbsp;€<br><br>
    <div id="Sliders"></div>
    <input type="button" name="Enregistrer" id="enregistrer" value="Save my proposal!">
    <input type="button" name="Affiche_moyenne" id="affiche_moyenne" value="Display proposals' average">

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
                                AVG(dep5) as m5, AVG(dep6) as m6, AVG(dep7) as m7, AVG(dep8) as m8, AVG(dep9) as m9, AVG(dep10) as m10 FROM depenses');
            $donnees = $req->fetch();
            // echo $donnees['m5'];
            $fp = fopen('moyenne.csv', 'w');
            fputcsv($fp, $donnees);
            fclose($fp);
            $req->closeCursor();            
            if (isset($_POST['dep0']))
            {
                echo 'aj';
                $req = $bdd->prepare('INSERT INTO depenses (dep_tot, recette, dep0, dep1, dep2, dep3, dep4, dep5, dep6, dep7, dep8, dep9, dep10) 
                    VALUES(:dep_tot, :recette, :dep0, :dep1, :dep2, :dep3, :dep4, :dep5, :dep6, :dep7, :dep8, :dep9, :dep10)');
                $req->execute(array('dep_tot' => htmlspecialchars($_POST['dep_tot']), 'recette' => htmlspecialchars($_POST['recette']), 
                    'dep0' => htmlspecialchars($_POST['dep0']), 'dep1' => htmlspecialchars($_POST['dep1']), 'dep2' => htmlspecialchars($_POST['dep2']), 
                    'dep3' => htmlspecialchars($_POST['dep3']), 'dep4' => htmlspecialchars($_POST['dep4']), 'dep5' => htmlspecialchars($_POST['dep5']), 
                    'dep6' => htmlspecialchars($_POST['dep6']), 'dep7' => htmlspecialchars($_POST['dep7']), 'dep8' => htmlspecialchars($_POST['dep8']), 
                    'dep9' => htmlspecialchars($_POST['dep9']), 'dep10' => htmlspecialchars($_POST['dep10'])));
                $req->closeCursor();
            }
            ?>
        </div>
    </body>
</html>