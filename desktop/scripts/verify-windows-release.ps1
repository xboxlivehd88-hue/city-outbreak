# Release gate: missing/disabled antivirus is NOT a successful scan.
$ErrorActionPreference = 'Stop'
$exe = @(Get-ChildItem -Path 'desktop-dist' -Filter '*.exe' -File -ErrorAction Stop)
if ($exe.Count -ne 1) { throw "Expected exactly one portable executable, found $($exe.Count)" }
$file = $exe[0]
if ($file.Length -lt 1000000) { throw 'Unexpectedly small executable' }
if (-not (Get-Command 'Get-MpComputerStatus' -ErrorAction SilentlyContinue)) {
  throw 'Microsoft Defender unavailable on runner; refuse to publish unscanned EXE'
}
$defender = Get-MpComputerStatus -ErrorAction Stop
Write-Host "Defender mode=$($defender.AMRunningMode), AV enabled=$($defender.AntivirusEnabled), service=$($defender.AMServiceEnabled)"
if (-not $defender.AntivirusEnabled -or -not $defender.AMServiceEnabled) {
  throw 'Defender disabled on Windows runner; release blocked'
}
if ((Get-Date) - $defender.AntivirusSignatureLastUpdated -gt [TimeSpan]::FromDays(7)) {
  throw 'Defender signatures older than 7 days; release blocked'
}
$started = Get-Date
Start-MpScan -ScanType CustomScan -ScanPath $file.FullName -ErrorAction Stop
$recent = @(Get-MpThreatDetection -ErrorAction Stop | Where-Object {
  $_.InitialDetectionTime -ge $started.AddMinutes(-2)
})
if ($recent.Count -gt 0) { throw "Defender detected $($recent.Count) threats; release blocked" }
if (-not (Test-Path -LiteralPath $file.FullName -PathType Leaf)) {
  throw 'Defender quarantined or removed executable; release blocked'
}
$hash = (Get-FileHash -Path $file.FullName -Algorithm SHA256 -ErrorAction Stop).Hash.ToLowerInvariant()
"$hash  $($file.Name)" | Set-Content 'desktop-dist/SHA256SUMS.txt' -Encoding utf8
$signature = Get-AuthenticodeSignature -FilePath $file.FullName
$report = [ordered]@{
  project='CITY OUTBREAK Windows Development Edition'
  sourceCommit=$env:GITHUB_SHA
  generatedAtUtc=(Get-Date).ToUniversalTime().ToString('o')
  filename=$file.Name
  bytes=$file.Length
  sha256=$hash
  antivirus='Microsoft Defender'
  scanStatus='completed; no new detections'
  signatureDefinitions=$defender.AntivirusSignatureVersion
  publisherSignatureStatus=[string]$signature.Status
  signed=$signature.Status -eq 'Valid'
  disclaimer='Scan and dependency audit do not guarantee safety; unsigned experimental build.'
}
$report | ConvertTo-Json -Depth 4 | Set-Content 'desktop-dist/SECURITY-REPORT.json' -Encoding utf8
Write-Host "Defender scan completed. SHA-256: $hash"
