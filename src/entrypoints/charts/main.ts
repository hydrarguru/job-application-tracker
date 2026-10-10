import Chart from 'chart.js/auto'
import { getTotalJobsMonth, indexKeyValueQuery } from '@/utils/db';
import { removeDuplicatesAndCount } from '@/utils/utils';

document.addEventListener('DOMContentLoaded', async () => {});

(async function() {
  const pieChartColors = [
    'rgba(246, 109, 68, 0.5)',
    'rgba(254, 174, 101, 0.5)',
    'rgba(170, 222, 167, 0.5)',
    'rgba(45, 135, 187, 0.5)',
    'rgba(255, 99, 132, 0.5)',
    'rgba(255, 159, 64, 0.5)',
    'rgba(255, 205, 86, 0.5)',
    'rgba(75, 192, 192, 0.5)',
    'rgba(54, 162, 235, 0.5)',
    'rgba(153, 102, 255, 0.5)',
  ];
  const pieChartBorderColors = [
    'rgba(246, 109, 68, 1)',
    'rgba(254, 174, 101, 1)',
    'rgba(170, 222, 167, 1)',
    'rgba(45, 135, 187, 1)',
    'rgba(255, 99, 132, 1)',
    'rgba(255, 159, 64, 1)',
    'rgba(255, 205, 86, 1)',
    'rgba(75, 192, 192, 1)',
    'rgba(54, 162, 235, 1)',
    'rgba(153, 102, 255, 1)',
  ];
  const monthNames = [
    'Januari', 'Februari', 'Mars', 'April', 'Maj', 'Juni',
    'Juli', 'Augusti', 'September', 'Oktober', 'November', 'December'
  ];
  const now = new Date();
  const currentYear = now.getFullYear();

  //Total Jobs Year Chart(month: 1 -> 12) for the current year
  const totalJobsData = await Promise.all(monthNames.map(async (month, index) => ({
    month,
    count: await getTotalJobsMonth(String(currentYear), String(index + 1).padStart(2, '0'))
  })));
  new Chart(
    document.getElementById('totalJobsCanvas') as HTMLCanvasElement,
    {
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            font: {
              size: 20
            },
            display: true,
            text: `Totalt antal jobb under ${currentYear}`
          }
        }
      },
      type: 'line',
      data: {
        labels: totalJobsData.map(row => row.month),
        datasets: [
          {
            backgroundColor: 'rgba(40, 72, 53, 0.25)',
            borderColor: 'rgba(40, 72, 53, 1)',
            fill: true,
            label: `Antal jobb per månad`,
            data: totalJobsData.map(row => row.count)
          }
        ]
      }
    }
  );

  //Total Jobs Monthly Data Chart: last three months, including the current one (spans year boundaries)
  const totalJobsMonthData = await Promise.all([2, 1, 0].map(async (monthsAgo) => {
    const date = new Date(currentYear, now.getMonth() - monthsAgo, 1);
    return {
      month: monthNames[date.getMonth()],
      count: await getTotalJobsMonth(String(date.getFullYear()), String(date.getMonth() + 1).padStart(2, '0'))
    };
  }));
  new Chart(
    document.getElementById('totalJobsMonthCanvas') as HTMLCanvasElement,
    {
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            font: {
              size: 20
            },
            display: true,
            text: 'Antal jobb'
          },
        }
      },
      type: 'bar',
      data: {
        labels: totalJobsMonthData.map(row => row.month),
        datasets: [
          {
            backgroundColor: [
              'rgba(255, 99, 132, 0.2)',
              'rgba(255, 159, 64, 0.2)',
              'rgba(255, 205, 86, 0.2)',
              'rgba(75, 192, 192, 0.2)',
              'rgba(54, 162, 235, 0.2)',
              'rgba(153, 102, 255, 0.2)',
              'rgba(201, 203, 207, 0.2)'
            ],
            borderColor: [
              'rgb(255, 99, 132)',
              'rgb(255, 159, 64)',
              'rgb(255, 205, 86)',
              'rgb(75, 192, 192)',
              'rgb(54, 162, 235)',
              'rgb(153, 102, 255)',
              'rgb(201, 203, 207)'
            ],
            borderWidth: 1,
            label: `Totalt antal jobb denna månad (${new Date().toLocaleString('sv-SE', { month: 'long' })})`,
            data: totalJobsMonthData.map(row => row.count)
          },
        ]
      }
    }
  );

  //Total Unique Companies Chart
  const uniqueCompanyDataMap = removeDuplicatesAndCount(await indexKeyValueQuery('companyName'));
  const uniqueCompanyData = Array.from(uniqueCompanyDataMap, ([company, count]) => ({ company, count }));
  new Chart(
    document.getElementById('CompanyCanvas') as HTMLCanvasElement,
    {
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'right',
            labels: {
            }
          },
          title: {
            font: {
              size: 20
            },
            display: true,
            text: 'Unika företag'
          },
          subtitle: {
            font: {
              size: 14
            },
            display: true,
            text: `${uniqueCompanyData.length} unika företag`
          }
        }
      },
      type: 'pie',
      data: {
        labels: uniqueCompanyData.map(row => row.company),
        datasets: [{
          label: `Företag`,
          data: uniqueCompanyData.map(row => row.count),
          backgroundColor: pieChartColors,
          borderColor: pieChartBorderColors,
          hoverOffset: 8,
        }]
      }
    }
  );

  //Job Role Chart
  const uniqueJobRolesDataMap = removeDuplicatesAndCount(await indexKeyValueQuery('jobRole'));
  const uniqueJobRolesData = Array.from(uniqueJobRolesDataMap, ([role, count]) => ({ role, count }));
  new Chart(
    document.getElementById('jobRoleCanvas') as HTMLCanvasElement,
    {
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'right',
          },
          title: {
            font: {
              size: 20
            },
            display: true,
            text: 'Unika jobbroller'
          },
          subtitle: {
            font: {
              size: 14
            },
            display: true,
            text: `${uniqueJobRolesData.length} unika jobbroller`
          }
        }
      },
      type: 'doughnut',
      data: {
        labels: uniqueJobRolesData.map(row => row.role),
        datasets: [{
          label: `Antal`,
          data: uniqueJobRolesData.map(row => row.count),
          backgroundColor: pieChartColors,
          borderColor: pieChartBorderColors,
          hoverOffset: 4
        }]
      }
    }
  );


  //Total Unique Locations Chart
  const uniqueLocationDataMap = removeDuplicatesAndCount(await indexKeyValueQuery('jobArea'));
  const uniqueLocationData = Array.from(uniqueLocationDataMap, ([location, count]) => ({ location, count }));
  new Chart(
    document.getElementById('uniqueLocationCanvas') as HTMLCanvasElement,
    {
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'right',
          },
          title: {
            font: {
              size: 20
            },
            display: true,
            text: 'Unika orter'
          },
          subtitle: {
            font: {
              size: 14
            },
            display: true,
            text: `${uniqueLocationData.length} unika orter.`
          }
        }
      },
      type: 'doughnut',
      data: {
        labels: uniqueLocationData.map(row => row.location),
        datasets: [{
          label: `Antal`,
          data: uniqueLocationData.map(row => row.count),
          backgroundColor: pieChartColors,
          borderColor: pieChartBorderColors,
          hoverOffset: 4
        }]
      }
    }
  );
})();