import java.io.BufferedWriter;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.io.PrintWriter;
import java.io.UnsupportedEncodingException;
import java.io.Writer;
import java.util.Random;

import org.json.JSONArray;
import org.json.JSONObject;


public class CreateJSON {
	static String value_field = "size";
	static String children_field = "children";
	static Random random = new Random(); // seed?

	public static void addChildren(JSONObject node, int breadth, int depth, float chance_to_skip_child) {
		JSONArray children_array = new JSONArray();
		if (depth <= 1) {
			for (int i = 0; i < breadth; i++) {
				if (random.nextFloat() < chance_to_skip_child) continue;
				JSONObject leaf_node = new JSONObject();
				leaf_node.put(value_field, random.nextFloat());
				children_array.put(leaf_node);
			}
		}
		else {
			for (int i = 0; i < breadth; i++) {
				if (random.nextFloat() < chance_to_skip_child) continue;
				JSONObject internal_node = new JSONObject();
				addChildren(internal_node, breadth, depth-1, chance_to_skip_child);
				children_array.put(internal_node);
			}
		}
		node.put(children_field, children_array);
	}
	
	public static void main(String[] args) throws IOException {
		int breadth = 4;
		int depth = 4;
		float chance_to_stop_early = (float) 0; // <= 0 means always continue down depth
		
		JSONObject root = new JSONObject();
		
		addChildren(root, breadth, depth, chance_to_stop_early);
		
		//System.out.println(root);
		
		//String filename = "random_" + breadth + "_" + depth + "_" + ".json";
		int percent_early = (int) (chance_to_stop_early * 100);
		String filename_base = String.format("random_%d_%d_%03d", breadth, depth, percent_early);
		
		int indent_factor = 2;
		
		String filename_json = filename_base + ".json";
		Writer writer =  new BufferedWriter(new OutputStreamWriter(
				new FileOutputStream(filename_json), "utf-8"));
		writer.write(root.toString(indent_factor));
		writer.close();
		
		String filename_js = filename_base + ".js";
		writer =  new BufferedWriter(new OutputStreamWriter(
				new FileOutputStream(filename_js), "utf-8"));
		writer.write(filename_base + "_json = " + root.toString(indent_factor));
		writer.close();
	}

}
