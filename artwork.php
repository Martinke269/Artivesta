<?php
$config = require __DIR__ . '/config.php';
$db = new PDO('sqlite:' . $config['db_path']);
$id = intval($_GET['id'] ?? 0);
$art = $db->prepare('SELECT * FROM artworks WHERE id=?');
$art->execute([$id]);
$a = $art->fetch(PDO::FETCH_ASSOC);
if (!$a) { echo "Artwork ikke fundet"; exit; }
$publishable = $config['stripe_publishable'];
?>
<!doctype html>
<html>
<head><meta charset="utf-8"><title><?=htmlspecialchars($a['title'])?></title>
<link rel="stylesheet" href="styles.css">
</head>
<body>
<h1><?=htmlspecialchars($a['title'])?></h1>
<p><strong>Kunstner:</strong> <?=htmlspecialchars($a['artist_name'])?></p>
<p><?=nl2br(htmlspecialchars($a['description']))?></p>
<p><strong>Pris:</strong> <?=number_format($a['price_cents']/100,2)?> <?=htmlspecialchars($a['currency'])?></p>

<form id="buyForm" method="POST" action="create_order.php">
  <input type="hidden" name="artwork_id" value="<?=$a['id']?>">
  <label>Dit e‑mail: <input name="buyer_email" required></label><br>
  <button type="submit">Køb (reserver betaling)</button>
</form>

<p><a href="index.php">Tilbage til markedsplads</a></p>
</body>
</html>
