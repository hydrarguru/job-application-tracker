/**
 * Returns the current date in the format YYYY-MM-DD.
 * @remarks
 * Utility function.
 */
export function getCurrentDate() {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    return formattedDate;
}

/**
 * Returns the name of the current month.
 * @remarks
 * Utility function.
 */
export function getCurrentMonth() {
    const currentDate = new Date();
    const formattedMonth = currentDate.toLocaleString('default', {
        month: 'long',
    });
    return formattedMonth.toLowerCase();
}
