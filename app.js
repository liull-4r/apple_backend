const express = require("express");
const mysql2 = require("mysql2");
const app = express();
const bodyparser = require("body-parser");
const cors = require("cors");
app.use(express.json());
app.use(bodyparser.urlencoded({ extended: true }));
app.use(cors());
require('dotenv').config().parsed
const connection = mysql2.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

connection.connect((err) => {
  if (err) {
   console.log(err)
  }
  console.log("Connected to MySQL");
});
app.get("/install", (req, res) => {
  let message = "Tables Created";
  let createProducts = `CREATE TABLE if not exists Products(
      product_id int auto_increment,
      product_url varchar(255) not null,
      product_name varchar(255) not null,
      PRIMARY KEY (product_id)
  )`;
  let createProductDescription = `CREATE TABLE if not exists ProductDescription(
    description_id int auto_increment,
    product_id int(11) not null,
    product_brief_description TEXT not null,
    product_description TEXT not null,
    product_img varchar(255) not null,
    product_link varchar(255) not null,
    PRIMARY KEY (description_id),
    FOREIGN KEY (product_id) REFERENCES Products(product_id)
  )`;
  let createProductPrice = `CREATE TABLE if not exists ProductPrice(
    price_id int auto_increment,
    product_id int(11) not null,    
    starting_price varchar(255) not null,
    price_range varchar(255) not null,
    PRIMARY KEY (price_id),
    FOREIGN KEY (product_id) REFERENCES Products(product_id)
  )`;

    connection.query(createProducts, (err, results, fields) => {
      if (err) {
       console.log(err)
      }
      console.log("Products Created");
  });
  connection.query(createProductDescription, (err, results, fields) => {
    if (err) {
       console.log(err)
    }
    console.log("ProductDescription Created");
  });
  connection.query(createProductPrice, (err, results, fields) => {
    if (err) {
     console.log(err);
    }
    console.log("ProductPrice Created");
  });
 res.send("tables created")
});
app.get("/", (req, res) => {
  res.send("Hello World!");
})
app.post("/add-product", (req, res) => {
  const {
    url,
    name,
    brief_description,
    description,
    img,
    link,
    Sprice,
    priceR,
  
  } = req.body; 

  let insertProducts = `INSERT INTO Products (product_url,product_name) VALUES (?,?)`;
  let insertBriefDescription = `INSERT INTO ProductDescription (product_id,  product_brief_description,product_description,product_img,product_link ) VALUES (?, ?,?,?,?)`;
  let insertPrice = `INSERT INTO ProductPrice ( product_id , starting_price,price_range) VALUES (?, ?,?)`;
  
  let id = 0;
  
  connection.query(insertProducts, [url, name], (err, results, fields) => {
    if (err) console.log(`Error Found: ${err}`);
id = results.insertId;
    connection.query(
      insertBriefDescription,
      [id, brief_description, description, img, link],
      (err, results, fields) => {
        if (err) console.log(`Error Found: ${err}`);
      }
    );

    connection.query(
      insertPrice,
      [id, Sprice, priceR],
      (err, results, fields) => {
        if (err) console.log(`Error Found: ${err}`);
      }
    );

    
  });
  console.log(id);
  res.end("Data inserted successfully!");
  console.log("Data inserted successfully!");
});

app.get("/products", (req, res) => {
  connection.query(
    "SELECT * FROM Products JOIN ProductDescription JOIN ProductPrice ON Products.product_id = ProductDescription.product_id AND Products.product_id = ProductPrice.product_id ",
    (err, results, fields) => {
      if (err) console.log("Error During selection", err);
     
      res.send(results);
    }
  );
});

app.listen(3306, () => {
  console.log("server is running on port 3306");
});
