import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.nio.ByteBuffer;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Stack;

import kn.uni.voronoitreemap.interfaces.MainClass;
import kn.uni.voronoitreemap.interfaces.VoronoiTreemapInterface;
import kn.uni.voronoitreemap.interfaces.data.Tuple2ID;
import kn.uni.voronoitreemap.j2d.PolygonSimple;
import kn.uni.voronoitreemap.renderer.VoroRenderer;

import org.json.JSONArray;
import org.json.JSONObject;


class Tuple<X, Y> { 
	public final X x; 
	public final Y y; 
	public Tuple(X x, Y y) { 
		this.x = x; 
		this.y = y; 
	} 
} 

public class TestJSONJava {



	static String readFile(String path, Charset encoding) throws IOException 
	{
		byte[] encoded = Files.readAllBytes(Paths.get(path));
		return encoding.decode(ByteBuffer.wrap(encoded)).toString();
	}

	public static void main(String[] args) throws IOException {
		
		//String file = "C:\\devlibs\\github\\fp-plvines-djpeter\\flare.json";
		//String file = "C:\\devlibs\\github\\fp-plvines-djpeter\\example.json";
		//String file = "C:\\devlibs\\github\\fp-plvines-djpeter\\simple_eight.json";
		String file = "C:\\devlibs\\github\\fp-plvines-djpeter\\random_4_4_000_edit.json";
		
		
		//BufferedReader reader = new BufferedReader( new FileReader (file));
		String file_contents = readFile(file, StandardCharsets.UTF_8);
		JSONObject json_object = new JSONObject(file_contents);

		System.out.println(json_object.names());
		
		String children_field = "children";
		String value_field = "size";
		
		//Object children = json_object.opt(children_field);
		
		
		//		
		ArrayList<ArrayList<Integer>> treeList = new ArrayList<ArrayList<Integer>>();
		
		//treeList.add(new ArrayList<Integer> (Arrays.asList(1,2,3)));
		//treeList.add(new ArrayList<Integer> (Arrays.asList(2,4,5)));
		//treeList.add(new ArrayList<Integer> (Arrays.asList(3,6,7,8)));
		
		int node_counter = 1;
		Map<Integer, Double> size_map = new HashMap<Integer, Double>();
		Stack<Tuple<JSONObject, Integer>> stack = new Stack<Tuple<JSONObject, Integer>>();
		
		// assume root has children?
		stack.push(new Tuple<JSONObject, Integer>(json_object, node_counter++));
		
		while (!stack.empty()) {
			Tuple<JSONObject, Integer> popped = stack.pop();
			JSONObject node = popped.x;
			int node_id = popped.y;
			JSONArray children = node.optJSONArray(children_field);
			if (children != null) {
				ArrayList<Integer> voronoi_list = new ArrayList<Integer>();
				voronoi_list.add(node_id);
				for (int i = 0; i < children.length(); i++) {
					int child_id = node_counter++;
					voronoi_list.add(child_id);
					stack.push(new Tuple<JSONObject, Integer>(children.getJSONObject(i), child_id));
				}
				treeList.add(voronoi_list);
			}
			else {
				// assume we must have a size instead
				size_map.put(node_id, node.getDouble(value_field));
			}
		}
		
		System.out.println(treeList);
		System.out.println(size_map);
		
		///////////////////////////
		// ok, now voronoi, baby
		
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
		voronoiTreemap.setGuaranteeValidCells(false);
		
		//Set root polygon
		voronoiTreemap.setRootPolygon(root);
		
		voronoiTreemap.setTree(treeList);
		
		ArrayList<Tuple2ID> areaGoals = new ArrayList<Tuple2ID>();
		
		for (Entry<Integer, Double> entry : size_map.entrySet()) {
			areaGoals.add(new Tuple2ID(entry.getKey(),  entry.getValue()));
		}		
		
		voronoiTreemap.setAreaGoals(areaGoals);

		//Now compute the voronoi treemap
		//voronoiTreemap.compute();
		voronoiTreemap.computeLocked();
		
		// can do this here??
		VoroRenderer renderer=new VoroRenderer();
		renderer.setTreemap(voronoiTreemap);
		renderer.renderTreemap("test.png");
		
		
		//treeList.add(new ArrayList<Integer> (Arrays.asList(1,2,3,4,5)));
		
	}

}
