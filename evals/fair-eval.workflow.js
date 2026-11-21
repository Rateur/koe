export const meta = {
  name: 'koe-fair-eval',
  description: 'Fair blind eval on 12 short voice notes x 3 runs: raw note (allowed to ask) vs Koe v2 vs Koe v3, with a stand-in speaker, a blind judge and a prompt audit',
  phases: [
    { title: 'Talk', detail: 'each arm may ask once; a stand-in answers from the hidden intent; Koe prompts are answered by a fresh Claude' },
    { title: 'Judge', detail: 'blind three-way judge, plus an audit of the v2 and v3 prompts' },
  ],
}

const NOTES = args
// Each version under test is a folder holding SKILL.md and references/examples.md; args is evals/voice-notes.json.
const DIR = 'evals/versions'
const RUNS = [1, 2, 3]
const items = RUNS.flatMap((run) => NOTES.map((note) => ({ note, run })))

const TURN = {
  type: 'object',
  properties: {
    kind: { type: 'string', enum: ['questions', 'final'], description: 'questions: the reply mainly asks the user something before delivering; final: it delivers' },
    reply: { type: 'string', description: 'The full reply, exactly as it would be sent' },
  },
  required: ['kind', 'reply'],
}

const KOE_TURN = {
  type: 'object',
  properties: {
    kind: { type: 'string', enum: ['questions', 'prompt', 'other'] },
    reply: { type: 'string', description: 'The full reply Claude would send, exactly' },
    prompt_xml: { type: 'string', description: 'If the reply contains the prompt, the content of its xml code block without the fence; else empty' },
  },
  required: ['kind', 'reply', 'prompt_xml'],
}

const plain = `You are Claude in a claude.ai chat. The user's message below may have been dictated by voice. Reply exactly as you would in claude.ai: if you would ask questions before helping, ask them; otherwise deliver the full answer. Use no tools.`
const koe = (v) => `You are Claude in a claude.ai chat. The user has the "koe" Agent Skill installed and their message triggers it. Load it the way Claude does: read ${DIR}/${v}/SKILL.md, and ${DIR}/${v}/references/examples.md because the skill points to it. Follow the skill exactly. Use no tools other than reading those two files, and don't carry out the task the note asks for. Set kind to "questions" if you ask before writing the prompt, "prompt" if the reply contains it.`

const standIn = (note, assistantReply) => `You are the person who dictated this voice note. Your hidden intent: ${note.intent}\n\nYour voice note was:\n${note.transcript}\n\nThe assistant replied:\n${assistantReply}\n\nAnswer its questions out loud, briefly and naturally, as dictated text in ${note.lang === 'fr' ? 'French' : 'English'}. Only use what is in your intent; if it doesn't cover a question, say you don't mind or don't know. Return only your answer.`

// One exchange, with at most one round of questions answered by the stand-in.
async function talk(system, message, note, label, schema, isQuestions) {
  const first = await agent(`${system}\n\n<message>\n${message}\n</message>`, { label, phase: 'Talk', schema })
  if (!first || !isQuestions(first)) return { first, answers: null, final: first }
  const answers = await agent(standIn(note, first.reply), { label: `${label}:speaker`, phase: 'Talk' })
  const final = await agent(`${system}\n\nThe conversation so far:\n<user>\n${message}\n</user>\n<assistant>\n${first.reply}\n</assistant>\n<user>\n${answers}\n</user>\n\nWrite Claude's next reply. This is the last exchange: deliver now, without asking more questions.`, { label: `${label}:2`, phase: 'Talk', schema })
  return { first, answers, final }
}

async function koeArm(v, note, tag) {
  const conv = await talk(koe(v), note.transcript, note, `${tag}:${v}`, KOE_TURN, (t) => t.kind === 'questions')
  const prompt = conv.final?.prompt_xml?.trim()
  if (!prompt) return { conv, prompt: null, answer: null }
  const answer = await talk(plain, prompt, note, `${tag}:${v}:answer`, TURN, (t) => t.kind === 'questions')
  return { conv, prompt, answer }
}

const OUTCOME = {
  type: 'object',
  properties: {
    score_A: { type: 'integer', minimum: 1, maximum: 10 },
    score_B: { type: 'integer', minimum: 1, maximum: 10 },
    score_C: { type: 'integer', minimum: 1, maximum: 10 },
    best: { type: 'string', enum: ['A', 'B', 'C', 'tie'] },
    why: { type: 'string', description: 'Which intent details each reply honoured or missed, corrected values, misheard words, invented content' },
  },
  required: ['score_A', 'score_B', 'score_C', 'best', 'why'],
}

const AUDIT_ONE = {
  type: 'object',
  properties: {
    details_kept: { type: 'integer', minimum: 0, maximum: 10 },
    lost_details: { type: 'array', items: { type: 'string' } },
    invented: { type: 'array', items: { type: 'string' }, description: 'Facts, requirements or examples the speaker never gave and the skill does not allow' },
    correction_handled: { type: 'boolean' },
    questions_asked: { type: 'integer', minimum: 0 },
    generic_questions: { type: 'integer', minimum: 0, description: 'Questions that do not quote or target this note specifically' },
    project_mode: { type: 'boolean', description: 'The prompt has <parts> or <done_when>' },
    challenge_ran: { type: 'boolean', description: 'The prompt puts the idea on trial (strongest version, rival, what breaks it)' },
    rule_breaks: { type: 'array', items: { type: 'string' } },
  },
  required: ['details_kept', 'lost_details', 'invented', 'correction_handled', 'questions_asked', 'generic_questions', 'project_mode', 'challenge_ran', 'rule_breaks'],
}
const AUDIT = { type: 'object', properties: { v2: AUDIT_ONE, v3: AUDIT_ONE }, required: ['v2', 'v3'] }

const qa = (talked) => (talked?.answers ? `\n(Before this reply, the assistant asked:\n${talked.first.reply}\nand the speaker answered:\n${talked.answers})` : '')
const ORDERS = [['raw', 'v2', 'v3'], ['v2', 'v3', 'raw'], ['v3', 'raw', 'v2'], ['raw', 'v3', 'v2'], ['v3', 'v2', 'raw'], ['v2', 'raw', 'v3']]

const results = await pipeline(
  items,
  async ({ note, run }) => {
    const tag = `${note.id}#${run}`
    const [raw, v2, v3] = await parallel([
      () => talk(plain, note.transcript, note, `${tag}:raw`, TURN, (t) => t.kind === 'questions'),
      () => koeArm('v2', note, tag),
      () => koeArm('v3', note, tag),
    ])
    return { raw, v2, v3 }
  },
  async (out, { note, run }, i) => {
    const tag = `${note.id}#${run}`
    const replies = {
      raw: out.raw?.final?.reply ? { text: out.raw.final.reply, ctx: qa(out.raw) } : null,
      v2: out.v2?.answer?.final?.reply ? { text: out.v2.answer.final.reply, ctx: qa(out.v2.conv) + qa(out.v2.answer) } : null,
      v3: out.v3?.answer?.final?.reply ? { text: out.v3.answer.final.reply, ctx: qa(out.v3.conv) + qa(out.v3.answer) } : null,
    }
    if (!replies.raw || !replies.v2 || !replies.v3) return { id: note.id, run, failed: true }
    const order = ORDERS[i % ORDERS.length]
    const letters = ['A', 'B', 'C']
    const shown = order.map((arm, k) => `<reply_${letters[k]}>${replies[arm].ctx}\n${replies[arm].text}\n</reply_${letters[k]}>`).join('\n\n')
    const [outcome, audit] = await parallel([
      () => agent(`You judge three assistant replies to the same dictated request, blind. The speaker's hidden intent: ${note.intent}\n\nThe voice note:\n${note.transcript}\n\nSome replies came after the assistant asked clarifying questions; the speaker's answers are shown with them and count as part of what the speaker wanted.\n\n${shown}\n\nScore each reply 1-10 on how well it serves what the speaker actually wanted: details honoured, corrected values used, misheard words understood, nothing invented, useful and ready to use. A bracketed placeholder such as [Paste the email here] or [your name] is for the speaker to fill in; it is not a flaw. Pick the best reply or a tie. Be strict and specific.`, { label: `${tag}:judge`, phase: 'Judge', schema: OUTCOME }),
      () => agent(`Audit two prompts that two versions of the Koe skill made from the same dictated voice note. Read the rules of each version first: v2 is ${DIR}/v2/SKILL.md, v3 is ${DIR}/v3/SKILL.md. The speaker's hidden intent, for your reference: ${note.intent}\n\nThe voice note:\n${note.transcript}\n\n<v2>\nWhat it asked first, if anything: ${out.v2.conv.answers ? out.v2.conv.first.reply : '(nothing)'}\nThe speaker's answers: ${out.v2.conv.answers || '(none)'}\nIts full final reply:\n${out.v2.conv.final.reply}\n</v2>\n\n<v3>\nWhat it asked first, if anything: ${out.v3.conv.answers ? out.v3.conv.first.reply : '(nothing)'}\nThe speaker's answers: ${out.v3.conv.answers || '(none)'}\nIts full final reply:\n${out.v3.conv.final.reply}\n</v3>\n\nFor each, check detail retention, invented content (a sentence its own skill explicitly allows is not an invention), the self-correction, the questions it asked, and every rule of its skill.`, { label: `${tag}:audit`, phase: 'Judge', schema: AUDIT }),
    ])
    if (!outcome || !audit) return { id: note.id, run, failed: true }
    const score = {}
    order.forEach((arm, k) => { score[arm] = outcome[`score_${letters[k]}`] })
    const best = outcome.best === 'tie' ? 'tie' : order[letters.indexOf(outcome.best)]
    return {
      id: note.id, run, lang: note.lang, kind: note.kind, score, best, why: outcome.why,
      asked: { raw: Boolean(out.raw.answers), v2: Boolean(out.v2.conv.answers), v3: Boolean(out.v3.conv.answers) },
      audit,
      prompts: { v2: out.v2.prompt, v3: out.v3.prompt },
      koe_replies: { v2: out.v2.conv.final.reply, v3: out.v3.conv.final.reply },
      first_turns: { raw: out.raw.first?.reply, v2: out.v2.conv.first?.reply, v3: out.v3.conv.first?.reply },
    }
  },
)

const done = results.filter((x) => x && !x.failed)
const failed = results.length - done.length
const arms = ['raw', 'v2', 'v3']
const stats = (xs) => {
  const n = xs.length
  if (!n) return null
  const mean = xs.reduce((a, b) => a + b, 0) / n
  const sd = Math.sqrt(xs.reduce((a, b) => a + (b - mean) ** 2, 0) / Math.max(1, n - 1))
  return { n, mean: +mean.toFixed(2), ci95: +(1.96 * sd / Math.sqrt(n)).toFixed(2) }
}
const pair = (rows, a, b) => ({ [`${a}_wins`]: rows.filter((x) => x.score[a] > x.score[b]).length, [`${b}_wins`]: rows.filter((x) => x.score[b] > x.score[a]).length, ties: rows.filter((x) => x.score[a] === x.score[b]).length })
const block = (rows) => ({
  items: rows.length,
  scores: Object.fromEntries(arms.map((a) => [a, stats(rows.map((x) => x.score[a]))])),
  v3_vs_raw: pair(rows, 'v3', 'raw'),
  v2_vs_raw: pair(rows, 'v2', 'raw'),
  v3_vs_v2: pair(rows, 'v3', 'v2'),
  best: Object.fromEntries([...arms, 'tie'].map((a) => [a, rows.filter((x) => x.best === a).length])),
})
const summary = {
  items: done.length,
  failed,
  all: block(done),
  where_v3_asked: block(done.filter((x) => x.asked.v3)),
  where_v3_did_not_ask: block(done.filter((x) => !x.asked.v3)),
  asked_rate: Object.fromEntries(arms.map((a) => [a, done.filter((x) => x.asked[a]).length])),
  audit: Object.fromEntries(['v2', 'v3'].map((v) => [v, {
    details_kept: stats(done.map((x) => x.audit[v].details_kept)),
    invented_lines: done.reduce((n, x) => n + x.audit[v].invented.length, 0),
    corrections_ok: done.filter((x) => x.audit[v].correction_handled).length,
    generic_questions: done.reduce((n, x) => n + x.audit[v].generic_questions, 0),
    project_mode: done.filter((x) => x.audit[v].project_mode).map((x) => `${x.id}#${x.run}`),
    challenge_ran: done.filter((x) => x.audit[v].challenge_ran).map((x) => `${x.id}#${x.run}`),
    rule_breaks: done.reduce((n, x) => n + x.audit[v].rule_breaks.length, 0),
  }])),
  per_note: NOTES.map((n) => {
    const rows = done.filter((x) => x.id === n.id)
    return { id: n.id, raw: rows.map((x) => x.score.raw), v2: rows.map((x) => x.score.v2), v3: rows.map((x) => x.score.v3), v3_asked: rows.map((x) => x.asked.v3), raw_asked: rows.map((x) => x.asked.raw) }
  }),
}
log(`raw ${summary.all.scores.raw?.mean} / v2 ${summary.all.scores.v2?.mean} / v3 ${summary.all.scores.v3?.mean} over ${done.length} items (${failed} failed)`)
return { summary, results: done }
