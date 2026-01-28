$content = Get-Content -Path "c:\Users\nicol\Downloads\b2b-action-workforce-control-system\backend\src\modules\subadmin\subadmin.controller.ts" -Raw

# Fix the malformed newlines from previous replacement
$content = $content -replace '`n', "`n"

# Fix LinkedIn Research endpoint - change return result.data to return result
$content = $content -replace '(\s*return result\.data;\s*}\s*\/\*\*\s*\* POST /subadmin/research/linkedin)', "`$1" -replace 'return result\.data;(\s*}\s*\/\*\*\s*\* POST /subadmin/research/linkedin)', "return result;`$1"

# Save the fixed content
Set-Content -Path "c:\Users\nicol\Downloads\b2b-action-workforce-control-system\backend\src\modules\subadmin\subadmin.controller.ts" -Value $content

Write-Host "File fixed successfully!"
