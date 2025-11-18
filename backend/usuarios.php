<?php
// backend/usuarios.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

require_once "db.php";

// Recebe dados do formulário (POST)
$nome  = $_POST['nome'] ?? '';
$email = $_POST['email'] ?? '';
$senha = $_POST['senha'] ?? '';
$tipo  = $_POST['tipo'] ?? 'colaborador';

if (empty($nome) || empty($email) || empty($senha)) {
    echo json_encode(["erro" => "Preencha todos os campos."]);
    exit;
}

try {
    $stmt = $pdo->prepare("INSERT INTO usuarios (nome, email, senha, tipo) VALUES (?, ?, ?, ?)");
    $stmt->execute([$nome, $email, $senha, $tipo]);
    echo json_encode(["sucesso" => true, "mensagem" => "Usuário cadastrado com sucesso!"]);
} catch (PDOException $e) {
    echo json_encode(["erro" => "Erro ao cadastrar: " . $e->getMessage()]);
}
?>
