import { JobData, addJobToDatabase } from "@/utils/db";
import { monthName, setupPageLanguage } from "@/lib/i18n";

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
    const inputNumberRangeValue = document.querySelector('#generateNumberValue') as HTMLElement;
    const inputNumberRangeElement = document.querySelector('#generateNumber') as HTMLInputElement;
    inputNumberRangeElement.valueAsNumber = 1;
    inputNumberRangeValue.textContent = String(generateNumberAmount);

    inputNumberRangeElement.addEventListener('input', () => {
        generateNumberAmount = inputNumberRangeElement.valueAsNumber;
        inputNumberRangeValue.textContent = String(generateNumberAmount);
    });

    const generateMonthlyForm = document.querySelector('#generateMonthlyForm') as HTMLFormElement;
    const selectedMonth = document.querySelector('select[name=month]') as HTMLSelectElement;
    await setupPageLanguage((language) => {
        Array.from(selectedMonth.options).forEach((option, month) => {
            option.textContent = monthName(language, month);
        });
    });
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