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
            return response.json({result: 'SUCCESS', message: 'BERHASIL'});
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
};

module.exports = {
    createRestApi
};

