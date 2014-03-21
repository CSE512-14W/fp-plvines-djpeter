

// IN: sites and weights
// OUT: sites with Z coordinate based on X,Y,and W
function applyDeltaPi(S, W){
    var result = [];
    for (var i = 0; i < S.length; i++){
        var x = S[i].p[0], y = S[i].p[1], w = W[i];
        result[i] = [x,y, (x*x) + (y*y) - w];
    }

    return result;
}

function max(list){
    var max = null;
    for (var i = 1; i < list.length; i++) {
        if (list[i] > max){
            max = list[i];
        }
    }
    return max;
} 
function min(list){
    var min = null;
    for (var i = 1; i < list.length; i++) {
        if (list[i] < min){
            min = list[i];
        }
    }
    return min;
} 


// As applyDeltaPi, but applies a minimum weight
// IN: sites
// OUT: sites with Z coordinate based on X,Y,and W
function applyDeltaPiToBounds(S){
    var result = [];

    var maxX = max(S.map(function(a) {return a[0];}));
    var minX = min(S.map(function(a) {return a[0];}));
    var maxY = max(S.map(function(a) {return a[1];}));
    var minY = min(S.map(function(a) {return a[1];}));

    var x0 = minX - maxX;
    var x1 = 2 * maxX;
    var y0 = minY - maxY;
    var y1 = 2 * maxY;

    result[0] = [x0, y0, (x0 * x0) + (y0 * y0) - epsilon];
    result[1] = [x1, y0, (x1 * x1) + (y0 * y0) - epsilon];
    result[2] = [x1, y1, (x1 * x1) + (y1 * y1) - epsilon];
    result[3] = [x0, y1, (x0 * x0) + (y1 * y1) - epsilon];

    return result;
}


// IN: HEdge edge
function getFacesOfDestVertex(edge) {
    var faces = [];
    var previous = edge;
    var first = edge.dest;

    var site = first.originalObject;
    var neighbours = [];
    do {
	previous = previous.twin.prev;

	// add neighbour to the neighbourlist
	var siteOrigin = previous.orig.originalObject;
	if (!siteOrigin.isDummy) {
	    neighbours.push(siteOrigin);
	}
	var iFace = previous.iFace;

	if (iFace.isVisibleFromBelow()) {
	    faces.push(iFace);
	}
    } while (previous !== edge);
    site.neighbours = neighbours;
    return faces;
}


// IN: Omega = convex bounding polygon
// IN: S = unique set of sites
// IN: W = set of weights for sites
// OUT: Set of lines making up the voronoi power diagram
// function computePowerDiagram(S, W, boundingPolygon){
//     var sStar = applyDeltaPi(S, W);
//     var width = 1000;
//     var height = 1000;
//     // var temp = [];
//     // temp[0] = [0, 0];
//     // temp[1] = [width, 0];
//     // temp[2] = [width,height];
//     // temp[3] = [0, width];

//     // temp[0] = [-width, -height];
//     // temp[1] = [2 * width,  -height];
//     // temp[2] = [2*width, 2*height];
//     // temp[3] = [-width,  2 * height];
//     var bounds = applyDeltaPiToBounds(boundingPolygon);

//     ConvexHull.clear();

//     ConvexHull.init(bounds, sStar);
    
//     var facets = ConvexHull.compute(sStar);

//     // for (var i = 0; i < facets.length; i++){
//     //     var f = facets[i];
//     //     console.log(i + ": " + f.verts[0].x + ", " + f.verts[1].x + ", " + + f.verts[2].x);
//     // }
    
//     var polygons = [];
//     var vertexCount = ConvexHull.points.length; 
//     var verticesVisited = [];

//     var facetCount = facets.length;
//     for (var i = 0; i < facetCount; i++) {
// 	var facet = facets[i];

// 	if (facet.isVisibleFromBelow()) {

// 	    for (var e = 0; e < 3; e++) {
// 		// got through the edges and start to build the polygon by
// 		// going through the double connected edge list
// 		var edge = facet.edges[e];
// 		var destVertex = edge.dest;
// 		var site = destVertex.originalObject; 

// 		if (!verticesVisited[destVertex.index]) {
// 		    verticesVisited[destVertex.index] = true;
// 		    if (site.isDummy) { // Check if this is one of the
//                         // sites making the bounding polygon
// 			continue;
// 		    }

// 		    // faces around the vertices which correspond to the
// 		    // polygon corner points

// 		    var faces = getFacesOfDestVertex(edge);
//                     var protopoly = [];
// 		    var lastX = null;
// 		    var lastY = null;
// 		    var dx = 1;
//                     var dy = 1;
// 		    for (var j =0; j < faces.length; j++) {
// 			var point = faces[j].getDualPoint();
// 			var x1 = point.x;
//                         var y1 = point.y;
// 			if (lastX !== null){

// 			    dx = lastX - x1;
// 			    dy = lastY - y1;
// 			    if (dx < 0) {
// 				dx = -dx;
// 			    }
// 			    if (dy < 0) {
// 				dy = -dy;
// 			    }
// 			}
// 			if (dx > epsilon || dy > epsilon) {

// 			    protopoly.push([x1, y1]);
// 			    lastX = x1;
// 			    lastY = y1;

// 			}

// 		    }
// 		    site.nonClippedPolygon = d3.geom.polygon(protopoly.reverse());

// 		    if (!site.isDummy && site.nonClippedPolygon.length > 0) {
//                         //                        site.polygon = boundingPolygon.clip(site.nonClippedPolygon);
//                         var clippedPoly = boundingPolygon.clip(site.nonClippedPolygon);
//                         if (clippedPoly.length > 0){
//                             site.polygon = clippedPoly;
// 			    polygons.push(clippedPoly);
//                             console.log("pushed: " + polygons[polygons.length - 1]);
//                         }

// 		    }
// 		}
// 	    }
// 	}
//     }
//     console.log("finished computing power diagram");

//     return polygons;
// }


// IN: Omega = convex bounding polygon
// IN: S = unique set of sites with weights
// OUT: Set of lines making up the voronoi power diagram
function computePowerDiagramIntegrated(sites, boundingSites, clippingPolygon){
    //    var sStar = applyDeltaPi(S, S.map(function(s) {return s.weight;}));
    var width = 1000;
    var height = 1000;

    //    var bounds = applyDeltaPiToBounds(boundingPolygon);

    ConvexHull.clear();

    ConvexHull.init(boundingSites, sites);
    
    var facets = ConvexHull.compute(sites);

    // for (var i = 0; i < facets.length; i++){
    //     var f = facets[i];
    //     console.log(i + ": " + f.verts[0].x + ", " + f.verts[1].x + ", " + + f.verts[2].x);
    // }
    
    var polygons = [];
    var vertexCount = ConvexHull.points.length; 
    var verticesVisited = [];

    var facetCount = facets.length;
    for (var i = 0; i < facetCount; i++) {
	var facet = facets[i];

	if (facet.isVisibleFromBelow()) {

	    for (var e = 0; e < 3; e++) {
		// got through the edges and start to build the polygon by
		// going through the double connected edge list
		var edge = facet.edges[e];
		var destVertex = edge.dest;
		var site = destVertex.originalObject; 

		if (!verticesVisited[destVertex.index]) {
		    verticesVisited[destVertex.index] = true;
		    if (site.isDummy) { // Check if this is one of the
                        // sites making the bounding polygon
			continue;
		    }

		    // faces around the vertices which correspond to the
		    // polygon corner points

		    var faces = getFacesOfDestVertex(edge);
                    var protopoly = [];
		    var lastX = null;
		    var lastY = null;
		    var dx = 1;
                    var dy = 1;
		    for (var j =0; j < faces.length; j++) {
			var point = faces[j].getDualPoint();
			var x1 = point.x;
                        var y1 = point.y;
			if (lastX !== null){

			    dx = lastX - x1;
			    dy = lastY - y1;
			    if (dx < 0) {
				dx = -dx;
			    }
			    if (dy < 0) {
				dy = -dy;
			    }
			}
			if (dx > epsilon || dy > epsilon) {

			    protopoly.push([x1, y1]);
			    lastX = x1;
			    lastY = y1;

			}

		    }
		    site.nonClippedPolygon = d3.geom.polygon(protopoly.reverse());

		    if (!site.isDummy && site.nonClippedPolygon.length > 0) {
                        //                        site.polygon = boundingPolygon.clip(site.nonClippedPolygon);
                        var clippedPoly = clippingPolygon.clip(site.nonClippedPolygon);
                        site.polygon = clippedPoly;
                        if (clippedPoly.length > 0){
			    polygons.push(clippedPoly);
//                            console.log("pushed: " + polygons[polygons.length - 1]);
                        }

		    }
		}
	    }
	}
    }
//    console.log("finished computing power diagram");
    

    return polygons;
}

