
const CONFIG = {
    rootURL : `http://asanagus.me`,
    syncInterval: 30000, // sync stats every 30s
    uptimeInterval: 1000 //update uptime every second
};

let state = {
    startStamp: null,
    totalVisits : null,
    todayVisits : null,
    isConnected : false
};

// --- UI utilities ---

function showErroMsg(msg){
    const toast = document.getElementById('error-popup');
    const text = document.getElementById('error-text');

    if (!toast || !text) return;
    text.textContent = msg;
    toast.classList.add('active');
    toast.classList.remove('hidden');

    //updating status pulse to red
    updateStatusIndicator(false);
    
    setTimeout(() => { toast.classList.add('hidden') }, 5000);
}


function closePopUp(id) {
    const popup = document.getElementById(id);
    if (popup) {
        popup.classList.remove('active');
        popup.classList.remove('show'); 
    }
}

// --- Data Logic ---

async function syncStats(){
    try{

        const url = `${CONFIG.rootURL}/api/stats`;

        const response = await fetch(url);
        if(!response.ok) throw new Error("Server unreachable.");


        //getting json
        const result = await response.json();

        //console.log(result);


        //updating stats        
        if(result.success){
            state.startStamp = result.uptime;
            state.totalVisits = result.totalVisits;
            state.todayVisits = result.todayVisits;
            state.isConnected = true;

            updateStatusIndicator(true);
            updateUI();

            //console.log("json recibido")
        }
    }
    catch(error){
        console.error("Log: Failed to sync with server time.", error);
        state.isConnected = false;
        updateStatusIndicator(false);
        showErroMsg("Lost connection to homeLab.");
    }
}

function updateUI(){
    if(!state.isConnected) return;

    // Actualizamos contadores de visitas (con formato 0000 como en tu diseño)
    const formatVisits = (num) => num.toString().padStart(4, '0');
    
    document.getElementById("total-visits").textContent = formatVisits(state.totalVisits);
    document.getElementById("today-visits").textContent = formatVisits(state.todayVisits);
}

function updateTimeDisplay(){
    if(!state.startStamp || !state.isConnected) return;

    const diff = Date.now() - state.startStamp;

    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);

    const format = (num) => num.toString().padStart(2, '0');
    
    document.getElementById("uptime").textContent = `${d}d ${format(h)}h ${format(m)}m ${format(s)}s`;
}


function updateStatusIndicator(active) {
    const led = document.getElementById('status-led');
    if (!led) return;

    if (active) {
        led.classList.add('online');
    } else {
        led.classList.remove('online');
    }
}

// --- Event Listeners ---

document.getElementById('resumeButton').addEventListener('click', async () =>{
    try{
        window.location.href = `${CONFIG.rootURL}/files/resume`;
    } catch(error) {
        showErroMsg("Could not download resume. Try again later.")
    }
});

// Initializing

// initial load
syncStats();


//uptime clock
setInterval(updateTimeDisplay, CONFIG.uptimeInterval);

//resync data
setInterval(syncStats, CONFIG.syncInterval);