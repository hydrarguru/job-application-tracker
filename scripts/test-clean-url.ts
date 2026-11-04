// Run with: node scripts/test-clean-url.ts
import assert from 'node:assert/strict';
import { cleanUrl } from '../src/lib/url.ts';

assert.equal(
    cleanUrl('https://www.linkedin.com/jobs/view/4012345678/?alternateChannel=search&refId=abc%3D%3D&trackingId=xyz&trk=d_flagship3_search_srp_jobs'),
    'https://www.linkedin.com/jobs/view/4012345678/',
);
assert.equal(
    cleanUrl('https://www.linkedin.com/jobs/collections/recommended/?currentJobId=4012345678&eBP=CwEAAA&refId=x&trackingId=y'),
    'https://www.linkedin.com/jobs/collections/recommended/?currentJobId=4012345678',
);
assert.equal(
    cleanUrl('https://se.indeed.com/viewjob?jk=abc123&from=serp&tk=1h2&vjs=3&advn=99'),
    'https://se.indeed.com/viewjob?jk=abc123',
);
assert.equal(cleanUrl('https://example.com/job?id=7&utm_source=x&UTM_Medium=y#apply'), 'https://example.com/job?id=7#apply');
assert.equal(cleanUrl('not a url'), 'not a url');
assert.equal(cleanUrl(''), '');
console.log('cleanUrl: ok');
