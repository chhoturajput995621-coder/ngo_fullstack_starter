import { useEffect, useState } from "react";
import {
  getHealth,
  getCampaigns,
  getTestimonials,
  createVolunteer,
  createContact,
  verifyRazorpayPayment,
  createRazorpayOrder,
} from "./api";

const fallbackImages = {
  Education:
    "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=85",

  Healthcare:
    "https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=1200&q=85",

  Community:
    "https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=1200&q=85",
};

function App() {
  const [backendStatus, setBackendStatus] = useState("Checking...");
  const [campaigns, setCampaigns] = useState([]);
  const [testimonials, setTestimonials] = useState([]);

  const [volunteerForm, setVolunteerForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [donationForm, setDonationForm] = useState({
    donor_name: "",
    email: "",
    amount: "",
    campaign: "",
  });

  const [volunteerStatus, setVolunteerStatus] = useState("");
  const [contactStatus, setContactStatus] = useState("");
  const [donationStatus, setDonationStatus] = useState("");

  const [volunteerLoading, setVolunteerLoading] = useState(false);
  const [contactLoading, setContactLoading] = useState(false);
  const [donationLoading, setDonationLoading] = useState(false);

  useEffect(() => {
    getHealth()
      .then(() => setBackendStatus("API connected"))
      .catch(() => setBackendStatus("API offline"));

    getCampaigns()
      .then((data) => setCampaigns(data))
      .catch(() => setCampaigns([]));

    getTestimonials()
      .then((data) => setTestimonials(data))
      .catch(() => setTestimonials([]));
  }, []);

  const handleVolunteerChange = (e) => {
    setVolunteerForm({
      ...volunteerForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleContactChange = (e) => {
    setContactForm({
      ...contactForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleDonationChange = (e) => {
    setDonationForm({
      ...donationForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleVolunteerSubmit = async (e) => {
    e.preventDefault();
    setVolunteerLoading(true);
    setVolunteerStatus("");

    try {
      await createVolunteer(volunteerForm);

      setVolunteerStatus(
        "Thank you! Your volunteer request has been submitted."
      );

      setVolunteerForm({
        name: "",
        email: "",
        phone: "",
        message: "",
      });
    } catch {
      setVolunteerStatus("Something went wrong. Please try again.");
    } finally {
      setVolunteerLoading(false);
    }
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setContactLoading(true);
    setContactStatus("");

    try {
      await createContact(contactForm);

      setContactStatus("Your message has been sent successfully.");

      setContactForm({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch {
      setContactStatus("Unable to send message. Please try again.");
    } finally {
      setContactLoading(false);
    }
  };

  const handleDonationSubmit = async (e) => {
    e.preventDefault();

    const amount = Number(donationForm.amount);

    if (!amount || amount <= 0) {
      setDonationStatus("Please enter a valid donation amount.");
      return;
    }

    if (!window.Razorpay) {
      setDonationStatus(
        "Razorpay Checkout could not be loaded. Please refresh the page."
      );
      return;
    }

    setDonationLoading(true);
    setDonationStatus("");

    try {
      // Step 1: Create Razorpay order through Django
      const order = await createRazorpayOrder(amount);

      // Step 2: Open Razorpay Checkout
      const options = {
        key: order.key_id,
        amount: order.amount,
        currency: order.currency,
        name: "ROOTED",
        description: "Donation to ROOTED",
        order_id: order.order_id,

        prefill: {
          name: donationForm.donor_name,
          email: donationForm.email,
        },

        theme: {
          color: "#111111",
        },

        // Step 3: Verify successful payment through Django
        handler: async function (response) {
          try {
            await verifyRazorpayPayment({
              donor_name: donationForm.donor_name,
              email: donationForm.email,

              campaign:
                donationForm.campaign === ""
                  ? null
                  : Number(donationForm.campaign),

              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            });

            setDonationStatus(
              "Payment successful! Thank you for your donation."
            );

            setDonationForm({
              donor_name: "",
              email: "",
              amount: "",
              campaign: "",
            });
          } catch (error) {
            console.error(error);

            setDonationStatus(
              "Payment was successful, but verification failed."
            );
          } finally {
            setDonationLoading(false);
          }
        },

        modal: {
          ondismiss: function () {
            setDonationLoading(false);
            setDonationStatus("Payment cancelled.");
          },
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on("payment.failed", function () {
        setDonationLoading(false);
        setDonationStatus("Payment failed. Please try again.");
      });

      razorpay.open();
    } catch (error) {
      console.error(error);
      setDonationLoading(false);
      setDonationStatus(
        "Unable to start payment. Please try again."
      );
    }
  };

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
    });
  };

  return (
    <div className="app">
      {/* NAVBAR */}
      <header className="navbar">
        <div className="container nav-inner">
          <a href="#home" className="logo">
            <span className="logo-mark">R</span>
            <span>ROOTED</span>
          </a>

          <nav className="nav-links">
            <a href="#home">Home</a>
            <a href="#about">About</a>
            <a href="#campaigns">Campaigns</a>
            <a href="#volunteer">Volunteer</a>
            <a href="#contact">Contact</a>
          </nav>

          <button
            className="nav-donate"
            onClick={() => scrollToSection("donate")}
          >
            Donate
          </button>
        </div>
      </header>

      {/* HERO */}
      <main>
        <section className="hero" id="home">
          <div className="container hero-grid">
            <div className="hero-content">
              <div className="status-pill">
                <span></span>
                {backendStatus}
              </div>

              <p className="eyebrow">COMMUNITY OPERATIONS PLATFORM</p>

              <h1>
                Build good work
                <br />
                <em>with clarity.</em>
              </h1>

              <p className="hero-text">
                A community platform built to coordinate people, campaigns
                and meaningful impact — all in one place.
              </p>

              <div className="hero-actions">
                <button
                  className="btn btn-primary"
                  onClick={() => scrollToSection("campaigns")}
                >
                  View campaigns ↗
                </button>

                <button
                  className="btn btn-secondary"
                  onClick={() => scrollToSection("volunteer")}
                >
                  Join as volunteer
                </button>
              </div>

              <div className="hero-stats">
                <div>
                  <strong>01</strong>
                  <span>People first</span>
                </div>

                <div>
                  <strong>02</strong>
                  <span>Real campaigns</span>
                </div>

                <div>
                  <strong>∞</strong>
                  <span>Room to grow</span>
                </div>
              </div>
            </div>

            <div className="hero-image-wrap">
              <img
                src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1200&q=85"
                alt="Children smiling together"
                className="hero-image"
              />

              <div className="hero-image-card">
                <span>COMMUNITY IMPACT</span>
                <strong>Small actions create big change.</strong>
              </div>
            </div>
          </div>
        </section>

        {/* ABOUT */}
        <section className="section about-section" id="about">
          <div className="container">
            <div className="section-intro">
              <div>
                <p className="eyebrow">WHAT WE DO</p>
                <h2>
                  Small actions
                  <br />
                  can create <em>big impact.</em>
                </h2>
              </div>

              <p className="intro-copy">
                We connect people with meaningful causes and create a simple
                way to support communities that need it most.
              </p>
            </div>

            <div className="impact-grid">
              <article className="impact-card">
                <span className="card-number">01</span>
                <div className="impact-icon">◉</div>
                <h3>Education</h3>
                <p>
                  Supporting better learning opportunities and resources for
                  children and communities.
                </p>
              </article>

              <article className="impact-card">
                <span className="card-number">02</span>
                <div className="impact-icon">+</div>
                <h3>Healthcare</h3>
                <p>
                  Helping people access essential healthcare, awareness and
                  community support.
                </p>
              </article>

              <article className="impact-card">
                <span className="card-number">03</span>
                <div className="impact-icon">↗</div>
                <h3>Community</h3>
                <p>
                  Bringing volunteers and communities together to create
                  sustainable change.
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* CAMPAIGNS */}
        <section className="section campaigns-section" id="campaigns">
          <div className="container">
            <div className="section-heading-row">
              <div>
                <p className="eyebrow">OUR CAMPAIGNS</p>
                <h2>
                  Support a <em>cause.</em>
                </h2>
              </div>

              <p>
                Choose a campaign and help us move one step closer to a better
                future.
              </p>
            </div>

            {campaigns.length === 0 ? (
              <div className="empty-box">
                No active campaigns available right now.
              </div>
            ) : (
              <div className="campaign-grid">
                {campaigns.map((campaign) => {
                  const image =
                    campaign.image_url ||
                    fallbackImages[campaign.category] ||
                    fallbackImages.Community;

                  return (
                    <article className="campaign-card" key={campaign.id}>
                      <div className="campaign-image-wrap">
                        <img
                          src={image}
                          alt={campaign.title}
                          className="campaign-image"
                        />

                        <span className="campaign-tag">
                          {campaign.category}
                        </span>
                      </div>

                      <div className="campaign-content">
                        <h3>{campaign.title}</h3>

                        <p>{campaign.description}</p>

                        <div className="progress-top">
                          <span>Progress</span>
                          <strong>{campaign.progress}%</strong>
                        </div>

                        <div className="progress-bar">
                          <div
                            className="progress-fill"
                            style={{
                              width: `${campaign.progress}%`,
                            }}
                          ></div>
                        </div>

                        <div className="campaign-money">
                          <strong>
                            ₹
                            {Number(
                              campaign.raised_amount
                            ).toLocaleString("en-IN")}
                          </strong>

                          <span>
                            Goal ₹
                            {Number(
                              campaign.target_amount
                            ).toLocaleString("en-IN")}
                          </span>
                        </div>

                        <button
                          className="campaign-button"
                          onClick={() => {
                            setDonationForm({
                              ...donationForm,
                              campaign: String(campaign.id),
                            });

                            scrollToSection("donate");
                          }}
                        >
                          Support this campaign ↗
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* COMMUNITY STORY */}
        <section className="story-section">
          <div className="container story-grid">
            <div className="story-image-wrap">
              <img
                src="https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&w=1200&q=85"
                alt="Children learning together"
              />
            </div>

            <div className="story-content">
              <p className="eyebrow">WHY ROOTED</p>

              <h2>
                Every person has
                <br />
                something to <em>give.</em>
              </h2>

              <p>
                Sometimes it is money. Sometimes it is time, knowledge,
                skills or simply showing up. ROOTED brings these contributions
                together so communities can turn small actions into meaningful
                progress.
              </p>

              <button
                className="btn btn-dark"
                onClick={() => scrollToSection("volunteer")}
              >
                Become part of it ↗
              </button>
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="section testimonials-section">
          <div className="container">
            <p className="eyebrow">COMMUNITY VOICES</p>

            <h2>
              What our community <em>says.</em>
            </h2>

            {testimonials.length === 0 ? (
              <div className="empty-box">
                No testimonials available yet.
              </div>
            ) : (
              <div className="testimonial-grid">
                {testimonials.map((testimonial) => (
                  <article
                    className="testimonial-card"
                    key={testimonial.id}
                  >
                    <div className="quote-mark">“</div>

                    <p>{testimonial.message}</p>

                    <div className="testimonial-person">
                      <div className="avatar">
                        {testimonial.name?.charAt(0)}
                      </div>

                      <div>
                        <strong>{testimonial.name}</strong>
                        <span>
                          {testimonial.role || "Community member"}
                        </span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* VOLUNTEER */}
        <section className="form-section" id="volunteer">
          <div className="container form-grid">
            <div className="form-intro">
              <p className="eyebrow">GET INVOLVED</p>

              <h2>
                Become a
                <br />
                <em>volunteer.</em>
              </h2>

              <p>
                Share your details and our team can connect with you about
                opportunities where your time and skills can make a difference.
              </p>

              <div className="form-side-note">
                <span>01</span>
                <div>
                  <strong>Tell us about yourself</strong>
                  <p>We will save your request securely.</p>
                </div>
              </div>
            </div>

            <form className="ngo-form" onSubmit={handleVolunteerSubmit}>
              <div className="form-row">
                <label>
                  Full name
                  <input
                    type="text"
                    name="name"
                    value={volunteerForm.name}
                    onChange={handleVolunteerChange}
                    placeholder="Your name"
                    required
                  />
                </label>

                <label>
                  Email
                  <input
                    type="email"
                    name="email"
                    value={volunteerForm.email}
                    onChange={handleVolunteerChange}
                    placeholder="you@example.com"
                    required
                  />
                </label>
              </div>

              <label>
                Phone
                <input
                  type="tel"
                  name="phone"
                  value={volunteerForm.phone}
                  onChange={handleVolunteerChange}
                  placeholder="+91"
                />
              </label>

              <label>
                Message
                <textarea
                  name="message"
                  value={volunteerForm.message}
                  onChange={handleVolunteerChange}
                  placeholder="Tell us how you would like to help..."
                  rows="5"
                ></textarea>
              </label>

              <button
                className="form-submit"
                type="submit"
                disabled={volunteerLoading}
              >
                {volunteerLoading
                  ? "Submitting..."
                  : "Submit volunteer request ↗"}
              </button>

              {volunteerStatus && (
                <p className="form-status">{volunteerStatus}</p>
              )}
            </form>
          </div>
        </section>

        {/* CONTACT */}
        <section className="section contact-section" id="contact">
          <div className="container contact-grid">
            <div>
              <p className="eyebrow">CONTACT US</p>

              <h2>
                Let's
                <br />
                <em>talk.</em>
              </h2>

              <p className="contact-description">
                Have a question, partnership idea or something you want to
                discuss? Send us a message.
              </p>

              <div className="contact-details">
                <span>Community support</span>
                <span>Partnerships</span>
                <span>Volunteer opportunities</span>
              </div>
            </div>

            <form
              className="ngo-form contact-form"
              onSubmit={handleContactSubmit}
            >
              <div className="form-row">
                <label>
                  Name
                  <input
                    type="text"
                    name="name"
                    value={contactForm.name}
                    onChange={handleContactChange}
                    placeholder="Your name"
                    required
                  />
                </label>

                <label>
                  Email
                  <input
                    type="email"
                    name="email"
                    value={contactForm.email}
                    onChange={handleContactChange}
                    placeholder="you@example.com"
                    required
                  />
                </label>
              </div>

              <label>
                Subject
                <input
                  type="text"
                  name="subject"
                  value={contactForm.subject}
                  onChange={handleContactChange}
                  placeholder="How can we help?"
                  required
                />
              </label>

              <label>
                Message
                <textarea
                  name="message"
                  value={contactForm.message}
                  onChange={handleContactChange}
                  placeholder="Write your message..."
                  rows="6"
                  required
                ></textarea>
              </label>

              <button
                className="form-submit"
                type="submit"
                disabled={contactLoading}
              >
                {contactLoading ? "Sending..." : "Send message ↗"}
              </button>

              {contactStatus && (
                <p className="form-status">{contactStatus}</p>
              )}
            </form>
          </div>
        </section>

        {/* DONATION */}
        <section className="donation-section" id="donate">
          <div className="container donation-grid">
            <div>
              <p className="eyebrow">MAKE AN IMPACT</p>

              <h2>
                Support
                <br />
                our <em>work.</em>
              </h2>

              <p>
                Your contribution can help support meaningful community
                campaigns and the people behind them.
              </p>

              <div className="donation-points">
                <span>✓ Supports active campaigns</span>
                <span>✓ Helps communities directly</span>
                <span>✓ Every contribution matters</span>
              </div>
            </div>

            <form
              className="donation-form"
              onSubmit={handleDonationSubmit}
            >
              <label>
                Your name
                <input
                  type="text"
                  name="donor_name"
                  value={donationForm.donor_name}
                  onChange={handleDonationChange}
                  placeholder="Full name"
                  required
                />
              </label>

              <label>
                Email
                <input
                  type="email"
                  name="email"
                  value={donationForm.email}
                  onChange={handleDonationChange}
                  placeholder="you@example.com"
                  required
                />
              </label>

              <label>
                Amount
                <div className="amount-input">
                  <span>₹</span>
                  <input
                    type="number"
                    name="amount"
                    min="1"
                    value={donationForm.amount}
                    onChange={handleDonationChange}
                    placeholder="500"
                    required
                  />
                </div>
              </label>

              <label>
                Campaign
                <select
                  name="campaign"
                  value={donationForm.campaign}
                  onChange={handleDonationChange}
                >
                  <option value="">General donation</option>

                  {campaigns.map((campaign) => (
                    <option key={campaign.id} value={campaign.id}>
                      {campaign.title}
                    </option>
                  ))}
                </select>
              </label>

              <button
                className="donation-submit"
                type="submit"
                disabled={donationLoading}
              >
                {donationLoading
                  ? "Opening payment..."
                  : "Donate now ↗"}
              </button>

              {donationStatus && (
                <p className="form-status dark-status">
                  {donationStatus}
                </p>
              )}

              <small>
                Razorpay Test Mode is enabled. No real money will be charged.
              </small>
            </form>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="footer">
        <div className="container">
          <div className="footer-top">
            <div>
              <a href="#home" className="logo footer-logo">
                <span className="logo-mark">R</span>
                <span>ROOTED</span>
              </a>

              <p>
                Building better communities through people, purpose and
                meaningful action.
              </p>
            </div>

            <div className="footer-links">
              <a href="#home">Home</a>
              <a href="#campaigns">Campaigns</a>
              <a href="#volunteer">Volunteer</a>
              <a href="#contact">Contact</a>
            </div>
          </div>

          <div className="footer-bottom">
            <span>© 2026 ROOTED. Community operations platform.</span>

            <span>
              Django REST Framework · React · MySQL
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;