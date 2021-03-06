<?php

include_once '../conf/config.inc.php'; // app config

?>

<!DOCTYPE html>
<html>
<head>
  <title>Fieldnotes</title>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <link rel="stylesheet" href="lib/leaflet-0.7.7/leaflet.css" />
  <link rel="stylesheet" href="css/index.css">
</head>
<body>
  <div class="application"></div>
  <script>var MOUNT_PATH = '<?php print $MOUNT_PATH; ?>';</script>
  <script src="lib/leaflet-0.7.7/leaflet.js"></script>
  <script src="js/index.js"></script>
</body>
</html>
