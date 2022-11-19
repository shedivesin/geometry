# geometry
This repository contains a toy program to search for minimal geometric
constructions using only a compass.

This problem is actually surprisingly tricky: the search space grows very
quickly and it is not trivial to optimize. It certainly doesn't help matters
that I'm writing my search program in Javascript, though it doesn't hurt as
badly as you'd think: it turns out that if you write your Javascript like C,
the JIT is able to compile it most of the way to C. (But on the other hand,
if you're writing your Javascript like C, why not just write it in C?)

My first attempt was able to search constructions of size six in a few minutes,
which was adequate for solving Napoleon's problem. This was much too slow to
attempt larger problems; however, with some effort, I've so far managed to make
it _four orders of magnitude_ faster, which is adequate for searching for
constructions up to size eight.

I have hopes that with straightforward optimizations I can get the next order
of magnitude. Beyond that seems out of reach at present without algorithmic
breakthroughs.

## Regular Polygons
|Sides|Circles|Notes|
|-----|-------|-----|
|3    |2      |Given by Euclid ([Elements I 1][])|
|4    |6      |Same as inscribed in a given circle (see below).|
|5    |7      |Given by Kurt Hofstetter ([Forum Geometricorum VIII][])|
|6    ||
|8    ||
|10   ||
|12   ||
|15   ||

[Elements I 1]: http://aleph0.clarku.edu/~djoyce/java/elements/bookI/propI1.html
[Forum Geometricorum VIII]: https://forumgeom.fau.edu/FG2008volume8/FG200819.pdf

## Regular Polygons Inscribed in a Given Circle
|Polygon|Circles|Notes|
|-------|-------|-----|
|3      |3      |Trivial.|
|4      |6      |Known as "Napoleon's problem."|
|5      |||
|6      |4      |Trivial.|
|8      |||
|10     |||
|12     |||
|15     |||
