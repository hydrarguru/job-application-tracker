import { addJobToDatabase } from './db';
import { getCurrentDate } from './utils';

document.addEventListener('DOMContentLoaded', () => {
    /* Button elements are selected when the DOM is loaded. */
    const formInputs = document.querySelectorAll('input');
    const resetButton = document.querySelector('#form-reset-button');
    const submitButton = document.querySelector('#form-submit-button');
    const dashbordButton = document.querySelector('#form-dashboard-button');

    /* Form Dialog Modal */
    const formDialogModal = <HTMLDialogElement>(
        document.querySelector('#formDialog')
    );

    const formDialogErrorModal = <HTMLDialogElement>(
        document.querySelector('#formDialogError')
    );

    function clearFormInputs() {
        formInputs.forEach((input) => {
            input.value = '';
        });
        formInputs[4].value = getCurrentDate(); // sets date input to current date.
    }

    submitButton.addEventListener('click', (e) => {
        e.preventDefault();
        const formInputs = document.querySelectorAll('input');
        const isEveryInputFilled = Array.from(formInputs).every(
            (input) => input.value !== ''
        );

        /*TODO: Add validation for the date input field. */
        /*TODO: Notify user on submit */
        if (isEveryInputFilled) {
            const jobApplication = {
                companyName: formInputs[0].value,
                jobRole: formInputs[1].value,
                jobArea: formInputs[2].value,
                applicationLink: formInputs[3].value,
                appliedDate: formInputs[4].value,
            };
            formDialogModal.showModal();
            console.log(jobApplication);
            //addJobToDatabase('october', jobApplication);
        } else {
            formDialogErrorModal.showModal();
        }
        clearFormInputs();
    });

    /*
    Every child input element's value in the form element is reset.
    The date input field is set to the current date.
    */
    resetButton.addEventListener('click', () => {
        clearFormInputs();
    });

    /* The optins button opens the options page. */
    dashbordButton.addEventListener('click', () => {
        chrome.runtime.openOptionsPage();
    });
});
