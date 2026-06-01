var user_data = null;
var session_token = null;
var offline = true;
var current_program_data = null;

// 0 = sign in, 1 = sign up, 2 = signed in
let is_sign_up = 0;

async function get_example_programs() {

    if (offline) {

        show_offline_notification();
        return;

    }

    const res = await fetch('/database/examplePrograms');
    const data = await res.json();
    open_modal("load_modal");

    const clean_programs = data.found_results.reduce((acc, item) => {

        const name = Object.keys(item).find(key => key !== "_id");
        acc[name] = item[name];
        return acc;

    }, {});

    load_program_buttons(clean_programs);

}

async function get_user_programs() {

    if (offline) {

        show_offline_notification();
        return;

    }


    if (!user_data) {

        open_modal("auth_modal");
        return;

    }

    const res = await fetch(`/database/user/programs/${user_data.email}`);
    const data = await res.json();


    open_modal("load_modal");
    load_program_buttons(data);

}

function save_user_program() {

    if (offline) {

        show_offline_notification();
        return;
    
    }

    if (!user_data) {

        open_modal("auth_modal");
        return;

    }

    if (!current_program_data) {

        open_modal("save_modal");
        return;

    }

    save_program();

}

async function save_program() {

    const code = document.getElementById("code_text_area").value;
    console.log(user_data.email)
    const email = user_data.email;

    let name;

    if (!current_program_data) {

        name = document.getElementById("program_name").value;

    }

    else {

        name = current_program_data.name;

    }
    
    const res = await fetch(`/database/program/${email}`, {

        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, code })

    })  

    close_modal("save_modal");

}

async function delete_user_program() {

    if (offline) {

        show_offline_notification();
        return;

    }


    if (!user_data) {

        open_modal("auth_modal");
        return;

    }

    const res = await fetch(`/database/user/programs/${user_data.email}`);
    const data = await res.json();


    open_modal("load_modal");
    load_program_buttons(data, delete_program);

}

function load_program_buttons(programs, method = load_program) {

    const list = document.getElementById("program_list");
    list.innerHTML = "";

    const program_names = Object.keys(programs);

    program_names.forEach(name => {

        const button = document.createElement("button");
        button.className = "control-bar-button";
        button.innerText = name;
        button.onclick = () => {

            if (method == delete_program) {

                method(name);

            }

            else{
 
                method(name, programs[name]);
                close_modal("load_modal");

            }

        }

        list.appendChild(button);

    });

}

function load_program(name, program) {

    current_program_data = { "name": name, "program": program };

    const code_area = document.getElementById("code_text_area");
    code_area.value = program;

}

async function delete_program(programName) {

    const email = user_data.email;   
    const res = await fetch((`/database/program/${programName}`),{

        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })

    })

    const data = await res.json();
    close_modal("load_modal");

}

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
        is_sign_up = 2;
        send_ping();
        document.getElementById('auth_modal').style.display = "none";

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
        body: JSON.stringify({ name, email, password })

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

    if (id == "auth_modal" && is_sign_up == 2) {

        const title = document.getElementById("auth_title");
        const email_input = document.getElementById("email");
        const password_input = document.getElementById("password");
        const submit_button = document.getElementById("auth_submit_button");
        const auth_toggle_link = document.getElementById("auth_toggle_link");

        auth_toggle_link.style.display = "none";

        document.getElementById("auth_sign_out_button").style.display = "block";

        email_input.style.display = "none";
        password_input.style.display = "none";
        submit_button.style.display = "none";
        title.innerText = user_data.name;

    }

    document.getElementById(id).style.display = "flex";

}

function sign_out() {

    user_data = null;
    is_sign_up = 1;

    const email_input = document.getElementById("email");
    const password_input = document.getElementById("password");
    const submit_button = document.getElementById("auth_submit_button");
    const auth_toggle_link = document.getElementById("auth_toggle_link");

    auth_toggle_link.style.display = "block";
    email_input.style.display = "block";
    password_input.style.display = "block";
    submit_button.style.display = "block";

    toggle_auth_mode();
    document.getElementById("auth_sign_out_button").style.display = "none";
    send_ping();
    close_modal("auth_modal");

}

function close_modal(id) {

    if(id == "auth_modal") {

        is_sign_up = 0;
        document.getElementById("password").value = "";
        document.getElementById("confirm_password").value = "";
        document.getElementById("auth_error_message").value = "";
        document.getElementById("username").value = "";
        document.getElementById("email").value = "";

    }

    document.getElementById(id).style.display = "none";
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

// 0 = sign in, 1 = sign up, 2 = signed in
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

        if (offline) {

            show_online_notification();

            const res = await fetch('/newToken');
            data = await res.json();

            session_token = data.token;

        }

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
    setInterval(send_ping, 5000);

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

async function show_online_notification() {

    const notify = document.getElementById("online-notification");
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

window.addEventListener('DOMContentLoaded', () => {

    const tableArea = document.getElementById('table_area');
    const handle = document.getElementById('table_handle');

    if (!tableArea || !handle) return;

    handle.addEventListener('click', () => {

        tableArea.classList.toggle('open');
        
    });

});