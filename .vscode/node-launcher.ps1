# FNM Node Launcher for VS Code Debugging
# This script ensures the fnm-managed Node executable is found and launched

# Initialize fnm in the current PowerShell session
Invoke-Expression (fnm env --shell powershell)

# Get the full path to node from fnm
$NodePath = (Get-Command node -ErrorAction SilentlyContinue).Source

if (-not $NodePath) {
  Write-Error "Node executable not found. Please ensure fnm is properly installed and configured."
  exit 1
}

# Execute node with all passed arguments
& $NodePath @args
