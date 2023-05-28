import { vec2, vec3, vec4, mat3, mat4 } from "../lib/gl-matrix_3.3.0/esm/index.js"
import { mat4_matmul_many } from "./icg_math.js"
import {init_noise} from "./noise.js"
import {framebuffer_to_image_download} from "./icg_screenshot.js"


/*
	Construct the scene!
*/
export function create_scene_content() {
	var diameterAroundCenter = 0.1;
	var halfDiameterAroundCenter = diameterAroundCenter / 2;
	var offset = 0.1;
	var offset_x = 0;
	var offset_y = 0;
	var push_next_10 = true;
	var texture_name = "sun.jpg";

	const fire_particles = [];
	const smoke_particles = [];

	// TODO: Tune the number of particles (5000 is good!)
	for (let index = 0; index < 1500; index++) {
		// middle one should be the brightetst
		let offset_x, offset_y, texture_name;

		switch (index % 6) {
			case 0:
			case 1:
				offset_x = 0;
				offset_y = 0;
				texture_name = "sun.jpg";
				break;
			case 2:
				offset_x = offset;
				offset_y = offset;
				texture_name = "magic_green.jpg";
				break;
			case 3:
				offset_x = offset;
				offset_y = -offset;
				texture_name = "magic_green.jpg";
				break;
			case 4:
				offset_x = -offset;
				offset_y = offset;
				texture_name = "magic_green.jpg";
				break;
			case 5:
				offset_x = -offset;
				offset_y = -offset;
				texture_name = "magic_green.jpg";
				break;
		}

		// Here we can set the randomness based on specific perlin noise instead of random gaussian
		const particle = {
			lifetime: 2 * Math.random(),
			size: 0.003 * Math.random() + 0.01,

			// TODO: Tune particle starting position using perline noise etc
			start_position: vec3.fromValues(
				offset_x + (diameterAroundCenter * Math.random() - halfDiameterAroundCenter) / 2,
				offset_y + (diameterAroundCenter * Math.random() - halfDiameterAroundCenter) / 2,
				(0.1 + diameterAroundCenter * Math.random() - halfDiameterAroundCenter) / 10,
			),
			// velocity: vec3.fromValues(
			// 	0.02 * Math.random() - 0.01,
			// 	0.1 * Math.random(),
			// 	0.02 * Math.random() - 0.01),

			// TODO: Tune particle movement direction using perline noise etc
			velocity_x: 0.025 * Math.random() - 0.0125,
			velocity_y: 0.025 * Math.random() - 0.0125,
			velocity_z: 0.07 * Math.random(),

			// TODO: Change Texture here, change to flame texture, can also give an array of textures
			texture_name: texture_name,
			shader_type: "unshaded",
		}
		fire_particles.push(particle);


		const smoke_particle = {
			lifetime: 2 * Math.random(),
			size: 0.03 * Math.random() + 0.01,
			start_position: vec3.fromValues(
				offset_x + (diameterAroundCenter * Math.random() - halfDiameterAroundCenter) / 1.9,
				offset_y + (diameterAroundCenter * Math.random() - halfDiameterAroundCenter) / 1.9,
				(0.1 + diameterAroundCenter * Math.random() - halfDiameterAroundCenter) / 10,
			),
			velocity_x: 0.025 * Math.random() - 0.0125,
			velocity_y: 0.025 * Math.random() - 0.0125,
			velocity_z: 0.1 * Math.random(),
			// texture_name: "moon.jpg",
			shader_type: "unshaded",
		};
		if (push_next_10 && index % 10 == 0 || !push_next_10 && index % 30 == 0) {
			push_next_10 = !push_next_10;
		}
		if (push_next_10) {
			smoke_particles.push(smoke_particle);
		}
	}




	const actors = [
		{
			name: 'firepit_rocks',
			size: 0.1,
			rotation_speed: 0.1,

			movement_type: 'planet',
			orbit: null,

			shader_type: 'unshaded',
			texture_name: 'rocks.jpg',
		},
	]
	// In each rock, allocate its transformation matrix
	for (const actor of actors) {
		actor.mat_model_to_world = mat4.create()
	}

	// Lookup of actors by name
	const actors_by_name = {}
	for (const actor of actors) {
		actors_by_name[actor.name] = actor
	}






	// In each particle, allocate its transformation matrix
	for (const particle of fire_particles) {
		particle.mat_model_to_world = mat4.create()
	}

	for (const particle of smoke_particles) {
		particle.mat_model_to_world = mat4.create()
	}

	// Construct scene info
	return {
		sim_time: 0.,
		actors: actors,
		fire_particles: fire_particles,
		smoke_particles: smoke_particles,
	}
}

export class ParticlesMovement {

	constructor() {

	}

	calculate_model_matrix(particle, sim_time, camera_position) {

		let M_translate = mat4.create();
		let M_rotate = mat4.create();

		// TODO: Add billboarding transform here
		const vec_to_camera = vec3.normalize([0, 0, 0], camera_position);
		const normal = vec3.fromValues(0, 1, 0);
		const rot_axis = vec3.cross([0, 0, 0], normal, vec_to_camera);

		const angle_to_camera = vec3.angle(normal, vec_to_camera);
		mat4.fromRotation(M_rotate, angle_to_camera, rot_axis);


		let initial_position_transform = mat4.fromTranslation(mat4.create(), particle.start_position)
		let particle_time = sim_time % particle.lifetime;

		let displacement = vec3.fromValues(particle_time * particle.velocity_x, particle_time * particle.velocity_y, particle_time * particle.velocity_z)
		let movement_transform = mat4.fromTranslation(mat4.create(), displacement)

		mat4_matmul_many(M_translate, initial_position_transform, movement_transform)

		// Reduce size as particles spend their life
		let remaining_life_scale = (particle.lifetime - particle_time) * particle.size
		let M_scale = mat4.fromScaling(mat4.create, [remaining_life_scale, remaining_life_scale, remaining_life_scale])

		// Store the combined transform in particle.mat_model_to_world
		mat4_matmul_many(particle.mat_model_to_world, M_translate, M_scale, M_rotate)

		// TODO: can also select active texture (if multiple) based on lifetime
	}

	simulate(scene_info, camera_position) {

		const { sim_time, fire_particles, smoke_particles } = scene_info

		// Iterate over fire particles
		for (const particle of fire_particles) {
			this.calculate_model_matrix(particle, sim_time, camera_position)
		}
		// Iterate over smoke particles
		for (const particle of smoke_particles) {
			this.calculate_model_matrix(particle, sim_time, camera_position)
		}
	}

}


/*
	Draw the actors with 'unshaded' shader_type
*/
export class ParticlesRenderer {

	constructor(regl, resources) {
		//TODO: Change from sphere to billboard (will speed up rendering I hope), Hint: can see the 2D traiangle gneration in GL1 Exercise
		const mesh_uvsphere = resources.mesh_uvsphere

		const rectangle = {
			vertex_positions: [
				[-0.5, 0, -0.5],
				[0.5, 0, - 0.5],
				[-0.5, 0, 0.5],
				// [0.5, -0.5, 0],
				// [-0.5, 0.5, 0],
				[0.5, 0, 0.5],
			],
			vertex_tex_coordinates: [
				// Triangle 1
				[0, 0],
				[1, 0],
				[0, 1],
				// Triangle 2
				// [1, 0],
				// [0, 1],
				[1, 1],
			],
			faces: [
				// Triangle 1
				[0, 1, 2],
				// Triangle 2
				[1, 2, 3],

			]

		}

		// Create a list of noise textures for the smoke:
		const noise_textures = init_noise(regl, resources);

		// TODO: pick the correct texture out of the list of textures...
		const smoke_texture = noise_textures[0];

		// The following code is used to save the texture to an image file
		this.smoke_tex_buffer = smoke_texture.draw_texture_to_buffer([0,0], 5);


		this.pipeline = regl({
			attributes: {
				position: rectangle.vertex_positions,
				tex_coord: rectangle.vertex_tex_coordinates,
			},
			// Faces, as triplets of vertex indices
			elements: rectangle.faces,

			// Uniforms: global data available to the shader
			uniforms: {
				mat_mvp: regl.prop('mat_mvp'),
				texture_base_color: regl.prop('tex_base_color'),
				is_smoke_particle: regl.prop('is_smoke_particle'),
				smoke_tex_buffer: this.smoke_tex_buffer,
			},

			// TODO: check if blending is good or if parameters need adjusting
			// https://learnopengl.com/Advanced-OpenGL/Blending
			// https://github.com/regl-project/regl/blob/master/API.md#blending
			// this adds background color to the texture --> lots of fire --> brighter
			blend: {
				enable: true,
				func: {
					srcRGB: 'src alpha',
					srcAlpha: 'one',
					dstRGB: 'one',
					dstAlpha: 'one minus src alpha',
				},
				equation: {
					rgb: 'add',
					alpha: 'add',
				},
				color: [0, 0, 0, 0],
			},

			vert: resources['unshaded.vert.glsl'],
			frag: resources['unshaded.frag.glsl'],
		})

		// Keep a reference to textures
		this.resources = resources
	}

	render(frame_info, scene_info) {
		/* 
		We will collect all objects to draw with this pipeline into an array
		and then run the pipeline on all of them.
		This way the GPU does not need to change the active shader between objects.
		*/
		const entries_to_draw = []

		// Read frame info
		const { mat_projection, mat_view } = frame_info

		

		const particles = scene_info.fire_particles.concat(scene_info.smoke_particles);
		particles.sort(function(a, b) {
			const distance_a = vec3.distance(a.start_position, frame_info.camera_position);
			const distance_b = vec3.distance(b.start_position, frame_info.camera_position);
			return distance_b - distance_a;
		  });

		// For each particle, construct information needed to draw it using the pipeline
		for (const particle of particles) { //scene_info.fire_particles) {

			// Choose only planet using this shader
			if (particle.shader_type === 'unshaded') {

				const mat_mvp = mat4.create()

				let texture_name = this.resources[particle.texture_name];
				let is_smoke_particle = false;

				// If the particle is a smoke particle, then we need to use the smoke texture
				if(particle.texture_name === undefined) {
					// the texture name just needs to be something so that it is not undefined
					// but is not used by the fragment shader if the particle is a smoke particle
					texture_name = this.resources["moon.jpg"];
					is_smoke_particle = true;
				}

				entries_to_draw.push({
					mat_mvp: mat4_matmul_many(mat_mvp, mat_projection, mat_view, particle.mat_model_to_world),
					tex_base_color: texture_name,
					is_smoke_particle: is_smoke_particle,
				})
			}
		}
		// Draw on the GPU
		this.pipeline(entries_to_draw)
	}
}








// mesh renderer:
export class FirePlacesRendererUnshaded {

	constructor(regl, resources) {

		const rock_renderers = [
			new SysRenderRocksUnshaded(regl, resources, 'rocks1.obj'),
			new SysRenderRocksUnshaded(regl, resources, 'rocks2.obj'),
			new SysRenderRocksUnshaded(regl, resources, 'rocks3.obj'),
			new SysRenderRocksUnshaded(regl, resources, 'rocks4.obj'),
			new SysRenderRocksUnshaded(regl, resources, 'rocks5.obj'),
		];

		this.rock_renderers = rock_renderers;
	}

	render(frame_info, scene_info) {
		for (const rock_renderer of this.rock_renderers) {
			rock_renderer.render(frame_info, scene_info);
		}
		
	}
}
/*
	Draw the actors with 'unshaded' shader_type
*/
export class SysRenderRocksUnshaded {

	constructor(regl, resources, rock_mesh_name) {

		const rock_mesh = resources[rock_mesh_name];
		this.pipeline = regl({
			attributes: {
				position: rock_mesh.vertex_positions,
				tex_coord: rock_mesh.vertex_tex_coords,
			},
			// Faces, as triplets of vertex indices
			elements: rock_mesh.faces,

			// Uniforms: global data available to the shader
			uniforms: {
				mat_mvp: regl.prop('mat_mvp'),
				texture_base_color: regl.prop('tex_base_color'),
			},

			vert: resources['stones_unshaded.vert.glsl'],
			frag: resources['stones_unshaded.frag.glsl'],
		})

		// Keep a reference to textures
		this.resources = resources
	}

	render(frame_info, scene_info) {
		/* 
		We will collect all objects to draw with this pipeline into an array
		and then run the pipeline on all of them.
		This way the GPU does not need to change the active shader between objects.
		*/
		const entries_to_draw = []

		// Read frame info
		const { mat_projection, mat_view } = frame_info

		// For each planet, construct information needed to draw it using the pipeline
		for (const actor of scene_info.actors) {

			// Choose only planet using this shader
			if (actor.shader_type === 'unshaded') {

				const mat_mvp = mat4.create()

				// #TODO GL1.2.1.2
				// Calculate mat_mvp: model-view-projection matrix	
				//mat4_matmul_many(mat_mvp, ...)

				entries_to_draw.push({
					mat_mvp: mat4_matmul_many(mat_mvp, mat_projection, mat_view, actor.mat_model_to_world),
					tex_base_color: this.resources[actor.texture_name],
				})
			}
		}

		// Draw on the GPU
		this.pipeline(entries_to_draw)
	}
}

