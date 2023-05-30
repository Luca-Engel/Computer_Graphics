precision mediump float;
		
varying vec2 v2f_tex_coord;

uniform vec4 texture_color;
uniform bool is_smoke_particle;
uniform sampler2D smoke_tex_buffer;


float gaussian(float x, float sigma) {
	return exp(-0.5 * x * x / (sigma * sigma));
}

void main()
{	
	// We use a different texture for smoke particles than for fire particles
	vec4 texture = texture2D(smoke_tex_buffer, v2f_tex_coord);
	
	// vec4 solid_color = vec4(0.95, 0.51, 0.22, 1.0);

	float alpha = 1.0;

	float sigma = 0.2; // Adjust this for desired blurriness
	float strength = 1.0; // Adjust this for desired strength
	float mask = gaussian(v2f_tex_coord.x - 0.5, sigma) * gaussian(v2f_tex_coord.y - 0.5, sigma);

	if (mask < 0.2)
		discard;

	// Apply the Gaussian mask to the texture color
    // vec4 resultColor = color_from_texture * vec4(vec3(mask * strength), 1.0);
	// gl_FragColor = color_from_texture;


	if (texture.r + texture.g + texture.b < 0.1) {
        discard;
    }


	gl_FragColor = texture * texture_color; //solid_color;
	
}