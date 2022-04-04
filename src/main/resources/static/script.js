const add = document.getElementById("add");
const taskList = document.getElementById("task-list")
const toDo = document.getElementById("to-do");
const taskCounter = document.getElementById("task-counter");
const taskDone = document.getElementById("task-done");
const categoriesSelect = document.getElementById("categories");
const clearAll = document.getElementById("clear-all");
let counterTask = 0;
let counterDone = 0;
const HTTP_RESPONSE_SUCCESS = 200;
const REST_API_ENDPOINT = 'http://localhost:8090';

add.addEventListener("click", addTask);

function updateCategoriesList() {
    let ajaxRequest = new XMLHttpRequest();
    ajaxRequest.onload = () => {
        let categories = JSON.parse(ajaxRequest.response);
        for (let category of categories) {
            let optionTask = document.createElement("option");
            optionTask.value = category.id;
            optionTask.innerText = category.name;
            categoriesSelect.appendChild(optionTask);
        }
    }
    ajaxRequest.open("GET", REST_API_ENDPOINT + "/categories/");
    ajaxRequest.send();
}

updateCategoriesList();

taskDone.innerHTML = counterDone;
taskCounter.innerHTML = counterTask;

function createTask(task) {
    let taskToDo = document.createElement("div");
    taskToDo.setAttribute("class", "task");
    if (task.category) {
        taskToDo.classList.add(task.category.color);
    }
    taskToDo.setAttribute("data-id", task.id);

    let box = document.createElement("span");
    box.setAttribute("class", "check");
    box.innerHTML = '<i class="fa-solid fa-check"></i>';
    if (task.done) {
        taskToDo.classList.add("done");
        box.checked = true;
    }
    taskToDo.appendChild(box);

    let newTask = document.createElement("span");
    newTask.setAttribute("class", "text-position");
    newTask.innerHTML = task.name;
    taskToDo.appendChild(newTask);

    let newDate = document.createElement("span");
    newDate.setAttribute("class", "date");
    let date = new Date();
    newDate.innerText = date.getDate() + " / " + (date.getMonth() + 1) + " / " + date.getFullYear();
    taskToDo.appendChild(newDate);

    let trash = document.createElement("span");
    trash.setAttribute("class", "error trash-position")
    trash.innerHTML = '<i class="fa-solid fa-trash-can"></i>';
    taskToDo.appendChild(trash);

    let edit = document.createElement("span");
    edit.setAttribute("class", "edit");
    edit.innerHTML = '<i class="fa-solid fa-pen-nib"></i>';
    task.done ? edit.classList.add("hidden") : edit.classList.remove("hidden");
    taskToDo.appendChild(edit);

    taskList.appendChild(taskToDo);

    edit.addEventListener("click", () => {
        let input = document.createElement("input");
        input.setAttribute("type", "text");
        input.setAttribute("id", "input-edit-" + task.id);
        if (newTask.classList.contains("editing")) {
            let inputEdit = document.getElementById("input-edit-" + task.id);
            let taskContent = {
                name: inputEdit.value
            };

            updateTask(task.id, taskContent, () => {
                task.name = inputEdit.value;
                newTask.innerHTML = task.name;
                edit.innerHTML = '<i class="fa-solid fa-pen-nib"></i>';
                newTask.classList.remove("editing")
                box.classList.remove("hidden");
            });

        } else {
            newTask.classList.add("editing");
            input.value = newTask.textContent;
            newTask.innerHTML = "";
            edit.innerHTML = '<i class="fa-solid fa-floppy-disk"></i>';
            newTask.appendChild(input);
            box.classList.add("hidden");
        }
    });

    box.addEventListener("click", () => {
        task.done = !task.done;
        let taskContent = {
            done: task.done,
        };

        markAsDone(task.id, taskContent, () => {
            taskToDo.classList.toggle("done");
            taskDone.innerHTML = task.done ? ++counterDone : --counterDone;
        });
        task.done ? edit.classList.add("hidden") : edit.classList.remove("hidden");
    });

    trash.addEventListener("click", () => {
        deleteTask(task.id, taskToDo);
    });

    if (task.done) {
        counterDone++;
    }

    counterTask++;
    taskDone.innerHTML = counterDone;
    taskCounter.innerHTML = counterTask;
}

function updateTasksList() {
    taskList.innerHTML = "";
    let ajaxRequest = new XMLHttpRequest();
    ajaxRequest.onload = function () {
        let tasks = JSON.parse(ajaxRequest.response);
        for (let task of tasks) {
            createTask(task);
        }
    }
    ajaxRequest.open("GET", REST_API_ENDPOINT + "/tasks/");
    ajaxRequest.send();
}

updateTasksList();

function deleteTask(taskId, taskHtmlElement) {
    let ajaxRequest = new XMLHttpRequest();
    ajaxRequest.onload = () => {
        if (ajaxRequest.response == "ok") {
            counterTask--;
            if (taskHtmlElement.classList.contains("done")) {
                counterDone--;
            }
            taskDone.innerHTML = counterDone;
            taskCounter.innerHTML = counterTask;
            taskHtmlElement.remove();
        }
    }
    ajaxRequest.open("DELETE", REST_API_ENDPOINT + "/tasks/" + taskId);
    ajaxRequest.send();
}

function deleteAllTask(successfullCallback) {
    let ajaxRequest = new XMLHttpRequest();
    ajaxRequest.onload = () => {
        if (ajaxRequest.response == "ok") {
            successfullCallback();
        }
    }
    ajaxRequest.open("DELETE", REST_API_ENDPOINT + "/tasks/all");
    ajaxRequest.send();
}

function saveTask(taskToSave, successfullCallback) {
    let ajaxRequest = new XMLHttpRequest();
    ajaxRequest.onload = () => {
        if (ajaxRequest.status == HTTP_RESPONSE_SUCCESS) {
            let savedTask = JSON.parse(ajaxRequest.response);
            createTask(savedTask);
            successfullCallback();
        }
    }
    ajaxRequest.open("POST", REST_API_ENDPOINT + "/tasks/add");
    ajaxRequest.setRequestHeader("content-type", "application/json");
    let body = {
        name: taskToSave.name,
        category: {
            id: taskToSave.categoryId
        },
        created: new Date()
    };
    ajaxRequest.send(JSON.stringify(body));
}

function updateTask(taskId, taskContent, successfullCallback) {
    let ajaxRequest = new XMLHttpRequest();
    ajaxRequest.onload = () => {
        if (ajaxRequest.status == HTTP_RESPONSE_SUCCESS) {
            successfullCallback();
        }
    }
    ajaxRequest.open("PUT", REST_API_ENDPOINT + "/tasks/" + taskId);
    ajaxRequest.setRequestHeader("content-type", "application/json");
    ajaxRequest.send(JSON.stringify(taskContent));
}

function markAsDone(taskId, taskContent, successfullCallback) {
    let ajaxRequest = new XMLHttpRequest();
    ajaxRequest.onload = () => {
        if (ajaxRequest.status == HTTP_RESPONSE_SUCCESS) {
            successfullCallback();
        }
    }
    ajaxRequest.open("PUT", REST_API_ENDPOINT + "/tasks/" + taskId + "/mark-as-done");
    ajaxRequest.setRequestHeader("content-type", "application/json");
    ajaxRequest.send(JSON.stringify(taskContent));
}

function addTask() {
    let taskContentValue = toDo.value;
    if (taskContentValue.length <= 1) {
        alert("write something!");
        return;
    }
    let taskCategory = categoriesSelect.value;
    if (taskCategory == "") {
        alert("choose category");
        return;
    }
    let task = {
        name: taskContentValue,
        categoryId: categoriesSelect.value
    };
    saveTask(task, () => {
        toDo.value = "";
    });
}

clearAll.addEventListener("click", () => {
    deleteAllTask(() => {
        taskDone.innerHTML = counterDone = 0;
        taskCounter.innerHTML = counterTask = 0;
        taskList.innerHTML = "";
    })
})