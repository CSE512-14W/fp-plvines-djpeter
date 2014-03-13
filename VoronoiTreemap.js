
test_poly = [[0,0],[5,0],[5,5],[0,5]];

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
		
		for (var c = 0; c < node.children.length; c++) {
			// calculate percentage weights
			sites.push({
				"p":random_points[c], 
				"size_fraction":(node.children[c].size * 1.0 / node.size)
				});
		}
		
		console.log("sites:");
		console.log(sites);
	}

}