import Chart from 'chart.js/auto'
import { getTotalJobsMonth, getTotalJobsToday } from './db';

document.addEventListener('DOMContentLoaded', async () => {
});

(async function() {
  const monthsData = {
    january: Number(await getTotalJobsMonth('01')),
    february: Number(await getTotalJobsMonth('02')),
    march: Number(await getTotalJobsMonth('03')),
    april: Number(await getTotalJobsMonth('04')),
    may: Number(await getTotalJobsMonth('05')),
    june: Number(await getTotalJobsMonth('06')),
    july: Number(await getTotalJobsMonth('07')),
    august: Number(await getTotalJobsMonth('08')),
    september: Number(await getTotalJobsMonth('09')),
    october: Number(await getTotalJobsMonth('10')),
    november: Number(await getTotalJobsMonth('11')),
    december: Number(await getTotalJobsMonth('12'))
  }


  const totalJobMonthData = [
    { month: 'Oktober', count: monthsData.october },
    { month: 'November', count: monthsData.november },
    { month: 'December', count: monthsData.december },
  ];

  const totalJobsData = [
    { month: 'Januari', count: monthsData.january },
    { month: 'Februari', count: monthsData.february },
    { month: 'Mars', count: monthsData.march },
    { month: 'April', count: monthsData.april },
    { month: 'Maj', count: monthsData.may },
    { month: 'Juni', count: monthsData.june },
    { month: 'Juli', count: monthsData.july },
    { month: 'Augusti', count: monthsData.august },
    { month: 'September', count: monthsData.september },
    { month: 'Oktober', count: monthsData.october },
    { month: 'November', count: monthsData.november },
    { month: 'December', count: monthsData.december }
  ];

  new Chart(
    document.getElementById('totalJobsCanvas') as HTMLCanvasElement,
    {
      type: 'line',
      data: {
        labels: totalJobsData.map(row => row.month),
        datasets: [
          {
            backgroundColor: 'rgba(40, 72, 53, 0.75)',
            borderColor(ctx, options) {
              return 'rgba(40, 72, 53, 1)';
            },
            label: `Totalt antal jobb under år ${new Date().getFullYear()}`,
            data: totalJobsData.map(row => row.count)
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
        labels: totalJobMonthData.map(row => row.month),
        datasets: [
          {
            backgroundColor: 'rgba(40, 72, 53, 0.75)',
            borderColor(ctx, options) {
              return 'rgba(40, 72, 53, 1)';
            },
            label: `Totalt antal jobb denna månad (${localStorage.getItem('currentMonth')})`,
            data: totalJobMonthData.map(row => row.count)
          }
        ]
      }
    }
  );
})();