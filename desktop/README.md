# CITY OUTBREAK — Windows Development Edition (Milestone 1)

Original desktop 0.1.1 START GAME failure was fixed in 0.1.5 by bundling the full Three.js source addons and permitting local GLTF data buffers. CI runs the actual packaged app and clicks START before uploading. Desktop 0.1.6 adds selectable LIVE/OFFLINE game modes.

This is a **separate desktop shell around the exact browser game**. It is a
development/testing build, not a native engine rewrite and not evidence of an
FPS increase. The GitHub Pages game and protected v324 recovery stay intact.

## Live gameplay updates — no repeated full EXE downloads

**NEW in desktop 0.1.6:** The GAME menu (visible above the game) has:

- **Play latest online (updates on launch)** — loads the official
  `https://xboxlivehd88-hue.github.io/city-outbreak/` game in the
  sandboxed Windows window. When changes are deployed to GitHub Pages,
  restart or choose **GAME → Refresh current game (F5)**. The latest game
  code and changed assets are retrieved by normal HTTPS browser caching;
  no full 250 MB EXE download is needed for each gameplay tweak.
- **Play offline (built-in version)** — runs the exact bundled version,
  even without internet access. If online mode cannot load, the app
  falls back to this local copy and displays an explanation.

You choose LIVE mode once; the preference persists across app restarts.
Changing modes restarts your current round, and does not run arbitrary
programs. The online game window has **no native preload API, Node.js,
file access, or unsafe popup support**. Navigation is locked to the
official game page. Other browser resources continue to obey Chromium
security/CORS rules. Note that online games use separate origin-based
browser storage, so settings may not carry between offline and online.

**Important:** This updates **gameplay/content**, not Electron itself.
For future desktop runtime or installer/security changes, a separately
distributed and code-signed Windows update will still be necessary.
We have not enabled unsigned native code auto-updates, and this
feature does not circumvent Chrome or SmartScreen warnings.

## Run locally (Windows)

1. Install **Node.js 22 or newer** and Git.
2. Clone `https://github.com/xboxlivehd88-hue/city-outbreak`.
3. In a PowerShell terminal, run `cd city-outbreak\desktop`, then `npm install`.
4. Run `npm test` (offline asset server security tests), then `npm start`.

The desktop launches its own localhost server using exactly the checked-out
`index.html`, `src/`, and `assets/`. It **replaces CDN Three.js imports
only in the served HTML**, using the pinned local `three@0.180.0` dependency.
After the initial `npm install`, playing does not require Internet.

**Fast changes:** edits to `src/` or `index.html` automatically reload the
running desktop app (debounced). `F5` or `Ctrl+R` manually reloads;
`F11` toggles fullscreen; `F12` opens DevTools in development only.
These tools are for local testing, not silent over-the-air updates.

## Windows portable .exe

- In GitHub, open **Actions → Windows Development Edition — Security Gate**.
- Open a successful workflow run and download **city-outbreak-windows-security-checked**
  artifact. Unzip it to obtain a Windows portable executable.
- Or run `npm run build:windows` on Windows; output appears in `desktop-dist/`.

PUBLIC RELEASE SECURITY: Do not distribute an EXE to other players yet.
See [the release security checklist](../docs/SECURITY_RELEASE_CHECKLIST.md):
GitHub main branch protection, account 2FA, reviewed package lockfile,
code signing, and independent security review are still required. CI now
runs a source-security policy, CodeQL, dependency monitoring and provenance
attestation alongside Windows Defender; these are defenses, not a guarantee.

This remains an **unsigned experimental build**, so Chrome or SmartScreen
can still block it on reputation grounds **even if the security scans pass**.
Do not disable protections or assume that a malware warning is a false positive.

The new build workflow blocks releases when the full npm dependency audit
finds high/critical vulnerabilities or Microsoft Defender is unavailable,
disabled, too outdated, or reports a threat. A successful artifact includes
`SHA256SUMS.txt` and `SECURITY-REPORT.json` alongside the executable.
You can verify the downloaded file with PowerShell:
`Get-FileHash .\\CityOutbreak-WindowsDev-0.1.6-x64.exe -Algorithm SHA256`.
A matching hash confirms integrity against the published record, not safety.

Do not disable Windows security globally. There is no auto-updater or installer
yet; those are separate milestones. The Windows Actions job validates asset
serving, copies the game's 200MB+ GLB/texture assets, and produces the .exe.
Automated WebGL smoke tests still run separately. A real Windows PC test is
required before we mark this milestone complete.

## Exit criteria for Milestone 1

- Windows `.exe` builds and launches on the player's machine.
- Offline: start, shoot M17, ADS, reload, zombies spawn and round progresses.
- Original GLB assets load and the game performance HUD works.
- Same baseline gameplay as browser; no new critical regressions.
- Compare desktop/browser frame spikes using the same graphics settings.
