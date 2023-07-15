const bcrypt = require('bcrypt')
const koneksi = require('./database')

const createRestApi = app => {
    app.post('/api/login', async (request, response) => {
        const user = {
            email: request.body.email,
            password: request.body.password
        };
        if (user.email && user.password) {
            koneksi.query('SELECT users.id, users.password, user_group.group_id FROM users INNER JOIN user_group ON users.id = user_group.user_id WHERE users.email= ? LIMIT 1;', [user.email], (err, result) => {
                if (err) throw err
                if (result.length > 0) {
                    var checkakun = bcrypt.compareSync(user.password, result[0].password.replace(/^\$2y/, "$2a"))
                    if(checkakun){
                        const user = result[0]
                        request.session.userId = user.id
                        request.session.Level  = user.group_id
                        return response.json({result: 'SUCCESS', userId: user.id});
                        
                    }else {
                        return response.json({result: 'ERROR', message: 'Incorrect Password!'});
                    }  
                }else{
                    return response.json({result: 'ERROR', message: 'Incorrect Email and/or Password!'});
                }
            });
        }else{
            return response.json({result: 'ERROR', message: 'Please enter Email and Password!'});
        }

    });
      
    app.get('/user/logout', async (request, response) => {
        if (request.session.userId) {
            delete request.session.userId;
            return  response.redirect('/')
        } else {
            return response.json({result: 'ERROR', message: ''});
        }
    });

    app.post('/api/sales/data', async (request, response) => {
        if (!request.session.userId) {
            return  response.redirect('/')
        }
        let userid = request.body.userid;
        koneksi.query('SELECT sales.id as id, products.name as name, sales.qty as qty FROM sales INNER JOIN products ON products.id = sales.id WHERE sales.user_id = ?', [userid], (err, result) => {
            if (err) throw err
            if (result.length > 0) {
                return response.json({result: 'SUCCESS', success: true, data: result});
            }else{
                return response.json({result: 'ERROR', message : "Data Kosong"});
            }
        });
    });

    app.post('/api/sales/add', async (request, response) => {
        if (!request.session.userId) {
            return  response.redirect('/')
        }
        const barang = {
            user_id :    request.session.userId,
            item_id:     request.body.products,
            qty:        request.body.qty,
        };
        if (barang.item_id && barang.qty) {
            koneksi.query('SELECT id,qty,name FROM products WHERE id = ? AND qty > ? LIMIT 1', [barang.item_id, barang.qty], (err, sproduk) => {
                if (err) throw err
                if (sproduk.length < 1) {
                    koneksi.query('SELECT * FROM sales WHERE item_id = ? AND user_id = ?  LIMIT 1', [barang.item_id, barang.user_id], (err, ssales) => {
                        if (err) throw err


                        //HISTORY INSERT
                        const history = {
                            userid: request.session.userId,
                            Type: "MOBILE",
                            qty: barang.qty,
                            history: "USER : , Request Barang "+sproduk.name+" Sebanyak "+ request.body.qty +"",
                        }
                        koneksi.query('INSERT INTO history SET ?', [history], (err, result) => {
                            if (err) {
                                return response.json({result: 'ERROR', message : err});
                            }
                            return response.json({result: 'SUCCESS', success: true, data: result});
                        });


                        if (ssales.length > 0) { // UPDATE FUNCTION
                            koneksi.query('UPDATE sales SET qty = qty + ? WHERE user_id = ? AND item_id = ?', [barang.qty, barang.user_id, barang.item_id], (err, result) => {
                                if (err) {
                                    return response.json({result: 'ERROR', message : err});
                                }
                                koneksi.query('UPDATE products SET qty = qty - ? WHERE id = ?', [barang.qty, barang.item_id], (err, result) => {
                                    if (err) {
                                        return response.json({result: 'ERROR', message : err});
                                    }
                                });
                            });
                        }else{ // INSERT FUNCTION
                            koneksi.query('INSERT INTO sales SET ?', [barang], (err, result) => {
                                if (err) {
                                    return response.json({result: 'ERROR', message : err});
                                }
                                return response.json({result: 'SUCCESS', success: true, data: result});
                            });
                        }
                    });
                }else{
                    return response.json({result: 'ERROR', message: 'Jumlah barang yang di input tidak tersedia'});
                }
            });
        }else{
            return response.json({result: 'ERROR', message: 'Please fill form'});
        }

    });

    app.post('/api/product/add', async (request, response) => {
        if (!request.session.userId) {
            return  response.redirect('/')
        }
        const barang = {
            user_id :    request.session.userId,
            item_id:     request.body.products,
            qty:        request.body.qty,
        };
        if (barang.item_id && barang.qty) {
            koneksi.query('SELECT id,qty FROM products WHERE id = ? LIMIT 1', [barang.item_id], (err, res2) => {
                if (err) throw err
                if (result.length > 0) {
                    koneksi.query('UPDATE products SET qty = ? WHERE id = ?', [barang.qty, barang.item_id], (err, result) => {
                        if (err) {
                            return response.json({result: 'ERROR', message : err});
                        }
                        const history = {
                            userid: request.session.userId,
                            Type: "UPDATE",
                            qty: barang.qty,
                            history: "USER : , Update Qty dari "+ res2[0].qty+" Menjadi "+ barang.qty +"",
                        }
                        koneksi.query('INSERT INTO sales SET ?', [history], (err, result) => {
                            if (err) {
                                return response.json({result: 'ERROR', message : err});
                            }
                            return response.json({result: 'SUCCESS', success: true, data: result});
                        });
                        return response.json({result: 'SUCCESS', success: true, data: result});
                    }); 
                }
            });
        }else{
            return response.json({result: 'ERROR', message: 'Please fill form'});
        }

    });

};

module.exports = {
    createRestApi
};

