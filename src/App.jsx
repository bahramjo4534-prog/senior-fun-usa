import { useEffect, useMemo, useState } from "react";
import Papa from "papaparse";
import "./App.css";

const DATA_URL = "/data/senior-fun-listings.csv";
const SUBMIT_FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSdbXYVCo02FVyqYorIT236XG515b_R-z6zmc0OJobuiHXQdKQ/viewform?usp=publish-editor";

function clean(value) {
  return value && value.trim() ? value.trim() : "Not listed";
}

function App() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [stateFilter, setStateFilter] = useState("All");
  const [city, setCity] = useState("All");
  const [county, setCounty] = useState("All");
  const [selectedListing, setSelectedListing] = useState(null);

  const scrollToDirectory = () => {
    setTimeout(() => {
      document.getElementById("directory")?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  const showTravelListings = () => {
    setSearch("");
    setCategory("Senior Travel & Tours");
    setStateFilter("All");
    setCity("All");
    setCounty("All");
    scrollToDirectory();
  };

  const showFerryListing = () => {
    setSearch("The CAT Ferry");
    setCategory("Senior Travel & Tours");
    setStateFilter("Maine");
    setCity("All");
    setCounty("All");
    scrollToDirectory();
  };

  const showMaineTravelIdeas = () => {
    setSearch("");
    setCategory("Senior Travel & Tours");
    setStateFilter("Maine");
    setCity("All");
    setCounty("All");
    scrollToDirectory();
  };

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

  const states = useMemo(() => {
    return ["All", ...new Set(listings.map((item) => item.state).filter(Boolean).sort())];
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
      const matchesState = stateFilter === "All" || item.state === stateFilter;
      const matchesCity = city === "All" || item.city === city;
      const matchesCounty = county === "All" || item.county === county;

      return matchesSearch && matchesCategory && matchesState && matchesCity && matchesCounty;
    });
  }, [listings, search, category, stateFilter, city, county]);

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
    setStateFilter("All");
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
              <h1>Senior Fun USA</h1>
            </div>
          </div>
          <div className="header-actions">
            <a className="nav-button" href="#directory">
              Explore Directory
            </a>
            <button type="button" className="nav-button nav-action-button" onClick={showTravelListings}>
              Senior Travel
            </button>
            <a className="nav-button" href={SUBMIT_FORM_URL} target="_blank" rel="noreferrer">
              Submit a Listing
            </a>
          </div>
        </nav>

        <section className="hero-grid">
          <div className="hero-copy">
            <p className="pill">Welcome to Senior Fun USA</p>
            <h2>Discover senior-friendly places, activities, and travel.</h2>
            <p>
              Senior Fun USA helps older adults, families, and caregivers find trusted senior centers, social activities,
              transportation help, museums, discounts, caregiver resources, dementia-friendly programs, and senior travel
              opportunities. We now include Massachusetts, Florida, New York, California, Texas, Pennsylvania, and Maine
              as the first seven states in a growing nationwide senior lifestyle directory.
            </p>
            <div className="hero-actions">
              <a href="#directory" className="primary-button">
                Explore directory
              </a>
              <a href={SUBMIT_FORM_URL} target="_blank" rel="noreferrer" className="secondary-button">
                Submit a listing
              </a>
              <button type="button" className="secondary-button hero-link-button" onClick={showTravelListings}>
                Senior Travel & Tours
              </button>
            </div>
          </div>

          <div className="hero-side">
            <div className="mosaic-card">
              <img
                src="/images/senior-fun-mosaic.png"
                alt="Mosaic artwork of two beach chairs under an umbrella facing the ocean"
              />
              <div className="mosaic-caption">
                <span>Senior Fun USA</span>
                <strong>Coastal, calm, and connected.</strong>
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
                  <strong>7</strong>
                  <span>States covered</span>
                </div>
                <div>
                  <strong>57</strong>
                  <span>Maine listings</span>
                </div>
                <div>
                  <strong>Travel</strong>
                  <span>+ rides</span>
                </div>
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
            Senior Fun USA now includes Massachusetts, Florida, New York, California, Texas, Pennsylvania, and Maine as
            the first seven state directories in the future national Senior Fun network. This version uses verified
            listings from official or trusted sources and is designed to grow into a larger national directory over time.
          </p>
        </section>

        <section className="section feature-section">
          <div className="feature-grid">
            <article className="feature-card">
              <span className="feature-icon">🎨</span>
              <h3>Explore Activities</h3>
              <p>
                Find senior centers, museums, bingo, games, arts, music, chair yoga, social clubs, and local programs
                that help older adults stay active and connected.
              </p>
              <a href="#directory">Browse activities</a>
            </article>

            <article className="feature-card">
              <span className="feature-icon">🚌</span>
              <h3>Find Transportation</h3>
              <p>
                Discover local transportation help, senior ride programs, accessible options, and community resources
                that support independence and safe local travel.
              </p>
              <a href="#directory">Find transportation</a>
            </article>

            <article className="feature-card travel-feature">
              <span className="feature-icon">🌊</span>
              <h3>Plan Senior Travel</h3>
              <p>
                Explore day trips, bus tours, group outings, senior travel programs, cruises, seasonal trips, and
                travel-friendly resources for older adults.
              </p>
              <button type="button" onClick={showTravelListings}>
                See travel listings
              </button>
            </article>
          </div>
        </section>

        <section className="section how-section">
          <div className="section-heading">
            <p className="eyebrow">How it works</p>
            <h2>Use Senior Fun USA as a starting point.</h2>
            <p>
              Listings are meant to help you discover options quickly. Always confirm details directly with the
              organization before visiting, registering, paying, or arranging transportation.
            </p>
          </div>

          <div className="how-grid">
            <article className="how-card">
              <span>1</span>
              <h3>Search trusted listings</h3>
              <p>
                Browse senior centers, activities, transportation help, travel, museums, discounts, caregiver resources,
                and community programs.
              </p>
            </article>

            <article className="how-card">
              <span>2</span>
              <h3>Confirm details directly</h3>
              <p>
                Program dates, pricing, accessibility, registration rules, and transportation availability can change, so
                contact the provider first.
              </p>
            </article>

            <article className="how-card">
              <span>3</span>
              <h3>Suggest a listing</h3>
              <p>
                Know a senior-friendly program, event, trip, service, or resource? Submit it for review so the directory
                can keep growing.
              </p>
            </article>
          </div>
        </section>

        <section className="section" id="directory">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Directory</p>
              <h2>Find senior-friendly resources</h2>
            </div>
            <p>{filteredListings.length} results shown</p>
          </div>

          <div className="directory-help-box">
            <h3>How to use this directory</h3>
            <p>
              Search by state, city, category, or keyword. Use the filters to find senior centers, transportation help,
              caregiver resources, activities, wellness programs, discounts, and senior travel ideas. Always confirm
              schedules, pricing, accessibility, registration, and availability directly with each provider before
              visiting.
            </p>
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

            <select value={stateFilter} onChange={(event) => setStateFilter(event.target.value)}>
              {states.map((item) => (
                <option key={item} value={item}>
                  {item === "All" ? "All states" : item}
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
              Suggest a senior center, travel option, transportation resource, museum program, chair yoga class, memory
              café, caregiver support group, discount, or community activity. Every submission is reviewed before it is
              added to Senior Fun USA.
            </p>
          </div>
          <a href={SUBMIT_FORM_URL} target="_blank" rel="noreferrer" className="primary-button">
            Submit a listing
          </a>
        </div>
      </section>

      <section className="section disclaimer-section">
        <div className="disclaimer-card">
          <div>
            <p className="eyebrow">Important note</p>
            <h2>Please confirm details before attending.</h2>
          </div>
          <p>
            Senior Fun USA is a helpful directory, not an official government, medical, transportation, or care provider
            website. Listings are based on public information and trusted sources, but schedules, costs, eligibility,
            accessibility, transportation availability, and program details can change. Always contact the organization
            directly before visiting, registering, or scheduling a ride.
          </p>
          <p>
            Privacy note: if you submit a listing through our Google Form, your submission will be reviewed before
            anything is added to the public directory.
          </p>
        </div>
      </section>

      <section className="section state-seo-section">
        <p className="eyebrow">Senior resources by state</p>
        <h2>
          Find senior-friendly resources in Massachusetts, Florida, New York, California, Texas, Pennsylvania, and Maine
        </h2>
        <p className="state-seo-intro">
          Senior Fun USA helps older adults, families, and caregivers discover trusted senior centers, transportation
          help, social activities, caregiver resources, dementia-friendly programs, senior discounts, museums, and senior
          travel opportunities.
        </p>

        <div className="state-seo-grid">
          <article className="state-seo-card">
            <h3>Massachusetts senior resources</h3>
            <p>
              Browse Massachusetts senior centers, community programs, transportation options, recreational activities,
              cultural opportunities, caregiver resources, and senior travel ideas across cities including Newton,
              Boston, Cambridge, Worcester, Springfield, Lowell, Quincy, and more.
            </p>
            <a href="#directory" onClick={() => setStateFilter("Massachusetts")}>
              View Massachusetts listings
            </a>
          </article>

          <article className="state-seo-card">
            <h3>Florida senior resources</h3>
            <p>
              Explore Florida senior centers, senior transportation help, activity programs, caregiver support,
              recreation centers, social events, accessible services, and senior travel resources across Miami, Orlando,
              Tampa, Sarasota, Jacksonville, Fort Lauderdale, Palm Bay, and other Florida communities.
            </p>
            <a href="#directory" onClick={() => setStateFilter("Florida")}>
              View Florida listings
            </a>
          </article>

          <article className="state-seo-card">
            <h3>New York senior resources</h3>
            <p>
              Explore New York senior centers, older adult programs, transportation help, caregiver resources, museums,
              cultural opportunities, social services, senior activities, and travel-friendly resources across New York
              City, Brooklyn, Queens, Bronx, Staten Island, Rochester, Buffalo, Syracuse, Albany, and more.
            </p>
            <a href="#directory" onClick={() => setStateFilter("New York")}>
              View New York listings
            </a>
          </article>

          <article className="state-seo-card">
            <h3>California senior resources</h3>
            <p>
              Explore California senior centers, older adult programs, transportation help, caregiver resources, museums,
              cultural opportunities, social services, senior activities, and travel-friendly resources across Los
              Angeles, San Francisco, San Diego, San José, Sacramento, Oakland, Anaheim, Riverside, Fresno, Santa Clara,
              and more.
            </p>
            <a href="#directory" onClick={() => setStateFilter("California")}>
              View California listings
            </a>
          </article>

          <article className="state-seo-card">
            <h3>Texas senior resources</h3>
            <p>
              Explore Texas senior centers, older adult programs, transportation help, caregiver resources, nutrition
              programs, recreation centers, wellness programs, social activities, and aging services across Houston,
              Austin, Dallas, San Antonio, Fort Worth, El Paso, Corpus Christi, Plano, Arlington, Denton, Waco, Irving,
              Garland, Frisco, and more.
            </p>
            <a href="#directory" onClick={() => setStateFilter("Texas")}>
              View Texas listings
            </a>
          </article>

          <article className="state-seo-card">
            <h3>Pennsylvania senior resources</h3>
            <p>
              Explore Pennsylvania senior centers, Area Agencies on Aging, caregiver resources, transportation help,
              active adult centers, senior community centers, museums, wellness programs, meals, social activities, and
              senior-friendly resources across Philadelphia, Pittsburgh, Harrisburg, Lancaster, Erie, Allentown,
              Scranton, Wilkes-Barre, West Chester, State College, Reading, and more.
            </p>
            <a href="#directory" onClick={() => setStateFilter("Pennsylvania")}>
              View Pennsylvania listings
            </a>
          </article>

          <article className="state-seo-card">
            <h3>Maine senior resources and travel</h3>
            <p>
              Explore Maine senior centers, Area Agencies on Aging, caregiver resources, transportation help, museums,
              coastal day trips, senior discounts, senior travel ideas, and scenic activities across Portland, Bar
              Harbor, Bangor, Augusta, Lewiston, South Portland, Rockland, Camden, Bath, Boothbay, Freeport, and more.
            </p>
            <a href="#directory" onClick={() => setStateFilter("Maine")}>
              View Maine listings
            </a>
          </article>

          <article className="state-seo-card">
            <h3>Senior travel, rides, and activities</h3>
            <p>
              Use the directory as a starting point to compare senior-friendly places, day trips, group outings, local
              ride programs, community centers, classes, social clubs, meals, events, and support services. Always
              confirm details directly with the provider before visiting or registering.
            </p>
            <a href="#directory">Search the directory</a>
          </article>
        </div>
      </section>

      <section className="section seo-link-section">
        <p className="eyebrow">Popular senior resource searches</p>
        <div className="seo-link-cloud">
          <a href="#directory" onClick={() => setStateFilter("Florida")}>
            Senior centers in Florida
          </a>
          <a href="#directory" onClick={() => setStateFilter("Massachusetts")}>
            Senior centers in Massachusetts
          </a>
          <a href="#directory" onClick={() => setStateFilter("New York")}>
            Senior centers in New York
          </a>
          <a href="#directory" onClick={() => setStateFilter("California")}>
            Senior centers in California
          </a>
          <a href="#directory" onClick={() => setStateFilter("Texas")}>
            Senior centers in Texas
          </a>
          <a href="#directory" onClick={() => setStateFilter("Pennsylvania")}>
            Senior centers in Pennsylvania
          </a>
          <a href="#directory" onClick={() => setStateFilter("Maine")}>
            Senior centers in Maine
          </a>
          <a href="#directory">Senior transportation help</a>
          <a href="#directory">Senior travel programs</a>
          <a href="#directory">Senior activities for older adults</a>
          <a href="#directory">Caregiver resources</a>
          <a href="#directory">Dementia-friendly programs</a>
          <a href="#directory">Senior-friendly places near me</a>
        </div>
      </section>

      <section className="travel-routes-section">
        <div className="section-kicker">Senior travel routes</div>
        <h2>Maine to Nova Scotia senior-friendly travel idea</h2>
        <p className="travel-routes-intro">
          Senior Fun USA now includes Maine resources and travel ideas, including a scenic Bar Harbor to Yarmouth, Nova
          Scotia ferry route. This can help older adults, families, caregivers, and travel groups discover coastal
          activities, museums, senior-friendly stops, and cross-border trip ideas.
        </p>

        <div className="travel-route-card">
          <div>
            <span className="route-pill">Featured route</span>
            <h3>Bar Harbor, Maine → Yarmouth, Nova Scotia</h3>
            <p>
              Start with senior-friendly Maine activities around Portland, Bar Harbor, Acadia, Bath, Boothbay, Rockland,
              and Camden. Then explore The CAT Ferry as a seasonal travel option connecting Maine with Nova Scotia.
            </p>
          </div>

          <div className="route-actions">
            <a href="#directory" onClick={showFerryListing}>
              View ferry listing
            </a>
            <a href="#directory" onClick={showMaineTravelIdeas}>
              Explore Maine travel ideas
            </a>
          </div>
        </div>
      </section>

      <section className="trust-section" id="about">
        <div className="section-heading">
          <p>ABOUT SENIOR FUN USA</p>
          <h2>A growing senior-friendly directory built from trusted public sources.</h2>
        </div>

        <div className="trust-grid">
          <article className="trust-card">
            <h3>What we list</h3>
            <p>
              Senior Fun USA helps older adults, families, and caregivers find senior centers, transportation help,
              caregiver resources, social activities, museums, discounts, and senior-friendly travel ideas across the
              United States.
            </p>
          </article>

          <article className="trust-card">
            <h3>How listings are reviewed</h3>
            <p>
              Listings are added from official city, county, nonprofit, museum, transportation, and community
              organization sources when possible. Visitors should always confirm hours, pricing, registration,
              accessibility, and availability directly with each provider.
            </p>
          </article>

          <article className="trust-card">
            <h3>Suggest or correct a listing</h3>
            <p>
              Know a senior-friendly place, program, ride service, activity, or resource we should add? Use the submit
              form to suggest a listing or report an update so the directory can keep improving.
            </p>
            <a href={SUBMIT_FORM_URL} target="_blank" rel="noreferrer">
              Submit a listing
            </a>
          </article>
        </div>
      </section>

      <footer className="footer">
        <div>
          <h2>Senior Fun USA</h2>
          <p>Starting in Massachusetts. Built to expand to Florida, New York, more U.S. states, and later Canada.</p>
        </div>

        <div className="footer-links">
          <a href="#directory">Directory</a>
          <a href={SUBMIT_FORM_URL} target="_blank" rel="noreferrer">
            Submit a listing
          </a>
          <a href="#about">About</a>
        </div>

        <p className="footer-note">
          Always contact each organization directly to confirm schedules, pricing, accessibility, registration, and
          availability.
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

            <p className="disclaimer">Please confirm details directly with the organization before attending.</p>
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