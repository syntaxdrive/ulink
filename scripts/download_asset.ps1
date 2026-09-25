param(
    [Parameter(Mandatory = $true)]
    [string]$Url,

    [string]$OutDir = "public/assets/open-campus",

    [switch]$Extract
)

$ErrorActionPreference = 'Stop'

function Get-FileNameFromUrl {
    param([string]$InputUrl)

    $uri = [System.Uri]::new($InputUrl)
    $leaf = [System.IO.Path]::GetFileName($uri.AbsolutePath)

    if ([string]::IsNullOrWhiteSpace($leaf)) {
        return "asset_$(Get-Date -Format 'yyyyMMdd_HHmmss').bin"
    }

    return $leaf
}

if (-not (Test-Path -Path $OutDir)) {
    New-Item -ItemType Directory -Path $OutDir -Force | Out-Null
}

$fileName = Get-FileNameFromUrl -InputUrl $Url
$destination = Join-Path $OutDir $fileName

Write-Host "Downloading: $Url"
Write-Host "Saving to: $destination"

Invoke-WebRequest -Uri $Url -OutFile $destination -UseBasicParsing

if ($Extract -and [System.IO.Path]::GetExtension($destination).ToLowerInvariant() -eq '.zip') {
    $extractDirName = [System.IO.Path]::GetFileNameWithoutExtension($fileName)
    $extractPath = Join-Path $OutDir $extractDirName

    if (-not (Test-Path -Path $extractPath)) {
        New-Item -ItemType Directory -Path $extractPath -Force | Out-Null
    }

    Write-Host "Extracting zip to: $extractPath"
    Expand-Archive -Path $destination -DestinationPath $extractPath -Force
    Write-Host "Done."
} else {
    Write-Host "Done."
}
