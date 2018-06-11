# !/bin/sh

temp="n_index.html"
if [ -z "$1" ] ; then
	index="index.html"
else
	index=$1
fi

IFS=

imports='<!--START_IMPORTS-->
    <!--w3css-->
  <link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css">

  <!--Bootstrap voor symbolen, indien andere symbolen gebruikt worden mag onderstaande lijn weg-->
  <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">

  <!-- JQuery UI is een externe plugin, wordt gebruikt voor het resizen van de sidebar-->
  <link rel="stylesheet" href="Sidebar/JQueryUI/jquery-ui.css">

  <!--sidebar.css is extern css bestand, wordt gebruikt voor de opmaak van de de sidebar-->
  <link rel="stylesheet" href="Sidebar/stylesheet/sidebar.css">

  <!-- Google icons -->
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons"
        rel="stylesheet">

  <!-- laden jQuery en bootstrap-->
  <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.js"></script>
  <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>

  <!-- Script voor JQuery UI, lokaal te downloaden-->
  <script src="Sidebar/JQueryUI/jquery-ui.js"></script>

  <!-- Script voor data -->
  <script src="Sidebar/scripts/data/manager.js" type="module"></script>
  <!--<script src="Sidebar/scripts/data/Component.js"></script>-->

</head>
<!--STOP_IMPORTS-->
<!--SCRIPT_ANNOTATIETOOL_VOLTOOID code:08/05-->'

echo "[INF] Checking for AnnotationTool"

count=$(grep -c '<!--SCRIPT_ANNOTATIETOOL_VOLTOOID code:08/05-->' $index)

if [ "$count" -ne "0" ] ; then
	echo "[INF] AnnotationTool already imported. Aborting"
	exit 1
fi


sed '/<\/head>/Q' $index > $temp
echo $imports >> $temp
sed '/<\/html>/q' $index | sed '/<body.*>/,$!d' >> $temp

echo "[INF] Copying original file to $index~"

cp -b $temp $index

echo "[INF] Importing AnnotationTool..."
rm -rf $temp
echo "[INF] AnnotationTool imported"

exit 1