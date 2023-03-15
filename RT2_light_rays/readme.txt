Implement Lighting Models: Task RT2.1
- Approach:
    - lighting() method: First, we need to implement the diffuse component which is the same for both the Blinn-Phong and the Phong models. Then, we need to
    make sure we are on the correct side of the light (if not there should be no illumination) and we then compute the specular component
    according to which model we want to use (because the specular components aren't the same in the Blinn-Phong and Phong models). But
    before doing that, we need to make sure that the reflected light shines towards the camera. Finally we return the output color
    which is the sum of the specular component and the diffuse component.
    - render_lighting() method: this method gives us the light in the scene using ray-tracing. Therefore, we need to first check if
    the ray intersects with an object in the scene. If it does, we compute the ambient contribution to the total intensity and compute
    the sum of each light intensity contribution (to do that we use the lighting() method we just coded before) and we store that sum
    such that we have the formula of the global intensity I at an intersection point as described in the lecture.

- Problems:
    We encountered several problems: first our computation of the specular components were wrong, we forgot to multiply some of our
    computations with light.color (the first version of the handout was a bit confusing) and we forgot to check that we were on the
    correct side of the light which gave us very weird results that we struggled to see where it was coming from (it created a very
    strange bug where the photos on MacOS were ok but on Windows the result wasn't good at all).

Implement Shadows: Task RT2.2
- Approach:
    We first shoot a shadow ray from the intersection point to the light and we check whether that shadow ray intersects with an object
    from the scene and we update the lightning accordingly (i.e. if we are in the shadow we need to remove the light).

- Problems:
    We had problems with shadows that appeared on some parts of the scenes when they were not supposed to appeared at those areas. This
    problem came from the fact that we didn't check the collision distance.

Derive iterative formula: Task RT2.3.1
- Approach:

- Problems:

Implement reflections: Task RT2.3.2
- Approach:
    For mirror1 and mirror2 we chose 3 as the number of reflections.
    
- Problems:

Workload contribution:
- Luca Engel (SCIPER):
- Ahmad Jarrar (SCIPER):
- Antoine Garin (327295): 0.3