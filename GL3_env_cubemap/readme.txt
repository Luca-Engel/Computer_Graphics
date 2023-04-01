Task GL3.1.1: Sampling a texture
- Approach:
    We simply sample the texture tex_color at the UV coordinates passed on from vertex shader and output the texture’s color by giving
    to the color vector the 3 components of the tex_color vector.


- Problem:
No particular problem for this task.


Task GL3.1.2: UV coordinates and wrapping modes
- Approach:
    First, we just need to multiply by 4 all the components of the vertex_tex_coords matrix so that the texture is repeated 4 times.
    Then, we just need to set the texture options (wrap) of the tile texture to 'repeat' so that the tile texture repeats itself.

- Problem:
    No particular problem for this task.


Task GL3.2.1: Projection matrix for a cube camera
- Approach:
    We contruct the cube_camera_projection matrix with the mat4.perspective function with the right arguments. 

- Problem:
    No particular problem for this task.


Task GL3.2.2: Up vectors for cube camera
- Approach:
    We just need to look at the up vectors of each face of the cube and put the direction of the face-up vector of the face of the
    cube we are interested in multiplied by (-1) on the right components of the matrix.

- Problem:
    No particular problem for this task.


Task GL3.2.3: Reflection shader
- Approach:
    First, we pass the view-space normals and viewing-direction from the vertex shader to the fragment shader. It is very similar
    to what we have done in the previous homework. Then we normalize vectors which ought to be unit vectors.
    In the fragment shader, we calculate the reflected ray direction, then sample the cube-map to get the color of the reflected ray.
    This task has similarity with the RT2 homework.

- Problem:
    No particular problem for this task.


Task GL3.3.1: Phong Lighting Shader with Shadows
- Approach:
    This task is quite similar to the Blinn-Phong shader from GL2 but with several differences : first, we pass the fragment position
    in camera space (mat_model_view * vpos) to the fragment shader. We will use it in the fragment shader to calculate the view
    direction, lighting direction, and distance between fragment and light. Therefore we no longer need to pass view and lighting
    directions to the fragment shader.
    Then, we need to scale the light color by the inverse squared distance from the light to the fragment.
    Finally, we use the cube_shadowmap shadow map to test whether the fragment is under shadow; your shader should only output a
    nonzero color if the light is visible from the fragment.

- Problem:
    No particular problem for this task.


Task GL3.3.2 Blend Options
- Approach:
    Here, we just set the blending mode of the pipeline in mesh_render with the right arguments.

- Problem:
    No particular problem for this task.


Workload contribution:
    - Luca Engel (329977): 0.34
    - Ahmad Jarrar Khan (353435): 0.33
    - Antoine Garin (327295): 0.33