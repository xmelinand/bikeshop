var express = require('express');
var router = express.Router();

const app = express();


var dataBike = [{url : '/images/bike-1.jpg',name : 'BIKO45' ,price: 689},
{url : '/images/bike-2.jpg' ,name : 'ZOOK7',price: 799},
{url : '/images/bike-3.jpg' ,name : 'LIKO89',price: 839},
{url : '/images/bike-4.jpg' ,name : 'GEW08',price: 1249},
{url : '/images/bike-5.jpg' ,name : 'KIWIT',price: 899},
{url : '/images/bike-6.jpg' ,name : 'NASAY',price: 1399},]


/* GET home page. */
router.get('/', function(req, res, next) {
  if (req.session.dataCardBike == undefined){
    req.session.dataCardBike = [];}
  res.render('index', { dataBike });
});




// ADD ITEM == PAGE SHOP
router.get('/shop', function(req, res, next) {

  var emptyQ = false
//vérif des valeurs des query
const data = [ req.query.url, req.query.name, req.query.price];
if (data.includes(undefined)){
  emptyQ = true;
}

  var itemExists = false;
// verif si un item est déjà la 
  for(i=0; i<req.session.dataCardBike.length; i++){
    if(req.query.name===req.session.dataCardBike[i].name){
      //si oui incrémente la qty
      req.session.dataCardBike[i].qty++;
      // et change précise qu'il existe deja
      itemExists=true
    }
  }
// si l'item existe pas, crée une ligne 
  if(!itemExists && !emptyQ){
    req.session.dataCardBike.push({
      url:req.query.url,
      name:req.query.name,
      price: req.query.price,
      qty : req.query.qty
    })};



  res.render('shop', { dataCardBike : req.session.dataCardBike })});




//DELETE SHOP
router.get('/delete-shop', function(req, res, next) {
  console.log('query',req.query);

  req.session.dataCardBike.splice(req.query.index, 1);
  res.render('shop', { dataCardBike : req.session.dataCardBike }
  )
  console.log('log3', req.session.dataCardBike);

});

//UPDATE SHOP
  router.post('/update-shop', function(req, res, next) {
    console.log('ca marche i ?',req.body);
var position = req.body.index
req.session.dataCardBike[position].qty = req.body.qty

    res.render('shop', { dataCardBike : req.session.dataCardBike})});

//CHECKOUT SESSION 
const stripe = require('stripe')('sk_test_51LBaw1LMAG2SJJSZFGgZqiENpOKhHOz1ujLGbF5OLXVfX66wblYFgibk4rFWKgYcth2Wa7BCbygVEvm7TT7Rx8Io00ew3E39UR')

router.post('/create-checkout-session', async (req, res) => {

var totalBskt = req.body.totalBskt;

  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: 'eur',
          product_data: {
            name: "Vos vélos",
          },
          unit_amount: totalBskt * 100,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: 'https://secret-everglades-42752.herokuapp.com/success',
    cancel_url: 'https://secret-everglades-42752.herokuapp.com/cancel',
  });


  res.redirect(303, session.url);
});

router.get('/success', function(req, res, next) {
  res.render('success');
});

router.get('/cancel', function(req, res, next) {
  res.render('cancel');
});

module.exports = router;
