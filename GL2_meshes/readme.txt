Task GL2.1.1: Compute triangle normals and opening angles
- Approach:
    First, compute the normal vector to each triangle in the mesh with the given formula in the hand out, then push the normals
    in the array tri_normals. Then we compute the angle weights for the 3 vertices of the triangle by computing the angles of the
    triangles and taking their absolute value so we don't have negativ angles and we push them in the angle_weights array.

- Problem:
    No particular problem for this task.


Task GL2.1.2: Compute vertex normals
- Approach:
    We need to go through the triangles in the mesh and for each vertex of the triangles, add the contribution to the normal of the
    vertex. Finally, after all the triangles are visited we normalize all the computed vertex normals.

- Problem:
    No particular problem for this task.


Task GL2.2.1: Pass normals to fragment shader
- Approach:
    First we compute the matrix mat_mvp the same way we did last week. Then we add a varying variable in the normals.vert.glsl and 
    normals.frag.glsl files which will contain the normal. In the main function of the normals.vert.glsl, we set the normal variable.
    Then, in the fragment shader, we use that normal value to draw false-color representation of normals.


- Problem:
    No particular problem for this task.


Task GL2.2.2: Transforming the normals
- Approach:
    We compute mat_mvp, mat_model_view and mat_normals_to_view like we did in the previous exercise. Here mat_normals_to_view is equal
    to mat3.normalFromMat4(mat_normals_to_view, mat_model_view) which takes the inverse of the transpose of mat_model_view.
    Finally, we need to apply that transformation matrix to the normal vectors in normals.vert.glsl.

- Problem:
    No particular problem for this task.


Task GL2.3: Gouraud lighting
- Approach:
    First, we need to compute the lighting value for each vertex in shade_pervertex.vert.glsl. But we need to keep in mind that the
    calculations happen in view-space. So in order to put the vertex position into view-space, we apply the mat_model_view matrix to
    our vertex position and store the color in a varying variable. Then we display it in the shade_pervertex.frag.glsl.

- Problem:
    No particular problem for this task.


Task GL2.4: Phong lighting
- Approach:
    First, we need to set up the varying variables we will pass to the fragment shader and compute them in the main function of the 
    shade_perpixel.vert.glsl file.
    Then, we implement the Blinn-Phong model in shade_perpixel.frag.glsl using the varying variables we passed on. We also need to
    make sure we normalize vectors which might have been affected by interpolation and finally we display the resulting color.

- Problem:
    No particular problem for this problem.

Workload contribution:
    - Luca Engel (329977): 0.34
    - Ahmad Jarrar Khan (353435): 0.33
    - Antoine Garin (327295): 0.33