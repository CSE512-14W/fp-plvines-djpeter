var epsilon = 0.0000000001;

// IN: vectors or dertices
var dot = function(v1, v2){
    return (v1.x * v2.x) + (v1.y * v2.y) + (v1.z * v2.z); 
}

// IN: boolean face
var ConflictList = function(face){
    this.face = face;
    this.head = null;
}
// IN: GraphEdge
ConflictList.prototype.add = function(e){
    if(this.head === null){
	this.head = e;
    }else{
	if(this.face){//Is FaceList
	    this.head.prevv = e;
	    e.nextv = this.head;
	    this.head = e;
	}else{//Is VertexList
	    this.head.prevf = e;
	    e.nextf = this.head;
	    this.head = e;
	}
    }
}
ConflictList.prototype.empty = function() {
    return this.head === null;
}
// Array of faces visible
ConflictList.prototype.fill = function(visible) {
    if(this.face){
	return;
    }
    var curr = this.head;
    do{
	visible.push(curr.face);
	curr.face.marked = true;
	curr = curr.nextf;
    }while(curr !== null);
}
ConflictList.prototype.removeAll = function() {
    if(this.face){//Remove all vertices from Face
        var curr = this.head;
	do{
	    if(curr.prevf === null){//Node is head
		if(curr.nextf === null){
		    curr.vert.conflicts.head = null;
		}else{
		    curr.nextf.prevf = null;
		    curr.vert.conflicts.head = curr.nextf;
		}
	    }else{//Node is not head
		if(curr.nextf != null){
		    curr.nextf.prevf = curr.prevf;
                }
		curr.prevf.nextf = curr.nextf;
	    }
	    curr = curr.nextv;
	    if(curr != null){
		curr.prevv = null;
            }
	}while(curr != null);
    }else{//Remove all JFaces from vertex
        var curr = this.head;
	do{
	    if(curr.prevv == null){ //Node is head
		if(curr.nextv == null){
		    curr.face.getList().head = null;
		}else{
		    curr.nextv.prevv = null;
		    curr.face.getList().head = curr.nextv;
		}
	    }else{//Node is not head
		if(curr.nextv != null){
		    curr.nextv.prevv = curr.prevv;
		}
		curr.prevv.nextv = curr.nextv;
	    }
	    curr = curr.nextf;
	    if(curr != null)
		curr.prevf = null;
	}while(curr != null);
    }
    
}
// IN: list of vertices
ConflictList.prototype.getVertices = function(l1) {
    curr = this.head;
    while(curr !== null){
	l1.push(curr.vert);
	curr = curr.nextv;
    }
    return l1;
}



// IN: coordinates x, y, z
var Vertex = function(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.index = 0;
    this.conflicts = new ConflictList(false);
}
Vertex.prototype.subtract = function(v){
    return new Vertex(v.x - this.x, v.y - this.y, v.z - this.z);
}
Vertex.prototype.crossproduct = function(v){
    return new Vertex((this.y * v.z) - (this.z * v.y), (this.z * v.x) - (this.x * v.z), (this.x * v.y) - (this.y *
                                                                                                          v.x)); }
Vertex.prototype.equals = function(v){
    return (this.x === v.x && this.y === v.y && this.z === v.z);
}


// IN: coordinates x, y, z
var Vector = function(x,y,z){
    this.x = x;
    this.y = y;
    this.z = z;
}
Vector.prototype.negate = function(){
    this.x *= -1;
    this.y *= -1;
    this.z *= -1;
}

// Normalizes X Y and Z in-place
Vector.prototype.normalize = function(){
    var len = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    if (len > 0){
        this.x /= len;
        this.y /= len;
        this.z /= len;
    }
}

// IN: Vertices a, b, c
var Face = function(a, b, c){
    this.conflicts = new ConflictList(true);
    this.verts = [a,b,c];
    this.marked = false;
    t = (this.verts[0].subtract(this.verts[1])).crossproduct(this.verts[1].subtract(this.verts[2]));
    
    this.normal = (new Vector(-t.x, -t.y, -t.z));
    this.normal.normalize();
    this.createEdges();
}
Face.prototype.createEdges = function(){
    this.edges = [];
    this.edges[0] = new HEdge(this.verts[0], this.verts[1], this);
    this.edges[1] = new HEdge(this.verts[1], this.verts[2], this);
    this.edges[2] = new HEdge(this.verts[2], this.verts[0], this);
    this.edges[0].next = this.edges[1];
    this.edges[0].prev = this.edges[2];
    this.edges[1].next = this.edges[2];
    this.edges[1].prev = this.edges[0];
    this.edges[2].next = this.edges[0];
    this.edges[2].prev = this.edges[1];
}
// IN: vertex orient
Face.prototype.orient = function(orient){
    if (!(dot(this.normal,orient) < dot(this.normal, this.verts[0]))){
        var temp = this.verts[1];
        this.verts[1] = this.verts[2];
        this.verts[2] = temp;
        this.normal.negate();
        this.createEdges();
    }
}
// IN: two vertices v0 and v1
Face.prototype.getEdge = function(v0, v1){
    for (var i = 0; i < 3; i++){
        if (this.edges[i].isEqual(v0,v1)){
            return this.edges[i];
        }
    }
    return null;
}
// IN: Face face, vertices v0 and v1
Face.prototype.link = function(face, v0, v1){
    if (face instanceof Face){
        var twin = face.getEdge(v0, v1);
        if (twin === null){
            // error
            console.log("ERROR: twin is null");
        }
        var edge = this.getEdge(v0, v1);
        twin.twin = edge;
        edge.twin = twin;
    } 
    else{
        var e = face;
        var edge = this.getEdge(e.orig, e.dest);
        e.twin = edge;
        edge.twin = e;
    }
}
// IN: vertex v
Face.prototype.conflict = function(v){
    return (dot(this.normal, v) > dot(this.normal, this.verts[0]) + epsilon);
}
Face.prototype.getHorizon = function(){
    for (var i = 0; i < 3; i++){
        if (this.edges[i].twin !== null && this.edges[i].twin.isHorizon()){
            return this.edges[i];
        }
    }
    return null;
}
Face.prototype.removeConflict = function(){
    this.conflicts.removeAll();
}


// IN: vertex orig, vertex dest, Face face
var HEdge = function(orig, dest, face){
    this.next = null;
    this.prev = null;
    this.twin = null;
    this.orig = orig;
    this.dest = dest;
    this.iFace = face;
}
HEdge.prototype.isHorizon = function(){
    return this.twin !== null && this.twin.iFace.marked && !this.iFace.marked;
}

// IN: array horizon
HEdge.prototype.findHorizon = function(horizon) {
    if (this.isHorizon()) {
	if (horizon.length > 0 && this === horizon[0]) {
	    return;
	} else {
	    horizon.push(this);
	    this.next.findHorizon(horizon);
	}
    } else {
	if (this.twin !== null) {
	    this.twin.next.findHorizon(horizon);
	}
    }
}
// IN: vertices origin and dest
HEdge.prototype.isEqual = function(origin, dest){
    return ((this.orig.equals(origin) && this.dest.equals(dest)) || (this.orig.equals(dest) && this.dest.equals(origin)));
}

var GraphEdge = function(face, vert){
    this.face = face;
    this.vert = vert;
    this. nextf = null;
    this.prevf = null;
    this.nextv = null;
    this.prevv = null;
}


var ConvexHull = {

    points: [],
    facets: [],
    created: [],
    horizon: [],
    visible: [],
    current: 0,
    episilon: 0.000000000001,


    // IN: sites (x,y,z)
    init: function(sites){
        this.points = sites.map(function(a) {return new Vertex(a[0], a[1], a[2])});
    },

    permutate: function(){
        var pointSize = this.points.length;
        for (var i = pointSize -1; i > 0; i--){
            var ra = Math.floor(Math.random()*i);
            var temp = this.points[ra];
            temp.index = i;
            var currentItem = this.points[i];
            currentItem.index = ra;
            this.points.splice(ra, 1, currentItem);
            this.points.splice(i, 1, temp);
        }
    },

    prep: function(){
        if (this.points.length <= 3){
            // error
            console.log("ERROR: Less than 4 points");
        }

        // set vertex indices
        for (var i = 0; i <  this.points.length; i++){
            this.points[i].index = i;
        }

        var v0, v1, v2, v3;
        var f1, f2, f3, f0;
        v0 = this.points[0];
        v1 = this.points[1];
        v2 = v3 = null;
        
        for (var i = 2; i < this.points.length; i++){
            if (!(this.linearDependent(v0, this.points[i]) && this.linearDependent(v1, this.points[i]))){
                v2 = this.points[i];
                v2.index = 2;
                this.points[2].index = i;
                this.points.splice(i, 1, this.points[2]);
                this.points.splice(2, 1, v2);
                break;
            }
        }
        if (v2 === null){
            // error
            console.log("ERROR: v2 is null");
        }

        f0 = new Face(v0, v1, v2);
        for (var i = 3; i < this.points.length; i++){
            if (dot(f0.normal, f0.verts[0]) !== dot(f0.normal, this.points[i])) {
                v3 = this.points[i];
                v3.index = 3;
                this.points[3].index = i;
                this.points.splice(i, 1, this.points[3]);
                this.points.splice(3,1,v3);
                break;
            }
        }

        if (v3 === null){
            //error
            console.log("ERROR: v3 is null");
        }
        
        f0.orient(v3);
        f1 = new Face(v0,v2,v3,v1);
        f2 = new Face(v0,v1,v3,v2);
	f3 = new Face(v1,v2,v3,v0);
	
	this.addFacet(f0);
	this.addFacet(f1);
	this.addFacet(f2);
	this.addFacet(f3);
	//Connect facets
	f0.link(f1, v0, v2);
	f0.link(f2,v0,v1);
	f0.link(f3,v1,v2);
	f1.link(f2,v0,v3);
	f1.link(f3, v2, v3);
	f2.link(f3,v3,v1);

        this.current = 4;
        
        var v;
	for(var i = this.current; i < this.points.length; i++){
	    v = this.points[i];
	    if(f0.conflict(v)){
		this.addConflict(f0,v);
	    }
	    //!f1.behind(v)
	    if(f1.conflict(v)){
		this.addConflict(f1,v);
	    }
	    if(f2.conflict(v)){
		this.addConflict(f2,v);
	    }
	    if(f3.conflict(v)){
		this.addConflict(f3,v);
	    }
	}		


    },

    // IN: Face face, Vertex v
    addConflict: function(face, vert){
        var e = new GraphEdge(face, vert);
        face.conflicts.add(e);
        vert.conflicts.add(e);
    },

    // IN: Face f
    removeConflict: function(f){
        f.removeConflict();
        var index = f.index;
	f.index = -1;
	if(index === this.facets.length - 1){
	    this.facets.splice(this.facets.length - 1, 1);
	    return;
	}
	if(index >= this.facets.length|| index < 0)
	    return;
	var last = this.facets.splice(this.facets.length - 1, 1);
	last.index = index;
	this.facets.splice(index, 1, last);

    },

    // IN: Face face
    addFacet: function(face){
        face.index = this.facets.length;
        this.facets.push(face);
    },

    compute: function(){
        this.prep();

        while(this.current < this.points.length){
            var next = this.points[this.current];

            if (next.conflicts.empty()){ //No conflict, point in hull
		this.current++;
		continue;
	    }
	    created = [];// TODO: make sure this is okay and doesn't dangle references
	    horizon = []; 
	    visible = [];
	    //The visible faces are also marked
	    next.conflicts.fill(visible);
	    //Horizon edges are orderly added to the horizon list
	    var e;
	    for(var jF = 0; jF < visible.length; jF++){
		e = visible[jF].getHorizon();
		if(e != null){
		    e.findHorizon(horizon);
		    break;
		}
	    }

            var last = null, first = null;

	    //Iterate over horizon edges and create new faces oriented with the marked face 3rd unused point
	    for(var hEi = 0; hEi < horizon.length; hEi++){
                var hE = horizon[hEi];
		var fn = new Face(next,hE.orig,hE.dest,hE.twin.next.dest);
		fn.conflicts = new ConflictList(true);
		
		//Add to facet list
		this.addFacet(fn);
		created.push(fn);
		
		//Add new conflicts
		this.addConflict(hE.iFace,hE.twin.iFace,fn);
		
		//Link the new face with the horizon edge
		fn.link(hE);
		if(last !== null)
		    fn.link(last, next, hE.orig);
		last = fn;
		if(first === null)
		    first = fn;
	    }
	    //Links the first and the last created JFace
	    if(first !== null && last !== null){
		last.link(first, next, horizon[0].orig);
	    }
	    if(created.length != 0){
		//update conflict graph
		for(var f = 0; f <  visible.length; f++){
		    this.removeConflict(visible[f]);
		}
		this.current++;
		created = [];
	    }
	}
	return this.facets;
    },

    // IN: two vertex objects, p1 and p2
    // OUT: true if they are linearly dependent, false otherwise
    linearDependent: function(p1, p2){
        if (p1.x == 0 && p2.x == 0){
            if (p1.y == 0 && p2.y == 0){
                if (p1.z == 0 && p2.z == 0){
                    return true;
                }
                if (p1.z == 0 || p2.z == 0){
                    return false;
                }
            }
            if (p1.y == 0 || p2.y == 0){
                return false;
            }
            if (p1.z/p1.y >= p2.z / p2.y - epsilon && p1.z / p1.y <= p2.z / p2.y + epsilon){
                return true;
            }
            else{
                return false;
            }
        }
        if (p1.x == 0 || p1.x == 0){
            return false;
        }
        if (p1.y/p1.x <= p2.y/p2.x + epsilon && p1.y / p1.x >= p2.y / p2.x - epsilon && p1.z / p1.x >= p2.y / p2.x - epsilon && p1.z / p1.x <= p2.z / p2.x + epsilon){
            return true;
        }
        else{
            return false;
        }
    }

}
