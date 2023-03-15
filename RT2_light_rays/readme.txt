Implement Lighting Models: Task RT2.1
- Approach:
    - lighting() method: First, we need to implement the diffuse component which is the same for both the Blinn-Phong and the Phong models. Then, we need to
    make sure we are on the correct side of the light (if not there should be no illumination, i.e., if we are looking at the uniluminated part of the object)
    and we then compute the specular component according to which model we want to use (because the specular components aren't the same in the Blinn-Phong and Phong models). But
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
    strange bug where the photos on MacOS were ok but on Windows the result wasn't good at all as, apparantly, negative numbers are handled differently
    on the two systems).

Implement Shadows: Task RT2.2
- Approach:
    We first shoot a 'shadow ray' from the intersection point to the light and we check whether that shadow ray intersects with an object
    from the scene before it intersects with the light source and we update the lighting accordingly
    (i.e. we are in the shadow if there is an object in between our origin of the 'shadow ray' and the light source and, then, 
    we need to remove the light).

- Problems:
    We had problems with shadows that appeared on some parts of the scenes when they were not supposed to appeared at those areas. This
    problem came from the fact that we didn't check the collision distance, i.e., we did not check if the object casting the 'shadow' was
    between the sun and our object or not.

Derive iterative formula: Task RT2.3.1
- Approach:
    We computed a general formula for contribution of ith reflected ray and then summed up all contributions upto ith ray, using the assumptions provided. This showed the required formulation.
    In order to represent it as an iterative formula, we simplified the term by representing the product term using induction and using it for a simpler term.

- Problems:
    This questions was easy to comprehend and the only difficulty was how to put it into words mathematically.

Implement reflections: Task RT2.3.2
- Approach:
    For mirror1 and mirror2 we chose 3 as the number of reflections.
    
- Problems:
    All the reflections looked realistic and reasonable except mirror creature. There were reflection of the creature on the mirror cylinders but the output was different to the reference image
    as there was no light reflected from the mirros and the scene appeared much darker than usual. We couldn't find a fix for this issue. However we noted that when we turned off 1 of the 2 lights
    of the scene, 2 legs of the creature disappeared completely even with reflections turned on (4 number of reflections). We have attached our output 
    as mirror_creature_BlinnPhong.png and mirror_creature_BlinnPhong_one_light.png for reference.

Workload contribution:
- Luca Engel (SCIPER): 0.33
- Ahmad Jarrar Khan (353435): 0.33
- Antoine Garin (327295): 0.33