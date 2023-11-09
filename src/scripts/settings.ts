import { addJobToDatabase } from "./db";

document.addEventListener('DOMContentLoaded', async () => {
    let generateNumberAmount = 1;
    const inputNumberRangeLabel = document.querySelector('[name=generateNumberRange]') as HTMLLabelElement;
    const inputNumberRangeElement = document.querySelector('#generateNumber') as HTMLInputElement;
    inputNumberRangeElement.valueAsNumber = 1;
    inputNumberRangeLabel.innerHTML = `Antal jobbansökningar att generera: <strong>${generateNumberAmount}</strong>`;

    inputNumberRangeElement.addEventListener('input', () => {
        generateNumberAmount = inputNumberRangeElement.valueAsNumber;
        inputNumberRangeLabel.innerHTML = `Antal jobbansökningar att generera: <strong>${generateNumberAmount}</strong>`;
    });

    const generateMonthlyForm = document.querySelector('#generateMonthlyForm') as HTMLFormElement;
    const selectedMonth = document.querySelector('select') as HTMLSelectElement;
    const companyName = document.querySelector('#companyName') as HTMLInputElement;
    const jobRole = document.querySelector('#jobRole') as HTMLInputElement;
    const jobArea = document.querySelector('#jobArea') as HTMLInputElement;
    const applicationLink = document.querySelector('#applicationLink') as HTMLInputElement;
    const generateButton = document.getElementById('generateMonthlyButton') as HTMLButtonElement;
    generateButton.addEventListener('click', async (e) => {
        const formData = {
            numberAmount: generateNumberAmount,
            selectedMonth: selectedMonth.value,
            companyName: companyName.value,
            jobRole: jobRole.value,
            jobArea: jobArea.value,
            applicationLink: applicationLink.value,
        }
        for (let i = 1; i < formData.numberAmount + 1; i++) {
            await addJobToDatabase({
                companyName: formData.companyName,
                jobRole: formData.jobRole,
                jobArea: formData.jobArea,
                applicationLink: formData.applicationLink,
                appliedDate: `2023-${formData.selectedMonth}-${i}`
            });
        }
    });
});