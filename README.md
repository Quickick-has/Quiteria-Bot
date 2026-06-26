# Quiteria-Bot

## Música

O bot possui comandos básicos de música com reprodução via YouTube usando `yt-dlp`.

Comandos disponíveis:

- `tocar` - adiciona uma música à fila e inicia a reprodução no canal de voz em que você está.
- `pausar` - pausa a reprodução atual.
- `passar` - pula a faixa atual.
- `parar` - encerra a reprodução e limpa a fila.

Uso esperado do comando `tocar`:

- Passe um link do YouTube ou um termo de busca.
- Entre em um canal de voz antes de executar o comando.

Observação:

- Se o YouTube bloquear a extração de áudio, defina `YTDLP_COOKIES_FILE` com um arquivo `cookies.txt` exportado do navegador, ou `YTDLP_COOKIES_FROM_BROWSER` com o nome do navegador suportado.

Override do binário `yt-dlp`:

Se o servidor tiver um `yt-dlp` mais novo instalado, você pode forçar o bot a usá-lo definindo `YTDLP_BIN` para o caminho do executável. Exemplos:

Linux/macOS:
```bash
export YTDLP_BIN=/usr/local/bin/yt-dlp
export YTDLP_COOKIES_FILE=/home/bot/cookies.txt
node app.js
```

Windows (PowerShell):
```powershell
$env:YTDLP_BIN = 'C:\path\to\yt-dlp.exe'
$env:YTDLP_COOKIES_FILE = 'C:\path\to\cookies.txt'
node app.js
```

Docker (montando o cookie como volume):
```bash
docker run -v /host/cookies.txt:/app/cookies.txt -e YTDLP_COOKIES_FILE=/app/cookies.txt -e YTDLP_BIN=yt-dlp your-image
```