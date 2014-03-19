import java.util.Random;

import kn.uni.voronoitreemap.core.VoronoiCore;
import kn.uni.voronoitreemap.datastructure.OpenList;
import kn.uni.voronoitreemap.j2d.PolygonSimple;
import kn.uni.voronoitreemap.j2d.Site;


public class TestVoronoiCore {

	public static void main(String[] args) {

		VoronoiCore core = new VoronoiCore();
		OpenList sites = new OpenList();
		Random rand=new Random(100);

		PolygonSimple rootPolygon = new PolygonSimple();
		int width=500;
		int height=500;
		rootPolygon.add(0, 0);
		rootPolygon.add(width, 0);
		rootPolygon.add(width, height);
		rootPolygon.add(0, height);
		
		int amount=200;
		for (int i=0;i<amount;i++){
			Site site = new Site(rand.nextInt(width), rand.nextInt(width));
			site.setPercentage(1);
			sites.add(site);
		}
		sites.get(0).setPercentage(3);


		core.setDebugMode();
		//		core.setOutputMode();
		core.normalizeSites(sites);
		// ArrayList<Site> sites = TestConvergence.getSites(100, rectangle,
		// true);
		// core.setErrorAreaThreshold(0.00);
		// core.setUseExtrapolation(false);
		// normalizeSites(sites);
		core.setSites(sites);
		core.setClipPolygon(rootPolygon);
		long start=System.currentTimeMillis();


		core.setUseNegativeWeights(true);
		core.setCancelOnAreaErrorThreshold(true);
		core.doIterate(5000);


		long end=System.currentTimeMillis();
		double diff=(end-start)/1000.0D;
		System.out.println("NeededTime: "+diff);
	}

}