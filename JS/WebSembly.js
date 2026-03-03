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

    registers['PC'] = 0

    return registers

}

// Virtual Machine

class virtual_machine {

    constructor(memory_size) {

        this.global_memory = construct_global_memory(memory_size)
        this.registers = construct_registers()
        this.current_instruction = ''
        this.opcodes = {}
    
        this.opcodes["MOV"] = this.mov.bind(this)
        this.opcodes["ADD"] = this.add.bind(this)
        this.opcodes["SUB"] = this.sub.bind(this)
        this.opcodes["LSL"] = this.lsl.bind(this)
        this.opcodes["LSR"] = this.lsr.bind(this)
        this.opcodes["HALT"] = this.halt.bind(this)

    }

    execute_instruction(instruction) {

        let opcode = ''
        let operand_one = ''
        let operand_two = ''
        let result_location = ''

        instruction = this.parse_instruction(instruction)
        opcode = instruction[0]
        operand_one = instruction[1]
        operand_two = instruction[2]
        result_location = instruction[3]

        this.opcodes[opcode](operand_one, operand_two, result_location)
        
    }

    execute_program(program) {

        while (this.current_instruction != 'HALT') {

            this.current_instruction = program[this.registers['PC']]
            this.execute_instruction(this.current_instruction)

            this.registers['PC'] += 1

        }

        console.log('FIN')

    }

    addressing_mode(variable) {

        if (variable[0] == '#') {

                variable = Number(variable.slice(1))

        }

        else if (variable[0] == 'R') {

            variable = this.registers[variable]

        }

        else if (variable[0] != 'R' & variable[0] != '#') {

            variable = this.global_memory[Number(variable)]

        }
        
        return variable

    }

    mov(x, y, r) {

        this.registers[r] = y

    }

    add(x, y, r) {

        this.registers[r] = this.registers[x] + y

    }

    sub(x, y, r) {

        this.registers[r] = this.registers[x] - y

    }

    lsl(x, y, r) {

        this.registers[r] = this.registers[x]
        for (let i = 0; i < y; i++) {

            this.registers[r] = Number(this.registers[r] * 2)

        }

    }

    lsr(x, y, r) {

        this.registers[r] = this.registers[x]
        for (let i = 0; i < y; i++) {

            this.registers[r] = Number(this.registers[r] / 2)

        }
    }

    halt(x, y, r) {

        return ''

    }

    parse_instruction(instruction) {

        instruction = instruction.split(', ')
        var opcode = instruction[0]
        var operand_one = ''
        var operand_two = ''
        var result_location = ''

        if (opcode == 'MOV') {

            operand_one = instruction[1]
            operand_two = this.addressing_mode(instruction[2])
            result_location = operand_one

        }

        if (opcode == 'ADD' | opcode == 'SUB' | opcode == 'LSL' | opcode == 'LSR') {

            operand_one = instruction[2]
            operand_two = this.addressing_mode(instruction[3])
            result_location = instruction[1]

        }

        return [opcode, operand_one, operand_two, result_location]

    }

}

var a = new virtual_machine(10000)
program = ["MOV, R1, #5", "ADD, R2, R1, R1", 'SUB, R2, R2, #2', 'LSR, R3, R2, #1', 'HALT']
a.execute_program(program)
console.log(program)
console.log(a.registers)
console.log(a.global_memory)