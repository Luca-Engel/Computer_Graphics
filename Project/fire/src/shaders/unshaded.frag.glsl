precision mediump float;
		
varying vec2 v2f_tex_coord;

uniform sampler2D texture_base_color;

void main()
{
	vec3 color_from_texture = texture2D(texture_base_color, v2f_tex_coord).rgb;

	float alpha = 1.0;
	// if (color_from_texture.r + color_from_texture.g + color_from_texture.b < 1.) {
	// 	alpha = 0.0;
	// }
	gl_FragColor = vec4(color_from_texture, alpha); // output: RGBA in 0..1 range
}