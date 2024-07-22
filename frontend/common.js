const checkForToken = () => {
    const token = localStorage.getItem('token');
    if (token && !window.location.href.includes('index.html')) {
        window.location.href = 'index.html';
    }
    if (!token && window.location.href.includes('index.html')) {
        window.location.href = 'login.html';
    }
}

const doLogout = () => {
    localStorage.setItem('token', '');
    alert('Logged out successfully...')
    window.location.href = 'login.html';


}