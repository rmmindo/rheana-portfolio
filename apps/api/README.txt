rheana-portfolio API
====================

Express service behind rheanamindo.me. Currently serves the unique-visitor
counter. The AI chatbot mounts here later behind the same CORS policy and rate
limiter.

Endpoints
---------
  GET  /healthz      Liveness probe. Returns {"ok": true}.
  POST /api/visit    Records a visit, returns {total, today, counted}.
  GET  /api/stats    Reads {total, today} without recording anything.

Both /api routes are rate limited to 30 requests per minute per IP.

How unique visitors are counted without storing personal data
-------------------------------------------------------------
Counting unique visitors means recognising a returning one. The obvious way is
to store the IP address, and an IP address is personal data under GDPR. A
portfolio counter is not a good enough reason to hold it.

Instead the service hashes the IP and user agent together with a secret salt
that rotates every day:

  hash = sha256(SECRET | YYYY-MM-DD | ip | user-agent)

The hash identifies a visitor within a single day and becomes unlinkable the
next. The database can answer "how many distinct people visited today" and can
never answer "was this specific person here". The raw IP is never written to
disk. Rows older than two days are pruned hourly; the lifetime total is kept in
a separate counter, so pruning never rewinds the number.

VISITOR_SALT is read from the environment. When it is unset the service
generates a random salt at startup, which means a restart makes previous hashes
unmatchable and a returning visitor is counted once more. Set it in production.

Local development
-----------------
  npm install
  npm run dev --workspace apps/api      Watches and restarts.
  npm run test --workspace apps/api     19 tests.

With no DB_PATH set the store runs in memory, so local runs leave nothing
behind.

Deploying to Fly.io
-------------------
flyctl is not installed on this machine yet. Install it first:

  powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"

Then, from the repository root:

  fly auth login                          Opens a browser. Interactive.
  fly launch --no-deploy --name rheana-api --region sin
  fly volumes create data --size 1 --region sin
  fly secrets set VISITOR_SALT=$(openssl rand -hex 32)
  fly deploy --config apps/api/fly.toml

Region sin is Singapore, the closest Fly region to the Philippines.

The volume matters: the SQLite file lives at /data/visitors.db, and without the
volume every redeploy would reset the counter to zero.

fly.toml sets auto_stop_machines, so the machine sleeps when idle and restarts
in about a second on the next request. That keeps the service inside the free
allowance. The counter renders after the page has already painted, so a cold
start is invisible to the visitor.

Connecting the site to the API
------------------------------
After the first successful deploy, put the URL in apps/web/.env.production:

  VITE_API_BASE=https://rheana-api.fly.dev

then rebuild and push. Until that value is set, VisitorCount renders nothing at
all and the footer simply has one fewer line. The site is deployable with no
backend at any time.

To serve the API from the custom domain instead:

  fly certs create api.rheanamindo.me

then add the CNAME that command prints at Namecheap, and set VITE_API_BASE to
https://api.rheanamindo.me.
