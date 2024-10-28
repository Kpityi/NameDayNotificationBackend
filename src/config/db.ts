import mysql, {
  RowDataPacket,
  OkPacket,
  ResultSetHeader,
} from "mysql2/promise";
import { DB_NAME, DB_HOST, DB_PASSWORD, DB_USER } from "./environment";

type QueryResult =
  | RowDataPacket[]
  | RowDataPacket[][]
  | OkPacket
  | OkPacket[]
  | ResultSetHeader;

const db = mysql.createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  timezone: "Z",
  waitForConnections: true,
  connectionLimit: 10,
});

async function query<T extends QueryResult>(
  sql: string,
  params: any[]
): Promise<T> {
  const [result] = await db.execute<T>(sql, params);

  return result;
}
export default { query };
