
var clearId;
var numIterations = 100;
var numGenerators = 60;

$(document).ready(function() {
  $("#reset").bind("click", function() {
	clearInterval(clearId);
	computeCvd(numIterations, numGenerators);
  });
  $("#numiterations").val(numIterations);
  $("#numgenerators").val(numGenerators);
  
  $("#start").bind("click", function() {
	  setIterations($("#numiterations").val());
	  setGenerators($("#numgenerators").val());
	  clearInterval(clearId);
	  start(numIterations, numGenerators);
  });
  
  $("#stop").bind("click", function() {
	stop();
  });
  
  start(numIterations, numGenerators);
  
});

function setIterations(iterations) {
	var v = parseInt(iterations);
	if(is_int(v) && v > 0) {
		numIterations = v;
	} else {
		numIterations = 1;
		$("#numiterations").val(1);
	}
}

function setGenerators(generators) {
	var v = parseInt(generators);
	if(is_int(v) && v > 2) {
		numGenerators = v;
	} else {
		numGenerators = 3;
		$("#numgenerators").val(3);
	}
}

function start() {
	computeCvd(numIterations, numGenerators);
}

function stop() {
	clearInterval(clearId);
}

function getRandomArbitary (min, max) {
    return Math.random() * (max - min) + min;
}

function is_int(value){
	if((parseFloat(value) == parseInt(value)) && !isNaN(value))
		return true;
	else 
		return false;
}

function computeCvd(numIterations, numGenerators) {

	var iterationTime = 150;
	var iterations = 0;
	var w = 1000;
	var h = 600;
	var enclosing = [[20,100], [20,h/2],[300, h+60], [w-500, h], [w-30, h/2], [w-200, 30],[w/2,15]];
	var enclosingPolygon = d3.geom.polygon(enclosing);
	
	var vertices = d3.range(numGenerators).map(function(d, i) {
	  return [getRandomArbitary(w/2-150,w/2+150), getRandomArbitary(h/2-150,h/2+150)];
	});

	clearId = setInterval(function() {

		var voronoiPolygons = d3.geom.voronoi(vertices);
		draw("#chart", w, h, vertices, voronoiPolygons, enclosingPolygon);
		
		for(var i = 0; i < voronoiPolygons.length; i++) {
			var voronoiPolygon = voronoiPolygons[i];
			var centroid = d3.geom.polygon(enclosingPolygon.clip(voronoiPolygon)).centroid();
			if(!isNaN(centroid[0])) 
				vertices[i] = [centroid[0], centroid[1]];
		}
		
		iterations++;
		$("#iterations").text("Iterations: " + iterations);
		
		if(iterations === numIterations)
			clearInterval(clearId);

	}, iterationTime);

}

function draw(location, w, h, vertices, voronoi, enclosingPolygon) {

	$("#chart").empty();
	var svg = d3.select(location).append("svg").attr("width", w+100).attr("height", h+100);
	
	svg.selectAll("voronoi")
	.data(voronoi)
    .enter().append("path")
	.attr("class", function(d, i) { return i ? "q" + (i % 9) + "-9" : null; })
	.attr("d", function(d) {  
		return "M" + enclosingPolygon.clip(d).join("L") + "Z"; 
	})
	.attr("fill", function(d) {
		return "#33CC33";
	});
	
	svg.selectAll("circle").data(vertices).enter().append("circle")
	.attr("transform", function(d) { 
	 	if(!isNaN(d[0])) {
	 		return "translate(" + d[0] + "," + d[1] + ")"; 
		}
	})
	.attr("r", function(d) { 
		return 1;
	});
}