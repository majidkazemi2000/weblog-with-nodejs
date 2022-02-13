const nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: '<email>',
        pass: '<password>'
    }
});

function sendMail(userEmail,callback) {

    var mailOptions = {
        from: '<from>',
        to: userEmail,
        subject: 'تبریک',
        text: 'ممنون از این که در سایت ما عضو شدید .'
    };

    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            callback(false);
        } else {
            callback(true);
        }
    });
}

module.exports = {sendMail};