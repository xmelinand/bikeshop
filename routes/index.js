var express = require("express");
var router = express.Router();

const app = express();

var dataBike = [
	{ url: "/images/bike-1.jpg", name: "BIKO45", price: 689, qty:0 },
	{ url: "/images/bike-2.jpg", name: "ZOOK7", price: 799, qty:0},
	{ url: "/images/bike-3.jpg", name: "LIKO89", price: 839, qty:0 },
	{ url: "/images/bike-4.jpg", name: "GEW08", price: 1249, qty:0 },
	{ url: "/images/bike-5.jpg", name: "KIWIT", price: 899, qty:0 },
	{ url: "/images/bike-6.jpg", name: "NASAY", price: 1399, qty:0 },
];

/* GET home page. */
router.get("/", function (req, res, next) {
	if (req.session.dataCardBike == undefined) {
		req.session.dataCardBike = [];
	}
	res.render("index", { dataBike, dataCardBike: req.session.dataCardBike });
});

// ADD ITEM == PAGE SHOP
router.get("/shop", function (req, res, next) {
	var total = 0;
	var totalQty = 0;
	console.log("data", req.session.dataCardBike);

	var emptyQ = false;
	//vérif des valeurs des query
	const data = [req.query.url, req.query.name, req.query.price];
	if (data.includes(undefined)) {
		emptyQ = true;
	}

	var itemExists = false;
	// verif si un item est déjà la
	for (i = 0; i < req.session.dataCardBike.length; i++) {
		if (req.query.name === req.session.dataCardBike[i].name) {
			//si oui incrémente la qty
			req.session.dataCardBike[i].qty++;
			// et change précise qu'il existe deja
			itemExists = true;
		}
	}

	// si l'item existe pas, crée une ligne
	if (!itemExists && !emptyQ) {
		req.session.dataCardBike.push({
			url: req.query.url,
			name: req.query.name,
			price: req.query.price,
			qty: req.query.qty,
		});
		console.log("data new item", req.session.dataCardBike);
	}

	res.render("shop", {
		dataCardBike: req.session.dataCardBike,
		total,
		totalQty,
	});
});

//DELETE SHOP
router.get("/delete-shop", function (req, res, next) {
	console.log("query", req.query);

	req.session.dataCardBike.splice(req.query.index, 1);
	res.render("shop", { dataCardBike: req.session.dataCardBike });
	console.log("log3", req.session.dataCardBike, total);
});

//UPDATE SHOP
router.post("/update-shop", function (req, res, next) {
  
	var position = req.body.index;
  console.log(position);
  console.log(req.session.dataCardBike)
	req.session.dataCardBike[position].qty = req.body.qty;
  
  console.log("data updated item", req.session.dataCardBike);
	res.render("shop", { dataCardBike: req.session.dataCardBike });
});

//CHECKOUT SESSION
const stripe = require("stripe")(
	"sk_test_51LBaw1LMAG2SJJSZFGgZqiENpOKhHOz1ujLGbF5OLXVfX66wblYFgibk4rFWKgYcth2Wa7BCbygVEvm7TT7Rx8Io00ew3E39UR"
);

router.post("/create-checkout-session", async (req, res) => {
	var shopList = [];
	var stripeItems = {};
	for (var i = 0; i < req.session.dataCardBike.length; i++) {
		stripeItems = {
			price_data: {
				currency: "eur",
				product_data: {
					name: req.session.dataCardBike[i].name,
				},
				unit_amount: req.session.dataCardBike[i].price * 100,
			},
			quantity: req.session.dataCardBike[i].qty,
		};
		shopList.push(stripeItems);
	}

	const session = await stripe.checkout.sessions.create({
		line_items: shopList,
		mode: "payment",
		success_url: "https://fathomless-thicket-84321.herokuapp.com/success",
		cancel_url: "https://fathomless-thicket-84321.herokuapp.com/cancel",
	});

	res.redirect(303, session.url);
});

router.get("/success", function (req, res, next) {
	res.render("success");
});

router.get("/cancel", function (req, res, next) {
	res.render("cancel");
});

module.exports = router;
