<?php
header("Content-Type: application/json; charset=UTF-8");

$dsn = "mysql:host=localhost;dbname=academia_ape_db;charset=utf8mb4";
try {
    $pdo = new PDO($dsn, "root", "", [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
    exit;
}