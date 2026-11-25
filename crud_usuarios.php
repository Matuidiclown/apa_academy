<?php
require_once "conexion.php";

$metodo = $_SERVER["REQUEST_METHOD"];

switch ($metodo) {
    // READ: GET http://localhost:8000/crud_usuarios.php
    case "GET":
        if (isset($_GET["id_usuario"])) {
            $stmt = $pdo->prepare("SELECT * FROM USUARIOS WHERE id_usuario = :id");
            $stmt->execute([":id" => $_GET["id_usuario"]]);
            $row = $stmt->fetch();
            echo json_encode($row ?: ["mensaje" => "Usuario no encontrado"]);
        } else {
            $stmt = $pdo->query("SELECT * FROM USUARIOS ORDER BY id_usuario ASC");
            echo json_encode($stmt->fetchAll());
        }
        break;

    // CREATE: POST http://localhost:8000/crud_usuarios.php
    case "POST":
        $data = json_decode(file_get_contents("php://input"), true);
        if (empty($data["nombre"]) || empty($data["email"]) || empty($data["telefono"])) {
            http_response_code(400);
            echo json_encode(["error" => "Faltan campos: nombre, email o telefono"]);
            break;
        }
        $stmt = $pdo->prepare("INSERT INTO USUARIOS (nombre, email, telefono) VALUES (:nombre, :email, :telefono)");
        $stmt->execute([
            ":nombre"   => $data["nombre"],
            ":email"    => $data["email"],
            ":telefono" => $data["telefono"]
        ]);
        http_response_code(201);
        echo json_encode([
            "mensaje" => "Usuario registrado",
            "id_usuario" => $pdo->lastInsertId()
        ]);
        break;

    // UPDATE: PUT http://localhost:8000/crud_usuarios.php
    case "PUT":
        $data = json_decode(file_get_contents("php://input"), true);
        $stmt = $pdo->prepare("UPDATE USUARIOS SET nombre = :nombre, email = :email, telefono = :telefono WHERE id_usuario = :id");
        $stmt->execute([
            ":nombre"   => $data["nombre"],
            ":email"    => $data["email"],
            ":telefono" => $data["telefono"],
            ":id"       => $data["id_usuario"]
        ]);
        echo json_encode(["mensaje" => "Usuario actualizado"]);
        break;

    // DELETE: DELETE http://localhost:8000/crud_usuarios.php?id_usuario=3
    case "DELETE":
        $id = $_GET["id_usuario"] ?? null;
        if (!$id) {
            http_response_code(400);
            echo json_encode(["error" => "Falta id_usuario"]);
            break;
        }
        $stmt = $pdo->prepare("DELETE FROM USUARIOS WHERE id_usuario = :id");
        $stmt->execute([":id" => $id]);
        echo json_encode(["mensaje" => "Usuario eliminado"]);
        break;
}