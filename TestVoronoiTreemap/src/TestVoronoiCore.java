import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
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
		
		/*
		int amount=200;
		for (int i=0;i<amount;i++){
			Site site = new Site(rand.nextInt(width), rand.nextInt(width));
			site.setPercentage(1);
			sites.add(site);
		}
		sites.get(0).setPercentage(3);
		*/
		
		// this throws exceptions:
//		java.lang.RuntimeException: Weight of a Site may not be NaN.
//		at kn.uni.voronoitreemap.diagram.PowerDiagram.computeDiagram(PowerDiagram.java:128)
		
/*		Site site = null;
		site = new Site(125, 125);
		site.setPercentage(70);
		sites.add(site);
		site = new Site(125, 375);
		site.setPercentage(10);
		sites.add(site);
		site = new Site(375, 375);
		site.setPercentage(10);
		sites.add(site);
		site = new Site(375, 125);
		site.setPercentage(10);
		sites.add(site);*/
		
		Site site = null;
		site = new Site(125, 125);
		site.setPercentage(70);
		sites.add(site);
		site = new Site(125, 376);
		site.setPercentage(10);
		sites.add(site);
		site = new Site(375, 377);
		site.setPercentage(10);
		sites.add(site);
		site = new Site(375, 128);
		site.setPercentage(10);
		sites.add(site);

		


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


		//core.setUseNegativeWeights(true);
		core.setUseNegativeWeights(false);
		
		core.setCancelOnAreaErrorThreshold(true);
		
		// can iterate one at a time:
		int iterations = 5000;
		BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
		for (int i = 0; i < iterations; i++) {
			core.doIterate(1);
			System.out.println("Paused after iteration: " + i);
			try {
				String input = br.readLine();
			} catch (IOException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
		}
		
		// or all at once:
		//core.doIterate(iterations);


		long end=System.currentTimeMillis();
		double diff=(end-start)/1000.0D;
		System.out.println("NeededTime: "+diff);
	}

}
