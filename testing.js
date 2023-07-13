const koneksi = require('./backend/database');
const querySql = 'SELECT id,password FROM users WHERE email= ? LIMIT 1';
koneksi.query(querySql, "frengkyputra@yahoo.com", (err, rows, field) => {
    if (err) {
        console.log(err)
    }
        console.log(rows[0].id)


});
