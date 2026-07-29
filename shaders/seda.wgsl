// Variante WebGPU (TSL/WGSL) do tecido de seda.
// Usada quando `navigator.gpu` existe; o GLSL acima é o fallback WebGL2.
// Compute shader que atualiza as posições da malha fora do pipeline gráfico —
// liberta a thread principal e escala para malhas de 256x256 sem custo visível.

struct Params {
  time      : f32,
  amplitude : f32,
  frequency : f32,
  pointerX  : f32,
  pointerY  : f32,
  _pad      : vec3<f32>,
};

@group(0) @binding(0) var<uniform> params : Params;
@group(0) @binding(1) var<storage, read>       posBase : array<vec4<f32>>;
@group(0) @binding(2) var<storage, read_write> posOut  : array<vec4<f32>>;

fn hash3(p: vec3<f32>) -> f32 {
  var q = fract(p * 0.3183099 + vec3<f32>(0.1, 0.1, 0.1));
  q += dot(q, q.yzx + 19.19);
  return fract((q.x + q.y) * q.z);
}

fn valueNoise(p: vec3<f32>) -> f32 {
  let i = floor(p);
  let f = fract(p);
  let u = f * f * (3.0 - 2.0 * f);
  let n000 = hash3(i + vec3<f32>(0.0, 0.0, 0.0));
  let n100 = hash3(i + vec3<f32>(1.0, 0.0, 0.0));
  let n010 = hash3(i + vec3<f32>(0.0, 1.0, 0.0));
  let n110 = hash3(i + vec3<f32>(1.0, 1.0, 0.0));
  let n001 = hash3(i + vec3<f32>(0.0, 0.0, 1.0));
  let n101 = hash3(i + vec3<f32>(1.0, 0.0, 1.0));
  let n011 = hash3(i + vec3<f32>(0.0, 1.0, 1.0));
  let n111 = hash3(i + vec3<f32>(1.0, 1.0, 1.0));
  let x00 = mix(n000, n100, u.x);
  let x10 = mix(n010, n110, u.x);
  let x01 = mix(n001, n101, u.x);
  let x11 = mix(n011, n111, u.x);
  return mix(mix(x00, x10, u.y), mix(x01, x11, u.y), u.z) * 2.0 - 1.0;
}

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) gid : vec3<u32>) {
  let idx = gid.x;
  if (idx >= arrayLength(&posBase)) { return; }

  let base = posBase[idx].xyz;

  let onda  = valueNoise(vec3<f32>(base.xy * params.frequency, params.time * 0.22)) * params.amplitude;
  let fibra = valueNoise(vec3<f32>(base.xy * params.frequency * 5.0, params.time * 0.5)) * params.amplitude * 0.12;

  let ponteiro = vec2<f32>(params.pointerX, params.pointerY) * 1.5;
  let atracao  = 1.0 - smoothstep(0.0, 1.4, distance(base.xy, ponteiro));

  let z = onda + fibra + atracao * params.amplitude * 0.55;
  posOut[idx] = vec4<f32>(base.x, base.y, base.z + z, 1.0);
}
