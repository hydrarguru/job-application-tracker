// Records the tour video in screenshots/ (tour.mp4 and tour.gif). See README.md in this folder.
import { chromium } from 'playwright';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const K = 2; // runs everything K times slower, then plays back at normal speed for smoother frames
const dir = path.dirname(new URL(import.meta.url).pathname);
const root = path.resolve(dir, '../..');
const work = fs.mkdtempSync(path.join(os.tmpdir(), 'jat-tour-'));
const ext = path.join(work, 'ext');
const framesDir = path.join(work, 'frames');
fs.cpSync(path.join(root, 'dist/chrome-mv3'), ext, { recursive: true });
fs.mkdirSync(framesDir);

const css = fs.readdirSync(path.join(ext, 'assets')).find((f) => f.startsWith('mount-') && f.endsWith('.css'));
fs.copyFileSync(path.join(dir, 'stage.js'), path.join(ext, 'stage.js'));
fs.writeFileSync(path.join(ext, 'stage.html'), fs.readFileSync(path.join(dir, 'stage.html'), 'utf8').replace('__CSS__', css));

const context = await chromium.launchPersistentContext(path.join(work, 'profile'), {
    channel: 'chromium',
    headless: true,
    viewport: { width: 1280, height: 720 },
    deviceScaleFactor: 1.5,
    locale: 'en-US',
    timezoneId: 'Europe/Stockholm',
    args: [`--disable-extensions-except=${ext}`, `--load-extension=${ext}`, '--hide-scrollbars'],
});
let [worker] = context.serviceWorkers();
if (!worker) worker = await context.waitForEvent('serviceworker');
const id = new URL(worker.url()).host;
const base = `chrome-extension://${id}`;

const page = context.pages()[0] ?? (await context.newPage());
await page.goto(`${base}/stage.html`);

// Seed fictional sample data and English UI.
const sample = (() => {
    const companies = ['Fjällvik Systems', 'Kvarnby Digital', 'Saltsjö Labs', 'Ekbacken IT', 'Molnhavet', 'Granit Software',
        'Vattenfors Tech', 'Björkdal Media', 'Solhem Data', 'Havsbris Consulting', 'Lindgren & Berg', 'Tallåsen Studio'];
    const roles = ['Frontend developer', 'Fullstack developer', 'React developer', 'Web developer', 'UX engineer', 'Junior developer'];
    const areas = ['Stockholm', 'Göteborg', 'Malmö', 'Uppsala', 'Remote', 'Linköping'];
    const perMonth = [3, 5, 4, 6, 3, 2, 4, 7, 9, 6]; // Jan..Oct 2026
    const jobs = [];
    let n = 0;
    perMonth.forEach((count, m) => {
        for (let i = 0; i < count; i++) {
            const maxDay = m === 9 ? 17 : 28;
            const day = 1 + ((i * 7 + m * 3) % maxDay);
            const date = `2026-${String(m + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const job = {
                jobId: `sample-${n}`,
                companyName: companies[(n * 5 + m) % companies.length],
                jobRole: roles[(n * 3) % roles.length],
                employmentType: n % 4 === 3 ? 'part' : 'full',
                jobArea: areas[(n * 7) % areas.length],
                applicationLink: `https://jobs.example.com/${n}`,
                appliedDate: date,
            };
            if (m < 9 || day < 12) job.reportedAt = `${date}T16:${String(10 + (n % 40)).padStart(2, '0')}:00`;
            jobs.push(job);
            n++;
        }
    });
    jobs.push({ jobId: 'sample-today', companyName: 'Saltsjö Labs', jobRole: 'Web developer', employmentType: 'full', jobArea: 'Stockholm', applicationLink: 'https://jobs.example.com/today', appliedDate: '2026-10-18' });
    return jobs;
})();
await page.evaluate(async (jobs) => {
    await chrome.storage.local.set({ language: 'en' });
    await new Promise((resolve, reject) => {
        const req = indexedDB.open('JAT-DB', 1);
        req.onupgradeneeded = () => {
            const store = req.result.createObjectStore('jobsTable', { keyPath: 'id', autoIncrement: true });
            store.createIndex('jobId', 'jobId', { unique: true });
            for (const k of ['companyName', 'jobRole', 'jobArea', 'applicationLink', 'appliedDate']) store.createIndex(k, k);
        };
        req.onsuccess = () => {
            const tx = req.result.transaction('jobsTable', 'readwrite');
            for (const job of jobs) tx.objectStore('jobsTable').add(job);
            tx.oncomplete = () => { req.result.close(); resolve(); };
            tx.onerror = () => reject(tx.error);
        };
        req.onerror = () => reject(req.error);
    });
}, sample);
await page.reload();
await page.waitForTimeout(800);

// Size the popup iframe to its content.
const popup = page.frameLocator('#popup');
const app = page.frameLocator('#app-frame');
await popup.locator('#companyName').waitFor();
await page.evaluate(() => {
    const f = document.getElementById('popup');
    f.style.height = f.contentDocument.body.scrollHeight + 'px';
});
await page.evaluate(() => document.fonts.ready);

// ---- Screencast capture ----
const cdp = await context.newCDPSession(page);
await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 720, deviceScaleFactor: 1.5, mobile: false });
const frames = [];
let saving = Promise.resolve();
let capturing = true;
await cdp.send('Animation.enable');
const t0 = performance.now();
await cdp.send('Animation.setPlaybackRate', { playbackRate: 1 / K });
const captureLoop = (async () => {
    while (capturing) {
        const t = (performance.now() - t0) / 1000 / K;
        const { data } = await cdp.send('Page.captureScreenshot', { format: 'jpeg', quality: 92, optimizeForSpeed: true });
        const file = path.join(framesDir, `f${String(frames.length).padStart(5, '0')}.jpg`);
        frames.push({ file, t });
        saving = saving.then(() => fs.promises.writeFile(file, Buffer.from(data, 'base64')));
    }
})();

const wait = (ms) => page.waitForTimeout(ms * K);
const stage = (fn, ...args) => page.evaluate(([fn, args]) => window.stage[fn](...args), [fn, args]);

/* Moves the fake cursor to an element inside an iframe. */
async function point(frameId, locator, dwell = 750) {
    const rect = await locator.evaluate((el) => {
        el.scrollIntoView({ block: 'nearest' });
        const r = el.getBoundingClientRect();
        return { x: r.x, y: r.y, width: r.width, height: r.height };
    });
    const { x, y } = await page.evaluate(([f, r]) => window.stage.toStage(f, r), [frameId, rect]);
    await stage('cursor', x, y);
    await wait(dwell);
}
async function click(frameId, locator, after = 400) {
    await point(frameId, locator);
    await stage('click');
    await locator.evaluate((el) => el.click());
    await wait(after);
}
async function type(frameId, locator, text) {
    await click(frameId, locator, 150);
    await locator.pressSequentially(text, { delay: 12 * K });
    await wait(250);
}

/* Smoothly scrolls the app iframe so the element's top sits `offset` px below the top (or to the top). */
async function scrollApp(locator, ms = 900, offset = 24) {
    const target = locator ? await locator.evaluate((el, o) => el.getBoundingClientRect().top + scrollY - o, offset) : 0;
    await app.locator('body').evaluate((_, [to, dur]) => new Promise((done) => {
        const from = scrollY; const start = performance.now();
        const step = () => { const now = performance.now();
            const p = Math.min(1, (now - start) / dur); const e = p < .5 ? 2 * p * p : 1 - (-2 * p + 2) ** 2 / 2;
            scrollTo(0, from + (to - from) * e);
            p < 1 ? setTimeout(step, 16) : done();
        };
        step();
    }), [target, ms * K]);
}

// ---- Script ----
await stage('cursorVisible', false);
await wait(2300); // intro card
await stage('card', 'intro', false);
await stage('cursor', 900, 330);
await stage('cursorVisible', true);
await wait(700);

await stage('caption', 1, 'Applied for a job? Open the extension from the toolbar.');
await wait(500);
await stage('cursor', 1220, 44);
await wait(900);
await stage('click');
await stage('popup', true);
await wait(1200);

await stage('caption', 2, 'Fill in the company, role, area and a link to the posting.');
await type('popup', popup.locator('#companyName'), 'Nordlys AB');
await type('popup', popup.locator('#jobRole'), 'Frontend developer');
await type('popup', popup.locator('#jobArea'), 'Göteborg');
await type('popup', popup.locator('#applicationLink'), 'https://jobs.example.com/42');
await wait(400);

await stage('caption', 3, 'Today’s date is filled in for you. Click Add application.');
await point('popup', popup.locator('#appliedDate'), 1100);
await click('popup', popup.getByRole('button', { name: 'Add application' }), 1900);
await stage('popup', false);
await wait(500);

// Overview
await page.evaluate((u) => { document.getElementById('app-frame').src = u; }, `${base}/dashboard.html`);
await app.getByRole('heading', { name: 'Applications' }).waitFor();
await stage('url', 'Job Application Tracker › Overview');
await stage('scene', 'app');
await stage('caption', 4, 'Overview lists every application, newest first.');
await wait(1200);
const row = app.locator('tr', { hasText: 'Nordlys AB' });
await point('app-frame', row.locator('td').first(), 1500);

await stage('caption', 5, 'Need to change something? Edit the application.');
await click('app-frame', row.getByRole('button', { name: /Edit/ }), 900);
const role = app.locator('#edit-jobArea');
await click('app-frame', role, 150);
await role.press('End');
await wait(200);
await role.press('Shift+Home');
await wait(250);
await role.pressSequentially('Remote', { delay: 12 * K });
await wait(400);
await click('app-frame', app.getByRole('button', { name: 'Save' }), 1600);

await stage('caption', 6, 'Mark it as reported to Arbetsförmedlingen.');
await wait(400);
await click('app-frame', row.locator('button[aria-pressed="false"]'), 2200);

// Statistics
await stage('caption', 7, 'Statistics shows how many jobs you apply for each month.');
await click('app-frame', app.getByRole('link', { name: 'Statistics' }), 300);
await app.getByRole('button', { name: 'Table' }).waitFor();
await stage('url', 'Job Application Tracker › Statistics');
await wait(1600);
await scrollApp(app.getByRole('heading', { name: 'Jobs per month' }));
await wait(1200);
await stage('caption', 8, 'Prefer numbers? Switch to the table view.');
await wait(300);
await click('app-frame', app.getByRole('button', { name: 'Table' }), 2400);

// Preferences
await stage('caption', 9, 'Choose English or Swedish in Preferences.');
await scrollApp(null, 700);
await click('app-frame', app.getByRole('link', { name: 'Preferences' }), 300);
await app.getByRole('radio', { name: /Svenska/ }).waitFor();
await stage('url', 'Job Application Tracker › Preferences');
await wait(1200);
await click('app-frame', app.getByRole('radio', { name: /Svenska/ }), 1600);
await click('app-frame', app.getByRole('link', { name: 'Översikt' }), 300);
await stage('url', 'Job Application Tracker › Översikt');
await wait(2200);

await stage('caption', 0, '');
await stage('cursorVisible', false);
await stage('card', 'outro', true);
await wait(3000);

capturing = false;
await captureLoop;
await saving;
await context.close();

// Each frame is shown until the next one was taken, then everything is resampled to 30 fps.
const list = frames.map((f, i) => `file '${f.file}'\nduration ${((frames[i + 1]?.t ?? f.t + 0.1) - f.t).toFixed(4)}`);
fs.writeFileSync(path.join(work, 'concat.txt'), `${list.join('\n')}\nfile '${frames.at(-1).file}'\n`);
const out = path.join(root, 'screenshots');
const ffmpeg = (...args) => execFileSync('ffmpeg', ['-loglevel', 'error', '-y', ...args], { stdio: 'inherit' });
ffmpeg('-f', 'concat', '-safe', '0', '-i', path.join(work, 'concat.txt'), '-vf', 'fps=30,format=yuv420p',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '20', '-movflags', '+faststart', path.join(out, 'tour.mp4'));
ffmpeg('-i', path.join(out, 'tour.mp4'), '-vf',
    'fps=12,scale=800:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=128:stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=4:diff_mode=rectangle',
    path.join(out, 'tour.gif'));
fs.rmSync(work, { recursive: true, force: true });
console.log(`Saved screenshots/tour.mp4 and screenshots/tour.gif (${(frames.at(-1).t - frames[0].t).toFixed(1)} s)`);
