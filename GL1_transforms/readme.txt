Task GL1.1.1: 2D translation in shader:
- Approach:
    First, we create a new position for our triangles by applying translation to our position, in this case the translation is the
    mouse_offset. Since we deal with homogenous coordinates, we need to use vec4 and to put a value of '1' in the Z axis in order to
    satisfy the homogenous coordinates property and we provide the mouse_offset and color values to the draw_triangle_with_offset call.

- Problem:
    No particular problem for this task.


Task GL1.1.2: 2D matrix transform:
- Approach:
    Now, we draw a green and blue triangles by applying a transformation matrix to the triangles positions. So we multiply our vec4
    position vector by this transformation matrix. Then all there is left to do is to compute this transformation matrix : for the
    green triangle, we want to make it orbite around the center point, so in our matrix_transformation we will first apply our 
    matrix transition then multiply it by our matrix rotation. For the red triangle, we want to make it spin around a fix coordinate,
    so in our matrix_transformation we will first apply the matrix rotation then multiply it by our matrix transition.

- Problem:
    No particular problem for this task.


Task GL1.2.1: MVP matrix:
- Approach:
    First, we apply the transformation_matrix (which is here mat_mvp) to our vertex position vector. Then, we need to compute that
    mat_mvp matrix. We already know the formula which is : mat_mvp = mat_projection * mat_world_to_camera * mat_model_to_world, so
    we just need to use this formula to compute our mat_mvp matrix.

- Problem:
    For some reason, we forgot to multiply by actor.mat_model_to_world so we couldn't see the planets on the scenes, only the sun.


Task GL1.2.2: View matrix:
- Approach:
    Now, we want to construct our view_matrix. We use the mat4.lookAt(out, eye, target, up) function to do so where our eye attribute
    is the camera position in the world coordinates, the view target point here is the origin and the up-vector is (0, 0, 1).
    Then, we need to apply to our view matrix the rotations of the planes occuring in the scene : there is a Z-axis and a Y-axis rotations.
    Finally we compute our view matrix by multiplying our z_rotation, y_rotation and lookAt matrices together.

- Problem:
    No particular problem for this task.


Task GL1.2.3: Model matrix:
- Approach:
    To compute, the model matrix, we first check if the actor has an orbit, if not, then he has no parent. If the actor does have
    a parent, it has an orbit. This orbit is around the parent so we need to compute elements (parent's translation and the
    orbit of the actor around his parent) in relation with the parent in order to compute our model matrix. Then we scale our actor
    according to their size and we make them spin around the Z-axis. Finally we multiply our spinning_matrix by our scaling_matrix and by
    our orbiting_matrix in order to get our model matrix.


- Problem:
    We needed to think first a little bit about what do to with all of the parents parameters and how to use them.


Workload contribution:
    - Luca Engel (329977): 0.34
    - Ahmad Jarrar Khan (353435): 0.33
    - Antoine Garin (327295): 0.33