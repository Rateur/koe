// One persistent world: a strip of paper tape printed with the real monologue, a vermilion bar
// cut from Koe's mark, and the page it rests on. Every pose is a pure function of the story value T
// (0 hero, 1..2 you talk, 2..3 Koe strikes, 3..4 Koe asks, 4..5 Claude gets the frame), so scrolling
// back and forth always lands on the same frame.
import * as THREE from 'three'
import { buildPrint, buildLines, makeLive, makePatch, parseMonologue } from './text.js'

const W = 2.5 // tape width, world units
const LIFT = 0.035 // the tape never quite touches the page, so it always casts a contact shadow
const TAU = Math.PI * 2
const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x)
const lerp = (a, b, t) => a + (b - a) * t
const sstep = (x) => {
  x = clamp01(x)
  return x * x * (3 - 2 * x)
}
const ease = (x) => {
  x = clamp01(x)
  return x * x * x * (x * (x * 6 - 15) + 10)
}
const range = (t, a, b) => clamp01((t - a) / (b - a))
const hash = (n) => {
  const x = Math.sin(n * 91.345 + 47.853) * 43758.5453
  return x - Math.floor(x)
}

const COLORS = {
  paper: new THREE.Color('#f8f6f1'),
  ink: new THREE.Color('#1a1917'),
  graphite: new THREE.Color('#5f5b54'),
  shu: new THREE.Color('#d8432b'),
}

// The Koe mark (index.html), in its own SVG units.
const MARK = { x0: 150, y0: 217, w: 724, h: 590, c1: [305.01, 409.49], c2: [718.99, 614.51], r: 128, stroke: 128 }

export async function createWorld({ canvas, copy, phone, reduced }) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: !phone, powerPreference: 'high-performance' })
  renderer.setClearColor(0x000000, 0)
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.NeutralToneMapping
  renderer.toneMappingExposure = 1.0
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.VSMShadowMap
  let dprCap = phone ? 1.5 : 2
  renderer.setPixelRatio(Math.min(devicePixelRatio, dprCap))

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(28, 1, 0.5, 2000)
  camera.rotation.order = 'YXZ'

  // Light: one warm key from the upper left at 35°, a low hemisphere fill.
  const hemi = new THREE.HemisphereLight(0xffffff, 0xe2ded6, 2.3)
  scene.add(hemi)
  const key = new THREE.DirectionalLight(0xfff7ee, 2.45)
  key.castShadow = true
  key.shadow.mapSize.set(phone ? 1024 : 2048, phone ? 1024 : 2048)
  key.shadow.radius = phone ? 5 : 7
  key.shadow.blurSamples = phone ? 8 : 14
  key.shadow.bias = -0.0004
  key.shadow.normalBias = 0.02
  scene.add(key, key.target)
  // Upper left of the frame at 35°; when the camera grazes the standing tape, the key swings in front of it.
  const LIGHT_CAM = new THREE.Vector3(-0.42, 0.3, 0.86).normalize()
  const LIGHT_TOP = new THREE.Vector3(-0.58, 0.574, -0.58).normalize()
  const LIGHT_DIR = new THREE.Vector3()
  const _lt = new THREE.Vector3()

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(4000, 4000),
    new THREE.ShadowMaterial({ color: 0x3b3027, opacity: 0.27 }),
  )
  ground.rotation.x = -Math.PI / 2
  ground.receiveShadow = true
  scene.add(ground)

  // ---------- Print ----------
  const spans = parseMonologue(copy.monologue)
  const questions = [...copy.questionsHtml.matchAll(/<li>(.*?)<\/li>/g)].map((m) => m[1])
  const print = buildPrint({ spans, facts: copy.facts, answer: copy.answer, questions, phone })
  const upp = W / print.rowH // world units per atlas pixel
  const checkSpan = spans.find((s) => s.kind === 'check')
  const patch = makePatch(print, checkSpan ? checkSpan.text : '', copy.fixed)
  const live = makeLive(phone)

  const texA = new THREE.CanvasTexture(print.canvas)
  const texPatch = new THREE.CanvasTexture(patch.canvas)
  const texLive = new THREE.CanvasTexture(live.canvas)
  for (const tex of [texA, texPatch, texLive]) {
    tex.colorSpace = THREE.NoColorSpace
    tex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy())
    tex.generateMipmaps = true
    tex.minFilter = THREE.LinearMipmapLinearFilter
  }
  let texB = new THREE.CanvasTexture(document.createElement('canvas'))
  let linesB = null

  // Paper grain: a small tiling normal map made from value noise.
  const grain = (() => {
    const n = 128
    const c = document.createElement('canvas')
    c.width = c.height = n
    const g = c.getContext('2d')
    const img = g.createImageData(n, n)
    const h = new Float32Array(n * n)
    for (let i = 0; i < n * n; i++) h[i] = hash(i * 1.37)
    const sm = new Float32Array(n * n)
    for (let y = 0; y < n; y++)
      for (let x = 0; x < n; x++) {
        let s = 0
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) s += h[((y + dy + n) % n) * n + ((x + dx + n) % n)]
        sm[y * n + x] = s / 9 + h[y * n + x] * 0.35
      }
    for (let y = 0; y < n; y++)
      for (let x = 0; x < n; x++) {
        const dx = sm[y * n + ((x + 1) % n)] - sm[y * n + ((x - 1 + n) % n)]
        const dy = sm[((y + 1) % n) * n + x] - sm[((y - 1 + n) % n) * n + x]
        const nx = -dx * 2.2
        const ny = -dy * 2.2
        const l = Math.hypot(nx, ny, 1)
        const i = (y * n + x) * 4
        img.data[i] = (nx / l * 0.5 + 0.5) * 255
        img.data[i + 1] = (ny / l * 0.5 + 0.5) * 255
        img.data[i + 2] = (1 / l * 0.5 + 0.5) * 255
        img.data[i + 3] = 255
      }
    g.putImageData(img, 0, 0)
    const t = new THREE.CanvasTexture(c)
    t.wrapS = t.wrapT = THREE.RepeatWrapping
    t.colorSpace = THREE.NoColorSpace
    return t
  })()

  // ---------- Tape material ----------
  const uniforms = {
    uAtlasA: { value: texA },
    uAtlasB: { value: texB },
    uPatch: { value: texPatch },
    uLive: { value: texLive },
    uA: { value: new THREE.Vector4(print.rowLen, print.pad, print.atlasW, print.canvas.height) },
    uARowH: { value: print.rowH },
    uB: { value: new THREE.Vector4(64, 1, 1, 1) },
    uPatchSize: { value: new THREE.Vector2(patch.canvas.width, patch.canvas.height) },
    uLiveSize: { value: new THREE.Vector2(live.canvas.width, live.canvas.height) },
    uPaper: { value: COLORS.paper },
    uInk: { value: COLORS.ink },
    uGraphite: { value: COLORS.graphite },
    uShu: { value: COLORS.shu },
    uFocus: { value: 0 },
    uRes: { value: new THREE.Vector2(1, 1) },
    uFocusHalf: { value: phone ? 0.26 : 0.17 },
  }

  const vertHead = /* glsl */ `
    attribute vec4 aFx;
    attribute float aT;
    attribute float aV;
    attribute float aLocal;
    attribute float aKind;
    attribute vec2 aB;
    varying vec4 vFx;
    varying float vT;
    varying float vV;
    varying float vLocal;
    varying float vKind;
    varying vec2 vB;
  `
  const vertBody = /* glsl */ `
    vFx = aFx; vT = aT; vV = aV; vLocal = aLocal; vKind = aKind; vB = aB;
  `
  const fragHead = /* glsl */ `
    uniform sampler2D uAtlasA;
    uniform sampler2D uAtlasB;
    uniform sampler2D uPatch;
    uniform sampler2D uLive;
    uniform vec4 uA;
    uniform float uARowH;
    uniform vec4 uB;
    uniform vec2 uPatchSize;
    uniform vec2 uLiveSize;
    uniform vec3 uPaper;
    uniform vec3 uInk;
    uniform vec3 uGraphite;
    uniform vec3 uShu;
    uniform float uFocus;
    uniform vec2 uRes;
    uniform float uFocusHalf;
    varying vec4 vFx;
    varying float vT;
    varying float vV;
    varying float vLocal;
    varying float vKind;
    varying vec2 vB;
    float koeHash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
    float koeNoise(vec2 p) {
      vec2 i = floor(p); vec2 f = fract(p); f = f * f * (3.0 - 2.0 * f);
      return mix(mix(koeHash(i), koeHash(i + vec2(1, 0)), f.x), mix(koeHash(i + vec2(0, 1)), koeHash(i + vec2(1, 1)), f.x), f.y);
    }
    // The long printed line wraps over the atlas rows; gradients come from t and v so row seams stay clean.
    vec4 koeSampleA(float t, float v, float bias) {
      float row = floor(t / uA.x);
      float x = t - row * uA.x + uA.y;
      vec2 uv = vec2(x / uA.z, 1.0 - (row * uARowH + (1.0 - v) * uARowH) / uA.w);
      float s = exp2(bias);
      vec2 gx = vec2(dFdx(t) / uA.z, dFdx(v) * uARowH / uA.w) * s;
      vec2 gy = vec2(dFdy(t) / uA.z, dFdy(v) * uARowH / uA.w) * s;
      return textureGrad(uAtlasA, uv, gx, gy);
    }
    vec4 koeSampleB(float bx, float row, float v) {
      vec2 uv = vec2(bx / uB.y, 1.0 - (row * uB.x + (1.0 - v) * uB.x) / uB.z);
      return texture(uAtlasB, uv, -0.6);
    }
  `
  const fragBody = /* glsl */ `
    float kind = vKind + 0.01;
    float flag = floor(kind / 4.0);
    float mode = floor(mod(kind, 4.0));
    float sx = gl_FragCoord.x / uRes.x;
    float off = max(0.0, abs(sx - 0.5) - uFocusHalf) / (0.5 - uFocusHalf);
    float bias = uFocus * off * off * 3.6;
    vec4 sa = vec4(0.0);
    float vS = flag > 3.5 ? 0.5 + (vV - 0.5) * 1.9 : vV;
    if (mode < 0.5 && vS > 0.0 && vS < 1.0) sa = koeSampleA(vT, vS, bias);
    else if (mode > 1.5 && mode < 2.5) sa = texture(uPatch, vec2(vT / uPatchSize.x, vV));
    else if (mode > 2.5) sa = texture(uLive, vec2(vT / uLiveSize.x, vV));
    float ink = sa.r;
    float gra = sa.g;
    float ver = sa.b;
    if (flag > 0.5 && flag < 1.5) {
      // a line of the prompt: Casual print fades in flight, then a vermilion wipe brings in Linear Mono
      vec4 sb = koeSampleB(vB.x, vB.y, vV);
      float wipe = vFx.x;
      float isB = step(vLocal, wipe);
      ink = mix(ink * (1.0 - vFx.z), sb.r, isB);
      gra = mix(gra * (1.0 - vFx.z), sb.g, isB);
      ver = ver * (1.0 - vFx.z) * (1.0 - isB);
      float band = 0.3 / max(vFx.w, 0.5);
      float front = step(0.002, wipe) * step(wipe, 0.998);
      ver = max(ver, front * (1.0 - smoothstep(band * 0.4, band, abs(vLocal - wipe))));
    } else if (flag > 1.5 && flag < 2.5) {
      // noise: the bar's strike, drawn from the right as the bar passes
      float wob = sin(vT * 0.021) * 0.012 + (koeNoise(vec2(vT * 0.05, 3.0)) - 0.5) * 0.02;
      float onLine = 1.0 - smoothstep(0.03, 0.048, abs(vV - 0.475 + wob));
      ver = max(ver, onLine * step(1.0 - vFx.x, vLocal));
    } else if (flag > 2.5 && flag < 3.5) {
      // the spoken answer: a small vermilion tick at the splice
      float d = (1.0 - vLocal) * vFx.w;
      float tick = (1.0 - smoothstep(0.07, 0.11, abs(d - 0.35 + (vV - 0.5) * 0.35))) * step(0.12, vV) * step(vV, 0.88);
      ver = max(ver, tick * vFx.x);
    } else if (flag > 3.5) {
      // the curls of the mark: a round end
      float d = vLocal * vB.x;
      if (d < 0.5) {
        float dx = (0.5 - d) * 2.0;
        float dy = (vV - 0.5) * 2.0;
        if (dx * dx + dy * dy > 1.0) discard;
      }
    }
    if (vFx.y > 0.001) {
      float n = koeNoise(vec2(vT * 0.045, vV * 5.0)) * 0.7 + koeNoise(vec2(vT * 0.16, vV * 17.0)) * 0.3;
      if (n < vFx.y * 1.05 - 0.02) discard;
    }
    vec3 col = uPaper;
    if (gl_FrontFacing) {
      col = mix(col, uInk, clamp(ink, 0.0, 1.0) * 0.94);
      col = mix(col, uGraphite, clamp(gra, 0.0, 1.0) * 0.9);
      col = mix(col, uShu, clamp(ver, 0.0, 1.0));
    } else {
      col = uPaper * 0.94;
      col = mix(col, uShu, clamp(ver, 0.0, 1.0) * 0.25);
    }
    diffuseColor.rgb = col;
  `

  const tapeMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.86,
    metalness: 0,
    side: THREE.DoubleSide,
    normalMap: grain,
    normalScale: new THREE.Vector2(0.13, 0.13),
  })
  tapeMat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms)
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\n' + vertHead)
      .replace('#include <begin_vertex>', '#include <begin_vertex>\n' + vertBody)
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\n' + fragHead)
      .replace('#include <map_fragment>', fragBody)
  }
  // Shadows follow the dissolve and the round ends.
  const depthMat = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, side: THREE.DoubleSide })
  depthMat.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\n' + vertHead)
      .replace('#include <begin_vertex>', '#include <begin_vertex>\n' + vertBody)
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <common>',
      `#include <common>
      varying vec4 vFx; varying float vT; varying float vV; varying float vLocal; varying float vKind; varying vec2 vB;
      float koeHash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float koeNoise(vec2 p) { vec2 i = floor(p); vec2 f = fract(p); f = f * f * (3.0 - 2.0 * f);
        return mix(mix(koeHash(i), koeHash(i + vec2(1, 0)), f.x), mix(koeHash(i + vec2(0, 1)), koeHash(i + vec2(1, 1)), f.x), f.y); }`,
    ).replace(
      'void main() {',
      `void main() {
        float kflag = floor((vKind + 0.01) / 4.0);
        if (kflag > 3.5) { float d = vLocal * vB.x; if (d < 0.5) { float dx = (0.5 - d) * 2.0; float dy = (vV - 0.5) * 2.0; if (dx * dx + dy * dy > 1.0) discard; } }
        if (vFx.y > 0.001) { float n = koeNoise(vec2(vT * 0.045, vV * 5.0)) * 0.7 + koeNoise(vec2(vT * 0.16, vV * 17.0)) * 0.3; if (n < vFx.y * 1.05 - 0.02) discard; }`,
    )
  }

  // ---------- Pieces ----------
  // mode: 0 atlas print, 1 blank, 2 patch, 3 live. flag: 0 plain, 1 prompt line, 2 noise, 3 answer, 4 curl.
  const MODE = { atlas: 0, blank: 1, patch: 2, live: 3 }
  const segLen = phone ? 0.62 : 0.36

  const main = [] // the monologue tape, in order
  for (const p of print.pieces) {
    const kind = p.kind
    const piece = {
      set: 'main', kind, t0: p.t0, t1: p.t1, text: p.text,
      len: (p.t1 - p.t0) * upp,
      mode: kind === 'lead' || kind === 'tail' ? MODE.blank : kind === 'check' ? MODE.patch : MODE.atlas,
      flag: kind === 'noise' ? 2 : 0,
    }
    main.push(piece)
  }
  const TAIL_EXTRA = 70 // blank tape still running into the slot, in the hero
  const tail = main.find((p) => p.kind === 'tail')
  tail.len = TAIL_EXTRA
  tail.blankLen = (print.pieces.find((p) => p.kind === 'tail').t1 - print.pieces.find((p) => p.kind === 'tail').t0) * upp
  const checkPiece = main.find((p) => p.kind === 'check')
  const noises = main.filter((p) => p.kind === 'noise')
  const answer = { set: 'extra', kind: 'answer', t0: print.ansPiece.t0, t1: print.ansPiece.t1, len: (print.ansPiece.t1 - print.ansPiece.t0) * upp, mode: MODE.atlas, flag: 3 }
  const tabs = print.tabs.map((tb, i) => ({ set: 'extra', kind: 'tab', i, t0: tb.t0, t1: tb.t1, len: (tb.t1 - tb.t0) * upp, mode: MODE.atlas, flag: 0 }))
  const tryStrip = { set: 'extra', kind: 'try', t0: 0, t1: live.canvas.width, len: 40, mode: MODE.live, flag: 0, segs: 24 }
  const curls = [0, 1].map((i) => ({ set: 'extra', kind: 'curl', i, t0: 0, t1: 1, len: 10, mode: MODE.atlas, flag: 4, segs: phone ? 40 : 64, flipV: i === 1 }))
  let lines = [] // built in layout()

  // Clean order after the edit: answer, then every kept piece (noise has no length left).
  function cleanSequence() {
    const seq = []
    seq.push({ len: answer.len, t0: answer.t0, t1: answer.t1, mode: MODE.atlas })
    for (const p of main) {
      if (p.kind === 'noise') continue
      if (p.kind === 'check') seq.push({ len: patch.wFixed * upp, t0: 0, t1: patch.wFixed, mode: MODE.patch })
      else if (p.kind === 'tail') seq.push({ len: p.blankLen, t0: 2, t1: 2, mode: MODE.blank })
      else if (p.kind === 'lead') seq.push({ len: p.len, t0: 2, t1: 2, mode: MODE.blank })
      else seq.push({ len: p.len, t0: p.t0, t1: p.t1, mode: MODE.atlas })
    }
    let c = -answer.len
    for (const s of seq) {
      s.c0 = c
      c += s.len
      s.c1 = c
    }
    return seq
  }
  const clean = cleanSequence()
  const cMin = clean[0].c0
  const cMax = clean[clean.length - 1].c1

  // ---------- Geometry ----------
  let geo = null
  let mesh = null
  let attrs = null
  let allPieces = []

  function knotsFor(piece) {
    if (piece.kind === 'line') return piece.knots
    const n = piece.segs || Math.max(2, Math.ceil(piece.len / segLen))
    const k = []
    for (let i = 0; i <= n; i++) {
      const a = i / n
      let t
      if (piece.mode === MODE.blank) t = 2
      else if (piece.kind === 'check') t = a * patch.w0
      else t = lerp(piece.t0, piece.t1, a)
      k.push({ a, t, mode: piece.mode })
    }
    return k
  }

  function buildGeometry() {
    allPieces = [...main, answer, ...tabs, tryStrip, ...curls, ...lines]
    let nVerts = 0
    for (const p of allPieces) {
      p.knots = knotsFor(p)
      p.v0 = nVerts
      nVerts += p.knots.length * 3
    }
    const pos = new Float32Array(nVerts * 3)
    const nor = new Float32Array(nVerts * 3)
    const uv = new Float32Array(nVerts * 2)
    const aT = new Float32Array(nVerts)
    const aV = new Float32Array(nVerts)
    const aLocal = new Float32Array(nVerts)
    const aKind = new Float32Array(nVerts)
    const aB = new Float32Array(nVerts * 2)
    const aFx = new Float32Array(nVerts * 4)
    const index = []
    for (const p of allPieces) {
      const lenW = p.kind === 'curl' ? 0 : p.len / W
      p.knots.forEach((kn, i) => {
        for (let j = 0; j < 3; j++) {
          const vi = p.v0 + i * 3 + j
          const v = j / 2
          aT[vi] = kn.t
          aV[vi] = p.flipV ? 1 - v : v
          aLocal[vi] = kn.a
          aKind[vi] = kn.mode + 4 * p.flag
          if (p.kind === 'line') {
            aB[vi * 2] = kn.a * p.lenPx
            aB[vi * 2 + 1] = p.row
          }
          uv[vi * 2] = (p.uv0 || 0) + kn.a * (lenW || 4) * 0.5
          uv[vi * 2 + 1] = v * 0.5
        }
        if (i > 0) {
          const a = p.v0 + (i - 1) * 3
          const b = p.v0 + i * 3
          for (let j = 0; j < 2; j++) index.push(a + j, b + j, a + j + 1, b + j, b + j + 1, a + j + 1)
        }
      })
    }
    if (geo) geo.dispose()
    geo = new THREE.BufferGeometry()
    attrs = {
      position: new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage),
      normal: new THREE.BufferAttribute(nor, 3).setUsage(THREE.DynamicDrawUsage),
      uv: new THREE.BufferAttribute(uv, 2),
      aT: new THREE.BufferAttribute(aT, 1).setUsage(THREE.DynamicDrawUsage),
      aV: new THREE.BufferAttribute(aV, 1),
      aLocal: new THREE.BufferAttribute(aLocal, 1),
      aKind: new THREE.BufferAttribute(aKind, 1),
      aB: new THREE.BufferAttribute(aB, 2).setUsage(THREE.DynamicDrawUsage),
      aFx: new THREE.BufferAttribute(aFx, 4).setUsage(THREE.DynamicDrawUsage),
    }
    for (const [name, a] of Object.entries(attrs)) geo.setAttribute(name, a)
    geo.setIndex(index)
    geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e5)
    if (!mesh) {
      mesh = new THREE.Mesh(geo, tapeMat)
      mesh.customDepthMaterial = depthMat
      mesh.castShadow = true
      mesh.receiveShadow = !phone
      mesh.frustumCulled = false
      scene.add(mesh)
    } else mesh.geometry = geo
  }

  // ---------- Paths ----------
  // Hero: a helix of tape laid along a tilde, the « roughly » of speech, running off to a slot top right.
  const tildePts = [
    [-38, 13], [-30, 4], [-20, -2.5], [-10, -1], [-1, 6.5], [9, 10], [20, 6], [30, -2], [39, -11], [50, -22], [66, -36], [90, -54],
  ].map(([x, z]) => new THREE.Vector3(x, 0, z))
  const backbone = new THREE.CatmullRomCurve3(tildePts, false, 'centripetal')
  const bbLen = backbone.getLength()
  const COIL = { R: 2.45, ry: 0.66, pitch: 3.4, coilEnd: bbLen * 0.72 }
  const radiusAt = (s) => COIL.R * sstep((s + 6) / 4) * (1 - sstep((s - COIL.coilEnd) / 9))
  // integrate tape length -> (backbone s, angle θ)
  const HSTEP = 0.05
  const helix = (() => {
    const maxP = 900
    const n = Math.ceil(maxP / HSTEP)
    const S = new Float32Array(n + 1)
    const TH = new Float32Array(n + 1)
    let s = 0
    let th = -Math.PI / 2
    for (let i = 0; i <= n; i++) {
      S[i] = s
      TH[i] = th
      const r = radiusAt(s)
      const turn = Math.hypot(TAU * r * 0.84, COIL.pitch)
      s += (HSTEP * COIL.pitch) / turn
      th += (HSTEP * TAU) / turn
    }
    const r0 = Math.hypot(TAU * COIL.R * 0.84, COIL.pitch)
    return { S, TH, n, dS: COIL.pitch / r0, dTH: TAU / r0 }
  })()
  const _bp = new THREE.Vector3()
  const _bt = new THREE.Vector3()
  function backbonePoint(s, out, tan) {
    if (s < 0) {
      backbone.getPointAt(0, out)
      backbone.getTangentAt(0, tan)
      out.addScaledVector(tan, s)
    } else if (s > bbLen) {
      backbone.getPointAt(1, out)
      backbone.getTangentAt(1, tan)
      out.addScaledVector(tan, s - bbLen)
    } else {
      backbone.getPointAt(s / bbLen, out)
      backbone.getTangentAt(s / bbLen, tan)
    }
  }
  // Writes position (o[0..2]) and normal (o[3..5]) for tape coordinate p on the coil.
  function heroPose(p, o) {
    let s
    let th
    if (p <= 0) {
      s = p * helix.dS
      th = helix.TH[0] + p * helix.dTH
    } else {
      const f = Math.min(p / HSTEP, helix.n - 1)
      const i = Math.floor(f)
      const u = f - i
      s = lerp(helix.S[i], helix.S[i + 1], u)
      th = lerp(helix.TH[i], helix.TH[i + 1], u)
    }
    backbonePoint(s, _bp, _bt)
    const r = radiusAt(s)
    const ry = r * COIL.ry
    const sx = -_bt.z
    const sz = _bt.x // side vector, horizontal
    const c = Math.cos(th)
    const sn = Math.sin(th)
    o[0] = _bp.x + sx * r * c
    o[1] = ry * sn + ry + LIFT
    o[2] = _bp.z + sz * r * c
    // outward normal of the flattened loop, easing to "up" where the coil runs flat to the slot
    let nx = sx * ry * c
    let ny = r * sn
    let nz = sz * ry * c
    const flat = 1 - clamp01(r / COIL.R)
    ny += flat * 3
    const l = Math.hypot(nx, ny, nz) || 1
    o[3] = nx / l
    o[4] = ny / l
    o[5] = nz / l
  }

  // Reading: the tape stands on its edge in a long gentle wave, print facing the camera.
  const X0 = -38
  const Z0 = 13
  const WAVE = { A: phone ? 0.8 : 1.3, L: 27 }
  function readPose(g, o, flat) {
    const k = TAU / WAVE.L
    const x = X0 + g
    const z = Z0 + WAVE.A * Math.sin(g * k)
    let tx = 1
    let tz = WAVE.A * k * Math.cos(g * k)
    const l = Math.hypot(tx, tz)
    tx /= l
    tz /= l
    if (!flat) {
      o[0] = x
      o[1] = W / 2 + LIFT
      o[2] = z
      o[3] = -tz
      o[4] = 0
      o[5] = tx
    } else {
      // lying down, fallen back: its top edge now points away from the camera
      o[0] = x + tz * (W / 2)
      o[1] = LIFT
      o[2] = z - tx * (W / 2)
      o[3] = 0
      o[4] = 1
      o[5] = 0
    }
  }

  // ---------- Layout of the main tape ----------
  const S = { feed: 0, relax: 0, snip: new Map(), checkK: 0, splice: 0 }
  const fullBefore = new Map()
  {
    let g = 0
    for (const p of main) {
      fullBefore.set(p, g)
      g += p.len
    }
  }
  function effLen(p) {
    if (p.kind === 'noise') return p.len * (1 - (S.snip.get(p) || 0))
    if (p.kind === 'check') return patchLenPx * upp
    if (p.kind === 'tail') return lerp(TAIL_EXTRA + S.feed, p.blankLen, S.relax)
    return p.len
  }
  let patchLenPx = patch.w0

  // Print coordinate on the main tape -> layout coordinate g (lengths as they are now).
  function gOfT(t) {
    let g = 0
    for (const p of main) {
      const e = effLen(p)
      if (t <= p.t1 || p.kind === 'tail') {
        const u = clamp01((t - p.t0) / Math.max(1e-6, p.t1 - p.t0))
        return g + u * e
      }
      g += e
    }
    return g
  }

  // ---------- Story timing ----------
  // Reading head (stage 1) and bar (stage 2) travel along print coordinates, slowing on what matters.
  function travel(from, to, stops, dwell) {
    const N = 600
    const ts = new Float32Array(N + 1)
    const cost = new Float32Array(N + 1)
    let c = 0
    for (let i = 0; i <= N; i++) {
      const t = lerp(from, to, i / N)
      ts[i] = t
      if (i > 0) {
        let w = 1
        for (const s of stops) {
          const d = s.at !== undefined ? Math.abs(t - s.at) : t < s.t0 ? s.t0 - t : t > s.t1 ? t - s.t1 : 0
          w += (s.weight ?? dwell) * Math.exp(-((d / (s.spread ?? print.rowH * 0.9)) ** 2))
        }
        c += w
      }
      cost[i] = c
    }
    return (u) => {
      const target = clamp01(u) * c
      let lo = 0
      let hi = N
      while (hi - lo > 1) {
        const m = (lo + hi) >> 1
        if (cost[m] < target) lo = m
        else hi = m
      }
      const f = (target - cost[lo]) / Math.max(1e-6, cost[hi] - cost[lo])
      return lerp(ts[lo], ts[hi], f)
    }
  }
  const factStops = print.factT.filter((t) => t !== null).map((at) => ({ at, weight: 2.4 }))
  const readHead = travel(print.pieces[0].t1 * 0.3, print.textEnd, factStops, 2.4)
  const barStops = [
    ...noises.map((n) => ({ t0: n.t0 - print.rowH * 3.2, t1: n.t1, weight: 3.2, spread: print.rowH * 0.8 })),
    checkPiece ? { t0: checkPiece.t0 - print.rowH * 2.5, t1: checkPiece.t1, weight: 3.6, spread: print.rowH } : null,
  ].filter(Boolean)
  const barFrom = print.textEnd + print.rowH * 1.5
  const barTo = -print.rowH * 1.6
  const barTravel = travel(barFrom, barTo, barStops, 3)
  const SNIP_PX = print.rowH * 2.6

  // ---------- Bar ----------
  const capsule = new THREE.Shape()
  {
    const L = 1
    const r = 160 / 600 / 2
    capsule.moveTo(-L / 2 + r, -r)
    capsule.lineTo(L / 2 - r, -r)
    capsule.absarc(L / 2 - r, 0, r, -Math.PI / 2, Math.PI / 2, false)
    capsule.lineTo(-L / 2 + r, r)
    capsule.absarc(-L / 2 + r, 0, r, Math.PI / 2, (Math.PI * 3) / 2, false)
  }
  const barGeo = new THREE.ExtrudeGeometry(capsule, { depth: 0.1, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.018, bevelSegments: 4, curveSegments: 28 })
  const bar = new THREE.Mesh(barGeo, new THREE.MeshStandardMaterial({ color: COLORS.shu, roughness: 0.6, metalness: 0 }))
  bar.castShadow = true
  bar.visible = false
  scene.add(bar)

  // ---------- Flakes ----------
  const FLAKES = phone ? 400 : 1500
  const flakeGeo = new THREE.PlaneGeometry(0.15, 0.1)
  const flakeMat = new THREE.MeshStandardMaterial({ color: COLORS.paper, roughness: 1, side: THREE.DoubleSide })
  const flakes = new THREE.InstancedMesh(flakeGeo, flakeMat, FLAKES)
  flakes.castShadow = !phone
  flakes.frustumCulled = false
  scene.add(flakes)
  const flakeInfo = []
  {
    const totalNoise = noises.reduce((s, n) => s + n.len, 0)
    let fi = 0
    noises.forEach((n, ni) => {
      const count = ni === noises.length - 1 ? FLAKES - fi : Math.round((FLAKES * n.len) / totalNoise)
      for (let k = 0; k < count && fi < FLAKES; k++, fi++) {
        flakeInfo.push({ n, a: hash(fi * 3.1), v: 0.15 + hash(fi * 7.7) * 0.7, d: hash(fi * 1.9) * 0.7, s: fi })
      }
    })
  }
  const _m = new THREE.Matrix4()
  const _q = new THREE.Quaternion()
  const _e = new THREE.Euler()
  const _v = new THREE.Vector3()
  const _sc = new THREE.Vector3()

  // ---------- Layout from the page ----------
  const L = { vw: 1, vh: 1, k: 0.1, Hc: 200, Xc: 0, Zc: 0, sheet: null, lineRects: [], trySlot: null, markSlot: null, F: 100 }

  function screenToWorld(sx, sy, out) {
    out[0] = L.Xc + (sx - L.vw / 2) * L.k
    out[1] = 0
    out[2] = L.Zc + (sy - L.vh / 2) * L.k
    return out
  }

  // lines: [{ text, segs, rect: {x, y, w, h} relative to the sheet's top-left }]
  function layout({ vw, vh, stripPx, stripFont, sheet, lines: rows, trySlot, markSlot, frameTop }) {
    L.vw = vw
    L.vh = vh
    L.k = W / stripPx
    L.Hc = (L.k * vh) / (2 * Math.tan(THREE.MathUtils.degToRad(14)))
    L.Xc = X0 + (cMin + cMax) / 2
    L.Zc = Z0 - W / 2
    L.sheet = sheet
    L.F = frameTop
    L.trySlot = trySlot
    L.markSlot = markSlot
    renderer.setSize(vw, vh, false)
    uniforms.uRes.value.set(vw * renderer.getPixelRatio(), vh * renderer.getPixelRatio())
    camera.aspect = vw / vh
    camera.updateProjectionMatrix()

    const key = rows.map((r) => r.text).join('\n')
    if (key !== L.linesKey) {
      L.linesKey = key
      linesB = buildLines(rows, phone, (stripFont || 12.4) / stripPx)
      texB.dispose()
      texB = new THREE.CanvasTexture(linesB.canvas)
      texB.colorSpace = THREE.NoColorSpace
      texB.anisotropy = 4
      uniforms.uAtlasB.value = texB
      uniforms.uB.value.set(linesB.rowH, linesB.atlasW, linesB.atlasH, 0)
      // Share out the edited tape between the lines, in proportion to their final length.
      const real = rows.map((r, i) => ({ ...r, i })).filter((r) => r.text.trim().length)
      const total = real.reduce((s, r) => s + r.rect.w, 0)
      let c = cMin
      lines = real.map((r) => {
        const c0 = c
        const c1 = c + ((cMax - cMin) * r.rect.w) / total
        c = c1
        const knots = []
        const steps = Math.max(3, Math.ceil(((c1 - c0) / 3)))
        const cuts = new Set()
        for (let s = 0; s <= steps; s++) cuts.add(lerp(c0, c1, s / steps))
        for (const sq of clean) {
          if (sq.c0 > c0 && sq.c0 < c1) cuts.add(sq.c0)
        }
        const sorted = [...cuts].sort((a, b) => a - b)
        const tAt = (cc, sq) => (sq.mode === MODE.blank ? 2 : lerp(sq.t0, sq.t1, (cc - sq.c0) / Math.max(1e-6, sq.c1 - sq.c0)))
        for (const cc of sorted) {
          const a = (cc - c0) / (c1 - c0)
          const before = clean.find((sq) => cc > sq.c0 && cc <= sq.c1)
          const after = clean.find((sq) => cc >= sq.c0 && cc < sq.c1)
          if (before && after && before !== after) {
            knots.push({ a, t: tAt(cc, before), mode: before.mode })
            knots.push({ a, t: tAt(cc, after), mode: after.mode })
          } else {
            const sq = after || before || clean[clean.length - 1]
            knots.push({ a, t: tAt(cc, sq), mode: sq.mode })
          }
        }
        return {
          set: 'lines', kind: 'line', row: r.i, c0, c1, len: c1 - c0, rect: r.rect,
          lenPx: linesB.lenPx[r.i], flag: 1, mode: MODE.atlas, knots, uv0: c0 / W * 0.5,
        }
      })
      buildGeometry()
    }
    for (const ln of lines) ln.rect = rows[ln.row].rect
    needs = true
  }

  // ---------- Per-frame pose ----------
  const o = new Float32Array(6)
  const ob = new Float32Array(6)
  let needs = true

  function writePiece(p, poseFn, fx) {
    const pos = attrs.position.array
    const nor = attrs.normal.array
    const afx = attrs.aFx.array
    const n = p.knots.length
    // first pass: centerline and normals
    const cx = p._cx || (p._cx = new Float32Array(n * 3))
    const cn = p._cn || (p._cn = new Float32Array(n * 3))
    const cw = p._cw || (p._cw = new Float32Array(n))
    for (let i = 0; i < n; i++) {
      const wv = poseFn(p.knots[i].a, o, i)
      cx[i * 3] = o[0]
      cx[i * 3 + 1] = o[1]
      cx[i * 3 + 2] = o[2]
      cn[i * 3] = o[3]
      cn[i * 3 + 1] = o[4]
      cn[i * 3 + 2] = o[5]
      cw[i] = wv || W
    }
    for (let i = 0; i < n; i++) {
      // tangent from neighbours that are not at the same place
      let i0 = i - 1
      while (i0 >= 0 && p.knots[i0].a === p.knots[i].a) i0--
      let i1 = i + 1
      while (i1 < n && p.knots[i1].a === p.knots[i].a) i1++
      const a0 = Math.max(0, i0)
      const a1 = Math.min(n - 1, i1)
      let tx = cx[a1 * 3] - cx[a0 * 3]
      let ty = cx[a1 * 3 + 1] - cx[a0 * 3 + 1]
      let tz = cx[a1 * 3 + 2] - cx[a0 * 3 + 2]
      let tl = Math.hypot(tx, ty, tz)
      if (tl < 1e-6) {
        tx = 1
        ty = 0
        tz = 0
        tl = 1
      }
      tx /= tl
      ty /= tl
      tz /= tl
      let nx = cn[i * 3]
      let ny = cn[i * 3 + 1]
      let nz = cn[i * 3 + 2]
      const d = nx * tx + ny * ty + nz * tz
      nx -= d * tx
      ny -= d * ty
      nz -= d * tz
      const nl = Math.hypot(nx, ny, nz) || 1
      nx /= nl
      ny /= nl
      nz /= nl
      // B = N x T : across the tape, towards the top of the print
      const bx = ny * tz - nz * ty
      const by = nz * tx - nx * tz
      const bz = nx * ty - ny * tx
      const w = cw[i]
      const curl = w * 0.012
      for (let j = 0; j < 3; j++) {
        const v = j / 2 - 0.5
        const lift = j === 1 ? curl : 0
        const vi = p.v0 + i * 3 + j
        pos[vi * 3] = cx[i * 3] + bx * v * w + nx * lift
        pos[vi * 3 + 1] = cx[i * 3 + 1] + by * v * w + ny * lift
        pos[vi * 3 + 2] = cx[i * 3 + 2] + bz * v * w + nz * lift
        const tilt = j === 1 ? 0 : v * 2 * 0.09
        nor[vi * 3] = nx - bx * tilt
        nor[vi * 3 + 1] = ny - by * tilt
        nor[vi * 3 + 2] = nz - bz * tilt
        afx[vi * 4] = fx[0]
        afx[vi * 4 + 1] = fx[1]
        afx[vi * 4 + 2] = fx[2]
        afx[vi * 4 + 3] = fx[3]
      }
    }
  }
  function hidePiece(p) {
    const pos = attrs.position.array
    for (let i = p.v0 * 3; i < (p.v0 + p.knots.length * 3) * 3; i += 3) {
      pos[i] = 0
      pos[i + 1] = -50
      pos[i + 2] = 0
    }
  }

  const FX0 = [0, 0, 0, 0]
  const fxBuf = [0, 0, 0, 0]

  // camera states
  const cam = { tx: 0, ty: 0, tz: 0, dist: 100, pitch: 1, yaw: 0, fov: 28 }
  const camA = { ...cam }
  const camB = { ...cam }
  function camPreset(name, T, outCam) {
    const c = outCam
    c.fov = 28
    c.yaw = 0
    if (name === 'hero') {
      c.tx = phone ? -15 : -25
      c.ty = 0
      c.tz = phone ? 32 : -4
      c.dist = phone ? 285 : 150
      c.pitch = THREE.MathUtils.degToRad(phone ? 62 : 58)
      c.yaw = THREE.MathUtils.degToRad(phone ? -20 : 0)
    } else if (name === 'read' || name === 'strike') {
      const t = name === 'read' ? readHead(range(T, 1.0, 2.0)) : barT(T)
      const g = gOfT(t)
      c.tx = X0 + g + (phone ? 0 : 2)
      c.ty = W / 2 + (phone ? 2.4 : 3.1)
      c.tz = Z0
      c.dist = phone ? 76 : 64
      c.pitch = THREE.MathUtils.degToRad(phone ? 15 : 17)
    } else if (name === 'ask') {
      const A = askLayout()
      c.tx = A.tx
      c.ty = 0
      c.tz = A.tz
      c.dist = A.d
      c.pitch = A.pitch
    } else if (name === 'top') {
      c.tx = L.Xc
      c.ty = 0
      c.tz = L.Zc
      c.dist = L.Hc
      c.pitch = Math.PI / 2
    }
    return c
  }
  // Stage 3 framing: the start of the tape low in the frame, the question tabs fed in on the right.
  function askLayout() {
    const d = phone ? 122 : 94
    const Vh = 2 * Math.tan(THREE.MathUtils.degToRad(14)) * d
    const Vw = Vh * camera.aspect
    const jx = phone ? 0.64 : 0.47
    const jy = phone ? 0.88 : 0.79
    const tapeZ = Z0 - W / 2
    const tx = X0 - (jx - 0.5) * Vw
    const tz = tapeZ - (jy - 0.5) * Vh
    const rows = (phone ? [0.6, 0.67, 0.74] : [0.48, 0.56, 0.64]).map((y) => tapeZ - (jy - y) * Vh)
    const slotX = tx + Vw / 2 + 2
    const headX = tx + ((phone ? 0.05 : 0.53) - 0.5) * Vw
    return { d, pitch: THREE.MathUtils.degToRad(phone ? 84 : 80), tx, tz, rows, slotX, reach: slotX - headX }
  }
  function mixCam(a, b, t, out) {
    for (const k of ['tx', 'ty', 'tz', 'dist', 'pitch', 'yaw', 'fov']) out[k] = lerp(a[k], b[k], t)
    return out
  }
  function barT(T) {
    if (T < 2.06) return barFrom
    return barTravel(range(T, 2.06, 2.93))
  }

  function applyCamera(c, pointer) {
    let pitch = c.pitch
    let yaw = c.yaw
    if (pointer) {
      pitch += pointer.y * 0.0175
      yaw += pointer.x * 0.0175
    }
    pitch = Math.min(pitch, Math.PI / 2)
    const cp = Math.cos(pitch)
    const sp = Math.sin(pitch)
    const fx = -Math.sin(yaw) * cp
    const fy = -sp
    const fz = -Math.cos(yaw) * cp
    camera.position.set(c.tx - fx * c.dist, c.ty - fy * c.dist, c.tz - fz * c.dist)
    camera.rotation.set(-pitch, yaw, 0)
    if (camera.fov !== c.fov) {
      camera.fov = c.fov
      camera.updateProjectionMatrix()
    }
    camera.near = Math.max(0.5, c.dist * 0.1)
    camera.far = c.dist * 4 + 400
    camera.updateProjectionMatrix()
    camera.updateMatrixWorld()
    // shadow frustum follows the view
    const ext = Math.max(30, c.dist * Math.tan(THREE.MathUtils.degToRad(14)) * Math.max(1, camera.aspect) * 1.25)
    LIGHT_DIR.copy(LIGHT_CAM).applyQuaternion(camera.quaternion)
    if (LIGHT_DIR.y < 0.35) LIGHT_DIR.y = 0.35
    LIGHT_DIR.normalize()
    _lt.copy(LIGHT_TOP).applyAxisAngle(THREE.Object3D.DEFAULT_UP, yaw)
    LIGHT_DIR.lerp(_lt, sstep((pitch - 0.38) / 0.4)).normalize()
    key.target.position.set(c.tx, 0, c.tz)
    key.position.copy(key.target.position).addScaledVector(LIGHT_DIR, ext * 2 + 60)
    const sc = key.shadow.camera
    if (Math.abs(sc.right - ext) > 0.5) {
      sc.left = -ext
      sc.right = ext
      sc.top = ext
      sc.bottom = -ext
      sc.near = 1
      sc.far = ext * 5 + 200
      sc.updateProjectionMatrix()
    }
  }

  const _proj = new THREE.Vector3()
  function project(x, y, z) {
    _proj.set(x, y, z).project(camera)
    return [(_proj.x * 0.5 + 0.5) * L.vw, (-_proj.y * 0.5 + 0.5) * L.vh, _proj.z]
  }

  let lastPatchStep = -1
  let lastLive = null
  let liveDirtyAt = 0

  // ---------- The frame ----------
  // What the page draws on top of the tape: the facts' callouts, the word to check, the cut count,
  // where the prompt's frame is (dockTop), whether the footer mark is on, and whether to draw again.
  /** @returns {{ callouts: { i: number, x: number, y: number, on: number, d: number }[], check: { x: number, y: number, on: number } | null, struck: number, step: number, dockTop?: number, markOn?: boolean, again?: boolean, camera?: object }} */
  function frame(st) {
    const T = st.T
    const out = { callouts: [], check: null, struck: 0, step: 0 }
    if (!attrs) return out

    // --- main tape state ---
    S.feed = st.feed
    S.relax = ease(range(T, 0.05, 1.05))
    const tBar = barT(T)
    let struck = 0
    for (const n of noises) {
      const sk = clamp01((n.t0 - tBar) / SNIP_PX)
      S.snip.set(n, ease(sk))
      if (sk >= 1) struck++
    }
    out.struck = T >= 2.0 ? struck : -1
    // the misheard name scrambles while the bar passes it, then settles
    let checkK = 0
    if (checkPiece) {
      checkK = clamp01((checkPiece.t1 - tBar) / (checkPiece.t1 - checkPiece.t0 + print.rowH * 2.6))
      if (reduced) checkK = checkK > 0 ? 1 : 0
      const step = Math.round(checkK * 30)
      if (step !== lastPatchStep) {
        lastPatchStep = step
        patchLenPx = patch.draw(checkK, clamp01(checkK * 1.6))
        patchLenPx = Math.max(patchLenPx, patch.wFixed)
        texPatch.needsUpdate = true
        // the tape closes up on the shorter word
        const aT = attrs.aT.array
        const n = checkPiece.knots.length
        for (let i = 0; i < n; i++) for (let j = 0; j < 3; j++) aT[checkPiece.v0 + i * 3 + j] = checkPiece.knots[i].a * patchLenPx
        attrs.aT.needsUpdate = true
      }
    }
    const lie = ease(range(T, 3.0, 3.16)) // standing -> lying flat
    const taut = T >= 4.0
    const swapped = T >= 4.34
    const spliceK = ease(range(T, 3.46, 3.68))

    // layout g0 for each main piece
    let g = 0
    for (const p of main) {
      p.g0 = g
      p.eff = effLen(p)
      g += p.eff
    }
    const gEnd = g
    const vis = L.vw * L.k * 0.5

    for (const p of main) {
      if (swapped) {
        hidePiece(p)
        continue
      }
      const fx = fxBuf
      fx[0] = 0
      fx[1] = 0
      fx[2] = 0
      fx[3] = p.len
      let detached = 0
      if (p.kind === 'noise') {
        fx[0] = clamp01((p.t1 - tBar) / Math.max(1, p.t1 - p.t0))
        const sk = S.snip.get(p) || 0
        detached = sk
        fx[1] = clamp01(sk * 1.25)
        if (sk >= 0.999) {
          hidePiece(p)
          continue
        }
      }
      const pre = fullBefore.get(p)
      writePiece(p, (a, oo) => {
        const gl = detached > 0 ? pre + a * p.len : p.g0 + a * p.eff
        // hero coil
        heroPose(gl - S.feed + (p.kind === 'tail' ? 0 : 0), ob)
        // reading wave, standing then lying
        readPose(gl, oo, false)
        if (lie > 0) {
          const ox = oo[0], oy = oo[1], oz = oo[2], nx = oo[3], ny = oo[4], nz = oo[5]
          readPose(gl, oo, true)
          oo[0] = lerp(ox, oo[0], lie)
          oo[1] = lerp(oy, oo[1], lie) + Math.sin(lie * Math.PI) * 0.4
          oo[2] = lerp(oz, oo[2], lie)
          oo[3] = lerp(nx, oo[3], lie)
          oo[4] = lerp(ny, oo[4], lie)
          oo[5] = lerp(nz, oo[5], lie)
        }
        // relax from the coil: the free end goes first
        const wr = ease((S.relax * 1.45 - 0.1) - 0.35 * (gl / Math.max(1, gEnd)))
        if (wr < 1) {
          for (let i = 0; i < 6; i++) oo[i] = lerp(ob[i], oo[i], wr)
        }
        // pulled taut: straight, from the middle of the screen outwards
        if (taut) {
          const x = X0 + gl
          const d = Math.min(1.6, Math.abs(x - L.Xc) / Math.max(1, vis))
          const k = ease((T - 4.0) / 0.2 - d * 0.45)
          if (k > 0) {
            const flutter = Math.sin(gl * 1.7 + T * 60) * 0.25 * k * (1 - k) * 4
            oo[0] = lerp(oo[0], x, k)
            oo[1] = lerp(oo[1], LIFT, k) + Math.max(0, flutter)
            oo[2] = lerp(oo[2], L.Zc, k)
            oo[3] = lerp(oo[3], 0, k)
            oo[4] = lerp(oo[4], 1, k)
            oo[5] = lerp(oo[5], 0, k)
          }
        }
        if (detached > 0) {
          // the snipped length lifts off the tape and falls apart
          const up = detached
          oo[0] += oo[3] * up * 0.7
          oo[1] += up * 0.5 - up * up * 0.9
          oo[2] += oo[5] * up * 0.7 + up * 0.6
        }
        return W
      }, fx)
    }

    // --- answer: comes in, splices at the start of the tape with a vermilion tick ---
    if (swapped || T < 3.3) hidePiece(answer)
    else {
      const fx = fxBuf
      fx[0] = ease(range(T, 3.64, 3.74))
      fx[1] = 0
      fx[2] = 0
      fx[3] = answer.len
      writePiece(answer, (a, oo) => {
        const gl = -answer.len + a * answer.len
        readPose(gl, oo, true)
        const k = spliceK
        const off = 1 - k
        oo[0] += -off * 44
        oo[1] += Math.sin(k * Math.PI) * 0.5
        if (taut) {
          const x = X0 + gl
          const d = Math.min(1.6, Math.abs(x - L.Xc) / Math.max(1, vis))
          const kk = ease((T - 4.0) / 0.2 - d * 0.45)
          oo[0] = lerp(oo[0], x, kk)
          oo[1] = lerp(oo[1], LIFT, kk)
          oo[2] = lerp(oo[2], L.Zc, kk)
        }
        return W
      }, fx)
    }

    // --- the three questions: short tabs of Linear Mono fed out of the slot, then taken back ---
    tabs.forEach((tb, i) => {
      const fin = ease(range(T, 3.12 + i * 0.09, 3.26 + i * 0.09))
      const back = ease(range(T, 3.76 + (2 - i) * 0.04, 3.9 + (2 - i) * 0.04))
      const f = fin * (1 - back)
      if (f <= 0.001) return hidePiece(tb)
      const A = askLayout()
      const slotX = A.slotX
      const rowZ = A.rows[i]
      const out = Math.min(tb.len, A.reach) * f
      writePiece(tb, (a, oo) => {
        oo[0] = slotX - out + a * tb.len
        oo[1] = LIFT + 0.09 + 0.01 * i
        oo[2] = rowZ
        oo[3] = 0
        oo[4] = 1
        oo[5] = 0
        return W
      }, FX0)
    })

    // --- prompt lines: cut from the taut tape and laid into the frame ---
    let dockTop = L.F
    if (L.sheet) dockTop = Math.min(L.sheet.docTop - st.scrollY, L.F)
    out.dockTop = dockTop
    const nLines = lines.length
    lines.forEach((ln, j) => {
      if (!swapped) return hidePiece(ln)
      const start = 4.36 + (j / Math.max(1, nLines)) * 0.4
      const k = ease(range(T, start, start + 0.18))
      const wipe = ease(range(T, start + 0.16, start + 0.26))
      const fx = fxBuf
      fx[0] = reduced ? (T >= 4.9 ? 1 : 0) : wipe
      fx[1] = 0
      fx[2] = Math.sin(k * Math.PI) * 0.7
      const sheetLeft = L.sheet ? L.sheet.left : 0
      const x0 = sheetLeft + ln.rect.x
      const y0 = dockTop + ln.rect.y + ln.rect.h / 2
      const fa = screenToWorld(x0, y0, [0, 0, 0])
      const flen = ln.rect.w * L.k
      fx[3] = lerp(ln.len, flen, k)
      writePiece(ln, (a, oo) => {
        const sx = X0 + ln.c0 + a * ln.len
        const fxw = fa[0] + a * flen
        const arc = Math.sin(k * Math.PI)
        oo[0] = lerp(sx, fxw, k)
        oo[1] = LIFT + k * 0.16 + arc * (1.2 + j * 0.015) + Math.sin(a * 6 + j) * arc * 0.25
        oo[2] = lerp(L.Zc, fa[2], k)
        oo[3] = 0
        oo[4] = 1
        oo[5] = 0
        return W
      }, fx)
    })

    // --- try strip (desktop): a blank length that prints what you type ---
    if (L.trySlot && st.tryK > 0.001 && !phone) {
      const r = L.trySlot
      const top = r.docTop - st.scrollY
      const a0 = screenToWorld(r.left, top + r.h / 2, [0, 0, 0])
      const len = r.w * L.k
      const wT = r.h * L.k
      tryStrip.len = len
      const k = st.tryK
      const fx = fxBuf
      fx[0] = 0
      fx[1] = 0
      fx[2] = 0
      fx[3] = len
      writePiece(tryStrip, (a, oo) => {
        oo[0] = a0[0] + a * len + (1 - k) * (len + L.vw * L.k * 0.3)
        oo[1] = LIFT + 0.12
        oo[2] = a0[2]
        oo[3] = 0
        oo[4] = 1
        oo[5] = 0
        return wT
      }, fx)
      const lenPx = (len / wT) * live.rowH
      const aT = attrs.aT.array
      for (let i = 0; i < tryStrip.knots.length; i++) for (let j = 0; j < 3; j++) aT[tryStrip.v0 + i * 3 + j] = tryStrip.knots[i].a * lenPx
      attrs.aT.needsUpdate = true
      const now = performance.now()
      if (st.tryText !== lastLive || lenPx !== L.liveLen) out.again = true
      if ((st.tryText !== lastLive || lenPx !== L.liveLen) && now - liveDirtyAt > 100) {
        lastLive = st.tryText
        L.liveLen = lenPx
        liveDirtyAt = now
        live.draw(st.tryText || '', lenPx)
        texLive.needsUpdate = true
      }
    } else hidePiece(tryStrip)

    // --- the mark, in the footer: two curls of tape and the bar settle into Koe's logo ---
    let barPose = null
    if (L.markSlot && st.footK > 0.001) {
      const r = L.markSlot
      const top = r.docTop - st.scrollY
      const s = (r.w * L.k) / MARK.w
      const toWorld = (mx, my) => screenToWorld(r.left + ((mx - MARK.x0) / MARK.w) * r.w, top + ((my - MARK.y0) / MARK.h) * r.h, [0, 0, 0])
      const wC = MARK.stroke * s
      curls.forEach((cp, i) => {
        const k1 = ease(range(st.footK, 0.02 + i * 0.1, 0.42 + i * 0.1))
        const k2 = ease(range(st.footK, 0.25 + i * 0.1, 0.8 + i * 0.1))
        // centerline: arc of radius 128 around c, from the cut by the bar (-24°) to the round end (-135° + cap)
        const cx = i === 0 ? MARK.c1[0] : MARK.c2[0]
        const cy = i === 0 ? MARK.c1[1] : MARK.c2[1]
        const aCut = THREE.MathUtils.degToRad(-24) + (i ? Math.PI : 0)
        const arcLen = MARK.r * THREE.MathUtils.degToRad(111) + MARK.stroke / 2
        const cut = toWorld(cx + MARK.r * Math.cos(aCut), cy + MARK.r * Math.sin(aCut))
        const curv = -1 / (MARK.r * s) // turning towards the round end
        const h0 = aCut - Math.PI / 2 // heading at the cut, pointing along the arc towards the round end
        const lenW = arcLen * s
        cp.len = lenW
        const drop = (1 - k1) * 3
        const kc = curv * k2
        const fx = fxBuf
        fx[0] = 0
        fx[1] = reduced ? 0 : 1 - k1
        fx[2] = 0
        fx[3] = 0
        // aB.x holds the length in widths, for the round end; the print is the raw start of the note
        const ab = attrs.aB.array
        const aTa = attrs.aT.array
        const pxLen = (lenW / wC) * print.rowH * 1.9
        const tStart = print.pieces[0].t1 - print.rowH * 0.85 + i * pxLen
        for (let q = 0; q < cp.knots.length; q++) {
          const a = cp.knots[q].a
          for (let j = 0; j < 3; j++) {
            ab[(cp.v0 + q * 3 + j) * 2] = lenW / wC
            aTa[cp.v0 + q * 3 + j] = i === 0 ? tStart + a * pxLen : tStart + (1 - a) * pxLen
          }
        }
        attrs.aB.needsUpdate = true
        attrs.aT.needsUpdate = true
        writePiece(cp, (a, oo) => {
          const sArc = (1 - a) * lenW // from the cut end
          const hx = Math.cos(h0)
          const hz = Math.sin(h0)
          let x
          let z
          if (Math.abs(kc) < 1e-5) {
            x = cut[0] + hx * sArc
            z = cut[2] + hz * sArc
          } else {
            x = cut[0] + (Math.sin(h0 + kc * sArc) - Math.sin(h0)) / kc
            z = cut[2] - (Math.cos(h0 + kc * sArc) - Math.cos(h0)) / kc
          }
          oo[0] = x
          oo[1] = LIFT + drop + wC * (0.03 + 0.2 * (1 - a) ** 3)
          oo[2] = z
          oo[3] = 0
          oo[4] = 1
          oo[5] = 0
          return wC
        }, fx)
      })
      // bar: drops onto the page
      const kb = ease(range(st.footK, 0.5, 0.95))
      const grow = ease(range(st.footK, 0.45, 0.62))
      const c = toWorld(512, 512)
      barPose = { x: c[0], y: (1 - kb) * 7 + 0.04 * 160 * s, z: c[2], len: 600 * s * grow, thick: 160 * s, depth: 30 * s * grow + 0.001, flat: true, rot: (1 - kb) * 0.6 }
      out.markOn = st.footK > 0.9
    } else curls.forEach(hidePiece)

    // --- bar in stage 2: a vermilion proofreader's stroke riding along the standing tape ---
    if (!barPose && T > 1.98 && T < 3.12) {
      const tb = Math.min(tBar, barFrom)
      const gb = gOfT(tb)
      readPose(gb, o, false)
      // it rides above the tape and presses onto the line only over the noise
      let pressing = 0
      const m = print.rowH * 0.4
      for (const n of noises) pressing = Math.max(pressing, sstep((tb - n.t0 + m) / m) * (1 - sstep((tb - n.t1) / m)))
      const enter = ease(range(T, 1.98, 2.07))
      const leave = ease(range(T, 2.95, 3.1))
      const gap = lerp(0.5, 0.06, pressing)
      const hover = W + LIFT + 0.7
      const press = W / 2 + LIFT - W * 0.025
      barPose = {
        x: o[0] + o[3] * gap + (1 - enter) * 26 - leave * 18,
        y: lerp(hover, press, pressing) + (1 - enter) * 14 + leave * 22,
        z: o[2] + o[5] * gap,
        len: 2.7,
        thick: 2.7 * (160 / 600),
        depth: 0.36,
        flat: false,
        ny: Math.atan2(o[3], o[5]),
      }
    }
    if (barPose) {
      bar.visible = true
      bar.castShadow = !!barPose.flat
      bar.position.set(barPose.x, barPose.y, barPose.z)
      if (barPose.flat) {
        bar.rotation.set(-Math.PI / 2, 0, barPose.rot || 0)
        bar.scale.set(barPose.len, barPose.len, barPose.depth / 0.1)
      } else {
        bar.rotation.set(0, barPose.ny || 0, 0)
        bar.scale.set(barPose.len, barPose.len, barPose.depth / 0.1)
      }
    } else bar.visible = false

    // --- flakes: the snipped noise wears into flakes that settle in front of the tape ---
    const flakeFade = 1 - ease(range(T, 4.0, 4.25))
    let fi = 0
    for (const f of flakeInfo) {
      const sk = S.snip.get(f.n) || 0
      const kf = clamp01((sk - f.d * 0.55) / 0.45)
      if (kf <= 0 || flakeFade <= 0 || swapped) {
        _m.makeScale(0, 0, 0)
        flakes.setMatrixAt(fi++, _m)
        continue
      }
      const pre = fullBefore.get(f.n)
      readPose(pre + f.a * f.n.len, o, false)
      const sx0 = o[0]
      const sy0 = o[1] + (f.v - 0.5) * W
      const sz0 = o[2] + 0.1
      const ex = sx0 + (hash(f.s * 5.3) - 0.5) * 2.2
      const ez = o[2] + 1.0 + hash(f.s * 2.9) * 2.6
      const ey = 0.012 + hash(f.s * 8.1) * 0.03
      const fall = kf * kf
      _v.set(lerp(sx0, ex, kf), lerp(sy0, ey, fall) + Math.sin(kf * Math.PI) * 0.35, lerp(sz0, ez, kf))
      const spin = (1 - kf) * 6
      _e.set(lerp(hash(f.s) * 3, -Math.PI / 2, kf) + spin, hash(f.s * 3.3) * 6 + spin * 0.7, lerp(hash(f.s * 4.4) * 3, 0, kf))
      _q.setFromEuler(_e)
      const sc = (0.6 + hash(f.s * 6.6) * 0.9) * flakeFade
      _sc.set(sc, sc, sc)
      _m.compose(_v, _q, _sc)
      flakes.setMatrixAt(fi++, _m)
    }
    flakes.instanceMatrix.needsUpdate = true

    attrs.position.needsUpdate = true
    attrs.normal.needsUpdate = true
    attrs.aFx.needsUpdate = true

    // --- camera ---
    let c
    if (T < 1) c = mixCam(camPreset('hero', T, camA), camPreset('read', 1, camB), ease(range(T, 0.08, 1.0)), cam)
    else if (T < 2.0) c = camPreset('read', T, cam)
    else if (T < 2.06) {
      camPreset('read', 2, camA)
      camPreset('strike', 2.06, camB)
      c = mixCam(camA, camB, ease(range(T, 2.0, 2.06)), cam)
    } else if (T < 2.95) c = camPreset('strike', T, cam)
    else if (T < 3.0) c = camPreset('strike', 2.95, cam)
    else if (T < 4.0) c = mixCam(camPreset('strike', 2.95, camA), camPreset('ask', T, camB), ease(range(T, 3.0, 3.22)), cam)
    else c = mixCam(camPreset('ask', 4, camA), camPreset('top', T, camB), ease(range(T, 4.0, 4.3)), cam)
    if (st.footK > 0.001 || (st.tryK > 0.001 && T >= 4.9)) c = camPreset('top', T, cam)
    applyCamera(c, T < 0.6 && !phone ? st.pointer : null)

    // depth of field band while reading
    uniforms.uFocus.value = reduced ? 0 : ease(range(T, 0.7, 1.05)) * (1 - ease(range(T, 2.95, 3.1)))

    // --- callouts (stage 1 facts, stage 2 check tag) ---
    if (T > 0.98 && T < 2.04) {
      const band = phone ? 0.36 : 0.24
      let best = null
      print.factT.forEach((ft, i) => {
        if (ft === null) return
        const gg = gOfT(ft)
        readPose(gg, o, false)
        const [sx, sy, sz] = project(o[0], o[1] + W / 2 + 0.05, o[2])
        if (sz > 1) return
        const d = Math.abs(sx / L.vw - 0.5)
        const on = d < band ? 1 - sstep((d - band * 0.6) / (band * 0.4)) : 0
        const item = { i, x: sx, y: sy, on, d }
        if (!best || d < best.d) best = item
        out.callouts.push(item)
      })
      if (phone) out.callouts = best ? [best] : []
    }
    if (checkPiece && T > 2.0 && T < 3.02 && checkK > 0.6) {
      const gg = checkPiece.g0 + checkPiece.eff * 0.5
      readPose(gg, o, false)
      const [sx, sy] = project(o[0], o[1] - W / 2 - 0.05, o[2])
      out.check = { x: sx, y: sy, on: clamp01((checkK - 0.6) / 0.2) * (1 - ease(range(T, 2.96, 3.02))) }
    }
    out.camera = c
    needs = true
    return out
  }

  function render() {
    renderer.render(scene, camera)
  }

  function setDpr(v) {
    dprCap = v
    renderer.setPixelRatio(Math.min(devicePixelRatio, dprCap))
    renderer.setSize(L.vw, L.vh, false)
    uniforms.uRes.value.set(L.vw * renderer.getPixelRatio(), L.vh * renderer.getPixelRatio())
  }

  async function warm() {
    if (renderer.compileAsync) await renderer.compileAsync(scene, camera)
  }

  function dispose() {
    geo?.dispose()
    tapeMat.dispose()
    depthMat.dispose()
    for (const t of [texA, texB, texPatch, texLive, grain]) t.dispose()
    barGeo.dispose()
    flakeGeo.dispose()
    flakeMat.dispose()
    renderer.dispose()
  }

  return {
    layout, frame, render, setDpr, warm, dispose, renderer,
    get needs() { return needs },
    words: plainWords(copy.monologue),
  }
}

function plainWords(src) {
  return src.replace(/~~|\?\?/g, '').split(/\s+/).filter((w) => /[\p{L}\d]/u.test(w)).length
}
