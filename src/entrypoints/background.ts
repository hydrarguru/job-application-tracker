import { createDatabase } from '@/utils/db';
import { handleMessages } from '@/utils/messages';

export default defineBackground(() => {
    /* Registered first and synchronously so a message that wakes the background script is answered. */
    handleMessages();
    (async () => {
        await createDatabase();
    })();
});
