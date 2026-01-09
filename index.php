<?php
$config = require __DIR__ . '/config.php';
$db = new PDO('sqlite:' . $config['db_path']);
$arts = $db->query('SELECT * FROM artworks WHERE status="listed"')->fetchAll(PDO::FETCH_ASSOC);
?>
<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>Art Marketplace</title>
<link rel="stylesheet" href="styles.css">
</head>
<body>
<h1>Art Marketplace</h1>
<?php foreach($arts as $a): ?>
  <div class="art">
    <h2><?=htmlspecialchars($a['title'])?> — <?=htmlspecialchars($a['artist_name'])?></h2>
    <p><?=nl2br(htmlspecialchars($a['description']))?></p>
    <p><strong>Pris:</strong> <?=number_format($a['price_cents']/100,2)?> <?=htmlspecialchars($a['currency'])?></p>
    <a href="artwork.php?id=<?=$a['id']?>">Se / Køb</a>
  </div>
<?php endforeach; ?>
</body>
</html>
