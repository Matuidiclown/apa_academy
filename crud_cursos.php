<?php
require_once "conexion.php";

$metodo = $_SERVER["REQUEST_METHOD"];

// Extraer el número al final de la URL si viene como /crud_cursos.php/1
$idCurso = null;
$pathInfo = $_SERVER["PATH_INFO"] ?? parse_url($_SERVER["REQUEST_URI"], PHP_URL_PATH);

if (preg_match('/\/crud_cursos\.php\/(\d+)$/', $pathInfo, $matches)) {
    $idCurso = (int)$matches[1];
} elseif (preg_match('/^\/(\d+)$/', $pathInfo, $matches)) {
    $idCurso = (int)$matches[1];
} elseif (isset($_GET["id_curso"])) {
    // Mantiene compatibilidad si alguien usa ?id_curso=1
    $idCurso = (int)$_GET["id_curso"];
}

switch ($metodo) {
    // 1. READ: GET /crud_cursos.php o GET /crud_cursos.php/1
    case "GET":
        if ($idCurso !== null) {
            $sql = "SELECT c.id_curso, c.nombre, c.precio,
                           GROUP_CONCAT(cat.nombre SEPARATOR ', ') AS categorias
                    FROM CURSO c
                    LEFT JOIN CURSO_CATEGORIA cc ON c.id_curso = cc.id_curso
                    LEFT JOIN CATEGORIAS cat ON cc.id_categoria = cat.id_categoria
                    WHERE c.id_curso = :id
                    GROUP BY c.id_curso, c.nombre, c.precio";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([":id" => $idCurso]);
            $curso = $stmt->fetch();

            if ($curso) {
                echo json_encode($curso);
            } else {
                http_response_code(404);
                echo json_encode(["mensaje" => "Curso no encontrado"]);
            }
        } else {
            $sql = "SELECT c.id_curso, c.nombre, c.precio,
                           GROUP_CONCAT(cat.nombre SEPARATOR ', ') AS categorias
                    FROM CURSO c
                    LEFT JOIN CURSO_CATEGORIA cc ON c.id_curso = cc.id_curso
                    LEFT JOIN CATEGORIAS cat ON cc.id_categoria = cat.id_categoria
                    GROUP BY c.id_curso, c.nombre, c.precio
                    ORDER BY c.id_curso ASC";
            echo json_encode($pdo->query($sql)->fetchAll());
        }
        break;

    // 2. CREATE: POST /crud_cursos.php
    case "POST":
        $data = json_decode(file_get_contents("php://input"), true);
        if (empty($data["nombre"]) || !isset($data["precio"])) {
            http_response_code(400);
            echo json_encode(["error" => "Se requiere 'nombre' y 'precio'"]);
            break;
        }
        $pdo->beginTransaction();

        $stmt = $pdo->prepare("INSERT INTO CURSO (nombre, precio) VALUES (:nombre, :precio)");
        $stmt->execute([
            ":nombre" => $data["nombre"],
            ":precio" => $data["precio"]
        ]);
        $nuevoId = $pdo->lastInsertId();

        if (!empty($data["categorias"]) && is_array($data["categorias"])) {
            $stmtCat = $pdo->prepare("INSERT INTO CURSO_CATEGORIA (id_curso, id_categoria) VALUES (:id_curso, :id_categoria)");
            foreach ($data["categorias"] as $idCat) {
                $stmtCat->execute([":id_curso" => $nuevoId, ":id_categoria" => $idCat]);
            }
        }

        $pdo->commit();
        http_response_code(201);
        echo json_encode(["mensaje" => "Curso registrado", "id_curso" => $nuevoId]);
        break;

    // 3. UPDATE: PUT /crud_cursos.php/1
    case "PUT":
        $data = json_decode(file_get_contents("php://input"), true);
        $idActualizar = $idCurso ?? ($data["id_curso"] ?? null);

        if (!$idActualizar || empty($data["nombre"]) || !isset($data["precio"])) {
            http_response_code(400);
            echo json_encode(["error" => "Se requiere el ID en la URL (/1) y 'nombre', 'precio' en el JSON"]);
            break;
        }
        $stmt = $pdo->prepare("UPDATE CURSO SET nombre = :nombre, precio = :precio WHERE id_curso = :id_curso");
        $stmt->execute([
            ":nombre"   => $data["nombre"],
            ":precio"   => $data["precio"],
            ":id_curso" => $idActualizar
        ]);
        echo json_encode(["mensaje" => "Curso actualizado", "id_curso" => $idActualizar]);
        break;

    // 4. DELETE: DELETE /crud_cursos.php/1
    case "DELETE":
        if (!$idCurso) {
            http_response_code(400);
            echo json_encode(["error" => "Indica el número de curso en la URL, ej: /crud_cursos.php/1"]);
            break;
        }
        $stmt = $pdo->prepare("DELETE FROM CURSO WHERE id_curso = :id_curso");
        $stmt->execute([":id_curso" => $idCurso]);
        echo json_encode(["mensaje" => "Curso eliminado", "id_curso" => $idCurso]);
        break;
}