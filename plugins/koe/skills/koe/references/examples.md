# Before and after

Four voice notes and what Koe makes of them. They show the rules at work; they aren't templates to copy word for word.

## A short ask stays short

The voice note:

> euh j'ai un entretien jeudi chez Decathlon pour un poste de dev front, tu peux me préparer genre les questions qu'ils vont poser, surtout React, et euh pas trop long parce que je le relis dans le métro

The prompt:

```xml
<context>
J'ai un entretien jeudi chez Decathlon pour un poste de développeur front-end. Je relirai ta réponse dans le métro, sur mon téléphone.
</context>

<task>
Prépare-moi les questions qu'on va probablement me poser pendant cet entretien, en insistant sur React.
</task>

<output_format>
Une liste courte, facile à lire sur un téléphone, avec pour chaque question une piste de réponse en une ou deux phrases.
</output_format>
```

"Pas trop long parce que je le relis dans le métro" becomes a format with its reason, not an invented word count.

## Corrections win, and what Claude won't have gets a placeholder

The voice note:

> alors j'ai reçu un mail de Mme Garnier, la cliente du projet de site, elle dit en gros que la livraison était prévue le 15 et qu'on est le 22 et qu'elle veut une remise de 20 %, non pardon de 10 %. Je veux lui répondre poliment mais sans m'excuser à l'infini, le retard vient de chez elle parce qu'elle a envoyé les photos le 12 au lieu du 1er. Je peux lui faire un geste mais pas plus de 5 %. Vouvoiement évidemment

The prompt:

```xml
<context>
Mme Garnier est la cliente de mon projet de site web. La livraison était prévue le 15, nous sommes le 22, et elle demande une remise de 10 %. Le retard vient de son côté : elle a envoyé les photos le 12 au lieu du 1er.
</context>

<email>
[Colle ici le mail de Mme Garnier]
</email>

<task>
Écris ma réponse au mail de Mme Garnier dans <email>.
</task>

<requirements>
Reste poli et rappelle calmement la date d'envoi des photos, sans multiplier les excuses, parce que le retard ne vient pas de moi. Propose un geste commercial de 5 % au maximum.
</requirements>

<output_format>
Un mail prêt à envoyer, au vouvoiement, signé [ton prénom].
</output_format>
```

The speaker said 20 % then corrected it to 10 %: only the correction stays. The email itself wasn't dictated, so it gets its own tag with a placeholder, and so does the name to sign with.

## The speaker's own check stays, and risky work gets a plan

The voice note:

> dans mon app Next la page de paiement plante quand on met un code promo, ça me met une erreur dans la console, je sais plus laquelle, c'est depuis que j'ai migré Stripe, et euh faudrait vraiment que les tests passent après parce que je déploie vendredi

The prompt:

```xml
<context>
Dans mon application Next.js, la page de paiement plante dès qu'on saisit un code promo. Le problème est apparu après ma migration de Stripe. Je déploie vendredi.
</context>

<error>
[Colle ici l'erreur affichée dans la console]
</error>

<task>
Trouve la cause du plantage de la page de paiement avec un code promo, puis corrige-la.
</task>

<requirements>
Propose-moi d'abord un plan et attends mon accord avant de modifier le code. Une fois la correction faite, les tests doivent passer, parce que je déploie vendredi.
</requirements>
```

The tests come from the speaker. The plan comes from the work: a payment page, days before a release.

## Questions first when only the speaker knows

The voice note:

> I need something for the team offsite, you know, the usual stuff, make it good

Koe answers before writing anything:

> 1. What do you need: an agenda, an invitation, activity ideas, or something else?
> 2. How many people, for how long, and where?
> 3. What does "the usual stuff" cover for your team?

Once the user answers out loud, Koe writes the prompt with their answers in `<context>` and `<requirements>`.
