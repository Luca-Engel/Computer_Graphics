Task PG1.2.1: 1D Perlin Noise
- Approach:
    We just round down the input x and determine the 2 endpoints. We then apply the hash function and lookup the gradient from the table.
    Finally we linearly interpolate from the the enpoints and mix the contribution from the two sides.

- Problem:
    No particular problem for this task.


Task PG1.3.1: 1D FBM
- Approach:
    we loop through num_octaves times and sum perlin noise at point p multiplied by the fequency nultiplier and scaled amplitude.

- Problem:
    No particular problem for this task.


Task PG1.4.1: 2D Perline Noise
- Approach:
    Similar to Task PG1.2.1 we had to find endpoints and then calculate gradients of hash functions, and finally, mix the contributions using interpolation.
    This time it was in 2D so we had to mix the contributions two at a time (top and bottom).    

- Problem:
    No particular problem for this task.

Task PG1.4.2: 2D FBM
- Approach:
    This task was same as PG1.4.2
    
- Problem:
    No particular problem for this task.

Task PG1.4.3: 2D Turbulence
- Approach:
    This task is similar to Task PG1.4.2 except this time we use absolute of perline noise.

- Problem:
    No particular problem for this task.

Task PG1.5.1: Map Texture
- Approach:
    We implemented the map texture by showing water (blue) if the perlin noise  was computed below water level, else we displayed land (brown and green color) that was interpolated weight as difference from water level.

- Problem:
    No particular problem for this task.

Task PG1.5.2: Wood Texture
- Approach:
    We implemented the wood texture by implementing the equation given in handout.

- Problem:
    No particular problem for this task.


Task PG1.5.3: Marble Texture
- Approach:
    We implemented the wood texture by implementing the equations given in handout.

- Problem:
    No particular problem for this task.

Task PG1.6.1: Terrain
- Approach:
    We created the 3D terrain by first creating a grid of vertices displaced in z axis using an FBM and then splitting each grid cell into 2 triangles. Once We had the mesh we used code similar to previous tasks to color it using bling phong shader.

- Problem:
    No particular problem for this task.

Workload contribution:
    - Luca Engel (329977): 0.34
    - Ahmad Jarrar Khan (353435): 0.33
    - Antoine Garin (327295): 0.33