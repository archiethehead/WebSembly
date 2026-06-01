async function get_example_programs() {

    const res = await fetch('/database/examplePrograms');
    const data = await res.json();
    console.log(data);

}