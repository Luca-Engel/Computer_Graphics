precision mediump float;

/* #TODO GL2.4
	Setup the varying values needed to compue the Phong shader:
	* surface normal
	* lighting vector: direction to light
	* view vector: direction to camera
*/
//varying ...
//varying ...
//varying ...
varying vec3 surface_normal;
varying vec3 light_v;
varying vec3 view_v;

uniform vec3 material_color;
uniform float material_shininess;
uniform vec3 light_color;

void main()
{
	float material_ambient = 0.1;

	/*
	/** #TODO GL2.4: Apply the Blinn-Phong lighting model

	Implement the Blinn-Phong shading model by using the passed
	variables and write the resulting color to `color`.

	Make sure to normalize values which may have been affected by interpolation!
	*/

	vec3 n = normalize(surface_normal);
	vec3 l = normalize(light_v);
	vec3 v = normalize(view_v);
	vec3 h = normalize(v + l);

	vec3 specularComponent = vec3(0.);
	vec3 diffuseComponent = vec3(0.);

	if (dot(n, l) > 0.) {
		diffuseComponent = material_color * light_color * dot(n, l);

		if (dot(n, h) > 0.) {
			specularComponent = material_color * light_color * pow(dot(n, h), material_shininess);
		}
	}

	vec3 color = light_color * material_ambient + diffuseComponent + specularComponent;


	gl_FragColor = vec4(color, 1.); // output: RGBA in 0..1 range
}
