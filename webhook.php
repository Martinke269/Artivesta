<?php
$config = require __DIR__ . '/config.php';
$db = new PDO('sqlite:' . $config['db_path']);
$payload = @file_get_contents('php://input');
$event = json_decode($payload, true);
if (!$event) { http_response_code(400); echo "Invalid payload"; exit; }
$type = $event['type'] ?? '';
if ($type === 'payment_intent.succeeded') {
  $pi = $event['data']['object'];
  $pi_id = $pi['id'];
  $stmt = $db->prepare('UPDATE orders SET status="deposited", stripe_pi_id=? WHERE stripe_pi_id=?');
  $stmt->execute([$pi_id,$pi_id]);
  file_put_contents('webhook.log', date('c') . " succeeded: $pi_id\n", FILE_APPEND);
}
http_response_code(200);
echo "OK";
