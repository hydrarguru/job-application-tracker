import Chart from 'chart.js/auto'
import { getTotalJobsMonth, indexKeyValueQuery } from '@/utils/db';
import { removeDuplicatesAndCount } from '@/utils/utils';
import { monthName, setupPageLanguage } from '@/lib/i18n';

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
  };

  const uniqueCompanyDataMap = removeDuplicatesAndCount(await indexKeyValueQuery('companyName'));
  const uniqueCompanyData = Array.from(uniqueCompanyDataMap, ([company, count]) => ({ company, count }));
  const uniqueJobRolesDataMap = removeDuplicatesAndCount(await indexKeyValueQuery('jobRole'));
  const uniqueJobRolesData = Array.from(uniqueJobRolesDataMap, ([role, count]) => ({ role, count }));
  const uniqueLocationDataMap = removeDuplicatesAndCount(await indexKeyValueQuery('jobArea'));
  const uniqueLocationData = Array.from(uniqueLocationDataMap, ([location, count]) => ({ location, count }));

  /* The charts are drawn again whenever the language changes. */
  let charts: Chart[] = [];
  await setupPageLanguage((language, t) => {
    charts.forEach((chart) => chart.destroy());

    //Total Jobs Year Chart(month: 1 -> 12)
    const totalJobsData = Object.values(monthsData).map((count, month) => ({ month: monthName(language, month), count }));
    const yearChart = new Chart(
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
              text: t('charts.yearTitle')
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
              label: t('charts.jobsPerMonth'),
              data: totalJobsData.map(row => row.count)
            }
          ]
        }
      }
    );

    //Total Jobs Monthly Data Chart
    const totalJobsMonthData = [
      { month: monthName(language, 9), count: monthsData.october },
      { month: monthName(language, 10), count: monthsData.november },
      { month: monthName(language, 11), count: monthsData.december },
    ];
    const monthChart = new Chart(
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
              text: t('charts.jobsTitle')
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
              label: t('charts.jobsThisMonth', { month: monthName(language, new Date().getMonth()) }),
              data: [
                monthsData.october,
                monthsData.november,
                monthsData.december
              ]
            },
          ]
        }
      }
    );

    //Total Unique Companies Chart
    const companyChart = new Chart(
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
              text: t('charts.uniqueCompanies')
            },
            subtitle: {
              font: {
                size: 14
              },
              display: true,
              text: t('charts.uniqueCompaniesCount', { count: uniqueCompanyData.length })
            }
          }
        },
        type: 'pie',
        data: {
          labels: uniqueCompanyData.map(row => row.company),
          datasets: [{
            label: t('column.companyName'),
            data: uniqueCompanyData.map(row => row.count),
            backgroundColor: pieChartColors,
            borderColor: pieChartBorderColors,
            hoverOffset: 8,
          }]
        }
      }
    );

    //Job Role Chart
    const roleChart = new Chart(
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
              text: t('charts.uniqueRoles')
            },
            subtitle: {
              font: {
                size: 14
              },
              display: true,
              text: t('charts.uniqueRolesCount', { count: uniqueJobRolesData.length })
            }
          }
        },
        type: 'doughnut',
        data: {
          labels: uniqueJobRolesData.map(row => row.role),
          datasets: [{
            label: t('charts.count'),
            data: uniqueJobRolesData.map(row => row.count),
            backgroundColor: pieChartColors,
            borderColor: pieChartBorderColors,
            hoverOffset: 4
          }]
        }
      }
    );


    //Total Unique Locations Chart
    const locationChart = new Chart(
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
              text: t('charts.uniqueLocations')
            },
            subtitle: {
              font: {
                size: 14
              },
              display: true,
              text: t('charts.uniqueLocationsCount', { count: uniqueLocationData.length })
            }
          }
        },
        type: 'doughnut',
        data: {
          labels: uniqueLocationData.map(row => row.location),
          datasets: [{
            label: t('charts.count'),
            data: uniqueLocationData.map(row => row.count),
            backgroundColor: pieChartColors,
            borderColor: pieChartBorderColors,
            hoverOffset: 4
          }]
        }
      }
    );

    charts = [yearChart, monthChart, companyChart, roleChart, locationChart];
  });
})();