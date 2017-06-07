function show_images() {

    var html = '<table border = 0 align = center> <tr>';
    for (var i = 0; i < array_foto.length; i++) {
        if (i != 0 && i % 5 == 0)
            html += '</tr><tr>';
        html += '<td> <img id =' + "'" + i + "' src = '" + array_foto[i].images[0].source + "'height=15% width=90%></td>";
    }
    html += "</tr></table>";
    document.getElementById('zonaDinamica').innerHTML = html;
}
     