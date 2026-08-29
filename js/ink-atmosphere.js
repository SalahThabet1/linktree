const vertexShader = `
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragmentShader = `
precision highp float;

uniform float iTime;
uniform vec3 iResolution;
uniform float uSpinRotation;
uniform float uSpinSpeed;
uniform vec2 uOffset;
uniform vec4 uColor1;
uniform vec4 uColor2;
uniform vec4 uColor3;
uniform float uContrast;
uniform float uLighting;
uniform float uSpinAmount;
uniform float uPixelFilter;
uniform float uSpinEase;
uniform bool uIsRotate;

varying vec2 vUv;

vec4 effect(vec2 screenSize, vec2 screen_coords) {
    float pixel_size = length(screenSize.xy) / uPixelFilter;
    vec2 uv = (floor(screen_coords.xy * (1.0 / pixel_size)) * pixel_size - 0.5 * screenSize.xy) / length(screenSize.xy) - uOffset;
    float uv_len = length(uv);

    float speed = (uSpinRotation * uSpinEase * 0.2);
    if (uIsRotate) {
       speed = iTime * speed;
    }
    speed += 302.2;

    float new_pixel_angle = atan(uv.y, uv.x) + speed - uSpinEase * 20.0 * (uSpinAmount * uv_len + (1.0 - uSpinAmount));
    vec2 mid = (screenSize.xy / length(screenSize.xy)) / 2.0;
    uv = (vec2(uv_len * cos(new_pixel_angle) + mid.x, uv_len * sin(new_pixel_angle) + mid.y) - mid);

    uv *= 30.0;
    speed = iTime * uSpinSpeed;

    vec2 uv2 = vec2(uv.x + uv.y);

    for (int i = 0; i < 5; i++) {
        uv2 += sin(max(uv.x, uv.y)) + uv;
        uv += 0.5 * vec2(
            cos(5.1123314 + 0.353 * uv2.y + speed * 0.131121),
            sin(uv2.x - 0.113 * speed)
        );
        uv -= cos(uv.x + uv.y) - sin(uv.x * 0.711 - uv.y);
    }

    float contrast_mod = (0.25 * uContrast + 0.5 * uSpinAmount + 1.2);
    float paint_res = min(2.0, max(0.0, length(uv) * 0.035 * contrast_mod));
    float c1p = max(0.0, 1.0 - contrast_mod * abs(1.0 - paint_res));
    float c2p = max(0.0, 1.0 - contrast_mod * abs(paint_res));
    float c3p = 1.0 - min(1.0, c1p + c2p);
    float light = (uLighting - 0.2) * max(c1p * 5.0 - 4.0, 0.0) + uLighting * max(c2p * 5.0 - 4.0, 0.0);

    return (0.3 / uContrast) * uColor1 + (1.0 - 0.3 / uContrast) * (uColor1 * c1p + uColor2 * c2p + vec4(c3p * uColor3.rgb, c3p * uColor1.a)) + light;
}

void main() {
    vec2 uv = vUv * iResolution.xy;
    gl_FragColor = effect(iResolution.xy, uv);
}
`;

function hexToVec4(hex) {
  const c = hex.replace('#', '');
  return [
    parseInt(c.slice(0, 2), 16) / 255,
    parseInt(c.slice(2, 4), 16) / 255,
    parseInt(c.slice(4, 6), 16) / 255,
    1.0,
  ];
}

export class Balatro {
  constructor(canvas, opts = {}) {
    this.canvas = canvas;
    this.running = false;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const gl = canvas.getContext('webgl', { alpha: false, antialias: false });
    if (!gl) return;
    this.gl = gl;

    gl.clearColor(0, 0, 0, 1);

    const program = this.compile(gl, vertexShader, fragmentShader);
    if (!program) return;
    this.program = program;
    gl.useProgram(program);

    this.quad(gl, program);
    this.bind(gl, program, opts);

    this.resize();
    this.running = true;
    this.tick = this.tick.bind(this);
    this._raf = requestAnimationFrame(this.tick);

    this._onResize = () => this.resize();
    window.addEventListener('resize', this._onResize);

    this._onVisibility = () => {
      if (document.hidden) {
        this.running = false;
        cancelAnimationFrame(this._raf);
      } else {
        this.running = true;
        this._raf = requestAnimationFrame(this.tick);
      }
    };
    document.addEventListener('visibilitychange', this._onVisibility);

    this._onContextLost = (e) => {
      e.preventDefault();
      this.destroy();
    };
    canvas.addEventListener('webglcontextlost', this._onContextLost);
  }

  compile(gl, vs, fs) {
    const v = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(v, vs);
    gl.compileShader(v);

    const f = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(f, fs);
    gl.compileShader(f);

    const p = gl.createProgram();
    gl.attachShader(p, v);
    gl.attachShader(p, f);
    gl.linkProgram(p);

    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
      console.error('Shader error:', gl.getProgramInfoLog(p));
      return null;
    }
    return p;
  }

  quad(gl, program) {
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
    const pos = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);
  }

  bind(gl, program, opts) {
    this.u = {};
    const names = [
      'iTime', 'iResolution', 'uSpinRotation', 'uSpinSpeed', 'uOffset',
      'uColor1', 'uColor2', 'uColor3', 'uContrast', 'uLighting',
      'uSpinAmount', 'uPixelFilter', 'uSpinEase', 'uIsRotate',
    ];
    for (const n of names) this.u[n] = gl.getUniformLocation(program, n);

    gl.uniform4fv(this.u.uColor1, hexToVec4(opts.color1 || '#f5ece0'));
    gl.uniform4fv(this.u.uColor2, hexToVec4(opts.color2 || '#c8baa6'));
    gl.uniform4fv(this.u.uColor3, hexToVec4(opts.color3 || '#faf6ef'));
    gl.uniform2fv(this.u.uOffset, [0, 0]);
    gl.uniform1f(this.u.uSpinRotation, opts.spinRotation ?? -9);
    gl.uniform1f(this.u.uSpinSpeed, opts.spinSpeed ?? 1.5);
    gl.uniform1f(this.u.uContrast, opts.contrast ?? 5);
    gl.uniform1f(this.u.uLighting, opts.lighting ?? 0.3);
    gl.uniform1f(this.u.uSpinAmount, opts.spinAmount ?? 0.1);
    gl.uniform1f(this.u.uPixelFilter, opts.pixelFilter ?? 2000);
    gl.uniform1f(this.u.uSpinEase, opts.spinEase ?? 1.0);
    gl.uniform1i(this.u.uIsRotate, opts.isRotate ? 1 : 0);
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.canvas.width = w * dpr;
    this.canvas.height = h * dpr;
    this.canvas.style.width = w + 'px';
    this.canvas.style.height = h + 'px';
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    this.gl.uniform3fv(this.u.iResolution, [this.canvas.width, this.canvas.height, this.canvas.width / this.canvas.height]);
  }

  tick(t) {
    if (!this.running) return;
    this.gl.uniform1f(this.u.iTime, (t || 0) * 0.001);
    this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
    this._raf = requestAnimationFrame(this.tick);
  }

  destroy() {
    this.running = false;
    cancelAnimationFrame(this._raf);
    window.removeEventListener('resize', this._onResize);
    document.removeEventListener('visibilitychange', this._onVisibility);
    this.canvas.removeEventListener('webglcontextlost', this._onContextLost);
  }
}
