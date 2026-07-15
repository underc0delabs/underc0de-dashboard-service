<?php
/**
 * Parche para underc0de.org/foro/extern/api.php
 *
 * La app móvil necesita poster_time (unix segundos) en list y replies.
 * Hoy la API devuelve solo id_topic, subject y poster_name.
 *
 * OPCIÓN A (recomendada si api.php ya consulta SMF):
 * En el array de salida de cada acción, agregar poster_time:
 *
 * list — por cada topic:
 *   'poster_time' => (int) ($topic['last_post_time'] ?? $topic['poster_time'] ?? 0),
 *
 * replies — por cada mensaje:
 *   'poster_time' => (int) ($message['poster_time'] ?? 0),
 *
 * OPCIÓN B (sin tocar api.php):
 * Desplegar underc0de-dashboard-service con FORUM_DB_* y usar
 * POST /api/v1/forum/list y /api/v1/forum/replies (la app ya apunta ahí).
 *
 * Ejemplo SMF 2.1 si hay que consultar la DB en list:
 *
 * $request = $smcFunc['db_query']('', '
 *   SELECT t.id_topic, t.id_first_msg, t.last_post_time, m.poster_time
 *   FROM {db_prefix}topics AS t
 *   LEFT JOIN {db_prefix}messages AS m ON (m.id_msg = t.id_first_msg)
 *   WHERE t.id_board = {int:board}
 *   ORDER BY t.id_last_msg DESC
 *   LIMIT {int:limit}',
 *   array('board' => $board, 'limit' => $limit)
 * );
 */
