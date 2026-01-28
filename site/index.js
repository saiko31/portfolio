
let startStamp = null;// server start time
const port = 8080;

const rootURL = `http://localhost:${port}`;

function showErroMsg(msg){
    const toast = document.getElementById('error-popup');
    const text = document.getElementById('error-text');
    
    text.textContent = msg;
    toast.classList.remove('hidden');

    setTimeout(() => {
        closeToast();
    }, 5000);
}


function showPopUp(){
    //CODE HERE
}


function closePopUp(popupId){
    document.getElementById(popupId).classList.add('hidden');
}


function updateRunTime(start){
    const now = Date.now();
    const diff = now - start;

    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);

    const format = (num) => num.toString().padStart(2, '0');

    const uptimeElement = document.getElementById("uptime");
    
    if (uptimeElement){
        uptimeElement.textContent = `${d}d ${format(h)}h ${format(m)}m ${format(s)}s`;
    };

}

async function fetchStats(){
    try{
        const response = await fetch (`${rootURL}/stats`, {
            method : 'GET'
        });

        if(!response.ok){
            throw new Error(`Error fetching stats! ->  ${response.status}`)
        }

        const data =  await response.text();

        startStamp = parseInt(data);
    }
    catch(error){
        console.error("Log: Failed to sync with server time.", err);
        showErroMsg("Real-time monitoring sync failed.");
    }
}

const resumeBtn = document.getElementById('resumeButton');

resumeBtn.addEventListener('click', async () =>{
    try{
        const response = await fetch (`${rootURL}/files/resume`, {
            method: 'GET'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Alexander San Agustin-resume.pdf';
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
    } catch(error) {
        console.error("log: " , error);
        showErroMsg("Connection to the server failed. Re-trying in 30s...")

    }
});

fetchStats();

setInterval(() =>{
    if(startStamp){
        updateRunTime(startStamp);
    }
}, 1000);