# Xuc Start

Demo: https://start.panxuc.com/

A simple start page based on Next.js.

## Features

- Search engine support
- Customizable links
- Dark mode
- Responsive design

## Installation

1. Clone the repository
2. Install dependencies with `npm install`
3. Build the project with `npm run build`
4. Start the server with `npm run start`
5. Open `http://localhost:3000` in your browser
6. Enjoy!

## Configuration

### Option A: Vercel Blob (Recommended)

This project now reads navigation categories from `Vercel Blob` via `/api/navigation`.

1. Upload a JSON file to Vercel Blob.
2. Set environment variable `NAVIGATION_BLOB_URL` to the Blob file URL.
3. Use this JSON structure:

```json
{
  "常用": [
    { "name": "GitHub", "url": "https://github.com" },
    { "name": "Vercel", "url": "https://vercel.com" }
  ],
  "学习": [
    { "name": "ArXiv", "url": "https://arxiv.org" }
  ]
}
```

If Blob is unavailable or the JSON value is invalid, the app automatically falls back to [`app/config.tsx`](app/config.tsx).

### Admin API (Authenticated)

This project provides an authenticated management API:

- `GET /api/admin/navigation`
- `PUT /api/admin/navigation`
- `POST /api/admin/navigation` (operation-based updates)
- `GET /api/admin/site-settings`
- `PUT /api/admin/site-settings`

Required environment variables:

- `NAVIGATION_ADMIN_TOKEN`: Bearer token for admin API.
- `BLOB_READ_WRITE_TOKEN`: Vercel Blob read/write token.
- `NAVIGATION_BLOB_PATH` (optional): blob pathname to overwrite, default `navigation.json`.
- `NAVIGATION_BLOB_URL`: public URL used by `/api/navigation` for reads.
- `SITE_SETTINGS_BLOB_PATH` (optional): blob pathname to overwrite, default `site-settings.json`.
- `SITE_SETTINGS_BLOB_URL`: public URL used by `/api/site-settings` for reads.

Example: read with auth

```bash
curl -H "Authorization: Bearer $NAVIGATION_ADMIN_TOKEN" \
  https://your-domain.com/api/admin/navigation
```

Example: update navigation JSON

```bash
curl -X PUT \
  -H "Authorization: Bearer $NAVIGATION_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  --data-binary @navigation.json \
  https://your-domain.com/api/admin/navigation
```

Example: add a link

```bash
curl -X POST \
  -H "Authorization: Bearer $NAVIGATION_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "action":"add_link",
    "category":"常用",
    "link":{"name":"OpenAI","url":"https://openai.com"},
    "index":0
  }' \
  https://your-domain.com/api/admin/navigation
```

Example: delete a link

```bash
curl -X POST \
  -H "Authorization: Bearer $NAVIGATION_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "action":"delete_link",
    "category":"常用",
    "url":"https://openai.com"
  }' \
  https://your-domain.com/api/admin/navigation
```

Example: reorder/move a link

```bash
curl -X POST \
  -H "Authorization: Bearer $NAVIGATION_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "action":"move_link",
    "fromCategory":"常用",
    "fromIndex":3,
    "toCategory":"常用",
    "toIndex":0
  }' \
  https://your-domain.com/api/admin/navigation
```

Supported `action` values:

- `add_link`
- `delete_link`
- `move_link`
- `update_link`
- `add_category`
- `delete_category`
- `move_category`
- `rename_category`

### Visual Admin Page

Open `/admin` to manage navigation visually:

- Sign in with `NAVIGATION_ADMIN_TOKEN`
- Add/delete links
- Move links up/down or across categories
- Add/delete/rename/reorder categories

### Option B: Local fallback config

You can still customize the fallback links in [`app/config.tsx`](app/config.tsx).

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
