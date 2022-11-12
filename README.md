# geometry
This repository contains a toy program to search for minimal geometric
constructions using only a compass.

One of the big difficulties with doing so the naïve way is that IEEE floating
point arithmetic is inexact, and this makes it difficult to know if two numbers
are, in fact, the same. To solve this I had to first implement a library for
symbolic computation. (Luckily, we don't need to support very many operations
for this, which keeps the complexity from getting too out-of-control.)
