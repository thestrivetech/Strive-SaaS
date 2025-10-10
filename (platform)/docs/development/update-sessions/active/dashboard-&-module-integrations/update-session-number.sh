#!/bin/bash
# Bash script to update session numbers in all prompt files
# Usage: ./update-session-number.sh 3  (sets to Session 3)
# Usage: ./update-session-number.sh    (auto-increments by 1)

NEW_SESSION_NUMBER=$1

# Get the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# If no session number provided, try to detect current and increment
if [ -z "$NEW_SESSION_NUMBER" ]; then
    # Read first SHORT file to detect current session number
    FIRST_FILE=$(find "$SCRIPT_DIR" -name "SESSION-START-PROMPT-SHORT.md" | head -n 1)

    if [ -f "$FIRST_FILE" ]; then
        CURRENT_SESSION=$(grep -oP 'Session \K\d+' "$FIRST_FILE" | head -n 1)

        if [ -n "$CURRENT_SESSION" ]; then
            NEW_SESSION_NUMBER=$((CURRENT_SESSION + 1))
            echo "Detected current session: $CURRENT_SESSION"
            echo "Incrementing to session: $NEW_SESSION_NUMBER"
        else
            echo "Could not detect current session number. Please specify: ./update-session-number.sh <number>"
            exit 1
        fi
    else
        echo "No SESSION-START-PROMPT-SHORT.md files found!"
        exit 1
    fi
fi

echo "========================================"
echo "Updating all prompt files to Session $NEW_SESSION_NUMBER"
echo "========================================"

FILES_UPDATED=0

# Function to update a file
update_file() {
    local file=$1
    local module_name=$(basename $(dirname "$file"))

    # Create temp file for safe editing
    local temp_file="${file}.tmp"

    # Read and update content
    if [[ "$module_name" == "cms&marketing-module" ]]; then
        # Special case for CMS module (no hyphen in filenames)
        sed -e "s/Session [0-9]\+/Session $NEW_SESSION_NUMBER/g" \
            -e "s/{SESSION_NUMBER}/$NEW_SESSION_NUMBER/g" \
            -e "s/session[0-9]\+\.plan\.md/session${NEW_SESSION_NUMBER}.plan.md/g" \
            -e "s/session[0-9]\+-summary\.md/session${NEW_SESSION_NUMBER}-summary.md/g" \
            "$file" > "$temp_file"
    else
        # Standard format with hyphen
        sed -e "s/Session [0-9]\+/Session $NEW_SESSION_NUMBER/g" \
            -e "s/{SESSION_NUMBER}/$NEW_SESSION_NUMBER/g" \
            -e "s/session-[0-9]\+\.plan\.md/session-${NEW_SESSION_NUMBER}.plan.md/g" \
            -e "s/session-[0-9]\+-summary\.md/session-${NEW_SESSION_NUMBER}-summary.md/g" \
            "$file" > "$temp_file"
    fi

    # Replace original file
    mv "$temp_file" "$file"

    echo "✓ Updated: $module_name/$(basename "$file")"
    ((FILES_UPDATED++))
}

# Update all SESSION-START-PROMPT-SHORT.md files
for file in "$SCRIPT_DIR"/*/SESSION-START-PROMPT-SHORT.md; do
    if [ -f "$file" ]; then
        update_file "$file"
    fi
done

# Update all SESSION-START-PROMPT.md files (non-SHORT)
for file in "$SCRIPT_DIR"/*/SESSION-START-PROMPT.md; do
    if [ -f "$file" ]; then
        update_file "$file"
    fi
done

# Update MASTER coordination prompt
MASTER_FILE="$SCRIPT_DIR/SESSION-START-PROMPT-MASTER.md"
if [ -f "$MASTER_FILE" ]; then
    temp_file="${MASTER_FILE}.tmp"

    # Replace {CURRENT_SESSION} placeholders and all session numbers
    sed -e "s/{CURRENT_SESSION}/$NEW_SESSION_NUMBER/g" \
        -e "s/Session [0-9]\+/Session $NEW_SESSION_NUMBER/g" \
        -e "s/session-[0-9]\+-summary\.md/session-${NEW_SESSION_NUMBER}-summary.md/g" \
        "$MASTER_FILE" > "$temp_file"

    mv "$temp_file" "$MASTER_FILE"
    echo "✓ Updated: SESSION-START-PROMPT-MASTER.md"
    ((FILES_UPDATED++))
fi

echo "========================================"
echo "✅ Complete! Updated $FILES_UPDATED files to Session $NEW_SESSION_NUMBER"
echo "========================================"

# Show which session plan files agents will now read
echo ""
echo "Agents will now read these session plans:"
echo "  • AI Garage: session-${NEW_SESSION_NUMBER}.plan.md"
echo "  • CMS & Marketing: session${NEW_SESSION_NUMBER}.plan.md (no hyphen)"
echo "  • Expenses & Taxes: session-${NEW_SESSION_NUMBER}.plan.md"
echo "  • Landing/Admin: session-${NEW_SESSION_NUMBER}.plan.md"
echo "  • Main Dashboard: session-${NEW_SESSION_NUMBER}.plan.md"
echo "  • REID Dashboard: session-${NEW_SESSION_NUMBER}.plan.md"
echo "  • Tool Marketplace: session-${NEW_SESSION_NUMBER}.plan.md"