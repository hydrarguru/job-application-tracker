/**
 * @returns current date in the format YYYY-MM-DD.
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
 * @returns name of the current month.
 * @remarks
 * Utility function.
 */
export function getCurrentMonth(): string {
    const currentDate = new Date();
    const formattedMonth = currentDate.toLocaleString('default', {
        month: 'long',
    });
    return formattedMonth;
}

export function getCurrentTime(): string {
    const date = new Date();
    return `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
}

/**
 * Takes an array and returns a map of the unique elements and their count.
 * @param array 
 * @returns A map of the unique elements and their count.
 */
export function removeDuplicatesAndCount<T> (array: T[]): Map<T, number> {
    const elementCount = new Map<T, number>();
    const uniqueElements: T[] = [];

    /*
    * Iterate through the array and add each element to the map.
    * If the element already exists in the map, increment its count.
    * If the element does not exist in the map, add it to the map and the uniqueElements array.
     */
    for(const element of array) {
        if(elementCount.has(element)) {
            elementCount.set(element, elementCount.get(element)! + 1);
        }
        else {
            elementCount.set(element, 1);
            uniqueElements.push(element);
        }
    }

    const result = new Map<T, number>();
    for (const element of uniqueElements) {
      result.set(element, elementCount.get(element)!);
    }
    return result;
}
