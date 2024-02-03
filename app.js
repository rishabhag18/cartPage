import express from "express";
import pg from "pg";

//*************************************************************************************** */

const app = express();
const port = 3000;

let name;
let email;
let password;
let result;
let data = [];
let isRegistered = false;
let notRegistered = false;
let passwordMismatch = false;

//************************************************************************************** */

const dataBase = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "LootBazar",
    password: "password",
    port: "5432"
});

dataBase.connect();

//************************************************************************************** */

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set('view engine', 'ejs');

//************************************************************************************* */

app.get("/home", (req, res) => {
    if (isRegistered) {
        res.render("home", { isRegistered: isRegistered });
        isRegistered = false;
    }
    else if (notRegistered) {
        res.render("home", { notRegistered: notRegistered });
        notRegistered = false;
    }
    else if(passwordMismatch){
        res.render("home", { passwordMismatch: passwordMismatch });
        passwordMismatch = false;
    }
    else {
        res.render("home");
    }

});

//************************************************************************************* */

app.post("/signUp", async (req, res) => {
    name = req.body.name;
    email = req.body.email.toLowerCase();
    password = req.body.password;
    try {
        result = await dataBase.query(`SELECT * FROM customer WHERE email= '${email}';`);
        data = result.rows;
        if (data[0].email === email) {
            console.log(`${email}, is already registered`);
            isRegistered = true;
            res.redirect("/home");
        }
    } catch (error) {
        await dataBase.query(`INSERT INTO customer VALUES('${name}','${email}','${password}');`);
        console.log("Customer Registered successfuly!!");
        res.redirect("/productPage");
    }
})

//************************************************************************************* */

app.post("/login", async (req, res) => {
    email = req.body.email.toLowerCase();
    password = req.body.password;
    try {
        result = await dataBase.query(`SELECT * FROM customer WHERE email='${email}';`);
        data = result.rows;
        if (data[0].email == email) {
            if (data[0].password === password) {
                console.log("Customer Verified.");
                res.redirect("/productPage");
            }
            else {
                passwordMismatch = true;
                res.redirect("/home");
            }
        }
    } catch (error) {
        console.log(`${email} is not registered`);
        notRegistered = true;
        res.redirect("home");
    }
})

//************************************************************************************ */

app.get("/productPage", (req, res) => {
    res.render("products");
})

//************************************************************************************ */
app.listen(port, () => {
    console.log(`server is up and running at https://localhost${port}`);
})