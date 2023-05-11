import { vec2, vec3, vec4, mat3, mat4 } from "../lib/gl-matrix_3.3.0/esm/index.js"
import { mat4_matmul_many } from "./icg_math.js"

/*
	Construct the scene!
*/
export function create_scene_content() {
	var diameterAroundCenter = 2
	var halfDiameterAroundCenter = diameterAroundCenter / 2

	const fire_particles = []

	for (let index = 0; index < 1000; index++) {
		// Here we can set the randomness based on specific perlin noise instead of random gaussian
		const particle = {
			lifetime: 4 * Math.random(),
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
			velocity_x: 0.4 * Math.random() - 0.2,
			velocity_y: 0.4 * Math.random() - 0.2,
			velocity_z: 1 * Math.random(),

			// TODO: Change Texture here, change to flame texture, can also give an array of textures
			texture_name: "sun.jpg",
			shader_type: "unshaded",
		}
		fire_particles.push(particle);


	}
	const actors = [
		{
			name: 'sun',
			size: 0.1,
			rotation_speed: 0.1,

			movement_type: 'planet',
			orbit: null,

			shader_type: 'unshaded',
			texture_name: 'sun.jpg',
		},
		// {
		// 	name: 'earth',
		// 	size: 0.1,
		// 	rotation_speed: 0.3,

		// 	movement_type: 'planet',
		// 	orbit: 'sun',
		// 	orbit_radius: 6,
		// 	orbit_speed: 0.05,
		// 	orbit_phase: 1.7,

		// 	shader_type: 'unshaded',
		// 	texture_name: 'earth_day.jpg',
		// },

	]

	// In each particle, allocate its transformation matrix
	for (const particle of fire_particles) {
		particle.mat_model_to_world = mat4.create()
	}

	// In each planet, allocate its transformation matrix
	for (const actor of actors) {
		actor.mat_model_to_world = mat4.create()
	}

	// Lookup of actors by name
	const actors_by_name = {}
	for (const actor of actors) {
		actors_by_name[actor.name] = actor
	}

	// Construct scene info
	return {
		sim_time: 0.,
		actors: actors,
		fire_particles: fire_particles,
		actors_by_name: actors_by_name,
	}
}


export class SysMovement {

	constructor() {
	}

	calculate_model_matrix(actor, sim_time, actors_by_name) {
		let M_orbit = mat4.create();

		if (actor.orbit !== null) {
			// Parent's translation
			const parent = actors_by_name[actor.orbit]
			const parent_translation_v = mat4.getTranslation([0, 0, 0], parent.mat_model_to_world)
			let parent_translation_transform = mat4.fromTranslation(mat4.create(), parent_translation_v)
			let angle = sim_time * actor.orbit_speed + actor.orbit_phase
			let orbit_translation_transform = mat4.fromTranslation(mat4.create(), [Math.cos(angle) * actor.orbit_radius, Math.sin(angle) * actor.orbit_radius, 0])

			mat4_matmul_many(M_orbit, parent_translation_transform, orbit_translation_transform)
			// Orbit around the parent
		}

		let spin_transform = mat4.fromZRotation(mat4.create(), sim_time * actor.rotation_speed)

		let scale_transform = mat4.fromScaling(mat4.create, [actor.size, actor.size, actor.size])

		// Store the combined transform in actor.mat_model_to_world
		mat4_matmul_many(actor.mat_model_to_world, M_orbit, scale_transform, spin_transform);
	}

	simulate(scene_info) {

		const { sim_time, actors, actors_by_name } = scene_info

		// Iterate over actors which have planet movement type
		for (const actor of actors) {
			if (actor.movement_type === 'planet') {
				this.calculate_model_matrix(actor, sim_time, actors_by_name)
			}
		}
	}

}

export class FireParticlesMovement {

	constructor() {
		this.mat_model_to_world_billboard = mat4.create()
	}

	calculate_model_matrix(particle, sim_time, camera_position) {

		let M_translate = mat4.create();

		// TODO: Add billboarding transform here
		const vec_to_camera = vec3.normalize([0, 0, 0], camera_position);
		const normal = vec3.fromValues(0, 0, 1);
		const rot_axis = vec3.cross([0, 0, 0], normal, vec_to_camera);
		const angle_to_camera = vec3.angle(normal, vec_to_camera);
		mat4.fromRotation(this.mat_model_to_world_billboard, angle_to_camera, rot_axis);

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
		mat4_matmul_many(particle.mat_model_to_world, M_translate, M_scale)

		// TODO: can also select active texture (if multiple) based on lifetime
	}

	simulate(scene_info, camera_position) {

		const { sim_time, fire_particles } = scene_info

		// Iterate over fire particles
		for (const particle of fire_particles) {
			this.calculate_model_matrix(particle, sim_time, camera_position)
		}
	}

}

/*
	Draw the actors with 'unshaded' shader_type
*/
export class SysRenderPlanetsUnshaded {

	constructor(regl, resources) {

		const mesh_uvsphere = resources.mesh_uvsphere

		this.pipeline = regl({
			attributes: {
				position: mesh_uvsphere.vertex_positions,
				tex_coord: mesh_uvsphere.vertex_tex_coords,
			},
			// Faces, as triplets of vertex indices
			elements: mesh_uvsphere.faces,

			// Uniforms: global data available to the shader
			uniforms: {
				mat_mvp: regl.prop('mat_mvp'),
				texture_base_color: regl.prop('tex_base_color'),
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

/*
	Draw the actors with 'unshaded' shader_type
*/
export class SysRenderFireParticlesUnshaded {

	constructor(regl, resources) {
		//TODO: Change from sphere to billboard (will speed up rendering I hope), Hint: can see the 2D traiangle gneration in GL1 Exercise
		const mesh_uvsphere = resources.mesh_uvsphere

		this.pipeline = regl({
			attributes: {
				position: mesh_uvsphere.vertex_positions,
				tex_coord: mesh_uvsphere.vertex_tex_coords,
			},
			// Faces, as triplets of vertex indices
			elements: mesh_uvsphere.faces,

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
					dstAlpha: 'one',
				},
				equation: {
					rgb: 'add',
					alpha: 'add',
				},
				color: [0,0,0,0],
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

