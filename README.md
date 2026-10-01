# RAHUL PORTFOLIO — Professional Upload Version

## What this version does
- Dark responsive client portfolio
- 3 categories: 3D / Maya, Video Editing, Graphic Design / Posters
- Projects are stored in `data/projects.json`
- Actual uploaded files are stored in `public/uploads`
- Admin login at `/admin.html`
- Upload images and videos from the website
- Delete published projects
- No project-count limit is coded into the app

## Run on your PC
1. Install Node.js (LTS).
2. Open this folder in Command Prompt/PowerShell.
3. Run:
   npm install
4. Set an admin password:
   Windows PowerShell:
   $env:ADMIN_PASSWORD="your-strong-password"
   (Optional) $env:SESSION_SECRET="long-random-secret"
5. Start:
   npm start
6. Open:
   http://localhost:3000
7. Admin:
   http://localhost:3000/admin.html

Default password ONLY if you do not set ADMIN_PASSWORD:
change-this-password
Change it before putting the site online.

## Important: "Unlimited uploads"
The app has no artificial project-count limit and no artificial per-file byte limit in Multer.
However, no website can provide literally unlimited physical storage. Your hosting/server/cloud storage has finite disk, bandwidth and provider limits.

## For a real public website
For production, use:
- HTTPS
- A strong ADMIN_PASSWORD
- A persistent SESSION_SECRET
- Cloud/object storage for large videos (instead of local disk)
- A real database if you expect many concurrent uploads
- Regular backups

This starter intentionally keeps the setup simple so you can run it locally first.


V17 category update: Added Art and UI/UX & Website categories.
