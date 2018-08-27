const appData = {
    months: [
        "Jan", "Feb", "Mar", "Apr", "Maj", "Jun", "Jul", "Aug", "Sep",
        "Okt", "Nov", "Dec"
    ],
    listBox: document.getElementById("listBox"),
    textArea: document.getElementById("textArea"),
    tweetTextForm: document.getElementById("tweetTextForm"),
    deleteTweetForm: document.getElementById("deleteTweetForm"),
    hiddenText: document.getElementById("hiddenText"),
    hiddenTime: document.getElementById("hiddenTime")
}

function removeFromServer(text, time){
    let xmlHTTP = new XMLHttpRequest();
    let obj = {
        text: text,
        time: time
    };

    obj = JSON.stringify(obj);
    xmlHTTP.open("DELETE", "/user/postTweet", true);
    xmlHTTP.setRequestHeader("Content-type", "application/json");
    xmlHTTP.send(obj);
}

function getTimeStamp(){
    let now = new Date();
    let amPm = (now.getHours() < 10)? "am" : "pm";
    let month = appData.months[now.getMonth() - 1];
    let year = now.getFullYear();
    let day = now.getDate();
    let h = now.getHours();
    let min = (now.getMinutes() < 10)? "0" + now.getMinutes() : now.getMinutes(); 
    return day + " " + month + " " + year + " " + h + "h " + min + "min " + amPm;
}

function getDateFromArr(arr){
    let str = "";
    let i = 0;
    idx = arr.length-1;
    for(i = 0; i < 6; i++){
        
        if(i < 5){
            str += (arr[idx] + " ")
        }else{
            str += arr[idx];
        }
        --idx;
    }
    return str.split(" ").reverse().join(" ");
}

function getTextFromArr(arr){
    let str = "";
    let i = 0;
    idx = arr.length-1;  
    return arr.slice(0, (arr.length-8)).join(" ");
}

function turnLiToString(li){
    let arr = li.split(" "), res = [], dateStr = "", textStr = "";
    let i = 0;


    for(i = 0; i < li.length; i++){
        if(arr[i] !== "" && arr[i] !== undefined){
            res.push(arr[i]);
        }
    }
    
    dateStr = getDateFromArr(res);
    textStr = getTextFromArr(res);
    
    textStr = textStr.slice(0, (textStr.length-1));
    
    return {
        textStr: textStr,
        dateStr: dateStr
    }
}

function post(paramsObj, method) {
    method = method || "post"; 

    appData.hiddenText.value = paramsObj.textStr;
    appData.hiddenTime.value = paramsObj.dateStr;

    appData.deleteTweetForm.submit();
    
}


function removeCloneTweet(){
    let li = this.parentNode;
    let cloneTweet = turnLiToString(li.textContent);
    appData.listBox.removeChild(li);
    
    post(cloneTweet);
    
}

function attachEventOnLi(){
    let close = document.getElementsByClassName("closeClass");
    for(let i = 0; i < close.length; i++){
        close[i].addEventListener("click", removeCloneTweet);
    }
}

function addCloneTweet(){
    
    let li = document.createElement("li");
    let text = appData.textArea.value;

    li.textContent = text;
    li.classList.add("listClass");

    let close = document.createElement("span");
    close.innerHTML = "&times;";
    close.classList.add("closeClass");
    close.addEventListener("click", removeCloneTweet);
    

    let time = document.createElement("span");
    time.textContent = getTimeStamp();
    time.classList.add("spanClass");

    li.appendChild(close);
    li.appendChild(time);
    
    

    appData.listBox.appendChild(li);
    
    appData.tweetTextForm.submit();
    
    
}

window.addEventListener("load", attachEventOnLi);