interface SqlValues {
  [key: string]: any;
}

interface WhereClause {
  [key: string]: any;
}

interface CreateSqlProps {
  sql: string;
  values?: any[];
}

interface CreateSqlParams {
  table: string;
  method: string;
  values?: SqlValues;
  where?: WhereClause;
}

const createSql = ({
  table,
  method,
  values,
  where,
}: CreateSqlParams): CreateSqlProps => {
  let columns = "";
  let tableValues = "";
  let sqlValues: any[] = [];
  let updateValues = "";
  let whereClause = "";

  if (values) {
    Object.entries(values).forEach(([key, value]) => {
      columns += `${key},`;
      updateValues += `${key}=?,`;
      tableValues += "?,";
      sqlValues.push(value);
    });

    // Remove the trailing commas
    columns = columns.slice(0, -1);
    updateValues = updateValues.slice(0, -1);
    tableValues = tableValues.slice(0, -1);
  }

  if (where) {
    Object.entries(where).forEach(([key, value]) => {
      whereClause += `${key}=${value} AND `;
    });
    // Remove the trailing 'AND '
    whereClause = whereClause.slice(0, -5);
  }

  switch (method.toLowerCase()) {
    case "post":
      return {
        sql: `INSERT INTO ${table} (${columns}) VALUES (${tableValues})`,
        values: sqlValues,
      };
    case "put":
      return {
        sql: `UPDATE ${table} SET ${updateValues} WHERE ${whereClause}`,
        values: sqlValues,
      };
    case "delete":
      return {
        sql: `DELETE FROM ${table} WHERE ${whereClause}`,
      };
    case "get":
      return {
        sql: `SELECT * FROM ${table} WHERE ${whereClause}`,
      };
    default:
      throw new Error("Unsupported method");
  }
};

export default createSql;
