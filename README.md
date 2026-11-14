# Subiz Developer Docs

Static Astro documentation with MDX Content Collections, React 19, Astryx neutral production theme, Shiki, and Algolia search with a Pagefind fallback.

```sh
npm ci
npm run dev
npm run check
npm run build
npm run preview
```

Open `http://localhost:4321/developers`. Production uses `https://subiz.com.vn/developers` with the same routes and asset paths. See [authoring instructions](docs/CONTRIBUTING.md).

Authentication and message request handling are verified against the local API gateway source. Downstream delivery rules have not been fully verified.

Published sections: Get Started, Users, Conversations, Messages, and Webhooks. Webhooks covers receiving events, signature verification, and payload examples only.

Run `node tests/content.mjs` after building to verify internal links, exports, JSON payloads, and the documented webhook signature code.

Search uses the existing Algolia public configuration from the Subiz help docs. See [search activation](docs/SEARCH.md) for the crawler update required after production deployment.

## Build and deploy to VNPT

The `apidocs` container serves static files under `/developers`, including assets,
Pagefind, Markdown exports, and `llms.txt`. `/docs` belongs to the existing help
center and is not changed. The VNPT website proxy forwards `/developers` and
`/developers/*` to `apidocs:80` without stripping the prefix.

Build and push using the same Artifact Registry as `newhomepage`:

```sh
gcloud builds submit --project=subiz-version-4 --config=cloudbuild.yml .
```

For a repository trigger, select `cloudbuild.yml` as its configuration file.
Cloud Build publishes `asia-southeast1-docker.pkg.dev/subiz-version-4/subiz/apidocs`
with `latest` and an immutable build-ID tag. The build runs the type check, static
build, and content/link validation before publishing. Cloud Build does not SSH to
the server or restart services.

After a successful build, synchronize the updated `vnpt/docker-compose.yaml` and
`vnpt/nginx.subiz.com.vn.conf` from the deployment configuration repository (`server`) into `/app/vnpt` on VNPT.
Then run on VNPT (using its existing Artifact Registry authentication):

```sh
cd /app/vnpt
docker compose config --quiet
docker compose pull apidocs
docker compose up -d --no-deps apidocs
docker compose exec -T apidocs nginx -t
docker compose exec -T nginx-subiz-com-vn nginx -t
docker compose exec -T nginx-subiz-com-vn nginx -s reload
curl -fsS -o /dev/null -H 'Host: subiz.com.vn' http://127.0.0.1:8081/developers/webhooks/receiving
curl -fsS -o /dev/null https://subiz.com.vn/developers/webhooks/receiving
curl -fsS -o /dev/null https://subiz.com.vn/developers/webhooks/receiving.md
```

Reloading the website proxy applies the new route. Subsequent documentation-only
releases need only `pull apidocs` and `up -d --no-deps apidocs`. For rollback, set
its Compose image tag to a previous successful build ID and recreate that service.

Local production preview and browser checks:

```sh
npm run preview -- --host 127.0.0.1 --port 4321
# In another terminal:
node tests/browser.mjs
node tests/search.mjs
```
