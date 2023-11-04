document.addEventListener('DOMContentLoaded', () => {
    console.log('Dashboard loaded');
    /* Grabbing elements from HTML and assigning them to variables */
    const totalJobsElement = document.querySelector('#totalJobs') as HTMLParagraphElement;
    const totalJobsMonthElement = document.querySelector('#totalJobsMonth') as HTMLParagraphElement;
    const totalJobsTodayElement = document.querySelector('#totalJobsToday') as HTMLParagraphElement;

    totalJobsElement.textContent = localStorage.getItem('totalJobs');
});