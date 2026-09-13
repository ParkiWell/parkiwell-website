import { screens } from "@/lib/screens";

// Product details are grounded in the app README and the existing site tour.
// Keep future movement-coach features out of descriptions of available tools.
export const features = [
  {
    slug: "symptom-tracking",
    label: "Symptom tracking",
    title: "Parkinson's Symptom Tracking App",
    description:
      "Record Parkinson's symptoms and severity, add notes, and review symptom and medication activity with ParkiWell. Your records stay available offline.",
    heading: "Keep a record of your Parkinson's symptoms.",
    intro:
      "Symptoms can feel different from one day to the next. ParkiWell gives you a place to record what you notice, then look back at symptom and medication activity together. It is a personal record of your observations.",
    screen: screens.home,
    alt: "ParkiWell Home screen with symptom activity, medication activity, and a personal pattern summary.",
    sections: [
      {
        heading: "Record symptoms, severity, and notes",
        paragraphs: [
          "Log a symptom and choose a severity from Very Mild to Very Severe. Add notes about changes you observe so the record includes context in your own words. Keeping entries in one place gives you something to refer back to, instead of relying on memory alone.",
          "These entries describe how you felt when you recorded them. ParkiWell does not diagnose symptoms or assign a clinical assessment to your observations.",
        ],
      },
      {
        heading: "Review symptoms alongside medication activity",
        paragraphs: [
          "The Home screen brings symptom and medication activity together. Charts and pattern summaries are computed on your device from the records you enter, so you can review your own history over time.",
          "A pattern in your records does not establish why something happened or whether a medication should change. Questions about symptoms or treatment belong with your care team.",
        ],
      },
      {
        heading: "Keep your records available offline",
        paragraphs: [
          "Symptom records are stored on your phone and remain available without an internet connection. An account is optional. If you choose to synchronize, offline changes wait until a connection returns.",
          "Without an account, records live only on that device and cannot be recovered if the device is lost. With an account, signing in on a new phone restores the records that were synced.",
        ],
      },
    ],
  },
  {
    slug: "medication-reminders",
    label: "Medication reminders",
    title: "Parkinson's Medication Reminders & Schedules",
    description:
      "Organize Parkinson's medication schedules, review doses due today, and enable reminders in ParkiWell. Keep medication and symptom records in one app.",
    heading: "Your medication schedule, in one place.",
    intro:
      "ParkiWell helps you organize the medication routine you already follow. Keep schedules and dose details together, see what is due today, and enable reminders when you need them.",
    screen: screens.manage,
    alt: "ParkiWell Manage screen showing medications due today and medication tools.",
    sections: [
      {
        heading: "Review the doses due today",
        paragraphs: [
          "The Manage screen brings medication schedules and doses due today into one view. You can keep dose details with your schedule and review medication activity alongside symptom records on the Home screen.",
          "The app organizes information you enter. It does not prescribe medication, choose a dose, or decide when your treatment should change. Use the instructions provided by your care team for your medication routine.",
        ],
      },
      {
        heading: "Enable medication reminders",
        paragraphs: [
          "Save the medication's scheduled time and allow notifications for ParkiWell in your phone settings. Reminders can support the routine you have set up, while your medication schedule remains available to review in the app.",
          "If a reminder is not arriving, first check notification permissions and confirm that the medication has a scheduled time saved. If the problem continues, contact ParkiWell support with your phone model and operating system version so the team can help investigate.",
        ],
      },
      {
        heading: "Keep medication and symptom records together",
        paragraphs: [
          "A medication schedule is one part of a care day. ParkiWell also keeps symptom records and guided practice in the same application, so you can move between them without maintaining separate tools for each task.",
          "Records are saved on your device and remain available offline. Account creation and synchronization are optional, and ParkiWell has no advertising or third party trackers. Read the privacy policy for details about storage and account deletion.",
        ],
      },
    ],
  },
  {
    slug: "speech-movement-practice",
    label: "Speech and movement practice",
    title: "Parkinson's Speech & Movement Practice",
    description:
      "Plan Parkinson's speech and movement practice with ParkiWell: weekly goals, guided video sessions, and completed session history. Explore how it works.",
    heading: "Make room for speech and movement practice.",
    intro:
      "ParkiWell brings guided speech and movement sessions into your daily care routine. Set a weekly goal, find your next session, and review the practice you have completed in the Recovery area.",
    screen: screens.recovery,
    alt: "ParkiWell Recovery screen showing a weekly practice goal and a chair workout ready to begin.",
    sections: [
      {
        heading: "Plan a week of practice",
        paragraphs: [
          "Set a weekly goal for speech and movement sessions, view the next session in your plan, and look back at completed sessions. A session history keeps a record of your practice without asking you to remember everything you did that week.",
          "Goals and completed sessions describe your activity in the app. They are not a measure of clinical progress or a replacement for guidance from your care team.",
        ],
      },
      {
        heading: "See where guided sessions come from",
        paragraphs: [
          "Guided sessions link to videos published by established Parkinson's organizations and programs. Each session credits its source and shows a review date, giving you context about the material before you start.",
          "Offline access applies to the records stored on your device. Linked videos and other online resources need a connection. Ask your care team which speech and movement activities are appropriate for you.",
        ],
      },
      {
        heading: "Guided sessions and the future movement coach",
        paragraphs: [
          "The camera-based movement coach is a separate feature in development for a future release. It is not part of the current ParkiWell experience. The preview describes a tool intended to guide seated and standing sessions and provide observations on movement range, pace, and smoothness.",
          "Movement coach observations are intended to describe a single practice session. They do not diagnose a condition, measure symptoms, or track Parkinson's progression. The guided video sessions described above are distinct from this future camera-based feature.",
        ],
      },
    ],
  },
] as const;
