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

// Virtual Machine

class virtual_machine {

    constructor(memory_size) {

        this.global_memory = construct_global_memory(memory_size)
        this.registers = construct_registers()
        this.opcodes = {}
    
        this.opcodes["add"] = this.add
        this.opcodes["mov"] = this.mov

    }

    execute_instruction(instruction) {

        opcode, operand_one, operand_two, result_register = this.parse_instruction(instruction)

        this.registers[result_register] = this.opcodes[opcode](operand_one, addressing_mode(operand_two))
        
    }

    addressing_mode(variable) {

        if (variable[0] == '#') {

                variable = Number(variable.slice(1))

        }

        else if (variable[0] == 'R') {

            variable = this.registers[variable]

        }

        else if (variable[0] == 'R') {

            variable = this.global_memory[variable]

        }
        
        return variable

    }

    add(x, y) {

        return x + y

    }

    mov(x, y) {

        return y

    }

    parse_instruction(instruction) {



    }

}

var a = new virtual_machine(10000)