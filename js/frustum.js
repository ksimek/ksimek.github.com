/**
 * Returns a frustum pyramid centered at the orgin and pointing in the negaitve-z direction, with 90 field of view.
 */
function make_frustum_mesh(width, height, near, far, material)
{
    var depth = far - near;
    var base_mesh = new THREE.Mesh(
            new THREE.CubeGeometry(width, height, depth),
            material);

    for(var i = 0; i < geom.vertices.length; ++i)
    {
        frustum.geometry.vertices[i].z += depth/2 + near;
        var z = frustum.geometry.vertices[i].z;

        frustum.geometry.vertices[i].x *= z;
        frustum.geometry.vertices[i].y *= z;
    }

    base_mesh.z = frustum_far/2.0;
    var transform = new THREE.Object3D();
    transform.add(base_mesh);
    return transform;
}
