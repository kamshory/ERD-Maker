
# ERD-Maker

**ERD-Maker** is a web-based tool designed to help you create and edit Entity Relationship Diagrams (ERDs) with support for MySQL database structures. This tool allows users to define database entities, add and edit columns, manage relationships between entities, and generate MySQL queries for creating and dropping tables. The application is responsive and includes features such as exporting diagrams, importing MySQL dump queries, and more.

## Features

-   **Create New Entities**: Easily create new entities (tables) with custom names.
-   **Edit Existing Entities**: Modify the properties of existing entities, including column names, types, and relationships.
-   **Add Columns**: Add columns with customizable names, data types, nullable properties, default values, primary keys, and auto-increment options.
-   **Edit Columns**: Edit column details like name, type, and other properties.
-   **Foreign Key Management**: Add and edit foreign keys to define relationships between tables.
-   **Render ERD Diagram**: Visualize relationships between entities in a diagram, showing columns and their relationships.
-   **Export to MySQL Query**: Export the ERD as a MySQL `CREATE TABLE` and `DROP TABLE` query, ready to be used in a MySQL database.
-   **Import MySQL Dump**: Import a MySQL dump query and generate the corresponding ERD.

## Demo

You can see the project in action by visiting the live demo (if available) or run it locally by following the installation instructions below.

## Installation

To run **ERD-Maker** locally on your machine:

1.  Clone the repository:

```bash
git clone https://github.com/yourusername/ERD-Maker.git
```

2. Navigate to the project directory:

```bash
cd ERD-Maker
```

1.  Open the `index.html` file in your browser to start using the ERD-Maker tool.
    

## Usage

1.  **Create Entity**: Click on "Create Entity" to start a new table. Define the table name and add columns by selecting data types like `VARCHAR`, `INT`, `DATE`, etc. You can specify attributes like whether the column is nullable or has a default value.
    
2.  **Edit Entity**: Click on any existing entity to edit it. You can modify the columns, data types, and relationships.
    
3.  **Add Foreign Key**: Define relationships between tables by adding foreign keys. You can link columns from different entities together to represent a database relationship.
    
4.  **Export to MySQL Query**: Once your entities and relationships are set, you can export the ERD as a MySQL dump query. This query includes `CREATE TABLE` and `DROP TABLE` statements.
    
5.  **Import MySQL Dump**: If you have an existing MySQL dump query, you can import it to visualize the schema and create an ERD diagram.
    

## Supported MySQL Data Types

The following MySQL data types are supported for columns:

-   **Numeric**: `TINYINT`, `SMALLINT`, `MEDIUMINT`, `INT`, `BIGINT`, `DECIMAL`, `FLOAT`, `DOUBLE`, `BIT`
-   **Date and Time**: `DATE`, `DATETIME`, `TIMESTAMP`, `TIME`, `YEAR`
-   **Strings**: `CHAR`, `VARCHAR`, `TEXT`, `TINYTEXT`, `MEDIUMTEXT`, `LONGTEXT`, `ENUM`, `SET`
-   **Binary**: `BLOB`, `TINYBLOB`, `MEDIUMBLOB`, `LONGBLOB`, `BINARY`, `VARBINARY`
-   **Other**: `JSON`, `UUID`, `GEOMETRY`, `POINT`, `LINESTRING`, `POLYGON`

## Contributing

Contributions are welcome! If you'd like to contribute to the project, please fork the repository, make your changes, and create a pull request. If you're reporting a bug or suggesting an enhancement, please create an issue.


