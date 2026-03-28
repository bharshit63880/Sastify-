# Sastify

Sastify is a full-stack e-commerce application with a React frontend and a Node.js/Express/MongoDB backend.

## Project Structure

```
Sastify/
├── backend/
│   ├── controllers/
│   ├── database/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── seed/
│   ├── utils/
│   ├── .env
│   ├── index.js
│   ├── package.json
│   └── vercel.json
├── frontend/
│   ├── public/
│   ├── src/
│   ├── .env
│   └── package.json
└── .gitignore
```

## Getting Started

### Prerequisites

- Node.js (v16+ recommended)
- npm or yarn
- MongoDB

### Backend Setup

1. Navigate to the backend directory:
    ```sh
    cd backend
    ```
2. Install dependencies:
    ```sh
    npm install
    ```
3. Create a `.env` file in the backend directory with the required environment variables (see `.gitignore` for sensitive files).
4. Start the backend server:
    ```sh
    npm run dev
    ```
5. (Optional) Seed the database:
    ```sh
    npm run seed
    ```

### Frontend Setup

1. Navigate to the frontend directory:
    ```sh
    cd frontend
    ```
2. Install dependencies:
    ```sh
    npm install
    ```
3. Create a `.env` file in the frontend directory if needed.
4. Start the frontend development server:
    ```sh
    npm start
    ```

## Features

- User authentication (signup, login, password reset)
- Product catalog and categories
- Shopping cart and wishlist
- Order placement and payment modes (COD, UPI, CARD)
- Address management
- Reviews and ratings
- Admin features (via isAdmin flag)

## Tech Stack

- **Frontend:** React, Material-UI, Framer Motion, Lottie
- **Backend:** Node.js, Express, MongoDB, Mongoose
- **Other:** JWT authentication, Nodemailer, dotenv

## Scripts

### Backend

- `npm run dev` - Start backend in development mode
- `npm run seed` - Seed the database

### Frontend

- `npm start` - Start frontend development server

## License

This project is licensed under the MIT License.

---

**Note:**  
Remember to add your own `.env` files in both `backend` and `frontend` directories with the necessary environment variables.
# Sastify-
