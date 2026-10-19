import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useStore } from './store.jsx';
import { rs } from './data.js';
import { createProperty, getMyProperties, getAdminProperties, deleteProperty, setPropertyApproval, updateProperty, uploadPropertyPhotos } from './services/propertyService';

export const LISTING_FEE = 2500;

export function Login() {
  const { login } = useStore();
  const nav = useNavigate();
  const loc = useLocation();
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async e => {
    e.preventDefault(); setErr(''); setBusy(true);
    const data = Object.fromEntries(new FormData(e.currentTarget));
    try { await login(data.email, data.password); nav(loc.state?.from || '/dashboard', { replace: true }); }
    catch (error) { setErr(error.message); }
    finally { setBusy(false); }
  };
  return <div className="wrap narrow"><h1>Sign in</h1>
    <form className="panel" onSubmit={submit}>
      <label>Email<input name="email" type="email" required autoComplete="email" /></label>
      <label>Password<input name="password" type="password" required autoComplete="current-password" /></label>
      {err && <p role="alert" className="err">{err}</p>}
      <button className="btn" disabled={busy}>{busy ? 'Signing in...' : 'Sign in'}</button>
      <p className="meta">New here? <Link className="link" to="/register">Create an account</Link></p>
    </form>
  </div>;
}

export function Register() {
  const { register } = useStore();
  const nav = useNavigate();
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async e => {
    e.preventDefault(); setErr(''); setBusy(true);
    const data = Object.fromEntries(new FormData(e.currentTarget));
    try { await register(data); nav('/dashboard', { replace: true }); }
    catch (error) { setErr(error.message); }
    finally { setBusy(false); }
  };
  return <div className="wrap narrow"><h1>Create your account</h1>
    <form className="panel" onSubmit={submit}>
      <label>Full name<input name="name" required autoComplete="name" /></label>
      <label>Email<input name="email" type="email" required autoComplete="email" /></label>
      <label>Password<input name="password" type="password" minLength="8" required autoComplete="new-password" /></label>
      <fieldset className="roles"><legend>I want to</legend>
        <label><input type="radio" name="role" value="CUSTOMER" defaultChecked /> Buy or rent property</label>
        <label><input type="radio" name="role" value="OWNER" /> List my own property</label>
      </fieldset>
      {err && <p className="err" role="alert">{err}</p>}
      <button className="btn" disabled={busy}>{busy ? 'Creating...' : 'Create account'}</button>
    </form>
  </div>;
}

const MAX_PHOTOS = 5;
const MAX_SIZE = 5 * 1024 * 1024;
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export function PostAd() {
  const nav = useNavigate();
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [previews, setPreviews] = useState([]);

  useEffect(() => {
    const urls = photos.map(file => URL.createObjectURL(file));
    setPreviews(urls);
    return () => urls.forEach(url => URL.revokeObjectURL(url));
  }, [photos]);

  const addPhotos = e => {
    const selected = Array.from(e.target.files || []);
    e.target.value = '';
    setErr('');
    if (photos.length + selected.length > MAX_PHOTOS) {
      setErr('Maximum 5 photos per property.');
      return;
    }
    if (selected.some(file => !IMAGE_TYPES.includes(file.type))) {
      setErr('Only JPG, PNG or WebP photos are allowed.');
      return;
    }
    if (selected.some(file => file.size > MAX_SIZE)) {
      setErr('Each photo must be 5 MB or smaller.');
      return;
    }
    setPhotos(old => [...old, ...selected]);
  };

  const submit = async e => {
    e.preventDefault();
    if (busy) return;
    if (photos.length === 0) { setErr('Please select at least one property photo.'); return; }
    setErr(''); setBusy(true);
    const d = Object.fromEntries(new FormData(e.currentTarget));
    const property = {
      title: d.title, description: d.description, price: Number(d.price), location: d.city,
      propertyType: d.type, listingType: d.purpose, bedrooms: Number(d.beds),
      bathrooms: Number(d.baths), land: Number(d.land), area: Number(d.area),
      amenities: d.amenities.split(',').map(a => a.trim()).filter(Boolean)
    };
    try {
      // Upload first: if Cloudinary fails, no empty property listing is created.
      const images = await uploadPropertyPhotos(photos);
      if (!images.length) throw new Error('No images returned from image upload.');
      property.images = images.map(image => image.url);
      property.image = property.images[0];
      await createProperty(property);
      nav('/my-listings');
    } catch (error) {
      setErr(`${error.message}. Property was not submitted. Please try again.`);
    } finally { setBusy(false); }
  };

  return <div className="wrap narrow"><h1>Post a property ad</h1>
    <p className="meta">Your property is submitted for admin approval. Online listing payment is not implemented yet.</p>
    <form className="panel" onSubmit={submit}>
      <label>Ad title<input name="title" required maxLength="80" /></label>
      <div className="two-col">
        <label>Purpose<select name="purpose"><option value="Sale">Sell</option><option value="Rent">Rent out</option></select></label>
        <label>Type<select name="type"><option>House</option><option>Apartment</option><option>Land</option><option>Commercial</option></select></label>
        <label>Price (Rs.)<input name="price" type="number" min="1" required /></label>
        <label>City<input name="city" required /></label>
        <label>Bedrooms<input name="beds" type="number" min="0" defaultValue="0" /></label>
        <label>Bathrooms<input name="baths" type="number" min="0" defaultValue="0" /></label>
        <label>Land (perches)<input name="land" type="number" min="0" defaultValue="0" /></label>
        <label>Floor area (sq ft)<input name="area" type="number" min="0" defaultValue="0" /></label>
      </div>
      <label>Amenities (comma-separated)<input name="amenities" placeholder="Garden, Solar, Parking" /></label>
      <label>Description<textarea name="description" rows="4" required /></label>
      <label>Property photos (up to 5, 5 MB each)
        <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={addPhotos} disabled={busy || photos.length === MAX_PHOTOS} />
      </label>
      <p className="meta">Selected: {photos.length} / {MAX_PHOTOS} photos</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 12, marginBottom: 16 }}>
        {photos.map((file, i) => <div key={`${file.name}-${i}`}>
          {previews[i] && <img src={previews[i]} alt={`Preview ${i + 1}`} style={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: 10 }} />}
          <button type="button" className="btn sm ghost" disabled={busy} onClick={() => setPhotos(old => old.filter((_, index) => index !== i))}>Remove</button>
        </div>)}
      </div>
      {err && <p className="err" role="alert">{err}</p>}
      <button className="btn" disabled={busy}>{busy ? 'Uploading photos and saving...' : 'Submit for approval'}</button>
    </form>
  </div>;
}

export function Payment() {
  return <div className="wrap narrow"><div className="panel"><h1>Payment not enabled</h1>
    <p>Online payment is not connected in this version. Property listings are submitted directly for admin review.</p>
    <Link className="btn" to="/my-listings">My listings</Link>
  </div></div>;
}

export function MyListings() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(true);
  const load = async () => { try { setItems(await getMyProperties()); setError(''); } catch (e) { setError(e.message); } finally { setBusy(false); } };
  useEffect(() => { load(); }, []);
  const remove = async id => {
    if (!window.confirm('Delete this property permanently?')) return;
    try { await deleteProperty(id); await load(); } catch (e) { setError(e.message); }
  };
  const edit = async item => {
    const title = window.prompt('Update property title:', item.title);
    if (title === null || !title.trim()) return;
    try { await updateProperty(item._id, { title: title.trim() }); await load(); }
    catch (e) { setError(e.message); }
  };
  return <div className="wrap"><div className="row"><h1>My listings</h1><Link className="btn" to="/post-ad">Post a new ad</Link></div>
    {busy && <p>Loading...</p>}{error && <p role="alert" className="err">{error}</p>}
    {!busy && !items.length && <p className="empty">You have not posted any properties yet.</p>}
    {!!items.length && <div className="scroll"><table><thead><tr><th>Title</th><th>Price</th><th>Approval</th><th>Actions</th></tr></thead><tbody>
      {items.map(item => <tr key={item._id}><td>{item.title}</td><td>{rs(item.price)}</td>
        <td>{item.approvalStatus || 'Legacy'}</td><td className="acts"><button type="button" className="btn sm ghost" onClick={() => edit(item)}>Edit title</button>{' '}
        <button type="button" className="btn sm ghost" onClick={() => remove(item._id)}>Delete</button></td></tr>)}
    </tbody></table></div>}
    <p className="meta">Editing a property sends it back for approval.</p>
  </div>;
}

export function Admin() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(true);
  const load = async () => { try { setItems(await getAdminProperties()); setError(''); } catch (e) { setError(e.message); } finally { setBusy(false); } };
  useEffect(() => { load(); }, []);
  const review = async (id, status) => {
    try { await setPropertyApproval(id, status); await load(); }
    catch (e) { setError(e.message); }
  };
  const pending = items.filter(p => p.approvalStatus === 'Pending');
  return <div className="wrap"><h1>Admin — Property approvals</h1>
    <p className="meta">Total properties: {items.length} · Pending: {pending.length} · Approved: {items.filter(p => p.approvalStatus === 'Approved').length}</p>
    {busy && <p>Loading...</p>}{error && <p className="err" role="alert">{error}</p>}
    {!busy && !pending.length && <p className="empty">No properties waiting for review.</p>}
    {!!pending.length && <div className="scroll"><table><thead><tr><th>Title</th><th>Owner</th><th>Price</th><th>Actions</th></tr></thead><tbody>
      {pending.map(p => <tr key={p._id}><td>{p.title}</td><td>{p.owner?.email || 'Unassigned'}</td><td>{rs(p.price)}</td>
        <td className="acts"><button className="btn sm" onClick={() => review(p._id, 'Approved')}>Approve</button>{' '}
        <button className="btn sm ghost" onClick={() => review(p._id, 'Rejected')}>Reject</button></td></tr>)}
    </tbody></table></div>}
    <small>Approval is moderation of a listing, not proof of property ownership. Legacy properties remain visible unless separately reviewed.</small>
  </div>;
}
