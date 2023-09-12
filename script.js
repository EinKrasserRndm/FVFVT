"use strict";

const ul = document.getElementById("meineUL");

function AddElement() {
    let elementText = document.getElementById("elementText").value;
    if (elementText.trim() !== "") {
        const li = document.createElement("li");
        li.innerHTML = elementText;
        ul.appendChild(li);
        document.getElementById("elementText").value = "";
    }
}