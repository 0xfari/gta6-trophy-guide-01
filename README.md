# gta6-trophy-guide-01

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/0xfari/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/0xfari/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

Leonida 55 is an offline GTA VI trophy guide and tracker for PlayStation 5: all 55 official trophies with their published names, descriptions and grades, a checklist that saves progress in the browser, filters by kind, a spoiler-safe mode that hides story trophies until earned, export and import of progress, a six-stage roadmap to Platinum, and a missables page flagging the 24 trophies tied to named missions or one-time moments. Every trophy's guide is written in our own words from the official descriptions on Exophase and PSNProfiles, with its source cited beside it — and where the official list does not pin down a place or a step, the guide says so instead of inventing one.

## Run it

```sh
python3 -m http.server --directory app 8080
```

Then open http://localhost:8080 in a browser. The app makes no network requests; it reads only `app/data/trophies.json` next to it. Hand in with `MAKEFUN_OUTPUT_DIR=/tmp/out node main.ts`, which copies `app/` and `screenshots/` to the output directory and writes `dossier.json`.

---

<sub>Entered on [make.fun](https://make.fun/?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
