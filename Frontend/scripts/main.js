const socket = io('http://localhost:4500',{transports: ["websocket"]});

const user = JSON.parse(localStorage.getItem('user') || {});

const chats = document.querySelector('#chats');

const container = document.querySelector('#container')

getcontacts(user.email);

async function getcontacts(email){
    if(!user){
        return;
    }
    const url = `http://localhost:4500/userinfo/${email}`
    try {
        let res = await fetch(url,{
            method: 'GET',
            headers:{
                'authorization': localStorage.getItem('token')
            }
        })
        res = await res.json();

        return res;
    }
    catch (error) {
        console.log(error);
    }
}


const chat = document.querySelectorAll('#chats>div');

for(let elem of chat){
    elem.addEventListener('click',() => {
        container.innerHTML = '';
        document.querySelector('#chatname').innerText = elem.className;
        socket.emit('joinroom',{room: elem.className});
        document.querySelector("#message").className = elem.className;
    })
}

document.querySelector('#add').addEventListener('submit',(event) => {
    event.preventDefault();
    const email = document.querySelector('#contantemail').value;
    addtocontacts(email);
})

document.querySelector('#message').addEventListener('submit',(event) => {
    event.preventDefault();
    const msg = document.querySelector('#text').value;
    document.querySelector('#text').value = '';
    const div = document.createElement('div');
    div.className = 'right';
    const p = document.createElement('p');
    p.innerText = msg;
    div.append(p);
    container.append(div);
    socket.emit('message',{msg,room:event.target.className});
})

socket.on('message',(msg) => {
    const div = document.createElement('div');
    const p = document.createElement('p');
    p.innerText = msg;
    div.append(p);
    container.append(div);
})

async function addtocontacts(email){
    const url = `http://localhost:4500/addtocontact/${email}`
    try {
        let res = await fetch(url,{
            method: 'POST',
            headers:{
                'authorization': localStorage.getItem('token')
            }
        })
        res = await res.json();
        alert(res.msg);
        console.log(res);
    }
    catch (error) {
        console.log(error);
    }
}


async function rendercontacts(container){
    const User = await getcontacts(user.email);
    for(let elem of User.contacts){
        let contact = await getcontacts(elem);
        console.log(contact);
        let div = document.createElement('div');
        let arr = [];
        arr.push(user.email);
        arr.push(contact.email);
        arr.sort();
        div.className = arr.join("__");
        div.id = contact.name;
        console.log(div.className);
        let img = document.createElement('img');
        img.src = './images/user.png';
        let p = document.createElement('p');
        p.innerText = contact.name;
        div.append(img,p);
        container.append(div);
        div.addEventListener('click',() => {
            const container = document.querySelector('#container')
            container.innerHTML = '';
            document.querySelector('#chatname').innerText = contact.name;
            socket.emit('joinroom',{room: elem.className});
            document.querySelector("#message").className = elem.className;
        })
    }
}

rendercontacts(chats);