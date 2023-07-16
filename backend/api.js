const bcrypt = require('bcrypt')
const koneksi = require('./database')

const createRestApi = app => {
    app.post('/api/login', async (request, response) => {
        const user = {
            email: request.body.email,
            password: request.body.password
        };
        if (user.email && user.password) {
            koneksi.query('SELECT users.id, users.password, users.username, user_group.group_id FROM users INNER JOIN user_group ON users.id = user_group.user_id WHERE users.email= ? LIMIT 1;', [user.email], (err, result) => {
                if (err) throw err
                if (result.length > 0) {
                    var checkakun = bcrypt.compareSync(user.password, result[0].password.replace(/^\$2y/, "$2a"))
                    if(checkakun){
                        const user = result[0]
                        request.session.userId = user.id
                        request.session.Level  = user.group_id
                        request.session.username = user.username
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
            koneksi.query('SELECT id,qty,name FROM products WHERE id = ? LIMIT 1', [barang.item_id], (err, sproduk) => {
                if (err) throw err

                if (sproduk.length > 0) {
                        let produk = sproduk[0];
                        if (parseInt(barang.qty) > parseInt(produk.qty)) {
                            // return response.json({result: 'ERROR', message: 'SELECT id,qty,name FROM products WHERE id = '+barang.item_id+' AND qty > '+barang.qty+' LIMIT 1 QUERY : '+sproduk.length+''});
                            return response.json({result: 'ERROR', message : "Jumlah Barang yang di input melebihi stok barang di gudang!"})
                        }

                        //HISTORY INSERT
                        const history = {
                            userid: request.session.userId,
                            Type: "MOBILE",
                            qty: barang.qty,
                            itemid: barang.item_id,
                            history: "USER : "+ request.session.userId +", Tambah Barang "+produk.name+" Sebanyak "+ request.body.qty +"",
                        }
                        koneksi.query('INSERT INTO history SET ?', [history], (err, result) => {
                            if (err) {
                                return response.json({result: 'ERROR', message : err});
                            }
                        });

                        //ENDHISTORY

                            koneksi.query('SELECT * FROM sales WHERE item_id = ? AND user_id = ?  LIMIT 1', [barang.item_id, barang.user_id], (err, ssales) => {
                                if (err) throw err

                                
                                if (ssales.length > 0) {
                                    // UPDATE FUNCTION
                                        koneksi.query('UPDATE sales SET qty = qty + ? WHERE user_id = ? AND item_id = ?', [barang.qty, barang.user_id, barang.item_id], (err, result) => {
                                            if (err) {
                                                return response.json({result: 'ERROR', message : err});
                                            }
                                            koneksi.query('UPDATE products SET qty = qty - ? WHERE id = ?', [barang.qty, barang.item_id], (err, result) => {
                                                if (err) {
                                                    return response.json({result: 'ERROR', message : err});
                                                }
                                                    return response.json({result: 'SUCCESS', data: result});
                                            });
                                        });
                                }else{ 
                                    // INSERT FUNCTION
                                        koneksi.query('INSERT INTO sales SET ?', [barang], (err, result) => {
                                            if (err) {
                                                return response.json({result: 'ERROR', message : err});
                                            }
                                            koneksi.query('UPDATE products SET qty = qty - ? WHERE id = ?', [barang.qty, barang.item_id], (err, result) => {
                                                if (err) {
                                                    return response.json({result: 'ERROR', message : err});
                                                }
                                                    return response.json({result: 'SUCCESS', data: result});
                                            });
                                        });
                                }
                            });
                    }else{
                    //
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

                if (res2.length > 0) {
                    if (parseInt(barang.qty) > parseInt(res2[0].qty)) {
                        var status = "Admin Menambahkan Qty dari "+ res2[0].qty +" Menjadi "+ barang.qty +""
                        var qty = barang.qty - res2[0].qty
                    }else{
                        var status = "Admin Mengurangi Qty dari "+ res2[0].qty+" Menjadi "+ barang.qty +""
                        var qty = barang.qty
                    }
                    const history = {
                        userid: request.session.userId,
                        Type: "MOBILE",
                        qty: qty,
                        itemid: barang.item_id,
                        history: status,
                    }
                    koneksi.query('INSERT INTO history SET ?', [history], (err, result) => {
                        if (err) {
                            return response.json({result: 'ERROR', message : err});
                        }
                    });
                    
                    koneksi.query('UPDATE products SET qty = ? WHERE id = ?', [barang.qty, barang.item_id], (err, result) => {
                        if (err) {
                            return response.json({result: 'ERROR', message : err});
                        }
                        return response.json({result: 'SUCCESS', data: result});
                    }); 

                }
            });
        }else{
            return response.json({result: 'ERROR', message: 'Please fill form'});
        }

    });

    app.post('/api/product/jual', async (request, response) => {
        if (!request.session.userId) {
            return  response.redirect('/')
        }
        const produk = {
            user_id :       request.session.userId,
            item_id:        request.body.products,
            qty:            request.body.qty,
            hargapcs:       request.body.harga,
        };
        
        if (produk.item_id && produk.qty) {
            koneksi.query('SELECT id,qty FROM sales WHERE item_id = ? AND user_id = ? LIMIT 1', [produk.item_id, produk.user_id], (err, res2) => {

                if (parseInt(produk.qty) > parseInt(res2[0].qty)) {
                    return response.json({result: 'ERROR', message : "Jumlah Barang yang di input melebihi stok barang kamu"})
                }
                if (res2.length > 0) {

                    var str = makeid(5)
                    const totalharga = produk.qty * produk.hargapcs
                    const orders = {
                        bill_no : 'BILPR-'+str.toUpperCase()+'',
                        customer_name : '',
                        customer_address : '',
                        customer_phone: '',
                        date_time : parseInt(Date.now()/1000),
                        gross_amount : totalharga,
                        service_charge_rate : 5,
                        service_charge: 1.15,
                        vat_charge_rate: 5,
                        vat_charge: 1.15,
                        net_amount: totalharga,
                        discount: '',
                        paid_status: 1,
                        user_id : produk.user_id
                    }

                    koneksi.query('INSERT INTO orders SET ?', [orders], (err, insertrest) => {
                        if (err) throw err
                        const order_items = {
                            order_id : insertrest.insertId,
                            product_id : produk.item_id,
                            qty : produk.qty,
                            rate : 1,
                            amount: totalharga
                        }
                        koneksi.query('INSERT INTO orders_item SET ?', [order_items], (err, insertrest) => {
                            if (err) throw err

                            koneksi.query('UPDATE sales SET qty = qty - ? WHERE item_id = ?', [produk.qty, produk.item_id], (err, result) => {
                                if (err) {
                                    return response.json({result: 'ERROR', message : err});
                                }
                                    return response.json({result: 'SUCCESS', data: result});
                            });

                        });
                        
                    });
                }else{
                    return response.json({result: 'ERROR', message: 'Barang tidak ditemukan'});
                }
            });

        }else{
            return response.json({result: 'ERROR', message: 'Please fill form 2'});
        }



        

    });
};

function makeid(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
}


module.exports = {
    createRestApi
};

