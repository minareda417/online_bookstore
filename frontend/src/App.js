import React, { useEffect } from 'react'
import Home from './pages/Home'
import AllBooks from './pages/AllBooks'
import Cart from './pages/Cart'
import Profile from './pages/Profile'
import Signup from './pages/Signup'
import Login from './pages/Login'
import Viewbookdetails from './pages/Viewbookdetails'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Favourites from './components/Favourites'
import OrderHistory from './components/OrderHistory'
import Setting from './components/Setting'
import { useDispatch, useSelector } from 'react-redux'
import { login, changeRole } from './store/auth'
import AddBook from './components/AddBook'
<<<<<<< HEAD
=======
import AddPublisher from './components/AddPublisher'
>>>>>>> baeb8237a11dd24355b5059105e4cef13204eff2
import AllOrders from './components/AllOrders'
import UpdateBook from './pages/UpdateBook'
const App = () => {

  const role = useSelector((state) => (state.auth.role));
  const dispatch = useDispatch();
  useEffect(() => {
<<<<<<< HEAD
    if (localStorage.getItem("id") && localStorage.getItem("role")) {
=======
    if (localStorage.getItem("id") && localStorage.getItem("token") && localStorage.getItem("role")) {
>>>>>>> baeb8237a11dd24355b5059105e4cef13204eff2
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

          {(role === "user") ? (<Route index element={<Favourites />}></Route>) : (<Route index element={<AllOrders />}></Route>)}
          {(role === "user") ? (<Route path='/profile/orderhistory' element={<OrderHistory />} />) : (<Route path='/profile/addbooks' element={<AddBook />} />)}
<<<<<<< HEAD

=======
          {(role === "user") ? (<Route path='/profile/orderhistory' element={<OrderHistory />} />) : (<Route path='/profile/addpublishers' element={<AddPublisher />} />)}
>>>>>>> baeb8237a11dd24355b5059105e4cef13204eff2
          <Route path='/profile/setting' element={<Setting />} />
        </Route>
        <Route path='/signup' element={<Signup />}></Route>
        <Route path='/login' element={<Login />}></Route>
        <Route path='/updatebook/:id' element={<UpdateBook />}></Route>
        <Route path='/getdetails/:id' element={<Viewbookdetails />}></Route>
      </Routes>
      <Footer />

    </>
  )
}

<<<<<<< HEAD
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
=======
export default App
>>>>>>> baeb8237a11dd24355b5059105e4cef13204eff2
