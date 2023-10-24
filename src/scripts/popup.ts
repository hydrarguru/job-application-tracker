import { getCurrentDate } from './utils';

document.addEventListener('DOMContentLoaded', () => {
    /* Button elements are selected when the DOM is loaded. */
    const formInputs = document.querySelectorAll('input');
    const resetButton = document.querySelector('#form-reset-button');
    const submitButton = document.querySelector('#form-submit-button');
    const optionsButton = document.querySelector('#form-options-button');

    /*
    Every child input element's value in the form element is reset.
    The date input field is set to the current date.
    */
    resetButton.addEventListener('click', () => {
        formInputs.forEach((input) => {
            input.value = '';
        });
        formInputs[4].value = getCurrentDate(); // sets date input to current date.
    });

    /* The optins button opens the options page. */
    optionsButton.addEventListener('click', () => {
        chrome.runtime.openOptionsPage();
    });
});
