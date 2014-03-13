

// IN: sites and weights
// OUT: sites with Z coordinate based on X,Y,and W
function applyDeltaPi(S, W){
    var result = [];
    for (var i in S){
        var x = S[i][0], y = S[i][1], w = W[i];
        result[i] = [x,y,w];//[x,y, (x*x) + (y*y) - w];
    }

    return result;
}


// IN: HEdge edge
function getFacesOfDestVertex(edge) {
    var faces = [];
    var previous = edge;
    var first = edge.dest;

    // var site = first.originalObject;
    var site = first;
    var neighbours = [];
    do {
	previous = previous.twin.prev;

	// add neighbour to the neighbourlist
//	var siteOrigin = previous.orig.originalObject;
	var siteOrigin = previous.orig;
	if (!siteOrigin.isDummy) {
	    neighbours.push(siteOrigin);
	}
	var iFace = previous.iFace;

	if (iFace.isVisibleFromBelow()) {
	    faces.push(iFace);
	}
    } while (previous !== edge);
    site.neighbours = neighbours; // TODO
    return faces;
}


// IN: Omega = convex bounding polygon
// IN: S = unique set of sites
// IN: W = set of weights for sites
// OUT: Set of lines making up the voronoi power diagram
function computePowerDiagram(S, W, boundingPolygon){
    var sStar = applyDeltaPi(S, W);
    
    ConvexHull.init(boundingPolygon, sStar);
    
    var facets = ConvexHull.compute(sStar);

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
		var site = destVertex; 
//		var site = destVertex.originalObject; 

		if (!verticesVisited[destVertex.index]) {

		    verticesVisited[destVertex.index] = true;
		    if (site.isDummy) { // Check if this is one of the
                        // sites making the bounding polygon
			continue;
		    }

		    // faces around the vertices which correspond to the
		    // polygon corner points

		    var faces = getFacesOfDestVertex(edge);
//                    var poly = new PolygonSimple(); // TODO replace
                    var protopoly = [];
                    // with D3 or some other polygon
		    var lastX = NaN;
		    var lastY = NaN;
		    var dx = 1;
                    var dy = 1;
		    for (var i =0; i < faces.length; i++) {
			var point = faces[i].getDualPoint();
			var x1 = point.x;
                        var y1 = point.y;
			if (lastX !== NaN){

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
		    site.nonClippedPolygon = d3.geom.polygon(protopoly);

		    if (!site.isDummy && site.nonClippedPolygon.length > 0) {
                        site.polygon = boundingPolygon.clip(site.nonClippedPolygon);
			polygons.push(boundingPolygon.clip(site.nonClippedPolygon));
                        console.log(site.polygon);
		    }
		}
	    }
	}
    }
    alert("done with computing power diagram!");

    return polygons;
}

