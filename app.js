const express = require('express');
const ejs = require('ejs');
const paypal = require('paypal-rest-sdk');


paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': 'AYNkdONs44IZ3Ek74dh0eD_vdTGuUySkSdeoj8BNGJCJR4uF07PJ7ZH5BjA6C3MlKSg7Qh3kKRIAYQK2',
    'client_secret': 'EPSYhK-XoviQKOveQHJ9ABUJqEPxSJZfL6oZm0Njj5hxSFA9yYi6VjuG5QLLCSUvJy_-6pJnFBqJ8C1v'
  });

const app = express();

app.set('view engine','ejs');

app.get('/',(req,res) => res.render('index'));

app.post('/pay', (req, resp) => {
    const create_payment_json = {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": "http://localhost:3000/success",
            "cancel_url": "http://localhost:3000/cancel"
        },
        "transactions": [{
            "item_list": {
                "items": [{
                    "name": "Rapid XEM",
                    "sku": "001",
                    "price": "5.00",
                    "currency": "USD",
                    "quantity": 1
                }]
            },
            "amount": {
                "currency": "USD",
                "total": "5.00"
            },
            "description": "Rapidqube XEM"
        }]
    };


    paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
            throw error;
        } else {
            for(let i=0; i < payment.links.length; i++){
                if(payment.links[i].rel === 'approval_url'){
                    resp.redirect(payment.links[i].href)
                }
            }
        }
    });
});

app.get('/success', (req, resp) => {

    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;

    const execute_payment_json = {
        "payer_id": payerId,
        "transactions" : [{
            "amount": {
                "currency": "USD",
                "total": "5.00"
            }
        }]
    };

    paypal.payment.execute(paymentId, execute_payment_json, function(error, payment){
        if(error){
            console.log(error.response);
            throw error;
        }else{
            console.log("Get Payment Response");
            console.log(JSON.stringify(payment));
            resp.render('success',{data:payment});
            
            //resp.send('Success');
        }
    });
});

app.get('/cancel', (req, res) => res.send('Cancelled'));

app.listen(3000, () => console.log('Server Started'));

