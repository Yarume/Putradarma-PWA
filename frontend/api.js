const path = require('path');
const koneksi = require('../backend/database')

const createViewApi = app => {
    app.get('/', async (request, res) => {
        if (request.session.userId) {
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
};

module.exports = {
    createViewApi
};