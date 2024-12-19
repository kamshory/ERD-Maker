class Column {
    constructor(name, type = "VARCHAR", nullable = false, defaultValue = "", primaryKey = false, autoIncrement = false, enumValues = "", length = "") {
        this.name = name;
        this.type = type;
        this.nullable = nullable;
        this.default = defaultValue;
        this.primaryKey = primaryKey;
        this.autoIncrement = autoIncrement;
        this.enumValues = enumValues;
        this.length = length;
    }

    toSQL() {
        let columnDef = `${this.name} ${this.type}`;
        let nullable = false;
        if (this.nullable && !this.primaryKey) {
            columnDef += " NULL";
            nullable = true;
        }
        else {
            columnDef += " NOT NULL";
        }
        if (this.primaryKey) {
            columnDef += " PRIMARY KEY";
        }
        if (this.autoIncrement) {
            columnDef += " AUTO_INCREMENT";
        }
        if (this.default && (this.default.toLowerCase() != 'null' || nullable)) {
            columnDef += ` DEFAULT ${this.default}`;
        }
        return columnDef;
    }
}

class Entity {
    constructor(name) {
        this.name = name;
        this.columns = [];
    }

    addColumn(column) {
        this.columns.push(column);
    }

    removeColumn(index) {
        this.columns.splice(index, 1);
    }

    toSQL() {
        let sql = `-- Entity: ${this.name}\n`;
        sql += `CREATE TABLE IF NOT EXISTS ${this.name} (\n`;
        this.columns.forEach(col => {
            sql += `\t${col.toSQL()},\n`;
        });
        sql = sql.slice(0, -2); // Remove last comma
        sql += "\n);\n\n";
        return sql;
    }
}

class EntityEditor {
    constructor() {
        this.entities = [];
        this.currentEntityIndex = -1;
        this.mysqlDataTypes = [
            'BIGINT', 'INT', 'MEDIUMINT', 'SMALLINT', 'TINYINT',
            'DOUBLE', 'DECIMAL', 'FLOAT', 'BIT',
            'DATETIME', 'TIMESTAMP', 'DATE', 'TIME', 'YEAR',
            'LONGTEXT', 'MEDIUMTEXT', 'TEXT', 'VARCHAR', 'CHAR', 'TINYTEXT',
            'ENUM', 'SET', 'JSON',
            'LONGBLOB', 'MEDIUMBLOB', 'BLOB', 'TINYBLOB',
            'UUID', 'VARBINARY', 'BINARY',
            'POLYGON', 'LINESTRING', 'POINT', 'GEOMETRY'
        ];
    }

    showEditor(entityIndex = -1) {
        if (entityIndex >= 0) {
            this.currentEntityIndex = entityIndex;
            const entity = this.entities[entityIndex];
            document.querySelector("#entity-name").value = entity.name;
            document.querySelector("#columns-table-body").innerHTML = '';
            entity.columns.forEach(col => this.addColumnToTable(col));
        } else {
            this.currentEntityIndex = -1;
            let newTableName = 'new_table';
            for (let i in this.entities) {
                let duplicated = false;
                for (let j in this.entities) {
                    newTableName = `new_table_${parseInt(i) + 2}`;
                    if (newTableName.toLowerCase() == this.entities[j].name.toLowerCase()) {
                        duplicated = true;
                    }
                }
                if (!duplicated) {
                    break;
                }
            }
            document.querySelector("#entity-name").value = newTableName;
            document.querySelector("#columns-table-body").innerHTML = '';
        }
        document.querySelector("#editor-form").style.display = "block";
    }

    addColumnToTable(column) {
        const tableBody = document.querySelector("#columns-table-body");
        const row = document.createElement("tr");

        let typeSimple = column.type.split('(')[0].trim();
        row.innerHTML = `
            <td class="column-action">
                <button onclick="editor.removeColumn(this)">❌</button>
                <button onclick="editor.moveUp(this)">⬆️</button>
                <button onclick="editor.moveDown(this)">⬇️</button>    
            </td>
            <td><input type="text" class="column-name" value="${column.name}" placeholder="Column Name"></td>
            <td>
                <select class="column-type" onchange="editor.updateColumnLengthInput(this)">
                    ${this.mysqlDataTypes.map(typeOption => `<option value="${typeOption}" ${typeOption === typeSimple ? 'selected' : ''}>${typeOption}</option>`).join('')}
                </select>
            </td>
            <td><input type="text" class="column-length" value="${column.length}" placeholder="Length" style="display: ${['VARCHAR', 'BIGINT', 'INT'].includes(typeSimple) ? 'inline' : 'none'};"></td>
            <td><input type="text" class="column-enum" value="${column.enumValues}" placeholder="ENUM values (comma separated)" style="display: ${typeSimple === 'ENUM' ? 'inline' : 'none'};"></td>
            <td><input type="text" class="column-default" value="${column.default}" placeholder="Default Value"></td>
            <td><input type="checkbox" class="column-nullable" ${column.nullable ? 'checked' : ''}></td>
            <td><input type="checkbox" class="column-primaryKey" ${column.primaryKey ? 'checked' : ''}></td>
            <td><input type="checkbox" class="column-autoIncrement" ${column.autoIncrement ? 'checked' : ''}></td>
        `;

        tableBody.appendChild(row);
    }

    addColumn() {
        const entityName = document.querySelector('#entity-name').value;
        let count = document.querySelectorAll('.column-name').length;
        let countStr = count <= 0 ? '' : count + 1;
        const column = new Column(`${entityName}_col${countStr}`);
        this.addColumnToTable(column);
    }

    removeColumn(button) {
        const row = button.closest("tr");
        row.remove();
    }

    moveUp(button) {
        const row = button.closest("tr");
        const tableBody = document.querySelector("#columns-table-body");
        const previousRow = row.previousElementSibling;
        if (previousRow) {
            tableBody.insertBefore(row, previousRow);
        }
    }

    moveDown(button) {
        const row = button.closest("tr");
        const tableBody = document.querySelector("#columns-table-body");
        const nextRow = row.nextElementSibling;
        if (nextRow) {
            tableBody.insertBefore(nextRow, row);
        }
    }

    saveEntity() {
        const entityName = document.querySelector("#entity-name").value;
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
            let column = new Column(
                columnNames[i].value,
                columnTypes[i].value,
                columnNullables[i].checked,
                columnDefaults[i].value || null,
                columnPrimaryKeys[i].checked,
                columnAutoIncrements[i].checked,
                columnEnums[i].value || null,
                columnLengths[i].value || null
            );

            columns.push(column);
        }

        if (this.currentEntityIndex >= 0) {
            // Update existing entity
            this.entities[this.currentEntityIndex].name = entityName;
            this.entities[this.currentEntityIndex].columns = columns;
        } else {
            // Add a new entity
            const newEntity = new Entity(entityName);
            columns.forEach(col => newEntity.addColumn(col));
            this.entities.push(newEntity);
        }

        this.renderEntities();
        this.cancelEdit();
    }

    renderEntities() {
        const container = document.querySelector("#entities-container");
        container.innerHTML = '';

        this.entities.forEach((entity, index) => {
            const entityDiv = document.createElement("div");
            entityDiv.classList.add("entity");
            let columnsInfo = entity.columns.map(col => col.length > 0 ? `<li>${col.name} <span class="data-type">${col.type}(${col.length})</span></li>` : `<li>${col.name} <span class="data-type">${col.type}</span></li>`).join('');

            entityDiv.innerHTML = `
                <div class="entity-header">
                    <button onclick="editor.deleteEntity(${index})">❌</button>
                    <button onclick="editor.editEntity(${index})">✏️</button>
                    <h4>${entity.name}</h4>
                </div>
                <div class="entity-body">
                    <ul>${columnsInfo}</ul>
                </div>
            `;

            container.appendChild(entityDiv);
        });
    }

    editEntity(index) {
        this.currentEntityIndex = index;
        this.showEditor(index);
    }

    deleteEntity(index) {
        this.entities.splice(index, 1);
        this.renderEntities();
    }

    cancelEdit() {
        document.querySelector("#editor-form").style.display = "none";
    }

    updateColumnLengthInput(selectElement) {
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

    exportToSQL() {
        let sql = "";
        this.entities.forEach(entity => {
            sql += `-- Entity: ${entity.name}\n`;
            sql += `CREATE TABLE IF NOT EXISTS ${entity.name} (\n`;

            entity.columns.forEach(col => {
                sql += `  ${col.toSQL()},\n`;
            });

            sql = sql.slice(0, -2); // Remove last comma
            sql += "\n);\n\n";
        });

        console.log(sql);
    }

    // Handle file import (for MySQL dump)
    importFromSQL() {
        document.querySelector("#file-import").click();
    }

    handleFileImport(event) {
        const file = event.target.files[0];
        const reader = new FileReader();

        reader.onload = function () {
            const content = reader.result;
            console.log(content);
        };

        reader.readAsText(file);
    }
}

// Instantiate the editor
const editor = new EntityEditor();
