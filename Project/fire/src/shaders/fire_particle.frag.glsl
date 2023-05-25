precision mediump float;
		
varying vec2 v2f_tex_coord;

uniform sampler2D texture_base_color;
uniform bool is_smoke_particle;
uniform sampler2D smoke_tex_buffer;


float gaussian(float x, float sigma) {
	return exp(-0.5 * x * x / (sigma * sigma));
}

void main()
{	
	// We use a different texture for smoke particles than for fire particles
	vec4 color_from_texture;
	if (is_smoke_particle) {
		color_from_texture = texture2D(smoke_tex_buffer, v2f_tex_coord);
	} else {
		color_from_texture = texture2D(texture_base_color, v2f_tex_coord);
	}
	
	// vec4 color_from_texture = texture2D(texture_base_color, v2f_tex_coord);
	vec4 solid_color = vec4(0.95, 0.51, 0.22, 1.0);

	float alpha = 1.0;

	float sigma = 0.2; // Adjust this for desired blurriness
	float strength = 1.0; // Adjust this for desired strength
	float mask = gaussian(v2f_tex_coord.x - 0.5, sigma) * gaussian(v2f_tex_coord.y - 0.5, sigma);

	if (mask < 0.2)
		discard;

	// Apply the Gaussian mask to the texture color
    // vec4 resultColor = color_from_texture * vec4(vec3(mask * strength), 1.0);
	// gl_FragColor = color_from_texture;


	if (color_from_texture.r + color_from_texture.g + color_from_texture.b < 0.1) {
        discard;
    }


	gl_FragColor = color_from_texture; //solid_color;
	

	// if (color_from_texture.r + color_from_texture.g + color_from_texture.b < 1.) {
	// 	alpha = 0.0;
	// }
	// gl_FragColor = vec4(color_from_texture, alpha); // output: RGBA in 0..1 range
	// gl_FragColor = vec4(vec3(0.0), 0.0); // output: RGBA in 0..1 range
}