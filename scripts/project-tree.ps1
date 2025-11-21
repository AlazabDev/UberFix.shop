# scripts/project-tree.ps1
function Show-ProjectTree {
    param([string]$Path = ".")
    
    $excludePatterns = @('node_modules', 'dist', '.git', 'coverage', '.cache', 'android', 'ios')
    
    Get-ChildItem -Path $Path -Recurse -Force | 
    Where-Object { 
        $exclude = $false
        foreach ($pattern in $excludePatterns) {
            if ($_.FullName -match $pattern) {
                $exclude = $true
                break
            }
        }
        -not $exclude
    } |
    ForEach-Object {
        $depth = ($_.FullName -split [IO.Path]::DirectorySeparatorChar).Length - ($Path -split [IO.Path]::DirectorySeparatorChar).Length
        $indent = "  " * $depth
        if ($_.PSIsContainer) {
            Write-Host "$indent📁 $($_.Name)" -ForegroundColor Cyan
        } else {
            Write-Host "$indent📄 $($_.Name)" -ForegroundColor Yellow
        }
    }
}

Write-Host "🌳 هيكل مشروع UberFix.shop" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Show-ProjectTree