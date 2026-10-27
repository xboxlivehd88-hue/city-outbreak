# CITY OUTBREAK — Windows Development Edition (Milestone 1)

Original desktop 0.1.1 START GAME failure was fixed in 0.1.5 by bundling the full Three.js source addons and permitting local GLTF data buffers. CI runs the actual packaged app and clicks START before uploading. Desktop 0.1.7 replaces LIVE mode with a one-time notification-only version check.

This is a **separate desktop shell around the exact browser game**. It is a
development/testing build, not a native engine rewrite and not evidence of an
FPS increase. The GitHub Pages game and protected v324 recovery stay intact.

## Offline gameplay and a one-time update notification (desktop 0.1.7)

The packaged Windows game **always runs its bundled local** `index.html`,
`src/`, and original models. Previously offered "Play latest online" is removed.
Any older saved preference for LIVE mode is ignored.

On startup, the Windows app performs **one short, read-only HTTPS GET** of the
official version metadata: `https://xboxlivehd88-hue.github.io/city-outbreak/updates/windows.json`.
The response must be small valid JSON with a strictly parsed semver and an
official GitHub Actions run/release page. No stream, open socket, continuous
polling, remote JS execution, or background download/install is used.

If there is a newer approved Windows version, a Windows notification and
window title tell the user **"UPDATE AVAILABLE"**. From **HELP → View
available update**, choose **Copy official GitHub link** to paste into a
browser. The user manually verifies and downloads any new EXE; no file runs
automatically. **HELP → Check for updates now** is an explicit one-shot retry.
No connection / invalid manifest simply means the offline game continues.

The static `updates/windows.json` version MUST ONLY be incremented once a
new Windows package passes *all* startup, security, antivirus, and provenance
checks and its official download page has been confirmed. Today's metadata
continues to identify the previously verified 0.1.6 build; the new 0.1.7
version is not advertised until CI passes.

The game code can still be updated on GitHub Pages independently, but this
offline-first EXE does not silently load that code. Any accepted future
Windows fixes need a new package, ideally code-signed before public release.

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
`Get-FileHash .\\CityOutbreak-WindowsDev-0.1.7-x64.exe -Algorithm SHA256`.
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
