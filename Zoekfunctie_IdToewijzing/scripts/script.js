import {idToewijzing} from "./WebslideIdToewijzing.js";
import * as Zoekfunctie from "./WebslideZoekfunctie.js";

$(document).ready(() => {
    idToewijzing();
    Zoekfunctie.zoekfunctieUit();
});

$('#search').on('keyup', function() {
    Zoekfunctie.zoekfunctieUit();
    if (this.value.length > 0) {
        Zoekfunctie.zoekfunctieAan(this.value);
    }
});