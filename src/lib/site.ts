export const site = {
  name: "ParkiWell",
  tagline: "Your care day, in rhythm",
  description:
    "ParkiWell brings daily care into one clear rhythm, with offline records, medication routines, and guided practice in one place.",
  url: "https://parkiwell.com",
  email: "jcscen@gmail.com",
  locale: "en_US",
} as const;

export const nav = [
  { href: "/#day", label: "Your day" },
  { href: "/#privacy", label: "Privacy" },
] as const;

export const legalNotice =
  "ParkiWell is an organizational and educational tool. It does not provide medical advice, diagnosis, or treatment, and it is not a medical device. Always talk to your care team about your health.";
