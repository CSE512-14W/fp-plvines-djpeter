
var ConvexHull = {

    points = [];
    facets = [];
    created = [];
    horizon = [];
    visible = [];
    current = 0;
    episilon = 0.000000000001

    var Vertex = {
        
        x = 0,y = 0,z = 0,index = 0;
        conflicts = [];
        
        
    }

    // IN: sites (x,y,z)
    init: function(sites){
        points = sites;
    }

    prep: function(){
        if (points.size() <= 3){
            // error
        }

        // set vertex indices
        for (var i in points){
            points[i].index = i;
        }

        var v0, v1, v2, v3;
        var f1, f2, f3, f0;
        v0 = points[0];
        v1 = points[1];
        v2 = v3 = null;
        
        for (var i = 2; i < points.length; i++){
            if (!(linearDependent(v0, points[i]) && linearDependent(v1, points[i]))){
                
            }
        }

    }

    compute: function(){
        prep();

        while(current < points.length){
            var next = points[current];
            
            

        }


    }

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
