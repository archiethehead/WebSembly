const memory_size = 1024
let cold_start = true

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

    registers['PC'] = ""
    registers['CI'] = ""
    registers['LR'] = ""
    registers['Error'] = ""

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
        this.opcodes["AND"] = this.and.bind(this)
        this.opcodes["ORR"] = this.or.bind(this)
        this.opcodes["XOR"] = this.xor.bind(this)
        this.opcodes["NOT"] = this.not.bind(this)
        this.opcodes["LSL"] = this.lsl.bind(this)
        this.opcodes["LSR"] = this.lsr.bind(this)

    }

    refresh_values() {

        this.global_memory = construct_global_memory(memory_size)
        this.registers = construct_registers()
        this.current_instruction = ''
        this.labels = {}
        this.cmp_vals = [0, 0]

    }

    return_registers() {

        return this.registers

    }


    return_memory() {

        return this.global_memory

    }

    // Execution

    execute_instruction(instruction) {


        // Lables and exit commands shouldn't be executed
        // and can be skipped with a lookup and condition

        if (instruction in this.labels || instruction.toUpperCase() == "HALT") {

            this.registers['LR'] = ""
            return

        }

        // Parsed instruction is ALWAYS returned in the
        // format 'opcode, operand_one, operand_two,
        // result_location.' If an error is found during
        // parsing, the instruction is assigned a Boolean
        // value of false.

        instruction = this.parse_instruction(instruction)

        if (!instruction) {

            return true

        }

        let opcode = instruction[0]
        let operand_one = instruction[1]
        let operand_two = instruction[2]
        let result_location = instruction[3]

        this.registers['CI'] = opcode
        this.registers['LR'] = result_location

        this.opcodes[opcode](operand_one, operand_two, result_location)
        
    }

    execute_program(program) {

        this.registers['PC'] = 0

        // Indexing each label in the program for branching.
        for (let i = 0; i < program.length; i ++){

            if (program[i].endsWith(':')) {

                this.labels[program[i]] = i

            }

        }

        while (this.current_instruction.toUpperCase() != 'HALT') {

            if (this.registers['PC'] == program.length) {
                
                break   

            }
            

            this.current_instruction = program[this.registers['PC']]
            
            var error = this.execute_instruction(this.current_instruction)


            if (error) {

                return 1;

            }

            this.registers['PC'] += 1

        }

        if (this.current_instruction.toUpperCase() == 'HALT') {

            this.registers['CI'] = 'HALT'
            this.registers['LR'] = ''

        }

        this.registers['PC'] -= 1

        return

    }

    addressing_mode(variable, memory = false) {

        var base = 10

        if (variable.slice(0, 2).toLowerCase() == '0x') {

            base = 16

        }

        else if (variable.slice(0, 2).toLowerCase() == '0b') {

            base = 2

        }

        if (variable[0] == '#') {

            var result = 0

            if (base == 16) {

                result = parseInt(variable, 16)
                
            }

            else if (base == 2) {

                result = parseInt(variable.slice(2), 2)

            }


            else {

                if ((variable.slice(0, 2) == '#0')) {

                    result = 0

                }

                else {
                    
                    result = Number(variable.slice(1))

                }

            }
            
            if (result == NaN) {
                
                this.registers['Error'] = 'Invalid Number'
                return false

            }

            if (result > Number.MAX_SAFE_INTEGER) {

                result = 9007199254740990

            }

            if (result < Number.MIN_SAFE_INTEGER) {

                result = -9007199254740991

            }

            return result



        }

        else if (variable[0].toUpperCase() == 'R') {


            if (!(variable.toUpperCase() in this.registers)) {

                this.registers['Error'] = 'Invalid Register'
                return false

            }

            return this.registers[variable.toUpperCase()]

        }

        // Addressing global memory should be done with standalone numbers,
        // the absence of any prepending labels (R, #) indicates memory
        // addressing.

        else if (variable[0] != 'R' && variable[0] != '#') {

            if (!(variable in this.global_memory)) {

                this.registers['Error'] = 'Invalid Memory'
                return false

            }

            if (memory) {

                return variable

            }

            else {

                return this.global_memory[Number(variable)]

            }

        }

        this.registers['Error'] = 'Invalid Operand'
        return false

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

        this.registers['LR'] = ""
        this.cmp_vals = [this.registers[r], y]

    }

    // Branch to 'x' Label
    branch(x, y, r) {

        this.registers["LR"] = ""
        this.registers["PC"] = this.labels[x]

    }

    // Branch to label 'x' if the values in the
    // cmp cache are equal.
    beq(x, y, r) {

        if (this.cmp_vals[0] == this.cmp_vals[1]) {

            this.branch(x, y, r)

        }

    }

    // Branch to label 'x' if the first value in the
    // cmp cache is less than the second value.
    blt(x, y, r) {

        if (this.cmp_vals[0] < this.cmp_vals[1]) {

            this.branch(x, y, r)

        }

    }

    // Branch to label 'x' if the first value in the
    // cmp cache is greater than the second value.
    bgt(x, y, r) {

        if (this.cmp_vals[0] > this.cmp_vals[1]) {

            this.branch(x, y, r)

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

            console.log(this.registers[r])
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

        var opcode = instruction.substring(0, instruction.indexOf(' '))
        var instruction = instruction.substring(instruction.indexOf(' ') + 1)

        if (!(opcode.toUpperCase() in this.opcodes) | opcode == "") {

            this.registers['LR'] = ''
            this.registers['CI'] = opcode


            this.registers['Error'] = "Illegal Opcode"
            return false

        }

        instruction = instruction.split(', ')

        opcode = opcode.toUpperCase()

        var operand_one = ''
        var operand_two = ''
        var result_location = ''

        if (opcode == 'MOV' | opcode == 'NOT' | opcode == 'CMP') {

            operand_one = instruction[0].toUpperCase()

            if (!(operand_one in this.registers)) {

                this.registers['Error'] = "Invalid Register"
                return false

            }

            operand_two = this.addressing_mode(instruction[1])

            if (operand_two === false) { 

                return false

            }

            result_location = operand_one

        }

        if (opcode == 'LDR' | opcode == 'STR') {

            operand_one = instruction[0].toUpperCase()
            operand_two = this.addressing_mode(instruction[1], true)

            if (!(operand_one in this.registers)) {

                this.registers['Error'] = "Invalid Register"
                return false

            }

            if (!(Number(operand_two) in this.global_memory)) {

                this.registers['Error'] = "Invalid Memory"
                return false

            }

            result_location = operand_one.toUpperCase()

        }

        if (opcode == 'ADD' | opcode == 'SUB' | opcode == 'LSL' | opcode == 'LSR' | opcode == 'AND' | opcode == 'ORR' | opcode == 'XOR') {

            operand_one = instruction[1].toUpperCase()

            if (!(operand_one in this.registers)) {

                this.registers['Error'] = "Invalid Register"
                return false

            }

            operand_two = this.addressing_mode(instruction[2])

            if (operand_two === false) {

                return false

            }

            result_location = instruction[0].toUpperCase()

            if (!(result_location in this.registers)) {

                this.registers['Error'] = "Invalid Register"
                return false

            }

        }

        if (opcode == "B" | opcode == 'BEQ' | opcode == 'BLT' | opcode == 'BNE' | opcode == 'BGT') {

            operand_one = instruction[0] + ":"

            if (!(operand_one in this.labels)) {

                this.registers['Error'] = 'Invalid Jump Label'
                return false

            }

        }

        return [opcode, operand_one, operand_two, result_location]

    }

}

const vm = new virtual_machine(memory_size);

function refresh_registers() {

    var table = document.getElementById("register_table");
    var register_data = vm.return_registers();

    var keys = Object.keys(register_data)

    len = keys.length - 4
    x = 0

    if (!cold_start) {

        table = document.querySelector("#register_table tbody")
        x += 1
        len -= 1

    }

    for (x; x < len;  x ++) {


        if (cold_start) {

            var row = table.insertRow(-1)   
            var address = row.insertCell(0)
            var data = row.insertCell(1)

            data.classList.add('data-value')
            address.innerHTML = keys[x]
            data.innerHTML = register_data[keys[x]]

        }

        else {


            var row = table.rows[x]
            var data = row.cells[1]

            data.innerHTML = register_data[keys[x - 1]]

        }

    }

}

function refresh_program_data() {

    var table = document.getElementById("program_table");
    var register_data = vm.return_registers();

    var keys = Object.keys(register_data)

    len = keys.length
    x = 16

    if (!cold_start) {

        table = document.querySelector("#program_table tbody")

    }

    for (x; x < len;  x ++) {


        if (cold_start) {

            var row = table.insertRow(-1)   
            var address = row.insertCell(0)
            var data = row.insertCell(1)

            data.classList.add('data-value')
            address.innerHTML = keys[x]
            data.innerHTML = register_data[keys[x]]

        }

        else {

            if (x === 20) {

                continue

            }

            var row = table.rows[x - 16]
            var data = row.cells[1]

            data.innerHTML = register_data[keys[x]]

        }

    }

}

function refresh_memory() {

    var table = document.getElementById("memory_table")
    var memory_data = vm.return_memory()
    var keys = Object.keys(memory_data)

    len = keys.length
    x = 0

    if (!cold_start) {

        table = document.querySelector("#memory_table tbody")
        x += 1
        len += 1

    }

    for (x; x <  len;  x ++) {

        if (cold_start) {

            var row = table.insertRow(-1)   
            var address = row.insertCell(0)
            var data = row.insertCell(1)
            var address_num = Number(keys[x])

            data.classList.add('data-value')
            address.innerHTML = address_num
            data.innerHTML = memory_data[keys[x]]

        }

        else {

            var row = table.rows[x]
            var data = row.cells[1]
        
            data.innerHTML = memory_data[keys[x - 1]]

        }

    }

    if (cold_start) {

        cold_start = false

    }

}

// 0 -> No halt instruction, program can't execute

function parse_program(raw_program) {

    raw_program = raw_program.split("\n")

    for (var x = 0; x < raw_program.length; x++) {

        raw_program[x] = raw_program[x].trim()

    }
    
    raw_program = raw_program.filter(item => item !== "" && item !== null && item !== undefined && item[0] !== ";");

    return raw_program

}

function execute() {

    var program = parse_program(document.getElementById("code_text_area").value)
    if (program.length == 0) {

        return

    }

    vm.refresh_values()
    vm.execute_program(program)

    refresh_registers()
    refresh_program_data()
    refresh_memory()

    vm.refresh_values()

}

function execute_step() {

    data = document.getElementById("code_text_area").value
    if (data.trim() == "") {

        return

    }

    var program = parse_program(data)
        
    if (vm.registers['PC'] == program.length || vm.registers['Error'] != '' || vm.registers['PC'] == 0) {
        
        vm.refresh_values()
        vm.registers['PC'] = 0

        for (let i = 0; i < program.length; i ++){

            if (program[i].endsWith(':')) {

                vm.labels[program[i]] = i

            }

        }

    }

    if (program[vm.registers['PC']].endsWith(':')) {

         vm.registers['CI'] = program[vm.registers['PC']]
        
    }

    vm.execute_instruction(program[vm.registers['PC']])

    if (program[vm.registers['PC']].toUpperCase() == 'HALT') {

            vm.registers['CI'] = 'HALT'
            vm.registers['LR'] = ''

        }

    refresh_registers()
    refresh_program_data()
    refresh_memory()

    vm.registers['PC'] += 1

}

function clear_data() {

    document.getElementById("code_text_area").value = ""
    vm.refresh_values()
    refresh_registers()
    refresh_program_data()
    refresh_memory()

}