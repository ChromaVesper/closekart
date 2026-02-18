# CLOSEKART - Hyperlocal Commerce Discovery Platform

CLOSEKART is a full-stack web application designed to help users discover local shops, products, and services in their vicinity. Inspired by major e-commerce platforms, it features a responsive UI, real-time location detection, and comprehensive search capabilities.

## Features

*   **Hyperlocal Discovery**: Find shops and products near you using geolocation.
*   **User Roles**: distinct features for Customers, Shopkeepers, and Admins.
*   **Search & Filtering**: diverse search options by category, price, and availability.
*   **Interactive Maps**: Google Maps integration for location context.
*   **Responsive Design**: Built with React and Tailwind CSS for a seamless mobile and desktop experience.

## Tech Stack

*   **Frontend**: React (Vite), Tailwind CSS, Lucide Icons, Google Maps API
*   **Backend**: Node.js, Express.js, MongoDB
*   **Authentication**: JWT (JSON Web Tokens)

## Getting Started

### Prerequisites

*   Node.js (v14 or higher)
*   MongoDB (Local instance or Atlas URI)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/ChromaVesper/closekart.git
    cd closekart
    ```

2.  **Backend Setup:**
    ```bash
    cd backend
    npm install
    # Create a .env file with MONGODB_URI, JWT_SECRET, and PORT
    node seed.js # Seed demo data
    npm start
    ```

3.  **Frontend Setup:**
    ```bash
    cd frontend
    npm install
    # Update src/contexts/LocationContext.jsx with your Google Maps API Key
    npm run dev
    ```

## License

MIT
