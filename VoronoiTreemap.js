var VoronoiTreemap = {

    debugMode: false,
    firstIteration: true,
    nearlyOne: 0.99,
    preflowPercentage: 0.08,
    useNegativeWeights: true,
    useExtrapolation: false,
    cancelOnAreaErrorThreshold: true,
    cancelOnMaxIterat: true,
    errorAreaThreshold: 0,
	//errorAreaThreshold: 5.0, // try to stop the crashes (doesn't seem to help too much)
    clipPolygon: [],
    guaranteeInvariant:false,
    sites: [],
    numberMaxIterations: 0,
    completeArea: 1,
    preflowFinished: false,
    maxDelta: 0,
    diagram: [],
    currentMaxError: 0,
    currentAreaError: 0,
    currentEuclidChange: 0,
    lastMaxWeight: 0,
    lastAreaError: 1,
    lastAVGError: 1,
    lastMaxError: 1E10,
    lastSumErrorChange: 1,
    lastEuclidChange: 0,
    currentMaxNegativeWeight: 0,
    aggressiveMode: false,
    boundingSites: [],
    seed: 25, 

    init:function(bounding_polygon, node) {
        this.clear();
        var sites = [];
        var random_points = this.getRandomPointsInPolygon(bounding_polygon, node.children.length);
        for (var c = 0; c < node.children.length; c++) {
	    // calculate percentage weights
            var size = (node.children[c].value * 1.0 / node.value)
            sites.push(new Vertex(random_points[c][0],random_points[c][1], null, epsilon, null, false, size));
        }


        return sites;
    },

    getPolygonBoundingRect:function(polygon) {
	var x_list = polygon.map(function(p) {return p[0];});
	var y_list = polygon.map(function(p) {return p[1];});
	var x_min = Math.min.apply(null, x_list);
	var x_max = Math.max.apply(null, x_list);
	var y_min = Math.min.apply(null, y_list);
	var y_max = Math.max.apply(null, y_list);
	return {"x":x_min,"y":y_min,"w":(x_max-x_min),"h":(y_max-y_min)};
    },
    doesPolygonContain:function(polygon, point) {
	var contains = false;
	// could check bounds first (as above)
	for (var i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
	    if ((((polygon[i][1] <= point[1]) && (point[1] < polygon[j][1]) ||
		  ((polygon[j][1] <= point[1]) && (point[1] < polygon[i][1]))) &&
		 (point[0] < (polygon[j][0] - polygon[i][0]) * (point[1] - polygon[i][1]) / (polygon[j][1] - polygon[i][1]) + polygon[i][0]))) {
		contains = !contains;
	    }
	}
	return contains;
    },

    random:function() {
        var x = Math.sin(this.seed++) * 10000;
        return x - Math.floor(x);
    },

    getRandomPointsInPolygon:function(polygon, n_points) {
	// get bounding rect
	var rect = this.getPolygonBoundingRect(polygon);
	var result = []
	for (var i = 0; i < n_points; i++) {
            var p = [rect.x + Math.random() * rect.w, rect.y + Math.random() * rect.h];
            //	    var p = [rect.x + this.random() * rect.w, rect.y + this.random() * rect.h];
	    // see if p in polygon itself
	    //console.log(p)
	    if (this.doesPolygonContain(polygon, p)) {
		//console.log("does contain");
		result.push(p);
	    }
	    else {
		//console.log("does NOT contain");
		i--; // try again
	    }
	}

        // result = [];
	// result[0] = [130.92696687905118,91.98442592052743];
	// result[1] = [392.4537549354136,212.1577649912797];
	// result[2] = [260.31649184413254,26.87118007801473];
        // result[3] = [327.5536074768752,504.62498559616506];
	// result[4] = [261.0148494830355,14.232384245842695];
	// result[5] = [424.6814074809663,501.3572446606122];
	// result[6] = [234.0266134799458,33.144795794505626];
	// result[7] = [325.7570087816566,298.1421837885864];

        //console.log("Result: " + result);
	return result;
    },
    

    clear: function(){
        this.debugMode = false;
        this.firstIteration = true;
        this.nearlyOne = 0.99;
        this.preflowPercentage = 0.08;
        this.useNegativeWeights = true;
        this.useExtrapolation = false;
        //        this.cancelOnAreaErrorThreshold = true;
        this.cancelOnMaxIterat = true;
        //        this.errorAreaThreshold = 1000;
        this.firstIteration = true;
        this.clipPolygon= [];
        this.sites= [];
        this.numberMaxIterations= 0;
        this.completeArea= 1;
        this.preflowFinished= false;
        this.maxDelta= 0;
        this.diagram= [];
        this.currentMaxError= 0;
        this.currentAreaError= 0;
        this.currentEuclidChange = 0;
        this.lastMaxWeight = 0;
        this.lastAreaError = 1;
        this.lastAVGError = 1;
        this.lastMaxError = 1E10;
        this.lastSumErrorChange = 1;
        this.lastEuclidChange = 0;
        this.currentMaxNegativeWeight = 0;
        this.aggressiveMode = false;
        this.boundingSites = [];
    },
    max: function(list){
        var max = null;
        for (var i = 1; i < list.length; i++) {
            if (list[i] > max){
                max = list[i];
            }
        }
        return max;
    },
    min: function(list){
        var min = null;
        for (var i = 1; i < list.length; i++) {
            if (list[i] < min){
                min = list[i];
            }
        }
        return min;
    },

    setClipPolygon: function(polygon){
        this.clipPolygon = d3.geom.polygon(polygon);
        this.maxDelta = Math.max(polygon[2][0] - polygon[0][0], polygon[2][1] - polygon[0][1]); // TODO: assumes polygon is a square starting in the upper left corner.

        this.boundingSites = [];

        var maxX = this.max(polygon.map(function(a) {return a[0];}));
        var minX = this.min(polygon.map(function(a) {return a[0];}));
        var maxY = this.max(polygon.map(function(a) {return a[1];}));
        var minY = this.min(polygon.map(function(a) {return a[1];}));

        var x0 = minX - maxX;
        var x1 = 2 * maxX;
        var y0 = minY - maxY;
        var y1 = 2 * maxY;

        var result = [];
        result[0] = [x0, y0];
        result[1] = [x1, y0];
        result[2] = [x1, y1];
        result[3] = [x0, y1];

        for (var i = 0; i < result.length; i++){
            this.boundingSites[i] = new Vertex(result[i][0], result[i][1], null, epsilon, new Vertex(result[i][0], result[i][1], null, epsilon, null, true), true);
        }


    },

    // getMinDistanceToBorder(polygon, point){
    //     var result = this.computeDistanceBorder(polygon, point);
    //     for (var i = 0; i < polygon.length; i++){
            
    //     }
    // },

    // http://en.wikipedia.org/wiki/Distance_from_a_point_to_a_line
    computeDistanceBorder:function(polygon, point) { // Getting somewhat higher results than Java
	for (var i = 0; i < polygon.length; i++) {
	    var p1 = polygon[i];
	    if (i+1 < polygon.length) {
                var p2 = polygon[i+1];
            }
	    else {
                var p2 = polygon[0];
            }
	    
	    var dx = p1[0] - p2[0];
	    var dy = p1[1] - p2[1];
	    
	    var d = Math.abs(dy * point[0] - dx * point[1] + p1[0]*p2[1] - p2[0]-p1[1]) / Math.sqrt(dx*dx + dy*dy);
            
	    if (i == 0 || d < result) {
                var result = d;
            }
	}
        
	return result;
    },

    // final double px = x2-x1;
    // 	final double py = y2-y1;
    // 	final double d= Math.sqrt(px * px + py * py);
    
    // 	final double u = ((x3-x1)*(x2-x1)+(y3-y1)*(y2-y1))/(d*d);
    // 	final double kx = x1+u*(x2-x1);
    // 	final double ky=y1+u*(y2-y1);
    
    // 	final double dkx = x3-kx;
    // 	final double dky = y3-ky;
    // 	return Math.sqrt(dkx*dkx+dky*dky);

	// public double getMinDistanceToBorder(double x, double y) {
	//     double result = Geometry.distancePointToSegment(this.x[length - 1],
	// 			                            this.y[length - 1], this.x[0], this.y[0], x, y);
	//     for (int i = 0; i < (length - 1); i++) {
	// 	double distance = Geometry.distancePointToSegment(this.x[i],
	// 				                          this.y[i], this.x[i + 1], this.y[i + 1], x, y);
	// 	if (distance < result) {
	// 	    result = distance;
	// 	}
	//     }
	//     return result;

	// }
    normalizeSites: function(sites){
        var sum = 0;
        for (var z = 0; z < sites.length; z++){
            var s = sites[z];
            sum += s.percentage; // TODO: actually the same as getPercentage?
        }
        for (var z = 0; z < sites.length; z++){
            var s = sites[z];
            s.percentage = (s.percentage / sum);
        }
    },

    voroDiagram: function(){
        this.diagram = computePowerDiagramIntegrated(this.sites, this.boundingSites, this.clipPolygon);
    },

    distance: function(p1, p2){
        var dx = p1[0] - p2[0];
        var dy = p1[1] - p2[1]
        return Math.sqrt((dx*dx) + (dy*dy));
    },

    getMinNeighbourDistance: function(point){
        var minDistance = 1E10; // TODO: max value?
        for (var i = 0; i < point.neighbours.length; i++){
            var distance = this.distance(point.neighbours[i], point);
            if (distance < minDistance){
                minDistance = distance;
            }
        }
        return minDistance;
    },

    iterate: function(){
        var polygons = [];
//        console.log("iterate()");
        
	this.currentMaxNegativeWeight=0;
	this.currentEuclidChange = 0;
	this.currentAreaError = 0;
	this.currentMaxError = 0;

        this.completeArea = this.clipPolygon.area(); // TODO: make sure this works

        var errorArea = 0;

        // ***
        // TODO: omitting extrapolation code here
        // ***

        // Move to centers
        for (var z = 0; z < this.sites.length; z++){
            var point = this.sites[z];
            var error = 0;
            var percentage = point.percentage; // TODO: Same as percentage?

            var poly = point.polygon; // TODO: make site a "class"? Anyways, this may be null
            if (poly != null){
                var centroid = poly.centroid();
                var centroidX = centroid[0];
                var centroidY = centroid[1];
                var dx = centroidX - point.x;
                var dy = centroidY - point.y;
                this.currentEuclidChange += (dx*dx) + (dy*dy);
                var currentArea = poly.area();
                var wantedArea = completeArea * point.percentage; // TODO: Same as percentage?
                // var increase = (wantedArea / currentArea); // not used
                error = Math.abs(wantedArea - currentArea);
                // Omitted minDistanceClipped because its use is within extrapolation code
                //
                //

                //                var minDistance = point.nonClippedPolygon.getMinDistanceToBorder(centroidX, centroidY); // TODO
                var minDistance = this.computeDistanceBorder(point.nonClippedPolygon, centroid);
   
                var weight = Math.min(point.weight, minDistance * minDistance);
                if (weight < 1E-8){
                    weight = 1E-8;
                }
                
                point.x = centroidX;
                point.y = centroidY;
                point.setWeight(weight);

            }
            
            error = error / (completeArea * 2);
            
            errorArea += error;
        }

        this.currentAreaError += errorArea;

        this.voroDiagram();

        // var sitesCopy = null;
        // Omitting because guaranteeInvariant is always false
        //
        //
        for (var z = 0; z < this.sites.length; z++){
            var point = this.sites[z];
            var poly = point.polygon; // Definitely should not be null
            var completeArea = this.clipPolygon.area();
            var currentArea = poly.area();
            var wantedArea = completeArea * point.percentage // TODO: same as percentage?

            var currentRadius = Math.sqrt(currentArea/Math.PI);
            var wantedRadius = Math.sqrt(wantedArea/Math.PI);
            var deltaCircle = currentRadius - wantedRadius;

            var increase = wantedArea / currentArea;
            
            if (!this.aggressiveMode){
                increase = Math.sqrt(increase);
            }

            var minDistance = 0;
            // Omitted because guaranteeInvariant is never true
            //
            minDistance = this.getMinNeighbourDistance(point); // TODO
            minDistance = minDistance * this.nearlyOne;

            var radiusOld = Math.sqrt(point.weight);
            var radiusNew = radiusOld * increase;
            
            var deltaRadius = radiusNew - radiusOld;
            if (radiusNew > minDistance){
                radiusNew = minDistance;
            }
            
            var finalWeight = radiusNew*radiusNew;
            
            if (this.useNegativeWeights){
                var center = poly.centroid();
                var distanceBorder = this.computeDistanceBorder(poly, center);
                var maxDelta = Math.min(distanceBorder, deltaCircle);
                if (finalWeight < 1E-4){
                    var radiusNew2 = radiusNew - maxDelta;
                    if (radiusNew2 < 0){
                    finalWeight = -(radiusNew2 * radiusNew2);
                        if (finalWeight < this.currentMaxNegativeWeight){
                            this.currentMaxNegativeWeight = finalWeight;
                        }
                    }
                }
            }

            //console.log("new weight: " + finalWeight + " : " + point);

            point.setWeight(finalWeight);
        }

        if (this.useNegativeWeights){
            
            if (this.currentMaxNegativeWeight < 0){
                this.currentMaxNegativeWeight += (1-this.nearlyOne);
                this.currentMaxNegativeWeight = -this.currentMaxNegativeWeight;
                for (var z = 0; z < this.sites.length; z++){
                    var s = this.sites[z];
                    var w = s.weight;
                    w += this.currentMaxNegativeWeight;
                    s.setWeight(w);
                }
            }
        }

        this.voroDiagram();

        this.currentMaxError = 0;
        for (var z = 0; z < this.sites.length; z++){
            var site = this.sites[z];
            var poly = site.polygon;
            var percentage = site.percentage // TODO: same as percentage?
            var wantedArea = completeArea * percentage;
            var currentArea = poly.area();
            var singleError = Math.abs(1 - ( currentArea / wantedArea));
            if (singleError > this.currentMaxError){
                this.currentMaxError = singleError;
            }
        }

        this.lastEuclidChange = this.currentEuclidChange / this.sites.length;
        this.lastSumErrorChange = Math.abs(this.lastAreaError - this.currentAreaError);
        this.lastAreaError = this.currentAreaError;
        this.lastMaxError = this.currentMaxError;
        this.lastAVGError = this.currentAreaError / this.sites.length;

        return this.sites.map(function(s) {return s.polygon;});
    },

    // Return list of polygons
    doIterate: function(iterationAmount){
        
        var polygons = [];
        
        if (this.sites.length == 1){
            polygons.push(this.clipPolygon);
            return polygons;
        }

        if (this.firstIteration){
            this.voroDiagram();
        }

        var k = 0;
        for (var i = 0; i < iterationAmount; i++){
            polygons = this.iterate();
            //console.log(i + ": error: " + this.lastMaxError);
            if (this.cancelOnAreaErrorThreshold && this.lastMaxError < this.errorAreaThreshold){
                break;
            }
        }

        return polygons;
    }

}
