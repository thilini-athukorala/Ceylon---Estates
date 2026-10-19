import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyInquiries, getReceivedInquiries, replyToInquiry } from './services/inquiryService';

export function MyInquiries() {
 const [items,setItems]=useState([]), [error,setError]=useState(''), [loading,setLoading]=useState(true);
 useEffect(()=>{getMyInquiries().then(setItems).catch(e=>setError(e.message)).finally(()=>setLoading(false));},[]);
 return <div className="wrap"><h1>My inquiries</h1>{loading && <p>Loading...</p>}{error && <p role="alert" className="err">{error}</p>}{!loading && !items.length && !error && <p className="empty">No inquiries yet. <Link to="/properties">Explore properties</Link></p>}
 <div className="ce-inquiry-list">{items.map(item=><article className="panel" key={item._id}><h3>{item.property?.title || 'Property unavailable'}</h3><p className="meta">{item.kind==='VIEWING' ? `Viewing: ${item.viewingDate} ${item.viewingTime}` : 'General inquiry'} · {new Date(item.createdAt).toLocaleString()}</p><p>{item.message}</p><hr/><b>Owner reply:</b><p>{item.reply || 'Awaiting a reply'}</p></article>)}</div></div>;
}
export function ReceivedInquiries() {
 const [items,setItems]=useState([]),[error,setError]=useState(''),[loading,setLoading]=useState(true),[busy,setBusy]=useState('');
 useEffect(()=>{getReceivedInquiries().then(setItems).catch(e=>setError(e.message)).finally(()=>setLoading(false));},[]);
 const submit=async(e,id)=>{e.preventDefault();setError('');setBusy(id);const reply=new FormData(e.currentTarget).get('reply');try{const updated=await replyToInquiry(id,reply);setItems(previous=>previous.map(x=>x._id===id?{...x,reply:updated.reply,repliedAt:updated.repliedAt}:x));}catch(err){setError(err.message);}finally{setBusy('');}};
 return <div className="wrap"><h1>Customer inquiries</h1>{loading && <p>Loading...</p>}{error && <p role="alert" className="err">{error}</p>}{!loading && !items.length && !error && <p className="empty">No customer inquiries yet.</p>}
 <div className="ce-inquiry-list">{items.map(item=><article className="panel" key={item._id}><h3>{item.property?.title || 'Property unavailable'}</h3><p className="meta">From: {item.customer?.name || 'Customer'} ({item.customer?.email || 'email unavailable'}) · {new Date(item.createdAt).toLocaleString()}</p><p className="meta">{item.kind === 'VIEWING' ? `Viewing requested: ${item.viewingDate} ${item.viewingTime}` : 'General inquiry'}</p><p>{item.message}</p><form onSubmit={e=>submit(e,item._id)}><label>Reply<textarea name="reply" rows="3" maxLength="2000" required defaultValue={item.reply}/></label><button className="btn" disabled={busy===item._id}>{busy===item._id?'Saving...':'Send reply'}</button>{item.repliedAt && <p className="ok">Last reply saved</p>}</form></article>)}</div></div>;
}
