// The site's words in French and English. index.html gets the French at build time (see vite.config.ts).
// Keys ending in Html hold our own markup, never user input. In the monologue, ~~x~~ is struck out and ??x?? is a word to check.

const fr = {
  title: 'Koe : ta note vocale devient un prompt pour Claude',
  description: 'Un skill gratuit pour Claude. Raconte ton projet en vrac : Koe le range et te demande ce qui manque avant d’écrire le prompt.',
  switchLang: 'English',
  switchLangLabel: 'Read this page in English',

  heroTitleHtml: 'Raconte ton projet en vrac.<br>Claude reçoit un prompt cadré.',
  heroLede: 'Koe est un skill gratuit pour Claude. Il range ta note vocale et te demande ce qui manque avant d’écrire.',
  heroInstall: 'Installer Koe',
  heroTry: 'Essayer sans installer',

  tryTitle: 'Essaie sans installer',
  noteLabel: 'Touche le micro de ton clavier et parle.',
  notePlaceholder: 'Bon alors, mon projet…',
  hint: 'Sur ordi : Win + H, ou deux fois Fn sur Mac.',
  openClaude: 'Ouvrir dans Claude',
  copyOther: 'Copier pour une autre IA',
  useSample: 'Mettre un exemple',
  sample: 'bon alors mon projet c’est une appli pour le club de foot de mon fils, les U11, parce que chaque samedi c’est le bazar pour savoir qui emmène qui au match. Je voudrais que chaque parent dise combien de places il a dans sa voiture et que l’appli répartisse les gamins. Budget zéro, et faut que ce soit prêt pour septembre.',
  copiedOpen: 'Copié. Si ta note n’apparaît pas dans Claude, colle-la.',
  copied: 'Copié. Colle-le dans l’IA de ton choix.',
  copyFailed: 'Ton navigateur bloque la copie. Autorise-la, puis réessaie.',
  empty: 'Dicte ta note d’abord.',
  rakugoCaption: 'Un conteur et son public, dans un recueil de rakugo de 1686.',

  showTitle: 'Ce que tu vois dans Claude',
  show1Name: 'Tu dictes',
  show1Text: 'Avec le micro de Claude ou celui du clavier, aussi longtemps que tu veux.',
  show2Name: 'Il pose ses questions',
  show2Text: 'Trois au plus, sur ce que toi seul sais. Tu réponds à voix haute.',
  show3Name: 'Tu reçois le prompt',
  show3Text: 'Le contexte, la tâche, tes exigences et le format. Rien d’inventé.',
  show4Name: 'Il signale les mots douteux',
  show4Text: 'La dictée écorche les noms propres. Koe te dit lesquels vérifier.',
  show5Name: 'Rien ne part sans toi',
  show5Text: 'Tu le lances ici, ou tu le copies ailleurs. C’est toi qui choisis.',
  show6Name: 'Dans Claude Code aussi',
  show6Text: 'Tape /koe dans ton dépôt : il cite les vrais fichiers au lieu de les décrire.',
  chatNew: 'Nouvelle conversation',
  chatCopy: 'Copier',
  chatAnswer: 'Le plan d’abord. Un lien suffit. Un peu de JavaScript.',
  chatGo: 'Lance-le.',
  launch: 'Je le lance ici, ou tu le copies dans une nouvelle conversation ou une autre IA ?',
  checkLine: 'Mots à vérifier : US Ivry.',
  codeAsk: '/koe ajoute la page des convocations, sur le modèle de celle des matchs',

  stageLabel: 'Étape',
  stage1Name: 'Tu parles',
  stage2Name: 'Koe trie',
  stage3Name: 'Koe demande',
  stage4Name: 'Claude reçoit',
  stage1Title: 'D’abord, tu parles',
  stage2Title: 'Ensuite, Koe raye le bruit',
  stage3Title: 'Puis il demande ce qui manque',
  stage4Title: 'Enfin, Claude reçoit le cadre',
  monologue: '~~bon alors en gros~~ mon projet c’est une appli pour le club de foot de mon fils, ~~euh~~ les U11 de ??l’usine ivre??, parce que chaque samedi c’est le bazar pour savoir qui emmène qui au match. Là tout passe par un groupe WhatsApp de quarante parents et les infos se perdent. Je voudrais que chaque parent dise combien de places il a dans sa voiture, et que l’appli répartisse les gamins. ~~Ah et~~ le coach doit pouvoir mettre la convocation, l’heure et l’adresse du stade. Je pensais la faire en ~~Flutter, non pardon,~~ appli web, parce que les parents n’installeront rien. Budget zéro, je fais ça le soir, et faut que ce soit prêt pour la reprise en septembre. Je sais pas trop par où commencer ~~en fait~~.',
  questionsHtml: '<ol><li>Tu veux d’abord le plan du projet, ou directement le code ?</li><li>Les parents arrivent comment dans l’appli : un lien sur WhatsApp suffit, ou il faut des comptes ?</li><li>Tu codes déjà ? Si oui, en quoi ?</li></ol>',
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
  codeReply: `<context>
Les matchs s’affichent dans src/pages/matchs.tsx, à partir de src/data/matchs.ts.
</context>

<task>
Ajoute une page des convocations sur le modèle de src/pages/matchs.tsx.
</task>`,

  proofTitle: 'Testé à l’aveugle',
  proof1Figure: '8 sur 12',
  proof1Text: 'notes vocales où un juge, sans savoir d’où venait chaque prompt, a préféré la réponse obtenue avec celui de Koe.',
  proof2Figure: '4 sur 4',
  proof2Text: 'Chaque fois que Koe a posé ses questions, sa réponse l’a emporté.',
  proof3Figure: '12 sur 12',
  proof3Text: 'corrections dites à voix haute bien reprises, comme « 20 %, non, 10 % ».',
  proof4Figure: '94 %',
  proof4Text: 'des détails de chaque note se retrouvent dans le prompt.',
  proofRulesHtml: 'Koe suit les <a href="https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices">conseils de prompting publiés par Anthropic</a>.',
  proofMethodHtml: 'Douze notes écrites pour le test, un passage chacune : <a href="https://github.com/Rateur/koe/tree/main/evals">la méthode et ses limites</a>.',
  picturesCaption: 'Avant les micros : la sténotype Grandjean, le sténographe Bartholomew et la sténographie Duployé.',

  installTitle: 'Installer Koe',
  tabPaid: 'Forfait payant',
  tabFree: 'Forfait gratuit',
  tabCode: 'Claude Code',
  paidStepsHtml: '<ol><li>Dans Claude, ouvre <strong>Personnaliser</strong>, puis <strong>Plugins</strong>.</li><li>Clique sur <strong>Ajouter</strong>, puis <strong>Ajouter une place de marché</strong>.</li><li>Colle <code>Rateur/koe</code>.</li><li>Dans <strong>Découvrir</strong>, ajoute Koe.</li></ol>',
  freeStepsHtml: '<ol><li>Télécharge koe.zip.</li><li>Active l’exécution de code dans <strong>Paramètres</strong>, <strong>Capacités</strong>.</li><li>Ouvre <strong>Personnaliser</strong>, <strong>Compétences</strong>, puis <strong>+</strong>.</li><li>Choisis <strong>Télécharger une compétence</strong>, puis koe.zip.</li></ol>',
  codeStepsHtml: '<ol><li>Dans Claude Code, colle la commande.</li><li>Pour dicter, lance <code>/voice</code>, puis commence par <code>/koe</code>.</li></ol>',
  dialogTitle: 'Ajouter une place de marché',
  dialogLabel: 'Dépôt GitHub',
  dialogCancel: 'Annuler',
  dialogAdd: 'Ajouter',
  download: 'Télécharger koe.zip',
  copy: 'Copier',
  copiedShort: 'Copié',
  afterInstallHtml: 'Ensuite, commence ta note par « Koe ». Pour Codex, Cursor et les autres agents : <code>npx skills add Rateur/koe</code>.',

  footStatement: 'Koe range ce que tu dis. Claude fait le reste.',
  footSmall: 'Koe n’est pas un produit d’Anthropic. Code sous licence MIT.',
  navSource: 'Code source',
  navReadme: 'Mode d’emploi',
  navLicense: 'Licence MIT',
  legalTitle: 'Mentions légales',
  legalText: 'Site édité à titre non professionnel. Hébergeur : GitHub, Inc., 88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, États-Unis.',
  contactLabel: 'Contact',
  privacyTitle: 'Données',
  privacyText: 'Aucun cookie, aucune mesure d’audience. GitHub garde l’adresse IP des visiteurs dans ses journaux. Ta note ne quitte la page que si tu l’envoies à Claude ou la copies.',
  creditsTitle: 'Images',
  creditsHtml: '<a href="https://commons.wikimedia.org/wiki/File:Shika-no-Makifude.jpg">Shika no makifude</a>, 1686, domaine public. <a href="https://commons.wikimedia.org/wiki/File:Meyers_b15_s0290a_b3.png">Sténographie Duployé</a>, Meyers, vers 1889, domaine public. <a href="https://commons.wikimedia.org/w/index.php?curid=182973135">Sténotype Grandjean</a>, photo Gabon100, <a href="https://creativecommons.org/licenses/by-sa/4.0/deed.fr">CC BY-SA 4.0</a>. <a href="https://commons.wikimedia.org/w/index.php?curid=35955922">Sténographe Bartholomew, 1888</a>, photo Chatsam, <a href="https://creativecommons.org/licenses/by-sa/3.0/deed.fr">CC BY-SA 3.0</a>.',
  footInstall: 'Installer Koe',
}

type Words = typeof fr

const en: Words = {
  title: 'Koe: your voice note becomes a prompt for Claude',
  description: 'A free skill for Claude. Talk through your project however it comes out: Koe sorts it and asks what’s missing before it writes the prompt.',
  switchLang: 'Français',
  switchLangLabel: 'Lire cette page en français',

  heroTitleHtml: 'Talk through your whole project.<br>Claude gets a framed prompt.',
  heroLede: 'Koe is a free skill for Claude. It tidies your voice note and asks what’s missing before it writes.',
  heroInstall: 'Install Koe',
  heroTry: 'Try without installing',

  tryTitle: 'Try it without installing',
  noteLabel: 'Tap your keyboard’s mic and talk.',
  notePlaceholder: 'So, my project…',
  hint: 'On a computer: Win + H, or Fn twice on a Mac.',
  openClaude: 'Open in Claude',
  copyOther: 'Copy for another AI',
  useSample: 'Use an example',
  sample: 'so my project is an app for my son’s soccer club, the under-11s, because every Saturday it’s chaos working out who drives who to the game. I’d like each parent to say how many seats they have in their car and the app splits up the kids. Zero budget, and it has to be ready for September.',
  copiedOpen: 'Copied. If your note isn’t in Claude, paste it.',
  copied: 'Copied. Paste it into any AI chat.',
  copyFailed: 'Your browser blocks copying. Allow it, then try again.',
  empty: 'Dictate your note first.',
  rakugoCaption: 'A storyteller and his audience, in a book of rakugo from 1686.',

  showTitle: 'What you see in Claude',
  show1Name: 'You dictate',
  show1Text: 'With Claude’s mic or your keyboard’s, for as long as you like.',
  show2Name: 'It asks its questions',
  show2Text: 'Three at most, about what only you know. You answer out loud.',
  show3Name: 'You get the prompt',
  show3Text: 'The context, the task, your requirements and the format. Nothing made up.',
  show4Name: 'It flags doubtful words',
  show4Text: 'Dictation mangles names. Koe tells you which ones to check.',
  show5Name: 'Nothing runs without you',
  show5Text: 'Run it here, or copy it somewhere else. Your call.',
  show6Name: 'In Claude Code too',
  show6Text: 'Type /koe in your repository: it names the real files instead of describing them.',
  chatNew: 'New chat',
  chatCopy: 'Copy',
  chatAnswer: 'Plan first. A link is enough. A bit of JavaScript.',
  chatGo: 'Run it.',
  launch: 'Shall I run it here, or will you copy it into a new chat or another AI?',
  checkLine: 'Words to check: US Ivry.',
  codeAsk: '/koe add the call-ups page, built like the matches page',

  stageLabel: 'Stage',
  stage1Name: 'You talk',
  stage2Name: 'Koe sorts',
  stage3Name: 'Koe asks',
  stage4Name: 'Claude gets',
  stage1Title: 'First, you talk',
  stage2Title: 'Then Koe strikes the noise',
  stage3Title: 'Next it asks what’s missing',
  stage4Title: 'Last, Claude gets the frame',
  monologue: '~~so basically~~ my project is an app for my son’s soccer club, ~~um~~ the under-11s at ??us ivory??, because every Saturday it’s chaos working out who drives who to the game. Right now it all goes through a WhatsApp group with forty parents and things get lost. I’d like each parent to say how many seats they have in their car, and the app splits up the kids. ~~Oh and~~ the coach has to be able to post the call-up, the time and the address of the field. I was thinking of building it in ~~Flutter, no sorry,~~ as a web app, because parents won’t install anything. Zero budget, I do this in the evenings, and it has to be ready for the new season in September. I don’t really know where to start ~~to be honest~~.',
  questionsHtml: '<ol><li>Do you want the project plan first, or straight to code?</li><li>How do parents get into the app: is a link in WhatsApp enough, or do they need accounts?</li><li>Do you already code? If so, in what?</li></ol>',
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
  codeReply: `<context>
Matches are shown in src/pages/matches.tsx, from src/data/matches.ts.
</context>

<task>
Add a call-ups page built like src/pages/matches.tsx.
</task>`,

  proofTitle: 'Tested blind',
  proof1Figure: '8 of 12',
  proof1Text: 'voice notes where a judge, not knowing where each prompt came from, preferred the answer to Koe’s.',
  proof2Figure: '4 of 4',
  proof2Text: 'Every time Koe asked its questions, its answer won.',
  proof3Figure: '12 of 12',
  proof3Text: 'corrections said out loud were kept, like “20%, no, 10%”.',
  proof4Figure: '94%',
  proof4Text: 'of the details in each note end up in the prompt.',
  proofRulesHtml: 'Koe follows the <a href="https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices">prompting advice Anthropic publishes</a>.',
  proofMethodHtml: 'Twelve notes written for the test, one run each: <a href="https://github.com/Rateur/koe/tree/main/evals">the method and its limits</a>.',
  picturesCaption: 'Before microphones: the Grandjean stenotype, the Bartholomew stenograph and Duployé shorthand.',

  installTitle: 'Install Koe',
  tabPaid: 'Paid plan',
  tabFree: 'Free plan',
  tabCode: 'Claude Code',
  paidStepsHtml: '<ol><li>In Claude, open <strong>Customize</strong>, then <strong>Plugins</strong>.</li><li>Click <strong>Add</strong>, then <strong>Add marketplace</strong>.</li><li>Paste <code>Rateur/koe</code>.</li><li>In <strong>Discover</strong>, add Koe.</li></ol>',
  freeStepsHtml: '<ol><li>Download koe.zip.</li><li>Turn on code execution in <strong>Settings</strong>, <strong>Capabilities</strong>.</li><li>Open <strong>Customize</strong>, <strong>Skills</strong>, then <strong>+</strong>.</li><li>Choose <strong>Upload a skill</strong>, then koe.zip.</li></ol>',
  codeStepsHtml: '<ol><li>In Claude Code, paste the command.</li><li>To dictate, run <code>/voice</code>, then start with <code>/koe</code>.</li></ol>',
  dialogTitle: 'Add marketplace',
  dialogLabel: 'GitHub repository',
  dialogCancel: 'Cancel',
  dialogAdd: 'Add',
  download: 'Download koe.zip',
  copy: 'Copy',
  copiedShort: 'Copied',
  afterInstallHtml: 'Then start your note with “Koe”. For Codex, Cursor and other agents: <code>npx skills add Rateur/koe</code>.',

  footStatement: 'Koe tidies what you say. Claude does the rest.',
  footSmall: 'Koe isn’t made by Anthropic. Code under the MIT license.',
  navSource: 'Source code',
  navReadme: 'Read me',
  navLicense: 'MIT license',
  legalTitle: 'Legal notice',
  legalText: 'A non-commercial site. Hosted by GitHub, Inc., 88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, United States.',
  contactLabel: 'Contact',
  privacyTitle: 'Data',
  privacyText: 'No cookies, no analytics. GitHub keeps visitors’ IP addresses in its logs. Your note only leaves the page when you send it to Claude or copy it.',
  creditsTitle: 'Pictures',
  creditsHtml: '<a href="https://commons.wikimedia.org/wiki/File:Shika-no-Makifude.jpg">Shika no makifude</a>, 1686, public domain. <a href="https://commons.wikimedia.org/wiki/File:Meyers_b15_s0290a_b3.png">Duployé shorthand</a>, Meyers, around 1889, public domain. <a href="https://commons.wikimedia.org/w/index.php?curid=182973135">Grandjean stenotype</a>, photo by Gabon100, <a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a>. <a href="https://commons.wikimedia.org/w/index.php?curid=35955922">Bartholomew stenograph, 1888</a>, photo by Chatsam, <a href="https://creativecommons.org/licenses/by-sa/3.0/">CC BY-SA 3.0</a>.',
  footInstall: 'Install Koe',
}

export type Lang = 'fr' | 'en'
export type Key = keyof Words

export const words: Record<Lang, Words> = { fr, en }

export function pageLang(preferred: readonly string[]): Lang {
  return preferred[0]?.toLowerCase().startsWith('fr') ? 'fr' : 'en'
}
