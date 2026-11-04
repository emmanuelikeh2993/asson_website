$raw = [System.IO.File]::ReadAllText("c:\Users\LENOVO PC\Desktop\antigravity_ide\ASSON\asson_website1\gemini.md", [System.Text.Encoding]::UTF8)

# Let's replace the Greek Alpha in ANIMATION if present
$raw = $raw -replace "\u0391\u039D\u0399\u039C\u0391\u03A4\u0399\u039F\u039D", "ANIMATION"
$raw = $raw -replace "ΑΝΙΜATION", "ANIMATION"

# Let's see what distinct lines we have
$lines = $raw -split "\r?\n"
Write-Output "Lines: $($lines.Count)"
for ($i = 0; $i -lt $lines.Count; $i++) {
    Write-Output "--- Line $i (Length: $($lines[$i].Length)) ---"
    $chunks = $lines[$i] -split "   +"
    Write-Output "Chunks in line $i : $($chunks.Count)"
}

