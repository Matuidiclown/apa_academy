<?php
require_once "conexion.php";

$metodo = $_SERVER["REQUEST_METHOD"];

switch ($metodo) {
    // READ: GET http://localhost:8000/crud_categorias.php
    case "GET":
        if (isset($_GET["id_categoria"])) {
            $stmt = $pdo->prepare("SELECT * FROM CATEGORIAS WHERE id_categoria = :id");
            $stmt->execute([":id" => $_GET["id_categoria"]]);
            $row = $stmt->fetch();
            echo json_encode($row ?: ["mensaje" => "Categoría no encontrada"]);
        } else {
            $stmt = $pdo->query("SELECT * FROM CATEGORIAS ORDER BY id_categoria ASC");
            echo json_encode($stmt->fetchAll());
        }
        break;

    // CREATE: POST http://localhost:8000/crud_categorias.php
    case "POST":
        $data = json_decode(file_get_contents("php://input"), true);
        if (empty($data["nombre"])) {
            http_response_code(400);
            echo json_encode(["error" => "El campo 'nombre' es obligatorio"]);
            break;
        }
        $stmt = $pdo->prepare("INSERT INTO CATEGORIAS (nombre) VALUES (:nombre)");
        $stmt->execute([":nombre" => $data["nombre"]]);
        http_response_code(201);
        echo json_encode([
            "mensaje" => "Categoría creada",
            "id_categoria" => $pdo->lastInsertId()
        ]);
        break;

    // UPDATE: PUT http://localhost:8000/crud_categorias.php
    case "PUT":
        $data = json_decode(file_get_contents("php://input"), true);
        if (empty($data["id_categoria"]) || empty($data["nombre"])) {
            http_response_code(400);
            echo json_encode(["error" => "Se requiere 'id_categoria' y 'nombre'"]);
            break;
        }
        $stmt = $pdo->prepare("UPDATE CATEGORIAS SET nombre = :nombre WHERE id_categoria = :id");
        $stmt->execute([
            ":nombre" => $data["nombre"],
            ":id"     => $data["id_categoria"]
        ]);
        echo json_encode(["mensaje" => "Categoría actualizada"]);
        break;

    // DELETE: DELETE http://localhost:8000/crud_categorias.php?id_categoria=6
    case "DELETE":
        $id = $_GET["id_categoria"] ?? null;
        if (!$id) {
            http_response_code(400);
            echo json_encode(["error" => "Falta el parámetro id_categoria en la URL"]);
            break;
        }
        $stmt = $pdo->prepare("DELETE FROM CATEGORIAS WHERE id_categoria = :id");
        $stmt->execute([":id" => $id]);
        echo json_encode(["mensaje" => "Categoría eliminada"]);
        break;
}