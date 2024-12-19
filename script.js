let entities = []; // Store entities
let currentEntityIndex = -1; // Track the index of the currently edited entity

const mysqlDataTypes = [
    // Numeric types (sorted from biggest to smallest)
    'BIGINT',
    'INT',
    'MEDIUMINT',
    'SMALLINT',
    'TINYINT',

    // Floating point and decimal types (sorted from largest precision to smallest)
    'DOUBLE',
    'DECIMAL',
    'FLOAT',

    // Bit type
    'BIT',

    // Date and time types (sorted from most precise to least)
    'DATETIME',
    'TIMESTAMP',
    'DATE',
    'TIME',
    'YEAR',

    // String types (sorted by size from largest to smallest)
    'LONGTEXT',
    'MEDIUMTEXT',
    'TEXT',
    'VARCHAR',
    'CHAR',
    'TINYTEXT',

    // Set and Enum types
    'ENUM',
    'SET',

    // JSON type
    'JSON',

    // Binary large objects (sorted from largest to smallest)
    'LONGBLOB',
    'MEDIUMBLOB',
    'BLOB',
    'TINYBLOB',

    // UUID type
    'UUID',

    // Binary types
    'VARBINARY',
    'BINARY',

    // Geometry types
    'POLYGON',
    'LINESTRING',
    'POINT',
    'GEOMETRY'
];


// Show the editor form for creating a new entity or editing an existing one
function showEditor(entityIndex = -1) {
    if (entityIndex >= 0) {
        currentEntityIndex = entityIndex;
        const entity = entities[entityIndex];
        document.getElementById("entity-name").value = entity.name;
        document.getElementById("columns-table-body").innerHTML = '';

        entity.columns.forEach(col => {
            addColumnToTable(col.name, col.type, col.nullable, col.default, col.primaryKey, col.autoIncrement, col.enumValues, col.length);
        });
    } else {
        document.getElementById("entity-name").value = 'new_table'; // Clear the form for new entity
        document.getElementById("columns-table-body").innerHTML = ''; // Clear columns table
    }
    
    document.getElementById("editor-form").style.display = "block";
}

// Add a new column to the entity editor
function addColumn() {
    let entityName = document.querySelector('#entity-name').value;
    let count = document.querySelectorAll('.column-name').length;
    let countStr = count > 0 ? count : '';
    addColumnToTable(`${entityName}_col${countStr}`, "VARCHAR", false, "", false, false, "", "");
}

// Helper function to add a column to the columns table (used by both add and edit)
function addColumnToTable(name = "", type = "VARCHAR", nullable = false, defaultValue = "", primaryKey = false, autoIncrement = false, enumValues = "", length = "") //NOSONAR
{
    if(length == null)
    {
        length = '';
    }
    if(defaultValue == null)
    {
        defaultValue = '';
    }
    const tableBody = document.getElementById("columns-table-body");
    const row = document.createElement("tr");
    let typeSimple = type.split('(')[0].trim();

    row.innerHTML = `
        <td><input type="text" class="column-name" value="${name}" placeholder="Column Name"></td>
        <td>
            <select class="column-type" onchange="updateColumnLengthInput(this)">
                ${mysqlDataTypes.map(typeOption => `<option value="${typeOption}" ${typeOption === typeSimple ? 'selected' : ''}>${typeOption}</option>`).join('')}
            </select>
        </td>
        <td><input type="text" class="column-length" value="${length}" placeholder="Length" style="display: ${['VARCHAR', 'BIGINT', 'INT'].includes(typeSimple) ? 'inline' : 'none'};"></td>
        <td><input type="text" class="column-enum" value="${enumValues}" placeholder="ENUM values (comma separated)" style="display: ${typeSimple === 'ENUM' ? 'inline' : 'none'};"></td>
        <td><input type="text" class="column-default" value="${defaultValue}" placeholder="Default Value"></td>
        <td><input type="checkbox" class="column-nullable" ${nullable ? 'checked' : ''}></td>
        <td><input type="checkbox" class="column-primaryKey" ${primaryKey ? 'checked' : ''}></td>
        <td><input type="checkbox" class="column-autoIncrement" ${autoIncrement ? 'checked' : ''}></td>
        <td class="column-action"><button onclick="removeColumn(this)">❌</button></td>
    `;
    
    tableBody.appendChild(row);
}

// Remove a column
function removeColumn(button) {
    const row = button.closest("tr");
    row.remove();
}

// Save the entity (create new or update existing)
function saveEntity() {
    const entityName = document.getElementById("entity-name").value;
    const columns = [];

    const columnNames = document.querySelectorAll(".column-name");
    const columnTypes = document.querySelectorAll(".column-type");
    const columnNullables = document.querySelectorAll(".column-nullable");
    const columnDefaults = document.querySelectorAll(".column-default");
    const columnPrimaryKeys = document.querySelectorAll(".column-primaryKey");
    const columnAutoIncrements = document.querySelectorAll(".column-autoIncrement");
    const columnLengths = document.querySelectorAll(".column-length");
    const columnEnums = document.querySelectorAll(".column-enum");

    for (let i = 0; i < columnNames.length; i++) {
        let column = {
            name: columnNames[i].value,
            type: columnTypes[i].value,
            nullable: columnNullables[i].checked,
            default: columnDefaults[i].value || null,
            primaryKey: columnPrimaryKeys[i].checked,
            autoIncrement: columnAutoIncrements[i].checked,
            length: columnLengths[i].value || null,
            enumValues: columnEnums[i].value || null,
        };

        // Handle ENUM values if necessary
        if (column.type === "ENUM" && column.enumValues) {
            column.type = `ENUM(${column.enumValues.split(",").map(value => `'${value.trim()}'`).join(",")})`;
        }

        // Handle length for types like VARCHAR, BIGINT, INT
        if (['VARCHAR', 'BIGINT', 'INT'].includes(column.type) && column.length) {
            column.type = `${column.type}(${column.length})`;
        }

        columns.push(column);
    }

    if (currentEntityIndex >= 0) {
        // Update the existing entity
        entities[currentEntityIndex].name = entityName;
        entities[currentEntityIndex].columns = columns;
    } else {
        // Add a new entity if no entity was being edited
        const newEntity = { name: entityName, columns: columns };
        entities.push(newEntity);
    }

    renderEntities();
    cancelEdit();
}

// Render all entities in the main container
function renderEntities() {
    const container = document.getElementById("entities-container");
    container.innerHTML = ''; // Clear the container before rendering

    entities.forEach((entity, index) => {
        const entityDiv = document.createElement("div");
        entityDiv.classList.add("entity");

        let columnsInfo = entity.columns.map(col => `<li>${col.name} (${col.type})</li>`).join('');
        
        entityDiv.innerHTML = `
            <div class="entity-header">
                <button onclick="deleteEntity(${index})">❌</button>
                <button onclick="editEntity(${index})">✏️</button>
            <h4>${entity.name}</h4>
            </div>
            <div class="entity-body">
            <ul>${columnsInfo}</ul>
            </div>
            <div class="entity-footer">
            
            </div>
        `;

        container.appendChild(entityDiv);
    });
}

// Edit an existing entity
function editEntity(index) {
    currentEntityIndex = index;
    showEditor(index);
}

// Delete an entity
function deleteEntity(index) {
    entities.splice(index, 1);
    renderEntities();
}

// Cancel editing and close the editor
function cancelEdit() {
    document.getElementById("editor-form").style.display = "none";
}

// Export entities to MySQL SQL query
function exportToSQL() {
    let sql = "";
    entities.forEach(entity => {
        sql += `-- Entity: ${entity.name}\n`;
        sql += `CREATE TABLE IF NOT EXISTS ${entity.name} (\n`;

        entity.columns.forEach(col => {
            let columnDef = `${col.name} ${col.type}`;
            if (col.nullable) columnDef += " NULL";
            else columnDef += " NOT NULL";
            if (col.primaryKey) columnDef += " PRIMARY KEY";
            if (col.autoIncrement) columnDef += " AUTO_INCREMENT";
            if (col.default) columnDef += ` DEFAULT ${col.default}`;
            sql += `  ${columnDef},\n`;
        });

        sql = sql.slice(0, -2); // Remove last comma
        sql += "\n);\n\n";
    });

    console.log(sql);
}

// Handle file import (for MySQL dump)
function importFromSQL() {
    document.getElementById('file-import').click();
}

function handleFileImport(event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function() {
        const content = reader.result;
        console.log(content);
    };

    reader.readAsText(file);
}

// Update length input visibility based on selected column type
function updateColumnLengthInput(selectElement) {
    const row = selectElement.closest("tr");
    const columnType = selectElement.value;
    const lengthInput = row.querySelector(".column-length");
    const enumInput = row.querySelector(".column-enum");

    // Show length input for specific types
    if (['VARCHAR', 'BIGINT', 'INT'].includes(columnType)) {
        lengthInput.style.display = "inline";
    } else {
        lengthInput.style.display = "none";
    }

    // Show enum input for ENUM type
    if (columnType === "ENUM") {
        enumInput.style.display = "inline";
    } else {
        enumInput.style.display = "none";
    }
}
