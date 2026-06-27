param(
    [string]$SourcePath = "D:\Users\lucas\Documents\GitHub\innV0\FORMAT\.agents\skills\innv0-format",
    [string]$DestPath = "D:\Users\lucas\Documents\GitHub\innV0\iNNv0_skills\skills\innv0-format",
    [switch]$DryRun
)

if (-not (Test-Path -LiteralPath $SourcePath)) {
    Write-Error "Source not found: $SourcePath"
    exit 1
}

if (-not (Test-Path -LiteralPath $DestPath)) {
    Write-Host "Creating destination: $DestPath"
    if (-not $DryRun) { New-Item -ItemType Directory -Path $DestPath -Force | Out-Null }
}

$version = "V_0-1-0"

if ($DryRun) {
    Write-Host "[DRY-RUN] Would copy from: $SourcePath"
    Write-Host "[DRY-RUN] Would copy to:   $DestPath"
    Write-Host "[DRY-RUN] Would set version: $version"
    Write-Host "[DRY-RUN] Would set source_type: mirrored"
    exit 0
}

Copy-Item -Path "$SourcePath\*" -Destination $DestPath -Recurse -Force
Write-Host "Copied $SourcePath -> $DestPath"

$skillMd = Join-Path -Path $DestPath -ChildPath "SKILL.md"
if (Test-Path -LiteralPath $skillMd) {
    $content = [System.IO.File]::ReadAllText($skillMd)
    $eol = if ($content -match "\r\n") { "`r`n" } else { "`n" }

    if ($content -match '(?s)(^---\r?\n)(.*?)(\r?\n---)') {
        $frontmatter = $matches[2]
        $fullMatch = $matches[0]

        if ($frontmatter -match '(?m)^\s*source_type:\s*"original"') {
            $frontmatter = $frontmatter -replace '(?m)(^\s*source_type:\s*)"original"', '${1}"mirrored"'
            if ($frontmatter -notmatch '(?m)^\s*source:\s') {
                $indent = if ($frontmatter -match '(?m)^(\s*)source_type:') { $matches[1] } else { '  ' }
                $sourceLine = "${indent}source: ""https://github.com/innV0/FORMAT"""
                $frontmatter = $frontmatter -replace '(?m)(^\s*source_type:[^\r\n]*)', "`$1$eol$sourceLine"
            }
            $newFrontmatter = "---$eol$frontmatter$eol---"
            $content = $content.Replace($fullMatch, $newFrontmatter)
            [System.IO.File]::WriteAllText($skillMd, $content, [System.Text.UTF8Encoding]::new($false))
            Write-Host "Updated frontmatter: source_type -> mirrored, added source"
        }
        else {
            Write-Host "Frontmatter already has source_type = mirrored, skipping update"
        }
    }
    else {
        Write-Warning "Could not parse frontmatter in $skillMd"
    }
}

Write-Host "`nSync complete. Version: $version"
Write-Host "Next: git add skills/innv0-format && git commit"
