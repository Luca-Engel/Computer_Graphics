
import { createREGL } from "../lib/regljs_2.1.0/regl.module.js"
import { vec2, vec3, vec4, mat3, mat4 } from "../lib/gl-matrix_3.3.0/esm/index.js"

import { DOM_loaded_promise, load_text, load_texture, register_keyboard_action } from "./icg_web.js"
import { icg_mesh_load_obj } from "./icg_mesh.js"
import { deg_to_rad, mat4_to_string, vec_to_string, mat4_matmul_many } from "./icg_math.js"
import { icg_mesh_make_uv_sphere } from "./icg_mesh.js"
import { SystemRenderGrid } from "./icg_grid.js"

import { create_scene_content, FirePlacesRendererUnshaded, ParticlesMovement, ParticlesRenderer, SysRenderRocksUnshaded, } from "./fire.js"
import { mesh_preprocess } from "./normal_computation.js"

import { PathRenderer } from "./path.js"
import { calculateBezierPoint, cameraPath1, convertToTurntableParameters } from "./utils.js"

async function load_resources(regl) {
	/*
	The textures fail to load when the site is opened from local file (file://) due to "cross-origin".
	Solutions:
	* run a local webserver
		caddy file-server -browse -listen 0.0.0.0:8000
		# or
		python -m http.server 8000
		# open localhost:8000
	OR
	* run chromium with CLI flag
		"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" --allow-file-access-from-files index.html
		
	* edit config in firefox
		security.fileuri.strict_origin_policy = false
	*/

	// Start downloads in parallel
	const resource_promises = {}

	const textures_to_load = [
		'sun.jpg', 'moon.jpg', 'mars.jpg', 'magic_green.jpg', 'flame.jpg', 'flame2.jpg', 'earth_clouds.jpg', 'earth_day.jpg', 'rocks.jpg',
	]
	for (const tex_name of textures_to_load) {
		resource_promises[tex_name] = load_texture(regl, `./textures/${tex_name}`)
	}
	resource_promises['earth_clouds.jpg'] = load_texture(regl, `./textures/earth_clouds.jpg`, { wrapS: 'repeat' })


	const shaders_to_load = [
		'fire_particle.vert.glsl', 'fire_particle.frag.glsl',
		'stones_unshaded.frag.glsl', 'stones_unshaded.vert.glsl',
		'noise.frag.glsl', 'noise.vert.glsl',
		'buffer_to_screen.frag.glsl', 'buffer_to_screen.vert.glsl',
		'display.vert.glsl',
		'phong.vert.glsl', 'phong.frag.glsl',
		'earth.frag.glsl', 'sun.vert.glsl',
		'billboard.vert.glsl', 'billboard_sunglow.frag.glsl',
	]
	for (const shader_name of shaders_to_load) {
		resource_promises[shader_name] = load_text(`./src/shaders/${shader_name}`)
	}

	// load meshes
	const meshes_to_load = [
		"rocks1.obj", "rocks2.obj", "rocks3.obj", "rocks4.obj", "rocks5.obj",
	]
	for (const mesh_name of meshes_to_load) {
		resource_promises[mesh_name] = icg_mesh_load_obj(`./meshes/${mesh_name}`)
	}

	const resources = {}

	// Construct a unit sphere mesh
	// UV sphere https://docs.blender.org/manual/en/latest/modeling/meshes/primitives.html#uv-sphere
	// we create it in code instead of loading from a file
	resources['mesh_uvsphere'] = icg_mesh_make_uv_sphere(15)

	// Wait for all downloads to complete
	for (const [key, promise] of Object.entries(resource_promises)) {
		resources[key] = await promise
	}

	for (const mesh_name of meshes_to_load) {
		resources[mesh_name] = mesh_preprocess(regl, resources[mesh_name])
	}

	return resources
}

async function main() {
	/* const in JS means the variable will not be bound to a new value, but the value can be modified (if its an object or array)
		https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/const
	*/

	// We are using the REGL library to work with webGL
	// http://regl.party/api
	// https://github.com/regl-project/regl/blob/master/API.md
	const regl = createREGL({
		profile: true, // if we want to measure the size of buffers/textures in memory
		extensions: ['oes_texture_float'],
	})
	// The <canvas> (HTML element for drawing graphics) was created by REGL, lets take a handle to it.
	const canvas_elem = document.getElementsByTagName('canvas')[0]


	/*---------------------------------------------------------------
		Scene and systems
	---------------------------------------------------------------*/
	const resources = await load_resources(regl)

	const scene_info = create_scene_content()

	const particles_movement = new ParticlesMovement()

	const particles_renderer = new ParticlesRenderer(regl, resources)

	const path_renderer = new PathRenderer(regl, resources)

	const sys_render_grid = new SystemRenderGrid(regl, resources)

	// mesh rendering:
	const sys_render_rocks_unshaded = new FirePlacesRendererUnshaded(regl, resources); //new SysRenderRocksUnshaded(regl, resources)




	/*---------------------------------------------------------------
		Frame info
	---------------------------------------------------------------*/

	const frame_info = {
		sim_time: 0.,

		cam_angle_z: Math.PI * 0.2, // in radians!
		cam_angle_y: -Math.PI / 6, // in radians!
		cam_distance_factor: 0.3,
		camera_position: [0, 0, 0],
		mat_turntable: mat4.create(),

		mat_view: mat4.create(),
		mat_projection: mat4.create(),

		// Consider the sun, which locates at [0, 0, 0], as the only light source
		light_position_world: [0, 0, 0, 1],
		light_position_cam: [0, 0, 0, 1],
		light_color: [1.0, 0.941, 0.898],
	}

	/*---------------------------------------------------------------
		UI
	---------------------------------------------------------------*/

	// Debug overlay
	const debug_overlay = document.getElementById('debug-overlay')
	const debug_text = document.getElementById('debug-text')
	register_keyboard_action('h', () => debug_overlay.classList.toggle('hidden'))

	// Pause
	let is_paused = false;
	register_keyboard_action('p', () => is_paused = !is_paused);

	// Grid, to demonstrate keyboard shortcuts
	let grid_on = true;
	register_keyboard_action('g', () => grid_on = !grid_on);

	let manual_on = true;
	register_keyboard_action('m', () => manual_on = !manual_on);
	// Focusing on selected planet
	const elem_view_select = document.getElementById('view-select')

	/*---------------------------------------------------------------
		Camera
	---------------------------------------------------------------*/
	const cam_distance_base = 1.

	function update_cam_transform(frame_info) {
		const { cam_angle_z, cam_angle_y, cam_distance_factor } = frame_info

		// Example camera matrix, looking along forward-X, edit this
		let position = [cam_distance_base * (-cam_distance_factor), 0, 0]

		const look_at = mat4.lookAt(mat4.create(),
			position, // camera position in world coord
			[0, 0, 0], // view target point
			[0, 0, 1], // up vector
		)
		// Store the combined transform in mat_turntable
		// frame_info.mat_turntable = A * B * ...

		let y_rotation = mat4.fromYRotation(mat4.create(), cam_angle_y)
		let z_rotation = mat4.fromZRotation(mat4.create(), cam_angle_z)
		mat4_matmul_many(frame_info.mat_turntable, look_at, y_rotation, z_rotation) // edit this
	}

	update_cam_transform(frame_info)

	// Rotate camera position by dragging with the mouse
	canvas_elem.addEventListener('mousemove', (event) => {
		if (manual_on) {
			// if left or middle button is pressed
			if (event.buttons & 1 || event.buttons & 4) {
				frame_info.cam_angle_z += event.movementX * 0.005
				frame_info.cam_angle_y += -event.movementY * 0.005

				update_cam_transform(frame_info)
			}
		}

	})

	canvas_elem.addEventListener('wheel', (event) => {
		if (manual_on) {
			// scroll wheel to zoom in or out
			const factor_mul_base = 1.08
			const factor_mul = (event.deltaY > 0) ? factor_mul_base : 1. / factor_mul_base
			frame_info.cam_distance_factor *= factor_mul
			frame_info.cam_distance_factor = Math.max(0.02, Math.min(frame_info.cam_distance_factor, 4))
			update_cam_transform(frame_info)
		}


	})

	/*---------------------------------------------------------------
		Render loop
	---------------------------------------------------------------*/
	let fixedPoint = { x: 0.5, y: 0, z: -0.5 }


	let prev_regl_time = 0
	let time_elapsed = 0
	let frames_counted = 0
	let fps = 0

	regl.frame((frame) => {

		const dt = frame.time - prev_regl_time
		time_elapsed += dt
		frames_counted += 1

		if (time_elapsed > 1.0) {
			fps = frames_counted
			frames_counted = 0
			time_elapsed = 0
		}

		if (!is_paused) {
			scene_info.sim_time += dt
		}
		// TODO remove return to allow camera movement while paused



		if (!manual_on) {
			let movingPoint = cameraPath1(scene_info.sim_time)


			const { mat_view, mat_projection, mat_turntable } = frame_info

			let position = convertToTurntableParameters(movingPoint)
			frame_info.cam_angle_z = position.angle_z
			frame_info.cam_angle_y = position.angle_y
			frame_info.cam_distance_factor = position.camera_distance_factor

			update_cam_transform(frame_info)
		}


		const { mat_view, mat_projection, mat_turntable, light_position_cam, light_position_world, camera_position } = frame_info


		frame_info.sim_time = scene_info.sim_time
		prev_regl_time = frame.time;

		{
			mat4.perspective(mat_projection,
				deg_to_rad * 60, // fov y
				frame.framebufferWidth / frame.framebufferHeight, // aspect ratio
				0.01, // near
				100, // far
			)

			const camera_focus_translation_mat = mat4.fromTranslation(mat4.create(), [0, 0, 0])
			mat4_matmul_many(mat_view, mat_turntable, camera_focus_translation_mat)
		}

		// Calculate light position in camera frame

		// Calculate camera position and store it in `camera_position`, it will be needed for the billboard
		{
			/*
			Camera is at [0, 0, 0] in camera coordinates.
			mat_view is a transformation from world to camera coordinates.
			The inverse of mat_view is a transformation from camera to world coordinates.
			Transforming [0, 0, 0] from camera to world we obtain the world position of the camera.
				cam_pos = mat_view^-1 * [0, 0, 0]^T
			*/
			const mat_camera_to_world = mat4.invert(mat4.create(), mat_view)

			// Transform [0, 0, 0] from camera to world:
			//const camera_position = vec3.transformMat4([0, 0, 0], [0, 0, 0], mat_view_invert);
			// But the rotation and scale parts of the matrix do no affect [0, 0, 0] so, we can just get the translation, its cheaper:
			mat4.getTranslation(camera_position, mat_camera_to_world)
		}


		particles_movement.simulate(scene_info, camera_position)

		// Set the whole image to black
		regl.clear({ color: [0, 0, 0, 1] });

		// If we invert it, the fire and smoke particles will not use blending with the rocks		
		sys_render_rocks_unshaded.render(frame_info, scene_info)
		particles_renderer.render(frame_info, scene_info)



		if (grid_on) {
			sys_render_grid.render(frame_info, scene_info)
			path_renderer.render(frame_info, scene_info)
		}


		debug_text.textContent = `
Hello! Sim time is ${scene_info.sim_time.toFixed(2)} s
Camera: angle_z ${(frame_info.cam_angle_z / deg_to_rad).toFixed(1)}, angle_y ${(frame_info.cam_angle_y / deg_to_rad).toFixed(1)}, distance ${(frame_info.cam_distance_factor * cam_distance_base).toFixed(1)}
cam pos ${vec_to_string(camera_position)}
FPS ${fps}
`;
	})
}

DOM_loaded_promise.then(main);
