const checkForToken = () => {
  const params = new URLSearchParams(window.location.search);
  const logoutParam = params.get("logout"); // Gets the value of the "name" parameter
  if (logoutParam) {
    removeParam("logout");
    toastr.success("Logged out successfully", "", { timeOut: 1000 });
  }
  const registerParam = params.get("register"); // Gets the value of the "name" parameter
  if (registerParam) {
    removeParam("register");
    toastr.success("Registration successful", "", { timeOut: 1000 });
  }
  const token = localStorage.getItem("token");
  if (token && !window.location.href.includes("index.html")) {
    window.location.href = "index.html";
  }
  if (!token && window.location.href.includes("index.html")) {
    window.location.href = "login.html";
  }
};

const doLogout = () => {
  localStorage.setItem("token", "");
  // alert('Logged out successfully...')
  window.location.href = "login.html?logout=success";
};
