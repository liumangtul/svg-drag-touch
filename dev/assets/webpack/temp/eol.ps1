<#jiain1 20180321#>

<#
#修改执行策略，可忽略
#<管理员执行>
Set-ExecutionPolicy -ExecutionPolicy Unrestricted
#>

#?{$_.psiscontainer -eq $false}
$exts = ('.js','.json','.css','.html','.htm','.wxml','.wxss','.php')
$source = Get-ChildItem -Recurse | ?{$exts -contains $_.Extension}

#方法1
foreach($p in $source){
    $path = Join-Path $p.DirectoryName $p.Name
    $t = [System.IO.File]::ReadAllText($path) -replace '(\r\n|\r|\n)',"`n"
    [System.IO.File]::WriteAllText($path,$t)
    echo $path
}

<#
#方法2
foreach($p in $source){
    $path = Join-Path $p.DirectoryName $p.Name
    $t = (Get-Content -Encoding UTF8 $path) -replace '(\r\n|\r|\n)',"`n"
    $t | Out-File -Encoding utf8 $path
    echo $path
}
#>