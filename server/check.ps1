$css = Invoke-WebRequest -Uri 'http://localhost:3000/assets/index-Djyb792_.css' -UseBasicParsing
Write-Output ("css status=" + $css.StatusCode + " len=" + $css.Content.Length)
Write-Output ("has glass=" + $css.Content.Contains('.glass'))
Write-Output ("has backdrop=" + $css.Content.Contains('backdrop-filter'))
$idx = Invoke-WebRequest -Uri 'http://localhost:3000/' -UseBasicParsing
Write-Output ("index css link=" + ($idx.Content -match 'index-[^"]+\.css'))

Set-Location C:\projectflow\server
node -e "const initSqlJs=require('sql.js');const fs=require('fs');initSqlJs().then(SQL=>{const db=new SQL.Database(fs.readFileSync('data/projectflow.db'));const r=db.exec('SELECT id,name,email,role FROM users');if(r[0]){r[0].values.forEach(v=>console.log(v.join(' | ')))}else{console.log('no users')}})"
