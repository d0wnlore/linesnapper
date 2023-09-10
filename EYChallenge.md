# Linesnapper

A phishing website detection extension for Chrome, using rulesets stored onchain.

By d0wnlore (d0wnlore@pm.me)

## Why Linesnapper would benefit from a privacy solution

Currently rulesets used to detect phishing websites, and their authors, is publicly available to everyone, including scammers that we'd rather not disclose this data to.

- Users do not need to know the ruleset or authors, only if the website they are currently looking at is attempting to phish or not
- Developers do not need to see the full ruleset, only specific rules that they have contributed
- Decision makers need to know as much of the ruleset as possible to avoid negative causalities (malicious rulesets were attempted to be added, one rule negatively affects another rule, etc.) and generally do not need to know the authors
- Scammers definitely do not need to know the ruleset or authors and obscuring this data from them helps delay their ability to adapt their tactics and to target specific security researchers that have attempted to thwart their operations

## Which privacy solution should Linesnapper use

Linesnapper should adopt ZKP transactions to:

1. Help dissaoccoiate authors from rules added to the Linesnapper ruleset
2. Obscure the ruleset from malicious actors

While point 2 would provide the most impact into securing the ruleset, point 1 would help provide a safer environment for security researchers so that they can continue adding and refining the ruleset.

## Architecture

![Linesnapper Architecture Diagram](/EYChallenge_diagram.png)
