


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



// TODO fix the angles calculation
export function convertToTurntableParameters(position) {
    let { x, y, z } = position;
    // x = -x
    // Calculate the camera distance factor
    const camera_distance_factor = Math.sqrt(x * x + y * y + z * z);

    // Calculate the angle_y
    let angle_y = - Math.atan2(Math.sqrt(x * x + y * y), z);

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

    const time_to_complete = 30

    // Manually make sure curves are connected (start point is same as end point to avoid jumps)
    const curves = [
        [
            { x: 0.7, y: 0, z: 0 },
            { x: 0.7, y: 0.5, z: 0.3 },
            { x: 0.7, y: 0.5, z: -0.3 },
            { x: -0.7, y: 0.5, z: 0.3 },
            { x: 0.7, y: 0, z: 0 },
        ],
        [
            { x: 0.7, y: 0, z: 0 },
            { x: -0.7, y: -0.5, z: 0.3 },
            { x: 0.7, y: -0.5, z: -0.3 },
            { x: 0.7, y: -0.5, z: 0.3 },
            { x: 0.7, y: 0, z: 0 },
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