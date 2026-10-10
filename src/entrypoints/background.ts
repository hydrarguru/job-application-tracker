import { createDatabase } from '@/utils/db';

export default defineBackground(() => {
    (async () => {
        await createDatabase();
    })();
});
