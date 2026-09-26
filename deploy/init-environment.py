"""Create secrets only for this new deployment; never overwrite an existing .env."""
from pathlib import Path
import os, secrets, base64
root = Path(__file__).resolve().parent.parent
destination = root / '.env'
if destination.exists():
    print('Environment already exists; unchanged.')
else:
    content = (root / 'deploy/production.env.example').read_text()
    content = content.replace('APP_KEY=\n', 'APP_KEY=base64:' + base64.b64encode(secrets.token_bytes(32)).decode() + '\n')
    content = content.replace('DB_PASSWORD=\n', 'DB_PASSWORD=' + secrets.token_hex(32) + '\n')
    fd = os.open(destination, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
    with os.fdopen(fd, 'w') as f:
        f.write(content)
    print('Created isolated application/database secrets. Administrator password remains unset.')
