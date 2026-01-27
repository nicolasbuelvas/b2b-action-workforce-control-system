# Delete All Screenshots PowerShell Script
# This script deletes all screenshot files from the uploads directory
# Run this AFTER running clean-all-task-data.sql

$screenshotsPath = ".\backend\uploads\screenshots"

if (Test-Path $screenshotsPath) {
    Write-Host "Deleting all screenshots from: $screenshotsPath" -ForegroundColor Yellow
    
    # Get count before deletion
    $fileCount = (Get-ChildItem -Path $screenshotsPath -File -Recurse).Count
    Write-Host "Found $fileCount screenshot files" -ForegroundColor Cyan
    
    # Delete all files
    Remove-Item -Path "$screenshotsPath\*" -Recurse -Force
    
    Write-Host "All screenshots deleted successfully!" -ForegroundColor Green
    
    # Verify deletion
    $remainingCount = (Get-ChildItem -Path $screenshotsPath -File -Recurse).Count
    Write-Host "Remaining files: $remainingCount" -ForegroundColor Cyan
} else {
    Write-Host "Screenshots directory not found: $screenshotsPath" -ForegroundColor Red
}
