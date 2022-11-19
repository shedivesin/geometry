# geometry
This repository contains toy programs to search for minimal geometric
constructions using only a compass.

There are (presently) two variants:

1.  `hash.js`: This variant uses a hashing algorithm to ensure that we only
    visit one of the set of equivalent constructions. (Two constructions are
    equivalent if they are the same but for order of circles drawn, reflection,
    rotation, etc.)

    This version attempts to search fewer nodes (even if it's slow).

2.  `wheels.js`: This variant makes no attempt to de-duplicate equivalent
    constructions. Instead, we hardcode the first few levels of the tree with
    duplications removed (calling these "wheels", like the wheels in the Sieve
    of Eratosthenes). This gets us some of the benefit of de-duplication
    removal without the cost of having to do so at each step.

    This version attempts to search quickly (even if it searches more nodes).

Right now, the latter is significantly faster in practice, but it is believed
that algorithmic improvements and optimizations will eventually cause the
former to leapfrog it.

On my machine, `wheels.js` can completely search 8 levels deep in a couple
minutes. Unfortunately, that is still an order of magnitude to slow to be
practical for the kinds of constructions I am interested in.
