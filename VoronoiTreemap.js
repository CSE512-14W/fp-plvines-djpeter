
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
		for (var s = 0; s < sites.length; s++) {
			sites[s].p = power_diagram[s].centroid();
			var distance_border = this.computeDistanceBorder(power_diagram[s], sites[s].p);
			var to_square = Math.min(Math.sqrt(sites[s].weight), distance_border);
			sites[s].weight = to_square * to_square;
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
				var d = sites[i].p[0] - sites[j].p[0]
				if (d < best_squaredNorm) {
					best_squaredNorm = d;
					var best_j = j;
				}
			}
			nn_squaredNorm.push(best_squaredNorm);
		}
		
		for (var s = 0; s < sites.length; s++) {
			area_current = power_diagram[s].area();
			area_target = bounding_polygon_area * sites[s].size_fraction;
			//var f_adapt = area_target / area_current;
			//var w_new = Math.sqrt(sites[s].weight) * f_adapt;
			//var w_max = Math.sqrt(nn_squaredNorm[s]); // compute squareroots once?
			//var to_square = Math.min(w_new, w_max);
			//sites[s].weight = to_square * to_square;
			//sites[s].weight = Math.max(sites[s].weight, epsilon);
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
	
	powerDiagramWrapper:function(bounding_polygon, sites) {
		site_points = sites.map(function(s) {return s.p;});
		site_weights = sites.map(function(s) {return s.weight;});
		result = computePowerDiagram(site_points, site_weights, bounding_polygon);
		console.log("from computePowerDiagram:");
		console.log(result);
		return result;
	},
	
	// in: bounding polygon and node
	// out: a list of polygons
	computeVoronoiTreemapSingle:function(bounding_polygon, node) {
		if (!node.hasOwnProperty("children")) {
			return null; // really? null?
		}
	
		// perhaps silly to do this every time, but it's quick if set
		this.setSizeForAllNodes(node);
	
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
		
		console.log("initial sites:");
		console.log(sites);
		
		var bounding_polygon_area = bounding_polygon.area();
		
		power_diagram = this.powerDiagramWrapper(bounding_polygon, sites);
		
		// also power diagram should be in the form of d3 polygons
		//power_diagram[i] = d3.geom.polygon(power_diagram[i]);
		
		var max_iterations = 200;
		for (var iteration = 0; iteration < max_iterations; iteration++) {
			//this.adaptPositionsWeights(node, power_diagram, sites);
			//power_diagram = computePowerDiagram(bounding_polygon, sites);
			//this.adaptWeights(bounding_polygon, bounding_polygon_area, node, power_diagram, sites);
			//power_diagram = computePowerDiagram(bounding_polygon, sites);
			//area_error = this.computeAreaError(bounding_polygon_area, power_diagram, sites);
		}
		
		//return power_diagram;
	}
}