Work breakdown:

Peter:

I worked on the interface between data and the core algorithm, which Paul implemented.  I also wrote java utilities to interface with the existing java implementation of our key guiding paper.  I implemented some corner cases for the optimization, and aided with the somewhat brutal debugging of the core convex-hull and iterative optimization code (which Paul took the lead on).  I made the poster.  I worked on the D3 interface to the core algorithm, and made the demo webpage to allow for selection of datasets, shapes, and appearance parameters.

Paul:
I worked primarily on implementing the core algorithm consisting of the 3D convex hull algorithm and the iterative control algorithm that ran the convex hull. I also worked a little on the D3 interface side. I wrote the paper and ran the empirical experiments testing how long the java and javascript implementations took.



Development commentary:

Peter:

This project made very clear to me how tricky JavaScript can be for complex algorithms and system building.  I have never missed type-checking and reasonable variable scoping so much in my life.  We discovered that, though the Nocaj & Brandes paper was well written, their available Java implementation deviated in subtle but important ways.  There were also corner cases which both our and their algorithm fail to deal with, leading to some lingering bugs in our code which are difficult to diagnose.  Unfortunately, the core algorithm took so much effort and time to get working reasonably that we weren't able to get to some of the more exploratory or interactive pieces we had hoped to, but I am still quite pleased with our result, which is surprisingly fast and produces some beautiful output.

Paul:
The research process was fairly straightforward: we had a clear goal in mind and only a handful of papers addressing it. The development side was significantly more difficult, complicated primarily by the fact that neither of us had much javascript experience. Additionally, even though we based our implementation off a java implementation written by the authors of the paper we were adhering to, we found out that that java implementation also had bugs, which compounded with our own self-induced bugs. The D3-side of things seemed to go much more smoothly: integrating our core algorithm with a D3 layout interface was fairly straighforward once we got the hang of the layout objects, and I think implementing additional spiffy features from there would have been fairly easy. Unfortunately because of the previously mentioned bugs in the complicated part we did not have time to polish the D3 interface more, which is a shame and I hope someone (or one of us) will come along and do so in the future.
