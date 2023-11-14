import { JobData, addJobToDatabase } from "./db";

async function generateMonthlyData(numberAmount: number, month:string, companyName:string, jobRole:string, jobArea:string) {
    if(numberAmount < 10)
    {
        for(let i = 1; i < numberAmount + 1; i++) {
            await addJobToDatabase({
                jobId: crypto.randomUUID(),
                companyName: `${companyName}`,
                jobRole: `${jobRole}`,
                jobArea: `${jobArea}`,
                applicationLink: `https://www.findwork.com/${i}`,
                appliedDate: new Date(`2023-${month}-0${i}`).toLocaleDateString(),
            });
        }
    }
    if(numberAmount > 10) {
        for(let i = 1; i <= 10; i++) {
            await addJobToDatabase({
                jobId: crypto.randomUUID(),
                companyName: `${companyName}`,
                jobRole: `${jobRole}`,
                jobArea: `${jobArea}`,
                applicationLink: `https://www.findwork.com/${i}`,
                appliedDate: new Date(`2023-${month}-0${i}`).toLocaleDateString(),
            });
        }
        for(let i = 11; i < numberAmount + 1; i++) {
            await addJobToDatabase({
                jobId: crypto.randomUUID(),
                companyName: `${companyName}`,
                jobRole: `${jobRole}`,
                jobArea: `${jobArea}`,
                applicationLink: `https://www.findwork.com/${i}`,
                appliedDate: new Date(`2023-${month}-${i}`).toLocaleDateString(),
            });
        }
    }


    /*
        await addJobToDatabase({
            companyName: `${companyName}`,
            jobRole: `${jobRole}`,
            jobArea: `${jobArea}`,
            applicationLink: `https://www.findwork.com/${i}`,
            appliedDate: new Date(`2023-11-01`).toLocaleDateString(),
        });
     */
}

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
    const generateButton = document.getElementById('generateMonthlyButton') as HTMLButtonElement;
    generateButton.addEventListener('click', async () => {
        const formData = {
            numberAmount: generateNumberAmount,
            selectedMonth: selectedMonth.value,
            companyName: companyName.value,
            jobRole: jobRole.value,
            jobArea: jobArea.value,
        }
        await generateMonthlyData(
            formData.numberAmount,
            formData.selectedMonth,
            formData.companyName,
            formData.jobRole,
            formData.jobArea,
        );
    });
});