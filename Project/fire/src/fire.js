import { vec2, vec3, vec4, mat3, mat4 } from "../lib/gl-matrix_3.3.0/esm/index.js"
import { mat4_matmul_many } from "./icg_math.js"
import {init_noise} from "./noise.js"
import {framebuffer_to_image_download} from "./icg_screenshot.js"


/*
	Construct the scene!
*/
export function create_scene_content() {
	var diameterAroundCenter = 0.1
	var halfDiameterAroundCenter = diameterAroundCenter / 2

	const fire_particles = []
	const smoke_particles = [];

	for (let index = 0; index < 100; index++) {
		// Here we can set the randomness based on specific perlin noise instead of random gaussian
		const particle = {
			lifetime: 2 * Math.random(),
			size: 0.03 * Math.random() + 0.01,

			// TODO: Tune particle starting position using perline noise etc
			start_position: vec3.fromValues(
				(diameterAroundCenter * Math.random() - halfDiameterAroundCenter) / 3,
				(diameterAroundCenter * Math.random() - halfDiameterAroundCenter) / 3,
				(diameterAroundCenter * Math.random() - halfDiameterAroundCenter) / 10,
			),
			// velocity: vec3.fromValues(
			// 	0.02 * Math.random() - 0.01,
			// 	0.1 * Math.random(),
			// 	0.02 * Math.random() - 0.01),

			// TODO: Tune particle movement direction using perline noise etc
			velocity_x: 0.025 * Math.random() - 0.0125,
			velocity_y: 0.025 * Math.random() - 0.0125,
			velocity_z: 0.1 * Math.random(),

			// TODO: Change Texture here, change to flame texture, can also give an array of textures
			texture_name: "sun.jpg",
			shader_type: "unshaded",
		}
		fire_particles.push(particle);


		const smoke_particle = {
			lifetime: 2 * Math.random(),
			size: 0.03 * Math.random() + 0.01,
			start_position: vec3.fromValues(
				(diameterAroundCenter * Math.random() - halfDiameterAroundCenter) / 3,
				(diameterAroundCenter * Math.random() - halfDiameterAroundCenter) / 3,
				(diameterAroundCenter * Math.random() - halfDiameterAroundCenter) / 10,
			),
			velocity_x: 0.025 * Math.random() - 0.0125,
			velocity_y: 0.025 * Math.random() - 0.0125,
			velocity_z: 0.1 * Math.random(),
			texture_name: "moon.jpg",
			shader_type: "unshaded",
		};
		smoke_particles.push(smoke_particle);
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
		fire_particles: fire_particles,
		smoke_particles: smoke_particles,
	}
}

export class FireParticlesMovement {

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

		// console.log(camera_position)
		// console.log(this.mat_model_to_world)



		let initial_position_transform = mat4.fromTranslation(mat4.create(), particle.start_position)
		let particle_time = sim_time % particle.lifetime;

		// console.log(vec3.multiply(vec3.fromValues(particle_time, particle_time, particle_time), vec3.fromValues(particle_time, particle_time, particle_time)))
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
export class FireParticlesRenderer {

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


		// For each planet, construct information needed to draw it using the pipeline
		for (const particle of scene_info.fire_particles) {

			// Choose only planet using this shader
			if (particle.shader_type === 'unshaded') {
				const mat_mvp = mat4.create()

				entries_to_draw.push({
					mat_mvp: mat4_matmul_many(mat_mvp, mat_projection, mat_view, particle.mat_model_to_world),
					tex_base_color: this.resources[particle.texture_name],
				})
			}
		}
		// Draw on the GPU
		this.pipeline(entries_to_draw)
	}
}



export class SmokeParticlesRenderer {

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

		const noise_textures = init_noise(regl, resources);

		// TODO: pick the correct texture out of the list of textures...
		const smoke_texture = noise_textures[0];
		const frag_shader = smoke_texture.shader_frag;

		console.log(frag_shader);

		// The following code is used to save the texture to an image file
		const smoke_tex_buffer = smoke_texture.draw_texture_to_buffer([0,0], 5);
		console.log("tex_buffer:")
		console.log(smoke_tex_buffer);
		this.smoke_tex_buffer = smoke_tex_buffer;
		// framebuffer_to_image_download(regl, tex_buffer, `${smoke_texture.name}.png`);

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
				smoke_tex_buffer: smoke_tex_buffer,
				// texture_base_color: frag_shader, //regl.prop('tex_base_color'),
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

			// vert: resources['noise.vert.glsl'],
			// frag: resources['noise.frag.glsl'],
			vert: resources['smoke_unshaded.vert.glsl'],
			frag: resources['smoke_unshaded.frag.glsl'],
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


		// For each smoke particle, construct information needed to draw it using the pipeline
		for (const particle of scene_info.smoke_particles) {

			// Choose only smoke particle using this shader
			if (particle.shader_type === 'unshaded') {
				const mat_mvp = mat4.create()


				entries_to_draw.push({
					mat_mvp: mat4_matmul_many(mat_mvp, mat_projection, mat_view, particle.mat_model_to_world),
					tex_base_color: this.resources[particle.texture_name],
					tex_noise_color: this.smoke_tex_buffer,
				})
			}
		}
		// Draw on the GPU
		this.pipeline(entries_to_draw)
	}
}