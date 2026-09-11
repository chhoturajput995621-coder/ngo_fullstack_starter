const API_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";


// =========================
// HEALTH CHECK
// =========================

export async function getHealth() {
  const response = await fetch(`${API_URL}/health/`);

  if (!response.ok) {
    throw new Error("Backend is unavailable");
  }

  return response.json();
}


// =========================
// CAMPAIGNS
// =========================

export async function getCampaigns() {
  const response = await fetch(`${API_URL}/campaigns/`);

  if (!response.ok) {
    throw new Error("Campaigns could not be loaded");
  }

  return response.json();
}


// =========================
// TESTIMONIALS
// =========================

export async function getTestimonials() {
  const response = await fetch(`${API_URL}/testimonials/`);

  if (!response.ok) {
    throw new Error("Testimonials could not be loaded");
  }

  return response.json();
}


// =========================
// VOLUNTEER
// =========================

export async function createVolunteer(volunteerData) {
  const response = await fetch(`${API_URL}/volunteers/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(volunteerData),
  });

  if (!response.ok) {
    throw new Error("Volunteer submission failed");
  }

  return response.json();
}


// =========================
// CONTACT
// =========================

export async function createContact(contactData) {
  const response = await fetch(`${API_URL}/contacts/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(contactData),
  });

  if (!response.ok) {
    throw new Error("Contact message failed");
  }

  return response.json();
}


// =========================
// DONATION
// =========================

export async function createDonation(donationData) {
  const response = await fetch(`${API_URL}/donations/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(donationData),
  });

  if (!response.ok) {
    throw new Error("Donation submission failed");
  }

  return response.json();
}



export async function createRazorpayOrder(amount) {
  const response = await fetch(`${API_URL}/payments/create-order/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: amount,
    }),
  });

  if (!response.ok) {
    throw new Error("Razorpay order creation failed");
  }

  return response.json();
}


export async function verifyRazorpayPayment(paymentData) {
  const response = await fetch(`${API_URL}/payments/verify/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(paymentData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Payment verification failed");
  }

  return data;
}