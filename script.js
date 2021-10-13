const mainBody = document.querySelector(".mains");
const coverScreen = document.getElementById("cover-screen");
const addNote = document.querySelector(".new-note");
const clearAll = document.querySelector(".clear-all");
const taskContainer = document.querySelector(".task-container");
const uploadDataBtn = document.getElementById("upload-data");

let localData = localStorage.getItem("task-list");
if(!localData) {
    let list = {
        taskCount: 0,
        tasks: {}
    }
    localStorage.setItem("task-list", JSON.stringify(list));
    displayNotes({});
}
else {
    let data = JSON.parse(localData).tasks;
    displayNotes(data);
}

coverScreen.addEventListener("click", removePopup);

addNote.addEventListener("click", ()=>{
    const popup = `<div class="add-note-popup">
                        <p>Add Task</p>
                        <textarea type="text" id="add-note-input" placeholder="Add task" autofocus></textarea>
                        
                        <div>
                            <button id="cancel" class="popup-buttons negative-btn">Cancel</button>
                            <button id="add-task" class="popup-buttons positive-btn">Add</button>
                        </div>
                    </div>`

    coverScreen.innerHTML = popup;
    coverScreen.style.visibility = "visible";

    coverScreen.firstChild.addEventListener("click", (e)=>{
        e.stopPropagation();
    })

    let cancel = document.getElementById("cancel");
    cancel.addEventListener("click", removePopup);

    let inputText = document.getElementById("add-note-input");
    inputText.focus();

    let addTask = document.getElementById("add-task");
    addTask.addEventListener("click", ()=>{
        if (!inputText.value) {
            return;
        }

        let storedData = JSON.parse(localStorage.getItem("task-list"));
        let tasks = Object.assign({}, storedData.tasks);
        let count = parseInt(storedData["taskCount"]) + 1;
        let taskToAdd = {
            text: inputText.value,
            done: false
        }
        tasks[count] = taskToAdd;

        let newData = {
            taskCount: count,
            tasks
        }
        localStorage.setItem("task-list", JSON.stringify(newData));
        inputText.value = "";
        removePopup();
        displayNotes(tasks);
    })
})

addNote.addEventListener("contextmenu", (e) => {
    e.preventDefault();

    let localData = localStorage.getItem("task-list");

    const a = document.createElement("a");
    a.download = "tasklist-data";
    a.href = window.URL.createObjectURL(new Blob([localData], {type: "text/plain"}));
    a.click()

    window.URL.revokeObjectURL(a.href);
    a.href = "#"
})

uploadDataBtn.addEventListener("click", (e) => {
    const input = document.createElement("input");
    input.type = "file";
    
    input.addEventListener("input", () => {
        const fr = new FileReader();

        fr.addEventListener("load", () => {
            const data = JSON.parse(fr.result);
            
            localStorage.setItem("task-list", JSON.stringify(data));
            displayNotes(data.tasks);
        })

        fr.readAsText(input.files[0]);
    })

    input.click();
})

let doubleClick = false;
taskContainer.addEventListener("click", (e)=>{
    if(doubleClick){
        if (e.target.classList.contains("task-text") || e.target.classList.contains("task-number")) {
            const data = JSON.parse(localStorage.getItem("task-list"));
            const popup = `<div class="add-note-popup">
                                <p>Set position</p>
                                <input id="position-number" type="number" value=${e.target.parentElement.id} required>
                                <div>
                                    <button id="delete-task" class="popup-buttons negative-btn">Delete</button>
                                    <button id="set-position" class="popup-buttons positive-btn">Set</button>
                                </div>
                            </div>`

            coverScreen.innerHTML = popup;
            coverScreen.style.visibility = "visible";

            coverScreen.firstChild.addEventListener("click", (e)=>{
                e.stopPropagation();
            })

            let deleteTask = document.getElementById("delete-task");
            deleteTask.addEventListener("click", ()=>{
                if(!window.confirm("Are you sure ?"))
                    return;

                let deletePosition = parseInt(e.target.parentElement.id);
                let tasks = data.tasks;
                let newTasks= {};
                let count = parseInt(data.taskCount);

                for (let key of Object.keys(tasks)) {
                    key = parseInt(key);
                    if(key === deletePosition)
                        continue;
                    else if(key > deletePosition)
                        newTasks[key - 1] = tasks[key];
                    else
                        newTasks[key] = tasks[key];
                }
                count--;

                let newData = {
                    taskCount: count,
                    tasks: newTasks
                }
                localStorage.setItem("task-list", JSON.stringify(newData));
                displayNotes(newTasks);
                removePopup();
            });

            let positionInput = document.getElementById("position-number");
            positionInput.select();

            let setPosition = document.getElementById("set-position");
            setPosition.addEventListener("click", ()=>{
                let posInput = parseInt(positionInput.value);
                let taskCount = parseInt(data.taskCount);
                if(posInput > taskCount) {
                    alert("position should be less than or equal to total number of tasks: \nTotal tasks: " + data.taskCount);
                }
                else if (posInput < 1) {
                    alert("position should be greater than zero");
                }
                else {
                    let tasks = data.tasks;
                    let newTasks = {};
                    let origSpot = parseInt(e.target.parentElement.id);
                    let newSpot = posInput
                    let taskToChange = tasks[origSpot];

                    for (let key of Object.keys(tasks)) {
                        key = parseInt(key);

                        if(key == origSpot)
                            continue;
                        else if(newSpot < origSpot && key >= newSpot && key < origSpot)
                            newTasks[key + 1] = tasks[key];
                        else if(newSpot > origSpot && key <= newSpot && key > origSpot)
                            newTasks[key - 1] = tasks[key];
                        else
                            newTasks[key] = tasks[key];
                    }

                    newTasks[newSpot] = taskToChange;

                    let newData = {
                        taskCount,
                        tasks: newTasks
                    }
                    localStorage.setItem("task-list", JSON.stringify(newData));
                    displayNotes(newTasks);
                    removePopup();
                }
            })
        }
        
    }
    doubleClick = true;
    setTimeout(() => {
        doubleClick = false;
    }, 300);
})

taskContainer.addEventListener("contextmenu", (e)=>{
    e.preventDefault();
    
    if (e.target.classList.contains("task-text") || e.target.classList.contains("task-number")) {
        let data = JSON.parse(localStorage.getItem("task-list"));
        let taskID = e.target.parentElement.id;

        data.tasks[taskID].done = !data.tasks[taskID].done
        localStorage.setItem("task-list", JSON.stringify(data));
        displayNotes(data.tasks);
    }
})

clearAll.addEventListener("click", ()=>{
    const popup = `<div class="add-note-popup">
                        <p>Do you want to clear all tasks</p>
                        
                        <div>
                            <button id="cancel" class="popup-buttons neutral-btn">Cancel</button>
                            <button id="clear-tasklist" class="popup-buttons negative-btn">Clear</button>
                        </div>
                    </div>`

    coverScreen.innerHTML = popup;
    coverScreen.style.visibility = "visible";

    coverScreen.firstChild.addEventListener("click", (e)=>{
        e.stopPropagation();
    })

    let cancel = document.getElementById("cancel");
    cancel.addEventListener("click", removePopup);

    let clearAllBtn = document.getElementById("clear-tasklist");
    clearAllBtn.addEventListener("click", ()=>{
        let list = {
            taskCount: 0,
            tasks: {}
        }
        localStorage.setItem("task-list", JSON.stringify(list));
        displayNotes({});
        removePopup();
    })
})

clearAll.addEventListener("contextmenu", (e)=>{
    e.preventDefault();
    const popup = `<div class="add-note-popup">
                        <p>Do you want to clear all the finished tasks</p>
                        
                        <div>
                            <button id="cancel" class="popup-buttons neutral-btn">Cancel</button>
                            <button id="clear-tasklist" class="popup-buttons negative-btn">Clear</button>
                        </div>
                    </div>`

    coverScreen.innerHTML = popup;
    coverScreen.style.visibility = "visible";

    coverScreen.firstChild.addEventListener("click", (e)=>{
        e.stopPropagation();
    })

    let cancel = document.getElementById("cancel");
    cancel.addEventListener("click", removePopup);

    let clearAllBtn = document.getElementById("clear-tasklist");
    clearAllBtn.addEventListener("click", ()=>{
        let list = {
            taskCount: 0,
            tasks: {}
        }
        let localData = JSON.parse(localStorage.getItem("task-list"));
        let data = localData.tasks;
        for(let i of Object.keys(data)) {
            if(!data[i].done) {
                list.tasks[++list.taskCount] = data[i];
            }
        } 
        localStorage.setItem("task-list", JSON.stringify(list));
        displayNotes(list.tasks);
        removePopup();
    })
})

function removePopup() {
    coverScreen.innerHTML = "";
    coverScreen.style.visibility = "hidden";
}

function displayNotes(tasklist) {
    let note;
    taskContainer.innerHTML = "";
    for (let number in tasklist) {
        note = document.createElement("div");
        note.id = number;
        note.classList.add("task-box");
        note.innerHTML = `  <div class="task-text">${tasklist[number].text}</div>
                            <div class="task-number">${number}</div>`;

        if(tasklist[number].done) {
            note.classList.add("done-task");
        }
        
        taskContainer.appendChild(note);
    }
    const totalTasks = Object.keys(tasklist).length;

    uploadDataBtn.style.display = totalTasks === 0 ? "block" : "none";
}