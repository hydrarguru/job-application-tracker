import { getCurrentDate } from './utils';

document.addEventListener('DOMContentLoaded', () => {
    /* Button elements are selected when the DOM is loaded. */
    const formInputs = document.querySelectorAll('input');
    const resetButton = document.querySelector('#form-reset-button');
    const submitButton = document.querySelector('#form-submit-button');
    const dashbordButton = document.querySelector('#form-dashboard-button');

    submitButton.addEventListener('click', (e) => {
        e.preventDefault();
        const jobApplication = {
            companyName: formInputs[0].value,
            jobRole: formInputs[1].value,
            jobArea: formInputs[2].value,
            applicationLink: formInputs[3].value,
            applicationDate: formInputs[4].value,
        };
        alert(JSON.stringify(jobApplication));
        console.log(jobApplication);
    });

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
    dashbordButton.addEventListener('click', () => {
        chrome.runtime.openOptionsPage();
    });
});
