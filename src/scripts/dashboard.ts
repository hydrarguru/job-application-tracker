import { getJobsFromDatabase } from "./db";
import { JobData } from "./db";
//import { jsPDF } from "jspdf";


document.addEventListener('DOMContentLoaded', () => {
    console.log('Dashboard loaded');
    /* Grabbing elements from HTML and assigning them to variables */
    const totalJobsElement = document.querySelector('#totalJobs') as HTMLParagraphElement;
    const totalJobsMonthElement = document.querySelector('#totalJobsMonth') as HTMLParagraphElement;
    const totalJobsTodayElement = document.querySelector('#totalJobsToday') as HTMLParagraphElement;
    const totalJobsMonthHeading = document.querySelector('#totalMonthHeading') as HTMLHeadingElement;

    totalJobsMonthHeading.textContent = `Antal sökta jobb i ${localStorage.getItem('currentMonth').at(0).toUpperCase() + localStorage.getItem('currentMonth').slice(1)}`;
    totalJobsElement.textContent = localStorage.getItem('totalJobs');

    let totalJobs = [];
    getJobsFromDatabase().then((jobs) => {
        jobs.forEach((job) => {
            totalJobs.push(job);
        });
    });
    console.log(totalJobs);
    
    const tableContainer = document.querySelector('#tableContainer') as HTMLDivElement;
    tableContainer.innerHTML = totalJobs[0].jobName;
    

    
  






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