var array_images = [];
var url_collage = '';


function build() {

    if (array_foto != null && array_foto.length >= 7) {

        for (var i = 0; i < array_foto.length; i++) {
            array_images[i] = '%22' + array_foto[i].images[0].source + '%22';
        }

        var len = Math.floor((array_foto.length) / 7);

        var a = Math.floor(Math.random() * len);
        var b = len + Math.floor(Math.random() * len);
        var c = len * 2 + Math.floor(Math.random() * len);
        var d = len * 3 + Math.floor(Math.random() * len);
        var e = len * 4 + Math.floor(Math.random() * len);
        var f = len * 5 + Math.floor(Math.random() * len);
        var g = len * 6 + Math.floor(Math.random() * len);

        var url_collage = "https://process.filestackapi.com/Ay17eaflTZqPEITarvCXgz/collage=files:[" + array_images[a] + "," + array_images[b] + "," + array_images[c] + "," + array_images[d] + "," + array_images[e] + "," + array_images[f] + "]," + "width:1450,height:900,fit:crop/" + array_images[g];

        var form = $('<form action="' + "https://collage-jhin.c9users.io/users/collage" + '" method="post">' +
            '<input type="hidden" name="id" value="' + id + '">' +
            '<input type="hidden" name="url_collage" value="' + url_collage + '">' +
            '<input type="hidden" name="myname" value="' + myname + '">' +
            '/form>');
        $('body').append(form);
        form.submit();

    }
    else {
        var url_collage = 'need_more_photos';
        console.log('url_collage' + url_collage);
        var form = $('<form action="' + "https://collage-jhin.c9users.io/users/collage" + '" method="post">' +
            '<input type="hidden" name="id" value="' + id + '">' +
            '<input type="hidden" name="url_collage" value="' + url_collage + '">' +
            '<input type="hidden" name="myname" value="' + myname + '">');
        $('body').append(form);
        form.submit();



    }
}