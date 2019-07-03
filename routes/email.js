//const keys = require('../config/keys');
const mongoose = require('mongoose');
const config = require('config');
const db = config.get('mongoURI');
const sendGridKey = config.get('sendGridKey');
const emailAddress = config.get('emailAddress');

const { check,validationResult } = require('express-validator');
const { sanitizeBody } = require('express-validator');

mongoose.connect(process.env.mongoURI || db, {useNewUrlParser: true}, () => {
    console.log('MongoDB Connected...');
});
require('../models/email');
const Email = mongoose.model('emails');
const sgMail = require('@sendgrid/mail');
// sgMail.setApiKey(process.env.sendGrid || sendGridKey);
// console.log(process.env.sendGridKey);
// console.log(sendGridKey);
sgMail.setApiKey(process.env.sendGridKey || sendGridKey);


module.exports = app => {
    app.post('/send-email', [
        check('name').isLength({ min: 1 }).trim().withMessage('Name empty.'),
        check('email').isEmail().withMessage('email is invalid').normalizeEmail(),
        check('subject').isLength({ min: 1 }).trim().withMessage('subject is empty.'),
        check('message').isLength({min: 1}).trim().withMessage('message is empty'),

        
    ] ,(req, res) => {
        const errors = validationResult(req);
       
        if(!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }
        
        new Email({
            from: req.body.name,
            emailAddress: req.body.email,
            subjectLine: req.body.subject,
            body: req.body.message,
            date: Date()
        })
        .save(function (err, doc) {
            if (err)
                res.json('Whoops! I\'m sorry, an error happened while sending your message. Please send a message directly to <a href="mailto:rg3646@outlook.com">rg3646@outlook.com');
            else
                res.send(`Thanks for reaching out ${req.body.name}!`);
        });

        const msg = {
            to: process.env.emailAddress || emailAddress,
            from: req.body.email,
            emailAddress: req.body.email,
            subject: req.body.subject,
            text: req.body.message,
            html: `<h1>from: ${req.body.name}</h1>
                  <p>${req.body.message}</p>`
        };

        sgMail.send(msg);
    });
};