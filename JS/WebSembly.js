// Memory

class memory {

    constructor(new_value) {

        this.value = new_value

    }

    set_value(new_value) {

        this.value = new_value

    }

}

function construct_global_memory(memory_size) {

    let global_memory = []

    for (i = 0; i < memory_size; i++) {

        let new_memory = new memory(0)
        global_memory.push(new_memory)

    }

    return global_memory

}

function construct_registers() {

    let registers = {}

    for (i = 0; i < 16; i++) {

        register_name = "R" + i
        registers[register_name] = new memory(0)

    }

    return registers

}

// Virtual Machine

class virtual_machine {

    constructor(memory_size) {

        this.global_memory = construct_global_memory(memory_size)
        this.registers = construct_registers()

    }


}

var a = new virtual_machine(10000)
console.log(a.global_memory)
console.log(a.registers)