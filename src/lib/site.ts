export const site = {
  name: "ParkiWell",
  tagline: "Daily Parkinson's care management",
  title: "Parkinson's Symptom Tracker & Medication Reminders",
  description:
    "Track Parkinson's symptoms, organize medication reminders, and plan speech and movement practice with ParkiWell. Works offline. Coming to iPhone and Android.",
  url: "https://parkiwell.com",
  email: "jcscen@gmail.com",
  locale: "en_US",
} as const;

export const nav = [
  { href: "/#day", label: "Your day" },
  { href: "/features", label: "Features" },
  { href: "/#privacy", label: "Privacy" },
] as const;

export const legalNotice =
  "ParkiWell is an organizational and educational tool. It does not provide medical advice, diagnosis, or treatment, and it is not a medical device. Always talk to your care team about your health.";
