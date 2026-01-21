const resumeBtn = document.getElementById('resumeButton');

resumeBtn.addEventListener('click', async () =>{
    try{
        const response = await fetch ('http://localhost:3000/files/resume', {
            method: 'GET'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'resume.pdf';
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
    } catch(error) {
        console.error('Error fetching resume:', error);
    }
});