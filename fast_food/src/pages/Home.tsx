import { Link } from "react-router-dom";
import "./Home.css";

function Home() {
  return (
    <main className="home">
      {/* Hero */}
      <section className="hero">
        <div className="hero-content">
          <p className="hero-subtitle">FRESH • HOT • DELICIOUS</p>

          <h1>
            GOOD FOOD.
            <br />
            <span>GOOD MOOD.</span>
          </h1>

          <p className="hero-description">
            Delicious food made fresh, with bold flavors and ingredients you can
            trust.
          </p>

          <div className="hero-buttons">
            <Link to="/menu" className="primary-button">
              Order Now
            </Link>

            <Link to="/menu" className="secondary-button">
              View Menu
            </Link>
          </div>
        </div>

        <div className="hero-image">
          <div className="hero-circle"></div>

          <div className="hero-food">🍔</div>
        </div>
      </section>

      {/* Categories */}
      <section className="categories-section">
        <div className="section-heading">
          <p>WHAT ARE YOU CRAVING?</p>
          <h2>Explore Our Menu</h2>
        </div>

        <div className="categories">
          <Link to="/menu?category=pizza" className="category-card">
            <span className="category-icon">🍕</span>
            <h3>Pizza</h3>
            <p>Fresh &amp; cheesy</p>
          </Link>

          <Link to="/menu?category=burger" className="category-card">
            <span className="category-icon">🍔</span>
            <h3>Burger</h3>
            <p>Juicy &amp; delicious</p>
          </Link>

          <Link to="/menu?category=falafel" className="category-card">
            <span className="category-icon">🥙</span>
            <h3>Falafel</h3>
            <p>Crispy &amp; fresh</p>
          </Link>

          <Link to="/menu?category=drinks" className="category-card">
            <span className="category-icon">🥤</span>
            <h3>Drinks</h3>
            <p>Cold &amp; refreshing</p>
          </Link>
        </div>
      </section>

      {/* Popular Items */}
      <section className="popular-section">
        <div className="section-heading">
          <p>OUR CUSTOMERS' FAVORITES</p>
          <h2>Popular Items</h2>
        </div>

        <div className="popular-grid">
          <div className="food-card">
            <div className="food-image">🍕</div>

            <div className="food-info">
              <span className="food-category">Pizza</span>
              <h3>Chicken &amp; Mushroom Pizza</h3>

              <div className="food-bottom">
                <span className="food-price">350,000 T</span>

                <Link to="/menu" className="add-button">
                  +
                </Link>
              </div>
            </div>
          </div>

          <div className="food-card">
            <div className="food-image">🍔</div>

            <div className="food-info">
              <span className="food-category">Burger</span>
              <h3>Classic Burger</h3>

              <div className="food-bottom">
                <span className="food-price">250,000 T</span>

                <Link to="/menu" className="add-button">
                  +
                </Link>
              </div>
            </div>
          </div>

          <div className="food-card">
            <div className="food-image">🥙</div>

            <div className="food-info">
              <span className="food-category">Falafel</span>
              <h3>Special Falafel</h3>

              <div className="food-bottom">
                <span className="food-price">180,000 T</span>

                <Link to="/menu" className="add-button">
                  +
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="view-all">
          <Link to="/menu" className="secondary-button">
            View All Products
          </Link>
        </div>
      </section>
    </main>
  );
}

export default Home;
