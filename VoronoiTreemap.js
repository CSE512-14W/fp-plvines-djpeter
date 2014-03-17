
var epsilon = 0.0000000001;

test_poly = [[0,0],[0,10],[10,10],[10,0]];
test_poly = d3.geom.polygon(test_poly);

var VoronoiTreemap = {

	/*
		public boolean contains(double inX, double inY) {
		boolean contains = false;
		if (bounds == null)
			getBounds();
		if (!bounds.contains(inX, inY)) {
			return false;
		}
		// Take a horizontal ray from (inX,inY) to the right.
		// If ray across the polygon edges an odd # of times, the point is
		// inside.
		for (int i = 0, j = length - 1; i < length; j = i++) {
			if ((((y[i] <= inY) && (inY < y[j]) || 
				 ((y[j] <= inY) && (inY < y[i]))) && 
				 (inX < (x[j] - x[i]) * (inY - y[i]) / (y[j] - y[i]) + x[i])))
				contains = !contains;
		}
		return contains;
	}
	*/
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


	getPolygonBoundingRect:function(polygon) {
		var x_list = polygon.map(function(p) {return p[0];});
		var y_list = polygon.map(function(p) {return p[1];});
		var x_min = Math.min.apply(null, x_list);
		var x_max = Math.max.apply(null, x_list);
		var y_min = Math.min.apply(null, y_list);
		var y_max = Math.max.apply(null, y_list);
		return {"x":x_min,"y":y_min,"w":(x_max-x_min),"h":(y_max-y_min)};
	},
	
	getRandomPointsInPolygon:function(polygon, n_points) {
		// get bounding rect
		rect = this.getPolygonBoundingRect(polygon);
		result = []
		for (var i = 0; i < n_points; i++) {
			var p = [rect.x + Math.random() * rect.w, rect.y + Math.random() * rect.h];
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
            console.log("Result: " + result);
		return result;
	},
	
	setSizeForAllNodes:function(node) {
		// assume we're good if we have a size
		if (!node.hasOwnProperty("size")) {
			var total = 0;
			for (var c = 0; c < node.children.length; c++) {
				total += this.setSizeForAllNodes(node.children[c]);
			}
			node.size = total;
		}
		return node.size;
	},
	
	// http://en.wikipedia.org/wiki/Distance_from_a_point_to_a_line
	computeDistanceBorder:function(polygon, point) {
		for (var i = 0; i < polygon.length; i++) {
			var p1 = polygon[i];
			if (i+1 < polygon.length) var p2 = polygon[i+1];
			else var p2 = polygon[0];
			
			var dx = p1[0] - p2[0];
			var dy = p1[1] - p2[1];
			
			var d = Math.abs(dy * point[0] - dx * point[1] + p1[0]*p2[1] - p2[0]-p1[1]) / Math.sqrt(dx*dx + dy*dy);
			if (i == 0 || d < result) var result = d;
		}
		return result;
	},
	
	adaptPositionsWeights:function(node, power_diagram, sites) {
            // TODO: problem, power_diagram may create fewer polygons than there are sites, in which case this is not a good loop.
		for (var s = 0; s < sites.length; s++) {
			sites[s].p = power_diagram[s].centroid();
			// Yeah..so this limit on the weight keeps it from achieving the desired areas...
			// however, removing it causes the optimization to break sometimes
			var limit_weight = false;
			if (limit_weight) {
				var distance_border = this.computeDistanceBorder(power_diagram[s], sites[s].p);
				var to_square = Math.min(Math.sqrt(sites[s].weight), distance_border);
				sites[s].weight = to_square * to_square;
			}
		}
	},
	
	squaredNorm:function(p1,p2) {
		var dx = p1[0] - p2[0];
		var dy = p1[1] - p2[1];
		return dx * dx + dy * dy;
	},
	
	adaptWeights:function(bounding_polygon, bounding_polygon_area, node, power_diagram, sites) {
		// O(n^2) nearest neighbor
		// note: to get O(n log n) you need to use, say, an ordinary voronoi diagram (see paper seciton 4.2)
		var nn_squaredNorm = [];
		// really stupid, twice as slow as needed
		for (var i = 0; i < sites.length; i++) {
			var best_squaredNorm = Number.MAX_VALUE;
			for (var j = 0; j < sites.length; j++) {
				if (i == j) continue;
				var dx = sites[i].p[0] - sites[j].p[0];
				var dy = sites[i].p[1] - sites[j].p[1];
				var squared_norm = dx * dx + dy * dy;
				if (squared_norm < best_squaredNorm) {
					best_squaredNorm = squared_norm;
				}
			}
			nn_squaredNorm.push(best_squaredNorm);
		}
		
		for (var s = 0; s < sites.length; s++) {
			var area_current = power_diagram[s].area();
			var area_target = bounding_polygon_area * sites[s].size_fraction;
			var f_adapt = area_target / area_current;
			var w_new = Math.sqrt(sites[s].weight) * f_adapt;
			var w_max = Math.sqrt(nn_squaredNorm[s]); // compute squareroots once?
			var to_square = Math.min(w_new, w_max);
			sites[s].weight = to_square * to_square;
			sites[s].weight = Math.max(sites[s].weight, epsilon);
		}
	},
	
	computeAreaError:function(bounding_polygon_area, power_diagram, sites) {
		// stuff...simple from Algorithm 1
		// note algorithm 1 lacks the Math.abs()    I think a typo
		var total_error = 0;
		for (var s = 0; s < sites.length; s++) {
			total_error += Math.abs(power_diagram[s].area() - bounding_polygon_area * sites[s].size_fraction);
		}
		return total_error / (2 * bounding_polygon_area);
	},
	
	// counterclockwise in GRAPHICS space
	testClipping:function() {
		p1 = [[0,0],[0,5],[5,5],[5,0]];
		p2 = [[0,0],[0,4],[4,4],[4,0]];
		p1 = d3.geom.polygon(p1);
		p2 = d3.geom.polygon(p2);
		return p1.clip(p2);
	},
	
	// copied from polygon.js
	d3_geom_polygonInside:function (p, a, b) {
		return (b[0] - a[0]) * (p[1] - a[1]) < (b[1] - a[1]) * (p[0] - a[0]);
	},
	
	// copied from polygon.js
	// Intersect two infinite lines cd and ab.
	d3_geom_polygonIntersect:function (c, d, a, b) {
		var x1 = c[0], x3 = a[0], x21 = d[0] - x1, x43 = b[0] - x3,
			y1 = c[1], y3 = a[1], y21 = d[1] - y1, y43 = b[1] - y3,
			ua = (x43 * (y1 - y3) - y43 * (x1 - x3)) / (y43 * x21 - x43 * y21);
		return [x1 + ua * x21, y1 + ua * y21];
	},
	
	// copied from polygon.js
	// Returns true if the polygon is closed.
	d3_geom_polygonClosed:function d3_geom_polygonClosed(coordinates) {
		var a = coordinates[0],
		    b = coordinates[coordinates.length - 1];
		return !(a[0] - b[0] || a[1] - b[1]);
	},
	
	/*function(subject) {
	// KEEP THIS A PURE REFERENCE
  var input,
      closed = d3_geom_polygonClosed(subject),
      i = -1,
      n = this.length - d3_geom_polygonClosed(this),
      j,
      m,
      a = this[n - 1], // this end
      b,
      c,
      d;

	  // first a is this end
	  // first b is this[0]
	  // a is set to b in loop
	  // so I just need a single a,b pair and keep the inner loop
  while (++i < n) { // iterate over "this"
    input = subject.slice();
    subject.length = 0;
    b = this[i]; // b is "this"
    c = input[(m = input.length - closed) - 1]; // c is "input end"
    j = -1;
    while (++j < m) {
      d = input[j]; // input begin
      if (d3_geom_polygonInside(d, a, b)) {
        if (!d3_geom_polygonInside(c, a, b)) {
          subject.push(d3_geom_polygonIntersect(c, d, a, b));
        }
        subject.push(d);
      } else if (d3_geom_polygonInside(c, a, b)) {
        subject.push(d3_geom_polygonIntersect(c, d, a, b));
      }
      c = d;
    }
    if (closed) subject.push(subject[0]);
    a = b;
  }

  return subject;
};
	*/
	
	clipPolygonByLine:function(polygon, a, b) {
		var closed = this.d3_geom_polygonClosed(polygon),
			j,
			m,
			c,
			d,
			result = [];
			
		c = polygon[(m = polygon.length - closed) - 1];
		j = -1;
		while (++j < m) {
			d = polygon[j];
			if (this.d3_geom_polygonInside(d, a, b)) {
				if (!this.d3_geom_polygonInside(c, a, b)) {
					result.push(this.d3_geom_polygonIntersect(c, d, a, b));
				}
				result.push(d);
			}
			else if (this.d3_geom_polygonInside(c, a, b)) {
				result.push(this.d3_geom_polygonIntersect(c, d, a, b));
			}
			c = d;
		}
		if (closed) result.push(result[0]);
		return d3.geom.polygon(result);
	},
	
	pointSquaredDistance:function(p1, p2) {
		var dx = p2[0] - p1[0];
		var dy = p2[1] - p1[1];
		var squared_norm = dx * dx + dy * dy;
		return squared_norm;
	},
	
	// returns array of 2 points, where counterclockwise order contains p1
	weightedMidpointLine:function(p1, w1, p2, w2) {
		// this is stupid and probably wrong
		var dx = p2[0] - p1[0];
		var dy = p2[1] - p1[1];
		var squared_norm = dx * dx + dy * dy;
		var norm = Math.sqrt(squared_norm);
		var ray_d = (squared_norm - (w2 - w1)) / (2 * norm);
		var dx_normed = dx / norm;
		var dy_normed = dy / norm;
		var mx = p1[0] + dx_normed * ray_d;
		var my = p1[1] + dy_normed * ray_d;
		
		// now move away from mx,my to get another point
		var mx_2 = mx + dy;
		var my_2 = my + (-dx);
		
		// SANITY CHECK
		// todo: remove once working
		// THESE SHOULD BE EQUAL
		var dist_1 = this.pointSquaredDistance(p1, [mx,my]) - w1;
		var dist_2 = this.pointSquaredDistance(p2, [mx,my]) - w2;
		var dist_3 = this.pointSquaredDistance(p1, [mx_2,my_2]) - w1;
		var dist_4 = this.pointSquaredDistance(p2, [mx_2,my_2]) - w2;
		
		return [[mx, my], [mx_2, my_2]];
	},
	
	
	powerDiagramTwoSites:function(bounding_polygon, p1, w1, p2, w2) {
		var result = [];
		var s = this.weightedMidpointLine(p1, w1, p2, w2);
		result.push(this.clipPolygonByLine(bounding_polygon, s[0], s[1]));
		result.push(this.clipPolygonByLine(bounding_polygon, s[1], s[0]));
		return result;
	},
	
	powerDiagramThreeSites:function(bounding_polygon, p1, w1, p2, w2, p3, w3) {
		var result = [];
		var s12 = this.weightedMidpointLine(p1, w1, p2, w2);
		var s13 = this.weightedMidpointLine(p1, w1, p3, w3);
		var s23 = this.weightedMidpointLine(p2, w2, p3, w3);
		// 1
		var poly = this.clipPolygonByLine(bounding_polygon, s12[0], s12[1]);
		poly = this.clipPolygonByLine(poly, s13[0], s13[1]);
		result.push(poly);
		// 2
		poly = this.clipPolygonByLine(bounding_polygon, s12[1], s12[0]);
		poly = this.clipPolygonByLine(poly, s23[0], s23[1]);
		result.push(poly);
		// 3
		poly = this.clipPolygonByLine(bounding_polygon, s13[1], s13[0]);
		poly = this.clipPolygonByLine(poly, s23[1], s23[0]);
		result.push(poly);
		return result;
	},
	
	powerDiagramWrapper:function(bounding_polygon, sites) {
		// hack in 1, 2, and 3 case here
		// todo: move to power diagram function
		if (sites.length == 1) {
			return bounding_polygon;
		}
		else if (sites.length == 2) {
			return this.powerDiagramTwoSites(bounding_polygon, 
				sites[0].p, sites[0].weight, sites[1].p, sites[1].weight);
		}
		else if (sites.length == 3) {
			return this.powerDiagramThreeSites(bounding_polygon, 
				sites[0].p, sites[0].weight, sites[1].p, sites[1].weight, sites[2].p, sites[2].weight);
		}
	    // else...
		// console.log("BROKEN GENERAL CODE PATH");
	        
		// site_points = sites.map(function(s) {return s.p;});
		// site_weights = sites.map(function(s) {return s.weight;});
		// result = computePowerDiagram(site_points, site_weights, bounding_polygon);
		// console.log("from computePowerDiagram:");
		// console.log(result);
		// return result;
            else{
                return computePowerDiagram(sites.map(function(a) {return a.p;}), sites.map(function(a) {return a.weight;}), bounding_polygon);
            }
	},
	
	computeVoronoiTreemapRecursive:function(bounding_polygon, node, depth) {
		if (depth <= 0) {
			return bounding_polygon;
		}
		
		var node_result = this.computeVoronoiTreemapSingle(bounding_polygon, node);

		if (node_result.length > 1) {
			var all_children_flat = []
			for (var i = 0; i < node_result.length; i++) {
				var child_result = this.computeVoronoiTreemapRecursive(node_result[i], node.children[i], depth - 1);
				console.log(child_result);
				for (var j = 0; j < child_result.length; j++) {
					all_children_flat.push(child_result[j]);
				}
			}
		}
		else {
			// this is weird, maybe
			return node_result[0];
		}
	},
	
	initSites:function(bounding_polygon, node) {
		this.setSizeForAllNodes(node); // quick if done already
		var sites = [];
		var random_points = this.getRandomPointsInPolygon(bounding_polygon, node.children.length);
		var initial_weight = 0.001; // initial weight
		for (var c = 0; c < node.children.length; c++) {
			// calculate percentage weights
			sites.push({
				"p":random_points[c], 
				"size_fraction":(node.children[c].size * 1.0 / node.size),
				"weight":initial_weight
				});
		}

            // sites = [];
            // sites[0] = {"p":[998, 719],"size_fraction":0.25,"weight":0.001};
            // sites[1] = {"p":[629,222],"size_fraction":0.25,"weight":0.001};
            // sites[2] = {"p":[-418,-42],"size_fraction":0.25,"weight":0.001};
            // sites[3] = {"p":[-381,-55],"size_fraction":0.25,"weight":0.001};

	    console.log("initial sites:");
	    console.log(sites);
	    return sites;
	},
	
	computeVoronoiTreemapSingle:function(bounding_polygon, node) {
		var sites = this.initSites(bounding_polygon, node);
		return this.computeVoronoiTreemapSingleWithSites(bounding_polygon, node, sites, 100);
	},
    
	
	computeVoronoiTreemapSingleWithSites:function(bounding_polygon, node, sites, max_iterations) {
		bounding_polygon = d3.geom.polygon(bounding_polygon); // just make sure...
		this.setSizeForAllNodes(node); // quick if done already
	
		if (!node.hasOwnProperty("children")) {
			//return null; // really? null?
			return bounding_polygon; // really?
			// todo: make this return sites as well!!!!
		}
		
		var bounding_polygon_area = bounding_polygon.area();
		
		var power_diagram = this.powerDiagramWrapper(bounding_polygon, sites);
		
		// also power diagram should be in the form of d3 polygons
		// assume that it is?!
		//power_diagram[i] = d3.geom.polygon(power_diagram[i]);
		
		var error_threshold = 0.001; // or whatever...
		for (var iteration = 0; iteration < max_iterations; iteration++) {
			console.log("computeVoronoiTreemapSingleWithSites iteration: " + iteration);
			
			// debug weights?
			console.log("weights:");
			for (var stupid = 0; stupid < sites.length; stupid++) {
				console.log(sites[stupid].weight);
			}
			
			// debug areas
			console.log("areas (before update):");
			for (var i = 0; i < power_diagram.length; i++) {
				console.log(power_diagram[i].area());
			}
			
			this.adaptPositionsWeights(node, power_diagram, sites);
			power_diagram = this.powerDiagramWrapper(bounding_polygon, sites);
			this.adaptWeights(bounding_polygon, bounding_polygon_area, node, power_diagram, sites);
			power_diagram = this.powerDiagramWrapper(bounding_polygon, sites);
		    var area_error = this.computeAreaError(bounding_polygon_area, power_diagram, sites);
			if (area_error < error_threshold) break;
		}
		
		// debug result
		/*
		console.log("power_diagram:");
		for (var i = 0; i < power_diagram.length; i++) {
			console.log("polygon " + i);
			for (var j = 0; j < power_diagram[i].length; j++) {
				console.log(power_diagram[i][j]);
			}
			console.log("area: " + power_diagram[i].area());
		}
		*/
		
		
		return [power_diagram, sites]
	}
}
