const bcrypt = require('bcrypt')
const koneksi = require('./database')

const createRestApi = app => {
    app.post('/user/login', async (request, response) => {
        if (request.session.userId) {
            response.json({result: 'ERROR', message: 'User already logged in.'});
        } else {
            const user = {
                email: request.body.email,
                password: request.body.password
            };

            const queryloginsql = 'SELECT id,password FROM users WHERE email= ? LIMIT 1';
                koneksi.query(queryloginsql, user.email, (err, rows) => {
                    if (err) {
                        response.json({result: 'ERROR', message: 'Request operation error.'});
                    }else if(!rows.length){
                        response.json({result: 'ERROR', message: 'Indicated username or/and password are not correct.'});
                    }

                    var checkakun = bcrypt.compareSync(user.password, rows[0].password.replace(/^\$2y/, "$2a"))
                    if(checkakun){
                        const user = rows[0];
                        request.session.userId = user.id;
                        response.json({result: 'SUCCESS', userId: user.id});
                    }else {
                        response.json({result: 'ERROR', message: 'Indicated username or/and password are not correct.'});
                    }      

                });
        }
        response.status(201).json({result: 'ERROR', message: 'Indicated username or/and password are not correct.'});
    });
      
    app.get('/user/logout', async (request, response) => {
        if (request.session.userId) {
            delete request.session.userId;
            response.json({result: 'SUCCESS'});
        } else {
            response.json({result: 'ERROR', message: 'User is not logged in.'});
        }
    });

    app.get('/home/sales/data', async (request, response) => {
        if (!request.session.userId) {
            response.json({result: 'ERROR', message: 'User is not logged in.'});
        }

        const querySql = 'SELECT sales.id as id, products.name as name, sales.qty as qty FROM sales INNER JOIN products ON products.id = sales.id WHERE sales.user_id = ?';
        koneksi.query(querySql, request.session.userId, (err, rows, field) => {
            if (err) {
                return res.status(500).json({ message: 'Ada kesalahan', error: err });
            }
            res.status(200).json({ success: true, data: rows });
        });
    });

    
};

module.exports = {
    createRestApi
};

