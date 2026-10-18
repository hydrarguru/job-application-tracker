# Tour video

`record.mjs` records the tour at the top of the main README: `screenshots/tour.mp4` (1920×1080) and `screenshots/tour.gif` (800 px wide).

It loads the built Chrome extension in headless Chromium with fictional sample data, shows the real popup and pages inside `stage.html` (a mock browser window with captions and a pointer), and plays a scripted walkthrough. The script runs at half speed and the frames are played back at normal speed, so the video stays smooth.

To record it again after a UI change:

```sh
npm run build
npm install --no-save playwright
node scripts/tour/record.mjs
```

It needs Chromium for Playwright (`npx playwright install chromium`) and `ffmpeg` on the PATH. The captions are in English and the walkthrough ends by switching the UI to Swedish.
