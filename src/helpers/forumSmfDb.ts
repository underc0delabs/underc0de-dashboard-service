import mysql, { type Pool, type RowDataPacket } from "mysql2/promise";

export type ForumDbConfig = {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  tablePrefix: string;
};

let pool: Pool | null = null;

export const getForumDbConfig = (): ForumDbConfig | null => {
  const host = process.env.FORUM_DB_HOST?.trim();
  const user = process.env.FORUM_DB_USER?.trim();
  const database = process.env.FORUM_DB_NAME?.trim();

  if (!host || !user || !database) {
    return null;
  }

  return {
    host,
    port: Number(process.env.FORUM_DB_PORT) || 3306,
    user,
    password: process.env.FORUM_DB_PASSWORD ?? "",
    database,
    tablePrefix: process.env.FORUM_DB_PREFIX?.trim() || "smf_",
  };
};

const getPool = (): Pool | null => {
  const config = getForumDbConfig();
  if (!config) {
    return null;
  }

  if (!pool) {
    pool = mysql.createPool({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database,
      waitForConnections: true,
      connectionLimit: 4,
      enableKeepAlive: true,
    });
  }

  return pool;
};

const table = (config: ForumDbConfig, name: string) =>
  `${config.tablePrefix}${name}`;

export const fetchTopicPosterTimes = async (
  topicIds: number[],
): Promise<Map<number, number>> => {
  const config = getForumDbConfig();
  const db = getPool();
  const result = new Map<number, number>();

  if (!config || !db || topicIds.length === 0) {
    return result;
  }

  const uniqueIds = [...new Set(topicIds.filter((id) => Number.isFinite(id) && id > 0))];
  if (uniqueIds.length === 0) {
    return result;
  }

  const placeholders = uniqueIds.map(() => "?").join(", ");
  const topicsTable = table(config, "topics");
  const messagesTable = table(config, "messages");

  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT t.id_topic,
            COALESCE(NULLIF(t.last_post_time, 0), m.poster_time, 0) AS poster_time
       FROM ${topicsTable} t
       LEFT JOIN ${messagesTable} m ON m.id_msg = t.id_first_msg
      WHERE t.id_topic IN (${placeholders})`,
    uniqueIds,
  );

  for (const row of rows) {
    const seconds = Number(row.poster_time);
    if (Number.isFinite(seconds) && seconds > 0) {
      result.set(Number(row.id_topic), Math.floor(seconds));
    }
  }

  return result;
};

export const fetchMessagePosterTimes = async (
  messageIds: number[],
): Promise<Map<number, number>> => {
  const config = getForumDbConfig();
  const db = getPool();
  const result = new Map<number, number>();

  if (!config || !db || messageIds.length === 0) {
    return result;
  }

  const uniqueIds = [...new Set(messageIds.filter((id) => Number.isFinite(id) && id > 0))];
  if (uniqueIds.length === 0) {
    return result;
  }

  const placeholders = uniqueIds.map(() => "?").join(", ");
  const messagesTable = table(config, "messages");

  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT id_msg, poster_time
       FROM ${messagesTable}
      WHERE id_msg IN (${placeholders})`,
    uniqueIds,
  );

  for (const row of rows) {
    const seconds = Number(row.poster_time);
    if (Number.isFinite(seconds) && seconds > 0) {
      result.set(Number(row.id_msg), Math.floor(seconds));
    }
  }

  return result;
};
