# fire.js
```
    import { vec2, vec3, vec4, mat3, mat4 } from "../lib/gl-matrix_3.3.0/esm/index.js"
    import { mat4_matmul_many } from "./icg_math.js"
    import { init_noise } from "./noise.js"
    import { framebuffer_to_image_download } from "./icg_screenshot.js"
    import { calculateBezierPoint } from "./utils.js"

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
        // var texture_name = "sun.jpg";

        const fire_particles = [];
        const smoke_particles = [];

        for (let index = 0; index < 500; index++) {

            let offset_x, offset_y, texture_color;
            switch (index % 6) {
                case 0: // more particles in the middle for asthetic reasons
                case 1:
                    offset_x = 0;
                    offset_y = 0;
                    texture_color = vec4.fromValues(0.80, 0.43, 0., 1.)
                    break;
                case 2:
                    offset_x = offset;
                    offset_y = offset;
                    texture_color = vec4.fromValues(0.78, 0.28, 0.06, 1.)
                    break;
                case 3:
                    offset_x = offset;
                    offset_y = -offset;
                    texture_color = vec4.fromValues(0.08, 0.33, 0.74, 1.)
                    break;
                case 4:
                    offset_x = -offset;
                    offset_y = offset;
                    texture_color = vec4.fromValues(0.67, 0.24, 0.74, 1.)
                    break;
                case 5:
                    offset_x = -offset;
                    offset_y = -offset;
                    texture_color = vec4.fromValues(0.23, 0.49, 0.36, 1.)
                    break;
            }
            let size_ = 0.07 * Math.random() + 0.01
            // Here we can set the randomness based on specific perlin noise instead of random gaussian
            const fire_particle = {
                lifetime: 2 * Math.random(),
                size: size_,

                start_position: vec3.fromValues(
                    offset_x + (diameterAroundCenter * Math.random() - halfDiameterAroundCenter) / 2,
                    offset_y + (diameterAroundCenter * Math.random() - halfDiameterAroundCenter) / 2,
                    (0.1 + diameterAroundCenter * Math.random() - halfDiameterAroundCenter) / 10,
                ),

                velocity_x: (0.025 * Math.random() - 0.0125) / (size_ * 50),
                velocity_y: (0.025 * Math.random() - 0.0125) / (size_ * 50),
                velocity_z: (0.07 * Math.random()) / (size_ * 50),

                texture_name: texture_color,
                shader_type: "fire_particle",
            }
            fire_particles.push(fire_particle);

            // only draw 1/3 times as many smoke particles as fire particles but the 
            // same amount for each fire place
            if ((push_next_10 && index % 10 == 0) // always draw 10 smoke particles in a row (2 times per fire place)
                || (!push_next_10 && index % 10 == 0)) { // then wait 20 particles
                push_next_10 = !push_next_10;
            }

            if (push_next_10) {
                const smoke_particle = {
                    lifetime: 2 * Math.random(),
                    size: size_,
                    start_position: vec3.fromValues(
                        offset_x + (diameterAroundCenter * Math.random() - halfDiameterAroundCenter) / 1.9,
                        offset_y + (diameterAroundCenter * Math.random() - halfDiameterAroundCenter) / 1.9,
                        (0.1 + diameterAroundCenter * Math.random() - halfDiameterAroundCenter) / 10,
                    ),
                    velocity_x: (0.025 * Math.random() - 0.0125) / (size_ * 30),
                    velocity_y: (0.025 * Math.random() - 0.0125) / (size_ * 30),
                    velocity_z: (0.1 * Math.random()) / (size_ * 30),
                    texture_name: vec4.fromValues(0.5, 0.5, 0.5, 1.),
                    shader_type: "fire_particle",
                };

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
            this.size_control_points = [
                { x: 0, y: 0, z: 0 },
                { x: 0, y: 2.2, z: 0 },
                { x: 0.2, y: 0, z: 0 },
                { x: 1, y: 0, z: 0 },
            ]

        }

        calculate_model_matrix(particle, sim_time, camera_position) {

            let M_translate = mat4.create();
            let M_rotate = mat4.create();

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
            // Calculate particle scale based on bezier curve
            var bezier = calculateBezierPoint(this.size_control_points, particle_time / particle.lifetime)

            let scale = bezier.y * particle.size
            let M_scale = mat4.fromScaling(mat4.create, [scale, scale, scale])

            // Store the combined transform in particle.mat_model_to_world
            mat4_matmul_many(particle.mat_model_to_world, M_translate, M_scale, M_rotate)

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

            const rectangle = {
                vertex_positions: [
                    [-0.5, 0, -0.5],
                    [0.5, 0, - 0.5],
                    [-0.5, 0, 0.5],
                    [0.5, 0, 0.5],
                ],
                vertex_tex_coordinates: [
                    [0, 0],
                    [1, 0],
                    [0, 1],
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

            const smoke_texture = noise_textures[0];
            // const fire_texture = noise_textures[1];

            // The following code is used to save the texture to an image file
            this.smoke_tex_buffer = smoke_texture.draw_texture_to_buffer([0, 0], 5);
            // this.fire_tex_buffer = fire_texture.draw_texture_to_buffer([0, 0], 5);


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
                    texture_color: regl.prop("texture_color"),
                    is_smoke_particle: regl.prop('is_smoke_particle'),
                    smoke_tex_buffer: this.smoke_tex_buffer,
                },

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

                vert: resources['fire_particle.vert.glsl'],
                frag: resources['fire_particle.frag.glsl'],
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
            particles.sort(function (a, b) {
                const distance_a = vec3.distance(a.start_position, frame_info.camera_position);
                const distance_b = vec3.distance(b.start_position, frame_info.camera_position);
                return distance_b - distance_a;
            });

            // For each particle, construct information needed to draw it using the pipeline
            for (const particle of particles) {

                // Choose only planet using this shader
                if (particle.shader_type === 'fire_particle') {

                    const mat_mvp = mat4.create()

                    let texture_color = particle.texture_name;
                    let is_smoke_particle = false;

                    // If the particle is a smoke particle, then we need to use the smoke texture
                    if (particle.texture_name === undefined) {
                        // the texture name just needs to be something so that it is not undefined
                        // but is not used by the fragment shader if the particle is a smoke particle
                        texture_color = vec4.fromValues(0.5, 0.5, 0.5, 1.)
                        is_smoke_particle = true;
                    }

                    entries_to_draw.push({
                        mat_mvp: mat4_matmul_many(mat_mvp, mat_projection, mat_view, particle.mat_model_to_world),
                        texture_color: texture_color,
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


            for (const actor of scene_info.actors) {


                if (actor.shader_type === 'unshaded') {

                    const mat_mvp = mat4.create()

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
```

# utils.js
```
    export function calculateBezierPoint(points, t) {
        const n = points.length - 1;

        // Recursive function for de Casteljau's algorithm
        function deCasteljau(points, t) {
            if (points.length === 1) {
                return points[0]; // Base case: single point
            }

            const interpolatedPoints = [];
            for (let i = 0; i < points.length - 1; i++) {
                const pointA = points[i];
                const pointB = points[i + 1];
                const interpolatedPoint = {
                    x: pointA.x * (1 - t) + pointB.x * t,
                    y: pointA.y * (1 - t) + pointB.y * t,
                    z: pointA.z * (1 - t) + pointB.z * t,
                };
                interpolatedPoints.push(interpolatedPoint);
            }

            return deCasteljau(interpolatedPoints, t); // Recursive call
        }

        return deCasteljau(points, t);
    }



    export function convertToTurntableParameters(position) {
        let { x, y, z } = position;
        x = -x
        // Calculate the camera distance factor
        const camera_distance_factor = Math.sqrt(x * x + y * y + z * z);

        // Calculate the angle_y
        let angle_y = - Math.atan2(z, Math.sqrt(x * x + y * y));

        // Adjust the sign of angle_y when it exceeds 90 degrees or goes below -90 degrees
        // if (angle_y > Math.PI / 2) {
        //     angle_y -= Math.PI;
        // } else if (angle_y < -Math.PI / 2) {
        //     angle_y += Math.PI;
        // }

        // Calculate the angle_z
        const angle_z = Math.atan2(y, x);

        return { camera_distance_factor, angle_y, angle_z };
    }


    export function cameraPath1(t) {

        const time_to_complete = 20

        // Manually make sure curves are connected (start point is same as end point to avoid jumps)
        const curves = [
            [
                { x: 0.5, y: 0, z: 0.2 },
                { x: 0.5, y: 0.6, z: 0.2 },
                { x: 0, y: 0.6, z: -0.3 },
                { x: -0.5, y: 0.6, z: 0.2 },
                { x: -0.5, y: 0, z: 0.2 },
            ],
            [
                { x: -0.5, y: 0, z: 0.2 },
                { x: -0.5, y: -0.3, z: 0.2 },
                { x: 0, y: -0.3, z: -0 },
                { x: 0.5, y: -0.3, z: 0.2 },
                { x: 0.5, y: 0, z: 0.2 },
            ]
        ]
        let t_ = t % time_to_complete;

        let time_for_one_curve = time_to_complete / curves.length

        let i = Math.min(Math.floor(t_ / (time_for_one_curve)), curves.length - 1)
        let selected_curve_points = curves[i]

        return calculateBezierPoint(selected_curve_points, (t_ % time_for_one_curve) / time_for_one_curve)

    }

    export function pointsAsList(points) {
        let result = []
        for (let i = 0; i < points.length; i++) {
            const point = points[i];
            result.push([point.x, point.y, point.z])
        }
        return result
    }
```

# main_fire.js
```


	// load meshes
	const meshes_to_load = [
		"rocks.obj"
	]
	for(const mesh_name of meshes_to_load) {
		resource_promises[mesh_name] = icg_mesh_load_obj(`./meshes/${mesh_name}`)
	}


	for(const mesh_name of meshes_to_load) {
		resources[mesh_name] = mesh_preprocess(regl, resources[mesh_name])
	}


	// mesh rendering:
	const sys_render_rocks_unshaded = new SysRenderRocksUnshaded(regl, resources)


    sys_render_rocks_unshaded.render(frame_info, scene_info)

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

		if (!manual_on) {
			let movingPoint = cameraPath1(scene_info.sim_time)


			const { mat_view, mat_projection, mat_turntable } = frame_info

			let position = convertToTurntableParameters(movingPoint)
			frame_info.cam_angle_z = position.angle_z
			frame_info.cam_angle_y = position.angle_y
			frame_info.cam_distance_factor = position.camera_distance_factor

			update_cam_transform(frame_info)
		}

        // More code below...
    })
```

# path.js
```
    import { mat4_matmul_many } from "./icg_math.js"
    import { vec2, vec3, vec4, mat3, mat4 } from "../lib/gl-matrix_3.3.0/esm/index.js"

    import { calculateBezierPoint, cameraPath1, convertToTurntableParameters, pointsAsList } from "./utils.js"

    export class PathRenderer {
        constructor(regl, resources) {
            let curvePoints = []
            for (let i = 0.; i < 120; i += 0.1) {

                curvePoints.push(cameraPath1(i))
            }
            curvePoints = pointsAsList(curvePoints)

            curvePoints.push(curvePoints[0])

            this.pipeline = regl({
                frag: `
                precision mediump float;
                void main() {
                    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0); // Red color
                }
            `,

                vert: `
                precision mediump float;
                attribute vec3 position;
                uniform mat4 mat_mvp;
            void main() {
                gl_Position = mat_mvp * vec4(position, 1.0);
            }
    `,

                attributes: {
                    position: regl.buffer(curvePoints)
                },

                uniforms: {
                    mat_mvp: regl.prop('mat_mvp'),
                },

                count: curvePoints.length,

                primitive: 'line strip'
            })
        }

        render(frame_info, scene_info) {
            const { mat_projection, mat_view } = frame_info
            const mat_mvp = mat4.create()
            this.pipeline({ mat_mvp: mat4_matmul_many(mat_mvp, mat_projection, mat_view,), })
        }
    }
```

# icg_mesh.js
```
    export async function icg_mesh_load_obj(url, material_colors_by_name) {
        const obj_data = await load_text(url)
        const mesh_loaded_obj = new Mesh(obj_data)

        const faces_from_materials = [].concat(...mesh_loaded_obj.indicesPerMaterial)

        let vertex_colors = null;

        if(material_colors_by_name) {
            const material_colors_by_index = mesh_loaded_obj.materialNames.map((name) => {
                let color = material_colors_by_name[name];
                if (color === undefined) {
                    console.warn(`Missing color for material ${name} in mesh ${url}`);
                    color = [1., 0., 1.];
                }
                return color;
            })

            vertex_colors = [].concat(mesh_loaded_obj.vertexMaterialIndices.map((mat_idx) => material_colors_by_index[mat_idx]))
            vertex_colors = regl_instance.buffer(vertex_colors)
        }


        // Transfer the data into GPU buffers
        // It is not necessary to do so (regl can deal with normal arrays),
        // but this way we make sure its transferred only once and not on every draw.
        const mesh_with_our_names = {
            vertex_positions: mesh_loaded_obj.vertices,
            vertex_tex_coords: mesh_loaded_obj.textures,
            vertex_normals: mesh_loaded_obj.vertexNormals,
            vertex_color: vertex_colors,

            // https://github.com/regl-project/regl/blob/master/API.md#elements
            faces: faces_from_materials,

            lib_obj: mesh_loaded_obj,
        }

        return mesh_with_our_names
    }
```

# noise.frag.glsl
```
    // Procedural "cloud" texture
    vec4 tex_cloud(vec2 point) {
        vec2 half_vector = vec2(0., 0.); //vec2(0.5, 0.5);
        vec2 updated_point = point - half_vector;
        float d = dot(updated_point, updated_point);
        float g = 2. * exp(-3. * d) - 1.;
        float noise = g + 0.5 * perlin_fbm(point * 2.);
        
        float alpha = 1.;
        if (noise < 0.1)
            alpha = 0.;
        else if (noise < 0.3) {
            alpha = noise;
        }

        return vec4(noise, noise, noise, alpha);
    }
    vec4 tex_cloud_color(vec2 point) {
        vec2 half_vector = vec2(0., 0.); //vec2(0.5, 0.5);
        vec2 updated_point = point - half_vector;
        float d = dot(updated_point, updated_point);
        float g = 2. * exp(-3. * d) - 1.;
        float noise = g + 0.5 * perlin_fbm(point * 2.);

        float alpha = 1.;
        if (noise < 0.2)
            alpha = 0.;
        else if (noise < 0.3) {
            alpha = noise;
        }

        return vec4(noise, noise*0.65, noise*0.2, alpha);
    }
```

# stones_unshaded.frag.glsl
```
    precision mediump float;

    varying vec2 v2f_tex_coord;

    uniform sampler2D texture_base_color;

    void main()
    {
        vec3 color_from_texture = texture2D(texture_base_color, v2f_tex_coord).rgb;
        gl_FragColor = vec4(color_from_texture, 1.); // output: RGBA in 0..1 range
    }
```

# fire_particle.frag.glsl
```
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
```

# buffer_to_screen.frag.glsl
```
    precision highp float;
    uniform sampler2D buffer_to_draw;
    varying vec2 v2f_tex_coords;

    void main() {
        gl_FragColor = vec4(texture2D(buffer_to_draw, v2f_tex_coords).rgb, 1.0);
    }
```

# buffer_to_screen.vert.glsl
```
    attribute vec2 position;
    varying vec2 v2f_tex_coords;

    void main() {
        // webGL screen coords are -1 ... 1 but texture sampling is in range 0 ... 1
        v2f_tex_coords = (position + 1.) * 0.5;
        gl_Position = vec4(position, 0.0, 1.0);
    }
```

# stones_unshaded.frag.glsl
```
    precision mediump float;
            
    varying vec2 v2f_tex_coord;

    uniform sampler2D texture_base_color;

    void main()
    {
        vec3 color_from_texture = texture2D(texture_base_color, v2f_tex_coord).rgb;
        gl_FragColor = vec4(color_from_texture, 1.); // output: RGBA in 0..1 range
    }
```