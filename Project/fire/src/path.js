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