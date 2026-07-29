// Fragmento do tecido: seda com brilho anisotrópico e iridescência muito contida.
// A ideia é sugerir o material, nunca competir com a fotografia do produto.

uniform vec3  uCorBase;      // marfim / nude / bordeaux
uniform vec3  uCorLuz;
uniform float uTime;
uniform float uBrilho;       // 0.0 – 1.0

varying vec2  vUv;
varying vec3  vNormal;
varying float vElevation;

void main() {
  vec3 luzDir = normalize(vec3(0.35, 0.75, 0.9));
  vec3 vista  = vec3(0.0, 0.0, 1.0);
  vec3 n      = normalize(vNormal);

  // difusa suavizada (wrap lighting) — evita sombras duras num tecido leve
  float difusa = clamp(dot(n, luzDir) * 0.5 + 0.5, 0.0, 1.0);

  // realce anisotrópico: a seda brilha ao longo da trama, não em ponto
  vec3  meio = normalize(luzDir + vista);
  float aniso = pow(max(0.0, 1.0 - abs(dot(n, meio) - 0.42) * 3.2), 12.0);

  // fresnel para as dobras que apanham a luz de raspão
  float fresnel = pow(1.0 - max(dot(n, vista), 0.0), 2.4);

  // iridescência de 1% — a "alma" da seda tingida
  float iri = sin(vElevation * 22.0 + uTime * 0.4) * 0.5 + 0.5;
  vec3  matiz = mix(uCorBase, uCorBase * vec3(1.04, 0.99, 0.96), iri);

  vec3 cor = matiz * (0.62 + difusa * 0.38);
  cor += uCorLuz * aniso * uBrilho * 0.9;
  cor += uCorLuz * fresnel * 0.16;

  // vinheta suave nas bordas para o tecido se fundir com o fundo
  float borda = smoothstep(0.0, 0.28, vUv.x) * smoothstep(1.0, 0.72, vUv.x)
              * smoothstep(0.0, 0.28, vUv.y) * smoothstep(1.0, 0.72, vUv.y);

  gl_FragColor = vec4(cor, borda * 0.97);

  #include <colorspace_fragment>
}
