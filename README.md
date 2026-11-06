FASTBITE — Restaurant Ordering Platform

FASTBITE is a full-stack restaurant ordering platform built with React, TypeScript, Node.js, Express, and PostgreSQL. It provides separate interfaces for customers, restaurant staff, and administrators.

Features

Customer

- Browse the restaurant menu and products.
- View menu of products.
- Add products to the shopping cart.
- Proceed to checkout.
- View orders and order details.

Restaurant Staff

- Access the staff dashboard.
- View and manage staff-related information.
- Access a staff profile.

Administrator

- Access the admin dashboard.
- Manage products.
- Manage restaurant staff and add new staff members.
- View and manage orders.
- View order details.
- Manage restaurant tables.
- Access an admin profile.

Authentication and Access Control

- Login and registration pages.
- Role-based access control for customers, staff, and administrators.
- Protected routes based on user roles.

Tech Stack

Frontend

- React
- TypeScript
- React Router
- Axios
- Vite

Backend

- Node.js
- Express.js
- PostgreSQL

Project Structure

The frontend application is located inside the "fast_food" directory.

frontend/
├── .gitignore
└── fast_food/
├── public/
├── src/
│ ├── api/
│ ├── components/
│ ├── context/
│ ├── pages/
│ ├── App.tsx
│ └── ...
├── package.json
└── vite.config.ts

Getting Started

Prerequisites

- Node.js
- npm
- A running instance of the FASTBITE backend

Installation

Clone the frontend repository:

git clone https://github.com/Ssiiiam/FASTBITE-frontend.git
cd FASTBITE-frontend/fast_food

Install dependencies:

npm install

Environment Configuration

Create a ".env" file inside the "fast_food" directory and configure the backend API URL:

VITE_API_URL=http://localhost:3000/api

Make sure the frontend API client uses "VITE_API_URL" as its base URL.

Run the Development Server

npm run dev

Vite will display the local development URL in the terminal.

Available Scripts

Run these commands from the "fast_food" directory.

Command| Description
"npm run dev"| Starts the development server
"npm run build"| Checks TypeScript and builds the application
"npm run lint"| Runs ESLint
"npm run preview"| Previews the production build

Backend Repository

The backend is maintained in a separate repository:

"FASTBITE Backend" (https://github.com/Ssiiiam/FASTBITE-backend)

Project Status

FASTBITE is an ongoing project developed to practice and demonstrate full-stack web development, database integration, authentication, and role-based application design.

