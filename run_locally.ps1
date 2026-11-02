# SURAKSHA AI - Local Server Launcher (PowerShell)
$env:PATH = "C:\Users\Muskan Rai\AppData\Local\Programs\nodejs;" + $env:PATH
Set-Location -Path $PSScriptRoot
python start_dev.py
