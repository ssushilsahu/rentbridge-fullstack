import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Search,
  MapPin,
  Home,
  Plus,
  User,
  Heart,
  ArrowLeft,
  BedDouble,
  Sofa,
  Phone,
  Star,
  ImagePlus,
  X,
  Bell
} from "lucide-react";
import "./styles.css";

const API = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:5000/api" : "/api");
const API_ORIGIN = API.replace(/\/api\/?$/, "");

function imageUrl(src) {
  return src?.startsWith("/") ? `${API_ORIGIN}${src}` : src;
}

const fallback = [
  {
    _id: "demo1",
    title: "Bright 2 BHK Apartment",
    type: "Apartment",
    rent: 12000,
    deposit: 24000,
    city: "Bhopal",
    area: "MP Nagar",
    address: "MP Nagar, Bhopal, Madhya Pradesh",
    bedrooms: 2,
    furnished: true,
    description:
      "A bright and comfortable apartment in a convenient location.",
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80"
    ],
    owner: { name: "Property Owner", email: "owner@example.com" }
  },
  {
    _id: "demo2",
    title: "Private Room Near College",
    type: "Room",
    rent: 6500,
    deposit: 13000,
    city: "Bhopal",
    area: "Kolar Road",
    address: "Kolar Road, Bhopal, Madhya Pradesh",
    bedrooms: 1,
    furnished: true,
    description:
      "Private furnished room suitable for students and working professionals.",
    images: [
      "https://images.unsplash.com/photo-1560185008-b033106af5c3?auto=format&fit=crop&w=1200&q=80"
    ],
    owner: { name: "Property Owner", email: "owner@example.com" }
  },
  {
    _id: "demo3",
    title: "Family House With Parking",
    type: "House",
    rent: 18000,
    deposit: 36000,
    city: "Indore",
    area: "Vijay Nagar",
    address: "Vijay Nagar, Indore, Madhya Pradesh",
    bedrooms: 3,
    furnished: false,
    description:
      "Spacious family house with parking and good connectivity.",
    images: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"
    ],
    owner: { name: "Property Owner", email: "owner@example.com" }
  }
];

function App() {
  const [properties, setProperties] = useState([]);
  const [loadError, setLoadError] = useState("");
  const [favorites, setFavorites] = useState(() => {
  try {
    return JSON.parse(localStorage.getItem("rentbridge-favorites")) || [];
  } catch {
    return [];
  }
});
function toggleFavorite(id) {
  setFavorites((current) => {
    const updated = current.includes(id)
      ? current.filter((item) => item !== id)
      : [...current, id];

    localStorage.setItem(
      "rentbridge-favorites",
      JSON.stringify(updated)
    );

    return updated;
  });
}
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [maxRent, setMaxRent] = useState("");
  const [view, setView] = useState("home");
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [user, setUser] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("rentbridge-user")) || null;
      return stored?.role === "tenant" ? { ...stored, role: "customer" } : stored;
    }
    catch { return null; }
  });

  async function load() {
    try {
      const params = new URLSearchParams();

      if (search) params.set("city", search);
      if (type) params.set("type", type);
      if (maxRent) params.set("maxRent", maxRent);

      const response = await fetch(`${API}/properties?${params}`);

      if (!response.ok) throw new Error("API error");

      const data = await response.json();
      setProperties(data);
      setLoadError("");
    } catch {
      if (import.meta.env.DEV) {
        setProperties(fallback.filter((p) =>
          (!search || `${p.city} ${p.area}`.toLowerCase().includes(search.toLowerCase())) &&
          (!type || p.type === type) && (!maxRent || p.rent <= Number(maxRent))
        ));
        setLoadError("Showing sample listings because the API is unavailable.");
      } else {
        setProperties([]);
        setLoadError("We couldn't load properties. Please try again shortly.");
      }
    }
  }

  useEffect(() => {
    load();
  }, []);

  function openProperty(property) {
    setSelectedProperty(property);
    setView("details");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goHome() {
    setSelectedProperty(null);
    setView("home");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="app">
      <header className="nav">
        <button className="brand" onClick={goHome}>
          <span className="logo">
            <Home size={20} />
          </span>
          Rent<span>Bridge</span>
        </button>

        <nav>
          <button onClick={goHome}>Find a Home</button>

          <button onClick={() => setView("post")}>
            <Plus size={17} />
            Post Property
          </button>

          {user && <button onClick={() => setView("mine")}>My listings</button>}

          {user && <NotificationsBell user={user} />}

          {user ? <button className="login" onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("rentbridge-user");
            setUser(null);
          }}>Sign out</button> : <button className="login" onClick={() => setView("login")}>
            <User size={17} /> Login
          </button>}
        </nav>
      </header>

      {view === "home" && (
        <>
          <section className="hero">
            <div className="hero-content">
              <div className="pill">
                <Home size={16} />
                Find a place that fits
              </div>

              <h1>
                Find a place you'll
                <br />
                <em>love to live.</em>
              </h1>

              <p>
                Discover rooms, apartments and houses for rent directly
                from property owners.
              </p>

              <div className="searchbox">
                <div>
                  <MapPin size={19} />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="City or area"
                  />
                </div>

                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  <option value="">Any property</option>
                  <option value="Room">Room</option>
                  <option value="Apartment">Apartment</option>
                  <option value="House">House</option>
                  <option value="PG">PG</option>
                </select>

                <input
                  className="rent-input"
                  value={maxRent}
                  onChange={(e) => setMaxRent(e.target.value)}
                  placeholder="Max rent ₹"
                />

                <button onClick={load}>
                  <Search size={19} />
                  Search
                </button>
              </div>
            </div>
          </section>

          <main className="content">
            <div className="section-head">
              <div>
                <p className="eyebrow">EXPLORE RENTALS</p>
                <h2>Homes waiting for you</h2>
              </div>

              <span>{properties.length} properties</span>
            </div>

            <div className="grid">
              {properties.map((property) => (
                <PropertyCard
  key={property._id}
  property={property}
  onView={() => openProperty(property)}
  isFavorite={favorites.includes(property._id)}
  onFavorite={() => toggleFavorite(property._id)}
/>
              ))}
            </div>
            {loadError && <p className="message" role="status">{loadError}</p>}
            {!loadError && properties.length === 0 && <p className="empty-results">No properties match your search yet.</p>}
          </main>
        </>
      )}

      {view === "details" && selectedProperty && (
        <PropertyDetails
          property={selectedProperty}
          onBack={goHome}
          user={user}
          onLogin={() => setView("login")}
        />
      )}

      {view === "post" && <PostProperty onPosted={() => { load(); goHome(); }} />}

      {view === "mine" && user && <MyListings onBack={goHome} />}

      {view === "login" && <Login onSuccess={(nextUser) => { setUser(nextUser); setView("home"); }} />}
      
      <footer>
        © 2026 RentBridge · Connecting owners and renters
      </footer>
    </div>
  );
}

function NotificationsBell({ user }) {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [busyId, setBusyId] = useState("");
  const [actionError, setActionError] = useState("");
  const token = localStorage.getItem("token");

  async function loadNotifications() {
    try {
      const response = await fetch(`${API}/notifications`, { headers: { Authorization: `Bearer ${token}` } });
      if (response.ok) setNotifications(await response.json());
    } catch { /* Keep the last notification state when offline. */ }
  }

  useEffect(() => {
    loadNotifications();
    const timer = window.setInterval(loadNotifications, 30000);
    return () => window.clearInterval(timer);
  }, [user.id]);

  async function togglePanel() {
    const willOpen = !open;
    setOpen(willOpen);
    if (willOpen) {
      await fetch(`${API}/notifications/read-all`, { method: "PATCH", headers: { Authorization: `Bearer ${token}` } }).catch(() => {});
      setNotifications((current) => current.map((notification) => ({ ...notification, isRead: true })));
    }
  }

  async function respond(notification, decision) {
    setBusyId(notification._id);
    setActionError("");
    try {
      const response = await fetch(`${API}/contact-requests/${notification.contactRequest}/respond`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ decision })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Could not update the request.");
      await loadNotifications();
    } catch (error) { setActionError(error.message || "Could not reach the server."); }
    finally { setBusyId(""); }
  }

  const unread = notifications.filter((notification) => !notification.isRead).length;
  return <div className="notification-wrap">
    <button className="notification-trigger" type="button" aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`} aria-expanded={open} onClick={togglePanel}>
      <Bell size={18} /> <span>Notifications</span>{unread > 0 && <span className="notification-count">{unread > 9 ? "9+" : unread}</span>}
    </button>
    {open && <section className="notification-panel" aria-label="Notifications">
      <div className="notification-panel-head"><strong>Notifications</strong><button type="button" onClick={() => setOpen(false)} aria-label="Close notifications">×</button></div>
      {actionError && <p className="upload-error" role="alert">{actionError}</p>}
      {!notifications.length && <p className="notification-empty">You’re all caught up.</p>}
      {notifications.map((notification) => <article className={`notification-item${notification.isRead ? "" : " unread"}`} key={notification._id}>
        <p>{notification.message}</p>
        {notification.kind === "interest" && <div className="notification-actions">
          <button type="button" disabled={busyId === notification._id} onClick={() => respond(notification, "accepted")}>Accept</button>
          <button type="button" className="decline-action" disabled={busyId === notification._id} onClick={() => respond(notification, "declined")}>Decline</button>
        </div>}
        {notification.kind === "accepted" && notification.contactEmail && <a className="notification-email" href={`mailto:${notification.contactEmail}?subject=${encodeURIComponent(`Enquiry about ${notification.property?.title || "a rental listing"}`)}`}>Email the poster</a>}
        {notification.kind === "accepted" && notification.contactAddress && <p className="notification-private-address">Exact address: {notification.contactAddress}</p>}
        <time>{new Date(notification.createdAt).toLocaleString()}</time>
      </article>)}
    </section>}
  </div>;
}

function PropertyCard({
  property,
  onView,
  isFavorite,
  onFavorite
}) {
  const image =
    imageUrl(property.images?.[0]) ||
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=900&q=80";

  return (
    <article className="card">
      <div className="photo">
        <img src={image} alt={property.title} />

        <button
  className={isFavorite ? "heart favorite" : "heart"}
  onClick={(e) => {
    e.stopPropagation();
    onFavorite();
  }}
  aria-label={
    isFavorite
      ? "Remove from favorites"
      : "Add to favorites"
  }
>
  <Heart
    size={18}
    fill={isFavorite ? "currentColor" : "none"}
  />
</button>

        <span className="tag">{property.type}</span>
      </div>

      <div className="cardbody">
        <div className="price">
          ₹{Number(property.rent || 0).toLocaleString()}
          <small> / month</small>
        </div>

        <h3>{property.title}</h3>

        <p className="location">
          <MapPin size={15} />
          {property.area}, {property.city}
        </p>

        <div className="meta">
          <span>{property.bedrooms || 1} Bed</span>

          <span>
            {property.furnished ? "Furnished" : "Unfurnished"}
          </span>
          <button onClick={onView}>
            
            View details →
          </button>
        </div>
      </div>
    </article>
  );
}

function PropertyDetails({ property, onBack, user, onLogin }) {
  const [activeImage, setActiveImage] = useState(0);
  const [requestMessage, setRequestMessage] = useState("");
  const [requestBusy, setRequestBusy] = useState(false);

  async function requestContact() {
    const token = localStorage.getItem("token");
    if (!token || !user) {
      onLogin();
      return;
    }
    setRequestBusy(true);
    setRequestMessage("");
    try {
      const response = await fetch(`${API}/contact-requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ propertyId: property._id })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Could not send your request.");
      setRequestMessage(result.message);
    } catch (error) { setRequestMessage(error.message || "Could not reach the server."); }
    finally { setRequestBusy(false); }
  }

  const images =
    property.images?.length > 0
      ? property.images.map(imageUrl)
      : [
          "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80"
        ];

  return (
    <main className="details-page">
      <button className="back-button" onClick={onBack}>
        <ArrowLeft size={18} />
        Back to properties
      </button>

      <div className="details-gallery">
        <div className="main-image">
          <img
            src={images[activeImage]}
            alt={property.title}
          />
        </div>

        {images.length > 1 && (
          <div className="thumbnail-row">
            {images.map((image, index) => (
              <button
                key={index}
                className={
                  activeImage === index
                    ? "thumbnail active"
                    : "thumbnail"
                }
                onClick={() => setActiveImage(index)}
              >
                <img src={image} alt={`Property ${index + 1}`} />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="details-layout">
        <section className="details-main">
          <div className="detail-tag">{property.type}</div>

          <h1>{property.title}</h1>

          <p className="detail-location">
            <MapPin size={18} />
            {property.area}, {property.city}
          </p>

          <div className="property-features">
            <div>
              <BedDouble size={22} />
              <span>
                <strong>{property.bedrooms || 1}</strong>
                <small>Bedrooms</small>
              </span>
            </div>

            <div>
              <Sofa size={22} />
              <span>
                <strong>
                  {property.furnished ? "Furnished" : "Unfurnished"}
                </strong>
                <small>Furnishing</small>
              </span>
            </div>
          </div>

          <section className="detail-section">
            <h2>About this property</h2>

            <p>
              {property.description ||
                "No description has been provided by the owner."}
            </p>
          </section>

          <section className="detail-section">
            <h2>Address</h2>
            <p>The exact address is shared privately if the poster accepts your contact request.</p>
          </section>

          <section className="detail-section">
            <h2>Ratings & reviews</h2>

            <div className="review-empty">
              <Star size={30} />
              <h3>No reviews yet</h3>
              <p>
                Customer ratings and reviews will appear here after
                renters share their experience.
              </p>
            </div>
          </section>
        </section>

        <aside className="details-sidebar">
          <div className="rent-box">
            <p>Monthly rent</p>

            <h2>
              ₹{Number(property.rent || 0).toLocaleString()}
              <small>/month</small>
            </h2>

            <div className="deposit">
              Security deposit:
              <strong>
                ₹{Number(property.deposit || 0).toLocaleString()}
              </strong>
            </div>

            <button className="contact-button" type="button" onClick={requestContact} disabled={requestBusy}>
              <Phone size={18} />
              {requestBusy ? "Sending request…" : "Request to contact"}
            </button>
            {requestMessage && <p className="contact-feedback" role="status">{requestMessage}</p>}
          </div>

          <div className="owner-box">
            <p className="eyebrow">PROPERTY OWNER</p>

            <div className="owner">
              <div className="owner-avatar">
                {(property.owner?.name || "O")
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div>
                <h3>
                  {property.owner?.name || "Property Owner"}
                </h3>

                <p>Contact details are shared after your request is accepted.</p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

function PostProperty({ onPosted }) {
  const [form, setForm] = useState({
    title: "",
    type: "Room",
    rent: "",
    deposit: "",
    city: "",
    area: "",
    address: "",
    bedrooms: 1,
    description: ""
  });

  const [msg, setMsg] = useState("");
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [imageError, setImageError] = useState("");

  useEffect(() => {
    const previews = selectedImages.map((file) => ({ file, url: URL.createObjectURL(file) }));
    setImagePreviews(previews);
    return () => previews.forEach(({ url }) => URL.revokeObjectURL(url));
  }, [selectedImages]);

  function change(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  }

  function chooseImages(e) {
    const incoming = Array.from(e.target.files || []);
    const accepted = incoming.filter((file) => ["image/jpeg", "image/png", "image/webp"].includes(file.type) && file.size <= 5 * 1024 * 1024);
    const room = Math.max(0, 5 - selectedImages.length);
    setSelectedImages((current) => [...current, ...accepted.slice(0, room)]);
    setImageError(accepted.length !== incoming.length ? "Use JPG, PNG, or WebP images up to 5 MB each." : incoming.length > room ? "You can add up to 5 photos." : "");
    e.target.value = "";
  }

  async function submit(e) {
    e.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      setMsg("Sign in to publish a property.");
      return;
    }

    const body = new FormData();
    Object.entries({ ...form, rent: Number(form.rent), deposit: Number(form.deposit || 0), bedrooms: Number(form.bedrooms) })
      .forEach(([key, value]) => body.append(key, value));
    selectedImages.forEach((file) => body.append("images", file));

    try {
      const response = await fetch(`${API}/properties`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body
      });
      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        setMsg(result.message || "Could not post property.");
        return;
      }
      onPosted();
    } catch {
      setMsg("Could not reach the server. Check your connection and try again.");
    }
  }

  return (
    <main className="formpage">
      <p className="eyebrow">FOR PROPERTY OWNERS</p>

      <h2>Post your property</h2>

      <p className="sub">
        Reach people actively looking for a rental.
      </p>

      <form onSubmit={submit} className="form">
        <input
          name="title"
          placeholder="Property title"
          required
          onChange={change}
        />

        <div className="twocol">
          <select name="type" onChange={change}>
            <option>Room</option>
            <option>Apartment</option>
            <option>House</option>
            <option>PG</option>
          </select>

          <input
            name="rent"
            type="number"
            placeholder="Monthly rent ₹"
            required
            onChange={change}
          />
        </div>

        <div className="twocol">
          <input
            name="deposit"
            type="number"
            placeholder="Security deposit ₹"
            onChange={change}
          />

          <input
            name="bedrooms"
            type="number"
            min="1"
            placeholder="Bedrooms"
            onChange={change}
          />
        </div>

        <div className="twocol">
          <input
            name="city"
            placeholder="City"
            required
            onChange={change}
          />

          <input
            name="area"
            placeholder="Area / locality"
            required
            onChange={change}
          />
        </div>

        <input
          name="address"
          placeholder="Full address"
          required
          onChange={change}
        />

        <section className="image-upload-section">
          <div>
            <strong>Property photos</strong>
            <p className="upload-hint">Add up to 5 JPG, PNG, or WebP photos. Maximum 5 MB each.</p>
          </div>
          <label className="image-picker">
            <ImagePlus size={19} />
            <span>Add photos</span>
            <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={chooseImages} disabled={selectedImages.length >= 5} />
          </label>
          {imageError && <p className="upload-error" role="alert">{imageError}</p>}
          {!!imagePreviews.length && <div className="image-preview-grid">
            {imagePreviews.map(({ file, url }, index) => <div className="image-preview" key={`${file.name}-${index}`}>
              <img src={url} alt={`Selected property photo ${index + 1}`} />
              <button type="button" aria-label={`Remove ${file.name}`} onClick={() => setSelectedImages((current) => current.filter((_, itemIndex) => itemIndex !== index))}><X size={16} /></button>
            </div>)}
          </div>}
        </section>

        <textarea
          name="description"
          placeholder="Describe the property..."
          onChange={change}
        />

        <button className="primary">
          Publish Property
        </button>

        {msg && <p className="message">{msg}</p>}
      </form>
    </main>
  );
}

function MyListings({ onBack }) {
  const [listings, setListings] = useState([]);
  const [editing, setEditing] = useState(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const token = localStorage.getItem("token");

  async function loadMine() {
    try {
      const response = await fetch(`${API}/properties/mine`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not load your listings.");
      setListings(data);
    } catch (error) { setMessage(error.message || "Could not reach the server."); }
    finally { setLoaded(true); }
  }

  useEffect(() => { loadMine(); }, []);

  async function saveEdit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const payload = { ...editing, rent: Number(editing.rent), deposit: Number(editing.deposit || 0), bedrooms: Number(editing.bedrooms) };
      const response = await fetch(`${API}/properties/${editing._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not save changes.");
      setEditing(null);
      setMessage("Listing updated.");
      await loadMine();
    } catch (error) { setMessage(error.message || "Could not reach the server."); }
    finally { setBusy(false); }
  }

  async function deleteListing(property) {
    if (!window.confirm(`Delete “${property.title}”? This cannot be undone.`)) return;
    try {
      const response = await fetch(`${API}/properties/${property._id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not delete listing.");
      setListings((current) => current.filter((item) => item._id !== property._id));
      setMessage("Listing deleted.");
    } catch (error) { setMessage(error.message || "Could not reach the server."); }
  }

  return <main className="content owner-listings">
    <button className="back-button" onClick={onBack}><ArrowLeft size={18} /> Back to homes</button>
    <p className="eyebrow">OWNER DASHBOARD</p>
    <h2>My listings</h2>
    {message && <p className="message" role="status">{message}</p>}
    {!loaded && <p>Loading your listings…</p>}
    {loaded && !message && !listings.length && <div className="empty-listings"><h3>No listings yet</h3><p>Post your first property to see it here.</p></div>}
    <div className="owner-listing-stack">
      {listings.map((property) => <article className="owner-listing" key={property._id}>
        <img src={imageUrl(property.images?.[0]) || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=500&q=80"} alt={property.title} />
        <div className="owner-listing-info"><span className="detail-tag">{property.type}</span><h3>{property.title}</h3><p>{property.area}, {property.city} · ₹{Number(property.rent).toLocaleString()}/month</p>
          <div className="owner-listing-actions"><button type="button" onClick={() => { setEditing({ ...property }); setMessage(""); }}>Edit listing</button><button type="button" className="danger-action" onClick={() => deleteListing(property)}>Delete</button></div>
        </div>
      </article>)}
    </div>
    {editing && <form className="form owner-edit-form" onSubmit={saveEdit}>
      <div className="section-head"><h3>Edit listing</h3><button type="button" className="switch" onClick={() => setEditing(null)}>Cancel</button></div>
      <input required value={editing.title || ""} placeholder="Property title" onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
      <div className="twocol"><select value={editing.type} onChange={(e) => setEditing({ ...editing, type: e.target.value })}><option>Room</option><option>Apartment</option><option>House</option><option>PG</option></select><input required type="number" min="0" value={editing.rent} placeholder="Monthly rent" onChange={(e) => setEditing({ ...editing, rent: e.target.value })} /></div>
      <div className="twocol"><input type="number" min="0" value={editing.deposit ?? 0} placeholder="Deposit" onChange={(e) => setEditing({ ...editing, deposit: e.target.value })} /><input type="number" min="1" value={editing.bedrooms ?? 1} placeholder="Bedrooms" onChange={(e) => setEditing({ ...editing, bedrooms: e.target.value })} /></div>
      <div className="twocol"><input required value={editing.city || ""} placeholder="City" onChange={(e) => setEditing({ ...editing, city: e.target.value })} /><input required value={editing.area || ""} placeholder="Area" onChange={(e) => setEditing({ ...editing, area: e.target.value })} /></div>
      <input required value={editing.address || ""} placeholder="Full address" onChange={(e) => setEditing({ ...editing, address: e.target.value })} />
      <textarea value={editing.description || ""} placeholder="Description" onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
      <button className="primary" disabled={busy}>{busy ? "Saving…" : "Save changes"}</button>
    </form>}
  </main>;
}

function Login({ onSuccess }) {
  const [mode, setMode] = useState("login");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "customer"
  });

  const [msg, setMsg] = useState("");

  async function submit(e) {
    e.preventDefault();
    try {
      const response = await fetch(`${API}/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("rentbridge-user", JSON.stringify(data.user));
        onSuccess(data.user);
      } else setMsg(data.message || "Something went wrong.");
    } catch {
      setMsg("Could not reach the server. Check your connection and try again.");
    }
  }

  return (
    <main className="formpage narrow">
      <p className="eyebrow">WELCOME TO RENTBRIDGE</p>

      <h2>
        {mode === "login"
          ? "Welcome back"
          : "Create your account"}
      </h2>

      <form onSubmit={submit} className="form">
        {mode === "register" && (
          <input
            placeholder="Full name"
            maxLength={80}
            onChange={(e) =>
              setForm({
                ...form,
                name: e.target.value
              })
            }
            required
          />
        )}

        <input
          type="email"
          placeholder="Email"
          maxLength={254}
          onChange={(e) =>
            setForm({
              ...form,
              email: e.target.value
            })
          }
          required
        />

        <input
          type="password"
          placeholder="Password"
          minLength={mode === "register" ? 12 : undefined}
          maxLength={128}
          onChange={(e) =>
            setForm({
              ...form,
              password: e.target.value
            })
          }
          required
        />

        {mode === "register" && (
          <select
            onChange={(e) =>
              setForm({
                ...form,
                role: e.target.value
              })
            }
          >
            <option value="customer">
              Customer — browse, rent, and post properties
            </option>

            <option value="owner">
              Owner — manage and post properties
            </option>
          </select>
        )}

        <button className="primary">
          {mode === "login"
            ? "Login"
            : "Create account"}
        </button>

        {msg && <p className="message">{msg}</p>}

        <button
          type="button"
          className="switch"
          onClick={() =>
            setMode(
              mode === "login"
                ? "register"
                : "login"
            )
          }
        >
          {mode === "login"
            ? "New here? Create an account"
            : "Already have an account? Login"}
        </button>
      </form>
    </main>
  );
}

createRoot(
  document.getElementById("root")
).render(<App />);

