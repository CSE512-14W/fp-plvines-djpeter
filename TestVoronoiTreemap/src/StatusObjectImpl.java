import java.util.Arrays;

import kn.uni.voronoitreemap.j2d.PolygonSimple;

public class StatusObjectImpl implements kn.uni.voronoitreemap.interfaces.StatusObject {

	@Override
	public void finishedNode(int node, int layer, int[] children, PolygonSimple[] polygons) {
		System.out.println("finished node No. " + node + " in layer: " + layer + " with children: " + Arrays.toString(children));
		if (polygons == null) {
			System.out.println("polygons == null");
		}
		else {
			for(PolygonSimple poly : polygons){
				if (poly == null) {
					System.out.println("poly == null");
				}
				else {
					//System.out.println(poly.toString());
					System.out.println(poly.getArea());
				}
			}
		}
	}

	@Override
	public void finished() {
		System.out.println("Computation is finished!");
	}

}
