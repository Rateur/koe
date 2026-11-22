// The site's words in French and English. index.html gets the French at build time (see vite.config.ts).
// Keys ending in Html hold our own markup, never user input. In the monologue, ~~x~~ is struck out and ??x?? is a word to check.
// {name} is filled in: with the blind test's figures and the example's length (page.ts), or by main.ts as the story plays.

const fr = {
  title: 'Koe · ta note vocale devient un prompt pour Claude',
  description: 'Un skill gratuit pour Claude. Raconte ton projet en vrac : Koe le range et te demande ce qui manque avant d’écrire le prompt.',
  homeLabel: 'Koe, accueil',
  navInstall: 'Installer',
  switchLang: 'English',
  switchLangLabel: 'Read this page in English',

  heroSpeech: 'Raconte ton projet en vrac.',
  heroFrame: 'Claude reçoit un prompt cadré.',
  heroLede: 'Koe est un skill gratuit pour Claude. Il range ta note vocale et te demande ce qui manque avant d’écrire.',
  heroInstall: 'Installer Koe',
  heroTry: 'Essayer sans installer',
  noteWords: 'note vocale · {words} mots',

  storyLabel: 'Ce que Koe fait de ta note',
  step1Title: 'D’abord, tu parles.',
  step1Line: 'Aussi longtemps que tu veux.',
  step2Title: 'Ensuite, Koe raye le bruit.',
  step2Line: 'Quand tu te corriges, la correction gagne.',
  step3Title: 'Puis il demande ce qui manque.',
  step3Line: 'Trois questions au plus. Tu réponds à voix haute.',
  step4Title: 'Enfin, Claude reçoit le cadre.',
  step4Line: 'Chaque ligne vient de ta note ou de tes réponses.',
  stepCount: 'étape {n}/4',
  struckCount: 'rayés : {n}',
  you: 'toi',
  toCheck: 'à vérifier : US Ivry',
  fixed: 'US Ivry',
  monologue: '~~bon alors en gros~~ mon projet c’est une appli pour le club de foot de mon fils, ~~euh~~ les U11 de ??l’usine ivre??, parce que chaque samedi c’est le bazar pour savoir qui emmène qui au match. Là tout passe par un groupe WhatsApp de quarante parents et les infos se perdent. Je voudrais que chaque parent dise combien de places il a dans sa voiture, et que l’appli répartisse les gamins. ~~Ah et~~ le coach doit pouvoir mettre la convocation, l’heure et l’adresse du stade. Je pensais la faire en ~~Flutter, non pardon,~~ appli web, parce que les parents n’installeront rien. Budget zéro, je fais ça le soir, et faut que ce soit prêt pour la reprise en septembre. Je sais pas trop par où commencer ~~en fait~~.',
  questionsHtml: '<ol><li>Tu veux d’abord le plan du projet, ou directement le code ?</li><li>Les parents arrivent comment dans l’appli : un lien sur WhatsApp suffit, ou il faut des comptes ?</li><li>Tu codes déjà ? Si oui, en quoi ?</li></ol>',
  answer: 'Le plan d’abord. Un lien suffit. Un peu de JavaScript.',

  promptTitle: 'Le prompt que Claude reçoit',
  copyPrompt: 'Copier le prompt',
  copiedPrompt: 'Copié. Colle-le où tu veux.',
  prompt: `<context>
Je développe seul, le soir et sans budget, une application web pour l’équipe U11 du club de foot de mon fils, l’US Ivry [entendu : « l’usine ivre »]. Chaque samedi, savoir qui emmène qui au match est compliqué : tout passe par un groupe WhatsApp de quarante parents, et les infos se perdent. Je connais un peu JavaScript.
</context>

<task>
Aide-moi à planifier ce projet avant d’écrire du code.
</task>

<requirements>
- Chaque parent indique combien de places il a dans sa voiture, et l’application répartit les enfants.
- Le coach publie la convocation : l’heure et l’adresse du stade.
- Une application web plutôt que mobile, parce que les parents n’installeront rien.
- Les parents y entrent par un lien partagé sur WhatsApp, sans créer de compte.
- Tout doit être prêt pour la reprise en septembre.
</requirements>

<output_format>
Un plan par étapes jusqu’à septembre. Après le plan, ajoute ce à quoi je n’ai pas pensé.
</output_format>`,
  launch: 'Je le lance ici, ou tu le copies dans une nouvelle conversation ou une autre IA ?',

  tryTitle: 'Essaie sans installer',
  hint: 'Sur ordi : Win + H, ou deux fois Fn sur Mac.',
  noteLabel: 'Touche le micro de ton clavier et parle.',
  notePlaceholder: 'Bon alors, mon projet…',
  openClaude: 'Ouvrir dans Claude',
  copyOther: 'Copier pour une autre IA',
  useSample: 'Mettre un exemple',
  sample: 'bon alors mon projet c’est une appli pour le club de foot de mon fils, les U11, parce que chaque samedi c’est le bazar pour savoir qui emmène qui au match. Je voudrais que chaque parent dise combien de places il a dans sa voiture et que l’appli répartisse les gamins. Budget zéro, et faut que ce soit prêt pour septembre.',
  tryNote: 'Claude s’ouvre avec ta note et les consignes de Koe.',
  copiedOpen: 'Copié. Si ta note n’apparaît pas dans Claude, colle-la.',
  copied: 'Copié. Colle-le dans l’IA de ton choix.',
  copyFailed: 'Ton navigateur bloque la copie. Autorise-la, puis réessaie.',
  empty: 'Dicte ta note d’abord.',

  proofTitle: 'Testé à l’aveugle',
  proofCap: 'Chaque case est un duel : {notes} notes écrites pour le test, {passes} passages chacune. Un Claude répond à la note brute, un autre au prompt de Koe v2, la version publiée. Un juge note les deux réponses sur 10 sans savoir laquelle vient de Koe. Chaque côté pouvait poser des questions d’abord.',
  duelsLabel: '{runs} duels à l’aveugle : {koe} pour Koe, {ties} égalités, {raw} pour la note brute. Koe a posé ses questions dans {koeAsked} duels et les a tous gagnés.',
  koeWinsHtml: '<b>{koe}</b> pour Koe',
  tiesHtml: '<b>{ties}</b> égalités',
  rawWinsHtml: '<b>{raw}</b> pour la note brute',
  koeAskedWon: 'Koe a posé ses questions : {koeAsked} sur {koeAsked} gagnés',
  meansTitle: 'Note moyenne sur 10, avec son intervalle à 95 %',
  meansLabel: 'Note moyenne sur 10 : note brute {rawMean}, à plus ou moins {rawCi} près. Koe v2 {koeMean}, à plus ou moins {koeCi} près.',
  rawName: 'Note brute',
  koeName: 'Koe v2',
  meansNote: 'Sur {runs} duels, cet écart n’est pas statistiquement solide (test du signe, p = {p}).',
  askedName: 'Questions posées d’abord, sur {runs} duels',
  askedValue: 'Koe {koeAsked}, note brute {rawAsked}',
  correctionsName: 'Corrections dites à voix haute, bien reprises',
  correctionsValue: '{corrections} sur {corrections}',
  detailsName: 'Détails de la note gardés, selon un second juge',
  detailsValue: '{details} sur 10',
  proofCheckHtml: 'Tu peux tout vérifier : <a href="https://github.com/Rateur/koe/tree/main/evals">la méthode et ses limites</a>.',
  proofRulesHtml: 'Koe suit les <a href="https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices">conseils de prompting publiés par Anthropic</a>.',

  installTitle: 'Installer Koe',
  tabPaid: 'Forfait payant',
  tabFree: 'Forfait gratuit',
  tabCode: 'Claude Code',
  paidStepsHtml: '<ol><li>Dans Claude, ouvre <strong>Personnaliser</strong>, puis <strong>Plugins</strong>.</li><li>Clique sur <strong>Ajouter</strong>, puis <strong>Ajouter une place de marché</strong>.</li><li>Colle <code>Rateur/koe</code>.</li><li>Dans <strong>Découvrir</strong>, ajoute Koe.</li></ol>',
  freeStepsHtml: '<ol><li>Télécharge koe.zip.</li><li>Active l’exécution de code dans <strong>Paramètres</strong>, <strong>Capacités</strong>.</li><li>Ouvre <strong>Personnaliser</strong>, <strong>Compétences</strong>, puis <strong>+</strong>.</li><li>Choisis <strong>Télécharger une compétence</strong>, puis koe.zip.</li></ol>',
  codeStepsHtml: '<ol><li>Dans Claude Code, colle la commande.</li><li>Pour dicter, lance <code>/voice</code>, puis commence par <code>/koe</code>.</li></ol>',
  download: 'Télécharger koe.zip',
  copy: 'Copier',
  copiedShort: 'Copié',
  afterInstallHtml: 'Ensuite, commence ta note par « Koe ». Pour Codex, Cursor et les autres agents : <code>npx skills add Rateur/koe</code>.',

  markTilde: 'tilde : en vrac',
  markBar: 'barre : cadré',
  footStatement: 'Koe range ce que tu dis. Claude fait le reste.',
  linksLabel: 'Liens',
  navSource: 'Code source',
  navReadme: 'Mode d’emploi',
  navLicense: 'Licence MIT',
  legalTitle: 'Mentions légales',
  legalText: 'Site édité à titre non professionnel. Hébergeur : GitHub, Inc., 88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, États-Unis.',
  contactLabel: 'Contact :',
  privacyTitle: 'Données',
  privacyText: 'Aucun cookie, aucune mesure d’audience. GitHub garde l’adresse IP des visiteurs dans ses journaux. Ta note ne quitte la page que si tu l’envoies à Claude ou la copies.',
  creditsTitle: 'Police',
  creditsHtml: 'Recursive, d’Arrow Type, sous <a href="https://openfontlicense.org">licence SIL OFL</a>.',
  footSmall: 'Koe n’est pas un produit d’Anthropic. Code sous licence MIT.',
}

type Words = typeof fr

const en: Words = {
  title: 'Koe · your voice note becomes a prompt for Claude',
  description: 'A free skill for Claude. Talk through your project however it comes out: Koe sorts it and asks what’s missing before it writes the prompt.',
  homeLabel: 'Koe, home',
  navInstall: 'Install',
  switchLang: 'Français',
  switchLangLabel: 'Lire cette page en français',

  heroSpeech: 'Talk through your whole project.',
  heroFrame: 'Claude gets a framed prompt.',
  heroLede: 'Koe is a free skill for Claude. It tidies your voice note and asks what’s missing before it writes.',
  heroInstall: 'Install Koe',
  heroTry: 'Try without installing',
  noteWords: 'voice note · {words} words',

  storyLabel: 'What Koe does with your note',
  step1Title: 'First, you talk.',
  step1Line: 'For as long as you like.',
  step2Title: 'Then Koe strikes the noise.',
  step2Line: 'When you correct yourself, the correction wins.',
  step3Title: 'Next it asks what’s missing.',
  step3Line: 'Three questions at most. You answer out loud.',
  step4Title: 'Last, Claude gets the frame.',
  step4Line: 'Every line comes from your note or your answers.',
  stepCount: 'stage {n}/4',
  struckCount: 'struck: {n}',
  you: 'you',
  toCheck: 'to check: US Ivry',
  fixed: 'US Ivry',
  monologue: '~~so basically~~ my project is an app for my son’s soccer club, ~~um~~ the under-11s at ??us ivory??, because every Saturday it’s chaos working out who drives who to the game. Right now it all goes through a WhatsApp group with forty parents and things get lost. I’d like each parent to say how many seats they have in their car, and the app splits up the kids. ~~Oh and~~ the coach has to be able to post the call-up, the time and the address of the field. I was thinking of building it in ~~Flutter, no sorry,~~ as a web app, because parents won’t install anything. Zero budget, I do this in the evenings, and it has to be ready for the new season in September. I don’t really know where to start ~~to be honest~~.',
  questionsHtml: '<ol><li>Do you want the project plan first, or straight to code?</li><li>How do parents get into the app: is a link in WhatsApp enough, or do they need accounts?</li><li>Do you already code? If so, in what?</li></ol>',
  answer: 'Plan first. A link is enough. A bit of JavaScript.',

  promptTitle: 'The prompt Claude gets',
  copyPrompt: 'Copy the prompt',
  copiedPrompt: 'Copied. Paste it anywhere.',
  prompt: `<context>
I’m building a web app on my own, in the evenings and with no budget, for the under-11 team at my son’s soccer club, US Ivry [heard: "us ivory"]. Every Saturday, working out who drives who to the game is hard: it all goes through a WhatsApp group of forty parents, and things get lost. I know a bit of JavaScript.
</context>

<task>
Help me plan this project before writing any code.
</task>

<requirements>
- Each parent says how many seats they have in their car, and the app splits up the kids.
- The coach posts the call-up: the time and the address of the field.
- A web app rather than a mobile app, because parents won’t install anything.
- Parents get in through a link shared on WhatsApp, without creating an account.
- Everything has to be ready for the new season in September.
</requirements>

<output_format>
A step-by-step plan up to September. After the plan, add what I haven’t thought of.
</output_format>`,
  launch: 'Shall I run it here, or will you copy it into a new chat or another AI?',

  tryTitle: 'Try it without installing',
  hint: 'On a computer: Win + H, or Fn twice on a Mac.',
  noteLabel: 'Tap your keyboard’s mic and talk.',
  notePlaceholder: 'So, my project…',
  openClaude: 'Open in Claude',
  copyOther: 'Copy for another AI',
  useSample: 'Use an example',
  sample: 'so my project is an app for my son’s soccer club, the under-11s, because every Saturday it’s chaos working out who drives who to the game. I’d like each parent to say how many seats they have in their car and the app splits up the kids. Zero budget, and it has to be ready for September.',
  tryNote: 'Claude opens with your note and Koe’s instructions.',
  copiedOpen: 'Copied. If your note isn’t in Claude, paste it.',
  copied: 'Copied. Paste it into any AI chat.',
  copyFailed: 'Your browser blocks copying. Allow it, then try again.',
  empty: 'Dictate your note first.',

  proofTitle: 'Tested blind',
  proofCap: 'Each cell is one run: {notes} notes written for the test, {passes} runs each. One Claude answers the raw note, another answers the prompt from Koe v2, the released version. A judge scores both answers out of 10 without knowing which one is Koe’s. Either side could ask questions first.',
  duelsLabel: '{runs} blind runs: {koe} for Koe, {ties} ties, {raw} for the raw note. Koe asked its questions in {koeAsked} runs and won all of them.',
  koeWinsHtml: '<b>{koe}</b> for Koe',
  tiesHtml: '<b>{ties}</b> ties',
  rawWinsHtml: '<b>{raw}</b> for the raw note',
  koeAskedWon: 'Koe asked its questions: won {koeAsked} of {koeAsked}',
  meansTitle: 'Average score out of 10, with its 95% interval',
  meansLabel: 'Average score out of 10: raw note {rawMean}, give or take {rawCi}. Koe v2 {koeMean}, give or take {koeCi}.',
  rawName: 'Raw note',
  koeName: 'Koe v2',
  meansNote: 'Over {runs} runs, this gap is not statistically solid (sign test, p = {p}).',
  askedName: 'Asked questions first, out of {runs} runs',
  askedValue: 'Koe {koeAsked}, raw note {rawAsked}',
  correctionsName: 'Corrections said out loud, kept',
  correctionsValue: '{corrections} of {corrections}',
  detailsName: 'Details of the note kept, per a second judge',
  detailsValue: '{details} of 10',
  proofCheckHtml: 'You can check all of it: <a href="https://github.com/Rateur/koe/tree/main/evals">the method and its limits</a>.',
  proofRulesHtml: 'Koe follows the <a href="https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices">prompting advice Anthropic publishes</a>.',

  installTitle: 'Install Koe',
  tabPaid: 'Paid plan',
  tabFree: 'Free plan',
  tabCode: 'Claude Code',
  paidStepsHtml: '<ol><li>In Claude, open <strong>Customize</strong>, then <strong>Plugins</strong>.</li><li>Click <strong>Add</strong>, then <strong>Add marketplace</strong>.</li><li>Paste <code>Rateur/koe</code>.</li><li>In <strong>Discover</strong>, add Koe.</li></ol>',
  freeStepsHtml: '<ol><li>Download koe.zip.</li><li>Turn on code execution in <strong>Settings</strong>, <strong>Capabilities</strong>.</li><li>Open <strong>Customize</strong>, <strong>Skills</strong>, then <strong>+</strong>.</li><li>Choose <strong>Upload a skill</strong>, then koe.zip.</li></ol>',
  codeStepsHtml: '<ol><li>In Claude Code, paste the command.</li><li>To dictate, run <code>/voice</code>, then start with <code>/koe</code>.</li></ol>',
  download: 'Download koe.zip',
  copy: 'Copy',
  copiedShort: 'Copied',
  afterInstallHtml: 'Then start your note with “Koe”. For Codex, Cursor and other agents: <code>npx skills add Rateur/koe</code>.',

  markTilde: 'tilde: loose',
  markBar: 'bar: framed',
  footStatement: 'Koe tidies what you say. Claude does the rest.',
  linksLabel: 'Links',
  navSource: 'Source code',
  navReadme: 'Read me',
  navLicense: 'MIT license',
  legalTitle: 'Legal notice',
  legalText: 'A non-commercial site. Hosted by GitHub, Inc., 88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, United States.',
  contactLabel: 'Contact:',
  privacyTitle: 'Data',
  privacyText: 'No cookies, no analytics. GitHub keeps visitors’ IP addresses in its logs. Your note only leaves the page when you send it to Claude or copy it.',
  creditsTitle: 'Typeface',
  creditsHtml: 'Recursive, by Arrow Type, under the <a href="https://openfontlicense.org">SIL OFL</a>.',
  footSmall: 'Koe isn’t made by Anthropic. Code under the MIT license.',
}

export type Lang = 'fr' | 'en'
export type Key = keyof Words

export const words: Record<Lang, Words> = { fr, en }

// What the tape points at while you talk: words of the monologue, and the label each one gets.
export const facts: Record<Lang, [find: string, label: string][]> = {
  fr: [
    ['U11', 'U11, club de foot'],
    ['quarante parents', '40 parents sur WhatsApp'],
    ['places', 'places en voiture'],
    ['convocation', 'convocation du coach'],
    ['appli web', 'appli web'],
    ['Budget zéro', 'budget zéro'],
    ['septembre', 'prêt en septembre'],
  ],
  en: [
    ['under-11s', 'under-11s, soccer club'],
    ['forty parents', '40 parents on WhatsApp'],
    ['seats', 'seats in the car'],
    ['call-up', 'the coach’s call-up'],
    ['web app', 'web app'],
    ['Zero budget', 'zero budget'],
    ['September', 'ready in September'],
  ],
}

// Fills the {placeholders} of a string; one without a value stays as it is.
export function fill(text: string, values: Record<string, string | number>): string {
  return text.replace(/\{(\w+)\}/g, (all, name: string) => (name in values ? String(values[name]) : all))
}

export function pageLang(preferred: readonly string[]): Lang {
  return preferred[0]?.toLowerCase().startsWith('fr') ? 'fr' : 'en'
}
