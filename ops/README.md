# Deployment

Build with Node.js 24 and `npm ci && npm run build`. Only `dist/` is public.
GitHub Actions checks the project and has no production credentials.

For manual deployment, copy `.env.example` to `.env.deploy`, set its values,
and restrict it to mode 600. Keep the SSH private key outside the repository.
Verify the host key through a trusted connection and pin it in the configured
known-hosts file. Run `npm run deploy` from a clean, signed checkout.

The server account has no sudo access. Its root-owned authorized-keys file
uses `restrict,command="/usr/local/libexec/suizhou-receive"`. Install
`receive.py` at that path as root, mode 755. The account may write only its
site directory `/var/www/suizhou`, with a `releases/` directory inside it.
The receiver rejects traversal, links, special files and oversized archives,
then switches `current` atomically. It never writes to the existing image root.

Nginx serves `current/`; its existing image locations and ACME challenge root
remain separate. Keep TLS keys outside all website directories. To roll back,
an administrator atomically switches `current` to a previous release.
Review retained releases before removing any; deployment does not prune them.
