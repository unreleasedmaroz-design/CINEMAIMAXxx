CINEMA IMAX - Vercel + Xtream

1) Upload this folder to GitHub, or deploy it with the Vercel CLI.
2) In Vercel: Project -> Settings -> Environment Variables.
3) Add these variables to Production (and Preview if you want):
   XTREAM_HOST=https://YOUR-XTREAM-HOST
   XTREAM_USERNAME=YOUR-USERNAME
   XTREAM_PASSWORD=YOUR-PASSWORD
4) Redeploy after saving the variables.
5) Open your deployment URL and test the Egyptian Movies / Egyptian Series sections.

The frontend no longer contains the Xtream username/password. The Vercel function reads them server-side.
Do not commit real credentials into GitHub or put them in index.html.
