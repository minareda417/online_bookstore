import React, { useEffect } from 'react'
import Home from './pages/Home'
import AllBooks from './pages/AllBooks'
import Cart from './pages/Cart'
import Profile from './pages/Profile'
import Dashboard from './pages/Dashboard'
import Signup from './pages/Signup'
import Login from './pages/Login'
import Viewbookdetails from './pages/Viewbookdetails'
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Favourites from './components/Favourites'
import OrderHistory from './components/OrderHistory'
import Setting from './components/Setting'
import { useDispatch, useSelector } from 'react-redux'
import { login, changeRole } from './store/auth'
import AddBook from './components/AddBook'
import AddPublisher from './components/AddPublisher'
import AddCategory from './components/AddCategory'
import AddAuthor from './components/AddAuthor'
import AllOrders from './components/AllOrders'
import ReplenishmentOrders from './components/ReplenishmentOrders'
import UpdateBook from './pages/UpdateBook'
import AdminDashboard from './pages/AdminDashboard'
const App = () => {

  const role = useSelector((state) => (state.auth.role));
  const dispatch = useDispatch();
  useEffect(() => {

    if (localStorage.getItem("id") && localStorage.getItem("role")) {
      dispatch(login());
      dispatch(changeRole(localStorage.getItem("role")));
    }

  }, [])

  return (
    <>

      <Navbar />
      <Routes>
        <Route exact path='/' element={<Home />}></Route>
        <Route path='/allbooks' element={<AllBooks />}></Route>
        <Route path='/cart' element={<Cart />}></Route>
        <Route path='/profile' element={<Profile />}>
          {(role === "user") ? (<Route index element={<OrderHistory />}></Route>) : (<Route index element={<AllOrders />}></Route>)}
          {(role === "user") ? (<Route path='/profile/orderhistory' element={<OrderHistory />} />) : (<Route path='/profile/addbooks' element={<AddBook />} />)}
          {(role === "user") ? (<Route path='/profile/orderhistory' element={<OrderHistory />} />) : (<Route path='/profile/addcategory' element={<AddCategory />} />)}
          {(role === "user") ? (<Route path='/profile/orderhistory' element={<OrderHistory />} />) : (<Route path='/profile/addauthor' element={<AddAuthor />} />)}
          {(role === "user") ? (<Route path='/profile/orderhistory' element={<OrderHistory />} />) : (<Route path='/profile/addpublisher' element={<AddPublisher />} />)}
          <Route path='/profile/setting' element={<Setting />} />
        </Route>
        <Route path='/dashboard' element={<Dashboard />}>
          <Route index element={<AllOrders />}></Route>
          <Route path='/dashboard/replenishment' element={<ReplenishmentOrders />} />
          <Route path='/dashboard/addbooks' element={<AddBook />} />
          <Route path='/dashboard/addcategory' element={<AddCategory />} />
          <Route path='/dashboard/addauthor' element={<AddAuthor />} />
          <Route path='/dashboard/addpublisher' element={<AddPublisher />} />
          <Route path='/dashboard/setting' element={<Setting />} />
        </Route>
        <Route path='/signup' element={<Signup />}></Route>
        <Route path='/login' element={<Login />}></Route>
        <Route path='/updatebook/:id' element={<UpdateBook />}></Route>
        <Route path='/getdetails/:id' element={<Viewbookdetails />}></Route>
        <Route
          path='/admin/dashboard'
          element={role === "admin" ? <AdminDashboard /> : <Navigate to="/" />}
        />
      </Routes>
      <Footer />

    </>
  )
}

export default App


// // App.jsx
// import React from 'react';
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import Allbooks from './pages/AllBooks.jsx';
// import Home from './pages/Home.jsx';  // example home page
// import Cart from './pages/Cart.jsx';  // example cart page

// function App() {
//   return (
//     <Router>
//       <Routes>
//         {/* <Route path="/" element={<Home />} /> */}
//         <Route path="/books" element={<Allbooks />} />
//         {/* <Route path="/cart" element={<Cart />} /> */}
//         {/* add more routes as needed */}
//       </Routes>
//     </Router>
//   );
// }

// export default App;
