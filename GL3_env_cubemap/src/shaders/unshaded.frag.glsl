precision mediump float;
		
// Texture coordinates passed from vertex shader
varying vec2 v2f_uv;

// Texture to sample color from
uniform sampler2D tex_color;

uniform float color_factor;

void main()
{
	/* #TODO GL3.1.1
	Sample texture tex_color at UV coordinates and display the resulting color.
	*/

	vec4 texture = texture2D(tex_color, v2f_uv);
	vec3 color = vec3(texture.x, texture.y, texture.z);


	color *= color_factor; // this allows us to reuse this shader for ambient pass
	gl_FragColor = vec4(color, 1.); // output: RGBA in 0..1 range
}
