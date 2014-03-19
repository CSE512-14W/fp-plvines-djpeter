import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import kn.uni.voronoitreemap.IO.PNGStatusObject;
import kn.uni.voronoitreemap.interfaces.MainClass;
import kn.uni.voronoitreemap.interfaces.VoronoiTreemapInterface;
import kn.uni.voronoitreemap.interfaces.data.Tuple2ID;
import kn.uni.voronoitreemap.j2d.PolygonSimple;
import kn.uni.voronoitreemap.renderer.VoroRenderer;


public class TestMain {

	public static void main(String[] args) {
		//Create the root polygon(it has to be convex):
		PolygonSimple root = new PolygonSimple(4);
		
		int width = 510;
		int height = 510;
		
		// NOTE: THESE ARE CLOCKWISE, NOT COUNTER!!
		root.add(0,0);
		root.add(width,0);
		root.add(width, height);
		root.add(0,height);

		//Create a StatusObject of your implementation
		StatusObjectImpl statusObject = new StatusObjectImpl();

		//Get the voronoi treemap with the your status object as parameter and whether you want to use multithreaded computation
		VoronoiTreemapInterface voronoiTreemap = MainClass.getInstance(statusObject,true);
		
		//voronoiTreemap.setNumberMaxIterations(5000);
		voronoiTreemap.setCancelOnThreshold(true);
		
		// by default, uses negative weights.
		// let's see if turning that off causes problems for them
		voronoiTreemap.setUseNegativeWeights(false);
		
		// make it simple (still works)
		voronoiTreemap.setUseExtrapolation(false);
		
		// invariant off?
		voronoiTreemap.setGuaranteeValidCells(true);
		
		//Set root polygon
		voronoiTreemap.setRootPolygon(root);

		//Insert the tree structure with the format List<List<Integer>> as an adjacency list:
		//E.g. if a node 1 has children 3,7 and 9 the List must have an entry (1,3,7,9)

		ArrayList<ArrayList<Integer>> treeList = new ArrayList<ArrayList<Integer>>();
		
		//treeList.add(new ArrayList<Integer> (Arrays.asList(1,2,3)));
		//treeList.add(new ArrayList<Integer> (Arrays.asList(2,4,5)));
		//treeList.add(new ArrayList<Integer> (Arrays.asList(3,6,7,8)));
		
		treeList.add(new ArrayList<Integer> (Arrays.asList(1,2,3,4,5)));
		
		voronoiTreemap.setTree(treeList);
		

		//Optional set AreaGoals (=weighting for each node which influences the final area the polygon of a cell will have)
		//(can only be set after the tree structure is defined (setTree(...)))
		//Format: Tuple2ID with (NodeId, weight) e.g. Node 1 (1,0.55)
		ArrayList<Tuple2ID> areaGoals = new ArrayList<Tuple2ID>();
		
		areaGoals.add(new Tuple2ID(2,10));
		areaGoals.add(new Tuple2ID(3,1));
		areaGoals.add(new Tuple2ID(4,1));
		// to match simple_four
		areaGoals.add(new Tuple2ID(5,1));
		
		// only need children...
		// so I don't know why it works now...there was some issue with weights not converging...hmmm
		//areaGoals.add(new Tuple2ID(1,1));
		//areaGoals.add(new Tuple2ID(2,1));
		//areaGoals.add(new Tuple2ID(3,1));
		//areaGoals.add(new Tuple2ID(4,2));
		//areaGoals.add(new Tuple2ID(5,2));
		//areaGoals.add(new Tuple2ID(6,1));
		//areaGoals.add(new Tuple2ID(7,1));
		//areaGoals.add(new Tuple2ID(8,2));
		
		
		voronoiTreemap.setAreaGoals(areaGoals);

		//Now compute the voronoi treemap
		//voronoiTreemap.compute();
		voronoiTreemap.computeLocked();
		
		// can do this here??
		VoroRenderer renderer=new VoroRenderer();
		renderer.setTreemap(voronoiTreemap);
		renderer.renderTreemap("test.png");

		//Handle the results in statusObject.finished() or respectively in statusObject.finishedNode(int node, int layer, int[] children, PolygonSimple[] polygons)
	}

}
