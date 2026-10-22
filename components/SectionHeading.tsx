import { formatHeading } from "@/lib/headings";
type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  light?: boolean;
};

export function SectionHeading({ eyebrow, title, description, align = "left" }: SectionHeadingProps) {
  return (
    <div className={align === "center" ? "mx-auto max-w-5xl text-center" : "max-w-5xl"}>
      <p className="premium-kicker">{eyebrow}</p>
      <h2 className="mt-4 text-balance text-4xl font-black leading-[1.02] tracking-tight text-charcoal sm:text-5xl">
        {formatHeading(title)}
      </h2>
      {description ? <p className="mt-5 text-base leading-8 text-steel">{description}</p> : null}
    </div>
  );
}
