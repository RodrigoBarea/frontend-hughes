import { Quote } from "lucide-react";

interface TestimonialsHeaderProps {
  variant?: "icon" | "split" | "gradient";
  title: string;
  subtitle?: string;
}

export default function TestimonialsHeader({
  variant = "icon",
  title,
  subtitle,
}: TestimonialsHeaderProps) {
  if (variant === "icon") {
    return (
      <header className="bg-[#f9f9fb] py-12 text-center relative">
        <div className="flex justify-center mb-4">
          <Quote size={32} strokeWidth={2} color="#FFBB00" />
        </div>
        <h1 className="text-3xl font-bold text-hughes-blue">{title}</h1>
        {subtitle && (
          <p className="mt-2 text-hughes-blue/80 max-w-xl mx-auto">
            {subtitle}
          </p>
        )}
      </header>
    );
  }

  // Otros estilos de variantes si algún día los usas
  return (
    <header className="bg-[#f9f9fb] py-12 text-center">
      <h1 className="text-3xl font-bold text-hughes-blue">{title}</h1>
      {subtitle && (
        <p className="mt-2 text-hughes-blue/80 max-w-xl mx-auto">{subtitle}</p>
      )}
    </header>
  );
}
