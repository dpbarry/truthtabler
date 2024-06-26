function generateTruthTable() {
    // clear the print statements
    document.getElementById('error').innerText = "";
    document.getElementById('result').innerText = "";
    document.getElementById('truthTable').innerHTML = "";
    
    // sanitize input
    var prop = document.getElementById('input').value;
    var cleanProp = "";
    for (let i = 0; i < prop.length; i++) {
        if (prop[i] == " ") {
            continue;
        } else {
            if (!("()abcdefghijklmnopqrstuvwxyz^|>=!".includes(prop[i]))) {
                document.getElementById('error').innerText = "PSYCHO";
                return;
            }
            cleanProp = cleanProp.concat(prop[i]);
        }
    }
    document.getElementById('result').innerText = cleanProp;
    prop = cleanProp;
    
    // convert to Reverse Polish Notation
    var output = [];
    var operator = [];
    for (let i = 0; i < prop.length; i++) {
        if ("abcdefghijklmnopqrstuvwxyz".includes(prop[i])) {
            output.push(prop[i]);
        } else if ("(^|!>=".includes(prop[i])) {
            operator.push(prop[i]);
        } else if (prop[i] == ")") {
            while (operator[operator.length - 1] != "(") {
                if (operator.length == 0) {
                    document.getElementById('error').innerText = "PSYCHO";
                    return;
                } else {
                    output.push(operator.pop());
                }
            }
            operator.pop();
        }
    }
    while (operator.length != 0) {
        // check parentheses
        if (operator[operator.length - 1] == '(') {
            document.getElementById('error').innerText = "PSYCHO";
            return;
        }
        output.push(operator.pop());
    }
    document.getElementById('result').innerText = output;
    
    // identify the variables in the proposition
    var variables = [];
    for (let token of output) {
        if ("abcdefghijklmnopqrstuvwxyz".includes(token)) {
            if (!(variables.includes(token))) {
                variables.push(token);
            }
        }
    }
    
    // initialize truth table (2D array) with header row of variables + result column
    var table = [variables.slice()];
    table[0].push("✭");
    
    for (let i = 0; i < 2 ** (variables.length); i++) {
        /* generate truth assignments by interpreting the binary representation of i
           as assigning 0s and 1s to each respective variable */
        var truthAssignments = i.toString(2);
        while (truthAssignments.length < variables.length) {
            truthAssignments = "0".concat(truthAssignments);
        }
        
        // calculate truth values
        var operands = [];
        for (let token of output) {
            if ("^|>=".includes(token)) {
                var op2 = operands.pop();
                var op1 = operands.pop();
                operands.push(calculate(token, op1, op2, truthAssignments, variables) ? 1 : 0);
            } else if (token == "!") {
                operands.push(calculate(token, operands.pop(), null, truthAssignments, variables) ? 1 : 0);
            } else {
                operands.push(token);
            }
        }
        // add a row to table array with columns for the variables and for the result
        table.push(truthAssignments.split(""));
        table[i + 1].push(operands.pop());
    }
    createTable(table);
}

function calculate(token, op1, op2, truthAssignments, variables) {
    // unpack the truth assignment of each variable for this iteration
    if (op1 != 1 && op1 != 0) {
        op1 = parseInt(truthAssignments[variables.indexOf(op1)]);
    }
    if (op2 != 1 && op2 != 0) {
        op2 = parseInt(truthAssignments[variables.indexOf(op2)]);
    }
    if (token == "^") {
        return op1 && op2;
    } else if (token == "|") {
        return op1 || op2;
    } else if (token == ">") {
        return !op1 || op2;
    } else if (token == "=") {
        return (op1 && op2) || (!op1 && !op2);
    } else if (token == "!") {
        return !op1;
    }
}

function createTable(tableData) {
    // set up the truth table in the currently empty #truthTable
    var table = document.getElementById('truthTable');
    var tableBody = document.createElement('tbody');
    tableData.forEach(function(rowData) {
        var row = document.createElement('tr');
        rowData.forEach(function(cellData) {
            var cell = document.createElement('td');
            cell.appendChild(document.createTextNode(cellData));
            row.appendChild(cell);
        });
        tableBody.appendChild(row);
    });
    table.appendChild(tableBody);
    document.body.appendChild(table);
}
