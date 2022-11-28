# geometry
This repository contains a toy program to search for minimal geometric
constructions using only compasses. The idea is, one is given two arbitrary
points, one may draw circles centered at one point with radius extending to
a second point. (If that circle intersects any previously drawn circles, the
intersection points may also be used as points.)

## Regular Polygons
The game is, given points A and B, find a regular (or, when that is impossible,
an approximately regular) polygon of a given number of sides inscribed in the
circle A(B) with one of its vertices at B.

This table contains my best solutions.

|_n_|Circles|Notes                                             |
|:-:|:-----:|--------------------------------------------------|
|3  |[3][i3]|                                                  |
|4  |[6][i4]|Called "Napoleon's Problem."                      |
|5  |[8][i5]|                                                  |
|6  |[4][i6]|Construction continued from the triangle.         |
|7  |       |Following Albrect Dürer's construction (_a_=√3/2).|
|8  |       |                                                  |
|9  |       |                                                  |
|10 |       |                                                  |
|12 |[9][iC]|Construction continued from the square.           |
|15 |       |                                                  |
|17 |       |                                                  |

[i3]: https://amissio.net/geo/constructions/inscribed_equilateral_triangle.svg
[i4]: https://amissio.net/geo/constructions/square_2.svg
[i5]: https://amissio.net/geo/constructions/inscribed_regular_pentagon.svg
[i6]: https://amissio.net/geo/constructions/regular_hexagon.svg
[iC]: https://amissio.net/geo/constructions/regular_dodecagon.svg
