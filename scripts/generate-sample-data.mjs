/* Writes fictional applications to samples/sample-applications.csv, ready to import on the preferences page. */
import { mkdirSync, writeFileSync } from 'node:fs';

const count = Number(process.argv[2]) || 40;

const companies = ['Nordlys Software', 'Saltsjö Labs', 'Björkhagen Bank', 'Kvarnen Systems', 'Fjällräven Digital', 'Östermalm Health', 'Lindholmen Games', 'Mälardalen Energi', 'Skärgård Logistik', 'Vasastan Media', 'Göteborgs Hamn', 'Älvsjö Retail', 'Tallkrona AB', 'Norrsken Cloud', 'Hammarby Tech', 'Umeå Robotics', 'Malmö Fintech', 'Uppsala Biotech', 'Örebro Industri', 'Kiruna Mining Tech'];
const roles = ['Web developer', 'Frontend developer', 'Backend developer', 'Full-stack developer', 'Software engineer', 'DevOps engineer', 'Data analyst', 'QA engineer', 'IT support specialist', 'UX designer', 'Systems administrator', 'Product owner'];
const areas = ['Stockholm', 'Göteborg', 'Malmö', 'Uppsala', 'Örebro', 'Umeå', 'Linköping', 'Västerås', 'Remote', 'Lund'];

/* Seeded, so every run produces the same file. */
let seed = 7;
const random = () => {
    seed = (seed * 1664525 + 1013904223) % 2 ** 32;
    return seed / 2 ** 32;
};
const pick = (list) => list[Math.floor(random() * list.length)];

const slug = (name) => name.toLowerCase().replace(/å|ä/g, 'a').replace(/ö/g, 'o').replace(/\s+/g, '-');
const start = new Date(Date.UTC(2026, 4, 1));
const header = ['companyName', 'jobRole', 'employmentType', 'jobArea', 'applicationLink', 'appliedDate'];
const rows = Array.from({ length: count }, (_, i) => {
    const date = new Date(start.getTime() + (Math.floor((i * 170) / count) + Math.floor(random() * 3)) * 86_400_000);
    const company = pick(companies);
    return [company, pick(roles), random() < 0.75 ? 'full' : 'part', pick(areas), `https://jobs.example.com/${slug(company)}/${1000 + i}`, date.toISOString().slice(0, 10)];
});

mkdirSync('samples', { recursive: true });
writeFileSync('samples/sample-applications.csv', [header, ...rows].map((row) => row.join(',')).join('\n') + '\n');
console.log(`Wrote ${count} applications to samples/sample-applications.csv`);
