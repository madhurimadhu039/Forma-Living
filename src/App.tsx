import { Routes, Route } from 'react-router-dom'
import { Layout, Protected } from './components/Layout'
import Home from './pages/Home'
import Shop from './pages/Shop'
import ProductPage from './pages/Product'
import Cart from './pages/Cart'
import Wishlist from './pages/Wishlist'
import Login from './pages/Login'
import About from './pages/About'
import Contact from './pages/Contact'
import Admin from './pages/Admin'

const Privacy = () => (
  <div className="mx-auto max-w-4xl px-4 py-16">
    <h1 className="font-sans font-bold text-3xl text-[#2B231D]">Privacy Policy</h1>
    <p className="mt-4 text-[#6E6359] leading-relaxed">
      Your privacy is respected at Forma Living. We collect only necessary details to fulfill your orders and personalize your design shopping experience. Your data is never sold or shared without your explicit consent.
    </p>
  </div>
)

const Terms = () => (
  <div className="mx-auto max-w-4xl px-4 py-16">
    <h1 className="font-sans font-bold text-3xl text-[#2B231D]">Terms &amp; Conditions</h1>
    <p className="mt-4 text-[#6E6359] leading-relaxed">
      Welcome to Forma Living. By accessing our platform, you agree to comply with our purchasing, delivery, and return policies. All furniture pieces are designed with high-quality sustainable craftsmanship.
    </p>
  </div>
)

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="shop" element={<Shop />} />
        <Route path="product/:id" element={<ProductPage />} />
        <Route path="cart" element={<Cart />} />
        <Route path="wishlist" element={<Wishlist />} />
        <Route path="login" element={<Login />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
        <Route path="privacy" element={<Privacy />} />
        <Route path="terms" element={<Terms />} />
        <Route path="admin" element={<Protected admin><Admin /></Protected>} />
      </Route>
    </Routes>
  )
}
