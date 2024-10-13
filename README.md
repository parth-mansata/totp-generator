# 🔑 TOTP Generator

**Description:**  
TOTP Generator is a self-hosted service that allows you to generate **Time-based One-Time Password (TOTP)** codes for any of your accounts. It comes with additional features like the ability to **edit or delete accounts**, customize account names and colors for easy identification, and ensure enhanced security by allowing you to hide or display the generated codes.

Just like popular password management tools (e.g., 1Password), you can **copy the generated TOTP code to the clipboard without viewing it**. The application is a web-based service that works seamlessly on both desktop and mobile devices, allowing you to manage your accounts from any device.

**🔒 Security Features:**
- Secret strings are stored encrypted in the database to avoid leaks.
- Decryption is only possible with the backend application’s decryption key.
- User authentication is secured with JWT, using email/password-based login.

**💻 Multi-device Support:**  
Run the service locally on a single device or host it on a Node.js server for multi-device access.

---

## ✨ Features
- 🔐 Generate TOTP codes for multiple accounts.
- ✏️ Edit or delete account entries.
- 🎨 Custom account names and colors for easy identification.
- 🛡️ Auto-hide codes for security and copy-to-clipboard functionality.
- 📱 Works across both desktop and mobile devices.
- 🔑 Encrypted storage of secret strings.
- 🔐 Secure user login with JWT authentication.

---

## ⚙️ Tech Stack
- **Backend:** Node.js, Express
- **Frontend:** HTML, CSS, JavaScript
- **Database:** MongoDB
- **Authentication:** JWT (JSON Web Tokens)

---

## 🚀 Setup Instructions

### Prerequisites
Ensure you have the following installed:
- Node.js (>= 18.x)
- MongoDB (>= 7.x)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/parth-mansata/totp-generator.git
   cd totp-generator
   ```

2. Install the required dependencies:
   ```bash
   npm install
   ```

3. Copy the example environment file:
   ```bash
   cp example.env .env
   ```

4. Update the `.env` file with your environment variables (such as database connection strings, JWT secret, etc.).

5. Start the application:
   ```bash
   node server.js
   ```

6. Access the application from your browser by visiting:
   ```bash
   http://localhost:PORT/index.html
   ```
   (Replace `PORT` with the port number specified in the `.env` file.)

7. To register users, visit:
   ```bash
   http://localhost:PORT/register.html
   ```

---

## 📖 Usage
- After registration, log in to start adding your accounts.
- You can generate TOTP codes for any account, customize their appearance, and copy the codes securely to your clipboard.

---

## 🤝 Contributing
Contributions are welcome!
1. Fork the repository.
2. Create a new feature branch.
3. Commit your changes.
4. Submit a pull request.

---

## 📜 License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.
