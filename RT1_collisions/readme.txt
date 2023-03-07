Ray-plane intersection: RT1.1
- Approach:
    The approach for the ray-plane intersection was straightforward : we just checked first if the ray-direction and the plane-normal
    vectors were perpendicular, if yes then there is no intersection, as the plane and ray are parallel in that case. 
    
    If that is not the case, we search for a point on our ray that is inside the plane (i.e., for which the implicit plane funciton holds)
    if that point is p, we can define p as: p = ray_origin + t * ray_direction
    To find p, we need to find a t such that
    dot(plane_normal, ray_origin) + t * dot(plane_normal, ray_direction) - plane_offset = 0. Once we have find such a t, it means we have a
    point x that intersects on the plane.

- Problems:
    The only problem we've got was about the "return t > 0.", we forgot the "." at the end which triggered an error and we fixed it.


Ray-cylinder intersection theory: RT1.2.1
- Approach:
    The approach for the ray-cylinder intersection required a lot of work : first, we had to draw the situation we were
    working on so we would have a better idea of how to find the implicit equation for the cylinder. So we tried to draw it from the
    front view and use the pythagoreon theorem using the knowledge of the cylinder radius and the hypothetical intersection 
    point (p = ray_origin + t * ray_direction) with the cylinder but at some point we were stuck since we couldn't manage to solve for t. 
    Then, we thought of drawing the situation from a different angle : the
    top view of the cylinder and it became easier to find the implicit equation of the cylinder. We came up with a quadratic
    equation we had to solve for t. So we can have a maximum of 2 solutions (the t's leading to the points of intersection) 
    for our equation (one for the front part of the cylinder and the other one for the back part of the cylinder). 
    Finally, we need to check if the solutions are actually within the height of the cylinder, 
    if not then those solutions are not points of intersection and we have no solution. If both points are in bounds of the cylinder, 
    then we only consider the one visible (i.e. in the front half of the cylinder) and not the other one.

- Problems:
    First we tried to find the implicit equation for a cylinder by using the Pythagore theorem but it ended up with a very complex
    equation we had to simplify in order to isolate t. So we had to try something else and eventually we came up with the good approach.
    When we found the good approach the difficulty was to think of changing the view we were working on : going from the front view of
    the cylinder to his top view which helped us a lot in order to find the right equation for the ray-cylinder intersection.
    To be able to switch to the top view, we had to get rid of the vertical components so that the components would have the right proportions.

Ray-cylinder intersection implementation: RT1.2.2
- Approach:
    We just followed what we did on the theory part and we followed the hints of the assignment : we checked if the ray direction and
    the cylinder axis are parallel, if that's the case then there is no intersection between the cylinder and the ray.
    Then we computed the values we found on RT1.2.1. We then solved the quadratic equation, find t and the number of solutions we have
    and we then check if those solutions are actually intersection points (i.e. if they are within the cylinders bounds)


- Problems:
    The implementation was straightforward, we just had to be careful about the fact there can be up to 2 solutions and that those
    solutions might not be intersection points.


Total workload:
- Lucas Engel:0.32
- Ahmad Jarrar: 0.4
- Antoine Garin: 0.28

