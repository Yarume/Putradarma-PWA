(function() {
    function init() {
        if ('serviceWorker' in navigator) {
            const onSuccessRegister = (registration) => console.log("SW Register Success: ", registration.scope)
            const onErrorRegister = (error) => console.log("SW Register Error: ",error)

            navigator.serviceWorker.register('/sw.js')
                .then(onSuccessRegister)
                .catch(onErrorRegister)
        } else console.log('Your browser do not support service worker')

        

        axios.post('http://localhost/auth/login', {
            email: 'admin@admin.com',
            password: 'password'
            })
            .then(function (response) {
            console.log(response);
            })
            .catch(function (error) {
            console.log(error);
            });
    }
    window.onload = init
})()