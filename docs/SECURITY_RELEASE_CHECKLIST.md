# CITY OUTBREAK — Public-release security checklist (2026-10-27)

**Status: NOT APPROVED FOR PUBLIC DOWNLOAD YET.** This is a defensive security review,
not a certification of zero malware or vulnerabilities. Browser playtest success,
Microsoft Defender's negative scan and SHA-256 checksums do not establish publisher identity.

## How malicious code can enter a game

1. **Stolen developer credentials / unreviewed commits**: a compromised GitHub
   account pushes modified gameplay JavaScript, a build script, or a backdoored
   Windows EXE. This is especially relevant because LIVE mode deliberately
   loads fresh code from GitHub Pages on each launch.
2. **Compromised packages / build actions**: an npm dependency or GitHub Action
   ships malicious code which runs in CI, then contaminates the executable.
3. **Tampered release downloads**: someone distributes a similarly named
   ZIP/EXE outside the official repository, or changes build artifacts.
4. **Unsafe Electron integration**: remote content navigates to a malicious page,
   triggers a privileged API, or loads a native installer without verification.
5. **Vulnerable binary assets/loaders**: malformed GLB or texture inputs
   exploit a flaw in the parser or graphics stack, despite not being
   directly executable themselves.

## Protections now enforced in the repository

- Sandboxed Electron window: no Node integration, preload bridge, external popups,
  webview tags, or unsigned native auto-update path.
- Strictly allowlisted GitHub Pages LIVE URL and offline loopback URLs.
  Offline mode continues to work without receiving web code changes.
- Runtime dependency and build-tool vulnerability audit on the Windows CI job.
- Windows CI requires the *actual packaged game* to start before uploading.
- Microsoft Defender scans the built executable; SHA-256 and SECURITY-REPORT
  accompany the build. Fail closed if Defender cannot operate.
- First-party security policy scanner runs on every change to gameplay/native
  code and regularly; blocks unexpected Windows executables in Git, accidental
  privilege elevation in Electron, unapproved web scripts, and other mistakes.
- GitHub CodeQL security-extended checks JavaScript for recognized weaknesses.
- Dependabot checks npm packages and GitHub Actions weekly, proposing updates.
- Windows release GitHub Actions use commit-SHA pinned third-party actions.
- GitHub build provenance attestation links the EXE to the repository workflow.
  Provenance is separate from Microsoft Authenticode executable signing.

## Critical manual owner actions still required BEFORE public release

**1. Protect `main`.** It was unprotected when audited (October 27, 2026).
In GitHub repository **Settings → Branches**, create a protection rule for
`main`, block force pushes/deletion, require pull requests and successful
status checks, and ideally an independent reviewer. Configure rules so
authorized, approved production changes can still be merged.

**2. Harden GitHub account access.** Enable phishing-resistant 2FA/passkeys,
review repository collaborators and installed GitHub Apps, remove unused
personal access tokens, minimize write permissions and avoid shared credentials.

**3. Enable GitHub Dependabot alerts/security updates and Secret Scanning**
from repository Settings → Advanced Security / Code security and analysis
(where available). Review and remediate alerts, especially critical/high.

**4. Code-sign native Windows installers and executables** with an authentic
publisher certificate or trusted signing service, and verify signatures on
CI artifacts. Until then, the unsigned EXE is for private development
testing only. Signing protects publisher identity/integrity; it doesn't
eliminate malware or instantly guarantee SmartScreen trust.

**5. Pin the full npm dependency graph.** Commit a reviewed
`desktop/package-lock.json`, use `npm ci` rather than floating `npm install`
in CI, verify the lockfile and package integrity. Current package versions are
pinned at the top level, but transitive dependencies can change across builds.

**6. Review third-party browser module delivery.** The live HTML currently loads
pinned-version Three.js ES modules from a public CDN (jsDelivr), but does not
carry a complete content-integrity pin for all modules. Before public release,
self-host an audited Three.js package under the official GitHub Pages origin
(or use an equivalent fully verified dependency strategy) so a compromised
third-party script delivery path cannot silently change live game code.

**7. Before first public beta**, perform a third-party security review,
fresh malware scans and a real-PC acceptance test of both LIVE/OFFLINE modes.
Only publish through an official, clearly documented download channel.
Do not instruct people to disable Microsoft Defender, SmartScreen or Chrome
Safe Browsing warnings.

## Release decision

Until all critical owner controls above are verified, **do not claim the
executable is safe for anyone to download**. A clean CI scan means only that
the scanner did not detect a threat in that particular build.
