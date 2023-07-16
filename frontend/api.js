const path = require('path');
const koneksi = require('../backend/database')

const createViewApi = app => {
    app.get('/', async (request, res) => {
        if (request.session.userId) {
            if (request.session.Level == 1) {
                koneksi.query('SELECT id,name,qty FROM products ', [], (error, results, fields) => {
                    if (error){
                        return res.render(path.join(__dirname, 'site'), {
                            error: true,
                            messages: 'Ada masalah koneksi Nodejs ke Mysql',
                            username: request.session.username,
                        });
                    }else{

                        return res.render(path.join(__dirname, 'admin'), {
                            error: true,
                            data_barang: results,
                            username: request.session.username,
                        });
                    }
                })
            }else{
                koneksi.query('SELECT sales.id as id, sales.item_id as itemid, products.name as name, sales.qty as qty FROM sales INNER JOIN products ON products.id = sales.item_id WHERE sales.user_id = ?', [request.session.userId], (error, results, fields) => {
                    if (error){
                        return res.render(path.join(__dirname, 'site'), {
                            error: true,
                            messages: 'Ada masalah koneksi Nodejs ke Mysql',
                            data_barang: 0,
                            username: request.session.username,
                        });
                    }else{
                        return res.render(path.join(__dirname, 'site'), {
                            error: false,
                            data_barang: results,
                            username: request.session.username,
                            });
                    }
                });
            }
        } else {
            return res.render(path.join(__dirname, 'login'));
        }
    });

    app.get('/add/barang/sales', async (request, res) => {
        if (!request.session.userId) {
            return  res.redirect('/')
        }
        koneksi.query('SELECT id,name,qty FROM products', [], (error, result, fields) => {
            return res.render(path.join(__dirname, 'sales'), {
                error: false,
                data_products: result,
                user_id: request.session.userId,
                username: request.session.username,
            });
        });
    });

    app.get('/add/barang/admin/:itemid', async (request, res) => {
        if (!request.session.userId) {
            return res.redirect('/')
        }
        let itemid = request.params.itemid;
        koneksi.query('SELECT name,qty FROM products WHERE id = ?', [itemid], (error, result, fields) => {
            if (error){
                return res.render(path.join(__dirname, 'product'), {
                    error: true,
                    messages: 'Ada masalah koneksi Nodejs ke Mysql',
                    username: request.session.username,
                });
            }else{
                return res.render(path.join(__dirname, 'product'), {
                    error: false,
                    itemid: itemid,
                    itemname: result[0].name,
                    itemqty: result[0].qty,
                    username: request.session.username,
                });
            }
        });
    });

    app.get('/jual/barang/:itemid', async (request, res) => {
        if (!request.session.userId) {
            return res.redirect('/')
        }
        let itemid = request.params.itemid;
        koneksi.query('SELECT sales.id as id, sales.item_id as itemid, products.name as name,  products.price as price, sales.qty as qty FROM sales INNER JOIN products ON products.id = sales.item_id WHERE sales.item_id = ?', [itemid], (error, result, fields) => {
            if (error){
                return res.render(path.join(__dirname, 'jual_barang'), {
                    error: true,
                    messages: 'Ada masalah koneksi Nodejs ke Mysql',
                });
            }else{
                return res.render(path.join(__dirname, 'jual_barang'), {
                    error: false,
                    itemid: itemid,
                    itemname: result[0].name,
                    itemqty: result[0].qty,
                    itemprice: result[0].price,
                    username: request.session.username,
                });
            }
        });
    });
};

module.exports = {
    createViewApi
};