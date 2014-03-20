///////// from hierarchy.js

// A method assignment helper for hierarchy subclasses.
function d3_layout_hierarchyRebind(object, hierarchy) {
  d3.rebind(object, hierarchy, "sort", "children", "value");

  // Add an alias for nodes and links, for convenience.
  object.nodes = object;
  object.links = d3_layout_hierarchyLinks;

  return object;
}

// Returns an array source+target objects for the specified nodes.
function d3_layout_hierarchyLinks(nodes) {
  return d3.merge(nodes.map(function(parent) {
    return (parent.children || []).map(function(child) {
      return {source: parent, target: child};
    });
  }));
}




///////////////////////
// the actual implementation

d3.layout.voronoitreemap = function() {
	var hierarchy = d3.layout.hierarchy().sort(null),
		//round = Math.round,
		//size = [1, 1], // width, height  // DON'T DO THIS,
		root_polygon = [[0,0],[500,0],[500,500],[0,500]], // obviously stupid...set somehow
		iterations = 100,
		somenewvariable = 0;
	
	function voronoitreemap(d) {
		var nodes = hierarchy(d),
			root = nodes[0];

		root.polygon = root_polygon;
		root.site = null; // hmm?
		computeDiagramRecursively(root);
		
		return nodes;
	}

	function computeDiagramRecursively(node) {
		var children = node.children;
		if (children && children.length) {
			node.sites = VoronoiTreemap.init(node.polygon, dataset);  // can't say dataset
			VoronoiTreemap.normalizeSites(node.sites);
			VoronoiTreemap.sites = sites;
			VoronoiTreemap.setClipPolygon(node.polygon);
			VoronoiTreemap.useNegativeWeights = true;
			VoronoiTreemap.cancelOnAreaErrorThreshold =  true;
			var polygons = VoronoiTreemap.doIterate(iterations);
			
			// set children polygons and sites
			for (var i = 0; i < children.length; i++) {
				children[i].polygon = polygons[i];
				children[i].site = VoronoiTreemap.sites[i];
				// goes all the way down
				//computeDiagramRecursively(children[i]);
			}
			
			//children.forEach(computeDiagramRecursively);
		}
	}
	
	
	voronoitreemap.root_polygon = function(x) {
		if (!arguments.length) return root_polygon;
		root_polygon = x;
		return voronoitreemap;
	};
	 
	  
	return d3_layout_hierarchyRebind(voronoitreemap, hierarchy); 
}