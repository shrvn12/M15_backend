const url = 'http://localhost:4500/login'

document.querySelector('form').addEventListener('submit',(event) => {
    event.preventDefault();
    const email = document.querySelector('#email').value;
    const password = document.querySelector('#password').value;

    const payload = {
        email, password
    }
    localStorage.setItem('user', JSON.stringify(payload));
    login(url, payload)
})

async function login(url, payload){
    try {
        let res = await fetch(url,{
            method:'POST',
            headers:{
                'content-type':'application/json'
            },
            body: JSON.stringify(payload)
        })

        if(res.ok){
            res = await res.json();
            localStorage.setItem('token', res.token);
            alert(res.msg);
            window.location.href = './chat.html'
        }
        else{
            res = await res.json();
            alert(res.msg);
        }
    }
    catch (error) {
        console.log(error)
    }
}