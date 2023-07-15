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
                        });
                    }else{

                        return res.render(path.join(__dirname, 'admin'), {
                            error: true,
                            data_barang: results,
                        });
                    }
                })
            }else{
                koneksi.query('SELECT sales.id as id, products.name as name, sales.qty as qty FROM sales INNER JOIN products ON products.id = sales.id WHERE sales.user_id = ?', [request.session.userId], (error, results, fields) => {
                    if (error){
                        return res.render(path.join(__dirname, 'site'), {
                            error: true,
                            messages: 'Ada masalah koneksi Nodejs ke Mysql',
                        });
                    }else{
                        return res.render(path.join(__dirname, 'site'), {
                            error: false,
                            data_barang: results,
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
        koneksi.query('SELECT id,name,qty FROM products WHERE qty > 0', [], (error, result, fields) => {
            return res.render(path.join(__dirname, 'sales'), {
                error: false,
                data_products: result,
                user_id: request.session.userId,
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
                });
            }else{
                return res.render(path.join(__dirname, 'product'), {
                    error: false,
                    itemid: itemid,
                    itemname: result[0].name,
                    itemqty: result[0].qty,
                });
            }
        });
    });
};

module.exports = {
    createViewApi
};