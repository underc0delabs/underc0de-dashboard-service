/**
 * Snippet para api.php del foro (underc0de.org/foro/extern/api.php).
 * Agregar poster_time (unix segundos) en las respuestas de list y replies.
 *
 * list — por cada topic en el array de salida:
 *   'poster_time' => (int) ($topic['last_post_time'] ?? $topic['poster_time'] ?? 0),
 *
 * replies — por cada mensaje:
 *   'poster_time' => (int) ($message['poster_time'] ?? 0),
 *
 * La app ya mapea poster_time / last_post_time y muestra fecha+hora en AR.
 */
