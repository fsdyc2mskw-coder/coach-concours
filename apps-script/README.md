# The athlete's sync script (CHANGE_REQUEST_021)

The app sends its state to this script; the script, running as the athlete, writes it to Drive.
No Google sign-in in the app. Five steps, once:

1. script.google.com → New project. Paste `Code.gs` over the default code. Project settings → tick
   "Show appsscript.json manifest file in editor", open `appsscript.json` and paste this folder's copy.
2. Deploy → New deployment → type Web app, execute as me, who has access anyone → Deploy → Allow.
   The Allow screen must mention only the Drive files this app creates. If it asks for all of Drive, stop.
3. Select the function `setup` → Run. Copy the one line in the execution log (it ends with the code).
   If it starts with `URL_WEB_APP`, replace that word with the Web app URL from step 2 (ends with `/exec`).
4. In the app, Drive tab, paste the line in "Code de connexion" → Enregistrer.
5. Done. To change the code later, run `setup` again and paste the new line on each device.

Never commit a web app URL, a file id or a key to this repository.
