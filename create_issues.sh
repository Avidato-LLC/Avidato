#!/bin/bash

# A robust script to read issues from issues.txt and create them on GitHub.
# This version avoids non-standard 'awk' features and is compatible with macOS.

INPUT_FILE="issues.txt"
REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner)

# --- Sanity Checks ---
if ! command -v gh &> /dev/null; then
    echo "GitHub CLI 'gh' could not be found. Please install it to continue."
    exit 1
fi
if [ ! -f "$INPUT_FILE" ]; then
    echo "Error: $INPUT_FILE not found."
    exit 1
fi
if [ -z "$REPO" ]; then
    echo "Error: Could not determine GitHub repository. Are you in a git repo with a remote?"
    exit 1
fi

echo "✓ GitHub CLI found."
echo "✓ Reading issues from $INPUT_FILE for repository: $REPO"
echo "---"

# --- Function to process and create a single issue ---
process_issue() {
    # Trim leading/trailing whitespace from all variables
    local title=$(echo "$TITLE" | sed 's/^[ \t]*//;s/[ \t]*$//')
    local body=$(echo "$BODY" | sed 's/^[ \t]*//;s/[ \t]*$//')
    local labels=$(echo "$LABELS" | sed 's/^[ \t]*//;s/[ \t]*$//')

    if [ -z "$title" ]; then
        return # Skip if title is empty
    fi

    echo "Creating issue: \"$title\""

    # Create labels if they don't exist
    if [ -n "$labels" ]; then
        echo "Checking/creating labels..."
        while IFS=',' read -ra ADDR; do
            for label in "${ADDR[@]}"; do
                clean_label=$(echo "$label" | sed 's/^[ \t]*//;s/[ \t]*$//')
                if [ -n "$clean_label" ]; then
                    echo "  - Creating label if not exists: $clean_label"
                    # Try to create the label, ignore if it already exists
                    gh label create "$clean_label" --color "0366d6" --description "Auto-created label" --repo "$REPO" 2>/dev/null || true
                fi
            done
        done <<< "$labels"
    fi

    # Build the label arguments for the gh command
    local label_args=()
    if [ -n "$labels" ]; then
        # Use a subshell and 'read' to safely split comma-separated labels
        while IFS=',' read -ra ADDR; do
            for label in "${ADDR[@]}"; do
                # Trim whitespace from individual label
                clean_label=$(echo "$label" | sed 's/^[ \t]*//;s/[ \t]*$//')
                if [ -n "$clean_label" ]; then
                    label_args+=("--label" "$clean_label")
                fi
            done
        done <<< "$labels"
    fi
    
    # Create the issue using gh cli
    gh issue create \
        --repo "$REPO" \
        --title "$title" \
        --body "$body" \
        "${label_args[@]}"
    
    echo "---"
}

# --- Main processing loop ---
# Read file line-by-line and build up issue content
TITLE=""
BODY=""
LABELS=""
IS_BODY=false

while IFS= read -r line || [[ -n "$line" ]]; do
    if [[ "$line" == "---" ]]; then
        # End of an issue record, process it
        process_issue
        # Reset variables for the next issue
        TITLE=""
        BODY=""
        LABELS=""
        IS_BODY=false
        continue
    fi

    if [[ $line =~ ^TITLE:\ (.*) ]]; then
        TITLE="${BASH_REMATCH[1]}"
        IS_BODY=false
    elif [[ $line =~ ^LABELS:\ (.*) ]]; then
        LABELS="${BASH_REMATCH[1]}"
        IS_BODY=false
    elif [[ $line == "BODY:" ]]; then
        IS_BODY=true
    elif [[ $IS_BODY == true ]]; then
        # Append line to body, preserving newlines
        BODY+="$line"$'\n'
    fi
done < "$INPUT_FILE"

# Process the very last issue in the file (which won't have a trailing ---)
process_issue

echo "✅ All issues have been processed."