[![make.fun — gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![Rank](https://make.fun/badge/gta6-trophy-guide-01/0xfari/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![Reward](https://make.fun/badge/gta6-trophy-guide-01/0xfari/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

# Leonida 55 — GTA VI Trophy Guide & Tracker

An offline static web app: a guide and tracker for all 55 Grand Theft Auto VI trophies on PlayStation 5 — 1 Platinum, 2 Gold, 6 Silver, 46 Bronze; 28 hidden; 0 online.

## What it does

- **Checklist** — every trophy with its official name, description and grade, a checkbox to mark it earned (saved in your browser), search, and filters by kind (Story, Missable, Collectibles, Activities, Online).
- **Spoiler setting** — hides story trophy names and descriptions until you earn them.
- **Roadmap to Platinum** — four stages: Story (60–80 hours), the 100% checklist (about 100 hours), Strangers & cleanup (about 10 hours), then the Platinum. About 200 hours in total, one playthrough.
- **Cited guides** — every trophy has a guide written in our own words, with its source named and linked beside it. No credit is claimed for an uncited step.
- **Export / import** — download your progress as JSON and load it back on another device.

## The one missable trophy

**Positive Mental Attitude** (meditate at every spot across Leonida) is the only potentially missable trophy: the first meditation, at Jason's house in Chapter 1, disappears after that chapter. There is no mission replay and no New Game+, so meditate there before Chapter 1 ends — and keep a manual save at the start of every chapter. Every other trophy can be finished in free roam after the story.

## 100% completion, in short

The Gold trophy **A Long Road** needs 100% on the in-game checklist (Progress > Stats > 100% Completion, which opens after the story). The thresholds are lenient — roughly 60% of true completion: about 200 of 277 vehicles, 100 of 255 animals, 50 of 66 weapons, 70 of 80 challenges, 300 stunts. Cheats switch trophies off, so keep them off for the whole run.

## Sources

- PowerPyx — GTA 6 Trophy Guide & Roadmap: https://www.powerpyx.com/gta-6-grand-theft-auto-vi-trophy-guide-roadmap/
- Sixshore — GTA 6 Trophy and Achievement List: https://sixshore.com/gta-6/guides/trophies-and-achievements/
- GGRecon — GTA 6 trophies and achievements list: https://www.ggrecon.com/articles/gta-6-trophies-achievements-list-platinum/
- OutputLag — GTA 6 Trophy List: https://outputlag.com/guides/gta-6-trophy-list/
- GTA Zone — GTA 6 Trophy List: https://gta-zone.com/news/gta-6-trophies-achievements/

Trophy names, descriptions and grades are the official list as published on 18 November 2026. Guides are our own words. No Rockstar logo or artwork is used.

## Run it

Serve `app/` with any static file server and open `index.html` — no build step, no network at runtime.

```
npx serve app
```

## Build the dossier

`main.ts` copies `app/` and `screenshots/` into the output directory and writes `dossier.json` via the kit's `buildDossier`. It empties only the output directory's contents — it never removes the output directory itself, because the grader mounts it.
