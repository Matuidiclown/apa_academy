<?php
require_once "conexion.php";

$metodo = $_SERVER["REQUEST_METHOD"];

if ($metodo === "GET") {
    // Consulta relacional completa: USUARIOS + PEDIDOS + DETALLE_PEDIDO + CURSO[cite: 11]
    $sql = "SELECT p.id_pedido, u.nombre AS usuario, u.email, p.fecha, p.total, p.metodo_pago,
                   c.nombre AS curso, dp.precio_unitario
            FROM PEDIDOS p
            INNER JOIN USUARIOS u ON p.id_usuario = u.id_usuario
            INNER JOIN DETALLE_PEDIDO dp ON p.id_pedido = dp.id_pedido
            INNER JOIN CURSO c ON dp.id_curso = c.id_curso
            ORDER BY p.id_pedido DESC";
    echo json_encode($pdo->query($sql)->fetchAll());
}

if ($metodo === "POST") {
    $data = json_decode(file_get_contents("php://input"), true);
    $pdo->beginTransaction();

    $stmtPedido = $pdo->prepare("INSERT INTO PEDIDOS (id_usuario, total, metodo_pago) VALUES (:id_usuario, :total, :metodo_pago)");
    $stmtPedido->execute([
        ":id_usuario"  => $data["id_usuario"],
        ":total"       => $data["total"],
        ":metodo_pago" => $data["metodo_pago"]
    ]);
    $idPedido = $pdo->lastInsertId();

    $stmtDetalle = $pdo->prepare("INSERT INTO DETALLE_PEDIDO (id_pedido, id_curso, precio_unitario) VALUES (:id_pedido, :id_curso, :precio_unitario)");
    foreach ($data["detalles"] as $item) {
        $stmtDetalle->execute([
            ":id_pedido"       => $idPedido,
            ":id_curso"        => $item["id_curso"],
            ":precio_unitario" => $item["precio_unitario"]
        ]);
    }

    $pdo->commit();
    echo json_encode(["mensaje" => "Pedido guardado", "id_pedido" => $idPedido]);
}