---
title: Interactive Fire Simulation


---

![Example of a fire simulation](images/Fire-simulation.jpg){width="700px"}

# Summary

In this project, our team will create a fire simulation based on noise functions combined with particles simulating burning ashes flying away from the fire. It will include an interactive part where the user can adapt certain parameters.

# Goals and Deliverables

For this project, our goal is to create a simulation of a fire. This will include an interactive part where the user can move the camera and adapt the fire size. This project will also entail adapting the fire temperature (which affects the fire color) depending on how far away a particular flame is from the fire center.

In the following we have listed the basic features we expect to implement for a passing grade and the advanced features we aim to achieve. We have also added some extra features at the end as potential bonus features in case we finish our project early and aim for a grade between 5.5 and 6.

#### Basic features for passing grade:

- noise function fire
- glowing ash particles flying out of the main fire part
    - have particles die after a certain time (to simulate ashes not glowing after a while)
    - Temperature influencing color of particles


#### Advanced features:
###### We would like to do the following advanced features

- noise function for smoke
- enable moving the camera
    - probably also requires billboarding

- add bloom effect to the particles

- adapt fire size
    - adapt fire temperature
    - adapt speed of particles

###### The following advanced features would be possibilities if we finish the other features early <br> (however, we believe this is out of the scope of this project and we will have plenty of work with the points listed above)

- add background (e.g., fire place with wood logs, etc.)
    - Shadow
- moving the fire with the curser
    - (assuming there is no wind, otherwise this would imply using a lot of physics calculations?)

# Schedule

We will all cooperate and work on the tasks together. This way we can minimize individual problems as much as possible and mitigate someone getting stuck on a bug while the others do not know much about that team member's code.

##### Week of 01.05.2023
- instanciate the project
- create fire based on noise function (basic feature)
- start with the glowing ash particles (basic feature)

##### Week of 08.05.2023
- continue with the glowing ash particles (basic feature)
- add noise function for smoke (advanced feature)


##### Week of 15.05.2023
- enable camera movement (advanced feature)
- start with bloom effect for the particles (advanced feature)

##### Week of 22.05.2023
- continue with bloom effect for the particles (advanced feature)
- enable adapting firesize (advanced feature)
- start with presentation video


##### Week of 29.05.2023
- Finalize the presentation video
- Write the report webpage


# TA Review Grading Contract
Core [4.0]
Particle rendering with billboards [only with WebGL]

- drawing billboards (a surface always facing the camera)
- simple shader of fire / smoke / cloud, based on noise (this shader is applied to the billboards)
- particles animate over time:
  - the fire evolves / smoke dissipates etc
  - particles move in space
  - particles disappear after some time smoothly
- at least 2-3 distinct types of particles (ie fire, smoke, cloud, water splash, magic)
- particles can be spawning at a constant rate

Please cite resources used (such as tutorial/articles you find online, code snippets, external libraries, 3d models) so that we can determine what is your original contribution. Thanks!

Extensions [clamped to 5.5]
[+0.25] Dealing with overlap
Particles are usually used in tight groups to create an impression of filling a volume. 
This poses a challenge since they visually overlap. One of those solutions might help:
- Use transparency and sorting
  The particle shader is partially transparent. Then it makes a difference which particle is drawn on top.
   Particles can be sorted by position to draw the ones closest to the camera last.
OR
- Use masked shader (one with `discard` instruction) to create opaque particles with holes in them (driven by the noise).
Then the depth buffer will be used to show whats in front.

[+0.5] use instanced rendering pipeline in regl, draw a big number of particles
All particles are drawn in a single draw call.
This involves setting up buffers to store the particle data and updating the buffer.

[+0.25 - +0.5] Elaborate particle spawning, [+0.25] for each spawning scheme
Particles are created at different locations in the scene for an artistic effect.
Examples:
- small asteroids split from the main one and each of them has their fire trail
- clusters of particles make clouds which move over time and animate their shape

[+1 on WebGL] Bloom multi-pass rendering pipeline.
Bloom is the glow around bright parts of the scene, it creates a very potent visual effect.
It is achieved by running a 2nd rendering pass which blurs the high-brightness areas.

[+1 on WebGL] Deferred shading multi-pass pipeline, allowing numerous small light sources.
The rendering is split into two stages: 
- save depth, normals and colors of the solid parts of the scene to a buffer
- draw the lights on top of it

[+0.5] Scene composition
The particle emitters are composed into a complete scene. 
There are multiple points where particles are spawned.

[+0.5] Camera - animated camera path and target, video cinematography
Setup several shots in your video to showcase your scene and effects. Move the camera along a programmed path.
   [+1 instead of 0.5] if camera paths are using Bézier curves for camera trajectory and you implement the formulas yourself.
  (Curve automatically generated, or manually designed for a fixed scene - if scene is gneerated you can guarantee a fixed scene by seeding the random number generator with a constant seed)

--------------------
Please let us know your thoughts!
We wish you an enjoyable and inspiring project.

If you have an implementation plan or prototype you can consult it with us before grading to determine if it satisfied the contract objective.
Reply 
See this post in context 



# Milestone Report

## Summary
We started out by having fire spawn as spherical actors that were grading with a gaussian function whose size decreased over time and disappeared over time. Also, we started with the billboarding to make the computation more efficient and not have to render entire spheres. We managed to make the billboards always look at the camera, however, when moving the camera around, the billboards do not always have the same orientation and rotate in their own plane. We have not yet been able to find out why this is the case.

This means that, from our core tasks, we have been able to complete the animation of particles and their spawning and partially complete the billboarding, the shader, and the multiple types of particles.

We started with the GL1 template since it had a lot of useful code we could have used like the camera rotation, or the use of actors in our scene for example.


## Current State
Our sphere implementation of the fire looked as follows:

![Fire simulation with the spheres](images/fire_simulation_spheres.jpg){width="700px"}

This is the current state of the billboard implementation

![Fire simulation with the billboards](images/fire_billboarding_upright_squares.jpg){width="700px"}

When moving the camera around, the billboards change their orientation within their plane (which should not happen and will be fixed)

![Problem with the sideways billboards](images/fire_billboarding_sideways_squares.png){width="700px"}


## Updated Schedule
In a next step, we will try to fix the billboard issue described above. Additionally, we will implement the bézier curve extension. We will also add the animation of smoke and its dissipation in our simulation.
Lastly, we will need to enable the fire particles to look like particles instead of squares which we are planning to do with images containing black parts which should end up being see-through


# Final Deliverables

## Abstract
The goal of our project was to make a fire simulation using particles that move and disappear after some time combined with other effects such as smokes particles going away from the fire, blending, billboarding, mesh, moving the camera, implement Bézier curves and make other sources of magic fire simulation !

## Technical Approach

#### Summary of our technical approach
As a starting point, we started with the GL1 and PG1 homeworks that we did this year due to the fact that there was already a template for the camera, actors and a scene we found would be good that were defined in GL1 and there was already nice code on noise functions in the PG1 homework, so we thought it would make a good start for our project.

First, we started with the GL1 template and modified the actors such that we would have a fire actor with at start the sun texture and make our fire simulation there at the origin of the scene.

At first, it was just simple fire sphere particles using random gaussian noise that were already moving and disappearing over time. This was done using an array containing all the particles in a for loop. In each particle, we allocated its transformation matrix and we made a particle as an actor of our scene. To do so, we created an export class FireParticlesMovement that would compute the model_matrix and simulate the fire particles in the scene. We then needed to make another class SysRenderFireParticlesUnshaded in order to draw the actors with 'unshaded' shader_type.

Secondly, we tried to do some 2 triangles meshing because our partial fire simulation right now is making spheres which takes a lot of workload for the GPU, so we tried to change that in order to reduce significantly the workload of the GPU. To do so, we took inspiration from previous homeworks and created a constant rectangle which has as elements the vertex_positions of the triangles, the faces and the vertex_tex_coordinates. So we replaced those elements instead of the ones creating the spheres.

Then, we tried to implement billbording for our particles so that they are always oriented towards the camera regardless of where the camera is. This way, our fire simulation will look good even if we look at it from the above or from the sides of the fire. To do so, in the class FireParticlesMovement we implement a new matrix called mat_model_to_world where we apply to it rot_axis and angle_to_camera matrices that we computed. So we add the camera position to the scene and we now calculate the model_matrix with the camera position as well.

Also, we then implemented the blending for the fire particles to give them some aspect of transparency to make the fire way more realistic. To do so, we added a blend element in the ParticlesRenderer class so it produces new images. The blending is composed of an attribute alpha which determines the degree of transparency that we want to apply to the pixels. We took inspiration from this [Blending Example](https://github.com/regl-project/regl/blob/master/API.md#blending) and we also then added an if condition in the fragment shader if the sum of the rgb colors is less than 1. If that is the case, we put alpha to 0 otherwise it equals to 1 and we use this alpha variable for the gl_fragColor. We then added a Gaussian filter to create a mask and apply it to the texture color.

We then, started to add some smokes particles in the same way that we added fire particles previously. But the difference here is that we tried to do it with perlin noise functions. So we took some code and files from our PG1 homework and added it to our project. Then, in noise.frag.glsl we added a function that computes a cloud texture that we will use to create an image we will use to make the smoke particles. We also created them with triangle meshing, blending and billboarding and we added the smoke particles in the renderer so it is simulated in the scene. We also created new vertex and fragment shaders for the smoke to make the code cleaner and more readable that follow the same logic than the fire shaders. The smoke particles are using the same cloud texture that we saved in a smoke_buffer.

We also tried to then produce more particles for one fire spot and we made them spread over a greater surface, same for the smoke particles.
Moreover, we did some refactoring to make the code cleaner and more readable.

We then added another actor for the rocks that we could place around the fire spot. To do so, we added a new class SysRenderRockUnshaded where we will collect all the objects in an array and draw them by running the pipeline on all the objects. We also added a mesh function for the rocks adn we then load the meshes in our main class and added the vertex and fragment shader for the rocks. At first, we used the moon as the texture for our rocks but we then used a darker texture which seems more realistic.

Then, we made 4 new fire magic spots around our main realistic fire spot in the same logic as we did for the previous fire spot but we used a different magic green texture for the fire particles. We put them close to our main fire spot.



#### Description of problems
Our first problem was that our camera eye wasn't pointing towards the origin of the scene where the fire simulation was displayed. To do so, we just created a camera_focus_translation_mat and multiplied it with mat_view and mat_turnable.

Our second problem was with the billboarding, the particles were successfully always looking at the camera but they sometimes are rotating around themselves. We didn't find a way to solve this problem but we can't really see the problem with all the other particles and effects that we added later.

Our third problem wa for the blending. We were not sure what parameters we should put for the dstAlpha attribute in the render as there was multiple possibilities. So we tried them all and decided that the choice 'one minus src alpha' was the one giving us the most decent result in our project.

Our fourth problem was with the perlin noise function for the cloud texture. The texture was only on the top right corner of the image, so the smoke particles weren't looking good since there was a lot of black parts. To solve this problem, we just discarded the region of the image texture where the color was black.


# Contribution from each team member

- Luca Engel :

- Ahmad Jarrar :

- Antoine Garin : 0.25 for the contribution
    - Helped with the start and creation of the project, bringing starting ideas for the concept of the project, made the reports, created the videos, started the perlin noise part and helped overall during the exercise sessions.



# Resources

Here are some links that we found could be useful for our project :

- [OpenGL tutorial for the particles](http://www.opengl-tutorial.org/intermediate-tutorials/billboards-particles/particles-instancing/)
- [Particle effects via Billboards](https://www.chinedufn.com/webgl-particle-effect-billboard-tutorial/)
- [WebGL fundamentals for writing particles in javascript](https://webglfundamentals.org/webgl/lessons/webgl-qna-efficient-particle-system-in-javascript---webgl-.html)
- [Some project report from MIT students](https://groups.csail.mit.edu/graphics/classes/6.837/F99/projects/reports/team09.pdf)
- [A fire effet simulation using GLSL](https://www.shadertoy.com/view/lsdBD2)
- [Blending Tutorial](https://learnopengl.com/Advanced-OpenGL/Blending)
- [Blending Example](https://github.com/regl-project/regl/blob/master/API.md#blending)
- [Mesh used and adapted for rocks](https://www.turbosquid.com/3d-models/3d-short-flat-rocks-1909649)
- [Texture used and adapted for the rocks](https://www.shutterstock.com/image-photo/black-stone-concrete-texture-background-anthracite-1617633904)
- [Texture used for the green_magic](https://www.shutterstock.com/image-vector/abstract-green-blue-blurred-gradient-background-561604051)