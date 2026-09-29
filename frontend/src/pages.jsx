import { useState } from 'react'
import { Link, useNavigate, useLocation, useParams } from 'react-router-dom'
import { useStore } from './store.jsx'
import { rs } from './data.js'

export const LISTING_FEE = 2500
const home = u => u.role === 'seller' ? '/my-listings' : u.role === 'admin' ? '/admin' : '/properties'

export function Login() {
  const { login } = useStore(); const nav = useNavigate(); const loc = useLocation(); const [err, setErr] = useState('')
  const submit = e => { e.preventDefault(); const em = new FormData(e.target).get('email')
    if (login(em)) nav(loc.state?.from || '/properties'); else setErr('No account found for that email. Create one first.') }
  return (
    <div className="wrap narrow"><h1>Sign in</h1>
      <form className="panel" onSubmit={submit}>
        <label>Email<input name="email" type="email" required autoComplete="email" /></label>
        <label>Password<input name="password" type="password" required autoComplete="current-password" /></label>
        {err && <p role="alert" className="err">{err}</p>}
        <button className="btn">Sign in</button>
        <p className="meta">New here? <Link className="link" to="/register">Create an account</Link></p>
      </form>
    </div>
  )
}

export function Register() {
  const { register } = useStore(); const nav = useNavigate(); const [err, setErr] = useState('')
  const submit = e => { e.preventDefault(); const d = Object.fromEntries(new FormData(e.target))
    if (register(d)) nav(d.role === 'seller' ? '/post-ad' : '/properties'); else setErr('An account with this email already exists. Sign in instead.') }
  return (
    <div className="wrap narrow"><h1>Create your account</h1>
      <form className="panel" onSubmit={submit}>
        <label>Full name<input name="name" required autoComplete="name" /></label>
        <label>Email<input name="email" type="email" required autoComplete="email" /></label>
        <label>Password<input name="password" type="password" required minLength="8" autoComplete="new-password" /></label>
        <fieldset className="roles"><legend>I want to</legend>
          <label><input type="radio" name="role" value="buyer" defaultChecked /> Buy or rent a property</label>
          <label><input type="radio" name="role" value="seller" /> Sell or let my property</label>
        </fieldset>
        {err && <p role="alert" className="err">{err}</p>}
        <button className="btn">Create account</button>
      </form>
    </div>
  )
}

export function PostAd() {
  const { addAd } = useStore(); const nav = useNavigate()
  const submit = e => { e.preventDefault(); const d = Object.fromEntries(new FormData(e.target))
    const id = addAd({ ...d, price: +d.price, beds: +d.beds, baths: +d.baths, land: +d.land, area: +d.area, amenities: d.amenities.split(',').map(s => s.trim()).filter(Boolean) })
    nav(`/pay/${id}`) }
  return (
    <div className="wrap narrow"><h1>Post a property ad</h1>
      <p className="meta">Fill in the details, then pay the listing fee of {rs(LISTING_FEE)}. An admin reviews your ad before it goes live.</p>
      <form className="panel" onSubmit={submit}>
        <label>Ad title<input name="title" required maxLength="80" /></label>
        <div className="two-col">
          <label>Purpose<select name="purpose"><option value="Sale">Sell</option><option value="Rent">Rent out</option></select></label>
          <label>Type<select name="type"><option>House</option><option>Apartment</option><option>Land</option></select></label>
          <label>Price (Rs.)<input name="price" type="number" min="1" required /></label>
          <label>City<input name="city" required /></label>
          <label>Bedrooms<input name="beds" type="number" min="0" defaultValue="0" /></label>
          <label>Bathrooms<input name="baths" type="number" min="0" defaultValue="0" /></label>
          <label>Land (perches)<input name="land" type="number" min="0" defaultValue="0" /></label>
          <label>Floor area (sq ft)<input name="area" type="number" min="0" defaultValue="0" /></label>
        </div>
        <label>Amenities (separate with commas)<input name="amenities" placeholder="Garden, Solar, Parking" /></label>
        <label>Description<textarea name="description" rows="4" /></label>
        <button className="btn">Continue to payment</button>
      </form>
    </div>
  )
}

export function Payment() {
  const { ads, user, setStatus } = useStore(); const ad = ads.find(a => a.id === +useParams().id)
  const [done, setDone] = useState(false)
  if (!ad || ad.ownerEmail !== user.email) return <div className="wrap"><p className="empty">We could not find this ad in your account.</p></div>
  const pay = e => { e.preventDefault(); e.target.reset(); setStatus(ad.id, 'Pending approval'); setDone(true) } // demo: nothing is charged or stored
  if (done || ad.status !== 'Awaiting payment') return (
    <div className="wrap narrow"><div className="panel"><h1>Payment received</h1><p>Your ad "{ad.title}" is now waiting for admin approval.</p><Link className="btn" to="/my-listings">Go to my listings</Link></div></div>)
  return (
    <div className="wrap narrow"><h1>Pay listing fee</h1>
      <div className="panel"><p className="meta">Ad</p><p><b>{ad.title}</b></p><p className="meta">Total</p><p className="price big">{rs(LISTING_FEE)}</p>
        <form onSubmit={pay}>
          <label>Name on card<input required autoComplete="cc-name" /></label>
          <label>Card number<input required inputMode="numeric" autoComplete="cc-number" pattern="[0-9 ]{13,19}" /></label>
          <div className="two-col"><label>Expiry (MM/YY)<input required autoComplete="cc-exp" pattern="[0-9]{2}/[0-9]{2}" /></label><label>CVC<input required inputMode="numeric" autoComplete="cc-csc" pattern="[0-9]{3,4}" /></label></div>
          <button className="btn">Pay {rs(LISTING_FEE)}</button>
        </form>
        <small>Demo checkout: no real payment is made. In production, use a hosted gateway such as PayHere or Stripe so card details never touch your server.</small>
      </div>
    </div>
  )
}

export function MyListings() {
  const { ads, user } = useStore(); const mine = ads.filter(a => a.ownerEmail === user.email)
  return (
    <div className="wrap"><div className="row"><h1>My listings</h1><Link className="btn" to="/post-ad">Post a new ad</Link></div>
      {!mine.length ? <p className="empty">You have not posted any ads yet. Post your first property to reach buyers.</p> :
        <div className="scroll"><table><thead><tr><th>Title</th><th>Price</th><th>Status</th><th /></tr></thead>
          <tbody>{mine.map(a => <tr key={a.id}><td>{a.title}</td><td>{rs(a.price)}</td><td><span className={'badge ' + a.status.split(' ')[0].toLowerCase()}>{a.status}</span></td>
            <td>{a.status === 'Awaiting payment' && <Link className="link" to={`/pay/${a.id}`}>Pay now</Link>}</td></tr>)}</tbody></table></div>}
    </div>
  )
}

export function Admin() {
  const { ads, setStatus } = useStore(); const queue = ads.filter(a => a.status === 'Pending approval')
  return (
    <div className="wrap"><h1>Review ads</h1>
      {!queue.length ? <p className="empty">No ads are waiting for review.</p> :
        <div className="scroll"><table><thead><tr><th>Title</th><th>Seller</th><th>Price</th><th /></tr></thead>
          <tbody>{queue.map(a => <tr key={a.id}><td>{a.title}</td><td>{a.ownerEmail}</td><td>{rs(a.price)}</td>
            <td className="acts"><button className="btn sm" onClick={() => setStatus(a.id, 'Published')}>Approve</button> <button className="btn sm ghost" onClick={() => setStatus(a.id, 'Rejected')}>Reject</button></td></tr>)}</tbody></table></div>}
      <small>Approval checks the ad, not legal ownership.</small>
    </div>
  )
}
