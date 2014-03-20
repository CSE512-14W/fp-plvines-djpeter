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
	var hierarchy = d3.layout.hierarchy(),
		//round = Math.round,
		size = [1, 1], // width, height
		somenewvariable = 0;
	
	function voronoitreemap(d) {
		var nodes = hierarchy(d),
			root = nodes[0];
		return nodes;
	}

	voronoitreemap.size = function(x) {
		if (!arguments.length) return size;
		size = x;
		return voronoitreemap;
	};
	 
	  
	return d3_layout_hierarchyRebind(voronoitreemap, hierarchy); 
}