import { getJobsFromDatabase } from "./db";
//import { jsPDF } from "jspdf";

document.addEventListener('DOMContentLoaded', () => {
    console.log('Dashboard loaded');
    /* Grabbing elements from HTML and assigning them to variables */
    const totalJobsElement = document.querySelector('#totalJobs') as HTMLParagraphElement;
    const totalJobsMonthElement = document.querySelector('#totalJobsMonth') as HTMLParagraphElement;
    const totalJobsTodayElement = document.querySelector('#totalJobsToday') as HTMLParagraphElement;

    totalJobsElement.textContent = localStorage.getItem('totalJobs');

    /*
    const exportToPDFButton = document.querySelector('#exportPDF') as HTMLButtonElement;
    exportToPDFButton.addEventListener('click', async () => {
        const jobs = JSON.stringify(await getJobsFromDatabase());
        jobs.split(',').join('\n');
        const doc = new jsPDF();
        doc.text(jobs., 10, 10, { align: 'left', maxWidth: 180, lineHeightFactor: 1.5 });
        doc.save('test.pdf');
    });
    */
});