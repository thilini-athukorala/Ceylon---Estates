import { useState, useMemo , useEffect  } from 'react'
import { getProperties } from './services/propertyService'
import { Routes, Route, Link, NavLink, useParams, useNavigate, Navigate } from 'react-router-dom'
import {  rs } from './data.js'
import { useStore } from './store.jsx'
import { Login, Register, PostAd, Payment, MyListings, Admin } from './pages.jsx'
import { Menu, X, Building2 } from 'lucide-react'
import './dashboard.css'
import './inquiry.css'
import { MyInquiries, ReceivedInquiries } from './InquiryPages.jsx'
import { sendInquiry } from './services/inquiryService'

function Photo({ p, tall }) {
  const images = (p.images || []).filter(Boolean);
  const [active, setActive] = useState(0);
  const cover = images[active] || images[0];
  return (
    <div>
      <div className={'photo' + (tall ? ' tall' : '')} style={{ '--h': p.hue, overflow: 'hidden', position: 'relative' }} role="img" aria-label={p.title}>
        {cover && <img src={cover} alt={p.title} loading="lazy" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />}
        <span style={{ position: 'relative', zIndex: 1 }}>{p.type}</span>
      </div>
      {tall && images.length > 1 && (
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12 }}>
          {images.map((url, i) => (
            <button type="button" key={url + i} onClick={() => setActive(i)} aria-label={`Show photo ${i + 1}`} aria-pressed={active === i} style={{ padding: 0, border: active === i ? '3px solid #16818a' : '2px solid #ddd', borderRadius: 8, overflow: 'hidden', cursor: 'pointer' }}>
              <img src={url} alt={`Property photo ${i + 1}`} style={{ display: 'block', width: 80, height: 65, objectFit: 'cover' }} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function formatProperty(p) {
  return {
    id: p._id,
    title: p.title,
    type: p.propertyType,
    purpose: p.listingType,
    price: p.price,
    city: p.location,
    beds: p.bedrooms,
    baths: p.bathrooms,
    land: p.land || 0,
    area: p.area || 0,
    furnished: p.furnished || false,
    parking: p.parking || false,
    amenities: p.amenities || [],
    hue: 190,
    description: p.description,
    image: p.image,
    images: Array.isArray(p.images) && p.images.length ? p.images : (p.image ? [p.image] : []),
  }
}

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

function Home({ properties }) {
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

function Listings({ properties , favs, toggleFav, cmp, toggleCmp }) {
  const init = new URLSearchParams(location.search)
  const [f, setF] = useState({ q: init.get('q') || '', purpose: init.get('purpose') || '', type: '', beds: 0, max: '', sort: 'new' })
  const set = k => e => setF({ ...f, [k]: e.target.value })
  const list = useMemo(() => properties
    .filter(p => (!f.q || (p.title + p.city).toLowerCase().includes(f.q.toLowerCase())) && (!f.purpose || p.purpose === f.purpose) && (!f.type || p.type === f.type) && p.beds >= +f.beds && (!f.max || p.price <= +f.max))
    .sort((a, b) => f.sort === 'low' ? a.price - b.price : f.sort === 'high' ? b.price - a.price : 0), [f, properties])
   console.log("Listings properties:", properties)

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

function Details({ properties, favs, toggleFav }) {
  const { id } = useParams();
  const p = properties.find(x => String(x.id) === String(id));
  const { user } = useStore();
  const [sent, setSent] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const submit = kind => async e => {
    e.preventDefault();
    if (!p) return;
    const form = e.currentTarget;
    setSent(''); setError(''); setSending(true);
    const values = Object.fromEntries(new FormData(form));
    try {
      await sendInquiry({ propertyId: p.id, message: kind === 'VIEWING' ? `I would like to request a viewing of ${p.title}.` : values.message, kind,
        ...(kind === 'VIEWING' ? { viewingDate: values.date, viewingTime: values.time } : {}) });
      setSent(kind === 'VIEWING' ? 'Viewing request sent to owner.' : 'Inquiry sent to owner.');
      form.reset();
    } catch (err) { setError(err.message); }
    finally { setSending(false); }
  };
  if (!p) return <div className="wrap"><p className="empty">This listing is no longer available.</p></div>;
  return <div className="wrap detail"><Photo p={p} tall />
    <div className="layout"><div><span className="tag">For {p.purpose.toLowerCase()}</span><h1>{p.title}</h1>
      <p className="price big">{rs(p.price)}</p>
      <ul className="specs"><li><b>{p.beds || '-'}</b> Bedrooms</li><li><b>{p.baths || '-'}</b> Bathrooms</li><li><b>{p.land}</b> Perches</li><li><b>{p.area || '-'}</b> sq ft</li></ul>
      <h2>Amenities</h2><p>{p.amenities.join(', ') || 'Not specified'}</p>
      <button className="btn ghost" onClick={() => toggleFav(p.id)}>{favs.includes(p.id) ? 'Saved' : 'Save to favourites'}</button>
    </div><aside className="panel">
      {!user ? <p><Link className="link" to="/login">Sign in</Link> as a customer to request a viewing or send an inquiry.</p> : user.role?.toUpperCase() !== 'CUSTOMER' ? <p>Only customer accounts can send inquiries.</p> : <>
        {sent && <p className="ok" role="status">{sent} <Link to="/my-inquiries">View my inquiries</Link></p>}
        {error && <p role="alert" className="err">{error}</p>}
        <form onSubmit={submit('VIEWING')}><h3>Request a viewing</h3>
          <label>Date<input type="date" name="date" required min={new Date().toISOString().slice(0,10)} /></label>
          <label>Time<input type="time" name="time" required /></label><button className="btn" disabled={sending}>Request viewing</button></form>
        <form onSubmit={submit('INQUIRY')}><h3>Send an inquiry</h3>
          <label>Message<textarea name="message" required rows="3" maxLength="2000" /></label><button className="btn ghost" disabled={sending}>Send inquiry</button></form>
      </>}
    </aside></div></div>;
}

function Compare({ properties, cmp }) {
  const items = properties.filter(p => cmp.includes(p.id));

  const rows = [
    ['Price', p => rs(p.price)],
    ['Location', p => p.city],
    ['Type', p => p.type],
    ['Bedrooms', p => p.beds],
    ['Bathrooms', p => p.baths],
    ['Land (perches)', p => p.land],
    ['Floor area (sq ft)', p => p.area || '-'],
    ['Furnished', p => p.furnished ? 'Yes' : 'No'],
    ['Parking', p => p.parking ? 'Yes' : 'No'],
    ['Amenities', p => p.amenities.join(', ') || 'Not specified']
  ];

  return (
    <div className="wrap">
      <h1>Compare properties</h1>

      {items.length < 2 ? (
        <p className="empty">
          Choose 2 or 3 properties on the listings page
          to compare them here.
        </p>
      ) : (
        <div className="compare-table-container">
          <table className="compare-table">
            <thead>
              <tr>
                <th>Features</th>

                {items.map(p => (
                  <th key={p.id}>
                    <span className="compare-property-title">
                      {p.title}
                    </span>
                    <div className="compare-property-location">
                      📍 {p.city}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {rows.map(([label, getValue]) => (
                <tr key={label}>
                  <th scope="row">{label}</th>

                  {items.map(p => (
                    <td
                      key={p.id}
                      className={
                        label === 'Price'
                          ? 'compare-price'
                          : ''
                      }
                    >
                      {getValue(p)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
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


// Frontend navigation guard (backend API permissions must also be enforced).
function RoleGuard({ roles, children }) {
  const { user } = useStore()
  if (!user) return <Navigate to="/login" replace />
  if (!roles.includes(user.role?.toUpperCase())) return <Navigate to="/dashboard" replace />
  return children
}

function Dashboard() {
  const { user } = useStore()
  if (!user) return <Navigate to="/login" replace />

  const sections = {
    ADMIN: {
      title: 'Admin Dashboard', subtitle: 'Manage the Ceylon Estates platform',
      links: [
        { icon: '🏠', title: 'Manage Properties', desc: 'Review and manage listings', to: '/admin' },
        { icon: '👥', title: 'Administration', desc: 'Open the admin management page', to: '/admin' },
        { icon: '🔎', title: 'Browse Properties', desc: 'See all public properties', to: '/properties' },
      ],
    },
    OWNER: {
      title: 'Property Owner Dashboard', subtitle: 'Manage your real estate listings',
      links: [
        { icon: '➕', title: 'Add Property', desc: 'Create a new property listing', to: '/post-ad' },
        { icon: '🏡', title: 'My Listings', desc: 'View your listings', to: '/my-listings' },
        { icon: '✉️', title: 'Customer Inquiries', desc: 'Read and reply to customers', to: '/received-inquiries' },
      ],
    },
    CUSTOMER: {
      title: 'Customer Dashboard', subtitle: 'Discover your next home in Sri Lanka',
      links: [
        { icon: '🏠', title: 'Browse Properties', desc: 'Search available properties', to: '/properties' },
        { icon: '⚖️', title: 'Compare Properties', desc: 'Compare selected listings', to: '/compare' },
        { icon: '✉️', title: 'My Inquiries', desc: 'See owner replies', to: '/my-inquiries' },
      ],
    },
  }
  const section = sections[user.role?.toUpperCase()]
  if (!section) return <div className="wrap"><p>Unknown account role. Please sign in again.</p></div>

  return (
    <div className="ce-dashboard">
      <div className="ce-dashboard-head">
        <p>Welcome back, {user.name}!</p>
        <h1>{section.title}</h1>
        <p>{section.subtitle}</p>
      </div>
      <div className="ce-dashboard-grid">
        {section.links.map(item => (
          <Link key={item.title} to={item.to} className="ce-dashboard-card">
            <span className="ce-dashboard-icon" aria-hidden="true">{item.icon}</span>
            <h2>{item.title}</h2>
            <p>{item.desc}</p>
            <span className="ce-dashboard-open">Open section →</span>
          </Link>
        ))}
      </div>
    </div>
  )
}

function Navbar({ user, logout, cmpCount }) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
   <header className="premium-navbar">
      <Link to="/" className="premium-logo">
        <Building2 size={28} />
        <span>CEYLON <strong>ESTATES</strong></span>
      </Link>

      <button
        className="mobile-menu-btn"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle navigation"
        aria-expanded={menuOpen}
      >
        {menuOpen ? <X /> : <Menu />}
      </button>

      <nav className={`premium-nav-links ${menuOpen ? 'open' : ''}`}
           onClick={() => setMenuOpen(false)}>
        <NavLink to="/" end>Home</NavLink>
        <NavLink to="/properties">Properties</NavLink>
        <NavLink to="/compare">Compare ({cmpCount})</NavLink>
        <NavLink to="/calculator">Calculator</NavLink>

        {user && <NavLink to="/dashboard">Dashboard</NavLink>}

        {user?.role?.toUpperCase() === 'OWNER' && (
          <>
            <NavLink to="/my-listings">My Listings</NavLink>
            <NavLink to="/post-ad">Post Property</NavLink>
            <NavLink to="/received-inquiries">Inquiries</NavLink>
          </>
        )}

        {user?.role?.toUpperCase() === 'CUSTOMER' && <NavLink to="/my-inquiries">My Inquiries</NavLink>}

        {user?.role?.toUpperCase() === 'ADMIN' && (
          <NavLink to="/admin">Admin</NavLink>
        )}

        {user ? (
          <>
            <span className="nav-username">{user.name}</span>
            <button className="nav-outline-btn" onClick={logout}>
              Sign Out
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login">Sign In</NavLink>
            <Link to="/register" className="nav-primary-btn">
              Get Started
            </Link>
          </>
        )}
      </nav>
    </header>
  )
}

export default function App() {
  const [propertiesData, setPropertiesData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
   getProperties()
  .then((data) => {
    const formattedData = data.map(formatProperty)
    setPropertiesData(formattedData)
  })
      .catch((error) => {
        console.error("API Error:", error)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  const { user, logout } = useStore()

  const [favs, setFavs] = useState([]); const [cmp, setCmp] = useState([])
  const toggleFav = id => setFavs(f => f.includes(id) ? f.filter(x => x !== id) : [...f, id])
  const toggleCmp = id => setCmp(c => c.includes(id) ? c.filter(x => x !== id) : c.length < 3 ? [...c, id] : c)
  return (
    <>
    <Navbar
  user={user}
  logout={logout}
  cmpCount={cmp.length}
/>
     
      <main>
        <Routes>
          <Route path="/" element={<Home properties={propertiesData} />} />
          <Route
  path="/properties"
  element={
    <Listings
      properties={propertiesData}
      favs={favs}
      toggleFav={toggleFav}
      cmp={cmp}
      toggleCmp={toggleCmp}
      
    />
  }
/>
          <Route
  path="/properties/:id"
  element={
    <Details
      properties={propertiesData}
      {...{ favs, toggleFav }}
    />
  }
/>
          <Route
  path="/compare"
  element={<Compare properties={propertiesData} cmp={cmp} />}
/>
          <Route path="/calculator" element={<Calculator />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/post-ad" element={<RoleGuard roles={['OWNER']}><PostAd /></RoleGuard>} />
          <Route path="/pay/:id" element={<RoleGuard roles={['OWNER']}><Payment /></RoleGuard>} />
          <Route path="/my-listings" element={<RoleGuard roles={['OWNER']}><MyListings /></RoleGuard>} />
          <Route path="/my-inquiries" element={<RoleGuard roles={['CUSTOMER']}><MyInquiries /></RoleGuard>} />
          <Route path="/received-inquiries" element={<RoleGuard roles={['OWNER']}><ReceivedInquiries /></RoleGuard>} />
          <Route path="/admin" element={<RoleGuard roles={['ADMIN']}><Admin /></RoleGuard>} />
        </Routes>
      </main>
      <footer className="foot">Ceylon Estates. Listing approval does not prove legal ownership.</footer>
    </>
  )
}
