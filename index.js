const express = require('express');
const app = express();
const mysql = require('mysql');
const path = require('path');
const jwt = require('jsonwebtoken');
const config = require('config');
const ls = require('local-storage');
const bcrypt = require('bcrypt');
const { nextTick } = require('process');

if (!config.get('jwtPrivateKey')) {
    console.error('Fatal error : jwtPrivateKey undefined');
    process.exit(1);
}

app.use(express.static(path.join(__dirname, 'public')))
app.use(express.json())

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

/****************************************************************DATABASE BACKEND STARTS HERE*****************************************************************/

const con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'pharmacy_management_system'
});

con.connect(function (err) {
    if (err) throw err;
    console.log("Connected to MySQL!");
});

function createTables() {
    let sql = "create table if not exists pharmacies(ph_id int AUTO_INCREMENT PRIMARY KEY, ph_name varchar(50) NOT NULL, ph_contact varchar(10) NOT NULL, ph_email varchar(100) UNIQUE, ph_address varchar(100), ph_username varchar(16) NOT NULL UNIQUE, ph_password varchar(100) NOT NULL);"
    con.query(sql, function (err, results, fields) {
        if (err) throw err;
    })
    sql = "create table if not exists pharma_companies(ph_id int NOT NULL, company_id int AUTO_INCREMENT PRIMARY KEY, company_name varchar(50) NOT NULL, company_contact varchar(10) NOT NULL, company_email varchar(100), company_address varchar(100), foreign key(ph_id) references pharmacies(ph_id) ON DELETE CASCADE);"
    con.query(sql, function (err, results, fields) {
        if (err) throw err;
    })
    sql = "create table if not exists medicines(ph_id int NOT NULL, company_id int NOT NULL, med_id int AUTO_INCREMENT PRIMARY KEY, med_name varchar(50) NOT NULL, med_quantity int NOT NULL, med_price float NOT NULL, foreign key(ph_id) references pharmacies(ph_id) ON DELETE CASCADE, foreign key(company_id) references pharma_companies(company_id) ON DELETE CASCADE);"
    con.query(sql, function (err, results, fields) {
        if (err) throw err;
    })
    sql = "create table if not exists customers(ph_id int NOT NULL, cus_id int AUTO_INCREMENT PRIMARY KEY, cus_name varchar(50) NOT NULL, cus_contact varchar(10) NOT NULL, cus_email varchar(100), cus_gender ENUM('MALE', 'FEMALE', 'OTHERS'), cus_address varchar(100), cus_membership_points int DEFAULT 0, foreign key(ph_id) references pharmacies(ph_id) ON DELETE CASCADE);"
    con.query(sql, function (err, results, fields) {
        if (err) throw err;
    })
    sql = "create table if not exists orders(ph_id int NOT NULL, cus_id int NOT NULL, order_id int AUTO_INCREMENT PRIMARY KEY, order_date date NOT NULL, prescribed_by varchar(50) NOT NULL, discount float DEFAULT 0, amount_paid float NOT NULL, mode ENUM('CASH', 'CARD') NOT NULL, foreign key(ph_id) references pharmacies(ph_id) ON DELETE CASCADE, foreign key(cus_id) references customers(cus_id) ON DELETE CASCADE);"
    con.query(sql, function (err, results, fields) {
        if (err) throw err;
    })
    sql = "create table if not exists order_details(order_id int NOT NULL, med_id int NOT NULL, qty_sold int NOT NULL, foreign key(order_id) references orders(order_id) ON DELETE CASCADE, foreign key(med_id) references medicines(med_id) ON DELETE CASCADE);"
    con.query(sql, function (err, results, fields) {
        if (err) throw err;
    })
    sql = "create table if not exists cart(ph_id int NOT NULL, med_id int NOT NULL, quantity int NOT NULL, foreign key(ph_id) references pharmacies(ph_id) ON DELETE CASCADE, foreign key(med_id) references medicines(med_id) ON DELETE CASCADE);"
    con.query(sql, function (err, results, fields) {
        if (err) throw err;
    })
}

createTables();

/****************************************************************DATABASE BACKEND ENDS HERE******************************************************************/

/*****************************************************************GET REQUESTS START HERE********************************************************************/

app.get('/demo', (req, res) => {
    res.render('demo')
})

app.get('/add/company', (req, res) => {
    if (!ls.get('token')) {
        res.redirect('/login')
    }
    else {
        try {
            const decoded = jwt.verify(ls.get('token'), config.get('jwtPrivateKey'));
            res.render('addcompany');
        }
        catch (err) {
            res.send('Invalid token!');
        }
    }
})

app.get('/add/medicine', (req, res) => {
    if (!ls.get('token')) {
        res.redirect('/login')
    }
    else {
        try {
            const decoded = jwt.verify(ls.get('token'), config.get('jwtPrivateKey'));
            let sql = `select company_name from pharma_companies where ph_id = ${decoded.id} order by company_name;`
            con.query(sql, (err, results) => {
                if (err) throw err;
                res.render('addmedicine', { results })
            })
        }
        catch (err) {
            res.send('Invalid token!');
        }
    }
})

app.get('/cart', (req, res) => {
    if (!ls.get('token')) {
        res.redirect('/login')
    }
    else {
        try {
            const decoded = jwt.verify(ls.get('token'), config.get('jwtPrivateKey'));
            let sql = `select * from cart where ph_id = ${decoded.id};`
            con.query(sql, (err, results) => {
                if (err) throw err;
                if (results[0] != null) {
                    let sql = `select * from cart_details;`
                    con.query(sql, (err, results) => {
                        if (err) throw err;
                        res.render('cart', { results });
                    })
                }
                else {
                    res.render('cart', { results });
                }
            })
        }
        catch (err) {
            res.send('Invalid token!');
        }
    }
})

app.get('/cart/failure/:contact', (req, res) => {
    if (!ls.get('token')) {
        res.redirect('/login')
    }
    else {
        try {
            const decoded = jwt.verify(ls.get('token'), config.get('jwtPrivateKey'));
            let { contact } = req.params
            res.render('cartfailure', { contact })
        }
        catch (err) {
            res.send('Invalid token!');
        }
    }
})

app.get('/cart/success/:contact', (req, res) => {
    if (!ls.get('token')) {
        res.redirect('/login')
    }
    else {
        try {
            const decoded = jwt.verify(ls.get('token'), config.get('jwtPrivateKey'));
            let { contact } = req.params;
            let sql = `select * from cart where ph_id = ${decoded.id};`
            con.query(sql, (err, results) => {
                if (err) throw err;
                if (results[0] != null) {
                    let sql = `select * from cart_details;`
                    con.query(sql, (err, results) => {
                        if (err) throw err;
                        let result = results;
                        let sql = `select * from customers where cus_contact like '${contact}' and ph_id = ${decoded.id};`
                        con.query(sql, (err, results) => {
                            if (err) throw err;
                            res.render('cartsuccess', { results, result });
                        })
                    })
                }
                else {
                    let result = results;
                    let sql = `select * from customers where cus_contact like '${contact}' and ph_id = ${decoded.id};`
                    con.query(sql, (err, results) => {
                        if (err) throw err;
                        res.render('cartsuccess', { results, result });
                    })
                }
            })
        }
        catch (err) {
            res.send('Invalid token!');
        }
    }
})

app.get('/customers', (req, res) => {
    if (!ls.get('token')) {
        res.redirect('/login')
    }
    else {
        try {
            const decoded = jwt.verify(ls.get('token'), config.get('jwtPrivateKey'));
            let sql = `select * from customers where ph_id = ${decoded.id} order by cus_name;`
            con.query(sql, (err, results) => {
                if (err) throw err;
                res.render('customers', { results })
            })
        }
        catch (err) {
            res.send('Invalid token!');
        }
    }
})

app.get('/', (req, res) => {
    if (!ls.get('token')) {
        res.redirect('/login')
    }
    else {
        try {
            const decoded = jwt.verify(ls.get('token'), config.get('jwtPrivateKey'));
            let sql = `select sum(amount_paid) as todays_sale from orders where order_date = CURDATE() and ph_id = ${decoded.id};`
            con.query(sql, (err, results) => {
                if (err) throw err;
                let result1 = results;
                let sql = `select sum(amount_paid) as yesterdays_sale from orders where order_date = CURDATE()-1 and ph_id = ${decoded.id};`
                con.query(sql, (err, results) => {
                    if (err) throw err;
                    let result2 = results;
                    let sql = `select month(CURDATE()) as month, year(CURDATE()) as year;`
                    con.query(sql, (err, results) => {
                        if (err) throw err;
                        let sql = `select sum(amount_paid) as months_sale from orders where order_date between '${results[0].year}-${results[0].month}-01' and CURDATE() and ph_id = ${decoded.id};`
                        con.query(sql, (err, results) => {
                            if (err) throw err;
                            let result3 = results;
                            let sql = `select sum(amount_paid) as total_sale from orders where ph_id = ${decoded.id};`
                            con.query(sql, (err, results) => {
                                if (err) throw err;
                                if (result1[0].todays_sale == null) {
                                    result1[0].todays_sale = 0;
                                }
                                if (result2[0].yesterdays_sale == null) {
                                    result2[0].yesterdays_sale = 0;
                                }
                                if (result3[0].months_sale == null) {
                                    result3[0].months_sale = 0;
                                }
                                if (results[0].total_sale == null) {
                                    results[0].total_sale = 0;
                                }
                                res.render('dashboard', { result1, result2, result3, results });
                            })
                        })
                    })

                })
            })
        }
        catch (err) {
            res.send('Invalid token!');
        }
    }
})

app.get('/invoice/data/:inumber', (req, res) => {
    if (!ls.get('token')) {
        res.redirect('/login')
    }
    else {
        try {
            const decoded = jwt.verify(ls.get('token'), config.get('jwtPrivateKey'));
            let { inumber } = req.params;
            let sql = `select order_id, cus_id, amount_paid, discount, order_date, mode from orders where order_id = ${inumber} and ph_id = ${decoded.id};`
            con.query(sql, (err, results) => {
                if (err) throw err;
                let result1 = results;
                let sql = `select cus_name, cus_contact from customers where cus_id = ${results[0].cus_id} and ph_id = ${decoded.id};`
                con.query(sql, (err, results) => {
                    if (err) throw err;
                    let result2 = results;
                    let sql = `select med_id, qty_sold from order_details where order_id = ${inumber};`
                    con.query(sql, (err, results) => {
                        if (err) throw err;
                        let result3 = results;
                        let sql = `select med_id, med_name, med_price from medicines where ph_id = ${decoded.id};`
                        con.query(sql, (err, results) => {
                            if (err) throw err;
                            res.render('invoicedata', { result1, result2, result3, results });
                        })
                    })
                })
            })
        }
        catch (err) {
            res.send('Invalid token!');
        }
    }
})

app.get('/invoice/search', (req, res) => {
    if (!ls.get('token')) {
        res.redirect('/login')
    }
    else {
        try {
            const decoded = jwt.verify(ls.get('token'), config.get('jwtPrivateKey'));
            res.render('invoicesearch')
        }
        catch (err) {
            res.send('Invalid token!');
        }
    }
})

app.get('/less/stock', (req, res) => {
    if (!ls.get('token')) {
        res.render('login')
    }
    else {
        try {
            const decoded = jwt.verify(ls.get('token'), config.get('jwtPrivateKey'));
            let sql = `select medicines.med_id, medicines.med_name, medicines.med_quantity, pharma_companies.company_name from medicines join pharma_companies on medicines.company_id = pharma_companies.company_id where medicines.ph_id = ${decoded.id} and medicines.med_quantity<20;`
            con.query(sql, (err, results) => {
                if (err) throw err;
                res.render('lessinstock', { results })
            })
        }
        catch (err) {
            res.send('Invalid token!');
        }
    }
})

app.get('/login', (req, res) => {
    if (!ls.get('token')) {
        res.render('login')
    }
    else {
        try {
            const decoded = jwt.verify(ls.get('token'), config.get('jwtPrivateKey'));
            res.redirect('/');
        }
        catch (err) {
            res.send('Invalid token!');
        }
    }
})

app.get('/manage/company', (req, res) => {
    if (!ls.get('token')) {
        res.redirect('/login')
    }
    else {
        try {
            const decoded = jwt.verify(ls.get('token'), config.get('jwtPrivateKey'));
            let sql = `select * from pharma_companies where ph_id = ${decoded.id} order by company_name;`
            con.query(sql, (err, results) => {
                if (err) throw err;
                res.render('managecompany', { results })
            })
        }
        catch (err) {
            res.send('Invalid token!');
        }
    }
})

app.get('/manage/medicine', (req, res) => {
    if (!ls.get('token')) {
        res.redirect('/login')
    }
    else {
        try {
            const decoded = jwt.verify(ls.get('token'), config.get('jwtPrivateKey'));
            let sql = `select medicines.med_id as med_id, medicines.med_name as med_name, medicines.med_quantity as med_quantity, medicines.med_price as med_price, pharma_companies.company_name as company_name from medicines join pharma_companies on medicines.company_id = pharma_companies.company_id and medicines.ph_id = pharma_companies.ph_id and medicines.ph_id = ${decoded.id} order by medicines.med_name;`
            con.query(sql, (err, results) => {
                if (err) throw err;
                res.render('managemedicine', { results })
            })
        }
        catch (err) {
            res.send('Invalid token!');
        }
    }
})

app.get('/salesreport/customers/:fdate/:tdate', (req, res) => {
    if (!ls.get('token')) {
        res.redirect('/login')
    }
    else {
        try {
            const decoded = jwt.verify(ls.get('token'), config.get('jwtPrivateKey'));
            let { fdate, tdate } = req.params;
            let sql = `select orders.order_id, orders.order_date, orders.amount_paid, customers.cus_name from orders join customers where orders.cus_id = customers.cus_id and orders.ph_id = ${decoded.id} order by orders.order_date;`
            con.query(sql, (err, results) => {
                if (err) throw err;
                res.render('salesreportcustomers', { results, fdate, tdate })
            })

        }
        catch (err) {
            res.send('Invalid token!');
        }
    }
})

app.get('/salesreport/medicines/:fdate/:tdate', (req, res) => {
    if (!ls.get('token')) {
        res.redirect('/login')
    }
    else {
        try {
            const decoded = jwt.verify(ls.get('token'), config.get('jwtPrivateKey'));
            let { fdate, tdate } = req.params;
            let sql = `select order_details.med_id, sum(qty_sold) as total from orders join order_details on orders.order_id = order_details.order_id where orders.order_date between '${fdate}' and '${tdate}' and orders.ph_id = ${decoded.id} group by order_details.med_id order by order_details.med_id;`
            con.query(sql, (err, results) => {
                if (err) throw err;
                let result1 = results;
                let sql = `select medicines.med_id, medicines.med_name, pharma_companies.company_name from medicines join pharma_companies on medicines.company_id = pharma_companies.company_id and medicines.ph_id = pharma_companies.ph_id and medicines.ph_id = ${decoded.id};`
                con.query(sql, (err, results) => {
                    if (err) throw err;
                    res.render('salesreportmedicines', { result1, results, fdate, tdate });
                })
            })
        }
        catch (err) {
            res.send('Invalid token!');
        }
    }
})

app.get('/salesreport/period', (req, res) => {
    if (!ls.get('token')) {
        res.redirect('/login')
    }
    else {
        try {
            const decoded = jwt.verify(ls.get('token'), config.get('jwtPrivateKey'));
            res.render('salesreportperiod')
        }
        catch (err) {
            res.send('Invalid token!');
        }
    }
})

app.get('/signup', (req, res) => {
    ls.clear();
    res.render('signup');
})

app.get('/update/company/:cid', (req, res) => {
    if (!ls.get('token')) {
        res.redirect('/login')
    }
    else {
        try {
            const decoded = jwt.verify(ls.get('token'), config.get('jwtPrivateKey'));
            let { cid } = req.params;
            let sql = `select company_id, company_name, company_contact, company_email, company_address from pharma_companies where company_id = ${cid} and ph_id = ${decoded.id};`
            con.query(sql, (err, results) => {
                if (err) throw err;
                res.render('updatecompany', { results })
            })
        }
        catch (err) {
            res.send('Invalid token!');
        }
    }
})

app.get('/update/customer/:cid', (req, res) => {
    if (!ls.get('token')) {
        res.redirect('/login')
    }
    else {
        try {
            const decoded = jwt.verify(ls.get('token'), config.get('jwtPrivateKey'));
            let { cid } = req.params;
            let sql = `select * from customers where cus_id = ${cid} and ph_id = ${decoded.id};`
            con.query(sql, (err, results) => {
                if (err) throw err;
                res.render('updatecustomer', { results })
            })
        }
        catch (err) {
            res.send('Invalid token!');
        }
    }
})

app.get('/update/medicine/:mid', (req, res) => {
    if (!ls.get('token')) {
        res.redirect('/login')
    }
    else {
        try {
            const decoded = jwt.verify(ls.get('token'), config.get('jwtPrivateKey'));
            let { mid } = req.params;
            let sql = `select company_id, med_id, med_name, med_quantity, med_price from medicines where med_id = ${mid} and ph_id = ${decoded.id};`
            con.query(sql, (err, results) => {
                if (err) throw err;
                let result = results;
                let sql = `select company_name from pharma_companies where company_id = ${results[0].company_id} and ph_id = ${decoded.id};`
                con.query(sql, (err, results) => {
                    if (err) throw err;
                    let result1 = results;
                    let sql = `select company_name from pharma_companies where ph_id = ${decoded.id};`
                    con.query(sql, (err, results) => {
                        if (err) throw err;
                        res.render('updatemedicine', { result, result1, results })
                    })

                })
            })
        }
        catch (err) {
            res.send('Invalid token!');
        }
    }
})

app.get('/view/orders/:cid', (req, res) => {
    if (!ls.get('token')) {
        res.redirect('/login')
    }
    else {
        try {
            const decoded = jwt.verify(ls.get('token'), config.get('jwtPrivateKey'));
            let { cid } = req.params;
            let sql = `select order_id, order_date, amount_paid from orders where cus_id = ${cid} and ph_id = ${decoded.id};`
            con.query(sql, (err, results) => {
                if (err) throw err;
                res.render('vieworders', { results })
            })
        }
        catch (err) {
            res.send('Invalid token!');
        }
    }
})

/*****************************************************************GET REQUESTS END HERE**********************************************************************/

/***************************************************************POST REQUESTS START HERE*********************************************************************/

app.post('/add/company', (req, res) => {
    try {
        const decoded = jwt.verify(ls.get('token'), config.get('jwtPrivateKey'));
        let { cname, cnumber, cemail, caddress } = req.body;
        let sql = `select company_name from pharma_companies where company_name like '${cname}' and ph_id = ${decoded.id};`
        con.query(sql, (err, results) => {
            if (err) throw err;
            if (results[0] == null) {
                let sql = `insert into pharma_companies(ph_id, company_name, company_contact, company_email, company_address) values(${decoded.id}, '${cname}', '${cnumber}', '${cemail}', '${caddress}');`
                con.query(sql, (err, results) => {
                    if (err) throw err;
                    return res.send({ success: true });
                })
            }
            else return res.send({ success: false });
        })
    }
    catch (err) {
        res.send('Invalid token!');
    }
})

app.post('/add/medicine', (req, res) => {
    try {
        const decoded = jwt.verify(ls.get('token'), config.get('jwtPrivateKey'));
        let { cname, mname, quantity, price } = req.body;
        let sql = `select company_id from pharma_companies where company_name like '${cname}' and ph_id = ${decoded.id};`
        con.query(sql, (err, results) => {
            if (err) throw err;
            let result = results[0].company_id;
            let sql = `select med_id from medicines where med_name like '${mname}' and ph_id = ${decoded.id};`
            con.query(sql, (err, results) => {
                if (err) throw err;
                if (results[0] == null) {
                    let sql = `insert into medicines(ph_id, company_id, med_name, med_quantity, med_price) values(${decoded.id}, ${result}, '${mname}', ${quantity}, ${price});`
                    con.query(sql, (err, results) => {
                        if (err) throw err;
                    })
                    return res.send({ success: false });
                }
                else {
                    return res.send({ success: true });
                }
            })
        })
    }
    catch (err) {
        res.send('Invalid token!');
    }
})

app.post('/cart', (req, res) => {
    try {
        const decoded = jwt.verify(ls.get('token'), config.get('jwtPrivateKey'));
        let { mid, quantity } = req.body;
        let sql = `select med_quantity from medicines where med_id = ${mid} and ph_id = ${decoded.id};`
        con.query(sql, (err, results) => {
            if (err) throw err;
            let sql = `update medicines set med_quantity = ${results[0].med_quantity + quantity} where med_id = ${mid} and ph_id = ${decoded.id};`
            con.query(sql, (err, results) => {
                if (err) throw err;
                let sql = `delete from cart where med_id = ${mid} and ph_id = ${decoded.id};`
                con.query(sql, (err, results) => {
                    if (err) throw err;
                    return res.send({ success: true });
                })
            })
        })
    }
    catch (err) {
        res.send('Invalid token!');
    }
})

app.post('/cart/:number', (req, res) => {
    try {
        const decoded = jwt.verify(ls.get('token'), config.get('jwtPrivateKey'));
        let { number } = req.body;
        let sql = `select cus_contact from customers where ph_id = ${decoded.id};`
        con.query(sql, (err, results) => {
            if (err) throw err;
            for (let r of results) {
                if (r.cus_contact == number) {
                    return res.send({ success: true });
                }
            }
            return res.send({ success: false });
        })
    }
    catch (err) {
        res.send('Invalid token!');
    }
})

app.post('/cart/failure/:ccontact', (req, res) => {
    try {
        const decoded = jwt.verify(ls.get('token'), config.get('jwtPrivateKey'));
        let { cname, ccontact, cemail, caddress, fg } = req.body;
        let sql = `insert into customers(ph_id, cus_name, cus_contact, cus_email, cus_gender, cus_address) values(${decoded.id}, '${cname}', '${ccontact}', '${cemail}', ${fg}, '${caddress}');`
        con.query(sql, (err, results) => {
            if (err) throw err;
            return res.send({ success: true });
        })
    }
    catch (err) {
        res.send('Invalid token!');
    }
})

app.post('/cart/success/:id', (req, res) => {
    try {
        const decoded = jwt.verify(ls.get('token'), config.get('jwtPrivateKey'));
        let { cid, pby, discount, total, fm } = req.body;
        let sql = `insert into orders(ph_id, cus_id, order_date, prescribed_by, discount, amount_paid, mode) values(${decoded.id}, ${cid}, CURDATE(), '${pby}', ${discount}, ${total - discount}, ${fm});`
        con.query(sql, (err, results) => {
            if (err) throw err;
            let sql = `select max(order_id) as order_id from orders where ph_id = ${decoded.id};`
            con.query(sql, (err, results) => {
                if (err) throw err;
                let sql = `insert into order_details(order_id, med_id, qty_sold) select ${results[0].order_id}, cart.med_id, cart.quantity from cart where ph_id = ${decoded.id};`
                con.query(sql, (err, results) => {
                    if (err) throw err;
                    let sql = `update customers set cus_membership_points = cus_membership_points + ${(0.05 * total) - discount} where cus_id = ${cid} and ph_id = ${decoded.id};`
                    con.query(sql, (err, results) => {
                        if (err) throw err;
                        let sql = `delete from cart where ph_id = ${decoded.id};`
                        con.query(sql, (err, results) => {
                            if (err) throw err;
                            return res.send({ success: true });
                        })
                    })

                })
            })
        })
    }
    catch (err) {
        res.send('Invalid token!');
    }
})

app.post('/invoice/data', (req, res) => {
    try {
        const decoded = jwt.verify(ls.get('token'), config.get('jwtPrivateKey'));
        let sql = `select max(order_id) as order_id from orders where ph_id = ${decoded.id};`
        con.query(sql, (err, results) => {
            if (err) throw err;
            return res.send({ success: true, results });
        })
    }
    catch (err) {
        res.send('Invalid token!');
    }
})

app.post('/invoice/data/:inumber', (req, res) => {
    try {
        const decoded = jwt.verify(ls.get('token'), config.get('jwtPrivateKey'));
        let { inumber } = req.body;
        sql = `select order_id from orders where order_id = ${inumber} and ph_id = ${decoded.id};`
        con.query(sql, (err, results) => {
            if (err) throw err;
            if (results[0] == null) {
                return res.send({ success: false });
            }
            else return res.send({ success: true });
        })
    }
    catch (err) {
        res.send('Invalid token!');
    }
})

app.post('/login', (req, res) => {
    let { username, password } = req.body;
    let sql = `select ph_id, ph_name, ph_username, ph_password from pharmacies where ph_username like '${username}';`
    con.query(sql, (err, results) => {
        if (err) throw err;
        if (results[0] != null) {
            const isValid = bcrypt.compareSync(password, results[0].ph_password);
            if (isValid) {
                const token = jwt.sign({ id: results[0].ph_id, name: results[0].ph_name }, config.get('jwtPrivateKey'));
                ls.set('token', token);
                let decoded = jwt.decode(ls.get('token'));
                let sql = `create or replace view cart_details as select pharma_companies.company_name as company_name, cart.med_id as med_id, cart.quantity as quantity, medicines.med_name as med_name, medicines.med_price as price from ((cart join medicines on cart.med_id = medicines.med_id and cart.ph_id = medicines.ph_id and cart.ph_id = ${decoded.id}) join pharma_companies on medicines.company_id = pharma_companies.company_id and medicines.ph_id = pharma_companies.ph_id and medicines.ph_id = ${decoded.id});`
                con.query(sql, (err, results) => {
                    if (err) throw err;
                    return res.send({ success: true });
                })
            }
            else return res.send({ success: false });
        }
        else return res.send({ success: false });
    })
})

app.post('/logout', (req, res) => {
    ls.clear();
    return res.send({ success: true });
})

app.post('/manage/medicine', (req, res) => {
    try {
        const decoded = jwt.verify(ls.get('token'), config.get('jwtPrivateKey'));
        let { mid, bquantity } = req.body;
        let sql = `select med_quantity from medicines where med_id = ${mid} and ph_id = ${decoded.id};`
        con.query(sql, (err, results) => {
            if (err) throw err;
            if (bquantity <= results[0].med_quantity) {
                let sql = `update medicines set med_quantity = ${results[0].med_quantity - bquantity} where med_id = ${mid} and ph_id = ${decoded.id};`
                con.query(sql, (err, results) => {
                    if (err) throw err;
                })
                sql = `select med_id from cart where med_id = ${mid} and ph_id = ${decoded.id};`
                con.query(sql, (err, results) => {
                    if (err) throw err;
                    if (results[0] == null) {
                        let sql = `insert into cart(ph_id, med_id, quantity) values(${decoded.id}, ${mid}, ${bquantity});`
                        con.query(sql, (err, results) => {
                            if (err) throw err;
                            return res.send({ success: true });
                        })
                    }
                    else {
                        let sql = `select quantity from cart where med_id = ${mid} and ph_id = ${decoded.id};`
                        con.query(sql, (err, results) => {
                            if (err) throw err;
                            let sql = `update cart set quantity = ${results[0].quantity + bquantity} where med_id = ${mid} and ph_id = ${decoded.id};`
                            con.query(sql, (err, results) => {
                                if (err) throw err;
                                return res.send({ success: true });
                            })
                        })
                    }
                })

            }
            else return res.send({ success: false });
        })
    }
    catch (err) {
        res.send('Invalid token!');
    }
})

app.post('/salesreport/period', (req, res) => {
    try {
        const decoded = jwt.verify(ls.get('token'), config.get('jwtPrivateKey'));
        let { fdate, tdate } = req.body;
        sql = `select order_id from orders where order_date between '${fdate}' and '${tdate}' and ph_id = ${decoded.id};`
        con.query(sql, (err, results) => {
            if (err) throw err;
            if (results[0] == null) {
                return res.send({ success: false });
            }
            else {
                return res.send({ success: true });
            }
        })
    }
    catch (err) {
        res.send('Invalid token!');
    }
})

app.post('/signup', (req, res) => {
    let { name, contact, email, address, username, password } = req.body;
    let sql = `select ph_username from pharmacies where ph_username like '${username}';`
    con.query(sql, (err, results) => {
        if (err) throw err;
        if (results[0] == null) {
            let sql = `select ph_email from pharmacies where ph_email like '${email}';`
            con.query(sql, (err, results) => {
                if (err) throw err;
                if (results[0] == null) {
                    const salt = bcrypt.genSaltSync(12);
                    const hashed = bcrypt.hashSync(password, salt);
                    let sql;
                    if (email == 'NULL' && address == 'NULL') {
                        sql = `insert into pharmacies(ph_name, ph_contact, ph_username, ph_password) values('${name}', '${contact}', '${username}', '${hashed}');`
                    }
                    else if (email == 'NULL') {
                        sql = `insert into pharmacies(ph_name, ph_contact, ph_address, ph_username, ph_password) values('${name}', '${contact}', '${address}', '${username}', '${hashed}');`
                    }
                    else if (address == 'NULL') {
                        sql = `insert into pharmacies(ph_name, ph_contact, ph_email, ph_username, ph_password) values('${name}', '${contact}', '${email}', '${username}', '${hashed}');`
                    }
                    else {
                        sql = `insert into pharmacies(ph_name, ph_contact, ph_email, ph_address, ph_username, ph_password) values('${name}', '${contact}', '${email}', '${address}', '${username}', '${hashed}');`
                    }
                    con.query(sql, (err, results) => {
                        if (err) throw err;
                        let sql = `select ph_id, ph_name from pharmacies where ph_id = (select max(ph_id) from pharmacies);`
                        con.query(sql, (err, results) => {
                            if (err) throw err;
                            const token = jwt.sign({ id: results[0].ph_id, name: results[0].ph_name }, config.get('jwtPrivateKey'));
                            ls.set('token', token);
                            let decoded = jwt.decode(ls.get('token'));
                            let sql = `create or replace view cart_details as select pharma_companies.company_name as company_name, cart.med_id as med_id, cart.quantity as quantity, medicines.med_name as med_name, medicines.med_price as price from ((cart join medicines on cart.med_id = medicines.med_id and cart.ph_id = medicines.ph_id and cart.ph_id = ${decoded.id}) join pharma_companies on medicines.company_id = pharma_companies.company_id and medicines.ph_id = pharma_companies.ph_id and medicines.ph_id = ${decoded.id});`
                            con.query(sql, (err, results) => {
                                if (err) throw err;
                                return res.send({ success: true });
                            })
                        })
                    })
                }
                else return res.send({ success: false });
            })
        }
        else return res.send({ success: false });
    })
})

app.post('/update/company/:cid', (req, res) => {
    try {
        const decoded = jwt.verify(ls.get('token'), config.get('jwtPrivateKey'));
        let { id, cname, cnumber, cemail, caddress } = req.body;
        let sql = `select company_name from pharma_companies where company_name like '${cname}' and ph_id = ${decoded.id} and company_id <> ${id};`
        con.query(sql, (err, results) => {
            if (err) throw err;
            if (results[0] == null) {
                let sql = `update pharma_companies set company_name = '${cname}', company_contact = '${cnumber}', company_email = '${cemail}', company_address = "${caddress}" where company_id = ${id} and ph_id = ${decoded.id};`
                con.query(sql, (err, results) => {
                    if (err) throw err;
                    return res.send({ success: true });
                })
            }
            else return res.send({ success: false });
        })
    }
    catch (err) {
        res.send('Invalid token!');
    }
})

app.post('/update/customer/:cid', (req, res) => {
    try {
        const decoded = jwt.verify(ls.get('token'), config.get('jwtPrivateKey'));
        let { id, cname, ccontact, cemail, caddress, fg } = req.body;
        let sql = `update customers set cus_name = '${cname}', cus_contact = '${ccontact}', cus_email = '${cemail}', cus_gender = ${fg}, cus_address = '${caddress}' where cus_id = ${id} and ph_id = ${decoded.id};`
        con.query(sql, (err, results) => {
            if (err) throw err;
            return res.send({ success: true });
        })
    }
    catch (err) {
        res.send('Invalid token!');
    }
})

app.post('/update/medicine/:mid', (req, res) => {
    try {
        const decoded = jwt.verify(ls.get('token'), config.get('jwtPrivateKey'));
        let { id, cname, mname, quantity, price } = req.body;
        let sql = `select med_name from medicines where med_name like '${mname}' and ph_id = ${decoded.id} and med_id <> ${id};`
        con.query(sql, (err, results) => {
            if (err) throw err;
            if (results[0] == null) {
                let sql = `select company_id from pharma_companies where company_name like '${cname}' and ph_id = ${decoded.id};`
                con.query(sql, (err, results) => {
                    if (err) throw err;
                    let result = results;
                    let sql = `select med_quantity from medicines where med_id = ${id} and ph_id = ${decoded.id};`
                    con.query(sql, (err, results) => {
                        if (err) throw err;
                        if ((quantity + results[0].med_quantity) >= 0) {
                            let sql = `update medicines set company_id = ${result[0].company_id}, med_name = '${mname}', med_quantity = ${quantity + results[0].med_quantity}, med_price = ${price} where med_id = ${id} and ph_id = ${decoded.id};`
                            con.query(sql, (err, results) => {
                                if (err) throw err;
                                return res.send({ success: true });
                            })
                        }
                        else {
                            return res.send({ success: false });
                        }
                    })
                })
            }
            else return res.send({ success: false });
        })
    }
    catch (err) {
        res.send('Invalid token!');
    }
})

/***************************************************************POST REQUESTS END HERE************************************************************************/

app.listen(3000, () => {
    console.log("LISTENING ON PORT 3000")
})
