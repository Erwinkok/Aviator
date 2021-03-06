const Utils = {}

Utils.normalize = (v, vmin, vmax, tmin, tmax) => {
    const nv = Math.max(Math.min(v,vmax), vmin);
    const dv = vmax - vmin;
    const pc = (nv - vmin) / dv;
    const dt = tmax - tmin;
    const tv = tmin + (pc * dt);

    return tv;
}

export default Utils;