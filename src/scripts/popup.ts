import { addJobToDatabase } from './db';
import { getCurrentDate } from './utils';

document.addEventListener('DOMContentLoaded', () => {
    chrome.runtime.sendMessage('offscreen');
    /* Button elements are selected when the DOM is loaded. */
    const formInputs = document.querySelectorAll('input') as NodeListOf<HTMLInputElement>;
    const resetButton = document.querySelector('#form-reset-button') as HTMLButtonElement;
    const submitButton = document.querySelector('#form-submit-button') as HTMLButtonElement;
    const dashbordButton = document.querySelector('#form-dashboard-button') as HTMLButtonElement;
    const formDatePicker = formInputs[4] as HTMLInputElement;

    /* The date input field is set to the current date. */
    formDatePicker.value = getCurrentDate();

    /* Form Dialog Modals */
    const formModal = document.querySelector('#formDialog') as HTMLDialogElement;
    const formErrorModal = document.querySelector('#formDialogError') as HTMLDialogElement;

    /*
    * Clear the input fields in the form element and sets the date input field to the current date.
    */
    function clearFormInputs() {
        formInputs.forEach((input) => {
            input.value = '';
        });
        formDatePicker.value = getCurrentDate();
    }

    submitButton.addEventListener('click', (e) => {
        e.preventDefault();
        const formInputs = document.querySelectorAll('input');
        const isEveryInputFilled = Array.from(formInputs).every(
            (input) => input.value !== ''
        );

        /*TODO: Add validation for the date input field. */
        if (isEveryInputFilled) {
            const jobApplication = {
                companyName: formInputs[0].value,
                jobRole: formInputs[1].value,
                jobArea: formInputs[2].value,
                applicationLink: formInputs[3].value,
                appliedDate: formInputs[4].value,
            };
            formModal.showModal();
            console.log(jobApplication);
            addJobToDatabase(jobApplication);
            clearFormInputs();
        } else {
            formErrorModal.showModal();
        }
    });

    formErrorModal.addEventListener('click', (e) => {
        const dialogDimensions = formErrorModal.getBoundingClientRect()
        if (
          e.clientX < dialogDimensions.left ||
          e.clientX > dialogDimensions.right ||
          e.clientY < dialogDimensions.top ||
          e.clientY > dialogDimensions.bottom
        ) {
            formErrorModal.close()
        }
    })


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
