# Session Update Scripts

## Purpose
These scripts automatically update session numbers across all module prompt files, saving significant token usage by eliminating manual edits.

## Token Savings
- **Manual update via Claude:** ~6,000 tokens (reading and editing 15 files)
- **Script execution:** ~50 tokens (single command)
- **Savings per session:** 99% reduction

## Available Scripts

### 1. PowerShell Script (`update-session-number.ps1`)
**For Windows users with PowerShell**

```powershell
# Auto-increment (detects current session and adds 1)
.\update-session-number.ps1

# Set specific session number
.\update-session-number.ps1 3
```

### 2. Bash Script (`update-session-number.sh`)
**For Git Bash, WSL, Linux, or macOS**

```bash
# Make executable (first time only)
chmod +x update-session-number.sh

# Auto-increment (detects current session and adds 1)
./update-session-number.sh

# Set specific session number
./update-session-number.sh 3
```

### 3. Batch File (`update-session-number.bat`)
**For Windows users (wrapper for PowerShell script)**

```cmd
# Auto-increment
update-session-number.bat

# Set specific session number
update-session-number.bat 3
```

## What Gets Updated

The scripts update ALL occurrences of session numbers in:
- `*/SESSION-START-PROMPT-SHORT.md` (7 files)
- `*/SESSION-START-PROMPT.md` (7 files)
- `SESSION-START-PROMPT-MASTER.md` (1 file)

Total: 15 files updated in ~1 second

## Session Number Patterns

The scripts handle different filename patterns:
- **Standard modules:** `session-{N}.plan.md` (with hyphen)
- **CMS module:** `session{N}.plan.md` (no hyphen)

## Usage Workflow

### Starting a New Session
1. Complete current session work
2. Run the script to increment: `.\update-session-number.ps1`
3. Launch agents - they'll automatically read the new session plans

### Jumping to Specific Session
```powershell
# Jump directly to Session 5
.\update-session-number.ps1 5
```

### Verifying Current Session
The script will show:
- Current detected session number
- New session number being set
- List of all files updated
- Session plan files that agents will read

## Example Output
```
========================================
Updating all prompt files to Session 3
========================================
Updated: AI-Garage-&-shop/SESSION-START-PROMPT-SHORT.md
Updated: cms&marketing-module/SESSION-START-PROMPT-SHORT.md
Updated: expenses-&-taxes-module/SESSION-START-PROMPT-SHORT.md
Updated: landing-onboard-price-admin/SESSION-START-PROMPT-SHORT.md
Updated: main-dash/SESSION-START-PROMPT-SHORT.md
Updated: REIDashboard/SESSION-START-PROMPT-SHORT.md
Updated: tool&dashboard-marketplace/SESSION-START-PROMPT-SHORT.md
[... plus 7 more SESSION-START-PROMPT.md files ...]
Updated: SESSION-START-PROMPT-MASTER.md
========================================
Complete! Updated 15 files to Session 3
========================================

Agents will now read these session plans:
  - AI Garage: session-3.plan.md
  - CMS & Marketing: session3.plan.md (no hyphen)
  - Expenses & Taxes: session-3.plan.md
  - Landing/Admin: session-3.plan.md
  - Main Dashboard: session-3.plan.md
  - REID Dashboard: session-3.plan.md
  - Tool Marketplace: session-3.plan.md
```

## Troubleshooting

### PowerShell Execution Policy Error
If you see "cannot be loaded because running scripts is disabled":
```powershell
# Option 1: Use the batch file instead
update-session-number.bat

# Option 2: Run with bypass flag
powershell -ExecutionPolicy Bypass -File update-session-number.ps1

# Option 3: Change execution policy (permanent)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Permission Denied (Bash)
```bash
chmod +x update-session-number.sh
```

### Script Not Found
Ensure you're in the correct directory:
```bash
cd (platform)/update-sessions/dashboard-&-module-integrations/
```

## Benefits

1. **99% token reduction** vs manual updates
2. **Zero errors** - no missed files or typos
3. **Instant execution** - all files updated in ~1 second
4. **Auto-increment** - no need to remember current session
5. **Consistent formatting** - handles special cases automatically

## Integration with Agent Workflow

1. **Before agents:** Run script to set session number
2. **Launch agents:** They read the SHORT prompt files
3. **Agents execute:** Follow session-N.plan.md automatically
4. **After completion:** Run script again for next session

This eliminates the entire "Phase 2: Update Session Numbers" step from the orchestration workflow, saving thousands of tokens per session coordination.