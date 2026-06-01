var user_data = null;
var session_token = null;
var offline = false;

async function get_example_programs() {

    if (offline) {

        show_offline_notification();
        return;

    }

    const res = await fetch('/database/examplePrograms');
    const data = await res.json();
    console.log(data);

}

let is_sign_up = 0;

async function authenticate_user() {

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const res = await fetch(`/database/user/login/${email}`,

        {

            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password })


        })
        .catch(error => {

            console.log(res)
            return;
        
        })

    const data = await res.json();

    if (res.status == 200) {

        user_data = data.user;
        send_ping();
        close_modal('auth_modal');

    }

}

async function create_user() {

    const name = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confirm_password = document.getElementById("confirm_password").value;

    if (password != confirm_password) {

        return;
    
    }

    const res = await fetch(`/database/user/create`, {

        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password})

    })

    if (res.ok) {

        await authenticate_user(email, password);

    }

    else {

        const error_tag = document.getElementById("auth_error_message");
        const data = await res.json();
        error_tag.innerText = data.error;
        error_tag.style.display = "block";
        
        const auth_modal_content = document.getElementById("auth_modal_content");
        auth_modal_content.style.height = "max-content";

    }

}

function open_modal(id) {

    if (offline) {

        show_offline_notification();
        return;

    }

    document.getElementById(id).style.display = "flex";

}

function close_modal(id) {
    document.getElementById(id).style.display = "none";
}

async function save_program() {
    const code = document.getElementById("code_text_area").value;
    const name = prompt("Enter program name:");

    const response = await fetch('/database/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, code, userId: currentUser._id })
    });
    
    if(response.ok) alert("Saved!");
}

async function get_saved_programs() {
    open_modal('load_modal');
    const listDiv = document.getElementById("program_list");
    listDiv.innerHTML = "Loading...";

    const response = await fetch(`/database/programs?userId=${currentUser._id}`);
    const programs = await response.json();

    listDiv.innerHTML = ""; // Clear loader
    programs.forEach(prog => {
        const btn = document.createElement("button");
        btn.innerText = prog.name;
        btn.onclick = () => {
            document.getElementById("code_text_area").value = prog.code;
            close_modal('load_modal');
        };
        listDiv.appendChild(btn);
    });
}

function toggle_auth_mode() {
    is_sign_up ^= 1;

    const title = document.getElementById("auth_title");
    const username_input = document.getElementById("username")
    const email_input = document.getElementById("email");
    const submit_button = document.getElementById("auth_submit_button");
    const toggle_link = document.getElementById("auth_toggle_link");
    const confirm_text = document.getElementById("confirm_password");

    if (is_sign_up) {

        title.innerText = "CREATE ACCOUNT";
        submit_button.innerText = "Sign Up";
        toggle_link.innerText = "Already have an account? Sign in";
        username_input.style.display = "block";
        confirm_text.style.display = "block";

    }

    else {

        title.innerText = "SIGN IN";
        submit_button.innerText = "Sign In";
        toggle_link.innerText = "Don't have an account? Sign up";
        username_input.style.display = "none";
        confirm_text.style.display = "none";

    }

}

function handle_auth() {

    if (is_sign_up) {

        create_user();

    }

    else {

        authenticate_user();

    }

};

async function send_ping() {

    try {

        await fetch('/ping', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ session_token, user_data })
            
        });

        offline = false;

    }

    catch (error) {
        
        if (!offline) {

            show_offline_notification();

        }

        offline = true;
        console.log("ERROR: Could not send ping :(");
    
    }

}

async function start_ping() {

    const res = await fetch('/newToken');
    data = await res.json();

    session_token = data.token;

    send_ping();
    setInterval(send_ping, 200);

}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function show_offline_notification() {

    const notify = document.getElementById("offline-notification");
    notify.style.display = "block";
    notify.style.opacity = 1;

    await sleep(2000);

    var opacity = 1;
    while (opacity > 0) {

        opacity -= 0.05;
        notify.style.opacity = opacity;
        await sleep(20);

    }

    notify.style.display = "none";

}

function get_instruction_set() {

    if (offline) {

        show_offline_notification();
        return;

    }

    document.location = 'InstructionSet';

}
start_ping();