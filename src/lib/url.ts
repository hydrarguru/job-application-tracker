/*
 * Query parameters job boards and ad networks add for tracking. Anything not listed is kept,
 * because some sites need their parameters to find the posting (Indeed's `jk`, LinkedIn's `currentJobId`).
 */
const TRACKING_PARAMS = new Set([
    // Generic / ad networks
    'fbclid', 'gclid', 'gclsrc', 'dclid', 'msclkid', 'yclid', 'twclid', 'ttclid', 'li_fat_id',
    'mc_cid', 'mc_eid', '_hsenc', '_hsmi', 'igshid', 'ref', 'ref_src', 'referrer', 'source', 'src',
    // LinkedIn
    'trk', 'trkinfo', 'trackingid', 'refid', 'lipi', 'midtoken', 'midsig', 'ebp', 'eid',
    'originalsubdomain', 'origin', 'position', 'pagenum', 'recommendedflavor', 'alternatechannel',
    // Indeed
    'from', 'tk', 'vjs', 'advn', 'adid', 'ad', 'sjdu', 'acatk', 'pub', 'camk', 'xkcb', 'xpse', 'xfps', 'cmp', 'sid',
    // Glassdoor, StepStone, Workday, Greenhouse and similar
    'guid', 'ao', 'cs', 'cb', 'jrtk', 'ctt', 'srs', 'gh_src', 'lever-source', 'lever-origin', 'tracking',
]);

/** Returns the URL without tracking parameters, or the input unchanged if it is not a valid URL. */
export function cleanUrl(input: string): string {
    const text = input.trim();
    let url: URL;
    try {
        url = new URL(text);
    } catch {
        return input;
    }
    for (const key of [...url.searchParams.keys()]) {
        const lower = key.toLowerCase();
        if (lower.startsWith('utm_') || TRACKING_PARAMS.has(lower)) url.searchParams.delete(key);
    }
    return url.toString();
}
