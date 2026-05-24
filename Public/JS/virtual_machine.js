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
        this.labels = {}
        this.cmp_vals = [0, 0]
    
        this.opcodes["MOV"] = this.mov.bind(this)
        this.opcodes["CMP"] = this.cmp.bind(this)
        this.opcodes["B"] = this.branch.bind(this)
        this.opcodes["BEQ"] = this.beq.bind(this)
        this.opcodes["BLT"] = this.blt.bind(this)
        this.opcodes["BGT"] = this.bgt.bind(this)
        this.opcodes["BNE"] = this.bne.bind(this)
        this.opcodes["LDR"] = this.ldr.bind(this)
        this.opcodes["STR"] = this.str.bind(this)
        this.opcodes["ADD"] = this.add.bind(this)
        this.opcodes["SUB"] = this.sub.bind(this)
        this.opcodes["MUL"] = this.mul.bind(this)
        this.opcodes["DIV"] = this.div.bind(this)
        this.opcodes["AND"] = this.and.bind(this)
        this.opcodes["ORR"] = this.or.bind(this)
        this.opcodes["XOR"] = this.xor.bind(this)
        this.opcodes["NOT"] = this.not.bind(this)
        this.opcodes["LSL"] = this.lsl.bind(this)
        this.opcodes["LSR"] = this.lsr.bind(this)

    }

    // Execution

    execute_instruction(instruction) {


        // Lables and exit commands shouldn't be executed
        // and can be skipped with a lookup and condition.
        
        if (instruction in this.labels | instruction == 'HALT') {

            return

        }

        // Parsed instruction is ALWAYS returned in the
        // format 'opcode, operand_one, operand_two,
        // result_location.'

        instruction = this.parse_instruction(instruction)
        let opcode = instruction[0]
        let operand_one = instruction[1]
        let operand_two = instruction[2]
        let result_location = instruction[3]

        this.opcodes[opcode](operand_one, operand_two, result_location)
        
    }

    execute_program(program) {

        // Indexing each label in the program for branching.
        for (let i = 0; i < program.length; i ++){

            if (program[i].endsWith(':')) {

                this.labels[program[i]] = i

            }

        }

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

        // Addressing global memory should be done with standalone numbers,
        // the absence of any prepending labels (R, #) indicates memory
        // addressing.

        else if (variable[0] != 'R' & variable[0] != '#') {

            variable = this.global_memory[Number(variable)]

        }
        
        return variable

    }

    // Opcode Implementations
    //
    // All opcodes share the same three operands:
    //  .operand_one (x)
    //  .operand_two (y)
    //  .result_location (r)
    //
    // To abstract complexity away from the execution
    // and parsing functions, but this doesn't mean
    // all three will be used.

    // Move value 'y' into 'x/r' register.
    mov(x, y, r) {

        this.registers[r] = y

    }

    // Compare the contents of register 'r' with the
    // value 'y,' storing them in the cmp cache.
    cmp(x, y, r) {

        this.cmp_vals = [this.registers[r], y]

    }

    // Branch to 'x' Label
    branch(x, y, r) {

        this.registers["PC"] = this.labels[x]

    }

    // Branch to label 'x' if the values in the
    // cmp cache are equal.
    beq(x, y, r) {

        if (this.cmp_vals[0] == this.cmp_vals[1]) {

            branch(x, y, r)

        }

    }

    // Branch to label 'x' if the first value in the
    // cmp cache is less than the second value.
    blt(x, y, r) {

        if (this.cmp_vals[0] < this.cmp_vals[1]) {

            branch(x, y, r)

        }

    }

    // Branch to label 'x' if the first value in the
    // cmp cache is greater than the second value.
    bgt(x, y, r) {

        if (this.cmp_vals[0] > this.cmp_vals[1]) {

            branch(x, y, r)

        }

    }

    // Branch to label 'x' if the values in the
    // cmp cache are not equal.
    bne(x, y, r) {

        if (this.cmp_vals[0] != this.cmp_vals[1]) {

            this.branch(x, y, r)

        }

    }
    
    // Load value in memory 'y' into register 'r.'
    ldr(x, y, r) {

        this.registers[r] = this.global_memory[y]

    }

    // Store value in register 'r' in memorys
    // location 'y.'
    str(x, y, r) {

        this.global_memory[y] = this.registers[r]

    }

    // Add 'y' value to register 'x' and store the
    // result in register 'r.'
    add(x, y, r) {

        this.registers[r] = this.registers[x] + y

    }

    // Subtract 'y' value from register 'x' and store the
    // result in register 'r.'
    sub(x, y, r) {

        this.registers[r] = this.registers[x] - y

    }

    // Multiply 'y' value with register 'x' and store the
    // result in register 'r.'
    mul(x, y, r) {

        this.registers[r] = this.registers[x] * y
        
    }

    // Divide 'y' value by register 'x' and store the
    // result in register 'r.'
    div(x, y, r) {

        this.registers[r] = this.registers[x] / y
        
    }

    // Perform Bitwise AND between the contents of
    // register 'x,' the value 'y,' and store the
    // result in register 'r.'
    and(x, y, r) {

        this.registers[r] = this.registers[x] & y

    }

    // Perform Bitwise OR between the contents of
    // register 'x,' the value 'y,' and store the
    // result in register 'r.'
    or(x, y, r) {

        this.registers[r] = this.registers[x] | y

    }

    // Perform Bitwise Exclusive OR between the contents of
    // register 'x,' the value 'y,' and store the
    // result in register 'r.'
    xor(x, y, r) {

        this.registers[r] = this.registers[x] ^ y

    }

    // Perform Bitwise NOT between the contents of
    // register 'x,' the value 'y,' and store the
    // result in register 'r.'
    not(x, y, r) {

        this.registers[r] = ~y

    }

    // Logically shift left the bits in register 'x'
    // 'y' number of times, and store the result in
    // register 'r.'
    lsl(x, y, r) {

        this.registers[r] = this.registers[x]
        for (let i = 0; i < y; i++) {

            this.registers[r] = Number(this.registers[r] * 2)

        }

    }

    // Logically shift right the bits in register 'x'
    // 'y' number of times, and store the result in
    // register 'r.'
    lsr(x, y, r) {

        this.registers[r] = this.registers[x]
        for (let i = 0; i < y; i++) {

            this.registers[r] = Number(this.registers[r] / 2)

        }

    }

    parse_instruction(instruction) {

        // Some opcodes share operand requirements and as such,
        // share the same condition for instruction parsing to
        // save computational complexity.

        instruction = instruction.split(', ')
        var opcode = instruction[0]
        var operand_one = ''
        var operand_two = ''
        var result_location = ''

        if (opcode == 'MOV' | opcode == 'NOT' | opcode == 'CMP') {

            operand_one = instruction[1]
            operand_two = this.addressing_mode(instruction[2])
            result_location = operand_one

        }

        if (opcode == 'LDR' | opcode == 'STR') {

            operand_one = instruction[1]
            operand_two = instruction[2]
            result_location = operand_one       

        }

        if (opcode == 'ADD' | opcode == 'SUB' | opcode == 'LSL' | opcode == 'LSR' | opcode == 'MUL' | opcode == 'DIV'
            | opcode == 'AND' | opcode == 'ORR' | opcode == 'XOR') {

            operand_one = instruction[2]
            operand_two = this.addressing_mode(instruction[3])
            result_location = instruction[1]

        }

        if (opcode == "B" | opcode == 'BEQ' | opcode == 'BLT' | opcode == 'BNE' | opcode == 'BGT') {

            operand_one = instruction[1] + ":"

        }

        return [opcode, operand_one, operand_two, result_location]

    }

}

var a = new virtual_machine(10000)
program = [
        'MOV, R1, #1', 'LOOP:',
        'ADD, R1, R1, #1', 
        'CMP, R1, #5', 
        'BNE, LOOP', 
        'HALT']
        
a.execute_program(program)
console.log(program)
console.log(a.registers)
console.log(a.global_memory)