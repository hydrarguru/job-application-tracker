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
  const data = [
    { year: 2010, count: 10 },
    { year: 2011, count: 20 },
    { year: 2012, count: 15 },
    { year: 2013, count: 25 },
    { year: 2014, count: 22 },
    { year: 2015, count: 30 },
    { year: 2016, count: 28 },
  ];

  new Chart(
    document.getElementById('canvas') as HTMLCanvasElement,
    {
      type: 'bar',
      data: {
        labels: data.map(row => row.year),
        datasets: [
          {
            label: 'Acquisitions by year',
            data: data.map(row => row.count)
          }
        ]
      }
    }
  );
})();