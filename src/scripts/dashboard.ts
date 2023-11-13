import { deleteJobFromDatabase, getJobFromDatabase, getJobsFromDatabase, updateJobInDatabase } from "./db";
import { JobData } from "./db";

const deleteDialog = document.querySelector('#deleteDialog') as HTMLDialogElement;
const modifyDialog = document.querySelector('#modifyDialog') as HTMLDialogElement;

async function editDataDialog(modal: HTMLDialogElement, entryId: number) {
    modal.showModal();
    const modifyDialogSaveButton = document.querySelector('#modifyDialogSave') as HTMLButtonElement;
    const modifyDialogCloseButton = document.querySelector('#modifyDialogClose') as HTMLButtonElement;

    const modifyDialogId = document.querySelector('#modifyDialogId') as HTMLInputElement;
    const modifyDialogCompanyName = document.querySelector('#modifyDialogCompanyName') as HTMLInputElement;
    const modifyDialogJobRole = document.querySelector('#modifyDialogJobRole') as HTMLInputElement;
    const modifyDialogJobArea = document.querySelector('#modifyDialogJobArea') as HTMLInputElement;
    const modifyDialogJobLink = document.querySelector('#modifyDialogJobLink') as HTMLInputElement;
    const modifyDialogAppliedDate = document.querySelector('#modifyDialogAppliedDate') as HTMLInputElement;
    const modifyDialogTextArea = document.querySelector('#modifyDialogTextArea') as HTMLTextAreaElement;

    const jobEntry: JobData = await getJobFromDatabase(entryId);
    modifyDialogTextArea.textContent = JSON.stringify(jobEntry);

    modifyDialogId.value = entryId.toString();
    modifyDialogCompanyName.value = jobEntry.companyName;
    modifyDialogJobRole.value = jobEntry.jobRole;
    modifyDialogJobArea.value = jobEntry.jobArea;
    modifyDialogJobLink.value = jobEntry.applicationLink;
    modifyDialogAppliedDate.value = jobEntry.appliedDate;

    modifyDialogSaveButton.addEventListener('click', async () => {
        const newData: JobData = {
            companyName: modifyDialogCompanyName.value,
            jobRole: modifyDialogJobRole.value,
            jobArea: modifyDialogJobArea.value,
            applicationLink: modifyDialogJobLink.value,
            appliedDate: modifyDialogAppliedDate.value,
        }
        await updateJobInDatabase(newData, entryId);
        modifyDialog.close();
    });

    modifyDialogCloseButton.addEventListener('click', () => {
        modifyDialog.close();
    });
}

async function deleteDataDialog(modal: HTMLDialogElement, entryId: number, rowElement: HTMLTableRowElement) {
    modal.showModal();
    const confirmDeleteButton = document.querySelector('#deleteDialogConfirm') as HTMLButtonElement;
    const cancelDeleteButton = document.querySelector('#deleteDialogCancel') as HTMLButtonElement;
    confirmDeleteButton.addEventListener('click', async () => {
        rowElement.remove();
        await deleteJobFromDatabase(entryId);
        deleteDialog.close();
    });
    cancelDeleteButton.addEventListener('click', () => {
        deleteDialog.close();
    });
}

async function createTableFromData(data: JobData[]) {
    const parsedData = JSON.parse(JSON.stringify(data));

    const dataTable = document.querySelector('#db-table') as HTMLTableElement;
    const tableBody = document.createElement('tbody');
    dataTable.append(tableBody);

    const tableCols = Object.keys(parsedData[0]);
    const tableHeads = document.createElement("thead");
    const tableRows = document.createElement("tr");

    tableCols.forEach((item) => {
        let th = document.createElement("th");
        th.setAttribute("scope", "col");
        th.innerHTML = item
          .replace(/([a-z])([A-Z])/g, "$1 $2")
          .replace(/^./, (str) => str.toUpperCase());
        tableRows.appendChild(th);
    });

    tableHeads.appendChild(tableRows);
    dataTable.appendChild(tableHeads);

    parsedData.forEach((item) => {
        let tr = document.createElement("tr");
        let vals = Object.values(item); // Get the values of the current object in the JSON data
        // Loop through the values and create table cells
        vals.forEach((element) => {
          let td = document.createElement("td");
          td.id = element.toString();
          td.innerText = element.toString();
          tr.appendChild(td); // Append the table cell to the table row
        });
        dataTable.appendChild(tr); // Append the table row to the table
        
        const modifyButton = document.createElement("button");
        modifyButton.id = "modifyButton";
        modifyButton.innerHTML = "Ändra";
        modifyButton.addEventListener("click", () => {
            editDataDialog(modifyDialog, item.id)
        });
        tr.appendChild(modifyButton);

        const deleteButton = document.createElement("button");
        deleteButton.id = "deleteButton";
        deleteButton.innerHTML = "Ta bort";
        deleteButton.addEventListener("click", () => {
            deleteDataDialog(deleteDialog, item.id, tr);
        });
        tr.appendChild(deleteButton);
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    chrome.runtime.sendMessage('refreshValues');
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


    const jobEntries = await getJobsFromDatabase(25);
    await createTableFromData(jobEntries);
});