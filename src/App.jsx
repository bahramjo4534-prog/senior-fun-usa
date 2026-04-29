import { useEffect, useMemo, useState } from "react";
import Papa from "papaparse";
import "./App.css";

const DATA_URL = "/data/senior-fun-listings.csv";
const SUBMIT_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSdbXYVCo02FVyqYorIT236XG515b_R-z6zmc0OJobuiHXQdKQ/viewform?usp=publish-editor";

function clean(value) {
  return value && value.trim() ? value.trim() : "Not listed";
}

function App() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [city, setCity] = useState("All");
  const [county, setCounty] = useState("All");
  const [selectedListing, setSelectedListing] = useState(null);

  useEffect(() => {
    async function loadListings() {
      try {
        const response = await fetch(DATA_URL);
        const csvText = await response.text();

        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (result) => {
            const cleaned = result.data
              .filter((row) => row["Listing Title"])
              .map((row, index) => ({
                id: index + 1,
                title: clean(row["Listing Title"]),
                category: clean(row["Category"]),
                city: clean(row["City"]),
                county: clean(row["County"]),
                state: clean(row["State"]),
                country: clean(row["Country"]),
                shortDescription: clean(row["Short Description"]),
                fullDescription: clean(row["Full Description"]),
                address: clean(row["Address"]),
                phone: clean(row["Phone"]),
                email: clean(row["Email"]),
                website: clean(row["Website"]),
                price: clean(row["Price"]),
                schedule: clean(row["Schedule / Hours"]),
                seniorDiscount: clean(row["Senior Discount"]),
                dementiaFriendly: clean(row["Dementia-Friendly?"]),
                caregiverFriendly: clean(row["Caregiver-Friendly?"]),
                wheelchairAccessible: clean(row["Wheelchair Accessible?"]),
                transportationAvailable: clean(row["Transportation Available?"]),
                tags: clean(row["Tags"]),
                slug: clean(row["Slug"]),
                sourceUrl: clean(row["Source URL"]),
                lastUpdated: clean(row["Last Updated"]),
              }));

            setListings(cleaned);
            setLoading(false);
          },
          error: () => {
            setLoading(false);
          },
        });
      } catch (error) {
        console.error("Could not load listings:", error);
        setLoading(false);
      }
    }

    loadListings();
  }, []);

  const categories = useMemo(() => {
    return ["All", ...new Set(listings.map((item) => item.category).sort())];
  }, [listings]);

  const cities = useMemo(() => {
    return ["All", ...new Set(listings.map((item) => item.city).sort())];
  }, [listings]);

  const counties = useMemo(() => {
    return ["All", ...new Set(listings.map((item) => item.county).sort())];
  }, [listings]);

  const filteredListings = useMemo(() => {
    const searchText = search.toLowerCase();

    return listings.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchText) ||
        item.city.toLowerCase().includes(searchText) ||
        item.county.toLowerCase().includes(searchText) ||
        item.category.toLowerCase().includes(searchText) ||
        item.tags.toLowerCase().includes(searchText) ||
        item.shortDescription.toLowerCase().includes(searchText);

      const matchesCategory = category === "All" || item.category === category;
      const matchesCity = city === "All" || item.city === city;
      const matchesCounty = county === "All" || item.county === county;

      return matchesSearch && matchesCategory && matchesCity && matchesCounty;
    });
  }, [listings, search, category, city, county]);

  const stats = useMemo(() => {
    const seniorCenters = listings.filter((item) => item.category === "Senior Center").length;
    const transportation = listings.filter((item) => item.transportationAvailable === "Yes").length;
    const dementiaFriendly = listings.filter((item) => item.dementiaFriendly === "Yes").length;
    const citiesCovered = new Set(listings.map((item) => item.city)).size;

    return {
      total: listings.length,
      seniorCenters,
      transportation,
      dementiaFriendly,
      citiesCovered,
    };
  }, [listings]);

  function resetFilters() {
    setSearch("");
    setCategory("All");
    setCity("All");
    setCounty("All");
  }

  return (
    <div className="app">
      <header className="hero">
        <nav className="nav">
          <div className="brand">
            <span className="brand-mark">SF</span>
            <div>
              <p className="eyebrow">Senior Fun USA</p>
              <h1>Senior Fun Massachusetts</h1>
            </div>
          </div>
          <a className="nav-button" href="#directory">
            Explore Directory
          </a>
        </nav>

        <section className="hero-grid">
          <div className="hero-copy">
            <p className="pill">Massachusetts pilot directory</p>
            <h2>Helping seniors stay active, social, and connected.</h2>
            <p>
              Find senior centers, chair yoga, bingo, transportation help,
              memory-friendly programs, museums, day trips, caregiver resources,
              and local activities across Massachusetts.
            </p>
            <div className="hero-actions">
              <a href="#directory" className="primary-button">
                Search listings
              </a>
              <a href="#about" className="secondary-button">
                About the project
              </a>
              <a href={SUBMIT_FORM_URL} target="_blank" rel="noreferrer" className="secondary-button">
                Submit a listing
              </a>
            </div>
          </div>

          <div className="stats-card">
            <h3>Directory Snapshot</h3>
            <div className="stats-grid">
              <div>
                <strong>{stats.total}</strong>
                <span>Total listings</span>
              </div>
              <div>
                <strong>{stats.citiesCovered}</strong>
                <span>Cities covered</span>
              </div>
              <div>
                <strong>{stats.seniorCenters}</strong>
                <span>Senior centers</span>
              </div>
              <div>
                <strong>{stats.transportation}</strong>
                <span>Transportation options</span>
              </div>
            </div>
          </div>
        </section>
      </header>

      <main>
        <section className="section intro" id="about">
          <div>
            <p className="eyebrow">What this is</p>
            <h2>A simple directory for older adults, families, and caregivers.</h2>
          </div>
          <p>
            Senior Fun Massachusetts is the first state directory in the future
            Senior Fun USA network. This first version uses verified listings
            from official or trusted sources and is designed to grow into a
            larger national directory over time.
          </p>
        </section>

        <section className="section" id="directory">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Directory</p>
              <h2>Find senior-friendly resources</h2>
            </div>
            <p>{filteredListings.length} results shown</p>
          </div>

          <div className="filters">
            <input
              type="search"
              placeholder="Search by city, category, activity, or keyword..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />

            <select value={category} onChange={(event) => setCategory(event.target.value)}>
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item === "All" ? "All categories" : item}
                </option>
              ))}
            </select>

            <select value={city} onChange={(event) => setCity(event.target.value)}>
              {cities.map((item) => (
                <option key={item} value={item}>
                  {item === "All" ? "All cities" : item}
                </option>
              ))}
            </select>

            <select value={county} onChange={(event) => setCounty(event.target.value)}>
              {counties.map((item) => (
                <option key={item} value={item}>
                  {item === "All" ? "All counties" : item}
                </option>
              ))}
            </select>

            <button type="button" onClick={resetFilters}>
              Reset
            </button>
          </div>

          {loading ? (
            <div className="message">Loading listings...</div>
          ) : filteredListings.length === 0 ? (
            <div className="message">No listings found. Try another search.</div>
          ) : (
            <div className="listing-grid">
              {filteredListings.map((item) => (
                <article className="listing-card" key={item.id}>
                  <div className="card-top">
                    <span className="category-tag">{item.category}</span>
                    <span className="location-tag">{item.city}</span>
                  </div>

                  <h3>{item.title}</h3>
                  <p>{item.shortDescription}</p>

                  <div className="quick-info">
                    <span>{item.county}</span>
                    {item.transportationAvailable === "Yes" && <span>Transportation</span>}
                    {item.dementiaFriendly === "Yes" && <span>Dementia-friendly</span>}
                    {item.seniorDiscount === "Yes" && <span>Senior discount</span>}
                  </div>

                  <button type="button" onClick={() => setSelectedListing(item)}>
                    View details
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      <section className="section submit-section">
        <div className="submit-card">
          <div>
            <p className="eyebrow">Help grow the directory</p>
            <h2>Know a senior-friendly activity or resource?</h2>
            <p>
              Suggest a senior center, travel option, transportation resource,
              museum program, chair yoga class, memory café, caregiver support
              group, discount, or community activity. Every submission is
              reviewed before it is added to Senior Fun USA.
            </p>
          </div>
          <a href={SUBMIT_FORM_URL} target="_blank" rel="noreferrer" className="primary-button">
            Submit a listing
          </a>
        </div>
      </section>

      <footer className="footer">
        <div>
          <h2>Senior Fun USA</h2>
          <p>
            Starting in Massachusetts. Built to expand to Florida, New York,
            more U.S. states, and later Canada.
          </p>
        </div>
        <p className="footer-note">
          Always contact each organization directly to confirm schedules,
          pricing, accessibility, registration, and availability.
        </p>
      </footer>

      {selectedListing && (
        <div className="modal-backdrop" onClick={() => setSelectedListing(null)}>
          <div className="modal" onClick={(event) => event.stopPropagation()}>
            <button className="close-button" onClick={() => setSelectedListing(null)}>
              ×
            </button>

            <span className="category-tag">{selectedListing.category}</span>
            <h2>{selectedListing.title}</h2>
            <p className="modal-description">{selectedListing.fullDescription}</p>

            <div className="detail-grid">
              <Detail label="City" value={selectedListing.city} />
              <Detail label="County" value={selectedListing.county} />
              <Detail label="Address" value={selectedListing.address} />
              <Detail label="Phone" value={selectedListing.phone} />
              <Detail label="Email" value={selectedListing.email} />
              <Detail label="Price" value={selectedListing.price} />
              <Detail label="Schedule / Hours" value={selectedListing.schedule} />
              <Detail label="Senior Discount" value={selectedListing.seniorDiscount} />
              <Detail label="Dementia-Friendly" value={selectedListing.dementiaFriendly} />
              <Detail label="Caregiver-Friendly" value={selectedListing.caregiverFriendly} />
              <Detail label="Wheelchair Accessible" value={selectedListing.wheelchairAccessible} />
              <Detail label="Transportation Available" value={selectedListing.transportationAvailable} />
              <Detail label="Last Updated" value={selectedListing.lastUpdated} />
            </div>

            <div className="modal-actions">
              {selectedListing.website !== "Not listed" && (
                <a href={selectedListing.website} target="_blank" rel="noreferrer">
                  Visit website
                </a>
              )}
              {selectedListing.sourceUrl !== "Not listed" && (
                <a href={selectedListing.sourceUrl} target="_blank" rel="noreferrer">
                  View source
                </a>
              )}
            </div>

            <p className="disclaimer">
              Please confirm details directly with the organization before attending.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div className="detail">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export default App;
