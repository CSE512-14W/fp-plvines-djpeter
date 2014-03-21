Work breakdown:

Peter:

I worked on the interface between data and the core algorithm, which Paul implemented.  I also wrote java utilities to interface with the existing java implementation of our key guiding paper.  I implemented some corner cases for the optimization, and aided with the somewhat brutal debugging of the core convex-hull and iterative optimization code (which Paul took the lead on).  I made the poster.  I worked on the D3 interface to the core algorithm, and made the demo webpage to allow for selection of datasets, shapes, and appearance parameters.



Development commentary:

Peter:

This project made very clear to me how tricky JavaScript can be for complex algorithms and system building.  I have never missed type-checking and reasonable variable scoping so much in my life.  We discovered that, though the Nocaj & Brandes paper was well written, their available Java implementation deviated in subtle but important ways.  There were also corner cases which both our and their algorithm fail to deal with, leading to some lingering bugs in our code which are difficult to diagnose.  Unfortunately, the core algorithm took so much effort and time to get working reasonably that we weren't able to get to some of the more exploratory or interactive pieces we had hoped to, but I am still quite pleased with our result, which is surprisingly fast and produces some beautiful output.