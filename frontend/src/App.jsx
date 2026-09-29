import { useState, useMemo } from 'react'
import { Routes, Route, Link, NavLink, useParams, useNavigate } from 'react-router-dom'
import { properties, rs } from './data.js'
import { useStore, Guard } from './store.jsx'
import { Login, Register, PostAd, Payment, MyListings, Admin } from './pages.jsx'

const Photo = ({ p, tall }) => (
  <div className={'photo' + (tall ? ' tall' : '')} style={{ '--h': p.hue }} role="img" aria-label={p.title}>
    <span>{p.type}</span>
  </div>
)

function Card({ p, fav, toggleFav, cmp, toggleCmp }) {
  return (
    <article className="card">
      <Link to={`/properties/${p.id}`}><Photo p={p} /></Link>
      <div className="card-body">
        <div className="row"><span className="tag">For {p.purpose.toLowerCase()}</span>
          <button className={'icon' + (fav ? ' on' : '')} onClick={() => toggleFav(p.id)} aria-pressed={fav} aria-label="Save to favourites">♥</button></div>
        <h3><Link to={`/properties/${p.id}`}>{p.title}</Link></h3>
        <p className="price">{rs(p.price)}{p.purpose === 'Rent' && <small> / month</small>}</p>
        <p className="meta">{p.beds ? `${p.beds} bed, ${p.baths} bath` : `${p.land} perches`}</p>
        <label className="check"><input type="checkbox" checked={cmp} onChange={() => toggleCmp(p.id)} /> Compare</label>
      </div>
    </article>
  )
}

function Home() {
  const nav = useNavigate()
  const [purpose, setPurpose] = useState('Sale'); const [q, setQ] = useState('')
  return (
    <>
      <section className="hero">
        <div className="hero-in">
          <h1>Find the home that fits your life in Sri Lanka.</h1>
          <p>Search, compare and book viewings for houses, apartments and land, straight from the owner or agent.</p>
          <form className="search" onSubmit={e => { e.preventDefault(); nav(`/properties?purpose=${purpose}&q=${q}`) }}>
            <div className="seg" role="tablist">{['Sale', 'Rent'].map(x => <button type="button" key={x} className={purpose === x ? 'on' : ''} onClick={() => setPurpose(x)}>{x === 'Sale' ? 'Buy' : 'Rent'}</button>)}</div>
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="City or keyword, e.g. Galle" aria-label="Search location" />
            <button className="btn">Search properties</button>
          </form>
        </div>
      </section>
      <section className="wrap"><h2>Newly published</h2>
        <div className="grid">{properties.slice(0, 3).map(p => <Card key={p.id} p={p} toggleFav={() => {}} toggleCmp={() => {}} />)}</div>
        <p><Link className="link" to="/properties">Browse all properties</Link></p>
      </section>
    </>
  )
}

function Listings({ favs, toggleFav, cmp, toggleCmp }) {
  const init = new URLSearchParams(location.search)
  const [f, setF] = useState({ q: init.get('q') || '', purpose: init.get('purpose') || '', type: '', beds: 0, max: '', sort: 'new' })
  const set = k => e => setF({ ...f, [k]: e.target.value })
  const list = useMemo(() => properties
    .filter(p => (!f.q || (p.title + p.city).toLowerCase().includes(f.q.toLowerCase())) && (!f.purpose || p.purpose === f.purpose) && (!f.type || p.type === f.type) && p.beds >= +f.beds && (!f.max || p.price <= +f.max))
    .sort((a, b) => f.sort === 'low' ? a.price - b.price : f.sort === 'high' ? b.price - a.price : b.id - a.id), [f])
  return (
    <div className="wrap layout">
      <aside className="filters"><h2>Filters</h2>
        <label>Keyword or city<input value={f.q} onChange={set('q')} /></label>
        <label>Purpose<select value={f.purpose} onChange={set('purpose')}><option value="">Any</option><option value="Sale">Buy</option><option value="Rent">Rent</option></select></label>
        <label>Type<select value={f.type} onChange={set('type')}><option value="">Any</option><option>House</option><option>Apartment</option><option>Land</option></select></label>
        <label>Min. bedrooms<select value={f.beds} onChange={set('beds')}>{[0, 1, 2, 3, 4].map(n => <option key={n} value={n}>{n || 'Any'}</option>)}</select></label>
        <label>Max price (Rs.)<input type="number" value={f.max} onChange={set('max')} /></label>
        <label>Sort by<select value={f.sort} onChange={set('sort')}><option value="new">Newest</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option></select></label>
      </aside>
      <section><p className="meta">{list.length} properties</p>
        {list.length ? <div className="grid two">{list.map(p => <Card key={p.id} p={p} fav={favs.includes(p.id)} toggleFav={toggleFav} cmp={cmp.includes(p.id)} toggleCmp={toggleCmp} />)}</div>
          : <p className="empty">No properties match these filters. Try a wider price range or fewer filters.</p>}
      </section>
    </div>
  )
}

function Details({ favs, toggleFav }) {
  const p = properties.find(x => x.id === +useParams().id)
  const [sent, setSent] = useState(''); const { user } = useStore()
  if (!p) return <div className="wrap"><p className="empty">This listing is no longer available.</p></div>
  const submit = kind => e => { e.preventDefault(); setSent(kind === 'view' ? 'Viewing requested. The owner will reply soon.' : 'Inquiry sent.') }
  return (
    <div className="wrap detail">
      <Photo p={p} tall />
      <div className="layout">
        <div>
          <span className="tag">For {p.purpose.toLowerCase()}</span><h1>{p.title}</h1>
          <p className="price big">{rs(p.price)}</p>
          <ul className="specs"><li><b>{p.beds || '-'}</b> Bedrooms</li><li><b>{p.baths || '-'}</b> Bathrooms</li><li><b>{p.land}</b> Perches</li><li><b>{p.area || '-'}</b> sq ft</li></ul>
          <h2>Amenities</h2><p>{p.amenities.join(', ')}</p>
          <button className="btn ghost" onClick={() => toggleFav(p.id)}>{favs.includes(p.id) ? 'Saved' : 'Save to favourites'}</button>
        </div>
        <aside className="panel">
          {!user ? <p><Link className="link" to="/login">Sign in</Link> to request a viewing or send an inquiry.</p> : sent ? <p role="status" className="ok">{sent}</p> : <>
            <form onSubmit={submit('view')}><h3>Request a viewing</h3>
              <label>Date<input type="date" required min={new Date().toISOString().slice(0, 10)} /></label>
              <label>Time<input type="time" required /></label><button className="btn">Request viewing</button></form>
            <form onSubmit={submit('inq')}><h3>Send an inquiry</h3>
              <label>Message<textarea required rows="3" /></label><button className="btn ghost">Send inquiry</button></form></>}
        </aside>
      </div>
    </div>
  )
}

function Compare({ cmp }) {
  const items = properties.filter(p => cmp.includes(p.id))
  const rows = [['Price', p => rs(p.price)], ['Location', p => p.city], ['Type', p => p.type], ['Bedrooms', p => p.beds], ['Bathrooms', p => p.baths], ['Land (perches)', p => p.land], ['Floor area (sq ft)', p => p.area || '-'], ['Furnished', p => p.furnished ? 'Yes' : 'No'], ['Parking', p => p.parking ? 'Yes' : 'No'], ['Amenities', p => p.amenities.join(', ')]]
  return (
    <div className="wrap"><h1>Compare properties</h1>
      {items.length < 2 ? <p className="empty">Choose 2 or 3 properties on the listings page to compare them here.</p> :
        <div className="scroll"><table><thead><tr><th />{items.map(p => <th key={p.id}>{p.title}</th>)}</tr></thead>
          <tbody>{rows.map(([l, fn]) => <tr key={l}><th>{l}</th>{items.map(p => <td key={p.id}>{fn(p)}</td>)}</tr>)}</tbody></table></div>}
    </div>
  )
}

function Calculator() {
  const [v, setV] = useState({ price: 30000000, down: 6000000, rate: 12, years: 20 })
  const set = k => e => setV({ ...v, [k]: +e.target.value })
  const loan = Math.max(v.price - v.down, 0), r = v.rate / 1200, n = v.years * 12
  const m = r ? loan * r / (1 - Math.pow(1 + r, -n)) : loan / n
  return (
    <div className="wrap narrow"><h1>Affordability calculator</h1>
      <div className="panel">
        {[['price', 'Property price (Rs.)'], ['down', 'Down payment (Rs.)'], ['rate', 'Interest rate (% per year)'], ['years', 'Loan period (years)']].map(([k, l]) => <label key={k}>{l}<input type="number" value={v[k]} onChange={set(k)} /></label>)}
        <p className="meta">Estimated loan</p><p className="price big">{rs(Math.round(loan))}</p>
        <p className="meta">Estimated monthly payment</p><p className="price big">{rs(Math.round(m || 0))}</p>
        <small>This is an estimate only. Your bank's offer may differ.</small>
      </div>
    </div>
  )
}

export default function App() {
  const { user, logout } = useStore()
  const [favs, setFavs] = useState([]); const [cmp, setCmp] = useState([])
  const toggleFav = id => setFavs(f => f.includes(id) ? f.filter(x => x !== id) : [...f, id])
  const toggleCmp = id => setCmp(c => c.includes(id) ? c.filter(x => x !== id) : c.length < 3 ? [...c, id] : c)
  return (
    <>
      <header className="nav"><Link to="/" className="logo">Ceylon Estates</Link>
        <nav><NavLink to="/properties">Properties</NavLink><NavLink to="/compare">Compare ({cmp.length})</NavLink><NavLink to="/calculator">Calculator</NavLink>
          {user?.role === 'seller' && <><NavLink to="/post-ad">Post an ad</NavLink><NavLink to="/my-listings">My listings</NavLink></>}
          {user?.role === 'admin' && <NavLink to="/admin">Review ads</NavLink>}
          {user ? <><span>{user.name}</span><button className="btn sm ghost" onClick={logout}>Sign out</button></> : <><Link to="/login">Sign in</Link><Link className="btn sm" to="/register">Register</Link></>}</nav></header>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/properties" element={<Listings {...{ favs, toggleFav, cmp, toggleCmp }} />} />
          <Route path="/properties/:id" element={<Details {...{ favs, toggleFav }} />} />
          <Route path="/compare" element={<Compare cmp={cmp} />} />
          <Route path="/calculator" element={<Calculator />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/post-ad" element={<Guard roles={['seller']}><PostAd /></Guard>} />
          <Route path="/pay/:id" element={<Guard roles={['seller']}><Payment /></Guard>} />
          <Route path="/my-listings" element={<Guard roles={['seller']}><MyListings /></Guard>} />
          <Route path="/admin" element={<Guard roles={['admin']}><Admin /></Guard>} />
        </Routes>
      </main>
      <footer className="foot">Ceylon Estates. Listing approval does not prove legal ownership.</footer>
    </>
  )
}
