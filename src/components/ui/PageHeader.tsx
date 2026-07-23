import { Breadcrumb, type Crumb } from "@/components/layout/Breadcrumb";

interface Props {
  eyebrow?: string;
  title: string;
  description?: string;
  crumbs?: Crumb[];
}

export function PageHeader({ eyebrow, title, description, crumbs }: Props) {
  return (
    <header className="border-b border-ink/10 bg-ivory-50">
      <div className="container-wrap py-10 sm:py-14">
        {crumbs && <Breadcrumb items={crumbs} />}
        <div className="mt-6 max-w-2xl">
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h1 className="mt-2 font-display text-4xl leading-tight text-ink sm:text-5xl">
            {title}
          </h1>
          {description && (
            <p className="mt-4 text-base leading-relaxed text-ink-600">
              {description}
            </p>
          )}
        </div>
      </div>
    </header>
  );
}
