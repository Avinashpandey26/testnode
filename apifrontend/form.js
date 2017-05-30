 $('button').click(function () {
        $.post('/page', {data: 'blah'}, function (data) {
        console.log(data);
      });
    }, 'json');