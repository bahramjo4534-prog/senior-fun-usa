import { useEffect, useMemo, useState } from "react";
import { Routes, Route, useNavigate, useParams } from "react-router-dom";
import Papa from "papaparse";
import "./App.css";

const DATA_URL = "/data/senior-fun-listings.csv";
const SUBMIT_FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSdbXYVCo02FVyqYorIT236XG515b_R-z6zmc0OJobuiHXQdKQ/viewform?usp=publish-editor";

const STATE_LIST_TEXT =
  "Massachusetts, Florida, New York, California, Texas, Pennsylvania, Maine, Washington, and Hawaii";

const STATE_SLUGS = {
  massachusetts: "Massachusetts",
  florida: "Florida",
  "new-york": "New York",
  california: "California",
  texas: "Texas",
  pennsylvania: "Pennsylvania",
  maine: "Maine",
  washington: "Washington",
  hawaii: "Hawaii",
};

const STATE_TO_SLUG = {
  Massachusetts: "massachusetts",
  Florida: "florida",
  "New York": "new-york",
  California: "california",
  Texas: "texas",
  Pennsylvania: "pennsylvania",
  Maine: "maine",
  Washington: "washington",
  Hawaii: "hawaii",
};

const CATEGORY_SLUGS = {
  "senior-travel": "Senior Travel & Tours",
  "transportation-help": "Transportation Help",
  "caregiver-support": "Caregiver Support",
  "senior-centers": "Senior Center",
  "senior-activities": "Senior-Friendly Event",
};

const CATEGORY_TO_SLUG = {
  "Senior Travel & Tours": "senior-travel",
  "Transportation Help": "transportation-help",
  "Caregiver Support": "caregiver-support",
  "Senior Center": "senior-centers",
  "Senior-Friendly Event": "senior-activities",
};

const STATE_PAGE_DETAILS = {
  Massachusetts: {
    label: "Massachusetts",
    image: "/images/states/massachusetts.jpg",
    intro:
      "Browse Massachusetts senior centers, community programs, transportation options, recreational activities, cultural opportunities, caregiver resources, and senior travel ideas across Newton, Boston, Cambridge, Worcester, Springfield, Lowell, Quincy, and more.",
  },
  Florida: {
    label: "Florida",
    image: "/images/states/florida.jpg",
    intro:
      "Explore Florida senior centers, senior transportation help, activity programs, caregiver support, recreation centers, social events, accessible services, and senior travel resources across Miami, Orlando, Tampa, Sarasota, Jacksonville, Fort Lauderdale, and more.",
  },
  "New York": {
    label: "New York",
    image: "/images/states/new-york.jpg",
    intro:
      "Explore New York senior centers, older adult programs, transportation help, caregiver resources, museums, cultural opportunities, senior activities, and travel-friendly resources across New York City, Rochester, Buffalo, Syracuse, Albany, and more.",
  },
  California: {
    label: "California",
    image: "/images/states/california.jpg",
    intro:
      "Explore California senior centers, older adult programs, transportation help, caregiver resources, museums, cultural opportunities, senior activities, and travel-friendly resources across Los Angeles, San Francisco, San Diego, San José, Sacramento, and more.",
  },
  Texas: {
    label: "Texas",
    image: "/images/states/texas.jpg",
    intro:
      "Explore Texas senior centers, older adult programs, transportation help, caregiver resources, nutrition programs, wellness programs, social activities, and aging services across Houston, Austin, Dallas, San Antonio, Fort Worth, El Paso, and more.",
  },
  Pennsylvania: {
    label: "Pennsylvania",
    image: "/images/states/pennsylvania.jpg",
    intro:
      "Explore Pennsylvania senior centers, Area Agencies on Aging, caregiver resources, transportation help, active adult centers, museums, wellness programs, meals, and social activities across Philadelphia, Pittsburgh, Harrisburg, Lancaster, Erie, and more.",
  },
  Maine: {
    label: "Maine coast",
    image: "/images/states/maine.jpg",
    intro:
      "Explore Maine senior centers, caregiver resources, transportation help, museums, coastal day trips, senior discounts, senior travel ideas, scenic activities, and the Bar Harbor to Yarmouth, Nova Scotia ferry route.",
  },
  Washington: {
    label: "Washington",
    image: "/images/states/washington.jpg",
    intro:
      "Explore Washington senior centers, caregiver resources, transportation help, museums, ferry routes, scenic day trips, senior discounts, and community activities across Seattle, Tacoma, Spokane, Bellevue, Olympia, Vancouver, Bellingham, and more.",
  },
  Hawaii: {
    label: "Hawaii islands",
    image: "/images/states/hawaii.jpg",
    intro:
      "Explore Hawaii senior centers, caregiver support, transportation help, museums, gardens, beach parks, national parks, cultural attractions, scenic day trips, and senior-friendly travel ideas across Oahu, Maui, Kauai, Hawaii Island, Molokai, and Lanai.",
  },
};

const CATEGORY_PAGE_DETAILS = {
  "Senior Travel & Tours": {
    label: "Senior travel",
    title: "Senior travel programs and trip ideas",
    intro:
      "Explore senior-friendly travel programs, scenic day trips, ferry routes, museums, gardens, cultural attractions, coastal trips, group outings, and slower-paced travel ideas across the Senior Fun USA directory.",
    image: "/images/states/maine-ferry.png",
  },
  "Transportation Help": {
    label: "Transportation",
    title: "Senior transportation help",
    intro:
      "Find senior transportation resources, ride programs, accessible travel options, community transportation, transit help, and mobility support services for older adults and caregivers.",
    image: "/images/categories/transportation-help.jpg",
  },
  "Caregiver Support": {
    label: "Caregiver support",
    title: "Caregiver resources for families",
    intro:
      "Browse caregiver support resources, aging services, family assistance programs, community support organizations, dementia-related resources, and help for people caring for older adults.",
    image: "/images/categories/caregiver-support.jpg",
  },
  "Senior Center": {
    label: "Senior centers",
    title: "Senior centers and community programs",
    intro:
      "Find senior centers, older adult centers, community programs, social activities, wellness programs, meals, classes, events, and local support services across the directory.",
    image: "/images/categories/senior-centers.jpg",
  },
  "Senior-Friendly Event": {
    label: "Senior activities",
    title: "Senior-friendly activities and events",
    intro:
      "Explore senior-friendly events, museums, social programs, art activities, cultural attractions, classes, wellness activities, group outings, and local recreation opportunities.",
    image: "/images/categories/senior-activities.jpg",
  },
};

function clean(value) {
  return value && value.trim() ? value.trim() : "Not listed";
}

function getCategoryVisual(category) {
  const visuals = {
    "Senior Center": { icon: "🏛️", label: "Community" },
    "Transportation Help": { icon: "🚌", label: "Transportation" },
    "Caregiver Support": { icon: "🤝", label: "Support" },
    "Senior Travel & Tours": { icon: "🌊", label: "Travel" },
    "Senior Discount": { icon: "🎟️", label: "Discount" },
    "Senior-Friendly Event": { icon: "🎨", label: "Activities" },
    "Museum / Culture": { icon: "🖼️", label: "Culture" },
    "Museum / Cultural": { icon: "🖼️", label: "Culture" },
    "Social Club": { icon: "☕", label: "Social" },
    "Volunteer Opportunity": { icon: "🌱", label: "Volunteer" },
  };

  return visuals[category] || { icon: "📍", label: "Resource" };
}

function getListingImage(item) {
  const title = item.title.toLowerCase();

  if (title.includes("cat ferry") || title.includes("bar harbor to yarmouth")) {
    return "/images/states/maine-ferry.png";
  }

  return "";
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<SeniorFunDirectory />} />
      <Route path="/states/:stateSlug" element={<SeniorFunDirectory />} />
      <Route path="/categories/:categorySlug" element={<SeniorFunDirectory />} />
    </Routes>
  );
}

function SeniorFunDirectory() {
  const navigate = useNavigate();
  const { stateSlug, categorySlug } = useParams();

  const pageState = stateSlug ? STATE_SLUGS[stateSlug] || "All" : "All";
  const pageCategory = categorySlug ? CATEGORY_SLUGS[categorySlug] || "All" : "All";

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(pageCategory);
  const [stateFilter, setStateFilter] = useState(pageState);
  const [city, setCity] = useState("All");
  const [county, setCounty] = useState("All");
  const [selectedListing, setSelectedListing] = useState(null);

  useEffect(() => {
    setSearch("");
    setCategory(pageCategory);
    setStateFilter(pageState);
    setCity("All");
    setCounty("All");

    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 50);
  }, [pageState, pageCategory]);

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

  const scrollToDirectory = () => {
    setTimeout(() => {
      document.getElementById("directory")?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  const scrollToTop = () => {
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 50);
  };

  const goHome = () => {
    setSearch("");
    setCategory("All");
    setStateFilter("All");
    setCity("All");
    setCounty("All");
    navigate("/");
    scrollToTop();
  };

  const showStateListings = (stateName) => {
    const slug = STATE_TO_SLUG[stateName];

    setSearch("");
    setCategory("All");
    setStateFilter(stateName);
    setCity("All");
    setCounty("All");

    if (slug) {
      navigate(`/states/${slug}`);
    }

    scrollToTop();
  };

  const showCategoryListings = (categoryName) => {
    const slug = CATEGORY_TO_SLUG[categoryName];

    setSearch("");
    setCategory(categoryName);
    setStateFilter("All");
    setCity("All");
    setCounty("All");

    if (slug) {
      navigate(`/categories/${slug}`);
    }

    scrollToTop();
  };

  const showStateCategoryListings = (categoryName) => {
    setSearch("");
    setCategory(categoryName);
    setCity("All");
    setCounty("All");
    scrollToDirectory();
  };

  const showTravelListings = () => {
    showCategoryListings("Senior Travel & Tours");
  };

  const showFerryListing = () => {
    setSearch("The CAT Ferry");
    setCategory("Senior Travel & Tours");
    setStateFilter("Maine");
    setCity("All");
    setCounty("All");
    navigate("/states/maine");
    scrollToDirectory();
  };

  const showMaineTravelIdeas = () => {
    setSearch("");
    setCategory("Senior Travel & Tours");
    setStateFilter("Maine");
    setCity("All");
    setCounty("All");
    navigate("/states/maine");
    scrollToDirectory();
  };

  const showHawaiiTravelIdeas = () => {
    setSearch("");
    setCategory("Senior Travel & Tours");
    setStateFilter("Hawaii");
    setCity("All");
    setCounty("All");
    navigate("/states/hawaii");
    scrollToDirectory();
  };

  const categories = useMemo(() => {
    return ["All", ...new Set(listings.map((item) => item.category).sort())];
  }, [listings]);

  const cities = useMemo(() => {
    const filteredByState =
      stateFilter === "All" ? listings : listings.filter((item) => item.state === stateFilter);

    return ["All", ...new Set(filteredByState.map((item) => item.city).sort())];
  }, [listings, stateFilter]);

  const counties = useMemo(() => {
    const filteredByState =
      stateFilter === "All" ? listings : listings.filter((item) => item.state === stateFilter);

    return ["All", ...new Set(filteredByState.map((item) => item.county).sort())];
  }, [listings, stateFilter]);

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
        item.state.toLowerCase().includes(searchText) ||
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
    const maineListings = listings.filter((item) => item.state === "Maine").length;

    return {
      total: listings.length,
      maineListings,
    };
  }, [listings]);

  const stateDetails = stateFilter !== "All" && categorySlug === undefined ? STATE_PAGE_DETAILS[stateFilter] : null;
  const categoryDetails = category !== "All" && stateFilter === "All" ? CATEGORY_PAGE_DETAILS[category] : null;

  function resetFilters() {
    setSearch("");
    setCategory("All");
    setStateFilter("All");
    setCity("All");
    setCounty("All");
    navigate("/");
    scrollToTop();
  }

  const directoryTitle =
    stateFilter !== "All"
      ? `${stateFilter} senior-friendly resources`
      : category !== "All"
      ? CATEGORY_PAGE_DETAILS[category]?.title || `${category} listings`
      : "Find senior-friendly resources";

  const directoryCountText =
    stateFilter !== "All"
      ? `${stateFilter}: ${filteredListings.length} results shown`
      : category !== "All"
      ? `${CATEGORY_PAGE_DETAILS[category]?.label || category}: ${filteredListings.length} results shown`
      : `${filteredListings.length} results shown`;

  return (
    <div className="app">
      <header className="hero">
        <nav className="nav">
          <div className="brand" onClick={goHome} style={{ cursor: "pointer" }}>
            <span className="brand-mark">SF</span>
            <div>
              <p className="eyebrow">Senior Fun USA</p>
              <h1>Senior Fun USA</h1>
            </div>
          </div>

          <div className="header-actions">
            <button type="button" className="nav-button nav-action-button" onClick={goHome}>
              Home
            </button>
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
            <p className="pill">
              {stateFilter !== "All"
                ? `Senior Fun ${stateFilter}`
                : category !== "All"
                ? `Senior Fun ${CATEGORY_PAGE_DETAILS[category]?.label || category}`
                : "Welcome to Senior Fun USA"}
            </p>

            <h2>
              {stateFilter !== "All"
                ? `${stateFilter} senior-friendly resources.`
                : category !== "All"
                ? `${CATEGORY_PAGE_DETAILS[category]?.title}.`
                : "Discover senior-friendly places, activities, and travel."}
            </h2>

            <p>
              {stateFilter !== "All"
                ? STATE_PAGE_DETAILS[stateFilter]?.intro
                : category !== "All"
                ? CATEGORY_PAGE_DETAILS[category]?.intro
                : `Senior Fun USA helps older adults, families, and caregivers find trusted senior centers, social activities, transportation help, museums, discounts, caregiver resources, dementia-friendly programs, and senior travel opportunities. We now include ${STATE_LIST_TEXT} as the first nine states in a growing nationwide senior lifestyle directory.`}
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
                  <strong>9</strong>
                  <span>States covered</span>
                </div>
                <div>
                  <strong>{stateFilter !== "All" || category !== "All" ? filteredListings.length : stats.maineListings}</strong>
                  <span>
                    {stateFilter !== "All"
                      ? `${stateFilter} listings`
                      : category !== "All"
                      ? `${CATEGORY_PAGE_DETAILS[category]?.label || category} listings`
                      : "Maine listings"}
                  </span>
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

      {stateDetails && (
        <VisualLandingSection
          label={stateDetails.label}
          image={stateDetails.image}
          eyebrow="State directory"
          title={`Senior Fun ${stateFilter}`}
          intro={stateDetails.intro}
          count={filteredListings.length}
          countLabel={`${stateFilter} listings`}
          buttonText={`Browse ${stateFilter} travel ideas`}
          onButtonClick={() => showStateCategoryListings("Senior Travel & Tours")}
        />
      )}

      {categoryDetails && (
        <VisualLandingSection
          label={categoryDetails.label}
          image={categoryDetails.image}
          eyebrow="Category directory"
          title={categoryDetails.title}
          intro={categoryDetails.intro}
          count={filteredListings.length}
          countLabel={`${categoryDetails.label} listings`}
          buttonText="Browse listings"
          onButtonClick={scrollToDirectory}
        />
      )}

      <main>
        {stateFilter === "All" && category === "All" && (
          <>
            <section className="section intro" id="about">
              <div>
                <p className="eyebrow">What this is</p>
                <h2>A simple directory for older adults, families, and caregivers.</h2>
              </div>
              <p>
                Senior Fun USA now includes {STATE_LIST_TEXT} as the first nine state directories in the future national
                Senior Fun network. This version uses verified listings from official or trusted sources and is designed
                to grow into a larger national directory over time.
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
                  <button type="button" onClick={() => showCategoryListings("Senior-Friendly Event")}>
                    Browse activities
                  </button>
                </article>

                <article className="feature-card">
                  <span className="feature-icon">🚌</span>
                  <h3>Find Transportation</h3>
                  <p>
                    Discover local transportation help, senior ride programs, accessible options, and community resources
                    that support independence and safe local travel.
                  </p>
                  <button type="button" onClick={() => showCategoryListings("Transportation Help")}>
                    Find transportation
                  </button>
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
          </>
        )}

        <section className="section" id="directory">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Directory</p>
              <h2>{directoryTitle}</h2>
            </div>

            <p>{directoryCountText}</p>
          </div>

          <div className="directory-help-box">
            <h3>
              {stateFilter !== "All"
                ? `${stateFilter} directory page`
                : category !== "All"
                ? `${CATEGORY_PAGE_DETAILS[category]?.label || category} category page`
                : "How to use this directory"}
            </h3>
            <p>
              {stateFilter !== "All"
                ? `This page shows senior-friendly resources for ${stateFilter}. Use the filters below to narrow results by category, city, or county. Always confirm schedules, pricing, accessibility, registration, and availability directly with each provider before visiting.`
                : category !== "All"
                ? `This page shows ${CATEGORY_PAGE_DETAILS[category]?.label || category} listings across the Senior Fun USA directory. Use the filters below to narrow results by state, city, or county. Always confirm schedules, pricing, accessibility, registration, and availability directly with each provider before visiting.`
                : "Search by state, city, category, or keyword. Use the filters to find senior centers, transportation help, caregiver resources, activities, wellness programs, discounts, and senior travel ideas. Always confirm schedules, pricing, accessibility, registration, and availability directly with each provider before visiting."}
            </p>
          </div>

          <div className="quick-filter-grid">
            <button
              type="button"
              className="quick-filter-card"
              onClick={() =>
                stateFilter !== "All" ? showStateCategoryListings("Senior Center") : showCategoryListings("Senior Center")
              }
            >
              <span className="quick-filter-icon">🏛️</span>
              <strong>Senior Centers</strong>
              <span>Community programs and local support</span>
            </button>

            <button
              type="button"
              className="quick-filter-card"
              onClick={() =>
                stateFilter !== "All"
                  ? showStateCategoryListings("Transportation Help")
                  : showCategoryListings("Transportation Help")
              }
            >
              <span className="quick-filter-icon">🚌</span>
              <strong>Transportation</strong>
              <span>Rides, transit, and paratransit help</span>
            </button>

            <button
              type="button"
              className="quick-filter-card"
              onClick={() =>
                stateFilter !== "All"
                  ? showStateCategoryListings("Caregiver Support")
                  : showCategoryListings("Caregiver Support")
              }
            >
              <span className="quick-filter-icon">🤝</span>
              <strong>Caregiver Support</strong>
              <span>Help for families and caregivers</span>
            </button>

            <button
              type="button"
              className="quick-filter-card"
              onClick={() =>
                stateFilter !== "All"
                  ? showStateCategoryListings("Senior Travel & Tours")
                  : showCategoryListings("Senior Travel & Tours")
              }
            >
              <span className="quick-filter-icon">🌊</span>
              <strong>Travel & Tours</strong>
              <span>Trips, museums, gardens, and scenic ideas</span>
            </button>
          </div>

          <div className="filters">
            <input
              type="search"
              placeholder="Search by city, category, activity, or keyword..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />

            <select
              value={category}
              onChange={(event) => {
                const selectedCategory = event.target.value;
                if (selectedCategory === "All") {
                  setCategory("All");
                  if (categorySlug) {
                    navigate("/");
                    scrollToTop();
                  }
                } else if (stateFilter !== "All") {
                  showStateCategoryListings(selectedCategory);
                } else {
                  showCategoryListings(selectedCategory);
                }
              }}
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item === "All" ? "All categories" : item}
                </option>
              ))}
            </select>

            <select
              value={stateFilter}
              onChange={(event) => {
                const selectedState = event.target.value;
                if (selectedState === "All") {
                  if (category !== "All") {
                    showCategoryListings(category);
                  } else {
                    resetFilters();
                  }
                } else {
                  showStateListings(selectedState);
                }
              }}
            >
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
              {filteredListings.map((item) => {
                const listingImage = getListingImage(item);

                return (
                  <article className={`listing-card ${listingImage ? "featured-listing-card" : ""}`} key={item.id}>
                    <div className={`card-visual ${listingImage ? "has-card-image" : ""}`}>
                      {listingImage ? (
                        <>
                          <img
                            className="card-visual-bg"
                            src={listingImage}
                            alt={item.title}
                            onError={(event) => {
                              event.currentTarget.style.display = "none";
                            }}
                          />
                          <div className="card-visual-overlay"></div>
                        </>
                      ) : null}

                      <div className="card-visual-icon">{getCategoryVisual(item.category).icon}</div>
                      <div className="card-visual-text">{getCategoryVisual(item.category).label}</div>
                    </div>

                    <div className="listing-content">
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
                        {item.wheelchairAccessible === "Yes" && <span>Wheelchair accessible</span>}
                      </div>

                      <div className="card-actions">
                        <button type="button" onClick={() => setSelectedListing(item)}>
                          View details
                        </button>

                        {item.website !== "Not listed" ? (
                          <a className="visit-link" href={item.website} target="_blank" rel="noreferrer">
                            Visit website
                          </a>
                        ) : (
                          <button type="button" onClick={() => setSelectedListing(item)}>
                            More info
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {stateFilter === "Maine" && (
        <MaineTravelSection showFerryListing={showFerryListing} showMaineTravelIdeas={showMaineTravelIdeas} />
      )}

      {stateFilter === "Hawaii" && (
        <HawaiiTravelSection showStateListings={showStateListings} showHawaiiTravelIdeas={showHawaiiTravelIdeas} />
      )}

      {stateFilter === "All" && category === "All" && (
        <>
          <StateCardsSection showStateListings={showStateListings} resetFilters={resetFilters} />

          <section className="section seo-link-section">
            <p className="eyebrow">Popular senior resource searches</p>
            <div className="seo-link-cloud">
              {Object.keys(STATE_TO_SLUG).map((stateName) => (
                <a key={stateName} href={`/states/${STATE_TO_SLUG[stateName]}`} onClick={(event) => {
                  event.preventDefault();
                  showStateListings(stateName);
                }}>
                  Senior centers in {stateName}
                </a>
              ))}
              <a href="/categories/transportation-help" onClick={(event) => {
                event.preventDefault();
                showCategoryListings("Transportation Help");
              }}>
                Senior transportation help
              </a>
              <a href="/categories/senior-travel" onClick={(event) => {
                event.preventDefault();
                showTravelListings();
              }}>
                Senior travel programs
              </a>
              <a href="/categories/senior-activities" onClick={(event) => {
                event.preventDefault();
                showCategoryListings("Senior-Friendly Event");
              }}>
                Senior activities for older adults
              </a>
              <a href="/categories/caregiver-support" onClick={(event) => {
                event.preventDefault();
                showCategoryListings("Caregiver Support");
              }}>
                Caregiver resources
              </a>
              <a
                href="/"
                onClick={(event) => {
                  event.preventDefault();
                  setSearch("dementia");
                  setCategory("All");
                  setStateFilter("All");
                  setCity("All");
                  setCounty("All");
                  navigate("/");
                  scrollToDirectory();
                }}
              >
                Dementia-friendly programs
              </a>
              <a href="/" onClick={(event) => {
                event.preventDefault();
                resetFilters();
              }}>
                Senior-friendly places near me
              </a>
            </div>
          </section>

          <MaineTravelSection showFerryListing={showFerryListing} showMaineTravelIdeas={showMaineTravelIdeas} />
          <HawaiiTravelSection showStateListings={showStateListings} showHawaiiTravelIdeas={showHawaiiTravelIdeas} />
        </>
      )}

      <InternalLinksSection
        showStateListings={showStateListings}
        showCategoryListings={showCategoryListings}
      />

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

      <section className="trust-section" id="about-info">
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
              Listings are added from official city, county, nonprofit, museum, transportation, tourism, and community
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
          <p>
            Starting with {STATE_LIST_TEXT}. Built to expand to more U.S. states and later Canada, with future
            senior-friendly North America travel ideas.
          </p>
        </div>

        <div className="footer-links">
          <button type="button" onClick={goHome}>
            Home
          </button>
          <a href="#directory">Directory</a>
          <button type="button" onClick={() => showCategoryListings("Senior Travel & Tours")}>
            Travel
          </button>
          <button type="button" onClick={() => showCategoryListings("Transportation Help")}>
            Transportation
          </button>
          <button type="button" onClick={() => showCategoryListings("Caregiver Support")}>
            Caregivers
          </button>
          <a href={SUBMIT_FORM_URL} target="_blank" rel="noreferrer">
            Submit a listing
          </a>
          <a href="#about-info">About</a>
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

function VisualLandingSection({
  label,
  image,
  eyebrow,
  title,
  intro,
  count,
  countLabel,
  buttonText,
  onButtonClick,
}) {
  return (
    <section className="state-page-visual-section">
      <div className="state-page-visual-card">
        <div className="state-page-image">
          {image && (
            <img
              src={image}
              alt={title}
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />
          )}
          <div className="state-page-image-overlay"></div>
          <span>{label}</span>
        </div>

        <div className="state-page-copy">
          <p className="eyebrow">{eyebrow}</p>
          <h2>{title}</h2>
          <p>{intro}</p>

          <div className="state-page-stats">
            <div>
              <strong>{count}</strong>
              <span>{countLabel}</span>
            </div>
            <div>
              <strong>9</strong>
              <span>States covered</span>
            </div>
            <div>
              <strong>SEO</strong>
              <span>Dedicated page</span>
            </div>
          </div>

          <button type="button" onClick={onButtonClick}>
            {buttonText}
          </button>
        </div>
      </div>
    </section>
  );
}

function InternalLinksSection({ showStateListings, showCategoryListings }) {
  return (
    <section className="section seo-link-section">
      <p className="eyebrow">Explore Senior Fun USA</p>
      <h2>Browse senior-friendly resources by state or category</h2>

      <div className="seo-link-group">
        <h3>Explore by State</h3>
        <div className="seo-link-cloud">
          {Object.entries(STATE_TO_SLUG).map(([stateName, slug]) => (
            <a
              key={stateName}
              href={`/states/${slug}`}
              onClick={(event) => {
                event.preventDefault();
                showStateListings(stateName);
              }}
            >
              {stateName}
            </a>
          ))}
        </div>
      </div>

      <div className="seo-link-group">
        <h3>Explore by Category</h3>
        <div className="seo-link-cloud">
          <a
            href="/categories/senior-travel"
            onClick={(event) => {
              event.preventDefault();
              showCategoryListings("Senior Travel & Tours");
            }}
          >
            Senior Travel
          </a>

          <a
            href="/categories/transportation-help"
            onClick={(event) => {
              event.preventDefault();
              showCategoryListings("Transportation Help");
            }}
          >
            Transportation Help
          </a>

          <a
            href="/categories/caregiver-support"
            onClick={(event) => {
              event.preventDefault();
              showCategoryListings("Caregiver Support");
            }}
          >
            Caregiver Support
          </a>

          <a
            href="/categories/senior-centers"
            onClick={(event) => {
              event.preventDefault();
              showCategoryListings("Senior Center");
            }}
          >
            Senior Centers
          </a>

          <a
            href="/categories/senior-activities"
            onClick={(event) => {
              event.preventDefault();
              showCategoryListings("Senior-Friendly Event");
            }}
          >
            Senior Activities
          </a>
        </div>
      </div>
    </section>
  );
}

function StateCardsSection({ showStateListings, resetFilters }) {
  return (
    <section className="section state-seo-section">
      <p className="eyebrow">Senior resources by state</p>
      <h2>Find senior-friendly resources in {STATE_LIST_TEXT}</h2>
      <p className="state-seo-intro">
        Senior Fun USA helps older adults, families, and caregivers discover trusted senior centers, transportation help,
        social activities, caregiver resources, dementia-friendly programs, senior discounts, museums, and senior travel
        opportunities.
      </p>

      <div className="state-seo-grid">
        {Object.entries(STATE_PAGE_DETAILS).map(([stateName, details]) => (
          <StateSeoCard
            key={stateName}
            title={`${stateName} senior resources${
              stateName === "Maine" || stateName === "Washington" || stateName === "Hawaii" ? " and travel" : ""
            }`}
            label={details.label}
            image={details.image}
            text={details.intro}
            onClick={() => showStateListings(stateName)}
          />
        ))}

        <article className="state-seo-card">
          <div className="state-card-image">
            <div className="state-card-overlay"></div>
            <span className="state-card-label">Senior Fun USA</span>
          </div>

          <div className="state-card-body">
            <h3>Senior travel, rides, and activities</h3>
            <p>
              Use the directory as a starting point to compare senior-friendly places, day trips, group outings, local
              ride programs, community centers, classes, social clubs, meals, events, and support services. Always
              confirm details directly with the provider before visiting or registering.
            </p>
            <a href="#directory" onClick={resetFilters}>
              Search the directory
            </a>
          </div>
        </article>
      </div>
    </section>
  );
}

function MaineTravelSection({ showFerryListing, showMaineTravelIdeas }) {
  return (
    <section className="travel-routes-section">
      <div className="section-kicker">Senior travel routes</div>
      <h2>Maine to Nova Scotia senior-friendly travel idea</h2>
      <p className="travel-routes-intro">
        Senior Fun USA includes Maine resources and travel ideas, including a scenic Bar Harbor to Yarmouth, Nova Scotia
        ferry route. This can help older adults, families, caregivers, and travel groups discover coastal activities,
        museums, senior-friendly stops, and cross-border trip ideas.
      </p>

      <div className="travel-route-card">
        <div className="travel-route-image">
          <img
            src="/images/states/maine-ferry.png"
            alt="Passenger ferry traveling along the Maine coast near a lighthouse"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
        </div>

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
  );
}

function HawaiiTravelSection({ showStateListings, showHawaiiTravelIdeas }) {
  return (
    <section className="travel-routes-section">
      <div className="section-kicker">Senior travel ideas</div>
      <h2>Hawaii senior-friendly travel ideas</h2>
      <p className="travel-routes-intro">
        Senior Fun USA includes Hawaii resources and travel ideas across Oahu, Maui, Kauai, Hawaii Island, Molokai, and
        Lanai. These listings can help older adults, families, caregivers, and travel groups find gardens, museums,
        scenic stops, transportation options, caregiver resources, and slower-paced island activities.
      </p>

      <div className="travel-route-card">
        <div>
          <span className="route-pill">Featured state</span>
          <h3>Oahu, Maui, Kauai, Hawaii Island, Molokai, and Lanai</h3>
          <p>
            Browse senior-friendly Hawaii travel ideas, cultural attractions, accessible transportation resources,
            botanical gardens, national parks, museums, and community support services.
          </p>
        </div>

        <div className="route-actions">
          <a href="#directory" onClick={() => showStateListings("Hawaii")}>
            View Hawaii listings
          </a>
          <a href="#directory" onClick={showHawaiiTravelIdeas}>
            Explore Hawaii travel ideas
          </a>
        </div>
      </div>
    </section>
  );
}

function StateSeoCard({ title, text, image, label, onClick }) {
  return (
    <article className="state-seo-card">
      <div className="state-card-image">
        {image && (
          <img
            src={image}
            alt={title}
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
        )}
        <div className="state-card-overlay"></div>
        <span className="state-card-label">{label}</span>
      </div>

      <div className="state-card-body">
        <h3>{title}</h3>
        <p>{text}</p>
        <a href="#directory" onClick={onClick}>
          View listings
        </a>
      </div>
    </article>
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