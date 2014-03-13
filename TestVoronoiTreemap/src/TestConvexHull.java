import java.util.ArrayList;
import java.util.List;

import kn.uni.voronoitreemap.convexHull.JConvexHull;
import kn.uni.voronoitreemap.convexHull.JFace;
import kn.uni.voronoitreemap.convexHull.JVertex;


public class TestConvexHull {

	public static void main(String[] args) {
		
		/*
 var sites = [[174, 693, 949],
[800, 100, 550],
[550, 520, 830],
[960, 10, 720],
[60, 140, 70],
[760, 640, 700]];
		 */
		
		JConvexHull convex_hull = new JConvexHull();
		convex_hull.addPoint(174, 693, 949);
		convex_hull.addPoint(800, 100, 550);
		convex_hull.addPoint(550, 520, 830);
		convex_hull.addPoint(960, 10, 720);
		convex_hull.addPoint(60, 140, 70);
		convex_hull.addPoint(760, 640, 700);
		List<JFace> result = convex_hull.compute();
		for (JFace face : result) {
			System.out.println("face: " + face.toString()); // not actually pretty print
		}
	}

}
