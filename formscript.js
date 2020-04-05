$('#myForm').submit(function(e) {
    e.preventDefault();

    var recaptcha = $("#g-recaptcha-response").val();
    if (recaptcha === "") {
        $('#captcha').animate({
            backgroundColor: '#FF0000'
        }, 0);
        $('#captcha').animate({
            backgroundColor: '#FFFFFF'
        }, 'slow');
    } else {
        $.ajax({
            url: 'https://626j2t6024.execute-api.us-east-1.amazonaws.com/record_inventory_feedback',
            type: 'post',
            data: "storeName=" + $('#storeName').val() + "&" + $('#myForm').serialize(),
            success: function() {
                console.log("success");
                $('#myModal').modal('hide');

                $(".alert").show();
            }
        });
    }
});
