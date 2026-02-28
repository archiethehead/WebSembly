class memory {

    constructor(new_address, new_value) {

        this.address = new_address
        this.value = new_value

    }

    set_value(new_value) {

        this.value = new_value

    }

}

function construct_global_memory(memory_size) {

    let global_memory = []

    for (i = 0; i < memory_size; i++) {

        let new_memory = new memory(i, 0)
        global_memory.push(new_memory)

    }

    return global_memory

}

class virtual_machine {

    constructor(memory_size) {

        this.global_memory = construct_global_memory(memory_size)

    }


}

var a = new virtual_machine(10000)
console.log(a.global_memory)