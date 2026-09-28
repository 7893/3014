# Deployment

Build with Node.js 24 and `npm ci && npm run build`. Only `dist/` is public.
GitHub Actions checks the project and has no production credentials.

For manual deployment, copy `.env.example` to `.env.deploy`, set its values,
and restrict it to mode 600. Keep the SSH private key outside the repository.
Verify the host key through a trusted connection and pin it in the configured
known-hosts file. Run `npm run deploy` from a clean, signed checkout.

Optionally set `ASSET_BASE_URL` to an HTTPS CDN origin in the private deployment
file. Deployment loads it before building; ordinary development and CI builds
keep same-origin assets. Never commit the actual CDN or origin destination.
The page address remains independent of the asset address. The CDN must allow
cross-origin module/font requests, preserve correct MIME types, and use HTTPS.

## Routine publishing and CDN caching

Normal artwork changes use the same `npm run deploy` command. Vite generates
content-hashed JavaScript, CSS and font filenames and updates their HTML references.
The private asset-origin setting stays fixed. Serve entry HTML with `no-cache`
and hashed assets with `public, max-age=31536000, immutable`.

After the receiver switches the release atomically, CloudFront fetches each new
asset URL on demand. Unchanged URLs retain their caches, and retained old files
keep already-open pages working. Routine releases do not edit the distribution,
DNS, certificates or origins, and do not require cache invalidations. Configure
those once; reconsider them only for infrastructure or cache-policy changes.
Verify delivery and resource hashes after publication. CDN caching accelerates
asset downloads; animation frame rate still depends on the visitor's device.

The server account has no sudo access. Its root-owned authorized-keys file
uses `restrict,command="/usr/local/libexec/suizhou-receive"`. Install
`receive.py` at that path as root, mode 755. The account may write only its
site directory `/var/www/suizhou`, with a `releases/` directory inside it.
The receiver rejects traversal, links, special files and oversized archives,
then switches `current` atomically. It never writes to the existing image root.

The receiver retains content-hashed JavaScript, CSS and fonts under `assets/`,
using hard links to release files. Reusing a hashed filename with different
bytes is rejected. Serve `/assets/` from this retained directory with long-lived
immutable caching, falling back to `current/assets/` for unversioned notices.
This keeps older open pages working after deployment. Do not prune retained
assets automatically: old browser pages and CDN caches may still reference them.

Nginx serves `current/`; its existing image locations and ACME challenge root
remain separate. Keep TLS keys outside all website directories. To roll back,
an administrator atomically switches `current` to a previous release.
Review retained releases before removing any; deployment does not prune them.

The build ships a deny-all `robots.txt` and a noindex HTML meta tag. Serve
`/robots.txt` on every public entry and asset origin, including HTTP, and add
`X-Robots-Tag: noindex, nofollow, nosnippet, noimageindex` to all responses.
Repeat the header in Nginx locations that set their own response headers.
Invalidate CDN caches after changing this policy. These are crawler directives,
not access controls; blocking crawling can prevent discovery of noindex tags
and does not guarantee removal of previously indexed URLs.
