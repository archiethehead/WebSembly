// Memory

function construct_global_memory(memory_size) {

    let global_memory = []

    for (i = 0; i < memory_size; i++) {

        let new_memory = 0
        global_memory.push(new_memory)

    }

    return global_memory

}

function construct_registers() {

    let registers = {}

    for (i = 0; i < 16; i++) {

        register_name = "R" + i
        registers[register_name] = 0

    }

    return registers

}

// Opcodes

function add(x, y) {

    return x + y

}

function sub(x, y) {

    return x - y

}

function opcode_constructor() {

    let opcodes = {}
    
    opcodes["add"] = add

    return opcodes

}

// Virtual Machine

class virtual_machine {

    constructor(memory_size) {

        this.global_memory = construct_global_memory(memory_size)
        this.registers = construct_registers()
        this.opcodes = opcode_constructor()

    }

    execute_instruction(opcode, operand_one, operand_two) {

        if (opcode = "mov") {

            if (operand_two[0] == '#') {

                operand_two = Number(operand_two.slice(1))

            }

            else if (operand_two[0] == 'R') {

                operand_two = this.registers[operand_two]

            }

            else if (operand_two[0] == 'R') {

                operand_two = this.global_memory[operand_two]

            }

            this.registers[operand_one] = operand_two

        }


    }

}

var a = new virtual_machine(10000)
a.global_memory[100] = 1
a.execute_instruction('mov', 'R1', '#1')
a.execute_instruction('mov', 'R2', 'R1')
a.execute_instruction('mov', 'R3', 100)
console.log(a.registers)