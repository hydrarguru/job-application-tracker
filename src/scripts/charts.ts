import Chart from 'chart.js/auto'

document.addEventListener('DOMContentLoaded', async () => {
  /* Grabbing elements from HTML and assigning them to variables */
  const totalJobsElement = document.querySelector('#totalJobs') as HTMLParagraphElement;
  const totalJobsMonthElement = document.querySelector('#totalJobsMonth') as HTMLParagraphElement;
  const totalJobsTodayElement = document.querySelector('#totalJobsToday') as HTMLParagraphElement;
  const totalJobsMonthHeading = document.querySelector('#totalMonthHeading') as HTMLHeadingElement;

  /* Getting data from localStorage and assigning it to variables */
  totalJobsMonthHeading.textContent = `Antal sökta jobb i ${localStorage.getItem('currentMonth').at(0).toUpperCase() + localStorage.getItem('currentMonth').slice(1)}`;
  totalJobsElement.textContent = localStorage.getItem('totalJobs');
  totalJobsMonthElement.textContent = localStorage.getItem('totalJobsMonth');
  totalJobsTodayElement.textContent = localStorage.getItem('totalJobsDay');
});

(async function() {
  const totalJobData = [
    { year: 2023, count: Number(localStorage.getItem('totalJobs')) },
    { year: 2024, count: 0 },
  ];

  const totalJobsMonthData = [
    { month: 'Oktober', count: 0 },
    { month: 'November', count: Number(localStorage.getItem('totalJobsMonth')) },
    { month: 'December', count: 0}
  ];

  new Chart(
    document.getElementById('totalJobsCanvas') as HTMLCanvasElement,
    {
      type: 'bar',
      data: {
        labels: totalJobData.map(row => row.year),
        datasets: [
          {
            label: 'Totalt antal jobb',
            data: totalJobData.map(row => row.count)
          }
        ]
      }
    }
  );
  
  new Chart(
    document.getElementById('totalJobsMonthCanvas') as HTMLCanvasElement,
    {
      type: 'bar',
      data: {
        labels: totalJobsMonthData.map(row => row.month),
        datasets: [
          {
            label: `Antal jobb denna månad (${localStorage.getItem('currentMonth').at(0).toUpperCase() + localStorage.getItem('currentMonth').slice(1)}))`,
            data: totalJobsMonthData.map(row => row.count)
          }
        ]
      }
    }
  );
})();