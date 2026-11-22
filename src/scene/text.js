// Everything printed on the tape: the canvas fonts, the parsed monologue, and the texture atlases.
// Canvas 2D cannot set variable axes, so the tape prints with two static Recursive instances,
// Casual and Linear Mono, that scripts/subset-font.py cuts next to the page's font.

const nextPow2 = (n) => 2 ** Math.ceil(Math.log2(Math.max(1, n)))

export async function loadCanvasFonts() {
  const faces = [
    ['KoeCasual', 'recursive-casual.woff2'],
    ['KoeMono', 'recursive-mono.woff2'],
  ]
  await Promise.all(
    faces.map(async ([family, file]) => {
      const face = new FontFace(family, `url(/fonts/${file})`)
      await face.load()
      document.fonts.add(face)
    }),
  )
}

// ~~x~~ is noise, ??x?? a word to check. Each noise span takes one neighbouring space with it,
// so the tape closes up on a single space once it is cut out.
export function parseMonologue(src) {
  const spans = []
  const re = /~~(.+?)~~|\?\?(.+?)\?\?/g
  let last = 0
  let m
  while ((m = re.exec(src))) {
    if (m.index > last) spans.push({ text: src.slice(last, m.index), kind: 'keep' })
    spans.push({ text: m[1] ?? m[2], kind: m[1] ? 'noise' : 'check' })
    last = re.lastIndex
  }
  if (last < src.length) spans.push({ text: src.slice(last), kind: 'keep' })
  for (let i = 0; i < spans.length; i++) {
    const s = spans[i]
    if (s.kind !== 'noise') continue
    const next = spans[i + 1]
    const prev = spans[i - 1]
    if (next && next.text.startsWith(' ')) {
      s.text += ' '
      next.text = next.text.slice(1)
    } else if (prev && prev.text.endsWith(' ')) {
      s.text = ' ' + s.text
      prev.text = prev.text.slice(0, -1)
    }
  }
  return spans.filter((s) => s.text.length)
}

export function plainMonologue(src) {
  return src.replace(/~~(.+?)~~/g, '$1').replace(/\?\?(.+?)\?\?/g, '$1')
}

// Atlas A: the whole printed tape as one long line, cut into rows. Channel R is ink, G is graphite.
// t is the distance along that long line in atlas pixels; the shader turns t into a row and a column.
export function buildPrint({ spans, facts, answer, questions, phone }) {
  const rowH = phone ? 64 : 128
  const atlasW = phone ? 2048 : 4096
  const pad = phone ? 16 : 32
  const rowLen = atlasW - pad * 2
  const size = rowH * 0.4
  const casual = `${size}px KoeCasual`
  const mono = `${(size * 0.86).toFixed(1)}px KoeMono`
  const meas = document.createElement('canvas').getContext('2d')
  const width = (text, font) => {
    meas.font = font
    return meas.measureText(text).width
  }

  const runs = []
  const pieces = []
  const lead = rowH * 1.4
  let t = lead
  pieces.push({ kind: 'lead', t0: 0, t1: lead, text: '' })
  let raw = ''
  const spanAt = []
  for (const s of spans) {
    const w = width(s.text, casual)
    runs.push({ t, text: s.text, font: casual, ch: 'ink' })
    pieces.push({ kind: s.kind, t0: t, t1: t + w, text: s.text })
    spanAt.push({ from: raw.length, t, text: s.text })
    raw += s.text
    t += w
  }
  const textEnd = t
  pieces.push({ kind: 'tail', t0: t, t1: t + rowH * 0.6, text: '' })
  t += rowH * 2

  // Where each numbered fact sits on the tape (the middle of its words).
  const factT = facts.map(([find]) => {
    const i = raw.indexOf(find)
    if (i < 0) return null
    const s = spanAt.findLast((sp) => sp.from <= i)
    const start = s.t + width(s.text.slice(0, i - s.from), casual)
    return start + width(find, casual) / 2
  })

  const answerW = width(answer, casual)
  const ansPiece = { kind: 'answer', t0: t, t1: t + answerW + rowH * 0.9, text: answer }
  runs.push({ t: t + rowH * 0.45, text: answer, font: casual, ch: 'ink' })
  t = ansPiece.t1 + rowH

  const tabs = questions.map((q, i) => {
    const label = `${i + 1}/3`
    const t0 = t
    const lw = width(label, mono)
    const gap = size * 0.9
    runs.push({ t: t0 + rowH * 0.4, text: label, font: mono, ch: 'gra' })
    runs.push({ t: t0 + rowH * 0.4 + lw + gap, text: q, font: mono, ch: 'ink' })
    const t1 = t0 + rowH * 0.8 + lw + gap + width(q, mono)
    t = t1 + rowH
    return { kind: 'tab', t0, t1, text: q }
  })

  const total = t
  const rows = Math.ceil(total / rowLen)
  const atlasH = nextPow2(rows * rowH)
  const canvas = document.createElement('canvas')
  canvas.width = atlasW
  canvas.height = atlasH
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, atlasW, atlasH)
  ctx.textBaseline = 'alphabetic'
  const base = rowH * 0.635
  for (let r = 0; r < rows; r++) {
    const from = r * rowLen - pad
    const to = (r + 1) * rowLen + pad
    ctx.save()
    ctx.beginPath()
    ctx.rect(0, r * rowH, atlasW, rowH)
    ctx.clip()
    for (const run of runs) {
      const w = width(run.text, run.font)
      if (run.t > to || run.t + w < from) continue
      ctx.font = run.font
      ctx.fillStyle = run.ch === 'ink' ? '#ff0000' : '#00ff00'
      ctx.fillText(run.text, run.t - r * rowLen + pad, r * rowH + base)
    }
    ctx.restore()
  }

  return {
    canvas, rowH, atlasW, atlasH, pad, rowLen, size, casual, mono, base,
    pieces, ansPiece, tabs, factT, textEnd, total, width,
  }
}

// The misheard name, drawn on its own small texture so it can scramble and settle:
// R is ink, B is the vermilion wavy underline. step 0 is the dictated words, the last step the fix.
export function makePatch(print, heard, fixed) {
  const { rowH, casual, base, width } = print
  const w0 = width(heard, casual)
  const canvas = document.createElement('canvas')
  canvas.width = nextPow2(w0 + rowH)
  canvas.height = rowH
  const ctx = canvas.getContext('2d')
  const letters = 'abcdefghijklmnopqrstuvwxyzéUSIVRY'
  const hash = (n) => {
    const x = Math.sin(n * 127.1 + 311.7) * 43758.5453
    return x - Math.floor(x)
  }
  const wFixed = width(fixed, casual)
  // k: 0..1 through the correction. Returns the drawn width so the tape can close up on it.
  function draw(k, underline) {
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.font = casual
    ctx.textBaseline = 'alphabetic'
    let text
    if (k <= 0.05) text = heard
    else if (k >= 0.9) text = fixed
    else {
      const p = (k - 0.05) / 0.85
      const len = Math.round(heard.length + (fixed.length - heard.length) * p)
      const step = Math.floor(p * 14)
      text = ''
      for (let i = 0; i < len; i++) {
        const settled = i / len < p * 1.15 - 0.15
        const src = settled ? fixed[i] ?? ' ' : heard[i] ?? ' '
        text += !settled && hash(i * 31 + step) < 0.55 && src !== ' ' ? letters[Math.floor(hash(i + step * 7) * letters.length)] : src
      }
    }
    ctx.fillStyle = '#ff0000'
    ctx.fillText(text, 0, base)
    const drawn = width(text, casual)
    if (underline > 0) {
      ctx.strokeStyle = '#0000ff'
      ctx.lineWidth = rowH * 0.03
      ctx.beginPath()
      const y = base + rowH * 0.1
      const end = drawn * underline
      const wave = rowH * 0.11
      for (let x = 0; x <= end; x += 2) {
        const yy = y + Math.sin((x / wave) * Math.PI) * rowH * 0.022
        if (x === 0) ctx.moveTo(x, yy)
        else ctx.lineTo(x, yy)
      }
      ctx.stroke()
    }
    return drawn
  }
  return { canvas, draw, w0, wFixed }
}

// Atlas B: the prompt, one wrapped line per row, in Linear Mono. R ink, G graphite for the tags.
export function buildLines(lines, phone, ratio) {
  const rowH = phone ? 48 : 64
  const size = rowH * ratio
  const charW = size * 0.6
  const maxChars = Math.max(...lines.map((l) => l.text.length), 10)
  const atlasW = nextPow2((maxChars + 2) * charW)
  const atlasH = nextPow2(lines.length * rowH)
  const canvas = document.createElement('canvas')
  canvas.width = atlasW
  canvas.height = atlasH
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, atlasW, atlasH)
  ctx.font = `${size}px KoeMono`
  ctx.textBaseline = 'middle'
  lines.forEach((line, i) => {
    let x = charW * 0.5
    const y = i * rowH + rowH * 0.53
    ctx.lineWidth = size * 0.045
    for (const seg of line.segs) {
      ctx.fillStyle = ctx.strokeStyle = seg.tag ? '#00ff00' : '#ff0000'
      ctx.fillText(seg.text, x, y)
      ctx.strokeText(seg.text, x, y)
      x += seg.text.length * charW
    }
  })
  return { canvas, rowH, atlasW, atlasH, charW, lenPx: lines.map((l) => (l.text.length + 1) * charW) }
}

// The visitor's own words on the blank strip above the try box.
export function makeLive(phone) {
  const rowH = phone ? 64 : 128
  const canvas = document.createElement('canvas')
  canvas.width = phone ? 1024 : 2048
  canvas.height = rowH
  const ctx = canvas.getContext('2d')
  const size = rowH * 0.4
  function draw(text, lenPx) {
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.font = `${size}px KoeCasual`
    ctx.textBaseline = 'alphabetic'
    ctx.fillStyle = '#ff0000'
    const room = Math.min(canvas.width, lenPx) - size * 1.2
    let shown = text.replace(/\s+/g, ' ').trim()
    while (shown.length && ctx.measureText(shown).width > room) shown = shown.slice(1)
    if (shown.length < text.trim().length) shown = '…' + shown.slice(1)
    ctx.fillText(shown, size * 0.6, rowH * 0.635)
  }
  return { canvas, draw, rowH }
}
