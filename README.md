# Xynexa Server

The **Xynexa Server** is the backend component of the **Xynexa Team Collaboration Tool**. It provides RESTful APIs, real-time socket connections, authentication, database management, payment handling, and integration with third-party services like Stripe, Clerk, and 100ms.

---

## 🚀 Features

* RESTful API with Express.js
* MongoDB integration using Mongoose
* Authentication with JWT & Clerk
* Real-time communication using Socket.IO
* Payment handling using Stripe
* Environment variable support with `dotenv`
* Role-based access & secure routing
* Time tracking, task management, and more

---

## 💠 Tech Stack

* **Runtime:** Node.js
* **Framework:** Express.js
* **Database:** MongoDB (via Mongoose)
* **Authentication:** JWT & Clerk SDK
* **Real-time:** Socket.IO
* **Payment:** Stripe
* **Others:** UUID, Axios, CORS, dotenv, bcryptjs

---

## 📦 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/mdabdulkyum1/xynexa-server.git
cd xynexa-server
```

### 2. Install Dependencies

```bash
npm install
```

---

## 🔐 Environment Variables

Create a `.env` file in the root directory with the following keys:

```env
PORT=5000
MONGODB_URI=your-mongodb-uri

JWT_SECRET=your-jwt-secret

STRIPE_SECRET_KEY=your-stripe-secret-key

CLERK_SECRET_KEY=your-clerk-secret-key

HMS_TEMPLATE_ID=your-hms-template-id
HMS_MANAGEMENT_TOKEN=your-hms-management-token

CLIENT_URL=http://localhost:3000
```

> ⚠️ **Warning**: Never commit your `.env` file. Keep all secret keys secure and private.

---

## ▶️ Running the Server

```bash
npm start
```

The server will start on [http://localhost:5000](http://localhost:5000)

---

## 📁 Project Structure

```
xynexa-server/
├── index.js
├── routes/
├── controllers/
├── models/
├── middleware/
├── utils/
└── .env
```

---

## 📡 API & Real-time

* REST APIs handle all CRUD operations for tasks, users, messages, etc.
* Socket.IO powers real-time messaging and notifications.

---

## 🧪 Testing

You can use tools like **Postman** or **Thunder Client** to test API endpoints.

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create your branch: `git checkout -b feature/feature-name`
3. Commit your changes: `git commit -m "Add new feature"`
4. Push to the branch: `git push origin feature/feature-name`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for more details.

---

## 📬 Contact

For any queries or issues, feel free to contact [kyummdabdul@gmail.com](mailto:kyummdabdul@gmail.com) or open an issue in the repository.
