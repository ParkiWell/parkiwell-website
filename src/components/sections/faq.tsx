import Link from "next/link";
import { ArrowRight, ChevronDown } from "@/components/icons";
import { Container } from "@/components/ui/container";

const questions = [
  {
    question: "Can I use ParkiWell without a connection?",
    answer:
      "Yes. Records live on your device and stay available offline. An optional account queues offline changes until a connection returns.",
  },
  {
    question: "What does the movement coach do?",
    answer:
      "The movement coach, still in development, guides seated and standing exercise sessions through your phone's camera. It provides observations on movement range, pace, and smoothness, followed by a session summary. Tracking runs on your device, and the camera feed is never recorded or uploaded.",
  },
  {
    question: "Is ParkiWell a medical device?",
    answer:
      "ParkiWell is an organizational and educational tool. It does not provide medical advice, diagnosis, or treatment. Movement coach observations describe a single practice session; they do not measure symptoms or track your condition.",
  },
  {
    question: "Where do guided sessions come from?",
    answer:
      "The app links to videos published by established Parkinson's organizations and programs. Each session shows its source and review date.",
  },
  {
    question: "What does ParkiWell cost?",
    answer: "ParkiWell is free to use, with no ads or data sales.",
  },
  {
    question: "How do I delete an account?",
    answer:
      "Open Profile, choose Settings, then choose Delete account. You can also email the ParkiWell team and ask for help.",
  },
  {
    question: "When can I download ParkiWell?",
    answer:
      "ParkiWell is coming to iPhone and Android. Join the launch list to receive an email when it is available to download. The movement coach is being developed for a future release.",
  },
] as const;

export function Faq() {
  return (
    <section
      id="questions"
      data-chapter="questions"
      data-settle="1"
      className="chapter py-28 text-ink sm:py-36"
    >
      <Container>
        <div className="faq-layout">
          <div className="faq-intro">
            <h2 className="display max-w-[12ch] text-[clamp(3.5rem,6.5vw,6.7rem)]">
              Frequently asked questions.
            </h2>
            <p className="mt-7 max-w-[26rem] text-base leading-relaxed text-muted">
              Information about app features, privacy, and account management.
              Contact support for additional assistance.
            </p>
            <Link
              href="/support"
              className="text-link group mt-5 inline-flex min-h-12 items-center gap-3 text-sm font-bold text-ink"
            >
              Visit support
              <ArrowRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
            <Link
              href="/features"
              className="text-link mt-3 block w-fit py-2 text-sm font-bold"
            >
              Read the ParkiWell feature guide
            </Link>
          </div>
          <div className="faq-questions border-t border-ink/20">
            {questions.map((item, index) => (
              <details
                key={item.question}
                name="homepage-faq"
                className="group border-b border-ink/15"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 text-left sm:py-7">
                  <span className="flex items-start gap-4 sm:gap-6">
                    <span
                      aria-hidden="true"
                      className="numeral mt-1 text-sm text-ink"
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <h3 className="font-display text-[1.15rem] font-medium leading-snug tracking-[-0.025em] sm:text-[1.3rem]">
                      {item.question}
                    </h3>
                  </span>
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-ink/20 transition-colors duration-200 group-hover:bg-surface-2 group-open:bg-ink group-open:text-bg">
                    <ChevronDown className="h-5 w-5 transition-transform duration-300 group-open:rotate-180" />
                  </span>
                </summary>
                <p className="max-w-[43rem] pb-7 pl-10 pr-4 text-[1rem] font-normal leading-relaxed text-muted sm:pl-[4.6rem] sm:text-[1.08rem]">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
