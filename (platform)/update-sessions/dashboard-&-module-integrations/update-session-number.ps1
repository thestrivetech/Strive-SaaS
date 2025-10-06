# PowerShell script to update session numbers in all prompt files
# Usage: .\update-session-number.ps1 3  (sets to Session 3)
# Usage: .\update-session-number.ps1    (auto-increments by 1)

param(
    [int]$NewSessionNumber = 0
)

# Get the script directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Find all SESSION-START-PROMPT-SHORT.md files
$shortFiles = Get-ChildItem -Path "$scriptDir" -Filter "SESSION-START-PROMPT-SHORT.md" -Recurse

# Find all SESSION-START-PROMPT.md files (non-short)
$fullFiles = Get-ChildItem -Path "$scriptDir" -Filter "SESSION-START-PROMPT.md" -Recurse | Where-Object { $_.Name -eq "SESSION-START-PROMPT.md" }

# If no session number provided, try to detect current and increment
if ($NewSessionNumber -eq 0) {
    # Read first file to detect current session number
    if ($shortFiles.Count -gt 0) {
        $content = Get-Content $shortFiles[0].FullName -Raw
        if ($content -match 'Session (\d+)') {
            $currentSession = [int]$matches[1]
            $NewSessionNumber = $currentSession + 1
            Write-Host "Detected current session: $currentSession"
            Write-Host "Incrementing to session: $NewSessionNumber"
        } else {
            Write-Host "Could not detect current session number. Please specify: .\update-session-number.ps1 <number>"
            exit 1
        }
    }
}

Write-Host "========================================"
Write-Host "Updating all prompt files to Session $NewSessionNumber"
Write-Host "========================================"

$filesUpdated = 0

# Update SHORT prompt files
foreach ($file in $shortFiles) {
    $content = Get-Content $file.FullName -Raw
    $moduleName = $file.Directory.Name

    # Replace in heading
    $content = $content -replace 'Session \d+', "Session $NewSessionNumber"

    # Replace {SESSION_NUMBER} placeholders
    $content = $content -replace '\{SESSION_NUMBER\}', "$NewSessionNumber"

    # Handle special case for CMS module (uses session2.plan.md format)
    if ($moduleName -eq "cms`&marketing-module") {
        $content = $content -replace 'session\d+\.plan\.md', "session$NewSessionNumber.plan.md"
        $content = $content -replace 'session\d+-summary\.md', "session$NewSessionNumber-summary.md"
    } else {
        # Standard format with hyphen
        $content = $content -replace 'session-\d+\.plan\.md', "session-$NewSessionNumber.plan.md"
        $content = $content -replace 'session-\d+-summary\.md', "session-$NewSessionNumber-summary.md"
    }

    Set-Content -Path $file.FullName -Value $content -NoNewline
    Write-Host "Updated: $moduleName/SESSION-START-PROMPT-SHORT.md" -ForegroundColor Green
    $filesUpdated++
}

# Update FULL prompt files
foreach ($file in $fullFiles) {
    $content = Get-Content $file.FullName -Raw
    $moduleName = $file.Directory.Name

    # Replace actual session numbers (already set to specific number)
    $content = $content -replace 'Session \d+', "Session $NewSessionNumber"

    # Handle special case for CMS module
    if ($moduleName -eq "cms`&marketing-module") {
        $content = $content -replace 'session\d+\.plan\.md', "session$NewSessionNumber.plan.md"
        $content = $content -replace 'session\d+-summary\.md', "session$NewSessionNumber-summary.md"
    } else {
        # Standard format with hyphen
        $content = $content -replace 'session-\d+\.plan\.md', "session-$NewSessionNumber.plan.md"
        $content = $content -replace 'session-\d+-summary\.md', "session-$NewSessionNumber-summary.md"
    }

    Set-Content -Path $file.FullName -Value $content -NoNewline
    Write-Host "Updated: $moduleName/SESSION-START-PROMPT.md" -ForegroundColor Green
    $filesUpdated++
}

# Update MASTER coordination prompt
$masterFile = Join-Path $scriptDir "SESSION-START-PROMPT-MASTER.md"
if (Test-Path $masterFile) {
    $content = Get-Content $masterFile -Raw

    # Replace {CURRENT_SESSION} placeholders
    $content = $content -replace '\{CURRENT_SESSION\}', "$NewSessionNumber"

    # Replace Session N patterns throughout
    $content = $content -replace 'Session \d+', "Session $NewSessionNumber"

    # Replace session-N patterns
    $content = $content -replace 'session-\d+-summary\.md', "session-$NewSessionNumber-summary.md"

    Set-Content -Path $masterFile -Value $content -NoNewline
    Write-Host "Updated: SESSION-START-PROMPT-MASTER.md" -ForegroundColor Cyan
    $filesUpdated++
}

Write-Host "========================================"
Write-Host "Complete! Updated $filesUpdated files to Session $NewSessionNumber" -ForegroundColor Cyan
Write-Host "========================================"

# Show which session plan files agents will now read
Write-Host "`nAgents will now read these session plans:" -ForegroundColor Yellow
Write-Host "  - AI Garage: session-$NewSessionNumber.plan.md"
Write-Host "  - CMS & Marketing: session$NewSessionNumber.plan.md (no hyphen)"
Write-Host "  - Expenses & Taxes: session-$NewSessionNumber.plan.md"
Write-Host "  - Landing/Admin: session-$NewSessionNumber.plan.md"
Write-Host "  - Main Dashboard: session-$NewSessionNumber.plan.md"
Write-Host "  - REID Dashboard: session-$NewSessionNumber.plan.md"
Write-Host "  - Tool Marketplace: session-$NewSessionNumber.plan.md"